import React from 'react';
import { X } from 'lucide-react';
import { ORDEM_PAPEIS, PAPEIS } from './Capacete';
import { CapaceteDaVez, EscolhaCapacetes } from './Avatares';
import { ListaBusca, NomeDestaque } from './BuscaNome';

const separa = (v: string) => v.split(',').map((x) => x.trim()).filter(Boolean);

/**
 * Formação da dupla no Desvendando: cada um escolhe o nome no seu capacete. Piloto e copiloto são obrigatórios;
 * o engenheiro de pista só entra quando a turma for ímpar (trio). O valor é a lista na ordem dos papéis.
 */
export const CabineDupla: React.FC<{ alunos: string[] | null; ocupados?: string[]; value: string; onChange: (v: string) => void; avatares?: string[]; onAvatar?: (i: number, id: string) => void }> = ({ alunos, ocupados = [], value, onChange, avatares = [], onAvatar }) =>
  alunos ? <CabineLista alunos={alunos} ocupados={ocupados} value={value} onChange={onChange} avatares={avatares} onAvatar={onAvatar} /> : <CabineDigitada value={value} onChange={onChange} avatares={avatares} onAvatar={onAvatar} />;

const CabineLista: React.FC<{ alunos: string[]; ocupados: string[]; value: string; onChange: (v: string) => void; avatares: string[]; onAvatar?: (i: number, id: string) => void }> = ({ alunos, ocupados, value, onChange, avatares, onAvatar }) => {
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
              <CapaceteDaVez papel={papel} avatar={avatares[i]} size={80} className={nome || ativo ? '' : 'opacity-40 grayscale'} />
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
      {onAvatar && <EscolhaCapacetes papeis={ORDEM_PAPEIS.slice(0, vagas)} nomes={nomes} avatares={avatares} onChange={onAvatar} />}
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


/** Sala sem turma: cada papel tem um campo para digitar o nome (mesma ordem: piloto, copiloto, engenheiro). */
const CabineDigitada: React.FC<{ value: string; onChange: (v: string) => void; avatares: string[]; onAvatar?: (i: number, id: string) => void }> = ({ value, onChange, avatares, onAvatar }) => {
  const partes = value.split(',');
  const [trio, setTrio] = React.useState(partes.filter((x) => x.trim()).length > 2);
  const vagas = trio ? 3 : 2;
  const muda = (i: number, v: string) => {
    const novo = Array.from({ length: vagas }, (_, j) => (j === i ? v.replace(/,/g, ' ') : (partes[j] ?? '').trim()));
    onChange(novo.join(', '));
  };
  return (
    <div className="space-y-2">
      {ORDEM_PAPEIS.slice(0, vagas).map((papel, i) => (
        <label key={papel} className={`flex items-center gap-3 rounded-xl border p-2.5 ${PAPEIS[papel].borda} ${PAPEIS[papel].fundo}`}>
          <CapaceteDaVez papel={papel} avatar={avatares[i]} size={72} />
          <span className="min-w-0 flex-1">
            <span className={`block text-[11px] font-black uppercase tracking-wider ${PAPEIS[papel].texto}`}>{PAPEIS[papel].nome}</span>
            <input value={(partes[i] ?? '').trim()} onChange={(e) => muda(i, e.target.value)} maxLength={40} placeholder="Nome e sobrenome" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500" />
          </span>
        </label>
      ))}
      {onAvatar && <EscolhaCapacetes papeis={ORDEM_PAPEIS.slice(0, vagas)} nomes={partes.map((x) => x.trim())} avatares={avatares} onChange={onAvatar} />}
      <label className="flex items-center gap-2 text-xs text-slate-400">
        <input type="checkbox" checked={trio} onChange={(e) => { setTrio(e.target.checked); if (!e.target.checked) onChange(partes.slice(0, 2).join(',')); }} className="h-4 w-4 accent-violet-500" />
        Somos um trio (entra o engenheiro de pista)
      </label>
    </div>
  );
};
