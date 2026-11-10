import { Mission, ScoringMode, Team } from '../types';

/** Pontos perdidos por posição de chegada, como fração do XP base (10% → missão de 10 XP perde 1 por posição). */
export const DECAY_FRACTION = 0.1;
/** Piso mínimo como fração do XP base: ninguém recebe menos que 40% da missão. */
export const FLOOR_FRACTION = 0.4;
/** Piso absoluto de segurança (nunca excede o XP base da missão). */
export const FLOOR_MIN_XP = 3;

export const SCORING_MODE_LABELS: Record<ScoringMode, string> = {
  fixed: 'Rali Tradicional',
  ctf_dynamic: 'CTF Dinâmico',
};

export function normalizeScoringMode(mode?: ScoringMode): ScoringMode {
  return mode === 'ctf_dynamic' ? 'ctf_dynamic' : 'fixed';
}

/** Quantas equipes já capturaram esta tag. */
export function countPreviousCaptures(teams: Team[], tagId: string): number {
  return teams.filter((t) => t.missoes_concluidas.includes(tagId)).length;
}

/**
 * XP que a equipe ganharia ao capturar a tag na posição indicada (1 = primeira).
 * Decaimento linear com piso: o valor nunca zera, para manter todos motivados.
 */
export function computeXpForPosition(baseXp: number, posicao: number, mode?: ScoringMode): number {
  if (normalizeScoringMode(mode) === 'fixed') return baseXp;
  const decayPerPosition = Math.max(1, Math.round(baseXp * DECAY_FRACTION));
  const floor = Math.min(baseXp, Math.max(FLOOR_MIN_XP, Math.round(baseXp * FLOOR_FRACTION)));
  const safePosition = Math.max(1, Math.floor(posicao));
  return Math.max(floor, baseXp - (safePosition - 1) * decayPerPosition);
}

export interface CaptureScore {
  posicao: number;
  xp: number;
  baseXp: number;
  isFogo: boolean; // 🔥 primeira equipe a capturar (só no modo dinâmico)
  mode: ScoringMode;
}

/** Valor da próxima captura desta missão, dado o estado atual das equipes. */
export function getNextCaptureScore(mission: Pick<Mission, 'tag_id' | 'xp_valor'>, teams: Team[], mode?: ScoringMode): CaptureScore {
  const resolvedMode = normalizeScoringMode(mode);
  const posicao = countPreviousCaptures(teams, mission.tag_id) + 1;
  return {
    posicao,
    xp: computeXpForPosition(mission.xp_valor, posicao, resolvedMode),
    baseXp: mission.xp_valor,
    isFogo: resolvedMode === 'ctf_dynamic' && posicao === 1,
    mode: resolvedMode,
  };
}

export function getPositionBadge(posicao: number): string {
  if (posicao === 1) return '🔥';
  if (posicao === 2) return '🥈';
  if (posicao === 3) return '🥉';
  return '🎖️';
}

/** Texto curto para o celular antes de enviar a resposta. */
export function describeCurrentValue(score: CaptureScore): string {
  if (score.mode === 'fixed') return `Vale ${score.xp} XP`;
  if (score.posicao === 1) return `🔥 FLAG INTACTA! Nenhuma equipe resolveu ainda: vale ${score.xp} XP!`;
  const n = score.posicao - 1;
  return `⚠️ ${n} ${n === 1 ? 'equipe já resolveu' : 'equipes já resolveram'}: vale ${score.xp} XP se você enviar agora!`;
}
