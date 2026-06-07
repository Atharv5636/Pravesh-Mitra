import { readFile } from "fs/promises";
import { PDFParse } from "pdf-parse";

export const extractPdfText = async (filePath) => {
  const fileBuffer = await readFile(filePath);
  const parser = new PDFParse({ data: fileBuffer });

  try {
    const result = await parser.getText();

    return {
      text: result?.text?.trim() || "",
      totalPages: result?.total || 0
    };
  } finally {
    await parser.destroy();
  }
};
