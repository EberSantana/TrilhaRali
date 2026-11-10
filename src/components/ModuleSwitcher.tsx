import React from 'react';
import { Flag, Radio } from 'lucide-react';

export type AppModule = 'rali' | 'ctf';

interface ModuleSwitcherProps {
  module: AppModule;
  onChange: (module: AppModule) => void;
}

const MODULES: Array<{ id: AppModule; label: string; hint: string; icon: React.ReactNode; active: string }> = [
  { id: 'rali', label: 'Rali NFC', hint: 'Equipes + tags no laboratório', icon: <Radio className="w-4 h-4" />, active: 'bg-emerald-600 text-white shadow-emerald-600/30' },
  { id: 'ctf', label: 'CTF Online', hint: 'Fases individuais com token', icon: <Flag className="w-4 h-4" />, active: 'bg-orange-600 text-white shadow-orange-600/30' },
];

export const ModuleSwitcher: React.FC<ModuleSwitcherProps> = ({ module, onChange }) => (
  <div className="bg-slate-900 border-b border-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-center sm:justify-start gap-1.5" role="tablist" aria-label="Módulo">
      {MODULES.map((m) => (
        <button
          key={m.id}
          role="tab"
          aria-selected={module === m.id}
          onClick={() => onChange(m.id)}
          title={m.hint}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-black tracking-wide transition shadow ${
            module === m.id ? m.active : 'text-slate-400 hover:text-white hover:bg-slate-800 shadow-none'
          }`}
        >
          {m.icon}
          {m.label}
        </button>
      ))}
    </div>
  </div>
);
