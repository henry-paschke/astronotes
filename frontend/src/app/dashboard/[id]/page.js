"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NavBar from "../../components/NavBar";
import AuthGuard from "../../components/AuthGuard";
import styles from "./page.module.css";
import { initializeRedis } from "@/app/api/dashboard";
import { getTranscript } from "@/app/api/transcript";

const API = "http://localhost:8000";

// ── Tool definitions ───────────────────────────────────────────────────────────
const TOOLS = [
  {
    id: "mindmap",
    label: "Mind Map",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="4" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" />
        <circle
          cx="28"
          cy="8"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle
          cx="4"
          cy="24"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle
          cx="28"
          cy="24"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle
          cx="16"
          cy="2"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle
          cx="16"
          cy="30"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <line
          x1="12.5"
          y1="13.5"
          x2="6"
          y2="9.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="19.5"
          y1="13.5"
          x2="26"
          y2="9.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="12.5"
          y1="18.5"
          x2="6"
          y2="22.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="19.5"
          y1="18.5"
          x2="26"
          y2="22.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="16"
          y1="12"
          x2="16"
          y2="4.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="16"
          y1="20"
          x2="16"
          y2="27.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "summary",
    label: "Summary",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect
          x="5"
          y="3"
          width="22"
          height="26"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="10"
          y1="10"
          x2="22"
          y2="10"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="10"
          y1="15"
          x2="22"
          y2="15"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="10"
          y1="20"
          x2="18"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "flashcards",
    label: "Flashcards",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect
          x="2"
          y="8"
          width="22"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.4"
        />
        <rect
          x="5"
          y="5"
          width="22"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.6"
        />
        <rect
          x="8"
          y="11"
          width="22"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="14"
          y1="19"
          x2="24"
          y2="19"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="14"
          y1="22"
          x2="21"
          y2="22"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "powerpoint",
    label: "PowerPoint",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="5"
          width="26"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="16"
          y1="23"
          x2="16"
          y2="28"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="10"
          y1="28"
          x2="22"
          y2="28"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect
          x="8"
          y="9"
          width="7"
          height="10"
          rx="1"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.6"
        />
        <line
          x1="18"
          y1="11"
          x2="24"
          y2="11"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="18"
          y1="14"
          x2="24"
          y2="14"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="18"
          y1="17"
          x2="22"
          y2="17"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "exam",
    label: "Exam",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect
          x="6"
          y="3"
          width="20"
          height="26"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="10"
          y1="10"
          x2="22"
          y2="10"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="10"
          y1="15"
          x2="18"
          y2="15"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle
          cx="21"
          cy="22"
          r="4.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <line
          x1="18.8"
          y1="22"
          x2="23.2"
          y2="22"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="21"
          y1="19.8"
          x2="21"
          y2="24.2"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "chatbot",
    label: "Chatbot",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M4 6 Q4 3 7 3 H25 Q28 3 28 6 V18 Q28 21 25 21 H18 L12 27 V21 H7 Q4 21 4 18 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="11" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
        <circle cx="16" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
        <circle cx="21" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
      </svg>
    ),
  },
];

// ── Dashboard page ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTool, setActiveTool] = useState("mindmap");
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    getTranscript(id)
      .then((data) => setTranscript(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function initialize() {
    await initializeRedis(id);
  }

  return (
    <AuthGuard>
      <div className={styles.page}>
        <NavBar />

        <div className={styles.body}>
          {/* ── Sidebar ── */}
          <aside
            className={`${styles.sidebar} ${sidebarOpen ? "" : styles.sidebarCollapsed}`}
          >
            <div className={styles.sidebarInner}>
              <button onClick={() => initialize()}>Hellooooooooooooooo</button>
              <div className={styles.sidebarHeader}>
                <span className={styles.sidebarLabel}>Tools</span>
              </div>

              <nav className={styles.toolList}>
                {TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    className={`${styles.toolBtn} ${activeTool === tool.id ? styles.toolBtnActive : ""}`}
                    onClick={() => setActiveTool(tool.id)}
                  >
                    <span className={styles.toolIcon}>{tool.icon}</span>
                    <span className={styles.toolLabel}>{tool.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Toggle tab on the right edge of sidebar */}
            <button
              className={styles.sidebarToggle}
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg
                viewBox="0 0 10 16"
                width="10"
                height="16"
                fill="none"
                aria-hidden="true"
              >
                <polyline
                  points={sidebarOpen ? "7,2 3,8 7,14" : "3,2 7,8 3,14"}
                  stroke="#c4a35a"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </aside>

          {/* ── Canvas ── */}
          <main className={styles.canvas}>
            {/* Testing: transcript info */}
            <div className={styles.debugPanel}>
              <p className={styles.debugTitle}>
                Transcript #{id} —{" "}
                {TOOLS.find((t) => t.id === activeTool)?.label}
              </p>
              {loading && <p className={styles.debugMeta}>Loading…</p>}
              {error && <p className={styles.debugError}>{error}</p>}
              {transcript && (
                <pre className={styles.debugJson}>
                  {JSON.stringify(transcript, null, 2)}
                </pre>
              )}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
