import fs from "fs/promises";
import path from "path";
import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";
import { splitPagesIntoChunks } from "./chunkingService.js";
import {
  deleteChromaEmbeddings,
  syncChunkEmbeddingToChroma
} from "./chromaService.js";
import { generateEmbedding } from "./embeddingService.js";
import { extractPdfText } from "./pdfParserService.js";

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

export const createDocument = async ({ title, category, file }) => {
  const filePath = path.join("uploads", file.filename).replace(/\\/g, "/");

  const document = await Document.create({
    title,
    category,
    fileName: file.originalname,
    filePath,
    fileSize: file.size,
    extractedText: "",
    pageContents: [],
    totalPages: 0,
    totalChunks: 0,
    embeddingsStatus: "pending",
    extractionStatus: "pending",
    uploadDate: new Date()
  });

  return document;
};

export const getAllDocuments = async () => {
  return Document.find()
    .select("-extractedText")
    .sort({ uploadDate: -1 });
};

const createPageAwareChunksFromDocument = (document) => {
  const pages = Array.isArray(document.pageContents)
    ? document.pageContents.map((page) => ({
        pageNumber: page?.pageNumber || 0,
        text: page?.content || ""
      }))
    : [];

  return splitPagesIntoChunks(pages);
};

const generateEmbeddingsForDocumentChunks = async (document) => {
  const chunks = await DocumentChunk.find({ documentId: document._id }).sort({ chunkIndex: 1 });
  let completedCount = 0;
  let syncedCount = 0;

  for (const chunk of chunks) {
    try {
      const { embedding } = await generateEmbedding(chunk.chunkText);
      chunk.embedding = embedding;
      chunk.embeddingStatus = "completed";
      chunk.embeddedAt = new Date();

      await syncChunkEmbeddingToChroma({
        chunkId: chunk._id.toString(),
        chunkText: chunk.chunkText,
        embedding,
        metadata: {
          documentId: document._id.toString(),
          chunkIndex: chunk.chunkIndex,
          pageNumber: chunk.pageNumber,
          documentTitle: getPreferredDocumentTitle(document),
          category: document.category
        }
      });

      chunk.chromaStatus = "synced";
      await chunk.save();
      completedCount += 1;
      syncedCount += 1;
    } catch (error) {
      chunk.embedding = [];
      chunk.embeddingStatus = "failed";
      chunk.chromaStatus = "failed";
      chunk.embeddedAt = null;
      await chunk.save();
      console.error(`Embedding generation failed for chunk ${chunk._id}:`, error);
    }
  }

  document.embeddingsStatus =
    chunks.length > 0 && completedCount === chunks.length ? "completed" : "failed";
  await document.save();

  console.log(`Document: ${document.fileName}`);
  console.log(`Chunks: ${chunks.length}`);
  console.log(`Embeddings Generated: ${completedCount}`);
  console.log(`Chroma Synced: ${syncedCount}`);
};

const replaceDocumentChunks = async (document, chunks) => {
  const existingChunkIds = (
    await DocumentChunk.find({ documentId: document._id }).select("_id")
  ).map((chunk) => chunk._id.toString());

  if (existingChunkIds.length > 0) {
    await deleteChromaEmbeddings(existingChunkIds);
  }

  await DocumentChunk.deleteMany({ documentId: document._id });

  if (chunks.length > 0) {
    await DocumentChunk.insertMany(
      chunks.map((chunk) => ({
        documentId: document._id,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber,
        chunkText: chunk.chunkText,
        chunkLength: chunk.chunkLength,
        embedding: [],
        embeddingStatus: "pending",
        chromaStatus: "pending",
        embeddedAt: null
      }))
    );
  }
};

