'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';

const API = 'http://localhost:8000';

export default function SignupForm() {
  const router = useRouter();
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [confirm,  setConfirm]    = useState('');
  const [error,    setError]      = useState('');
  const [success,  setSuccess]    = useState('');
  const [loading,  setLoading]    = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || 'Registration failed. Please try again.');
        return;
      }

      setSuccess('Account created — signing you in…');

      // Auto-login after signup
      const body = new URLSearchParams({ username, password });
      const tokenRes = await fetch(`${API}/api/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (tokenRes.ok) {
        const { access_token } = await tokenRes.json();
        localStorage.setItem('astronotes_token', access_token);
        localStorage.setItem('astronotes_username', username);
      }

      router.push('/transcripts');
    } catch {
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.fieldGroup}>
        <label htmlFor="username" className={styles.label}>Username</label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          placeholder="navigator"
          className={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="password" className={styles.label}>Password</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="min. 8 characters"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="confirm" className={styles.label}>Confirm Password</label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          className={styles.input}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>

      {error   && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? 'Charting course…' : 'Create Account'}
      </button>

      <p className={styles.cardFooter}>
        Already have an account?{' '}
        <Link href="/login">Sign in</Link>
      </p>
    </form>
  );
}
