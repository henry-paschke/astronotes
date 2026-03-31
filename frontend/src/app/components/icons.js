// ─── AstroNotes icon library ──────────────────────────────────────────────────
// All SVG icons in one place. Import what you need.

// ── Branding ──────────────────────────────────────────────────────────────────

/** Rotating astrolabe logo mark (28×28). Used in NavBar. */
export function LogoMark({ className = "" }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <circle cx="14" cy="14" r="12" fill="none" stroke="#c4a35a" strokeWidth="1.2"
        strokeDasharray="60 15.4"
        style={{ transformOrigin: "14px 14px", animation: "rotateSlow 18s linear infinite" }} />
      <circle cx="14" cy="14" r="7" fill="none" stroke="#c4a35a" strokeWidth="0.7" opacity="0.6"
        strokeDasharray="36 8"
        style={{ transformOrigin: "14px 14px", animation: "rotateReverse 12s linear infinite" }} />
      <line x1="14" y1="2" x2="14" y2="26" stroke="#c4a35a" strokeWidth="0.7" opacity="0.45" />
      <line x1="2" y1="14" x2="26" y2="14" stroke="#c4a35a" strokeWidth="0.7" opacity="0.45" />
      <circle cx="14" cy="14" r="2" fill="#e8c878" />
    </svg>
  );
}

/** Larger rotating astrolabe mark (56×56). Used on auth pages. */
export function AstrolabeMark({ className = "" }) {
  return (
    <svg viewBox="0 0 56 56" className={className} aria-hidden="true">
      <circle cx="28" cy="28" r="25" fill="none" stroke="#c4a35a" strokeWidth="1"
        strokeDasharray="60 15" opacity="0.6"
        style={{ transformOrigin: "28px 28px", animation: "rotateSlow 18s linear infinite" }} />
      <circle cx="28" cy="28" r="16" fill="none" stroke="#c4a35a" strokeWidth="0.7"
        strokeDasharray="30 8" opacity="0.45"
        style={{ transformOrigin: "28px 28px", animation: "rotateReverse 12s linear infinite" }} />
      <line x1="28" y1="3" x2="28" y2="53" stroke="#c4a35a" strokeWidth="0.5" opacity="0.3" />
      <line x1="3" y1="28" x2="53" y2="28" stroke="#c4a35a" strokeWidth="0.5" opacity="0.3" />
      <circle cx="28" cy="28" r="3.5" fill="#c4a35a" opacity="0.7" />
      <circle cx="28" cy="28" r="1.5" fill="#e8c878" />
    </svg>
  );
}

/** Tiny 3-ring astrolabe (20×20). Used in footers. */
export function FooterAstrolabe() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.6" />
      <circle cx="10" cy="10" r="4.5" fill="none" stroke="#c4a35a" strokeWidth="0.6" opacity="0.4" />
      <circle cx="10" cy="10" r="1.5" fill="#c4a35a" opacity="0.7" />
    </svg>
  );
}

// ── Decorative dividers ────────────────────────────────────────────────────────

