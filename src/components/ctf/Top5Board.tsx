import React, { useEffect, useMemo, useRef, useState } from 'react';
import { computeRankChanges, rankSignature, RankChange, RankRow } from '../../utils/ctfRank';

interface Top5BoardProps {
  /** ranking completo, já ordenado (a tela mostra os 5 primeiros) */
  rows: RankRow[];
  totalFases: number;
  /** nome do aluno logado (destaca a linha) */
  me?: string;
  /** posição do aluno quando ele está fora do top 5 */
  mine?: (RankRow & { posicao: number }) | null;
  size?: 'compact' | 'big';
  /** podium = três primeiros em destaque (tema escuro) · bars = lista com barras de pontos (tema claro) */
  variant?: 'podium' | 'bars';
  /** 'fases' (CTF, F3/10) ou 'missões' (Rali NFC, 3/50) */
  unit?: 'fases' | 'missões' | 'desafios';
}

const CHANGE_MS = 9000;

const MEDAL = ['🥇', '🥈', '🥉'];
const PODIUM_STYLE = [
  'from-amber-400/30 to-amber-600/10 border-amber-400/60',
  'from-slate-300/25 to-slate-500/10 border-slate-300/50',
  'from-orange-500/25 to-orange-700/10 border-orange-500/50',
];

const Delta: React.FC<{ c?: RankChange; big: boolean }> = ({ c, big }) => {
  if (!c) return null;
  const cls = big ? 'text-base' : 'text-[11px]';
  if (c.isNew) return <span className={`${cls} font-black text-sky-300`}>novo</span>;
  if (c.delta > 0) return <span className={`${cls} font-black text-emerald-400`} title={`Subiu ${c.delta}`}>▲{c.delta}</span>;
  if (c.delta < 0) return <span className={`${cls} font-black text-rose-400`} title={`Desceu ${-c.delta}`}>▼{-c.delta}</span>;
  return null;
};

const Gain: React.FC<{ c?: RankChange; big: boolean }> = ({ c, big }) =>
  c && c.xpGain > 0 ? (
    <span className={`${big ? 'text-base px-2.5 py-0.5' : 'text-[11px] px-1.5 py-0.5'} rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-black animate-pulse`}>
      +{c.xpGain} XP
    </span>
  ) : null;

