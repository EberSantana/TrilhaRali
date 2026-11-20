import React from 'react';
import { X } from 'lucide-react';
import { Capacete, ORDEM_PAPEIS, PAPEIS } from './Capacete';
import { ListaBusca, NomeDestaque } from './BuscaNome';

const separa = (v: string) => v.split(',').map((x) => x.trim()).filter(Boolean);

/**
 * Formação da dupla no Desvendando: cada um escolhe o nome no seu capacete. Piloto e copiloto são obrigatórios;
 * o engenheiro de pista só entra quando a turma for ímpar (trio). O valor é a lista na ordem dos papéis.
 */
export const CabineDupla: React.FC<{ alunos: string[]; ocupados: string[]; value: string; onChange: (v: string) => void }> = ({ alunos, ocupados, value, onChange }) => {
  const nomes = separa(value);
  const [trio, setTrio] = React.useState(nomes.length > 2);
  const vagas = trio ? 3 : 2;
  const proxima = nomes.length < vagas ? ORDEM_PAPEIS[nomes.length] : null;
  const tira = (i: number) => onChange(nomes.filter((_, j) => j !== i).join(', '));
  return (
    <div className="space-y-3">
      <div className={`grid gap-2 ${trio ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {ORDEM_PAPEIS.slice(0, vagas).map((papel, i) => {
          const p = PAPEIS[papel];
          const nome = nomes[i];
          const ativo = proxima === papel;
          return (
            <div key={papel} className={`flex items-center gap-3 rounded-xl border p-3 ${nome ? `${p.borda} ${p.fundo}` : ativo ? 'border-violet-400 bg-slate-900 ring-2 ring-violet-500/40' : 'border-slate-800 bg-slate-950'}`}>
              <Capacete papel={papel} size={44} className={nome || ativo ? '' : 'opacity-40 grayscale'} />
              <div className="min-w-0 flex-1">
                <p className={`text-[11px] font-black uppercase tracking-wider ${p.texto}`}>{p.nome}</p>
                {nome ? (
                  <p className="truncate text-sm"><NomeDestaque nome={nome} /></p>
                ) : (
                  <p className="text-xs text-slate-500">{ativo ? 'Escolha o nome abaixo' : 'Aguardando'}</p>
                )}
              </div>
              {nome && (
                <button type="button" onClick={() => tira(i)} className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label={`Trocar ${p.nome}`}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      {proxima && <ListaBusca alunos={alunos} ocupados={ocupados} escolhidos={nomes} onEscolher={(n) => onChange([...nomes, n].join(', '))} foco="focus:ring-violet-500" placeholder={`Nome do ${PAPEIS[proxima].nome.toLowerCase()}`} />}
      <label className="flex items-center gap-2 text-xs text-slate-400">
        <input
          type="checkbox"
          checked={trio}
          onChange={(e) => {
            setTrio(e.target.checked);
            if (!e.target.checked && nomes.length > 2) onChange(nomes.slice(0, 2).join(', '));
          }}
          className="h-4 w-4 accent-violet-500"
        />
        Somos um trio (entra o engenheiro de pista)
      </label>
    </div>
  );
};

