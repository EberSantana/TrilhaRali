import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Eraser, Eye, Lightbulb, Puzzle, ShieldCheck, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BANCO_CRUZADINHA, disciplinasDasTags, type PalavraCruz } from '../../data/cruzadinhaBanco';
import { hashTexto, letraNormalizada, montarGrade, xpPalavra, type Dir, type PalavraGrade } from '../../utils/cruzadinha';
import { playSound } from '../../utils/audio';

interface Props {
  /** token da sala: define a cruzadinha (a mesma para todos) e a chave do progresso salvo */
  token: string;
  /** nome do aluno (chave do progresso salvo) */
  nome: string;
  /** dicas por aluno, definidas pelo professor */
  dicas: number;
  /** tags das missões da sala, para escolher o vocabulário */
  tags: string[];
  /** sala encerrada ou tempo esgotado */
  bloqueada?: boolean;
}

interface Salvo {
  vals: Record<string, string>;
  dicaCel: Record<string, true>;
  ajuda: Record<number, 1 | 2>;
  usadas: number;
}

const VAZIO: Salvo = { vals: {}, dicaCel: {}, ajuda: {}, usadas: 0 };
const k = (r: number, c: number) => `${r},${c}`;

function carregar(chave: string): Salvo {
  try {
    const raw = localStorage.getItem(chave);
    if (!raw) return VAZIO;
    const o = JSON.parse(raw) as Partial<Salvo>;
    return { vals: o.vals ?? {}, dicaCel: o.dicaCel ?? {}, ajuda: o.ajuda ?? {}, usadas: Number(o.usadas) || 0 };
  } catch {
    return VAZIO;
  }
}

