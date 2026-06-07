import { useEffect, useState } from "react";
import {
  fetchDocuments,
  removeDocument,
  uploadDocument
} from "../services/documentService";

const categories = [
  "Eligibility",
  "Cutoffs",
  "Fee Structure",
  "CAP Rules",
  "Institutes",
  "Other"
];

function Admin() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  const loadDocuments = async () => {
    try {
      setIsLoadingDocuments(true);
      setErrorMessage("");
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (error) {
      setErrorMessage(error?.message || "Failed to load documents.");
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setSuccessMessage("");
      setErrorMessage("Title is required.");
      return;
    }

    if (!file) {
      setSuccessMessage("");
      setErrorMessage("Please choose a PDF file.");
      return;
    }

    setIsUploading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const document = await uploadDocument({
        file,
        title: title.trim(),
        category
      });

      setDocuments((currentDocuments) => [document, ...currentDocuments]);
      setTitle("");
      setCategory(categories[0]);
      setFile(null);
      setSuccessMessage("Document uploaded successfully.");
    } catch (error) {
      setErrorMessage(error?.message || "Failed to upload document.");
    } finally {
      setIsUploading(false);
      event.target.reset();
    }
  };

  const handleDelete = async (documentId) => {
    try {
      setDeletingId(documentId);
      setSuccessMessage("");
      setErrorMessage("");
      await removeDocument(documentId);
      setDocuments((currentDocuments) =>
        currentDocuments.filter((document) => document._id !== documentId)
      );
      setSuccessMessage("Document deleted successfully.");
    } catch (error) {
      setErrorMessage(error?.message || "Failed to delete document.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Admin Uploads</h1>
        <p className="text-slate-600">Upload and manage admission-related PDF documents.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
            placeholder="B.Arch Eligibility 2025"
            disabled={isUploading}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
            disabled={isUploading}
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="pdf">
            PDF File
          </label>
          <input
            id="pdf"
            type="file"
            accept="application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-white focus:border-slate-500"
            disabled={isUploading}
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isUploading ? "Uploading..." : "Upload PDF"}
        </button>
      </form>

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900">Uploaded Documents</h2>
          <p className="text-sm text-slate-600">View all uploaded document metadata.</p>
        </div>

        {isLoadingDocuments ? (
          <p className="text-slate-600">Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="text-slate-600">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <div
                key={document._id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-lg font-medium text-slate-900">{document.title}</p>
                  <p className="text-sm text-slate-600">{document.category}</p>
                  <p className="text-sm text-slate-500">
                    Uploaded on{" "}
                    {document.uploadDate
                      ? new Date(document.uploadDate).toLocaleDateString()
                      : "Unknown date"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(document._id)}
                  disabled={deletingId === document._id}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  {deletingId === document._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default Admin;
