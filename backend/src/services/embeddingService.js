import { GoogleGenAI } from "@google/genai";

const EMBEDDING_MODEL = "gemini-embedding-001";
const MAX_RETRIES = 2;

const wait = (durationMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

export const generateEmbedding = async (text, retryCount = MAX_RETRIES) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Text is required for embedding generation");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text.trim()
    });

    const vector = response?.embeddings?.[0]?.values || response?.embedding?.values;

    if (!Array.isArray(vector) || vector.length === 0) {
      throw new Error("Embedding vector was not returned");
    }

    return vector;
  } catch (error) {
    if (retryCount > 0) {
      await wait(500);
      return generateEmbedding(text, retryCount - 1);
    }

    throw error;
  }
};
