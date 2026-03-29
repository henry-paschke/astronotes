"use client";

import { useEffect, useState, useCallback } from "react";
import { getFlashcards, generateFlashcards } from "@/app/api/flashcards";
import styles from "./Flashcards.module.css";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

function FlipCard({ card }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={styles.flipOuter} onClick={() => setFlipped(f => !f)}>
      <div className={`${styles.flipInner} ${flipped ? styles.flipped : ""}`}>
        <div className={styles.flipFront}>
          <span className={styles.cardSide}>Q</span>
          <p className={styles.cardText}>{card.question}</p>
        </div>
        <div className={styles.flipBack}>
          <span className={styles.cardSide}>A</span>
          <p className={styles.cardText}>{card.answer}</p>
        </div>
      </div>
    </div>
  );
}

function QuizMode({ cards, onExit }) {
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = deck[index];

  function handleShuffle() {
    setDeck(shuffle(cards));
    setIndex(0);
    setFlipped(false);
  }

  function handlePrev() {
    setIndex(i => Math.max(0, i - 1));
    setFlipped(false);
  }

  function handleNext() {
    setIndex(i => Math.min(deck.length - 1, i + 1));
    setFlipped(false);
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft")  handlePrev();
      if (e.key === " ")          setFlipped(f => !f);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deck.length, index]);

  return (
    <div className={styles.quiz}>
      <div className={styles.quizTop}>
        <button className={styles.exitBtn} onClick={onExit}>
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
            <polyline points="10,3 5,8 10,13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Browse
        </button>
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${((index + 1) / deck.length) * 100}%` }} />
          </div>
          <span className={styles.progressLabel}>{index + 1} / {deck.length}</span>
        </div>
        <button className={styles.shuffleBtn} onClick={handleShuffle}>
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
            <polyline points="1,5 4,5 7,11 12,11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="10,9 12,11 10,13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="1,11 4,11 7,5 12,5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="10,3 12,5 10,7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Shuffle
        </button>
      </div>

      <div className={styles.quizCard} onClick={() => setFlipped(f => !f)}>
        <div className={`${styles.quizInner} ${flipped ? styles.flipped : ""}`}>
          <div className={styles.quizFront}>
            <span className={styles.quizSide}>Question</span>
            <p className={styles.quizText}>{current.question}</p>
            <span className={styles.quizHint}>Click or press Space to reveal</span>
          </div>
          <div className={styles.quizBack}>
            <span className={styles.quizSide}>Answer</span>
            <p className={styles.quizText}>{current.answer}</p>
          </div>
        </div>
      </div>

      <div className={styles.quizNav}>
        <button className={styles.navBtn} onClick={handlePrev} disabled={index === 0}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <polyline points="10,3 5,8 10,13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Prev
        </button>
        <button className={styles.navBtn} onClick={handleNext} disabled={index === deck.length - 1}>
          Next
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <polyline points="6,3 11,8 6,13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Flashcards({ id }) {
  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("browse"); // "browse" | "quiz"

  useEffect(() => {
    setLoading(true);
    setError(null);
    getFlashcards(id)
      .then(data => setSet(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setMode("browse");
    try {
      const data = await generateFlashcards(id);
      setSet(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  const generatedAt = set?.generated_at
    ? new Date(set.generated_at).toLocaleString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  if (mode === "quiz" && set) {
    return <QuizMode cards={set.cards} onExit={() => setMode("browse")} />;
  }

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
          <h2 className={styles.title}>Flashcards</h2>
          {generatedAt && <p className={styles.meta}>{set.cards.length} cards · Generated {generatedAt}</p>}
        </div>
        <div className={styles.headerActions}>
          {set && (
            <button className={styles.quizBtn} onClick={() => setMode("quiz")} disabled={generating}>
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
                <polyline points="6,5.5 10,8 6,10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Quiz Me
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
                {set ? "Regenerate" : "Generate"}
              </>
            )}
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading || generating ? (
        <CompassSpinner />
      ) : set ? (
        <div className={styles.grid}>
          {set.cards.map(card => <FlipCard key={card.id} card={card} />)}
        </div>
      ) : (
        <div className={styles.empty}>
          <svg viewBox="0 0 48 48" width="40" height="40" fill="none" aria-hidden="true">
            <rect x="2" y="12" width="28" height="20" rx="2" stroke="#c4a35a" strokeWidth="1.2" opacity="0.2"/>
            <rect x="8" y="7" width="28" height="20" rx="2" stroke="#c4a35a" strokeWidth="1.2" opacity="0.3"/>
            <rect x="14" y="16" width="28" height="20" rx="2" stroke="#c4a35a" strokeWidth="1.5" opacity="0.4"/>
          </svg>
          <p>No flashcards yet — generate a set above.</p>
        </div>
      )}
    </div>
  );
}
