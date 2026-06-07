import { Router } from "express";
import { getChromaStats } from "../controllers/chromaController.js";

const router = Router();

router.get("/stats", getChromaStats);

export default router;
