import React, { useMemo, useState } from 'react';
import { Download, Loader2, Upload, X } from 'lucide-react';
import { CSV_TEMPLATE, DISCIPLINAS, parseImport } from '../../utils/bank';
import { BankQuestionDraft } from '../../types/bank';

interface ImportDialogProps {
  onImport: (list: BankQuestionDraft[]) => Promise<{ importadas: number; erros: number }>;
  onClose: () => void;
}

export const downloadText = (name: string, text: string, mime = 'text/plain') => {
  const url = URL.createObjectURL(new Blob(['﻿' + text], { type: `${mime};charset=utf-8` }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export const ImportDialog: React.FC<ImportDialogProps> = ({ onImport, onClose }) => {
  const [text, setText] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const parsed = useMemo(() => (text.trim() ? parseImport(text, disciplina) : null), [text, disciplina]);

  const readFile = async (f: File | undefined) => {
    if (!f) return;
    setText(await f.text());
  };

  const run = async () => {
    if (!parsed || parsed.perguntas.length === 0) return;
    setBusy(true);
    setError('');
    try {
      await onImport(parsed.perguntas);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Importar perguntas">
      <div className="my-6 w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white">Importar perguntas</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Fechar"><X className="w-5 h-5" /></button>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          Cole uma planilha exportada como CSV (separador <code className="text-emerald-300">;</code>) ou um JSON. Listas, como alternativas, usam <code className="text-emerald-300">|</code>.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={() => downloadText('modelo-perguntas.csv', CSV_TEMPLATE, 'text/csv')} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800">
            <Download className="w-3.5 h-3.5" /> Baixar modelo CSV
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800">
            <Upload className="w-3.5 h-3.5" /> Escolher arquivo
            <input type="file" accept=".csv,.json,.txt" className="hidden" onChange={(e) => readFile(e.target.files?.[0])} />
          </label>
          <select aria-label="Disciplina padrão" value={disciplina} onChange={(e) => setDisciplina(e.target.value)} className="rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs text-slate-200">
            <option value="">Disciplina das linhas sem disciplina…</option>
            {DISCIPLINAS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        <textarea aria-label="Conteúdo para importar" rows={9} value={text} onChange={(e) => setText(e.target.value)} placeholder="Cole aqui o CSV ou o JSON" className="mt-3 w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60" />

        {parsed && (
          <div className="mt-3 text-sm">
            <p className="font-semibold text-emerald-300">{parsed.perguntas.length} pergunta(s) válida(s)</p>
            {parsed.erros.length > 0 && (
              <ul className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-200">
                {parsed.erros.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        )}
        {error && <p role="alert" className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800">Cancelar</button>
          <button onClick={run} disabled={busy || !parsed || parsed.perguntas.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Importar {parsed ? parsed.perguntas.length : 0}
          </button>
        </div>
      </div>
    </div>
  );
};
