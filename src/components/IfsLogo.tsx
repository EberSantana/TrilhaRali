import React from 'react';

interface IfsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  lightText?: boolean;
}

/**
 * Authentic brandmark of Instituto Federal (Rede Federal de Educação Profissional, Científica e Tecnológica).
 * Geometry: 3x3 modular matrix with red rounded focal point (top-left) representing the student/person,
 * and green rounded rectangles forming the iconic "IF" silhouette.
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
      {/* Official IFS Vector Mark (Pantone 186 C / #C9252B Red & Pantone 347 C / #2F9E41 Green) */}
      <svg 
        width={s} 
        height={s} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
        aria-label="Logotipo do Instituto Federal de Sergipe"
      >
        {/* Red element: Top-left circle (The student / human center) */}
        <circle cx="17" cy="17" r="17" fill="#D9252C" />

        {/* Green elements: The iconic "IF" layout of rounded squares */}
        {/* Col 1, Row 2 */}
        <rect x="0" y="40" width="34" height="26" rx="8" fill="#168821" />
        {/* Col 1, Row 3 */}
        <rect x="0" y="72" width="34" height="28" rx="8" fill="#168821" />

        {/* Col 2, Row 1 */}
        <rect x="40" y="0" width="26" height="34" rx="8" fill="#168821" />
        {/* Col 2, Row 2 */}
        <rect x="40" y="40" width="26" height="26" rx="8" fill="#168821" />
        {/* Col 2, Row 3 */}
        <rect x="40" y="72" width="26" height="28" rx="8" fill="#168821" />

        {/* Col 3, Row 1 */}
        <rect x="72" y="0" width="28" height="34" rx="8" fill="#168821" />
        {/* Col 3, Row 2 */}
        <rect x="72" y="40" width="28" height="26" rx="8" fill="#168821" />
      </svg>

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
