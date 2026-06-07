import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
    index: true
  },
  chunkIndex: {
    type: Number,
    required: true
  },
  pageNumber: {
    type: Number,
    required: true
  },
  chunkText: {
    type: String,
    required: true,
    trim: true
  },
  chunkLength: {
    type: Number,
    required: true
  },
  embedding: {
    type: [Number],
    default: []
  },
  embeddingStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
  },
  chromaStatus: {
    type: String,
    enum: ["pending", "synced", "failed"],
    default: "pending"
  },
  embeddedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

documentChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });

const DocumentChunk = mongoose.model("DocumentChunk", documentChunkSchema);

export default DocumentChunk;
