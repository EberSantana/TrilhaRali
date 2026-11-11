import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Flag, Copy, Download, KeyRound, Loader2, Pencil, Plus, RefreshCw, Send, Trash2, Upload, X } from 'lucide-react';
import { BankQuestion, BankQuestionDraft } from '../../types/bank';
import { emptyDraft, validateDraft, exportCsv, exportJson, setCtfPrefill, tagName } from '../../utils/bank';
import { clearBancoKey, deleteQuestion, getBancoKey, importQuestions, listBanco, pingBanco, publishNfc, saveBancoKey, saveQuestion } from '../../utils/bankApi';
import { setPublishedLocal } from '../../utils/missionsStore';
import { QuestionForm } from './QuestionForm';
import { downloadText, ImportDialog } from './ImportDialog';
import { PublishDialog } from './PublishDialog';

interface BankManagerProps {
  onBack: () => void;
  /** Abre o Painel do CTF (a seleção atual vai junto para a nova sala). */
  onOpenCtf: () => void;
}

const chip = 'text-[11px] font-semibold px-2 py-0.5 rounded-full border';

export const BankManager: React.FC<BankManagerProps> = ({ onBack, onOpenCtf }) => {
  const [chave, setChave] = useState(getBancoKey);
  const [authed, setAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [loading, setLoading] = useState(() => !!getBancoKey());
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [disc, setDisc] = useState('');
  const [tipo, setTipo] = useState('');
  const [status, setStatus] = useState('');
  const [busca, setBusca] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [editing, setEditing] = useState<BankQuestionDraft | null>(null);
  const [importing, setImporting] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setQuestions(await listBanco());
      setAuthed(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/Chave do banco invalida/i.test(msg)) {
        clearBancoKey();
        setChave('');
        setAuthed(false);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (chave) load();
  }, [chave, load]);

  const connect = async (e: React.FormEvent) => {
    e.preventDefault();
    const k = keyInput.trim();
    if (!k) return;
    setLoading(true);
    setError('');
    try {
      await pingBanco(k);
      saveBancoKey(k);
      setChave(k);
      setKeyInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  const disconnect = () => {
    clearBancoKey();
    setChave('');
    setAuthed(false);
    setQuestions([]);
    setSelected(new Set());
  };

  const disciplinas = useMemo(() => {
    const m = new Map<string, number>();
    questions.forEach((q) => m.set(q.disciplina, (m.get(q.disciplina) || 0) + 1));
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
  }, [questions]);

  const visible = useMemo(() => {
    const term = busca.trim().toLowerCase();
    return questions
      .filter((q) => (!disc || q.disciplina === disc) && (!tipo || q.tipo === tipo) && (!status || (status === 'ativas') === q.ativo))
      .filter((q) => !term || `${q.pergunta} ${q.assunto} ${q.resposta}`.toLowerCase().includes(term))
      .sort((a, b) => a.disciplina.localeCompare(b.disciplina, 'pt-BR') || a.assunto.localeCompare(b.assunto, 'pt-BR') || a.pergunta.localeCompare(b.pergunta, 'pt-BR'));
  }, [questions, disc, tipo, status, busca]);

  const selectedList = useMemo(() => visible.filter((q) => selected.has(q.id)), [visible, selected]);
  const assuntosDaDisciplina = useMemo(
    () => questions.filter((q) => !editing || q.disciplina === editing.disciplina).map((q) => q.assunto).filter(Boolean),
    [questions, editing]
  );

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice((n) => (n === msg ? '' : n)), 6000);
  };

  const run = async (fn: () => Promise<void>) => {
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const toggle = (id: string) =>
    setSelected((cur) => {
      const n = new Set(cur);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const allVisibleSelected = visible.length > 0 && visible.every((q) => selected.has(q.id));

  // ----- Tela de conexão -----
  if (!authed) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"><ArrowLeft className="w-4 h-4" /> Painel do professor</button>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-center"><KeyRound className="w-6 h-6" /></div>
          <h1 className="mt-4 text-xl font-black text-white">Conectar ao banco de perguntas</h1>
          <p className="mt-2 text-sm text-slate-400">
            As perguntas e respostas ficam na sua planilha do Google. Digite a <strong className="text-slate-200">chave do banco</strong> (mostrada ao rodar <code className="text-emerald-300">setupBanco</code> no Apps Script). Ela é pedida uma vez por aparelho.
          </p>
          {loading && chave ? (
            <p className="mt-5 inline-flex items-center gap-2 text-sm text-slate-300"><Loader2 className="w-4 h-4 animate-spin" /> Conectando…</p>
          ) : (
            <form onSubmit={connect} className="mt-5 space-y-3">
              <label htmlFor="bk" className="sr-only">Chave do banco</label>
              <input id="bk" type="password" autoComplete="off" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="Chave do banco" className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60" />
              <button type="submit" disabled={loading || !keyInput.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Conectar
              </button>
            </form>
          )}
          {error && <p role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          {error && chave && (
            <button onClick={load} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"><RefreshCw className="w-4 h-4" /> Tentar de novo</button>
          )}
        </div>
      </div>
    );
  }

  // ----- Banco -----
  const ativas = questions.filter((q) => q.ativo).length;
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-10">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"><ArrowLeft className="w-4 h-4" /> Painel do professor</button>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Banco de perguntas</h1>
          <p className="mt-1 text-sm text-slate-400">{questions.length} pergunta(s) em {disciplinas.length} disciplina(s) · {ativas} ativa(s) · {questions.length - ativas} inativa(s)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setEditing(emptyDraft(disc))} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500"><Plus className="w-4 h-4" /> Nova pergunta</button>
          <button onClick={() => setImporting(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-slate-800"><Upload className="w-4 h-4" /> Importar</button>
          <button onClick={() => downloadText('banco-de-perguntas.csv', exportCsv(visible), 'text/csv')} disabled={!visible.length} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-40"><Download className="w-4 h-4" /> CSV</button>
          <button onClick={() => downloadText('banco-de-perguntas.json', exportJson(visible), 'application/json')} disabled={!visible.length} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-40"><Download className="w-4 h-4" /> JSON</button>
          <button onClick={() => run(load)} aria-label="Atualizar lista" className="rounded-xl border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <select aria-label="Filtrar por disciplina" value={disc} onChange={(e) => setDisc(e.target.value)} className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-200">
          <option value="">Todas as disciplinas</option>
          {disciplinas.map(([d, n]) => <option key={d} value={d}>{d} ({n})</option>)}
        </select>
        <select aria-label="Filtrar por tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-200">
          <option value="">Todos os tipos</option>
          <option value="exata">Resposta exata</option>
          <option value="multipla">Múltipla escolha</option>
        </select>
        <select aria-label="Filtrar por situação" value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-200">
          <option value="">Ativas e inativas</option>
          <option value="ativas">Só ativas</option>
          <option value="inativas">Só inativas</option>
        </select>
        <input aria-label="Buscar" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar pergunta, assunto ou resposta" className="min-w-[220px] flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500" />
        <button onClick={disconnect} className="text-xs font-semibold text-slate-500 hover:text-slate-300">Desconectar</button>
      </div>

      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5">
          <span className="text-sm font-semibold text-emerald-200">{selectedList.length} selecionada(s)<span className="ml-2 text-xs font-normal text-emerald-200/70">usar em:</span></span>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setPublishing(true)} disabled={!selectedList.length} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50"><Send className="w-4 h-4" /> Rali NFC</button>
            <button onClick={() => { setCtfPrefill(selectedList.map((q) => q.id)); onOpenCtf(); }} disabled={!selectedList.length} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-orange-500 disabled:opacity-50"><Flag className="w-4 h-4" /> CTF Online</button>
            <button onClick={() => setSelected(new Set())} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-300 hover:bg-slate-800">Limpar</button>
          </div>
        </div>
      )}

      {notice && <p role="status" className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200"><CheckCircle2 className="w-4 h-4" />{notice}</p>}
      {error && <p role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      <div className="mt-5 space-y-2">
        {visible.length > 0 && (
          <label className="inline-flex items-center gap-2 px-1 text-xs font-semibold text-slate-400">
            <input type="checkbox" checked={allVisibleSelected} onChange={() => setSelected(allVisibleSelected ? new Set() : new Set(visible.map((q) => q.id)))} className="h-4 w-4 accent-emerald-500" />
            Selecionar todas as {visible.length} visíveis
          </label>
        )}
        {visible.map((q) => (
          <article key={q.id} className={`rounded-xl border p-4 ${q.ativo ? 'border-slate-800 bg-slate-900/70' : 'border-slate-800/60 bg-slate-900/30 opacity-70'}`}>
            <div className="flex items-start gap-3">
              <input type="checkbox" aria-label={`Selecionar ${q.id}`} checked={selected.has(q.id)} onChange={() => toggle(q.id)} className="mt-1 h-4 w-4 shrink-0 accent-emerald-500" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`${chip} border-emerald-500/30 bg-emerald-500/10 text-emerald-300`}>{q.disciplina}</span>
                  {q.assunto && <span className={`${chip} border-slate-700 bg-slate-800 text-slate-300`}>{q.assunto}</span>}
                  <span className={`${chip} border-sky-500/30 bg-sky-500/10 text-sky-300`}>{q.tipo === 'multipla' ? 'Múltipla escolha' : 'Resposta exata'}</span>
                  <span className={`${chip} border-amber-500/30 bg-amber-500/10 text-amber-300`}>{q.xp} XP</span>
                  {!q.ativo && <span className={`${chip} border-slate-600 bg-slate-800 text-slate-400`}>Inativa</span>}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-white">{q.pergunta}</p>
                {q.tipo === 'multipla' && (
                  <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                    {q.opcoes.map((o) => (
                      <li key={o} className={`rounded-md px-2 py-1 ${o === q.resposta ? 'bg-emerald-500/15 text-emerald-200 font-semibold' : 'bg-slate-800/70 text-slate-300'}`}>{o}{o === q.resposta ? ' ✓' : ''}</li>
                    ))}
                  </ul>
                )}
                {q.tipo === 'exata' && (
                  <p className="mt-2 text-xs text-slate-400">
                    Resposta: <strong className="text-emerald-300">{q.resposta}</strong>
                    {q.aceitas.length > 0 && <> · também aceita: {q.aceitas.join(', ')}</>}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => setEditing(q)} aria-label="Editar" title="Editar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => { const { id: _id, atualizado_em: _a, ...copy } = q; setEditing(copy); }} aria-label="Duplicar" title="Duplicar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><Copy className="w-4 h-4" /></button>
                <button
                  onClick={() => run(async () => { const s = await saveQuestion({ ...q, ativo: !q.ativo }); setQuestions((cur) => cur.map((x) => (x.id === s.id ? s : x))); })}
                  aria-label={q.ativo ? 'Desativar' : 'Ativar'} title={q.ativo ? 'Desativar' : 'Ativar'}
                  className="rounded-lg px-2 py-1 text-[11px] font-bold text-slate-400 hover:bg-slate-800 hover:text-white"
                >{q.ativo ? 'Desativar' : 'Ativar'}</button>
                <button
                  onClick={() => { if (window.confirm('Excluir esta pergunta? Isso não pode ser desfeito.')) run(async () => { await deleteQuestion(q.id); setQuestions((cur) => cur.filter((x) => x.id !== q.id)); setSelected((cur) => { const n = new Set(cur); n.delete(q.id); return n; }); }); }}
                  aria-label="Excluir" title="Excluir" className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-300"
                ><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </article>
        ))}
        {!loading && visible.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-700 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-slate-300">{questions.length === 0 ? 'Seu banco ainda está vazio.' : 'Nenhuma pergunta com esses filtros.'}</p>
            {questions.length === 0 && <p className="mt-1 text-sm text-slate-500">Cadastre uma pergunta ou importe uma planilha CSV.</p>}
          </div>
        )}
        {loading && <p className="inline-flex items-center gap-2 px-1 py-4 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Carregando…</p>}
      </div>

      <div className="mt-8 border-t border-slate-800 pt-4">
        <button
          onClick={() => { if (window.confirm('Remover o conjunto publicado? O Rali NFC volta a usar apenas as 50 missões padrão.')) run(async () => { await publishNfc([], true); setPublishedLocal(null); flash('Conjunto despublicado. O Rali NFC voltou às missões padrão.'); }); }}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-300"
        ><X className="w-3.5 h-3.5" /> Despublicar do Rali NFC (voltar às 50 padrão)</button>
      </div>

      {editing && (
        <QuestionForm
          initial={editing}
          assuntosSugeridos={assuntosDaDisciplina}
          onClose={() => setEditing(null)}
          onSave={async (draft) => {
            const saved = await saveQuestion(draft);
            setQuestions((cur) => (cur.some((x) => x.id === saved.id) ? cur.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...cur]));
            setEditing(null);
            flash(draft.id ? 'Pergunta atualizada.' : 'Pergunta salva no banco.');
          }}
        />
      )}
      {importing && (
        <ImportDialog
          onClose={() => setImporting(false)}
          onImport={async (list) => {
            const r = await importQuestions(list);
            await load();
            setImporting(false);
            flash(`${r.importadas} pergunta(s) importada(s)${r.erros.length ? `, ${r.erros.length} ignorada(s)` : ''}.`);
            return { importadas: r.importadas, erros: r.erros.length };
          }}
        />
      )}
      {publishing && (
        <PublishDialog
          selected={selectedList}
          onClose={() => setPublishing(false)}
          onPublish={async ({ start, somenteBanco }) => {
            const missoes = selectedList.map((q, i) => {
              const { id: _id, atualizado_em: _a, ...rest } = q;
              return { ...rest, tag_id: tagName(start + i) };
            });
            const ruins = missoes
              .map((m) => ({ m, erro: validateDraft(m) }))
              .filter((x) => x.erro);
            if (ruins.length) {
              const lista = ruins.slice(0, 5).map(({ m, erro }) => `• ${m.tag_id}: “${m.pergunta.replace(/\s+/g, ' ').slice(0, 60)}…” — ${erro}`).join('\n');
              throw new Error(`${ruins.length} pergunta(s) com problema. Corrija (ou desmarque) e publique de novo:\n${lista}${ruins.length > 5 ? `\n…e mais ${ruins.length - 5}.` : ''}`);
            }
            await publishNfc(missoes, somenteBanco);
            setPublishedLocal({ somenteBanco, missoes });
            setPublishing(false);
            flash(`${missoes.length} missões publicadas (${tagName(start)} a ${tagName(start + missoes.length - 1)}). Os alunos recebem ao abrir o app.`);
          }}
        />
      )}
    </div>
  );
};
