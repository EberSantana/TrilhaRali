import React from 'react';

/** Identidade 3: monograma TR geométrico, legível em tamanhos pequenos. */
export const LogoClean3: React.FC<{compact?:boolean; dark?:boolean}> = ({compact=false,dark=false}) => (
  <div className="flex items-center gap-2.5" aria-label="Trilha Rali HUB">
    <svg viewBox="0 0 64 64" width="46" height="46" role="img" aria-label="Monograma TR">
      <rect width="64" height="64" rx="15" fill="#062B23"/>
      <path d="M12 17h28v8H30v24h-9V25h-9z" fill="#F5FFF7"/>
      <path d="M36 17h9c11 0 14 14 4 19l9 13H47l-8-12h-3v12h-8v-8h8V25h-4v-8z" fill="#00C853"/>
      <path d="M43 25h-7v6h7c4 0 4-6 0-6z" fill="#062B23"/>
      <circle cx="51" cy="13" r="3" fill="#00C853"/>
    </svg>
    {!compact && <div className="leading-tight">
      <div className={`font-extrabold tracking-tight text-[17px] ${dark?'text-white':'text-[#102B28]'}`}>TRILHA <span className="text-[#008D45]">RALI</span></div>
      <div className="text-[10px] font-bold tracking-[.19em] text-[#008D45]">HUB EDUCACIONAL</div>
    </div>}
  </div>
);
