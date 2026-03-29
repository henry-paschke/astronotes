"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getPresentation, generatePresentation } from "@/app/api/presentation";
import styles from "./Presentation.module.css";

// ── Shared compass spinner ────────────────────────────────────────────────────
function CompassSpinner() {
  return (
    <div className={styles.compassWrap}>
      <svg className={styles.compass} viewBox="0 0 72 72" fill="none" aria-hidden="true">
        <g className={styles.compassRing}>
          <circle cx="36" cy="36" r="33" stroke="#c4a35a" strokeWidth="0.8" opacity="0.25" />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const major = i % 6 === 0;
            const r0 = major ? 29 : 30.5;
            return (
              <line key={i}
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
  );
}

// ── Slide content renderer ────────────────────────────────────────────────────
function SlideContent({ slide }) {
  return (
    <div className={styles.slideLayout}>
      <div className={styles.slideTextArea}>
        <h2 className={styles.slideTitle}>{slide.title}</h2>
        <div className={styles.slideBody}>
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
            }}
          >
            {slide.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

// ── Present mode (fullscreen overlay) ────────────────────────────────────────
function PresentMode({ slides, onExit }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        setIndex(i => Math.min(slides.length - 1, i + 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        setIndex(i => Math.max(0, i - 1));
      if (e.key === "Escape") onExit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length, onExit]);

  const slide = slides[index];

  return (
    <div className={styles.presentOverlay}>
      <SlideContent slide={slide} large />

      {/* Progress dots */}
      <div className={styles.presentDots}>
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Nav arrows */}
      <button
        className={`${styles.presentArrow} ${styles.presentArrowLeft}`}
        onClick={() => setIndex(i => Math.max(0, i - 1))}
        disabled={index === 0}
        aria-label="Previous slide"
      >
        <svg viewBox="0 0 16 16" width="20" height="20" fill="none">
          <polyline points="10,3 5,8 10,13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button
        className={`${styles.presentArrow} ${styles.presentArrowRight}`}
        onClick={() => setIndex(i => Math.min(slides.length - 1, i + 1))}
        disabled={index === slides.length - 1}
        aria-label="Next slide"
      >
        <svg viewBox="0 0 16 16" width="20" height="20" fill="none">
          <polyline points="6,3 11,8 6,13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Exit */}
      <button className={styles.presentExit} onClick={onExit} aria-label="Exit presentation">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
          <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Exit
      </button>

      {/* Slide counter */}
      <span className={styles.presentCounter}>{index + 1} / {slides.length}</span>
    </div>
  );
}

// ── Browse thumbnail ──────────────────────────────────────────────────────────
function SlideThumbnail({ slide, index, active, onClick }) {
  return (
    <button className={`${styles.thumbnail} ${active ? styles.thumbnailActive : ""}`} onClick={onClick}>
      <span className={styles.thumbNumber}>{index + 1}</span>
      <span className={styles.thumbTitle}>{slide.title}</span>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PowerPoint({ id }) {
  const [pres, setPres] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [presenting, setPresenting] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPresentation(id)
      .then(data => setPres(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setActiveSlide(0);
    try {
      const data = await generatePresentation(id);
      setPres(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  const generatedAt = pres?.generated_at
    ? new Date(pres.generated_at).toLocaleString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  if (presenting && pres) {
    return <PresentMode slides={pres.slides} onExit={() => setPresenting(false)} />;
  }

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <svg viewBox="0 0 120 12" className={styles.rule} aria-hidden="true">
            <line x1="0" y1="6" x2="48" y2="6" stroke="#c4a35a" strokeWidth="0.8" opacity="0.4" />
            <circle cx="55" cy="6" r="3" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.7" />
            <circle cx="60" cy="6" r="1.5" fill="#c4a35a" opacity="0.8" />
            <circle cx="65" cy="6" r="3" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.7" />
            <line x1="72" y1="6" x2="120" y2="6" stroke="#c4a35a" strokeWidth="0.8" opacity="0.4" />
          </svg>
          <h2 className={styles.title}>Presentation</h2>
          {generatedAt && <p className={styles.meta}>{pres.slides.length} slides · Generated {generatedAt}</p>}
        </div>
        <div className={styles.headerActions}>
          {pres && (
            <button className={styles.presentBtn} onClick={() => setPresenting(true)} disabled={generating}>
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
                <rect x="1" y="2" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="8" y1="12" x2="8" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="5" y1="15" x2="11" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <polyline points="6,5 10,7 6,9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              Present
            </button>
          )}
          <button className={styles.generateBtn} onClick={handleGenerate} disabled={generating || loading}>
            {generating ? (
              <><span className={styles.spinner} aria-hidden="true" /> Generating…</>
            ) : (
              <>
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
                  <path d="M13 8A5 5 0 1 1 8 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <polyline points="8,1 11,3 8,5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {pres ? "Regenerate" : "Generate"}
              </>
            )}
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading || generating ? (
        <CompassSpinner />
      ) : pres ? (
        <div className={styles.browseLayout}>
          {/* Slide list */}
          <div className={styles.thumbList}>
            {pres.slides.map((slide, i) => (
              <SlideThumbnail
                key={slide.id}
                slide={slide}
                index={i}
                active={i === activeSlide}
                onClick={() => setActiveSlide(i)}
              />
            ))}
          </div>
          {/* Active slide preview */}
          <div className={styles.preview}>
            <SlideContent slide={pres.slides[activeSlide]} />
          </div>
        </div>
      ) : (
        <div className={styles.empty}>
          <svg viewBox="0 0 48 48" width="40" height="40" fill="none" aria-hidden="true">
            <rect x="3" y="7" width="42" height="28" rx="2" stroke="#c4a35a" strokeWidth="1.2" opacity="0.3"/>
            <line x1="24" y1="35" x2="24" y2="42" stroke="#c4a35a" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/>
            <line x1="15" y1="42" x2="33" y2="42" stroke="#c4a35a" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/>
          </svg>
          <p>No presentation yet — generate one above.</p>
        </div>
      )}
    </div>
  );
}
