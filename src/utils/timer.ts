/** Cronômetro compartilhado (Rali NFC e CTF Online): o servidor guarda o instante do fim. */
export interface TimerInfo {
  duracaoMin: number;
  /** instante do fim em ms no relógio do servidor (0 = parado) */
  fimEm: number;
  restanteS: number;
  rodando: boolean;
  esgotado: boolean;
}

export type TimerOp = 'config' | 'start' | 'pause' | 'add' | 'reset' | 'off';
export type TimerPhase = 'parado' | 'normal' | 'aviso' | 'critico' | 'fim';

export const TIMER_MIN = 5;
export const TIMER_MAX = 120;
export const TIMER_STEP = 5;
export const WARN_SECONDS = 5 * 60;
export const CRITICAL_SECONDS = 60;

/** Todas as durações permitidas: 5, 10, ..., 120 minutos. */
export const DURATIONS: number[] = Array.from({ length: (TIMER_MAX - TIMER_MIN) / TIMER_STEP + 1 }, (_, i) => TIMER_MIN + i * TIMER_STEP);
export const DURATION_PRESETS = [5, 10, 15, 20, 30, 45, 60, 90, 120];

export function clampMinutes(m: number): number {
  const n = Math.round(Number(m) / TIMER_STEP) * TIMER_STEP;
  if (!(n >= TIMER_MIN)) return TIMER_MIN;
  return Math.min(TIMER_MAX, n);
}

/**
 * Segundos restantes agora. `skewMs` = relógio local − relógio do servidor no momento da leitura,
 * para o celular do aluno contar igual ao do professor mesmo com a hora do aparelho errada.
 */
export function remainingSeconds(t: TimerInfo | null | undefined, skewMs: number, localNow: number): number {
  if (!t) return 0;
  if (t.fimEm > 0) return Math.max(0, Math.ceil((t.fimEm + skewMs - localNow) / 1000));
  return Math.max(0, t.restanteS);
}

export function timerPhase(t: TimerInfo | null | undefined, seconds: number): TimerPhase {
  if (!t) return 'parado';
  if (seconds <= 0) return 'fim';
  if (!(t.fimEm > 0)) return 'parado';
  if (seconds <= CRITICAL_SECONDS) return 'critico';
  if (seconds <= WARN_SECONDS) return 'aviso';
  return 'normal';
}

/** mm:ss (aceita mais de 99 minutos: 120:00). */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** Fração já consumida do tempo (0 a 1), para a barra de progresso. */
export function elapsedFraction(t: TimerInfo | null | undefined, seconds: number): number {
  if (!t || t.duracaoMin <= 0) return 0;
  const total = Math.max(t.duracaoMin * 60, seconds);
  return Math.min(1, Math.max(0, 1 - seconds / total));
}

/** Momentos em que o alerta toca: ao cruzar 5 min, 1 min e zero. */
export function crossedAlert(prev: number, next: number): 'aviso' | 'critico' | 'fim' | null {
  if (prev > 0 && next <= 0) return 'fim';
  if (prev > CRITICAL_SECONDS && next <= CRITICAL_SECONDS) return 'critico';
  if (prev > WARN_SECONDS && next <= WARN_SECONDS) return 'aviso';
  return null;
}
