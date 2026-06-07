import { getChunkEmbeddingMetadataById } from "../services/documentService.js";

export const getChunkEmbedding = async (request, response) => {
  try {
    const chunk = await getChunkEmbeddingMetadataById(request.params.id);

    if (!chunk) {
      return response.status(404).json({
        success: false,
        message: "Chunk not found."
      });
    }

    return response.status(200).json({
      chunkId: chunk._id,
      embeddingDimensions: chunk.embedding?.length || 0,
      embeddingStatus: chunk.embeddingStatus || "pending"
    });
  } catch (error) {
    console.error("Get chunk embedding error:", error);
    return response.status(500).json({
      success: false,
      message: "Failed to fetch chunk embedding metadata."
    });
  }
};
