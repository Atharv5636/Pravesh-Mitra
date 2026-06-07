const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const sendChatMessage = async (message) => {
  const response = await fetch(`${apiUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to fetch chat response");
  }

  return data.answer;
};
