import React, { useId } from 'react';

export type Papel = 'piloto' | 'copiloto' | 'engenheiro';

export const PAPEIS: Record<Papel, { nome: string; funcao: string; casco: string; casco2: string; viseira: [string, string]; faixa: string; numero: string; texto: string; borda: string; fundo: string }> = {
  piloto: {
    nome: 'Piloto',
    funcao: 'Fica com o celular ou o teclado e envia a resposta.',
    casco: '#ef4444', casco2: '#991b1b', viseira: ['#0b1220', '#475569'], faixa: '#fbbf24', numero: '1',
    texto: 'text-red-300', borda: 'border-red-500/50', fundo: 'bg-red-500/10',
  },
  copiloto: {
    nome: 'Copiloto',
    funcao: 'Lê as pistas, anota no caderno e orienta a próxima jogada.',
    casco: '#22c55e', casco2: '#15803d', viseira: ['#7c2d12', '#fbbf24'], faixa: '#f8fafc', numero: '2',
    texto: 'text-emerald-300', borda: 'border-emerald-500/50', fundo: 'bg-emerald-500/10',
  },
  engenheiro: {
    nome: 'Engenheiro de pista',
    funcao: 'Confere a resposta antes de enviar.',
    casco: '#3b82f6', casco2: '#1e3a8a', viseira: ['#0b1220', '#475569'], faixa: '#f8fafc', numero: '3',
    texto: 'text-sky-300', borda: 'border-sky-500/50', fundo: 'bg-sky-500/10',
  },
};

/** Ordem dos papéis na dupla/trio. */
export const ORDEM_PAPEIS: Papel[] = ['piloto', 'copiloto', 'engenheiro'];

/** Pintura de cada capacete: faixa principal e filete. */
const PINTURA: Record<Papel, { faixa: string; filete: string }> = {
  piloto: { faixa: '#ffffff', filete: '#fbbf24' },
  copiloto: { faixa: '#ffffff', filete: '#0f172a' },
  engenheiro: { faixa: '#ffffff', filete: '#38bdf8' },
};

const CASCO = 'M16 56C8 46 8 28 18 18 28 8 46 4 62 6c14 2 24 10 28 20 3 7 4 14 3 22-1 8-4 13-10 16l-25 2c-12 0-28-2-36-6Z';

/**
 * Capacete de Fórmula 1 em vista lateral (desenho próprio): casco com brilho, aerofólio traseiro, viseira com
 * parafuso de pivô, entradas de ar na queixeira, pintura em faixa e número de carro. O engenheiro de pista usa
 * fone de rádio com microfone.
 */
export const Capacete: React.FC<{ papel: Papel; size?: number; className?: string; title?: string }> = ({ papel, size = 48, className = '', title }) => {
  const p = PAPEIS[papel];
  const t = PINTURA[papel];
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="2 2 96 70" width={size} height={size * 0.73} className={className} role="img" aria-label={title ?? p.nome}>
      <defs>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.casco} />
          <stop offset="1" stopColor={p.casco2} />
        </linearGradient>
        <linearGradient id={`v${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.viseira[1]} />
          <stop offset=".5" stopColor={p.viseira[0]} />
          <stop offset="1" stopColor={p.viseira[0]} />
        </linearGradient>
        <radialGradient id={`h${id}`} cx=".35" cy=".25" r=".6">
          <stop offset="0" stopColor="#fff" stopOpacity=".45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`k${id}`}>
          <path d={CASCO} />
        </clipPath>
      </defs>
      <path d={CASCO} fill={`url(#s${id})`} stroke="#0f172a" strokeOpacity=".35" strokeWidth="1" />
      <g clipPath={`url(#k${id})`}>
        <path d="M4 47c18-7 36-1 52 6 14 6 26 7 40 1v20H4Z" fill={t.faixa} />
        <path d="M4 51c18-7 36-1 52 6 14 6 26 7 40 1v3c-14 6-27 5-40-1C40 53 22 47 4 55Z" fill={t.filete} />
        <path d="M20 16c10-6 24-8 38-6" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".9" />
        <rect width="100" height="80" fill={`url(#h${id})`} />
        <path d="M48 27c13-4 32-3 48 3v14c-14-3-32-3-46 0-4-4-5-12-2-17Z" fill={`url(#v${id})`} stroke="#0f172a" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M52 29c11-2 24-1 34 3" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity=".5" />
      </g>
      <path d="M22 15l16-7 2 4-15 7z" fill="#0f172a" />
      <circle cx="47" cy="36" r="3.2" fill="#0f172a" />
      <circle cx="47" cy="36" r="1.3" fill="#94a3b8" />
      <path d="M82 49h7M81 53h7" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" opacity=".55" />
      <rect x="20" y="28" width="16" height="13" rx="3" fill="#fff" />
      <text x="28" y="38.4" textAnchor="middle" fontSize="10" fontWeight="900" fontStyle="italic" fontFamily="system-ui, sans-serif" fill="#0f172a">
        {p.numero}
      </text>
      {papel === 'engenheiro' && (
        <g>
          <path d="M30 12C42 0 70 0 82 14" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          <rect x="78" y="12" width="9" height="14" rx="3" fill="#0f172a" />
          <rect x="80" y="15" width="5" height="8" rx="2" fill={t.filete} />
          <path d="M84 26c3 10 0 20-8 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          <circle cx="75" cy="50" r="2.6" fill="#0f172a" />
        </g>
      )}
    </svg>
  );
};

/** Papel de cada integrante no caso atual: os papéis giram a cada caso resolvido. */
export function papeisDaRodada(integrantes: string[], rodada: number): { nome: string; papel: Papel }[] {
  const n = integrantes.length;
  if (!n) return [];
  return integrantes.map((_, i) => ({ nome: integrantes[(i + rodada) % n], papel: ORDEM_PAPEIS[i] }));
}
