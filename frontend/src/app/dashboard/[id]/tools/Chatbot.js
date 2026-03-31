"use client";

import { useEffect, useRef, useState } from "react";
import { sendMessage } from "@/app/api/chat";
import styles from "./Chatbot.module.css";
import { Rule, SendIcon, ChatBubbleIllustration } from "@/app/components/icons";

function renderBold(text) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

function CompassSpinner() {
  return (
    <div className={styles.typingWrap} aria-label="Thinking">
      <span className={styles.typingDot} />
      <span className={styles.typingDot} />
      <span className={styles.typingDot} />
    </div>
  );
}

export default function Chatbot({ id }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const { reply } = await sendMessage(id, next);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleClear() {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  }

  return (
    <div className={styles.wrap}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Rule className={styles.rule} />
          <h2 className={styles.title}>Lecture Assistant</h2>
          <p className={styles.meta}>Ask anything about this lecture</p>
        </div>
        {messages.length > 0 && (
          <button className={styles.clearBtn} onClick={handleClear}>
            Clear chat
          </button>
        )}
      </div>

      {/* ── Messages ── */}
      <div className={styles.messages}>
        {messages.length === 0 && !loading && (
          <div className={styles.empty}>
            <ChatBubbleIllustration />
            <p>Ask a question about the lecture.</p>
            <p className={styles.emptyHint}>This assistant only knows about this lecture&apos;s content.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === "user" ? styles.bubbleUser : styles.bubbleAssistant}
          >
            <span className={styles.bubbleRole}>
              {msg.role === "user" ? "You" : "Assistant"}
            </span>
            <p className={styles.bubbleText}>
              {msg.role === "assistant" ? renderBold(msg.content) : msg.content}
            </p>
          </div>
        ))}

        {loading && (
          <div className={styles.bubbleAssistant}>
            <span className={styles.bubbleRole}>Assistant</span>
            <CompassSpinner />
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className={styles.inputRow}>
        <textarea
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about the lecture…"
          rows={1}
          disabled={loading}
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!input.trim() || loading}
          aria-label="Send"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
