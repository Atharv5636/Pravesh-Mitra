import { GoogleGenAI } from "@google/genai";

export const generateResponse = async (message) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: message
  });

  return response.text?.trim() || "No response generated.";
};
