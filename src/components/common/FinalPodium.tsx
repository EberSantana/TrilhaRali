import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy } from 'lucide-react';
import type { RankRow } from '../../utils/ctfRank';
import { LeaderRow, PodiumColumn } from './rankUi';

/** Dispara os confetes uma única vez quando o resultado final aparece (respeita "reduzir movimento"). */
export function useCelebrate(active: boolean) {
  const done = useRef(false);
  useEffect(() => {
    if (!active) {
      done.current = false;
      return;
    }
    if (done.current) return;
    done.current = true;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    try {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.3 } });
      setTimeout(() => confetti({ particleCount: 90, angle: 60, spread: 70, origin: { x: 0, y: 0.6 } }), 350);
      setTimeout(() => confetti({ particleCount: 90, angle: 120, spread: 70, origin: { x: 1, y: 0.6 } }), 350);
    } catch {
      // ignore
    }
  }, [active]);
}

interface FinalPodiumProps {
  /** ranking completo, já ordenado */
  rows: RankRow[];
  totalFases: number;
  /** 'fases' (CTF) ou 'missões' (Rali NFC) */
  unit?: 'fases' | 'missões' | 'desafios';
  /** 'alunos' (CTF) ou 'equipes' (Rali NFC) */
  entity?: 'alunos' | 'equipes';
  /** destaca a linha de quem está olhando (celular) */
  me?: string;
  size?: 'compact' | 'big';
}

/**
 * Resultado final: pódio com os três primeiros e a classificação completa.
 * Aparece quando o tempo acaba ou o professor encerra, igual nos dois módulos e nos dois temas.
 */
export const FinalPodium: React.FC<FinalPodiumProps> = ({ rows, totalFases, unit = 'fases', entity = 'alunos', me, size = 'compact' }) => {
  const big = size === 'big';
  const progress = (r: RankRow) => (unit !== 'fases' ? `${r.fase} de ${totalFases} ${unit}` : r.fase > totalFases ? 'todas as fases' : `${Math.max(0, r.fase - 1)} de ${totalFases} fases`);
  if (rows.length === 0) {
    return <p className={`${big ? 'text-2xl' : 'text-sm'} text-center text-slate-400 py-8`}>Nenhum participante pontuou nesta sala.</p>;
  }
  const order = [1, 0, 2]; // 2º, 1º, 3º: o primeiro fica no centro
  const rest = rows.slice(3);
  const max = Math.max(rows[0]?.xp || 0, 1);

  return (
    <section aria-label="Resultado final" className={big ? 'space-y-8' : 'space-y-5'}>
      <div className="flex flex-col items-center gap-2 text-center">
        <span
          className={`inline-flex items-center justify-center rounded-2xl ${big ? 'h-16 w-16' : 'h-11 w-11'}`}
          style={{ background: 'linear-gradient(160deg,#fcd34d,#d98e0b)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.55)' }}
        >
          <Trophy className={`${big ? 'h-9 w-9' : 'h-6 w-6'}`} style={{ color: '#3b2503' }} aria-hidden />
        </span>
        <h2 className={`${big ? 'text-5xl' : 'text-xl'} font-black tracking-tight text-white`}>Resultado final</h2>
        <p className={`${big ? 'text-xl' : 'text-xs'} text-slate-400`}>
          {rows.length} {rows.length === 1 ? (entity === 'equipes' ? 'equipe' : 'aluno') : entity}
        </p>
      </div>

      <div className={`mx-auto grid max-w-4xl grid-cols-3 items-end ${big ? 'gap-6' : 'gap-2'}`}>
        {order.map((idx) => {
          const r = rows[idx];
          if (!r) return <div key={idx} />;
          return <PodiumColumn key={r.nome} idx={idx} nome={r.nome} xp={r.xp} fogos={r.fogos} sub={progress(r)} mine={r.nome === me} big={big} />;
        })}
      </div>

      {rest.length > 0 && (
        <div className="mx-auto max-w-4xl">
          <h3 className={`mb-2 font-bold uppercase tracking-wider text-slate-400 ${big ? 'text-base' : 'text-[11px]'}`}>Classificação completa</h3>
          <ol className={`space-y-2 overflow-y-auto p-1 ${big ? 'max-h-[40vh]' : 'max-h-72'}`}>
            {rest.map((r, k) => (
              <LeaderRow key={`${r.nome}-${k}`} pos={k + 4} nome={r.nome} xp={r.xp} fogos={r.fogos} sub={progress(r)} pct={r.xp > 0 ? Math.max(4, (r.xp / max) * 100) : 0} mine={r.nome === me} big={big} />
            ))}
          </ol>
        </div>
      )}
    </section>
  );
};
