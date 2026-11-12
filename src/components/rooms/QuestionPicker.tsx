import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff, Search, Shuffle, X } from 'lucide-react';
import { BankQuestion } from '../../types/bank';
import { pickRandom } from '../../utils/bank';

interface QuestionPickerProps {
  questions: BankQuestion[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  accent?: 'orange' | 'emerald';
}

const collator = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' });
const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const PAGE = 25;

interface Assunto {
  nome: string;
  qs: BankQuestion[];
  /** pacote pronto do catálogo (e não uma pergunta avulsa do banco do professor) */
  pronto: boolean;
}
interface Disciplina {
  nome: string;
  assuntos: Assunto[];
  qs: BankQuestion[];
}

/** Caixa de seleção com o estado "parcial" (alguns itens marcados). */
const Tri: React.FC<{ checked: boolean; partial: boolean; onChange: () => void; label: string; accentClass: string }> = ({ checked, partial, onChange, label, accentClass }) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = partial && !checked;
  }, [partial, checked]);
  return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} aria-label={label} className={`h-4 w-4 shrink-0 cursor-pointer ${accentClass}`} />;
};

/**
 * Seletor de perguntas da sala, igual no CTF Online e no Rali NFC.
 * Tudo é "pergunta": o professor navega Disciplina > Assunto > Pergunta e marca em qualquer nível
 * (a disciplina inteira, um assunto inteiro ou uma pergunta). A busca cruza todas as disciplinas.
 */
