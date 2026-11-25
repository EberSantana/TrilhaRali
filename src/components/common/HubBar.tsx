import React from 'react';
import { ArrowLeft, Award, BookOpen, ChevronRight, Lock, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../utils/theme';
import { usePerfilHub } from './PerfilHub';
import logoClaro from '../../assets/logo-hub.png';
import logoEscuro from '../../assets/logo-hub-escuro.png';

export const URL_ESTUDOS = 'https://ebersantana.github.io/disciplinas/';
export const URL_PORTAL_HUB = 'https://ebersantana.github.io/disciplinas/portal.html';

interface HubBarProps {
  isTeacher: boolean;
  /** Título da tela atual (ex.: "CTF Online"); sem título = página inicial dos jogos */
  atual?: string;
  /** Volta para a página inicial dos jogos */
  onJogos?: () => void;
  onOpenTeacher: () => void;
}

/**
 * Barra do Trilha Rali HUB: a mesma do Ambiente de Estudos, em todas as telas dos jogos
 * (logo, caminho, Estudos, Conquistas, quem está jogando e Área do professor).
 */
export const HubBar: React.FC<HubBarProps> = ({ isTeacher, atual, onJogos, onOpenTeacher }) => {
  const claro = useTheme() === 'claro';
  const perfil = usePerfilHub();
  const c = claro
    ? { painel: '#FFFFFF', borda: '#D5DBE3', tinta: '#0F172A', tinta2: '#475467', verde: '#007A35', soft: '#E3F7E8' }
    : { painel: '#0F1E36', borda: '#22324D', tinta: '#F1F5F9', tinta2: '#B8C4D6', verde: '#3BE37A', soft: '#0E3A27' };
  const link = 'items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition hover:opacity-80 outline-none focus-visible:ring-2 focus-visible:ring-[#00A844]';
  const iniciais = perfil ? perfil.apelido.slice(0, 1).toUpperCase() : '';
  return (
    <div className="sticky top-0 z-40" style={{ background: c.painel, borderBottom: `1px solid ${c.borda}` }}>
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-8">
        <a href={URL_PORTAL_HUB} aria-label="Trilha Rali HUB, página inicial" className="shrink-0">
          <img src={claro ? logoClaro : logoEscuro} alt="Trilha Rali HUB" className="h-9 w-auto sm:h-12" />
        </a>
        <nav aria-label="Você está em" className="hidden min-w-0 items-center gap-1 text-sm font-semibold md:flex" style={{ color: c.tinta2 }}>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          {atual && onJogos ? (
            <button type="button" onClick={onJogos} className="rounded-md px-1 hover:underline" style={{ color: c.verde }}>
              Jogos
            </button>
          ) : (
            <span aria-current={atual ? undefined : 'page'} style={{ color: atual ? c.tinta2 : c.tinta }}>Jogos</span>
          )}
          {atual && (
            <>
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
              <span aria-current="page" className="truncate font-bold" style={{ color: c.tinta }}>{atual}</span>
            </>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {atual && onJogos && (
            <button type="button" onClick={onJogos} className={`${link} inline-flex md:hidden`} style={{ color: c.verde, border: `1px solid ${c.borda}` }}>
              <ArrowLeft className="h-4 w-4" /> Jogos
            </button>
          )}
          <a href={URL_ESTUDOS} className={`${link} hidden lg:inline-flex`} style={{ color: c.tinta }}>
            <BookOpen className="h-4 w-4" /> Estudos
          </a>
          {perfil && (
            <a href={`${URL_ESTUDOS}#conquistas`} className={`${link} hidden lg:inline-flex`} style={{ color: c.tinta }}>
              <Award className="h-4 w-4" /> Conquistas
            </a>
          )}
          {perfil && (
            <a
              href={`${URL_ESTUDOS}#conquistas`}
              title={`${perfil.nome}${perfil.turma ? ' · ' + perfil.turma : ''}`}
              className="hidden items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-bold sm:inline-flex"
              style={{ background: c.soft, color: c.tinta }}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-black text-[#FFFFFF]" style={{ background: 'linear-gradient(135deg,#22C55E,#007A35)' }} aria-hidden>
                {iniciais}
              </span>
              <span className="max-w-[9rem] truncate">{perfil.apelido}</span>
            </a>
          )}
          <button
            type="button"
            onClick={onOpenTeacher}
            className={`${link} inline-flex shrink-0 text-[#FFFFFF] hover:brightness-110 hover:opacity-100`}
            style={{ background: 'linear-gradient(90deg,#008A3A,#00A844)' }}
          >
            {isTeacher ? <ShieldCheck className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            <span className="hidden sm:inline">Área do professor</span>
            <span className="sm:hidden">Professor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
