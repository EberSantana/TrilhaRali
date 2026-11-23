import React from 'react';
import { TrilhaMarca, TrilhaNome } from './TrilhaMarca';
import { useTheme } from '../utils/theme';

interface TrilhaLogoProps {
  /** 'mark' = só o símbolo; 'full' = símbolo com o nome e o lema */
  variant?: 'mark' | 'full';
  /** altura em px */
  height?: number | string;
  className?: string;
}

/** Logo da Trilha Rali em SVG (símbolo) + texto (nome), legível nos dois temas. */
export const TrilhaLogo: React.FC<TrilhaLogoProps> = ({ variant = 'mark', height = 40, className = '' }) => {
  const claro = useTheme() === 'claro';
  if (variant === 'mark') return <TrilhaMarca size={height} className={className} title="Trilha Rali" />;
  const h = typeof height === 'number' ? height : 150;
  return (
    <div className={`inline-flex flex-col items-center ${className}`} role="img" aria-label="Trilha Rali, HUB de ferramentas gamificadas">
      <TrilhaMarca size={h * 0.62} />
      <TrilhaNome tom={claro ? 'sobre-claro' : 'sobre-escuro'} className="items-center" style={{ fontSize: h * 0.17 }} />
      <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">HUB de ferramentas gamificadas</span>
    </div>
  );
};
