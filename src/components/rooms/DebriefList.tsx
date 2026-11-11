import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, GraduationCap, Lightbulb } from 'lucide-react';
import { CtfDebrief } from '../../types/ctf';

interface Props {
  data: CtfDebrief;
  /** rótulo de quem respondeu: "alunos" no CTF, "equipes" no NFC */
  quem: 'alunos' | 'equipes';
  accent?: 'emerald' | 'orange';
}

/** Gabarito da sala, item a item: pergunta, resposta certa, explicação e quantos acertaram. */
export const DebriefList: React.FC<Props> = ({ data, quem, accent = 'emerald' }) => {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const total = Math.max(1, data.total_alunos);
  const allOpen = data.itens.length > 0 && open.size === data.itens.length;
  const toggle = (id: string) =>
    setOpen((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const bar = accent === 'orange' ? 'bg-orange-500' : 'bg-emerald-500';

  if (data.itens.length === 0) return <p className="text-sm text-slate-400">Esta sala não tem perguntas para mostrar.</p>;

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(data.itens.map((i) => i.tag_id)))}
          className="text-xs font-bold text-slate-300 underline-offset-2 hover:underline"
        >
          {allOpen ? 'Recolher todas' : 'Abrir todas'}
        </button>
      </div>
      {data.itens.map((it, idx) => {
        const aberto = open.has(it.tag_id);
        const pct = Math.round((it.acertos / total) * 100);
        return (
          <article key={it.tag_id} className="rounded-xl border border-slate-800 bg-slate-950/60">
            <button
              type="button"
              onClick={() => toggle(it.tag_id)}
              aria-expanded={aberto}
              className="flex w-full items-start gap-3 px-3 py-2.5 text-left"
            >
              <span className="mt-0.5 font-mono text-xs text-slate-500 w-6 shrink-0">{idx + 1}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-slate-100">{it.pergunta}</span>
                <span className="mt-0.5 block text-[11px] text-slate-500">
                  {[it.pacote, it.categoria].filter(Boolean).join(' · ')} · {it.xp} XP
                </span>
                <span className="mt-1.5 flex items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                    <span className={`block h-full ${bar}`} style={{ width: `${Math.min(100, pct)}%` }} />
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {it.acertos}/{data.total_alunos} {quem}
                  </span>
                </span>
              </span>
              <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition ${aberto ? 'rotate-180' : ''}`} />
            </button>
            {aberto && (
              <div className="space-y-2 border-t border-slate-800 px-3 py-3 text-sm">
                {it.opcoes.length > 0 && (
                  <ul className="space-y-1">
                    {it.opcoes.map((o) => {
                      const certa = o.trim().toLowerCase() === it.resposta.trim().toLowerCase();
                      return (
                        <li key={o} className={`rounded-lg px-2.5 py-1.5 ${certa ? 'border border-emerald-500/40 bg-emerald-950/40 text-emerald-200' : 'text-slate-400'}`}>
                          {certa && <CheckCircle2 className="mr-1.5 inline h-4 w-4 text-emerald-400" aria-hidden />}
                          {o}
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Resposta</div>
                  <div className="font-mono text-slate-100 break-words">{it.resposta}</div>
                  {it.alternativas.length > 0 && <div className="mt-0.5 text-[11px] text-slate-500">Também aceita: {it.alternativas.join(' · ')}</div>}
                </div>
                {it.explicacao && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-950/30 p-2.5 text-amber-100">
                    <div className="mb-0.5 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-300">
                      <Lightbulb className="h-3.5 w-3.5" /> Por quê
                    </div>
                    {it.explicacao}
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

export const DebriefTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-200">
    <GraduationCap className="h-4 w-4" /> {children}
  </h2>
);
