import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Database, SqlJsStatic } from 'sql.js';
import { Database as DbIcon, Download, Eraser, Loader2, Play, RotateCcw, Table2, Terminal } from 'lucide-react';
import { BANCO_CTF_SQL } from '../../utils/sqlSeed';

const KEY_DRAFT = 'rali_ctf_sql_draft_v1';
const MAX_ROWS = 500;

// SQLite compilado para WebAssembly: carregado só quando o aluno abre o console
let sqlPromise: Promise<SqlJsStatic> | null = null;
function loadSqlJs(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = (async () => {
      const [{ default: initSqlJs }, { default: wasmUrl }] = await Promise.all([
        import('sql.js'),
        import('sql.js/dist/sql-wasm.wasm?url'),
      ]);
      return initSqlJs({ locateFile: () => wasmUrl });
    })();
    sqlPromise.catch(() => {
      sqlPromise = null; // permite tentar de novo
    });
  }
  return sqlPromise;
}

interface ResultSet {
  columns: string[];
  rows: unknown[][];
  total: number;
}

interface TableInfo {
  name: string;
  columns: Array<{ name: string; type: string; pk: boolean }>;
}

function cellText(v: unknown): React.ReactNode {
  if (v === null || v === undefined) return <span className="italic text-slate-500">NULL</span>;
  if (v instanceof Uint8Array) return <span className="italic text-slate-500">[BLOB {v.length} bytes]</span>;
  return String(v);
}

