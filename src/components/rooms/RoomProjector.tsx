import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Maximize2, Pause, Play, Plus, Trophy, Volume2, VolumeX, X } from 'lucide-react';
import { ctfCall } from '../../utils/ctfApi';
import { CtfStoredRoom, CtfTeacherView, RoomTipo } from '../../types/ctf';
import { useTheme } from '../../utils/theme';
import { TimerDisplay, useCountdown, useTimerAlerts } from '../common/TimerDisplay';
import { Top5Board } from '../ctf/Top5Board';
import { ProjectorHeader } from '../common/ProjectorHeader';
import { StatusBanner } from '../common/StatusBanner';
import { Btn, QrImage, Toolbar, ToolbarDivider } from '../common/ui';
import { FinalPodium, useCelebrate } from '../common/FinalPodium';
import type { TimerOp } from '../../utils/timer';

const PROJECTOR_POLL_MS = 5_000;

interface RoomProjectorProps {
  room: CtfStoredRoom;
  tipo: RoomTipo;
  /** link de convite dos alunos (vira QR code e texto no rodapé) */
  inviteLink: string;
  onClose: () => void;
}

/**
 * Telão da sala (Rali NFC ou CTF Online): ranking e cronômetro em tela cheia para projetar.
 * Quando o tempo acaba ou a sala é encerrada, vira o resultado final com pódio e classificação completa.
 */
export const RoomProjector: React.FC<RoomProjectorProps> = ({ room, tipo, inviteLink, onClose }) => {
  const [view, setView] = useState<CtfTeacherView | null>(null);
  const [skewMs, setSkewMs] = useState(0);
  const [error, setError] = useState('');
  const [sound, setSound] = useState(true);
  const [busy, setBusy] = useState(false);
  const theme = useTheme();
  const nfc = tipo === 'rali';
  const entity = nfc ? 'equipes' : 'alunos';

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
  const running = Boolean(timer && timer.fimEm > 0 && seconds > 0);

  const finished = Boolean(view) && (phase === 'fim' || view?.sala.status === 'encerrada');
  useCelebrate(finished && Boolean(view?.alunos.length));

  const livre = !nfc && view?.sala.ordem === 'livre';
  const unit = nfc ? 'missões' : livre ? 'desafios' : 'fases';
  const rows = useMemo(
    () => (view?.alunos ?? []).map((a) => ({ nome: a.nome, xp: a.xp, fase: nfc || livre ? a.acertos : a.fase_atual, fogos: a.fogos })),
    [view, nfc, livre]
  );

  const op = async (kind: TimerOp, minutos?: number) => {
    setBusy(true);
    try {
      await ctfCall('setTimer', { token: room.token, adminKey: room.adminKey, op: kind, minutos }, room.api);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async () => {
    if (!view) return;
    const next = view.sala.status === 'aberta' ? 'encerrada' : 'aberta';
    if (next === 'encerrada' && !window.confirm('Encerrar a sala e mostrar o resultado final?')) return;
    setBusy(true);
    try {
      await ctfCall('setStatus', { token: room.token, adminKey: room.adminKey, status: next }, room.api);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white overflow-y-auto" role="dialog" aria-label={nfc ? 'Telão do Rali NFC' : 'Telão do CTF Online'}>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <ProjectorHeader
          module={nfc ? 'nfc' : 'ctf'}
          title={<><Trophy className="w-9 h-9 text-amber-500" /> {finished ? 'Resultado final' : 'Ranking ao vivo'}</>}
          subtitle={<>{room.nome} • {view ? view.alunos.length : '…'} {entity}</>}
          actions={
            <>
              <Btn onClick={() => setSound((s) => !s)} aria-pressed={sound} icon={sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />} title="Alertas sonoros de 5 min, 1 min e fim">
                {sound ? 'Som ligado' : 'Som desligado'}
              </Btn>
              <Btn onClick={() => document.documentElement.requestFullscreen?.().catch(() => undefined)} icon={<Maximize2 className="w-4 h-4" />}>
                Tela cheia
              </Btn>
              <Btn onClick={onClose} icon={<X className="w-4 h-4" />} title="Fechar (Esc)">
                Fechar
              </Btn>
            </>
          }
        />

        <div
          className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-2xl border px-5 py-3 ${nfc ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-orange-500/40 bg-orange-500/10'}`}
          aria-label="Token da sala"
        >
          <span className="text-sm font-bold uppercase tracking-[0.16em] text-slate-300">Token da sala</span>
          <span className={`font-mono font-black tracking-[0.3em] text-4xl sm:text-5xl select-all ${nfc ? 'text-emerald-400' : 'text-orange-400'}`}>{room.token}</span>
          <span className="text-sm text-slate-400">
            {nfc ? 'Entre no Rali NFC com o token e o nome da equipe' : 'Entre no CTF com o token e o seu nome'} • {inviteLink.split('#')[0]}
          </span>
        </div>

        <Toolbar label="Controles do telão">
          {running ? (
            <Btn variant="warn" disabled={busy || !timer} onClick={() => op('pause')} icon={<Pause className="w-4 h-4" />}>Pausar</Btn>
          ) : (
            <Btn variant="primary" disabled={busy || !timer || seconds <= 0} onClick={() => op('start')} icon={<Play className="w-4 h-4" />}>Iniciar</Btn>
          )}
          <Btn disabled={busy || !timer} onClick={() => op('add', 5)} icon={<Plus className="w-4 h-4" />}>5 min</Btn>
          <ToolbarDivider />
          <Btn variant={view?.sala.status === 'encerrada' ? 'primary' : 'danger'} disabled={busy || !view} onClick={toggleStatus}>
            {view?.sala.status === 'encerrada' ? 'Reabrir sala' : 'Encerrar e mostrar resultado'}
          </Btn>
          {!timer && view && <span className="px-2 text-xs text-slate-400">Sala sem cronômetro: defina o tempo no painel do professor.</span>}
        </Toolbar>

        {error && <p className="text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3">{error}</p>}

        {finished ? (
          <>
            <StatusBanner size="big">{phase === 'fim' ? 'Tempo esgotado! Respostas bloqueadas.' : 'Sala encerrada pelo professor.'}</StatusBanner>
            <FinalPodium rows={rows} totalFases={view?.sala.total ?? 0} unit={unit} entity={entity} size="big" />
          </>
        ) : (
          <div className={timer && theme === 'escuro' ? 'grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] items-start' : 'space-y-6'}>
            {timer && <TimerDisplay timer={timer} seconds={seconds} phase={phase} size={theme === 'claro' ? 'faixa' : 'telao'} />}
            <Top5Board rows={rows} totalFases={view?.sala.total ?? 0} size="big" variant={theme === 'claro' ? 'bars' : 'podium'} unit={unit} />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-6 border-t border-slate-800 pt-6 text-slate-400 text-xl">
          <QrImage text={inviteLink} size={120} label="QR code para entrar na sala" />
          <div className="text-left">
            <div>Entre pelo QR code ou em <span className="font-mono text-slate-200">{inviteLink.split('#')[0]}</span></div>
            <div>
              {nfc ? 'com o token da sala e o nome da equipe' : 'com o token da sala e o seu nome'}:{' '}
              <span className={`font-mono font-black tracking-[0.25em] text-3xl align-middle ${nfc ? 'text-emerald-400' : 'text-orange-400'}`}>{room.token}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
