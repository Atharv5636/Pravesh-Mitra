import { Router } from "express";
import multer from "multer";
import {
  deleteDocument,
  getDocumentText,
  getDocuments,
  uploadDocument
} from "../controllers/documentController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = Router();

const handleDocumentUpload = (request, response, next) => {
  upload.single("pdf")(request, response, (error) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return response.status(400).json({
        success: false,
        message: "File size must be 20MB or less."
      });
    }

    if (error) {
      return response.status(400).json({
        success: false,
        message: error.message || "Failed to upload document."
      });
    }

    return next();
  });
};

router.get("/", getDocuments);
router.get("/:id/text", getDocumentText);
router.post("/upload", handleDocumentUpload, uploadDocument);
router.delete("/:id", deleteDocument);

export default router;
