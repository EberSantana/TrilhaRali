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
  Clock, 
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
import { clampMinutes, crossedAlert, CRITICAL_SECONDS, TIMER_MAX, WARN_SECONDS } from '../utils/timer';
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
  const sortedTeams = [...teams].sort((a, b) => b.xp_total - a.xp_total || (b.ultimo_acerto || 0) - (a.ultimo_acerto || 0));
  const maxScore = Math.max(sortedTeams[0]?.xp_total || 1, 100);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Podium (top 3)
  const top1 = sortedTeams[0];
  const top2 = sortedTeams[1];
  const top3 = sortedTeams[2];
  const getPhaseBadge = () => {
    if (sessionState.isSubmissionsLocked) {
      return {
        label: sessionState.timerSecondsRemaining <= 0 ? 'TEMPO ESGOTADO • RESPOSTAS BLOQUEADAS' : 'RESPOSTAS BLOQUEADAS',
        color: 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse',
      };
    }
    switch (sessionState.activePhase) {
      case 'briefing':
        return { label: 'Briefing', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      case 'sprint':
        return { label: sessionState.isRunning ? 'Em andamento' : 'Parado', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'hard_stop':
        return { label: 'Tempo esgotado', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'debriefing':
        return { label: 'Debriefing', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      default:
        return { label: 'Em Andamento', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const phase = getPhaseBadge();
  const rem = sessionState.timerSecondsRemaining;
  const clockTone =
    rem <= 0
      ? 'text-red-300 border-red-500/70'
      : !sessionState.isRunning
        ? 'text-slate-300 border-slate-700'
        : rem <= CRITICAL_SECONDS
          ? 'text-red-300 border-red-500/70 timer-critico'
          : rem <= WARN_SECONDS
            ? 'text-amber-300 border-amber-500/70'
            : 'text-white border-emerald-500/30';
  const durationMin = clampMinutes(sessionState.totalSeconds / 60);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Banner: Control Room & Classroom Timeline with IFS Institutional Identity */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 rounded-3xl p-6 sm:p-7 border border-emerald-900/50 shadow-2xl backdrop-blur relative overflow-hidden">
        {/* Decorative corner accent with IFS red & green */}
        <div className="absolute top-0 right-0 w-32 h-1.5 bg-gradient-to-l from-red-600 via-emerald-500 to-transparent" />
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Title, IFS Badge & Teacher Attribution */}
          <div className="space-y-2 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span>INSTITUTO FEDERAL DE SERGIPE</span>
                <span className="text-emerald-500">•</span>
                <span>CAMPUS TOBIAS BARRETO</span>
              </div>
              {sessionState.isSubmissionsLocked && (
                <span className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                  MÃOS PARA CIMA (BLOQUEADO)
                </span>
              )}
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-3">
              <TrilhaLogo height={72} className="hidden sm:block" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center lg:justify-start gap-2.5">
                  <span>Trilha Rali</span>
                  <Flame className="w-7 h-7 text-amber-500 fill-amber-500" />
                </h1>
                {/* Professor attribution */}
                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs text-emerald-300 font-semibold mt-1">
                  <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Desenvolvido e Supervisionado pelo <strong>Professor Eber Santana</strong></span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              {activeRoomName ? `📍 Sala: ${activeRoomName} • ` : ''}Atividade de {durationMin} min • Missões por tags NFC
            </p>
          </div>

          {/* Big Projector Countdown Clock */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Tempo restante</span>
            </div>
            <div className={`font-mono tabular-nums text-5xl sm:text-6xl font-black tracking-tight bg-slate-950 px-8 py-3 rounded-2xl border-2 ${clockTone}`} role="timer" aria-label={`Tempo restante: ${formatTimer(rem)}`}>
              {formatTimer(sessionState.timerSecondsRemaining)}
            </div>
            <span className={`text-[11px] sm:text-xs px-3 py-0.5 rounded-full border font-bold ${phase.color}`}>
              {phase.label}
            </span>
          </div>

          {/* Instructor Quick Controls */}
          <div className="flex items-center flex-wrap justify-center gap-2">
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

        {/* Progresso do tempo da atividade */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
            <span>Início</span>
            <span>
              Atividade de {durationMin} min • avisos nos últimos 5 min e no último minuto
            </span>
            <span>Fim</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800" aria-hidden="true">
            <div
              className={`h-full rounded-full transition-all ${rem <= CRITICAL_SECONDS ? 'bg-red-500' : rem <= WARN_SECONDS ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, Math.max(0, (1 - rem / Math.max(sessionState.totalSeconds, rem, 1)) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Podium for Top 3 Teams */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
        {/* 2nd Place */}
        {top2 && (
          <div className="order-2 md:order-1 bg-gradient-to-t from-slate-900 to-slate-800/80 rounded-3xl p-6 border border-slate-700/60 shadow-xl flex flex-col items-center text-center relative">
            <div className="w-14 h-14 rounded-full bg-slate-300/20 text-slate-200 border-2 border-slate-300 flex items-center justify-center font-black text-2xl mb-3 shadow-lg">
              2º
            </div>
            <div className={`w-4 h-4 rounded-full ${top2.cor} mb-2`} />
            <h3 className="text-xl font-black text-white">{top2.nome}</h3>
            <div className="font-mono text-3xl font-black text-slate-200 mt-2">
              {top2.xp_total} <span className="text-xs font-semibold text-slate-400">XP</span>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              {top2.missoes_concluidas.length} missões acertadas
            </div>
            <div className="text-[11px] text-slate-300 mt-1.5 font-medium line-clamp-1 px-2">
              👥 {top2.alunos.length > 0 ? top2.alunos.join(', ') : 'Sem alunos'}
            </div>
          </div>
        )}

        {/* 1st Place - Champion */}
        {top1 && (
          <div className="order-1 md:order-2 bg-gradient-to-t from-amber-950/40 via-slate-900 to-slate-800 rounded-3xl p-8 border-2 border-amber-500/60 shadow-2xl flex flex-col items-center text-center relative -mt-4 transform hover:scale-[1.02] transition">
            <div className="absolute -top-6 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <Trophy className="w-4 h-4 fill-slate-950" />
              LÍDER DO RALI
            </div>
            <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-300 border-4 border-amber-400 flex items-center justify-center font-black text-3xl mb-3 shadow-amber-500/20 shadow-xl">
              1º
            </div>
            <div className={`w-4 h-4 rounded-full ${top1.cor} mb-2`} />
            <h3 className="text-2xl font-black text-white">{top1.nome}</h3>
            <div className="font-mono text-4xl sm:text-5xl font-black text-amber-300 mt-2">
              {top1.xp_total} <span className="text-sm font-semibold text-amber-400/80">XP</span>
            </div>
            <div className="text-sm text-slate-300 mt-2 font-semibold">
              🏆 {top1.missoes_concluidas.length} missões conquistadas
            </div>
            <div className="text-xs text-amber-200/90 mt-2 font-medium bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 max-w-[280px] truncate" title={top1.alunos.join(', ')}>
              👥 {top1.alunos.length > 0 ? top1.alunos.join(', ') : 'Sem alunos cadastrados'}
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3 && (
          <div className="order-3 bg-gradient-to-t from-slate-900 to-slate-800/80 rounded-3xl p-6 border border-slate-700/60 shadow-xl flex flex-col items-center text-center relative">
            <div className="w-14 h-14 rounded-full bg-amber-700/30 text-amber-400 border-2 border-amber-700 flex items-center justify-center font-black text-2xl mb-3 shadow-lg">
              3º
            </div>
            <div className={`w-4 h-4 rounded-full ${top3.cor} mb-2`} />
            <h3 className="text-xl font-black text-white">{top3.nome}</h3>
            <div className="font-mono text-3xl font-black text-slate-200 mt-2">
              {top3.xp_total} <span className="text-xs font-semibold text-slate-400">XP</span>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              {top3.missoes_concluidas.length} missões acertadas
            </div>
            <div className="text-[11px] text-slate-300 mt-1.5 font-medium line-clamp-1 px-2">
              👥 {top3.alunos.length > 0 ? top3.alunos.join(', ') : 'Sem alunos'}
            </div>
          </div>
        )}
      </div>

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
