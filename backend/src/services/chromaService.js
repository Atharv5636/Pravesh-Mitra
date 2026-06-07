import { ChromaClient } from "chromadb";

const COLLECTION_NAME = "admission_documents";

let collectionPromise;

const getClient = () => {
  const path = process.env.CHROMA_URL || "http://localhost:8000";
  return new ChromaClient({ path });
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

  return documents.map((document, index) => ({
    chunkId: ids[index],
    chunkText: document,
    metadata: metadatas[index],
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
