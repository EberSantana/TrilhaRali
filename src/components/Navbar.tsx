import React from 'react';
import { 
  Smartphone, 
  Tv, 
  HelpCircle, 
  Tag, 
  Database, 
  Clock, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Sheet
} from 'lucide-react';
import { ClassSessionState } from '../types';

export type ActiveTab = 'scanner' | 'projector' | 'debriefing' | 'missions' | 'sql' | 'sheets';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  sessionState: ClassSessionState;
  onToggleSound: () => void;
  activeRoomName?: string;
  onOpenRoomsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  sessionState,
  onToggleSound,
  activeRoomName,
  onOpenRoomsModal,
}) => {
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseBadge = () => {
    if (sessionState.isSubmissionsLocked) {
      return {
        label: 'MÃOS PARA CIMA (BLOQUEADO)',
        color: 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse',
      };
    }
    switch (sessionState.activePhase) {
      case 'briefing':
        return { label: 'Fase 1: Briefing (0-15m)', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      case 'sprint':
        return { label: 'Fase 2: Sprint SQL (15-85m)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'hard_stop':
        return { label: 'Fase 3: Hard Stop (85-90m)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'debriefing':
        return { label: 'Fase 4: Debriefing (90-100m)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      default:
        return { label: 'Em Andamento', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const phase = getPhaseBadge();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Header */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-xl tracking-tighter text-white">
              IFS
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                  Rali SQL <Sparkles className="w-4 h-4 text-emerald-400" />
                </span>
                <span className="hidden md:inline-block text-xs uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  NTAG213 NFC
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Campus Tobias Barreto • 100 Minutos</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'scanner'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Scanner Aluno</span>
            </button>

            <button
              onClick={() => setActiveTab('projector')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'projector'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>Telão Ranking</span>
            </button>

            <button
              onClick={() => setActiveTab('debriefing')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'debriefing'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Debriefing</span>
            </button>

            <button
              onClick={() => setActiveTab('missions')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'missions'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span className="hidden lg:inline">50 Missões & Tags</span>
              <span className="lg:hidden">50 Missões</span>
            </button>

            <button
              onClick={() => setActiveTab('sql')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'sql'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span className="hidden lg:inline">Banco SQLite</span>
              <span className="lg:hidden">SQL</span>
            </button>

            <button
              onClick={() => setActiveTab('sheets')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'sheets'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Configuração Google Sheets e Apps Script"
            >
              <Sheet className="w-4 h-4" />
              <span className="hidden sm:inline">Sheets</span>
            </button>
          </nav>

          {/* Quick Info & Audio Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Room Badge Button */}
            <button
              onClick={onOpenRoomsModal}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition truncate max-w-[150px] sm:max-w-[200px]"
              title="Gerenciar Salas do Rali e Integrantes das Equipes"
            >
              <span className="truncate">📍 {activeRoomName || 'Sala do Rali'}</span>
            </button>

            {/* Phase & Timer Pill */}
            <div className="hidden md:flex items-center space-x-2">
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${phase.color}`}>
                {phase.label}
              </span>
              <div className="flex items-center space-x-1 text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 font-mono text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{formatTimer(sessionState.timerSecondsRemaining)}</span>
              </div>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={sessionState.soundEnabled ? 'Silenciar Áudio' : 'Ativar Sons do Rali'}
              aria-label="Controle de Áudio"
            >
              {sessionState.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
