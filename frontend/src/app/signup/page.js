import styles from '../auth.module.css';
import SignupForm from './SignupForm';
import NavBar from '../components/NavBar';
import { AstrolabeMark, AuthRule } from '../components/icons';

function pr(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}
const STARS = Array.from({ length: 60 }, (_, i) => ({
  cx: pr(i * 2.391 + 0.5) * 1440,
  cy: pr(i * 3.714 + 1.3) * 900,
  r:  pr(i * 5.291 + 2.1) > 0.92 ? 1.8 : 0.7,
  opacity: 0.15 + pr(i * 7.133 + 4.2) * 0.45,
  delay:    pr(i * 11.27 + 6.7) * 6,
  duration: 3 + pr(i * 13.09 + 8.9) * 4,
}));

export const metadata = {
  title: 'Create Account — AstroNotes',
};

export default function SignupPage() {
  return (
    <div className={styles.page}>
      {/* Star field */}
      <svg className={styles.starField} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="authNebula2" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#1a3a6b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#020b18" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#authNebula2)" />
        {STARS.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r}
            fill="#e8f0ff" opacity={s.opacity}
            style={{ animation: `twinkle ${s.duration.toFixed(1)}s ease-in-out ${s.delay.toFixed(1)}s infinite` }}
          />
        ))}
      </svg>

      {/* Nav */}
      <NavBar />

      {/* Centered card */}
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardGlow} />
          <div className={styles.cardInner}>

            <AstrolabeMark className={styles.astrolabeMark} />
            <AuthRule className={styles.rule} />

            <h1 className={styles.cardTitle}>Create Account</h1>
            <p className={styles.cardSub}>Begin your expedition</p>

            <div className={styles.divider} />

            <SignupForm />
          </div>
        </div>
      </main>
    </div>
  );
}
