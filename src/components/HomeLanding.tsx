import React from 'react';
import { ArrowRight, Flag, Lock, Radio, ShieldCheck } from 'lucide-react';
import { TrilhaLogo } from './TrilhaLogo';

interface HomeLandingProps {
  isTeacher: boolean;
  onOpenRali: () => void;
  onOpenCtf: () => void;
  onOpenTeacher: () => void;
}

interface EntryCardProps {
  title: string;
  tagline: string;
  description: string;
  chips: string[];
  icon: React.ReactNode;
  accent: 'emerald' | 'orange';
  onClick: () => void;
}

const ACCENTS = {
  emerald: {
    ring: 'hover:border-emerald-500/60 focus-visible:ring-emerald-500/60',
    icon: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    chip: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    cta: 'text-emerald-300 group-hover:text-emerald-200',
  },
  orange: {
    ring: 'hover:border-orange-500/60 focus-visible:ring-orange-500/60',
    icon: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    chip: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    cta: 'text-orange-300 group-hover:text-orange-200',
  },
} as const;

const EntryCard: React.FC<EntryCardProps> = ({ title, tagline, description, chips, icon, accent, onClick }) => {
  const a = ACCENTS[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group text-left rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 transition outline-none focus-visible:ring-2 ${a.ring} hover:bg-slate-900`}
    >
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${a.icon}`}>{icon}</div>
      <h2 className="mt-4 text-2xl font-black tracking-tight text-white">{title}</h2>
      <p className="mt-1 text-sm font-semibold text-slate-400">{tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((c) => (
          <span key={c} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${a.chip}`}>
            {c}
          </span>
        ))}
      </div>
      <div className={`mt-4 inline-flex items-center gap-2 text-sm font-bold ${a.cta}`}>
        Entrar
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
};

export const HomeLanding: React.FC<HomeLandingProps> = ({ isTeacher, onOpenRali, onOpenCtf, onOpenTeacher }) => (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-5 pb-5">
    <header className="flex flex-col items-center text-center">
      <TrilhaLogo variant="full" height="clamp(120px, calc(100dvh - 590px), 200px)" />
      <h1 className="sr-only">Trilha Rali</h1>
      <p className="mt-3 max-w-xl text-sm sm:text-base text-slate-400 leading-relaxed">
        Escolha como você vai participar da atividade de hoje.
      </p>
    </header>

    <section className="mt-7 grid gap-5 md:grid-cols-2" aria-label="Escolha o módulo">
      <EntryCard
        title="Rali NFC"
        tagline="Em equipe, pelo laboratório"
        description="Entre com o token da sala, encoste o celular na etiqueta da mesa, resolva a missão e some pontos para a sua equipe."
        chips={['Equipes', 'Etiquetas NFC', 'Token da sala', 'Ranking no telão']}
        icon={<Radio className="w-6 h-6" />}
        accent="emerald"
        onClick={onOpenRali}
      />
      <EntryCard
        title="CTF Online"
        tagline="Individual, fase a fase"
        description="Entre com o token da sala, resolva cada fase no seu ritmo e suba no ranking Top 5."
        chips={['Individual', 'Token da sala', 'Ranking Top 5']}
        icon={<Flag className="w-6 h-6" />}
        accent="orange"
        onClick={onOpenCtf}
      />
    </section>

    <div className="mt-7 flex justify-center">
      <button
        type="button"
        onClick={onOpenTeacher}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
      >
        {isTeacher ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
        Área do professor
      </button>
    </div>
  </div>
);
