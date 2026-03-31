"use client";

import { useRef, useState } from "react";
import { getExam, generateExam } from "@/app/api/exam";
import styles from "./Exam.module.css";
import CompassSpinner from "@/app/components/CompassSpinner";
import { Rule, RegenerateIcon, ChevronRightIcon, ExamEmptyIllustration } from "@/app/components/icons";
import { useToolData, formatGenerated } from "@/app/hooks/useToolData";

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

export default function Exam({ id }) {
  const topRef = useRef(null);
  const { data: exam, loading, generating, error, generate } = useToolData(getExam, generateExam, id);
  const [phase, setPhase] = useState("landing");
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  function handleGenerate() {
    setPhase("landing");
    setAnswers({});
    setScore(null);
    generate();
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

  const generatedAt = formatGenerated(exam?.generated_at);

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
            <Rule className={styles.rule} />
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
            <Rule className={styles.rule} />
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
          <Rule className={styles.rule} />
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
                <RegenerateIcon />
                {exam ? "Regenerate" : "Generate"}
              </>
            )}
          </button>
        </div>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {loading || generating ? (
        <CompassSpinner wrapClassName={styles.compassWrap} svgClassName={styles.compass} />
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
            <ChevronRightIcon width={14} height={14} />
          </button>
        </div>
      ) : (
        <div className={styles.empty}>
          <ExamEmptyIllustration />
          <p>No exam yet &mdash; generate one above.</p>
        </div>
      )}
    </div>
  );
}
