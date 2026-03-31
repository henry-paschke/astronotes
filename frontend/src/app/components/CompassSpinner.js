// Shared animated compass loading spinner.
// Animations are defined as global keyframes in globals.css:
//   compassRingSpin  — slow continuous rotation on the tick ring
//   compassNeedleSpin — oscillating rotation on the needle

export default function CompassSpinner({ wrapClassName = "", svgClassName = "" }) {
  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
      className={svgClassName}
      style={{ width: 72, height: 72 }}
    >
      {/* Rotating tick ring */}
      <g style={{ transformOrigin: "50% 50%", animation: "compassRingSpin 8s linear infinite" }}>
        <circle cx="36" cy="36" r="33" stroke="#c4a35a" strokeWidth="0.8" opacity="0.25" />
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const major = i % 6 === 0;
          const r0 = major ? 29 : 30.5;
          return (
            <line
              key={i}
              x1={36 + r0 * Math.cos(a)} y1={36 + r0 * Math.sin(a)}
              x2={36 + 33 * Math.cos(a)} y2={36 + 33 * Math.sin(a)}
              stroke="#c4a35a"
              strokeWidth={major ? 1.2 : 0.6}
              opacity={major ? 0.7 : 0.35}
              strokeLinecap="round"
            />
          );
        })}
      </g>
      {/* Static inner rings */}
      <circle cx="36" cy="36" r="22" stroke="#c4a35a" strokeWidth="0.6" opacity="0.18" />
      <circle cx="36" cy="36" r="4"  stroke="#c4a35a" strokeWidth="1"   opacity="0.5" />
      {/* Oscillating needle */}
      <g style={{ transformOrigin: "50% 50%", animation: "compassNeedleSpin 2.4s cubic-bezier(0.4,0,0.2,1) infinite" }}>
        <polygon points="36,36 33.5,36 36,14" fill="#c4a35a" opacity="0.9" />
        <polygon points="36,36 38.5,36 36,58" fill="#c4a35a" opacity="0.3" />
      </g>
      {/* Cardinal letters */}
      <text x="36" y="9"  textAnchor="middle" dominantBaseline="middle" fontSize="6" fontFamily="serif" fill="#c4a35a" opacity="0.55">N</text>
      <text x="36" y="65" textAnchor="middle" dominantBaseline="middle" fontSize="6" fontFamily="serif" fill="#c4a35a" opacity="0.35">S</text>
      <text x="63" y="37" textAnchor="middle" dominantBaseline="middle" fontSize="6" fontFamily="serif" fill="#c4a35a" opacity="0.35">E</text>
      <text x="9"  y="37" textAnchor="middle" dominantBaseline="middle" fontSize="6" fontFamily="serif" fill="#c4a35a" opacity="0.35">W</text>
    </svg>
  );
}
