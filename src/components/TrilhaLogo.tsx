import React from 'react';
import markEscuro from '../assets/trilha-rali-mark.png';
import logoEscuro from '../assets/trilha-rali-logo.png';
import markClaro from '../assets/trilha-rali-mark-claro.png';
import logoClaro from '../assets/trilha-rali-logo-claro.png';
import { useTheme } from '../utils/theme';

interface TrilhaLogoProps {
  /** 'mark' = só o símbolo (bandeira + estrada); 'full' = logo completa com o nome e o lema */
  variant?: 'mark' | 'full';
  /** altura em px */
  height?: number;
  className?: string;
}

/**
 * Logo do portal Trilha Rali. A arte original usa branco nos detalhes (estrada, pino, bandeira, "TRILHA"),
 * que some em fundo claro: no tema claro entra a versão com esses detalhes em azul-ardósia.
 */
export const TrilhaLogo: React.FC<TrilhaLogoProps> = ({ variant = 'mark', height = 40, className = '' }) => {
  const claro = useTheme() === 'claro';
  const src = variant === 'full' ? (claro ? logoClaro : logoEscuro) : claro ? markClaro : markEscuro;
  return (
    <img
      src={src}
      alt="Trilha Rali — Etapas, Desafios, Conhecimento"
      style={{ height, width: 'auto' }}
      className={`shrink-0 object-contain select-none ${className}`}
      draggable={false}
    />
  );
};
