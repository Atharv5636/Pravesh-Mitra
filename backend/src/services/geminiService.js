import { GoogleGenAI } from "@google/genai";

const MAX_ATTEMPTS = 4;
const REQUEST_TIMEOUT_MS = 30000;
const RETRY_DELAYS_MS = [0, 2000, 4000, 8000];

export class GeminiServiceError extends Error {
  constructor(errorCode, message, status, retryCount = 0) {
    super(message);
    this.name = "GeminiServiceError";
    this.errorCode = errorCode;
    this.status = status;
    this.retryCount = retryCount;
  }
}

const wait = (durationMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

const withTimeout = async (promise, timeoutMs) => {
  let timeoutId;

  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new GeminiServiceError("TIMEOUT", "The AI service took too long to respond.", 504));
        }, timeoutMs);
      })
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
};

const getStatusFromError = (error) =>
  error?.status || error?.statusCode || error?.cause?.status || error?.response?.status || 500;

const isTransientNetworkError = (error) => {
  const message = error?.message?.toLowerCase?.() || "";

  return (
    message.includes("network") ||
    message.includes("fetch failed") ||
    message.includes("socket") ||
    message.includes("econnreset") ||
    message.includes("timed out") ||
    message.includes("timeout")
  );
};

const normalizeGeminiError = (error, retryCount) => {
  if (error instanceof GeminiServiceError) {
    error.retryCount = retryCount;
    return error;
  }

  const status = getStatusFromError(error);

  if (status === 429) {
    return new GeminiServiceError(
      "RATE_LIMIT",
      "Too many requests. Please try again shortly.",
      429,
      retryCount
    );
  }

  if (status === 503) {
    return new GeminiServiceError(
      "SERVICE_BUSY",
      "AI service is currently busy. Please try again in a few seconds.",
      503,
      retryCount
    );
  }

  if (status === 504) {
    return new GeminiServiceError(
      "TIMEOUT",
      "The AI service took too long to respond.",
      504,
      retryCount
    );
  }

  return new GeminiServiceError(
    "INTERNAL_ERROR",
    "Something went wrong. Please try again later.",
    500,
    retryCount
  );
};

const shouldRetry = (error) => {
  const status = getStatusFromError(error);

  return status === 503 || status === 504 || isTransientNetworkError(error);
};

export const executeGeminiRequest = async (operation) => {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      if (attempt > 1) {
        await wait(RETRY_DELAYS_MS[attempt - 1] || RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1]);
      }

      const result = await withTimeout(operation(), REQUEST_TIMEOUT_MS);

      return {
        result,
        retryCount: attempt - 1
      };
    } catch (error) {
      lastError = error;

      if (attempt === MAX_ATTEMPTS || !shouldRetry(error)) {
        throw normalizeGeminiError(error, attempt - 1);
      }
    }
  }

  throw normalizeGeminiError(lastError, MAX_ATTEMPTS - 1);
};

export const generateResponse = async (message) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  const ai = new GoogleGenAI({ apiKey });
  const { result: response } = await executeGeminiRequest(() =>
    ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message
    })
  );

  return response.text?.trim() || "No response generated.";
};
