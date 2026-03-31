"use client";

import { useRef, useState } from "react";
import { deinitializeRedis, initializeRedis } from "../api/dashboard";
import { updateGraph } from "../api/mindmap";
import styles from "./VoiceRecorder.module.css";
import { MicIcon, SpinnerCircleIcon } from "./icons";

const MIN_GRAPH_WORDS = 16;
const GRAPH_INTERVAL_MS = 10_000;

export default function VoiceRecorder({ id, setTranscript, setTextStream }) {
  const [isRecording, setIsRecording] = useState(false);
  const [graphStatus, setGraphStatus] = useState("");

  const recognitionRef = useRef(null);
  const pendingTextRef = useRef("");
  const lastInterimRef = useRef(""); // tracks the latest interim text
  const graphUpdatingRef = useRef(false);
  const graphIntervalRef = useRef(null);
  const activeRef = useRef(false);
  const lastGraphSizeRef = useRef({ nodes: 0, links: 0 });
  const restartTimerRef = useRef(null);
  const lastFlushTimeRef = useRef(0);

  async function flushToGraph({ force = false } = {}) {
    if (graphUpdatingRef.current) {
      if (!force) return;
      while (graphUpdatingRef.current)
        await new Promise((r) => setTimeout(r, 100));
    }
    // Always scoop up whatever interim Chrome has heard so the interval never sees 0 words
    commitInterim();
    const words = pendingTextRef.current.trim().split(/\s+/).filter(Boolean);
    console.log("[GRAPH] flush called, words:", words.length, "force:", force);
    if (!force && words.length < MIN_GRAPH_WORDS) return;
    if (words.length === 0) return;

    const text = pendingTextRef.current.trim();
    pendingTextRef.current = "";
    graphUpdatingRef.current = true;
    lastFlushTimeRef.current = Date.now();
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
    } catch (e) {
      console.error("[GRAPH] updateGraph failed:", e);
      pendingTextRef.current =
        text + (pendingTextRef.current ? " " + pendingTextRef.current : "");
    } finally {
      graphUpdatingRef.current = false;
      setGraphStatus("");
    }
  }

  function commitInterim() {
    // If Chrome never fired isFinal, save whatever interim text we last saw
    const interim = lastInterimRef.current.trim();
    if (interim) {
      console.log("[STT] committing interim as final:", interim);
      pendingTextRef.current += (pendingTextRef.current ? " " : "") + interim;
      setTextStream((prev) => prev + (prev ? " " : "") + interim);
      lastInterimRef.current = "";
    }
  }

  function createRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        console.log(
          "[STT] result",
          i,
          "isFinal:",
          result.isFinal,
          "text:",
          result[0].transcript,
        );
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        const trimmed = finalTranscript.trim();
        lastInterimRef.current = "";
        pendingTextRef.current += (pendingTextRef.current ? " " : "") + trimmed;
        setTextStream((prev) => prev + (prev ? " " : "") + trimmed);
        return;
      }

      // Rebuild full interim across ALL current result slots
      let fullInterim = "";
      for (let i = 0; i < event.results.length; i++) {
        fullInterim += event.results[i][0].transcript;
      }

      // Detect Chrome silently resetting: if the new full interim is much SHORTER
      // than what we last saw, Chrome discarded old results without firing isFinal.
      // Treat the previous interim as finalized before overwriting.
      const prevInterim = lastInterimRef.current.trim();
      const currInterim = fullInterim.trim();
      if (prevInterim && currInterim.length < prevInterim.length * 0.6) {
        console.log("[STT] Chrome reset detected, committing:", prevInterim);
        pendingTextRef.current +=
          (pendingTextRef.current ? " " : "") + prevInterim;
        setTextStream((p) => p + (p ? " " : "") + prevInterim);
      }

      lastInterimRef.current = currInterim;
      setTextStream(() => {
        const base = pendingTextRef.current;
        return base + (base ? " " : "") + currInterim;
      });
    };

    recognition.onend = () => {
      if (!activeRef.current) return;

      // Chrome ended without finalizing — save what we heard
      commitInterim();

      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = setTimeout(() => {
        if (!activeRef.current) return;
        try {
          recognitionRef.current = createRecognition();
          recognitionRef.current.start();
        } catch {
          /* already restarting */
        }
      }, 300);
    };

    recognition.onerror = (e) => {
      if (e.error !== "no-speech" && e.error !== "aborted") {
        console.warn("[STT] error:", e.error);
      }
    };

    return recognition;
  }

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

    const recognition = createRecognition();
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);

    // Interval flush: skip if something already flushed recently
    graphIntervalRef.current = setInterval(() => {
      const timeSinceLast = Date.now() - lastFlushTimeRef.current;
      if (timeSinceLast < GRAPH_INTERVAL_MS - 2000) return;
      flushToGraph({ force: true });
    }, GRAPH_INTERVAL_MS);
  }

  async function stopRecording() {
    activeRef.current = false;
    clearTimeout(restartTimerRef.current);
    clearInterval(graphIntervalRef.current);

    // Commit any unfinalized interim before stopping
    commitInterim();

    recognitionRef.current?.stop();
    recognitionRef.current = null;

    setIsRecording(false);
    await flushToGraph({ force: true });

    pendingTextRef.current = "";
    lastInterimRef.current = "";
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
          <MicIcon className={styles.icon} />
        </button>
      </div>

      <div className={styles.status}>
        {graphStatus === "updating" ? (
          <span className={styles.updating}>
            <SpinnerCircleIcon className={styles.spinner} />
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
