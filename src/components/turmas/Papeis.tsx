import React, { useEffect, useState } from 'react';
import { Repeat } from 'lucide-react';
import { PAPEIS, type Papel } from './Capacete';
import { CapaceteDaVez } from './Avatares';
import { NomeDestaque } from './BuscaNome';

/** Como os papéis funcionam na sala: '' = sem papéis; rodízio = giram a cada acerto; fixos; dupla = os alunos trocam. */
export type ModoPapeis = '' | 'individual' | 'rodizio' | 'fixos' | 'dupla';

const OPCOES: { id: ModoPapeis; titulo: string; texto: string }[] = [
  { id: '', titulo: 'Sem papéis (individual)', texto: 'Cada aluno joga sozinho, escolhendo o nome e o capacete.' },
  { id: 'individual', titulo: 'Individual', texto: 'Cada aluno joga sozinho, com o seu capacete.' },
  { id: 'rodizio', titulo: 'Rodízio automático', texto: 'Os papéis trocam a cada acerto. Todos praticam as funções.' },
  { id: 'fixos', titulo: 'Papéis fixos', texto: 'Quem escolheu piloto fica piloto até o fim.' },
  { id: 'dupla', titulo: 'A dupla decide', texto: 'Aparece um botão "Trocar papéis" para eles usarem quando quiserem.' },
];

/** Escolha do professor ao criar a sala (Desvendando, Rali NFC e CTF). */
export const SeletorPapeis: React.FC<{ value: ModoPapeis; onChange: (m: ModoPapeis) => void; semPapeis?: boolean; individual?: boolean; quem?: string }> = ({ value, onChange, semPapeis = true, individual = false, quem = 'dupla' }) => (
  <fieldset className="space-y-1.5">
    <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
      Papéis da {quem}
    </legend>
    <div className="grid gap-1.5 sm:grid-cols-2">
      {OPCOES.filter((o) => (semPapeis || o.id !== '') && (individual || o.id !== 'individual')).map((o) => {
        const on = value === o.id;
        return (
          <label key={o.id || 'nenhum'} className={`flex cursor-pointer gap-2 rounded-xl border p-2.5 text-sm ${on ? 'border-violet-400 bg-violet-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}>
            <input type="radio" name="papeis" checked={on} onChange={() => onChange(o.id)} className="mt-0.5 h-4 w-4 accent-violet-500" />
            <span>
              <span className="block font-bold text-white">{o.titulo}</span>
              <span className="block text-xs text-slate-400">{o.texto}</span>
            </span>
          </label>
        );
      })}
    </div>
  </fieldset>
);

const ORDEM: Papel[] = ['piloto', 'copiloto', 'engenheiro'];

/** Papel de cada nome nesta rodada (os três primeiros têm capacete; os demais são "equipe de box"). */
export function papeisDaVez(nomes: string[], rodada: number) {
  const n = nomes.length;
  return nomes.map((_, i) => ({ nome: nomes[(i + rodada) % n], papel: (ORDEM[i] ?? null) as Papel | null }));
}

const lerTroca = (k: string) => {
  try {
    return Number(localStorage.getItem(k)) || 0;
  } catch {
    return 0;
  }
};

/**
 * Faixa "Cabine" na tela do jogo: quem pilota agora. rodadaAuto = acertos/casos resolvidos (usado no rodízio).
 * No modo "dupla decide", o botão Trocar papéis gira os papéis e a escolha fica salva neste aparelho.
 */
export const FaixaCabine: React.FC<{ nomes: string[]; modo: ModoPapeis; rodadaAuto: number; chave: string; rotulo?: string; avatares?: string[] }> = ({ nomes, modo, rodadaAuto, chave, rotulo = 'Cabine', avatares = [] }) => {
  const k = `rali_papeis_troca_${chave}`;
  const [troca, setTroca] = useState(() => lerTroca(k));
  useEffect(() => setTroca(lerTroca(k)), [k]);
  if (!modo || nomes.length < 2) return null;
  const rodada = modo === 'rodizio' ? rodadaAuto : modo === 'dupla' ? troca : 0;
  const lista = papeisDaVez(nomes, rodada);
  const comPapel = lista.filter((x) => x.papel) as { nome: string; papel: Papel }[];
  const box = lista.filter((x) => !x.papel).map((x) => x.nome);
  const trocar = () => {
    const v = troca + 1;
    setTroca(v);
    try {
      localStorage.setItem(k, String(v));
    } catch {
      /* navegador sem armazenamento: troca só nesta tela */
    }
  };
  return (
    <section aria-label="Cabine: papéis da vez" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
          {rotulo} · {modo === 'rodizio' ? 'rodízio a cada acerto' : modo === 'fixos' ? 'papéis fixos' : 'vocês decidem'}
        </p>
        {modo === 'rodizio' && rodadaAuto > 0 && <p className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-amber-300">Troquem de lugar!</p>}
        {modo === 'dupla' && (
          <button type="button" onClick={trocar} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1 text-xs font-bold text-slate-200 hover:bg-slate-800">
            <Repeat className="h-3.5 w-3.5" /> Trocar papéis
          </button>
        )}
      </div>
      <ul className={`grid gap-2 ${comPapel.length > 2 ? 'sm:grid-cols-3' : 'grid-cols-2'}`}>
        {comPapel.map(({ nome, papel }) => (
          <li key={papel} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${PAPEIS[papel].borda} ${PAPEIS[papel].fundo}`} title={PAPEIS[papel].funcao}>
            <CapaceteDaVez papel={papel} avatar={avatares[nomes.indexOf(nome)]} size={64} />
            <div className="min-w-0">
              <p className={`text-xs font-black uppercase tracking-wider ${PAPEIS[papel].texto}`}><span aria-hidden>{PAPEIS[papel].forma} </span>{PAPEIS[papel].nome}</p>
              <p className="truncate text-base">
                <NomeDestaque nome={nome} />
              </p>
            </div>
          </li>
        ))}
      </ul>
      {box.length > 0 && <p className="mt-2 text-xs text-slate-400">Equipe de box: {box.join(', ')}</p>}
      <p className="mt-2 text-xs text-slate-500">
        Piloto: {PAPEIS.piloto.funcao.toLowerCase()} Copiloto: {PAPEIS.copiloto.funcao.toLowerCase()}
      </p>
    </section>
  );
};
