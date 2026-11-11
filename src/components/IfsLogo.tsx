import React from 'react';
import ifsMark from '../assets/ifs-mark.png';

interface IfsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  lightText?: boolean;
}

/**
 * Marca do Instituto Federal (imagem oficial: 4 linhas x 3 colunas, círculo vermelho no topo à esquerda).
 */
export const IfsLogo: React.FC<IfsLogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = false,
  lightText = true 
}) => {
  const pixelSizes = {
    sm: 28,
    md: 40,
    lg: 52,
    xl: 68,
  };

  const s = pixelSizes[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <img
        src={ifsMark}
        alt="Logotipo do Instituto Federal"
        height={s}
        width={Math.round(s * 0.73)}
        style={{ height: s, width: 'auto' }}
        className="shrink-0 drop-shadow-md object-contain"
        draggable={false}
      />

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline gap-1.5">
            <span className={`font-black tracking-tight ${lightText ? 'text-white' : 'text-slate-900'} ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>
              INSTITUTO FEDERAL
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase mt-0.5">
            Sergipe • Campus Tobias Barreto
          </span>
        </div>
      )}
    </div>
  );
};
