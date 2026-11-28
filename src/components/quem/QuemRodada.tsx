import React, { useEffect, useRef, useState } from 'react';
import { Eye, HelpCircle, Lightbulb, Loader2, Send, SkipForward, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CtfState } from '../../types/ctf';
import { ctfCall } from '../../utils/ctfApi';
import { playSound } from '../../utils/audio';
import { CONCEITOS_QUEM } from '../../data/quemSouEu';

interface Props {
  state: CtfState;
  session: { token: string; nome: string };
  locked: boolean;
  onState: (s: CtfState) => void;
}

/** As dicas já estão no código do site: a próxima abre na hora e o servidor só registra em segundo plano. */
const DICAS_POR_TAG = new Map(CONCEITOS_QUEM.map((c) => [c.tag_id, c.dicas]));

/** Mesma conta do servidor (quemXp): cada dica além da primeira tira 20%, até sobrar 20%. */
export const xpComDicas = (cheio: number, usadas: number) => Math.max(1, Math.round(cheio * Math.max(0.2, 1 - (Math.max(1, usadas) - 1) * 0.2)));

type Aviso = { tom: 'certo' | 'errado' | 'pulou'; titulo: string; resposta?: string; explicacao?: string };

/**
 * Rodada do Quem sou eu?: o conceito fala de si mesmo em dicas. O aluno começa com uma dica e pode abrir as
 * próximas (cada uma tira 20% do XP). A dica aparece na hora; o servidor registra numa fila em segundo plano
 * e, antes de conferir a resposta ou pular, a fila termina, para o XP contar todas as dicas abertas.
 */
