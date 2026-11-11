import React, { useMemo, useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { BankQuestionDraft } from '../../types/bank';
import { DISCIPLINAS, tidyDraft, validateDraft } from '../../utils/bank';

interface QuestionFormProps {
  initial: BankQuestionDraft;
  assuntosSugeridos: string[];
  onSave: (q: BankQuestionDraft) => Promise<void>;
  onClose: () => void;
}

const field = 'w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60';
const label = 'block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1';

export const QuestionForm: React.FC<QuestionFormProps> = ({ initial, assuntosSugeridos, onSave, onClose }) => {
  const [q, setQ] = useState<BankQuestionDraft>(() => ({
    ...initial,
    opcoes: initial.tipo === 'multipla' && initial.opcoes.length ? initial.opcoes : ['', ''],
  }));
  const [aceitasText, setAceitasText] = useState(initial.aceitas.join('\n'));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<BankQuestionDraft>) => setQ((cur) => ({ ...cur, ...patch }));

  const sugestoes = useMemo(() => Array.from(new Set(assuntosSugeridos)).sort(), [assuntosSugeridos]);

  const setOption = (i: number, text: string) => {
    const wasCorrect = q.resposta !== '' && q.resposta === q.opcoes[i];
    const opcoes = q.opcoes.map((o, j) => (j === i ? text : o));
    set({ opcoes, ...(wasCorrect ? { resposta: text } : {}) });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const draft = tidyDraft({ ...q, aceitas: aceitasText.split('\n') });
    const err = validateDraft(draft);
    if (err) {
      setError(err);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSave(draft);
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : String(e2));
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Pergunta">
      <form onSubmit={submit} className="my-6 w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white">{initial.id ? 'Editar pergunta' : 'Nova pergunta'}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="q-disc">Disciplina</label>
            <input id="q-disc" list="q-disc-list" className={field} value={q.disciplina} onChange={(e) => set({ disciplina: e.target.value })} placeholder="Escolha ou digite" />
            <datalist id="q-disc-list">{DISCIPLINAS.map((d) => <option key={d} value={d} />)}</datalist>
          </div>
          <div>
            <label className={label} htmlFor="q-ass">Assunto (opcional)</label>
            <input id="q-ass" list="q-ass-list" className={field} value={q.assunto} onChange={(e) => set({ assunto: e.target.value })} placeholder="Ex.: Camada de rede" />
            <datalist id="q-ass-list">{sugestoes.map((a) => <option key={a} value={a} />)}</datalist>
          </div>
        </div>

        <div className="mt-4">
          <span className={label}>Tipo de pergunta</span>
          <div className="inline-flex rounded-xl bg-slate-950 border border-slate-800 p-1 gap-1" role="tablist">
            {([['exata', 'Resposta exata'], ['multipla', 'Múltipla escolha']] as const).map(([id, text]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={q.tipo === id}
                onClick={() => set({ tipo: id, resposta: id === q.tipo ? q.resposta : '' })}
                className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${q.tipo === id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className={label} htmlFor="q-perg">Pergunta</label>
          <textarea id="q-perg" rows={3} className={field} value={q.pergunta} onChange={(e) => set({ pergunta: e.target.value })} placeholder="Escreva o enunciado que o aluno vai ver" />
        </div>

        {q.tipo === 'exata' ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="q-resp">Resposta correta</label>
              <input id="q-resp" className={field} value={q.resposta} onChange={(e) => set({ resposta: e.target.value })} placeholder="Ex.: DNS" />
              <p className="mt-1 text-[11px] text-slate-500">Maiúsculas, acentos e espaços extras não importam.</p>
            </div>
            <div>
              <label className={label} htmlFor="q-acc">Outras respostas aceitas (uma por linha)</label>
              <textarea id="q-acc" rows={3} className={field} value={aceitasText} onChange={(e) => setAceitasText(e.target.value)} placeholder={'Ex.:\nservidor dns'} />
            </div>
          </div>
        ) : (
          <fieldset className="mt-4">
            <legend className={label}>Alternativas (marque a correta)</legend>
            <div className="space-y-2">
              {q.opcoes.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correta"
                    aria-label={`Alternativa ${i + 1} é a correta`}
                    checked={q.resposta !== '' && q.resposta === o}
                    onChange={() => set({ resposta: o })}
                    disabled={!o.trim()}
                    className="h-4 w-4 accent-emerald-500"
                  />
                  <input className={field} value={o} onChange={(e) => setOption(i, e.target.value)} placeholder={`Alternativa ${i + 1}`} />
                  {q.opcoes.length > 2 && (
                    <button type="button" onClick={() => set({ opcoes: q.opcoes.filter((_, j) => j !== i), resposta: q.resposta === o ? '' : q.resposta })} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-red-300" aria-label="Remover alternativa">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {q.opcoes.length < 6 && (
              <button type="button" onClick={() => set({ opcoes: [...q.opcoes, ''] })} className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-emerald-200">
                <Plus className="w-3.5 h-3.5" /> Adicionar alternativa
              </button>
            )}
          </fieldset>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-[120px_1fr]">
          <div>
            <label className={label} htmlFor="q-xp">XP</label>
            <input id="q-xp" type="number" min={1} max={100} className={field} value={q.xp} onChange={(e) => set({ xp: Number(e.target.value) })} />
          </div>
          <div>
            <label className={label} htmlFor="q-exp">Explicação para o debriefing (opcional)</label>
            <input id="q-exp" className={field} value={q.explicacao} onChange={(e) => set({ explicacao: e.target.value })} placeholder="Por que esta é a resposta certa?" />
          </div>
        </div>

        <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={q.ativo} onChange={(e) => set({ ativo: e.target.checked })} className="h-4 w-4 accent-emerald-500" />
          Pergunta ativa (disponível para usar no CTF e no NFC)
        </label>

        {error && <p role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800">Cancelar</button>
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-60">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};
