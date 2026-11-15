import React, { useEffect, useState } from 'react';
import { ctfCall } from '../../utils/ctfApi';

export interface AssuntoInfo {
  assunto: string;
  n: number;
}
export type MapaAssuntos = Record<string, AssuntoInfo[]>;

/** Assuntos de cada disciplina com a quantidade de palavras (só contagens; as respostas ficam no servidor). */
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

/** Palavras que a grade terá de onde sortear: os assuntos marcados ou, sem marca, a disciplina toda. */
export function palavrasDisponiveis(lista: AssuntoInfo[] | undefined, marcados: string[]): number | null {
  if (!lista) return null;
  return lista.filter((a) => !marcados.length || marcados.includes(a.assunto)).reduce((s, a) => s + a.n, 0);
}

const COR = {
  cyan: { on: 'border-cyan-400 bg-cyan-500/20 text-cyan-100', off: 'border-slate-700 bg-slate-950 text-slate-300 hover:border-cyan-500/60' },
  emerald: { on: 'border-emerald-400 bg-emerald-500/20 text-emerald-100', off: 'border-slate-700 bg-slate-950 text-slate-300 hover:border-emerald-500/60' },
} as const;

interface Props {
  lista: AssuntoInfo[] | undefined;
  carregando: boolean;
  valor: string[];
  onChange: (v: string[]) => void;
  cor?: keyof typeof COR;
}

/** Marque um ou mais assuntos; sem marcar nenhum, a cruzada usa todos os assuntos da disciplina. */
export const AssuntosPicker: React.FC<Props> = ({ lista, carregando, valor, onChange, cor = 'cyan' }) => {
  if (carregando) return <p className="text-xs text-slate-500">Carregando assuntos…</p>;
  if (!lista || !lista.length) return null;
  const c = COR[cor];
  const total = palavrasDisponiveis(lista, valor) ?? 0;
  const alternar = (a: string) => onChange(valor.includes(a) ? valor.filter((x) => x !== a) : [...valor, a]);
  const chip = 'rounded-full border px-3 py-1 text-xs font-bold transition active:scale-95';
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Assuntos</span>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Assuntos da cruzada">
        <button type="button" onClick={() => onChange([])} aria-pressed={!valor.length} className={`${chip} ${!valor.length ? c.on : c.off}`}>
          Todos
        </button>
        {lista.map((a) => (
          <button key={a.assunto} type="button" onClick={() => alternar(a.assunto)} aria-pressed={valor.includes(a.assunto)} className={`${chip} ${valor.includes(a.assunto) ? c.on : c.off}`}>
            {a.assunto} <span className="opacity-60">· {a.n}</span>
          </button>
        ))}
      </div>
      <p className={`text-[11px] ${total < 6 ? 'text-rose-300' : 'text-slate-500'}`}>
        {total < 6 ? `Só ${total} palavra(s) neste recorte: marque mais assuntos (mínimo 6).` : `${total} palavras disponíveis para sortear.`}
      </p>
    </div>
  );
};
