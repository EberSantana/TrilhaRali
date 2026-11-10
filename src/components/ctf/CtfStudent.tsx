import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Download, Flag, KeyRound, Loader2, Lock, LogOut, Send, Trophy, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CtfState } from '../../types/ctf';
import {
  clearStudentSession,
  ctfCall,
  getCtfApiUrl,
  getStudentSession,
  parseCtfHash,
  saveCtfApiUrl,
  saveStudentSession,
} from '../../utils/ctfApi';
import { playSound } from '../../utils/audio';
import { BANCO_RALI_SQL } from '../../utils/sqlSeed';

const POLL_MS = 20_000;

export const CtfStudent: React.FC = () => {
  const link = useRef(parseCtfHash());
  const [session, setSession] = useState(getStudentSession);
  const [token, setToken] = useState(() => link.current.token || '');
  const [nome, setNome] = useState('');
  const [state, setState] = useState<CtfState | null>(null);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const answerRef = useRef<HTMLInputElement>(null);

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
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [session, refresh]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const s = await ctfCall<CtfState>('join', { token: token.trim(), nome });
      const next = { token: s.sala.token, nome: s.aluno.nome };
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
            particleCount: fogo ? 160 : 90,
            spread: fogo ? 100 : 70,
            origin: { y: 0.6 },
            colors: fogo ? ['#f97316', '#ef4444', '#f59e0b', '#fde047'] : ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
          });
        } catch {
          // ignore
        }
        const xp = s.premio?.xp ?? 0;
        setFeedback({
          ok: true,
          text: fogo
            ? `🔥 Primeiro a resolver! +${xp} XP. Fase ${s.aluno.concluido ? 'final concluída' : s.aluno.fase + ' desbloqueada'}!`
            : `Correto! +${xp} XP.${s.aluno.concluido ? ' Você concluiu todas as fases!' : ` Fase ${s.aluno.fase} desbloqueada.`}`,
        });
        setAnswer('');
        setTimeout(() => answerRef.current?.focus(), 50);
      } else {
        playSound('error', true);
        setFeedback({ ok: false, text: 'Resposta incorreta. Revise a consulta e tente novamente.' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = () => {
    clearStudentSession();
    setSession(null);
    setState(null);
    setFeedback(null);
    setAnswer('');
  };

  const downloadSql = () => {
    const blob = new Blob([BANCO_RALI_SQL], { type: 'text/sql' });
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
      <div className="max-w-md mx-auto px-4 py-20 text-center text-slate-400 flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
        <span className="text-sm">Voltando para a sala {session.token}…</span>
      </div>
    );
  }

  // ---------- Entrada na sala ----------
  if (!session || !state) {
    const hasApi = !!getCtfApiUrl();
    return (
      <div className="max-w-md mx-auto px-4 py-10">
        <form onSubmit={handleJoin} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="text-center space-y-1">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/40 flex items-center justify-center">
              <Flag className="w-7 h-7 text-orange-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Entrar no CTF</h2>
            <p className="text-sm text-slate-400">Digite o token da sala e seu nome.</p>
          </div>

          {!hasApi && (
            <div className="rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs p-3">
              Este navegador ainda não conhece o servidor do CTF. Abra o <strong>link de convite</strong> enviado pelo professor.
            </div>
          )}

          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-orange-400" /> Token da sala
            </span>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              maxLength={8}
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="ABC234"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xl font-mono font-black tracking-[0.3em] text-center text-orange-300 placeholder-slate-700 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Seu nome</span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={40}
              autoComplete="name"
              placeholder="Nome e sobrenome"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </label>

          {error && <p className="text-sm text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3">{error}</p>}

          <button
            type="submit"
            disabled={busy || token.trim().length < 4 || nome.trim().length < 2}
            className="w-full py-3.5 rounded-xl font-black text-base bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Flag className="w-5 h-5" />}
            ENTRAR NA SALA
          </button>
          <p className="text-[11px] text-center text-slate-500">
            Voltar depois com o mesmo nome continua de onde você parou.
          </p>
        </form>
      </div>
    );
  }

  // ---------- Jogo ----------
  const { sala, aluno, missao, ranking } = state;
  const closed = sala.status === 'encerrada';
  const phases = Array.from({ length: sala.total }, (_, i) => i + 1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {/* Cabeçalho */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400">CTF • {sala.nome}</div>
          <div className="text-lg font-black text-white truncate">{aluno.nome}</div>
        </div>
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-black">{aluno.xp} XP</span>
          {aluno.fogos > 0 && (
            <span className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300 font-black">🔥 x{aluno.fogos}</span>
          )}
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-bold">#{aluno.posicao}</span>
          <button onClick={handleLeave} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800" title="Sair da sala" aria-label="Sair da sala">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {closed && (
        <div className="rounded-2xl bg-red-950/70 border border-red-500/60 text-red-200 p-4 flex items-center gap-3 font-semibold text-sm">
          <Lock className="w-5 h-5 text-red-400 shrink-0" /> A sala foi encerrada pelo professor. Veja o ranking final abaixo.
        </div>
      )}

      {/* Progresso por fase */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
          <span>
            Fase {Math.min(aluno.fase, sala.total)} de {sala.total}
          </span>
          <span>{aluno.acertos} resolvidas</span>
        </div>
        <div className="flex flex-wrap gap-1" role="img" aria-label={`Fase ${aluno.fase} de ${sala.total}`}>
          {phases.map((n) => (
            <span
              key={n}
              title={n < aluno.fase ? `Fase ${n}: concluída` : n === aluno.fase ? `Fase ${n}: atual` : `Fase ${n}: bloqueada`}
              className={`h-2.5 flex-1 min-w-[6px] rounded-full ${
                n < aluno.fase ? 'bg-emerald-500' : n === aluno.fase ? 'bg-orange-400 animate-pulse' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Missão atual */}
        <div className="lg:col-span-2 space-y-4">
          {aluno.concluido || !missao ? (
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
                  {missao.capturas_anteriores === 0
                    ? `🔥 FLAG INTACTA! Ninguém resolveu ainda: vale ${missao.xp_atual} XP!`
                    : `⚠️ ${missao.capturas_anteriores} ${missao.capturas_anteriores === 1 ? 'aluno já resolveu' : 'alunos já resolveram'}: vale ${missao.xp_atual} XP agora.`}
                </div>
              )}

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Desafio no SQLite</div>
                <p className="text-base sm:text-lg font-bold text-white leading-relaxed whitespace-pre-wrap">{missao.pergunta}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <label htmlFor="ctf-resposta" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Resposta curta (saída da consulta)
                </label>
                <input
                  id="ctf-resposta"
                  ref={answerRef}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={busy || closed}
                  autoComplete="off"
                  autoCapitalize="none"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base text-white focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={busy || closed || !answer.trim()}
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
              {feedback.ok ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
          )}
          {error && <p className="text-sm text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3">{error}</p>}

          {sala.banco ? (
            <button onClick={downloadSql} className="text-xs font-semibold text-sky-300 hover:text-sky-200 underline flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Baixar o banco de dados (banco_rali.sql) para rodar no seu SQLite
            </button>
          ) : (
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> O banco de dados será liberado pelo professor.
            </p>
          )}
        </div>

        {/* Ranking */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 h-fit">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Ranking
            </h3>
            <span className="text-[11px] font-mono text-slate-500">{state.total_alunos} {state.total_alunos === 1 ? 'aluno' : 'alunos'}</span>
          </div>
          <ol className="space-y-1.5">
            {ranking.map((r, i) => (
              <li
                key={`${r.nome}-${i}`}
                className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ${
                  r.nome === aluno.nome ? 'bg-orange-500/15 border border-orange-500/40' : 'bg-slate-950/70 border border-slate-800'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-black text-slate-400 w-6 shrink-0">{i + 1}º</span>
                  <span className="truncate font-semibold text-slate-100">{r.nome}</span>
                </span>
                <span className="shrink-0 font-mono text-xs text-slate-300">
                  {r.fogos > 0 && <span className="mr-1.5">🔥{r.fogos}</span>}F{Math.min(r.fase, sala.total)} • <strong className="text-emerald-300">{r.xp}</strong>
                </span>
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-slate-500">Atualiza sozinho a cada 20 segundos.</p>
        </div>
      </div>
    </div>
  );
};
