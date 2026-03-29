"use client";

import { useEffect, useRef, useState } from "react";
import { getExam, generateExam } from "@/app/api/exam";
import styles from "./Exam.module.css";

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
        <circle cx="36" cy="36" r="4" stroke="#c4a35a" strokeWidth="1" opacity="0.5" />
        <g className={styles.compassNeedle}>
          <polygon points="36,36 33.5,36 36,14" fill="#c4a35a" opacity="0.9" />
          <polygon points="36,36 38.5,36 36,58" fill="#c4a35a" opacity="0.3" />
        </g>
        <text x="36" y="9" textAnchor="middle" dominantBaseline="middle" fontSize="6" fontFamily="serif" fill="#c4a35a" opacity="0.55">N</text>
        <text x="36" y="65" textAnchor="middle" dominantBaseline="middle" fontSize="6" fontFamily="serif" fill="#c4a35a" opacity="0.35">S</text>
        <text x="63" y="37" textAnchor="middle" dominantBaseline="middle" fontSize="6" fontFamily="serif" fill="#c4a35a" opacity="0.35">E</text>
        <text x="9" y="37" textAnchor="middle" dominantBaseline="middle" fontSize="6" fontFamily="serif" fill="#c4a35a" opacity="0.35">W</text>
      </svg>
    </div>
  );
}

function parseCorrect(q) {
  if (q.type === "true_false") return new Set([q.correct_answer]);
  if (q.type === "multi_select") {
    try { return new Set(JSON.parse(q.correct_answer)); } catch { return new Set(); }
  }
  return new Set([q.correct_answer]);
}

