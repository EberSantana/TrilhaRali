import React from 'react';
import { Flag, Home, Lock, Radio, ShieldCheck } from 'lucide-react';

export type AppModule = 'home' | 'rali' | 'ctf' | 'professor' | 'prof-rali' | 'prof-ctf' | 'local';
type TabId = 'rali' | 'ctf' | 'professor';
const tabOf = (m: AppModule): TabId => (m === 'rali' || m === 'ctf' ? m : 'professor');

interface ModuleSwitcherProps {
  module: AppModule;
  isTeacher: boolean;
  onChange: (module: AppModule) => void;
}

const MODULES: Array<{ id: TabId; label: string; hint: string; active: string }> = [
  { id: 'rali', label: 'Rali NFC', hint: 'Equipes + etiquetas no laboratório', active: 'bg-emerald-600 text-white shadow-emerald-600/30' },
  { id: 'ctf', label: 'CTF Online', hint: 'Fases individuais com token', active: 'bg-orange-600 text-white shadow-orange-600/30' },
  { id: 'professor', label: 'Professor', hint: 'Área administrativa', active: 'bg-slate-100 text-slate-900 shadow-white/10' },
];

const iconFor = (id: TabId, isTeacher: boolean) => {
  if (id === 'rali') return <Radio className="w-4 h-4" />;
  if (id === 'ctf') return <Flag className="w-4 h-4" />;
  return isTeacher ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-400" />;
};

/** Barra compacta de navegação entre módulos (não aparece na tela inicial). */
export const ModuleSwitcher: React.FC<ModuleSwitcherProps> = ({ module, isTeacher, onChange }) => (
  <div className="bg-slate-900 border-b border-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center gap-1.5 overflow-x-auto" role="tablist" aria-label="Módulo">
      <button
        onClick={() => onChange('home')}
        title="Voltar à tela inicial"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Início</span>
      </button>
      <span className="mx-1 h-5 w-px bg-slate-800" aria-hidden />
      {MODULES.map((m) => (
        <button
          key={m.id}
          role="tab"
          aria-selected={tabOf(module) === m.id}
          onClick={() => onChange(m.id)}
          title={m.hint}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-black tracking-wide transition shadow whitespace-nowrap ${
            tabOf(module) === m.id ? m.active : 'text-slate-400 hover:text-white hover:bg-slate-800 shadow-none'
          }`}
        >
          {iconFor(m.id, isTeacher)}
          {m.label}
        </button>
      ))}
    </div>
  </div>
);
