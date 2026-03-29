"use client";

import { useEffect, useRef, useState } from "react";
import { updateTranscript, generateTranscriptDetails } from "@/app/api/transcript";
import { listClasses } from "@/app/api/transcript";
import styles from "./Settings.module.css";

function accentColor(name) {
  if (!name) return "#c4a35a";
  const PALETTE = ["#c4a35a", "#4a7fcb", "#7a6bb0", "#4a9c7a", "#b07060"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return PALETTE[h % PALETTE.length];
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

export default function Settings({ transcript, id }) {
  const [name, setName] = useState(transcript?.name ?? "");
  const [summary, setSummary] = useState(transcript?.ai_summary ?? "");
  const [classInput, setClassInput] = useState(transcript?.class_name ?? "");
  const [classOpen, setClassOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [savedMsg, setSavedMsg] = useState(false);
  const classRef = useRef(null);

  useEffect(() => {
    setName(transcript?.name ?? "");
    setSummary(transcript?.ai_summary ?? "");
    setClassInput(transcript?.class_name ?? "");
  }, [transcript]);

  useEffect(() => {
    listClasses().then(setClasses).catch(() => {});
  }, []);

  useEffect(() => {
    function onMouseDown(e) {
      if (classRef.current && !classRef.current.contains(e.target)) setClassOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const filteredClasses = classes.filter(
    (c) => c.toLowerCase().includes(classInput.toLowerCase()) && c !== classInput
  );

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const data = await generateTranscriptDetails(id);
      setName(data.name);
      setSummary(data.ai_summary);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError(null);
    try {
      await updateTranscript(id, {
        name: name.trim(),
        ai_summary: summary.trim(),
        class_name: classInput.trim() || null,
      });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const busy = saving || generating;

  return (
    <div className={styles.wrap}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <svg viewBox="0 0 120 12" className={styles.rule} aria-hidden="true">
            <line x1="0" y1="6" x2="48" y2="6" stroke="#c4a35a" strokeWidth="0.8" opacity="0.4" />
            <circle cx="55" cy="6" r="3" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.7" />
            <circle cx="60" cy="6" r="1.5" fill="#c4a35a" opacity="0.8" />
            <circle cx="65" cy="6" r="3" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.7" />
            <line x1="72" y1="6" x2="120" y2="6" stroke="#c4a35a" strokeWidth="0.8" opacity="0.4" />
          </svg>
          <h2 className={styles.title}>Settings</h2>
          <p className={styles.meta}>Edit lecture details</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.generateBtn} onClick={handleGenerate} disabled={busy}>
            {generating ? (
              <><span className={styles.spinner} aria-hidden="true" /> Generating&hellip;</>
            ) : (
              <>
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Generate Details
              </>
            )}
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {generating ? (
        <CompassSpinner />
      ) : (
        <div className={styles.form}>
          {/* Name */}
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lecture name"
              disabled={busy}
            />
          </div>

          {/* Class combobox */}
          <div className={styles.field}>
            <label className={styles.label}>Class</label>
            <div className={styles.comboWrap} ref={classRef}>
              <input
                className={styles.input}
                value={classInput}
                onChange={(e) => { setClassInput(e.target.value); setClassOpen(true); }}
                onFocus={() => setClassOpen(true)}
                placeholder="e.g. PHYS 301 — or leave blank"
                autoComplete="off"
                disabled={busy}
              />
              {classOpen && filteredClasses.length > 0 && (
                <ul className={styles.comboDropdown}>
                  {filteredClasses.map((c) => (
                    <li
                      key={c}
                      className={styles.comboOption}
                      onMouseDown={(e) => { e.preventDefault(); setClassInput(c); setClassOpen(false); }}
                    >
                      <span className={styles.comboDot} style={{ background: accentColor(c) }} />
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className={styles.field}>
            <label className={styles.label}>Summary</label>
            <textarea
              className={styles.textarea}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={5}
              placeholder="Brief description of the lecture…"
              disabled={busy}
            />
          </div>

          {/* Save */}
          <div className={styles.actions}>
            {savedMsg && <span className={styles.savedMsg}>Saved</span>}
            <button className={styles.saveBtn} onClick={handleSave} disabled={busy}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
