import React, { useCallback, useEffect, useState } from 'react';
import { GrupoSelecao, alternaNoConjunto } from '../common/GrupoSelecao';
import { CheckCircle2, Copy, Loader2, Lock, Plus, RefreshCw, Search, Trash2, Trophy, Unlock, Users } from 'lucide-react';
import { DESV_CASOS } from '../../data/desvCasos';
import { ctfCall, getCtfApiUrl } from '../../utils/ctfApi';
import { getBancoKey } from '../../utils/bankApi';
import { BackPill } from '../common/ModuleShell';
import { SeletorTurma } from '../turmas/SeletorTurma';
import { SeletorPapeis, type ModoPapeis } from '../turmas/Papeis';
import { useTurmas } from '../../utils/turmasApi';
import { Btn, QrImage, StepTitle } from '../common/ui';

const K_SALAS = 'rali_desv_salas_prof_v1';
interface SalaGuardada {
  token: string;
  adminKey: string;
  nome: string;
  criada: number;
}
export interface EstadoProf {
  sala: { token: string; nome: string; status: string; casos: string[] };
  duplas: { nome: string; integrantes: string }[];
  resolvidosPorCaso: Record<string, number>;
  ranking: { pos: number; nome: string; pontos: number; casos: number }[];
}
const lerSalas = (): SalaGuardada[] => {
  try {
    return JSON.parse(localStorage.getItem(K_SALAS) || '[]');
  } catch {
    return [];
  }
};
const gravarSalas = (v: SalaGuardada[]) => {
  try {
    localStorage.setItem(K_SALAS, JSON.stringify(v));
  } catch {
    // modo privado
  }
};
const DISCIPLINAS = Array.from(new Set(DESV_CASOS.map((c) => c.disciplina)));
const msgErro = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  return /a[cç][aã]o desconhecida/i.test(m) ? 'Publique o Apps Script v31 para usar as salas do Desvendando.' : m;
};
const linkAluno = (token: string) => `${window.location.origin}${window.location.pathname}#/desvendando/${token}`;

