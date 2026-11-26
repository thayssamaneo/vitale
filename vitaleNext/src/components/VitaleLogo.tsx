import React from 'react';

interface VitaleLogoProps {
  className?: string;
}

// Logotipo oficial Vitale extraído diretamente do Stitch (Novo Logotipo Vitale)
export function VitaleLogo({ className = 'h-11 w-auto' }: VitaleLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 54"
      fill="none"
      role="img"
      aria-label="Vitale Saúde"
      className={className}
    >
      <g transform="translate(4, 5)">
        <rect x="0" y="0" width="44" height="44" rx="14" fill="#0D9488" />
        <path
          d="M22 12V32M12 22H32"
          stroke="#99EBE3"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <circle cx="30" cy="14" r="3.5" fill="#EA580C" />
      </g>
      <text
        x="60"
        y="34"
        fontFamily="var(--font-plus-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif"
        fontSize="26"
        fontWeight="700"
        fill="#1E1B19"
        letterSpacing="-0.03em"
      >
        Vitale
      </text>
    </svg>
  );
}
