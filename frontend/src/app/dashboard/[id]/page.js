"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NavBar from "../../components/NavBar";
import AuthGuard from "../../components/AuthGuard";
import styles from "./page.module.css";
import { getTranscript } from "@/app/api/transcript";
import VoiceRecorder from "@/app/components/VoiceRecorder";
import CompassSpinner from "@/app/components/CompassSpinner";
import {
  MindMapIcon, SummaryIcon, FlashcardsIcon, PresentationIcon,
  ExamIcon, ChatbotIcon, SettingsIcon, ChevronLeftIcon, ChevronRightIcon,
} from "@/app/components/icons";
import Summary from "./tools/Summary";
import Flashcards from "./tools/Flashcards";
import PowerPoint from "./tools/PowerPoint";
import Exam from "./tools/Exam";
import Chatbot from "./tools/Chatbot";
import Settings from "./tools/Settings";
import MindMapWrapper from "./tools/MindmapWrapper";

// Stable wrapper so React never unmounts MindMap due to a changing function reference
function MindMapTool({ transcript }) {
  return <MindMapWrapper graph={transcript} />;
}

// ── Tool definitions ───────────────────────────────────────────────────────────
const TOOLS = [
  { id: "mindmap",    label: "Mind Map",     icon: <MindMapIcon /> },
  { id: "summary",    label: "Summary",      icon: <SummaryIcon /> },
  { id: "flashcards", label: "Flashcards",   icon: <FlashcardsIcon /> },
  { id: "powerpoint", label: "Presentation", icon: <PresentationIcon /> },
  { id: "exam",       label: "Exam",         icon: <ExamIcon /> },
  { id: "chatbot",    label: "Chatbot",      icon: <ChatbotIcon /> },
  { id: "settings",   label: "Settings",     icon: <SettingsIcon /> },
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
    settings: Settings,
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
              />
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
              {sidebarOpen
                ? <ChevronLeftIcon width={10} height={16} />
                : <ChevronRightIcon width={10} height={16} />}
            </button>
          </aside>

          {/* ── Canvas ── */}
          <main className={styles.canvas}>
            {loading && (
              <div className={styles.loadingWrap}>
                <CompassSpinner svgClassName={styles.compass} />
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
