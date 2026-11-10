import React, { useState } from 'react';
import { 
  Users, 
  FolderPlus, 
  Archive, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  Download, 
  Smartphone, 
  Calendar,
  GraduationCap,
  Pencil,
  AlertTriangle
} from 'lucide-react';
import { RallyRoom, Team } from '../types';
import { IfsLogo } from './IfsLogo';

interface RoomsAndTeamsModalProps {
  rooms: RallyRoom[];
  activeRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onCreateRoom: (nome: string, disciplina: string, anotacoes: string) => void;
  onEditRoom: (roomId: string, updated: Partial<RallyRoom>) => void;
  onDeleteRoom: (roomId: string) => void;
  onUpdateTeam: (teamId: string, updated: Partial<Team>) => void;
  onToggleRoomStatus: (roomId: string) => void;
  onClose: () => void;
}

export const RoomsAndTeamsModal: React.FC<RoomsAndTeamsModalProps> = ({
  rooms,
  activeRoomId,
  onSelectRoom,
  onCreateRoom,
  onEditRoom,
  onDeleteRoom,
  onUpdateTeam,
  onToggleRoomStatus,
  onClose,
}) => {
  const [tab, setTab] = useState<'rooms' | 'members'>('members');
  
  // Room creation state
  const [newRoomNome, setNewRoomNome] = useState('');
  const [newRoomDisciplina, setNewRoomDisciplina] = useState('Banco de Dados - IFS Campus Tobias Barreto');
  const [newRoomAnotacoes, setNewRoomAnotacoes] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Room editing state
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editRoomNome, setEditRoomNome] = useState('');
  const [editRoomDisciplina, setEditRoomDisciplina] = useState('');
  const [editRoomAnotacoes, setEditRoomAnotacoes] = useState('');

  // Room delete confirmation state
  const [confirmDeleteRoomId, setConfirmDeleteRoomId] = useState<string | null>(null);

  // Member editing state
  const [selectedTeamId, setSelectedTeamId] = useState<string>('equipe_a');
  const [newStudentName, setNewStudentName] = useState('');
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editedStudentName, setEditedStudentName] = useState<string>('');

  // Team renaming state
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [editedTeamName, setEditedTeamName] = useState('');

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];
  const activeTeam = activeRoom?.teams.find((t) => t.id === selectedTeamId) || activeRoom?.teams[0];

  // Room creation
  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNome.trim()) return;
    onCreateRoom(newRoomNome, newRoomDisciplina, newRoomAnotacoes);
    setNewRoomNome('');
    setShowCreateForm(false);
  };

  // Start editing a room
  const handleStartEditRoom = (room: RallyRoom) => {
    setEditingRoomId(room.id);
    setEditRoomNome(room.nome);
    setEditRoomDisciplina(room.disciplina);
    setEditRoomAnotacoes(room.anotacoes || '');
  };

  // Save edited room
  const handleSaveEditRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoomId || !editRoomNome.trim()) return;
    onEditRoom(editingRoomId, {
      nome: editRoomNome.trim(),
      disciplina: editRoomDisciplina.trim() || 'Banco de Dados - IFS Campus Tobias Barreto',
      anotacoes: editRoomAnotacoes.trim(),
    });
    setEditingRoomId(null);
  };

  // Delete room
  const handleConfirmDelete = (roomId: string) => {
    onDeleteRoom(roomId);
    setConfirmDeleteRoomId(null);
  };

  // Add student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam || !newStudentName.trim()) return;
    const trimmed = newStudentName.trim();
    if (activeTeam.alunos.includes(trimmed)) return;
    const updatedAlunos = [...activeTeam.alunos, trimmed];
    onUpdateTeam(activeTeam.id, {
      alunos: updatedAlunos,
      scanner_aluno: activeTeam.scanner_aluno || trimmed,
    });
    setNewStudentName('');
  };

  // Remove student
  const handleRemoveStudent = (studentName: string) => {
    if (!activeTeam) return;
    const updatedAlunos = activeTeam.alunos.filter((a) => a !== studentName);
    const updatedScanner = activeTeam.scanner_aluno === studentName ? updatedAlunos[0] || '' : activeTeam.scanner_aluno;
    onUpdateTeam(activeTeam.id, {
      alunos: updatedAlunos,
      scanner_aluno: updatedScanner,
    });
  };

  // Start editing student name
  const handleStartEditStudent = (studentName: string) => {
    setEditingStudent(studentName);
    setEditedStudentName(studentName);
  };

  // Save edited student name
  const handleSaveEditStudent = (oldStudentName: string) => {
    if (!activeTeam || !editedStudentName.trim()) {
      setEditingStudent(null);
      return;
    }
    const cleanNewName = editedStudentName.trim();
    const updatedAlunos = activeTeam.alunos.map((name) =>
      name === oldStudentName ? cleanNewName : name
    );
    const updatedScanner =
      activeTeam.scanner_aluno === oldStudentName ? cleanNewName : activeTeam.scanner_aluno;

    onUpdateTeam(activeTeam.id, {
      alunos: updatedAlunos,
      scanner_aluno: updatedScanner,
    });
    setEditingStudent(null);
  };

  // Start editing team name
  const handleStartEditTeamName = () => {
    if (!activeTeam) return;
    setEditedTeamName(activeTeam.nome);
    setIsEditingTeamName(true);
  };

  // Save edited team name
  const handleSaveTeamName = () => {
    if (!activeTeam || !editedTeamName.trim()) {
      setIsEditingTeamName(false);
      return;
    }
    onUpdateTeam(activeTeam.id, {
      nome: editedTeamName.trim(),
    });
    setIsEditingTeamName(false);
  };

  // Set official scanner student
  const handleSetScannerStudent = (studentName: string) => {
    if (!activeTeam) return;
    onUpdateTeam(activeTeam.id, { scanner_aluno: studentName });
  };

  // Export report
  const handleExportRoomReport = () => {
    if (!activeRoom) return;
    let report = `========================================================================\n`;
    report += `INSTITUTO FEDERAL DE SERGIPE (IFS) - CAMPUS TOBIAS BARRETO\n`;
    report += `RALI DE BANCO DE DADOS (100 MINUTOS • 50 MISSÕES NFC)\n`;
    report += `Desenvolvido e Supervisionado pelo Professor Eber Santana\n`;
    report += `========================================================================\n\n`;
    report += `Sala / Turma: ${activeRoom.nome}\n`;
    report += `Disciplina: ${activeRoom.disciplina}\n`;
    report += `Data de Registro: ${new Date(activeRoom.dataCriacao).toLocaleString('pt-BR')}\n`;
    report += `Status: ${activeRoom.status.toUpperCase()}\n`;
    report += `Anotações Pedagógicas: ${activeRoom.anotacoes || 'Sem anotações adicionais'}\n`;
    report += `------------------------------------------------------------------------\n\n`;

    report += `CLASSIFICAÇÃO FINAL E COMPOSIÇÃO NOMINAL DAS EQUIPES:\n\n`;
    const sorted = [...activeRoom.teams].sort((a, b) => b.xp_total - a.xp_total);
    sorted.forEach((team, idx) => {
      report += `${idx + 1}º LUGAR: ${team.nome} — TOTAL: ${team.xp_total} XP (${team.missoes_concluidas.length} missões resolvidas)\n`;
      report += `  - Aluno Scanner Oficial: ${team.scanner_aluno || 'Não definido'}\n`;
      report += `  - Alunos Integrantes: ${team.alunos.length > 0 ? team.alunos.join(', ') : 'Nenhum aluno cadastrado'}\n`;
      report += `  - Missões Concluídas: ${team.missoes_concluidas.join(', ') || 'Nenhuma'}\n\n`;
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registro_rali_${activeRoom.nome.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="bg-slate-900 border border-emerald-900/50 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Institucional */}
        <div className="flex items-start gap-4">
          <IfsLogo size="md" className="p-1 bg-white/5 rounded-xl border border-emerald-500/20 shrink-0" />
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                IFS Campus Tobias Barreto
              </span>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Prof. Eber Santana
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <Users className="w-6 h-6 text-emerald-400" />
              <span>Salas do Rali & Alunos por Equipe</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Gerencie as turmas, edite ou exclua salas, e configure os alunos e equipes participantes do rali.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setTab('members')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              tab === 'members'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Nomes dos Alunos nas Equipes</span>
          </button>

          <button
            onClick={() => setTab('rooms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              tab === 'rooms'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Salas de Rali ({rooms.length})</span>
          </button>
        </div>

        {/* TAB 1: ALUNOS POR EQUIPE */}
        {tab === 'members' && activeRoom && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Sala Ativa:</span>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {activeRoom.nome}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportRoomReport}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar Relatório / Notas</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Team list selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                  Selecione a Equipe:
                </span>
                <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                  {activeRoom.teams.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTeamId(t.id);
                        setIsEditingTeamName(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition border ${
                        selectedTeamId === t.id
                          ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-2.5 h-2.5 rounded-full ${t.cor}`} />
                        <span className="truncate">{t.nome}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {t.alunos.length} alunos
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Members editor for selected team */}
              <div className="md:col-span-2 bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4">
                {activeTeam ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs uppercase font-bold text-emerald-400 block mb-0.5">Equipe Selecionada</span>
                        {isEditingTeamName ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="text"
                              value={editedTeamName}
                              onChange={(e) => setEditedTeamName(e.target.value)}
                              autoFocus
                              className="bg-slate-900 border border-emerald-500 rounded-lg px-2.5 py-1 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                            <button
                              type="button"
                              onClick={handleSaveTeamName}
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                              title="Salvar Nome da Equipe"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingTeamName(false)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 truncate">
                              <span className={`w-3 h-3 rounded-full ${activeTeam.cor}`} />
                              <span className="truncate">{activeTeam.nome}</span>
                            </h3>
                            <button
                              type="button"
                              onClick={handleStartEditTeamName}
                              className="p-1 text-slate-400 hover:text-emerald-400 transition rounded"
                              title="Editar Nome da Equipe"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 shrink-0">
                        {activeTeam.xp_total} XP
                      </span>
                    </div>

                    {/* Add student form */}
                    <form onSubmit={handleAddStudent} className="flex gap-2">
                      <input
                        type="text"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        placeholder="Nome completo do aluno (ex: João Silva)..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!newStudentName.trim()}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar</span>
                      </button>
                    </form>

                    {/* Students list */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase block">
                        Alunos Integrantes ({activeTeam.alunos.length}):
                      </span>

                      {activeTeam.alunos.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-4 text-center">
                          Nenhum aluno cadastrado nesta equipe ainda. Digite os nomes acima!
                        </p>
                      ) : (
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                          {activeTeam.alunos.map((student) => {
                            const isScanner = activeTeam.scanner_aluno === student;
                            const isEditing = editingStudent === student;

                            return (
                              <div
                                key={student}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs gap-2"
                              >
                                {isEditing ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <input
                                      type="text"
                                      value={editedStudentName}
                                      onChange={(e) => setEditedStudentName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveEditStudent(student);
                                        if (e.key === 'Escape') setEditingStudent(null);
                                      }}
                                      autoFocus
                                      className="flex-1 bg-slate-950 border border-emerald-500 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditStudent(student)}
                                      className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition"
                                      title="Salvar Nome"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingStudent(null)}
                                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
                                      title="Cancelar"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="text-white font-medium truncate">{student}</span>
                                      {isScanner && (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 shrink-0">
                                          <Smartphone className="w-3 h-3" />
                                          Scanner Oficial
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {!isScanner && (
                                        <button
                                          type="button"
                                          onClick={() => handleSetScannerStudent(student)}
                                          className="text-[11px] text-slate-400 hover:text-emerald-400 transition underline mr-1"
                                          title="Definir como o aluno que carrega o celular"
                                        >
                                          Tornar Scanner
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => handleStartEditStudent(student)}
                                        className="p-1.5 text-slate-400 hover:text-amber-400 transition rounded hover:bg-slate-800"
                                        title="Editar nome do aluno"
                                        aria-label={`Editar ${student}`}
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleRemoveStudent(student)}
                                        className="p-1.5 text-slate-400 hover:text-rose-400 transition rounded hover:bg-slate-800"
                                        title="Remover aluno da equipe"
                                        aria-label={`Remover ${student}`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-500">Selecione uma equipe ao lado.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GESTÃO DE SALAS (REGISTRO, ARQUIVO, EDIÇÃO & EXCLUSÃO) */}
        {tab === 'rooms' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Histórico de turmas e dias de rali para arquivo pedagógico do IFS.
              </span>

              <button
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  setEditingRoomId(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Sala de Rali</span>
              </button>
            </div>

            {/* Create Room Form */}
            {showCreateForm && (
              <form onSubmit={handleCreateRoomSubmit} className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-emerald-400" />
                  Criar Nova Sala para Nova Turma / Semestre
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                      Nome da Turma / Sala:
                    </label>
                    <input
                      type="text"
                      value={newRoomNome}
                      onChange={(e) => setNewRoomNome(e.target.value)}
                      placeholder="Ex: Turma 2026.2 - Informática Sábado"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                      Disciplina / Campus:
                    </label>
                    <input
                      type="text"
                      value={newRoomDisciplina}
                      onChange={(e) => setNewRoomDisciplina(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                    Anotações do Rali (Opcional):
                  </label>
                  <input
                    type="text"
                    value={newRoomAnotacoes}
                    onChange={(e) => setNewRoomAnotacoes(e.target.value)}
                    placeholder="Ex: Rali realizado no Lab 02 com 50 missões."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Salvar Sala
                  </button>
                </div>
              </form>
            )}

            {/* Edit Room Form */}
            {editingRoomId && (
              <form onSubmit={handleSaveEditRoom} className="bg-slate-950 p-5 rounded-2xl border border-amber-500/40 space-y-3">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-amber-400" />
                  Editar Dados da Sala
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                      Nome da Turma / Sala:
                    </label>
                    <input
                      type="text"
                      value={editRoomNome}
                      onChange={(e) => setEditRoomNome(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                      Disciplina / Campus:
                    </label>
                    <input
                      type="text"
                      value={editRoomDisciplina}
                      onChange={(e) => setEditRoomDisciplina(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                    Anotações:
                  </label>
                  <input
                    type="text"
                    value={editRoomAnotacoes}
                    onChange={(e) => setEditRoomAnotacoes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingRoomId(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                  >
                    Atualizar Sala
                  </button>
                </div>
              </form>
            )}

            {/* Delete Room Confirmation Modal / Card */}
            {confirmDeleteRoomId && (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-200 text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>
                    <strong>Confirmar exclusão definitiva?</strong> Todos os dados, equipes e histórico de pontos desta sala serão removidos.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteRoomId(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmDelete(confirmDeleteRoomId)}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sim, Excluir</span>
                  </button>
                </div>
              </div>
            )}

            {/* Rooms Cards */}
            <div className="space-y-3">
              {rooms.map((room) => {
                const isActive = room.id === activeRoomId;
                const totalXp = room.teams.reduce((acc, t) => acc + t.xp_total, 0);
                const totalStudents = room.teams.reduce((acc, t) => acc + t.alunos.length, 0);

                return (
                  <div
                    key={room.id}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isActive
                        ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
                            Sala Atual
                          </span>
                        )}
                        <h4 className="text-base font-bold text-white">{room.nome}</h4>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {room.status === 'ativa' ? 'Em Andamento' : 'Finalizada / Arquivada'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                        <span>{room.disciplina}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3 h-3 text-emerald-400" />
                          {new Date(room.dataCriacao).toLocaleDateString('pt-BR')}
                        </span>
                        {room.anotacoes && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-400">{room.anotacoes}</span>
                          </>
                        )}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-xs text-slate-300">
                        <span>👥 {totalStudents} alunos</span>
                        <span>•</span>
                        <span>🏆 {totalXp} XP acumulado</span>
                        <span>•</span>
                        <span>📝 {room.logs.length} submissões</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {!isActive && (
                        <button
                          onClick={() => onSelectRoom(room.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
                        >
                          Carregar Sala
                        </button>
                      )}

                      {/* Edit room button */}
                      <button
                        onClick={() => handleStartEditRoom(room)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition"
                        title="Editar nome e informações da sala"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Archive/reactivate button */}
                      <button
                        onClick={() => onToggleRoomStatus(room.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title={room.status === 'ativa' ? 'Finalizar e Arquivar Sala' : 'Reativar Sala'}
                      >
                        <Archive className="w-4 h-4" />
                      </button>

                      {/* Delete room button */}
                      <button
                        onClick={() => setConfirmDeleteRoomId(room.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 transition"
                        title="Excluir Sala Definitivamente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
