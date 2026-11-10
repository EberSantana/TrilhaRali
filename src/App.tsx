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
  createNewRoom
} from './utils/storage';
import { ALL_MISSIONS, INITIAL_TEAMS } from './data/missions';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('projector');
  const [rooms, setRooms] = useState<RallyRoom[]>(getRooms);
  const [activeRoomId, setActiveRoomIdState] = useState<string>(getActiveRoomId);
  const [teams, setTeams] = useState<Team[]>(getTeams);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('equipe_a');
  const [logs, setLogs] = useState<SubmissionLog[]>(getLogs);
  const [sessionState, setSessionState] = useState<ClassSessionState>(getSessionState);
  const [isRoomsModalOpen, setIsRoomsModalOpen] = useState(false);

  // Sync state across multiple tabs or browser windows (Projector on PC + Scanner on phone)
  const refreshFromStorage = useCallback(() => {
    const allRooms = getRooms();
    const currId = getActiveRoomId();
    setRooms(allRooms);
    setActiveRoomIdState(currId);
    setTeams(getTeams());
    setLogs(getLogs());
    setSessionState(getSessionState());
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
  };

  // Handle valid submission from student scanner
  const handleValidSubmission = (teamId: string, tagId: string, xpGained: number, answer: string) => {
    const mission = ALL_MISSIONS.find((m) => m.tag_id === tagId);
    const updatedTeams = teams.map((team) => {
      if (team.id === teamId) {
        const alreadyDone = team.missoes_concluidas.includes(tagId);
        if (alreadyDone) return team;
        return {
          ...team,
          xp_total: team.xp_total + xpGained,
          missoes_concluidas: [...team.missoes_concluidas, tagId],
          ultimo_acerto: Date.now(),
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
      correto: true,
      xp_ganho: xpGained,
      mensagem: `Acertou a missão (+${xpGained} XP)!`,
      autor_aluno: team?.scanner_aluno,
    };

    addLog(newLog);
    setLogs((prev) => [newLog, ...prev]);
  };

  // Handle failed submission from student scanner
  const handleFailedSubmission = (teamId: string, tagId: string, answer: string) => {
    const mission = ALL_MISSIONS.find((m) => m.tag_id === tagId);
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

  // Adjust team XP manually by professor
  const handleAdjustTeamXp = (teamId: string, deltaXp: number) => {
    const updatedTeams = teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          xp_total: Math.max(0, team.xp_total + deltaXp),
        };
      }
      return team;
    });

    setTeams(updatedTeams);
    saveTeams(updatedTeams);
  };

  // Update session state
  const handleUpdateSession = (newState: Partial<ClassSessionState>) => {
    setSessionState((prev) => {
      const merged = { ...prev, ...newState };
      saveSessionState(merged);
      return merged;
    });
  };

  // Reset current room session
  const handleResetSession = () => {
    if (window.confirm(`Tem certeza que deseja zerar os pontos e o cronômetro da sala "${activeRoom?.nome}"?`)) {
      resetActiveRoomData();
      refreshFromStorage();
    }
  };

  const handleToggleSound = () => {
    handleUpdateSession({ soundEnabled: !sessionState.soundEnabled });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sessionState={sessionState}
        onToggleSound={handleToggleSound}
        activeRoomName={activeRoom?.nome}
        onOpenRoomsModal={() => setIsRoomsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {activeTab === 'scanner' && (
          <StudentScanner
            teams={teams}
            selectedTeamId={selectedTeamId}
            onSelectTeam={setSelectedTeamId}
            onValidSubmission={handleValidSubmission}
            onFailedSubmission={handleFailedSubmission}
            sessionState={sessionState}
          />
        )}

        {activeTab === 'projector' && (
          <ClassroomProjector
            teams={teams}
            logs={logs}
            sessionState={sessionState}
            onUpdateSession={handleUpdateSession}
            onAdjustTeamXp={handleAdjustTeamXp}
            onResetSession={handleResetSession}
            activeRoomName={activeRoom?.nome}
            onOpenRoomsModal={() => setIsRoomsModalOpen(true)}
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
      </main>

      {/* Modal de Salas & Alunos por Equipe */}
      {isRoomsModalOpen && (
        <RoomsAndTeamsModal
          rooms={rooms}
          activeRoomId={activeRoomId}
          onSelectRoom={handleSelectRoom}
          onCreateRoom={handleCreateRoom}
          onUpdateTeam={handleUpdateTeam}
          onToggleRoomStatus={handleToggleRoomStatus}
          onClose={() => setIsRoomsModalOpen(false)}
        />
      )}

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
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/40 text-emerald-300">
              50 Missões NTAG213 NFC
            </span>
            <span>Salas & Equipes de Alunos</span>
            <span className="text-red-400 font-bold">• IFS 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
