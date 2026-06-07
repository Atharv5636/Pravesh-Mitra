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

    return response.status(200).json(result);
  } catch (error) {
    console.error("RAG chat error:", error);
    return response.status(500).json({
      success: false,
      message: "Failed to generate grounded answer."
    });
  }
};
