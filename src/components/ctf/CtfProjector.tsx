import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Maximize2, Trophy, Volume2, VolumeX, X } from 'lucide-react';
import { ctfCall } from '../../utils/ctfApi';
import { CtfStoredRoom, CtfTeacherView } from '../../types/ctf';
import { useTheme } from '../../utils/theme';
import { TimerDisplay, useCountdown, useTimerAlerts } from '../common/TimerDisplay';
import { Top5Board } from './Top5Board';

const PROJECTOR_POLL_MS = 5_000;

interface CtfProjectorProps {
  room: CtfStoredRoom;
  siteLink: string;
  onClose: () => void;
}

/** Telão: Top 5 e cronômetro em tela cheia para projetar na sala; vira pódio final quando o tempo acaba. */
export const CtfProjector: React.FC<CtfProjectorProps> = ({ room, siteLink, onClose }) => {
  const [view, setView] = useState<CtfTeacherView | null>(null);
  const [skewMs, setSkewMs] = useState(0);
  const [error, setError] = useState('');
  const [sound, setSound] = useState(true);
  const theme = useTheme();

  const load = useCallback(async () => {
    try {
      const v = await ctfCall<CtfTeacherView>('teacherRoom', { token: room.token, adminKey: room.adminKey }, room.api);
      setView(v);
      if (v.sala.agora) setSkewMs(Date.now() - v.sala.agora);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [room]);

  useEffect(() => {
    load();
    const id = setInterval(load, PROJECTOR_POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const timer = view?.sala.timer ?? null;
  const { seconds, phase } = useCountdown(timer, skewMs);
  useTimerAlerts(seconds, Boolean(timer && timer.fimEm > 0), sound);

  const finished = Boolean(view) && (phase === 'fim' || view?.sala.status === 'encerrada');
  const celebrated = useRef(false);
  useEffect(() => {
    if (!finished) {
      celebrated.current = false;
      return;
    }
    if (celebrated.current || !view?.alunos.length) return;
    celebrated.current = true;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    try {
      confetti({ particleCount: 160, spread: 110, origin: { y: 0.35 } });
    } catch {
      // ignore
    }
  }, [finished, view]);

  const rows = useMemo(
    () => (view?.alunos ?? []).map((a) => ({ nome: a.nome, xp: a.xp, fase: a.fase_atual, fogos: a.fogos })),
    [view]
  );
  const iconBtn = 'p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white overflow-y-auto" role="dialog" aria-label="Telão do CTF">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black flex items-center gap-3">
              <Trophy className="w-10 h-10 text-amber-400" /> {finished ? 'Pódio final' : 'Top 5 ao vivo'}
            </h2>
            <p className="text-slate-400 mt-1 text-lg">
              {room.nome} • {view ? view.alunos.length : '…'} alunos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSound((s) => !s)} className={iconBtn} title={sound ? 'Silenciar alertas' : 'Ativar alertas sonoros'} aria-label={sound ? 'Silenciar alertas' : 'Ativar alertas sonoros'} aria-pressed={sound}>
              {sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button onClick={() => document.documentElement.requestFullscreen?.().catch(() => undefined)} className={iconBtn} title="Tela cheia do navegador" aria-label="Tela cheia">
              <Maximize2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className={iconBtn} title="Fechar (Esc)" aria-label="Fechar telão">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && <p className="text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3">{error}</p>}

        {finished && (
          <p className="rounded-2xl border border-red-500/60 bg-red-950/70 text-red-200 px-5 py-4 text-2xl font-black text-center" role="status">
            {phase === 'fim' ? 'Tempo esgotado! Respostas bloqueadas.' : 'Sala encerrada pelo professor.'}
          </p>
        )}

        <div className={timer && theme === 'escuro' ? 'grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] items-start' : 'space-y-6'}>
          {timer && <TimerDisplay timer={timer} seconds={seconds} phase={phase} size={theme === 'claro' ? 'faixa' : 'telao'} />}
          <Top5Board rows={rows} totalFases={view?.sala.total ?? 0} size="big" variant={theme === 'claro' ? 'bars' : 'podium'} />
        </div>

        <div className="text-center text-slate-400 text-xl border-t border-slate-800 pt-6">
          Entre em <span className="font-mono text-slate-200">{siteLink}</span> com o token{' '}
          <span className="font-mono font-black tracking-[0.25em] text-orange-300 text-3xl align-middle">{room.token}</span>
        </div>
      </div>
    </div>
  );
};
