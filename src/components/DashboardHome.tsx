import React, { useState } from 'react';
import { ArrowRight, BarChart3, Bell, BookOpen, BrainCircuit, ChevronDown, Code2, Flag, Gamepad2, GraduationCap, HelpCircle, Home, Menu, Puzzle, Radio, Rocket, Search, ShieldCheck, Star, Trophy, TrendingUp, Users, X, LockKeyhole } from 'lucide-react';
import { TrilhaMarca, TrilhaNome } from './TrilhaMarca';
import { IfsLogo } from './IfsLogo';

interface Props {
  isTeacher: boolean;
  onOpenRali: () => void;
  onOpenCtf: () => void;
  onOpenCruz: () => void;
  onOpenDesv: () => void;
  onOpenTeacher: () => void;
}
const studies = 'https://ebersantana.github.io/disciplinas/';
type Action = {title:string; subtitle:string; icon:React.ReactNode; color:string; onClick:()=>void};
export const DashboardHome: React.FC<Props> = ({isTeacher,onOpenRali,onOpenCtf,onOpenCruz,onOpenDesv,onOpenTeacher}) => {
  const [menuOpen,setMenuOpen] = useState(false);
  const [query,setQuery] = useState('');
  const [showHelp,setShowHelp] = useState(false);
  const actions:Action[] = [
    {title:'Rali NFC',subtitle:'Pelo laboratório',icon:<Radio/>,color:'#008D31',onClick:onOpenRali},
    {title:'CTF Online',subtitle:'Individual',icon:<Flag/>,color:'#F97316',onClick:onOpenCtf},
    {title:'Cruzada Online',subtitle:'Individual',icon:<Puzzle/>,color:'#1265E9',onClick:onOpenCruz},
    {title:'Desvendando',subtitle:'Dupla',icon:<Search/>,color:'#6530DF',onClick:onOpenDesv}
  ];
  const cards = [
    {title:'Jogos Educativos',subtitle:'Jogue e aprenda!',icon:<Gamepad2/>,gradient:'linear-gradient(145deg,#05A4F9,#0752C4 70%,#052A5A)',onClick:onOpenRali},
    {title:'Desafios e Conquistas',subtitle:'Supere limites!',icon:<Trophy/>,gradient:'linear-gradient(145deg,#4EDB06,#0D9B05 60%,#024C1B)',onClick:onOpenCtf},
    {title:'Simuladores e Labs',subtitle:'Pratique na prática!',icon:<BarChart3/>,gradient:'linear-gradient(145deg,#00B3F4,#0753CD 65%,#092C60)',href:studies+'laboratorio-3d/'},
    {title:'Programação',subtitle:'Em breve',icon:<Code2/>,gradient:'linear-gradient(145deg,#00C982,#006E40 70%,#02362C)',soon:true},
    {title:'IA na Educação',subtitle:'Em breve',icon:<BrainCircuit/>,gradient:'linear-gradient(145deg,#A949FF,#7424D8 65%,#230D5B)',soon:true},
    {title:'Aprendizagem',subtitle:'Ambientes de estudo',icon:<GraduationCap/>,gradient:'linear-gradient(145deg,#00BC64,#00763C 65%,#022D28)',href:studies}
  ];
  const nav = [
    {title:'Início',icon:<Home/>,onClick:()=>{window.scrollTo({top:0,behavior:'smooth'});setMenuOpen(false)}},
    {title:'Ferramentas',icon:<Gamepad2/>,onClick:()=>{document.getElementById('ferramentas')?.scrollIntoView({behavior:'smooth'});setMenuOpen(false)}},
    {title:'Desafios',icon:<Trophy/>,onClick:onOpenCtf},
    {title:'Ranking',icon:<BarChart3/>,onClick:onOpenCtf},
    {title:'Trilhas de Aprendizagem',icon:<BookOpen/>,href:studies},
    {title:'Conquistas',icon:<Star/>,onClick:()=>{document.getElementById('progresso')?.scrollIntoView({behavior:'smooth'});setMenuOpen(false)}},
    {title:'Biblioteca',icon:<BookOpen/>,href:studies},
    {title:'Ajuda e Suporte',icon:<HelpCircle/>,onClick:()=>{setShowHelp(true);setMenuOpen(false)}}
  ];
  const filtered = query.trim() ? actions.filter(a=>a.title.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))) : [];
  return <div className="tr-dashboard min-h-screen bg-[#EFF6FF] text-[#081F3B]">
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Orbitron:wght@700;800;900&display=swap');
      .tr-dashboard{font-family:Montserrat,system-ui,sans-serif}
      .tr-brand{font-family:Orbitron,system-ui,sans-serif}
      .tr-side{background:linear-gradient(165deg,#03162B,#082B4C 65%,#03152A)}
      .tr-hero{background:radial-gradient(circle at 83% 27%,#00BD5C77,transparent 32%),repeating-linear-gradient(132deg,transparent 0 55px,#0EA5E933 57px 68px,transparent 70px 120px),linear-gradient(120deg,#031528,#06426B 68%,#00974E)}
      .tr-hero:after{content:'';position:absolute;inset:auto -10% -50% 35%;height:85%;border:24px solid #8AFF10;border-radius:50%;transform:rotate(-18deg);opacity:.33;pointer-events:none}
      .tr-card{transition:transform .2s,box-shadow .2s}
      .tr-card:hover{transform:translateY(-4px);box-shadow:0 14px 24px #06234A44}
      .tr-focus:focus-visible{outline:3px solid #6EEA12;outline-offset:3px}
      @media(prefers-reduced-motion:reduce){.tr-card{transition:none}}
    `}</style>
    <div className="flex min-h-screen">
      {menuOpen && <button className="fixed inset-0 z-30 bg-[#061B32]/70 lg:hidden" aria-label="Fechar menu" onClick={()=>setMenuOpen(false)}/>}
      <aside className={`tr-side fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col overflow-y-auto px-4 py-5 text-white shadow-xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${menuOpen?'translate-x-0':'-translate-x-full'}`}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2"><TrilhaMarca size={57}/><TrilhaNome className="text-xl"/></div>
          <button className="tr-focus lg:hidden" onClick={()=>setMenuOpen(false)} aria-label="Fechar menu"><X/></button>
        </div>
        <p className="mb-5 text-center text-xs font-semibold italic text-slate-200">Hub de Ferramentas Gamificadas</p>
        <nav aria-label="Menu principal" className="space-y-1">
          {nav.map((n,i)=>n.href?<a key={n.title} href={n.href} className="tr-focus flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-white/10">{React.cloneElement(n.icon as React.ReactElement<{size:number}>,{size:19})}{n.title}</a>:<button key={n.title} onClick={n.onClick} className={`tr-focus flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${i===0?'bg-[#88F20D] text-[#06223B]':'hover:bg-white/10'}`}>{React.cloneElement(n.icon as React.ReactElement<{size:number}>,{size:19})}{n.title}</button>)}
        </nav>
        <div id="progresso" className="mt-auto space-y-3 pt-7">
          <div className="rounded-2xl border border-white/25 bg-white/5 p-4">
            <p className="text-sm font-extrabold">Meu Progresso</p>
            <p className="mt-2 text-xs text-slate-200">Seu histórico de conquistas estará disponível quando o acompanhamento individual estiver integrado.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#B7F52B]"><LockKeyhole size={13}/> Em preparação</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/25 bg-white/5 p-3"><IfsLogo size="md"/><span className="text-xs font-semibold">Instituto Federal de Sergipe<br/>Campus Tobias Barreto</span></div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex min-h-[70px] items-center gap-3 bg-[#051B34] px-4 text-white shadow-md sm:px-6">
          <button className="tr-focus rounded-lg p-2 lg:hidden" onClick={()=>setMenuOpen(true)} aria-label="Abrir menu"><Menu/></button>
          <div className="relative mx-auto w-full max-w-[570px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"/>
            <input value={query} onChange={e=>setQuery(e.target.value)} aria-label="Buscar atividades" placeholder="Buscar ferramentas e desafios..." className="tr-focus w-full rounded-xl border border-slate-500 bg-[#183657] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-300"/>
            {query.trim() && <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white text-[#081F3B] shadow-xl">{filtered.length?filtered.map(a=><button key={a.title} onClick={()=>{setQuery('');a.onClick()}} className="block w-full px-4 py-3 text-left text-sm font-bold hover:bg-slate-100">{a.title}</button>):<p className="p-3 text-sm">Nenhuma atividade encontrada</p>}</div>}
          </div>
          <button className="tr-focus hidden rounded-full p-2 sm:block" onClick={()=>setShowHelp(true)} aria-label="Informações e ajuda"><Bell size={20}/></button>
          <button className="tr-focus flex shrink-0 items-center gap-2" onClick={onOpenTeacher} aria-label="Acessar área do professor"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8EF51C] text-[#08223C]"><ShieldCheck size={20}/></span><span className="hidden text-left text-xs font-bold sm:block">{isTeacher?'Professor':'Área do professor'}<small className="block font-normal text-slate-300">Acessar painel</small></span><ChevronDown size={14}/></button>
        </header>
        <main className="w-full flex-1 space-y-5 p-3 sm:p-5">
          <section className="grid gap-3 xl:grid-cols-[minmax(0,2.5fr)_minmax(225px,1fr)]">
            <div className="tr-hero relative isolate flex min-h-[275px] overflow-hidden rounded-[24px] border border-[#08D06B]/40 px-6 py-7 shadow-lg sm:px-9">
              <div className="relative z-10 flex max-w-[67%] flex-col justify-center"><p className="text-xl italic text-white">Bem-vindo ao</p><h1 className="tr-brand my-2 text-[clamp(29px,4vw,60px)] font-black italic leading-none text-[#8BF619] drop-shadow-lg">Trilha Rali!</h1><p className="max-w-[400px] text-sm font-semibold text-white sm:text-base">Seu HUB de ferramentas gamificadas para aprender, evoluir e conquistar.</p><button onClick={onOpenRali} className="tr-focus mt-5 flex w-fit items-center gap-2 rounded-xl bg-[#91FA12] px-5 py-3 text-sm font-extrabold text-[#061B32] hover:brightness-110"><Rocket size={18}/> Comece agora <ArrowRight size={17}/></button></div>
              <div className="pointer-events-none absolute bottom-6 right-4 z-10 flex h-[66%] w-[34%] items-center justify-center opacity-90"><TrilhaMarca size={190}/></div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">{actions.map(a=><button key={a.title} onClick={a.onClick} className="tr-focus tr-card flex min-h-[62px] items-center gap-3 rounded-2xl border border-[#C7D9F0] bg-white px-4 py-2 text-left shadow-md"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{background:a.color+'18',color:a.color}}>{a.icon}</span><span className="flex-1"><b className="block text-sm">{a.title}</b><small className="text-xs text-slate-600">{a.subtitle}</small></span><ArrowRight size={18}/></button>)}</div>
          </section>
          <section id="ferramentas" className="scroll-mt-24">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="border-l-[5px] border-[#00C853] pl-3 text-xl font-black">Nossas Ferramentas</h2><a href={studies} className="tr-focus flex items-center gap-1 text-xs font-bold text-green-800">Ambientes de estudo <ArrowRight size={16}/></a></div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">{cards.map(c=>{const inner=<><span className="mb-2 [&>svg]:h-10 [&>svg]:w-10">{c.icon}</span><b className="text-center text-sm leading-tight">{c.title}</b><small className="mt-2 text-center text-xs">{c.subtitle}</small>{!c.soon&&<ArrowRight size={15} className="absolute bottom-2 right-2"/>}</>;const cls="tr-card tr-focus relative flex min-h-[155px] flex-col items-center justify-center overflow-hidden rounded-2xl px-3 py-4 text-white shadow-md";return c.soon?<div key={c.title} className={cls} style={{background:c.gradient}} aria-label={c.title+' em breve'}>{inner}</div>:c.href?<a key={c.title} href={c.href} className={cls} style={{background:c.gradient}}>{inner}</a>:<button key={c.title} onClick={c.onClick} className={cls} style={{background:c.gradient}}>{inner}</button>})}</div>
          </section>
          <section aria-label="Nossa jornada" className="grid grid-cols-2 gap-3 rounded-2xl border border-[#CFDEED] bg-white p-4 shadow-md md:grid-cols-4">{[{title:'Aprenda',desc:'com jogos e desafios',icon:<Star/>,color:'#008B37'},{title:'Acompanhe',desc:'seu progresso',icon:<TrendingUp/>,color:'#0767D8'},{title:'Conquiste',desc:'novas habilidades',icon:<Trophy/>,color:'#EAB308'},{title:'Faça parte',desc:'desta jornada',icon:<Users/>,color:'#009F3E'}].map(x=><div key={x.title} className="flex items-center justify-center gap-2 border-r border-slate-200 last:border-r-0"><span style={{color:x.color}}>{x.icon}</span><span><b className="block text-sm">{x.title}</b><small className="text-xs text-slate-600">{x.desc}</small></span></div>)}</section>
          <section className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#CFDEED] bg-white p-5 shadow-md"><h3 className="mb-3 flex items-center gap-2 font-extrabold"><BookOpen size={20}/> Atividades</h3><p className="text-sm text-slate-600">Escolha uma das atividades disponíveis para começar sua jornada.</p><button onClick={onOpenRali} className="tr-focus mt-4 inline-flex items-center gap-1 text-sm font-bold text-green-800">Explorar jogos <ArrowRight size={15}/></button></div>
            <div className="rounded-2xl border border-[#CFDEED] bg-white p-5 shadow-md"><h3 className="mb-3 flex items-center gap-2 font-extrabold"><BarChart3 size={20}/> Ranking da Turma</h3><p className="text-sm text-slate-600">Confira os resultados diretamente no módulo de desafios.</p><button onClick={onOpenCtf} className="tr-focus mt-4 inline-flex items-center gap-1 text-sm font-bold text-green-800">Abrir desafios <ArrowRight size={15}/></button></div>
            <div className="rounded-2xl bg-gradient-to-br from-[#05213D] to-[#00744D] p-5 text-white shadow-md"><h3 className="mb-3 flex items-center gap-2 text-lg font-extrabold"><Trophy className="text-[#B7F52B]"/> Desafie-se!</h3><p className="text-sm">Novos conhecimentos, desafios e conquistas.</p><button onClick={onOpenCtf} className="tr-focus mt-4 inline-flex items-center gap-2 rounded-xl bg-[#B7F52B] px-4 py-2 text-sm font-extrabold text-[#05213D]">Ver desafios <ArrowRight size={16}/></button></div>
          </section>
        </main>
        <footer className="relative overflow-hidden border-t-[5px] border-[#00C853] bg-[#051B34] px-5 py-5 text-white"><div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><IfsLogo size="md"/><span className="text-xs font-bold">Instituto Federal de Sergipe (IFS) · Campus Tobias Barreto</span></div><span className="text-xs font-semibold italic text-[#B7F52B]">Desenvolvido e Supervisionado pelo Professor Eber Santana</span></div></footer>
      </div>
    </div>
    {showHelp&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03182A]/75 p-4" role="dialog" aria-modal="true" aria-label="Ajuda"><div className="w-full max-w-md rounded-2xl bg-white p-6 text-[#061B32] shadow-xl"><div className="flex items-center justify-between"><h2 className="text-lg font-black">Ajuda e navegação</h2><button onClick={()=>setShowHelp(false)} aria-label="Fechar ajuda"><X/></button></div><p className="mt-3 text-sm">Escolha Rali NFC, CTF, Cruzada ou Desvendando nos atalhos. Para materiais e laboratórios, acesse Ambientes de Estudo. A área do professor exige autenticação.</p><button onClick={()=>setShowHelp(false)} className="mt-5 rounded-lg bg-[#B7F52B] px-4 py-2 font-bold">Entendi</button></div></div>}
  </div>;
};
