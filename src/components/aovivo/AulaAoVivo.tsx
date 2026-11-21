import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BookOpenCheck, Copy, Flag, Loader2, MonitorPlay, Power, Puzzle, Radio, RefreshCw, Search, Settings2, Trophy, Users, Check, X } from 'lucide-react';
import { BackPill } from '../common/ModuleShell';
import { AvisoServidor } from '../common/AvisoServidor';
import { Btn, QrImage } from '../common/ui';
import { TimerControl } from '../common/TimerControl';
import { RoomProjector } from '../rooms/RoomProjector';
import { ListaCasos, type EstadoProf } from '../desv/DesvPanel';
import { DESV_CASOS } from '../../data/desvCasos';
import { buildStudentLink, ctfCall, getCtfApiUrl, startPolling } from '../../utils/ctfApi';
import { getBancoKey } from '../../utils/bankApi';
import { MOTIVO_AJUDA, placar, precisamAjuda } from '../../utils/aoVivo';
import type { CtfTeacherView, RoomTipo } from '../../types/ctf';
import type { TimerOp } from '../../utils/timer';
import { Fogo } from '../common/Icones';

type Tipo = RoomTipo | 'desv';
interface SalaAberta {
  tipo: Tipo;
  token: string;
  nome: string;
  adminKey: string;
  criada: number;
}

