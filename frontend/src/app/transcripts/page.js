"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { createTranscript } from "../api/transcript";
import NavBar from "../components/NavBar";
import AuthGuard from "../components/AuthGuard";

// ─── Pseudo-random (same helper as landing page) ──────────────────────────────
function pr(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ─── Dummy transcript data ─────────────────────────────────────────────────────
const TRANSCRIPTS = [
  {
    id: 1,
    title: "Introduction to Quantum Mechanics",
    course: "PHYS 301",
    date: "2026-03-24",
    duration: "1h 12m",
    words: 8420,
    status: "complete",
    excerpt:
      "The wave function ψ describes the quantum state of a system, encompassing all possible outcomes through the principle of superposition — a foundation unlike classical determinism.",
  },
  {
    id: 2,
    title: "The Fall of the Roman Republic",
    course: "HIST 220",
    date: "2026-03-22",
    duration: "58m",
    words: 6105,
    status: "complete",
    excerpt:
      "Caesar's crossing of the Rubicon represents not merely a military manoeuvre but a constitutional rupture, severing the Republic's last institutional safeguards against tyranny.",
  },
  {
    id: 3,
    title: "Fourier Analysis & Signal Processing",
    course: "MATH 418",
    date: "2026-03-21",
    duration: "1h 28m",
    words: 9870,
    status: "complete",
    excerpt:
      "Any periodic function can be decomposed into a sum of sinusoids via the Fourier series. The transform extends this to non-periodic signals through the integral representation.",
  },
  {
    id: 4,
    title: "Renaissance Cartography & Navigation",
    course: "HIST 315",
    date: "2026-03-19",
    duration: "1h 05m",
    words: 7230,
    status: "complete",
    excerpt:
      "Portolan charts, produced from the 13th century onward, mark a revolution in practical navigation — the first maps drawn from direct observation rather than inherited cosmology.",
  },
  {
    id: 5,
    title: "Organic Reaction Mechanisms II",
    course: "CHEM 302",
    date: "2026-03-18",
    duration: "1h 35m",
    words: 10240,
    status: "processing",
    excerpt:
      "Nucleophilic substitution proceeds via SN1 or SN2 pathways, governed by substrate structure, solvent polarity, and the nature of the leaving group — a mechanistic interplay.",
  },
  {
    id: 6,
    title: "Stellar Evolution & the HR Diagram",
    course: "ASTR 201",
    date: "2026-03-17",
    duration: "52m",
    words: 5680,
    status: "complete",
    excerpt:
      "The Hertzsprung-Russell diagram plots luminosity against temperature, tracing the lives of stars from the main sequence through giant phases to their eventual endpoints.",
  },
  {
    id: 7,
    title: "Game Theory: Nash Equilibria",
    course: "ECON 340",
    date: "2026-03-15",
    duration: "1h 18m",
    words: 7945,
    status: "complete",
    excerpt:
      "A Nash equilibrium obtains when no player can improve their payoff by deviating unilaterally. The prisoner's dilemma illustrates how individual rationality produces collective loss.",
  },
  {
    id: 8,
    title: "Philosophy of Mind: Consciousness",
    course: "PHIL 401",
    date: "2026-03-14",
    duration: "1h 44m",
    words: 11320,
    status: "draft",
    excerpt:
      "Chalmers' hard problem asks why physical processes give rise to subjective experience at all — why there is something it is like to be a conscious creature, rather than nothing.",
  },
];

const STATUS_META = {
  complete: { label: "Complete", color: "#c4a35a" },
  processing: { label: "Processing", color: "#4a7fcb" },
  draft: { label: "Draft", color: "#6b7a95" },
};

// ─── Waveform visualization ────────────────────────────────────────────────────
function Waveform({ seed, color }) {
  const bars = Array.from({ length: 28 }, (_, i) => ({
    h: 12 + pr(seed * 7.3 + i * 3.71) * 52,
  }));
  return (
    <svg viewBox="0 0 84 64" className={styles.waveform} aria-hidden="true">
      {bars.map((b, i) => (
        <rect
          key={i}
          x={i * 3}
          y={(64 - b.h) / 2}
          width="2"
          height={b.h}
          fill={color}
          opacity="0.45"
          rx="1"
        />
      ))}
    </svg>
  );
}

// ─── Transcript card ───────────────────────────────────────────────────────────
function TranscriptCard({ t }) {
  const meta = STATUS_META[t.status];
  const formattedDate = new Date(t.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className={styles.card} style={{ "--status-color": meta.color }}>
      <div className={styles.cardStatusBar} />

      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span className={styles.courseBadge}>{t.course}</span>
          <span className={styles.metaDivider}>·</span>
          <span className={styles.metaItem}>{formattedDate}</span>
          <span className={styles.metaDivider}>·</span>
          <span className={styles.metaItem}>{t.duration}</span>
          <span className={styles.metaDivider}>·</span>
          <span className={styles.metaItem}>
            {t.words.toLocaleString()} words
          </span>
          <span
            className={`${styles.statusPill} ${styles[`status_${t.status}`]}`}
          >
            <span className={styles.statusDot} />
            {meta.label}
          </span>
        </div>

        <h2 className={styles.cardTitle}>{t.title}</h2>
        <p className={styles.cardExcerpt}>{t.excerpt}</p>

        <div className={styles.cardFooter}>
          <Waveform seed={t.id} color={meta.color} />
          <div className={styles.cardActions}>
            <a href="#" className={styles.actionLink}>
              View
            </a>
            <span className={styles.actionDivider} />
            <a href="#" className={styles.actionLink}>
              Map
            </a>
            <span className={styles.actionDivider} />
            <a href="#" className={styles.actionLinkDanger}>
              Delete
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TranscriptsPage() {
  const counts = {
    complete: TRANSCRIPTS.filter((t) => t.status === "complete").length,
    processing: TRANSCRIPTS.filter((t) => t.status === "processing").length,
    draft: TRANSCRIPTS.filter((t) => t.status === "draft").length,
  };

  return (
    <AuthGuard>
      <div className={styles.page}>
        {/* ── Navigation ── */}
        <NavBar />

        {/* ── Page header ── */}
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderInner}>
            <div className={styles.headerText}>
              <svg
                viewBox="0 0 120 12"
                className={styles.sectionRule}
                aria-hidden="true"
              >
                <line
                  x1="0"
                  y1="6"
                  x2="48"
                  y2="6"
                  stroke="#c4a35a"
                  strokeWidth="0.8"
                  opacity="0.5"
                />
                <circle
                  cx="55"
                  cy="6"
                  r="3"
                  fill="none"
                  stroke="#c4a35a"
                  strokeWidth="1"
                  opacity="0.8"
                />
                <circle cx="60" cy="6" r="1.5" fill="#c4a35a" opacity="0.9" />
                <circle
                  cx="65"
                  cy="6"
                  r="3"
                  fill="none"
                  stroke="#c4a35a"
                  strokeWidth="1"
                  opacity="0.8"
                />
                <line
                  x1="72"
                  y1="6"
                  x2="120"
                  y2="6"
                  stroke="#c4a35a"
                  strokeWidth="0.8"
                  opacity="0.5"
                />
              </svg>
              <h1 className={styles.pageTitle}>Transcripts</h1>
              <p className={styles.pageSubtitle}>
                {TRANSCRIPTS.length} lectures charted &mdash;&nbsp;
                {counts.complete} complete,&nbsp;
                {counts.processing} processing,&nbsp;
                {counts.draft} in draft
              </p>
            </div>
            <div
              className={styles.newBtn}
              onClick={async () => {
                await createTranscript();
              }}
            >
              <svg
                viewBox="0 0 20 20"
                width="16"
                height="16"
                aria-hidden="true"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <line
                  x1="10"
                  y1="6"
                  x2="10"
                  y2="14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <line
                  x1="6"
                  y1="10"
                  x2="14"
                  y2="10"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              New Transcript
            </div>
          </div>
        </header>

        {/* ── Filter bar ── */}
        <div className={styles.filterBar}>
          <div className={styles.filterBarInner}>
            <div className={styles.filterTabs}>
              <button
                className={`${styles.filterTab} ${styles.filterTabActive}`}
              >
                All
              </button>
              <button className={styles.filterTab}>
                <span
                  className={styles.filterDot}
                  style={{ background: "#c4a35a" }}
                />
                Complete{" "}
                <span className={styles.filterCount}>{counts.complete}</span>
              </button>
              <button className={styles.filterTab}>
                <span
                  className={styles.filterDot}
                  style={{ background: "#4a7fcb" }}
                />
                Processing{" "}
                <span className={styles.filterCount}>{counts.processing}</span>
              </button>
              <button className={styles.filterTab}>
                <span
                  className={styles.filterDot}
                  style={{ background: "#6b7a95" }}
                />
                Draft <span className={styles.filterCount}>{counts.draft}</span>
              </button>
            </div>
            <div className={styles.searchWrap}>
              <svg
                viewBox="0 0 16 16"
                width="13"
                height="13"
                className={styles.searchIcon}
                aria-hidden="true"
              >
                <circle
                  cx="6.5"
                  cy="6.5"
                  r="5"
                  fill="none"
                  stroke="#c4a35a"
                  strokeWidth="1.2"
                  opacity="0.6"
                />
                <line
                  x1="10.5"
                  y1="10.5"
                  x2="14.5"
                  y2="14.5"
                  stroke="#c4a35a"
                  strokeWidth="1.2"
                  opacity="0.6"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Search transcripts..."
                className={styles.searchInput}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* ── Transcript list ── */}
        <main className={styles.main}>
          <div className={styles.list}>
            {TRANSCRIPTS.map((t) => (
              <TranscriptCard key={t.id} t={t} />
            ))}
          </div>
        </main>

        {/* ── Footer ── */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <svg
                viewBox="0 0 20 20"
                width="16"
                height="16"
                aria-hidden="true"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="8.5"
                  fill="none"
                  stroke="#c4a35a"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="4.5"
                  fill="none"
                  stroke="#c4a35a"
                  strokeWidth="0.6"
                  opacity="0.4"
                />
                <circle cx="10" cy="10" r="1.5" fill="#c4a35a" opacity="0.7" />
              </svg>
              <span className={styles.footerBrandName}>AstroNotes</span>
            </div>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Privacy</a>
              </li>
            </ul>
            <p className={styles.footerCopy}>&copy; 2026 AstroNotes</p>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
