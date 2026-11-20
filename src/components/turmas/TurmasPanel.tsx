import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, Download, GraduationCap, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { BackPill } from '../common/ModuleShell';
import { Btn, StepTitle } from '../common/ui';
import { getBancoKey } from '../../utils/bankApi';
import { AnaliseTurma } from './AnaliseTurma';
import { analiseDaTurma, type Analise } from '../../utils/analiseTurma';
import { excluirTurma, lerListaAlunos, listarTurmas, NotaAluno, notasCsv, notasDaTurma, salvarTurma, Turma } from '../../utils/turmasApi';

const msgErro = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  return /a[cç][aã]o desconhecida/i.test(m) ? 'Publique o Apps Script v31 para usar as turmas.' : m;
};

function baixar(nome: string, texto: string) {
  const url = URL.createObjectURL(new Blob([texto], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

/** Turmas: lista de alunos cadastrada uma vez, usada nas salas, e notas somadas de todos os módulos. */
export const TurmasPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [editando, setEditando] = useState<{ id?: string; nome: string; texto: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notas, setNotas] = useState<{ turma: string; salas: number; alunos: NotaAluno[] } | null>(null);
  const [notasBusy, setNotasBusy] = useState('');
  const [analise, setAnalise] = useState<Analise | null>(null);
  const [analiseBusy, setAnaliseBusy] = useState('');

  const carregar = useCallback(async () => {
    if (!getBancoKey()) {
      setErro('Entre na Área do professor com a chave do banco para gerenciar as turmas.');
      setCarregando(false);
      return;
    }
    setCarregando(true);
    try {
      setTurmas(await listarTurmas());
      setErro('');
    } catch (e) {
      setErro(msgErro(e));
    } finally {
      setCarregando(false);
    }
  }, []);
  useEffect(() => {
    void carregar();
  }, [carregar]);

  const previa = editando ? lerListaAlunos(editando.texto) : [];

  const salvar = async () => {
    if (!editando) return;
    setBusy(true);
    setErro('');
    try {
      await salvarTurma({ id: editando.id, nome: editando.nome.trim(), alunos: previa });
      setEditando(null);
      await carregar();
    } catch (e) {
      setErro(msgErro(e));
    } finally {
      setBusy(false);
    }
  };

  const excluir = async (t: Turma) => {
    if (!window.confirm(`Excluir a turma ${t.nome}? As salas e os pontos continuam na planilha, mas o relatório desta turma deixa de existir.`)) return;
    try {
      await excluirTurma(t.id);
      if (notas?.turma === t.nome) setNotas(null);
      await carregar();
    } catch (e) {
      setErro(msgErro(e));
    }
  };

  const verAnalise = async (t: Turma) => {
    setAnaliseBusy(t.id);
    setErro('');
    try {
      setAnalise(await analiseDaTurma(t.id));
      window.setTimeout(() => document.getElementById('analise-turma')?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e) {
      setErro(msgErro(e));
    } finally {
      setAnaliseBusy('');
    }
  };

  const verNotas = async (t: Turma) => {
    setNotasBusy(t.id);
    setErro('');
    try {
      const r = await notasDaTurma(t.id);
      setNotas({ turma: r.turma.nome, salas: r.salas, alunos: r.alunos });
    } catch (e) {
      setErro(msgErro(e));
    } finally {
      setNotasBusy('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-10 space-y-6">
      <header className="space-y-3">
        <BackPill onClick={onBack}>Painel do professor</BackPill>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl border flex items-center justify-center bg-sky-500/10 border-sky-500/30 text-sky-300">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Turmas e notas</h1>
              <p className="text-sm text-slate-400 max-w-2xl">
                Cadastre a lista de alunos uma vez. Nas salas ligadas à turma o aluno escolhe o próprio nome, e as notas somam todos os módulos.
              </p>
            </div>
          </div>
          <Btn variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setEditando({ nome: '', texto: '' })}>
            Nova turma
          </Btn>
        </div>
      </header>

      {erro && <p className="rounded-xl border border-rose-500/40 bg-rose-950/50 p-3 text-sm text-rose-200">{erro}</p>}

      {editando && (
        <section className="space-y-4 rounded-2xl border border-sky-500/40 bg-slate-900/70 p-5" aria-label="Editar turma">
          <div className="flex items-center justify-between">
            <StepTitle n={1} title={editando.id ? 'Editar turma' : 'Nova turma'} hint="Cole a lista do SUAP ou da planilha: um aluno por linha." />
            <button type="button" onClick={() => setEditando(null)} aria-label="Cancelar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Nome da turma</span>
            <input
              value={editando.nome}
              onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
              maxLength={60}
              placeholder="Ex.: 2º B · Informática integrado"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Alunos</span>
              <textarea
                value={editando.texto}
                onChange={(e) => setEditando({ ...editando, texto: e.target.value })}
                rows={12}
                placeholder={'2024001;Ana Souza\n2024002;Bruno Lima\nCarla Dias'}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white outline-none focus:ring-2 focus:ring-sky-500"
              />
              <span className="block text-xs text-slate-500">Formato: matrícula;nome (ou só o nome). A matrícula aparece só para você, no relatório.</span>
            </label>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Como vai ficar ({previa.length} aluno{previa.length === 1 ? '' : 's'})
              </p>
              <ol className="mt-1 max-h-72 space-y-1 overflow-auto text-sm">
                {previa.map((a, i) => (
                  <li key={i} className="flex gap-2 rounded-lg bg-slate-950/60 px-3 py-1.5">
                    <span className="w-6 text-right text-slate-500">{i + 1}</span>
                    <span className="flex-1 text-white">{a.n}</span>
                    <span className="font-mono text-xs text-slate-400">{a.m}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <Btn
            variant="primary"
            disabled={busy || editando.nome.trim().length < 2 || !previa.length}
            onClick={() => void salvar()}
            icon={busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          >
            Salvar turma
          </Btn>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Turmas">
        {carregando && <Loader2 className="w-6 h-6 animate-spin text-sky-400" />}
        {!carregando && !turmas.length && !editando && <p className="text-sm text-slate-400">Nenhuma turma ainda. Clique em "Nova turma" e cole a lista de alunos.</p>}
        {turmas.map((t) => (
          <div key={t.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-base font-black text-white">{t.nome}</p>
            <p className="text-xs text-slate-400">
              {t.alunos.length} aluno{t.alunos.length === 1 ? '' : 's'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn
                size="sm"
                variant="primary"
                disabled={notasBusy === t.id}
                onClick={() => void verNotas(t)}
                icon={notasBusy === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GraduationCap className="w-3.5 h-3.5" />}
              >
                Notas
              </Btn>
              <Btn
                size="sm"
                disabled={analiseBusy === t.id}
                onClick={() => void verAnalise(t)}
                icon={analiseBusy === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BarChart3 className="w-3.5 h-3.5" />}
              >
                Análise
              </Btn>
              <Btn
                size="sm"
                icon={<Pencil className="w-3.5 h-3.5" />}
                onClick={() => setEditando({ id: t.id, nome: t.nome, texto: t.alunos.map((a) => (a.m ? `${a.m};${a.n}` : a.n)).join('\n') })}
              >
                Editar
              </Btn>
              <Btn size="sm" variant="ghost" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => void excluir(t)} aria-label={`Excluir ${t.nome}`}>
                Excluir
              </Btn>
            </div>
          </div>
        ))}
      </section>

      {analise && (
        <div id="analise-turma" className="scroll-mt-4">
          <AnaliseTurma analise={analise} onFechar={() => setAnalise(null)} onBaixar={baixar} />
        </div>
      )}

      {notas && (
        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5" aria-label="Notas da turma">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StepTitle
              n={2}
              title={`Notas · ${notas.turma}`}
              hint={`Pontos somados de ${notas.salas} sala(s) ligadas à turma. No Rali NFC e no Desvendando, cada integrante recebe os pontos da equipe ou da dupla.`}
            />
            <Btn variant="primary" icon={<Download className="w-4 h-4" />} onClick={() => baixar(`notas-${notas.turma.replace(/[^\w-]+/g, '_')}.csv`, notasCsv(notas.turma, notas.alunos))}>
              Baixar CSV
            </Btn>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="py-2 pr-3">Matrícula</th>
                  <th className="py-2 pr-3">Aluno</th>
                  <th className="py-2 pr-3 text-right">CTF</th>
                  <th className="py-2 pr-3 text-right">Cruzada</th>
                  <th className="py-2 pr-3 text-right">Rali NFC</th>
                  <th className="py-2 pr-3 text-right">Desvendando</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {notas.alunos.map((a) => (
                  <tr key={a.n} className="border-t border-slate-800">
                    <td className="py-1.5 pr-3 font-mono text-xs text-slate-400">{a.m}</td>
                    <td className="py-1.5 pr-3 font-semibold text-white">{a.n}</td>
                    <td className="py-1.5 pr-3 text-right text-slate-300">{a.ctf}</td>
                    <td className="py-1.5 pr-3 text-right text-slate-300">{a.cruz}</td>
                    <td className="py-1.5 pr-3 text-right text-slate-300">{a.rali}</td>
                    <td className="py-1.5 pr-3 text-right text-slate-300">{a.desv}</td>
                    <td className={`py-1.5 text-right font-black ${a.total ? 'text-amber-300' : 'text-rose-300'}`}>{a.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500">Total zero em vermelho: o aluno não pontuou em nenhuma sala da turma (faltou ou não entrou com o próprio nome).</p>
        </section>
      )}
    </div>
  );
};
