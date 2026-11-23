import React from 'react';
import { ArrowRight, BookOpen, Flag, Lock, Puzzle, Radio, Search, ShieldCheck, Star, TrendingUp, Trophy } from 'lucide-react';
import { TrilhaMarca, TrilhaNome } from './TrilhaMarca';

interface HomeLandingProps {
  isTeacher: boolean;
  onOpenRali: () => void;
  onOpenCtf: () => void;
  onOpenCruz: () => void;
  onOpenDesv: () => void;
  onOpenTeacher: () => void;
}

/** Portal de estudos (Ambientes de estudo): futuro par desta área de jogos. */
const URL_ESTUDOS = 'https://ebersantana.github.io/disciplinas/';

const NAVY = '#0B1F3B';

const ACCENTS = {
  emerald: { icon: 'bg-emerald-500/15 text-emerald-400', ring: 'hover:border-emerald-500/60 focus-visible:ring-emerald-500/60', cta: 'text-emerald-400' },
  orange: { icon: 'bg-orange-500/15 text-orange-400', ring: 'hover:border-orange-500/60 focus-visible:ring-orange-500/60', cta: 'text-orange-400' },
  cyan: { icon: 'bg-cyan-500/15 text-cyan-400', ring: 'hover:border-cyan-500/60 focus-visible:ring-cyan-500/60', cta: 'text-cyan-400' },
  violet: { icon: 'bg-violet-500/15 text-violet-400', ring: 'hover:border-violet-500/60 focus-visible:ring-violet-500/60', cta: 'text-violet-400' },
} as const;

interface CardProps {
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  accent: keyof typeof ACCENTS;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ title, tagline, description, icon, accent, onClick }) => {
  const a = ACCENTS[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left shadow-sm outline-none transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 ${a.ring}`}
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${a.icon}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-extrabold leading-tight text-white sm:text-lg">{title}</span>
        <span className="block text-xs font-semibold text-slate-400">{tagline}</span>
        <span className="mt-1 hidden text-sm leading-snug text-slate-300 md:block">{description}</span>
      </span>
      <ArrowRight className={`h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 ${a.cta}`} />
    </button>
  );
};

export const HomeLanding: React.FC<HomeLandingProps> = ({ isTeacher, onOpenRali, onOpenCtf, onOpenCruz, onOpenDesv, onOpenTeacher }) => (
  <div className="flex w-full flex-col">
    {/* Barra da marca: sempre azul-marinho, nos dois temas */}
    <div style={{ background: NAVY }} className="border-b-2 border-[#00C853]/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <TrilhaMarca size={44} />
          <TrilhaNome className="text-[17px]" />
        </div>
        <div className="flex items-center gap-2">
          <a
            href={URL_ESTUDOS}
            className="hidden items-center gap-1.5 rounded-xl border border-[#ffffff33] px-3 py-2 text-sm font-semibold text-[#E2E8F0] transition hover:border-[#3BE37A] hover:text-[#FFFFFF] sm:inline-flex"
          >
            <BookOpen className="h-4 w-4" /> Ambientes de estudo
          </a>
          <button
            type="button"
            onClick={onOpenTeacher}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-[#0B1F3B] transition hover:brightness-110"
            style={{ background: '#3BE37A' }}
          >
            {isTeacher ? <ShieldCheck className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            <span>Área do professor</span>
          </button>
        </div>
      </div>
    </div>

    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-8 sm:py-7">
      {/* Faixa de boas-vindas */}
      <section
        className="relative overflow-hidden rounded-3xl px-6 py-7 sm:px-10 sm:py-9"
        style={{ background: `linear-gradient(120deg, ${NAVY} 0%, #0E2A4F 55%, #0B3A2A 100%)` }}
      >
        <svg aria-hidden viewBox="0 0 600 300" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full opacity-60">
          <path d="M260 320 C 380 200, 470 260, 620 90" fill="none" stroke="#00C853" strokeWidth="46" strokeOpacity=".22" />
          <path d="M300 320 C 410 215, 490 270, 620 130" fill="none" stroke="#3BE37A" strokeWidth="4" strokeOpacity=".7" />
          <path d="M330 320 C 430 228, 505 282, 620 168" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="18 16" strokeOpacity=".5" />
        </svg>
        <div className="relative grid items-center gap-6 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-sm font-semibold italic text-[#CBD5E1] sm:text-base">Bem-vindo à</p>
            <h1 className="font-marca mt-1 text-4xl text-[#3BE37A] sm:text-5xl">Trilha Rali</h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#E2E8F0] sm:text-base">
              Seu HUB de ferramentas gamificadas para aprender, evoluir e conquistar. Escolha a atividade de hoje.
            </p>
          </div>
          <div className="hidden justify-center md:flex">
            <TrilhaMarca size={190} className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]" />
          </div>
        </div>
      </section>

      {/* Atividades */}
      <div className="mt-6 flex items-center gap-2">
        <span className="h-6 w-1.5 rounded-full bg-emerald-500" />
        <h2 className="text-lg font-extrabold text-white sm:text-xl">Escolha a atividade</h2>
      </div>
      <section className="mt-3 grid gap-3 md:grid-cols-2" aria-label="Escolha o módulo">
        <Card title="Rali NFC" tagline="Em equipe, pelo laboratório" description="Encoste o celular na etiqueta da mesa, resolva a missão e some pontos para a equipe." icon={<Radio className="h-6 w-6" />} accent="emerald" onClick={onOpenRali} />
        <Card title="CTF Online" tagline="Individual, fase a fase" description="Capture as bandeiras no seu ritmo e suba no ranking da sala." icon={<Flag className="h-6 w-6" />} accent="orange" onClick={onOpenCtf} />
        <Card title="Cruzada Online" tagline="Individual, por assunto" description="Monte palavras cruzadas por assunto, na sala da turma ou em treino livre." icon={<Puzzle className="h-6 w-6" />} accent="cyan" onClick={onOpenCruz} />
        <Card title="Desvendando" tagline="Em dupla, liberado pelo professor" description="Investigue com a sua dupla e acuse o culpado: só uma resposta pode ser provada." icon={<Search className="h-6 w-6" />} accent="violet" onClick={onOpenDesv} />
      </section>

      {/* Como funciona */}
      <section className="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:grid-cols-3" aria-label="Como funciona">
        {[
          { i: <Star className="h-5 w-5 text-emerald-400" />, t: 'Aprenda', d: 'com jogos e desafios' },
          { i: <TrendingUp className="h-5 w-5 text-sky-400" />, t: 'Acompanhe', d: 'seu XP e o ranking da sala' },
          { i: <Trophy className="h-5 w-5 text-amber-400" />, t: 'Conquiste', d: 'bandeiras bronze, prata e ouro' },
        ].map((x) => (
          <div key={x.t} className="flex items-center gap-3">
            {x.i}
            <span className="leading-tight">
              <span className="block text-sm font-bold text-white">{x.t}</span>
              <span className="block text-xs text-slate-400">{x.d}</span>
            </span>
          </div>
        ))}
      </section>

      <p className="mt-4 text-center sm:hidden">
        <a href={URL_ESTUDOS} className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 underline-offset-2 hover:underline">
          <BookOpen className="h-4 w-4" /> Ir para os Ambientes de estudo
        </a>
      </p>
    </div>
  </div>
);
