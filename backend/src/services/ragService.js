import { generateEmbedding } from "./embeddingService.js";
import { searchChromaEmbeddings } from "./chromaService.js";
import { GeminiServiceError } from "./geminiService.js";
import { generateGroqAnswer, GROQ_MODEL } from "./groqService.js";

const FALLBACK_MESSAGE = "I could not find this information in the uploaded documents.";

const getSafeCitationTitle = (metadata) => {
  const title = metadata?.documentTitle?.trim?.() || "";

  return title || "Unknown document";
};

const getSafeCitationPageNumber = (metadata) => {
  const pageNumber = metadata?.pageNumber;

  return Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : "Unknown Page";
};

const deduplicateCitations = (results) => {
  const seen = new Set();
  const citations = [];

  for (const result of results) {
    const documentTitle = getSafeCitationTitle(result.metadata);
    const pageNumber = getSafeCitationPageNumber(result.metadata);
    const category = result.metadata?.category?.trim?.() || "";
    const key = `${documentTitle}:${pageNumber}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    citations.push({
      documentTitle,
      category,
      pageNumber
    });
  }

  return citations;
};

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
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined");
  }

  const trimmedQuestion = question?.trim();

  if (!trimmedQuestion) {
    throw new GeminiServiceError("INTERNAL_ERROR", "Question is required.", 400);
  }

  const requestStartedAt = Date.now();
  const { embedding: queryEmbedding, retryCount: queryEmbeddingRetries } =
    await generateEmbedding(trimmedQuestion);
  const retrievedResults = await searchChromaEmbeddings(queryEmbedding, 3);

  console.log("Question:");
  console.log(trimmedQuestion);
  console.log("Retrieved Chunks:");
  console.log(retrievedResults.length);
  console.log("Source Documents:");
  console.log(
    [...new Set(retrievedResults.map((result) => result.metadata?.documentTitle).filter(Boolean))].join(", ")
  );

  if (retrievedResults.length === 0) {
    return {
      answer: FALLBACK_MESSAGE,
      citations: [],
      retryCount: queryEmbeddingRetries,
      responseTimeMs: Date.now() - requestStartedAt
    };
  }

  const context = buildContext(retrievedResults);
  const prompt = buildPrompt(trimmedQuestion, context);
  const generationStartedAt = Date.now();
  const answer = (await generateGroqAnswer(prompt)) || FALLBACK_MESSAGE;
  const generationTimeMs = Date.now() - generationStartedAt;
  const responseTimeMs = Date.now() - requestStartedAt;

  console.log("Model Used:");
  console.log(GROQ_MODEL);
  console.log("Generated Citations:");
  console.log(deduplicateCitations(retrievedResults));
  console.log("Response Time:");
  console.log(`${generationTimeMs}ms`);
  console.log(`Retry Count: ${queryEmbeddingRetries}`);
  console.log(`Response Time: ${responseTimeMs}ms`);

  return {
    answer,
    citations: deduplicateCitations(retrievedResults),
    retryCount: queryEmbeddingRetries,
    responseTimeMs
  };
};
