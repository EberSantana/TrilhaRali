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
  Sheet,
  GraduationCap,
  MapPin
} from 'lucide-react';
import { ClassSessionState } from '../types';
import { IfsLogo } from './IfsLogo';

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
        color: 'bg-red-500/25 text-red-200 border-red-500/50 animate-pulse',
      };
    }
    switch (sessionState.activePhase) {
      case 'briefing':
        return { label: 'Fase 1: Briefing (0-15m)', color: 'bg-sky-500/20 text-sky-200 border-sky-500/40' };
      case 'sprint':
        return { label: 'Fase 2: Sprint SQL (15-85m)', color: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40' };
      case 'hard_stop':
        return { label: 'Fase 3: Hard Stop (85-90m)', color: 'bg-amber-500/20 text-amber-200 border-amber-500/40' };
      case 'debriefing':
        return { label: 'Fase 4: Debriefing (90-100m)', color: 'bg-purple-500/20 text-purple-200 border-purple-500/40' };
      default:
        return { label: 'Em Andamento', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const phase = getPhaseBadge();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-emerald-950/60 shadow-xl text-white">
      {/* Institutional Top Ribbon - Official IFS Colors & Supervision Attribution */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950/90 border-b border-emerald-800/40 px-4 py-1.5 text-[11px] sm:text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-1.5">
          {/* Institutional Heading */}
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-pulse" title="IFS Oficial" />
            <span className="font-bold text-white tracking-wide">INSTITUTO FEDERAL DE SERGIPE (IFS)</span>
            <span className="text-emerald-400">•</span>
            <span className="text-slate-300">Campus Tobias Barreto</span>
          </div>

          {/* Academic Attribution Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-700/50 shadow-sm">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span className="text-slate-300">
              Desenvolvido e Supervisionado pelo <strong className="text-emerald-200 font-bold">Professor Eber Santana</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Identity */}
          <div className="flex items-center space-x-3 shrink-0">
            <IfsLogo size="md" className="p-1 bg-white/5 rounded-xl border border-emerald-500/20" />
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                  Rali SQL <Sparkles className="w-4 h-4 text-emerald-400" />
                </span>
                <span className="inline-flex items-center text-[11px] uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold tracking-wider">
                  NTAG213 NFC
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                Dinâmica de 100 Minutos • Laboratório de BD
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'scanner'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <span>Scanner Aluno</span>
            </button>

            <button
              onClick={() => setActiveTab('projector')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'projector'
                  ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-700/30 ring-1 ring-emerald-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Tv className="w-4 h-4 text-emerald-300" />
              <span>Telão Ranking</span>
            </button>

            <button
              onClick={() => setActiveTab('debriefing')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'debriefing'
                  ? 'bg-purple-700 text-white shadow-lg shadow-purple-700/30 ring-1 ring-purple-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-purple-300" />
              <span>Debriefing</span>
            </button>

            <button
              onClick={() => setActiveTab('missions')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'missions'
                  ? 'bg-amber-700 text-white shadow-lg shadow-amber-700/30 ring-1 ring-amber-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Tag className="w-4 h-4 text-amber-300" />
              <span className="hidden xl:inline">50 Missões & Tags</span>
              <span className="xl:hidden">50 Missões</span>
            </button>

            <button
              onClick={() => setActiveTab('sql')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'sql'
                  ? 'bg-sky-700 text-white shadow-lg shadow-sky-700/30 ring-1 ring-sky-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Database className="w-4 h-4 text-sky-300" />
              <span className="hidden xl:inline">Banco SQLite</span>
              <span className="xl:hidden">SQLite</span>
            </button>

            <button
              onClick={() => setActiveTab('sheets')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'sheets'
                  ? 'bg-teal-700 text-white shadow-lg shadow-teal-700/30 ring-1 ring-teal-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
              title="Configuração Google Sheets e Apps Script"
            >
              <Sheet className="w-4 h-4 text-teal-300" />
              <span className="hidden sm:inline">Sheets</span>
            </button>
          </nav>

          {/* Controls: Room, Timer, Audio */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Room Button */}
            <button
              onClick={onOpenRoomsModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-600/40 text-xs font-bold transition truncate max-w-[170px] sm:max-w-[210px] shadow-sm"
              title="Gerenciar Salas do Rali e Integrantes das Equipes"
            >
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="truncate">{activeRoomName || 'Sala do Rali'}</span>
            </button>

            {/* Timer & Phase */}
            <div className="hidden lg:flex items-center space-x-2">
              <span className={`text-[11px] px-2.5 py-1 rounded-full border font-bold ${phase.color}`}>
                {phase.label}
              </span>
              <div className="flex items-center space-x-1 text-slate-200 bg-slate-900 px-2.5 py-1 rounded-xl border border-emerald-500/30 font-mono text-xs font-black shadow-inner">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{formatTimer(sessionState.timerSecondsRemaining)}</span>
              </div>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition"
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
