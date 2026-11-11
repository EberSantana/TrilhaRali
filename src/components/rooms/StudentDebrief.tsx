import React, { useEffect, useState } from 'react';
import { CtfDebrief } from '../../types/ctf';
import { ctfCall } from '../../utils/ctfApi';
import { DebriefList, DebriefTitle } from './DebriefList';

interface Props {
  token: string;
  /** só mostra quando o professor liberou o debriefing */
  liberado: boolean;
  quem: 'alunos' | 'equipes';
  accent?: 'emerald' | 'orange';
}

/** Debriefing visto pelo aluno/equipe: aparece quando o professor libera o gabarito. */
export const StudentDebrief: React.FC<Props> = ({ token, liberado, quem, accent }) => {
  const [data, setData] = useState<CtfDebrief | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!liberado) {
      setData(null);
      return;
    }
    let vivo = true;
    ctfCall<CtfDebrief>('debriefStudent', { token })
      .then((d) => vivo && (setData(d), setError('')))
      .catch((e) => vivo && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      vivo = false;
    };
  }, [liberado, token]);

  if (!liberado) return null;
  return (
    <section className="rounded-2xl border border-amber-500/40 bg-slate-900 p-4 space-y-3" aria-label="Debriefing">
      <DebriefTitle>Debriefing · gabarito da sala</DebriefTitle>
      {error && <p className="text-xs text-rose-300">{error}</p>}
      {!data && !error && <p className="text-sm text-slate-400">Carregando o gabarito…</p>}
      {data && <DebriefList data={data} quem={quem} accent={accent} />}
    </section>
  );
};
