'use client';

import React from 'react';
import { RegiaoCorporalId } from '@/types/vitale';

// Ícones anatômicos em SVG extraídos do protótipo Stitch (Tela Sintomas Versão 2)
export function RegiaoIcon({ regiao }: { regiao: RegiaoCorporalId }) {
  switch (regiao) {
    case 'cabeca':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 4C10.5 4 6 8.5 6 14C6 18.2 8.6 21.8 12.3 23.3L12.5 28H19.5L19.7 23.3C23.4 21.8 26 18.2 26 14C26 8.5 21.5 4 16 4Z" />
          <path d="M12 15C12 15 13.5 16 16 16C18.5 16 20 15 20 15" />
          <path d="M11 11H11.02" strokeWidth="3" />
          <path d="M21 11H21.02" strokeWidth="3" />
        </svg>
      );
    case 'olhos_ouvidos':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M4 16C4 16 8.5 9 16 9C23.5 9 28 16 28 16C28 16 23.5 23 16 23C8.5 23 4 16 4 16Z" />
          <circle cx="16" cy="16" fill="currentColor" fillOpacity="0.2" r="4" />
          <path d="M16 14A2 2 0 1 0 16 18A2 2 0 1 0 16 14Z" strokeWidth="2" />
        </svg>
      );
    case 'garganta':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M11 6C11 12 12 15 12 20C12 24 10 26 8 28H24C22 26 20 24 20 20C20 15 21 12 21 6" />
          <path d="M14 13L16 15L18 13" strokeWidth="2" />
          <path d="M13 18C14.5 19.5 17.5 19.5 19 18" />
        </svg>
      );
    case 'peito':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 6V18" />
          <path d="M16 14C13 10 7 10 7 17C7 24 13 26 15 26" />
          <path d="M16 14C19 10 25 10 25 17C25 24 19 26 17 26" />
          <path d="M11 18H13" />
          <path d="M19 18H21" />
        </svg>
      );
    case 'estomago':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 5V10C16 10 13 10 11 12C9 14 8 18 8 20C8 25 13 27 18 27C23 27 25 23 25 19C25 14 22 13 20 13" />
          <path d="M13 18C15 20 18 20 20 18" />
        </svg>
      );
    case 'costas':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="16" cy="8" r="2.5" />
          <circle cx="16" cy="14" r="2.5" />
          <circle cx="16" cy="20" r="2.5" />
          <circle cx="16" cy="26" r="2.5" />
          <path d="M11 11C13 12.5 19 12.5 21 11" />
          <path d="M10 17C13 19 19 19 22 17" />
          <path d="M9 23C13 25.5 19 25.5 23 23" />
        </svg>
      );
    case 'bracos':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M8 26L14 16L18 18L13 28H8Z" />
          <path d="M18 18L24 8C25 6 27 6 28 8C29 10 27 12 25 14L19 22" />
          <circle cx="25" cy="8" fill="currentColor" r="1.5" />
        </svg>
      );
    case 'pernas':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M12 4L13 14C13 16 12 18 11 22L10 28H15L17 21C18 17 18 15 17 14L16 4H12Z" />
          <circle cx="15" cy="15" r="2" strokeWidth="1.5" />
          <path d="M19 14C20.5 15.5 22 17 22 20" strokeWidth="1.5" />
        </svg>
      );
    case 'pes':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M13 5V17L7 20C6 20.5 6 22 7 23C9 25 15 27 23 27C26 27 27 25 27 23C27 21 25 18 22 18H18V5H13Z" />
          <path d="M9 22C12 23.5 17 24 21 24" strokeWidth="1.5" />
        </svg>
      );
  }
}

interface AnatomicalMapProps {
  modoVisao: 'frente' | 'costas';
  regioesSelecionadas: Set<RegiaoCorporalId>;
  onToggleRegiao: (regiao: RegiaoCorporalId) => void;
}

interface HotspotConfig {
  id: RegiaoCorporalId;
  label: string;
  positionClass: string;
  labelSide: 'left' | 'right';
}

