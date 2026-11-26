'use client';

import React, { useEffect, useState } from 'react';

// Cartão interativo de Respiração Guiada extraído do protótipo Stitch (Tela Recomendações)
export function BreathingExerciseCard() {
  const [ativo, setAtivo] = useState(true);
  const [inspirando, setInspirando] = useState(true);

  useEffect(() => {
    if (!ativo) return;
    const interval = setInterval(() => {
      setInspirando((prev) => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, [ativo]);

  return (
    <article className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/40 flex flex-col justify-between gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
              air
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary-fixed-dim/40 text-on-primary-fixed-variant text-[16px] font-semibold">
            Rítmico
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-[20px] leading-[28px] font-bold text-on-surface">
            Exercício de Respiração Guiada
          </h3>
          <p className="text-[18px] leading-[28px] text-on-surface-variant">
            Regule sua respiração para diminuir a tensão corporal e manter a calma.
          </p>
        </div>

        <div
          aria-live="polite"
          className="bg-surface-container rounded-xl p-5 flex flex-col gap-3 text-center"
        >
          <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-[3800ms] ease-in-out"
              style={{ width: inspirando ? '100%' : '25%' }}
            />
          </div>
          <span className="text-[18px] text-primary font-bold">
            {!ativo
              ? 'Exercício pausado. Toque abaixo para retomar.'
              : inspirando
                ? 'Inspire suavemente pelo nariz (4s)...'
                : 'Solte devagar pela boca relaxando (4s)...'}
          </span>
        </div>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/30">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
            self_improvement
          </span>
          <span className="text-[16px]">Sem pressa, no seu ritmo</span>
        </div>
        <button
          type="button"
          onClick={() => setAtivo((prev) => !prev)}
          className="min-h-[48px] px-4 rounded-xl border-2 border-primary text-primary hover:bg-primary-fixed/30 font-semibold text-[16px] transition-colors cursor-pointer"
        >
          {ativo ? 'Pausar guia' : 'Continuar guia'}
        </button>
      </div>
    </article>
  );
}
