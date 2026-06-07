import fs from "fs/promises";
import path from "path";
import multer from "multer";
import {
  createDocument,
  deleteDocumentById,
  getAllDocuments
} from "../services/documentService.js";

const categories = new Set([
  "Eligibility",
  "Cutoffs",
  "Fee Structure",
  "CAP Rules",
  "Institutes",
  "Other"
]);

const handleUploadError = (error, response) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return response.status(400).json({
      success: false,
      message: "File size must be 20MB or less."
    });
  }

  return response.status(400).json({
    success: false,
    message: error?.message || "Failed to upload document."
  });
};

const removeUploadedFile = async (file) => {
  if (!file?.path) {
    return;
  }

  await fs.rm(path.resolve(file.path), { force: true });
};

export const uploadDocument = async (request, response) => {
  try {
    const file = request.file;
    const title = request.body?.title?.trim();
    const category = request.body?.category?.trim();

    if (!file) {
      return response.status(400).json({
        success: false,
        message: "PDF file is required."
      });
    }

    if (!title) {
      await removeUploadedFile(file);
      return response.status(400).json({
        success: false,
        message: "Title is required."
      });
    }

    if (!category || !categories.has(category)) {
      await removeUploadedFile(file);
      return response.status(400).json({
        success: false,
        message: "Valid category is required."
      });
    }

    const document = await createDocument({ title, category, file });

    return response.status(201).json({
      success: true,
      document
    });
  } catch (error) {
    console.error("Document upload error:", error);
    await removeUploadedFile(request.file);
    return handleUploadError(error, response);
  }
};

export const getDocuments = async (request, response) => {
  try {
    const documents = await getAllDocuments();

    return response.status(200).json({
      success: true,
      documents
    });
  } catch (error) {
    console.error("Get documents error:", error);
    return response.status(500).json({
      success: false,
      message: "Failed to fetch documents."
    });
  }
};

export const deleteDocument = async (request, response) => {
  try {
    const document = await deleteDocumentById(request.params.id);

    if (!document) {
      return response.status(404).json({
        success: false,
        message: "Document not found."
      });
    }

    return response.status(200).json({
      success: true,
      message: "Document deleted successfully."
    });
  } catch (error) {
    console.error("Delete document error:", error);
    return response.status(500).json({
      success: false,
      message: "Failed to delete document."
    });
  }
};
