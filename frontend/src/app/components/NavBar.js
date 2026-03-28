'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './NavBar.module.css';

const API = 'http://localhost:8000';

export default function NavBar({ showFeatureLinks = false }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('astronotes_token');
    if (!token) {
      setChecked(true);
      return;
    }
    fetch(`${API}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.username) setUser(data);
        else localStorage.removeItem('astronotes_token');
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  function handleSignOut() {
    localStorage.removeItem('astronotes_token');
    router.push('/');
  }

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.navLogo}>
        <svg viewBox="0 0 28 28" className={styles.navLogoMark} aria-hidden="true">
          <circle cx="14" cy="14" r="12" fill="none" stroke="#c4a35a" strokeWidth="1.2"
            strokeDasharray="60 15.4"
            style={{ transformOrigin: '14px 14px', animation: 'rotateSlow 18s linear infinite' }}
          />
          <circle cx="14" cy="14" r="7" fill="none" stroke="#c4a35a" strokeWidth="0.7" opacity="0.6"
            strokeDasharray="36 8"
            style={{ transformOrigin: '14px 14px', animation: 'rotateReverse 12s linear infinite' }}
          />
          <line x1="14" y1="2" x2="14" y2="26" stroke="#c4a35a" strokeWidth="0.7" opacity="0.45" />
          <line x1="2" y1="14" x2="26" y2="14" stroke="#c4a35a" strokeWidth="0.7" opacity="0.45" />
          <circle cx="14" cy="14" r="2" fill="#e8c878" />
        </svg>
        <span className={styles.navLogoText}>AstroNotes</span>
      </Link>

      {checked && (
        <ul className={styles.navLinks}>
          {showFeatureLinks && (
            <>
              <li><a href="#features" className={styles.navLink}>Features</a></li>
              <li><a href="#about" className={styles.navLink}>About</a></li>
            </>
          )}
          {user ? (
            <>
              <li>
                <Link href="/transcripts" className={styles.navLink}>Transcripts</Link>
              </li>
              <li>
                <span className={styles.navUser}>
                  <span className={styles.navUserDot} />
                  {user.username}
                </span>
              </li>
              <li>
                <button className={styles.navSignOut} onClick={handleSignOut}>
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link href="/login" className={styles.navLink}>Sign In</Link></li>
              <li><Link href="/signup" className={styles.navCta}>Begin Voyage</Link></li>
            </>
          )}
        </ul>
      )}
    </nav>
  );
}
