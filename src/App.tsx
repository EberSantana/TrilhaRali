/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { StudentScanner } from './components/StudentScanner';
import { ClassroomProjector } from './components/ClassroomProjector';
import { DebriefingView } from './components/DebriefingView';
import { MissionsCatalog } from './components/MissionsCatalog';
import { SqlPlayground } from './components/SqlPlayground';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { RoomsAndTeamsModal } from './components/RoomsAndTeamsModal';
import { TeacherAuthModal } from './components/TeacherAuthModal';
import { AboutView } from './components/AboutView';
import type { AppModule } from './components/ModuleSwitcher';
import { CtfModule } from './components/ctf/CtfModule';
import { RaliStudent } from './components/rali/RaliStudent';
import { RoomsPanel } from './components/rooms/RoomsPanel';
import { HomeLanding } from './components/HomeLanding';
import { TeacherHub } from './components/TeacherHub';
import { Team, SubmissionLog, ClassSessionState, RallyRoom } from './types';
import { IfsLogo } from './components/IfsLogo';
import { 
  getTeams, 
  saveTeams, 
  getLogs, 
  addLog, 
  getSessionState, 
  saveSessionState, 
  subscribeToSync, 
  resetActiveRoomData,
  getRooms,
  saveRooms,
  getActiveRoomId,
  setActiveRoomId,
  getActiveRoom,
  createNewRoom,
  updateRoom,
  deleteRoom,
  isTeacherAuthenticated,
  setTeacherAuthenticated
} from './utils/storage';
import { INITIAL_TEAMS } from './data/missions';
import { getMissions, refreshPublished } from './utils/missionsStore';
import { useRaliSession } from './utils/raliSession';
import { RaliTimerBar, useRaliLocked } from './components/common/RaliTimerBar';
import { getNextCaptureScore, getPositionBadge, CaptureScore } from './utils/scoring';
import { parseTagFromLocation } from './utils/tagLink';

function moduleFromLocation(hash: string, search: string): AppModule | null {
  if (hash.startsWith('#/professor/rali')) return 'prof-rali';
  if (hash.startsWith('#/professor/ctf')) return 'prof-ctf';
  if (hash.startsWith('#/professor/local')) return 'local';
  if (hash.startsWith('#/professor')) return 'professor';
  if (hash.startsWith('#/ctf')) return 'ctf';
  if (hash.startsWith('#/rali') || parseTagFromLocation(hash, search)) return 'rali';
  return null;
}

