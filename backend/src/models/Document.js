import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  filePath: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  extractedText: {
    type: String,
    default: ""
  },
  totalPages: {
    type: Number,
    default: 0
  },
  totalChunks: {
    type: Number,
    default: 0
  },
  extractionStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

const Document = mongoose.model("Document", documentSchema);

export default Document;
