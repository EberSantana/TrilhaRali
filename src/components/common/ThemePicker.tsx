import React, { useState } from 'react';
import { Check, Moon, Sun } from 'lucide-react';
import { setTheme, Theme, THEMES, useTheme } from '../../utils/theme';
import { canSyncRali, saveServerTheme } from '../../utils/raliSession';

/** Aparência do sistema: o professor escolhe entre as duas propostas e a escolha vale para os alunos. */
export const ThemePicker: React.FC = () => {
  const theme = useTheme();
  const [note, setNote] = useState('');

  const choose = async (next: Theme) => {
    setTheme(next);
    if (!canSyncRali()) {
      setNote('Aplicado só neste aparelho. Conecte o banco de perguntas para a escolha valer também nos celulares dos alunos.');
      return;
    }
    setNote('Salvando…');
    const ok = await saveServerTheme(next);
    setNote(ok ? 'Salvo. Os alunos recebem o tema em até 30 segundos.' : 'Aplicado neste aparelho, mas não consegui salvar no servidor (backend antigo ou sem internet).');
  };

  return (
    <div className="sm:col-span-2 lg:col-span-3 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Tema do sistema">
        {THEMES.map((t) => {
          const on = t.id === theme;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => choose(t.id)}
              className={`text-left rounded-2xl border p-4 transition outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                on ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/70 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  {t.id === 'escuro' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />} {t.nome}
                </span>
                {on && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                    <Check className="w-3.5 h-3.5" /> em uso
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-slate-400">{t.descricao}</p>
            </button>
          );
        })}
      </div>
      {note && <p className="text-xs text-slate-400" role="status">{note}</p>}
    </div>
  );
};
