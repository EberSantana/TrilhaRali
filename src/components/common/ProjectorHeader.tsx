import React from 'react';

export type ModuleId = 'nfc' | 'ctf';

const MODULE: Record<ModuleId, { label: string; chip: string }> = {
  nfc: { label: 'Rali NFC', chip: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' },
  ctf: { label: 'CTF Online', chip: 'bg-orange-500/15 text-orange-300 border-orange-500/40' },
};

/** Botão de ícone padrão das barras de ação (telão, painel e aluno). */
export const ICON_BTN =
  'p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50';

interface ProjectorHeaderProps {
  module: ModuleId;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** logo ou ícone à esquerda do título */
  leading?: React.ReactNode;
  /** botões à direita (som, tela cheia, fechar…) */
  actions?: React.ReactNode;
}

/** Cabeçalho único dos telões: módulo, título, contexto (sala • participantes) e ações. */
export const ProjectorHeader: React.FC<ProjectorHeaderProps> = ({ module, title, subtitle, leading, actions }) => (
  <header className="flex flex-wrap items-start justify-between gap-4">
    <div className="flex items-center gap-4 min-w-0">
      {leading}
      <div className="min-w-0">
        <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-black uppercase tracking-[0.14em] ${MODULE[module].chip}`}>
          {MODULE[module].label}
        </span>
        <h1 className="mt-1.5 text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">{title}</h1>
        {subtitle && <p className="mt-1 text-base sm:text-lg text-slate-400">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </header>
);
