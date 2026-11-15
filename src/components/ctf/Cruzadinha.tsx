import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Eraser, Eye, Lightbulb, Loader2, Puzzle, ShieldCheck, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CruzEstado, CruzPalavra } from '../../types/ctf';
import { letraNormalizada } from '../../utils/cruzadinha';
import { playSound } from '../../utils/audio';

type Dir = 'A' | 'D';

export interface CruzApi {
  estado: () => Promise<CruzEstado>;
  conferir: (id: number, tentativa: string) => Promise<CruzEstado>;
  dica: (tipo: 'letra' | 'palavra', id: number, indice?: number) => Promise<CruzEstado>;
}

interface Props {
  token: string;
  nome: string;
  /** identificador da grade (muda quando o professor gera outra) */
  versao?: number;
  /** sala encerrada ou tempo esgotado */
  bloqueada?: boolean;
  api: CruzApi;
  /** treino livre: pontos só para você, sem ranking */
  treino?: boolean;
}

const k = (r: number, c: number) => `${r},${c}`;
const celulas = (p: CruzPalavra): [number, number][] =>
  Array.from({ length: p.tam }, (_, i) => (p.dir === 'A' ? [p.r, p.c + i] : [p.r + i, p.c]) as [number, number]);

/**
 * Cruzadinha: ambiente do CTF. O servidor monta a grade e manda só o desenho e as dicas, sem as letras.
 * O aluno digita aqui; cada palavra completa é conferida no servidor, que também entrega e conta as dicas.
 */
