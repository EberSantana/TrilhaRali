import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  GraduationCap, 
  Eye, 
  EyeOff, 
  LogOut,
  Save
} from 'lucide-react';
import { IfsLogo } from './IfsLogo';
import { 
  verifyTeacherPin, 
  setTeacherAuthenticated, 
  getTeacherPin, 
  saveTeacherPin 
} from '../utils/storage';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTeacher: boolean;
  onAuthenticated: () => void;
  onDeauthenticated: () => void;
  targetFeatureName?: string;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  isTeacher,
  onAuthenticated,
  onDeauthenticated,
  targetFeatureName,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Mode: 'auth' | 'change_pin'
  const [mode, setMode] = useState<'auth' | 'change_pin'>('auth');
  const [currentPinCheck, setCurrentPinCheck] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPinConfirm, setNewPinConfirm] = useState('');

  if (!isOpen) return null;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!pin.trim()) {
      setErrorMsg('Por favor, digite o PIN.');
      return;
    }

    if (verifyTeacherPin(pin)) {
      setTeacherAuthenticated(true, rememberMe);
      setSuccessMsg('Autenticado com sucesso! Modo Professor ativado.');
      setTimeout(() => {
        setSuccessMsg('');
        setPin('');
        onAuthenticated();
        onClose();
      }, 500);
    } else {
      setErrorMsg('PIN incorreto. Verifique o código e tente novamente.');
    }
  };

  const handleLockTeacherMode = () => {
    setTeacherAuthenticated(false);
    onDeauthenticated();
    setSuccessMsg('Modo Professor bloqueado. Aplicação retornou ao Modo Aluno.');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 600);
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!verifyTeacherPin(currentPinCheck)) {
      setErrorMsg('O PIN atual informado está incorreto.');
      return;
    }

    if (newPin.trim().length < 4) {
      setErrorMsg('O novo PIN deve conter no mínimo 4 caracteres.');
      return;
    }

    if (newPin !== newPinConfirm) {
      setErrorMsg('A confirmação do novo PIN não confere.');
      return;
    }

    saveTeacherPin(newPin.trim());
    setSuccessMsg('PIN atualizado com sucesso!');
    setCurrentPinCheck('');
    setNewPin('');
    setNewPinConfirm('');
    setTimeout(() => {
      setMode('auth');
      setSuccessMsg('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-900/60 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5">
          <IfsLogo size="sm" className="p-1 bg-white/5 rounded-xl border border-emerald-500/20 shrink-0" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                IFS Tobias Barreto
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                Prof. Eber Santana
              </span>
            </div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Controle de Acesso do Professor</span>
            </h3>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
          <div className="flex items-center gap-2 font-bold text-emerald-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {targetFeatureName 
                ? `Acesso Restrito: ${targetFeatureName}` 
                : 'Proteção contra spoilers e alterações de dados'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            As seções de <strong>Debriefing (Gabarito Completo)</strong>, <strong>Missões</strong>, <strong>SQLite</strong>, <strong>Google Sheets</strong> e <strong>Gestão de Salas/Alunos</strong> são restritas ao professor para manter o sigilo das respostas durante a dinâmica.
          </p>
        </div>

        {/* Feedback messages */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Already Authenticated View */}
        {isTeacher && mode === 'auth' ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Você está autenticado no Modo Professor</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Todas as abas pedagógicas, gabaritos e gerenciamento de salas/alunos estão liberados neste computador.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMode('change_pin')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition border border-slate-700"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Alterar PIN de Acesso</span>
              </button>

              <button
                type="button"
                onClick={handleLockTeacherMode}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition border border-rose-500/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Bloquear Modo Professor (Modo Aluno)</span>
              </button>
            </div>
          </div>
        ) : mode === 'change_pin' ? (
          /* Change PIN Form */
          <form onSubmit={handleChangePinSubmit} className="space-y-3.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Alterar PIN do Professor</span>
              <button
                type="button"
                onClick={() => setMode('auth')}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                Voltar
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                PIN Atual:
              </label>
              <input
                type="password"
                value={currentPinCheck}
                onChange={(e) => setCurrentPinCheck(e.target.value)}
                placeholder="Digite o PIN atual..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                Novo PIN:
              </label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Mínimo 4 caracteres..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                Confirme o Novo PIN:
              </label>
              <input
                type="password"
                value={newPinConfirm}
                onChange={(e) => setNewPinConfirm(e.target.value)}
                placeholder="Repita o novo PIN..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Novo PIN</span>
            </button>
          </form>
        ) : (
          /* Login Form with PIN */
          <form onSubmit={handleAuthSubmit} className="space-y-4 pt-1">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">
                Digite o PIN do Professor:
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder=""
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition"
                  aria-label={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-700 focus:ring-emerald-500"
              />
              <label htmlFor="rememberMe" className="text-xs text-slate-400 select-none cursor-pointer">
                Lembrar autenticação neste navegador (PC do Professor)
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/25 active:scale-[0.98]"
            >
              <KeyRound className="w-4 h-4" />
              <span>Desbloquear Acesso do Professor</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
