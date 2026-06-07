import { readFile } from "fs/promises";
import { PDFParse } from "pdf-parse";

export const extractPdfText = async (filePath) => {
  const fileBuffer = await readFile(filePath);
  const parser = new PDFParse({ data: fileBuffer });

  try {
    const result = await parser.getText();

    return {
      text: result?.text?.trim() || "",
      totalPages: result?.total || 0,
      pages: Array.isArray(result?.pages)
        ? result.pages.map((page) => ({
            pageNumber: page?.num || 0,
            text: page?.text?.trim?.() || ""
          }))
        : []
    };
  } finally {
    await parser.destroy();
  }
};
