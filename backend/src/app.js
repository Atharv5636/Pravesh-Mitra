import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import chatRoutes from "./routes/chatRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.use("/api", healthRoutes);
app.use("/api", chatRoutes);
app.use("/api/documents", documentRoutes);

export default app;
