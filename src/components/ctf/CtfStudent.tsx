import { registrarXpJogo } from '../../utils/xpHub';
import { AvisoPerfilHub, BotaoEntrarHub, usePerfilHub } from '../common/PerfilHub';
import { lerPerfilHub, nomeNaLista } from '../../utils/perfilHub';
import { useSalaPublica } from '../../utils/turmasApi';
import { marcarUso, sessaoParada } from '../../utils/sessaoUso';
import { ConfirmaQuem } from '../common/ConfirmaQuem';
import { CabineDupla } from '../turmas/CabineDupla';
import { FaixaCabine } from '../turmas/Papeis';
import { BuscaNome } from '../turmas/BuscaNome';
import { AvatarCapacete, SeletorAvatar, listaAvatares, useAvatar, useAvataresDupla } from '../turmas/Avatares';
import { StudentDebrief } from '../rooms/StudentDebrief';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Download, Flag, HelpCircle, KeyRound, Loader2, Lock, LogOut, Puzzle, Send, Trophy, XCircle, Flame, TriangleAlert, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Bandeira, CapturaFlag, Captura } from '../common/Bandeira';
import type { CruzEstado, CtfState } from '../../types/ctf';
import type { CruzApi } from './Cruzadinha';
import {
  clearStudentSession,
  ctfCall, startPolling,
  getCtfApiUrl,
  getStudentSession,
  getChave,
  saveChave,
  parseCtfHash,
  saveCtfApiUrl,
  saveStudentSession,
} from '../../utils/ctfApi';
import { playSound } from '../../utils/audio';
import { BANCO_CTF_SQL } from '../../utils/sqlSeed';
import { SqlConsole } from './SqlConsole';
import { Top5Board } from './Top5Board';
import { CtfChallenges } from './CtfChallenges';
import { TimerDisplay, useCountdown } from '../common/TimerDisplay';
import { RankChip, StudentBar, XpChip } from '../common/StudentBar';
import { LinuxTerminal } from './LinuxTerminal';
import { LabInformatica } from './LabInformatica';
import { AtelieWeb } from './AtelieWeb';
import { Cruzadinha } from './Cruzadinha';
import { QuemRodada } from '../quem/QuemRodada';
import { StatusBanner } from '../common/StatusBanner';
import { applyServerTheme, useTheme } from '../../utils/theme';
import { FinalPodium, useCelebrate } from '../common/FinalPodium';
import { Fogo, Selo } from '../common/Icones';


const ACENTO = {
  ctf: {
    icone: 'bg-orange-500/15 border-orange-500/40', texto: 'text-orange-400', token: 'text-orange-300',
    foco: 'focus:ring-orange-500', botao: 'bg-orange-600 hover:bg-orange-500', spin: 'text-orange-400',
  },
  cruz: {
    icone: 'bg-cyan-500/15 border-cyan-500/40', texto: 'text-cyan-400', token: 'text-cyan-300',
    foco: 'focus:ring-cyan-500', botao: 'bg-cyan-600 hover:bg-cyan-500', spin: 'text-cyan-400',
  },
  quem: {
    icone: 'bg-rose-500/15 border-rose-500/40', texto: 'text-rose-400', token: 'text-rose-300',
    foco: 'focus:ring-rose-500', botao: 'bg-rose-600 hover:bg-rose-500', spin: 'text-rose-400',
  },
} as const;

type Modulo = keyof typeof ACENTO;
const NOME_MODULO: Record<Modulo, string> = { ctf: 'CTF Online', cruz: 'Cruzada Online', quem: 'Quem sou eu?' };
/** Ambiente a que a sala pertence: cada token só abre no seu ambiente. */
const moduloDaSala = (sala: { ordem?: string; tipo?: string }): Modulo => (sala.ordem === 'cruzadinha' ? 'cruz' : sala.tipo === 'quem' ? 'quem' : 'ctf');
const avisoAmbiente = (daSala: Modulo) => `Este token é de uma sala do ${NOME_MODULO[daSala]}. Abra o ${NOME_MODULO[daSala]} na tela inicial.`;

/**
 * Sala de aula do aluno. `modulo` diz em qual ambiente ele entrou: o CTF Online só abre salas de CTF e a
 * Cruzada Online só abre salas de Cruzada (cada token pertence a um ambiente).
 */
