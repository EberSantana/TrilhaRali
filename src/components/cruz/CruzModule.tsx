import React, { useState } from 'react';
import { Puzzle, Trophy, Users } from 'lucide-react';
import { CtfStudent } from '../ctf/CtfStudent';
import { CruzTreino } from './CruzTreino';
import { CruzRanking } from './CruzRanking';

type Aba = 'sala' | 'treino' | 'ranking';

/**
 * Cruzada Online: ambiente próprio, separado do CTF. Duas formas de jogar:
 * sala da turma (token do professor, ranking e telão) ou treino livre (o aluno escolhe o assunto, sem ranking).
 */
export const CruzModule: React.FC = () => {
  const [aba, setAba] = useState<Aba>('sala');
  const botao = (id: Aba, label: string, icone: React.ReactNode) => (
    <button
      type="button"
      role="tab"
      aria-selected={aba === id}
      onClick={() => setAba(id)}
      className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
        aba === id ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
      }`}
    >
      {icone}
      {label}
    </button>
  );
  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
      <div role="tablist" aria-label="Como jogar a Cruzada Online" className="max-w-lg mx-auto flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
        {botao('sala', 'Sala da turma', <Users className="w-4 h-4" />)}
        {botao('treino', 'Treino livre', <Puzzle className="w-4 h-4" />)}
        {botao('ranking', 'Ranking', <Trophy className="w-4 h-4" />)}
      </div>
      {aba === 'sala' && <CtfStudent modulo="cruz" />}
      {aba === 'treino' && <div className="pt-6"><CruzTreino onRanking={() => setAba('ranking')} /></div>}
      {aba === 'ranking' && <div className="pt-6"><CruzRanking /></div>}
    </div>
  );
};
