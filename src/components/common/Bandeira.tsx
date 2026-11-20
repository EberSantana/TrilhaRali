import React, { useEffect } from 'react';

type Estado = 'capturada' | 'atual' | 'bloqueada';

const COR: Record<Estado, { pano: string; mastro: string }> = {
  capturada: { pano: '#10b981', mastro: '#94a3b8' },
  atual: { pano: '#fb923c', mastro: '#94a3b8' },
  bloqueada: { pano: '#475569', mastro: '#475569' },
};

/** Bandeira do CTF: verde = flag capturada, laranja = a da vez, cinza = ainda bloqueada. */
export const Bandeira: React.FC<{ estado: Estado; className?: string; title?: string }> = ({ estado, className = 'h-5 w-5', title }) => (
  <svg viewBox="0 0 48 56" className={`${className} shrink-0 ${estado === 'atual' ? 'animate-pulse' : ''}`} role="img" aria-label={title ?? (estado === 'capturada' ? 'Flag capturada' : estado === 'atual' ? 'Flag da vez' : 'Flag bloqueada')}>
    <title>{title ?? (estado === 'capturada' ? 'Flag capturada' : estado === 'atual' ? 'Flag da vez' : 'Flag bloqueada')}</title>
    <rect x="9" y="4" width="3" height="48" rx="1.5" fill={COR[estado].mastro} />
    <path d="M12 6 H43 L35 16 L43 26 H12 Z" fill={COR[estado].pano} opacity={estado === 'bloqueada' ? 0.6 : 1} />
    <ellipse cx="10.5" cy="52" rx="8" ry="2.5" fill={COR[estado].mastro} opacity="0.5" />
  </svg>
);

export interface Captura {
  /** muda a cada acerto, para reiniciar a animação */
  id: number;
  xp: number;
  /** primeira captura (CTF dinâmico) */
  fogo?: boolean;
  /** linha de apoio (ex.: "Fase 3 desbloqueada") */
  detalhe?: string;
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
  const pano = captura.fogo ? '#f97316' : '#10b981';

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4" role="status" aria-live="polite">
      <button
        type="button"
        onClick={onDone}
        key={captura.id}
        aria-label="Fechar aviso de flag capturada"
        className={`flag-card pointer-events-auto flex items-center gap-4 rounded-2xl border-2 px-5 py-3 text-left shadow-2xl backdrop-blur ${cor}`}
      >
        <svg viewBox="0 0 48 56" className="h-14 w-14 shrink-0" aria-hidden="true">
          <rect className="flag-mastro" x="9" y="4" width="3" height="48" rx="1.5" fill="#cbd5e1" />
          <g className="flag-pano">
            <path d="M12 6 H43 L35 16 L43 26 H12 Z" fill={pano} />
          </g>
          <ellipse cx="10.5" cy="52" rx="8" ry="2.5" fill="#94a3b8" opacity="0.5" />
        </svg>
        <span className="block">
          <span className="block text-lg font-black tracking-wide">{captura.fogo ? 'PRIMEIRO A CAPTURAR!' : 'FLAG CAPTURADA!'}</span>
          <span className="block text-sm font-bold">
            +{captura.xp} XP{captura.detalhe ? ` · ${captura.detalhe}` : ''}
          </span>
        </span>
      </button>
    </div>
  );
};
