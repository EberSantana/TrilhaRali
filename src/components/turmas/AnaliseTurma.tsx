import React, { useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Download, Search, Target, Users, X } from 'lucide-react';
import { Btn, StepTitle } from '../common/ui';
import { DESV_CASOS } from '../../data/desvCasos';
import { analiseCsv, assuntosOrdenados, MOTIVOS, perguntasDificeis, pct, precisamAtencao, resumo, type Analise } from '../../utils/analiseTurma';

const MODULO: Record<string, string> = { ctf: 'CTF', cruz: 'Cruzada', rali: 'Rali NFC', desv: 'Desvendando', quem: 'Quem sou eu?' };

/** Cor da barra pela taxa de acerto: até 49% pede revisão, 50–74% atenção, 75%+ ok. */
const corTaxa = (t: number) => (t < 50 ? 'bg-rose-500' : t < 75 ? 'bg-amber-500' : 'bg-emerald-500');
const textoTaxa = (t: number) => (t < 50 ? 'text-rose-300' : t < 75 ? 'text-amber-300' : 'text-emerald-300');

const Barra: React.FC<{ valor: number; rotulo: string }> = ({ valor, rotulo }) => (
  <div className="flex items-center gap-2" aria-label={rotulo}>
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
      <div className={`h-full rounded-full ${corTaxa(valor)}`} style={{ width: `${Math.max(2, valor)}%` }} />
    </div>
    <span className={`w-10 text-right font-mono text-xs font-bold ${textoTaxa(valor)}`}>{valor}%</span>
  </div>
);

const Indicador: React.FC<{ icone: React.ReactNode; titulo: string; valor: string; detalhe: string }> = ({ icone, titulo, valor, detalhe }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
      {icone} {titulo}
    </p>
    <p className="mt-1 text-2xl font-black text-white">{valor}</p>
    <p className="text-xs text-slate-500">{detalhe}</p>
  </div>
);

