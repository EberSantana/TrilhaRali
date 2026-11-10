import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Copy, 
  Check, 
  Play, 
  Table, 
  Terminal, 
  Sparkles,
  FileCode,
  Layers
} from 'lucide-react';
import { BANCO_RALI_SQL } from '../utils/sqlSeed';

export const SqlPlayground: React.FC = () => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'sandbox' | 'tables'>('script');
  const [queryInput, setQueryInput] = useState<string>('SELECT COUNT(*) AS total_funcionarios FROM Funcionarios;');
  const [queryOutput, setQueryOutput] = useState<{ columns: string[]; rows: (string | number)[][] } | null>({
    columns: ['total_funcionarios'],
    rows: [[145]],
  });

  const handleCopySql = () => {
    navigator.clipboard.writeText(BANCO_RALI_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([BANCO_RALI_SQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'banco_rali.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Quick sandbox simulator for testing the lab queries
  const runPresetQuery = (type: 'count_func' | 'join_vendas' | 'boss_aluno' | 'count_bens') => {
    if (type === 'count_func') {
      setQueryInput('SELECT COUNT(*) AS total FROM Funcionarios;');
      setQueryOutput({
        columns: ['total'],
        rows: [[145]],
      });
    } else if (type === 'join_vendas') {
      setQueryInput(`SELECT p.nome, SUM(v.quantidade) as total_vendido
FROM Produtos p
JOIN Vendas v ON p.id = v.id_produto
GROUP BY p.id, p.nome
ORDER BY total_vendido DESC;`);
      setQueryOutput({
        columns: ['nome', 'total_vendido'],
        rows: [
          ['Notebook Dell', 135],
          ['Mouse Sem Fio', 35],
          ['Teclado Mecânico', 18],
          ['Monitor 24 Pol', 12],
        ],
      });
    } else if (type === 'boss_aluno') {
      setQueryInput(`SELECT nome, nota FROM Alunos 
WHERE nota = (SELECT MAX(nota) FROM Alunos);`);
      setQueryOutput({
        columns: ['nome', 'nota'],
        rows: [['Juliane', 9.8]],
      });
    } else if (type === 'count_bens') {
      setQueryInput(`SELECT situacao, COUNT(*) as qtd FROM bens GROUP BY situacao;`);
      setQueryOutput({
        columns: ['situacao', 'qtd'],
        rows: [
          ['Ativo', 4],
          ['Em Manutenção', 1],
        ],
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SQLite no Laboratório de Informática
              </span>
              <span className="text-xs text-slate-400">Esquema Completo do Rali</span>
            </div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <span>Banco de Dados MVP (SQLite)</span>
              <Database className="w-8 h-8 text-indigo-400" />
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Script <code className="text-indigo-300 font-mono">banco_rali.sql</code> pronto para rodar nos PCs dos alunos ou no SQLite Online.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleCopySql}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm flex items-center gap-2 transition"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? 'Copiado!' : 'Copiar Script'}</span>
            </button>

            <button
              onClick={handleDownloadSql}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
            >
              <Download className="w-4 h-4" />
              <span>Baixar banco_rali.sql</span>
            </button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('script')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'script'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Código SQL Completo</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'sandbox'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Simulador de Consultas</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'tables'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Tabelas & Registros de Teste</span>
          </button>
        </div>
      </div>

      {/* Tab 1: SQL Code Viewer */}
      {activeTab === 'script' && (
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span className="font-mono font-bold text-indigo-300">banco_rali.sql (DDL + DML Seeds)</span>
            <span>Pronto para copiar para o terminal ou DBeaver</span>
          </div>

          <pre className="font-mono text-xs sm:text-sm text-emerald-300/90 bg-slate-950 p-6 rounded-2xl border border-slate-800 overflow-x-auto leading-relaxed max-h-[600px]">
            {BANCO_RALI_SQL}
          </pre>
        </div>
      )}

      {/* Tab 2: Query Sandbox */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Editor de Consultas SQLite
                </h3>
              </div>

              <textarea
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 font-mono text-xs sm:text-sm text-emerald-300 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Execute queries para validar o resultado curto que os alunos digitarão.
                </span>
                <button
                  onClick={() => runPresetQuery('count_func')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Executar</span>
                </button>
              </div>
            </div>

            {/* Results Table */}
            {queryOutput && (
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Resultado Retornado:
                </span>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-indigo-300 border-b border-slate-800">
                      <tr>
                        {queryOutput.columns.map((col, i) => (
                          <th key={i} className="p-3 font-bold">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {queryOutput.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/50">
                          {row.map((val, cIdx) => (
                            <td key={cIdx} className="p-3">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Testes Rápidos dos Desafios
            </h4>
            <div className="space-y-2.5">
              <button
                onClick={() => runPresetQuery('count_func')}
                className="w-full p-3 text-left rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs transition space-y-1"
              >
                <div className="font-bold text-emerald-400">tag_02: COUNT Funcionários</div>
                <div className="text-slate-400 text-[11px]">SELECT COUNT(*) FROM Funcionarios → 145</div>
              </button>

              <button
                onClick={() => runPresetQuery('join_vendas')}
                className="w-full p-3 text-left rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs transition space-y-1"
              >
                <div className="font-bold text-emerald-400">tag_03: JOIN Vendas e Produtos</div>
                <div className="text-slate-400 text-[11px]">Produto mais vendido → Notebook Dell</div>
              </button>

              <button
                onClick={() => runPresetQuery('boss_aluno')}
                className="w-full p-3 text-left rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs transition space-y-1"
              >
                <div className="font-bold text-amber-400">tag_05 (Boss): Subquery Alunos</div>
                <div className="text-slate-400 text-[11px]">Aluno com maior nota → Juliane (9.8)</div>
              </button>

              <button
                onClick={() => runPresetQuery('count_bens')}
                className="w-full p-3 text-left rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs transition space-y-1"
              >
                <div className="font-bold text-emerald-400">tag_crud_02: COUNT Bens Patrimoniais</div>
                <div className="text-slate-400 text-[11px]">Agrupamento por situação</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Tables Overview */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-mono font-bold text-emerald-400">Funcionarios</h4>
              <span className="text-xs text-slate-400">145 registros</span>
            </div>
            <p className="text-xs text-slate-300">
              Colunas: <code className="text-indigo-300">id, nome, cargo, salario, setor</code>. Utilizada no desafio do COUNT(*) da tag_02.
            </p>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-mono font-bold text-emerald-400">Produtos & Vendas</h4>
              <span className="text-xs text-slate-400">Relação 1:N</span>
            </div>
            <p className="text-xs text-slate-300">
              Colunas: <code className="text-indigo-300">Produtos (id, nome, preco)</code> e <code className="text-indigo-300">Vendas (id, id_produto, quantidade)</code>. Desafio do JOIN da tag_03.
            </p>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-mono font-bold text-amber-400">Alunos</h4>
              <span className="text-xs text-slate-400">5 registros</span>
            </div>
            <p className="text-xs text-slate-300">
              Colunas: <code className="text-indigo-300">id, nome, nota</code>. Contém a aluna 'Juliane' com a nota máxima de 9.8 para a subquery da tag_05.
            </p>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-mono font-bold text-emerald-400">bens</h4>
              <span className="text-xs text-slate-400">5 registros</span>
            </div>
            <p className="text-xs text-slate-300">
              Colunas: <code className="text-indigo-300">id, descricao, setor, situacao, valor</code>. Tabela base para o roteiro dos 16 comandos CRUD.
            </p>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-mono font-bold text-emerald-400">Livros & Emprestimos</h4>
              <span className="text-xs text-slate-400">Biblioteca</span>
            </div>
            <p className="text-xs text-slate-300">
              Colunas: <code className="text-indigo-300">Livros (id, titulo, autor)</code> e <code className="text-indigo-300">Emprestimos (id, id_aluno, id_livro)</code>. Usada no pacote Biblioteca.
            </p>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-mono font-bold text-emerald-400">Plano & Aluno</h4>
              <span className="text-xs text-slate-400">Academia</span>
            </div>
            <p className="text-xs text-slate-300">
              Cenário de modelagem conceitual/lógica da academia com a chave primária <code className="text-indigo-300">cod_plano</code> e FK no Aluno.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
