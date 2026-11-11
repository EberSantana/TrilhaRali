import React, { useEffect, useMemo, useRef, useState } from 'react';
import { computeRankChanges, rankSignature, RankChange, RankRow } from '../../utils/ctfRank';
import { Avatar, LeaderRow, PodiumColumn } from '../common/rankUi';

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
  const sub = (r: RankRow) =>
    unit !== 'fases' ? `${r.fase} de ${totalFases} ${unit}` : r.fase > totalFases ? 'Todas as fases concluídas' : `Fase ${r.fase} de ${totalFases}`;
  const tone = variant === 'bars' ? 'orange' : 'emerald';
  const max = Math.max(top[0]?.xp || 0, 1);
  const pct = (r: RankRow) => (r.xp > 0 ? Math.max(4, (r.xp / max) * 100) : 0);

  if (top.length === 0) {
    return <p className={`${big ? 'text-2xl' : 'text-sm'} text-slate-500 text-center py-6`}>Aguardando os {unit === 'fases' || unit === 'desafios' ? 'alunos' : 'participantes'} entrarem…</p>;
  }

  const row = (r: RankRow, i: number) => (
    <LeaderRow
      key={r.nome}
      pos={i + 1}
      nome={r.nome}
      xp={r.xp}
      fogos={r.fogos}
      sub={sub(r)}
      pct={pct(r)}
      mine={r.nome === me}
      big={big}
      change={changes.get(r.nome)}
      tone={tone}
    />
  );

  const minePos = mine && mine.posicao > 5 && (
    <li className={`flex items-center justify-between gap-3 rounded-2xl border border-dashed border-orange-500/60 bg-orange-500/10 ${big ? 'px-5 py-4 text-2xl' : 'px-3 py-2.5 text-sm'}`}>
      <span className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-xl bg-orange-500/20 px-1.5 font-mono font-black text-orange-300">{mine.posicao}º</span>
        <Avatar nome={mine.nome} className={big ? 'w-12 h-12 text-xl' : 'w-8 h-8 text-xs'} />
        <span className="truncate font-bold text-white">Você</span>
      </span>
      <span className="shrink-0 text-right font-mono text-xs text-slate-300">
        <strong className={`tabular-nums text-white ${big ? 'text-3xl' : 'text-base'}`}>{mine.xp}</strong> XP
        <span className="block text-[10px] text-slate-400">{sub(mine)}</span>
      </span>
    </li>
  );

  if (variant === 'bars') {
    return (
      <ol className={big ? 'space-y-3' : 'space-y-2'}>
        {top.map(row)}
        {minePos}
      </ol>
    );
  }

  // Pódio: 2º, 1º e 3º lado a lado (o 1º no centro); 4º e 5º em linhas abaixo
  const order = [1, 0, 2];
  return (
    <div className={big ? 'space-y-5' : 'space-y-3'}>
      <div className={`grid grid-cols-3 items-end ${big ? 'gap-5' : 'gap-2'}`}>
        {order.map((i) => {
          const r = top[i];
          if (!r) return <div key={i} />;
          return <PodiumColumn key={r.nome} idx={i} nome={r.nome} xp={r.xp} fogos={r.fogos} sub={sub(r)} mine={r.nome === me} big={big} change={changes.get(r.nome)} />;
        })}
      </div>
      {(top.length > 3 || minePos) && (
        <ol className={big ? 'space-y-3' : 'space-y-2'}>
          {top.slice(3).map((r, k) => row(r, k + 3))}
          {minePos}
        </ol>
      )}
    </div>
  );
};
