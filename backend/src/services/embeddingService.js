import { GoogleGenAI } from "@google/genai";
import { executeGeminiRequest } from "./geminiService.js";

const EMBEDDING_MODEL = "gemini-embedding-001";
export const generateEmbedding = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Text is required for embedding generation");
  }

  const ai = new GoogleGenAI({ apiKey });
  const { result: response, retryCount } = await executeGeminiRequest(() =>
    ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text.trim()
    })
  );

  const vector = response?.embeddings?.[0]?.values || response?.embedding?.values;

  if (!Array.isArray(vector) || vector.length === 0) {
    throw new Error("Embedding vector was not returned");
  }

  return {
    embedding: vector,
    retryCount
  };
};
