import styles from './page.module.css';
import NavBar from '../components/NavBar';
import AuthGuard from '../components/AuthGuard';
import AccountSettings from './AccountForm';

export const metadata = {
  title: 'Account — AstroNotes',
};

// Sparse deterministic star field
const STARS = [
  [80,120],[220,60],[380,140],[540,80],[700,160],[860,50],[1020,130],[1180,70],[1340,150],[1440,90],
  [140,280],[300,220],[460,300],[620,240],[780,320],[940,200],[1100,280],[1260,210],[60,380],
  [200,440],[360,360],[520,420],[680,380],[840,450],[1000,370],[1160,430],[1320,390],[1400,460],
  [100,520],[250,570],[420,510],[580,560],[740,520],[900,580],[1060,540],[1220,590],[1380,530],
  [30,650],[190,700],[350,660],[510,720],[670,670],[830,710],[990,660],[1150,720],[1310,680],
];

export default function AccountPage() {
  return (
    <AuthGuard>
      <div className={styles.page}>
        <NavBar />

        <svg className={styles.starField} aria-hidden="true">
          {STARS.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy}
              r={i % 6 === 0 ? 1.6 : i % 3 === 0 ? 1.1 : 0.7}
              fill="#e8f0ff" opacity={0.12 + (i % 5) * 0.04}
            />
          ))}
        </svg>

        <main className={styles.main}>
          {/* Page heading */}
          <header className={styles.pageHeader}>
            <svg viewBox="0 0 120 12" className={styles.rule} aria-hidden="true">
              <line x1="0" y1="6" x2="48" y2="6" stroke="#c4a35a" strokeWidth="0.8" opacity="0.4" />
              <circle cx="55" cy="6" r="3" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.7" />
              <circle cx="60" cy="6" r="1.5" fill="#c4a35a" opacity="0.9" />
              <circle cx="65" cy="6" r="3" fill="none" stroke="#c4a35a" strokeWidth="1" opacity="0.7" />
              <line x1="72" y1="6" x2="120" y2="6" stroke="#c4a35a" strokeWidth="0.8" opacity="0.4" />
            </svg>
            <h1 className={styles.pageTitle}>Navigator&rsquo;s Record</h1>
            <p className={styles.pageSubtitle}>Manage your account details</p>
          </header>

          <AccountSettings />
        </main>
      </div>
    </AuthGuard>
  );
}
