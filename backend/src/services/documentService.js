import fs from "fs/promises";
import path from "path";
import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";
import { splitTextIntoChunks } from "./chunkingService.js";
import { extractPdfText } from "./pdfParserService.js";

export const createDocument = async ({ title, category, file }) => {
  const filePath = path.join("uploads", file.filename).replace(/\\/g, "/");

  const document = await Document.create({
    title,
    category,
    fileName: file.originalname,
    filePath,
    fileSize: file.size,
    extractedText: "",
    totalPages: 0,
    totalChunks: 0,
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

export const extractAndSaveDocumentText = async (document) => {
  const absoluteFilePath = path.resolve(process.cwd(), document.filePath);

  try {
    const extractionResult = await extractPdfText(absoluteFilePath);
    const chunks = splitTextIntoChunks(extractionResult.text);

    await DocumentChunk.deleteMany({ documentId: document._id });

    if (chunks.length > 0) {
      await DocumentChunk.insertMany(
        chunks.map((chunk) => ({
          documentId: document._id,
          chunkIndex: chunk.chunkIndex,
          chunkText: chunk.chunkText,
          chunkLength: chunk.chunkLength
        }))
      );
    }

    document.extractedText = extractionResult.text;
    document.totalPages = extractionResult.totalPages;
    document.totalChunks = chunks.length;
    document.extractionStatus = "completed";
    await document.save();

    console.log("Document Parsed");
    console.log(`Pages: ${document.totalPages}`);
    console.log(`Chunks Created: ${document.totalChunks}`);
  } catch (error) {
    document.extractionStatus = "failed";
    document.totalChunks = 0;
    await DocumentChunk.deleteMany({ documentId: document._id });
    await document.save();
    throw error;
  }

  return document;
};

export const getDocumentTextById = async (documentId) => {
  return Document.findById(documentId).select("title totalPages extractedText");
};

export const getDocumentChunksById = async (documentId) => {
  const document = await Document.findById(documentId).select("title totalChunks");

  if (!document) {
    return null;
  }

  const chunks = await DocumentChunk.find({ documentId })
    .select("-_id chunkIndex chunkText chunkLength createdAt")
    .sort({ chunkIndex: 1 });

  return {
    document,
    chunks
  };
};

export const deleteDocumentById = async (documentId) => {
  const document = await Document.findById(documentId);

  if (!document) {
    return null;
  }

  const absoluteFilePath = path.resolve(process.cwd(), document.filePath);

  await DocumentChunk.deleteMany({ documentId });
  await fs.rm(absoluteFilePath, { force: true });
  await document.deleteOne();

  return document;
};
