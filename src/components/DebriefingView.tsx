import React, { useState } from 'react';
import { 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Tv, 
  Code, 
  Lightbulb, 
  TrendingDown, 
  Sparkles,
  X,
  GraduationCap
} from 'lucide-react';
import { Mission, SubmissionLog } from '../types';
import { useMissions } from '../utils/missionsStore';

interface DebriefingViewProps {
  logs: SubmissionLog[];
}

export const DebriefingView: React.FC<DebriefingViewProps> = ({ logs }) => {
  const missions = useMissions();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(missions[0] ?? null);
  const [isProjectorModalOpen, setIsProjectorModalOpen] = useState(false);

  // Calculate statistics per tag
  const tagStats = missions.map((mission) => {
    const missionLogs = logs.filter((l) => l.tag_id === mission.tag_id);
    const correctCount = missionLogs.filter((l) => l.correto).length;
    const errorCount = missionLogs.filter((l) => !l.correto).length;
    const totalAttempts = missionLogs.length;
    const failureRate = totalAttempts > 0 ? (errorCount / totalAttempts) * 100 : 0;

    return {
      mission,
      correctCount,
      errorCount,
      totalAttempts,
      failureRate,
    };
  });

  // Sort by error count descending
  const sortedByErrors = [...tagStats].sort((a, b) => b.errorCount - a.errorCount || b.failureRate - a.failureRate);

  const totalLogs = logs.length;
  const totalCorrect = logs.filter((l) => l.correto).length;
  const totalErrors = logs.filter((l) => !l.correto).length;
  const overallSuccessRate = totalLogs > 0 ? Math.round((totalCorrect / totalLogs) * 100) : 100;
  const mostMissed = sortedByErrors.find((s) => s.errorCount > 0);

  const openProjectorSpotlight = (mission: Mission) => {
    setSelectedMission(mission);
    setIsProjectorModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                IFS Campus Tobias Barreto
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Prof. Eber Santana
              </span>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Minutos 90 a 100 da Aula
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <span>Debriefing</span>
              <HelpCircle className="w-8 h-8 text-purple-400" />
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Identifique as queries que geraram mais dúvidas e projete a resolução guiada no telão para os alunos do IFS.
            </p>
          </div>

          {selectedMission && (
            <button
              onClick={() => setIsProjectorModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95"
            >
              <Tv className="w-5 h-5" />
              <span>Projetar Resolução no Telão</span>
            </button>
          )}
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Total de Tentativas</span>
            <span className="text-2xl font-black text-white font-mono">{totalLogs}</span>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Acertos</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{totalCorrect}</span>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Erros Registrados</span>
            <span className="text-2xl font-black text-rose-400 font-mono">{totalErrors}</span>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Taxa de Sucesso</span>
            <span className="text-2xl font-black text-sky-400 font-mono">{overallSuccessRate}%</span>
          </div>
        </div>
      </div>

      {/* Main Content: Error Analysis & Mission Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Questions Ranked by Confusion */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              Ranking de Dificuldade / Erros dos Grupos
            </h3>
            <span className="text-xs text-slate-400">Clique para inspecionar</span>
          </div>

          <div className="space-y-3">
            {sortedByErrors.map(({ mission, errorCount, correctCount, totalAttempts, failureRate }) => (
              <div
                key={mission.tag_id}
                onClick={() => setSelectedMission(mission)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  selectedMission?.tag_id === mission.tag_id
                    ? 'bg-purple-950/30 border-purple-500 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                        {mission.tag_id}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {mission.category}
                      </span>
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        {mission.packageName}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white line-clamp-2">
                      {mission.pergunta}
                    </p>
                  </div>

                  {/* Error & Attempt stats */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-2">
                      {errorCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {errorCount} {errorCount === 1 ? 'erro' : 'erros'}
                        </span>
                      )}
                      <span className="text-xs font-bold text-emerald-400">
                        {correctCount} ✓
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      {totalAttempts} tentativas
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Selected Mission Spotlight Preview */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              Gabarito & Solução
            </h3>
            {selectedMission && (
              <span className="font-mono text-xs font-bold text-emerald-400">
                +{selectedMission.xp_valor} XP
              </span>
            )}
          </div>

          {selectedMission ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                  Tag: {selectedMission.tag_id} ({selectedMission.category})
                </span>
                <p className="text-white font-medium text-sm">
                  {selectedMission.pergunta}
                </p>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  Resposta Curta Esperada (Gabarito):
                </span>
                <span className="font-mono text-base font-black text-emerald-200">
                  {selectedMission.resposta_curta}
                </span>
                {selectedMission.alternatives && selectedMission.alternatives.length > 1 && (
                  <p className="text-xs text-emerald-400/80 mt-1">
                    Também aceita: {selectedMission.alternatives.join(', ')}
                  </p>
                )}
              </div>

              {selectedMission.sample_query && (
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-2">
                    <span className="flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-indigo-400" />
                      Query SQL Resolvida:
                    </span>
                  </div>
                  <pre className="font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {selectedMission.sample_query}
                  </pre>
                </div>
              )}

              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  💡 Explicação para a Turma:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedMission.explanation}
                </p>
              </div>

              <button
                onClick={() => setIsProjectorModalOpen(true)}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Tv className="w-4 h-4" />
                <span>Abrir em Tela Cheia no Telão</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-10">
              Selecione uma missão para ver o gabarito detalhado.
            </p>
          )}
        </div>
      </div>

      {/* Large Projector Modal (for min 90-100 classroom projection) */}
      {isProjectorModalOpen && selectedMission && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
          <div className="bg-slate-900 border-2 border-purple-500/50 rounded-3xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsProjectorModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              aria-label="Fechar"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-black px-4 py-1.5 rounded-xl bg-purple-600 text-white">
                {selectedMission.tag_id}
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-sm font-bold">
                {selectedMission.category}
              </span>
              <span className="text-sm text-slate-400">
                {selectedMission.packageName}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-black">
                Desafio Proposto:
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {selectedMission.pergunta}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-950/50 border-2 border-emerald-500 rounded-2xl p-5">
                <span className="text-xs uppercase tracking-widest font-black text-emerald-400 block mb-1">
                  Resposta Curta Oficial
                </span>
                <span className="font-mono text-2xl font-black text-emerald-200">
                  {selectedMission.resposta_curta}
                </span>
              </div>

              <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <span className="text-xs uppercase tracking-widest font-black text-indigo-400 block mb-2">
                  Query no SQLite / DBeaver:
                </span>
                <pre className="font-mono text-sm text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                  {selectedMission.sample_query || 'Consulte o schema no banco_rali.sql'}
                </pre>
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-2">
              <span className="text-xs uppercase tracking-widest font-black text-amber-400 block">
                Por que esta é a resposta correta? (Debriefing Pedagógico)
              </span>
              <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
                {selectedMission.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
