const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const sendChatMessage = async (message) => {
  const response = await fetch(`${apiUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || !data?.success) {
    const error = new Error(data?.message || "Something went wrong. Please try again later.");
    error.status = response.status;
    error.errorCode = data?.errorCode || "REQUEST_FAILED";
    throw error;
  }

  return {
    answer: data?.answer || ""
  };
};
