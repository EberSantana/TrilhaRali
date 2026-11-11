export interface RankRow {
  nome: string;
  xp: number;
  fase: number;
  fogos: number;
}

export interface RankChange {
  /** posição atual (1 = primeiro) */
  pos: number;
  /** quantas posições subiu (+) ou desceu (-) desde a leitura anterior */
  delta: number;
  /** XP ganho desde a leitura anterior */
  xpGain: number;
  /** apareceu agora no ranking */
  isNew: boolean;
}

/**
 * Compara duas leituras do ranking (já ordenadas pelo servidor).
 * Sem leitura anterior não há mudança a mostrar.
 */
export function computeRankChanges(prev: RankRow[] | null, next: RankRow[]): Map<string, RankChange> {
  const out = new Map<string, RankChange>();
  const before = new Map<string, { pos: number; xp: number }>();
  (prev || []).forEach((r, i) => before.set(r.nome, { pos: i + 1, xp: r.xp }));
  next.forEach((r, i) => {
    const old = before.get(r.nome);
    const pos = i + 1;
    if (!prev || !old) {
      out.set(r.nome, { pos, delta: 0, xpGain: 0, isNew: !!prev });
    } else {
      out.set(r.nome, { pos, delta: old.pos - pos, xpGain: Math.max(0, r.xp - old.xp), isNew: false });
    }
  });
  return out;
}

/** Assinatura estável: só muda quando posição, XP ou fase de alguém muda. */
export function rankSignature(rows: RankRow[]): string {
  return rows.map((r) => `${r.nome}:${r.xp}:${r.fase}:${r.fogos}`).join('|');
}
