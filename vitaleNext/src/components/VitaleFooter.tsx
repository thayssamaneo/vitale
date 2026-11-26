import React from 'react';

// Rodapé institucional acessível seguindo o Design System Vitale
export function VitaleFooter() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/40 mt-auto">
      <div className="max-w-7xl mx-auto px-margin-mobile lg:px-margin py-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md text-center md:text-left">
        <p className="text-[16px] leading-[26px] text-on-surface-variant font-medium">
          Vitale • Cuidado humanizado e tecnologia acessível para a sua saúde.
        </p>
        <p className="text-[16px] leading-[24px] text-on-surface-variant">
          © 2026 Vitale Saúde. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
