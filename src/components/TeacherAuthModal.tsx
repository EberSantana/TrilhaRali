import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, KeyRound, Loader2, LogOut, ShieldCheck, X } from 'lucide-react';
import { IfsLogo } from './IfsLogo';
import { setTeacherAuthenticated } from '../utils/storage';
import { clearBancoKey, getBancoKey, pingBanco, saveBancoKey } from '../utils/bankApi';
import { abrirGabaritoCom } from '../utils/missionsStore';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTeacher: boolean;
  onAuthenticated: () => void;
  onDeauthenticated: () => void;
  targetFeatureName?: string;
}

/**
 * Acesso único do professor: a CHAVE DO BANCO liga o modo professor, abre o gabarito das missões prontas e
 * deixa o painel trazer as salas do servidor. A chave é conferida abrindo o gabarito (funciona sem internet)
 * ou, se não abrir, pelo servidor.
 */
export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({ isOpen, onClose, isTeacher, onAuthenticated, onDeauthenticated, targetFeatureName }) => {
  const [chave, setChave] = useState('');
  const [ver, setVer] = useState(false);
  const [lembrar, setLembrar] = useState(true);
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErro('');
    setChave('');
    setTimeout(() => campo.current?.focus(), 50);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const k = chave.trim();
    if (!k) return;
    setBusy(true);
    setErro('');
    try {
      let ok = await abrirGabaritoCom(k);
      if (!ok) {
        try {
          await pingBanco(k);
          ok = true;
        } catch (err) {
          const m = err instanceof Error ? err.message : String(err);
          setErro(/inv[aá]lida/i.test(m) ? 'Chave incorreta. Confira com atenção (diferencia maiúsculas de minúsculas).' : `Não consegui conferir a chave: ${m}`);
        }
      }
      if (ok) {
        saveBancoKey(k);
        setTeacherAuthenticated(true, lembrar);
        onAuthenticated();
        onClose();
      }
    } finally {
      setBusy(false);
    }
  };

  const sair = () => {
    clearBancoKey();
    setTeacherAuthenticated(false);
    onDeauthenticated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="prof-titulo" onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md space-y-5 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-7">
        <button type="button" onClick={onClose} aria-label="Fechar" className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <IfsLogo size="sm" className="shrink-0 rounded-xl border border-emerald-500/20 bg-white/5 p-1" />
          <div>
            <h2 id="prof-titulo" className="text-lg font-black text-white">{isTeacher ? 'Modo professor ativo' : targetFeatureName ? `Área do professor: ${targetFeatureName}` : 'Área do professor'}</h2>
            <p className="text-xs text-slate-400">Um só acesso: a chave do banco.</p>
          </div>
        </div>

        {isTeacher ? (
          <div className="space-y-4">
            <p className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
              <ShieldCheck className="mt-0.5 w-4 h-4 shrink-0" />
              Este aparelho está com a chave {getBancoKey() ? 'conectada' : 'ausente'}: gabarito aberto, salas sincronizadas com o servidor e banco de perguntas liberado.
            </p>
            <p className="text-xs text-slate-400">Num computador compartilhado do laboratório, saia do modo professor ao terminar: a chave é apagada deste aparelho.</p>
            <button type="button" onClick={sair} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-black text-rose-200 transition hover:bg-rose-500/20">
              <LogOut className="w-4 h-4" /> Sair do modo professor
            </button>
          </div>
        ) : (
          <form onSubmit={entrar} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Chave do professor (chave do banco)
              </span>
              <div className="relative">
                <input
                  ref={campo}
                  type={ver ? 'text' : 'password'}
                  value={chave}
                  onChange={(e) => setChave(e.target.value)}
                  autoComplete="current-password"
                  spellCheck={false}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 font-mono text-base text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Esconder a chave' : 'Mostrar a chave'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-white">
                  {ver ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
              Lembrar neste aparelho
            </label>
            {erro && <p className="rounded-xl border border-rose-500/40 bg-rose-950/50 p-3 text-sm text-rose-200">{erro}</p>}
            <button type="submit" disabled={busy || !chave.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-500 disabled:opacity-50">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Entrar como professor
            </button>
            <p className="text-xs text-slate-500">É a chave de 20 caracteres gerada pelo setupBanco no Apps Script. Ela também abre o gabarito e traz as suas salas em qualquer aparelho.</p>
          </form>
        )}
      </div>
    </div>
  );
};
