import React, { useEffect, useRef, useState } from 'react';
import { Timer } from 'lucide-react';
import { crossedAlert, elapsedFraction, formatClock, remainingSeconds, TimerInfo, timerPhase, TimerPhase } from '../../utils/timer';
import { playSound } from '../../utils/audio';

/** Conta o tempo localmente a partir do fim informado pelo servidor (sem depender de novas consultas). */
export function useCountdown(timer: TimerInfo | null | undefined, skewMs: number): { seconds: number; phase: TimerPhase } {
  const [now, setNow] = useState(() => Date.now());
  const running = Boolean(timer && timer.fimEm > 0);
  useEffect(() => {
    setNow(Date.now());
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [running, timer?.fimEm]);
  const seconds = remainingSeconds(timer, skewMs, now);
  return { seconds, phase: timerPhase(timer, seconds) };
}

/** Toca o alerta ao cruzar 5 min, 1 min e zero. Use só no telão e na tela do professor. */
export function useTimerAlerts(seconds: number, active: boolean, enabled = true) {
  const prev = useRef<number | null>(null);
  useEffect(() => {
    if (!active) {
      prev.current = null;
      return;
    }
    const before = prev.current;
    prev.current = seconds;
    if (before === null) return;
    const hit = crossedAlert(before, seconds);
    if (hit === 'fim') playSound('gong', enabled);
    else if (hit) playSound('tick', enabled);
  }, [seconds, active, enabled]);
}

const PHASE_TEXT: Record<TimerPhase, string> = {
  parado: 'text-slate-300',
  normal: 'text-white',
  aviso: 'text-amber-300',
  critico: 'text-red-300 timer-critico',
  fim: 'text-red-300',
};
const PHASE_BORDER: Record<TimerPhase, string> = {
  parado: 'border-slate-700',
  normal: 'border-emerald-500/50',
  aviso: 'border-amber-500/70',
  critico: 'border-red-500/80',
  fim: 'border-red-500/80',
};
const PHASE_BAR: Record<TimerPhase, string> = {
  parado: 'bg-slate-500',
  normal: 'bg-emerald-500',
  aviso: 'bg-amber-500',
  critico: 'bg-red-500',
  fim: 'bg-red-500',
};
export const PHASE_LABEL: Record<TimerPhase, string> = {
  parado: 'Parado',
  normal: 'Em andamento',
  aviso: 'Últimos 5 minutos',
  critico: 'Último minuto',
  fim: 'Tempo esgotado',
};

interface TimerDisplayProps {
  timer: TimerInfo | null | undefined;
  seconds: number;
  phase: TimerPhase;
  /** chip = cabeçalho do celular · card = painel do professor · telao = projetor (coluna) · faixa = projetor (faixa no topo) */
  size?: 'chip' | 'card' | 'telao' | 'faixa';
}

/** Relógio padrão do sistema: mesma leitura no celular, no painel e no telão. */
export const TimerDisplay: React.FC<TimerDisplayProps> = ({ timer, seconds, phase, size = 'chip' }) => {
  if (!timer) return null;
  const clock = formatClock(seconds);
  const label = `Tempo restante: ${clock}. ${PHASE_LABEL[phase]}.`;

  if (size === 'chip') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-xl border bg-slate-950 px-3 py-1.5 ${PHASE_BORDER[phase]}`} role="timer" aria-label={label}>
        <Timer className={`w-4 h-4 shrink-0 ${PHASE_TEXT[phase]}`} aria-hidden="true" />
        <span className={`font-mono text-lg font-black tabular-nums ${PHASE_TEXT[phase]}`}>{clock}</span>
      </div>
    );
  }

  if (size === 'faixa') {
    return (
      <div className={`rounded-2xl border-2 bg-slate-900 ${PHASE_BORDER[phase]} px-6 sm:px-8 py-5 flex flex-wrap items-center gap-x-10 gap-y-4`} role="timer" aria-label={label}>
        <div>
          <div className="flex items-center gap-2 text-base font-bold uppercase tracking-wider text-slate-400">
            <Timer className="w-5 h-5" aria-hidden="true" /> Tempo restante
          </div>
          <div className={`font-mono font-black tabular-nums leading-none tracking-tight text-7xl sm:text-8xl mt-2 ${PHASE_TEXT[phase]}`}>{clock}</div>
        </div>
        <div className="flex-1 min-w-64 space-y-3">
          <div className="flex justify-between gap-4 text-lg text-slate-400">
            <span>Atividade de {timer.duracaoMin} min</span>
            <span className={`font-bold ${PHASE_TEXT[phase].replace(' timer-critico', '')}`}>{PHASE_LABEL[phase]}</span>
          </div>
          <div className="h-5 rounded-full bg-slate-800 overflow-hidden" aria-hidden="true">
            <div className={`h-full rounded-full transition-all ${PHASE_BAR[phase]}`} style={{ width: `${(1 - elapsedFraction(timer, seconds)) * 100}%` }} />
          </div>
        </div>
      </div>
    );
  }

  const big = size === 'telao';
  return (
    <div className={`rounded-2xl border-2 bg-slate-950 ${PHASE_BORDER[phase]} ${big ? 'p-6 sm:p-8' : 'p-4'}`} role="timer" aria-label={label}>
      <div className={`flex items-center justify-between gap-3 font-bold uppercase tracking-wider text-slate-400 ${big ? 'text-base' : 'text-[11px]'}`}>
        <span className="flex items-center gap-2">
          <Timer className={big ? 'w-5 h-5' : 'w-3.5 h-3.5'} aria-hidden="true" /> Tempo restante
        </span>
        <span className={PHASE_TEXT[phase].replace(' timer-critico', '')}>{PHASE_LABEL[phase]}</span>
      </div>
      <div className={`font-mono font-black tabular-nums leading-none tracking-tight ${PHASE_TEXT[phase]} ${big ? 'text-7xl sm:text-8xl lg:text-9xl mt-4' : 'text-5xl mt-2'}`}>
        {clock}
      </div>
      <div className={`rounded-full bg-slate-800 overflow-hidden ${big ? 'h-3 mt-6' : 'h-2 mt-3'}`} aria-hidden="true">
        <div className={`h-full rounded-full transition-all ${PHASE_BAR[phase]}`} style={{ width: `${(1 - elapsedFraction(timer, seconds)) * 100}%` }} />
      </div>
      <div className={`text-slate-400 ${big ? 'text-lg mt-3' : 'text-xs mt-1.5'}`}>Atividade de {timer.duracaoMin} min</div>
    </div>
  );
};
