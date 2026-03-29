"use client";

import { useEffect, useRef, useState } from "react";
import { sendMessage } from "@/app/api/chat";
import styles from "./Chatbot.module.css";

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
          <svg viewBox="0 0 120 12" className={styles.rule} aria-hidden="true">
            <line x1="0" y1="6" x2="48" y2="6" stroke="#c4a35a" strokeWidth="0.8" opacity="0.4" />
            <circle cx="55" cy="6" r="3" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.7" />
            <circle cx="60" cy="6" r="1.5" fill="#c4a35a" opacity="0.8" />
            <circle cx="65" cy="6" r="3" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.7" />
            <line x1="72" y1="6" x2="120" y2="6" stroke="#c4a35a" strokeWidth="0.8" opacity="0.4" />
          </svg>
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
            <svg viewBox="0 0 48 48" width="36" height="36" fill="none" aria-hidden="true">
              <path
                d="M6 8 Q6 5 9 5 H39 Q42 5 42 8 V28 Q42 31 39 31 H28 L20 38 V31 H9 Q6 31 6 28 Z"
                stroke="#c4a35a" strokeWidth="1.4" strokeLinejoin="round" opacity="0.35"
              />
              <line x1="14" y1="15" x2="34" y2="15" stroke="#c4a35a" strokeWidth="1.1" strokeLinecap="round" opacity="0.3"/>
              <line x1="14" y1="21" x2="28" y2="21" stroke="#c4a35a" strokeWidth="1.1" strokeLinecap="round" opacity="0.3"/>
            </svg>
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
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
            <line x1="2" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <polyline points="9,4 13,8 9,12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