export default function App() {
  const [appModule, setAppModule] = useState<AppModule>(() => {
    if (typeof window === 'undefined') return 'home';
    const { hash, search } = window.location;
    return moduleFromLocation(hash, search) ?? 'home';
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>(() =>
    typeof window !== 'undefined' && parseTagFromLocation(window.location.hash, window.location.search) ? 'scanner' : 'projector'
  );
  // Tag pedida por link/QR/NFC (#/tag/tag_07): o scanner carrega a missão ao abrir
  const [pendingTag, setPendingTag] = useState<{ tag: string; nonce: number } | null>(() => {
    if (typeof window === 'undefined') return null;
    const t = parseTagFromLocation(window.location.hash, window.location.search);
    return t ? { tag: t, nonce: Date.now() } : null;
  });
  const [rooms, setRooms] = useState<RallyRoom[]>(getRooms);
  const [activeRoomId, setActiveRoomIdState] = useState<string>(getActiveRoomId);
  const [teams, setTeams] = useState<Team[]>(getTeams);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('equipe_a');
  const [logs, setLogs] = useState<SubmissionLog[]>(getLogs);
  const [sessionState, setSessionState] = useState<ClassSessionState>(getSessionState);
  const [isRoomsModalOpen, setIsRoomsModalOpen] = useState(false);
  // Cronômetro do Rali NFC e tema escolhidos pelo professor (lidos do servidor)
  const raliSession = useRaliSession();
  const raliLocked = useRaliLocked(raliSession);

  // Professor Mode & Access Control State
  const [isTeacher, setIsTeacher] = useState<boolean>(() => isTeacherAuthenticated());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTargetFeature, setAuthTargetFeature] = useState<string | undefined>(undefined);
  const [pendingTab, setPendingTab] = useState<ActiveTab | null>(null);

  // Sync state across multiple tabs or browser windows (Projector on PC + Scanner on phone)
  // Perguntas que o professor publicou para o Rali NFC (vêm da planilha; sem internet vale a última cópia)
  useEffect(() => {
    refreshPublished();
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshPublished();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const refreshFromStorage = useCallback(() => {
    const allRooms = getRooms();
    const currId = getActiveRoomId();
    setRooms(allRooms);
    setActiveRoomIdState(currId);
    setTeams(getTeams());
    setLogs(getLogs());
    setSessionState(getSessionState());
    setIsTeacher(isTeacherAuthenticated());
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToSync(refreshFromStorage);
    return () => {
      unsubscribe();
    };
  }, [refreshFromStorage]);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  // Room switching
  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    setActiveRoomIdState(roomId);
    refreshFromStorage();
  };

  // Create new room
  const handleCreateRoom = (nome: string, disciplina: string, anotacoes: string) => {
    const created = createNewRoom(nome, disciplina, anotacoes);
    refreshFromStorage();
    setSelectedTeamId(created.teams[0]?.id || 'equipe_a');
  };

  // Edit room
  const handleEditRoom = (roomId: string, updated: Partial<RallyRoom>) => {
    updateRoom(roomId, updated);
    refreshFromStorage();
  };

  // Delete room
  const handleDeleteRoom = (roomId: string) => {
    deleteRoom(roomId);
    refreshFromStorage();
  };

  // Toggle room status (ativa <-> finalizada)
  const handleToggleRoomStatus = (roomId: string) => {
    const updated = rooms.map((r) => {
      if (r.id === roomId) {
        return {
          ...r,
          status: r.status === 'ativa' ? ('finalizada' as const) : ('ativa' as const),
        };
      }
      return r;
    });
    setRooms(updated);
    saveRooms(updated);
    refreshFromStorage();
  };

  // Update team members (alunos, scanner_aluno, nome)
  const handleUpdateTeam = (teamId: string, updated: Partial<Team>) => {
    const updatedTeams = teams.map((team) => {
      if (team.id === teamId) {
        return { ...team, ...updated };
      }
      return team;
    });
    setTeams(updatedTeams);
    saveTeams(updatedTeams);
    refreshFromStorage();
  };

  // Troca de módulo mantém o endereço compartilhável (#/ctf)
  const MODULE_HASH: Record<AppModule, string> = {
    home: '', rali: '#/rali', ctf: '#/ctf', professor: '#/professor',
    'prof-rali': '#/professor/rali', 'prof-ctf': '#/professor/ctf', local: '#/professor/local',
  };
  const handleChangeModule = (next: AppModule) => {
    setAppModule(next);
    try {
      const url = `${window.location.pathname}${window.location.search}${MODULE_HASH[next]}`;
      window.history.pushState(null, '', url);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const onHash = () => {
      const t = parseTagFromLocation(window.location.hash, window.location.search);
      if (t) {
        setAppModule('rali');
        setPendingTag({ tag: t, nonce: Date.now() });
        return;
      }
      const m = moduleFromLocation(window.location.hash, window.location.search);
      setAppModule(m ?? 'home');
    };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);
    return () => { window.removeEventListener('hashchange', onHash); window.removeEventListener('popstate', onHash); };
  }, []);

  // Teacher Authentication Flow
  const handleOpenTeacherAuth = (featureName?: string, targetTab?: ActiveTab) => {
    setAuthTargetFeature(featureName);
    if (targetTab) {
      setPendingTab(targetTab);
    }
    setIsAuthModalOpen(true);
  };

  const handleAuthenticated = () => {
    setIsTeacher(true);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  const handleDeauthenticated = () => {
    setIsTeacher(false);
    // If on a teacher-only tab, switch back to projector or scanner
    if (['debriefing', 'missions', 'sql', 'sheets'].includes(activeTab)) {
      setActiveTab('scanner');
    }
  };

  // Handle valid submission from student scanner.
  // A posição de chegada e o XP são recalculados aqui, com o estado mais recente do armazenamento,
  // para que duas equipes enviando quase ao mesmo tempo não recebam a mesma posição.
  const handleValidSubmission = (teamId: string, tagId: string, baseXp: number, answer: string): CaptureScore | null => {
    const mission = getMissions().find((m) => m.tag_id === tagId);
    const freshTeams = getTeams();
    const current = freshTeams.find((t) => t.id === teamId);
    if (!current || current.missoes_concluidas.includes(tagId)) return null;

    const score = getNextCaptureScore(
      { tag_id: tagId, xp_valor: mission?.xp_valor ?? baseXp },
      freshTeams,
      getSessionState().scoringMode
    );

    const updatedTeams = freshTeams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          xp_total: team.xp_total + score.xp,
          missoes_concluidas: [...team.missoes_concluidas, tagId],
          ultimo_acerto: Date.now(),
          fogos_count: (team.fogos_count || 0) + (score.isFogo ? 1 : 0),
        };
      }
      return team;
    });

    setTeams(updatedTeams);
    saveTeams(updatedTeams);

    const mensagem =
      score.mode === 'ctf_dynamic'
        ? `${getPositionBadge(score.posicao)} ${score.posicao}º a capturar (+${score.xp} XP)!`
        : `Acertou a missão (+${score.xp} XP)!`;

    const newLog: SubmissionLog = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      equipe_id: teamId,
      equipe_nome: current.nome || 'Equipe',
      tag_id: tagId,
      pergunta_resumo: mission ? mission.pergunta.substring(0, 60) + '...' : '',
      resposta_aluno: answer,
      correto: true,
      xp_ganho: score.xp,
      mensagem,
      autor_aluno: current.scanner_aluno,
      ...(score.mode === 'ctf_dynamic' ? { posicao_captura: score.posicao, is_fogo: score.isFogo } : {}),
    };

    addLog(newLog);
    setLogs((prev) => [newLog, ...prev]);
    return score;
  };

  // Handle invalid submission
  const handleInvalidSubmission = (teamId: string, tagId: string, answer: string) => {
    const mission = getMissions().find((m) => m.tag_id === tagId);
    const updatedTeams = teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          erros_count: team.erros_count + 1,
        };
      }
      return team;
    });

    setTeams(updatedTeams);
    saveTeams(updatedTeams);

    const team = teams.find((t) => t.id === teamId);
    const newLog: SubmissionLog = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      equipe_id: teamId,
      equipe_nome: team?.nome || 'Equipe',
      tag_id: tagId,
      pergunta_resumo: mission ? mission.pergunta.substring(0, 60) + '...' : '',
      resposta_aluno: answer,
      correto: false,
      xp_ganho: 0,
      mensagem: 'Resposta incorreta. Tente novamente!',
      autor_aluno: team?.scanner_aluno,
    };

    addLog(newLog);
    setLogs((prev) => [newLog, ...prev]);
  };

  // Sound toggle
  const handleToggleSound = () => {
    const newSound = !sessionState.soundEnabled;
    const newState = { ...sessionState, soundEnabled: newSound };
    setSessionState(newState);
    saveSessionState({ soundEnabled: newSound });
  };

  // Reset session
  const handleResetSession = () => {
    if (window.confirm('Atenção: Isso irá zerar todas as pontuações e histórico desta sala. Deseja continuar?')) {
      resetActiveRoomData();
      refreshFromStorage();
    }
  };

  // Tab switching with role protection
  const handleTabSwitch = (tab: ActiveTab) => {
    const teacherOnlyTabs: ActiveTab[] = ['debriefing', 'missions', 'sql', 'sheets'];
    if (teacherOnlyTabs.includes(tab) && !isTeacher) {
      handleOpenTeacherAuth(`Acesso a ${tab.toUpperCase()}`, tab);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">

      {appModule === 'home' ? (
        <main className="flex-1 pb-16">
          <HomeLanding
            isTeacher={isTeacher}
            onOpenRali={() => handleChangeModule('rali')}
            onOpenCtf={() => handleChangeModule('ctf')}
            onOpenTeacher={() => handleChangeModule('professor')}
          />
        </main>
      ) : appModule === 'rali' ? (
        <main className="flex-1 pb-16">
          <RaliStudent
            pendingTag={pendingTag}
            onTagConsumed={() => {
              setPendingTag(null);
              try {
                window.history.replaceState(null, '', `${window.location.pathname}#/rali`);
              } catch {
                // ignore
              }
            }}
          />
        </main>
      ) : appModule === 'ctf' ? (
        <main className="flex-1 pb-16">
          <CtfModule />
        </main>
      ) : appModule === 'prof-rali' && isTeacher ? (
        <main className="flex-1 pb-16">
          <RoomsPanel
            tipo="rali"
            onBack={() => handleChangeModule('professor')}
            tools={
              <button
                type="button"
                onClick={() => { setActiveTab('missions'); handleChangeModule('local'); }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                Etiquetas NFC e QR
              </button>
            }
          />
        </main>
      ) : appModule === 'prof-ctf' && isTeacher ? (
        <main className="flex-1 pb-16">
          <RoomsPanel tipo="ctf" onBack={() => handleChangeModule('professor')} />
        </main>
      ) : appModule === 'professor' || appModule === 'prof-rali' || appModule === 'prof-ctf' ? (
        <main className="flex-1 pb-16">
          <TeacherHub
            isTeacher={isTeacher}
            onHome={() => handleChangeModule('home')}
            onRequireTeacher={() => handleOpenTeacherAuth('Área do Professor')}
            onOpenProjector={() => { setActiveTab('projector'); handleChangeModule('local'); }}
            onOpenMissions={() => { setActiveTab('missions'); handleChangeModule('local'); }}
            onOpenDebriefing={() => { setActiveTab('debriefing'); handleChangeModule('local'); }}
            onOpenSql={() => { setActiveTab('sql'); handleChangeModule('local'); }}
            onOpenSheets={() => { setActiveTab('sheets'); handleChangeModule('local'); }}
            onOpenRaliRooms={() => handleChangeModule('prof-rali')}
            onOpenCtfRooms={() => handleChangeModule('prof-ctf')}
            onOpenAccount={() => handleOpenTeacherAuth('PIN e sessão')}
          />
        </main>
      ) : (
        <>
      {/* Rali local (sem servidor): volta ao painel do professor */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
          <button onClick={() => handleChangeModule('professor')} className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white">← Painel do professor</button>
        </div>
      </div>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabSwitch}
        sessionState={sessionState}
        onToggleSound={handleToggleSound}
        activeRoomName={activeRoom?.nome}
        onOpenRoomsModal={() => {
          if (!isTeacher) {
            handleOpenTeacherAuth('Gestão de Salas e Turmas');
          } else {
            setIsRoomsModalOpen(true);
          }
        }}
        isTeacher={isTeacher}
        onOpenTeacherAuth={handleOpenTeacherAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'scanner' && <RaliTimerBar session={raliSession} />}
        {activeTab === 'scanner' && (
          <StudentScanner
            teams={teams}
            selectedTeamId={selectedTeamId}
            onSelectTeam={setSelectedTeamId}
            onValidSubmission={handleValidSubmission}
            onFailedSubmission={handleInvalidSubmission}
            sessionState={raliLocked && !sessionState.isSubmissionsLocked ? { ...sessionState, isSubmissionsLocked: true } : sessionState}
            logs={logs}
            pendingTag={pendingTag}
            onTagConsumed={() => {
              setPendingTag(null);
              try {
                window.history.replaceState(null, '', `${window.location.pathname}`);
              } catch {
                // ignore
              }
            }}
          />
        )}

        {activeTab === 'projector' && (
          <ClassroomProjector
            teams={teams}
            logs={logs}
            sessionState={sessionState}
            onUpdateSession={(partial: Partial<ClassSessionState>) => {
              const updated = { ...sessionState, ...partial };
              setSessionState(updated);
              saveSessionState(partial);
            }}
            onAdjustTeamXp={(teamId: string, deltaXp: number) => {
              const updated = teams.map((t) => {
                if (t.id === teamId) {
                  return { ...t, xp_total: Math.max(0, t.xp_total + deltaXp) };
                }
                return t;
              });
              setTeams(updated);
              saveTeams(updated);
              refreshFromStorage();
            }}
            onResetSession={handleResetSession}
            activeRoomName={activeRoom?.nome}
            onOpenRoomsModal={() => {
              if (!isTeacher) {
                handleOpenTeacherAuth('Gestão de Salas e Turmas');
              } else {
                setIsRoomsModalOpen(true);
              }
            }}
            isTeacher={isTeacher}
            onRequireTeacher={() => handleOpenTeacherAuth('Modo de Pontuação')}
          />
        )}

        {activeTab === 'debriefing' && (
          <DebriefingView logs={logs} />
        )}

        {activeTab === 'missions' && (
          <MissionsCatalog />
        )}

        {activeTab === 'sql' && (
          <SqlPlayground />
        )}

        {activeTab === 'sheets' && (
          <GoogleSheetsModal teams={teams} />
        )}

        {activeTab === 'about' && (
          <AboutView onNavigateToTab={handleTabSwitch} />
        )}
      </main>
        </>
      )}

      {/* Modal de Salas & Alunos por Equipe */}
      {isRoomsModalOpen && (
        <RoomsAndTeamsModal
          rooms={rooms}
          activeRoomId={activeRoomId}
          onSelectRoom={handleSelectRoom}
          onCreateRoom={handleCreateRoom}
          onEditRoom={handleEditRoom}
          onDeleteRoom={handleDeleteRoom}
          onUpdateTeam={handleUpdateTeam}
          onToggleRoomStatus={handleToggleRoomStatus}
          onClose={() => setIsRoomsModalOpen(false)}
        />
      )}

      {/* Modal de Autenticação do Professor (PIN) */}
      <TeacherAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingTab(null);
        }}
        isTeacher={isTeacher}
        onAuthenticated={handleAuthenticated}
        onDeauthenticated={handleDeauthenticated}
        targetFeatureName={authTargetFeature}
      />

      {/* Footer Institucional IFS */}
      <footer className="border-t border-emerald-950/80 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <IfsLogo size="sm" />
            <div className="flex flex-col text-left">
              <span className="font-bold text-slate-200">
                Instituto Federal de Sergipe (IFS) • Campus Tobias Barreto
              </span>
              <span className="text-emerald-400 font-medium">
                Desenvolvido e Supervisionado pelo Professor Eber Santana
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-right font-mono text-[11px] text-slate-400">
            <span>Salas & Equipes de Alunos</span>
            <span className="text-red-400 font-bold">• IFS 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