export const Top5Board: React.FC<Top5BoardProps> = ({ rows, totalFases, me, mine, size = 'compact', variant = 'podium', unit = 'fases' }) => {
  const big = size === 'big';
  const prev = useRef<RankRow[] | null>(null);
  const [changes, setChanges] = useState<Map<string, RankChange>>(new Map());
  const sig = useMemo(() => rankSignature(rows), [rows]);

  // Compara com a leitura anterior só quando algo mudou de verdade
  useEffect(() => {
    const c = computeRankChanges(prev.current, rows);
    // Sem leitura anterior (ou ranking ainda vazio) não há o que comparar: evita marcar todos como "novo"
    const first = prev.current === null || prev.current.length === 0;
    prev.current = rows;
    if (first) return;
    const notable = [...c.values()].some((x) => x.delta !== 0 || x.xpGain > 0 || x.isNew);
    if (!notable) return;
    // Mantém por alguns segundos o que já estava em destaque (ex.: ▲ de uma resposta anterior)
    setChanges((old) => {
      const merged = new Map(old);
      c.forEach((v, nome) => {
        const prevChange = merged.get(nome);
        if (!prevChange) {
          merged.set(nome, v);
        } else if (v.delta !== 0 || v.xpGain > 0 || v.isNew) {
          // acumula dentro da janela de destaque: subiu + ganhou XP em respostas seguidas
          merged.set(nome, { ...v, delta: prevChange.delta + v.delta, xpGain: prevChange.xpGain + v.xpGain, isNew: prevChange.isNew || v.isNew });
        } else {
          merged.set(nome, { ...prevChange, pos: v.pos });
        }
      });
      return merged;
    });
    const id = setTimeout(() => setChanges(new Map()), CHANGE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  const top = rows.slice(0, 5);
  const fase = (r: RankRow) => (unit !== 'fases' ? `${r.fase}/${totalFases}` : r.fase > totalFases ? '✔' : `F${r.fase}/${totalFases}`);

  if (top.length === 0) {
    return <p className={`${big ? 'text-2xl' : 'text-sm'} text-slate-500 text-center py-6`}>Aguardando os alunos entrarem…</p>;
  }

  if (variant === 'bars') {
    const max = Math.max(top[0]?.xp || 0, 1);
    return (
      <ol className={big ? 'space-y-2' : 'space-y-1.5'}>
        {top.map((r, i) => {
          const c = changes.get(r.nome);
          return (
            <li
              key={r.nome}
              className={`grid items-center gap-3 rounded-xl border ${big ? 'grid-cols-[3.5rem_minmax(0,16rem)_minmax(0,1fr)_auto] px-5 py-3 text-2xl' : 'grid-cols-[2rem_minmax(0,1fr)_auto] px-3 py-2 text-sm'} ${
                r.nome === me ? 'bg-orange-500/15 border-orange-500/50' : i === 0 ? 'bg-slate-900 border-emerald-500' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <span
                className={`flex items-center justify-center rounded-full font-black ${big ? 'w-12 h-12' : 'w-7 h-7 text-xs'} ${
                  i === 0 ? 'bg-emerald-600 text-white' : i < 3 ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-200'
                }`}
              >
                {i + 1}
              </span>
              <span className="flex items-center gap-2 min-w-0">
                <span className="truncate font-bold text-white">{r.nome}</span>
                <Delta c={c} big={big} />
                <Gain c={c} big={big} />
              </span>
              {big && (
                <span className="h-4 rounded-full bg-slate-800 overflow-hidden" aria-hidden="true">
                  <span className="block h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${r.xp > 0 ? Math.max(4, (r.xp / max) * 100) : 0}%` }} />
                </span>
              )}
              <span className={`shrink-0 font-mono ${big ? 'text-xl' : 'text-xs'} text-slate-300`}>
                {r.fogos > 0 && <span className="mr-1.5">🔥{r.fogos}</span>}
                {fase(r)} • <strong className={`text-white ${big ? 'text-3xl' : ''}`}>{r.xp}</strong>
              </span>
            </li>
          );
        })}
        {mine && mine.posicao > 5 && (
          <li className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-orange-500/50 bg-orange-500/10 px-3 py-2 text-sm">
            <span className="flex items-center gap-2 min-w-0">
              <span className="font-mono font-black text-orange-300 shrink-0">{mine.posicao}º</span>
              <span className="truncate font-semibold text-slate-100">Você</span>
            </span>
            <span className="shrink-0 font-mono text-xs text-slate-300">
              {fase(mine)} • <strong className="text-emerald-300">{mine.xp}</strong>
            </span>
          </li>
        )}
      </ol>
    );
  }

  const podium = [top[1], top[0], top[2]]; // 2º, 1º, 3º (o 1º no centro)
  const podiumIdx = [1, 0, 2];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 items-end">
        {podium.map((r, k) => {
          const i = podiumIdx[k];
          if (!r) return <div key={k} />;
          const c = changes.get(r.nome);
          return (
            <div
              key={r.nome}
              className={`rounded-2xl border bg-gradient-to-b text-center px-2 ${PODIUM_STYLE[i]} ${
                big ? (i === 0 ? 'py-8' : 'py-5') : i === 0 ? 'py-4' : 'py-2.5'
              } ${r.nome === me ? 'ring-2 ring-orange-400' : ''}`}
            >
              <div className={big ? 'text-5xl' : 'text-2xl'}>{MEDAL[i]}</div>
              <div className={`font-black text-white truncate ${big ? 'text-2xl mt-2' : 'text-sm mt-1'}`} title={r.nome}>
                {r.nome}
              </div>
              <div className={`font-mono font-black text-emerald-300 ${big ? 'text-4xl' : 'text-lg'}`}>{r.xp}</div>
              <div className={`text-slate-400 ${big ? 'text-base' : 'text-[10px]'}`}>
                {r.fogos > 0 && <span className="mr-1">🔥{r.fogos}</span>}
                {fase(r)}
              </div>
              <div className="min-h-[1.25rem] mt-1 flex items-center justify-center gap-1.5 flex-wrap">
                <Delta c={c} big={big} />
                <Gain c={c} big={big} />
              </div>
            </div>
          );
        })}
      </div>

      <ol className="space-y-1.5">
        {top.slice(3).map((r, k) => {
          const c = changes.get(r.nome);
          return (
            <li
              key={r.nome}
              className={`flex items-center justify-between gap-2 rounded-xl border px-3 ${big ? 'py-3 text-2xl' : 'py-2 text-sm'} ${
                r.nome === me ? 'bg-orange-500/15 border-orange-500/40' : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="font-mono font-black text-slate-400 w-8 shrink-0">{k + 4}º</span>
                <span className="truncate font-semibold text-slate-100">{r.nome}</span>
                <Delta c={c} big={big} />
                <Gain c={c} big={big} />
              </span>
              <span className={`shrink-0 font-mono ${big ? 'text-xl' : 'text-xs'} text-slate-300`}>
                {r.fogos > 0 && <span className="mr-1.5">🔥{r.fogos}</span>}
                {fase(r)} • <strong className="text-emerald-300">{r.xp}</strong>
              </span>
            </li>
          );
        })}
      </ol>

      {mine && mine.posicao > 5 && (
        <div className={`flex items-center justify-between gap-2 rounded-xl border border-dashed border-orange-500/50 bg-orange-500/10 px-3 ${big ? 'py-3 text-2xl' : 'py-2 text-sm'}`}>
          <span className="flex items-center gap-2 min-w-0">
            <span className="font-mono font-black text-orange-300 shrink-0">{mine.posicao}º</span>
            <span className="truncate font-semibold text-slate-100">Você</span>
          </span>
          <span className="shrink-0 font-mono text-xs text-slate-300">
            {fase(mine)} • <strong className="text-emerald-300">{mine.xp}</strong>
          </span>
        </div>
      )}
    </div>
  );
};
