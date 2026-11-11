import { StudentDebrief } from '../rooms/StudentDebrief';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, KeyRound, Loader2, LogOut, Radio, Send, Trophy, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RaliState, RaliTagInfo } from '../../types/ctf';
import { clearRaliSession, getChave, saveChave, ctfCall, startPolling, getCtfApiUrl, getRaliSession, parseCtfHash, saveCtfApiUrl, saveRaliSession } from '../../utils/ctfApi';
import { playSound } from '../../utils/audio';
import { Top5Board } from '../ctf/Top5Board';
import { TimerDisplay, useCountdown } from '../common/TimerDisplay';
import { RankChip, StudentBar, XpChip } from '../common/StudentBar';
import { StatusBanner } from '../common/StatusBanner';
import { FinalPodium, useCelebrate } from '../common/FinalPodium';
import { Btn } from '../common/ui';
import { applyServerTheme, useTheme } from '../../utils/theme';
import { LinuxTerminal } from '../ctf/LinuxTerminal';
import { parseTagFromLocation } from '../../utils/tagLink';


interface Props {
  /** etiqueta lida por NFC/QR (#/tag/tag_07) */
  pendingTag?: { tag: string; nonce: number } | null;
  onTagConsumed?: () => void;
}

export const RaliStudent: React.FC<Props> = ({ pendingTag, onTagConsumed }) => {
  const link = useRef(parseCtfHash());
  const [session, setSession] = useState(getRaliSession);
  const [token, setToken] = useState(() => link.current.token || '');
  const [nome, setNome] = useState('');
  const [integrantes, setIntegrantes] = useState('');
  const [state, setState] = useState<RaliState | null>(null);
  const [open, setOpen] = useState<RaliTagInfo | null>(null);
  const [code, setCode] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [tagWanted, setTagWanted] = useState<string | null>(() => pendingTag?.tag ?? parseTagFromLocation(window.location.hash, window.location.search));

  useEffect(() => {
    if (link.current.api) saveCtfApiUrl(link.current.api);
  }, []);
  useEffect(() => {
    if (pendingTag?.tag) setTagWanted(pendingTag.tag);
  }, [pendingTag]);

  const refresh = useCallback(async () => {
    if (!session) return;
    try {
      const s = await ctfCall<RaliState>('state', { token: session.token, nome: session.nome });
      setState(s);
      setError('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/nao encontrad|não encontrad/i.test(msg)) {
        clearRaliSession();
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

  const timer = state?.sala.timer ?? null;
  const skewMs = useMemo(() => (state?.sala.agora ? Date.now() - state.sala.agora : 0), [state]);
  const { seconds, phase } = useCountdown(timer, skewMs);
  const theme = useTheme();
  useEffect(() => {
    applyServerTheme(state?.sala.tema);
  }, [state?.sala.tema]);

  const closed = state?.sala.status === 'encerrada';
  const timeUp = Boolean(timer) && phase === 'fim';
  const waiting = Boolean(timer) && phase === 'parado';
  const finished = Boolean(state) && (closed || timeUp);
  const locked = finished || waiting;
  useCelebrate(finished);

  const openTag = useCallback(
    async (tag: string) => {
      if (!session) return;
      setBusy(true);
      setError('');
      setFeedback(null);
      try {
        const info = await ctfCall<RaliTagInfo>('raliTag', { token: session.token, nome: session.nome, tag_id: tag.trim().toLowerCase() });
        setOpen(info);
        setAnswer('');
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(false);
      }
    },
    [session]
  );

  // Etiqueta lida antes ou depois de entrar na sala: abre a missão assim que a equipe estiver na sala
  useEffect(() => {
    if (tagWanted && session && state) {
      setTagWanted(null);
      onTagConsumed?.();
      openTag(tagWanted);
    }
  }, [tagWanted, session, state, openTag, onTagConsumed]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const members = integrantes.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
      const s = await ctfCall<RaliState>('join', { token: token.trim(), nome, integrantes: members, chave: getChave(token, nome) });
      if (!('missoes' in s)) throw new Error('Esta sala é do CTF Online. Abra o CTF Online para entrar.');
      const next = { token: s.sala.token, nome: s.equipe.nome };
      saveChave(token, nome, (s as { chave?: string }).chave);
      saveRaliSession(next);
      setSession(next);
      setState(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !open || !answer.trim()) return;
    setBusy(true);
    setError('');
    try {
      const s = await ctfCall<RaliState>('raliSubmit', { token: session.token, nome: session.nome, tag_id: open.missao.tag_id, resposta: answer });
      setState(s);
      if (s.correto) {
        playSound('success', true);
        const fogo = s.premio?.isFogo;
        try {
          confetti({ particleCount: fogo ? 160 : 90, spread: fogo ? 100 : 70, origin: { y: 0.6 }, colors: fogo ? ['#f97316', '#ef4444', '#f59e0b', '#fde047'] : ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'] });
        } catch {
          // ignore
        }
        setFeedback({ ok: true, text: fogo ? `🔥 Primeira equipe a resolver! +${s.premio?.xp ?? 0} XP.` : `Correto! +${s.premio?.xp ?? 0} XP.` });
        setOpen(null);
        setAnswer('');
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

  const handleLeave = () => {
    clearRaliSession();
    setSession(null);
    setState(null);
    setOpen(null);
    setFeedback(null);
  };

  if (session && !state && !error) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-slate-400 flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <span className="text-sm">Voltando para a sala {session.token}…</span>
      </div>
    );
  }

  // ---------- Entrada da equipe ----------
  if (!session || !state) {
    const hasApi = !!getCtfApiUrl();
    const input = 'w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none';
    return (
      <div className="max-w-md mx-auto px-4 py-10">
        <form onSubmit={handleJoin} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="text-center space-y-1">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Radio className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Entrar no Rali NFC</h2>
            <p className="text-sm text-slate-400">Digite o token da sala e o nome da sua equipe.</p>
          </div>
          {tagWanted && <StatusBanner tone="warn">Etiqueta lida. Entre na sala e a missão abre sozinha.</StatusBanner>}
          {!hasApi && (
            <div className="rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs p-3">
              Este navegador ainda não conhece o servidor. Abra o <strong>link de convite</strong> enviado pelo professor.
            </div>
          )}
          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Token da sala</span>
            <input value={token} onChange={(e) => setToken(e.target.value.toUpperCase())} maxLength={8} autoCapitalize="characters" autoComplete="off" placeholder="ABC234" className={`${input} text-xl font-mono font-black tracking-[0.3em] text-center text-emerald-300`} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Nome da equipe</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={40} autoComplete="off" placeholder="Ex.: Os Joins" className={input} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Integrantes <span className="font-normal normal-case text-slate-500">(opcional, separe por vírgula)</span></span>
            <textarea value={integrantes} onChange={(e) => setIntegrantes(e.target.value)} rows={2} maxLength={200} placeholder="Ana, Bruno, Carla" className={input} />
          </label>
          {error && <p className="text-sm text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3">{error}</p>}
          <Btn type="submit" size="lg" variant="primary" className="w-full" disabled={busy || token.trim().length < 4 || nome.trim().length < 2} icon={busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Radio className="w-5 h-5" />}>
            Entrar na sala
          </Btn>
          <p className="text-[11px] text-center text-slate-500">Voltar depois com o mesmo nome de equipe continua de onde vocês pararam.</p>
        </form>
      </div>
    );
  }

  const { sala, equipe, missoes, ranking } = state;
  const done = missoes.filter((m) => m.concluida).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <StudentBar
        module="nfc"
        context={sala.nome}
        name={equipe.nome}
        footer={equipe.integrantes.length > 0 ? <p className="text-xs text-slate-400">Integrantes: {equipe.integrantes.join(', ')}</p> : undefined}
      >
        <TimerDisplay timer={timer} seconds={seconds} phase={phase} size="chip" />
        <XpChip xp={equipe.xp} />
        {equipe.fogos > 0 && <span className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300 font-black">🔥 x{equipe.fogos}</span>}
        <RankChip pos={equipe.posicao} total={state.total_equipes} />
        <button onClick={handleLeave} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800" title="Sair da sala" aria-label="Sair da sala">
          <LogOut className="w-4 h-4" />
        </button>
      </StudentBar>

      {closed && <StatusBanner>O Rali foi encerrado pelo professor. Confira o resultado final.</StatusBanner>}
      {!closed && timeUp && <StatusBanner>Tempo esgotado! As respostas foram bloqueadas. Confira o resultado final.</StatusBanner>}
      {!finished && waiting && <StatusBanner tone="warn">O cronômetro está parado. Aguarde o professor iniciar para enviar respostas.</StatusBanner>}

      {sala.terminal && <LinuxTerminal />}
      <StudentDebrief token={sala.token} liberado={Boolean(sala.debriefing)} quem="equipes" accent="emerald" />

      {finished ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8">
          <FinalPodium rows={ranking} totalFases={sala.total} unit="missões" entity="equipes" me={equipe.nome} />
          <p className="mt-4 text-center text-sm text-slate-400">
            Sua equipe: <strong className="text-white">{equipe.posicao}º lugar</strong> • {equipe.xp} XP • {equipe.acertos} de {sala.total} missões
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {open ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
                <Btn variant="ghost" size="sm" onClick={() => setOpen(null)} icon={<ArrowLeft className="w-4 h-4" />}>Voltar às missões</Btn>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-black">{open.missao.tag_id}</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">{open.missao.categoria}</span>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-black">
                    +{open.missao.xp_atual} XP
                    {open.missao.xp_atual !== open.missao.xp_base && <span className="ml-1.5 text-[11px] text-amber-300/60 line-through">{open.missao.xp_base}</span>}
                  </div>
                </div>
                {open.ja_resolvida && <StatusBanner tone="warn">Sua equipe já resolveu esta missão.</StatusBanner>}
                {sala.modo === 'ctf_dynamic' && !open.ja_resolvida && (
                  <div className={`rounded-xl border px-4 py-2.5 text-sm font-bold ${open.missao.capturas_anteriores === 0 ? 'bg-orange-950/70 border-orange-500/60 text-orange-200' : 'bg-amber-950/50 border-amber-500/40 text-amber-200'}`}>
                    {open.missao.capturas_anteriores === 0 ? `🔥 FLAG INTACTA! Nenhuma equipe resolveu: vale ${open.missao.xp_atual} XP!` : `⚠️ ${open.missao.capturas_anteriores} ${open.missao.capturas_anteriores === 1 ? 'equipe já resolveu' : 'equipes já resolveram'}: vale ${open.missao.xp_atual} XP agora.`}
                  </div>
                )}
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <p className="text-base sm:text-lg font-bold text-white leading-relaxed whitespace-pre-wrap">{open.missao.pergunta}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {open.missao.opcoes.length > 0 ? (
                    <fieldset disabled={busy || locked || open.ja_resolvida} className="space-y-2">
                      <legend className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Escolha a alternativa correta</legend>
                      {open.missao.opcoes.map((o) => (
                        <label key={o} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-base cursor-pointer transition ${answer === o ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500'}`}>
                          <input type="radio" name="rali-opcao" value={o} checked={answer === o} onChange={() => setAnswer(o)} className="h-4 w-4 accent-emerald-600" />
                          <span>{o}</span>
                        </label>
                      ))}
                    </fieldset>
                  ) : (
                    <input value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={busy || locked || open.ja_resolvida} autoComplete="off" autoCapitalize="none" aria-label="Sua resposta" placeholder="Sua resposta" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                  )}
                  <Btn type="submit" size="lg" variant="primary" className="w-full" disabled={busy || locked || open.ja_resolvida || !answer.trim()} icon={busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}>
                    Enviar resposta
                  </Btn>
                </form>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">Missões da sala</h3>
                  <span className="text-xs font-bold text-slate-400">{done} de {sala.total} resolvidas</span>
                </div>
                <p className="text-sm text-slate-400">Aproxime o celular de uma etiqueta NFC (ou leia o QR code) para abrir a missão. Se preferir, digite o código da etiqueta abaixo.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (code.trim()) openTag(code);
                  }}
                  className="flex gap-2"
                >
                  <input value={code} onChange={(e) => setCode(e.target.value)} disabled={busy || locked} autoCapitalize="none" autoComplete="off" aria-label="Código da etiqueta" placeholder="tag_07" className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base font-mono text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  <Btn type="submit" variant="primary" disabled={busy || locked || !code.trim()}>Abrir</Btn>
                </form>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[26rem] overflow-y-auto pr-1">
                  {missoes.map((m) => (
                    <li key={m.tag_id}>
                      <button
                        type="button"
                        disabled={busy || locked}
                        onClick={() => openTag(m.tag_id)}
                        className={`w-full text-left flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${m.concluida ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-700 bg-slate-950 hover:border-slate-500'}`}
                      >
                        {m.concluida ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Circle className="w-5 h-5 text-slate-500 shrink-0" />}
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-white truncate">{m.categoria || m.tag_id}</span>
                          <span className="block text-[11px] font-mono text-slate-400">{m.tag_id} • {m.xp_base} XP{m.capturas > 0 ? ` • ${m.capturas} ✓` : ''}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {feedback && (
              <div role="status" className={`p-4 rounded-xl border flex items-start gap-3 text-sm font-semibold ${feedback.ok ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' : 'bg-rose-950/80 border-rose-500 text-rose-200'}`}>
                {feedback.ok ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                <span>{feedback.text}</span>
              </div>
            )}
            {error && <p className="text-sm text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3">{error}</p>}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 h-fit">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-400" /> Top 5</h3>
              <span className="text-[11px] font-mono text-slate-500">{state.total_equipes} {state.total_equipes === 1 ? 'equipe' : 'equipes'}</span>
            </div>
            <Top5Board
              rows={ranking}
              totalFases={sala.total}
              me={equipe.nome}
              mine={{ nome: equipe.nome, xp: equipe.xp, fase: equipe.acertos, fogos: equipe.fogos, posicao: equipe.posicao }}
              variant={theme === 'claro' ? 'bars' : 'podium'}
              unit="missões"
            />
            <p className="text-[11px] text-slate-500">Atualiza sozinho a cada poucos segundos.</p>
          </div>
        </div>
      )}

    </div>
  );
};
