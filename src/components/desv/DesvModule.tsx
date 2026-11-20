import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Code2, Database, KeyRound, Lightbulb, Loader2, LogOut, NotebookPen, RefreshCw, Search, Trophy, Users, XCircle } from 'lucide-react';
import { DESV_CASOS, DesvCaso, DesvCasoCodigo, DesvCasoLogica } from '../../data/desvCasos';
import { SqlConsole } from '../ctf/SqlConsole';
import { ctfCall } from '../../utils/ctfApi';
import { ModuleTabs } from '../common/ModuleShell';
import { useTurmaDaSala } from '../../utils/turmasApi';
import { CabineDupla } from '../turmas/CabineDupla';
import { FaixaCabine } from '../turmas/Papeis';

const K_GID = 'rali_desv_gid_v1';
const K_SESSAO = 'rali_desv_sessao_v1';
const K_DICAS = 'rali_desv_dicas_v1';

function lerLS(k: string): string {
  try {
    return localStorage.getItem(k) || '';
  } catch {
    return '';
  }
}
function gravarLS(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {
    // modo privado: segue sem guardar
  }
}
function gidDoAparelho(): string {
  let g = lerLS(K_GID);
  if (!/^[A-Za-z0-9_-]{8,40}$/.test(g)) {
    g = 'd' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    gravarLS(K_GID, g);
  }
  return g;
}
function dicasUsadas(): Record<string, number> {
  try {
    return JSON.parse(lerLS(K_DICAS) || '{}');
  } catch {
    return {};
  }
}
const msgErro = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  return /a[cç][aã]o desconhecida/i.test(m) ? 'O Desvendando precisa do Apps Script v31 publicado.' : m;
};

