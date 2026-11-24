import React from 'react';
import { ArrowLeft, ArrowRight, Lock, Play, ShieldCheck, Star, TrendingUp, Trophy } from 'lucide-react';
import { useTheme } from '../utils/theme';
import logoClaro from '../assets/logo-hub.png';
import logoEscuro from '../assets/logo-hub-escuro.png';
import heroImg from '../assets/hub-hero.webp';

interface HomeLandingProps {
  isTeacher: boolean;
  onOpenRali: () => void;
  onOpenCtf: () => void;
  onOpenCruz: () => void;
  onOpenDesv: () => void;
  onOpenTeacher: () => void;
}

/** Página inicial do Trilha Rali HUB (portal de estudos): esta área de jogos faz parte dele. */
export const URL_HUB = 'https://ebersantana.github.io/disciplinas/';
/** Mini portal com os dois ambientes (Estudos e Jogos). */
export const URL_PORTAL = 'https://ebersantana.github.io/disciplinas/portal.html';

/* Cores fixas (hex) para não sofrer o remapeamento do tema claro. */
const JOGOS = [
  { id: 'rali', titulo: 'Rali NFC', sub: 'Desafios com tecnologia NFC', claro: { c: '#0E9F45', f: '#E6F8EC' }, escuro: { c: '#3BE37A' } },
  { id: 'ctf', titulo: 'CTF Online', sub: 'Capture as bandeiras', claro: { c: '#E8590C', f: '#FFF1E2' }, escuro: { c: '#FB923C' } },
  { id: 'cruz', titulo: 'Cruzada Online', sub: 'Conhecimento de forma divertida', claro: { c: '#1D6FE0', f: '#E4F0FF' }, escuro: { c: '#60A5FA' } },
  { id: 'desv', titulo: 'Desvendando', sub: 'Investigue, analise e resolva', claro: { c: '#7C3AED', f: '#F1EAFF' }, escuro: { c: '#A78BFA' } },
] as const;

const Icone: React.FC<{ id: string }> = ({ id }) => {
  if (id === 'rali')
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="h-12 w-12 shrink-0" aria-hidden>
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
        <path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5" />
      </svg>
    );
  if (id === 'ctf')
    return (
      <svg viewBox="0 0 24 24" className="h-12 w-12 shrink-0" aria-hidden>
        <path fill="currentColor" d="M5 3h1.8v18H5z" />
        <path fill="currentColor" d="M7 4c3-1.6 5.5 1.8 9 .4 1.3-.5 3-.4 4 .2-1 2.1-1 4.5 0 6.6-2.6-1.2-5.6 1.2-9 .2-1.6-.5-3-.4-4 .2z" />
      </svg>
    );
  if (id === 'cruz')
    return (
      <svg viewBox="0 0 24 24" className="h-12 w-12 shrink-0" aria-hidden>
        <path fill="currentColor" d="M9 2.5a2.5 2.5 0 0 1 2.5 2.5v1H15a1.5 1.5 0 0 1 1.5 1.5V11h1a2.5 2.5 0 1 1 0 5h-1v3.5A1.5 1.5 0 0 1 15 21h-3.5v-1a2.5 2.5 0 1 0-5 0v1H3a1.5 1.5 0 0 1-1.5-1.5V16H3a2.5 2.5 0 1 0 0-5H1.5V7.5A1.5 1.5 0 0 1 3 6h3.5V5A2.5 2.5 0 0 1 9 2.5z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="h-12 w-12 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="6.5" />
      <path d="m15 15 6 6" />
    </svg>
  );
};

