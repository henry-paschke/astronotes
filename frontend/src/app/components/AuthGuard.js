'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('astronotes_token')) {
      router.replace('/login');
    }
  }, [router]);

  // Render immediately — NavBar verifies the token in the background
  // and will clear stale state if it's expired.
  if (typeof window !== 'undefined' && !localStorage.getItem('astronotes_token')) {
    return null;
  }
  return children;
}
