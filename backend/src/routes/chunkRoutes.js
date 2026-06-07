import { Router } from "express";
import { getChunkEmbedding } from "../controllers/chunkController.js";

const router = Router();

router.get("/:id/embedding", getChunkEmbedding);

export default router;
