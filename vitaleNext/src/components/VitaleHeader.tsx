'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { VitaleLogo } from '@/components/VitaleLogo';

interface VitaleHeaderProps {
  variant?: 'public' | 'authenticated';
}

// Cabeçalho acessível sem menus ocultos complexos e com alvos de toque >= 48px
export function VitaleHeader({ variant = 'authenticated' }: VitaleHeaderProps) {
  const { usuario, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  const primeiroNome = usuario?.nome?.trim().split(/\s+/)[0] || 'Paciente';

  async function handleLogout() {
    setSaindo(true);
    try {
      await signOut();
      router.replace('/login');
    } finally {
      setSaindo(false);
    }
  }

  if (variant === 'public') {
    return (
      <header className="sticky top-0 z-40 w-full bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(28,25,23,0.05)] border-b border-outline-variant/30">
        <div className="min-h-[72px] max-w-7xl mx-auto px-margin-mobile lg:px-margin flex items-center justify-between gap-4">
          <Link
            href="/login"
            className="min-h-[48px] inline-flex items-center rounded-lg px-2 hover:opacity-90 transition-opacity"
          >
            <VitaleLogo className="h-10 w-auto" />
          </Link>

          <nav aria-label="Acesso à conta" className="flex items-center gap-3">
            <Link
              href="/login"
              className={`min-h-[48px] px-4 rounded-xl inline-flex items-center justify-center font-semibold text-[16px] transition-colors ${
                pathname === '/login'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className={`min-h-[48px] px-4 rounded-xl inline-flex items-center justify-center font-semibold text-[16px] transition-colors ${
                pathname === '/cadastro'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'border-2 border-primary text-primary hover:bg-primary-fixed/30'
              }`}
            >
              Criar conta
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  const emSintomas = pathname?.startsWith('/sintomas');
  const emPerfil = pathname?.startsWith('/perfil');

  return (
    <header className="sticky top-0 z-40 w-full bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(28,25,23,0.05)] border-b border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-margin-mobile lg:px-margin py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link
            href="/sintomas"
            className="min-h-[48px] inline-flex items-center rounded-lg px-1 hover:opacity-90 transition-opacity"
          >
            <VitaleLogo className="h-10 w-auto" />
          </Link>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-outline-variant/60">
            <span className="text-[18px] text-on-surface-variant">Olá,</span>
            <span className="text-[18px] font-bold text-on-surface">
              {primeiroNome}
            </span>
          </div>
        </div>

        <nav
          aria-label="Navegação principal"
          className="flex flex-wrap items-center gap-2 sm:gap-3"
        >
          <Link
            href="/sintomas"
            aria-current={emSintomas ? 'page' : undefined}
            className={`min-h-[48px] px-4 rounded-xl inline-flex items-center gap-2 font-semibold text-[16px] transition-all ${
              emSintomas
                ? 'bg-primary-container text-on-primary-container shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
              medical_services
            </span>
            <span>Triagem</span>
          </Link>

          <Link
            href="/perfil"
            aria-current={emPerfil ? 'page' : undefined}
            className={`min-h-[48px] px-4 rounded-xl inline-flex items-center gap-2 font-semibold text-[16px] transition-all ${
              emPerfil
                ? 'bg-primary-container text-on-primary-container shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
              person
            </span>
            <span>Meu Perfil</span>
          </Link>

          <button
            type="button"
            disabled={saindo}
            onClick={handleLogout}
            className="min-h-[48px] px-4 rounded-xl border-2 border-outline-variant bg-surface-container-lowest text-on-surface font-semibold text-[16px] hover:bg-error-container hover:text-on-error-container hover:border-error/40 transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
              logout
            </span>
            <span>{saindo ? 'Saindo...' : 'Sair'}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
