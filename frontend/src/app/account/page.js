import styles from './page.module.css';
import NavBar from '../components/NavBar';
import AuthGuard from '../components/AuthGuard';
import AccountSettings from './AccountForm';
import { Rule } from '../components/icons';

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
            <Rule className={styles.rule} />
            <h1 className={styles.pageTitle}>Navigator&rsquo;s Record</h1>
            <p className={styles.pageSubtitle}>Manage your account details</p>
          </header>

          <AccountSettings />
        </main>
      </div>
    </AuthGuard>
  );
}
