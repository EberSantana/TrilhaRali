import { useEffect, useState } from 'react';
import { FileUp, Loader2, Lock, Upload } from 'lucide-react';
import { CRUZ_DISCIPLINAS } from '../../utils/cruzBanco';
import { lerBanco } from '../../utils/cruzBanco';

interface Props {
  /** chama o servidor com a chave de administrador da sala */
  call: <T>(acao: string, dados?: Record<string, unknown>) => Promise<T>;
}

interface Resumo {
  por_disciplina: Record<string, number>;
  importadas?: number;
}

/** Banco de palavras da Cruzadinha: fica só na planilha do professor (nunca no código público do site). */
export function CruzBancoPanel({ call }: Props) {
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [texto, setTexto] = useState('');
  const [substituir, setSubstituir] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    call<Resumo>('cruzBancoResumo').then(setResumo).catch((e) => setMsg(e instanceof Error ? e.message : String(e)));
  }, [call]);

  const leitura = lerBanco(texto);

  const abrirArquivo = async (f: File | undefined) => {
    if (f) setTexto(await f.text());
  };

  const importar = async () => {
    if (!leitura.linhas.length) return;
    if (substituir && !window.confirm('Substituir todo o banco atual pela lista importada?')) return;
    setBusy(true);
    setMsg('');
    try {
      const r = await call<Resumo>('cruzBancoImport', { linhas: leitura.linhas, substituir });
      setResumo(r);
      setTexto('');
      setMsg(`${r.importadas} palavras importadas.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 rounded-2xl border border-emerald-300 bg-emerald-50/60 p-4 space-y-3 text-slate-800">
      <div className="flex items-start gap-2">
        <Lock className="w-4 h-4 mt-0.5 text-emerald-700 shrink-0" />
        <p className="text-sm">
          <strong>Banco de palavras da Cruzadinha.</strong> Fica só na aba <code>CruzBanco</code> da sua planilha, fora do código do site, então os alunos não têm como ver a lista. Vale para todas as suas salas.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {CRUZ_DISCIPLINAS.map((d) => (
          <div key={d} className="rounded-lg bg-white border border-emerald-200 px-2.5 py-1.5">
            <div className="text-slate-500 truncate" title={d}>{d}</div>
            <div className="text-lg font-black">{resumo ? resumo.por_disciplina[d] ?? 0 : '…'}</div>
          </div>
        ))}
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Uma palavra por linha: disciplina;palavra;dica</span>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={5}
          placeholder={'Banco de Dados;EXEMPLO;Escreva aqui a dica da palavra\nsites;OUTRAPALAVRA;Apelidos aceitos: bd, info, sites, linux'}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-[13px]"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold cursor-pointer hover:bg-slate-50">
          <FileUp className="w-4 h-4" /> Abrir arquivo (.csv ou .txt)
          <input type="file" accept=".csv,.txt,text/csv,text/plain" className="sr-only" onChange={(e) => abrirArquivo(e.target.files?.[0])} />
        </label>
        <label className="inline-flex items-center gap-1.5 text-sm">
          <input type="checkbox" checked={substituir} onChange={(e) => setSubstituir(e.target.checked)} className="accent-emerald-600" />
          Substituir o banco atual
        </label>
        <button
          type="button"
          onClick={importar}
          disabled={busy || !leitura.linhas.length}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 px-3 py-1.5 text-sm font-black text-white"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Importar {leitura.linhas.length || ''}
        </button>
      </div>

      {texto && (
        <p className="text-xs text-slate-600">
          {leitura.linhas.length} palavras prontas{leitura.erros.length ? `; ${leitura.erros.length} linhas ignoradas: ${leitura.erros.slice(0, 3).join(' · ')}${leitura.erros.length > 3 ? '…' : ''}` : '.'}
        </p>
      )}
      {msg && <p className="text-sm font-bold text-emerald-800">{msg}</p>}
      <p className="text-[11px] text-slate-500">Depois de importar, use “Nova grade” nas salas que já estão com a Cruzadinha liberada.</p>
    </div>
  );
}
