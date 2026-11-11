import React from 'react';
import { Lock } from 'lucide-react';
import { RaliSnapshot } from '../../utils/raliSession';
import { PHASE_LABEL, TimerDisplay, useCountdown } from './TimerDisplay';

/** Faixa do cronômetro no celular do aluno do Rali NFC (some quando o professor não usa o relógio compartilhado). */
export const RaliTimerBar: React.FC<{ session: RaliSnapshot }> = ({ session }) => {
  const { seconds, phase } = useCountdown(session.timer, session.skewMs);
  if (!session.timer) return null;
  return (
    <div className="max-w-4xl mx-auto px-4 pt-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
          {phase === 'fim' && <Lock className="w-4 h-4 text-red-400" aria-hidden="true" />}
          {phase === 'fim' ? 'Tempo esgotado: respostas bloqueadas' : phase === 'parado' ? 'Cronômetro parado pelo professor' : PHASE_LABEL[phase]}
        </span>
        <TimerDisplay timer={session.timer} seconds={seconds} phase={phase} size="chip" />
      </div>
    </div>
  );
};

/** O aluno fica bloqueado quando o relógio do professor zera. */
export function useRaliLocked(session: RaliSnapshot): boolean {
  const { phase } = useCountdown(session.timer, session.skewMs);
  return Boolean(session.timer) && phase === 'fim';
}
