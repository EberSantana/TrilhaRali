import React, { useEffect, useState } from 'react';
import { GrupoSelecao, MIN_PARA_AGRUPAR, agruparPorArea, alternaNoConjunto } from '../common/GrupoSelecao';
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

interface Props {
  mapa: MapaAssuntos | null;
  valor: Selecao;
  onChange: (v: Selecao) => void;
  cor?: 'cyan' | 'emerald';
}

/** Marque disciplinas inteiras ou só alguns assuntos; tudo que estiver marcado entra na grade. */
export const SelecaoCruz: React.FC<Props> = ({ mapa, valor, onChange, cor = 'cyan' }) => {
  const [abertas, setAbertas] = useState<Set<string>>(new Set());
  const [abertasG, setAbertasG] = useState<Set<string>>(new Set());
  if (!mapa) return <p className="text-xs text-slate-500">Carregando disciplinas…</p>;
  const disciplinas = Object.keys(mapa);
  if (!disciplinas.length) return <p className="text-xs text-slate-400">O Banco ainda não tem perguntas de resposta curta para virar palavras.</p>;
  const total = totalSelecionado(mapa, valor);

  const marcar = (d: string, assuntos: string[]) => {
    const prox = { ...valor };
    if (assuntos.length) prox[d] = assuntos;
    else delete prox[d];
    onChange(prox);
  };
  const todosDe = (d: string) => mapa[d].map((a) => a.assunto);
  const palavrasMarcadas = (d: string) => soma(mapa[d].filter((a) => (valor[d] ?? []).includes(a.assunto)));
  const inteira = (d: string) => (valor[d] ?? []).length === mapa[d].length;
  /** marca ou desmarca várias disciplinas de uma vez (uma área inteira) */
  const marcarVarias = (ds: string[]) => {
    const todas = ds.every(inteira);
    const prox = { ...valor };
    ds.forEach((d) => (todas ? delete prox[d] : (prox[d] = todosDe(d))));
    onChange(prox);
  };

  const cartaoDisciplina = (d: string) => {
    const lista = mapa[d];
    const marcados = valor[d] ?? [];
    return (
      <GrupoSelecao
        key={d}
        nivel="disciplina"
        cor={cor}
        titulo={d}
        resumo={`${lista.length} assunto(s) · ${soma(lista)} palavras`}
        marcados={palavrasMarcadas(d)}
        total={soma(lista)}
        aberto={abertas.has(d)}
        onAlternarAberto={() => setAbertas(alternaNoConjunto(abertas, d))}
        onMarcarTudo={() => marcar(d, inteira(d) ? [] : todosDe(d))}
        rotuloMarcar={`Marcar a disciplina inteira: ${d}`}
      >
        <ul className="space-y-1">
          {lista.map((a) => (
            <li key={a.assunto}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1 text-sm text-slate-200 hover:bg-slate-800/60">
                <input
                  type="checkbox"
                  checked={marcados.includes(a.assunto)}
                  onChange={() => marcar(d, marcados.includes(a.assunto) ? marcados.filter((x) => x !== a.assunto) : [...marcados, a.assunto])}
                  className={`w-4 h-4 shrink-0 ${cor === 'cyan' ? 'accent-cyan-500' : 'accent-emerald-500'}`}
                />
                <span className="flex-1 min-w-0 break-words">{a.assunto}</span>
                <span className="text-[11px] font-mono text-slate-500">{a.n}</span>
              </label>
            </li>
          ))}
        </ul>
      </GrupoSelecao>
    );
  };

  const agrupar = disciplinas.length >= MIN_PARA_AGRUPAR;
  const areas = agruparPorArea(disciplinas.map((nome) => ({ nome })));

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Disciplinas e assuntos</span>
        <button type="button" onClick={() => onChange({})} disabled={!Object.keys(valor).length} className="text-[11px] font-bold text-slate-400 hover:text-white disabled:opacity-40">
          Limpar
        </button>
      </div>

      <div className="max-h-80 space-y-2 overflow-y-auto pr-1" role="tree" aria-label="Disciplinas e assuntos da cruzada">
        {agrupar
          ? areas.map((g) => {
              const ds = g.itens.map((i) => i.nome);
              const palavras = ds.reduce((t, d) => t + soma(mapa[d]), 0);
              const marcadas = ds.reduce((t, d) => t + palavrasMarcadas(d), 0);
              return (
                <GrupoSelecao
                  key={g.nome}
                  nivel="area"
                  cor={cor}
                  titulo={g.nome}
                  resumo={`${ds.length} disciplina(s) · ${palavras} palavras`}
                  marcados={marcadas}
                  total={palavras}
                  aberto={abertasG.has(g.nome)}
                  onAlternarAberto={() => setAbertasG(alternaNoConjunto(abertasG, g.nome))}
                  onMarcarTudo={() => marcarVarias(ds)}
                  rotuloMarcar={`Marcar toda a área ${g.nome}`}
                >
                  {ds.map(cartaoDisciplina)}
                </GrupoSelecao>
              );
            })
          : disciplinas.map(cartaoDisciplina)}
      </div>

      <p className={`text-[11px] ${total < 6 ? 'text-rose-300' : 'text-slate-400'}`}>
        {total === 0 ? 'Marque ao menos uma disciplina ou assunto (mínimo 6 palavras).' : total < 6 ? `Só ${total} palavra(s) marcada(s): marque mais (mínimo 6).` : `${total} palavras marcadas para sortear.`}
      </p>
    </div>
  );
};