/** Gold —◦●◦— rule (120×12). Used in all tool headers and page headers. */
export function Rule({ className = "" }) {
  return (
    <svg viewBox="0 0 120 12" className={className} aria-hidden="true">
      <line x1="0" y1="6" x2="48" y2="6" stroke="#c4a35a" strokeWidth="0.8" opacity="0.4" />
      <circle cx="55" cy="6" r="3" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.7" />
      <circle cx="60" cy="6" r="1.5" fill="#c4a35a" opacity="0.8" />
      <circle cx="65" cy="6" r="3" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.7" />
      <line x1="72" y1="6" x2="120" y2="6" stroke="#c4a35a" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

/** Shorter gold rule (80×10). Used on auth card headers. */
export function AuthRule({ className = "" }) {
  return (
    <svg viewBox="0 0 80 10" className={className} aria-hidden="true">
      <line x1="0" y1="5" x2="32" y2="5" stroke="#c4a35a" strokeWidth="0.7" opacity="0.4" />
      <circle cx="38" cy="5" r="2.5" fill="none" stroke="#c4a35a" strokeWidth="0.8" opacity="0.7" />
      <circle cx="40" cy="5" r="1.2" fill="#c4a35a" opacity="0.85" />
      <circle cx="42" cy="5" r="2.5" fill="none" stroke="#c4a35a" strokeWidth="0.8" opacity="0.7" />
      <line x1="48" y1="5" x2="80" y2="5" stroke="#c4a35a" strokeWidth="0.7" opacity="0.4" />
    </svg>
  );
}

// ── Dashboard sidebar tool icons ───────────────────────────────────────────────

export function MindMapIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="4" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="28" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="4" cy="24" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="28" cy="24" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="16" cy="2" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="16" cy="30" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="12.5" y1="13.5" x2="6" y2="9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="19.5" y1="13.5" x2="26" y2="9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="12.5" y1="18.5" x2="6" y2="22.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="19.5" y1="18.5" x2="26" y2="22.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="16" y1="12" x2="16" y2="4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="16" y1="20" x2="16" y2="27.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function SummaryIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="22" height="26" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="10" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="10" y1="20" x2="18" y2="20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function FlashcardsIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="2" y="8" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <rect x="5" y="5" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      <rect x="8" y="11" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14" y1="19" x2="24" y2="19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14" y1="22" x2="21" y2="22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function PresentationIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="26" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="16" y1="23" x2="16" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="28" x2="22" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="8" y="9" width="7" height="10" rx="1" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="18" y1="11" x2="24" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="18" y1="14" x2="24" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="18" y1="17" x2="22" y2="17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ExamIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="6" y="3" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="10" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="21" cy="22" r="4.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="18.8" y1="22" x2="23.2" y2="22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="21" y1="19.8" x2="21" y2="24.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function ChatbotIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M4 6 Q4 3 7 3 H25 Q28 3 28 6 V18 Q28 21 25 21 H18 L12 27 V21 H7 Q4 21 4 18 Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="11" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="16" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="21" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="3.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 4.5v3M16 24.5v3M4.5 16h3M24.5 16h3M7.9 7.9l2.1 2.1M22 22l2.1 2.1M7.9 24.1l2.1-2.1M22 10l2.1-2.1"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// ── Action / UI icons ──────────────────────────────────────────────────────────

/** Circular arrow — regenerate / refresh. */
export function RegenerateIcon({ width = 13, height = 13 }) {
  return (
    <svg viewBox="0 0 16 16" width={width} height={height} fill="none" aria-hidden="true">
      <path d="M13 8A5 5 0 1 1 8 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <polyline points="8,1 11,3 8,5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** X / close button. */
export function CloseIcon({ width = 14, height = 14 }) {
  return (
    <svg viewBox="0 0 16 16" width={width} height={height} fill="none" aria-hidden="true">
      <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Left chevron < */
export function ChevronLeftIcon({ width = 14, height = 14 }) {
  return (
    <svg viewBox="0 0 16 16" width={width} height={height} fill="none" aria-hidden="true">
      <polyline points="10,3 5,8 10,13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Right chevron > */
export function ChevronRightIcon({ width = 14, height = 14 }) {
  return (
    <svg viewBox="0 0 16 16" width={width} height={height} fill="none" aria-hidden="true">
      <polyline points="6,3 11,8 6,13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Two-arrow shuffle icon. */
export function ShuffleIcon({ width = 12, height = 12 }) {
  return (
    <svg viewBox="0 0 16 16" width={width} height={height} fill="none" aria-hidden="true">
      <polyline points="1,5 4,5 7,11 12,11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="10,9 12,11 10,13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="1,11 4,11 7,5 12,5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="10,3 12,5 10,7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Circle with play triangle — open / quiz me / start. */
export function PlayCircleIcon({ width = 12, height = 12 }) {
  return (
    <svg viewBox="0 0 16 16" width={width} height={height} fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <polyline points="6,5.5 10,8 6,10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Send arrow →. */
export function SendIcon({ width = 16, height = 16 }) {
  return (
    <svg viewBox="0 0 16 16" width={width} height={height} fill="none" aria-hidden="true">
      <line x1="2" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <polyline points="9,4 13,8 9,12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Monitor/screen with play button. Used in PowerPoint "Present" button. */
export function PresentScreenIcon({ width = 12, height = 12 }) {
  return (
    <svg viewBox="0 0 16 16" width={width} height={height} fill="none" aria-hidden="true">
      <rect x="1" y="2" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="8" y1="12" x2="8" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="15" x2="11" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <polyline points="6,5 10,7 6,9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Clock icon. Used in Settings "Generate Details" button. */
export function ClockIcon({ width = 13, height = 13 }) {
  return (
    <svg viewBox="0 0 16 16" width={width} height={height} fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Circle with + inside. */
export function PlusCircleIcon({ width = 16, height = 16 }) {
  return (
    <svg viewBox="0 0 20 20" width={width} height={height} aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <line x1="10" y1="6" x2="10" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="6" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Magnifying glass search. */
export function SearchIcon({ width = 13, height = 13, className = "" }) {
  return (
    <svg viewBox="0 0 16 16" width={width} height={height} className={className} aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5" fill="none" stroke="#c4a35a" strokeWidth="1.2" opacity="0.6" />
      <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke="#c4a35a" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
    </svg>
  );
}

/** Trash / delete. */
export function DeleteIcon({ width = 12, height = 12 }) {
  return (
    <svg viewBox="0 0 16 16" width={width} height={height} fill="none" aria-hidden="true">
      <polyline points="2,4 14,4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Pencil / edit. */
export function EditIcon({ width = 12, height = 12 }) {
  return (
    <svg viewBox="0 0 16 16" width={width} height={height} fill="none" aria-hidden="true">
      <path d="M11.5 2.5 L13.5 4.5 L5 13 L2.5 13.5 L3 11 Z"
        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
      <line x1="9.5" y1="4.5" x2="11.5" y2="6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/** Microphone. Used in VoiceRecorder. */
export function MicIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" />
      <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Partial circle arc spinner. Used in VoiceRecorder "Mapping" status. */
export function SpinnerCircleIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"
        strokeDasharray="20" strokeDashoffset="8" strokeLinecap="round" />
    </svg>
  );
}

// ── Account page icons ─────────────────────────────────────────────────────────

/** Person silhouette with orbit. Used on account "Call Sign" card. */
export function UserIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <circle cx="18" cy="13" r="6" fill="none" stroke="#c4a35a" strokeWidth="1.2" opacity="0.9" />
      <path d="M6 30 Q18 22 30 30" fill="none" stroke="#c4a35a" strokeWidth="1.2" opacity="0.9" />
      <circle cx="18" cy="18" r="16" fill="none" stroke="#c4a35a" strokeWidth="0.5" opacity="0.25" strokeDasharray="3 4" />
    </svg>
  );
}

/** Magnifying glass key shape. Used on account "Cipher Key" card. */
export function KeyIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <circle cx="14" cy="14" r="7" fill="none" stroke="#c4a35a" strokeWidth="1.2" opacity="0.9" />
      <circle cx="14" cy="14" r="3" fill="#c4a35a" opacity="0.4" />
      <line x1="19" y1="19" x2="30" y2="30" stroke="#c4a35a" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      <line x1="26" y1="26" x2="26" y2="30" stroke="#c4a35a" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      <line x1="29" y1="23" x2="33" y2="23" stroke="#c4a35a" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

// ── Empty state illustrations ──────────────────────────────────────────────────

/** Faint document with lines. Used in Summary empty state. */
export function SummaryEmptyIllustration() {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" fill="none" aria-hidden="true">
      <rect x="8" y="6" width="32" height="36" rx="3" stroke="#c4a35a" strokeWidth="1.2" opacity="0.3" />
      <line x1="15" y1="16" x2="33" y2="16" stroke="#c4a35a" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <line x1="15" y1="22" x2="33" y2="22" stroke="#c4a35a" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <line x1="15" y1="28" x2="26" y2="28" stroke="#c4a35a" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

/** Three stacked faint card outlines. Used in Flashcards empty state. */
export function FlashcardsEmptyIllustration() {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" fill="none" aria-hidden="true">
      <rect x="2" y="12" width="28" height="20" rx="2" stroke="#c4a35a" strokeWidth="1.2" opacity="0.2" />
      <rect x="8" y="7" width="28" height="20" rx="2" stroke="#c4a35a" strokeWidth="1.2" opacity="0.3" />
      <rect x="14" y="16" width="28" height="20" rx="2" stroke="#c4a35a" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

/** Faint speech bubble with lines. Used in Chatbot empty state. */
export function ChatBubbleIllustration() {
  return (
    <svg viewBox="0 0 48 48" width="36" height="36" fill="none" aria-hidden="true">
      <path d="M6 8 Q6 5 9 5 H39 Q42 5 42 8 V28 Q42 31 39 31 H28 L20 38 V31 H9 Q6 31 6 28 Z"
        stroke="#c4a35a" strokeWidth="1.4" strokeLinejoin="round" opacity="0.35" />
      <line x1="14" y1="15" x2="34" y2="15" stroke="#c4a35a" strokeWidth="1.1" strokeLinecap="round" opacity="0.3" />
      <line x1="14" y1="21" x2="28" y2="21" stroke="#c4a35a" strokeWidth="1.1" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

/** Faint exam paper with lines. Used in Exam empty state. */
export function ExamEmptyIllustration() {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" fill="none" aria-hidden="true">
      <rect x="6" y="3" width="28" height="36" rx="2" stroke="#c4a35a" strokeWidth="1.5" opacity="0.4" />
      <line x1="12" y1="13" x2="28" y2="13" stroke="#c4a35a" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <line x1="12" y1="20" x2="24" y2="20" stroke="#c4a35a" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <line x1="12" y1="27" x2="28" y2="27" stroke="#c4a35a" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

/** Faint presentation screen. Used in PowerPoint empty state. */
export function PresentationEmptyIllustration() {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="40" height="28" rx="2" stroke="#c4a35a" strokeWidth="1.2" opacity="0.3" />
      <line x1="24" y1="34" x2="24" y2="42" stroke="#c4a35a" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
      <line x1="16" y1="42" x2="32" y2="42" stroke="#c4a35a" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
      <polyline points="18,14 26,20 18,26" stroke="#c4a35a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
    </svg>
  );
}
