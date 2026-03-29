import styles from "./page.module.css";
import NavBar from "./components/NavBar";

// ─── Deterministic pseudo-random (runs server-side) ───────────────────────────
function pr(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ─── Star field data ──────────────────────────────────────────────────────────
const STARS = Array.from({ length: 140 }, (_, i) => ({
  cx: pr(i * 2.391 + 0.5) * 1440,
  cy: pr(i * 3.714 + 1.3) * 900,
  r: pr(i * 5.291 + 2.1) > 0.93 ? 2.2 : pr(i * 5.291 + 2.1) > 0.72 ? 1.4 : 0.7,
  opacity: 0.25 + pr(i * 7.133 + 4.2) * 0.65,
  delay: pr(i * 11.27 + 6.7) * 6,
  duration: 2.5 + pr(i * 13.09 + 8.9) * 4,
}));

// ─── Constellation groups ──────────────────────────────────────────────────────
const CONSTELLATIONS = [
  {
    nodes: [
      [95, 70],
      [130, 105],
      [168, 88],
      [200, 120],
      [165, 155],
      [130, 105],
    ],
    color: "#c4a35a",
  },
  {
    nodes: [
      [1100, 60],
      [1140, 95],
      [1175, 75],
      [1210, 110],
      [1248, 82],
    ],
    color: "#4a7fcb",
  },
  {
    nodes: [
      [1280, 320],
      [1310, 355],
      [1345, 335],
      [1380, 370],
      [1345, 405],
      [1310, 355],
    ],
    color: "#c4a35a",
  },
  {
    nodes: [
      [60, 560],
      [95, 530],
      [130, 555],
      [165, 520],
      [200, 548],
    ],
    color: "#4a7fcb",
  },
  {
    nodes: [
      [1050, 710],
      [1090, 680],
      [1130, 700],
      [1165, 670],
      [1200, 695],
      [1165, 730],
    ],
    color: "#c4a35a",
  },
];

// ─── Astrolabe SVG ────────────────────────────────────────────────────────────
// Original visual elements regrouped into 4 independently-rotating layers.
function AstrolabeSVG() {
  const cx = 250,
    cy = 250;

  // Static outer graduation ticks
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const deg = i * 5;
    const isMajor = deg % 30 === 0;
    const isMed = deg % 10 === 0;
    const outerR = 218;
    const innerR = isMajor ? 198 : isMed ? 205 : 210;
    const rad = ((deg - 90) * Math.PI) / 180;
    return {
      x1: cx + outerR * Math.cos(rad),
      y1: cy + outerR * Math.sin(rad),
      x2: cx + innerR * Math.cos(rad),
      y2: cy + innerR * Math.sin(rad),
      isMajor,
      isMed,
    };
  });

  // Static bearing labels
  const labels = Array.from({ length: 12 }, (_, i) => {
    const deg = i * 30;
    const rad = ((deg - 90) * Math.PI) / 180;
    const isBearing = [0, 90, 180, 270].includes(deg);
    return {
      x: cx + 185 * Math.cos(rad),
      y: cy + 185 * Math.sin(rad),
      text:
        deg === 0
          ? "N"
          : deg === 90
            ? "E"
            : deg === 180
              ? "S"
              : deg === 270
                ? "W"
                : String(deg),
      isBearing,
    };
  });

  // Rete notches — live on the mid-band layer so they orbit with it
  const reteNotches = Array.from({ length: 24 }, (_, i) => {
    const rad = ((i * 15 - 90) * Math.PI) / 180;
    return {
      x1: cx + 148 * Math.cos(rad),
      y1: cy + 148 * Math.sin(rad),
      x2: cx + 138 * Math.cos(rad),
      y2: cy + 138 * Math.sin(rad),
    };
  });

  // Compass-point stars — live on the rete layer so they orbit with it
  const compassStars = [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    const isCardinal = [0, 90, 180, 270].includes(deg);
    return {
      x: cx + (isCardinal ? 162 : 160) * Math.cos(rad),
      y: cy + (isCardinal ? 162 : 160) * Math.sin(rad),
      size: isCardinal ? 4 : 2.5,
    };
  });

  return (
    <svg
      viewBox="0 0 500 500"
      className={styles.astrolabeSvg}
      aria-hidden="true"
    >
      <defs>
        <filter id="roughen">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves="4"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="1.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4a7fcb" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#020b18" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={230} fill="url(#centerGlow)" />

      {/* ── STATIC: Outer limb rings ── */}
      <circle
        cx={cx}
        cy={cy}
        r={228}
        fill="none"
        stroke="#c4a35a"
        strokeWidth="1.5"
        filter="url(#roughen)"
      />
      <circle
        cx={cx}
        cy={cy}
        r={220}
        fill="none"
        stroke="#c4a35a"
        strokeWidth="0.8"
        opacity="0.6"
        filter="url(#roughen)"
      />

      {/* ── STATIC: Graduation ticks ── */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="#c4a35a"
          strokeWidth={t.isMajor ? 1.5 : t.isMed ? 1 : 0.6}
          opacity={t.isMajor ? 1 : t.isMed ? 0.75 : 0.45}
        />
      ))}

      {/* ── STATIC: Bearing labels ── */}
      {labels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={l.isBearing ? "10" : "7"}
          fontWeight={l.isBearing ? "600" : "400"}
          fill={l.isBearing ? "#e8c878" : "#c4a35a"}
          opacity={l.isBearing ? 1 : 0.7}
          fontFamily="var(--font-cinzel)"
        >
          {l.text}
        </text>
      ))}

      {/* ── LAYER 1: Rete ring + compass-point stars — 16s CW ── */}
      <g
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: "rotateSlow 16s linear infinite",
        }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={170}
          fill="none"
          stroke="#c4a35a"
          strokeWidth="0.6"
          opacity="0.4"
          strokeDasharray="3 5"
        />
        {compassStars.map((s, i) => (
          <g key={i} transform={`translate(${s.x}, ${s.y})`}>
            {[0, 72, 144, 216, 288].map((a, j) => {
              const r1 = s.size,
                r2 = s.size * 0.35;
              const a1 = ((a - 90) * Math.PI) / 180;
              const a2 = ((a + 36 - 90) * Math.PI) / 180;
              return (
                <line
                  key={j}
                  x1={r1 * Math.cos(a1)}
                  y1={r1 * Math.sin(a1)}
                  x2={r2 * Math.cos(a2)}
                  y2={r2 * Math.sin(a2)}
                  stroke="#e8c878"
                  strokeWidth="0.8"
                  opacity="0.85"
                />
              );
            })}
            <circle
              r={s.size * 0.3}
              fill="#e8c878"
              opacity="0.9"
              filter="url(#glow)"
            />
          </g>
        ))}
      </g>

      {/* ── LAYER 2: Mid band + rete notches — 10s CCW ── */}
      <g
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: "rotateReverse 10s linear infinite",
        }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={148}
          fill="none"
          stroke="#c4a35a"
          strokeWidth="1"
          opacity="0.55"
        />
        {reteNotches.map((n, i) => (
          <line
            key={i}
            x1={n.x1}
            y1={n.y1}
            x2={n.x2}
            y2={n.y2}
            stroke="#c4a35a"
            strokeWidth="0.8"
            opacity="0.5"
          />
        ))}
      </g>

      {/* ── LAYER 3: Alidade cross — 24s CCW ── */}
      <g
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: "rotateReverse 24s linear infinite",
        }}
      >
        <line
          x1={cx}
          y1={cy - 218}
          x2={cx}
          y2={cy + 218}
          stroke="#c4a35a"
          strokeWidth="0.6"
          opacity="0.3"
        />
        <line
          x1={cx - 218}
          y1={cy}
          x2={cx + 218}
          y2={cy}
          stroke="#c4a35a"
          strokeWidth="0.6"
          opacity="0.3"
        />
        <line
          x1={cx - 154}
          y1={cy - 154}
          x2={cx + 154}
          y2={cy + 154}
          stroke="#c4a35a"
          strokeWidth="0.5"
          opacity="0.18"
        />
        <line
          x1={cx + 154}
          y1={cy - 154}
          x2={cx - 154}
          y2={cy + 154}
          stroke="#c4a35a"
          strokeWidth="0.5"
          opacity="0.18"
        />
      </g>

      {/* ── LAYER 4: Inner blue rings — 6s CW ── */}
      <g
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: "rotateSlow 6s linear infinite",
        }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={130}
          fill="none"
          stroke="#4a7fcb"
          strokeWidth="0.7"
          opacity="0.3"
          strokeDasharray="1 14"
        />
        <circle
          cx={cx}
          cy={cy}
          r={110}
          fill="none"
          stroke="#4a7fcb"
          strokeWidth="0.8"
          opacity="0.45"
          strokeDasharray="2 8"
        />
      </g>

      {/* ── STATIC: Center pin ── */}
      <circle
        cx={cx}
        cy={cy}
        r={18}
        fill="none"
        stroke="#c4a35a"
        strokeWidth="1"
        opacity="0.6"
        filter="url(#roughen)"
      />
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#c4a35a"
        opacity="0.7"
        filter="url(#glow)"
      />
      <circle cx={cx} cy={cy} r={2.5} fill="#e8c878" filter="url(#glow)" />
    </svg>
  );
}

