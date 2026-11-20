import React from 'react';
import { Flame } from 'lucide-react';

/** Ícone de "primeira captura" (CTF dinâmico), no tamanho do texto ao redor. */
export const Fogo: React.FC<{ className?: string; title?: string }> = ({ className = '', title = 'Primeira captura' }) => (
  <Flame className={`inline-block h-[1em] w-[1em] shrink-0 align-[-0.125em] ${className}`} aria-label={title} role="img" />
);

const PODIO: Record<number, string> = {
  1: 'bg-gradient-to-b from-amber-200 to-amber-500 text-amber-950 ring-amber-300/60',
  2: 'bg-gradient-to-b from-slate-100 to-slate-400 text-slate-900 ring-slate-200/60',
  3: 'bg-gradient-to-b from-orange-300 to-orange-700 text-orange-950 ring-orange-400/60',
};

/** Posição no ranking: medalha (ouro, prata, bronze) para o pódio e número simples para os demais. */
export const Medalha: React.FC<{ pos: number; className?: string }> = ({ pos, className = '' }) =>
  PODIO[pos] ? (
    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black shadow ring-2 ${PODIO[pos]} ${className}`} aria-label={`${pos}º lugar`}>
      {pos}
    </span>
  ) : (
    <span className={`inline-flex h-7 w-7 items-center justify-center text-sm font-black text-slate-400 ${className}`}>{pos}</span>
  );

const SELO = {
  laranja: 'from-orange-400 to-red-600 shadow-orange-900/30',
  ambar: 'from-amber-300 to-amber-600 shadow-amber-900/30',
  verde: 'from-emerald-400 to-emerald-700 shadow-emerald-900/30',
  ciano: 'from-cyan-400 to-sky-700 shadow-sky-900/30',
  violeta: 'from-violet-400 to-violet-700 shadow-violet-900/30',
  vermelho: 'from-rose-400 to-red-700 shadow-red-900/30',
  azul: 'from-sky-400 to-blue-700 shadow-blue-900/30',
  grafite: 'from-slate-500 to-slate-800 shadow-slate-950/30',
} as const;

export type TomSelo = keyof typeof SELO;

const TAM = { sm: 'h-6 w-6 rounded-md [&>svg]:h-3.5 [&>svg]:w-3.5', md: 'h-8 w-8 rounded-lg [&>svg]:h-4 [&>svg]:w-4', lg: 'h-11 w-11 rounded-xl [&>svg]:h-5 [&>svg]:w-5' } as const;

/**
 * Selo de ícone: quadrado arredondado com degradê na cor do contexto, brilho no topo e ícone branco.
 * Usado nos destaques (avisos, gabarito, primeira captura, indicadores); ícones dentro do texto seguem só de traço.
 */
export const Selo: React.FC<{ tom: TomSelo; tamanho?: keyof typeof TAM; className?: string; children: React.ReactNode }> = ({ tom, tamanho = 'md', className = '', children }) => (
  <span
    aria-hidden
    className={`relative inline-flex shrink-0 items-center justify-center bg-gradient-to-br text-white shadow-md ring-1 ring-inset ring-white/25 ${SELO[tom]} ${TAM[tamanho]} [&>svg]:relative [&>svg]:drop-shadow-sm before:absolute before:inset-x-1 before:top-0.5 before:h-1/3 before:rounded-[inherit] before:bg-white/25 before:content-[''] ${className}`}
  >
    {children}
  </span>
);
