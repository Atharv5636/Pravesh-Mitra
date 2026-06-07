import cors from "cors";
import express from "express";
import healthRoutes from "./routes/healthRoutes.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json());

app.use("/api", healthRoutes);

export default app;
