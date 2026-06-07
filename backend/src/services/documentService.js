import fs from "fs/promises";
import path from "path";
import Document from "../models/Document.js";
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

    document.extractedText = extractionResult.text;
    document.totalPages = extractionResult.totalPages;
    document.extractionStatus = "completed";
    await document.save();
  } catch (error) {
    document.extractionStatus = "failed";
    await document.save();
    throw error;
  }

  return document;
};

export const getDocumentTextById = async (documentId) => {
  return Document.findById(documentId).select("title totalPages extractedText");
};

export const deleteDocumentById = async (documentId) => {
  const document = await Document.findById(documentId);

  if (!document) {
    return null;
  }

  const absoluteFilePath = path.resolve(process.cwd(), document.filePath);

  await fs.rm(absoluteFilePath, { force: true });
  await document.deleteOne();

  return document;
};
