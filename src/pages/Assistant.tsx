
import { useState } from "react";
import type { FormEvent } from "react";
import { Bot, Send, User } from "lucide-react";
import { authApi } from "../services/api";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm TradePilot AI. Ask me about your sales, expenses, inventory, or business performance.",
    },
  ]);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = question.trim();

    if (!message || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: message },
    ]);

    setQuestion("");
    setError("");
    setLoading(true);

    try {
      const response = await authApi.chat(message);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: response.answer || "No response was returned.",
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to contact TradePilot AI."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-page-header">
        <div className="chat-heading-icon">
          <Bot size={24} />
        </div>
        <div>
          <h1>TradePilot AI Assistant</h1>
          <p>Ask questions about your business data.</p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.role}`}
          >
            <div className="chat-avatar">
              {message.role === "assistant" ? (
                <Bot size={20} />
              ) : (
                <User size={20} />
              )}
            </div>

        <div className="chat-bubble">
            {message.role === "assistant" ? (
            <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : (
             message.content
            )}
        </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message assistant">
            <div className="chat-avatar">
              <Bot size={20} />
            </div>
            <div className="chat-bubble">
              TradePilot is analysing your business...
            </div>
          </div>
        )}
      </div>

      {error && <p className="auth-error">{error}</p>}

      <form className="chat-input-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask TradePilot about your business..."
          maxLength={1000}
          disabled={loading}
          required
        />

        <button type="submit" disabled={loading || !question.trim()}>
          <Send size={19} />
          Send
        </button>
      </form>
    </div>
  );
}
