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
