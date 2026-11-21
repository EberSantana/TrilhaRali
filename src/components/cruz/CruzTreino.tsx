import React, { useCallback, useMemo, useState } from 'react';
import { Loader2, Puzzle, RotateCcw, Shuffle } from 'lucide-react';
import { Cruzadinha, type CruzApi } from '../ctf/Cruzadinha';
import { SelecaoCruz, rotuloSelecao, selecaoParaEnvio, totalSelecionado, useCruzAssuntos, type Selecao } from './SelecaoCruz';
import { ctfCall } from '../../utils/ctfApi';
import type { CruzEstado } from '../../types/ctf';

const KEY_TREINO = 'rali_cruz_treino_v1';

interface Salvo {
  gid: number;
  /** o que foi marcado, em texto (ex.: Banco de Dados › Joins + Redes de Computadores) */
  rotulo?: string;
}

function lerSalvo(): Salvo | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY_TREINO) || 'null');
    return v && typeof v.gid === 'number' ? (v as Salvo) : null;
  } catch {
    return null;
  }
}

/**
 * Treino livre: o aluno escolhe o assunto e o servidor monta a grade na hora. Não há sala, token nem ranking:
 * as palavras são conferidas e as dicas contadas no servidor, só que os pontos ficam para o próprio aluno.
 */
export const CruzTreino: React.FC<{ onRanking?: () => void }> = ({ onRanking }) => {
  const [salvo, setSalvo] = useState<Salvo | null>(lerSalvo);
  const [selecao, setSelecao] = useState<Selecao>({});
  const { mapa, erro: erroAssuntos } = useCruzAssuntos();
  const total = totalSelecionado(mapa, selecao);
  const [palavras, setPalavras] = useState(12);
  const [dicas, setDicas] = useState(30);
  const [reveals, setReveals] = useState(5);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');

  const gerar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setOcupado(true);
    setErro('');
    try {
      const r = await ctfCall<{ cruz: CruzEstado }>('cruzTreinoNovo', { selecao: selecaoParaEnvio(mapa, selecao), palavras, dicas, reveals });
      const novo: Salvo = { gid: r.cruz.grade.id, rotulo: rotuloSelecao(mapa, selecao) };
      localStorage.setItem(KEY_TREINO, JSON.stringify(novo));
      setSalvo(novo);
    } catch (err) {
      setErro(err instanceof Error ? err.message : String(err));
    } finally {
      setOcupado(false);
    }
  };

  const sair = () => {
    try {
      localStorage.removeItem(KEY_TREINO);
    } catch {
      // ignore
    }
    setSalvo(null);
    setErro('');
  };

  const gid = salvo?.gid;
  const api: CruzApi = useMemo(
    () => ({
      estado: async () => (await ctfCall<{ cruz: CruzEstado }>('cruzTreinoEstado', { gid })).cruz,
      conferir: async (id, tentativa) => (await ctfCall<{ cruz: CruzEstado }>('cruzTreinoCheck', { gid, id, tentativa })).cruz,
      dica: async (tipo, id, indice) => (await ctfCall<{ cruz: CruzEstado }>('cruzTreinoHint', { gid, tipo, id, indice })).cruz,
      ranking: async (nome) => (await ctfCall<{ ranking: { posicao: number; total: number; pontos: number; nome: string } }>('cruzTreinoRanking', { gid, nome })).ranking,
      verRanking: onRanking,
    }),
    [gid, onRanking],
  );

  // Treino que expirou no servidor (6 h): volta para o formulário em vez de ficar travado
  const tratarExpirado = useCallback(() => sair(), []);

  if (salvo) {
    const apiSegura: CruzApi = {
      estado: () => api.estado().catch((e) => {
        if (/expirou/i.test(String(e?.message))) tratarExpirado();
        throw e;
      }),
      conferir: api.conferir,
      dica: api.dica,
      ranking: api.ranking,
      verRanking: api.verRanking,
    };
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-300">
            Treino{salvo.rotulo ? <>: <strong className="text-white">{salvo.rotulo}</strong></> : null}. Ao terminar você entra no grande ranking.
          </p>
          <button
            type="button"
            onClick={sair}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Nova cruzada
          </button>
        </div>
        <Cruzadinha token="treino" nome="treino" versao={salvo.gid} api={apiSegura} treino />
      </div>
    );
  }

  const campo = 'w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base text-white focus:ring-2 focus:ring-cyan-500 outline-none';
  return (
    <form onSubmit={gerar} className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
      <div className="text-center space-y-1">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center">
          <Puzzle className="w-7 h-7 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-black text-white">Treino livre</h2>
        <p className="text-sm text-slate-400">Marque as disciplinas e os assuntos e monte sua cruzada. Sem token. Ao terminar, seu nome e seus pontos entram no grande ranking.</p>
      </div>

      {erroAssuntos ? (
        <p className="text-sm text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3">Não consegui carregar as disciplinas. Confira a conexão e tente de novo.</p>
      ) : (
        <SelecaoCruz mapa={mapa} valor={selecao} onChange={setSelecao} />
      )}

      <div className="grid grid-cols-3 items-stretch gap-2">
                <label className="flex flex-col justify-between gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Palavras (6 a 25)</span>
                  <input type="number" min={6} max={25} value={palavras} onChange={(e) => setPalavras(Math.max(6, Math.min(25, Math.floor(Number(e.target.value)) || 6)))} className={`${campo} text-center`} />
                </label>
                <label className="flex flex-col justify-between gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Dicas de letra (0 a 30)</span>
                  <input type="number" min={0} max={30} value={dicas} onChange={(e) => setDicas(Math.max(0, Math.min(30, Math.floor(Number(e.target.value)) || 0)))} className={`${campo} text-center`} />
                </label>
                <label className="flex flex-col justify-between gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Revelar palavra (0 a 10)</span>
                  <input type="number" min={0} max={10} value={reveals} onChange={(e) => setReveals(Math.max(0, Math.min(10, Math.floor(Number(e.target.value)) || 0)))} className={`${campo} text-center`} />
                </label>
              </div>

      {erro && <p className="text-sm text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3">{erro}</p>}

      <button
        type="submit"
        disabled={ocupado || total < 6}
        className="w-full py-3.5 rounded-xl font-black text-base bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white flex items-center justify-center gap-2 transition active:scale-[0.98]"
      >
        {ocupado ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shuffle className="w-5 h-5" />}
        GERAR CRUZADA
      </button>
      <p className="text-[11px] text-center text-slate-500">Cada vez que você gera, sai uma grade diferente com palavras sorteadas do que você marcou.</p>
    </form>
  );
};
