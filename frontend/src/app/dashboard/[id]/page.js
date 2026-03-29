"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NavBar from "../../components/NavBar";
import AuthGuard from "../../components/AuthGuard";
import styles from "./page.module.css";
import { initializeRedis } from "@/app/api/dashboard";
import { getTranscript } from "@/app/api/transcript";
import VoiceRecorder from "@/app/components/VoiceRecorder";
import Summary from "./tools/Summary";
import Flashcards from "./tools/Flashcards";
import PowerPoint from "./tools/PowerPoint";
import Exam from "./tools/Exam";
import Chatbot from "./tools/Chatbot";
import MindMapWrapper from "./tools/MindmapWrapper";

// Stable wrapper so React never unmounts MindMap due to a changing function reference
function MindMapTool({ transcript }) {
  return <MindMapWrapper graph={transcript} />;
}

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
    label: "Presentation",
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
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle
          cx="16"
          cy="16"
          r="3.5"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M16 4.5v3M16 24.5v3M4.5 16h3M24.5 16h3M7.9 7.9l2.1 2.1M22 22l2.1 2.1M7.9 24.1l2.1-2.1M22 10l2.1-2.1"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
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
  const [textStream, setTextStream] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TOOL_COMPONENTS = {
    mindmap: MindMapTool,
    summary: Summary,
    flashcards: Flashcards,
    powerpoint: PowerPoint,
    exam: Exam,
    chatbot: Chatbot,
  };

  useEffect(() => {
    if (!id) return;
    getTranscript(id)
      .then((data) => setTranscript(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    console.log(transcript);
  }, [transcript]);

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
              <VoiceRecorder
                textStream={textStream}
                setTextStream={setTextStream}
                id={id}
                setTranscript={setTranscript}
              ></VoiceRecorder>
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
            {loading && (
              <div className={styles.loadingWrap}>
                <svg
                  className={styles.compass}
                  viewBox="0 0 72 72"
                  fill="none"
                  aria-hidden="true"
                >
                  {/* Outer tick ring */}
                  <g className={styles.compassRing}>
                    <circle
                      cx="36"
                      cy="36"
                      r="33"
                      stroke="#c4a35a"
                      strokeWidth="0.8"
                      opacity="0.25"
                    />
                    {Array.from({ length: 24 }, (_, i) => {
                      const a = (i / 24) * Math.PI * 2;
                      const major = i % 6 === 0;
                      const r0 = major ? 29 : 30.5;
                      const r1 = 33;
                      return (
                        <line
                          key={i}
                          x1={36 + r0 * Math.cos(a)}
                          y1={36 + r0 * Math.sin(a)}
                          x2={36 + r1 * Math.cos(a)}
                          y2={36 + r1 * Math.sin(a)}
                          stroke="#c4a35a"
                          strokeWidth={major ? 1.2 : 0.6}
                          opacity={major ? 0.7 : 0.35}
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </g>
                  {/* Static inner ring */}
                  <circle
                    cx="36"
                    cy="36"
                    r="22"
                    stroke="#c4a35a"
                    strokeWidth="0.6"
                    opacity="0.18"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r="4"
                    stroke="#c4a35a"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  {/* Needle */}
                  <g className={styles.compassNeedle}>
                    {/* North — gold */}
                    <polygon
                      points="36,36 33.5,36 36,14"
                      fill="#c4a35a"
                      opacity="0.9"
                    />
                    {/* South — dim */}
                    <polygon
                      points="36,36 38.5,36 36,58"
                      fill="#c4a35a"
                      opacity="0.3"
                    />
                  </g>
                  {/* Cardinal letters */}
                  <text
                    x="36"
                    y="9"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="6"
                    fontFamily="serif"
                    fill="#c4a35a"
                    opacity="0.55"
                    letterSpacing="0.1em"
                  >
                    N
                  </text>
                  <text
                    x="36"
                    y="65"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="6"
                    fontFamily="serif"
                    fill="#c4a35a"
                    opacity="0.35"
                    letterSpacing="0.1em"
                  >
                    S
                  </text>
                  <text
                    x="63"
                    y="37"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="6"
                    fontFamily="serif"
                    fill="#c4a35a"
                    opacity="0.35"
                    letterSpacing="0.1em"
                  >
                    E
                  </text>
                  <text
                    x="9"
                    y="37"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="6"
                    fontFamily="serif"
                    fill="#c4a35a"
                    opacity="0.35"
                    letterSpacing="0.1em"
                  >
                    W
                  </text>
                </svg>
                <span className={styles.loadingLabel}>Charting</span>
              </div>
            )}
            {error && <p className={styles.debugError}>{error}</p>}
            {!loading &&
              !error &&
              (() => {
                const ActiveTool = TOOL_COMPONENTS[activeTool];
                return <ActiveTool transcript={transcript} id={id} />;
              })()}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