const META: Record<Tipo, { nome: string; icone: React.ReactNode; cor: string; painel: string }> = {
  rali: { nome: 'Rali NFC', icone: <Radio className="h-4 w-4" />, cor: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10', painel: 'prof-rali' },
  ctf: { nome: 'CTF Online', icone: <Flag className="h-4 w-4" />, cor: 'text-orange-300 border-orange-500/40 bg-orange-500/10', painel: 'prof-ctf' },
  cruz: { nome: 'Cruzada', icone: <Puzzle className="h-4 w-4" />, cor: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10', painel: 'prof-cruz' },
  desv: { nome: 'Desvendando', icone: <Search className="h-4 w-4" />, cor: 'text-purple-300 border-purple-500/40 bg-purple-500/10', painel: 'prof-desv' },
};

const msgErro = (e: unknown) => (e instanceof Error ? e.message : String(e));
const linkDesv = (token: string) => `${window.location.origin}${window.location.pathname}#/desvendando/${token}`;

/**
 * Aula ao vivo: todas as salas abertas num só lugar. Escolhida a sala, a tela junta o que o professor usa durante
 * a aula: token e QR, cronômetro, telão, quem precisa de ajuda, ranking ao vivo, gabarito e encerrar.
 */
export const AulaAoVivo: React.FC<{ onBack: () => void; onAbrirPainel: (modulo: string) => void }> = ({ onBack, onAbrirPainel }) => {
  const [salas, setSalas] = useState<SalaAberta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sel, setSel] = useState('');

  const carregar = useCallback(async () => {
    const chave = getBancoKey();
    if (!chave) {
      setErro('Conecte a chave do banco para ver as salas abertas.');
      setCarregando(false);
      return;
    }
    setCarregando(true);
    try {
      const [ctf, desv] = await Promise.all([
        ctfCall<{ salas: { token: string; nome: string; tipo: RoomTipo; adminKey: string; status: string; criada: number }[] }>('salasList', { chave }),
        ctfCall<{ salas: { token: string; nome: string; adminKey: string; status: string; criada: number }[] }>('desvSalasList', { chave }).catch(() => ({ salas: [] })),
      ]);
      const abertas: SalaAberta[] = [
        ...ctf.salas.filter((s) => s.status === 'aberta').map((s) => ({ tipo: (s.tipo || 'ctf') as Tipo, token: s.token, nome: s.nome, adminKey: s.adminKey, criada: s.criada })),
        ...desv.salas.filter((s) => s.status === 'aberta').map((s) => ({ tipo: 'desv' as Tipo, token: s.token, nome: s.nome, adminKey: s.adminKey, criada: s.criada })),
      ].sort((a, b) => b.criada - a.criada);
      setSalas(abertas);
      setSel((atual) => (abertas.some((s) => s.token === atual) ? atual : abertas[0]?.token ?? ''));
      setErro('');
    } catch (e) {
      setErro(msgErro(e));
    } finally {
      setCarregando(false);
    }
  }, []);
  useEffect(() => {
    void carregar();
  }, [carregar]);

  const sala = salas.find((s) => s.token === sel) ?? null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-10 space-y-5">
      <header className="space-y-3">
        <BackPill onClick={onBack}>Painel do professor</BackPill>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Aula ao vivo</h1>
              <p className="text-sm text-slate-400">As salas abertas agora. Escolha uma para acompanhar a turma.</p>
            </div>
          </div>
          <Btn size="sm" icon={carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} disabled={carregando} onClick={() => void carregar()}>
            Atualizar salas
          </Btn>
        </div>
      </header>

      <AvisoServidor />
      {erro && <p className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-sm text-rose-300">{erro}</p>}

      {!carregando && !salas.length && !erro && (
        <section className="rounded-2xl border border-dashed border-slate-700 p-8 text-center">
          <p className="font-bold text-white">Nenhuma sala aberta agora.</p>
          <p className="mt-1 text-sm text-slate-400">Crie a sala da aula e ela aparece aqui.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {(['ctf', 'rali', 'cruz', 'desv'] as Tipo[]).map((t) => (
              <Btn key={t} size="sm" icon={META[t].icone} onClick={() => onAbrirPainel(META[t].painel)}>
                Criar sala de {META[t].nome}
              </Btn>
            ))}
          </div>
        </section>
      )}

      {salas.length > 0 && (
        <nav aria-label="Salas abertas" className="flex gap-2 overflow-x-auto pb-1">
          {salas.map((s) => (
            <button
              key={s.token}
              type="button"
              onClick={() => setSel(s.token)}
              aria-current={s.token === sel ? 'true' : undefined}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left transition ${s.token === sel ? META[s.tipo].cor + ' ring-2 ring-offset-0 ring-current' : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'}`}
            >
              <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider">
                {META[s.tipo].icone} {META[s.tipo].nome}
              </span>
              <span className="block max-w-[14rem] truncate text-sm font-bold text-white">{s.nome}</span>
              <span className="block font-mono text-xs text-slate-400">{s.token}</span>
            </button>
          ))}
        </nav>
      )}

      {sala && (sala.tipo === 'desv' ? <SalaDesv key={sala.token} sala={sala} onEncerrada={() => void carregar()} onAbrirPainel={onAbrirPainel} /> : <SalaJogo key={sala.token} sala={sala} onEncerrada={() => void carregar()} onAbrirPainel={onAbrirPainel} />)}
    </div>
  );
};

// ---------- Cartão de entrada (token, QR e link) ----------
const Entrada: React.FC<{ token: string; link: string; children?: React.ReactNode }> = ({ token, link, children }) => {
  const [copiado, setCopiado] = useState(false);
  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5" aria-label="Entrada na sala">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Token da sala</p>
        <p className="font-mono text-5xl font-black tracking-[0.18em] text-white">{token}</p>
      </div>
      <div className="flex justify-center rounded-xl bg-white p-3">
        <QrImage text={link} size={190} label={`QR code da sala ${token}`} />
      </div>
      <Btn
        size="sm"
        className="w-full"
        icon={<Copy className="w-4 h-4" />}
        onClick={() => {
          void navigator.clipboard?.writeText(link);
          setCopiado(true);
          window.setTimeout(() => setCopiado(false), 1800);
        }}
      >
        {copiado ? 'Link copiado' : 'Copiar link dos alunos'}
      </Btn>
      {children}
    </section>
  );
};

const Indicador: React.FC<{ rotulo: string; valor: string; detalhe?: string }> = ({ rotulo, valor, detalhe }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{rotulo}</p>
    <p className="mt-1 text-3xl font-black text-white">{valor}</p>
    {detalhe && <p className="text-xs text-slate-500">{detalhe}</p>}
  </div>
);

// ---------- Rali NFC, CTF e Cruzada ----------
const SalaJogo: React.FC<{ sala: SalaAberta; onEncerrada: () => void; onAbrirPainel: (m: string) => void }> = ({ sala, onEncerrada, onAbrirPainel }) => {
  const api = getCtfApiUrl();
  const tipo = sala.tipo as RoomTipo;
  const nfc = tipo === 'rali';
  const quem = nfc ? 'equipes' : 'alunos';
  const [view, setView] = useState<CtfTeacherView | null>(null);
  const [erro, setErro] = useState('');
  const [timerBusy, setTimerBusy] = useState(false);
  const [timerErro, setTimerErro] = useState('');
  const [acaoBusy, setAcaoBusy] = useState('');
  const [telao, setTelao] = useState(false);
  const [agora, setAgora] = useState(() => Date.now());

  const cred = useMemo(() => ({ token: sala.token, adminKey: sala.adminKey }), [sala.token, sala.adminKey]);
  const carregar = useCallback(async () => {
    try {
      setView(await ctfCall<CtfTeacherView>('teacherRoom', cred, api));
      setAgora(Date.now());
      setErro('');
    } catch (e) {
      setErro(msgErro(e));
    }
  }, [cred, api]);
  useEffect(() => {
    void carregar();
    return startPolling(() => void carregar(), 10_000, 2_000);
  }, [carregar]);

  const skewMs = view?.sala.agora ? Date.now() - view.sala.agora : 0;
  const total = view?.sala.total ?? 0;
  const p = useMemo(() => placar(view?.alunos ?? [], total), [view, total]);
  const ajuda = useMemo(() => precisamAjuda(view?.alunos ?? [], total, agora), [view, total, agora]);
  const room = { tipo, token: sala.token, nome: sala.nome, adminKey: sala.adminKey, api, criada: sala.criada };
  const link = buildStudentLink(sala.token, api, tipo);

  const timer = async (op: TimerOp, minutos?: number) => {
    if (op === 'off' && !window.confirm('Desligar o cronômetro? A sala fica sem limite de tempo.')) return;
    setTimerBusy(true);
    setTimerErro('');
    try {
      const r = await ctfCall<Pick<CtfTeacherView, 'sala'>>('setTimer', { ...cred, op, minutos }, api);
      setView((v) => (v ? { ...v, sala: r.sala } : v));
    } catch (e) {
      setTimerErro(msgErro(e));
    } finally {
      setTimerBusy(false);
    }
  };
  const gabarito = async () => {
    if (!view) return;
    setAcaoBusy('gabarito');
    try {
      const r = await ctfCall<Pick<CtfTeacherView, 'sala'>>('setDebriefing', { ...cred, liberado: !view.sala.debriefing }, api);
      setView((v) => (v ? { ...v, sala: r.sala } : v));
    } catch (e) {
      setErro(msgErro(e));
    } finally {
      setAcaoBusy('');
    }
  };
  const encerrar = async () => {
    if (!window.confirm(`Encerrar a sala "${sala.nome}"? As respostas são bloqueadas e o ranking vira o resultado final.`)) return;
    setAcaoBusy('encerrar');
    try {
      await ctfCall('setStatus', { ...cred, status: 'encerrada' }, api);
      onEncerrada();
    } catch (e) {
      setErro(msgErro(e));
      setAcaoBusy('');
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
      <div className="space-y-5">
        <Entrada token={sala.token} link={link}>
          <Btn variant="primary" className="w-full" icon={<MonitorPlay className="w-4 h-4" />} onClick={() => setTelao(true)}>
            Projetar telão
          </Btn>
        </Entrada>
        {tipo !== 'cruz' && <TimerControl timer={view?.sala.timer} skewMs={skewMs} busy={timerBusy || !view} error={timerErro} onOp={(op, m) => void timer(op, m)} />}
      </div>

      <div className="space-y-5">
        {erro && <p className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-sm text-rose-300">{erro}</p>}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Indicador rotulo={nfc ? 'Equipes' : 'Alunos'} valor={view ? String(p.jogando) : '…'} detalhe="na sala agora" />
          <Indicador rotulo="Acertos" valor={view ? String(p.acertos) : '…'} detalhe={tipo === 'cruz' ? 'palavras' : 'no total'} />
          <Indicador rotulo="Taxa de acerto" valor={p.taxa === null ? '—' : `${p.taxa}%`} detalhe="acertos ÷ tentativas" />
          <Indicador rotulo="Terminaram" valor={view ? `${p.terminaram}` : '…'} detalhe={`de ${p.jogando} · ${total} ${tipo === 'cruz' ? 'palavras' : 'perguntas'}`} />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900 p-4" aria-label="Precisam de ajuda">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-300">
              <AlertTriangle className="h-4 w-4 text-amber-300" /> Precisam de ajuda agora ({ajuda.length})
            </h2>
            {ajuda.length ? (
              <ul className="max-h-80 space-y-1.5 overflow-auto pr-1">
                {ajuda.map(({ aluno, motivos, minutos }) => (
                  <li key={aluno.nome} className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-slate-100">{aluno.nome}</span>
                      <span className="shrink-0 font-mono text-xs text-slate-400">
                        {aluno.acertos} <Check className="inline h-3 w-3" aria-label="acertos" /> · <span className="text-rose-300">{aluno.erros} <X className="inline h-3 w-3" aria-label="erros" /></span>
                      </span>
                    </div>
                    {nfc && aluno.integrantes && aluno.integrantes.length > 0 && <p className="truncate text-[11px] text-slate-500">{aluno.integrantes.join(', ')}</p>}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {motivos.map((m) => (
                        <span key={m} className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                          {m === 'parado' && minutos !== null ? `Sem acertar há ${minutos} min` : MOTIVO_AJUDA[m]}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-300">
                {view && p.jogando ? `Tudo andando: nenhum dos ${quem} travado.` : `Aguardando os ${quem} entrarem com o token.`}
              </p>
            )}
            <p className="text-[11px] text-slate-500">Entra aqui quem ainda não acertou e já errou 2 vezes, quem erra mais que o dobro do que acerta ou quem está há 8 min sem acertar.</p>
          </section>

          <section className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900 p-4" aria-label="Ranking ao vivo">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-300">
              <Trophy className="h-4 w-4 text-amber-300" /> Ranking ao vivo
            </h2>
            <ol className="max-h-80 space-y-1 overflow-auto pr-1">
              {(view?.alunos ?? []).slice(0, 15).map((a, i) => (
                <li key={a.nome} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm odd:bg-slate-950/50">
                  <span className="w-6 text-right font-mono text-xs text-slate-500">{i + 1}º</span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-slate-100">{a.nome}</span>
                  {a.fogos > 0 && <span className="text-xs text-orange-300"><Fogo />{a.fogos}</span>}
                  <span className="font-mono text-xs text-slate-400">{a.acertos}/{total}</span>
                  <span className="w-14 text-right font-mono font-bold text-emerald-300">{a.xp}</span>
                </li>
              ))}
              {view && !view.alunos.length && <li className="text-sm text-slate-500">Ninguém entrou ainda.</li>}
            </ol>
          </section>
        </div>

        <section className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-4" aria-label="Ações da sala">
          <Btn
            icon={acaoBusy === 'gabarito' ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpenCheck className="w-4 h-4" />}
            disabled={!view || !!acaoBusy}
            onClick={() => void gabarito()}
          >
            {view?.sala.debriefing ? 'Ocultar gabarito comentado' : 'Liberar gabarito comentado'}
          </Btn>
          <Btn variant="ghost" icon={<Settings2 className="w-4 h-4" />} onClick={() => onAbrirPainel(META[sala.tipo].painel)}>
            Painel completo da sala
          </Btn>
          <span className="flex-1" />
          <Btn
            className="!border-rose-500/50 !text-rose-300 hover:!bg-rose-500/10"
            icon={acaoBusy === 'encerrar' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
            disabled={!!acaoBusy}
            onClick={() => void encerrar()}
          >
            Encerrar sala
          </Btn>
        </section>
        <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Users className="h-3.5 w-3.5" /> Atualiza sozinho a cada 10 segundos.
        </p>
      </div>
      {telao && <RoomProjector room={room} tipo={tipo} inviteLink={link} onClose={() => setTelao(false)} />}
    </div>
  );
};

// ---------- Desvendando ----------
const SalaDesv: React.FC<{ sala: SalaAberta; onEncerrada: () => void; onAbrirPainel: (m: string) => void }> = ({ sala, onEncerrada, onAbrirPainel }) => {
  const [estado, setEstado] = useState<EstadoProf | null>(null);
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);
  const prof = useCallback(
    async (extra: Record<string, unknown> = {}) => {
      try {
        setEstado(await ctfCall<EstadoProf>('desvProf', { token: sala.token, adminKey: sala.adminKey, ...extra }));
        setErro('');
      } catch (e) {
        setErro(msgErro(e));
      }
    },
    [sala.token, sala.adminKey],
  );
  useEffect(() => {
    void prof();
    return startPolling(() => void prof(), 12_000, 2_000);
  }, [prof]);

  const alterna = (id: string) => {
    if (!estado) return;
    const atual = new Set(estado.sala.casos);
    if (atual.has(id)) atual.delete(id);
    else atual.add(id);
    const ordem = DESV_CASOS.map((c) => c.id).filter((c) => atual.has(c));
    setEstado({ ...estado, sala: { ...estado.sala, casos: ordem } });
    void prof({ op: 'casos', casos: ordem });
  };
  /** Marca ou desmarca uma disciplina inteira de uma vez (um só envio ao servidor) */
  const defineLote = (ids: string[], marcar: boolean) => {
    if (!estado) return;
    const atual = new Set(estado.sala.casos);
    ids.forEach((id) => (marcar ? atual.add(id) : atual.delete(id)));
    const ordem = DESV_CASOS.map((c) => c.id).filter((c) => atual.has(c));
    setEstado({ ...estado, sala: { ...estado.sala, casos: ordem } });
    void prof({ op: 'casos', casos: ordem });
  };
  const encerrar = async () => {
    if (!window.confirm(`Encerrar a sala "${sala.nome}"? As duplas não poderão mais acusar.`)) return;
    setBusy(true);
    await prof({ op: 'status', status: 'encerrada' });
    setBusy(false);
    onEncerrada();
  };
  const resolvidos = estado ? Object.values(estado.resolvidosPorCaso).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
      <Entrada token={sala.token} link={linkDesv(sala.token)} />
      <div className="space-y-5">
        {erro && <p className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-sm text-rose-300">{erro}</p>}
        <div className="grid grid-cols-3 gap-3">
          <Indicador rotulo="Duplas" valor={estado ? String(estado.duplas.length) : '…'} detalhe="na sala" />
          <Indicador rotulo="Casos liberados" valor={estado ? String(estado.sala.casos.length) : '…'} detalhe={`de ${DESV_CASOS.length}`} />
          <Indicador rotulo="Casos resolvidos" valor={estado ? String(resolvidos) : '…'} detalhe="somando as duplas" />
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <section className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900 p-4" aria-label="Liberar casos">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-300">Liberar casos</h2>
            {estado ? <ListaCasos marcados={new Set(estado.sala.casos)} onAlternar={alterna} onLote={defineLote} resolvidos={estado.resolvidosPorCaso} /> : <Loader2 className="h-5 w-5 animate-spin text-slate-500" />}
          </section>
          <section className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900 p-4" aria-label="Ranking da sala">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-300">
              <Trophy className="h-4 w-4 text-amber-300" /> Ranking dos detetives
            </h2>
            <ol className="space-y-1">
              {(estado?.ranking ?? []).slice(0, 15).map((r) => (
                <li key={r.pos + r.nome} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm odd:bg-slate-950/50">
                  <span className="w-6 text-right font-mono text-xs text-slate-500">{r.pos}º</span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-slate-100">{r.nome}</span>
                  <span className="font-mono text-xs text-slate-400">{r.casos} caso(s)</span>
                  <span className="w-12 text-right font-mono font-bold text-emerald-300">{r.pontos}</span>
                </li>
              ))}
              {estado && !estado.ranking.length && <li className="text-sm text-slate-500">Ninguém desvendou um caso ainda.</li>}
            </ol>
          </section>
        </div>
        <section className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-4" aria-label="Ações da sala">
          <Btn variant="ghost" icon={<Settings2 className="w-4 h-4" />} onClick={() => onAbrirPainel('prof-desv')}>
            Painel completo da sala
          </Btn>
          <span className="flex-1" />
          <Btn className="!border-rose-500/50 !text-rose-300 hover:!bg-rose-500/10" icon={busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />} disabled={busy} onClick={() => void encerrar()}>
            Encerrar sala
          </Btn>
        </section>
      </div>
    </div>
  );
};
