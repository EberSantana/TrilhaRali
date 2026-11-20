import React, { useEffect } from 'react';

type Estado = 'capturada' | 'atual' | 'bloqueada' | 'aberta';
export type Metal = 'bronze' | 'prata' | 'ouro';

const METAL: Record<Metal, { pano: string; borda: string; nome: string }> = {
  bronze: { pano: '#cd7f32', borda: '#b36b22', nome: 'bronze' },
  prata: { pano: '#cbd5e1', borda: '#64748b', nome: 'prata' },
  ouro: { pano: '#fbbf24', borda: '#b45309', nome: 'ouro' },
};

/**
 * Metal da bandeira de um desafio, pela posição do XP entre todos os da sala (terços): o mais barato é bronze, o do meio prata,
 * o mais caro ouro. Se todos valem o mesmo, ficam todos prata. Não depende dos valores de XP de cada pacote.
 */
export function metalDoDesafio(xp: number, todos: number[]): Metal {
  if (todos.length === 0) return 'prata';
  const menores = todos.filter((x) => x < xp).length;
  const iguais = todos.filter((x) => x === xp).length;
  const posicao = (menores + iguais / 2) / todos.length;
  return posicao < 1 / 3 ? 'bronze' : posicao < 2 / 3 ? 'prata' : 'ouro';
}

const COR: Record<Exclude<Estado, 'aberta'>, { pano: string; mastro: string }> = {
  capturada: { pano: '#10b981', mastro: '#94a3b8' },
  atual: { pano: '#fb923c', mastro: '#94a3b8' },
  bloqueada: { pano: '#475569', mastro: '#475569' },
};

/**
 * Bandeira do CTF: verde = flag capturada, laranja = a da vez, cinza = ainda bloqueada.
 * Com `metal` (CTF livre) a cor é bronze, prata ou ouro: cheia quando capturada, só o contorno enquanto aberta.
 */
export const Bandeira: React.FC<{ estado: Estado; metal?: Metal; className?: string; title?: string }> = ({ estado, metal, className = 'h-5 w-5', title }) => {
  const nome = metal ? `bandeira de ${METAL[metal].nome}` : 'flag';
  const rotulo = title ?? (estado === 'capturada' ? `${metal ? nome[0].toUpperCase() + nome.slice(1) : 'Flag'} capturada` : estado === 'aberta' ? `${nome[0].toUpperCase() + nome.slice(1)} a conquistar` : estado === 'atual' ? 'Flag da vez' : 'Flag bloqueada');
  const m = metal ? METAL[metal] : null;
  const pano = m ? m.pano : COR[estado === 'aberta' ? 'atual' : estado].pano;
  const mastro = m ? m.borda : COR[estado === 'aberta' ? 'atual' : estado].mastro;
  const vazia = estado === 'aberta';
  return (
    <svg viewBox="0 0 48 56" className={`${className} shrink-0 ${estado === 'atual' ? 'animate-pulse' : ''} ${metal === 'ouro' && estado === 'capturada' ? 'flag-ouro' : ''}`} role="img" aria-label={rotulo}>
      <title>{rotulo}</title>
      <rect x="9" y="4" width="3" height="48" rx="1.5" fill={mastro} />
      <path d="M12 6 H43 L35 16 L43 26 H12 Z" fill={vazia ? 'none' : pano} stroke={m ? m.borda : 'none'} strokeWidth={m ? 2.5 : 0} strokeDasharray={vazia ? '4 3' : undefined} opacity={estado === 'bloqueada' ? 0.6 : 1} />
      <ellipse cx="10.5" cy="52" rx="8" ry="2.5" fill={mastro} opacity="0.5" />
    </svg>
  );
};

export interface Captura {
  /** muda a cada acerto, para reiniciar a animação */
  id: number;
  xp: number;
  /** primeira captura (CTF dinâmico) */
  fogo?: boolean;
  /** linha de apoio (ex.: "Fase 3 desbloqueada") */
  detalhe?: string;
  /** CTF livre: metal da bandeira do desafio */
  metal?: Metal;
}

const MS = 2800;

/**
 * Flag capturada: a bandeira sobe no mastro e desfralda. Fica no alto da tela, sem bloquear o campo
 * de resposta, some sozinha e pode ser dispensada com um toque. Sem movimento para quem prefere menos animação.
 */
export const CapturaFlag: React.FC<{ captura: Captura; onDone: () => void }> = ({ captura, onDone }) => {
  useEffect(() => {
    const t = window.setTimeout(onDone, MS);
    return () => window.clearTimeout(t);
  }, [captura.id, onDone]);

  const cor = captura.fogo
    ? 'bg-orange-950/90 border-orange-500 text-orange-200'
    : 'bg-emerald-950/90 border-emerald-500 text-emerald-200';
  const pano = captura.fogo ? '#f97316' : captura.metal ? METAL[captura.metal].pano : '#10b981';
  const borda = captura.metal && !captura.fogo ? METAL[captura.metal].borda : 'none';
  const detalhe = [captura.metal ? `bandeira de ${METAL[captura.metal].nome}` : '', captura.detalhe ?? ''].filter(Boolean).join(' · ');

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4" role="status" aria-live="polite">
      <button
        type="button"
        onClick={onDone}
        key={captura.id}
        aria-label="Fechar aviso de flag capturada"
        className={`flag-card ${captura.metal === 'ouro' && !captura.fogo ? 'flag-card-ouro' : ''} pointer-events-auto flex items-center gap-4 rounded-2xl border-2 px-5 py-3 text-left shadow-2xl backdrop-blur ${cor}`}
      >
        <svg viewBox="0 0 48 56" className="h-14 w-14 shrink-0" aria-hidden="true">
          <rect className="flag-mastro" x="9" y="4" width="3" height="48" rx="1.5" fill="#94a3b8" />
          <g className="flag-pano">
            <path d="M12 6 H43 L35 16 L43 26 H12 Z" fill={pano} stroke={borda} strokeWidth={borda === 'none' ? 0 : 2.5} />
          </g>
          <ellipse cx="10.5" cy="52" rx="8" ry="2.5" fill="#94a3b8" opacity="0.5" />
        </svg>
        <span className="block">
          <span className="block text-lg font-black tracking-wide">{captura.fogo ? 'PRIMEIRO A CAPTURAR!' : 'FLAG CAPTURADA!'}</span>
          <span className="block text-sm font-bold">
            +{captura.xp} XP{detalhe ? ` · ${detalhe}` : ''}
          </span>
        </span>
      </button>
    </div>
  );
};
