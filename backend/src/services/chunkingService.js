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

export const splitPagesIntoChunks = (pages) => {
  if (!Array.isArray(pages) || pages.length === 0) {
    return [];
  }

  const allChunks = [];
  let chunkCounter = 1;

  for (const page of pages) {
    const pageNumber = page?.pageNumber || 0;
    const pageChunks = splitTextIntoChunks(page?.text || "");

    for (const pageChunk of pageChunks) {
      allChunks.push({
        chunkIndex: chunkCounter,
        pageNumber,
        chunkText: pageChunk.chunkText,
        chunkLength: pageChunk.chunkLength
      });
      chunkCounter += 1;
    }
  }

  return allChunks;
};
