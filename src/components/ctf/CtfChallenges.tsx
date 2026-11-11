import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, Send, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CtfState, RaliMissionRef, RaliTagInfo } from '../../types/ctf';
import { ctfCall } from '../../utils/ctfApi';
import { playSound } from '../../utils/audio';
import { StatusBanner } from '../common/StatusBanner';
import { Btn } from '../common/ui';

interface Props {
  state: CtfState;
  session: { token: string; nome: string };
  /** sala encerrada, tempo esgotado ou relógio parado */
  locked: boolean;
  onState: (s: CtfState) => void;
}

/** Agrupa os desafios por tema (disciplina/pacote), mantendo a ordem em que a sala os trouxe. */
export function groupChallenges(list: RaliMissionRef[]): { tema: string; itens: RaliMissionRef[] }[] {
  const map = new Map<string, RaliMissionRef[]>();
  list.forEach((m) => {
    const tema = m.pacote || 'Geral';
    map.set(tema, [...(map.get(tema) ?? []), m]);
  });
  return Array.from(map, ([tema, itens]) => ({ tema, itens }));
}

/** CTF livre: painel com todos os desafios; o aluno escolhe a ordem e resolve cada um uma vez. */
export const CtfChallenges: React.FC<Props> = ({ state, session, locked, onState }) => {
  const [open, setOpen] = useState<RaliTagInfo | null>(null);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const missoes = state.missoes ?? [];
  const groups = useMemo(() => groupChallenges(missoes), [missoes]);
  const dinamico = state.sala.modo === 'ctf_dynamic';

  const openChallenge = async (tag: string) => {
    setBusy(true);
    setError('');
    setFeedback(null);
    try {
      const info = await ctfCall<RaliTagInfo>('raliTag', { token: session.token, nome: session.nome, tag_id: tag });
      setOpen(info);
      setAnswer('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!open || !answer.trim()) return;
    setBusy(true);
    setError('');
    try {
      const s = await ctfCall<CtfState>('raliSubmit', { token: session.token, nome: session.nome, tag_id: open.missao.tag_id, resposta: answer });
      onState(s);
      if (s.correto) {
        playSound('success', true);
        const fogo = s.premio?.isFogo;
        try {
          confetti({ particleCount: fogo ? 160 : 90, spread: fogo ? 100 : 70, origin: { y: 0.6 }, colors: fogo ? ['#f97316', '#ef4444', '#f59e0b', '#fde047'] : ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'] });
        } catch {
          // ignore
        }
        setFeedback({ ok: true, text: fogo ? `🔥 Primeiro a resolver! +${s.premio?.xp ?? 0} XP.` : `Correto! +${s.premio?.xp ?? 0} XP.` });
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

  const feedbackBox = feedback && (
    <div
      role="status"
      className={`p-4 rounded-xl border flex items-start gap-3 text-sm font-semibold ${feedback.ok ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' : 'bg-rose-950/80 border-rose-500 text-rose-200'}`}
    >
      {feedback.ok ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
      <span>{feedback.text}</span>
    </div>
  );
  const errorBox = error && <p className="text-sm text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3">{error}</p>;

  // ---------- Desafio aberto ----------
  if (open) {
    const { missao } = open;
    return (
      <div className="space-y-4">
        <Btn variant="ghost" size="sm" onClick={() => { setOpen(null); setFeedback(null); setError(''); }} icon={<ArrowLeft className="w-4 h-4" />}>
          Voltar aos desafios
        </Btn>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">{missao.categoria}</span>
              <span className="text-slate-500">{missao.pacote}</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-black">
              +{missao.xp_atual} XP
              {missao.xp_atual !== missao.xp_base && <span className="ml-1.5 text-[11px] text-amber-300/60 line-through">{missao.xp_base}</span>}
            </div>
          </div>

          {dinamico && !open.ja_resolvida && (
            <div className={`rounded-xl border px-4 py-2.5 text-sm font-bold ${missao.capturas_anteriores === 0 ? 'bg-orange-950/70 border-orange-500/60 text-orange-200' : 'bg-amber-950/50 border-amber-500/40 text-amber-200'}`}>
              {missao.capturas_anteriores === 0
                ? `🔥 FLAG INTACTA! Ninguém resolveu ainda: vale ${missao.xp_atual} XP!`
                : `⚠️ ${missao.capturas_anteriores} ${missao.capturas_anteriores === 1 ? 'aluno já resolveu' : 'alunos já resolveram'}: vale ${missao.xp_atual} XP agora.`}
            </div>
          )}
          {open.ja_resolvida && <StatusBanner tone="warn">Você já resolveu este desafio.</StatusBanner>}

          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Desafio</div>
            <p className="text-base sm:text-lg font-bold text-white leading-relaxed whitespace-pre-wrap">{missao.pergunta}</p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {missao.opcoes.length > 0 ? (
              <fieldset disabled={busy || locked || open.ja_resolvida} className="space-y-2">
                <legend className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Escolha a alternativa correta</legend>
                {missao.opcoes.map((o) => (
                  <label
                    key={o}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-base cursor-pointer transition ${answer === o ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500'}`}
                  >
                    <input type="radio" name="ctf-livre-opcao" value={o} checked={answer === o} onChange={() => setAnswer(o)} className="h-4 w-4 accent-orange-500" />
                    <span>{o}</span>
                  </label>
                ))}
              </fieldset>
            ) : (
              <>
                <label htmlFor="ctf-livre-resposta" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Sua resposta
                </label>
                <input
                  id="ctf-livre-resposta"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={busy || locked || open.ja_resolvida}
                  autoComplete="off"
                  autoCapitalize="none"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base text-white focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </>
            )}
            <button
              type="submit"
              disabled={busy || locked || open.ja_resolvida || !answer.trim()}
              className="w-full py-3.5 rounded-xl font-black bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              ENVIAR RESPOSTA
            </button>
          </form>
        </div>
        {feedbackBox}
        {errorBox}
      </div>
    );
  }

  // ---------- Painel de desafios ----------
  return (
    <div className="space-y-5">
      {feedbackBox}
      {errorBox}
      {missoes.length === 0 && <p className="text-sm text-slate-400">Esta sala ainda não tem desafios.</p>}
      {groups.map((g) => {
        const feitas = g.itens.filter((m) => m.concluida).length;
        return (
          <section key={g.tema} aria-label={g.tema} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">{g.tema}</h3>
              <span className="text-xs font-mono text-slate-400">{feitas}/{g.itens.length}</span>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {g.itens.map((m) => {
                const xp = m.xp_atual ?? m.xp_base;
                return (
                  <li key={m.tag_id}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => openChallenge(m.tag_id)}
                      className={`w-full h-full text-left rounded-xl border px-3 py-2.5 transition outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-60 ${
                        m.concluida ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-700 bg-slate-950 hover:border-orange-500/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-black text-slate-500">#{missoes.indexOf(m) + 1}</span>
                        {m.concluida ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Resolvido</span>
                        ) : (
                          <span className="text-xs font-black text-amber-300">+{xp} XP</span>
                        )}
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-100 truncate">{m.categoria || 'Desafio'}</div>
                      <div className="mt-0.5 text-[11px] text-slate-400">
                        {m.capturas === 0 ? (dinamico ? '🔥 intacto' : 'ninguém ainda') : `${m.capturas} ${m.capturas === 1 ? 'resolveu' : 'resolveram'}`}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
};
