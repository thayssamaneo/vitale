'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Guarda de rota protegida: impede acesso não autenticado às rotas clínicas
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace('/login');
    }
  }, [loading, firebaseUser, router]);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center gap-4"
        role="status"
        aria-live="polite"
      >
        <div className="w-14 h-14 rounded-full border-4 border-primary-fixed border-t-primary animate-spin" />
        <p className="text-[20px] font-semibold text-on-surface">
          Preparando seu atendimento com segurança...
        </p>
        <p className="text-[18px] text-on-surface-variant">
          Aguarde só um instante.
        </p>
      </div>
    );
  }

  if (!firebaseUser) {
    return null;
  }

  return <>{children}</>;
}
