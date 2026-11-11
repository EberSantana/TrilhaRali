import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { BankQuestion } from '../../types/bank';
import { tagName } from '../../utils/bank';

interface PublishDialogProps {
  selected: BankQuestion[];
  onPublish: (opts: { start: number; somenteBanco: boolean }) => Promise<void>;
  onClose: () => void;
}

export const PublishDialog: React.FC<PublishDialogProps> = ({ selected, onPublish, onClose }) => {
  const [start, setStart] = useState(1);
  const [somenteBanco, setSomenteBanco] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const last = start + selected.length - 1;
  const inativas = selected.filter((q) => !q.ativo).length;

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      await onPublish({ start, somenteBanco });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Publicar no Rali NFC">
      <div className="my-6 w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white">Publicar no Rali NFC</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Fechar"><X className="w-5 h-5" /></button>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          As {selected.length} perguntas selecionadas viram missões das tags <strong className="text-slate-200">{tagName(start)}</strong> a <strong className="text-slate-200">{tagName(last)}</strong>. Os celulares dos alunos recebem o conjunto ao abrir o app.
        </p>

        <div className="mt-4">
          <label htmlFor="p-start" className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Primeira tag</label>
          <input id="p-start" type="number" min={1} max={150} value={start} onChange={(e) => setStart(Math.max(1, Math.min(150, Number(e.target.value) || 1)))} className="w-28 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white" />
        </div>

        <fieldset className="mt-4 space-y-2">
          <legend className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">O que acontece com as 50 missões padrão?</legend>
          <label className="flex items-start gap-2 text-sm text-slate-300">
            <input type="radio" name="modo" checked={somenteBanco} onChange={() => setSomenteBanco(true)} className="mt-1 accent-emerald-500" />
            <span><strong className="text-white">Usar só as minhas perguntas</strong> (recomendado para outra disciplina). As tags fora do intervalo ficam sem missão.</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-slate-300">
            <input type="radio" name="modo" checked={!somenteBanco} onChange={() => setSomenteBanco(false)} className="mt-1 accent-emerald-500" />
            <span><strong className="text-white">Misturar</strong>: troco apenas as tags do intervalo e as demais continuam as missões padrão.</span>
          </label>
        </fieldset>

        <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          No Rali NFC a resposta é conferida no celular, como nas missões padrão. Para provas ou notas, use o CTF Online, que confere no servidor (a mesma seleção pode ir para os dois).
          {inativas > 0 && ` ${inativas} pergunta(s) selecionada(s) estão inativas e serão publicadas mesmo assim.`}
        </p>
        {error && <p role="alert" className="mt-3 whitespace-pre-line rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800">Cancelar</button>
          <button onClick={run} disabled={busy || selected.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Publicar {selected.length}
          </button>
        </div>
      </div>
    </div>
  );
};
