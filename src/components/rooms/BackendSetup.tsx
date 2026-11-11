import React, { useState } from 'react';
import { Check, Clipboard, Settings } from 'lucide-react';
import { CTF_APPS_SCRIPT } from '../../data/ctfAppsScript';
import { DEFAULT_CTF_API_URL } from '../../config';
import { explainInvalidApiUrl, isValidApiUrl, saveCtfApiUrl } from '../../utils/ctfApi';
import { Btn } from '../common/ui';

interface BackendSetupProps {
  apiUrl: string;
  onApiUrl: (url: string) => void;
  open: boolean;
  onToggle: () => void;
  onError: (msg: string) => void;
}

/** Servidor (Google Apps Script): o mesmo para o Rali NFC e para o CTF Online. */
export const BackendSetup: React.FC<BackendSetupProps> = ({ apiUrl, onApiUrl, open, onToggle, onError }) => {
  const [copied, setCopied] = useState(false);
  const copyScript = () => {
    navigator.clipboard?.writeText(CTF_APPS_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const save = () => {
    if (!isValidApiUrl(apiUrl)) {
      onError(explainInvalidApiUrl(apiUrl));
      return;
    }
    saveCtfApiUrl(apiUrl);
    onError('');
    onToggle();
  };
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5 space-y-3">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between text-left" aria-expanded={open}>
        <span className="font-bold text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-sky-400" /> Servidor (Google Apps Script)
          {isValidApiUrl(apiUrl) ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">configurado</span>
          ) : (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">pendente</span>
          )}
        </span>
        <span className="text-xs text-slate-400">{open ? 'ocultar' : 'mostrar'}</span>
      </button>

      {open && (
        <div className="space-y-4 pt-3 border-t border-slate-800 text-sm text-slate-300">
          <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-400">
            <li>Crie uma planilha Google <strong>nova</strong> e abra <em>Extensões &gt; Apps Script</em>.</li>
            <li>Apague o código e cole o script abaixo (a mesma planilha serve para o Rali NFC e para o CTF Online).</li>
            <li><em>Implantar &gt; Nova implantação &gt; Aplicativo da Web</em>: executar como <strong>Eu</strong>, acesso <strong>Qualquer pessoa</strong>.</li>
            <li>Copie a URL do Web App (termina em <code>/exec</code>) e cole aqui.</li>
            <li>Já tinha o script? Cole o código novo e use <em>Implantar &gt; Gerenciar implantações &gt; Editar &gt; Nova versão</em>: a URL não muda. As salas do Rali NFC exigem a versão 6 ou mais nova; o CTF livre (painel de desafios) exige a versão 7.</li>
          </ol>
          <Btn onClick={copyScript} icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}>
            Copiar script do servidor
          </Btn>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={apiUrl}
              onChange={(e) => onApiUrl(e.target.value)}
              aria-label="URL do Web App"
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <Btn variant="primary" onClick={save}>Salvar URL</Btn>
          </div>
          {!DEFAULT_CTF_API_URL && (
            <p className="text-[11px] text-slate-500">
              Para os alunos digitarem só o token (sem link de convite), coloque esta URL em <code>DEFAULT_CTF_API_URL</code> no arquivo <code>src/config.ts</code> do projeto e publique.
            </p>
          )}
        </div>
      )}
    </section>
  );
};
