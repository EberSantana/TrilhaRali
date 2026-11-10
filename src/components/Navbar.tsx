import React from 'react';
import { 
  Smartphone, 
  Tv, 
  HelpCircle, 
  Tag, 
  Database, 
  Volume2, 
  VolumeX, 
  Sheet,
  GraduationCap,
  MapPin,
  Info
} from 'lucide-react';
import { ClassSessionState } from '../types';
import { IfsLogo } from './IfsLogo';

export type ActiveTab = 'scanner' | 'projector' | 'debriefing' | 'missions' | 'sql' | 'sheets' | 'about';

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
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-emerald-900/40 shadow-xl text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand & Identity: IFS + Rali SQL + Prof. Eber Santana */}
          <div className="flex items-center space-x-3 shrink-0">
            <IfsLogo size="md" className="p-1 bg-white/5 rounded-xl border border-emerald-500/20" />
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white">
                  Rali SQL
                </span>
                <span className="inline-flex items-center text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold tracking-wider">
                  NTAG213 NFC
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <span>IFS Tobias Barreto</span>
                <span className="text-emerald-500">•</span>
                <span className="text-emerald-300 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-emerald-400 shrink-0" />
                  Prof. Eber Santana
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs - Clean, unified and responsive */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('projector')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'projector'
                  ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-700/30 ring-1 ring-emerald-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Tv className="w-4 h-4 text-emerald-300" />
              <span>Telão</span>
            </button>

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
              <span>50 Missões</span>
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
              <span className="hidden sm:inline">SQLite</span>
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

            {/* Nova Aba Sobre */}
            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'about'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400/50'
                  : 'text-emerald-300 hover:text-white hover:bg-slate-900 border border-emerald-800/30'
              }`}
              title="Sobre o Projeto, Metodologia e Créditos do Professor"
            >
              <Info className="w-4 h-4 text-emerald-400" />
              <span>Sobre</span>
            </button>
          </nav>

          {/* Quick Actions: Room Selector & Audio Toggle */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Room Button */}
            <button
              onClick={onOpenRoomsModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40 text-xs font-bold transition truncate max-w-[170px] sm:max-w-[220px] shadow-sm"
              title="Gerenciar Salas do Rali e Integrantes das Equipes"
            >
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="truncate">{activeRoomName || 'Sala do Rali'}</span>
            </button>

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
