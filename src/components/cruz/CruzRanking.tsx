import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, Trophy } from 'lucide-react';
import { ctfCall } from '../../utils/ctfApi';

export interface LinhaRanking {
  pos: number;
  nome: string;
  pontos: number;
  palavras: number;
  assuntos: string;
  quando: string;
}

const medalha = (pos: number) => (pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : String(pos));

/** Grande Ranking da Cruzada: nome e pontos de quem terminou uma cruzada no treino livre. */
export const CruzRanking: React.FC<{ destaque?: string }> = ({ destaque: destaqueProp }) => {
  const destaque = destaqueProp ?? (() => {
    try {
      return localStorage.getItem('rali_cruz_nome_v1') || '';
    } catch {
      return '';
    }
  })();
  const [linhas, setLinhas] = useState<LinhaRanking[] | null>(null);
  const [total, setTotal] = useState(0);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const r = await ctfCall<{ ranking: LinhaRanking[]; total: number }>('cruzRanking');
      setLinhas(r.ranking);
      setTotal(r.total);
    } catch (e) {
      setErro(/a[cç][aã]o|desconhecida|unknown/i.test(String((e as Error)?.message)) ? 'O ranking precisa do Apps Script v28 publicado.' : e instanceof Error ? e.message : String(e));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <section className="max-w-2xl mx-auto bg-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4" aria-label="Grande ranking da Cruzada">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Grande ranking</h2>
            <p className="text-xs text-slate-400">{total ? `${total} cruzadas concluídas` : 'Termine uma cruzada para entrar aqui'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void carregar()}
          disabled={carregando}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-50"
        >
          {carregando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Atualizar
        </button>
      </header>

      {erro && <p className="text-sm text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3">{erro}</p>}
      {!erro && linhas && linhas.length === 0 && <p className="text-center text-sm text-slate-400 py-8">Ainda ninguém terminou uma cruzada. Seja o primeiro!</p>}

      {linhas && linhas.length > 0 && (
        <ol className="space-y-1.5">
          {linhas.map((l) => {
            const eu = !!destaque && l.nome === destaque;
            return (
              <li
                key={`${l.pos}-${l.quando}`}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                  eu ? 'border-emerald-500/60 bg-emerald-500/10' : l.pos <= 3 ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800 bg-slate-950'
                }`}
              >
                <span className="w-9 shrink-0 text-center text-lg font-black text-amber-300">{medalha(l.pos)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black text-white">{l.nome}</p>
                  <p className="truncate text-[11px] text-slate-500">
                    {l.palavras} palavras{l.assuntos ? ` · ${l.assuntos}` : ''}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-base font-black text-emerald-300">{l.pontos} pts</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