export function Cruzadinha({ token, nome, versao, bloqueada = false, api, treino = false }: Props) {
  const apiRef = useRef(api);
  apiRef.current = api;
  const [est, setEst] = useState<CruzEstado | null>(null);
  const [erroCarga, setErroCarga] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');
  const [erradas, setErradas] = useState<Record<string, true>>({});
  const [sel, setSel] = useState<{ r: number; c: number; dir: Dir } | null>(null);
  const avisoT = useRef<number | undefined>(undefined);
  const entrada = useRef<HTMLInputElement>(null);
  const gradeRef = useRef<HTMLDivElement>(null);
  // A grade se ajusta à largura disponível (sem barra de rolagem): o lado da casa sai da largura da caixa
  const [caixa, setCaixa] = useState<HTMLDivElement | null>(null);
  const [largura, setLargura] = useState(0);
  useEffect(() => {
    if (!caixa) return;
    const medir = () => setLargura(caixa.clientWidth);
    medir();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(medir) : null;
    ro?.observe(caixa);
    window.addEventListener('resize', medir);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', medir);
    };
  }, [caixa]);
  const tentadas = useRef<Record<number, string>>({});

  const dizer = useCallback((t: string) => {
    setAviso(t);
    window.clearTimeout(avisoT.current);
    avisoT.current = window.setTimeout(() => setAviso(''), 2600);
  }, []);

  // Carrega a grade (e de novo quando o professor gera outra)
  useEffect(() => {
    let vivo = true;
    setErroCarga('');
    apiRef.current
      .estado()
      .then((e) => {
        if (!vivo) return;
        setEst(e);
        setSel(null);
      })
      .catch((err) => vivo && setErroCarga(err instanceof Error ? err.message : String(err)));
    return () => {
      vivo = false;
    };
  }, [versao]);

  const gid = est?.grade.id ?? 0;
  const chave = `cruzadinha:${token}:${nome.trim().toLowerCase()}:${gid}`;
  const [vals, setVals] = useState<Record<string, string>>({});
  const [valsDe, setValsDe] = useState('');
  useEffect(() => {
    if (!gid) return;
    try {
      setVals(JSON.parse(localStorage.getItem(chave) || '{}'));
    } catch {
      setVals({});
    }
    setValsDe(chave);
    tentadas.current = {};
  }, [chave, gid]);
  useEffect(() => {
    if (!gid || valsDe !== chave) return;
    try {
      localStorage.setItem(chave, JSON.stringify(vals));
    } catch {
      // sem armazenamento: o que foi digitado fica só nesta sessão
    }
  }, [chave, gid, vals, valsDe]);

  const palavras = useMemo(() => est?.grade.palavras ?? [], [est]);
  const info = useMemo(() => {
    const m = new Map<string, { num: number; ids: Partial<Record<Dir, number>> }>();
    for (const p of palavras) {
      celulas(p).forEach(([r, c], i) => {
        const o = m.get(k(r, c)) ?? { num: 0, ids: {} };
        o.ids[p.dir] = p.id;
        if (i === 0) o.num = p.n;
        m.set(k(r, c), o);
      });
    }
    return m;
  }, [palavras]);

  // Letras que vieram do servidor: dicas e palavras já acertadas
  const fixas = useMemo(() => {
    const f: Record<string, { l: string; dica: boolean }> = {};
    for (const [r, c, l] of est?.reveladas ?? []) f[k(r, c)] = { l, dica: true };
    for (const s of est?.resolvidas ?? []) {
      const p = palavras.find((x) => x.id === s.id);
      if (p) celulas(p).forEach(([r, c], i) => (f[k(r, c)] = f[k(r, c)] ?? { l: s.palavra[i] ?? '', dica: false }));
    }
    return f;
  }, [est, palavras]);

  const letra = useCallback((r: number, c: number) => fixas[k(r, c)]?.l ?? vals[k(r, c)] ?? '', [fixas, vals]);
  const resolvidas = useMemo(() => new Set((est?.resolvidas ?? []).map((s) => s.id)), [est]);
  const feitas = useMemo(
    () => new Set(palavras.filter((p) => resolvidas.has(p.id) || celulas(p).every(([r, c]) => fixas[k(r, c)])).map((p) => p.id)),
    [palavras, resolvidas, fixas],
  );
  const completa = palavras.length > 0 && feitas.size === palavras.length;
  const restantes = Math.max(0, (est?.limite ?? 0) - (est?.usadas ?? 0));

  useEffect(() => {
    if (!sel && palavras.length) {
      const p = [...palavras].sort((a, b) => a.n - b.n)[0];
      setSel({ r: p.r, c: p.c, dir: p.dir });
    }
  }, [palavras, sel]);

  useEffect(() => {
    if (sel) gradeRef.current?.querySelector<HTMLElement>(`[data-cel="${sel.r},${sel.c}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [sel]);

  const atual = useMemo(() => {
    if (!sel) return null;
    const o = info.get(k(sel.r, sel.c));
    const id = o?.ids[sel.dir] ?? o?.ids[sel.dir === 'A' ? 'D' : 'A'];
    return palavras.find((p) => p.id === id) ?? null;
  }, [info, sel, palavras]);

  const aplicar = useCallback(
    (e: CruzEstado) => {
      setEst(e);
      if (e.nova) {
        playSound('success', true);
        dizer(e.nova.xp > 0 ? (treino ? `✔ ${e.nova.palavra}: +${e.nova.xp} pts` : `✔ ${e.nova.palavra}: +${e.nova.xp} XP (${e.nova.posicao}º a resolver)`) + (e.nova.ajuda ? ' · metade dos pontos: havia letra revelada por dica nesta palavra' : '') : `✔ ${e.nova.palavra}: sem pontos, todas as letras já estavam reveladas por dica`);
      }
    },
    [dizer, treino],
  );

  // Confere no servidor uma palavra completa (sem repetir a mesma tentativa automaticamente)
  const conferir = useCallback(
    async (p: CruzPalavra, manual = false) => {
      const tentativa = celulas(p).map(([r, c]) => letra(r, c)).join('');
      if (tentativa.length < p.tam) {
        if (manual) dizer('Complete a palavra antes de conferir.');
        return;
      }
      if (!manual && tentadas.current[p.id] === tentativa) return;
      tentadas.current[p.id] = tentativa;
      setOcupado(true);
      try {
        const e = await apiRef.current.conferir(p.id, tentativa);
        aplicar(e);
        if (!e.correta) {
          playSound('error', true);
          const ruins: Record<string, true> = {};
          celulas(p).forEach(([r, c]) => {
            if (!fixas[k(r, c)]) ruins[k(r, c)] = true;
          });
          setErradas(ruins);
          window.setTimeout(() => setErradas({}), 1000);
          dizer(`${p.n} ${p.dir === 'A' ? 'horizontal' : 'vertical'}: ainda não está certa.`);
        }
      } catch (err) {
        delete tentadas.current[p.id];
        dizer(err instanceof Error ? err.message : String(err));
      } finally {
        setOcupado(false);
      }
    },
    [letra, fixas, aplicar, dizer],
  );

  // Ao completar uma palavra, ela vai sozinha para o servidor conferir
  useEffect(() => {
    if (ocupado || bloqueada) return;
    const pronta = palavras.find((p) => {
      if (feitas.has(p.id)) return false;
      const t = celulas(p).map(([r, c]) => letra(r, c)).join('');
      return t.length === p.tam && tentadas.current[p.id] !== t;
    });
    if (pronta) void conferir(pronta);
  }, [letra, ocupado, bloqueada, palavras, feitas, conferir]);

  const parabens = useRef(false);
  useEffect(() => {
    if (completa && !parabens.current) {
      parabens.current = true;
      try {
        confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 }, colors: ['#10b981', '#34d399', '#f59e0b', '#38bdf8'] });
      } catch {
        // ignore
      }
    }
  }, [completa]);

  if (erroCarga) {
    return (
      <section className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 text-sm text-slate-300" aria-label="Cruzadinha">
        <span className="font-black text-white">Cruzadinha:</span> {erroCarga}
      </section>
    );
  }
  if (!est || !sel || !atual) {
    return (
      <section className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-2 text-sm text-slate-400" aria-label="Cruzadinha">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Carregando a Cruzadinha…
      </section>
    );
  }

  const travada = (r: number, c: number) => bloqueada || Boolean(fixas[k(r, c)]);

  const selecionar = (r: number, c: number, alternar = false) => {
    const o = info.get(k(r, c));
    if (!o) return;
    let dir = sel.dir;
    if (alternar && sel.r === r && sel.c === c && o.ids.A !== undefined && o.ids.D !== undefined) dir = dir === 'A' ? 'D' : 'A';
    else if (o.ids[dir] === undefined) dir = dir === 'A' ? 'D' : 'A';
    setSel({ r, c, dir });
    entrada.current?.focus({ preventScroll: true });
  };

  const irPara = (p: CruzPalavra) => {
    const alvo = celulas(p).find(([r, c]) => !letra(r, c)) ?? celulas(p)[0];
    setSel({ r: alvo[0], c: alvo[1], dir: p.dir });
    entrada.current?.focus({ preventScroll: true });
  };

  const indiceAtual = () => celulas(atual).findIndex(([r, c]) => r === sel.r && c === sel.c);
  const avancar = (voltar = false) => {
    const prox = celulas(atual)[indiceAtual() + (voltar ? -1 : 1)];
    if (prox) setSel({ r: prox[0], c: prox[1], dir: atual.dir });
  };

  const digitar = (l: string) => {
    if (bloqueada || completa) return;
    if (!travada(sel.r, sel.c)) setVals((v) => ({ ...v, [k(sel.r, sel.c)]: l }));
    avancar();
  };

  const apagar = () => {
    if (bloqueada || completa) return;
    const aqui = k(sel.r, sel.c);
    if (vals[aqui] && !travada(sel.r, sel.c)) {
      setVals((v) => {
        const n = { ...v };
        delete n[aqui];
        return n;
      });
      return;
    }
    const ant = celulas(atual)[indiceAtual() - 1];
    if (!ant) return;
    setSel({ r: ant[0], c: ant[1], dir: atual.dir });
    if (!travada(ant[0], ant[1])) {
      setVals((v) => {
        const n = { ...v };
        delete n[k(ant[0], ant[1])];
        return n;
      });
    }
  };

  const mover = (dr: number, dc: number) => {
    if (info.has(k(sel.r + dr, sel.c + dc))) selecionar(sel.r + dr, sel.c + dc);
  };

  const proximaPalavra = (voltar: boolean) => {
    const ord = [...palavras].sort((a, b) => a.n - b.n || a.dir.localeCompare(b.dir));
    const i = ord.findIndex((p) => p.id === atual.id);
    irPara(ord[(i + (voltar ? -1 : 1) + ord.length) % ord.length]);
  };

  const aoTeclar = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const acoes: Record<string, () => void> = {
      Backspace: apagar,
      ArrowRight: () => mover(0, 1),
      ArrowLeft: () => mover(0, -1),
      ArrowDown: () => mover(1, 0),
      ArrowUp: () => mover(-1, 0),
      Tab: () => proximaPalavra(e.shiftKey),
      Enter: () => proximaPalavra(e.shiftKey),
    };
    if (acoes[e.key]) {
      e.preventDefault();
      acoes[e.key]();
    }
  };

  const aoDigitar = (e: React.FormEvent<HTMLInputElement>) => {
    const v = e.currentTarget.value;
    e.currentTarget.value = '';
    const l = letraNormalizada(v.slice(-1));
    if (l) digitar(l);
  };

  const pedirDica = async (tipo: 'letra' | 'palavra') => {
    if (bloqueada || completa || ocupado) return;
    if (restantes <= 0) {
      dizer(est.limite === 0 ? 'O professor desativou as dicas.' : 'Suas dicas acabaram.');
      return;
    }
    if (feitas.has(atual.id)) {
      dizer('Essa palavra já está resolvida.');
      return;
    }
    if (tipo === 'letra' && fixas[k(sel.r, sel.c)]) {
      dizer('Escolha uma letra que ainda não foi revelada.');
      return;
    }
    setOcupado(true);
    try {
      aplicar(await apiRef.current.dica(tipo, atual.id, tipo === 'letra' ? indiceAtual() : undefined));
      if (tipo === 'letra') avancar();
    } catch (err) {
      dizer(err instanceof Error ? err.message : String(err));
    } finally {
      setOcupado(false);
    }
  };

  const apagarPalavra = () => {
    if (bloqueada || completa) return;
    setVals((v) => {
      const n = { ...v };
      for (const [r, c] of celulas(atual)) if (!travada(r, c)) delete n[k(r, c)];
      return n;
    });
  };

  const { h, w } = est.grade;
  const GAP = 2;
  const disponivel = Math.max(0, (largura || 320) - 16);
  const lado = Math.max(9, Math.min(44, Math.floor((disponivel - (w - 1) * GAP) / w)));
  const lista = (dir: Dir) => palavras.filter((p) => p.dir === dir).sort((a, b) => a.n - b.n);
  const semFoco = (e: React.MouseEvent) => e.preventDefault();
  const btn = 'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold border transition disabled:opacity-45 disabled:cursor-not-allowed';

  return (
    <section className="bg-slate-900 border border-emerald-500/30 rounded-2xl overflow-hidden min-w-0" aria-label="Cruzadinha">
      <header className="px-4 py-3 flex flex-wrap items-center gap-2 border-b border-slate-800 bg-emerald-500/5">
        <Puzzle className="w-5 h-5 text-emerald-300" />
        <h3 className="font-black text-white">Cruzada</h3>
        <span className="text-xs text-slate-400 hidden sm:inline">{treino ? 'Treino livre: os pontos são só seus, sem ranking.' : 'Vocabulário da disciplina. Cada palavra certa soma XP no ranking da sala.'}</span>
        <div className="ml-auto flex flex-wrap items-center gap-1.5 text-xs font-black">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200">
            {feitas.size}/{palavras.length} palavras
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300">{est.xp} {treino ? 'pts' : 'XP'}</span>
          <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300" title="Dicas restantes (definidas pelo professor)">
            💡 {restantes}/{est.limite}
          </span>
        </div>
      </header>

      <div className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-5 gap-4 min-w-0">
        <div className="lg:col-span-3 space-y-3 min-w-0">
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2" aria-live="polite">
            <div className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
              {atual.n} {atual.dir === 'A' ? 'Horizontal →' : 'Vertical ↓'} · {atual.tam} letras
            </div>
            <div className="text-sm sm:text-base font-bold text-white">{atual.dica}</div>
          </div>

          <div ref={setCaixa} className="bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-2 overflow-hidden">
            <div
              ref={gradeRef}
              role="grid"
              aria-label="Grade da cruzadinha"
              className="cruz-grade mx-auto grid"
              style={{ gridTemplateColumns: `repeat(${w}, ${lado}px)`, gridAutoRows: `${lado}px`, gap: GAP, width: lado * w + GAP * (w - 1) }}
            >
              {Array.from({ length: h }, (_, r) =>
                Array.from({ length: w }, (_, c) => {
                  const o = info.get(k(r, c));
                  if (!o) return <div key={k(r, c)} aria-hidden="true" />;
                  const ch = k(r, c);
                  const v = letra(r, c);
                  const ativa = sel.r === r && sel.c === c;
                  const naPalavra = celulas(atual).some(([x, y]) => x === r && y === c);
                  const ok = Object.values(o.ids).some((id) => feitas.has(id as number));
                  const cor = erradas[ch]
                    ? 'bg-rose-300 border-rose-500 text-rose-900'
                    : ativa
                      ? 'bg-emerald-300 border-emerald-600 text-emerald-950 ring-2 ring-emerald-400 z-10'
                      : fixas[ch]?.dica
                        ? 'bg-sky-200 border-sky-500 text-sky-900'
                        : ok
                          ? 'bg-emerald-200 border-emerald-500 text-emerald-900'
                          : naPalavra
                            ? 'bg-emerald-100 border-emerald-400 text-slate-900'
                            : 'bg-slate-100 border-slate-400 text-slate-900';
                  return (
                    <button
                      key={ch}
                      data-cel={ch}
                      type="button"
                      role="gridcell"
                      aria-label={`Linha ${r + 1}, coluna ${c + 1}${o.num ? `, início da palavra ${o.num}` : ''}${v ? `, letra ${v}` : ', vazia'}`}
                      onClick={() => selecionar(r, c, true)}
                      className={`relative rounded-[4px] border font-black uppercase leading-none flex items-center justify-center transition-colors ${cor}`}
                      style={{ fontSize: Math.max(8, Math.round(lado * 0.56)) }}
                    >
                      {o.num > 0 && <span className="absolute top-[1px] left-[2px] font-black text-slate-500 leading-none" style={{ fontSize: Math.max(6, Math.round(lado * 0.3)) }}>{o.num}</span>}
                      {v}
                    </button>
                  );
                }),
              )}
            </div>
            <input
              ref={entrada}
              onKeyDown={aoTeclar}
              onInput={aoDigitar}
              autoComplete="off"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Digite as letras da palavra selecionada"
              className="sr-only"
              disabled={bloqueada}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onMouseDown={semFoco} onClick={() => conferir(atual, true)} disabled={bloqueada || ocupado || feitas.has(atual.id)} className={`${btn} bg-emerald-600 hover:bg-emerald-500 border-emerald-600 text-white font-black`}>
              {ocupado ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Conferir palavra
            </button>
            <button type="button" onMouseDown={semFoco} onClick={() => pedirDica('letra')} disabled={bloqueada || ocupado || restantes <= 0} className={`${btn} bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100`}>
              <Lightbulb className="w-4 h-4 text-sky-300" /> Dica: letra
            </button>
            <button type="button" onMouseDown={semFoco} onClick={() => pedirDica('palavra')} disabled={bloqueada || ocupado || restantes <= 0} className={`${btn} bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100`}>
              <Eye className="w-4 h-4 text-sky-300" /> Revelar palavra
            </button>
            <button type="button" onMouseDown={semFoco} onClick={apagarPalavra} disabled={bloqueada} className={`${btn} bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100`}>
              <Eraser className="w-4 h-4 text-slate-300" /> Apagar palavra
            </button>
          </div>
          <p className="text-[11px] text-slate-500 min-h-[1rem]" role="status">
            {aviso ||
              (est.limite > 0
                ? `A palavra é conferida ao completar. Cada dica gasta 1 das suas ${est.limite}: palavra com letra revelada vale metade; palavra revelada vale 0.`
                : 'A palavra é conferida ao completar. O professor desativou as dicas nesta sala.')}
          </p>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 min-w-0 content-start">
          {completa && (
            <div className="sm:col-span-2 lg:col-span-1 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-3 text-center">
              <Trophy className="w-8 h-8 mx-auto text-amber-400" />
              <p className="font-black text-white">Cruzada concluída!</p>
              <p className="text-sm text-amber-200">{treino ? `${est.xp} pontos` : `${est.xp} XP no ranking`}</p>
            </div>
          )}
          {(['A', 'D'] as Dir[]).map((d) => (
            <div key={d} className="min-w-0">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">{d === 'A' ? 'Horizontais →' : 'Verticais ↓'}</h4>
              <ol className="space-y-1 max-h-72 overflow-auto pr-1">
                {lista(d).map((p) => {
                  const on = p.id === atual.id;
                  const ok = feitas.has(p.id);
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => irPara(p)}
                        className={`w-full text-left flex gap-2 rounded-lg border px-2.5 py-1.5 text-[13px] transition ${
                          on ? 'border-emerald-500/70 bg-emerald-500/10 text-white' : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600'
                        } ${ok ? 'opacity-60' : ''}`}
                      >
                        <b className="text-emerald-300 min-w-[1.25rem]">{p.n}</b>
                        <span className={ok ? 'line-through' : ''}>
                          {p.dica} <em className="not-italic text-slate-500">({p.tam})</em>
                        </span>
                        {ok && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-auto" />}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