const quando = (ms: number) => (ms ? new Date(ms).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—');

type Ordem = 'nome' | 'pontos' | 'taxa' | 'salas';

/** Análise da turma: participação, quem precisa de atenção, perguntas e assuntos difíceis e casos do Desvendando. */
export const AnaliseTurma: React.FC<{ analise: Analise; onFechar: () => void; onBaixar: (nome: string, texto: string) => void }> = ({ analise: a, onFechar, onBaixar }) => {
  const r = resumo(a);
  const atencao = useMemo(() => precisamAtencao(a), [a]);
  const dificeis = useMemo(() => perguntasDificeis(a), [a]);
  const assuntos = useMemo(() => assuntosOrdenados(a), [a]);
  const [ordem, setOrdem] = useState<Ordem>('pontos');
  const [busca, setBusca] = useState('');
  const tituloCaso = (id: string) => DESV_CASOS.find((c) => c.id === id)?.titulo ?? id;
  const duplasDesv = a.salas.filter((s) => s.tipo === 'desv').reduce((s, x) => s + x.participantes, 0);

  const alunos = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const lista = a.alunos.filter((x) => !q || x.n.toLowerCase().includes(q));
    const taxa = (x: (typeof lista)[number]) => pct(x.acertos, x.acertos + x.erros) ?? -1;
    return [...lista].sort((x, y) =>
      ordem === 'nome' ? x.n.localeCompare(y.n, 'pt-BR') : ordem === 'taxa' ? taxa(y) - taxa(x) : ordem === 'salas' ? y.salas - x.salas : y.total - x.total,
    );
  }, [a.alunos, ordem, busca]);

  if (!a.salas.length) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center" aria-label="Análise da turma">
        <p className="font-bold text-white">{a.turma.nome} ainda não tem salas.</p>
        <p className="mt-1 text-sm text-slate-400">Ao criar uma sala de CTF, Cruzada, Rali NFC ou Desvendando, escolha esta turma. A análise aparece depois da primeira aula.</p>
        <Btn size="sm" className="mt-4" onClick={onFechar}>Fechar</Btn>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5" aria-label="Análise da turma">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <StepTitle n={2} title={`Análise · ${a.turma.nome}`} hint="Todas as salas ligadas à turma. Use para planejar a revisão e chamar quem ficou para trás." />
        <div className="flex gap-2">
          <Btn variant="primary" icon={<Download className="w-4 h-4" />} onClick={() => onBaixar(`analise-${a.turma.nome.replace(/[^\w-]+/g, '_')}.csv`, analiseCsv(a))}>
            Baixar CSV
          </Btn>
          <Btn variant="ghost" icon={<X className="w-4 h-4" />} onClick={onFechar} aria-label="Fechar análise">
            Fechar
          </Btn>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador icone={<Users className="h-3.5 w-3.5" />} titulo="Participação" valor={`${r.participaram}/${r.total}`} detalhe={`${pct(r.participaram, r.total) ?? 0}% da turma jogou`} />
        <Indicador icone={<BarChart3 className="h-3.5 w-3.5" />} titulo="Salas" valor={String(r.salas)} detalhe={Object.entries(a.salas.reduce<Record<string, number>>((m, s) => ({ ...m, [s.tipo]: (m[s.tipo] ?? 0) + 1 }), {})).map(([t, n]) => `${n} ${MODULO[t] ?? t}`).join(' · ')} />
        <Indicador icone={<Target className="h-3.5 w-3.5" />} titulo="Taxa de acerto" valor={r.taxa === null ? '—' : `${r.taxa}%`} detalhe="acertos ÷ tentativas de quem jogou" />
        <Indicador icone={<BarChart3 className="h-3.5 w-3.5" />} titulo="Média de pontos" valor={String(r.media)} detalhe="por aluno que participou" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-300">
            <AlertTriangle className="h-4 w-4 text-amber-300" /> Precisam de atenção ({atencao.length})
          </h3>
          {atencao.length ? (
            <ul className="max-h-80 space-y-1.5 overflow-auto pr-1">
              {atencao.map(({ aluno, motivos }) => (
                <li key={aluno.n} className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold text-slate-100">{aluno.n}</span>
                    <span className="shrink-0 font-mono text-xs text-slate-400">{aluno.total} pts</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {motivos.map((m) => (
                      <span key={m} className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${m === 'sem_participacao' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-500/15 text-amber-300'}`}>
                        {MOTIVOS[m]}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-300">Ninguém em alerta: todos participaram e estão perto da média.</p>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-300">Assuntos (taxa de acerto)</h3>
          {assuntos.length ? (
            <ul className="space-y-2">
              {assuntos.map((s) => (
                <li key={s.assunto}>
                  <div className="flex justify-between gap-2 text-xs">
                    <span className="truncate font-semibold text-slate-200">{s.assunto}</span>
                    <span className="shrink-0 text-slate-500">{s.perguntas} pergunta{s.perguntas === 1 ? '' : 's'} · {s.erros} erro{s.erros === 1 ? '' : 's'}</span>
                  </div>
                  <Barra valor={s.taxa} rotulo={`${s.assunto}: ${s.taxa}% de acerto`} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Sem perguntas de CTF ou Rali NFC nas salas desta turma.</p>
          )}
          <p className="text-[11px] text-slate-500">Vermelho: menos de 50% (vale revisar) · amarelo: 50–74% · verde: 75% ou mais.</p>
        </div>
      </div>

      {dificeis.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-300">Perguntas mais difíceis</h3>
          <ol className="grid gap-2 md:grid-cols-2">
            {dificeis.map((p, i) => (
              <li key={p.tag_id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  {i + 1}º · {p.pacote || p.categoria || 'Sem assunto'}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm text-slate-100" title={p.pergunta}>{p.pergunta}</p>
                <div className="mt-2">
                  <Barra valor={p.taxa} rotulo={`${p.taxa}% acertaram`} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {p.acertos} de {p.participantes} acertaram · {p.erros} tentativa{p.erros === 1 ? '' : 's'} errada{p.erros === 1 ? '' : 's'}
                </p>
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-slate-500">As tentativas erradas por pergunta são contadas a partir desta versão; salas anteriores mostram só os acertos.</p>
        </div>
      )}

      {a.casos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-300">Desvendando ({duplasDesv} dupla{duplasDesv === 1 ? '' : 's'})</h3>
          <ul className="grid gap-2 md:grid-cols-2">
            {[...a.casos].sort((x, y) => x.resolvidos - y.resolvidos).map((c) => (
              <li key={c.caso} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm">
                <p className="font-semibold text-slate-100">{tituloCaso(c.caso)}</p>
                <p className="text-xs text-slate-400">
                  Resolvido por {c.resolvidos} dupla{c.resolvidos === 1 ? '' : 's'} · {(c.erros / Math.max(1, c.resolvidos)).toFixed(1)} erro(s) e {(c.dicas / Math.max(1, c.resolvidos)).toFixed(1)} dica(s) por dupla
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-300">Alunos</h3>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2">
              <Search className="h-3.5 w-3.5 text-slate-500" aria-hidden />
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar aluno" aria-label="Buscar aluno" className="w-36 bg-transparent py-1.5 text-sm text-white placeholder-slate-500 outline-none" />
            </label>
            <select value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)} aria-label="Ordenar alunos" className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm text-white">
              <option value="pontos">Mais pontos</option>
              <option value="taxa">Maior taxa de acerto</option>
              <option value="salas">Mais salas</option>
              <option value="nome">Nome (A–Z)</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">Aluno</th>
                <th className="px-3 py-2 text-right">Salas</th>
                <th className="px-3 py-2 text-right">Pontos</th>
                <th className="px-3 py-2 text-right">Acertos</th>
                <th className="px-3 py-2 text-right">Erros</th>
                <th className="px-3 py-2 text-left">Taxa</th>
                <th className="px-3 py-2 text-right">Última vez</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {alunos.map((x) => {
                const t = pct(x.acertos, x.acertos + x.erros);
                return (
                  <tr key={x.n} className={x.salas === 0 ? 'text-slate-500' : ''}>
                    <td className="px-3 py-2 font-semibold text-slate-100">{x.n}</td>
                    <td className="px-3 py-2 text-right font-mono">{x.salas}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-emerald-300">{x.total}</td>
                    <td className="px-3 py-2 text-right font-mono">{x.acertos}</td>
                    <td className="px-3 py-2 text-right font-mono text-rose-300">{x.erros}</td>
                    <td className="w-40 px-3 py-2">{t === null ? <span className="text-xs text-slate-500">—</span> : <Barra valor={t} rotulo={`${t}% de acerto`} />}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs text-slate-400">{quando(x.ultimo)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
