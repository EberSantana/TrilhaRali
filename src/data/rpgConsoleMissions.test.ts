import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import { RPG_CONSOLE_MISSIONS } from './rpgConsoleMissions';
import { RPG_MISSIONS } from './rpgMissions';
import { BD_MISSIONS } from './bdMissions';
import { ALL_MISSIONS } from './missions';
import { LINUX_MISSIONS } from './linuxMissions';
import { CONSOLE_MISSIONS } from './consoleMissions';
import { INFO_MISSIONS } from './infoMissions';
import { WEB_MISSIONS } from './webMissions';
import { BANCO_CTF_SQL } from '../utils/sqlSeed';

const norm = (s: string) =>
  String(s).toLowerCase().trim().replace(/^["']|["']$/g, '').replace(/;+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

function solve(SQL: Awaited<ReturnType<typeof initSqlJs>>, script: string): string {
  const db = new SQL.Database();
  db.exec(BANCO_CTF_SQL);
  let last: unknown = null;
  for (const st of script.split(/;\s*(?:\n|$)/).map((x) => x.trim()).filter(Boolean)) {
    const r = db.exec(st);
    if (r.length) last = r[r.length - 1].values[0][0];
  }
  return String(last);
}

test('capítulos em ordem, ids e tags únicos em todo o catálogo', () => {
  assert.ok(RPG_CONSOLE_MISSIONS.length >= 20);
  const all = [...ALL_MISSIONS, ...LINUX_MISSIONS, ...CONSOLE_MISSIONS, ...BD_MISSIONS, ...RPG_MISSIONS, ...INFO_MISSIONS, ...WEB_MISSIONS, ...RPG_CONSOLE_MISSIONS];
  assert.equal(new Set(all.map((m) => m.id)).size, all.length);
  assert.equal(new Set(all.map((m) => m.tag_id.toLowerCase())).size, all.length);
  RPG_CONSOLE_MISSIONS.forEach((m, i) => {
    assert.equal(m.package, 'bd_rpg2');
    assert.ok(m.pergunta.startsWith(`Capítulo ${i + 1} —`));
  });
});

test('toda resposta é reproduzida executando a solução no SQLite real', async () => {
  const SQL = await initSqlJs();
  for (const m of RPG_CONSOLE_MISSIONS) {
    const got = norm(solve(SQL, m.sample_query || ''));
    assert.ok([m.resposta_curta, ...(m.alternatives || [])].map(norm).includes(got), `#${m.id}: deu "${got}"`);
  }
});

test('cobre DDL, DML, DQL, JOINs, agrupamento, chaves e transação, sem entregar a resposta', () => {
  const sql = RPG_CONSOLE_MISSIONS.map((m) => m.sample_query || '').join('\n').toUpperCase();
  for (const t of ['CREATE TABLE', 'ALTER TABLE', 'INSERT', 'UPDATE', 'DELETE', 'GROUP BY', 'HAVING', 'ORDER BY', 'DISTINCT', 'LEFT JOIN', ' JOIN ', 'PRAGMA_FOREIGN_KEY_LIST', 'BEGIN', 'ROLLBACK', 'IS NULL']) assert.ok(sql.includes(t), `falta ${t}`);
  for (const m of RPG_CONSOLE_MISSIONS) {
    const r = norm(m.resposta_curta);
    if (r.length >= 5) assert.ok(!norm(m.pergunta).includes(r), `#${m.id} entrega a resposta`);
  }
});

test('as que mexem em dados usam cópias rpg_NN próprias e não tocam nas tabelas da escola', () => {
  const criadas = RPG_CONSOLE_MISSIONS.flatMap((m) => [...(m.sample_query || '').matchAll(/CREATE TABLE (\w+)/gi)].map((x) => x[1].toLowerCase()));
  assert.equal(new Set(criadas).size, criadas.length);
  const base = /\b(departamentos|professores|disciplinas|estudantes|matriculas)\b/i;
  for (const m of RPG_CONSOLE_MISSIONS) {
    for (const st of (m.sample_query || '').split(';')) {
      const x = st.match(/^\s*(?:UPDATE|DELETE FROM|INSERT INTO|ALTER TABLE|DROP TABLE)\s+(\w+)/i);
      if (x) assert.ok(!base.test(x[1]), `#${m.id} altera ${x[1]}`);
    }
  }
});
