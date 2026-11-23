import React from 'react';
import {
  ArrowRight, Flag, Gamepad2, GraduationCap, HelpCircle, Home,
  Lock, Puzzle, Radio, Search, ShieldCheck, Trophy, UserRound,
  FlaskConical, Code2, BrainCircuit, Star, TrendingUp, Compass
} from 'lucide-react';
import { TrilhaMarca, TrilhaNome } from './TrilhaMarca';
import { IfsLogo } from './IfsLogo';

interface HomeLandingProps {
  isTeacher: boolean;
  onOpenRali: () => void;
  onOpenCtf: () => void;
  onOpenCruz: () => void;
  onOpenDesv: () => void;
  onOpenTeacher: () => void;
}

const URL_ESTUDOS = 'https://ebersantana.github.io/disciplinas/';
const NAVY = '#0B1F3B';
const LIME = '#B7F52B';

type Accent = 'green' | 'orange' | 'cyan' | 'violet';

const accentStyles: Record<Accent, { icon: string; border: string; arrow: string }> = {
  green: { icon: 'bg-emerald-50 text-emerald-700', border: 'border-l-emerald-500', arrow: 'text-emerald-700' },
  orange: { icon: 'bg-orange-50 text-orange-700', border: 'border-l-orange-500', arrow: 'text-orange-700' },
  cyan: { icon: 'bg-cyan-50 text-cyan-800', border: 'border-l-cyan-500', arrow: 'text-cyan-800' },
  violet: { icon: 'bg-violet-50 text-violet-700', border: 'border-l-violet-500', arrow: 'text-violet-700' },
};

interface ShortcutProps {
  title: string;
  subtitle: string;
  description: string;
  accent: Accent;
  icon: React.ReactNode;
  onClick: () => void;
}
const Shortcut: React.FC<ShortcutProps> = ({ title, subtitle, description, accent, icon, onClick }) => {
  const a = accentStyles[accent];
  return (
    <button type="button" onClick={onClick}
      className={`group flex w-full items-center gap-4 rounded-2xl border border-slate-200 border-l-[6px] ${a.border} bg-white px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600`}>
      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${a.icon}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-extrabold leading-tight tracking-tight text-slate-900">{title}</span>
        <span className="block text-sm font-bold text-slate-600">{subtitle}</span>
        <span className="mt-1 block text-sm leading-snug text-slate-600">{description}</span>
      </span>
      <ArrowRight className={`h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1 ${a.arrow}`} />
    </button>
  );
};

