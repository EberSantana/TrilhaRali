import React, { useEffect, useState } from 'react';
import { UserCheck, LogIn } from 'lucide-react';
import { lerPerfilHub, URL_HUB, type PerfilHub } from '../../utils/perfilHub';

/** Perfil do HUB, atualizado se o aluno entrar ou sair em outra aba. */
export function usePerfilHub(): PerfilHub | null {
  const [p, setP] = useState<PerfilHub | null>(lerPerfilHub);
  useEffect(() => {
    const at = () => setP(lerPerfilHub());
    window.addEventListener('storage', at);
    window.addEventListener('focus', at);
    return () => {
      window.removeEventListener('storage', at);
      window.removeEventListener('focus', at);
    };
  }, []);
  return p;
}

/** Faixa curta na entrada dos jogos: mostra com quem o aluno está jogando ou convida a entrar no HUB. */
export const AvisoPerfilHub: React.FC<{ perfil: PerfilHub | null }> = ({ perfil }) => {
  const voltar = encodeURIComponent(window.location.href);
  if (perfil)
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm">
        <UserCheck className="h-4 w-4 shrink-0 text-emerald-400" />
        <span className="min-w-0 flex-1 text-slate-200">
          Jogando como <b className="text-white">{perfil.nome}</b>
          {perfil.turma && <span className="text-slate-400"> · {perfil.turma}</span>}
        </span>
        <a href={URL_HUB} className="shrink-0 text-xs font-bold text-emerald-400 hover:underline">Trocar</a>
      </div>
    );
  return (
    <a
      href={`${URL_HUB}?volta=${voltar}`}
      className="flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-300 hover:border-emerald-500/60"
    >
      <LogIn className="h-4 w-4 shrink-0 text-emerald-400" />
      <span className="min-w-0 flex-1">
        <b className="text-white">Entre no HUB</b> para jogar com o seu nome e turma, sem digitar.
      </span>
    </a>
  );
};
