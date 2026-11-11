import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Lock, 
  Unlock, 
  Maximize2, 
  Minimize2, 
  Trophy, 
  Medal, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  XCircle,
  Plus,
  Minus,
  Users,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Team, SubmissionLog, ClassSessionState, ClassPhase, ScoringMode } from '../types';
import { playSound } from '../utils/audio';
import { TrilhaLogo } from './TrilhaLogo';
import { normalizeScoringMode } from '../utils/scoring';
import { clampMinutes, crossedAlert, TIMER_MAX, timerPhase, TimerInfo } from '../utils/timer';
import { useMissions } from '../utils/missionsStore';
import { TimerDisplay } from './common/TimerDisplay';
import { ProjectorHeader } from './common/ProjectorHeader';
import { StatusBanner } from './common/StatusBanner';
import { Top5Board } from './ctf/Top5Board';
import { useTheme } from '../utils/theme';
import { pushRaliTimer } from '../utils/raliSession';
import { DurationPicker } from './common/DurationPicker';

interface ClassroomProjectorProps {
  teams: Team[];
  logs: SubmissionLog[];
  sessionState: ClassSessionState;
  onUpdateSession: (state: Partial<ClassSessionState>) => void;
  onAdjustTeamXp: (teamId: string, deltaXp: number) => void;
  onResetSession: () => void;
  activeRoomName?: string;
  onOpenRoomsModal: () => void;
  isTeacher: boolean;
  onRequireTeacher: () => void;
}

