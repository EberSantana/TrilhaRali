import React, { useState } from 'react';
import { Puzzle, Trophy, Users } from 'lucide-react';
import { CtfStudent } from '../ctf/CtfStudent';
import { CruzTreino } from './CruzTreino';
import { CruzRanking } from './CruzRanking';
import { ModuleTabs } from '../common/ModuleShell';

type Aba = 'sala' | 'treino' | 'ranking';

/**
 * Cruzada Online: ambiente próprio, separado do CTF. Duas formas de jogar:
 * sala da turma (token do professor, ranking e telão) ou treino livre (o aluno escolhe o assunto, sem ranking).
 */
export const CruzModule: React.FC = () => {
  const [aba, setAba] = useState<Aba>('sala');
  return (
    <div>
      <ModuleTabs<Aba>
        accent="cyan"
        label="Como jogar a Cruzada Online"
        value={aba}
        onChange={setAba}
        tabs={[
          { id: 'sala', label: 'Sala da turma', icon: <Users className="w-4 h-4" /> },
          { id: 'treino', label: 'Treino livre', icon: <Puzzle className="w-4 h-4" /> },
          { id: 'ranking', label: 'Ranking', icon: <Trophy className="w-4 h-4" /> },
        ]}
      />
      {aba === 'sala' && <div className="pt-4"><CtfStudent modulo="cruz" /></div>}
      {aba === 'treino' && <div className="pt-6"><CruzTreino onRanking={() => setAba('ranking')} /></div>}
      {aba === 'ranking' && <div className="pt-6"><CruzRanking /></div>}
    </div>
  );
};