interface Sessao {
  token: string;
  nome: string;
  integrantes: string;
}
function lerSessao(): Sessao | null {
  try {
    const v = JSON.parse(lerLS(K_SESSAO) || 'null');
    return v && v.token ? v : null;
  } catch {
    return null;
  }
}
interface Estado {
  sala: { token: string; nome: string; status: string; casos: string[]; papeis?: '' | 'rodizio' | 'fixos' | 'dupla' };
  dupla: { nome: string; integrantes: string };
  resolvidos: Record<string, number>;
  ranking: { pos: number; nome: string; pontos: number; casos: number }[];
}
/** Token vindo do link do professor: #/desvendando/ABC234 */
const tokenDoLink = () => (typeof window === 'undefined' ? '' : (window.location.hash.match(/#\/desvendando\/([A-Za-z0-9]{4,8})/)?.[1] || '').toUpperCase());


const DISCIPLINAS = Array.from(new Set(DESV_CASOS.map((c) => c.disciplina)));

const NIVEL_COR: Record<DesvCaso['nivel'], string> = {
  Aquecimento: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  Intermediário: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  Detetive: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
  Mestre: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
};

/** Desvendando com Conhecimento: o professor cria a sala e libera os casos; as duplas entram com o token. */
export const DesvModule: React.FC = () => {
  const [gid, setGid] = useState(gidDoAparelho);
  const [sessao, setSessao] = useState<Sessao | null>(lerSessao);
  const [estado, setEstado] = useState<Estado | null>(null);
  const [erro, setErro] = useState('');
  const [aba, setAba] = useState<'casos' | 'ranking'>('casos');
  const [aberto, setAberto] = useState<DesvCaso | null>(null);

  const atualizar = useCallback(async () => {
    if (!sessao) return;
    try {
      setEstado(await ctfCall<Estado>('desvEstado', { token: sessao.token, gid }));
      setErro('');
    } catch (e) {
      const m = msgErro(e);
      if (/Entre na sala|não encontrada/i.test(m)) {
        // a sala sumiu ou o aparelho não está nela: volta para a entrada
        gravarLS(K_SESSAO, '');
        setSessao(null);
      }
      setErro(m);
    }
  }, [sessao, gid]);

  useEffect(() => {
    void atualizar();
    // casos liberados no meio da aula aparecem sozinhos (só com a aba visível)
    const t = window.setInterval(() => document.visibilityState === 'visible' && void atualizar(), 20000);
    const vis = () => document.visibilityState === 'visible' && void atualizar();
    document.addEventListener('visibilitychange', vis);
    return () => {
      window.clearInterval(t);
      document.removeEventListener('visibilitychange', vis);
    };
  }, [atualizar]);

  // Sair libera o computador: a próxima dupla começa do zero. Quem saiu volta escolhendo os mesmos nomes
  // (o servidor reconhece a formação e devolve os pontos).
  const sair = () => {
    gravarLS(K_SESSAO, '');
    gravarLS(K_GID, '');
    gravarLS(K_DICAS, '');
    setGid(gidDoAparelho());
    setSessao(null);
    setEstado(null);
    setAberto(null);
  };

  if (!sessao) {
    return (
      <EntradaDupla
        gid={gid}
        erroInicial={erro}
        onEntrou={(ses, est) => {
          gravarLS(K_SESSAO, JSON.stringify(ses));
          setSessao(ses);
          setEstado(est);
          setErro('');
        }}
      />
    );
  }

  if (!estado) {
    return (
      <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
        {erro ? <p className="text-sm text-amber-300">{erro}</p> : <Loader2 className="w-8 h-8 animate-spin text-violet-400" />}
        <span className="text-sm">Voltando para a sala {sessao.token}…</span>
        <button type="button" onClick={sair} className="text-xs font-bold text-slate-400 underline">Sair da sala</button>
      </div>
    );
  }

  const liberados = DESV_CASOS.filter((c) => estado.sala.casos.includes(c.id));
  const total = Object.values(estado.resolvidos).reduce((a, b) => a + b, 0);
  const encerrada = estado.sala.status !== 'aberta';

  if (aberto) {
    return (
      <DesvCasoView
        caso={aberto}
        gid={gid}
        token={sessao.token}
        resolvidoCom={estado.resolvidos[aberto.id]}
        onVoltar={() => {
          setAberto(null);
          void atualizar();
        }}
        onResolvido={(pts) => setEstado((e) => (e ? { ...e, resolvidos: { ...e.resolvidos, [aberto.id]: pts } } : e))}
      />
    );
  }

  const disciplinas = DISCIPLINAS.filter((d) => liberados.some((c) => c.disciplina === d));
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-white">{estado.dupla.nome}</p>
          <p className="truncate text-xs text-slate-400">
            Sala {estado.sala.nome} · token {estado.sala.token}
            {estado.dupla.integrantes ? ` · ${estado.dupla.integrantes}` : ''}
          </p>
        </div>
        <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-black text-amber-300">{total} pts</span>
        <button type="button" onClick={sair} className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-white" title="Sair da sala" aria-label="Sair da sala">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
      <div className="mb-4">
        <FaixaCabine
          nomes={estado.dupla.integrantes.split(',').map((x) => x.trim()).filter(Boolean)}
          modo={estado.sala.papeis || 'rodizio'}
          rodadaAuto={Object.keys(estado.resolvidos).length}
          chave={`desv_${estado.sala.token}_${gid}`}
        />
      </div>
      {encerrada && <p className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">O professor encerrou esta sala. Os casos ficam só para consulta.</p>}
      <ModuleTabs<'casos' | 'ranking'>
        accent="violet"
        label="Desvendando"
        value={aba}
        onChange={(v) => {
          setAba(v);
          void atualizar();
        }}
        tabs={[
          { id: 'casos', label: 'Casos', icon: <Search className="w-4 h-4" /> },
          { id: 'ranking', label: 'Ranking da sala', icon: <Trophy className="w-4 h-4" /> },
        ]}
      />
      {aba === 'casos' ? (
        liberados.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-700 p-8 text-center">
            <Loader2 className="mx-auto w-6 h-6 animate-spin text-violet-400" />
            <p className="mt-3 text-sm font-bold text-white">Aguardando o professor liberar os casos</p>
            <p className="mt-1 text-xs text-slate-400">A lista aparece sozinha assim que ele liberar.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {disciplinas.map((d) => (
              <section key={d} aria-label={d}>
                <h2 className="text-sm font-black uppercase tracking-wide text-slate-400">{d}</h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {liberados.filter((c) => c.disciplina === d).map((c) => (
                    <CartaoCaso key={c.id} caso={c} feito={estado.resolvidos[c.id]} onAbrir={() => setAberto(c)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )
      ) : (
        <RankingSala linhas={estado.ranking} minha={estado.dupla.nome} onAtualizar={atualizar} />
      )}
      <p className="mt-6 text-center text-xs text-slate-500">Inspirado nos enigmas do perfil @clube.enigma (Clube do Enigma).</p>
    </div>
  );
};

const CartaoCaso: React.FC<{ caso: DesvCaso; feito?: number; onAbrir: () => void }> = ({ caso: c, feito, onAbrir }) => (
  <button
    type="button"
    onClick={onAbrir}
    className="group text-left rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-violet-500/60 hover:bg-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
  >
    <div className="flex flex-wrap items-center gap-2">
      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${NIVEL_COR[c.nivel]}`}>{c.nivel}</span>
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-slate-700 text-slate-300 inline-flex items-center gap-1">
        {c.tipo === 'sql' ? <Database className="w-3 h-3" /> : c.tipo === 'codigo' ? <Code2 className="w-3 h-3" /> : <NotebookPen className="w-3 h-3" />}
        {c.tipo === 'sql' ? 'Investigação em SQL' : c.tipo === 'codigo' ? `Análise de ${c.linguagem}` : 'Lógica com pistas'}
      </span>
      <span className="ml-auto text-xs font-bold text-amber-300">{c.pontos} pts</span>
    </div>
    <h3 className="mt-3 text-xl font-black text-white">{c.titulo}</h3>
    <p className="mt-1 text-sm text-slate-400 leading-relaxed">{c.historia}</p>
    <p className="mt-3 text-xs font-semibold text-slate-400">{c.suspeitos.length} suspeitos</p>
    {feito !== undefined && (
      <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-300">
        <CheckCircle2 className="w-4 h-4" /> Resolvido · {feito} pts
      </p>
    )}
  </button>
);

/** Entrada da dupla: token do professor, nome da dupla e integrantes. */
const EntradaDupla: React.FC<{ gid: string; erroInicial: string; onEntrou: (s: Sessao, e: Estado) => void }> = ({ gid, erroInicial, onEntrou }) => {
  const [token, setToken] = useState(tokenDoLink);
  const [nome, setNome] = useState('');
  const [integrantes, setIntegrantes] = useState('');
  const turmaSala = useTurmaDaSala(token, gid);
  const [erro, setErro] = useState(erroInicial);
  const [busy, setBusy] = useState(false);
  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErro('');
    try {
      const ses = { token: token.trim().toUpperCase(), nome: nome.trim(), integrantes: integrantes.trim() };
      const est = await ctfCall<Estado>('desvEntrar', { ...ses, gid, ...(turmaSala ? { integrantes: ses.integrantes.split(',').map((x) => x.trim()).filter(Boolean) } : {}) });
      onEntrou({ ...ses, token: est.sala.token }, est);
    } catch (er) {
      setErro(msgErro(er));
    } finally {
      setBusy(false);
    }
  };
  const input = 'w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 outline-none';
  return (
    <div className="max-w-md mx-auto py-2">
      <form onSubmit={entrar} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="text-center space-y-1">
          <div className="mx-auto w-14 h-14 rounded-2xl border bg-violet-500/10 border-violet-500/30 flex items-center justify-center">
            <Users className="w-7 h-7 text-violet-300" />
          </div>
          <h2 className="text-2xl font-black text-white">Entrar com a dupla</h2>
          <p className="text-sm text-slate-400">Os casos são liberados pelo professor da sua turma.</p>
        </div>
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-violet-300" /> Token da sala
          </span>
          <input value={token} onChange={(e) => setToken(e.target.value.toUpperCase())} maxLength={8} autoCapitalize="characters" autoComplete="off" placeholder="ABC234" className={`${input} text-xl font-mono font-black tracking-[0.3em] text-center text-violet-200`} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Nome da dupla</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={30} autoComplete="off" placeholder="Ex.: Detetives do SQL" className={input} />
        </label>
        {turmaSala ? (
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Cabine da dupla <span className="font-normal normal-case text-slate-500">({turmaSala.nome})</span></span>
            <CabineDupla alunos={turmaSala.alunos} ocupados={turmaSala.ocupados} value={integrantes} onChange={setIntegrantes} />
          </div>
        ) : (
          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Integrantes</span>
            <input value={integrantes} onChange={(e) => setIntegrantes(e.target.value)} maxLength={120} autoComplete="off" placeholder="Ana Souza e Bruno Lima" className={input} />
          </label>
        )}
        {erro && <p className="text-sm text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3">{erro}</p>}
        <button
          type="submit"
          disabled={busy || token.trim().length < 4 || nome.trim().length < 2 || (!!turmaSala && integrantes.split(',').filter((x) => x.trim()).length < 2)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-base font-black text-white transition hover:bg-violet-500 disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          Entrar na sala
        </button>
      </form>
    </div>
  );
};

const RankingSala: React.FC<{ linhas: Estado['ranking']; minha: string; onAtualizar: () => void }> = ({ linhas, minha, onAtualizar }) => (
  <section className="mt-6 max-w-xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-5" aria-label="Ranking da sala">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-black text-white inline-flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-300" /> Ranking da sala
      </h2>
      <button type="button" onClick={onAtualizar} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white">
        <RefreshCw className="w-3.5 h-3.5" /> Atualizar
      </button>
    </div>
    {linhas.length === 0 ? (
      <p className="mt-3 text-sm text-slate-400">Nenhuma dupla desvendou um caso ainda. Sejam os primeiros!</p>
    ) : (
      <ol className="mt-4 space-y-1.5">
        {linhas.map((l) => (
          <li key={l.pos} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${l.nome === minha ? 'bg-violet-500/15 border border-violet-500/40' : 'bg-slate-950/60'}`}>
            <span className="w-6 text-right font-black text-slate-400">{l.pos}</span>
            <span className="flex-1 font-semibold text-white truncate">{l.nome}</span>
            <span className="text-xs text-slate-400">{l.casos} {l.casos === 1 ? 'caso' : 'casos'}</span>
            <span className="w-16 text-right font-black text-amber-300">{l.pontos}</span>
          </li>
        ))}
      </ol>
    )}
  </section>
);

interface CasoProps {
  caso: DesvCaso;
  gid: string;
  token: string;
  resolvidoCom?: number;
  onVoltar: () => void;
  onResolvido: (pontos: number) => void;
}

const DesvCasoView: React.FC<CasoProps> = ({ caso, gid, token, resolvidoCom, onVoltar, onResolvido }) => {
  const [dicas, setDicas] = useState(() => dicasUsadas()[caso.id] || 0);
  const [riscadas, setRiscadas] = useState<Set<number>>(new Set());
  const [notas, setNotas] = useState('');
  const [escolha, setEscolha] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState<{ correto: boolean; pontos?: number; erros?: number; valeAgora?: number; explicacao?: string } | null>(null);

  const verDica = () => {
    const n = Math.min(caso.dicas.length, dicas + 1);
    setDicas(n);
    const todas = dicasUsadas();
    todas[caso.id] = n;
    gravarLS(K_DICAS, JSON.stringify(todas));
  };

  const acusar = async () => {
    if (escolha === null) return;
    setEnviando(true);
    setErro('');
    try {
      const r = await ctfCall<{ correto: boolean; pontos?: number; erros?: number; valeAgora?: number; explicacao?: string }>('desvAcusar', {
        gid,
        token,
        caso: caso.id,
        suspeito: escolha,
        dicas,
      });
      setResultado(r);
      if (r.correto && typeof r.pontos === 'number') onResolvido(r.pontos);
    } catch (e) {
      setErro(msgErro(e));
    } finally {
      setEnviando(false);
    }
  };

  const nomeDe = (id: number) => caso.suspeitos.find((s) => s.id === id)?.nome || '';
  const valeSemErros = Math.max(20, caso.pontos - 10 * dicas);

  return (
    <article aria-labelledby="desv-titulo">
      <button type="button" onClick={onVoltar} className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Todos os casos
      </button>
      <div className="mt-4 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4 min-w-0">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${NIVEL_COR[caso.nivel]}`}>{caso.nivel}</span>
              <span className="ml-auto text-xs font-bold text-amber-300">até {caso.pontos} pts</span>
            </div>
            <h1 id="desv-titulo" className="mt-3 text-2xl font-black text-white">
              {caso.titulo}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{caso.historia}</p>
            <p className="mt-3 text-base font-bold text-violet-200">{caso.pergunta}</p>
          </section>

          {caso.tipo === 'codigo' && <CodigoSuspeitos caso={caso} />}
          {caso.tipo !== 'sql' ? (
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5" aria-label="Pistas">
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-400">Pistas</h2>
              <p className="mt-1 text-xs text-slate-500">Toque numa pista para riscar quando já tiver usado.</p>
              <ol className="mt-3 space-y-2">
                {caso.pistas.map((p, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      aria-pressed={riscadas.has(i)}
                      onClick={() =>
                        setRiscadas((r) => {
                          const n = new Set(r);
                          if (n.has(i)) n.delete(i);
                          else n.add(i);
                          return n;
                        })
                      }
                      className={`w-full text-left rounded-lg px-3 py-2 text-sm transition ${
                        riscadas.has(i) ? 'bg-slate-950/40 text-slate-500 line-through' : 'bg-slate-950/70 text-slate-200 hover:bg-slate-950'
                      }`}
                    >
                      <span className="font-black text-violet-300 mr-2">{i + 1}.</span>
                      {p}
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          ) : (
            <section className="space-y-3" aria-label="Banco do caso">
              <p className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
                Tabelas do caso: <b>{caso.tabelas}</b>. Explore cada uma com <code className="font-mono">SELECT * FROM nome_da_tabela;</code>
              </p>
              <SqlConsole key={caso.id} seed={caso.seed} seedNome="Banco do caso" />
            </section>
          )}
        </div>

        <div className="space-y-4 min-w-0">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5" aria-label="Caderno do detetive">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-400 inline-flex items-center gap-2">
              <NotebookPen className="w-4 h-4" /> Caderno do detetive
            </h2>
            {caso.tipo === 'logica' ? <GradeLogica caso={caso} /> : null}
            <label className="mt-3 block">
              <span className="sr-only">Anotações</span>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={caso.tipo === 'logica' ? 3 : 5}
                placeholder="Anote o que já descobriu..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
              />
            </label>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5" aria-label="Dicas">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-400 inline-flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-300" /> Dicas ({dicas}/{caso.dicas.length})
              </h2>
              {dicas < caso.dicas.length && resolvidoCom === undefined && (
                <button type="button" onClick={verDica} className="rounded-lg border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/10">
                  Ver dica (−10 pts)
                </button>
              )}
            </div>
            {dicas > 0 && (
              <ul className="mt-3 space-y-2">
                {caso.dicas.slice(0, dicas).map((d, i) => (
                  <li key={i} className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-violet-500/40 bg-violet-500/5 p-5" aria-label="Acusação">
            <h2 className="text-sm font-black uppercase tracking-wide text-violet-200">Acusação</h2>
            {resolvidoCom !== undefined && !resultado ? (
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4" /> Você já desvendou este caso ({resolvidoCom} pts).
              </p>
            ) : resultado?.correto ? (
              <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
                <p className="inline-flex items-center gap-2 text-base font-black text-emerald-200">
                  <CheckCircle2 className="w-5 h-5" /> Caso desvendado! +{resultado.pontos} pts
                </p>
                {resultado.explicacao && <p className="mt-2 text-sm leading-relaxed text-emerald-50">{resultado.explicacao}</p>}
              </div>
            ) : (
              <>
                <p className="mt-1 text-xs text-slate-400">
                  Vale agora: <b className="text-amber-300">{resultado?.valeAgora ?? valeSemErros} pts</b>. Cada acusação errada tira 15.
                </p>
                <fieldset className="mt-3 grid grid-cols-2 gap-2">
                  <legend className="sr-only">Escolha o suspeito</legend>
                  {caso.suspeitos.map((s) => (
                    <label
                      key={s.id}
                      className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        escolha === s.id ? 'border-violet-400 bg-violet-500/20 text-white' : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <input type="radio" name="suspeito" className="sr-only" checked={escolha === s.id} onChange={() => setEscolha(s.id)} />
                      {s.nome}
                    </label>
                  ))}
                </fieldset>
                {resultado && !resultado.correto && (
                  <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-rose-300">
                    <XCircle className="w-4 h-4" /> Não foi {nomeDe(escolha ?? 0) || 'essa pessoa'}. Releia as pistas.
                  </p>
                )}
                {erro && <p className="mt-3 text-sm text-amber-300">{erro}</p>}
                <button
                  type="button"
                  onClick={() => void acusar()}
                  disabled={escolha === null || enviando}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-black text-white transition hover:bg-violet-500 disabled:opacity-50"
                >
                  {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {escolha === null ? 'Escolha um suspeito' : `Acusar ${nomeDe(escolha)}`}
                </button>
              </>
            )}
          </section>
        </div>
      </div>
    </article>
  );
};

/** Grade de dedução: o aluno marca onde cada suspeito estava e com o quê (só anotação, nada é conferido aqui). */
const GradeLogica: React.FC<{ caso: DesvCasoLogica }> = ({ caso }) => {
  const [marcas, setMarcas] = useState<Record<string, string>>({});
  const sel = (chave: string, opcoes: string[], rotulo: string) => (
    <select
      aria-label={rotulo}
      value={marcas[chave] || ''}
      onChange={(e) => setMarcas((m) => ({ ...m, [chave]: e.target.value }))}
      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-200"
    >
      <option value="">?</option>
      {opcoes.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-400">
            <th className="py-1 pr-2 font-semibold">Suspeito</th>
            <th className="py-1 pr-2 font-semibold">Local</th>
            <th className="py-1 font-semibold">{caso.objetoRotulo}</th>
          </tr>
        </thead>
        <tbody>
          {caso.suspeitos.map((s) => (
            <tr key={s.id}>
              <td className="py-1 pr-2 font-bold text-white">{s.nome}</td>
              <td className="py-1 pr-2">{sel(`l${s.id}`, caso.locais, `Local de ${s.nome}`)}</td>
              <td className="py-1">{sel(`o${s.id}`, caso.objetos, `${caso.objetoRotulo} de ${s.nome}`)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/** Construção de Sites: o código comum e o trecho de cada suspeito, para ler e comparar. */
const CodigoSuspeitos: React.FC<{ caso: DesvCasoCodigo }> = ({ caso }) => (
  <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5" aria-label="Evidências dos suspeitos">
    <h2 className="text-sm font-black uppercase tracking-wide text-slate-400 inline-flex items-center gap-2">
      <Code2 className="w-4 h-4" /> Evidências dos suspeitos ({caso.linguagem})
    </h2>
    {caso.base && (
      <div className="mt-3">
        <p className="text-xs font-semibold text-slate-400">{caso.baseRotulo || 'Página onde o trecho entrou'}</p>
        <pre className="mt-1 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs leading-relaxed text-sky-200"><code>{caso.base}</code></pre>
      </div>
    )}
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {caso.suspeitos.map((s) => (
        <div key={s.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 min-w-0">
          <p className="text-xs font-black text-violet-300">{s.nome}</p>
          <pre className="mt-1 overflow-x-auto text-xs leading-relaxed text-slate-200"><code>{s.codigo}</code></pre>
        </div>
      ))}
    </div>
  </section>
);
