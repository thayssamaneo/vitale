'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Redirecionamento inicial inteligente: usuários autenticados vão para /sintomas; demais para /login
export default function HomePage() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (firebaseUser) {
      router.replace('/sintomas');
    } else {
      router.replace('/login');
    }
  }, [firebaseUser, loading, router]);

  return (
    <main
      className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center gap-4"
      role="status"
      aria-live="polite"
    >
      <div className="w-14 h-14 rounded-full border-4 border-primary-fixed border-t-primary animate-spin" />
      <p className="text-[20px] font-semibold text-on-surface">
        Carregando a Plataforma Vitale...
      </p>
    </main>
  );
}
