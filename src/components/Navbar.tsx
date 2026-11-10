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
  Info,
  Lock,
  ShieldCheck
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
  isTeacher: boolean;
  onOpenTeacherAuth: (featureName?: string) => void;
}

const RESTRICTED_TABS: Partial<Record<ActiveTab, string>> = {
  debriefing: 'Debriefing & Gabarito Oficial',
  missions: 'Banco Completo de 50 Missões',
  sql: 'Playground SQLite',
  sheets: 'Integração Google Sheets & Apps Script',
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  sessionState,
  onToggleSound,
  activeRoomName,
  onOpenRoomsModal,
  isTeacher,
  onOpenTeacherAuth,
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    const restrictedLabel = RESTRICTED_TABS[tab];
    if (!isTeacher && restrictedLabel) {
      onOpenTeacherAuth(restrictedLabel);
      return;
    }
    setActiveTab(tab);
  };

  const handleRoomsClick = () => {
    if (!isTeacher) {
      onOpenTeacherAuth('Gestão de Salas do Rali e Equipes');
      return;
    }
    onOpenRoomsModal();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-emerald-900/40 shadow-xl text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand & Identity: IFS + Rali IFSTB + Prof. Eber Santana */}
          <div className="flex items-center space-x-3 shrink-0">
            <IfsLogo size="md" className="p-1 bg-white/5 rounded-xl border border-emerald-500/20" />
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white">
                  Rali IFSTB
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

          {/* Navigation Tabs - Role-Aware (Student vs Professor) */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
            {/* Telão */}
            <button
              onClick={() => handleTabClick('projector')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'projector'
                  ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-700/30 ring-1 ring-emerald-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Tv className="w-4 h-4 text-emerald-300" />
              <span>Telão</span>
            </button>

            {/* Scanner Aluno */}
            <button
              onClick={() => handleTabClick('scanner')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'scanner'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <span>Scanner Aluno</span>
            </button>

            {/* Debriefing (Restrito ao Professor) */}
            <button
              onClick={() => handleTabClick('debriefing')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'debriefing'
                  ? 'bg-purple-700 text-white shadow-lg shadow-purple-700/30 ring-1 ring-purple-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
              title={!isTeacher ? 'Restrito ao Professor (Requer PIN)' : 'Debriefing e Gabaritos Oficiais'}
            >
              <HelpCircle className="w-4 h-4 text-purple-300" />
              <span>Debriefing</span>
              {!isTeacher && <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />}
            </button>

            {/* 50 Missões (Restrito ao Professor) */}
            <button
              onClick={() => handleTabClick('missions')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'missions'
                  ? 'bg-amber-700 text-white shadow-lg shadow-amber-700/30 ring-1 ring-amber-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
              title={!isTeacher ? 'Restrito ao Professor (Requer PIN)' : 'Banco das 50 Missões SQL'}
            >
              <Tag className="w-4 h-4 text-amber-300" />
              <span>50 Missões</span>
              {!isTeacher && <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />}
            </button>

            {/* SQLite (Restrito ao Professor) */}
            <button
              onClick={() => handleTabClick('sql')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'sql'
                  ? 'bg-sky-700 text-white shadow-lg shadow-sky-700/30 ring-1 ring-sky-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
              title={!isTeacher ? 'Restrito ao Professor (Requer PIN)' : 'Console SQLite Pedagógico'}
            >
              <Database className="w-4 h-4 text-sky-300" />
              <span className="hidden sm:inline">SQLite</span>
              {!isTeacher && <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />}
            </button>

            {/* Sheets (Restrito ao Professor) */}
            <button
              onClick={() => handleTabClick('sheets')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'sheets'
                  ? 'bg-teal-700 text-white shadow-lg shadow-teal-700/30 ring-1 ring-teal-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
              title={!isTeacher ? 'Restrito ao Professor (Requer PIN)' : 'Configuração Google Sheets e Apps Script'}
            >
              <Sheet className="w-4 h-4 text-teal-300" />
              <span className="hidden sm:inline">Sheets</span>
              {!isTeacher && <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />}
            </button>

            {/* Aba Sobre */}
            <button
              onClick={() => handleTabClick('about')}
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

          {/* Quick Actions: Professor Mode Indicator, Room Selector & Audio Toggle */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Teacher Auth Indicator Button */}
            <button
              onClick={() => onOpenTeacherAuth()}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm border ${
                isTeacher
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                  : 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-950/70'
              }`}
              title={isTeacher ? 'Modo Professor Ativo (Clique para gerenciar ou bloquear)' : 'Clique para entrar no Modo Professor'}
            >
              {isTeacher ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden md:inline">Prof. Eber</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                    Ativo
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">Acesso Prof</span>
                </>
              )}
            </button>

            {/* Room Button (Restricted to Teacher) */}
            <button
              onClick={handleRoomsClick}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition truncate max-w-[150px] sm:max-w-[200px] shadow-sm"
              title={!isTeacher ? 'Salas do Rali (Restrito ao Professor)' : 'Gerenciar Salas do Rali e Integrantes das Equipes'}
            >
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="truncate">{activeRoomName || 'Sala do Rali'}</span>
              {!isTeacher && <Lock className="w-3 h-3 text-amber-400/80 ml-0.5 shrink-0" />}
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