// ─── Feature icons ─────────────────────────────────────────────────────────────
function MicIcon() {
  return (
    <svg viewBox="0 0 64 64" className={styles.featureIcon} aria-hidden="true">
      <ellipse
        cx="32"
        cy="32"
        rx="28"
        ry="10"
        fill="none"
        stroke="#c4a35a"
        strokeWidth="0.7"
        opacity="0.35"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="10"
        ry="28"
        fill="none"
        stroke="#4a7fcb"
        strokeWidth="0.7"
        opacity="0.3"
      />
      <rect
        x="26"
        y="12"
        width="12"
        height="22"
        rx="6"
        fill="none"
        stroke="#c4a35a"
        strokeWidth="1.5"
      />
      <path
        d="M22 33 Q22 46 32 46 Q42 46 42 33"
        fill="none"
        stroke="#c4a35a"
        strokeWidth="1.5"
      />
      <line
        x1="32"
        y1="46"
        x2="32"
        y2="54"
        stroke="#c4a35a"
        strokeWidth="1.5"
      />
      <line
        x1="24"
        y1="54"
        x2="40"
        y2="54"
        stroke="#c4a35a"
        strokeWidth="1.5"
      />
      <circle cx="32" cy="23" r="2" fill="#e8c878" opacity="0.85" />
    </svg>
  );
}

