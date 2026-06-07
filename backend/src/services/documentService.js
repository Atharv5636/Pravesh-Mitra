import fs from "fs/promises";
import path from "path";
import Document from "../models/Document.js";

export const createDocument = async ({ title, category, file }) => {
  const filePath = path.join("uploads", file.filename).replace(/\\/g, "/");

  const document = await Document.create({
    title,
    category,
    fileName: file.originalname,
    filePath,
    fileSize: file.size,
    uploadDate: new Date()
  });

  return document;
};

export const getAllDocuments = async () => {
  return Document.find().sort({ uploadDate: -1 });
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
