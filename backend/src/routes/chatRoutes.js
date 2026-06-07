import { Router } from "express";
import { postChatMessage } from "../controllers/chatController.js";

const router = Router();

router.post("/chat", postChatMessage);

export default router;
