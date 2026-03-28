'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'http://localhost:8000';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('astronotes_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    fetch(`${API}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.ok) setAuthorized(true);
        else {
          localStorage.removeItem('astronotes_token');
          router.replace('/login');
        }
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  if (!authorized) return null;
  return children;
}
