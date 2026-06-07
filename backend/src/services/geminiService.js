import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const ai = new GoogleGenAI({ apiKey });

export const generateResponse = async (message) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: message
  });

  return response.text?.trim() || "No response generated.";
};
