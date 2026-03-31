"use client";

import { useState } from "react";
import { getFlashcards, generateFlashcards } from "@/app/api/flashcards";
import styles from "./Flashcards.module.css";
import CompassSpinner from "@/app/components/CompassSpinner";
import { Rule, RegenerateIcon, ChevronLeftIcon, ChevronRightIcon, ShuffleIcon, PlayCircleIcon, FlashcardsEmptyIllustration } from "@/app/components/icons";
import { useToolData, formatGenerated } from "@/app/hooks/useToolData";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
          <ChevronLeftIcon width={12} height={12} />
          Browse
        </button>
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${((index + 1) / deck.length) * 100}%` }} />
          </div>
          <span className={styles.progressLabel}>{index + 1} / {deck.length}</span>
        </div>
        <button className={styles.shuffleBtn} onClick={handleShuffle}>
          <ShuffleIcon width={12} height={12} />
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
          <ChevronLeftIcon width={14} height={14} />
          Prev
        </button>
        <button className={styles.navBtn} onClick={handleNext} disabled={index === deck.length - 1}>
          Next
          <ChevronRightIcon width={14} height={14} />
        </button>
      </div>
    </div>
  );
}

export default function Flashcards({ id }) {
  const { data: set, loading, generating, error, generate } = useToolData(getFlashcards, generateFlashcards, id);
  const [mode, setMode] = useState("browse"); // "browse" | "quiz"
  const generatedAt = formatGenerated(set?.generated_at);

  function handleGenerate() {
    setMode("browse");
    generate();
  }

  if (mode === "quiz" && set) {
    return <QuizMode cards={set.cards} onExit={() => setMode("browse")} />;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Rule className={styles.rule} />
          <h2 className={styles.title}>Flashcards</h2>
          {generatedAt && <p className={styles.meta}>{set.cards.length} cards · Generated {generatedAt}</p>}
        </div>
        <div className={styles.headerActions}>
          {set && (
            <button className={styles.quizBtn} onClick={() => setMode("quiz")} disabled={generating}>
              <PlayCircleIcon width={12} height={12} />
              Quiz Me
            </button>
          )}
          <button className={styles.generateBtn} onClick={handleGenerate} disabled={generating || loading}>
            {generating ? (
              <><span className={styles.spinner} aria-hidden="true" /> Generating…</>
            ) : (
              <>
                <RegenerateIcon />
                {set ? "Regenerate" : "Generate"}
              </>
            )}
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading || generating ? (
        <CompassSpinner wrapClassName={styles.compassWrap} svgClassName={styles.compass} />
      ) : set ? (
        <div className={styles.grid}>
          {set.cards.map(card => <FlipCard key={card.id} card={card} />)}
        </div>
      ) : (
        <div className={styles.empty}>
          <FlashcardsEmptyIllustration />
          <p>No flashcards yet — generate a set above.</p>
        </div>
      )}
    </div>
  );
}