function QuestionBlock({ q, index, answers, onChange, submitted }) {
  const correct = parseCorrect(q);
  const userAnswer = answers[q.id];

  function isOptionCorrect(val) { return correct.has(val); }
  function isOptionSelected(val) {
    if (q.type === "multi_select") return Array.isArray(userAnswer) && userAnswer.includes(val);
    return userAnswer === val;
  }

  function getOptionClass(val) {
    if (!submitted) return isOptionSelected(val) ? styles.optionSelected : styles.option;
    if (isOptionCorrect(val) && isOptionSelected(val)) return styles.optionCorrect;
    if (isOptionCorrect(val)) return styles.optionMissed;
    if (isOptionSelected(val)) return styles.optionWrong;
    return styles.option;
  }

  function handleChange(val) {
    if (submitted) return;
    if (q.type === "multi_select") {
      const prev = Array.isArray(userAnswer) ? userAnswer : [];
      onChange(q.id, prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
    } else {
      onChange(q.id, val);
    }
  }

  const options = q.type === "true_false" ? ["True", "False"] : q.options;

  return (
    <div className={styles.questionBlock}>
      <p className={styles.questionText}>
        <span className={styles.questionNum}>{index + 1}.</span> {q.question}
        {q.type === "multi_select" && (
          <span className={styles.multiHint}> (select all that apply)</span>
        )}
      </p>
      <div className={styles.optionList}>
        {options.map((opt, oi) => {
          const val = q.type === "true_false" ? opt : String(oi);
          const selected = isOptionSelected(val);
          return (
            <button
              key={oi}
              className={getOptionClass(val)}
              onClick={() => handleChange(val)}
              disabled={submitted}
            >
              <span className={`${styles.optionDot} ${q.type === "multi_select" ? styles.optionDotSquare : ""} ${selected ? styles.optionDotFilled : ""}`} />
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {submitted && (
        <p className={styles.explanation}>
          <span className={styles.explanationLabel}>Explanation: </span>
          {q.explanation}
        </p>
      )}
    </div>
  );
}

function scoreExam(questions, answers) {
  let correct = 0;
  for (const q of questions) {
    const expected = parseCorrect(q);
    const given = answers[q.id];
    if (q.type === "multi_select") {
      const givenSet = new Set(Array.isArray(given) ? given : []);
      if (givenSet.size === expected.size && [...expected].every((v) => givenSet.has(v))) correct++;
    } else {
      if (given === [...expected][0]) correct++;
    }
  }
  return correct;
}

const Rule = () => (
  <svg viewBox="0 0 120 12" className={styles.rule} aria-hidden="true">
    <line x1="0" y1="6" x2="48" y2="6" stroke="#c4a35a" strokeWidth="0.8" opacity="0.4" />
    <circle cx="55" cy="6" r="3" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.7" />
    <circle cx="60" cy="6" r="1.5" fill="#c4a35a" opacity="0.8" />
    <circle cx="65" cy="6" r="3" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.7" />
    <line x1="72" y1="6" x2="120" y2="6" stroke="#c4a35a" strokeWidth="0.8" opacity="0.4" />
  </svg>
);

export default function Exam({ id }) {
  const topRef = useRef(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState("landing");
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getExam(id)
      .then((data) => setExam(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setPhase("landing");
    setAnswers({});
    setScore(null);
    try {
      const data = await generateExam(id);
      setExam(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  function handleStart() {
    setAnswers({});
    setScore(null);
    setPhase("taking");
  }

  function handleAnswer(qId, val) {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  }

  useEffect(() => {
    if (phase === "results") {
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [phase]);

  function handleSubmit() {
    setScore(scoreExam(exam.questions, answers));
    setPhase("results");
  }

  function handleRetake() {
    setAnswers({});
    setScore(null);
    setPhase("taking");
  }

  const generatedAt = exam?.generated_at
    ? new Date(exam.generated_at).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // ── Taking ────────────────────────────────────────────────────────────────
  if (phase === "taking" && exam) {
    const answered = exam.questions.filter((q) => {
      const a = answers[q.id];
      return q.type === "multi_select" ? Array.isArray(a) && a.length > 0 : a != null;
    }).length;

    return (
      <div ref={topRef} className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <Rule />
            <h2 className={styles.title}>Exam</h2>
            <p className={styles.meta}>
              {answered} / {exam.questions.length} answered
            </p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.outlineBtn} onClick={() => setPhase("landing")}>
              Cancel
            </button>
            <button
              className={styles.generateBtn}
              onClick={handleSubmit}
              disabled={answered === 0}
            >
              Submit Exam
            </button>
          </div>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.questionList}>
          {exam.questions.map((q, i) => (
            <QuestionBlock
              key={q.id}
              q={q}
              index={i}
              answers={answers}
              onChange={handleAnswer}
              submitted={false}
            />
          ))}
        </div>
        <div className={styles.submitRow}>
          <button
            className={styles.generateBtn}
            onClick={handleSubmit}
            disabled={answered === 0}
          >
            Submit Exam
          </button>
        </div>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────
  if (phase === "results" && exam) {
    const pct = Math.round((score / exam.questions.length) * 100);
    const grade =
      pct >= 90 ? "Excellent" : pct >= 75 ? "Good" : pct >= 60 ? "Passing" : "Needs Work";

    return (
      <div ref={topRef} className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <Rule />
            <h2 className={styles.title}>Results</h2>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.outlineBtn} onClick={handleRetake}>
              Retake
            </button>
            <button className={styles.outlineBtn} onClick={() => setPhase("landing")}>
              Back
            </button>
            <button
              className={styles.generateBtn}
              onClick={handleGenerate}
              disabled={generating}
            >
              New Exam
            </button>
          </div>
        </div>
        <div className={styles.scoreCard}>
          <div className={styles.scoreBig}>
            {score}
            <span className={styles.scoreTotal}>/{exam.questions.length}</span>
          </div>
          <div className={styles.scorePct}>{pct}%</div>
          <div className={styles.scoreGrade}>{grade}</div>
        </div>
        <div className={styles.questionList}>
          {exam.questions.map((q, i) => (
            <QuestionBlock
              key={q.id}
              q={q}
              index={i}
              answers={answers}
              onChange={() => {}}
              submitted={true}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Landing ───────────────────────────────────────────────────────────────
  return (
    <div ref={topRef} className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Rule />
          <h2 className={styles.title}>Exam</h2>
          {generatedAt && (
            <p className={styles.meta}>
              {exam.questions.length} questions &middot; Generated {generatedAt}
            </p>
          )}
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={generating || loading}
          >
            {generating ? (
              <>
                <span className={styles.spinner} aria-hidden="true" /> Generating&hellip;
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 16 16"
                  width="13"
                  height="13"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M13 8A5 5 0 1 1 8 3"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <polyline
                    points="8,1 11,3 8,5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {exam ? "Regenerate" : "Generate"}
              </>
            )}
          </button>
        </div>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {loading || generating ? (
        <CompassSpinner />
      ) : exam ? (
        <div className={styles.landingReady}>
          <div className={styles.examInfo}>
            <div className={styles.examStat}>
              <span className={styles.examStatNum}>
                {exam.questions.filter((q) => q.type === "multiple_choice").length}
              </span>
              <span className={styles.examStatLabel}>Multiple Choice</span>
            </div>
            <div className={styles.examStatDivider} />
            <div className={styles.examStat}>
              <span className={styles.examStatNum}>
                {exam.questions.filter((q) => q.type === "true_false").length}
              </span>
              <span className={styles.examStatLabel}>True / False</span>
            </div>
            <div className={styles.examStatDivider} />
            <div className={styles.examStat}>
              <span className={styles.examStatNum}>
                {exam.questions.filter((q) => q.type === "multi_select").length}
              </span>
              <span className={styles.examStatLabel}>Multi-Select</span>
            </div>
          </div>
          <button className={styles.startBtn} onClick={handleStart}>
            Begin Exam
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
              <polyline
                points="6,3 11,8 6,13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ) : (
        <div className={styles.empty}>
          <svg viewBox="0 0 48 48" width="40" height="40" fill="none" aria-hidden="true">
            <rect
              x="6"
              y="3"
              width="28"
              height="36"
              rx="2"
              stroke="#c4a35a"
              strokeWidth="1.5"
              opacity="0.4"
            />
            <line
              x1="12"
              y1="13"
              x2="28"
              y2="13"
              stroke="#c4a35a"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.4"
            />
            <line
              x1="12"
              y1="20"
              x2="24"
              y2="20"
              stroke="#c4a35a"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.4"
            />
          </svg>
          <p>No exam yet &mdash; generate one above.</p>
        </div>
      )}
    </div>
  );
}