export const ClassroomProjector: React.FC<ClassroomProjectorProps> = ({
  teams,
  logs,
  sessionState,
  onUpdateSession,
  onAdjustTeamXp,
  onResetSession,
  activeRoomName,
  onOpenRoomsModal,
  isTeacher,
  onRequireTeacher,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scoringMode = normalizeScoringMode(sessionState.scoringMode);
  const lastFogoLogId = useRef<string | null>(logs.find((l) => l.is_fogo)?.id ?? null);

  // 🔥 Celebra no telão quando uma equipe é a primeira a capturar uma tag
  useEffect(() => {
    const latestFogo = logs.find((l) => l.is_fogo);
    if (!latestFogo || latestFogo.id === lastFogoLogId.current) return;
    lastFogoLogId.current = latestFogo.id;
    if (Date.now() - latestFogo.timestamp > 10_000) return;
    playSound('success', sessionState.soundEnabled);
    try {
      confetti({
        particleCount: 140,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#f97316', '#ef4444', '#f59e0b', '#fde047'],
      });
    } catch {
      // ignore
    }
  }, [logs, sessionState.soundEnabled]);

  const changeScoringMode = (mode: ScoringMode) => {
    if (!isTeacher) {
      onRequireTeacher();
      return;
    }
    if (mode === scoringMode) return;
    onUpdateSession({ scoringMode: mode });
  };

  // Cronômetro da atividade: conta até zero e, ao zerar, bloqueia as respostas
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (sessionState.isRunning && sessionState.timerSecondsRemaining > 0) {
      timer = setInterval(() => {
        const prev = sessionState.timerSecondsRemaining;
        const next = prev - 1;
        const done = next <= 0;
        onUpdateSession({
          timerSecondsRemaining: Math.max(0, next),
          activePhase: (done ? 'hard_stop' : 'sprint') as ClassPhase,
          ...(done ? { isRunning: false, isSubmissionsLocked: true } : {}),
        });
        const alert = crossedAlert(prev, next);
        if (alert === 'fim') playSound('gong', sessionState.soundEnabled);
        else if (alert) playSound('tick', sessionState.soundEnabled);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [sessionState.isRunning, sessionState.timerSecondsRemaining, sessionState.soundEnabled]);

  // Espelha o relógio no servidor para os celulares dos alunos (quando o banco do professor está conectado):
  // a cada mudança feita pelo professor e, rodando, uma vez por minuto para corrigir desvios.
  const lastSync = useRef<{ run: boolean; rem: number; total: number } | null>(null);
  useEffect(() => {
    if (!isTeacher) return;
    const cur = { run: sessionState.isRunning, rem: sessionState.timerSecondsRemaining, total: sessionState.totalSeconds };
    const prev = lastSync.current;
    lastSync.current = cur;
    const step = prev ? cur.rem - prev.rem : 0;
    const changed = !prev || prev.run !== cur.run || prev.total !== cur.total || (step !== 0 && step !== -1) || (cur.run && cur.rem % 60 === 0);
    if (changed) pushRaliTimer(cur.rem, cur.run, clampMinutes(cur.total / 60));
  }, [isTeacher, sessionState.isRunning, sessionState.timerSecondsRemaining, sessionState.totalSeconds]);

  const setDuration = (minutes: number) => {
    const secs = clampMinutes(minutes) * 60;
    onUpdateSession({ totalSeconds: secs, timerSecondsRemaining: secs, isRunning: false, isSubmissionsLocked: false, activePhase: 'sprint' });
  };

  const toggleTimer = () => {
    if (!sessionState.isRunning && sessionState.timerSecondsRemaining <= 0) return;
    onUpdateSession({ isRunning: !sessionState.isRunning });
  };

  const toggleLock = () => {
    const nextLocked = !sessionState.isSubmissionsLocked;
    onUpdateSession({ isSubmissionsLocked: nextLocked });
    if (nextLocked) {
      playSound('gong', sessionState.soundEnabled);
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
        });
      } catch {
        // ignore
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const addTimeMinutes = (mins: number) => {
    const wasOver = sessionState.timerSecondsRemaining <= 0;
    const next = Math.min(TIMER_MAX * 60, Math.max(0, sessionState.timerSecondsRemaining + mins * 60));
    // tempo extra depois de zerar reabre as respostas e volta a contar
    onUpdateSession({ timerSecondsRemaining: next, ...(wasOver && next > 0 ? { isSubmissionsLocked: false, isRunning: true, activePhase: 'sprint' as ClassPhase } : {}) });
  };

  // Sort teams by XP descending
  const missions = useMissions();
  const theme = useTheme();
  const sortedTeams = [...teams].sort((a, b) => b.xp_total - a.xp_total || (b.ultimo_acerto || 0) - (a.ultimo_acerto || 0));
  const maxScore = Math.max(sortedTeams[0]?.xp_total || 1, 100);

  const rem = sessionState.timerSecondsRemaining;
  const durationMin = clampMinutes(sessionState.totalSeconds / 60);
  // Mesmo relógio do CTF: o estado local do Rali vira um TimerInfo para o componente padrão
  const timerInfo: TimerInfo = {
    duracaoMin: durationMin,
    fimEm: sessionState.isRunning && rem > 0 ? 1 : 0,
    restanteS: rem,
    rodando: sessionState.isRunning && rem > 0,
    esgotado: rem <= 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Banner: Control Room & Classroom Timeline with IFS Institutional Identity */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 rounded-3xl p-6 sm:p-7 border border-emerald-900/50 shadow-2xl backdrop-blur relative overflow-hidden">
        {/* Decorative corner accent with IFS red & green */}
        <div className="absolute top-0 right-0 w-32 h-1.5 bg-gradient-to-l from-red-600 via-emerald-500 to-transparent" />
        
        <div className="space-y-5">
          <ProjectorHeader
            module="nfc"
            leading={<TrilhaLogo height={72} className="hidden sm:block" />}
            title={<><span>Trilha Rali</span><Flame className="w-7 h-7 text-amber-500 fill-amber-500" /></>}
            subtitle={<>{activeRoomName ? `Sala: ${activeRoomName} • ` : ''}{teams.length} equipes • missões por tags NFC</>}
          />

          {sessionState.isSubmissionsLocked && (
            <StatusBanner>{rem <= 0 ? 'Tempo esgotado! Respostas bloqueadas.' : 'Respostas bloqueadas pelo professor.'}</StatusBanner>
          )}

          <TimerDisplay timer={timerInfo} seconds={rem} phase={timerPhase(timerInfo, rem)} size="faixa" />

          {/* Instructor Quick Controls */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onOpenRoomsModal}
              className="p-3 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold flex items-center gap-2 transition shadow-lg text-sm"
              title="Gerenciar Salas do Rali e Integrantes das Equipes"
            >
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="hidden sm:inline">Alunos & Salas</span>
            </button>

            <button
              onClick={toggleTimer}
              className={`p-3 rounded-xl font-bold flex items-center gap-2 transition text-white shadow-lg ${
                sessionState.isRunning
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
              title={sessionState.isRunning ? 'Pausar Cronômetro' : 'Iniciar Contagem'}
              aria-label={sessionState.isRunning ? 'Pausar' : 'Iniciar'}
            >
              {sessionState.isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span className="text-sm">{sessionState.isRunning ? 'Pausar' : 'Iniciar'}</span>
            </button>

            <button
              onClick={toggleLock}
              className={`p-3 rounded-xl font-bold flex items-center gap-2 transition text-white shadow-lg ${
                sessionState.isSubmissionsLocked
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
              }`}
              title={sessionState.isSubmissionsLocked ? 'Liberar respostas' : 'Travar respostas agora'}
              aria-label="Travar Respostas"
            >
              {sessionState.isSubmissionsLocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              <span className="text-sm">
                {sessionState.isSubmissionsLocked ? 'Destravar' : 'Travar'}
              </span>
            </button>

            <button
              onClick={() => addTimeMinutes(5)}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold transition border border-slate-700"
              title="Adicionar 5 minutos"
            >
              +5 min
            </button>

            <button
              onClick={onResetSession}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
              title="Reiniciar Dinâmica"
              aria-label="Reiniciar"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
              title="Modo Telão Fullscreen"
              aria-label="Tela Cheia"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isTeacher && !sessionState.isRunning && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 max-w-md">
            <DurationPicker id="rali-duracao" value={durationMin} onChange={setDuration} />
            <p className="mt-2 text-[11px] text-slate-400">
              Ao zerar, as respostas são bloqueadas. Com o banco de perguntas conectado, o relógio também aparece no celular dos alunos.
            </p>
          </div>
        )}

        {/* Seletor do modo de pontuação (Painel do Professor) */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="text-center md:text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center md:justify-start gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Modo de Pontuação</span>
              {!isTeacher && <Lock className="w-3 h-3 text-slate-500" aria-label="Apenas professor" />}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {scoringMode === 'ctf_dynamic'
                ? 'CTF Dinâmico: quanto mais equipes capturam a mesma tag, menos ela vale (nunca abaixo de 40%).'
                : 'Rali Tradicional: cada missão sempre vale o XP original.'}
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Modo de pontuação"
            className="inline-flex self-center md:self-auto rounded-xl bg-slate-950 border border-slate-800 p-1 gap-1"
          >
            <button
              type="button"
              role="radio"
              aria-checked={scoringMode === 'fixed'}
              onClick={() => changeScoringMode('fixed')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                scoringMode === 'fixed' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rali Tradicional
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={scoringMode === 'ctf_dynamic'}
              onClick={() => changeScoringMode('ctf_dynamic')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                scoringMode === 'ctf_dynamic' ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span aria-hidden>🔥</span> CTF Dinâmico
            </button>
          </div>
        </div>
      </div>

      {/* Top 5 (mesmo quadro do CTF Online) */}
      <Top5Board
        rows={sortedTeams.map((t) => ({ nome: t.nome, xp: t.xp_total, fase: t.missoes_concluidas.length, fogos: 0 }))}
        totalFases={missions.length}
        size="big"
        variant={theme === 'claro' ? 'bars' : 'podium'}
        unit="missões"
      />

      {/* Main Leaderboard Table and Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Teams Leaderboard (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Medal className="w-5 h-5 text-emerald-400" />
              Classificação Geral das Equipes (Laboratório)
            </h3>
            <span className="text-xs font-mono text-slate-400">{sortedTeams.length} Equipes</span>
          </div>

          <div className="space-y-3">
            {sortedTeams.map((team, idx) => {
              const pct = Math.min(100, Math.max(8, (team.xp_total / maxScore) * 100));
              return (
                <div
                  key={team.id}
                  className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span
                      className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                        idx === 0
                          ? 'bg-amber-500 text-slate-950 font-extrabold'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}º
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-3 h-3 rounded-full ${team.cor}`} />
                          <span className="font-bold text-white text-base truncate">{team.nome}</span>
                        </div>
                        <div className="font-mono font-black text-lg text-emerald-400">
                          {team.xp_total} XP
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
                        <span>
                          {team.missoes_concluidas.length} desafios superados
                          {(team.fogos_count || 0) > 0 && (
                            <span className="ml-2 font-bold text-orange-300" title="Missões capturadas em 1º lugar">
                              🔥 x{team.fogos_count}
                            </span>
                          )}
                        </span>
                        <span>{team.erros_count} tentativas incorretas</span>
                      </div>

                      {/* Student members badge list */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-800/60 text-[11px]">
                        <span className="text-slate-400 font-bold">Alunos:</span>
                        {team.alunos && team.alunos.length > 0 ? (
                          team.alunos.map((aluno) => (
                            <span
                              key={aluno}
                              className={`px-2 py-0.5 rounded-md font-medium ${
                                aluno === team.scanner_aluno
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {aluno} {aluno === team.scanner_aluno && '📱 (Scanner)'}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 italic">Nenhum aluno cadastrado</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Teacher quick adjustments (+10 / -10) */}
                  <div className="flex items-center gap-1 sm:self-center shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
                    <button
                      onClick={() => onAdjustTeamXp(team.id, -10)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
                      title="Penalidade (-10 XP)"
                      aria-label="Subtrair 10 XP"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onAdjustTeamXp(team.id, 10)}
                      className="p-1.5 bg-emerald-600/30 hover:bg-emerald-600 rounded-lg text-emerald-300 hover:text-white transition"
                      title="Bônus do Professor (+10 XP)"
                      aria-label="Adicionar 10 XP"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Submission Feed (1 col) */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Feed ao Vivo de Respostas
            </h3>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[500px] space-y-2.5 pr-1">
            {logs.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">
                Aguardando primeiras leituras de tags NFC e submissões das equipes...
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 transition ${
                    log.correto
                      ? log.is_fogo
                        ? 'bg-orange-950/40 border-orange-500/50 text-orange-200'
                        : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-500/20 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="truncate">{log.equipe_nome}</span>
                    <span className="font-mono text-[11px] shrink-0 ml-2">
                      {log.correto ? `${log.is_fogo ? '🔥 ' : ''}+${log.xp_ganho} XP` : 'Tentativa'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="font-mono font-bold text-amber-400">{log.tag_id}</span>
                    <span className="text-slate-500">•</span>
                    <span className="truncate italic">"{log.resposta_aluno}"</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center gap-1">
                      {log.correto ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                      <span className="truncate">{log.mensagem}</span>
                    </div>
                    <span className="shrink-0 text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
