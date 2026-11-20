import React from 'react';
import { ArrowRight, Flag, Lock, Puzzle, Radio, Search, ShieldCheck } from 'lucide-react';
import { TrilhaLogo } from './TrilhaLogo';

interface HomeLandingProps {
  isTeacher: boolean;
  onOpenRali: () => void;
  onOpenCtf: () => void;
  onOpenCruz: () => void;
  onOpenDesv: () => void;
  onOpenTeacher: () => void;
}

interface EntryProps {
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  accent: 'emerald' | 'orange' | 'cyan' | 'violet';
  onClick: () => void;
}

const ACCENTS = {
  emerald: {
    bar: 'bg-emerald-500',
    ring: 'hover:border-emerald-500/60 focus-visible:ring-emerald-500/60',
    icon: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    cta: 'text-emerald-300 group-hover:text-emerald-200',
  },
  orange: {
    bar: 'bg-orange-500',
    ring: 'hover:border-orange-500/60 focus-visible:ring-orange-500/60',
    icon: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    cta: 'text-orange-300 group-hover:text-orange-200',
  },
  cyan: {
    bar: 'bg-cyan-500',
    ring: 'hover:border-cyan-500/60 focus-visible:ring-cyan-500/60',
    icon: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    cta: 'text-cyan-300 group-hover:text-cyan-200',
  },
  violet: {
    bar: 'bg-violet-500',
    ring: 'hover:border-violet-500/60 focus-visible:ring-violet-500/60',
    icon: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
    cta: 'text-violet-300 group-hover:text-violet-200',
  },
} as const;

const EntryRow: React.FC<EntryProps> = ({ title, tagline, description, icon, accent, onClick }) => {
  const a = ACCENTS[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 py-3 pl-6 pr-4 text-left transition outline-none focus-visible:ring-2 ${a.ring} hover:bg-slate-900 hover:shadow-lg`}
    >
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 ${a.bar}`} />
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${a.icon}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-black leading-tight tracking-tight text-white sm:text-xl">{title}</h2>
        <p className="text-xs font-semibold text-slate-400 sm:text-sm">{tagline}</p>
        <p className="mt-1 hidden text-sm leading-snug text-slate-300 sm:block">{description}</p>
      </div>
      <ArrowRight className={`h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 ${a.cta}`} />
    </button>
  );
};

export const HomeLanding: React.FC<HomeLandingProps> = ({ isTeacher, onOpenRali, onOpenCtf, onOpenCruz, onOpenDesv, onOpenTeacher }) => (
  <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-8 sm:py-6">
    <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
      <header className="flex flex-col items-center text-center">
        <div className="relative">
          <div aria-hidden className="pointer-events-none absolute -inset-x-16 -inset-y-6 rounded-full bg-gradient-to-r from-emerald-400/25 via-white/0 to-orange-400/25 blur-2xl" />
          <TrilhaLogo variant="full" height="clamp(150px, calc(100dvh - 430px), 300px)" className="relative drop-shadow-[0_8px_16px_rgba(15,23,42,0.22)]" />
        </div>
        <h1 className="sr-only">Trilha Rali</h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400 sm:text-base">
          Escolha como você vai participar da atividade de hoje.
        </p>
      </header>

      <section className="flex flex-col gap-3" aria-label="Escolha o módulo">
        <EntryRow
          title="Rali NFC"
          tagline="Em equipe, pelo laboratório"
          description="Encoste o celular na etiqueta da mesa, resolva a missão e some pontos para a equipe."
          icon={<Radio className="h-6 w-6" />}
          accent="emerald"
          onClick={onOpenRali}
        />
        <EntryRow
          title="CTF Online"
          tagline="Individual, fase a fase"
          description="Resolva cada fase no seu ritmo e suba no ranking Top 5 da sala."
          icon={<Flag className="h-6 w-6" />}
          accent="orange"
          onClick={onOpenCtf}
        />
        <EntryRow
          title="Cruzada Online"
          tagline="Individual, por assunto"
          description="Monte palavras cruzadas por assunto, na sala da turma ou em treino livre."
          icon={<Puzzle className="h-6 w-6" />}
          accent="cyan"
          onClick={onOpenCruz}
        />
        <EntryRow
          title="Desvendando"
          tagline="Em dupla, liberado pelo professor"
          description="Entre com o token da sala, investigue com a sua dupla e acuse o culpado: só uma resposta pode ser provada."
          icon={<Search className="h-6 w-6" />}
          accent="violet"
          onClick={onOpenDesv}
        />
        <div className="mt-1 flex justify-center lg:justify-start">
          <button
            type="button"
            onClick={onOpenTeacher}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            {isTeacher ? <ShieldCheck className="h-4 w-4 text-emerald-400" /> : <Lock className="h-4 w-4 text-amber-400" />}
            Área do professor
          </button>
        </div>
      </section>
    </div>
  </div>
);
