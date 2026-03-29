"use client";

import Link from "next/link";
import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { createTranscript, listTranscripts, listClasses, updateTranscript, deleteTranscript, generateTranscriptDetails } from "../api/transcript";
import NavBar from "../components/NavBar";
import AuthGuard from "../components/AuthGuard";

// ─── Deterministic pseudo-random for waveform bars ────────────────────────────
function pr(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ─── Accent colour from class name ────────────────────────────────────────────
const PALETTE = ["#c4a35a", "#4a7fcb", "#7a6bb0", "#4a9c7a", "#b07060"];
function accentColor(className) {
  if (!className) return "#c4a35a";
  let h = 0;
  for (let i = 0; i < className.length; i++)
    h = (h * 31 + className.charCodeAt(i)) & 0xffff;
  return PALETTE[h % PALETTE.length];
}

// ─── Fuzzy search: every query word must appear in name/summary/class ─────────
function matches(t, query) {
  if (!query.trim()) return true;
  const hay = [t.name, t.ai_summary, t.class_name ?? ""]
    .join(" ")
    .toLowerCase();
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .every((w) => hay.includes(w));
}

// ─── Waveform ─────────────────────────────────────────────────────────────────
function Waveform({ seed, color }) {
  const bars = Array.from({ length: 28 }, (_, i) => ({
    h: 12 + pr(seed * 7.3 + i * 3.71) * 52,
  }));
  return (
    <svg viewBox="0 0 84 64" className={styles.waveform} aria-hidden="true">
      {bars.map((b, i) => (
        <rect
          key={i}
          x={i * 3}
          y={(64 - b.h) / 2}
          width="2"
          height={b.h}
          fill={color}
          opacity="0.45"
          rx="1"
        />
      ))}
    </svg>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────────
function EditModal({ t, classes, onSave, onClose }) {
  const [name, setName] = useState(t.name);
  const [summary, setSummary] = useState(t.ai_summary);
  const [classInput, setClassInput] = useState(t.class_name ?? "");
  const [classOpen, setClassOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const classRef = useRef(null);

  useEffect(() => {
    function onMouseDown(e) {
      if (classRef.current && !classRef.current.contains(e.target)) {
        setClassOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const filteredClasses = classes.filter(
    (c) => c.toLowerCase().includes(classInput.toLowerCase()) && c !== classInput
  );

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      const data = await generateTranscriptDetails(t.id);
      setName(data.name);
      setSummary(data.ai_summary);
    } catch (e) {
      setError(e.message || "Could not generate details.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");
    try {
      const updated = await updateTranscript(t.id, {
        name: name.trim(),
        ai_summary: summary.trim(),
        class_name: classInput.trim() || null,
      });
      onSave(updated);
    } catch (e) {
      setError(e.message || "Could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit Transcript</h2>
          <div className={styles.modalHeaderActions}>
            <button className={styles.modalGenerate} onClick={handleGenerate} disabled={generating || saving}>
              {generating ? "Generating…" : "Generate Details"}
            </button>
            <button className={styles.modalClose} onClick={onClose} aria-label="Close" disabled={generating || saving}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {error && <p className={styles.modalError}>{error}</p>}

        <div className={styles.modalField}>
          <label className={styles.modalLabel}>Name</label>
          <input
            className={styles.modalInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Lecture name"
            disabled={generating || saving}
          />
        </div>

        <div className={styles.modalField}>
          <label className={styles.modalLabel}>Class</label>
          <div className={styles.comboWrap} ref={classRef}>
            <input
              className={styles.modalInput}
              value={classInput}
              onChange={(e) => { setClassInput(e.target.value); setClassOpen(true); }}
              onFocus={() => setClassOpen(true)}
              placeholder="e.g. PHYS 301 — or leave blank"
              autoComplete="off"
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

        <div className={styles.modalField}>
          <label className={styles.modalLabel}>Summary</label>
          <textarea
            className={styles.modalTextarea}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            placeholder="Brief description of the lecture…"
            disabled={generating || saving}
          />
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onClose} disabled={saving || generating}>
            Cancel
          </button>
          <button className={styles.modalSave} onClick={handleSave} disabled={saving || generating}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────
function DeleteModal({ t, onConfirm, onClose, deleting }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Delete Lecture</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
              <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <p className={styles.deleteWarning}>
          This will permanently delete{" "}
          <span className={styles.deleteWarningName}>{t.name}</span>{" "}
          and all associated summaries, flashcards, presentations, and exams. This cannot be undone.
        </p>
        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button className={styles.deleteConfirmBtn} onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Transcript card ──────────────────────────────────────────────────────────
function TranscriptCard({ t, onEdit, onDelete }) {
  const color = accentColor(t.class_name);
  const date = new Date(t.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className={styles.card} style={{ "--status-color": color }}>
      <div className={styles.cardStatusBar} />
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          {t.class_name && (
            <>
              <span className={styles.courseBadge}>{t.class_name}</span>
              <span className={styles.metaDivider}>·</span>
            </>
          )}
          <span className={styles.metaItem}>{date}</span>
        </div>

        <h2 className={styles.cardTitle}>{t.name}</h2>
        <p className={styles.cardExcerpt}>{t.ai_summary}</p>

        <div className={styles.cardFooter}>
          <Waveform seed={t.id} color={color} />
          <div className={styles.cardActions}>
            <button className={styles.deleteBtn} onClick={() => onDelete(t)} aria-label="Delete">
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
                <polyline points="2,4 14,4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className={styles.editBtn} onClick={() => onEdit(t)}>
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
                <path d="M11.5 2.5 L13.5 4.5 L5 13 L2.5 13.5 L3 11 Z"
                  stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round"/>
                <line x1="9.5" y1="4.5" x2="11.5" y2="6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Edit
            </button>
            <Link href={`/dashboard/${t.id}`} className={styles.openBtn}>
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
                <polyline points="6,5.5 10,8 6,10.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round"/>
              </svg>
              Open
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TranscriptsPage() {
  const router = useRouter();
  const [transcripts, setTranscripts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeClass, setActiveClass] = useState(null);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      listTranscripts().catch(() => null),
      listClasses().catch(() => null),
    ]).then(([ts, cs]) => {
        setTranscripts(Array.isArray(ts) ? ts : []);
        setClasses(Array.isArray(cs) ? cs : []);
        setLoading(false);
      }
    );
  }, []);

  const visible = useMemo(
    () =>
      transcripts
        .filter((t) => activeClass === null || t.class_name === activeClass)
        .filter((t) => matches(t, query)),
    [transcripts, activeClass, query]
  );

  async function handleCreate() {
    setCreating(true);
    try {
      const result = await createTranscript();
      if (!result?.id) throw new Error("No transcript ID returned");
      router.push(`/dashboard/${result.id}`);
    } catch (err) {
      alert(`Failed to create transcript: ${err.message}`);
      setCreating(false);
    }
  }

  return (
    <AuthGuard>
      <div className={styles.page}>
        <NavBar />

        {/* ── Page header ── */}
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderInner}>
            <div className={styles.headerText}>
              <svg
                viewBox="0 0 120 12"
                className={styles.sectionRule}
                aria-hidden="true"
              >
                <line x1="0" y1="6" x2="48" y2="6" stroke="#c4a35a" strokeWidth="0.8" opacity="0.5" />
                <circle cx="55" cy="6" r="3" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.8" />
                <circle cx="60" cy="6" r="1.5" fill="#c4a35a" opacity="0.9" />
                <circle cx="65" cy="6" r="3" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.8" />
                <line x1="72" y1="6" x2="120" y2="6" stroke="#c4a35a" strokeWidth="0.8" opacity="0.5" />
              </svg>
              <h1 className={styles.pageTitle}>Transcripts</h1>
              <p className={styles.pageSubtitle}>
                {loading
                  ? "Charting your lectures…"
                  : `${transcripts.length} lecture${transcripts.length !== 1 ? "s" : ""} charted`}
              </p>
            </div>
            <div
              className={styles.newBtn}
              onClick={creating ? undefined : handleCreate}
              style={{ opacity: creating ? 0.6 : 1, cursor: creating ? "not-allowed" : "pointer" }}
            >
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <line x1="10" y1="6" x2="10" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="6" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              {creating ? "Creating…" : "New Transcript"}
            </div>
          </div>
        </header>

        {/* ── Filter bar ── */}
        <div className={styles.filterBar}>
          <div className={styles.filterBarInner}>
            <div className={styles.filterTabs}>
              <button
                className={`${styles.filterTab} ${activeClass === null ? styles.filterTabActive : ""}`}
                onClick={() => setActiveClass(null)}
              >
                All
                {!loading && (
                  <span className={styles.filterCount}>{transcripts.length}</span>
                )}
              </button>
              {classes.map((cls) => (
                <button
                  key={cls}
                  className={`${styles.filterTab} ${activeClass === cls ? styles.filterTabActive : ""}`}
                  onClick={() => setActiveClass(activeClass === cls ? null : cls)}
                >
                  <span
                    className={styles.filterDot}
                    style={{ background: accentColor(cls) }}
                  />
                  {cls}
                  <span className={styles.filterCount}>
                    {transcripts.filter((t) => t.class_name === cls).length}
                  </span>
                </button>
              ))}
            </div>
            <div className={styles.searchWrap}>
              <svg
                viewBox="0 0 16 16"
                width="13"
                height="13"
                className={styles.searchIcon}
                aria-hidden="true"
              >
                <circle cx="6.5" cy="6.5" r="5" fill="none" stroke="#c4a35a" strokeWidth="1.2" opacity="0.6" />
                <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke="#c4a35a" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, summary, class…"
                className={styles.searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── List ── */}
        <main className={styles.main}>
          <div className={styles.list}>
            {loading ? (
              <p className={styles.emptyState}>Charting your lectures…</p>
            ) : visible.length === 0 ? (
              <p className={styles.emptyState}>
                {query || activeClass
                  ? "No transcripts match your search."
                  : "No transcripts yet — create your first one above."}
              </p>
            ) : (
              visible.map((t) => (
                <TranscriptCard key={t.id} t={t} onEdit={setEditTarget} onDelete={setDeleteTarget} />
              ))
            )}
          </div>
        </main>

        {/* ── Footer ── */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                <circle cx="10" cy="10" r="8.5" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.6" />
                <circle cx="10" cy="10" r="4.5" fill="none" stroke="#c4a35a" strokeWidth="0.6" opacity="0.4" />
                <circle cx="10" cy="10" r="1.5" fill="#c4a35a" opacity="0.7" />
              </svg>
              <span className={styles.footerBrandName}>AstroNotes</span>
            </div>
            <ul className={styles.footerLinks}>
              <li><Link href="/">Home</Link></li>
            </ul>
            <p className={styles.footerCopy}>&copy; 2026 AstroNotes</p>
          </div>
        </footer>
      </div>

      {deleteTarget && (
        <DeleteModal
          t={deleteTarget}
          deleting={deleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            setDeleting(true);
            try {
              await deleteTranscript(deleteTarget.id);
              setTranscripts((prev) => prev.filter((t) => t.id !== deleteTarget.id));
              setDeleteTarget(null);
            } catch (e) {
              alert(e.message);
            } finally {
              setDeleting(false);
            }
          }}
        />
      )}

      {editTarget && (
        <EditModal
          t={editTarget}
          classes={classes}
          onClose={() => setEditTarget(null)}
          onSave={(updated) => {
            setTranscripts((prev) =>
              prev.map((t) => (t.id === updated.id ? updated : t))
            );
            // refresh classes list in case a new one was added or removed
            if (updated.class_name && !classes.includes(updated.class_name)) {
              setClasses((prev) => [...prev, updated.class_name].sort());
            }
            setEditTarget(null);
          }}
        />
      )}
    </AuthGuard>
  );
}
