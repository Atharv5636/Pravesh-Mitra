import fs from "fs";
import multer from "multer";
import path from "path";

const uploadsDirectory = path.resolve(process.cwd(), "uploads");

fs.mkdirSync(uploadsDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, uploadsDirectory);
  },
  filename: (request, file, callback) => {
    const extension = path.extname(file.originalname) || ".pdf";
    const baseName = path.basename(file.originalname, extension).replace(/\s+/g, "-");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (request, file, callback) => {
  if (file?.mimetype !== "application/pdf") {
    callback(new Error("Only PDF files are allowed"));
    return;
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});

export default upload;