/** Painel do professor: cria a sala da turma, libera os casos (as duplas só veem o que foi liberado) e acompanha o ranking. */
export const DesvPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [salas, setSalas] = useState<SalaGuardada[]>(lerSalas);
  const [ativa, setAtiva] = useState<string>(() => lerSalas()[0]?.token || '');
  const [nome, setNome] = useState('');
  const turmas = useTurmas();
  const [turmaId, setTurmaId] = useState('');
  const [papeis, setPapeis] = useState<ModoPapeis>('rodizio');
  const [novos, setNovos] = useState<Set<string>>(new Set());
  const [estado, setEstado] = useState<EstadoProf | null>(null);
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);
  const sala = salas.find((s) => s.token === ativa) || null;
  const [sync, setSync] = useState('');
  const [syncBusy, setSyncBusy] = useState(false);

  // Traz do servidor as salas criadas em outros aparelhos (precisa da chave do banco conectada neste aparelho)
  const sincronizar = useCallback(async (silencioso = false) => {
    const chave = getBancoKey();
    if (!chave) {
      if (!silencioso) setSync('Conecte a chave do banco (Professor → Banco de perguntas) para trazer as salas criadas em outros aparelhos.');
      return;
    }
    setSyncBusy(true);
    try {
      const r = await ctfCall<{ salas: { token: string; adminKey: string; nome: string; criada: number }[] }>('desvSalasList', { chave });
      setSalas((atuais) => {
        const tem = new Set(atuais.map((x) => x.token));
        const novas = r.salas.filter((x) => !tem.has(x.token)).map((x) => ({ token: x.token, adminKey: x.adminKey, nome: x.nome, criada: x.criada }));
        const lista = [...atuais, ...novas].sort((a, b) => b.criada - a.criada);
        gravarSalas(lista);
        if (!silencioso) setSync(novas.length ? `${novas.length} sala(s) trazida(s) do servidor.` : 'Suas salas já estão em dia com o servidor.');
        return lista;
      });
      setAtiva((a) => a || r.salas[0]?.token || '');
    } catch (e) {
      if (!silencioso) setSync(msgErro(e));
    } finally {
      setSyncBusy(false);
    }
  }, []);
  useEffect(() => {
    void sincronizar(true);
  }, [sincronizar]);

  const prof = useCallback(
    async (extra: Record<string, unknown> = {}) => {
      if (!sala) return;
      try {
        setEstado(await ctfCall<EstadoProf>('desvProf', { token: sala.token, adminKey: sala.adminKey, ...extra }));
        setErro('');
      } catch (e) {
        setErro(msgErro(e));
      }
    },
    [sala]
  );

  useEffect(() => {
    setEstado(null);
    void prof();
    const t = window.setInterval(() => document.visibilityState === 'visible' && void prof(), 15000);
    return () => window.clearInterval(t);
  }, [prof]);

  const criar = async () => {
    setBusy(true);
    setErro('');
    try {
      const r = await ctfCall<{ token: string; adminKey: string }>('createDesvRoom', { nome: nome.trim() || `Desvendando ${new Date().toLocaleDateString('pt-BR')}`, casos: [...novos], papeis, ...(turmaId ? { turma: turmaId } : {}) });
      const nova = { token: r.token, adminKey: r.adminKey, nome: nome.trim() || `Desvendando ${new Date().toLocaleDateString('pt-BR')}`, criada: Date.now() };
      const lista = [nova, ...salas];
      gravarSalas(lista);
      setSalas(lista);
      setAtiva(nova.token);
      setNome('');
      setNovos(new Set());
    } catch (e) {
      setErro(msgErro(e));
    } finally {
      setBusy(false);
    }
  };

  const alternaCaso = (id: string) => {
    if (!estado) return;
    const atual = new Set(estado.sala.casos);
    if (atual.has(id)) atual.delete(id);
    else atual.add(id);
    const ordem = DESV_CASOS.map((c) => c.id).filter((c) => atual.has(c));
    setEstado({ ...estado, sala: { ...estado.sala, casos: ordem } });
    void prof({ op: 'casos', casos: ordem });
  };

  /** Marca ou desmarca vários casos de uma vez (uma disciplina inteira): um só envio ao servidor */
  const defineCasos = (ids: string[], marcar: boolean) => {
    if (!estado) return;
    const atual = new Set(estado.sala.casos);
    ids.forEach((id) => (marcar ? atual.add(id) : atual.delete(id)));
    const ordem = DESV_CASOS.map((c) => c.id).filter((c) => atual.has(c));
    setEstado({ ...estado, sala: { ...estado.sala, casos: ordem } });
    void prof({ op: 'casos', casos: ordem });
  };

  const apagarDeVez = async (sala: { token: string; adminKey: string; nome: string }) => {
    if (!window.confirm(`Apagar “${sala.nome}” de vez?\n\nA sala, as duplas e os pontos dela somem da planilha. Não dá para desfazer.`)) return;
    try {
      await ctfCall('desvApagar', { token: sala.token, adminKey: sala.adminKey });
    } catch (e) {
      const m = msgErro(e);
      if (/desconhecida/i.test(m)) return setErro('O servidor ainda não sabe apagar salas do Desvendando. Publique a versão nova do Apps Script.');
      if (!/n[aã]o encontrad/i.test(m)) return setErro(m);
    }
    tirarDaLista(sala.token);
  };

  const tirarDaLista = (token: string) => {
    const lista = salas.filter((s) => s.token !== token);
    gravarSalas(lista);
    setSalas(lista);
    if (ativa === token) setAtiva(lista[0]?.token || '');
  };

  const marcaNovo = (id: string) =>
    setNovos((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const defineNovos = (ids: string[], marcar: boolean) =>
    setNovos((s) => {
      const n = new Set(s);
      ids.forEach((id) => (marcar ? n.add(id) : n.delete(id)));
      return n;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-10 space-y-6">
      <header className="space-y-3">
        <BackPill onClick={onBack}>Painel do professor</BackPill>
        <div className="hub-faixa flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl border flex items-center justify-center bg-violet-500/10 border-violet-500/30 text-violet-300">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black italic leading-none tracking-tight text-white">Desvendando · painel do professor</h1>
            <p className="text-sm text-slate-400 max-w-2xl">Crie uma sala por turma e libere os casos na hora da aula. As duplas só veem os casos liberados da própria sala.</p>
          </div>
        </div>
      </header>

      {!getCtfApiUrl() && <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">Configure o servidor (Apps Script) no painel do professor antes de criar salas.</p>}
      {erro && <p className="rounded-xl border border-rose-500/40 bg-rose-950/50 p-3 text-sm text-rose-200">{erro}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <StepTitle n={1} title="Nova sala" hint="Uma por turma. Você pode liberar mais casos depois." />
          <label className="block space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Nome da sala</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} placeholder="Ex.: 2º B · Banco de Dados" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500" />
          <SeletorPapeis value={papeis} onChange={setPapeis} semPapeis={false} />
          </label>
          <SeletorTurma turmas={turmas} value={turmaId} onChange={setTurmaId} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500" />
          <ListaCasos marcados={novos} onAlternar={marcaNovo} onLote={defineNovos} />
          <Btn variant="primary" className="w-full !bg-violet-600 hover:!bg-violet-500 !border-violet-600" disabled={busy} onClick={() => void criar()} icon={busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}>
            Criar sala {novos.size ? `com ${novos.size} caso(s) liberado(s)` : '(liberar casos depois)'}
          </Btn>
          <div className="space-y-2 border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Minhas salas</p>
              <Btn size="sm" variant="ghost" disabled={syncBusy} onClick={() => void sincronizar()} icon={syncBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}>
                Trazer do servidor
              </Btn>
            </div>
            {sync && <p className="text-xs text-slate-400">{sync}</p>}
            {salas.length === 0 && <p className="text-xs text-slate-500">Nenhuma sala ainda.</p>}
              {salas.map((s) => (
                <div key={s.token} className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${s.token === ativa ? 'border-violet-500/60 bg-violet-500/10' : 'border-slate-800 bg-slate-950/50'}`}>
                  <button type="button" onClick={() => setAtiva(s.token)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-bold text-white">{s.nome}</p>
                    <p className="font-mono text-xs text-slate-400">{s.token}</p>
                  </button>
                  <button type="button" onClick={() => void apagarDeVez(s)} aria-label={`Apagar ${s.nome} de vez`} title="Apagar de vez (sala, duplas e pontos saem da planilha)" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5" aria-label="Sala ao vivo">
          {!sala ? (
            <p className="text-sm text-slate-400">Crie uma sala para começar.</p>
          ) : !estado ? (
            <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
          ) : (
            <>
              <StepTitle n={2} title={estado.sala.nome} hint={estado.sala.status === 'aberta' ? 'Sala aberta: as duplas entram com o token ou o QR.' : 'Sala encerrada: ninguém entra nem acusa.'} />
              <div className="flex flex-wrap items-center gap-4">
                <QrImage text={linkAluno(estado.sala.token)} size={120} label={`QR da sala ${estado.sala.token}`} />
                <div className="space-y-2">
                  <p className="font-mono text-4xl font-black tracking-[0.25em] text-violet-200">{estado.sala.token}</p>
                  <div className="flex flex-wrap gap-2">
                    <Btn size="sm" icon={<Copy className="w-3.5 h-3.5" />} onClick={() => void navigator.clipboard?.writeText(linkAluno(estado.sala.token))}>Copiar link</Btn>
                    {estado.sala.status === 'aberta' ? (
                      <Btn size="sm" variant="danger" icon={<Lock className="w-3.5 h-3.5" />} onClick={() => void prof({ op: 'status', status: 'encerrada' })}>Encerrar sala</Btn>
                    ) : (
                      <Btn size="sm" variant="primary" icon={<Unlock className="w-3.5 h-3.5" />} onClick={() => void prof({ op: 'status', status: 'aberta' })}>Reabrir sala</Btn>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <StepTitle n={3} title="Casos liberados" hint="Marque para liberar e desmarque para esconder. As duplas veem a mudança em até 20 segundos." />
                <div className="mt-3">
                  <ListaCasos marcados={new Set(estado.sala.casos)} onAlternar={alternaCaso} onLote={defineCasos} resolvidos={estado.resolvidosPorCaso} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400"><Users className="w-3.5 h-3.5" /> Duplas na sala ({estado.duplas.length})</p>
                  <ul className="max-h-56 space-y-1 overflow-auto text-sm">
                    {estado.duplas.map((d, i) => (
                      <li key={i} className="rounded-lg bg-slate-950/60 px-3 py-1.5">
                        <span className="font-semibold text-white">{d.nome}</span>
                        {d.integrantes && <span className="block text-xs text-slate-400">{d.integrantes}</span>}
                      </li>
                    ))}
                    {!estado.duplas.length && <li className="text-xs text-slate-500">Nenhuma dupla entrou ainda.</li>}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400"><Trophy className="w-3.5 h-3.5 text-amber-300" /> Ranking</p>
                  <ol className="max-h-56 space-y-1 overflow-auto text-sm">
                    {estado.ranking.map((r) => (
                      <li key={r.pos} className="flex items-center gap-2 rounded-lg bg-slate-950/60 px-3 py-1.5">
                        <span className="w-5 text-right font-black text-slate-400">{r.pos}</span>
                        <span className="flex-1 truncate font-semibold text-white">{r.nome}</span>
                        <span className="text-xs text-slate-400">{r.casos}</span>
                        <span className="w-12 text-right font-black text-amber-300">{r.pontos}</span>
                      </li>
                    ))}
                    {!estado.ranking.length && <li className="text-xs text-slate-500">Ninguém desvendou um caso ainda.</li>}
                  </ol>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

/**
 * Casos agrupados por disciplina, cada grupo recolhido: a caixa do grupo libera todos os casos dele de uma vez
 * e o contador mostra quantos estão marcados (e quantas duplas já resolveram, no ao vivo).
 */
export const ListaCasos: React.FC<{
  marcados: Set<string>;
  onAlternar: (id: string) => void;
  onLote: (ids: string[], marcar: boolean) => void;
  resolvidos?: Record<string, number>;
}> = ({ marcados, onAlternar, onLote, resolvidos }) => {
  const [abertas, setAbertas] = useState<Set<string>>(new Set());
  return (
    <div className="space-y-2" role="tree" aria-label="Casos por disciplina">
      {DISCIPLINAS.map((d) => {
        const casos = DESV_CASOS.filter((c) => c.disciplina === d);
        const sel = casos.filter((c) => marcados.has(c.id)).length;
        const feitos = resolvidos ? casos.reduce((n, c) => n + (resolvidos[c.id] || 0), 0) : 0;
        return (
          <GrupoSelecao
            key={d}
            nivel="disciplina"
            cor="violet"
            titulo={d}
            marcados={sel}
            total={casos.length}
            aberto={abertas.has(d)}
            onAlternarAberto={() => setAbertas(alternaNoConjunto(abertas, d))}
            onMarcarTudo={() => onLote(casos.map((c) => c.id), sel !== casos.length)}
            rotuloMarcar={`Liberar todos os casos de ${d}`}
            extra={feitos > 0 ? <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300"><CheckCircle2 className="w-3.5 h-3.5" />{feitos}</span> : undefined}
          >
            <div className="space-y-1.5">
              {casos.map((c) => (
                <label key={c.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${marcados.has(c.id) ? 'border-violet-500/60 bg-violet-500/10' : 'border-slate-800 bg-slate-950/50 hover:border-slate-600'}`}>
                  <input type="checkbox" checked={marcados.has(c.id)} onChange={() => onAlternar(c.id)} className="h-4 w-4 accent-violet-500" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-white">{c.titulo}</span>
                    <span className="text-xs text-slate-400">{c.nivel} · {c.pontos} pts</span>
                  </span>
                  {resolvidos && (resolvidos[c.id] || 0) > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300"><CheckCircle2 className="w-3.5 h-3.5" />{resolvidos[c.id]}</span>
                  )}
                </label>
              ))}
            </div>
          </GrupoSelecao>
        );
      })}
    </div>
  );
};
