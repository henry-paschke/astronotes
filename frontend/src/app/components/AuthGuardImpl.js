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

  // Always render children — ssr:false guarantees this only runs on the client,
  // so localStorage is safe to read. Redirect happens after first paint.
  if (!localStorage.getItem('astronotes_token')) return null;
  return children;
}
