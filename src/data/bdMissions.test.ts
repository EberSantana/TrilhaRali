import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import { BD_MISSIONS } from './bdMissions';
import { ALL_MISSIONS } from './missions';
import { LINUX_MISSIONS } from './linuxMissions';
import { CONSOLE_MISSIONS } from './consoleMissions';
import { BANCO_CTF_SQL } from '../utils/sqlSeed';

// Mesma normalização do servidor (Apps Script) e do app
const norm = (s: string) =>
  String(s).toLowerCase().trim().replace(/^["']|["']$/g, '').replace(/;+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

function solve(SQL: Awaited<ReturnType<typeof initSqlJs>>, script: string): string {
  const db = new SQL.Database();
  db.exec(BANCO_CTF_SQL);
  let last: unknown = null;
  for (const st of script.split(/;\s*(?:\n|$)/).map((x) => x.trim()).filter(Boolean)) {
    try {
      const r = db.exec(st);
      if (r.length) last = r[r.length - 1].values[0][0];
    } catch {
      // erros esperados (ex.: violação de CHECK) fazem parte do enunciado
    }
  }
  return String(last);
}

test('são 60 missões: 20 fáceis, 20 médias e 20 difíceis, com ids e tags únicos', () => {
  assert.equal(BD_MISSIONS.length, 60);
  for (const p of ['bd_facil', 'bd_medio', 'bd_dificil']) assert.equal(BD_MISSIONS.filter((m) => m.package === p).length, 20, p);
  const all = [...ALL_MISSIONS, ...LINUX_MISSIONS, ...CONSOLE_MISSIONS, ...BD_MISSIONS];
  assert.equal(new Set(all.map((m) => m.id)).size, all.length);
  assert.equal(new Set(all.map((m) => m.tag_id.toLowerCase())).size, all.length);
});

test('cobrem todos os assuntos pedidos', () => {
  const sql = BD_MISSIONS.map((m) => m.sample_query || '').join('\n').toUpperCase();
  for (const termo of ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN', 'INSERT', 'UPDATE', 'DELETE', 'CREATE TABLE', 'ALTER TABLE', 'BEGIN', 'COMMIT', 'ROLLBACK', 'SAVEPOINT', 'PRAGMA_FOREIGN_KEY_LIST']) {
    assert.ok(sql.includes(termo), `falta ${termo}`);
  }
  const cats = new Set(BD_MISSIONS.map((m) => m.category));
  for (const c of ['DDL', 'DML', 'DQL', 'DTL', 'DCL', 'Modelagem']) assert.ok(cats.has(c as never), `falta categoria ${c}`);
});

test('toda resposta é reproduzida executando a solução no banco dos alunos (SQLite real)', async () => {
  const SQL = await initSqlJs();
  for (const m of BD_MISSIONS) {
    const got = norm(solve(SQL, m.sample_query || ''));
    const aceitas = [m.resposta_curta, ...(m.alternatives || [])].map(norm);
    assert.ok(aceitas.includes(got), `#${m.id}: solução deu "${got}", gabarito ${JSON.stringify(aceitas)}`);
  }
});

test('o enunciado não entrega a resposta; as de múltipla escolha a incluem entre as opções', () => {
  for (const m of BD_MISSIONS) {
    const r = norm(m.resposta_curta);
    if (!m.opcoes && r.length >= 5) assert.ok(!norm(m.pergunta).includes(r), `#${m.id} contém a resposta no enunciado`);
    if (m.opcoes) assert.ok(m.opcoes.map(norm).includes(r), `#${m.id}: opções não incluem a resposta`);
  }
});

test('missões que mexem em dados usam cópias próprias: nenhuma altera as tabelas da escola nem repete objeto', () => {
  const criadas = BD_MISSIONS.flatMap((m) => [...(m.sample_query || '').matchAll(/CREATE (?:TABLE|VIEW) (\w+)/gi)].map((x) => x[1].toLowerCase()));
  assert.equal(new Set(criadas).size, criadas.length, 'dois desafios criam o mesmo objeto');
  const base = /\b(departamentos|professores|disciplinas|estudantes|matriculas)\b/i;
  for (const m of BD_MISSIONS) {
    for (const st of (m.sample_query || '').split(';')) {
      if (/^\s*(UPDATE|DELETE FROM|INSERT INTO|ALTER TABLE|DROP TABLE)\s+(\w+)/i.test(st)) {
        const alvo = st.match(/^\s*(?:UPDATE|DELETE FROM|INSERT INTO|ALTER TABLE|DROP TABLE)\s+(\w+)/i)![1];
        assert.ok(!base.test(alvo), `#${m.id} altera a tabela original ${alvo}`);
      }
    }
  }
});

test('o banco dos alunos tem as tabelas da escola e não vaza gabarito', async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.exec(BANCO_CTF_SQL);
  const t = db.exec("SELECT name FROM sqlite_master WHERE type='table'")[0].values.flat();
  for (const n of ['departamentos', 'professores', 'disciplinas', 'estudantes', 'matriculas']) assert.ok(t.includes(n), n);
  assert.doesNotMatch(BANCO_CTF_SQL, /resposta_curta/i);
});
