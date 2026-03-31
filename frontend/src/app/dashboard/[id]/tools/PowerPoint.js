"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getPresentation, generatePresentation } from "@/app/api/presentation";
import styles from "./Presentation.module.css";
import CompassSpinner from "@/app/components/CompassSpinner";
import { Rule, RegenerateIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon, PresentScreenIcon, PresentationEmptyIllustration } from "@/app/components/icons";

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
        <ChevronLeftIcon width={20} height={20} />
      </button>
      <button
        className={`${styles.presentArrow} ${styles.presentArrowRight}`}
        onClick={() => setIndex(i => Math.min(slides.length - 1, i + 1))}
        disabled={index === slides.length - 1}
        aria-label="Next slide"
      >
        <ChevronRightIcon width={20} height={20} />
      </button>

      {/* Exit */}
      <button className={styles.presentExit} onClick={onExit} aria-label="Exit presentation">
        <CloseIcon width={14} height={14} />
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
          <Rule className={styles.rule} />
          <h2 className={styles.title}>Presentation</h2>
          {generatedAt && <p className={styles.meta}>{pres.slides.length} slides · Generated {generatedAt}</p>}
        </div>
        <div className={styles.headerActions}>
          {pres && (
            <button className={styles.presentBtn} onClick={() => setPresenting(true)} disabled={generating}>
              <PresentScreenIcon width={12} height={12} />
              Present
            </button>
          )}
          <button className={styles.generateBtn} onClick={handleGenerate} disabled={generating || loading}>
            {generating ? (
              <><span className={styles.spinner} aria-hidden="true" /> Generating…</>
            ) : (
              <>
                <RegenerateIcon />
                {pres ? "Regenerate" : "Generate"}
              </>
            )}
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading || generating ? (
        <CompassSpinner wrapClassName={styles.compassWrap} svgClassName={styles.compass} />
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
          <PresentationEmptyIllustration />
          <p>No presentation yet — generate one above.</p>
        </div>
      )}
    </div>
  );
}
