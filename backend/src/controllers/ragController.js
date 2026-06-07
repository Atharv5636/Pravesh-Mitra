import { GeminiServiceError } from "../services/geminiService.js";
import { answerQuestionWithRag } from "../services/ragService.js";

export const ragChat = async (request, response) => {
  try {
    const question = request.body?.question?.trim();

    if (!question) {
      return response.status(400).json({
        success: false,
        message: "Question is required."
      });
    }

    const result = await answerQuestionWithRag(question);

    return response.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("RAG chat error:", error);

    if (error instanceof GeminiServiceError) {
      return response.status(error.status).json({
        success: false,
        errorCode: error.errorCode,
        message: error.message
      });
    }

    return response.status(500).json({
      success: false,
      errorCode: "INTERNAL_ERROR",
      message: "Something went wrong. Please try again later."
    });
  }
};
