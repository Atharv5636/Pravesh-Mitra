import Groq from "groq-sdk";
import { GeminiServiceError } from "./geminiService.js";

export const GROQ_MODEL = "llama-3.3-70b-versatile";

const getStatusFromError = (error) =>
  error?.status || error?.statusCode || error?.cause?.status || error?.response?.status || 500;

const normalizeGroqError = (error) => {
  if (error instanceof GeminiServiceError) {
    return error;
  }

  const status = getStatusFromError(error);

  if (status === 429) {
    return new GeminiServiceError(
      "RATE_LIMIT",
      "Too many requests. Please try again shortly.",
      429
    );
  }

  if (status === 503) {
    return new GeminiServiceError(
      "SERVICE_BUSY",
      "AI service is currently busy. Please try again in a few seconds.",
      503
    );
  }

  if (status === 504) {
    return new GeminiServiceError(
      "TIMEOUT",
      "The AI service took too long to respond.",
      504
    );
  }

  return new GeminiServiceError(
    "INTERNAL_ERROR",
    "Something went wrong. Please try again later.",
    500
  );
};

export const generateGroqAnswer = async (prompt) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined");
  }

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const answer = completion?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      throw new GeminiServiceError(
        "INTERNAL_ERROR",
        "Something went wrong. Please try again later.",
        500
      );
    }

    return answer;
  } catch (error) {
    throw normalizeGroqError(error);
  }
};