export const extractAndSaveDocumentText = async (document) => {
  const absoluteFilePath = path.resolve(process.cwd(), document.filePath);

  try {
    const extractionResult = await extractPdfText(absoluteFilePath);
    const chunks = splitPagesIntoChunks(extractionResult.pages);

    await replaceDocumentChunks(document, chunks);

    document.extractedText = extractionResult.text;
    document.pageContents = extractionResult.pages.map((page) => ({
      pageNumber: page.pageNumber,
      content: page.text
    }));
    document.totalPages = extractionResult.totalPages;
    document.totalChunks = chunks.length;
    document.embeddingsStatus = "pending";
    document.extractionStatus = "completed";
    await document.save();

    console.log("Document Parsed");
    console.log(`Pages: ${document.totalPages}`);
    console.log(`Chunks Created: ${document.totalChunks}`);

    await generateEmbeddingsForDocumentChunks(document);
  } catch (error) {
    document.extractionStatus = "failed";
    document.totalChunks = 0;
    document.embeddingsStatus = "failed";
    await DocumentChunk.deleteMany({ documentId: document._id });
    await document.save();
    throw error;
  }

  return document;
};

export const reprocessDocumentById = async (documentId) => {
  const document = await Document.findById(documentId);

  if (!document) {
    return null;
  }

  if (!Array.isArray(document.pageContents) || document.pageContents.length === 0) {
    console.log("Page contents missing. Re-extracting PDF for page-aware reprocessing.");
    return extractAndSaveDocumentText(document);
  }

  const chunks = createPageAwareChunksFromDocument(document);

  await replaceDocumentChunks(document, chunks);

  document.totalPages = document.pageContents.length;
  document.totalChunks = chunks.length;
  document.embeddingsStatus = "pending";
  document.extractionStatus = "completed";
  await document.save();

  console.log(`Pages: ${document.totalPages}`);
  console.log(`Chunks Created: ${document.totalChunks}`);

  await generateEmbeddingsForDocumentChunks(document);

  return document;
};

export const getDocumentTextById = async (documentId) => {
  return Document.findById(documentId).select("title totalPages extractedText");
};

export const getDocumentPageContentById = async (documentId, pageNumber) => {
  const document = await Document.findById(documentId).select("title pageContents");

  if (!document) {
    return null;
  }

  const pageContent = Array.isArray(document.pageContents)
    ? document.pageContents.find((page) => page.pageNumber === pageNumber)
    : null;

  return {
    documentTitle: document.title,
    pageNumber,
    content: pageContent?.content || ""
  };
};

export const getDocumentChunksById = async (documentId) => {
  const document = await Document.findById(documentId).select("title totalChunks");

  if (!document) {
    return null;
  }

  const chunks = await DocumentChunk.find({ documentId })
    .select(
      "_id chunkIndex pageNumber chunkText chunkLength embeddingStatus chromaStatus embeddedAt createdAt"
    )
    .sort({ chunkIndex: 1 });

  return {
    document,
    chunks
  };
};

export const getChunkEmbeddingMetadataById = async (chunkId) => {
  return DocumentChunk.findById(chunkId).select("embedding embeddingStatus");
};

export const getDocumentsWithChunksForChromaRebuild = async () => {
  const documents = await Document.find().select("title fileName category").lean();
  const documentIds = documents.map((document) => document._id);
  const chunks = await DocumentChunk.find({
    documentId: { $in: documentIds },
    embeddingStatus: "completed"
  })
    .select("_id documentId chunkIndex pageNumber chunkText embedding")
    .sort({ documentId: 1, chunkIndex: 1 })
    .lean();

  return {
    documents,
    chunks
  };
};

export const deleteDocumentById = async (documentId) => {
  const document = await Document.findById(documentId);

  if (!document) {
    return null;
  }

  const absoluteFilePath = path.resolve(process.cwd(), document.filePath);
  const chunkIds = (
    await DocumentChunk.find({ documentId }).select("_id")
  ).map((chunk) => chunk._id.toString());

  await deleteChromaEmbeddings(chunkIds);
  await DocumentChunk.deleteMany({ documentId });
  await fs.rm(absoluteFilePath, { force: true });
  await document.deleteOne();

  return document;
};
