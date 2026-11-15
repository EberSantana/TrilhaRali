import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { ctfCall } from '../../utils/ctfApi';

export interface AssuntoInfo {
  assunto: string;
  n: number;
}
/** disciplina -> assuntos com a quantidade de palavras de cada um */
export type MapaAssuntos = Record<string, AssuntoInfo[]>;
/** disciplina -> assuntos marcados (disciplina sem entrada = nada marcado) */
export type Selecao = Record<string, string[]>;

/** Disciplinas e assuntos do Banco com a quantidade de palavras (só contagens; as respostas ficam no servidor). */
export function useCruzAssuntos(api?: string) {
  const [mapa, setMapa] = useState<MapaAssuntos | null>(null);
  const [erro, setErro] = useState(false);
  useEffect(() => {
    let vivo = true;
    setErro(false);
    ctfCall<{ assuntos: MapaAssuntos }>('cruzAssuntos', {}, api || undefined)
      .then((r) => vivo && setMapa(r.assuntos))
      .catch(() => vivo && setErro(true));
    return () => {
      vivo = false;
    };
  }, [api]);
  return { mapa, erro };
}

const soma = (l: AssuntoInfo[]) => l.reduce((s, a) => s + a.n, 0);

/** Palavras de onde a grade sorteia: só o que está marcado. */
export function totalSelecionado(mapa: MapaAssuntos | null, sel: Selecao): number {
  if (!mapa) return 0;
  return Object.entries(sel).reduce((t, [d, marcados]) => t + soma((mapa[d] ?? []).filter((a) => marcados.includes(a.assunto))), 0);
}

/** Formato do servidor: disciplina inteira (todos os assuntos marcados) vai com assuntos vazio. */
export function selecaoParaEnvio(mapa: MapaAssuntos | null, sel: Selecao): { disciplina: string; assuntos: string[] }[] {
  return Object.entries(sel)
    .filter(([, m]) => m.length)
    .map(([disciplina, m]) => ({ disciplina, assuntos: mapa && m.length >= (mapa[disciplina] ?? []).length ? [] : m }));
}

export function rotuloSelecao(mapa: MapaAssuntos | null, sel: Selecao): string {
  const itens = selecaoParaEnvio(mapa, sel).map((s) => (s.assuntos.length ? `${s.disciplina} › ${s.assuntos.join(', ')}` : s.disciplina));
  return itens.join(' + ');
}

const COR = {
  cyan: { caixa: 'accent-cyan-500', ativo: 'border-cyan-500/60 bg-cyan-500/10', foco: 'focus-visible:ring-cyan-500' },
  emerald: { caixa: 'accent-emerald-500', ativo: 'border-emerald-500/60 bg-emerald-500/10', foco: 'focus-visible:ring-emerald-500' },
} as const;

interface Props {
  mapa: MapaAssuntos | null;
  valor: Selecao;
  onChange: (v: Selecao) => void;
  cor?: keyof typeof COR;
}

const Indeterminada: React.FC<{ marcada: boolean; parcial: boolean; onChange: () => void; label: string; classe: string }> = ({ marcada, parcial, onChange, label, classe }) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = parcial && !marcada;
  }, [parcial, marcada]);
  return <input ref={ref} type="checkbox" checked={marcada} onChange={onChange} aria-label={label} className={`w-5 h-5 shrink-0 ${classe}`} />;
};

/** Marque disciplinas inteiras ou só alguns assuntos; tudo que estiver marcado entra na grade. */
export const SelecaoCruz: React.FC<Props> = ({ mapa, valor, onChange, cor = 'cyan' }) => {
  const [abertas, setAbertas] = useState<Record<string, boolean>>({});
  if (!mapa) return <p className="text-xs text-slate-500">Carregando disciplinas…</p>;
  const disciplinas = Object.keys(mapa);
  if (!disciplinas.length) return <p className="text-xs text-slate-400">O Banco ainda não tem perguntas de resposta curta para virar palavras.</p>;
  const c = COR[cor];
  const total = totalSelecionado(mapa, valor);

  const marcar = (d: string, assuntos: string[]) => {
    const prox = { ...valor };
    if (assuntos.length) prox[d] = assuntos;
    else delete prox[d];
    onChange(prox);
  };
  const todosDe = (d: string) => mapa[d].map((a) => a.assunto);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Disciplinas e assuntos</span>
        <button type="button" onClick={() => onChange({})} disabled={!Object.keys(valor).length} className="text-[11px] font-bold text-slate-400 hover:text-white disabled:opacity-40">
          Limpar
        </button>
      </div>

      <div className="max-h-80 space-y-2 overflow-y-auto pr-1" role="group" aria-label="Disciplinas e assuntos da cruzada">
        {disciplinas.map((d) => {
          const lista = mapa[d];
          const marcados = valor[d] ?? [];
          const inteira = marcados.length === lista.length;
          const aberta = !!abertas[d];
          return (
            <div key={d} className={`rounded-2xl border p-3 ${marcados.length ? c.ativo : 'border-slate-800 bg-slate-950'}`}>
              <div className="flex items-center gap-3">
                <Indeterminada
                  marcada={inteira}
                  parcial={marcados.length > 0}
                  onChange={() => marcar(d, inteira ? [] : todosDe(d))}
                  label={`Marcar a disciplina inteira: ${d}`}
                  classe={c.caixa}
                />
                <button
                  type="button"
                  onClick={() => setAbertas({ ...abertas, [d]: !aberta })}
                  aria-expanded={aberta}
                  aria-label={`${aberta ? 'Recolher' : 'Abrir'} os assuntos de ${d}`}
                  className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left outline-none focus-visible:ring-2 ${c.foco}`}
                >
                  <ChevronRight className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${aberta ? 'rotate-90' : ''}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-white break-words">{d}</span>
                    <span className="block text-[11px] text-slate-400">{lista.length} assunto(s) · {soma(lista)} palavras</span>
                  </span>
                </button>
                <span className="shrink-0 rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] font-mono font-bold text-slate-300">
                  {soma(lista.filter((a) => marcados.includes(a.assunto)))}/{soma(lista)}
                </span>
              </div>

              {aberta && (
                <ul className="mt-2 space-y-1 border-t border-slate-800 pt-2">
                  {lista.map((a) => (
                    <li key={a.assunto}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1 text-sm text-slate-200 hover:bg-slate-800/60">
                        <input
                          type="checkbox"
                          checked={marcados.includes(a.assunto)}
                          onChange={() => marcar(d, marcados.includes(a.assunto) ? marcados.filter((x) => x !== a.assunto) : [...marcados, a.assunto])}
                          className={`w-4 h-4 shrink-0 ${c.caixa}`}
                        />
                        <span className="flex-1 min-w-0 break-words">{a.assunto}</span>
                        <span className="text-[11px] font-mono text-slate-500">{a.n}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <p className={`text-[11px] ${total < 6 ? 'text-rose-300' : 'text-slate-400'}`}>
        {total === 0 ? 'Marque ao menos uma disciplina ou assunto (mínimo 6 palavras).' : total < 6 ? `Só ${total} palavra(s) marcada(s): marque mais (mínimo 6).` : `${total} palavras marcadas para sortear.`}
      </p>
    </div>
  );
};
