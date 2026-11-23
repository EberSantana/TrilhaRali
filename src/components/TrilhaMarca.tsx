import React, { useId } from 'react';

interface Props {
  /** largura e altura em px (ou valor CSS) */
  size?: number | string;
  /** desenha o quadrado azul-marinho atrás (ícone de app / favicon) */
  fundo?: boolean;
  className?: string;
  title?: string;
}

/** Símbolo da Trilha Rali em SVG: controle com capelo sobre a estrada verde. Nítido em qualquer tamanho e tema. */
export const TrilhaMarca: React.FC<Props> = ({ size = 48, fundo = false, className = '', title }) => {
  const id = useId().replace(/:/g, '');
  const g = `url(#tr-g-${id})`;
  return (
    <svg viewBox="0 0 128 128" width={size} height={size} className={`shrink-0 select-none ${className}`} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={`tr-g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3BE37A" />
          <stop offset="1" stopColor="#00A844" />
        </linearGradient>
      </defs>
      {fundo && <rect width="128" height="128" rx="28" fill="#0B1F3B" />}
      <path d="M8 116 C 34 92, 92 130, 122 98" fill="none" stroke={g} strokeWidth="11" strokeLinecap="round" />
      <path d="M16 113 C 40 97, 90 125, 116 101" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 7" />
      <path d="M30 50 h68 c12 0 18 10 20 24 l3 16 c2 11-9 16-16 8 l-10-11 H33 l-10 11 c-7 8-18 3-16-8 l3-16 c2-14 8-24 20-24z" fill="#0B1F3B" stroke={g} strokeWidth="3.5" />
      <rect x="27" y="64" width="18" height="6" rx="1.5" fill="#fff" />
      <rect x="33" y="58" width="6" height="18" rx="1.5" fill="#fff" />
      <circle cx="92" cy="60" r="4.2" fill="#FACC15" />
      <circle cx="101" cy="67" r="4.2" fill="#EF4444" />
      <circle cx="83" cy="67" r="4.2" fill="#3B82F6" />
      <circle cx="92" cy="74" r="4.2" fill="#22C55E" />
      <path d="M64 8 L102 23 L64 38 L26 23 Z" fill="#0B1F3B" stroke={g} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M44 30 v11 c0 6 40 6 40 0 v-11 L64 38z" fill="#0B1F3B" stroke={g} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M64 23 L96 28 v14" fill="none" stroke="#FACC15" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M93 41 h6 l1.5 9 h-9z" fill="#FACC15" />
    </svg>
  );
};

/** Nome "TRILHA RALI" em texto (Orbitron). `tom` = cor de TRILHA: claro no fundo escuro, marinho no fundo claro. */
export const TrilhaNome: React.FC<{ tom?: 'sobre-escuro' | 'sobre-claro'; className?: string; style?: React.CSSProperties }> = ({ tom = 'sobre-escuro', className = '', style }) => (
  <span className={`font-marca inline-flex flex-col leading-[0.9] ${className}`} style={style}>
    <span style={{ color: tom === 'sobre-escuro' ? '#FFFFFF' : '#0B1F3B' }}>TRILHA</span>
    <span style={{ color: tom === 'sobre-escuro' ? '#3BE37A' : '#00873A' }}>RALI</span>
  </span>
);
