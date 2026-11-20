import React, { useId } from 'react';

export type Papel = 'piloto' | 'copiloto' | 'engenheiro';

export const PAPEIS: Record<Papel, { nome: string; funcao: string; casco: string; casco2: string; viseira: [string, string]; faixa: string; numero: string; texto: string; borda: string; fundo: string }> = {
  piloto: {
    nome: 'Piloto',
    funcao: 'Fica com o celular ou o teclado e envia a resposta.',
    casco: '#ef4444', casco2: '#991b1b', viseira: ['#0f172a', '#334155'], faixa: '#fbbf24', numero: '1',
    texto: 'text-red-300', borda: 'border-red-500/50', fundo: 'bg-red-500/10',
  },
  copiloto: {
    nome: 'Copiloto',
    funcao: 'Lê as pistas, anota no caderno e orienta a próxima jogada.',
    casco: '#22c55e', casco2: '#15803d', viseira: ['#f59e0b', '#fde68a'], faixa: '#f8fafc', numero: '2',
    texto: 'text-green-300', borda: 'border-green-500/50', fundo: 'bg-green-500/10',
  },
  engenheiro: {
    nome: 'Engenheiro de pista',
    funcao: 'Confere a resposta antes de enviar.',
    casco: '#3b82f6', casco2: '#1e3a8a', viseira: ['#0f172a', '#334155'], faixa: '#f8fafc', numero: '3',
    texto: 'text-blue-300', borda: 'border-blue-500/50', fundo: 'bg-blue-500/10',
  },
};

/** Ordem dos papéis na dupla/trio. */
export const ORDEM_PAPEIS: Papel[] = ['piloto', 'copiloto', 'engenheiro'];

/**
 * Capacete de Fórmula 1 em vista lateral (desenho próprio). Piloto: casco vermelho e viseira escura; copiloto:
 * casco verde e viseira dourada espelhada; engenheiro de pista: fone de rádio sobre o capacete azul.
 */
export const Capacete: React.FC<{ papel: Papel; size?: number; className?: string; title?: string }> = ({ papel, size = 48, className = '', title }) => {
  const p = PAPEIS[papel];
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} role="img" aria-label={title ?? p.nome}>
      <defs>
        <linearGradient id={`c${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.casco} />
          <stop offset="1" stopColor={p.casco2} />
        </linearGradient>
        <linearGradient id={`v${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.viseira[1]} />
          <stop offset="0.55" stopColor={p.viseira[0]} />
          <stop offset="1" stopColor={p.viseira[0]} />
        </linearGradient>
      </defs>
      {/* sombra no chão */}
      <ellipse cx="33" cy="58" rx="22" ry="2.5" fill="#000" opacity="0.25" />
      {/* casco */}
      <path d="M8 38C8 20 21 9 36 9c14 0 22 10 22 22v11c0 6-4 11-10 11H21C13 53 8 47 8 38Z" fill={`url(#c${id})`} />
      {/* aerofólio traseiro */}
      <path d="M9 21l9-6 3 3-9 6z" fill={p.casco2} />
      {/* faixa de pintura */}
      <path d="M11 37C13 22 24 13 38 13" fill="none" stroke={p.faixa} strokeWidth="3" strokeLinecap="round" />
      <path d="M13 43c5 2 11 3 17 3" fill="none" stroke={p.faixa} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      {/* viseira */}
      <path d="M29 24c10-3 21-1 28 5v8c-8-3-18-3-27-1-3-3-4-9-1-12Z" fill={`url(#v${id})`} stroke="#0b1120" strokeWidth="1.2" />
      <path d="M33 26c7-1 14 0 20 3" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
      {/* queixeira com entradas de ar */}
      <path d="M44 41h12M45 45h10" stroke="#0b1120" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
      {/* número */}
      <circle cx="21" cy="33" r="6" fill="#f8fafc" />
      <text x="21" y="36.5" textAnchor="middle" fontSize="9" fontWeight="900" fontFamily="system-ui, sans-serif" fill="#0f172a">
        {p.numero}
      </text>
      {papel === 'engenheiro' && (
        <g fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round">
          <path d="M14 30C14 12 46 6 52 22" />
          <path d="M52 24v6" strokeWidth="5" />
          <path d="M52 30c0 6-5 9-11 9" strokeWidth="1.8" />
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
