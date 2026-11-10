import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Smartphone, 
  AlertTriangle, 
  Trophy, 
  Lock,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Team, Mission, ClassSessionState } from '../types';
import { ALL_MISSIONS } from '../data/missions';
import { validateAnswer } from '../utils/validation';
import { playSound } from '../utils/audio';
import { getAppsScriptUrl } from '../utils/storage';

interface StudentScannerProps {
  teams: Team[];
  selectedTeamId: string;
  onSelectTeam: (teamId: string) => void;
  onValidSubmission: (teamId: string, tagId: string, xpGained: number, answer: string) => void;
  onFailedSubmission: (teamId: string, tagId: string, answer: string) => void;
  sessionState: ClassSessionState;
}

export const StudentScanner: React.FC<StudentScannerProps> = ({
  teams,
  selectedTeamId,
  onSelectTeam,
  onValidSubmission,
  onFailedSubmission,
  sessionState,
}) => {
  const [activeTagId, setActiveTagId] = useState<string>('tag_01');
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [isNfcScanning, setIsNfcScanning] = useState<boolean>(false);
  const [nfcStatusMessage, setNfcStatusMessage] = useState<string>('Pronto para leitura NFC.');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showManualPicker, setShowManualPicker] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const currentTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const activeMission = ALL_MISSIONS.find((m) => m.tag_id === activeTagId);
  const isAlreadySolved = currentTeam ? currentTeam.missoes_concluidas.includes(activeTagId) : false;

  // Web NFC Support Check
  const hasWebNfc = typeof window !== 'undefined' && 'NDEFReader' in window;

  const startNfcScan = async () => {
    if (!hasWebNfc) {
      setNfcStatusMessage('Web NFC não suportado neste dispositivo/navegador. Use o seletor rápido abaixo.');
      setShowManualPicker(true);
      return;
    }

    try {
      setIsNfcScanning(true);
      setNfcStatusMessage('Aproxime o celular da Tag NTAG213...');
      playSound('scan', sessionState.soundEnabled);

      const NDEFReaderClass = (window as unknown as { NDEFReader?: new () => { scan: () => Promise<void>; onreading: (e: any) => void; onreadingerror: () => void } }).NDEFReader;
      if (!NDEFReaderClass) {
        throw new Error('NDEFReader indisponível');
      }
      const ndef = new NDEFReaderClass();
      await ndef.scan();

      ndef.onreading = (event: { message: { records: Array<{ data: BufferSource }> } }) => {
        const decoder = new TextDecoder();
        for (const record of event.message.records) {
          let payload = decoder.decode(record.data);
          // O payload gravado via NFC Tools pode ter header de idioma (ex: 'en' ou 'pt')
          // Se começar com caracteres de controle ou idioma, normalizamos
          if (payload.length > 3 && payload.includes('tag_')) {
            const match = payload.match(/tag_[a-z0-9_]+/i);
            if (match) payload = match[0];
          }
          payload = payload.trim();

          const found = ALL_MISSIONS.find((m) => m.tag_id.toLowerCase() === payload.toLowerCase());
          if (found) {
            setActiveTagId(found.tag_id);
            setNfcStatusMessage(`Tag detectada com sucesso: ${found.tag_id}!`);
            playSound('scan', sessionState.soundEnabled);
            setFeedback({ type: 'info', text: `Missão carregada: ${found.tag_id}` });
            setStudentAnswer('');
            inputRef.current?.focus();
          } else {
            setNfcStatusMessage(`Tag lida ("${payload}"), mas não encontrada no banco de 30 missões.`);
          }
        }
      };

      ndef.onreadingerror = () => {
        setNfcStatusMessage('Falha ao ler a tag NFC. Tente aproximar novamente.');
      };
    } catch (err: unknown) {
      setIsNfcScanning(false);
      const errMsg = err instanceof Error ? err.message : String(err);
      setNfcStatusMessage(`Erro no sensor NFC: ${errMsg}. Liberando modo simulador.`);
      setShowManualPicker(true);
    }
  };

  const handleSelectSimulatedTag = (tagId: string) => {
    setActiveTagId(tagId);
    setNfcStatusMessage(`Missão simulada: ${tagId}`);
    playSound('scan', sessionState.soundEnabled);
    setFeedback(null);
    setStudentAnswer('');
    setShowManualPicker(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !activeMission) return;

    if (sessionState.isSubmissionsLocked) {
      playSound('error', sessionState.soundEnabled);
      setFeedback({
        type: 'error',
        text: 'Tempo esgotado! Mãos para cima. As submissões foram encerradas pelo professor.',
      });
      return;
    }

    if (isAlreadySolved) {
      playSound('error', sessionState.soundEnabled);
      setFeedback({
        type: 'info',
        text: `Sua equipe (${currentTeam.nome}) já pontuou nesta missão anteriormente!`,
      });
      return;
    }

    setIsSubmitting(true);
    const result = validateAnswer(activeMission, studentAnswer, isAlreadySolved);

    // Se houver URL do Google Apps Script configurada, envia assincronamente via fetch POST
    const appsScriptUrl = getAppsScriptUrl();
    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors', // Apps Script web app standard
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_equipe: currentTeam.id,
            equipe: currentTeam.nome,
            tag_id: activeMission.tag_id,
            resposta: studentAnswer,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {});
      } catch {
        // silencioso
      }
    }

    if (result.correto) {
      playSound('success', sessionState.soundEnabled);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
        });
      } catch {
        // ignore
      }

      onValidSubmission(currentTeam.id, activeMission.tag_id, result.xpGanho, studentAnswer);
      setFeedback({
        type: 'success',
        text: `ACERTOU! +${result.xpGanho} XP para ${currentTeam.nome}!`,
      });
      setStudentAnswer('');
    } else {
      playSound('error', sessionState.soundEnabled);
      onFailedSubmission(currentTeam.id, activeMission.tag_id, studentAnswer);
      setFeedback({
        type: 'error',
        text: result.mensagem,
      });
    }
    setIsSubmitting(false);
  };

  const filteredMissions = ALL_MISSIONS.filter(
    (m) =>
      m.tag_id.toLowerCase().includes(filterQuery.toLowerCase()) ||
      m.pergunta.toLowerCase().includes(filterQuery.toLowerCase()) ||
      m.packageName.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Team Selection Banner */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-xl backdrop-blur">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Identificação do Scanner
            </span>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full ${currentTeam?.cor || 'bg-emerald-500'}`} />
              {currentTeam?.nome || 'Selecione sua Equipe'}
            </h2>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedTeamId}
              onChange={(e) => onSelectTeam(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none w-full sm:w-auto"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome} ({t.xp_total} XP)
                </option>
              ))}
            </select>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-emerald-400 font-mono font-bold text-sm whitespace-nowrap">
              {currentTeam?.xp_total || 0} XP
            </div>
          </div>
        </div>

        {/* Team Members List */}
        {currentTeam && currentTeam.alunos && currentTeam.alunos.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-semibold">Integrantes da Equipe:</span>
            {currentTeam.alunos.map((aluno) => (
              <span
                key={aluno}
                className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                  aluno === currentTeam.scanner_aluno
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-slate-900 text-slate-300'
                }`}
              >
                {aluno} {aluno === currentTeam.scanner_aluno && '📱 (Scanner)'}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Lock Warning if Hard Stop is Active */}
      {sessionState.isSubmissionsLocked && (
        <div className="bg-red-950/80 border border-red-500 rounded-2xl p-4 text-red-200 flex items-center gap-3 animate-pulse">
          <Lock className="w-6 h-6 text-red-400 shrink-0" />
          <div>
            <h4 className="font-bold text-red-300">Recepção de Respostas Encerrada (Hard Stop)</h4>
            <p className="text-xs text-red-300/80">O professor travou o envio para apuração do ranking final no telão.</p>
          </div>
        </div>
      )}

      {/* NFC Action Card */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold">Leitor de Tag NTAG213</span>
          </div>

          <button
            type="button"
            onClick={() => setShowManualPicker(!showManualPicker)}
            className="text-xs text-slate-400 hover:text-emerald-400 underline transition"
          >
            {showManualPicker ? 'Fechar Simulador' : 'Simular Tag / Testar'}
          </button>
        </div>

        {/* Big NFC Button */}
        <button
          type="button"
          onClick={startNfcScan}
          disabled={sessionState.isSubmissionsLocked}
          className={`w-full py-4 px-6 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] ${
            isNfcScanning
              ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
          } ${sessionState.isSubmissionsLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Radio className={`w-6 h-6 ${isNfcScanning ? 'animate-spin' : ''}`} />
          <span>{isNfcScanning ? 'AGUARDANDO APROXIMAÇÃO DA TAG...' : 'ESCANEAR NOVA MISSÃO (NFC)'}</span>
        </button>

        <p className="text-xs text-center text-slate-400 mt-2 font-mono">
          {nfcStatusMessage}
        </p>

        {/* Quick Simulator Picker for Testing and iOS Fallback */}
        {showManualPicker && (
          <div className="mt-5 pt-4 border-t border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase">
                Simulador de Tags (Para testes ou iOS sem Web NFC)
              </span>
              <span className="text-xs text-emerald-400 font-mono">30 Tags Disponíveis</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filtrar por tag_01, tema ou pergunta..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {filteredMissions.map((m) => (
                <button
                  key={m.tag_id}
                  type="button"
                  onClick={() => handleSelectSimulatedTag(m.tag_id)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition ${
                    activeTagId === m.tag_id
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono font-bold text-emerald-400 shrink-0">{m.tag_id}</span>
                    <span className="truncate">{m.pergunta}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-2">
                    +{m.xp_valor} XP
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Mission Card */}
      {activeMission && (
        <div className="bg-slate-800/95 rounded-2xl p-6 border border-slate-700 shadow-xl space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-sm">
                Tag: {activeMission.tag_id}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-700 text-slate-300 text-xs font-semibold">
                {activeMission.category}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                {activeMission.packageName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-lg text-sm font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>+{activeMission.xp_valor} XP</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Desafio no SQLite do PC:
            </label>
            <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {activeMission.pergunta}
            </p>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              📍 <span className="font-semibold text-slate-300">Local da Tag:</span> {activeMission.location_suggestion}
            </p>
          </div>

          {/* Already Solved Badge */}
          {isAlreadySolved ? (
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-4 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-sm">Missão já conquistada pela sua equipe!</p>
                <p className="text-xs text-emerald-400/80">
                  Os +{activeMission.xp_valor} XP já estão no saldo. Encontre outra tag no laboratório!
                </p>
              </div>
            </div>
          ) : (
            /* Answer Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="resposta-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Digite a Resposta Curta (Gabarito / Saída da Query):
                </label>
                <input
                  id="resposta-input"
                  ref={inputRef}
                  type="text"
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="Ex: drop table, 145, where, notebook..."
                  disabled={sessionState.isSubmissionsLocked || isSubmitting}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={sessionState.isSubmissionsLocked || isSubmitting || !studentAnswer.trim()}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                  sessionState.isSubmissionsLocked || !studentAnswer.trim()
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                }`}
              >
                {isSubmitting ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>ENVIAR RESPOSTA E GANHAR XP</span>
              </button>
            </form>
          )}

          {/* Feedback Message */}
          {feedback && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : feedback.type === 'error'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                  : 'bg-sky-950/80 border-sky-500 text-sky-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : feedback.type === 'error' ? (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              )}
              <div className="text-sm font-medium leading-relaxed">{feedback.text}</div>
            </div>
          )}
        </div>
      )}

      {/* Completed Missions by this Team */}
      {currentTeam && currentTeam.missoes_concluidas.length > 0 && (
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Missões Conquistadas ({currentTeam.missoes_concluidas.length})
            </h4>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              Total: {currentTeam.xp_total} XP
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentTeam.missoes_concluidas.map((tag) => (
              <span
                key={tag}
                className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-lg font-mono font-semibold flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
