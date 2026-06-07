import { GoogleGenAI } from "@google/genai";
import { generateEmbedding } from "./embeddingService.js";
import { searchChromaEmbeddings } from "./chromaService.js";

const CHAT_MODEL = "gemini-2.5-flash";
const FALLBACK_MESSAGE = "I could not find this information in the uploaded documents.";

const buildContext = (results) =>
  results
    .map((result, index) => `[Chunk ${index + 1}]\n${result.chunkText}`)
    .join("\n\n");

const buildPrompt = (question, context) => `You are Pravesh Mitra.

You are an admission guidance assistant.

Answer ONLY using the provided context.

If the answer is not found in the context:
"${FALLBACK_MESSAGE}"

Do not invent information.

Do not use external knowledge.

Context:

${context}

Question:

${question}`;

export const answerQuestionWithRag = async (question) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  const trimmedQuestion = question?.trim();

  if (!trimmedQuestion) {
    throw new Error("Question is required");
  }

  const queryEmbedding = await generateEmbedding(trimmedQuestion);
  const retrievedResults = await searchChromaEmbeddings(queryEmbedding, 5);

  console.log("Question:");
  console.log(trimmedQuestion);
  console.log("Retrieved Chunks:");
  console.log(retrievedResults.length);
  console.log("Source Documents:");
  console.log(
    [...new Set(retrievedResults.map((result) => result.metadata?.title).filter(Boolean))].join(", ")
  );

  if (retrievedResults.length === 0) {
    return {
      answer: FALLBACK_MESSAGE,
      sources: []
    };
  }

  const context = buildContext(retrievedResults);
  const prompt = buildPrompt(trimmedQuestion, context);
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: prompt
  });

  const answer = response.text?.trim() || FALLBACK_MESSAGE;

  return {
    answer,
    sources: retrievedResults.map((result) => ({
      documentId: result.metadata?.documentId || "",
      chunkIndex: result.metadata?.chunkIndex || 0
    }))
  };
};
