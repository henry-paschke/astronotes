"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getSummary, generateSummary } from "@/app/api/summary";
import styles from "./Summary.module.css";

export default function Summary({ id }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getSummary(id)
      .then((data) => setSummary(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const data = await generateSummary(id);
      setSummary(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  const generatedAt = summary?.generated_at
    ? new Date(summary.generated_at).toLocaleString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <svg viewBox="0 0 120 12" className={styles.rule} aria-hidden="true">
            <line x1="0" y1="6" x2="48" y2="6" stroke="#c4a35a" strokeWidth="0.8" opacity="0.4" />
            <circle cx="55" cy="6" r="3" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.7" />
            <circle cx="60" cy="6" r="1.5" fill="#c4a35a" opacity="0.8" />
            <circle cx="65" cy="6" r="3" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.7" />
            <line x1="72" y1="6" x2="120" y2="6" stroke="#c4a35a" strokeWidth="0.8" opacity="0.4" />
          </svg>
          <h2 className={styles.title}>Summary</h2>
          {generatedAt && (
            <p className={styles.meta}>Generated {generatedAt}</p>
          )}
        </div>
        <button
          className={styles.generateBtn}
          onClick={handleGenerate}
          disabled={generating || loading}
        >
          {generating ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Generating…
            </>
          ) : (
            <>
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
                <path d="M13 8A5 5 0 1 1 8 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <polyline points="8,1 11,3 8,5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {summary ? "Regenerate" : "Generate"}
            </>
          )}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading || generating ? (
        <div className={styles.compassWrap}>
          <svg className={styles.compass} viewBox="0 0 72 72" fill="none" aria-hidden="true">
            <g className={styles.compassRing}>
              <circle cx="36" cy="36" r="33" stroke="#c4a35a" strokeWidth="0.8" opacity="0.25" />
              {Array.from({ length: 24 }, (_, i) => {
                const a = (i / 24) * Math.PI * 2;
                const major = i % 6 === 0;
                const r0 = major ? 29 : 30.5;
                return (
                  <line
                    key={i}
                    x1={36 + r0 * Math.cos(a)} y1={36 + r0 * Math.sin(a)}
                    x2={36 + 33 * Math.cos(a)} y2={36 + 33 * Math.sin(a)}
                    stroke="#c4a35a" strokeWidth={major ? 1.2 : 0.6}
                    opacity={major ? 0.7 : 0.35} strokeLinecap="round"
                  />
                );
              })}
            </g>
            <circle cx="36" cy="36" r="22" stroke="#c4a35a" strokeWidth="0.6" opacity="0.18" />
            <circle cx="36" cy="36" r="4"  stroke="#c4a35a" strokeWidth="1"   opacity="0.5" />
            <g className={styles.compassNeedle}>
              <polygon points="36,36 33.5,36 36,14" fill="#c4a35a" opacity="0.9" />
              <polygon points="36,36 38.5,36 36,58" fill="#c4a35a" opacity="0.3" />
            </g>
            <text x="36" y="9"  textAnchor="middle" dominantBaseline="middle" fontSize="6" fontFamily="serif" fill="#c4a35a" opacity="0.55">N</text>
            <text x="36" y="65" textAnchor="middle" dominantBaseline="middle" fontSize="6" fontFamily="serif" fill="#c4a35a" opacity="0.35">S</text>
            <text x="63" y="37" textAnchor="middle" dominantBaseline="middle" fontSize="6" fontFamily="serif" fill="#c4a35a" opacity="0.35">E</text>
            <text x="9"  y="37" textAnchor="middle" dominantBaseline="middle" fontSize="6" fontFamily="serif" fill="#c4a35a" opacity="0.35">W</text>
          </svg>
        </div>
      ) : (
        <div className={styles.body}>
          {summary ? (
            <div className={styles.markdown}>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className={styles.mdH1}>{children}</h1>,
                  h2: ({ children }) => <h2 className={styles.mdH2}>{children}</h2>,
                  h3: ({ children }) => <h3 className={styles.mdH3}>{children}</h3>,
                  p:  ({ children }) => <p  className={styles.mdP}>{children}</p>,
                  ul: ({ children }) => <ul className={styles.mdUl}>{children}</ul>,
                  ol: ({ children }) => <ol className={styles.mdOl}>{children}</ol>,
                  li: ({ children }) => <li className={styles.mdLi}>{children}</li>,
                  strong: ({ children }) => <strong className={styles.mdStrong}>{children}</strong>,
                  em: ({ children }) => <em className={styles.mdEm}>{children}</em>,
                  hr: () => <hr className={styles.mdHr} />,
                }}
              >
                {summary.content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className={styles.empty}>
              <svg viewBox="0 0 48 48" width="40" height="40" fill="none" aria-hidden="true">
                <rect x="8" y="6" width="32" height="36" rx="3" stroke="#c4a35a" strokeWidth="1.2" opacity="0.3"/>
                <line x1="15" y1="16" x2="33" y2="16" stroke="#c4a35a" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
                <line x1="15" y1="22" x2="33" y2="22" stroke="#c4a35a" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
                <line x1="15" y1="28" x2="26" y2="28" stroke="#c4a35a" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
              </svg>
              <p>No summary yet — generate one above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
