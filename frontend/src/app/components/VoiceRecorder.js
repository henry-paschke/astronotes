"use client";

import { useRef, useState } from "react";
import { deinitializeRedis, initializeRedis } from "../api/dashboard";
import { updateGraph } from "../api/mindmap";
import styles from "./VoiceRecorder.module.css";

// Minimum words buffered before sending to graph mid-recording
const MIN_GRAPH_WORDS = 8;
// How often to flush to graph regardless of buffer size (ms)
const GRAPH_INTERVAL_MS = 8_000;

export default function VoiceRecorder({ id, setTranscript, setTextStream }) {
  const [isRecording, setIsRecording] = useState(false);
  const [graphStatus, setGraphStatus] = useState(""); // "" | "updating"

  const recognitionRef = useRef(null);
  const pendingTextRef = useRef(""); // text buffered since last graph flush
  const graphUpdatingRef = useRef(false); // prevent concurrent graph calls
  const graphIntervalRef = useRef(null);
  const activeRef = useRef(false); // true while recording session is live
  const lastGraphSizeRef = useRef({ nodes: 0, links: 0 });

  // ── Flush buffered text to graph ──────────────────────────────────────────
  async function flushToGraph({ force = false } = {}) {
    if (graphUpdatingRef.current) {
      if (!force) return;
      // Force flush: wait for the in-progress update to finish first
      while (graphUpdatingRef.current) {
        await new Promise((r) => setTimeout(r, 100));
      }
    }
    const words = pendingTextRef.current.trim().split(/\s+/).filter(Boolean);
    if (!force && words.length < MIN_GRAPH_WORDS) return;
    if (words.length === 0) return;

    const text = pendingTextRef.current.trim();
    pendingTextRef.current = "";
    graphUpdatingRef.current = true;
    setGraphStatus("updating");
    try {
      const res = await updateGraph(id, text);
      const updated = await res.json();
      const newNodes = updated?.nodes?.length ?? 0;
      const newLinks = updated?.links?.length ?? 0;
      if (
        newNodes !== lastGraphSizeRef.current.nodes ||
        newLinks !== lastGraphSizeRef.current.links
      ) {
        lastGraphSizeRef.current = { nodes: newNodes, links: newLinks };
        setTranscript(updated);
      }
    } catch {
      // on error, put the text back for the next flush
      pendingTextRef.current =
        text + (pendingTextRef.current ? " " + pendingTextRef.current : "");
    } finally {
      graphUpdatingRef.current = false;
      setGraphStatus("");
    }
  }

  // ── Start recording ────────────────────────────────────────────────────────
  async function startRecording() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge.",
      );
      return;
    }

    await initializeRedis(id);
    activeRef.current = true;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        const trimmed = finalTranscript.trim();
        pendingTextRef.current += (pendingTextRef.current ? " " : "") + trimmed;
        setTextStream((prev) => prev + (prev ? " " : "") + trimmed);
        // Try to flush immediately after every finalised sentence
        flushToGraph();
      }

      // Show interim text live in the stream (but don't buffer it for the graph)
      if (interimTranscript) {
        setTextStream((prev) => {
          // Replace any existing interim suffix — keep only finalised text + current interim
          const base = pendingTextRef.current;
          return base + (base ? " " : "") + interimTranscript;
        });
      }
    };

    // SpeechRecognition can stop on silence — restart automatically while active
    recognition.onend = () => {
      if (activeRef.current) {
        try {
          recognition.start();
        } catch {
          /* already started */
        }
      }
    };

    recognition.onerror = (e) => {
      // "no-speech" and "aborted" are expected — ignore them
      if (e.error !== "no-speech" && e.error !== "aborted") {
        console.warn("SpeechRecognition error:", e.error);
      }
    };

    recognition.start();
    setIsRecording(true);

    // Periodic graph flush
    graphIntervalRef.current = setInterval(
      () => flushToGraph(),
      GRAPH_INTERVAL_MS,
    );
  }

  // ── Stop recording ─────────────────────────────────────────────────────────
  async function stopRecording() {
    activeRef.current = false;
    clearInterval(graphIntervalRef.current);

    recognitionRef.current?.stop();
    recognitionRef.current = null;

    setIsRecording(false);

    // Final flush — send everything regardless of word count
    await flushToGraph({ force: true });

    pendingTextRef.current = "";
    setTextStream("");
    await deinitializeRedis(id);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.btnWrap}>
        {isRecording && (
          <>
            <span className={styles.ring} />
            <span className={`${styles.ring} ${styles.ring2}`} />
          </>
        )}
        <button
          className={`${styles.btn} ${isRecording ? styles.btnRecording : ""}`}
          onClick={isRecording ? stopRecording : startRecording}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {/* Microphone icon */}
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.icon}>
            <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" />
            <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className={styles.status}>
        {graphStatus === "updating" ? (
          <span className={styles.updating}>
            <svg className={styles.spinner} viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"
                strokeDasharray="20" strokeDashoffset="8" strokeLinecap="round" />
            </svg>
            Mapping
          </span>
        ) : isRecording ? (
          <span className={styles.listening}>
            <span className={styles.listenDot} />
            Listening
          </span>
        ) : null}
      </div>
    </div>
  );
}
