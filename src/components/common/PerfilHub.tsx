import React, { useEffect, useState } from 'react';
import { UserCheck, LogIn } from 'lucide-react';
import { EVENTO_PERFIL_HUB, ignorarPerfilHub, lerPerfilHub, URL_HUB, type PerfilHub } from '../../utils/perfilHub';

/** Perfil do HUB, atualizado se o aluno entrar ou sair em outra aba. */
export function usePerfilHub(): PerfilHub | null {
  const [p, setP] = useState<PerfilHub | null>(lerPerfilHub);
  useEffect(() => {
    const at = () => setP(lerPerfilHub());
    window.addEventListener('storage', at);
    window.addEventListener('focus', at);
    window.addEventListener(EVENTO_PERFIL_HUB, at);
    return () => {
      window.removeEventListener('storage', at);
      window.removeEventListener('focus', at);
      window.removeEventListener(EVENTO_PERFIL_HUB, at);
    };
  }, []);
  return p;
}

/** Faixa curta na entrada dos jogos: mostra com quem o aluno está jogando ou convida a entrar no HUB. */
export const AvisoPerfilHub: React.FC<{ perfil: PerfilHub | null; onNaoSou?: () => void }> = ({ perfil, onNaoSou }) => {
  const voltar = encodeURIComponent(window.location.href);
  if (perfil)
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm">
        <UserCheck className="h-4 w-4 shrink-0 text-emerald-400" />
        <span className="min-w-0 flex-1 text-slate-200">
          Entrando como <b className="text-white">{perfil.nome}</b>
          {perfil.turma && <span className="text-slate-400"> · {perfil.turma}</span>}
        </span>
        <button
          type="button"
          onClick={() => {
            ignorarPerfilHub();
            onNaoSou?.();
          }}
          className="shrink-0 text-xs font-bold text-emerald-400 hover:underline"
        >
          Não sou eu
        </button>
      </div>
    );
  return <BotaoEntrarHub voltar={voltar} />;
};

/** Botão para entrar pelo HUB: o aluno escolhe curso, ano, turma e o próprio nome na lista (com PIN) e volta para cá. */
export const BotaoEntrarHub: React.FC<{ voltar?: string; texto?: string }> = ({ voltar, texto }) => (
  <a
    href={`${URL_HUB}?volta=${voltar ?? encodeURIComponent(window.location.href)}`}
    className="flex items-center gap-3 rounded-xl border-2 border-emerald-500/60 bg-emerald-500/10 px-4 py-3 text-sm text-slate-200 transition hover:bg-emerald-500/20"
  >
    <LogIn className="h-5 w-5 shrink-0 text-emerald-400" />
    <span className="min-w-0 flex-1 leading-snug">
      <b className="block text-base text-white">{texto ?? 'Entrar com meu curso e nome'}</b>
      Escolha o curso, o ano, a turma e o seu nome na lista. Depois você volta para cá.
    </span>
  </a>
);
