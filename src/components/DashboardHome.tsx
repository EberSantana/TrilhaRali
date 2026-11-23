import React, { useState } from 'react';
import { ArrowRight, BarChart3, Bell, BookOpen, ChevronDown, Code2, Flag, Gamepad2, GraduationCap, Home, Layers3, Menu, Puzzle, Radio, Search, ShieldCheck, Trophy, X, Medal, Lightbulb, Laptop, Check, TrendingUp, Play, HelpCircle } from 'lucide-react';
import { IfsLogo } from './IfsLogo';

interface Props { isTeacher:boolean; onOpenRali:()=>void; onOpenCtf:()=>void; onOpenCruz:()=>void; onOpenDesv:()=>void; onOpenTeacher:()=>void }
const studies = 'https://ebersantana.github.io/disciplinas/';
export const DashboardHome:React.FC<Props> = ({isTeacher,onOpenRali,onOpenCtf,onOpenCruz,onOpenDesv,onOpenTeacher}) => {
 const [menuOpen,setMenuOpen]=useState(false);
 const [query,setQuery]=useState('');
 const [help,setHelp]=useState(false);
 const games=[
  {name:'Rali NFC',desc:'Desafios com tecnologia NFC',icon:<Radio/>,tone:'green',open:onOpenRali},
  {name:'CTF Online',desc:'Capture as bandeiras',icon:<Flag/>,tone:'orange',open:onOpenCtf},
  {name:'Cruzada Online',desc:'Conhecimento de forma divertida',icon:<Puzzle/>,tone:'blue',open:onOpenCruz},
  {name:'Desvendando',desc:'Investigue, analise e resolva',icon:<Search/>,tone:'purple',open:onOpenDesv}
 ];
 const nav=[
  {name:'Início',icon:<Home/>,action:()=>window.scrollTo({top:0,behavior:'smooth'})},
  {name:'Jogos e Desafios',icon:<Gamepad2/>,action:()=>document.getElementById('jogos')?.scrollIntoView({behavior:'smooth'})},
  {name:'Trilhas de Aprendizagem',icon:<Layers3/>,url:studies},
  {name:'Ranking',icon:<BarChart3/>,action:onOpenCtf},
  {name:'Conquistas',icon:<Medal/>,action:()=>document.getElementById('recursos')?.scrollIntoView({behavior:'smooth'})},
  {name:'Biblioteca',icon:<BookOpen/>,url:studies},
  {name:'Área do Professor',icon:<GraduationCap/>,action:onOpenTeacher}
 ];
 const filtered=games.filter(g=>(g.name+' '+g.desc).toLowerCase().includes(query.toLowerCase()));
 return <div className="trp min-h-screen bg-[#FCFDFE] text-[#0A1930]">
 <style>{`
 .trp{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
 .trp .trp-shadow{box-shadow:0 6px 16px rgba(19,45,61,.10),0 1px 3px rgba(19,45,61,.05)}
 .trp .trp-card{transition:transform .2s,box-shadow .2s}
 .trp .trp-card:hover{transform:translateY(-3px);box-shadow:0 12px 24px rgba(19,45,61,.14)}
 .trp .trp-hero{background:linear-gradient(115deg,#E8F9F1 0%,#F7FFFA 42%,#D4F5E4 71%,#10C33D 100%)}
 .trp .trp-hero:before{content:"";position:absolute;right:17%;top:-35%;width:21%;height:190%;transform:skewX(-29deg);background:rgba(255,255,255,.42)}
 .trp .trp-hero:after{content:"";position:absolute;right:-4%;bottom:-65%;width:60%;height:100%;border-radius:40%;background:#0DAE35;transform:rotate(-20deg)}
 .trp .trp-logo{font-style:italic;letter-spacing:-.085em;font-weight:950}
 .trp .trp-game.green{background:linear-gradient(125deg,#E9FFF0,#E3F9E9);border-color:#D8F1DF}
 .trp .trp-game.orange{background:linear-gradient(125deg,#FFF9EC,#FFF0D9);border-color:#FBE6BF}
 .trp .trp-game.blue{background:linear-gradient(125deg,#EAF7FF,#DDF1FF);border-color:#CBE6FA}
 .trp .trp-game.purple{background:linear-gradient(125deg,#F6EFFF,#EFE4FF);border-color:#E3D3FB}
 .trp .trp-game.green .trp-icon{color:#09A72E}.trp .trp-game.orange .trp-icon{color:#FF8A00}
 .trp .trp-game.blue .trp-icon{color:#087DFA}.trp .trp-game.purple .trp-icon{color:#7225EA}
 .trp .trp-game svg{width:43px;height:43px;stroke-width:2.8}
 .trp button:focus-visible,.trp a:focus-visible,.trp input:focus-visible{outline:3px solid #16A34A;outline-offset:3px}
 @media(prefers-reduced-motion:reduce){.trp .trp-card{transition:none}}
 `}</style>
 {menuOpen&&<button className="fixed inset-0 z-40 bg-[#0B1F32]/40 lg:hidden" aria-label="Fechar menu" onClick={()=>setMenuOpen(false)}/>}
 <div className="flex min-h-screen">
 <aside className={`fixed inset-y-0 left-0 z-50 flex w-[268px] flex-col overflow-y-auto border-r border-[#E6EDF1] bg-white px-4 py-5 shadow-sm transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${menuOpen?'translate-x-0':'-translate-x-full'}`}>
  <div className="mb-9 flex items-center justify-between px-2">
   <div className="flex items-center gap-2"><span className="trp-logo text-[45px] leading-none text-[#08B62B]">T<span className="text-[#082C30]">R</span></span><span className="text-[22px] font-black italic leading-[.92] tracking-tight">Trilha Rali <span className="mt-1 block w-fit rounded-md bg-[#00A922] px-2 py-0.5 text-[19px] text-white">HUB</span></span></div>
   <button className="lg:hidden" aria-label="Fechar menu" onClick={()=>setMenuOpen(false)}><X/></button>
  </div>
  <nav className="space-y-1.5" aria-label="Navegação principal">{nav.map((item,i)=>{const cls=`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-[14px] font-semibold transition-colors ${i===0?'bg-[#00AB17] text-white shadow-sm':'text-[#10263B] hover:bg-[#EFF8F1]'}`;return item.url?<a key={item.name} href={item.url} className={cls}>{React.cloneElement(item.icon as React.ReactElement<{size?:number}>,{size:22})}{item.name}</a>:<button key={item.name} className={cls} onClick={()=>{item.action?.();setMenuOpen(false)}}>{React.cloneElement(item.icon,{size:22})}{item.name}</button>})}</nav>
  <div className="mt-auto border-t border-[#E3EAF0] pt-6">
   <div className="flex items-center gap-3 px-2"><IfsLogo size="md"/><div className="text-[12px] leading-snug"><b className="block text-[13px]">INSTITUTO FEDERAL</b>Sergipe<br/>Campus Tobias Barreto</div></div>
  </div>
 </aside>
 <div className="min-w-0 flex-1">
  <header className="flex flex-wrap items-center gap-4 border-b border-[#F0F3F5] bg-white px-5 py-4 lg:flex-nowrap lg:px-8">
   <button className="lg:hidden" aria-label="Abrir menu" onClick={()=>setMenuOpen(true)}><Menu/></button>
   <div className="min-w-[190px] flex-1"><h2 className="text-[24px] font-extrabold tracking-tight lg:text-[28px]">Olá, estudante! 👋</h2><p className="text-[13px] font-medium">Que bom te ver no Trilha Rali HUB.</p></div>
   <div className="relative order-3 w-full lg:order-none lg:max-w-[460px] lg:flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B637C]" size={22}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar jogos, trilhas, conteúdos..." aria-label="Buscar jogos" className="trp-shadow w-full rounded-full border border-[#DFE8EE] bg-white py-3 pl-12 pr-5 text-[14px] outline-none"/>{query.trim()&&<div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-[#E3EAF0] bg-white p-2 shadow-xl">{filtered.length?filtered.map(g=><button key={g.name} className="block w-full rounded-lg px-4 py-2 text-left hover:bg-[#F0F8F3]" onClick={()=>{setQuery('');g.open()}}>{g.name}</button>):<p className="p-2 text-sm">Nenhum jogo encontrado</p>}</div>}</div>
   <button aria-label="Ajuda" onClick={()=>setHelp(true)} className="relative rounded-full p-2"><Bell size={24}/><span className="absolute right-2 top-1 h-2.5 w-2.5 rounded-full bg-red-500"/></button>
   <button onClick={onOpenTeacher} aria-label="Área do professor" className="flex items-center gap-2"><span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#00B92C] bg-[#E9F8ED]"><ShieldCheck size={23}/></span><ChevronDown size={17}/></button>
  </header>
  <main className="mx-auto max-w-[1530px] space-y-7 p-4 sm:p-6 lg:p-7">
   <section className="trp-hero trp-shadow relative isolate min-h-[265px] overflow-hidden rounded-[22px] px-6 py-7 sm:px-9">
    <div className="relative z-10 max-w-[56%]"><h1 className="text-[clamp(30px,4vw,56px)] font-black italic leading-tight tracking-tight text-[#062C33]">Trilha Rali <span className="rounded-lg bg-[#00AE22] px-2 text-white">HUB</span></h1><p className="mt-3 max-w-[430px] text-[clamp(15px,1.5vw,22px)] font-medium leading-snug text-[#173C4B]">Aprenda, pratique e evolua com desafios gamificados de tecnologia.</p><button onClick={()=>document.getElementById('jogos')?.scrollIntoView({behavior:'smooth'})} className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#00A915] px-6 py-3 text-[15px] font-bold text-white shadow-md"><Play size={19} fill="#E7FF33" color="#E7FF33"/>Explorar Jogos</button></div>
    <div className="pointer-events-none absolute bottom-2 right-[2%] z-10 flex h-[90%] w-[45%] items-center justify-center">
      <div className="relative flex h-full w-full items-center justify-center">
       <div className="absolute bottom-[11%] right-[8%] h-[18%] w-[68%] rounded-[50%] bg-[#007F39]/20 blur-lg"/>
       <div className="relative flex h-[63%] w-[66%] flex-col items-center justify-center rounded-2xl border-[8px] border-[#143A46] bg-[#0A2836] shadow-[12px_15px_0_#1B5C56]"><Code2 className="h-[40%] w-[40%] text-[#15D86A]" strokeWidth={3}/><div className="absolute -bottom-[12%] h-[8%] w-[125%] rounded-full bg-[#36545A]"/></div>
       <GraduationCap className="absolute right-[15%] top-[1%] h-[35%] w-[45%] text-[#0C2C3B] drop-shadow-xl" fill="#0C2C3B" strokeWidth={1.2}/>
       <Gamepad2 className="absolute bottom-[1%] left-[0%] h-[43%] w-[42%] -rotate-12 text-white drop-shadow-xl" fill="#E6F0F3" stroke="#244356" strokeWidth={1.5}/>
       <Lightbulb className="absolute right-[1%] top-[18%] h-[27%] w-[20%] text-[#FFE95B] drop-shadow-lg" strokeWidth={1.8}/>
      </div>
    </div>
   </section>
   <section id="jogos" className="scroll-mt-24"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-3 text-[23px] font-extrabold tracking-tight"><Gamepad2 className="text-[#00AF22]" size={29}/>Nossos Jogos e Desafios</h2><button onClick={()=>document.getElementById('jogos')?.scrollIntoView({behavior:'smooth'})} className="hidden items-center gap-1 font-semibold text-[#009B20] sm:flex">Ver todos <ArrowRight size={20}/></button></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{games.map(g=><button key={g.name} onClick={g.open} className={`trp-game trp-card trp-shadow ${g.tone} flex min-h-[137px] items-center gap-4 rounded-[20px] border p-5 text-left`}><span className="trp-icon shrink-0">{g.icon}</span><span className="min-w-0 flex-1"><b className="block text-[18px] font-extrabold leading-tight">{g.name}</b><span className="mt-2 block text-[14px] leading-snug text-[#233B4A]">{g.desc}</span></span><span className="self-end rounded-full bg-white p-2 shadow-sm"><ArrowRight size={20}/></span></button>)}</div>
   </section>
   <section id="recursos" className="grid gap-4 md:grid-cols-3">
    <div className="trp-card trp-shadow flex min-h-[120px] items-center gap-4 rounded-[20px] border border-[#E0E9F0] bg-white p-5"><Trophy className="h-14 w-14 shrink-0 text-[#F3B000]"/><div><b className="text-[18px] font-extrabold">Conquistas</b><p className="mt-1 text-[14px] leading-snug text-[#385064]">Em breve: badges e evolução individual.</p></div><HelpCircle className="ml-auto shrink-0 text-[#527080]" size={19}/></div>
    <a href={studies} className="trp-card trp-shadow flex min-h-[120px] items-center gap-4 rounded-[20px] border border-[#E0E9F0] bg-white p-5"><Layers3 className="h-14 w-14 shrink-0 text-[#009B52]"/><div><b className="text-[18px] font-extrabold">Trilhas de Aprendizagem</b><p className="mt-1 text-[14px] leading-snug text-[#385064]">Roteiros de estudo com atividades práticas.</p></div><ArrowRight className="ml-auto shrink-0" size={20}/></a>
    <a href={studies} className="trp-card trp-shadow flex min-h-[120px] items-center gap-4 rounded-[20px] border border-[#E0E9F0] bg-white p-5"><BookOpen className="h-14 w-14 shrink-0 text-[#009B52]"/><div><b className="text-[18px] font-extrabold">Biblioteca</b><p className="mt-1 text-[14px] leading-snug text-[#385064]">Materiais, guias e referências de apoio.</p></div><ArrowRight className="ml-auto shrink-0" size={20}/></a>
   </section>
   <section className="flex flex-wrap items-center justify-between gap-5 rounded-[20px] bg-gradient-to-r from-[#08734D] via-[#064C42] to-[#063642] px-7 py-6 text-white"><div className="flex items-center gap-4"><Laptop className="h-12 w-12 text-[#B4FFE0]"/><h2 className="text-[21px] font-extrabold leading-tight">Desenvolva suas<br/>habilidades em Tecnologia</h2></div><div className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-semibold">{['Prática','Desafios','Conhecimento','Evolução'].map(t=><span key={t} className="flex items-center gap-1"><Check className="text-[#8DF348]" size={19}/>{t}</span>)}</div><TrendingUp className="hidden text-[#80EE4D] xl:block" size={48}/></section>
  </main>
 </div>
 </div>
 {help&&<div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0C2433]/40 p-4" role="dialog" aria-modal="true" aria-label="Ajuda"><div className="max-w-md rounded-2xl bg-white p-6 shadow-xl"><div className="flex justify-between gap-5"><h2 className="text-lg font-extrabold">Como começar?</h2><button onClick={()=>setHelp(false)} aria-label="Fechar"><X/></button></div><p className="mt-3 text-sm">Escolha um dos quatro jogos para começar. As trilhas e a biblioteca levam aos ambientes de estudo. A área do professor exige autenticação.</p><button onClick={()=>setHelp(false)} className="mt-5 rounded-lg bg-[#00A915] px-5 py-2 font-bold text-white">Entendi</button></div></div>}
 </div>;
};
