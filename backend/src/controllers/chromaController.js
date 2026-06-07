import { getChromaCollectionStats } from "../services/chromaService.js";

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
