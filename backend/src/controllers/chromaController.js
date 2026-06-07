import { rebuildChromaCollection, getChromaCollectionStats } from "../services/chromaService.js";
import { getDocumentsWithChunksForChromaRebuild } from "../services/documentService.js";

export const getChromaStats = async (request, response) => {
  try {
    const stats = await getChromaCollectionStats();
    return response.status(200).json(stats);
  } catch (error) {
    console.error("Get Chroma stats error:", error);
    return response.status(500).json({
      success: false,
      message: "Failed to fetch Chroma stats."
    });
  }
};

export const rebuildChroma = async (request, response) => {
  try {
    const { documents, chunks } = await getDocumentsWithChunksForChromaRebuild();
    const result = await rebuildChromaCollection({ documents, chunks });

    return response.status(200).json(result);
  } catch (error) {
    console.error("Rebuild Chroma error:", error);
    return response.status(500).json({
      success: false,
      message: "Failed to rebuild Chroma collection."
    });
  }
};
