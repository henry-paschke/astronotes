"use client";

import ReactMarkdown from "react-markdown";
import { getSummary, generateSummary } from "@/app/api/summary";
import styles from "./Summary.module.css";
import CompassSpinner from "@/app/components/CompassSpinner";
import { Rule, RegenerateIcon, SummaryEmptyIllustration } from "@/app/components/icons";
import { useToolData, formatGenerated } from "@/app/hooks/useToolData";

export default function Summary({ id }) {
  const { data: summary, loading, generating, error, generate } = useToolData(getSummary, generateSummary, id);
  const generatedAt = formatGenerated(summary?.generated_at);

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
          onClick={generate}
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
