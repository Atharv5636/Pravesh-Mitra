import { ChromaClient } from "chromadb";
import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";

const COLLECTION_NAME = "admission_documents";

let collectionPromise;

const getClient = () => {
  const path = process.env.CHROMA_URL || "http://localhost:8000";
  return new ChromaClient({ path });
};

const getPreferredDocumentTitle = (document) => {
  const trimmedFileName = document?.fileName?.trim?.() || "";
  const trimmedTitle = document?.title?.trim?.() || "";

  if (trimmedFileName) {
    return trimmedFileName;
  }

  if (trimmedTitle.length > 2) {
    return trimmedTitle;
  }

  return "Unknown document";
};

const getCollection = async () => {
  if (!collectionPromise) {
    const client = getClient();
    collectionPromise = client.getOrCreateCollection({
      name: COLLECTION_NAME
    });
  }

  return collectionPromise;
};

const normalizeMetadata = (metadata) => ({
  documentId: metadata?.documentId || "",
  chunkIndex: metadata?.chunkIndex || 0,
  pageNumber: metadata?.pageNumber || 0,
  documentTitle: (metadata?.documentTitle || metadata?.title || "").trim() || "Unknown document",
  category: metadata?.category || ""
});

const hydrateMissingMetadata = async (chunkId, metadata) => {
  const normalizedMetadata = normalizeMetadata(metadata);

  if (
    normalizedMetadata.documentId &&
    normalizedMetadata.chunkIndex > 0 &&
    normalizedMetadata.pageNumber > 0 &&
    normalizedMetadata.documentTitle !== "Unknown document"
  ) {
    return normalizedMetadata;
  }

  const chunk = await DocumentChunk.findById(chunkId).select("documentId chunkIndex pageNumber").lean();

  if (!chunk) {
    return normalizedMetadata;
  }

  const document = await Document.findById(chunk.documentId).select("title fileName category").lean();

  return {
    documentId: chunk.documentId?.toString?.() || normalizedMetadata.documentId,
    chunkIndex: chunk.chunkIndex || normalizedMetadata.chunkIndex,
    pageNumber: chunk.pageNumber || normalizedMetadata.pageNumber,
    documentTitle: getPreferredDocumentTitle(document),
    category: document?.category || normalizedMetadata.category
  };
};

export const syncChunkEmbeddingToChroma = async ({
  chunkId,
  chunkText,
  embedding,
  metadata
}) => {
  const collection = await getCollection();

  await collection.add({
    ids: [chunkId],
    embeddings: [embedding],
    documents: [chunkText],
    metadatas: [metadata]
  });
};

export const searchChromaEmbeddings = async (queryEmbedding, limit = 5) => {
  const collection = await getCollection();
  const result = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: limit
  });

  const documents = result?.documents?.[0] || [];
  const metadatas = result?.metadatas?.[0] || [];
  const distances = result?.distances?.[0] || [];
  const ids = result?.ids?.[0] || [];
  const enrichedMetadata = await Promise.all(
    ids.map((chunkId, index) => hydrateMissingMetadata(chunkId, metadatas[index]))
  );

  return documents.map((document, index) => ({
    chunkId: ids[index],
    chunkText: document,
    metadata: enrichedMetadata[index],
    score:
      typeof distances[index] === "number" ? Number((1 / (1 + distances[index])).toFixed(4)) : 0
  }));
};

export const deleteChromaEmbeddings = async (chunkIds) => {
  if (!Array.isArray(chunkIds) || chunkIds.length === 0) {
    return;
  }

  const collection = await getCollection();
  await collection.delete({
    ids: chunkIds
  });
};

export const getChromaCollectionStats = async () => {
  const collection = await getCollection();
  const totalEmbeddings = await collection.count();

  return {
    collection: COLLECTION_NAME,
    totalEmbeddings
  };
};

export const rebuildChromaCollection = async ({ documents, chunks }) => {
  const client = getClient();

  try {
    await client.deleteCollection({
      name: COLLECTION_NAME
    });
  } catch (error) {
    if (!`${error?.message || ""}`.toLowerCase().includes("not found")) {
      throw error;
    }
  }

  collectionPromise = null;
  const collection = await getCollection();
  const documentMap = new Map(documents.map((document) => [document._id.toString(), document]));

  let chunksProcessed = 0;

  for (const chunk of chunks) {
    if (!Array.isArray(chunk.embedding) || chunk.embedding.length === 0) {
      continue;
    }

    const document = documentMap.get(chunk.documentId?.toString?.());

    await collection.add({
      ids: [chunk._id.toString()],
      embeddings: [chunk.embedding],
      documents: [chunk.chunkText],
      metadatas: [
        {
          documentId: chunk.documentId?.toString?.() || "",
          chunkIndex: chunk.chunkIndex || 0,
          pageNumber: chunk.pageNumber || 0,
          documentTitle: getPreferredDocumentTitle(document),
          category: document?.category || ""
        }
      ]
    });

    chunksProcessed += 1;
  }

  return {
    success: true,
    documentsProcessed: documents.length,
    chunksProcessed
  };
};