export const CtfStudent: React.FC<{ modulo?: Modulo }> = ({ modulo = 'ctf' }) => {
  const ac = ACENTO[modulo];
  const link = useRef(parseCtfHash());
  const [session, setSession] = useState(getStudentSession);
  const [conferir, setConferir] = useState(() => !!getStudentSession() && sessaoParada('ctf'));
  const [token, setToken] = useState(() => link.current.token || '');
  const salaInfo = useSalaPublica(token);
  const turmaSala = salaInfo?.turma ?? null;
  const papeisSala = modulo === 'ctf' ? salaInfo?.papeis ?? '' : '';
  const [cabine, setCabine] = useState('');
  const [retomando, setRetomando] = useState(false);
  const [avatar, setAvatar] = useAvatar();
  const [avatares, setAvatarDupla] = useAvataresDupla();
  const perfilHub = usePerfilHub();
  const [nome, setNome] = useState(() => lerPerfilHub()?.nome ?? '');
  const [state, setState] = useState<CtfState | null>(null);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [captura, setCaptura] = useState<Captura | null>(null);
  const answerRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!perfilHub) return;
    if (turmaSala) {
      const n = nomeNaLista(perfilHub, turmaSala.alunos);
      setNome((v) => (!v || v === perfilHub.nome ? n : v));
    } else setNome(perfilHub.nome);
  }, [perfilHub, turmaSala]);

  // Link de convite traz a URL do backend: guarda para recarregar a página sem perder
  useEffect(() => {
    if (link.current.api) saveCtfApiUrl(link.current.api);
  }, []);

  const refresh = useCallback(async () => {
    if (!session) return;
    try {
      const s = await ctfCall<CtfState>('state', { token: session.token, nome: session.nome });
      setState(s);
      setError('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/nao encontrad|não encontrad/i.test(msg)) {
        clearStudentSession();
        setSession(null);
        setState(null);
      }
      setError(msg);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    refresh();
    return startPolling(refresh);
  }, [session, refresh]);

  // Sessão salva de outro ambiente (ex.: token de CTF aberto na Cruzada): volta para a entrada com o aviso.
  // XP desta sala vai para as Conquistas do HUB
  useEffect(() => {
    if (!state?.aluno) return;
    registrarXpJogo(state.sala.token ?? token, { tipo: moduloDaSala(state.sala), sala: state.sala.nome, xp: state.aluno.xp, acertos: state.aluno.acertos });
  }, [state?.aluno?.xp, state?.aluno?.acertos]); // eslint-disable-line react-hooks/exhaustive-deps
  const salaModulo = state ? moduloDaSala(state.sala) : null;
  const ambienteErrado = Boolean(salaModulo) && salaModulo !== modulo;
  useEffect(() => {
    if (!ambienteErrado) return;
    clearStudentSession();
    setSession(null);
    setState(null);
    if (salaModulo) setError(avisoAmbiente(salaModulo));
  }, [ambienteErrado, salaModulo]);

  // Cronômetro da sala: conta no aparelho a partir do fim informado pelo servidor
  const timer = state?.sala.timer ?? null;
  const skewMs = useMemo(() => (state?.sala.agora ? Date.now() - state.sala.agora : 0), [state]);
  const { seconds, phase } = useCountdown(timer, skewMs);
  const theme = useTheme();
  useCelebrate(state?.sala.status === 'encerrada' || (Boolean(timer) && phase === 'fim'));
  useEffect(() => {
    applyServerTheme(state?.sala.tema);
  }, [state?.sala.tema]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const dupla = cabine.split(',').map((x) => x.trim()).filter(Boolean);
      const quem = papeisSala ? dupla[0] ?? '' : nome;
      const s = await ctfCall<CtfState>('join', { token: token.trim(), nome: quem, chave: getChave(token, quem), ...(papeisSala ? (dupla.length && avatares.slice(0, dupla.length).some(Boolean) ? { avatar: avatares.slice(0, dupla.length).join(',') } : {}) : avatar ? { avatar } : {}), ...(retomando && !papeisSala ? { retomar: true } : {}), ...(papeisSala ? { integrantes: dupla.slice(1) } : {}) });
      if (moduloDaSala(s.sala) !== modulo) throw new Error(avisoAmbiente(moduloDaSala(s.sala)));
      const next = { token: s.sala.token, nome: s.aluno.nome };
      saveChave(token, quem, (s as { chave?: string }).chave);
      saveStudentSession(next);
      setSession(next);
      setState(s);
      setFeedback(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !answer.trim()) return;
    setBusy(true);
    setError('');
    try {
      const s = await ctfCall<CtfState>('submit', { token: session.token, nome: session.nome, resposta: answer });
      setState(s);
      if (s.correto) {
        playSound('success', true);
        const fogo = s.premio?.isFogo;
        try {
          confetti({
            particleCount: fogo ? 160 : 50,
            spread: fogo ? 100 : 70,
            origin: { y: 0.6 },
            colors: fogo ? ['#f97316', '#ef4444', '#f59e0b', '#fde047'] : ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
          });
        } catch {
          // ignore
        }
        const xp = s.premio?.xp ?? 0;
        setCaptura({ id: Date.now(), xp, fogo, detalhe: s.aluno.concluido ? 'última flag!' : `Fase ${s.aluno.fase} desbloqueada` });
        setFeedback({
          ok: true,
          text: fogo
            ? `Primeiro a resolver! +${xp} XP. Fase ${s.aluno.concluido ? 'final concluída' : s.aluno.fase + ' desbloqueada'}!`
            : `Correto! +${xp} XP.${s.aluno.concluido ? ' Você concluiu todas as fases!' : ` Fase ${s.aluno.fase} desbloqueada.`}`,
        });
        setAnswer('');
        setTimeout(() => answerRef.current?.focus(), 50);
      } else {
        playSound('error', true);
        setFeedback({ ok: false, text: 'Resposta incorreta. Releia a pergunta e tente de novo.' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (state && !conferir) marcarUso('ctf');
  }, [state, conferir]);

  const handleLeave = () => {
    setConferir(false);
    clearStudentSession();
    setSession(null);
    setState(null);
    setFeedback(null);
    setAnswer('');
  };

  const downloadSql = () => {
    const blob = new Blob([BANCO_CTF_SQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'banco_rali.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Retomando sessão salva ----------
  if (session && !state && !error) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-slate-400 flex flex-col items-center gap-3">
        <Loader2 className={`w-8 h-8 animate-spin ${ac.spin}`} />
        <span className="text-sm">Voltando para a sala {session.token}…</span>
      </div>
    );
  }

  // ---------- Entrada na sala ----------
  if (!session || !state) {
    const hasApi = !!getCtfApiUrl();
    return (
      <div className="max-w-md mx-auto py-2">
        <form onSubmit={handleJoin} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="text-center space-y-1">
            <div className={`mx-auto w-14 h-14 rounded-2xl border flex items-center justify-center ${ac.icone}`}>
              {modulo === 'cruz' ? <Puzzle className={`w-7 h-7 ${ac.texto}`} /> : modulo === 'quem' ? <HelpCircle className={`w-7 h-7 ${ac.texto}`} /> : <Flag className={`w-7 h-7 ${ac.texto}`} />}
            </div>
            <h2 className="text-2xl font-black text-white">{modulo === 'cruz' ? 'Entrar na Cruzada Online' : modulo === 'quem' ? 'Entrar no Quem sou eu?' : 'Entrar no CTF Online'}</h2>
            <p className="text-sm text-slate-400">Digite o token da sala e escolha o seu nome na lista da turma.</p>
          </div>

          {!hasApi && (
            <div className="rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs p-3">
              Este navegador ainda não conhece o servidor. Abra o <strong>link de convite</strong> enviado pelo professor.
            </div>
          )}

          {perfilHub && <AvisoPerfilHub perfil={perfilHub} onNaoSou={() => setNome('')} />}

          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <KeyRound className={`w-3.5 h-3.5 ${ac.texto}`} /> Token da sala
            </span>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              maxLength={8}
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="ABC234"
              className={`w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xl font-mono font-black tracking-[0.3em] text-center placeholder-slate-700 focus:ring-2 outline-none ${ac.token} ${ac.foco}`}
            />
          </label>

          {papeisSala ? (
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Cabine da dupla{turmaSala ? ` · ${turmaSala.nome}` : ''}</span>
              <CabineDupla alunos={turmaSala?.alunos ?? null} ocupados={turmaSala?.ocupados.filter((n) => !getChave(token, n)) ?? []} value={cabine} onChange={setCabine} avatares={avatares} onAvatar={setAvatarDupla} />
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Cabine do piloto{turmaSala ? ` · ${turmaSala.nome}` : ''}</span>
              <div className={`flex items-center gap-3 rounded-xl border p-3 ${nome.trim().length >= 2 ? 'border-amber-400/50 bg-amber-400/5' : 'border-slate-800 bg-slate-950'}`}>
                <AvatarCapacete id={avatar} size={88} />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-amber-300">Piloto</p>
                  {turmaSala ? (
                    <BuscaNome alunos={turmaSala.alunos} ocupados={turmaSala.ocupados.filter((n) => !getChave(token, n))} value={nome} onChange={(n) => { setNome(n); setRetomando(false); }} onRetomar={(n) => { setNome(n); setRetomando(true); }} retomando={retomando} foco={ac.foco} />
                  ) : token.trim().length < 6 ? (
                    <p className="text-sm text-slate-400">Digite o token da sala para aparecer a lista da sua turma.</p>
                  ) : (
                    <>
                      {!salaInfo && <p className="text-xs text-slate-500">Procurando a turma da sala…</p>}
                      <input
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        readOnly={!!perfilHub && !!salaInfo}
                        maxLength={60}
                        autoComplete="off"
                        placeholder="Digite o seu nome"
                        className={`w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base text-white placeholder-slate-500 outline-none focus:ring-2 ${ac.foco}`}
                      />
                    </>
                  )}
                </div>
              </div>
              <span className="block text-xs text-slate-400">Escolha o seu capacete</span>
              <SeletorAvatar value={avatar} onChange={setAvatar} foco={ac.foco} />
            </div>
          )}

          {error && <p className="text-sm text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3">{error}</p>}

          <button
            type="submit"
            disabled={busy || token.trim().length < 4 || (papeisSala ? cabine.split(',').filter((x) => x.trim().length >= 2).length < 2 : nome.trim().length < 2)}
            className={`w-full py-3.5 rounded-xl font-black text-base ${ac.botao} disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 transition active:scale-[0.98]`}
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : modulo === 'cruz' ? <Puzzle className="w-5 h-5" /> : modulo === 'quem' ? <HelpCircle className="w-5 h-5" /> : <Flag className="w-5 h-5" />}
            ENTRAR NA SALA
          </button>
          <p className="text-[11px] text-center text-slate-500">
            Voltar depois com o mesmo nome continua de onde você parou.
          </p>
        </form>
      </div>
    );
  }

  // ---------- Computador do laboratório: sessão parada desde outra aula ----------
  if (conferir) {
    const quem = [state.aluno.nome, ...(state.aluno.integrantes ?? [])];
    return (
      <ConfirmaQuem
        pergunta={quem.length > 1 ? <>Vocês são {quem.join(' e ')}?</> : <>Você é {quem[0]}?</>}
        detalhe={`Sala ${state.sala.nome} · ${state.aluno.xp} XP`}
        outro={quem.length > 1 ? 'Somos outra dupla' : 'Sou outra pessoa'}
        botao={ac.botao}
        onContinuar={() => setConferir(false)}
        onOutro={handleLeave}
      />
    );
  }

  // ---------- Jogo ----------
  // Cruzadinha: o servidor confere as palavras e entrega as dicas; as respostas atualizam o XP e o ranking.
  const cruzCall = async (acao: string, extra: Record<string, unknown> = {}) => {
    const s = await ctfCall<CtfState & { cruz: CruzEstado }>(acao, { token: session.token, nome: session.nome, ...extra });
    setState(s);
    return s.cruz;
  };
  const cruzApi: CruzApi = {
    estado: () => cruzCall('cruzState'),
    conferir: (id, tentativa) => cruzCall('cruzCheck', { id, tentativa }),
    dica: (tipo, id, indice) => cruzCall('cruzHint', { tipo, id, indice }),
  };
  const { sala, aluno, missao, ranking } = state;
  const closed = sala.status === 'encerrada';
  const timeUp = Boolean(timer) && phase === 'fim';
  const waiting = Boolean(timer) && phase === 'parado';
  const locked = closed || timeUp || waiting;
  const livre = sala.ordem === 'livre' && Boolean(state.missoes);
  const phases = Array.from({ length: sala.total }, (_, i) => i + 1);
  const finished = closed || timeUp;
  // O Laboratório de Informática aparece sozinho quando a sala tem missões de Informática Básica.
  const tagsSala = [state.missao?.tag_id, ...(state.missoes ?? []).map((m) => m.tag_id)].map((t) => String(t || '').toLowerCase());
  const temLab = tagsSala.some((t) => t.startsWith('info_'));
  // O Ateliê Web aparece quando a sala tem missões de Construção de Sites 1.
  const temAtelie = tagsSala.some((t) => t.startsWith('web_'));

  const barra = (
    <StudentBar
      module={moduloDaSala(sala)}
      context={sala.nome}
      name={aluno.nome}
      avatar={aluno.avatar}
    >
      <TimerDisplay timer={timer} seconds={seconds} phase={phase} size="chip" />
      <XpChip xp={aluno.xp} />
      {aluno.fogos > 0 && (
        <span className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300 font-black inline-flex items-center gap-1"><Fogo /> x{aluno.fogos}</span>
      )}
      <RankChip pos={aluno.posicao} total={state.total_alunos} />
      <button onClick={handleLeave} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800" title="Sair da sala" aria-label="Sair da sala">
        <LogOut className="w-4 h-4" />
      </button>
    </StudentBar>
  );
  const avisos = (
    <>

      {sala.papeis && (
        <FaixaCabine
          nomes={[aluno.nome, ...(aluno.integrantes ?? (state as unknown as { equipe?: { integrantes?: string[] } }).equipe?.integrantes ?? [])]}
          modo={sala.papeis}
          rodadaAuto={aluno.acertos}
          chave={`ctf_${sala.token}_${aluno.nome}`}
          avatares={listaAvatares(aluno.avatar || avatares.join(','))}
        />
      )}
      {closed && <StatusBanner>A sala foi encerrada pelo professor. Veja o ranking final abaixo.</StatusBanner>}
      {!closed && timeUp && <StatusBanner>Tempo esgotado! As respostas foram bloqueadas. Veja o ranking final abaixo.</StatusBanner>}
      {!closed && waiting && <StatusBanner tone="warn">O cronômetro está parado. Aguarde o professor iniciar para enviar respostas.</StatusBanner>}
    </>
  );

  // Sala só de Cruzadinha: o aluno entra direto na grade; o ranking conta as palavras acertadas.
  if (sala.ordem === 'cruzadinha') {
    return (
      <div className="space-y-5">
        {barra}
        {avisos}
        {finished && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8">
            <FinalPodium rows={ranking} totalFases={sala.total} unit="palavras" entity="alunos" me={aluno.nome} />
            <p className="mt-4 text-center text-sm text-slate-400">
              Você: <strong className="text-white">{aluno.posicao}º lugar</strong> • {aluno.xp} XP
            </p>
          </div>
        )}
        <Cruzadinha token={sala.token} nome={aluno.nome} versao={sala.cruzadinha_versao} bloqueada={locked} api={cruzApi} />
        <StudentDebrief token={sala.token} liberado={Boolean(sala.debriefing)} quem="alunos" accent="orange" />
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Top 5
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              {state.total_alunos} {state.total_alunos === 1 ? 'aluno' : 'alunos'}
            </span>
          </div>
          <Top5Board
            rows={ranking}
            totalFases={sala.total}
            me={aluno.nome}
            mine={{ nome: aluno.nome, xp: aluno.xp, fase: aluno.acertos, fogos: aluno.fogos, posicao: aluno.posicao }}
            unit="palavras"
            variant={theme === 'claro' ? 'bars' : 'podium'}
          />
          <p className="text-[11px] text-slate-500">Atualiza sozinho a cada poucos segundos.</p>
        </div>
      </div>
    );
  }

  // Quem sou eu?: rodadas de dicas, uma por vez; o ranking conta o XP de cada conceito descoberto.
  if (sala.tipo === 'quem') {
    return (
      <div className="space-y-5">
        {barra}
        {avisos}
        {finished && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8">
            <FinalPodium rows={ranking} totalFases={sala.total} unit="fases" entity="alunos" me={aluno.nome} />
            <p className="mt-4 text-center text-sm text-slate-400">
              Você: <strong className="text-white">{aluno.posicao}º lugar</strong> • {aluno.xp} XP
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <QuemRodada state={state} session={session} locked={locked} onState={setState} />
            <StudentDebrief token={sala.token} liberado={Boolean(sala.debriefing)} quem="alunos" accent="orange" />
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 h-fit">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Top 5
              </h3>
              <span className="text-[11px] font-mono text-slate-500">{state.total_alunos} {state.total_alunos === 1 ? 'aluno' : 'alunos'}</span>
            </div>
            <Top5Board
              rows={ranking}
              totalFases={sala.total}
              me={aluno.nome}
              mine={{ nome: aluno.nome, xp: aluno.xp, fase: aluno.fase, fogos: aluno.fogos, posicao: aluno.posicao }}
              unit="fases"
              variant={theme === 'claro' ? 'bars' : 'podium'}
            />
            <p className="text-[11px] text-slate-500">Atualiza sozinho a cada poucos segundos.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {barra}
      {avisos}

      {sala.terminal && <LinuxTerminal />}
      {temLab && <LabInformatica />}
      {temAtelie && <AtelieWeb />}
      <StudentDebrief token={sala.token} liberado={Boolean(sala.debriefing)} quem="alunos" accent="orange" />

      {captura && <CapturaFlag captura={captura} onDone={() => setCaptura(null)} />}

      {/* Progresso */}
      {livre ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Escolha os desafios na ordem que quiser</span>
            <span className="inline-flex items-center gap-1">
              <Bandeira estado="capturada" className="h-4 w-4" /> {aluno.acertos} de {sala.total} flags
            </span>
          </div>
          <div
            className="h-2.5 rounded-full bg-slate-800 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={sala.total}
            aria-valuenow={aluno.acertos}
            aria-label="Desafios resolvidos"
          >
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${sala.total ? Math.min(100, (aluno.acertos / sala.total) * 100) : 0}%` }} />
          </div>
        </div>
      ) : (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
          <span>
            Fase {Math.min(aluno.fase, sala.total)} de {sala.total}
          </span>
          <span className="inline-flex items-center gap-1"><Bandeira estado="capturada" className="h-4 w-4" /> {aluno.acertos} {aluno.acertos === 1 ? 'flag' : 'flags'}</span>
        </div>
        <div className="flex flex-wrap items-end gap-1.5" role="list" aria-label={`Fase ${aluno.fase} de ${sala.total}`}>
          {phases.map((n) => (
            <span key={n} role="listitem" className="inline-flex">
              <Bandeira
                estado={n < aluno.fase || aluno.concluido ? 'capturada' : n === aluno.fase ? 'atual' : 'bloqueada'}
                className="h-6 w-6"
                title={n < aluno.fase || aluno.concluido ? `Fase ${n}: flag capturada` : n === aluno.fase ? `Fase ${n}: flag da vez` : `Fase ${n}: bloqueada`}
              />
            </span>
          ))}
        </div>
      </div>
      )}

      {finished && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8">
          <FinalPodium rows={ranking} totalFases={sala.total} unit={livre ? 'desafios' : 'fases'} entity="alunos" me={aluno.nome} />
          <p className="mt-4 text-center text-sm text-slate-400">
            Você: <strong className="text-white">{aluno.posicao}º lugar</strong> • {aluno.xp} XP
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Missão atual */}
        <div className="lg:col-span-2 space-y-4">
          {livre ? (
            <CtfChallenges state={state} session={session} locked={locked} onState={setState} />
          ) : aluno.concluido || !missao ? (
            <div className="bg-gradient-to-b from-amber-950/40 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-8 text-center space-y-3">
              <Trophy className="w-14 h-14 mx-auto text-amber-400" />
              <h3 className="text-2xl font-black text-white">Todas as fases concluídas!</h3>
              <p className="text-slate-300">
                Você fechou o CTF com <strong className="text-amber-300">{aluno.xp} XP</strong> e está em <strong className="text-amber-300">#{aluno.posicao}</strong> no ranking.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-lg bg-orange-500/15 border border-orange-500/40 text-orange-300 font-mono font-black">Fase {missao.fase}</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">{missao.categoria}</span>
                  <span className="text-slate-500 hidden sm:inline">{missao.pacote}</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-black">
                  +{missao.xp_atual} XP
                  {missao.xp_atual !== missao.xp_base && <span className="ml-1.5 text-[11px] text-amber-300/60 line-through">{missao.xp_base}</span>}
                </div>
              </div>

              {sala.modo === 'ctf_dynamic' && (
                <div
                  className={`rounded-xl border px-4 py-2.5 text-sm font-bold ${
                    missao.capturas_anteriores === 0 ? 'bg-orange-950/70 border-orange-500/60 text-orange-200' : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <span className="flex items-center gap-3">{missao.capturas_anteriores === 0 ? <Selo tom="laranja" tamanho="sm"><Flame /></Selo> : <Selo tom="ambar" tamanho="sm"><TriangleAlert /></Selo>}<span>{missao.capturas_anteriores === 0
                    ? `FLAG INTACTA! Ninguém resolveu ainda: vale ${missao.xp_atual} XP!`
                    : `${missao.capturas_anteriores} ${missao.capturas_anteriores === 1 ? 'aluno já resolveu' : 'alunos já resolveram'}: vale ${missao.xp_atual} XP agora.`}</span></span>
                </div>
              )}

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Desafio</div>
                <p className="text-base sm:text-lg font-bold text-white leading-relaxed whitespace-pre-wrap">{missao.pergunta}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {missao.opcoes && missao.opcoes.length > 0 ? (
                  <fieldset disabled={busy || locked} className="space-y-2">
                    <legend className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Escolha a alternativa correta</legend>
                    {missao.opcoes.map((o) => (
                      <label
                        key={o}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-base cursor-pointer transition ${
                          answer === o ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500'
                        }`}
                      >
                        <input type="radio" name="ctf-opcao" value={o} checked={answer === o} onChange={() => setAnswer(o)} className="h-4 w-4 accent-orange-500" />
                        <span>{o}</span>
                      </label>
                    ))}
                  </fieldset>
                ) : (
                  <>
                    <label htmlFor="ctf-resposta" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Sua resposta
                    </label>
                    <input
                      id="ctf-resposta"
                      ref={answerRef}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={busy || locked}
                      autoComplete="off"
                      autoCapitalize="none"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </>
                )}
                <button
                  type="submit"
                  disabled={busy || locked || !answer.trim()}
                  className="w-full py-3.5 rounded-xl font-black bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 transition active:scale-[0.98]"
                >
                  {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  ENVIAR E AVANÇAR DE FASE
                </button>
              </form>
            </div>
          )}

          {feedback && (
            <div
              role="status"
              className={`p-4 rounded-xl border flex items-start gap-3 text-sm font-semibold ${
                feedback.ok ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' : 'bg-rose-950/80 border-rose-500 text-rose-200'
              }`}
            >
              {feedback.ok ? <Selo tom="verde"><Check /></Selo> : <Selo tom="vermelho"><X /></Selo>}
              <span>{feedback.text}</span>
            </div>
          )}
          {error && <p className="text-sm text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3">{error}</p>}

          {sala.banco && <SqlConsole />}


          {sala.banco && (
            <button onClick={downloadSql} className="text-xs font-semibold text-sky-300 hover:text-sky-200 underline flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Baixar o banco de dados (banco_rali.sql) para rodar no seu SQLite
            </button>
          )}
        </div>

        {/* Ranking */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 h-fit">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Top 5
            </h3>
            <span className="text-[11px] font-mono text-slate-500">{state.total_alunos} {state.total_alunos === 1 ? 'aluno' : 'alunos'}</span>
          </div>
          <Top5Board
            rows={ranking}
            totalFases={sala.total}
            me={aluno.nome}
            mine={{ nome: aluno.nome, xp: aluno.xp, fase: livre ? aluno.acertos : aluno.fase, fogos: aluno.fogos, posicao: aluno.posicao }}
            unit={livre ? 'desafios' : 'fases'}
            variant={theme === 'claro' ? 'bars' : 'podium'}
          />
          <p className="text-[11px] text-slate-500">Atualiza sozinho a cada poucos segundos.</p>
        </div>
      </div>
    </div>
  );
};
