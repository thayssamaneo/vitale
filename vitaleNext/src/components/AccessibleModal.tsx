'use client';

import React, { useEffect } from 'react';

interface AccessibleModalProps {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

// Modal de confirmação acessível (WCAG 2.1 AA) com foco claro e alvos >= 48px
export function AccessibleModal({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = 'Sim, confirmar',
  textoCancelar = 'Cancelar',
  carregando = false,
  onConfirmar,
  onCancelar,
}: AccessibleModalProps) {
  useEffect(() => {
    if (!aberto) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !carregando) {
        onCancelar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aberto, carregando, onCancelar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-confirmacao-titulo"
      aria-describedby="modal-confirmacao-descricao"
    >
      <div className="w-full max-w-lg rounded-xl bg-surface-container-lowest p-6 md:p-8 shadow-xl border border-outline-variant/50 flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
              warning
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <h2
              id="modal-confirmacao-titulo"
              className="text-[22px] leading-[30px] font-bold text-on-surface"
            >
              {titulo}
            </h2>
            <p
              id="modal-confirmacao-descricao"
              className="text-[18px] leading-[28px] text-on-surface-variant"
            >
              {mensagem}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={carregando}
            onClick={onCancelar}
            className="min-h-[52px] px-6 rounded-lg border-2 border-outline text-on-surface font-semibold text-[18px] hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            disabled={carregando}
            onClick={onConfirmar}
            className="min-h-[52px] px-6 rounded-lg bg-error text-on-error font-semibold text-[18px] hover:bg-on-error-container transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
              delete
            </span>
            <span>{carregando ? 'Removendo...' : textoConfirmar}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
