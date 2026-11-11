import React from 'react';
import { ModuleId } from './ProjectorHeader';

const TONE: Record<ModuleId, string> = { nfc: 'text-emerald-400', ctf: 'text-orange-400' };

/** Cabeçalho do aluno (celular): o mesmo desenho no Rali NFC e no CTF Online. */
export const StudentBar: React.FC<{
  module: ModuleId;
  /** linha pequena acima do nome, ex.: "Sala X" */
  context: string;
  name: React.ReactNode;
  /** chips à direita (relógio, XP, posição…) */
  children?: React.ReactNode;
  /** conteúdo extra abaixo (integrantes, seletor de equipe) */
  footer?: React.ReactNode;
}> = ({ module, context, name, children, footer }) => (
  <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4" aria-label="Seu desempenho">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <div className={`text-[11px] font-bold uppercase tracking-wider ${TONE[module]}`}>{module === 'nfc' ? 'Rali NFC' : 'CTF Online'} • {context}</div>
        <div className="text-lg font-black text-white truncate flex items-center gap-2">{name}</div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 font-mono text-sm">{children}</div>}
    </div>
    {footer && <div className="mt-3 pt-3 border-t border-slate-800">{footer}</div>}
  </section>
);

export const XpChip: React.FC<{ xp: number }> = ({ xp }) => (
  <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-black">{xp} XP</span>
);

export const RankChip: React.FC<{ pos: number; total: number }> = ({ pos, total }) => (
  <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-bold" title="Sua posição no ranking">
    {pos}º de {total}
  </span>
);
