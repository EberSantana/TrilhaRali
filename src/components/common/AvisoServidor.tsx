import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, Copy, RefreshCw } from 'lucide-react';
import { CTF_APPS_SCRIPT } from '../../data/ctfAppsScript';
import { conferirServidor, type InfoServidor } from '../../utils/servidorVersao';

/**
 * Aviso para o professor quando o Apps Script publicado é anterior ao site (funções novas falhariam).
 * Some sozinho quando o servidor está em dia ou não respondeu (sem servidor não há o que comparar).
 */
export const AvisoServidor: React.FC = () => {
  const [info, setInfo] = useState<InfoServidor | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [conferindo, setConferindo] = useState(false);
  useEffect(() => {
    let vivo = true;
    void conferirServidor().then((r) => vivo && setInfo(r));
    return () => {
      vivo = false;
    };
  }, []);
  if (!info || info.situacao !== 'desatualizado') return null;

  const copiar = () => {
    void navigator.clipboard?.writeText(CTF_APPS_SCRIPT);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2000);
  };
  const conferir = async () => {
    setConferindo(true);
    setInfo(await conferirServidor(undefined, true));
    setConferindo(false);
  };

  return (
    <section role="alert" className="rounded-2xl border border-amber-500/50 bg-amber-500/10 p-4 text-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-black text-amber-200">O servidor (Apps Script) está desatualizado</p>
          <p className="text-slate-300">
            O site recebeu funções novas que o servidor publicado ainda não tem; elas podem dar erro na aula. Atualize em 1 minuto:
          </p>
          <ol className="list-decimal space-y-0.5 pl-5 text-slate-300">
            <li>Clique em <strong>Copiar script do servidor</strong>.</li>
            <li>No editor do Apps Script da planilha, apague tudo, cole e salve.</li>
            <li><strong>Implantar → Gerenciar implantações → lápis → Nova versão → Implantar</strong> (o link continua o mesmo).</li>
          </ol>
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={copiar} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-400">
              {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copiado ? 'Script copiado' : 'Copiar script do servidor'}
            </button>
            <button type="button" onClick={() => void conferir()} disabled={conferindo} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/50 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/10 disabled:opacity-60">
              <RefreshCw className={`h-3.5 w-3.5 ${conferindo ? 'animate-spin' : ''}`} /> Já publiquei, conferir de novo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
