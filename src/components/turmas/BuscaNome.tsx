import React, { useMemo, useState } from 'react';
import { Check, Lock, Search, X } from 'lucide-react';
import { normNome } from '../../utils/turmasApi';

/** Primeiro nome em destaque e sobrenomes em seguida: ajuda a separar "Maria Eduarda Santos" de "Maria Eduarda Souza". */
export const NomeDestaque: React.FC<{ nome: string }> = ({ nome }) => {
  const [primeiro, ...resto] = nome.split(' ');
  return (
    <span className="min-w-0">
      <span className="font-black text-white">{primeiro}</span> <span className="text-slate-300">{resto.join(' ')}</span>
    </span>
  );
};

/** Filtra a lista da turma pelo que o aluno digitou (qualquer parte do nome, sem acento). */
export function filtraNomes(alunos: string[], busca: string) {
  const q = normNome(busca);
  if (!q) return alunos;
  const partes = q.split(' ');
  return alunos.filter((n) => {
    const nn = normNome(n);
    return partes.every((p) => nn.includes(p));
  });
}

/** Lista de nomes com busca. Nomes ocupados aparecem bloqueados. */
export const ListaBusca: React.FC<{
  alunos: string[];
  ocupados?: string[];
  escolhidos?: string[];
  onEscolher: (nome: string) => void;
  placeholder?: string;
  foco?: string;
}> = ({ alunos, ocupados = [], escolhidos = [], onEscolher, placeholder = 'Digite parte do seu nome', foco = 'focus:ring-emerald-500' }) => {
  const [busca, setBusca] = useState('');
  const ocup = useMemo(() => new Set(ocupados.map(normNome)), [ocupados]);
  const esc = useMemo(() => new Set(escolhidos.map(normNome)), [escolhidos]);
  const lista = filtraNomes(alunos, busca);
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-800 px-3">
        <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={placeholder}
          aria-label="Buscar nome na lista da turma"
          autoComplete="off"
          className={`w-full bg-transparent py-3 text-base text-white placeholder-slate-500 outline-none focus:ring-0 ${foco}`}
        />
        {busca && (
          <button type="button" onClick={() => setBusca('')} className="rounded p-1 text-slate-500 hover:text-white" aria-label="Limpar busca">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <ul className="max-h-60 overflow-auto p-1" role="listbox" aria-label="Alunos da turma">
        {lista.map((n) => {
          const k = normNome(n);
          const bloqueado = ocup.has(k);
          const marcado = esc.has(k);
          return (
            <li key={n}>
              <button
                type="button"
                role="option"
                aria-selected={marcado}
                disabled={bloqueado || marcado}
                onClick={() => onEscolher(n)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm ${
                  bloqueado ? 'cursor-not-allowed opacity-45' : marcado ? 'bg-slate-800' : 'hover:bg-slate-800/80'
                }`}
              >
                <NomeDestaque nome={n} />
                <span className="ml-auto shrink-0 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  {bloqueado ? (
                    <span className="inline-flex items-center gap-1">
                      <Lock className="h-3 w-3" /> já está na sala
                    </span>
                  ) : marcado ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
        {!lista.length && <li className="px-3 py-4 text-center text-sm text-slate-500">Nenhum nome encontrado. Confira a grafia ou chame o professor.</li>}
      </ul>
    </div>
  );
};

/** Aluno escolhe o próprio nome (CTF e Cruzada): busca e confirmação "Você é ...?". */
export const BuscaNome: React.FC<{ alunos: string[]; ocupados: string[]; value: string; onChange: (n: string) => void; foco?: string }> = ({ alunos, ocupados, value, onChange, foco }) => {
  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
        <Check className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
        <p className="min-w-0 flex-1 text-sm text-slate-300">
          Você é <NomeDestaque nome={value} />?
        </p>
        <button type="button" onClick={() => onChange('')} className="shrink-0 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800">
          Não sou eu
        </button>
      </div>
    );
  }
  return <ListaBusca alunos={alunos} ocupados={ocupados} onEscolher={onChange} foco={foco} />;
};