// Mapa anatômico interativo fiel ao protótipo Stitch com áreas de toque >= 48x48px
export function AnatomicalMap({
  modoVisao,
  regioesSelecionadas,
  onToggleRegiao,
}: AnatomicalMapProps) {
  const hotspots: HotspotConfig[] = [
    {
      id: 'cabeca',
      label: 'Cabeça',
      positionClass: 'left-[50%] top-[8%] -translate-x-1/2 -translate-y-1/2',
      labelSide: 'right',
    },
    {
      id: 'garganta',
      label: 'Garganta',
      positionClass: 'left-[50%] top-[16%] -translate-x-1/2 -translate-y-1/2',
      labelSide: 'right',
    },
    {
      id: modoVisao === 'frente' ? 'peito' : 'costas',
      label: modoVisao === 'frente' ? 'Peito e Pulmão' : 'Costas e Lombar',
      positionClass: 'left-[50%] top-[26%] -translate-x-1/2 -translate-y-1/2',
      labelSide: 'right',
    },
    ...(modoVisao === 'frente'
      ? [
          {
            id: 'estomago' as RegiaoCorporalId,
            label: 'Estômago',
            positionClass: 'left-[50%] top-[38%] -translate-x-1/2 -translate-y-1/2',
            labelSide: 'right' as const,
          },
        ]
      : []),
    {
      id: 'bracos',
      label: 'Braços',
      positionClass: 'left-[21%] top-[39%] -translate-x-1/2 -translate-y-1/2',
      labelSide: 'left',
    },
    {
      id: 'bracos',
      label: 'Braços',
      positionClass: 'left-[79%] top-[39%] -translate-x-1/2 -translate-y-1/2',
      labelSide: 'right',
    },
    {
      id: 'pernas',
      label: 'Pernas e Joelhos',
      positionClass: 'left-[41%] top-[70%] -translate-x-1/2 -translate-y-1/2',
      labelSide: 'left',
    },
    {
      id: 'pes',
      label: 'Pés e Tornozelos',
      positionClass: 'left-[50%] top-[91%] -translate-x-1/2 -translate-y-1/2',
      labelSide: 'right',
    },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/40 flex flex-col items-center relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-secondary-fixed/40 blur-3xl pointer-events-none"
      />

      <div className="w-full flex items-center justify-between pb-3 mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[24px]" aria-hidden="true">
            touch_app
          </span>
          <span className="text-[18px] text-on-surface font-semibold">
            Toque nos pontos
          </span>
        </div>
        <span
          className={`text-[16px] px-3 py-1 rounded-full font-semibold ${
            regioesSelecionadas.size > 0
              ? 'bg-primary-fixed text-on-primary-fixed-variant'
              : 'bg-surface-container text-on-surface-variant'
          }`}
        >
          {regioesSelecionadas.size}{' '}
          {regioesSelecionadas.size === 1 ? 'área' : 'áreas'}
        </span>
      </div>

      <div className="relative w-full max-w-[330px] aspect-[1/1.9] flex items-center justify-center py-2 select-none">
        <svg
          aria-label="Ilustração do corpo humano para seleção de áreas com desconforto"
          className="w-full h-full drop-shadow-xs"
          fill="none"
          viewBox="0 0 300 570"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse
            className="text-surface-container-high/60"
            cx="150"
            cy="552"
            fill="currentColor"
            rx="90"
            ry="10"
          />
          <g className="text-surface-container-highest transition-colors duration-300">
            <ellipse cx="150" cy="46" fill="currentColor" rx="27" ry="32" />
            <path d="M141 76 H159 V96 H141 Z" fill="currentColor" />
            <path
              d="M150 94 
                 C125 94 105 106 94 126
                 C84 144 76 182 66 238
                 C62 262 58 290 56 312
                 C55 320 62 324 68 320
                 C74 316 86 288 92 254
                 C96 230 100 216 102 216
                 L104 330
                 C104 340 108 350 114 354
                 L114 430
                 C114 456 110 490 108 522
                 C107 534 114 540 124 540
                 C134 540 140 534 142 516
                 L146 414
                 C147 400 153 400 154 414
                 L158 516
                 C160 534 166 540 176 540
                 C186 540 193 534 192 522
                 C190 490 186 456 186 430
                 L186 354
                 C192 350 196 340 196 330
                 L198 216
                 C200 216 204 230 208 254
                 C214 288 226 316 232 320
                 C238 324 245 320 244 312
                 C242 290 238 262 234 238
                 C224 182 216 144 206 126
                 C195 106 175 94 150 94 Z"
              fill="currentColor"
            />
          </g>

          {modoVisao === 'frente' ? (
            <path
              className="stroke-surface-container-high"
              d="M150 108 V180 M134 135 Q150 142 166 135 M132 230 Q150 236 168 230"
              strokeLinecap="round"
              strokeWidth="2.5"
            />
          ) : (
            <path
              className="stroke-surface-container-high"
              d="M150 90 V320 M130 140 Q150 155 170 140 M135 250 Q150 262 165 250"
              strokeDasharray="3 4"
              strokeLinecap="round"
              strokeWidth="2.5"
            />
          )}
        </svg>

        {hotspots.map((spot, idx) => {
          const selecionado = regioesSelecionadas.has(spot.id);
          return (
            <button
              key={`${spot.id}-${idx}`}
              type="button"
              aria-pressed={selecionado}
              aria-label={`${selecionado ? 'Remover' : 'Selecionar'} ${spot.label}`}
              onClick={() => onToggleRegiao(spot.id)}
              className={`group absolute ${spot.positionClass} min-w-[48px] min-h-[48px] flex items-center justify-center cursor-pointer rounded-full`}
            >
              <span
                className={`relative flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-lowest shadow-md border-2 transition-transform duration-200 group-hover:scale-110 ${
                  selecionado
                    ? 'scale-115 border-secondary-container shadow-lg'
                    : 'border-outline-variant'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full transition-colors duration-200 ${
                    selecionado ? 'bg-secondary-container' : 'bg-outline'
                  }`}
                />
              </span>
              <span
                className={`pointer-events-none hidden sm:block absolute ${
                  spot.labelSide === 'right' ? 'left-12' : 'right-12'
                } whitespace-nowrap bg-on-surface text-surface px-3 py-1 rounded-md text-[16px] font-semibold opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity shadow-sm z-20`}
              >
                {spot.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-surface-container-low rounded-xl w-full flex items-start gap-3 text-on-surface-variant relative z-10">
        <span className="material-symbols-outlined text-primary text-[24px] shrink-0 mt-0.5" aria-hidden="true">
          info
        </span>
        <p className="text-[16px] leading-[24px]">
          Você pode tocar em mais de uma parte do corpo ou escolher direto na lista ao lado.
        </p>
      </div>
    </div>
  );
}
