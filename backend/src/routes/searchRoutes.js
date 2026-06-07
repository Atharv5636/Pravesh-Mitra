import { Router } from "express";
import { searchDocuments } from "../controllers/searchController.js";

const router = Router();

router.post("/", searchDocuments);

export default router;