interface ToolCardProps {
  title: string;
  description: string;
  label: string;
  icon: React.ReactNode;
  gradient: string;
  onClick?: () => void;
  href?: string;
  soon?: boolean;
}
const ToolCard: React.FC<ToolCardProps> = ({ title, description, label, icon, gradient, onClick, href, soon }) => {
  const inner = (
    <>
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-inner">{icon}</span>
      <span className="block text-xl font-extrabold text-white">{title}</span>
      <span className="mt-1 block max-w-xs text-sm leading-relaxed text-white/85">{description}</span>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white">
        {soon ? 'Em breve' : label} {!soon && <ArrowRight className="h-4 w-4" />}
      </span>
      {soon && <span className="absolute right-4 top-4 rounded-full border border-white/30 bg-black/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Em breve</span>}
    </>
  );
  const cls = `relative flex min-h-[220px] flex-col items-start overflow-hidden rounded-3xl p-6 text-left shadow-md transition ${soon ? 'cursor-default opacity-80' : 'hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400'}`;
  if (href) return <a href={href} className={cls} style={{ background: gradient }}>{inner}</a>;
  return <button type="button" onClick={onClick} disabled={soon || !onClick} className={cls} style={{ background: gradient }}>{inner}</button>;
};

export const HomeLanding: React.FC<HomeLandingProps> = ({ isTeacher, onOpenRali, onOpenCtf, onOpenCruz, onOpenDesv, onOpenTeacher }) => (
  <div id="inicio" className="flex min-h-screen w-full flex-col bg-[#F4F6F8] text-slate-900">
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800;900&family=Montserrat:wght@400;500;600;700;800&display=swap');
      .trilha-font { font-family: 'Montserrat', system-ui, sans-serif; }
      .trilha-orbitron { font-family: 'Orbitron', system-ui, sans-serif; }
      .trilha-cut { clip-path: polygon(0 0,100% 0,100% 100%,0 100%,0 68%,3.5% 0); }
      .trilha-light { background: radial-gradient(ellipse at 70% 45%,rgba(183,245,43,.22),transparent 36%), radial-gradient(ellipse at 92% 12%,rgba(0,200,83,.22),transparent 28%), linear-gradient(115deg,#07172D 0%,#0B1F3B 52%,#102F43 100%); }
      .trilha-light:before { content:''; position:absolute; inset:0; pointer-events:none; opacity:.55; background:repeating-linear-gradient(132deg,transparent 0 72px,rgba(183,245,43,.12) 73px,transparent 76px 150px); mask-image:linear-gradient(90deg,transparent,#000 60%,#000); }
      .trilha-tool:after { content:''; position:absolute; width:180px; height:180px; right:-75px; bottom:-100px; border:1px solid rgba(255,255,255,.25); border-radius:50%; box-shadow:0 0 0 18px rgba(255,255,255,.05),0 0 0 38px rgba(255,255,255,.035); }
      @media (prefers-reduced-motion: reduce) { .trilha-tool, .trilha-tool * { transition:none!important; } }
    `}</style>

    <header className="relative z-20 overflow-hidden bg-[#0B1F3B] text-white shadow-lg">
      <div className="pointer-events-none absolute right-0 top-0 h-full w-28 bg-[#00C853]" style={{ clipPath: 'polygon(72% 0,100% 0,100% 100%,0 100%)' }} />
      <div className="trilha-font relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-7">
        <a href="#inicio" className="flex items-center gap-3" aria-label="Trilha Rali - Início">
          <TrilhaMarca size={46} />
          <span className="flex flex-col leading-none">
            <span className="text-base font-black tracking-tight text-white sm:text-lg">TRILHA <span style={{ color: LIME }}>RALI</span></span>
            <span className="mt-1 text-[9px] font-bold uppercase tracking-[.18em] text-slate-300">Hub de ferramentas gamificadas</span>
          </span>
        </a>
        <nav aria-label="Menu principal" className="flex flex-wrap items-center gap-1.5 text-sm font-bold">
          <a href="#inicio" className="inline-flex items-center gap-2 rounded-xl bg-[#B7F52B] px-4 py-2.5 text-[#0B1F3B] shadow-sm"><Home size={16}/> Início</a>
          <a href="#ferramentas" className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-slate-100 transition hover:bg-white/10"><Gamepad2 size={16}/> Ferramentas</a>
          <button onClick={onOpenCtf} className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-slate-100 transition hover:bg-white/10"><Trophy size={16}/> Ranking</button>
          <a href="#ajuda" className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-slate-100 transition hover:bg-white/10"><HelpCircle size={16}/> Ajuda</a>
          <a href={URL_ESTUDOS} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2.5 text-slate-100 transition hover:border-[#B7F52B] hover:text-white"><UserRound size={16}/> Perfil do aluno</a>
        </nav>
        <button type="button" onClick={onOpenTeacher} className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-extrabold text-[#0B1F3B] shadow-sm transition hover:brightness-110" style={{ background: '#3BE37A' }}>
          {isTeacher ? <ShieldCheck size={16}/> : <Lock size={16}/>} Área do professor
        </button>
      </div>
    </header>

    <main className="trilha-font mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-7 sm:py-9">
      <section className="grid gap-5 lg:grid-cols-[1.04fr_.96fr]" aria-label="Boas-vindas e atalhos">
        <div className="trilha-light relative isolate flex min-h-[390px] flex-col justify-center overflow-hidden rounded-[28px] px-7 py-8 shadow-xl sm:px-10 sm:py-10">
          <div className="relative z-10 max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-200">Bem-vindo ao seu próximo desafio</p>
            <h1 className="trilha-orbitron mt-4 text-4xl font-black italic leading-tight sm:text-5xl xl:text-6xl" style={{ background: 'linear-gradient(100deg,#E6FF9A 0%,#B7F52B 42%,#56D629 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Trilha Rali!</h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-100 sm:text-lg">Um HUB de ferramentas gamificadas para aprender, experimentar e conquistar. Escolha sua trilha e avance no seu ritmo.</p>
            <button type="button" onClick={onOpenRali} className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-xl bg-[#B7F52B] px-6 py-3 font-extrabold text-[#0B1F3B] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60">
              Comece agora <ArrowRight size={18}/>
            </button>
          </div>
          <div className="pointer-events-none absolute -bottom-10 -right-7 hidden opacity-25 sm:block"><TrilhaMarca size={270}/></div>
          <div className="pointer-events-none absolute right-8 top-8 h-24 w-24 rounded-full border border-[#B7F52B]/30" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1 pb-1">
            <span className="h-6 w-1.5 rounded-full bg-[#00A651]"/>
            <h2 className="text-lg font-extrabold text-slate-900">Acesse uma atividade</h2>
          </div>
          <Shortcut title="Rali NFC" subtitle="Em equipe, pelo laboratório" description="Encoste o celular na etiqueta da mesa, resolva a missão e some pontos para a equipe." accent="green" icon={<Radio size={27}/>} onClick={onOpenRali}/>
          <Shortcut title="CTF Online" subtitle="Individual, fase a fase" description="Capture as bandeiras no seu ritmo e suba no ranking da sala." accent="orange" icon={<Flag size={27}/>} onClick={onOpenCtf}/>
          <Shortcut title="Cruzada Online" subtitle="Individual, por assunto" description="Monte palavras cruzadas por assunto, na sala da turma ou em treino livre." accent="cyan" icon={<Puzzle size={27}/>} onClick={onOpenCruz}/>
          <Shortcut title="Desvendando" subtitle="Em dupla, liberado pelo professor" description="Investigue com a sua dupla e acuse o culpado: só uma resposta pode ser provada." accent="violet" icon={<Search size={27}/>} onClick={onOpenDesv}/>
        </div>
      </section>

      <section id="ferramentas" className="mt-12 scroll-mt-6" aria-labelledby="ferramentas-title">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-emerald-700">Explore o HUB</p>
            <h2 id="ferramentas-title" className="mt-1 text-2xl font-black tracking-tight text-[#0B1F3B] sm:text-3xl">Nossas ferramentas</h2>
            <p className="mt-1 text-sm text-slate-600">Recursos para praticar, investigar e aprender fazendo.</p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">Aprendizagem gamificada</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ToolCard title="Jogos" description="Quatro experiências: Rali NFC, CTF, Cruzada e Desvendando." label="Explorar jogos" icon={<Gamepad2 size={30}/>} gradient="linear-gradient(135deg,#123B83,#1769AA 62%,#19A7C9)" onClick={onOpenRali}/>
          <ToolCard title="Desafios" description="Capture bandeiras, resolva etapas e acompanhe sua evolução." label="Abrir CTF" icon={<Flag size={30}/>} gradient="linear-gradient(135deg,#A94713,#E66A18 62%,#F5A623)" onClick={onOpenCtf}/>
          <ToolCard title="Simuladores e Labs" description="Explore laboratórios e experiências práticas do portal de estudos." label="Acessar laboratórios" icon={<FlaskConical size={30}/>} gradient="linear-gradient(135deg,#075985,#087E9B 62%,#22B8B5)" href={URL_ESTUDOS + 'laboratorio-3d/'}/>
          <ToolCard title="Aprendizagem" description="Acesse disciplinas, materiais, atividades e ambientes de estudo." label="Ir para Ambientes de Estudo" icon={<GraduationCap size={30}/>} gradient="linear-gradient(135deg,#12643F,#078A55 62%,#35B86B)" href={URL_ESTUDOS}/>
          <ToolCard title="Programação" description="Trilhas de código, exercícios guiados e desafios de desenvolvimento." label="" icon={<Code2 size={30}/>} gradient="linear-gradient(135deg,#43318A,#6547B9 62%,#9871E8)" soon/>
          <ToolCard title="IA na Educação" description="Ferramentas inteligentes para explorar novas formas de aprender." label="" icon={<BrainCircuit size={30}/>} gradient="linear-gradient(135deg,#542B83,#813FA8 62%,#C05DAD)" soon/>
        </div>
      </section>

      <section id="ajuda" className="mt-10 grid gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:grid-cols-4 sm:items-center sm:px-7" aria-label="Nossa jornada">
        {[
          { icon: <Star size={22}/>, title: 'Aprenda', desc: 'com experiências práticas' },
          { icon: <TrendingUp size={22}/>, title: 'Acompanhe', desc: 'seu progresso e evolução' },
          { icon: <Trophy size={22}/>, title: 'Conquiste', desc: 'pontos, etapas e resultados' },
          { icon: <Compass size={22}/>, title: 'Faça parte', desc: 'da comunidade de aprendizagem' },
        ].map((item, index) => (
          <div key={item.title} className="flex items-center gap-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${index % 2 ? 'bg-sky-50 text-sky-700' : 'bg-emerald-50 text-emerald-700'}`}>{item.icon}</span>
            <span><b className="block text-sm font-extrabold text-slate-900">{item.title}</b><small className="text-xs text-slate-600">{item.desc}</small></span>
          </div>
        ))}
      </section>
    </main>

    <footer className="relative mt-4 overflow-hidden bg-[#0B1F3B] text-white">
      <div className="absolute inset-x-0 top-0 h-2" style={{ background: 'repeating-linear-gradient(135deg,#00C853 0 14px,#0B1F3B 14px 28px)' }}/>
      <div className="trilha-font relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 pb-7 pt-9 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-3">
          <IfsLogo size="md"/>
          <div>
            <b className="block text-sm sm:text-base">Instituto Federal de Sergipe (IFS)</b>
            <span className="block text-xs text-slate-300">Campus Tobias Barreto</span>
            <span className="mt-1 block text-xs font-semibold text-[#3BE37A]">Desenvolvido e supervisionado pelo Professor Eber Santana</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <TrilhaMarca size={30}/><span>Aprenda · Acompanhe · Conquiste</span>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-[#00C853] via-[#B7F52B] to-[#00C853]"/>
    </footer>
  </div>
);
