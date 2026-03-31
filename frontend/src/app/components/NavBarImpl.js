"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./NavBar.module.css";
import { getMe } from "../api/account";
import { LogoMark } from "./icons";

export default function NavBar({ showFeatureLinks = false }) {
  const router = useRouter();
  const [username, setUsername] = useState(() =>
    localStorage.getItem("astronotes_username"),
  );

  useEffect(() => {
    const token = localStorage.getItem("astronotes_token");
    if (!token) {
      if (username) {
        localStorage.removeItem("astronotes_username");
        setUsername(null);
      }
      return;
    }
    getMe(token)
      .then((data) => {
        if (data?.username) {
          setUsername(data.username);
          localStorage.setItem("astronotes_username", data.username);
        } else {
          localStorage.removeItem("astronotes_token");
          localStorage.removeItem("astronotes_username");
          setUsername(null);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSignOut() {
    localStorage.removeItem("astronotes_token");
    localStorage.removeItem("astronotes_username");
    setUsername(null);
    router.push("/");
  }

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.navLogo}>
        <LogoMark className={styles.navLogoMark} />
        <span className={styles.navLogoText}>AstroNotes</span>
      </Link>

      <ul className={styles.navLinks}>
        {showFeatureLinks && (
          <>
            <li>
              <a
                href="#features"
                className={`${styles.navLink} ${styles.features}`}
              >
                Features
              </a>
            </li>
          </>
        )}
        {username ? (
          <>
            <li>
              <Link href="/transcripts" className={styles.navLink}>
                Transcripts
              </Link>
            </li>
            <li>
              <Link href="/account" className={styles.navUser}>
                <span className={styles.navUserDot} />
                {username}
              </Link>
            </li>
            <li>
              <button className={styles.navSignOut} onClick={handleSignOut}>
                Sign Out
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/login" className={styles.navLink}>
                Sign In
              </Link>
            </li>
            <li>
              <Link href="/signup" className={styles.navCta}>
                Begin Voyage
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
