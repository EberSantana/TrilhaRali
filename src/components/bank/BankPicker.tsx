import React, { useEffect, useMemo, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { BankQuestion } from '../../types/bank';
import { filterBank, pickRandom } from '../../utils/bank';

interface BankPickerProps {
  questions: BankQuestion[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  /** Tema de cor do módulo que está usando o seletor. */
  accent?: 'orange' | 'emerald';
  maxHeightClass?: string;
}

/**
 * Seletor de perguntas do banco, o mesmo no Rali NFC e no CTF Online:
 * filtra por disciplina/assunto, escolhe uma a uma ou sorteia N.
 */
export const BankPicker: React.FC<BankPickerProps> = ({ questions, selected, onChange, accent = 'orange', maxHeightClass = 'max-h-72' }) => {
  const [disc, setDisc] = useState('');
  const [assunto, setAssunto] = useState('');
  const [busca, setBusca] = useState('');
  const [inativas, setInativas] = useState(false);
  const [qtd, setQtd] = useState(10);

  // Se a seleção trazida de fora já inclui inativas, mostra-as (senão ficariam escondidas)
  useEffect(() => {
    if (!inativas && questions.some((q) => !q.ativo && selected.has(q.id))) setInativas(true);
  }, [questions, selected, inativas]);

  const ring = accent === 'orange' ? 'accent-orange-500' : 'accent-emerald-500';
  const btn = accent === 'orange' ? 'bg-orange-600 hover:bg-orange-500' : 'bg-emerald-600 hover:bg-emerald-500';

  const totalInativas = useMemo(() => questions.filter((q) => !q.ativo).length, [questions]);
  const disciplinas = useMemo(() => {
    const m = new Map<string, number>();
    filterBank(questions, { incluirInativas: inativas }).forEach((q) => m.set(q.disciplina, (m.get(q.disciplina) || 0) + 1));
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
  }, [questions, inativas]);
  const assuntos = useMemo(
    () => Array.from(new Set(filterBank(questions, { disciplina: disc, incluirInativas: inativas }).map((q) => q.assunto).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [questions, disc, inativas]
  );
  const visible = useMemo(() => filterBank(questions, { disciplina: disc, assunto, busca, incluirInativas: inativas }), [questions, disc, assunto, busca, inativas]);
  const allVisible = visible.length > 0 && visible.every((q) => selected.has(q.id));

  const toggle = (id: string) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    onChange(n);
  };

  const field = 'rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200';
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <select aria-label="Disciplina" value={disc} onChange={(e) => { setDisc(e.target.value); setAssunto(''); }} className={field}>
          <option value="">Todas as disciplinas</option>
          {disciplinas.map(([d, n]) => <option key={d} value={d}>{d} ({n})</option>)}
        </select>
        <select aria-label="Assunto" value={assunto} onChange={(e) => setAssunto(e.target.value)} className={field} disabled={assuntos.length === 0}>
          <option value="">Todos os assuntos</option>
          {assuntos.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <input aria-label="Buscar pergunta" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar pergunta, assunto ou resposta" className={`${field} w-full placeholder:text-slate-500`} />

      <label className="flex items-center gap-2 text-xs text-slate-300">
        <input type="checkbox" checked={inativas} onChange={(e) => setInativas(e.target.checked)} className={ring} />
        Incluir perguntas inativas <span className="text-slate-500">({totalInativas} no banco)</span>
      </label>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button type="button" onClick={() => onChange(allVisible ? new Set([...selected].filter((id) => !visible.some((q) => q.id === id))) : new Set([...selected, ...visible.map((q) => q.id)]))} disabled={!visible.length} className="rounded-lg border border-slate-700 px-2.5 py-1 font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-40">
          {allVisible ? 'Desmarcar visíveis' : `Marcar ${visible.length} visíveis`}
        </button>
        <span className="inline-flex items-center gap-1">
          <label htmlFor="bp-qtd" className="sr-only">Quantidade a sortear</label>
          <input id="bp-qtd" type="number" min={1} max={200} value={qtd} onChange={(e) => setQtd(Math.max(1, Math.min(200, Number(e.target.value) || 1)))} className="w-14 rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-slate-200" />
          <button type="button" onClick={() => onChange(new Set(pickRandom(visible, qtd).map((q) => q.id)))} disabled={!visible.length} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold text-white disabled:opacity-40 ${btn}`}>
            <Shuffle className="w-3.5 h-3.5" /> Sortear
          </button>
        </span>
        <button type="button" onClick={() => onChange(new Set())} disabled={selected.size === 0} className="ml-auto font-semibold text-slate-400 hover:text-white disabled:opacity-40">Limpar ({selected.size})</button>
      </div>

      <div className={`${maxHeightClass} overflow-y-auto space-y-1 pr-1`} role="list" aria-label="Perguntas do banco">
        {visible.map((q) => (
          <label key={q.id} role="listitem" className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer">
            <input type="checkbox" checked={selected.has(q.id)} onChange={() => toggle(q.id)} className={`mt-0.5 ${ring}`} />
            <span className="min-w-0 flex-1">
              <span className="block line-clamp-2">{q.pergunta}</span>
              <span className="block text-[10px] text-slate-500">
                {q.disciplina}{q.assunto ? ` · ${q.assunto}` : ''} · {q.tipo === 'multipla' ? 'múltipla' : 'exata'} · {q.xp} XP{!q.ativo ? ' · inativa' : ''}
              </span>
            </span>
          </label>
        ))}
        {visible.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-700 px-3 py-6 text-center text-xs text-slate-500">
            {questions.length === 0 ? 'Seu banco ainda está vazio.' : inativas ? 'Nenhuma pergunta com esses filtros.' : 'Nenhuma pergunta ativa com esses filtros. Marque “Incluir perguntas inativas” para ver as demais.'}
          </p>
        )}
      </div>
    </div>
  );
};
