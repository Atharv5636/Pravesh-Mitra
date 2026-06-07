import { generateResponse } from "../services/geminiService.js";

export const postChatMessage = async (request, response) => {
  try {
    const { message } = request.body ?? {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return response.status(400).json({
        success: false,
        error: "Message is required"
      });
    }

    const answer = await generateResponse(message.trim());

    return response.status(200).json({
      success: true,
      answer
    });
  } catch (error) {
    console.error("Gemini chat error:", error);

    return response.status(500).json({
      success: false,
      error: "Failed to generate response"
    });
  }
};
