const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const fetchDocuments = async () => {
  const response = await fetch(`${apiUrl}/documents`);
  const data = await response.json();

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Failed to fetch documents.");
  }

  return data?.documents || [];
};

export const uploadDocument = async ({ file, title, category }) => {
  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("title", title);
  formData.append("category", category);

  const response = await fetch(`${apiUrl}/documents/upload`, {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Failed to upload document.");
  }

  return data?.document;
};

export const removeDocument = async (documentId) => {
  const response = await fetch(`${apiUrl}/documents/${documentId}`, {
    method: "DELETE"
  });

  const data = await response.json();

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Failed to delete document.");
  }

  return data;
};
