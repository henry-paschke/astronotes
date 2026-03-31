"use client";

import { useEffect, useRef, useState } from "react";
import { updateTranscript, generateTranscriptDetails } from "@/app/api/transcript";
import { listClasses } from "@/app/api/transcript";
import styles from "./Settings.module.css";
import CompassSpinner from "@/app/components/CompassSpinner";
import { Rule, ClockIcon } from "@/app/components/icons";

function accentColor(name) {
  if (!name) return "#c4a35a";
  const PALETTE = ["#c4a35a", "#4a7fcb", "#7a6bb0", "#4a9c7a", "#b07060"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return PALETTE[h % PALETTE.length];
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
          <Rule className={styles.rule} />
          <h2 className={styles.title}>Settings</h2>
          <p className={styles.meta}>Edit lecture details</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.generateBtn} onClick={handleGenerate} disabled={busy}>
            {generating ? (
              <><span className={styles.spinner} aria-hidden="true" /> Generating&hellip;</>
            ) : (
              <>
                <ClockIcon width={13} height={13} />
                Generate Details
              </>
            )}
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {generating ? (
        <CompassSpinner wrapClassName={styles.compassWrap} svgClassName={styles.compass} />
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