export const SqlConsole: React.FC = () => {
  const sqlRef = useRef<SqlJsStatic | null>(null);
  const dbRef = useRef<Database | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [origin, setOrigin] = useState<'rali' | 'vazio'>('rali');
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [sql, setSql] = useState(() => {
    try {
      return localStorage.getItem(KEY_DRAFT) || '';
    } catch {
      return '';
    }
  });
  const [results, setResults] = useState<ResultSet[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState<number | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const refreshSchema = useCallback(() => {
    const db = dbRef.current;
    if (!db) return;
    const list = db.exec("SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name");
    const names = list.length ? list[0].values.map((r) => String(r[0])) : [];
    setTables(
      names.map((name) => {
        const info = db.exec(`PRAGMA table_info("${name.replace(/"/g, '""')}")`);
        const cols = info.length ? info[0].values : [];
        return { name, columns: cols.map((c) => ({ name: String(c[1]), type: String(c[2] || ''), pk: Number(c[5]) > 0 })) };
      })
    );
  }, []);

  const createDatabase = useCallback(
    (kind: 'rali' | 'vazio') => {
      const SQL = sqlRef.current;
      if (!SQL) return;
      dbRef.current?.close();
      const db = new SQL.Database();
      try {
        if (kind === 'rali') db.exec(BANCO_CTF_SQL);
      } catch (e) {
        setError(`Não foi possível criar o banco: ${e instanceof Error ? e.message : String(e)}`);
      }
      dbRef.current = db;
      setOrigin(kind);
      setResults([]);
      setMessage(kind === 'rali' ? 'Banco do Rali carregado.' : 'Banco vazio criado.');
      if (kind === 'rali') setError('');
      refreshSchema();
    },
    [refreshSchema]
  );

  useEffect(() => {
    let alive = true;
    loadSqlJs()
      .then((SQL) => {
        if (!alive) return;
        sqlRef.current = SQL;
        createDatabase('rali');
        setStatus('ready');
      })
      .catch(() => alive && setStatus('failed'));
    return () => {
      alive = false;
      dbRef.current?.close();
      dbRef.current = null;
    };
  }, [createDatabase]);

  const updateSql = (value: string) => {
    setSql(value);
    try {
      localStorage.setItem(KEY_DRAFT, value);
    } catch {
      // ignore
    }
  };

  const run = () => {
    const db = dbRef.current;
    if (!db || !sql.trim()) return;
    setError('');
    const t0 = performance.now();
    try {
      const res = db.exec(sql);
      const changes = db.getRowsModified();
      setElapsed(Math.round(performance.now() - t0));
      setResults(res.map((r) => ({ columns: r.columns, rows: r.values.slice(0, MAX_ROWS), total: r.values.length })));
      setMessage(
        res.length
          ? `${res.length} ${res.length === 1 ? 'resultado' : 'resultados'}`
          : `Comando executado com sucesso${changes ? ` (${changes} ${changes === 1 ? 'linha afetada' : 'linhas afetadas'})` : ''}.`
      );
      refreshSchema();
    } catch (e) {
      setElapsed(null);
      setResults([]);
      setMessage('');
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const insertAtCursor = (text: string) => {
    const el = editorRef.current;
    if (!el) return updateSql(sql + text);
    const { selectionStart: a, selectionEnd: b } = el;
    const next = sql.slice(0, a) + text + sql.slice(b);
    updateSql(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + text.length, a + text.length);
    });
  };

  const downloadDb = () => {
    const db = dbRef.current;
    if (!db) return;
    const blob = new Blob([db.export() as BlobPart], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meu_banco.sqlite';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl" aria-label="Console SQLite">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-400" /> Console SQLite
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold">roda no seu navegador</span>
        </h3>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() => createDatabase('rali')}
            disabled={status !== 'ready'}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 disabled:opacity-50 ${
              origin === 'rali' ? 'bg-sky-600/20 border-sky-500/60 text-sky-200' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Recria o banco das atividades (apaga o que você alterou)"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Banco do Rali
          </button>
          <button
            onClick={() => createDatabase('vazio')}
            disabled={status !== 'ready'}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 disabled:opacity-50 ${
              origin === 'vazio' ? 'bg-sky-600/20 border-sky-500/60 text-sky-200' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Começa um banco novo e vazio para você criar as tabelas"
          >
            <DbIcon className="w-3.5 h-3.5" /> Banco vazio
          </button>
          <button
            onClick={downloadDb}
            disabled={status !== 'ready'}
            className="px-2.5 py-1.5 rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 font-semibold flex items-center gap-1.5 disabled:opacity-50"
            title="Baixa o banco atual como arquivo .sqlite"
          >
            <Download className="w-3.5 h-3.5" /> .sqlite
          </button>
        </div>
      </div>

      {status === 'loading' && (
        <div className="py-10 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-sky-400" /> Preparando o SQLite…
        </div>
      )}
      {status === 'failed' && (
        <p className="text-sm text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3">
          Não foi possível carregar o SQLite neste navegador. Recarregue a página ou use o link do banco para rodar em outro programa (ex.: sqliteonline.com).
        </p>
      )}

      {status === 'ready' && (
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
          {/* Esquema */}
          <aside className="space-y-2 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Table2 className="w-3.5 h-3.5" /> Tabelas ({tables.length})
            </div>
            {tables.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhuma tabela.</p>
            ) : (
              <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {tables.map((t) => (
                  <li key={t.name} className="rounded-lg bg-slate-950/70 border border-slate-800">
                    <details>
                      <summary className="cursor-pointer select-none px-2.5 py-1.5 text-xs font-mono font-bold text-sky-200 flex items-center justify-between gap-2">
                        <span className="truncate">{t.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            insertAtCursor(t.name);
                          }}
                          className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Inserir o nome no editor"
                        >
                          inserir
                        </button>
                      </summary>
                      <ul className="px-2.5 pb-2 space-y-0.5">
                        {t.columns.map((c) => (
                          <li key={c.name} className="text-[11px] font-mono text-slate-300 flex justify-between gap-2">
                            <span className="truncate">
                              {c.pk && <span title="Chave primária">🔑 </span>}
                              {c.name}
                            </span>
                            <span className="text-slate-500 shrink-0">{c.type}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Editor e resultados */}
          <div className="space-y-3 min-w-0">
            <textarea
              ref={editorRef}
              value={sql}
              onChange={(e) => updateSql(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  run();
                }
              }}
              rows={6}
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              aria-label="Comandos SQL"
              placeholder="Digite seus comandos SQL aqui…"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono text-emerald-200 placeholder-slate-600 focus:ring-2 focus:ring-sky-500 outline-none resize-y"
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={run}
                disabled={!sql.trim()}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-black flex items-center gap-2 active:scale-[0.98] transition"
              >
                <Play className="w-4 h-4" /> Executar
              </button>
              <button
                onClick={() => {
                  updateSql('');
                  setResults([]);
                  setMessage('');
                  setError('');
                  editorRef.current?.focus();
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-semibold flex items-center gap-1.5"
              >
                <Eraser className="w-4 h-4" /> Limpar
              </button>
              <span className="text-[11px] text-slate-500 hidden sm:inline">Ctrl + Enter executa.</span>
            </div>

            {error && (
              <pre role="alert" className="text-xs text-rose-200 bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 whitespace-pre-wrap font-mono">
                {error}
              </pre>
            )}
            {message && !error && (
              <p className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3 py-2">
                {message}
                {elapsed !== null && <span className="text-slate-500"> • {elapsed} ms</span>}
              </p>
            )}

            {results.map((r, i) => (
              <div key={i} className="rounded-xl border border-slate-800 overflow-hidden">
                <div className="overflow-auto max-h-72">
                  <table className="w-full text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-300 sticky top-0">
                      <tr>
                        {r.columns.map((c, j) => (
                          <th key={j} className="text-left px-3 py-2 font-bold whitespace-nowrap border-b border-slate-800">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {r.rows.map((row, k) => (
                        <tr key={k} className="hover:bg-slate-950/60">
                          {row.map((v, j) => (
                            <td key={j} className="px-3 py-1.5 text-slate-100 whitespace-nowrap">
                              {cellText(v)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-3 py-1.5 bg-slate-950 text-[11px] text-slate-500 border-t border-slate-800">
                  {r.total} {r.total === 1 ? 'linha' : 'linhas'}
                  {r.total > MAX_ROWS && ` (mostrando as primeiras ${MAX_ROWS})`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="text-[11px] text-slate-500">
        Este banco existe só nesta página: ao recarregar ele volta ao início (seu texto é guardado). Use “.sqlite” para salvar uma cópia.
      </p>
    </section>
  );
};
