import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy } from 'lucide-react';
import type { RankRow } from '../../utils/ctfRank';

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

// Cores de pódio fixas (ouro, prata e bronze): não dependem do tema claro/escuro
const STEP = [
  { medal: '🥇', bg: 'bg-[#f4b73f]', h: 'h-28', hBig: 'h-40' },
  { medal: '🥈', bg: 'bg-[#b8c0cc]', h: 'h-20', hBig: 'h-28' },
  { medal: '🥉', bg: 'bg-[#cd8a4b]', h: 'h-14', hBig: 'h-20' },
];

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

  return (
    <section aria-label="Resultado final" className="space-y-5">
      <div className="flex items-center justify-center gap-3 text-center">
        <Trophy className={`${big ? 'w-10 h-10' : 'w-6 h-6'} text-amber-400`} aria-hidden />
        <h2 className={`${big ? 'text-4xl' : 'text-xl'} font-black tracking-tight text-white`}>Resultado final</h2>
      </div>

      <div className={`grid grid-cols-3 items-end ${big ? 'gap-5' : 'gap-2'} max-w-4xl mx-auto`}>
        {order.map((idx) => {
          const r = rows[idx];
          if (!r) return <div key={idx} />;
          const st = STEP[idx];
          const mine = r.nome === me;
          return (
            <div key={r.nome} className="flex flex-col items-center text-center min-w-0">
              <div className={big ? 'text-6xl' : 'text-3xl'} aria-hidden>{st.medal}</div>
              <div className={`mt-1 w-full truncate font-black text-white ${big ? 'text-3xl' : 'text-sm'} ${mine ? 'underline decoration-orange-400 decoration-4 underline-offset-4' : ''}`} title={r.nome}>
                {r.nome}
              </div>
              <div className={`font-mono font-black text-emerald-300 ${big ? 'text-5xl' : 'text-xl'}`}>{r.xp} <span className={`${big ? 'text-xl' : 'text-[11px]'} font-bold`}>XP</span></div>
              <div className={`text-slate-400 ${big ? 'text-lg' : 'text-[11px]'}`}>
                {r.fogos > 0 && <span className="mr-1">🔥{r.fogos}</span>}
                {progress(r)}
              </div>
              <div className={`mt-2 w-full rounded-t-2xl ${st.bg} ${big ? st.hBig : st.h} flex items-start justify-center pt-2`}>
                <span className={`font-black text-[#1f2937] ${big ? 'text-5xl' : 'text-2xl'}`}>{idx + 1}º</span>
              </div>
            </div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h3 className={`mb-2 font-bold uppercase tracking-wider text-slate-400 ${big ? 'text-base' : 'text-[11px]'}`}>Classificação completa ({rows.length} {entity})</h3>
          <ol className={`space-y-1.5 overflow-y-auto pr-1 ${big ? 'max-h-[40vh]' : 'max-h-64'}`}>
            {rest.map((r, k) => (
              <li
                key={`${r.nome}-${k}`}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 ${big ? 'py-3 text-2xl' : 'py-2 text-sm'} ${
                  r.nome === me ? 'bg-orange-500/15 border-orange-500/50' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className={`font-mono font-black text-slate-400 shrink-0 ${big ? 'w-12' : 'w-8'}`}>{k + 4}º</span>
                  <span className="truncate font-semibold text-white">{r.nome}</span>
                </span>
                <span className={`shrink-0 font-mono text-slate-300 ${big ? 'text-xl' : 'text-xs'}`}>
                  {r.fogos > 0 && <span className="mr-1.5">🔥{r.fogos}</span>}
                  {progress(r)} • <strong className="text-emerald-300">{r.xp} XP</strong>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
};
