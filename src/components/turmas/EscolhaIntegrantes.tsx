import React from 'react';
import { X } from 'lucide-react';
import { ListaBusca, NomeDestaque } from './BuscaNome';

const separa = (v: string) => v.split(',').map((x) => x.trim()).filter(Boolean);

/** Integrantes da equipe escolhidos na lista da turma (Rali NFC). O valor é a lista separada por vírgula. */
export const EscolhaIntegrantes: React.FC<{ alunos: string[]; ocupados?: string[]; value: string; onChange: (v: string) => void; max: number }> = ({ alunos, ocupados = [], value, onChange, max }) => {
  const marcados = separa(value);
  return (
    <div className="space-y-2">
      {marcados.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {marcados.map((n) => (
            <li key={n} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 py-1 pl-3 pr-1 text-sm">
              <NomeDestaque nome={n} />
              <button type="button" onClick={() => onChange(marcados.filter((x) => x !== n).join(', '))} className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label={`Tirar ${n}`}>
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {marcados.length < max ? (
        <ListaBusca alunos={alunos} ocupados={ocupados} escolhidos={marcados} onEscolher={(n) => onChange([...marcados, n].join(', '))} placeholder="Busque cada integrante" />
      ) : (
        <p className="text-xs text-slate-500">Limite de {max} integrantes.</p>
      )}
    </div>
  );
};
