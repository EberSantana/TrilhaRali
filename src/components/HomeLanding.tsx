import React from 'react';
import { ArrowRight, Flag, Lock, Puzzle, Radio, ShieldCheck } from 'lucide-react';
import { TrilhaLogo } from './TrilhaLogo';

interface HomeLandingProps {
  isTeacher: boolean;
  onOpenRali: () => void;
  onOpenCtf: () => void;
  onOpenCruz: () => void;
  onOpenTeacher: () => void;
}

interface EntryCardProps {
  title: string;
  tagline: string;
  description: string;
  chips: string[];
  icon: React.ReactNode;
  accent: 'emerald' | 'orange' | 'cyan';
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
  cyan: {
    ring: 'hover:border-cyan-500/60 focus-visible:ring-cyan-500/60',
    icon: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    chip: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    cta: 'text-cyan-300 group-hover:text-cyan-200',
  },
} as const;

const EntryCard: React.FC<EntryCardProps> = ({ title, tagline, description, chips, icon, accent, onClick }) => {
  const a = ACCENTS[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex h-full w-full flex-col items-stretch justify-start text-left rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 transition outline-none focus-visible:ring-2 ${a.ring} hover:bg-slate-900`}
    >
      <div className={`w-12 h-12 shrink-0 rounded-xl border flex items-center justify-center ${a.icon}`}>{icon}</div>
      <h2 className="mt-4 text-2xl font-black tracking-tight text-white">{title}</h2>
      <p className="mt-1 text-sm font-semibold text-slate-400">{tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-300 md:min-h-[6.5rem]">{description}</p>
      <div className="mt-4 flex flex-wrap content-start gap-2">
        {chips.map((c) => (
          <span key={c} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${a.chip}`}>
            {c}
          </span>
        ))}
      </div>
      <div className={`mt-auto pt-4 inline-flex items-center gap-2 text-sm font-bold ${a.cta}`}>
        Entrar
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
};

export const HomeLanding: React.FC<HomeLandingProps> = ({ isTeacher, onOpenRali, onOpenCtf, onOpenCruz, onOpenTeacher }) => (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-6">
    <header className="flex flex-col items-center text-center">
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute -inset-x-16 -inset-y-4 rounded-full bg-gradient-to-r from-emerald-400/25 via-white/0 to-orange-400/25 blur-2xl" />
        <TrilhaLogo variant="full" height="clamp(120px, calc(100dvh - 590px), 200px)" className="relative drop-shadow-[0_8px_16px_rgba(15,23,42,0.22)]" />
      </div>
      <h1 className="sr-only">Trilha Rali</h1>
      <p className="mt-3 max-w-xl text-sm sm:text-base text-slate-400 leading-relaxed">
        Escolha como você vai participar da atividade de hoje.
      </p>
    </header>

    <section className="mt-7 grid grid-cols-1 items-stretch gap-4 sm:gap-5 md:grid-cols-3" aria-label="Escolha o módulo">
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
      <EntryCard
        title="Cruzada Online"
        tagline="Individual, por assunto"
        description="Escolha o assunto e monte palavras cruzadas, na sala da turma ou em treino livre. As palavras são conferidas no servidor."
        chips={['Por assunto', 'Sala ou treino', 'Dicas limitadas']}
        icon={<Puzzle className="w-6 h-6" />}
        accent="cyan"
        onClick={onOpenCruz}
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