/** Cruzadinha: ambiente de estudo do CTF. A grade é gerada no navegador a partir do vocabulário da disciplina da sala. */
export function Cruzadinha({ token, nome, dicas, tags, bloqueada = false }: Props) {
  const chave = `cruzadinha:${token}:${nome.trim().toLowerCase()}`;
  const tagsKey = tags.join('|');
  const grade = useMemo(() => {
    const banco: PalavraCruz[] = disciplinasDasTags(tagsKey ? tagsKey.split('|') : []).flatMap((d) => BANCO_CRUZADINHA[d]);
    return montarGrade(banco, hashTexto(token), 12);
  }, [token, tagsKey]);

  const [salvo, setSalvo] = useState<Salvo>(() => carregar(chave));
  const [sel, setSel] = useState<{ r: number; c: number; dir: Dir }>(() => {
    const p = [...grade.palavras].sort((a, b) => a.n - b.n)[0];
    return { r: p.r, c: p.c, dir: p.dir };
  });
  const [erradas, setErradas] = useState<Record<string, true>>({});
  const [aviso, setAviso] = useState('');
  const entrada = useRef<HTMLInputElement>(null);
  const avisoT = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      localStorage.setItem(chave, JSON.stringify(salvo));
    } catch {
      // armazenamento indisponível: o progresso fica só nesta sessão
    }
  }, [chave, salvo]);

  const info = useMemo(() => {
    const m = new Map<string, { ans: string; num: number; ids: Partial<Record<Dir, number>> }>();
    for (const p of grade.palavras) {
      p.celulas.forEach(([r, c], i) => {
        const o = m.get(k(r, c)) ?? { ans: p.palavra[i], num: 0, ids: {} };
        o.ids[p.dir] = p.id;
        if (i === 0) o.num = p.n;
        m.set(k(r, c), o);
      });
    }
    return m;
  }, [grade]);

  const feita = useCallback((p: PalavraGrade) => p.celulas.every(([r, c], i) => salvo.vals[k(r, c)] === p.palavra[i]), [salvo.vals]);
  const feitas = useMemo(() => new Set(grade.palavras.filter(feita).map((p) => p.id)), [grade, feita]);
  const xp = useMemo(
    () => grade.palavras.filter((p) => feitas.has(p.id)).reduce((a, p) => a + xpPalavra(p.palavra.length, (salvo.ajuda[p.id] ?? 0) as 0 | 1 | 2), 0),
    [grade, feitas, salvo.ajuda],
  );
  const restantes = Math.max(0, dicas - salvo.usadas);
  const completa = feitas.size === grade.palavras.length;

  const palavraAtual = useMemo(() => {
    const o = info.get(k(sel.r, sel.c));
    const id = o?.ids[sel.dir] ?? o?.ids[sel.dir === 'A' ? 'D' : 'A'];
    return grade.palavras.find((p) => p.id === id) ?? grade.palavras[0];
  }, [info, sel, grade]);

  const travada = (r: number, c: number) => {
    if (bloqueada) return true;
    if (salvo.dicaCel[k(r, c)]) return true;
    const o = info.get(k(r, c));
    return Object.values(o?.ids ?? {}).some((id) => feitas.has(id as number));
  };

  const dizer = (t: string) => {
    setAviso(t);
    window.clearTimeout(avisoT.current);
    avisoT.current = window.setTimeout(() => setAviso(''), 2200);
  };

  const selecionar = (r: number, c: number, alternar = false) => {
    const o = info.get(k(r, c));
    if (!o) return;
    let dir = sel.dir;
    if (alternar && sel.r === r && sel.c === c && o.ids.A !== undefined && o.ids.D !== undefined) dir = dir === 'A' ? 'D' : 'A';
    else if (o.ids[dir] === undefined) dir = dir === 'A' ? 'D' : 'A';
    setSel({ r, c, dir });
    entrada.current?.focus({ preventScroll: true });
  };

  const irPara = (p: PalavraGrade) => {
    const alvo = p.celulas.find(([r, c]) => !salvo.vals[k(r, c)]) ?? p.celulas[0];
    setSel({ r: alvo[0], c: alvo[1], dir: p.dir });
    entrada.current?.focus({ preventScroll: true });
  };

  const avancar = (voltar = false) => {
    const i = palavraAtual.celulas.findIndex(([r, c]) => r === sel.r && c === sel.c);
    const prox = palavraAtual.celulas[i + (voltar ? -1 : 1)];
    if (prox) setSel({ r: prox[0], c: prox[1], dir: palavraAtual.dir });
  };

  const digitar = (letra: string) => {
    if (bloqueada || completa) return;
    if (travada(sel.r, sel.c)) {
      avancar();
      return;
    }
    const chaveCel = k(sel.r, sel.c);
    setSalvo((s) => ({ ...s, vals: { ...s.vals, [chaveCel]: letra } }));
    avancar();
  };

  const apagar = () => {
    if (bloqueada || completa) return;
    const atual = k(sel.r, sel.c);
    if (salvo.vals[atual] && !travada(sel.r, sel.c)) {
      setSalvo((s) => {
        const vals = { ...s.vals };
        delete vals[atual];
        return { ...s, vals };
      });
      return;
    }
    const i = palavraAtual.celulas.findIndex(([r, c]) => r === sel.r && c === sel.c);
    const ant = palavraAtual.celulas[i - 1];
    if (!ant) return;
    setSel({ r: ant[0], c: ant[1], dir: palavraAtual.dir });
    if (!travada(ant[0], ant[1])) {
      setSalvo((s) => {
        const vals = { ...s.vals };
        delete vals[k(ant[0], ant[1])];
        return { ...s, vals };
      });
    }
  };

  const mover = (dr: number, dc: number) => {
    const r = sel.r + dr;
    const c = sel.c + dc;
    if (info.has(k(r, c))) selecionar(r, c);
  };

  const proximaPalavra = (voltar: boolean) => {
    const ord = [...grade.palavras].sort((a, b) => a.n - b.n || a.dir.localeCompare(b.dir));
    const i = ord.findIndex((p) => p.id === palavraAtual.id);
    irPara(ord[(i + (voltar ? -1 : 1) + ord.length) % ord.length]);
  };

  const aoTeclar = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    switch (e.key) {
      case 'Backspace': e.preventDefault(); apagar(); return;
      case 'ArrowRight': e.preventDefault(); mover(0, 1); return;
      case 'ArrowLeft': e.preventDefault(); mover(0, -1); return;
      case 'ArrowDown': e.preventDefault(); mover(1, 0); return;
      case 'ArrowUp': e.preventDefault(); mover(-1, 0); return;
      case 'Tab':
      case 'Enter': e.preventDefault(); proximaPalavra(e.shiftKey); return;
      default:
    }
  };

  const aoDigitar = (e: React.FormEvent<HTMLInputElement>) => {
    const v = e.currentTarget.value;
    e.currentTarget.value = '';
    const l = letraNormalizada(v.slice(-1));
    if (l) digitar(l);
  };

  const verificar = () => {
    const ruins: Record<string, true> = {};
    for (const [chaveCel, v] of Object.entries(salvo.vals)) {
      if (info.get(chaveCel)?.ans !== v && !salvo.dicaCel[chaveCel]) ruins[chaveCel] = true;
    }
    const n = Object.keys(ruins).length;
    if (n) {
      setErradas(ruins);
      window.setTimeout(() => setErradas({}), 1000);
      playSound('error', true);
      dizer(`${n} ${n === 1 ? 'letra errada' : 'letras erradas'}`);
    } else {
      dizer('Nenhuma letra errada até aqui.');
    }
  };

  const comDica = (fn: () => void) => {
    if (bloqueada || completa) return;
    if (restantes <= 0) {
      dizer(dicas === 0 ? 'O professor desativou as dicas.' : 'Suas dicas acabaram.');
      return;
    }
    fn();
  };

  const dicaLetra = () =>
    comDica(() => {
      const chaveCel = k(sel.r, sel.c);
      if (travada(sel.r, sel.c) || salvo.vals[chaveCel] === info.get(chaveCel)?.ans) {
        dizer('Escolha uma letra que ainda não foi resolvida.');
        return;
      }
      const o = info.get(chaveCel)!;
      setSalvo((s) => {
        const ajuda = { ...s.ajuda };
        for (const id of Object.values(o.ids) as number[]) ajuda[id] = Math.max(ajuda[id] ?? 0, 1) as 1 | 2;
        return { vals: { ...s.vals, [chaveCel]: o.ans }, dicaCel: { ...s.dicaCel, [chaveCel]: true }, ajuda, usadas: s.usadas + 1 };
      });
      avancar();
    });

  const dicaPalavra = () =>
    comDica(() => {
      if (feitas.has(palavraAtual.id)) {
        dizer('Essa palavra já está resolvida.');
        return;
      }
      setSalvo((s) => {
        const vals = { ...s.vals };
        const dicaCel = { ...s.dicaCel };
        const ajuda = { ...s.ajuda };
        for (const [r, c] of palavraAtual.celulas) {
          vals[k(r, c)] = info.get(k(r, c))!.ans;
          dicaCel[k(r, c)] = true;
          for (const id of Object.values(info.get(k(r, c))!.ids) as number[]) if (id !== palavraAtual.id) ajuda[id] = Math.max(ajuda[id] ?? 0, 1) as 1 | 2;
        }
        ajuda[palavraAtual.id] = 2;
        return { vals, dicaCel, ajuda, usadas: s.usadas + 1 };
      });
    });

  const apagarPalavra = () => {
    if (bloqueada || completa) return;
    setSalvo((s) => {
      const vals = { ...s.vals };
      for (const [r, c] of palavraAtual.celulas) if (!travada(r, c)) delete vals[k(r, c)];
      return { ...s, vals };
    });
  };

  const parabens = useRef(false);
  useEffect(() => {
    if (completa && !parabens.current) {
      parabens.current = true;
      playSound('success', true);
      try {
        confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 }, colors: ['#10b981', '#34d399', '#f59e0b', '#38bdf8'] });
      } catch {
        // ignore
      }
    }
  }, [completa]);

  const tamCelula = Math.min(44, Math.floor(640 / grade.w));
  const lista = (dir: Dir) => [...grade.palavras].filter((p) => p.dir === dir).sort((a, b) => a.n - b.n);

  return (
    <section className="bg-slate-900 border border-emerald-500/30 rounded-2xl overflow-hidden min-w-0" aria-label="Cruzadinha">
      <header className="px-4 py-3 flex flex-wrap items-center gap-2 border-b border-slate-800 bg-emerald-500/5">
        <Puzzle className="w-5 h-5 text-emerald-300" />
        <h3 className="font-black text-white">Cruzadinha</h3>
        <span className="text-xs text-slate-400 hidden sm:inline">Treino de vocabulário da disciplina. O XP daqui não entra no ranking.</span>
        <div className="ml-auto flex flex-wrap items-center gap-1.5 text-xs font-black">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200">{feitas.size}/{grade.palavras.length} palavras</span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300">{xp} XP</span>
          <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300" title="Dicas restantes (definidas pelo professor)">
            💡 {restantes}/{dicas}
          </span>
        </div>
      </header>

      <div className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-5 gap-4 min-w-0">
        <div className="lg:col-span-3 space-y-3 min-w-0">
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2" aria-live="polite">
            <div className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
              {palavraAtual.n} {palavraAtual.dir === 'A' ? 'Horizontal →' : 'Vertical ↓'} · {palavraAtual.palavra.length} letras
            </div>
            <div className="text-sm sm:text-base font-bold text-white">{palavraAtual.dica}</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-3 overflow-auto">
            <div
              role="grid"
              aria-label="Grade da cruzadinha"
              className="mx-auto grid gap-[2px]"
              style={{ gridTemplateColumns: `repeat(${grade.w}, minmax(0, 1fr))`, maxWidth: tamCelula * grade.w + grade.w * 2 }}
            >
              {Array.from({ length: grade.h }, (_, r) =>
                Array.from({ length: grade.w }, (_, c) => {
                  const o = info.get(k(r, c));
                  if (!o) return <div key={k(r, c)} aria-hidden="true" className="aspect-square" />;
                  const chaveCel = k(r, c);
                  const v = salvo.vals[chaveCel] ?? '';
                  const ativa = sel.r === r && sel.c === c;
                  const naPalavra = palavraAtual.celulas.some(([x, y]) => x === r && y === c);
                  const ok = Object.values(o.ids).some((id) => feitas.has(id as number));
                  const cor = erradas[chaveCel]
                    ? 'bg-rose-300 border-rose-500 text-rose-900'
                    : ativa
                      ? 'bg-emerald-300 border-emerald-600 text-emerald-950 ring-2 ring-emerald-400 z-10'
                      : salvo.dicaCel[chaveCel]
                        ? 'bg-sky-200 border-sky-500 text-sky-900'
                        : ok
                          ? 'bg-emerald-200 border-emerald-500 text-emerald-900'
                          : naPalavra
                            ? 'bg-emerald-100 border-emerald-400 text-slate-900'
                            : 'bg-slate-100 border-slate-400 text-slate-900';
                  return (
                    <button
                      key={chaveCel}
                      type="button"
                      role="gridcell"
                      aria-label={`Linha ${r + 1}, coluna ${c + 1}${o.num ? `, início da palavra ${o.num}` : ''}${v ? `, letra ${v}` : ', vazia'}`}
                      onClick={() => selecionar(r, c, true)}
                      className={`relative aspect-square rounded-[5px] border-[1.5px] font-black uppercase leading-none flex items-center justify-center transition-colors ${cor}`}
                      style={{ fontSize: `clamp(10px, min(3.6vw, ${tamCelula * 0.5}px), 22px)` }}
                    >
                      {o.num > 0 && <span className="absolute top-[1px] left-[3px] text-[9px] font-black text-slate-500 leading-none">{o.num}</span>}
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
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={verificar} disabled={bloqueada} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-black active:scale-[0.98] transition">
              <ShieldCheck className="w-4 h-4" /> Verificar
            </button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={dicaLetra} disabled={bloqueada || restantes <= 0} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-45 disabled:cursor-not-allowed text-slate-100 text-sm font-bold border border-slate-700 transition">
              <Lightbulb className="w-4 h-4 text-sky-300" /> Dica: letra
            </button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={dicaPalavra} disabled={bloqueada || restantes <= 0} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-45 disabled:cursor-not-allowed text-slate-100 text-sm font-bold border border-slate-700 transition">
              <Eye className="w-4 h-4 text-sky-300" /> Revelar palavra
            </button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={apagarPalavra} disabled={bloqueada} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-45 text-slate-100 text-sm font-bold border border-slate-700 transition">
              <Eraser className="w-4 h-4 text-slate-300" /> Apagar palavra
            </button>
          </div>
          <p className="text-[11px] text-slate-500 min-h-[1rem]" role="status">
            {aviso || (dicas > 0 ? `Cada dica gasta 1 das suas ${dicas}. Letra revelada vale metade do XP da palavra; palavra revelada vale 0.` : 'O professor desativou as dicas nesta sala.')}
          </p>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 min-w-0 content-start">
          {completa && (
            <div className="sm:col-span-2 lg:col-span-1 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-3 text-center">
              <Trophy className="w-8 h-8 mx-auto text-amber-400" />
              <p className="font-black text-white">Cruzadinha concluída!</p>
              <p className="text-sm text-amber-200">{xp} XP de treino</p>
            </div>
          )}
          {(['A', 'D'] as Dir[]).map((d) => (
            <div key={d} className="min-w-0">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">{d === 'A' ? 'Horizontais →' : 'Verticais ↓'}</h4>
              <ol className="space-y-1 max-h-72 overflow-auto pr-1">
                {lista(d).map((p) => {
                  const on = p.id === palavraAtual.id;
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
                          {p.dica} <em className="not-italic text-slate-500">({p.palavra.length})</em>
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
