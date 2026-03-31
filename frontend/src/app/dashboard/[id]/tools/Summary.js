"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getSummary, generateSummary } from "@/app/api/summary";
import styles from "./Summary.module.css";
import CompassSpinner from "@/app/components/CompassSpinner";
import { Rule, RegenerateIcon, SummaryEmptyIllustration } from "@/app/components/icons";

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
          <Rule className={styles.rule} />
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
              <RegenerateIcon />
              {summary ? "Regenerate" : "Generate"}
            </>
          )}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading || generating ? (
        <div className={styles.compassWrap}>
          <CompassSpinner svgClassName={styles.compass} />
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
              <SummaryEmptyIllustration />
              <p>No summary yet — generate one above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
