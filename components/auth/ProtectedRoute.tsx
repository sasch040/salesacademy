'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else {
      setChecking(false);
    }
  }, [user, router]);

  if (checking) return null; // oder Spinner anzeigen

  return <>{children}</>;
}
