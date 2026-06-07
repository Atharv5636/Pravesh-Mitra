import { useState } from "react";
import { sendChatMessage } from "../services/chatService";

function Chat() {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setError("Please enter a message.");
      return;
    }

    setIsLoading(true);
    setError("");
    setAnswer("");
    setSubmittedMessage(trimmedMessage);

    try {
      const response = await sendChatMessage(trimmedMessage);
      setAnswer(response);
      setMessage("");
    } catch (requestError) {
      setError(requestError.message || "Something went wrong.");
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

      {submittedMessage ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">User</p>
            <p className="text-slate-900">{submittedMessage}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Assistant
            </p>
            <p className="whitespace-pre-wrap text-slate-900">
              {isLoading ? "Loading response..." : answer}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Chat;
