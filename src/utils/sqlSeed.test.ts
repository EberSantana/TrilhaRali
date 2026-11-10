import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import { BANCO_CTF_SQL, BANCO_RALI_SQL } from './sqlSeed.ts';
import { ALL_MISSIONS } from '../data/missions.ts';

const scalar = (db: any, sql: string) => db.exec(sql)[0].values[0][0];

test('banco dos alunos não vaza gabaritos (sem equipes/missoes/resposta_curta)', () => {
  assert.match(BANCO_RALI_SQL, /resposta_curta/);
  assert.doesNotMatch(BANCO_CTF_SQL, /resposta_curta/i);
  assert.doesNotMatch(BANCO_CTF_SQL, /CREATE TABLE missoes/i);
  assert.doesNotMatch(BANCO_CTF_SQL, /CREATE TABLE equipes/i);
  // nenhuma resposta curta de missão aparece como texto de gabarito rotulado no script
  for (const m of ALL_MISSIONS.slice(0, 5)) assert.equal(BANCO_CTF_SQL.includes(m.pergunta), false);
});

test('SQLite real: o banco dos alunos roda e permite chegar às respostas das atividades', async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.exec(BANCO_CTF_SQL);

  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")[0].values.flat();
  assert.equal(tables.includes('missoes'), false);
  assert.equal(tables.includes('equipes'), false);
  assert.ok(tables.includes('Funcionarios'));

  const byTag = (t: string) => ALL_MISSIONS.find((m) => m.tag_id === t)!.resposta_curta;
  assert.equal(String(scalar(db, 'SELECT COUNT(*) FROM Funcionarios')), byTag('tag_02'));
  assert.equal(
    String(scalar(db, `SELECT p.nome FROM Produtos p JOIN Vendas v ON p.id = v.id_produto GROUP BY p.id ORDER BY SUM(v.quantidade) DESC LIMIT 1`)).toLowerCase(),
    byTag('tag_03')
  );
  assert.equal(
    String(scalar(db, 'SELECT nome FROM Alunos WHERE nota = (SELECT MAX(nota) FROM Alunos)')).toLowerCase(),
    byTag('tag_05')
  );
});
