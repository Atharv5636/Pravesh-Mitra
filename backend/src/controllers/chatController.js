import { generateResponse } from "../services/geminiService.js";

const errorConfigByStatus = {
  429: {
    status: 429,
    errorCode: "RATE_LIMIT",
    message: "Too many requests. Please wait before trying again."
  },
  500: {
    status: 500,
    errorCode: "INTERNAL_ERROR",
    message: "Something went wrong. Please try again later."
  },
  503: {
    status: 503,
    errorCode: "SERVICE_BUSY",
    message: "AI service is currently busy. Please try again shortly."
  }
};

const getErrorStatus = (error) => {
  if (!error) {
    return 500;
  }

  return (
    error.status ||
    error.statusCode ||
    error.code ||
    error.cause?.status ||
    error.response?.status ||
    500
  );
};

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

    const errorStatus = getErrorStatus(error);
    const errorPayload = errorConfigByStatus[errorStatus] || errorConfigByStatus[500];

    return response.status(errorPayload.status).json({
      success: false,
      errorCode: errorPayload.errorCode,
      message: errorPayload.message
    });
  }
};
