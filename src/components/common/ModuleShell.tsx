import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, HelpCircle, X } from 'lucide-react';
import { useTheme } from '../../utils/theme';

export type Accent = 'emerald' | 'orange' | 'cyan' | 'violet' | 'rose';

/** Cores de cada trilha: as mesmas da entrada do portal. */
export const ACCENT: Record<Accent, { tile: string; texto: string; tabAtiva: string; foco: string; botao: string; numero: string }> = {
  emerald: { tile: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300', texto: 'text-emerald-300', tabAtiva: 'bg-emerald-600 text-white', foco: 'focus-visible:ring-emerald-500', botao: 'bg-emerald-600 hover:bg-emerald-500', numero: 'bg-emerald-600' },
  orange: { tile: 'bg-orange-500/10 border-orange-500/30 text-orange-300', texto: 'text-orange-300', tabAtiva: 'bg-orange-600 text-white', foco: 'focus-visible:ring-orange-500', botao: 'bg-orange-600 hover:bg-orange-500', numero: 'bg-orange-600' },
  cyan: { tile: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300', texto: 'text-cyan-300', tabAtiva: 'bg-cyan-600 text-white', foco: 'focus-visible:ring-cyan-500', botao: 'bg-cyan-600 hover:bg-cyan-500', numero: 'bg-cyan-600' },
  violet: { tile: 'bg-violet-500/10 border-violet-500/30 text-violet-300', texto: 'text-violet-300', tabAtiva: 'bg-violet-600 text-white', foco: 'focus-visible:ring-violet-500', botao: 'bg-violet-600 hover:bg-violet-500', numero: 'bg-violet-600' },
  rose: { tile: 'bg-rose-500/10 border-rose-500/30 text-rose-300', texto: 'text-rose-300', tabAtiva: 'bg-rose-600 text-white', foco: 'focus-visible:ring-rose-500', botao: 'bg-rose-600 hover:bg-rose-500', numero: 'bg-rose-600' },
};

/** Botão "voltar" no mesmo desenho em todas as telas (aluno e professor). */
export const BackPill: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 shadow-sm transition hover:bg-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${className}`}
  >
    <ArrowLeft className="w-3.5 h-3.5" />
    {children}
  </button>
);

export interface PassoComoJogar {
  titulo: string;
  texto: string;
}

interface ShellProps {
  /** chave usada para lembrar que o aluno já viu o "como jogar" neste aparelho */
  id: string;
  accent: Accent;
  icon: React.ReactNode;
  title: string;
  tagline: string;
  comoJogar: PassoComoJogar[];
  /** @deprecated a volta para os jogos fica na barra do HUB */
  onHome?: () => void;
  children: React.ReactNode;
}

const visto = (id: string) => {
  try {
    return localStorage.getItem(`rali_comojogar_${id}_v1`) === '1';
  } catch {
    return true;
  }
};
const marcaVisto = (id: string) => {
  try {
    localStorage.setItem(`rali_comojogar_${id}_v1`, '1');
  } catch {
    // modo privado
  }
};

/**
 * Moldura comum das trilhas do aluno: mesmo cabeçalho (voltar, ícone, título, frase) e o botão "Como jogar",
 * que abre sozinho na primeira visita do aparelho.
 */
export const ModuleShell: React.FC<ShellProps> = ({ id, accent, icon, title, tagline, comoJogar, children }) => {
  const a = ACCENT[accent];
  const claro = useTheme() === 'claro';
  const [aberto, setAberto] = useState(() => !visto(id));
  const fechar = () => {
    marcaVisto(id);
    setAberto(false);
  };
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6 pb-4">
      <header
        className="flex items-center gap-3 rounded-[22px] px-4 py-4 sm:gap-4 sm:px-7 sm:py-5"
        style={{ background: claro ? 'linear-gradient(115deg,#F2FBF4 0%,#E3F7E8 60%,#BDEFCD 100%)' : 'linear-gradient(115deg,#0F2A1F 0%,#0E3A27 60%,#145A34 100%)', boxShadow: '0 8px 24px rgba(0,120,53,.12)' }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border bg-slate-900 [&>svg]:h-7 [&>svg]:w-7 ${a.tile}`}>{icon}</div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-4xl font-black italic leading-none tracking-tight" style={{ color: claro ? '#0F172A' : '#F1F5F9' }}>{title}</h1>
            <p className="mt-1 text-sm sm:text-base font-semibold leading-snug" style={{ color: claro ? '#007A35' : '#3BE37A' }}>{tagline}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAberto(true)}
          className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm font-bold text-slate-200 shadow-sm transition hover:bg-slate-800 outline-none focus-visible:ring-2 ${a.foco}`}
        >
          <HelpCircle className={`w-4 h-4 ${a.texto}`} />
          <span className="sr-only sm:not-sr-only">Como jogar</span>
        </button>
      </header>
      <div className="mt-5">{children}</div>
      {aberto && <ComoJogar title={title} accent={accent} passos={comoJogar} onClose={fechar} />}
    </div>
  );
};

/** Abas no mesmo desenho em todas as trilhas. */
export function ModuleTabs<T extends string>({ accent, label, tabs, value, onChange }: {
  accent: Accent;
  label: string;
  tabs: { id: T; label: string; icon: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const a = ACCENT[accent];
  return (
    <div role="tablist" aria-label={label} className="mx-auto flex max-w-lg gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition outline-none focus-visible:ring-2 ${a.foco} ${value === t.id ? a.tabAtiva : 'text-slate-400 hover:text-white'}`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

const ComoJogar: React.FC<{ title: string; accent: Accent; passos: PassoComoJogar[]; onClose: () => void }> = ({ title, accent, passos, onClose }) => {
  const a = ACCENT[accent];
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    btn.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="como-jogar-titulo"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="como-jogar-titulo" className="text-xl font-black text-white">
            Como jogar · {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <ol className="mt-4 space-y-3">
          {passos.map((p, i) => (
            <li key={i} className="flex gap-3">
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${a.numero}`}>{i + 1}</span>
              <div>
                <p className="text-sm font-bold text-white">{p.titulo}</p>
                <p className="text-sm leading-relaxed text-slate-300">{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
        <button ref={btn} type="button" onClick={onClose} className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-black text-white transition ${a.botao}`}>
          Entendi, vamos lá
        </button>
      </div>
    </div>
  );
};