export const QuemRodada: React.FC<Props> = ({ state, session, locked, onState }) => {
  const { missao, aluno, sala } = state;
  const [resposta, setResposta] = useState('');
  const [busy, setBusy] = useState<'' | 'enviar' | 'dica' | 'pular'>('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const campo = useRef<HTMLInputElement>(null);
  const avisoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (aviso && aviso.tom !== 'errado') avisoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [aviso]);
  const fase = missao?.fase;
  /** dicas abertas na tela antes de o servidor confirmar */
  const [local, setLocal] = useState<{ fase: number; abertas: number } | null>(null);
  const fila = useRef<Promise<void>>(Promise.resolve());
  const pendentes = useRef(0);
  useEffect(() => {
    setErro('');
  }, [fase]);

  const chamar = async (acao: 'submit' | 'quemDica' | 'quemPular', extra: Record<string, unknown> = {}) => {
    setBusy(acao === 'submit' ? 'enviar' : acao === 'quemDica' ? 'dica' : 'pular');
    setErro('');
    try {
      await fila.current;
      const s = await ctfCall<CtfState>(acao, { token: session.token, nome: session.nome, ...extra });
      onState(s);
      return s;
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setBusy('');
    }
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resposta.trim()) return;
    const s = await chamar('submit', { resposta });
    if (!s) return;
    if (s.correto) {
      playSound('success', true);
      try {
        confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 }, colors: ['#e11d48', '#fb7185', '#f59e0b', '#10b981'] });
      } catch {
        // sem animação
      }
      const d = s.premio?.dicas ?? 1;
      setAviso({
        tom: 'certo',
        titulo: `Acertou com ${d} ${d === 1 ? 'dica' : 'dicas'}! +${s.premio?.xp ?? 0} XP`,
        resposta: s.revelada?.resposta,
        explicacao: s.revelada?.explicacao,
      });
      setResposta('');
      setTimeout(() => campo.current?.focus(), 50);
    } else {
      playSound('error', true);
      setAviso({ tom: 'errado', titulo: 'Não sou eu. Tente de novo ou peça mais uma dica.' });
    }
  };

  const dica = async () => {
    setAviso(null);
    if (!missao) return;
    const todasDoBanco = DICAS_POR_TAG.get(missao.tag_id);
    const servidor = missao.dicas ?? [];
    const abertas = local && local.fase === missao.fase ? local.abertas : servidor.length;
    const mesmas = !!todasDoBanco && todasDoBanco.length === (missao.dicas_total ?? 0) && servidor.every((d, i) => todasDoBanco[i] === d);
    if (!mesmas) {
      await chamar('quemDica');
      return;
    }
    if (abertas >= todasDoBanco!.length) return;
    setLocal({ fase: missao.fase, abertas: abertas + 1 });
    setErro('');
    pendentes.current += 1;
    let ultimo = null as CtfState | null;
    let falhou = '';
    fila.current = fila.current.then(async () => {
      try {
        ultimo = await ctfCall<CtfState>('quemDica', { token: session.token, nome: session.nome });
      } catch (e) {
        falhou = e instanceof Error ? e.message : String(e);
      }
      pendentes.current -= 1;
      if (falhou) setErro(`A dica não foi registrada no servidor (${falhou}). Toque em "Mais uma dica" de novo.`);
      if (pendentes.current === 0) {
        if (ultimo) onState(ultimo);
        setLocal(null);
      } else if (falhou) {
        setLocal((l) => (l ? { ...l, abertas: l.abertas - 1 } : l));
      }
    });
  };

  const pular = async () => {
    if (!window.confirm('Pular esta rodada? Ela passa sem XP e conta como erro.')) return;
    const s = await chamar('quemPular');
    if (s?.revelada) setAviso({ tom: 'pulou', titulo: 'Rodada pulada. Eu era:', resposta: s.revelada.resposta, explicacao: s.revelada.explicacao });
    setResposta('');
  };

  const avisoBox = aviso && (
    <div
      ref={avisoRef}
      role="status"
      className={`scroll-mt-24 rounded-2xl border p-4 space-y-1.5 ${
        aviso.tom === 'certo' ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' : aviso.tom === 'errado' ? 'bg-rose-950/80 border-rose-500 text-rose-200' : 'bg-amber-950/60 border-amber-500/60 text-amber-200'
      }`}
    >
      <p className="font-bold">{aviso.titulo}</p>
      {aviso.resposta && (
        <p className="text-lg font-black text-white">
          {aviso.tom === 'certo' ? 'Eu sou: ' : ''}
          {aviso.resposta}
        </p>
      )}
      {aviso.explicacao && <p className="text-sm text-slate-300">{aviso.explicacao}</p>}
    </div>
  );

  if (aluno.concluido || !missao) {
    return (
      <div className="space-y-4">
        {avisoBox}
        <div className="bg-gradient-to-b from-rose-950/40 to-slate-900 border-2 border-rose-500/50 rounded-3xl p-8 text-center space-y-3">
          <Trophy className="w-14 h-14 mx-auto text-amber-400" />
          <h3 className="text-2xl font-black text-white">Todas as rodadas concluídas!</h3>
          <p className="text-slate-300">
            Você fechou com <strong className="text-amber-300">{aluno.xp} XP</strong>, {aluno.acertos} de {sala.total} acertos, e está em{' '}
            <strong className="text-amber-300">#{aluno.posicao}</strong> no ranking.
          </p>
        </div>
      </div>
    );
  }

  const doServidor = missao.dicas ?? [];
  const total = missao.dicas_total ?? doServidor.length;
  const otimista = local && local.fase === missao.fase && local.abertas > doServidor.length ? local.abertas : 0;
  const dicas = otimista ? (DICAS_POR_TAG.get(missao.tag_id) ?? doServidor).slice(0, otimista) : doServidor;
  const todas = dicas.length >= total;
  // XP cheio da rodada (já com o bônus de posição), deduzido do que o servidor mandou para as dicas dele
  const cheio = Math.round(missao.xp_atual / Math.max(0.2, 1 - (Math.max(1, doServidor.length) - 1) * 0.2));
  const xpAtual = otimista ? xpComDicas(cheio, dicas.length) : missao.xp_atual;
  const xpProxima = otimista ? (dicas.length < total ? xpComDicas(cheio, dicas.length + 1) : null) : missao.xp_proxima;

  return (
    <div className="space-y-4">
      {avisoBox}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 font-mono font-black">Rodada {missao.fase} de {sala.total}</span>
            <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">{missao.categoria}</span>
            <span className="text-slate-400">{missao.pacote}</span>
          </div>
          <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-black">
            vale {xpAtual} XP
            {xpAtual !== missao.xp_base && <span className="ml-1.5 text-[11px] text-amber-300/60 line-through">{missao.xp_base}</span>}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300">
            <HelpCircle className="w-7 h-7" />
          </span>
          <h3 className="text-2xl font-black text-white">Quem sou eu?</h3>
        </div>

        <ol className="space-y-2" aria-label={`Dicas abertas: ${dicas.length} de ${total}`}>
          {dicas.map((d, i) => (
            <li key={i} className={`flex gap-3 rounded-xl border px-4 py-3 ${i === dicas.length - 1 ? 'border-rose-500/50 bg-rose-500/5' : 'border-slate-800 bg-slate-950'}`}>
              <span className="mt-0.5 text-xs font-black text-rose-300 shrink-0">{i + 1}</span>
              <span className="text-base sm:text-lg font-semibold text-white leading-relaxed">{d}</span>
            </li>
          ))}
          {Array.from({ length: Math.max(0, total - dicas.length) }, (_, i) => (
            <li key={`f${i}`} aria-hidden className="flex gap-3 rounded-xl border border-dashed border-slate-800 px-4 py-3 text-slate-600">
              <span className="text-xs font-black">{dicas.length + i + 1}</span>
              <span className="text-sm">Dica fechada</span>
            </li>
          ))}
        </ol>

        <form onSubmit={enviar} className="space-y-3">
          <label htmlFor="quem-resposta" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Você é…
          </label>
          <input
            id="quem-resposta"
            ref={campo}
            value={resposta}
            onChange={(e) => setResposta(e.target.value)}
            disabled={!!busy || locked}
            autoComplete="off"
            autoCapitalize="none"
            placeholder="Digite o nome do conceito"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base text-white placeholder-slate-500 focus:ring-2 focus:ring-rose-500 outline-none"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="submit"
              disabled={!!busy || locked || !resposta.trim()}
              className="py-3.5 rounded-xl font-black bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              {busy === 'enviar' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              RESPONDER
            </button>
            {todas ? (
              <button
                type="button"
                onClick={pular}
                disabled={!!busy || locked}
                className="py-3.5 rounded-xl font-bold border border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {busy === 'pular' ? <Loader2 className="w-5 h-5 animate-spin" /> : <SkipForward className="w-5 h-5" />}
                Pular (sem XP)
              </button>
            ) : (
              <button
                type="button"
                onClick={dica}
                disabled={!!busy || locked}
                className="py-3.5 rounded-xl font-bold border border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {busy === 'dica' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lightbulb className="w-5 h-5" />}
                <span className="text-left leading-tight">
                  Mais uma dica
                  {typeof xpProxima === 'number' && <span className="block text-[11px] font-semibold text-amber-300/80">a rodada passa a valer {xpProxima} XP</span>}
                </span>
              </button>
            )}
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Eye className="w-3.5 h-3.5" /> {dicas.length} de {total} dicas abertas. Acentos e maiúsculas não importam.
          </p>
        </form>
      </div>
      {erro && <p className="text-sm text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3">{erro}</p>}
    </div>
  );
};
