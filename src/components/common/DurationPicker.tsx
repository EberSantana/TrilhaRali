import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { clampMinutes, DURATION_PRESETS, DURATIONS, TIMER_MAX, TIMER_MIN, TIMER_STEP } from '../../utils/timer';

interface DurationPickerProps {
  value: number;
  onChange: (minutes: number) => void;
  disabled?: boolean;
  id?: string;
}

/** Escolha da duração: de 5 a 120 minutos, de 5 em 5. */
export const DurationPicker: React.FC<DurationPickerProps> = ({ value, onChange, disabled, id = 'duracao' }) => {
  const set = (m: number) => onChange(clampMinutes(m));
  const stepBtn = 'w-11 h-11 shrink-0 rounded-xl border border-slate-700 bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed';
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-slate-300">
        Duração (5 a 120 min)
      </label>
      <div className="flex items-center gap-2">
        <button type="button" className={stepBtn} onClick={() => set(value - TIMER_STEP)} disabled={disabled || value <= TIMER_MIN} aria-label="Diminuir 5 minutos">
          <Minus className="w-4 h-4" />
        </button>
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => set(Number(e.target.value))}
          className="flex-1 h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-center font-mono text-lg font-black text-white focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
        >
          {DURATIONS.map((m) => (
            <option key={m} value={m}>
              {m} min
            </option>
          ))}
        </select>
        <button type="button" className={stepBtn} onClick={() => set(value + TIMER_STEP)} disabled={disabled || value >= TIMER_MAX} aria-label="Aumentar 5 minutos">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tempos prontos">
        {DURATION_PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            disabled={disabled}
            onClick={() => set(m)}
            aria-pressed={m === value}
            className={`min-w-11 h-9 px-2 rounded-lg border font-mono text-xs font-black transition disabled:opacity-40 disabled:cursor-not-allowed ${
              m === value ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-200 hover:border-slate-500'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
};

/** Duração compacta para barras de ferramentas: [−] 60 min [+] numa única peça, no mesmo porte dos botões. */
export const DurationInline: React.FC<DurationPickerProps> = ({ value, onChange, disabled, id = 'duracao' }) => {
  const set = (m: number) => onChange(clampMinutes(m));
  const step =
    'h-full px-3 flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white transition outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed';
  return (
    <div
      role="group"
      aria-label="Duração do cronômetro"
      title={disabled ? 'Pause o relógio para trocar a duração' : 'Duração (5 a 120 min). Ao zerar, as respostas são bloqueadas.'}
      className={`inline-flex h-12 items-stretch overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-sm ${disabled ? 'opacity-60' : ''}`}
    >
      <button type="button" className={step} onClick={() => set(value - TIMER_STEP)} disabled={disabled || value <= TIMER_MIN} aria-label="Diminuir 5 minutos">
        <Minus className="w-4 h-4" />
      </button>
      <label htmlFor={id} className="sr-only">
        Duração em minutos
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => set(Number(e.target.value))}
        className="h-full w-[5.5rem] cursor-pointer border-x border-slate-800 bg-transparent px-1 text-center font-mono text-base font-black text-white outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed [text-align-last:center]"
      >
        {DURATIONS.map((m) => (
          <option key={m} value={m}>
            {m} min
          </option>
        ))}
      </select>
      <button type="button" className={step} onClick={() => set(value + TIMER_STEP)} disabled={disabled || value >= TIMER_MAX} aria-label="Aumentar 5 minutos">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
