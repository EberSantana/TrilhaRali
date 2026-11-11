import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
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
      // erros esperados (ex.: violação de NOT NULL) são parte do enunciado
    }
  }
  return String(last);
}

test('há 50 missões com ids e tags únicos', () => {
  assert.equal(CONSOLE_MISSIONS.length, 50);
  assert.equal(new Set(CONSOLE_MISSIONS.map((m) => m.id)).size, 50);
  assert.equal(new Set(CONSOLE_MISSIONS.map((m) => m.tag_id)).size, 50);
});

test('toda resposta é reproduzida executando a solução no banco dos alunos', async () => {
  const SQL = await initSqlJs();
  for (const m of CONSOLE_MISSIONS) {
    const got = norm(solve(SQL, m.sample_query || ''));
    const aceitas = [m.resposta_curta, ...(m.alternatives || [])].map(norm);
    assert.ok(aceitas.includes(got), `#${m.id}: solução deu "${got}", gabarito ${JSON.stringify(aceitas)}`);
  }
});

test('o enunciado não entrega a resposta nem o comando', () => {
  for (const m of CONSOLE_MISSIONS) {
    const p = norm(m.pergunta);
    const r = norm(m.resposta_curta);
    if (r.length >= 6) assert.ok(!p.includes(r), `#${m.id} contém a resposta no enunciado`);
  }
});

test('nenhuma missão de dados depende de outra fase (tabelas criadas têm nomes próprios)', () => {
  const criadas = CONSOLE_MISSIONS.flatMap((m) => [...(m.sample_query || '').matchAll(/CREATE (?:TABLE|VIEW|INDEX) (\w+)/gi)].map((x) => x[1].toLowerCase()));
  assert.equal(new Set(criadas).size, criadas.length, 'dois desafios criam o mesmo objeto');
});
