import React from 'react';
import trilhaMark from '../assets/trilha-rali-mark.png';
import trilhaLogo from '../assets/trilha-rali-logo.png';

interface TrilhaLogoProps {
  /** 'mark' = só o símbolo (bandeira + estrada); 'full' = logo completa com o nome e o lema */
  variant?: 'mark' | 'full';
  /** altura em px */
  height?: number;
  className?: string;
}

/** Logo do portal Trilha Rali. */
export const TrilhaLogo: React.FC<TrilhaLogoProps> = ({ variant = 'mark', height = 40, className = '' }) => (
  <img
    src={variant === 'full' ? trilhaLogo : trilhaMark}
    alt="Trilha Rali — Etapas, Desafios, Conhecimento"
    style={{ height, width: 'auto' }}
    className={`shrink-0 object-contain select-none ${className}`}
    draggable={false}
  />
);
