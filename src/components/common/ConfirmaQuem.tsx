import React from 'react';
import { LogIn, UserPlus } from 'lucide-react';

/** "Vocês são a dupla X?": aparece quando a sessão salva neste computador ficou parada (outra aula). */
export const ConfirmaQuem: React.FC<{ pergunta: React.ReactNode; detalhe?: string; outro: string; onContinuar: () => void; onOutro: () => void; botao?: string }> = ({
  pergunta,
  detalhe,
  outro,
  onContinuar,
  onOutro,
  botao = 'bg-emerald-600 hover:bg-emerald-500',
}) => (
  <div className="mx-auto max-w-md py-10">
    <div className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Este computador já estava numa sala</p>
      <h2 className="text-xl font-black text-white">{pergunta}</h2>
      {detalhe && <p className="text-sm text-slate-400">{detalhe}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={onContinuar} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-black text-white ${botao}`}>
          <LogIn className="h-4 w-4" /> Sim, continuar
        </button>
        <button type="button" onClick={onOutro} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 font-bold text-slate-200 hover:bg-slate-800">
          <UserPlus className="h-4 w-4" /> {outro}
        </button>
      </div>
    </div>
  </div>
);