export const QuestionPicker: React.FC<QuestionPickerProps> = ({ questions, selected, onChange, accent = 'orange' }) => {
  const [busca, setBusca] = useState('');
  const [inativas, setInativas] = useState(false);
  const [soMarcadas, setSoMarcadas] = useState(false);
  const [abertasD, setAbertasD] = useState<Set<string>>(new Set());
  const [abertosA, setAbertosA] = useState<Set<string>>(new Set());
  const [limite, setLimite] = useState<Record<string, number>>({});
  const [qtd, setQtd] = useState(10);
  const [escopo, setEscopo] = useState('');

  const orange = accent === 'orange';
  const ring = orange ? 'accent-orange-500' : 'accent-emerald-500';
  const txtAccent = orange ? 'text-orange-300' : 'text-emerald-300';
  const bgAccent = orange ? 'bg-orange-600 hover:bg-orange-500' : 'bg-emerald-600 hover:bg-emerald-500';
  const barAccent = orange ? 'bg-orange-500' : 'bg-emerald-500';
  const rowOn = orange ? 'border-orange-500/60 bg-orange-500/10' : 'border-emerald-500/60 bg-emerald-500/10';

  // Se a seleção trazida de fora já inclui inativas, mostra-as (senão ficariam escondidas)
  useEffect(() => {
    if (!inativas && questions.some((q) => !q.ativo && selected.has(q.id))) setInativas(true);
  }, [questions, selected, inativas]);

  const totalInativas = useMemo(() => questions.filter((q) => !q.ativo).length, [questions]);
  const visiveis = useMemo(() => questions.filter((q) => inativas || q.ativo), [questions, inativas]);

  const arvore = useMemo<Disciplina[]>(() => {
    const m = new Map<string, Map<string, BankQuestion[]>>();
    visiveis.forEach((q) => {
      const d = q.disciplina || 'Sem disciplina';
      const a = q.assunto || 'Sem assunto';
      if (!m.has(d)) m.set(d, new Map());
      const am = m.get(d)!;
      if (!am.has(a)) am.set(a, []);
      am.get(a)!.push(q);
    });
    return Array.from(m.entries())
      .sort((x, y) => collator.compare(x[0], y[0]))
      .map(([nome, am]) => {
        const assuntos = Array.from(am.entries())
          .sort((x, y) => collator.compare(x[0], y[0]))
          .map(([an, qs]) => ({ nome: an, qs, pronto: qs.every((q) => q.id.startsWith('cat:')) }));
        return { nome, assuntos, qs: assuntos.flatMap((a) => a.qs) };
      });
  }, [visiveis]);

  const resultados = useMemo(() => {
    const t = plain(busca.trim());
    if (!t) return [];
    return visiveis.filter((q) => plain(`${q.disciplina} ${q.assunto} ${q.pergunta} ${q.resposta}`).includes(t));
  }, [visiveis, busca]);
  const buscando = busca.trim().length > 0;

  const resumo = useMemo(() => {
    const sel = questions.filter((q) => selected.has(q.id));
    return {
      n: sel.length,
      xp: sel.reduce((s, q) => s + (Number(q.xp) || 0), 0),
      disciplinas: new Set(sel.map((q) => q.disciplina)).size,
      assuntos: new Set(sel.map((q) => `${q.disciplina}|${q.assunto}`)).size,
    };
  }, [questions, selected]);

  const marcados = (qs: BankQuestion[]) => qs.reduce((n, q) => n + (selected.has(q.id) ? 1 : 0), 0);
  const alternar = (qs: BankQuestion[]) => {
    const todas = qs.length > 0 && qs.every((q) => selected.has(q.id));
    const n = new Set(selected);
    qs.forEach((q) => (todas ? n.delete(q.id) : n.add(q.id)));
    onChange(n);
  };
  const alternarUma = (id: string) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    onChange(n);
  };
  const toggleSet = (set: Set<string>, key: string, setter: (s: Set<string>) => void) => {
    const n = new Set(set);
    if (n.has(key)) n.delete(key);
    else n.add(key);
    setter(n);
  };

  const universoSorteio = useMemo(() => {
    if (buscando) return resultados;
    if (escopo) return arvore.find((d) => d.nome === escopo)?.qs ?? [];
    return visiveis;
  }, [buscando, resultados, escopo, arvore, visiveis]);
  const sortear = () => {
    const livres = universoSorteio.filter((q) => !selected.has(q.id));
    const n = new Set(selected);
    pickRandom(livres, qtd).forEach((q) => n.add(q.id));
    onChange(n);
  };

  const linhaPergunta = (q: BankQuestion) => (
    <label key={q.id} className={`flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer transition ${selected.has(q.id) ? rowOn : 'border-slate-800 bg-slate-950/70 hover:border-slate-600'}`}>
      <input type="checkbox" checked={selected.has(q.id)} onChange={() => alternarUma(q.id)} className={`mt-0.5 h-4 w-4 shrink-0 ${ring}`} />
      <span className="min-w-0 flex-1">
        <span className="block line-clamp-3 leading-snug">{q.pergunta}</span>
        <span className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] text-slate-500">
          <span>{q.tipo === 'multipla' ? 'múltipla escolha' : 'resposta exata'}</span>
          <span>{q.xp} XP</span>
          {!q.ativo && <span className="text-amber-400">inativa</span>}
        </span>
      </span>
    </label>
  );

  const listaPerguntas = (chave: string, qs: BankQuestion[]) => {
    const lista = soMarcadas ? qs.filter((q) => selected.has(q.id)) : qs;
    const max = limite[chave] ?? PAGE;
    return (
      <div className="space-y-1 pt-1">
        {lista.slice(0, max).map(linhaPergunta)}
        {lista.length > max && (
          <button type="button" onClick={() => setLimite({ ...limite, [chave]: max + PAGE })} className="w-full rounded-lg border border-dashed border-slate-700 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-white">
            Mostrar mais {Math.min(PAGE, lista.length - max)} de {lista.length - max} restantes
          </button>
        )}
      </div>
    );
  };

  const barra = (sel: number, total: number) => (
    <span className="block h-1 w-full overflow-hidden rounded-full bg-slate-800" aria-hidden>
      <span className={`block h-full rounded-full ${barAccent}`} style={{ width: `${total ? (sel / total) * 100 : 0}%` }} />
    </span>
  );

  const chip = 'inline-flex items-center rounded-md border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-[10px] font-bold text-slate-300';
  const campo = 'rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200';
  const disciplinasVisiveis = soMarcadas ? arvore.filter((d) => marcados(d.qs) > 0) : arvore;

  return (
    <div className="w-full min-w-0 space-y-3">
      {/* Resumo sempre visível */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2">
        <div className="min-w-0">
          <div className="text-sm font-black text-white">
            <span className={txtAccent}>{resumo.n}</span> {resumo.n === 1 ? 'pergunta marcada' : 'perguntas marcadas'}
          </div>
          <div className="text-[11px] text-slate-400">
            {resumo.n > 0 ? `${resumo.disciplinas} disciplina(s) · ${resumo.assuntos} assunto(s) · ${resumo.xp} XP no total` : 'Marque disciplinas, assuntos ou perguntas abaixo.'}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSoMarcadas((v) => !v)}
            disabled={resumo.n === 0 && !soMarcadas}
            aria-pressed={soMarcadas}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition disabled:opacity-40 ${soMarcadas ? `${rowOn} text-white` : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
          >
            {soMarcadas ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {soMarcadas ? 'Ver todas' : 'Só marcadas'}
          </button>
          <button type="button" onClick={() => onChange(new Set())} disabled={resumo.n === 0} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-40">
            <X className="h-3.5 w-3.5" /> Limpar
          </button>
        </div>
      </div>

      {/* Busca + sorteio */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          aria-label="Buscar pergunta"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar em todas as disciplinas (pergunta, assunto ou resposta)"
          className={`${campo} w-full pl-8 pr-8 placeholder:text-slate-500`}
        />
        {busca && (
          <button type="button" onClick={() => setBusca('')} aria-label="Limpar busca" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-400">Sortear</span>
        <label htmlFor="qp-qtd" className="sr-only">Quantidade a sortear</label>
        <input id="qp-qtd" type="number" min={1} max={200} value={qtd} onChange={(e) => setQtd(Math.max(1, Math.min(200, Number(e.target.value) || 1)))} className="w-14 rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-slate-200" />
        <span className="text-slate-400">de</span>
        {buscando ? (
          <span className={chip}>resultados da busca ({resultados.length})</span>
        ) : (
          <select aria-label="Sortear de qual disciplina" value={escopo} onChange={(e) => setEscopo(e.target.value)} className={`${campo} min-w-0 max-w-[11rem] truncate`}>
            <option value="">todas as disciplinas</option>
            {arvore.map((d) => <option key={d.nome} value={d.nome}>{d.nome}</option>)}
          </select>
        )}
        <button type="button" onClick={sortear} disabled={universoSorteio.length === 0} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold text-white disabled:opacity-40 ${bgAccent}`} title="Soma perguntas sorteadas às que você já marcou">
          <Shuffle className="h-3.5 w-3.5" /> Adicionar
        </button>
        {totalInativas > 0 && (
          <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-slate-400">
            <input type="checkbox" checked={inativas} onChange={(e) => setInativas(e.target.checked)} className={ring} />
            Incluir inativas ({totalInativas})
          </label>
        )}
      </div>

      {/* Resultados da busca */}
      {buscando ? (
        <div className="max-h-[26rem] space-y-2 overflow-y-auto overflow-x-hidden pr-1" role="list" aria-label="Resultados da busca">
          {resultados.length > 0 && (
            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>{resultados.length} resultado(s)</span>
              <button type="button" onClick={() => alternar(resultados)} className="font-bold text-slate-200 hover:text-white">
                {resultados.every((q) => selected.has(q.id)) ? 'Desmarcar todos os resultados' : 'Marcar todos os resultados'}
              </button>
            </div>
          )}
          {resultados.slice(0, 80).map((q) => (
            <div key={q.id}>
              <div className="px-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{q.disciplina} › {q.assunto || 'Sem assunto'}</div>
              {linhaPergunta(q)}
            </div>
          ))}
          {resultados.length > 80 && <p className="text-center text-[11px] text-slate-500">Mostrando 80 de {resultados.length}. Refine a busca para ver as demais.</p>}
          {resultados.length === 0 && <p className="rounded-lg border border-dashed border-slate-700 px-3 py-6 text-center text-xs text-slate-500">Nenhuma pergunta encontrada para “{busca}”.</p>}
        </div>
      ) : (
        /* Disciplina > Assunto > Pergunta */
        <div className="max-h-[26rem] space-y-2 overflow-y-auto overflow-x-hidden pr-1" role="tree" aria-label="Disciplinas, assuntos e perguntas">
          {disciplinasVisiveis.map((d) => {
            const sel = marcados(d.qs);
            const aberta = abertasD.has(d.nome) || (soMarcadas && sel > 0);
            return (
              <div key={d.nome} role="treeitem" aria-expanded={aberta} className={`overflow-hidden rounded-xl border ${sel > 0 ? rowOn : 'border-slate-800 bg-slate-950/50'}`}>
                <div className="flex items-center gap-2 px-2.5 py-2">
                  <Tri checked={sel === d.qs.length && d.qs.length > 0} partial={sel > 0} onChange={() => alternar(d.qs)} label={`Marcar toda a disciplina ${d.nome}`} accentClass={ring} />
                  <button type="button" onClick={() => toggleSet(abertasD, d.nome, setAbertasD)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                    {aberta ? <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-white">{d.nome}</span>
                      <span className="block text-[10px] text-slate-400">{d.assuntos.length} assunto(s) · {d.qs.length} perguntas</span>
                    </span>
                    <span className={`${chip} ${sel > 0 ? txtAccent : ''}`}>{sel}/{d.qs.length}</span>
                  </button>
                </div>
                <div className="px-2.5 pb-2">{barra(sel, d.qs.length)}</div>

                {aberta && (
                  <div className="space-y-1.5 border-t border-slate-800 bg-slate-950/40 p-2" role="group">
                    {d.assuntos
                      .filter((a) => !soMarcadas || marcados(a.qs) > 0)
                      .map((a) => {
                        const chave = `${d.nome}|${a.nome}`;
                        const selA = marcados(a.qs);
                        const abertoA = abertosA.has(chave) || (soMarcadas && selA > 0);
                        return (
                          <div key={chave} role="treeitem" aria-expanded={abertoA} className={`rounded-lg border ${selA > 0 ? 'border-slate-600' : 'border-slate-800'} bg-slate-900/70`}>
                            <div className="flex items-center gap-2 px-2 py-1.5">
                              <Tri checked={selA === a.qs.length && a.qs.length > 0} partial={selA > 0} onChange={() => alternar(a.qs)} label={`Marcar todo o assunto ${a.nome}`} accentClass={ring} />
                              <button type="button" onClick={() => toggleSet(abertosA, chave, setAbertosA)} className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
                                {abertoA ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />}
                                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-100">{a.nome}</span>
                                {a.pronto && <span className="hidden rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:inline">pacote pronto</span>}
                                <span className={`${chip} ${selA > 0 ? txtAccent : ''}`}>{selA}/{a.qs.length}</span>
                              </button>
                            </div>
                            {abertoA && <div className="px-2 pb-2">{listaPerguntas(chave, a.qs)}</div>}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
          {disciplinasVisiveis.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-700 px-3 py-6 text-center text-xs text-slate-500">
              {soMarcadas ? 'Nenhuma pergunta marcada ainda.' : questions.length === 0 ? 'Nenhuma pergunta disponível.' : 'Nenhuma pergunta ativa. Marque “Incluir inativas” para ver as demais.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
