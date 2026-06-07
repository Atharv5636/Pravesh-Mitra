import { Router } from "express";
import { reprocessDocument } from "../controllers/documentController.js";
import { rebuildChroma } from "../controllers/chromaController.js";

const router = Router();

router.post("/reprocess-document/:id", reprocessDocument);
router.post("/rebuild-chroma", rebuildChroma);

export default router;
