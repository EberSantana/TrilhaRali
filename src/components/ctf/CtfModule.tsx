import React, { useEffect, useState } from 'react';
import { GraduationCap, Lock, ShieldCheck } from 'lucide-react';
import { CtfStudent } from './CtfStudent';
import { CtfTeacher } from './CtfTeacher';

interface CtfModuleProps {
  isTeacher: boolean;
  onRequireTeacher: () => void;
}

export const CtfModule: React.FC<CtfModuleProps> = ({ isTeacher, onRequireTeacher }) => {
  const [view, setView] = useState<'student' | 'teacher'>('student');
  const [wantsTeacher, setWantsTeacher] = useState(false);

  // Depois de digitar o PIN, abre o painel que o professor tinha pedido
  useEffect(() => {
    if (wantsTeacher && isTeacher) {
      setView('teacher');
      setWantsTeacher(false);
    }
    if (!isTeacher && view === 'teacher') setView('student');
  }, [wantsTeacher, isTeacher, view]);

  const openTeacher = () => {
    if (isTeacher) {
      setView('teacher');
    } else {
      setWantsTeacher(true);
      onRequireTeacher();
    }
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 pt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span>
            <strong className="text-slate-200">CTF SQL</strong> • avance de fase resolvendo a fase atual
          </span>
        </div>
        <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1 gap-1" role="tablist" aria-label="Perfil">
          <button
            role="tab"
            aria-selected={view === 'student'}
            onClick={() => setView('student')}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${view === 'student' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Sou aluno
          </button>
          <button
            role="tab"
            aria-selected={view === 'teacher'}
            onClick={openTeacher}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${view === 'teacher' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {isTeacher ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
            Professor
          </button>
        </div>
      </div>

      {view === 'teacher' && isTeacher ? <CtfTeacher /> : <CtfStudent />}
    </div>
  );
};
