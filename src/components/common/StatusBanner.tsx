import React from 'react';
import { Info, OctagonAlert, TriangleAlert } from 'lucide-react';
import { Selo, type TomSelo } from './Icones';

const TONE = {
  danger: 'border-red-500/60 bg-red-950/70 text-red-200',
  warn: 'border-amber-500/60 bg-amber-950/60 text-amber-200',
  info: 'border-sky-500/50 bg-sky-950/60 text-sky-200',
} as const;

const SELO_DO_TOM: Record<keyof typeof TONE, TomSelo> = { danger: 'vermelho', warn: 'ambar', info: 'azul' };
const ICONE_DO_TOM = { danger: <OctagonAlert />, warn: <TriangleAlert />, info: <Info /> };

/** Aviso de estado (tempo esgotado, respostas bloqueadas, sala encerrada): mesmo visual em todo o sistema. */
export const StatusBanner: React.FC<{ tone?: keyof typeof TONE; size?: 'normal' | 'big'; children: React.ReactNode }> = ({ tone = 'danger', size = 'normal', children }) => (
  <p role="status" className={`flex items-center justify-center gap-3 rounded-2xl border px-5 py-3 text-center font-black ${size === 'big' ? 'text-2xl py-4' : 'text-sm sm:text-base'} ${TONE[tone]}`}>
    <Selo tom={SELO_DO_TOM[tone]} tamanho={size === 'big' ? 'lg' : 'sm'}>{ICONE_DO_TOM[tone]}</Selo>
    <span>{children}</span>
  </p>
);
