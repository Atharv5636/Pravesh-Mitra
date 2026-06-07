import { Router } from "express";
import { ragChat } from "../controllers/ragController.js";

const router = Router();

router.post("/chat", ragChat);

export default router;
