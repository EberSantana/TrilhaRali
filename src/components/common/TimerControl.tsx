import React, { useState } from 'react';
import { Loader2, Pause, Play, Power, RotateCcw } from 'lucide-react';
import { TimerInfo, TimerOp } from '../../utils/timer';
import { DurationPicker } from './DurationPicker';
import { TimerDisplay, useCountdown, useTimerAlerts } from './TimerDisplay';

interface TimerControlProps {
  timer: TimerInfo | null | undefined;
  skewMs: number;
  busy?: boolean;
  error?: string;
  onOp: (op: TimerOp, minutos?: number) => void;
}

/** Controle do cronômetro pelo professor: duração, iniciar, pausar, tempo extra e reinício. */
export const TimerControl: React.FC<TimerControlProps> = ({ timer, skewMs, busy, error, onOp }) => {
  const [draft, setDraft] = useState(60);
  const { seconds, phase } = useCountdown(timer, skewMs);
  useTimerAlerts(seconds, Boolean(timer && timer.fimEm > 0));
  const running = Boolean(timer && timer.fimEm > 0 && seconds > 0);
  const btn = 'h-11 px-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-4" aria-label="Cronômetro da sala">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-white">Cronômetro da sala</h3>
        {busy && <Loader2 className="w-4 h-4 animate-spin text-slate-400" aria-label="Salvando" />}
      </div>

      {!timer ? (
        <>
          <p className="text-xs text-slate-400">Sala sem limite de tempo. Ative para os alunos verem o relógio e a sala travar sozinha ao zerar.</p>
          <DurationPicker value={draft} onChange={setDraft} disabled={busy} />
          <button type="button" disabled={busy} onClick={() => onOp('config', draft)} className={`${btn} w-full bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white`}>
            Ativar cronômetro de {draft} min
          </button>
        </>
      ) : (
        <>
          <TimerDisplay timer={timer} seconds={seconds} phase={phase} size="card" />
          <DurationPicker value={timer.duracaoMin} onChange={(m) => onOp('config', m)} disabled={busy || running} />
          {running && <p className="text-[11px] text-slate-400">Pause para trocar a duração. Use +5 min para dar tempo extra sem parar.</p>}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {running ? (
              <button type="button" disabled={busy} onClick={() => onOp('pause')} className={`${btn} col-span-2 sm:col-span-1 bg-amber-600 hover:bg-amber-500 border-amber-500 text-white`}>
                <Pause className="w-4 h-4" /> Pausar
              </button>
            ) : (
              <button type="button" disabled={busy || seconds <= 0} onClick={() => onOp('start')} className={`${btn} col-span-2 sm:col-span-1 bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white`}>
                <Play className="w-4 h-4" /> Iniciar
              </button>
            )}
            <button type="button" disabled={busy} onClick={() => onOp('add', 5)} className={`${btn} bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100`}>
              +5 min
            </button>
            <button type="button" disabled={busy} onClick={() => onOp('reset')} className={`${btn} bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100`}>
              <RotateCcw className="w-4 h-4" /> Reiniciar
            </button>
            <button type="button" disabled={busy} onClick={() => onOp('off')} className={`${btn} col-span-2 sm:col-span-1 bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-300`} title="Remove o limite de tempo desta sala">
              <Power className="w-4 h-4" /> Desligar
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            As respostas só valem com o relógio rodando. Ao zerar, a sala trava sozinha; +5 min reabre.
          </p>
        </>
      )}
      {error && <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-lg p-2.5">{error}</p>}
    </section>
  );
};
