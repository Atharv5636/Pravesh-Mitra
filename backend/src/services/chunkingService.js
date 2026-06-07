const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export const cleanExtractedText = (text) => {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .replace(/ *\n */g, "\n")
    .trim();
};

export const splitTextIntoChunks = (text) => {
  const cleanedText = cleanExtractedText(text);

  if (!cleanedText) {
    return [];
  }

  const chunks = [];
  let startIndex = 0;

  while (startIndex < cleanedText.length) {
    const endIndex = Math.min(startIndex + CHUNK_SIZE, cleanedText.length);
    const chunkText = cleanedText.slice(startIndex, endIndex).trim();

    if (chunkText) {
      chunks.push({
        chunkIndex: chunks.length + 1,
        chunkText,
        chunkLength: chunkText.length
      });
    }

    if (endIndex >= cleanedText.length) {
      break;
    }

    startIndex = Math.max(endIndex - CHUNK_OVERLAP, startIndex + 1);
  }

  return chunks;
};
