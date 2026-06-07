import { generateEmbedding } from "../services/embeddingService.js";
import { searchChromaEmbeddings } from "../services/chromaService.js";

export const searchDocuments = async (request, response) => {
  try {
    const query = request.body?.query?.trim();

    if (!query) {
      return response.status(400).json({
        success: false,
        message: "Query is required."
      });
    }

    const { embedding: queryEmbedding } = await generateEmbedding(query);
    const results = await searchChromaEmbeddings(queryEmbedding, 5);

    return response.status(200).json({
      query,
      results: results.map((result) => ({
        score: result.score,
        chunkText: result.chunkText,
        documentId: result.metadata?.documentId || "",
        chunkIndex: result.metadata?.chunkIndex || 0
      }))
    });
  } catch (error) {
    console.error("Search documents error:", error);
    return response.status(500).json({
      success: false,
      message: "Failed to search documents."
    });
  }
};
