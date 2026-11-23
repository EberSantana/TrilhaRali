import React from 'react';
import {
  ArrowRight, BarChart3, Bell, BookOpen, BrainCircuit, ChevronDown, Code2, Flag,
  FlaskConical, Gamepad2, GraduationCap, HelpCircle, Home, Lock,
  Puzzle, Radio, Rocket, Search, ShieldCheck, Star, Trophy, TrendingUp, UserRound, Users
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
const NAVY = '#061B32';
const LIME = '#B7F52B';

type Accent = 'green' | 'orange' | 'cyan' | 'violet';
const accents: Record<Accent, { icon: string; border: string; arrow: string }> = {
  green: { icon: 'bg-emerald-50 text-emerald-700', border: 'border-l-emerald-500', arrow: 'text-emerald-800' },
  orange: { icon: 'bg-orange-50 text-orange-700', border: 'border-l-orange-500', arrow: 'text-orange-800' },
  cyan: { icon: 'bg-sky-50 text-sky-700', border: 'border-l-sky-500', arrow: 'text-sky-800' },
  violet: { icon: 'bg-violet-50 text-violet-700', border: 'border-l-violet-500', arrow: 'text-violet-800' },
};

interface ShortcutProps {
  title: string; subtitle: string; accent: Accent; icon: React.ReactNode; onClick: () => void;
}
const Shortcut: React.FC<ShortcutProps> = ({ title, subtitle, accent, icon, onClick }) => {
  const a = accents[accent];
  return (
    <button type="button" onClick={onClick}
      className={`group flex min-h-[50px] w-full items-center gap-2.5 rounded-xl border border-slate-200 border-l-[5px] ${a.border} bg-white px-3 py-2.5 text-left shadow-[0_3px_10px_rgba(10,35,60,.08)] transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600`}>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.icon}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-extrabold leading-tight text-slate-900">{title}</span>
        <span className="mt-0.5 block text-[10px] font-semibold text-slate-500">{subtitle}</span>
      </span>
      <ArrowRight className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 ${a.arrow}`} />
    </button>
  );
};

interface ToolCardProps {
  title: string; description: string; label: string; icon: React.ReactNode; gradient: string;
  onClick?: () => void; href?: string; soon?: boolean;
}
const ToolCard: React.FC<ToolCardProps> = ({ title, description, label, icon, gradient, onClick, href, soon }) => {
  const inner = (
    <>
      {soon && <span className="absolute right-2 top-2 rounded-full border border-white/30 bg-black/20 px-2 py-1 text-[8px] font-extrabold uppercase tracking-wider text-white">Em breve</span>}
      <span className="relative z-10 mb-2 flex h-11 w-11 items-center justify-center text-white drop-shadow-md">{icon}</span>
      <span className="relative z-10 block text-center text-[13px] font-extrabold leading-tight text-white sm:text-sm">{title}</span>
      <span className="relative z-10 mt-1.5 line-clamp-2 text-center text-[10px] leading-snug text-white/90">{soon ? description : label}</span>
      {!soon && <span className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white"><ArrowRight size={12}/></span>}
      <span className="pointer-events-none absolute -bottom-10 -right-8 h-24 w-24 rounded-full border border-white/20 shadow-[0_0_0_12px_rgba(255,255,255,.05),0_0_0_24px_rgba(255,255,255,.04)]"/>
    </>
  );
  const cls = `relative flex min-h-[112px] flex-col items-center justify-start overflow-hidden rounded-xl px-1.5 pb-4 pt-2.5 text-center shadow-[0_5px_12px_rgba(10,35,60,.18)] transition sm:min-h-[118px] ${soon ? 'cursor-default opacity-90' : 'hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300'}`;
  if (href) return <a href={href} className={cls} style={{ background: gradient }} aria-label={title}>{inner}</a>;
  if (soon) return <div className={cls} style={{ background: gradient }} aria-label={`${title}: em breve`}>{inner}</div>;
  return <button type="button" onClick={onClick} disabled={!onClick} className={cls} style={{ background: gradient }}>{inner}</button>;
};

const HeroArtwork: React.FC = () => (
  <svg viewBox="0 0 520 310" className="pointer-events-none absolute -bottom-1 -right-8 h-[88%] w-[58%] max-w-[540px] opacity-95 sm:right-0 sm:w-[56%]" role="img" aria-label="Ilustração de controle de videogame, capelo e pista tecnológica">
    <defs>
      <linearGradient id="heroRoad" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#00D66B"/><stop offset="1" stopColor="#B7F52B"/></linearGradient>
      <linearGradient id="heroPad" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#153C5C"/><stop offset="1" stopColor="#020B18"/></linearGradient>
      <linearGradient id="heroCap" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#15C7E8"/><stop offset="1" stopColor="#073B68"/></linearGradient>
      <filter id="heroGlow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <path d="M38 280 C100 205 150 245 205 174 S330 115 482 18" fill="none" stroke="url(#heroRoad)" strokeWidth="24" opacity=".2" filter="url(#heroGlow)"/>
    <path d="M10 286 C85 214 130 245 195 177 S332 120 500 18" fill="none" stroke="url(#heroRoad)" strokeWidth="8" strokeLinecap="round"/>
    <path d="M20 303 C103 232 142 264 213 193 S350 138 514 40" fill="none" stroke="#F5FFF7" strokeWidth="2" strokeDasharray="10 13" opacity=".8"/>
    <path d="M54 246 C116 177 154 213 215 148 S337 94 473 4" fill="none" stroke="#00A7E8" strokeWidth="5" opacity=".8"/>
    <g fill="none" stroke="#00D66B" strokeWidth="3" opacity=".9">
      <path d="M65 100h54l18-18h35"/><path d="M80 126h35l17 17h37"/><path d="M370 85h42l20-20h36"/>
      <circle cx="172" cy="82" r="5" fill="#B7F52B"/><circle cx="169" cy="143" r="5" fill="#B7F52B"/><circle cx="468" cy="65" r="5" fill="#B7F52B"/>
    </g>
    <g transform="translate(150 92)">
      <path d="M58 10 160 0 263 38 160 78 58 38Z" fill="#031326" stroke="#27D9F2" strokeWidth="4"/>
      <path d="M93 38v37c0 21 134 21 134 0V38L160 63Z" fill="url(#heroCap)" stroke="#0B8BC1" strokeWidth="3"/>
      <path d="M160 61v45" stroke="#FACC15" strokeWidth="4"/><path d="M154 103h13l4 21h-21Z" fill="#FACC15"/>
      <path d="M215 27v33" stroke="#FACC15" strokeWidth="4"/>
    </g>
    <g transform="translate(68 142) rotate(-8 190 80)">
      <path d="M62 42h258c34 0 52 21 60 56l12 54c7 31-22 47-44 25l-39-38H72l-39 38c-22 22-51 6-44-25l12-54c8-35 26-56 61-56Z" fill="url(#heroPad)" stroke="#25D9F1" strokeWidth="5"/>
      <path d="M82 84h48" stroke="#EAF5FF" strokeWidth="15" strokeLinecap="round"/><path d="M106 60v48" stroke="#EAF5FF" strokeWidth="15" strokeLinecap="round"/>
      <circle cx="285" cy="78" r="13" fill="#19D66B"/><circle cx="316" cy="99" r="13" fill="#F6C51C"/><circle cx="258" cy="105" r="13" fill="#18A8F3"/><circle cx="289" cy="128" r="13" fill="#F04438"/>
      <circle cx="190" cy="95" r="10" fill="#CBD5E1"/><path d="M172 125l18-10 16 10-18 12Z" fill="#64748B"/>
    </g>
  </svg>
);

export const HomeLanding: React.FC<HomeLandingProps> = ({ isTeacher, onOpenRali, onOpenCtf, onOpenCruz, onOpenDesv, onOpenTeacher }) => (
  <div id="inicio" className="trilha-font flex min-h-screen w-full flex-col bg-[#F2F5F8] text-slate-900">
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800;900&family=Montserrat:wght@400;500;600;700;800&display=swap');
      .trilha-font { font-family: 'Montserrat', system-ui, sans-serif; }
      .trilha-orbitron { font-family: 'Orbitron', system-ui, sans-serif; }
      .trilha-header-cut { clip-path: polygon(0 0,100% 0,100% 100%,0 100%,4% 0); }
      .trilha-hero { background: radial-gradient(ellipse at 78% 45%,rgba(0,174,239,.22),transparent 34%), radial-gradient(ellipse at 55% 100%,rgba(0,200,83,.25),transparent 42%), linear-gradient(112deg,#04172B 0%,#062748 56%,#06182B 100%); }
      .trilha-hero:before { content:''; position:absolute; inset:0; pointer-events:none; background:repeating-linear-gradient(130deg,transparent 0 52px,rgba(0,174,239,.18) 53px 65px,transparent 66px 112px); mask-image:linear-gradient(90deg,transparent 4%,#000 55%,#000); }
      .trilha-hero:after { content:''; position:absolute; inset:0; pointer-events:none; background:radial-gradient(ellipse at 15% 50%,transparent 15%,rgba(0,0,0,.2) 100%); }
      .trilha-footer-cut { clip-path:polygon(0 0,100% 0,100% 100%,0 100%,4% 0); }
      @media (prefers-reduced-motion: reduce) { .trilha-tool, .trilha-tool * { transition:none!important; } }
    `}</style>

    <header className="relative z-20 overflow-hidden bg-[#061B32] text-white shadow-lg">
      <div className="pointer-events-none absolute right-0 top-0 h-full w-40 bg-gradient-to-l from-[#00C853] to-[#B7F52B]" style={{ clipPath: 'polygon(72% 0,100% 0,100% 100%,0 100%)' }}/>
      <div className="relative mx-auto flex min-h-[70px] max-w-[1440px] flex-wrap items-center justify-between gap-2 px-3 py-2 sm:flex-nowrap sm:px-5 lg:px-8">
        <a href="#inicio" className="flex shrink-0 items-center gap-2.5" aria-label="Trilha Rali - Início">
          <TrilhaMarca size={42}/>
          <TrilhaNome className="text-[18px] sm:text-[20px]"/>
          <span className="ml-1 hidden h-10 w-px bg-white/50 sm:block"/>
        </a>
        <nav aria-label="Menu principal" className="order-3 flex w-full flex-wrap items-center justify-center gap-1 text-[10px] font-bold sm:order-none sm:w-auto sm:flex-1 sm:flex-nowrap sm:gap-0.5">
          <a href="#inicio" className="inline-flex items-center gap-1.5 rounded-xl bg-[#B7F52B] px-3 py-2.5 text-[#071B2E] shadow-sm"><Home size={16}/> Início</a>
          <a href="#ferramentas" className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-slate-100 transition hover:bg-white/10"><Gamepad2 size={16}/> Ferramentas</a>
          <button onClick={onOpenCtf} className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-slate-100 transition hover:bg-white/10"><Trophy size={16}/> Desafios</button>
          <button onClick={onOpenCtf} className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-slate-100 transition hover:bg-white/10"><BarChart3 size={16}/> Ranking</button>
          <a href="#ajuda" className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-slate-100 transition hover:bg-white/10"><HelpCircle size={16}/> Ajuda</a>
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" aria-label="Notificações" title="Notificações" className="flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/10"><Bell size={17}/></button>
          <button type="button" onClick={onOpenTeacher} title={isTeacher ? 'Área do professor' : 'Acesso do professor'} aria-label="Perfil e área do professor" className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/80 bg-gradient-to-br from-[#B7F52B] to-[#00A651] text-white shadow"><UserRound size={18}/></button>
          <button type="button" onClick={onOpenTeacher} aria-label="Abrir opções do perfil" className="flex h-7 w-5 items-center justify-center text-white"><ChevronDown size={14}/></button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-[#00C853] via-[#B7F52B] to-transparent"/>
    </header>

    <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-5 pt-4 sm:px-6 lg:px-8">
      <section className="grid items-stretch gap-2.5 sm:grid-cols-[minmax(0,2.15fr)_minmax(145px,1fr)] sm:gap-3" aria-label="Boas-vindas e atalhos">
        <div className="trilha-hero relative isolate flex min-h-[215px] overflow-hidden rounded-[22px] border border-emerald-300/40 px-5 py-5 shadow-[0_7px_18px_rgba(3,25,47,.22)] sm:min-h-[235px] sm:px-7 sm:py-6">
          <div className="relative z-10 flex max-w-[54%] flex-col items-start justify-center">
            <p className="text-[15px] italic text-slate-100 sm:text-lg">Bem-vindo ao</p>
            <h1 className="trilha-orbitron mt-0.5 text-[30px] font-black italic leading-tight sm:text-[42px] xl:text-[48px]" style={{ background: 'linear-gradient(100deg,#E8FF9B 0%,#B7F52B 48%,#54E52B 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Trilha Rali!</h1>
            <p className="mt-1 max-w-[340px] text-[11px] font-semibold leading-snug text-white sm:text-[13px]">Seu HUB de ferramentas gamificadas para aprender, evoluir e conquistar.</p>
            <button type="button" onClick={onOpenRali} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-xl bg-[#B7F52B] px-4 py-2 text-[12px] font-extrabold text-[#071B2E] shadow-lg transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"><Rocket size={15}/> Comece agora <ArrowRight size={15}/></button>
          </div>
          <HeroArtwork/>
          <div className="pointer-events-none absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#00C853] via-[#B7F52B] to-transparent"/>
        </div>

        <div className="grid content-center gap-2">
          <Shortcut title="Rali NFC" subtitle="Pelo laboratório" accent="green" icon={<Radio size={22}/>} onClick={onOpenRali}/>
          <Shortcut title="CTF Online" subtitle="Individual" accent="orange" icon={<Flag size={22}/>} onClick={onOpenCtf}/>
          <Shortcut title="Cruzada Online" subtitle="Individual" accent="cyan" icon={<Puzzle size={22}/>} onClick={onOpenCruz}/>
          <Shortcut title="Desvendando" subtitle="Dupla" accent="violet" icon={<Search size={22}/>} onClick={onOpenDesv}/>
        </div>
      </section>

      <section id="ferramentas" className="mt-5 scroll-mt-6" aria-labelledby="ferramentas-title">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-1.5 rounded-full bg-[#00C853]"/>
            <h2 id="ferramentas-title" className="text-lg font-black tracking-tight text-[#0B1F3B] sm:text-xl">Nossas Ferramentas</h2>
          </div>
          <a href="#ferramentas" className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 hover:text-green-900">Ver todas as ferramentas <ArrowRight size={13}/></a>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-2">
          <ToolCard title="Jogos Educativos" description="Acesse Rali NFC, CTF, Cruzada e Desvendando." label="Jogue e aprenda!" icon={<Gamepad2 size={34}/>} gradient="linear-gradient(145deg,#079CFF,#0753C9 70%,#073B91)" href="#atividades"/>
          <ToolCard title="Desafios e Conquistas" description="Capture bandeiras e suba no ranking." label="Supere limites!" icon={<Trophy size={34}/>} gradient="linear-gradient(145deg,#16D92F,#078A35 72%,#045A2A)" onClick={onOpenCtf}/>
          <ToolCard title="Simuladores e Labs" description="Pratique nos laboratórios do portal de estudos." label="Pratique na prática!" icon={<BarChart3 size={34}/>} gradient="linear-gradient(145deg,#00A8F5,#0757D4 70%,#073C9C)" href={URL_ESTUDOS + 'laboratorio-3d/'}/>
          <ToolCard title="Programação" description="Trilhas de código, exercícios guiados e desafios." label="Codifique e evolua!" icon={<Code2 size={34}/>} gradient="linear-gradient(145deg,#00D99B,#007A58 70%,#034A42)" soon/>
          <ToolCard title="IA na Educação" description="Explore o futuro da aprendizagem com IA." label="Explore o futuro!" icon={<BrainCircuit size={34}/>} gradient="linear-gradient(145deg,#B448F4,#6D28D9 72%,#3E168C)" soon/>
          <ToolCard title="Aprendizagem" description="Conhecimento sem limites: disciplinas e ambientes de estudo." label="Acesse os estudos!" icon={<GraduationCap size={34}/>} gradient="linear-gradient(145deg,#08B96B,#087A45 72%,#064B32)" href={URL_ESTUDOS}/>
        </div>
      </section>

      <section id="atividades" className="sr-only" aria-label="Atividades disponíveis">
        <h2>Atividades</h2><p>Rali NFC, CTF Online, Cruzada Online e Desvendando.</p>
      </section>

      <section id="ajuda" className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_3px_12px_rgba(10,35,60,.08)] sm:grid-cols-4 sm:items-center sm:px-5" aria-label="Nossa jornada">
        {[
          { icon: <Star size={21}/>, title: 'Aprenda', desc: 'com jogos e desafios', color: 'text-green-700' },
          { icon: <TrendingUp size={21}/>, title: 'Acompanhe', desc: 'seu progresso', color: 'text-blue-700' },
          { icon: <Trophy size={21}/>, title: 'Conquiste', desc: 'novas habilidades', color: 'text-amber-500' },
          { icon: <Users size={21}/>, title: 'Faça parte', desc: 'desta jornada', color: 'text-green-700' },
        ].map((item, index) => (
          <div key={item.title} className={`flex items-center justify-center gap-2.5 ${index ? 'sm:border-l sm:border-slate-300' : ''}`}>
            <span className={item.color}>{item.icon}</span>
            <span><b className="block text-[11px] font-extrabold text-slate-900">{item.title}</b><small className="block text-[10px] text-slate-600">{item.desc}</small></span>
          </div>
        ))}
      </section>
    </main>

    <footer className="relative mt-1 overflow-hidden bg-[#061B32] text-white">
      <div className="absolute inset-x-0 top-0 h-2" style={{ background: 'repeating-linear-gradient(135deg,#00C853 0 14px,#061B32 14px 28px)' }}/>
      <div className="pointer-events-none absolute bottom-0 left-0 h-9 w-24 -skew-x-[35deg] bg-[#00C853] opacity-90"/>
      <div className="pointer-events-none absolute bottom-0 right-0 h-9 w-28 -skew-x-[35deg] bg-[#B7F52B] opacity-90"/>
      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-5 pb-4 pt-6 text-center sm:flex-row sm:text-left lg:px-8">
        <div className="flex items-center gap-2.5">
          <IfsLogo size="md"/>
          <div><b className="block text-[12px] sm:text-sm">Instituto Federal de Sergipe (IFS) · Campus Tobias Barreto</b><span className="mt-0.5 block text-[10px] font-semibold text-[#B7F52B]">Desenvolvido e Supervisionado pelo Professor Eber Santana</span></div>
        </div>
        <div className="font-marca text-[10px] text-[#B7F52B]">Aprenda · Acompanhe · Conquiste · Faça parte</div>
      </div>
    </footer>
  </div>
);