function ConstellationIcon() {
  const nodes = [
    [32, 12],
    [52, 28],
    [44, 50],
    [20, 50],
    [12, 28],
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 0],
    [0, 2],
    [1, 3],
  ];
  return (
    <svg viewBox="0 0 64 64" className={styles.featureIcon} aria-hidden="true">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="#4a7fcb"
          strokeWidth="0.8"
          opacity="0.45"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === 0 ? 4 : 2.5}
          fill={i === 0 ? "#e8c878" : "#c4a35a"}
          opacity={i === 0 ? 1 : 0.8}
        />
      ))}
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 64 64" className={styles.featureIcon} aria-hidden="true">
      <circle
        cx="32"
        cy="32"
        r="26"
        fill="none"
        stroke="#c4a35a"
        strokeWidth="1"
        opacity="0.5"
      />
      <circle
        cx="32"
        cy="32"
        r="20"
        fill="none"
        stroke="#c4a35a"
        strokeWidth="0.6"
        opacity="0.3"
        strokeDasharray="2 4"
      />
      <polygon points="32,10 29,32 32,29 35,32" fill="#e8c878" opacity="0.9" />
      <polygon points="32,54 29,32 32,35 35,32" fill="#4a7fcb" opacity="0.7" />
      {[0, 90, 180, 270].map((deg, i) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={32 + 22 * Math.cos(rad)}
            y1={32 + 22 * Math.sin(rad)}
            x2={32 + 26 * Math.cos(rad)}
            y2={32 + 26 * Math.sin(rad)}
            stroke="#c4a35a"
            strokeWidth="1.5"
          />
        );
      })}
      <circle cx="32" cy="32" r="3" fill="#c4a35a" opacity="0.8" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className={styles.page}>
      {/* ── Navigation ── */}
      <NavBar showFeatureLinks />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        {/* Star field background */}
        <svg
          className={styles.starField}
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="nebulaA" cx="70%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#1a3a6b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#020b18" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="nebulaB" cx="15%" cy="70%" r="40%">
              <stop offset="0%" stopColor="#2d1a5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#020b18" stopOpacity="0" />
            </radialGradient>
            <filter id="starGlow">
              <feGaussianBlur stdDeviation="1.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="1440" height="900" fill="url(#nebulaA)" />
          <rect width="1440" height="900" fill="url(#nebulaB)" />

          {/* Constellation lines */}
          {CONSTELLATIONS.map((group, gi) =>
            group.nodes
              .slice(0, -1)
              .map((node, ni) => (
                <line
                  key={`cl-${gi}-${ni}`}
                  x1={node[0]}
                  y1={node[1]}
                  x2={group.nodes[ni + 1][0]}
                  y2={group.nodes[ni + 1][1]}
                  stroke={group.color}
                  strokeWidth="0.6"
                  opacity="0.35"
                />
              )),
          )}
          {CONSTELLATIONS.map((group, gi) =>
            group.nodes.map(([x, y], ni) => (
              <circle
                key={`cn-${gi}-${ni}`}
                cx={x}
                cy={y}
                r={ni === 0 ? 2 : 1.2}
                fill={group.color}
                opacity="0.7"
                filter="url(#starGlow)"
              />
            )),
          )}

          {/* Stars */}
          {STARS.map((s, i) => (
            <circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill="#e8f0ff"
              opacity={s.opacity}
              style={{
                animation: `twinkle ${s.duration.toFixed(1)}s ease-in-out ${s.delay.toFixed(1)}s infinite`,
              }}
              filter={s.r > 1.8 ? "url(#starGlow)" : undefined}
            />
          ))}
        </svg>

        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>
              <span className={styles.eyebrowLine} />
              Navigate Your Learning
              <span className={styles.eyebrowLine} />
            </p>
            <h1 className={styles.heroTitle}>
              Astro<span className={styles.titleAccent}>Notes</span>
            </h1>
            <p className={styles.heroTagline}>
              Map your knowledge clearly. Record lectures, turn them into
              structured mind maps, and use built-in tools to study more
              effectively — all in one place.
            </p>
            <div className={styles.heroCtas}>
              <a href="/login" className={styles.ctaPrimary}>
                <svg
                  viewBox="0 0 20 20"
                  width="15"
                  height="15"
                  aria-hidden="true"
                >
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <polygon points="8,7 14,10 8,13" fill="currentColor" />
                </svg>
                Start Charting
              </a>
              <a href="#features" className={styles.ctaSecondary}>
                View Instruments
              </a>
            </div>
            <p className={styles.heroSub}>Begin your expedition now</p>
          </div>

          <div className={styles.heroAstrolabe}>
            <AstrolabeSVG />
          </div>
        </div>

        <div className={styles.scrollHint} aria-hidden="true">
          <span className={styles.scrollDot} />
          <span className={styles.scrollLabel}>scroll to discover</span>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <svg
            viewBox="0 0 120 12"
            className={styles.sectionRule}
            aria-hidden="true"
          >
            <line
              x1="0"
              y1="6"
              x2="48"
              y2="6"
              stroke="#c4a35a"
              strokeWidth="0.8"
              opacity="0.5"
            />
            <circle
              cx="55"
              cy="6"
              r="3"
              fill="none"
              stroke="#c4a35a"
              strokeWidth="1"
              opacity="0.8"
            />
            <circle cx="60" cy="6" r="1.5" fill="#c4a35a" opacity="0.9" />
            <circle
              cx="65"
              cy="6"
              r="3"
              fill="none"
              stroke="#c4a35a"
              strokeWidth="1"
              opacity="0.8"
            />
            <line
              x1="72"
              y1="6"
              x2="120"
              y2="6"
              stroke="#c4a35a"
              strokeWidth="0.8"
              opacity="0.5"
            />
          </svg>
          <h2 className={styles.sectionTitle}>The Instruments</h2>
          <p className={styles.sectionSub}>
            Three celestial tools &mdash; one unified observatory for your
            studies
          </p>
        </div>

        <div className={styles.featureCards}>
          <article className={styles.featureCard}>
            <div className={styles.featureCardGlow} />
            <div className={styles.featureIconWrap}>
              <MicIcon />
            </div>
            <h3 className={styles.featureTitle}>Stellar Recorder</h3>
            <p className={styles.featureDesc}>
              Capture lectures with precision. Timestamps anchor your notes to
              the exact moment of discovery, so no insight drifts past the
              horizon.
            </p>
            <a href="#" className={styles.featureLink}>
              Explore &rarr;
            </a>
          </article>

          <article
            className={`${styles.featureCard} ${styles.featureCardFeatured}`}
          >
            <div className={styles.featureCardGlow} />
            <div className={styles.featureIconWrap}>
              <ConstellationIcon />
            </div>
            <h3 className={styles.featureTitle}>Constellation Maps</h3>
            <p className={styles.featureDesc}>
              Weave ideas into mind maps that mirror the night sky. Draw
              connections the way navigators once charted stars between worlds.
            </p>
            <a href="#" className={styles.featureLink}>
              Explore &rarr;
            </a>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureCardGlow} />
            <div className={styles.featureIconWrap}>
              <CompassIcon />
            </div>
            <h3 className={styles.featureTitle}>Study Compass</h3>
            <p className={styles.featureDesc}>
              Forge flashcards, quizzes, and revision schedules from your notes.
              Let the compass always point you toward mastery.
            </p>
            <a href="#" className={styles.featureLink}>
              Explore &rarr;
            </a>
          </article>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerInner}>
          <h2 className={styles.ctaTitle}>Begin Your Expedition</h2>
          <p className={styles.ctaText}>
            Every great explorer needed a chart. Yours starts here.
          </p>
          <a href="#" className={styles.ctaPrimary}>
            Open the Observatory
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
              <circle
                cx="10"
                cy="10"
                r="8.5"
                fill="none"
                stroke="#c4a35a"
                strokeWidth="1"
                opacity="0.6"
              />
              <circle
                cx="10"
                cy="10"
                r="4.5"
                fill="none"
                stroke="#c4a35a"
                strokeWidth="0.6"
                opacity="0.4"
              />
              <circle cx="10" cy="10" r="1.5" fill="#c4a35a" opacity="0.7" />
              <line
                x1="10"
                y1="1.5"
                x2="10"
                y2="18.5"
                stroke="#c4a35a"
                strokeWidth="0.5"
                opacity="0.3"
              />
              <line
                x1="1.5"
                y1="10"
                x2="18.5"
                y2="10"
                stroke="#c4a35a"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </svg>
            <span className={styles.footerBrandName}>AstroNotes</span>
          </div>

          <p className={styles.footerCopy}>
            &copy; 2026 AstroNotes &mdash; Chart your course
          </p>
        </div>
      </footer>
    </div>
  );
}