export const HomeLanding: React.FC<HomeLandingProps> = ({ isTeacher, onOpenRali, onOpenCtf, onOpenCruz, onOpenDesv, onOpenTeacher }) => {
  const claro = useTheme() === 'claro';
  const abrir: Record<string, () => void> = { rali: onOpenRali, ctf: onOpenCtf, cruz: onOpenCruz, desv: onOpenDesv };
  const tinta = claro ? '#0F172A' : '#F1F5F9';
  const tinta2 = claro ? '#334155' : '#CBD5E1';
  const painel = claro ? '#FFFFFF' : '#0F1E36';
  const borda = claro ? '#D5DBE3' : '#22324D';

  return (
    <div className="flex w-full flex-col">
      {/* Barra do HUB: mesma do portal de estudos */}
      <div style={{ background: painel, borderBottom: `1px solid ${borda}` }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <a href={URL_PORTAL} aria-label="Trilha Rali HUB, página inicial" className="shrink-0">
            <img src={claro ? logoClaro : logoEscuro} alt="Trilha Rali HUB" className="h-12 w-auto sm:h-14" />
          </a>
          <div className="flex items-center gap-2">
            <a
              href={URL_PORTAL}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition hover:opacity-80"
              style={{ color: claro ? '#007A35' : '#3BE37A', border: `1px solid ${borda}` }}
            >
              <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Voltar ao HUB</span><span className="sm:hidden">HUB</span>
            </a>
            <button
              type="button"
              onClick={onOpenTeacher}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-[#FFFFFF] transition hover:brightness-110"
              style={{ background: 'linear-gradient(90deg,#008A3A,#00A844)' }}
            >
              {isTeacher ? <ShieldCheck className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              <span className="hidden sm:inline">Área do professor</span><span className="sm:hidden">Professor</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-8 sm:py-7">
        {/* Faixa principal */}
        <section
          className="relative grid items-center gap-2 overflow-hidden rounded-[22px] py-7 pl-6 pr-4 sm:pl-10 md:grid-cols-[1.05fr_1fr]"
          style={{
            background: claro
              ? 'linear-gradient(115deg,#F2FBF4 0%,#E3F7E8 48%,#7EE2A0 75%,#22C55E 100%)'
              : 'linear-gradient(115deg,#0F2A1F 0%,#0E3A27 50%,#0E6B3A 80%,#16A34A 100%)',
            boxShadow: '0 8px 24px rgba(0,120,53,.14)',
          }}
        >
          <div>
            <h1 className="flex flex-wrap items-center gap-2.5 text-4xl font-black italic leading-none sm:text-5xl" style={{ color: tinta }}>
              Jogos e Desafios
            </h1>
            <p className="mb-5 mt-3 max-w-md text-base leading-snug sm:text-lg" style={{ color: claro ? '#1E293B' : '#E2E8F0' }}>
              Fixe o que estudou jogando: capture bandeiras, resolva cruzadas e desvende casos com a turma.
            </p>
            <a
              href="#jogos"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full px-6 text-lg font-extrabold text-[#FFFFFF] shadow-lg transition hover:brightness-110"
              style={{ background: 'linear-gradient(90deg,#008A3A,#00A844)' }}
            >
              <Play className="h-4 w-4 fill-[#FACC15] text-[#FACC15]" /> Escolher jogo
            </a>
          </div>
          <img src={heroImg} alt="" className="hidden max-h-[260px] w-full object-contain object-right md:block" />
        </section>

        <div id="jogos" className="mb-3 mt-7 flex items-center gap-3 scroll-mt-4">
          <span className="h-7 w-1.5 rounded-full" style={{ background: '#00A844' }} />
          <h2 className="text-xl font-extrabold sm:text-2xl" style={{ color: tinta }}>Escolha o jogo</h2>
        </div>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Jogos">
          {JOGOS.map((j) => {
            const cor = claro ? j.claro.c : j.escuro.c;
            return (
              <button
                key={j.id}
                type="button"
                onClick={abrir[j.id]}
                className="group relative flex min-h-[92px] items-start sm:min-h-[128px] gap-3.5 rounded-[18px] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2"
                style={{
                  background: claro ? j.claro.f : `color-mix(in srgb, ${cor} 14%, ${painel})`,
                  border: `1px solid color-mix(in srgb, ${cor} 22%, transparent)`,
                  color: cor,
                  outlineColor: cor,
                }}
              >
                <Icone id={j.id} />
                <span className="min-w-0 pr-8">
                  <span className="block text-xl font-extrabold leading-tight" style={{ color: tinta }}>{j.titulo}</span>
                  <span className="mt-1 block text-[15px] leading-snug" style={{ color: tinta2 }}>{j.sub}</span>
                </span>
                <span
                  className="absolute bottom-3.5 right-3.5 grid h-8 w-8 place-items-center rounded-full shadow transition group-hover:translate-x-0.5"
                  style={{ background: painel, color: cor }}
                  aria-hidden
                >
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            );
          })}
        </section>

        <section
          className="mt-5 grid grid-cols-1 gap-3 rounded-[18px] p-4 sm:grid-cols-3"
          style={{ background: painel, border: `1px solid ${borda}` }}
          aria-label="Como funciona"
        >
          {[
            { i: <Star className="h-5 w-5" style={{ color: '#00A844' }} />, t: 'Aprenda', d: 'com jogos e desafios' },
            { i: <TrendingUp className="h-5 w-5" style={{ color: '#1D6FE0' }} />, t: 'Acompanhe', d: 'seu XP e o ranking da sala' },
            { i: <Trophy className="h-5 w-5" style={{ color: '#EAB308' }} />, t: 'Conquiste', d: 'bandeiras bronze, prata e ouro' },
          ].map((x) => (
            <div key={x.t} className="flex items-center gap-3">
              {x.i}
              <span className="leading-tight">
                <span className="block text-sm font-bold" style={{ color: tinta }}>{x.t}</span>
                <span className="block text-xs" style={{ color: tinta2 }}>{x.d}</span>
              </span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};
