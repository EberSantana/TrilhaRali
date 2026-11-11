import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Maximize2, Trophy, X } from 'lucide-react';
import { ctfCall } from '../../utils/ctfApi';
import { CtfStoredRoom, CtfTeacherView } from '../../types/ctf';
import { Top5Board } from './Top5Board';

const PROJECTOR_POLL_MS = 5_000;

interface CtfProjectorProps {
  room: CtfStoredRoom;
  siteLink: string;
  onClose: () => void;
}

/** Telão: top 5 em tela cheia para projetar na sala, atualizando a cada 5 segundos. */
export const CtfProjector: React.FC<CtfProjectorProps> = ({ room, siteLink, onClose }) => {
  const [view, setView] = useState<CtfTeacherView | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setView(await ctfCall<CtfTeacherView>('teacherRoom', { token: room.token, adminKey: room.adminKey }, room.api));
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

  const rows = useMemo(
    () => (view?.alunos ?? []).map((a) => ({ nome: a.nome, xp: a.xp, fase: a.fase_atual, fogos: a.fogos })),
    [view]
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white overflow-y-auto" role="dialog" aria-label="Telão do ranking">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black flex items-center gap-3">
              <Trophy className="w-10 h-10 text-amber-400" /> Ranking CTF
            </h2>
            <p className="text-slate-400 mt-1 text-lg">{room.nome} • {view ? view.alunos.length : '…'} alunos</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => document.documentElement.requestFullscreen?.().catch(() => undefined)}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700"
              title="Tela cheia do navegador"
              aria-label="Tela cheia"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700" title="Fechar (Esc)" aria-label="Fechar telão">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && <p className="text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3">{error}</p>}

        <Top5Board rows={rows} totalFases={view?.sala.total ?? 0} size="big" />

        <div className="text-center text-slate-400 text-xl border-t border-slate-800 pt-6">
          Entre em <span className="font-mono text-slate-200">{siteLink}</span> com o token{' '}
          <span className="font-mono font-black tracking-[0.25em] text-orange-300 text-3xl align-middle">{room.token}</span>
        </div>
      </div>
    </div>
  );
};
