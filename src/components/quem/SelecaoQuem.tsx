import React, { useMemo } from 'react';
import { HelpCircle } from 'lucide-react';
import { CONCEITOS_QUEM, DISCIPLINAS_QUEM, NIVEIS_QUEM, type ConceitoQuem, type NivelQuem } from '../../data/quemSouEu';
import type { CtfMissionPayload } from '../../types/ctf';
import type { GabaritoMissao } from '../../utils/gabarito';

export interface SelecaoQuemValor {
  disciplinas: string[];
  niveis: NivelQuem[];
  rodadas: number;
  embaralhar: boolean;
}

export const SELECAO_QUEM_PADRAO: SelecaoQuemValor = { disciplinas: [], niveis: ['facil', 'media', 'dificil'], rodadas: 10, embaralhar: true };

export const conceitosDaSelecao = (v: SelecaoQuemValor): ConceitoQuem[] =>
  CONCEITOS_QUEM.filter((c) => v.disciplinas.includes(c.disciplina) && v.niveis.includes(c.nivel));

const NOME_NIVEL: Record<NivelQuem, string> = { facil: 'Fácil', media: 'Média', dificil: 'Difícil' };

/** Sorteia (ou ordena do fácil ao difícil) e monta as rodadas com as respostas do gabarito aberto. */
export function montarRodadasQuem(
  v: SelecaoQuemValor,
  gabarito: (tag: string) => GabaritoMissao | undefined,
  sorteio: () => number = Math.random,
): CtfMissionPayload[] {
  const lista = conceitosDaSelecao(v).slice();
  if (v.embaralhar) {
    for (let i = lista.length - 1; i > 0; i--) {
      const j = Math.floor(sorteio() * (i + 1));
      [lista[i], lista[j]] = [lista[j], lista[i]];
    }
  }
  const escolhidos = lista.slice(0, Math.max(1, v.rodadas));
  if (!v.embaralhar) escolhidos.sort((a, b) => NIVEIS_QUEM.findIndex((n) => n.id === a.nivel) - NIVEIS_QUEM.findIndex((n) => n.id === b.nivel));
  return escolhidos.map((c) => {
    const g = gabarito(c.tag_id);
    if (!g?.r) throw new Error('O gabarito do Quem sou eu? está protegido. Conecte a chave do banco (no campo abaixo) para liberar as respostas neste aparelho e crie a sala de novo.');
    return {
      tag_id: c.tag_id,
      categoria: c.disciplina,
      pacote: NOME_NIVEL[c.nivel],
      pergunta: '',
      dicas: c.dicas,
      resposta: g.r,
      alternativas: g.a ?? [],
      xp: c.xp,
      explicacao: g.e,
    };
  });
}

interface Props {
  valor: SelecaoQuemValor;
  onChange: (v: SelecaoQuemValor) => void;
  input: string;
}

/** Escolha das disciplinas, dos níveis e do número de rodadas do Quem sou eu?. */
export const SelecaoQuem: React.FC<Props> = ({ valor, onChange, input }) => {
  const disponiveis = useMemo(() => conceitosDaSelecao(valor).length, [valor]);
  const marca = <T extends string>(lista: T[], item: T, sim: boolean) => (sim ? [...lista, item] : lista.filter((x) => x !== item));
  const contaDisc = (d: string) => CONCEITOS_QUEM.filter((c) => c.disciplina === d && valor.niveis.includes(c.nivel)).length;
  return (
    <fieldset className="min-w-0 space-y-3 rounded-2xl border-2 border-rose-500/50 bg-rose-500/5 p-3">
      <legend className="flex items-center gap-2 px-2 text-sm font-black uppercase tracking-wider text-rose-300">
        <HelpCircle className="w-4 h-4" /> Conceitos da sala
        <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-black text-white">{Math.min(disponiveis, valor.rodadas)}</span>
      </legend>
      <p className="text-[11px] text-slate-400">
        Cada rodada é um conceito que fala de si mesmo em 5 dicas, da mais vaga à mais clara. O aluno começa com uma dica; cada dica a mais tira 20% do XP.
      </p>

      <div className="space-y-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Disciplinas</span>
        <div className="grid gap-1.5">
          {DISCIPLINAS_QUEM.map((d) => (
            <label key={d} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={valor.disciplinas.includes(d)}
                onChange={(e) => onChange({ ...valor, disciplinas: marca(valor.disciplinas, d, e.target.checked) })}
                className="accent-rose-500"
              />
              <span className="flex-1">{d}</span>
              <span className="text-xs font-mono text-slate-500">{contaDisc(d)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dificuldade</span>
        <div className="grid grid-cols-3 gap-1.5">
          {NIVEIS_QUEM.map((n) => (
            <label key={n.id} className={`flex flex-col items-center rounded-lg border px-2 py-2 text-xs font-bold cursor-pointer ${valor.niveis.includes(n.id) ? 'border-rose-500 bg-rose-500/10 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
              <input
                type="checkbox"
                checked={valor.niveis.includes(n.id)}
                onChange={(e) => onChange({ ...valor, niveis: marca(valor.niveis, n.id, e.target.checked) })}
                className="sr-only"
              />
              {n.nome}
              <span className="text-[10px] font-semibold text-amber-300">{n.xp} XP</span>
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center justify-between gap-3">
        <span className="text-[10px] leading-tight font-bold uppercase tracking-normal text-slate-400">Rodadas (1 a {Math.max(1, disponiveis)})</span>
        <input
          type="number"
          min={1}
          max={Math.max(1, disponiveis)}
          value={valor.rodadas}
          onChange={(e) => onChange({ ...valor, rodadas: Math.max(1, Math.min(60, Math.floor(Number(e.target.value)) || 1)) })}
          className={`${input} !w-24 text-center`}
        />
      </label>

      <label className="flex items-start gap-2 text-sm text-slate-200 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 cursor-pointer">
        <input type="checkbox" checked={valor.embaralhar} onChange={(e) => onChange({ ...valor, embaralhar: e.target.checked })} className="accent-rose-500 mt-1" />
        <span>
          Sortear os conceitos
          <span className="block text-[11px] text-slate-500">Desmarcado, as rodadas seguem do fácil ao difícil.</span>
        </span>
      </label>

      {valor.disciplinas.length > 0 && disponiveis < valor.rodadas && (
        <p className="text-[11px] text-amber-300">Só há {disponiveis} conceitos com essa escolha: a sala terá {disponiveis} rodadas.</p>
      )}
    </fieldset>
  );
};
