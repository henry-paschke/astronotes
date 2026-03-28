'use client';

import { useState } from 'react';
import styles from './page.module.css';

const API = 'http://localhost:8000';

// ── Shared fetch helper ────────────────────────────────────────────────────────
async function patchMe(payload) {
  const token = localStorage.getItem('astronotes_token');
  const res = await fetch(`${API}/api/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || 'Update failed.');
  return data;
}

// ── Change username card ───────────────────────────────────────────────────────
function UsernameCard() {
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [status, setStatus] = useState(null); // { type: 'error'|'success', msg }
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    if (!newUsername.trim()) { setStatus({ type: 'error', msg: 'Enter a new username.' }); return; }
    setLoading(true);
    try {
      const data = await patchMe({ current_password: currentPassword, new_username: newUsername });
      localStorage.setItem('astronotes_username', data.username);
      // Re-issue token since JWT subject changed
      const body = new URLSearchParams({ username: data.username, password: currentPassword });
      const tokenRes = await fetch(`${API}/api/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (tokenRes.ok) {
        const { access_token } = await tokenRes.json();
        localStorage.setItem('astronotes_token', access_token);
      }
      setStatus({ type: 'success', msg: `Username changed to "${data.username}".` });
      setNewUsername('');
      setCurrentPassword('');
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardAccent} />
      <div className={styles.cardInner}>
        <div className={styles.cardHead}>
          {/* Call-sign icon */}
          <svg viewBox="0 0 36 36" className={styles.cardIcon} aria-hidden="true">
            <circle cx="18" cy="13" r="6" fill="none" stroke="#c4a35a" strokeWidth="1.2" opacity="0.9" />
            <path d="M6 30 Q18 22 30 30" fill="none" stroke="#c4a35a" strokeWidth="1.2" opacity="0.9" />
            <circle cx="18" cy="18" r="16" fill="none" stroke="#c4a35a" strokeWidth="0.5" opacity="0.25" strokeDasharray="3 4" />
          </svg>
          <div>
            <h2 className={styles.cardTitle}>Call Sign</h2>
            <p className={styles.cardDesc}>Change how you appear across AstroNotes</p>
          </div>
        </div>

        {status && <p className={status.type === 'error' ? styles.error : styles.success}>{status.msg}</p>}

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="newUsername" className={styles.label}>New Username</label>
            <input id="newUsername" type="text" autoComplete="username"
              placeholder="new_navigator" className={styles.input}
              value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="cpUsername" className={styles.label}>
              Current Password <span className={styles.required}>*</span>
            </label>
            <input id="cpUsername" type="password" autoComplete="current-password"
              placeholder="Confirm with your password" className={styles.input}
              value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Updating…' : 'Change Username'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Change password card ───────────────────────────────────────────────────────
function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    if (!newPassword) { setStatus({ type: 'error', msg: 'Enter a new password.' }); return; }
    if (newPassword.length < 8) { setStatus({ type: 'error', msg: 'Password must be at least 8 characters.' }); return; }
    if (newPassword !== confirmPassword) { setStatus({ type: 'error', msg: 'Passwords do not match.' }); return; }
    setLoading(true);
    try {
      await patchMe({ current_password: currentPassword, new_password: newPassword });
      setStatus({ type: 'success', msg: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardAccent} />
      <div className={styles.cardInner}>
        <div className={styles.cardHead}>
          {/* Cipher key icon */}
          <svg viewBox="0 0 36 36" className={styles.cardIcon} aria-hidden="true">
            <circle cx="14" cy="14" r="7" fill="none" stroke="#c4a35a" strokeWidth="1.2" opacity="0.9" />
            <circle cx="14" cy="14" r="3" fill="#c4a35a" opacity="0.4" />
            <line x1="19" y1="19" x2="30" y2="30" stroke="#c4a35a" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
            <line x1="26" y1="26" x2="26" y2="30" stroke="#c4a35a" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
            <line x1="29" y1="23" x2="33" y2="23" stroke="#c4a35a" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
          </svg>
          <div>
            <h2 className={styles.cardTitle}>Cipher Key</h2>
            <p className={styles.cardDesc}>Update your account password</p>
          </div>
        </div>

        {status && <p className={status.type === 'error' ? styles.error : styles.success}>{status.msg}</p>}

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="cpPassword" className={styles.label}>
              Current Password <span className={styles.required}>*</span>
            </label>
            <input id="cpPassword" type="password" autoComplete="current-password"
              placeholder="••••••••" className={styles.input}
              value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="newPassword" className={styles.label}>New Password</label>
            <input id="newPassword" type="password" autoComplete="new-password"
              placeholder="Min. 8 characters" className={styles.input}
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password</label>
            <input id="confirmPassword" type="password" autoComplete="new-password"
              placeholder="••••••••" className={styles.input}
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Updating…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Export both cards ─────────────────────────────────────────────────────────
export default function AccountSettings() {
  return (
    <div className={styles.cards}>
      <UsernameCard />
      <PasswordCard />
    </div>
  );
}
