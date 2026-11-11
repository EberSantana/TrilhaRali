import React from 'react';
import { Crown } from 'lucide-react';
import type { RankChange } from '../../utils/ctfRank';

/* Peças visuais compartilhadas pelo Top 5, pelo telão e pelo resultado final.
 * Cores de medalha e de avatar são fixas (não mudam com o tema claro/escuro). */

export const MEDAL = [
  { from: '#fcd34d', to: '#d98e0b', ring: '#f5b83a', ink: '#3b2503' },
  { from: '#f1f5f9', to: '#9aa6b8', ring: '#b7c0ce', ink: '#1f2937' },
  { from: '#f6b57a', to: '#b8672a', ring: '#d58a4c', ink: '#3a1d06' },
] as const;

export function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = Array.from(parts[0])[0] || '?';
  const second = parts.length > 1 ? Array.from(parts[parts.length - 1])[0] || '' : '';
  return (first + second).toUpperCase();
}

function hue(nome: string): number {
  let h = 0;
  for (const ch of nome) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

interface AvatarProps {
  nome: string;
  className?: string;
  /** anel de medalha (0 = ouro, 1 = prata, 2 = bronze) */
  medal?: number;
}

/** Avatar com as iniciais; a cor vem do nome, então a mesma pessoa tem sempre a mesma cor. */
export const Avatar: React.FC<AvatarProps> = ({ nome, className = 'w-9 h-9 text-sm', medal }) => (
  <span
    aria-hidden
    className={`inline-flex shrink-0 items-center justify-center rounded-xl font-black tracking-tight select-none ${className}`}
    style={{
      background: `linear-gradient(135deg, hsl(${hue(nome)} 60% 48%), hsl(${(hue(nome) + 28) % 360} 62% 36%))`,
      color: '#ffffff',
      boxShadow: medal !== undefined && medal < 3 ? `0 0 0 3px ${MEDAL[medal].ring}` : undefined,
    }}
  >
    {initials(nome)}
  </span>
);

interface BadgeProps {
  pos: number;
  className?: string;
}

/** Posição: medalha com degradê para os três primeiros, placa neutra para os demais. */
export const RankBadge: React.FC<BadgeProps> = ({ pos, className = 'w-9 h-9 text-sm' }) => {
  const m = pos >= 1 && pos <= 3 ? MEDAL[pos - 1] : null;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl font-black tabular-nums ${m ? '' : 'bg-slate-800 text-slate-300'} ${className}`}
      style={m ? { background: `linear-gradient(160deg, ${m.from}, ${m.to})`, color: m.ink, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.55)' } : undefined}
      aria-label={`${pos}º lugar`}
    >
      {pos}
    </span>
  );
};

export const Delta: React.FC<{ c?: RankChange; big: boolean }> = ({ c, big }) => {
  if (!c) return null;
  const cls = `${big ? 'text-base' : 'text-[11px]'} font-black whitespace-nowrap`;
  if (c.isNew) return <span className={`${cls} text-sky-300`}>novo</span>;
  if (c.delta > 0) return <span className={`${cls} text-emerald-400`} title={`Subiu ${c.delta}`}>▲{c.delta}</span>;
  if (c.delta < 0) return <span className={`${cls} text-rose-400`} title={`Desceu ${-c.delta}`}>▼{-c.delta}</span>;
  return null;
};

/** "+10 XP": etiqueta retangular que entra deslizando e some sozinha; nunca vira uma bola. */
export const Gain: React.FC<{ c?: RankChange; big: boolean }> = ({ c, big }) =>
  c && c.xpGain > 0 ? (
    <span
      className={`rank-gain inline-flex shrink-0 items-center whitespace-nowrap rounded-md bg-emerald-500/15 font-black leading-none text-emerald-300 ring-1 ring-emerald-400/40 ${
        big ? 'px-2.5 py-1.5 text-lg' : 'px-1.5 py-1 text-[11px]'
      }`}
    >
      +{c.xpGain} XP
    </span>
  ) : null;

interface BarProps {
  pct: number;
  big?: boolean;
  tone?: 'emerald' | 'orange';
}

export const XpBar: React.FC<BarProps> = ({ pct, big, tone = 'emerald' }) => (
  <span className={`block w-full overflow-hidden rounded-full bg-slate-800 ${big ? 'h-2.5' : 'h-1.5'}`} aria-hidden>
    <span
      className={`block h-full rounded-full transition-[width] duration-700 ease-out ${tone === 'orange' ? 'bg-gradient-to-r from-orange-500 to-amber-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
      style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
    />
  </span>
);

interface RowProps {
  pos: number;
  nome: string;
  xp: number;
  fogos: number;
  /** "2 de 20 desafios", "Fase 3 de 10"… */
  sub: string;
  pct: number;
  mine?: boolean;
  big?: boolean;
  change?: RankChange;
  tone?: 'emerald' | 'orange';
}

/** Linha de classificação: posição, avatar, nome, barra de pontos relativa ao líder e XP em destaque. */
export const LeaderRow: React.FC<RowProps> = ({ pos, nome, xp, fogos, sub, pct, mine, big = false, change, tone = 'emerald' }) => (
  <li
    className={`flex items-center rounded-2xl border shadow-sm ${big ? 'gap-5 px-5 py-4' : 'gap-3 px-3 py-2.5'} ${
      mine ? 'border-orange-500/60 bg-orange-500/10 ring-1 ring-orange-500/30' : pos === 1 ? 'border-amber-400/50 bg-slate-900' : 'border-slate-800 bg-slate-900'
    }`}
  >
    <RankBadge pos={pos} className={big ? 'w-14 h-14 text-3xl' : 'w-8 h-8 text-sm'} />
    <Avatar nome={nome} medal={pos <= 3 ? pos - 1 : undefined} className={big ? 'w-14 h-14 text-2xl' : 'w-9 h-9 text-sm'} />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`truncate font-bold text-white ${big ? 'text-3xl' : 'text-sm'}`} title={nome}>{nome}</span>
        <Delta c={change} big={big} />
        <Gain c={change} big={big} />
      </div>
      <div className={big ? 'mt-2' : 'mt-1.5'}>
        <XpBar pct={pct} big={big} tone={tone} />
      </div>
      <div className={`${big ? 'mt-2 text-lg' : 'mt-1 text-[11px]'} text-slate-400 truncate`}>
        {fogos > 0 && <span className="mr-2 font-semibold text-orange-300">🔥 {fogos}</span>}
        {sub}
      </div>
    </div>
    <div className="shrink-0 text-right leading-none">
      <div className={`font-mono font-black tabular-nums text-white ${big ? 'text-5xl' : 'text-xl'}`}>{xp}</div>
      <div className={`mt-1 font-bold uppercase tracking-widest text-slate-400 ${big ? 'text-sm' : 'text-[9px]'}`}>XP</div>
    </div>
  </li>
);

interface ColProps {
  idx: number;
  nome: string;
  xp: number;
  fogos: number;
  sub: string;
  mine?: boolean;
  big?: boolean;
  change?: RankChange;
}

const PEDESTAL = { compact: ['h-20', 'h-14', 'h-10'], big: ['h-40', 'h-28', 'h-20'] };

/** Coluna do pódio: avatar com anel de medalha, nome, XP e um pedestal em degradê. */
export const PodiumColumn: React.FC<ColProps> = ({ idx, nome, xp, fogos, sub, mine, big = false, change }) => {
  const m = MEDAL[idx];
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <div className={`flex items-end justify-center ${big ? 'h-10' : 'h-5'}`}>
        {idx === 0 && <Crown className={`${big ? 'h-9 w-9' : 'h-5 w-5'} text-amber-400`} aria-hidden />}
      </div>
      <Avatar nome={nome} medal={idx} className={big ? 'w-24 h-24 text-4xl' : 'w-12 h-12 text-lg'} />
      <div className={`mt-2 w-full truncate font-black text-white ${big ? 'text-3xl' : 'text-sm'} ${mine ? 'underline decoration-orange-400 decoration-2 underline-offset-4' : ''}`} title={nome}>
        {nome}
      </div>
      <div className={`font-mono font-black tabular-nums leading-tight text-emerald-300 ${big ? 'text-5xl' : 'text-xl'}`}>
        {xp}
        <span className={`ml-1 font-bold tracking-wider ${big ? 'text-lg' : 'text-[10px]'}`}>XP</span>
      </div>
      <div className={`${big ? 'text-lg' : 'text-[11px]'} text-slate-400`}>
        {fogos > 0 && <span className="mr-1 font-semibold text-orange-300">🔥 {fogos}</span>}
        {sub}
      </div>
      <div className={`flex items-center justify-center gap-1.5 ${big ? 'mt-1 min-h-[2.25rem]' : 'mt-1 min-h-[1.5rem]'}`}>
        <Delta c={change} big={big} />
        <Gain c={change} big={big} />
      </div>
      <div
        className={`mt-1 flex w-full items-start justify-center rounded-t-2xl pt-2 ${PEDESTAL[big ? 'big' : 'compact'][idx]}`}
        style={{ background: `linear-gradient(180deg, ${m.from}, ${m.to})`, boxShadow: 'inset 0 2px 0 rgba(255,255,255,.55)' }}
      >
        <span className={`font-black tabular-nums ${big ? 'text-5xl' : 'text-xl'}`} style={{ color: m.ink }}>{idx + 1}º</span>
      </div>
    </div>
  );
};
