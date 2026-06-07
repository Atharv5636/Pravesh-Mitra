import { useState } from "react";
import { sendChatMessage } from "../services/chatService";

const getFriendlyErrorMessage = (error) => {
  const errorCode = error?.errorCode;
  const status = error?.status;

  if (errorCode === "SERVICE_BUSY" || status === 503) {
    return "AI service is currently busy. Please try again in a few seconds.";
  }

  if (errorCode === "RATE_LIMIT" || status === 429) {
    return "Too many requests. Please wait and try again.";
  }

  if (errorCode === "TIMEOUT" || status === 504) {
    return "The request took too long. Please try again.";
  }

  if (status === 500) {
    return "Something went wrong. Please try again later.";
  }

  return error?.message || "Something went wrong. Please try again later.";
};

function Chat() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setError("Please enter a message.");
      return;
    }

    setIsLoading(true);
    setError("");

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: trimmedMessage
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);

    try {
      const response = await sendChatMessage(trimmedMessage);
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: response?.answer || "",
        citations: Array.isArray(response?.citations) ? response.citations : []
      };

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
      setMessage("");
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Pravesh Mitra Chat</h1>
        <p className="text-slate-600">Ask a question and get a Gemini response.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="block text-sm font-medium text-slate-700" htmlFor="chat-message">
          Your message
        </label>
        <input
          id="chat-message"
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="What is engineering?"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      ) : null}

      {messages.length > 0 ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {messages.map((entry) => (
            <div key={entry.id} className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {entry.role === "user" ? "User" : "Assistant"}
              </p>
              <p className="whitespace-pre-wrap text-slate-900">{entry.content || ""}</p>
              {entry.role === "assistant" &&
              Array.isArray(entry.citations) &&
              entry.citations.length > 0 ? (
                <details className="pt-2">
                  <summary className="cursor-pointer text-sm font-medium text-slate-700">
                    Sources
                  </summary>
                  <div className="mt-2 space-y-2 text-sm text-slate-600">
                    {entry.citations.map((citation, index) => (
                      <div
                        key={`${entry.id}-${citation.documentTitle}-${citation.pageNumber}-${citation.chunkIndex}-${index}`}
                      >
                        <div>
                          {citation.documentTitle || "Unknown document"} (Page{" "}
                          {citation.pageNumber || 0})
                        </div>
                        <div className="text-xs text-slate-500">
                          Chunk {citation.chunkIndex || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}
            </div>
          ))}

          {isLoading ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Assistant
              </p>
              <p className="whitespace-pre-wrap text-slate-900">Loading response...</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export default Chat;
