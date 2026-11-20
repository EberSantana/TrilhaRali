import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import { DESV_CASOS, DesvCasoLogica, DesvCasoSql } from './desvCasos';
import { createHash } from 'node:crypto';
import { CTF_APPS_SCRIPT } from './ctfAppsScript';

type Ficha = Record<string, [string, string]>;
function perms<T>(xs: T[]): T[][] {
  if (xs.length <= 1) return [xs];
  return xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]));
}
// As pistas em texto do caso, traduzidas para regras (só no teste: o app não carrega a solução)
const REGRAS: Record<string, Array<(f: Ficha) => boolean>> = {
  c1: [
    (f) => f.Ana[1] === 'Escada',
    (f) => Object.values(f).every(([l, o]) => l !== 'Biblioteca' || o === 'Crachá clonado'),
    (f) => f.Bruno[0] !== 'Laboratório' && f.Bruno[0] !== 'Biblioteca',
    (f) => f.Caio[1] !== 'Chave reserva',
  ],
  c2: [
    (f) => Object.values(f).every(([l, o]) => l !== 'Cantina' || o === 'Celular'),
    (f) => f.Elisa[1] === 'Notebook',
    (f) => f['Fábio'][0] === 'Auditório' || f['Fábio'][0] === 'Cantina',
    (f) => f.Diego[1] !== 'Cabo de rede' && f.Diego[1] !== 'Pendrive',
    (f) => Object.values(f).every(([l, o]) => o !== 'Notebook' || (l !== 'Sala de Redes' && l !== 'Auditório')),
    (f) => Object.values(f).every(([l, o]) => l !== 'Auditório' || o !== 'Pendrive'),
  ],
};
const LOCAL_DO_CRIME: Record<string, string> = { c1: 'Laboratório', c2: 'Sala de Redes' };
// Consulta que prova o culpado em cada caso de SQL
const PROVA: Record<string, string> = {
  c3: `SELECT s.id FROM catraca c JOIN suspeitos s ON s.id = c.id_suspeito
       WHERE c.sala = 'Laboratório 2' AND c.entrada <= '14:25' AND c.saida >= '14:15'
         AND s.cor_mochila = 'vermelha' AND s.altura_cm > 175`,
  c4: `SELECT u.id FROM alteracoes a JOIN sessoes s ON s.ip = a.ip AND a.horario BETWEEN s.inicio AND s.fim
       JOIN usuarios u ON u.id = s.id_usuario
       WHERE a.comando LIKE '%placar%' AND a.horario > '18:00'`,
};

// O script guarda sha256('desv:<caso>:<suspeito>'); o id certo é o único cujo hash aparece no script
function gabarito(caso: string): number {
  const ids = [1, 2, 3, 4, 5, 6, 7, 8].filter((i) => CTF_APPS_SCRIPT.includes(createHash('sha256').update(`desv:${caso}:${i}`).digest('hex')));
  assert.equal(ids.length, 1, `gabarito de ${caso}`);
  return ids[0];
}

test('cada caso de lógica tem exatamente uma solução, e ela bate com o gabarito do servidor', () => {
  for (const c of DESV_CASOS.filter((x): x is DesvCasoLogica => x.tipo === 'logica')) {
    const nomes = c.suspeitos.map((s) => s.nome);
    const sols: Ficha[] = [];
    for (const l of perms(c.locais)) for (const o of perms(c.objetos)) {
      const f: Ficha = Object.fromEntries(nomes.map((n, i) => [n, [l[i], o[i]]]));
      if (REGRAS[c.id].every((r) => r(f))) sols.push(f);
    }
    assert.equal(sols.length, 1, `${c.id} tem ${sols.length} soluções`);
    assert.equal(REGRAS[c.id].length, c.pistas.length, `${c.id}: pistas e regras divergem`);
    const culpado = nomes.find((n) => sols[0][n][0] === LOCAL_DO_CRIME[c.id])!;
    assert.equal(c.suspeitos.find((s) => s.nome === culpado)!.id, gabarito(c.id));
  }
});

test('cada caso de SQL aponta um único culpado no banco do caso, igual ao gabarito do servidor', async () => {
  const SQL = await initSqlJs();
  for (const c of DESV_CASOS.filter((x): x is DesvCasoSql => x.tipo === 'sql')) {
    const db = new SQL.Database();
    db.exec(c.seed);
    const r = db.exec(PROVA[c.id]);
    const ids = r.length ? r[0].values.map((v) => Number(v[0])) : [];
    assert.deepEqual(ids, [gabarito(c.id)], `${c.id}: prova deu ${JSON.stringify(ids)}`);
    assert.equal(c.suspeitos.length, 8);
    const nomes = db.exec(`SELECT nome FROM ${c.id === 'c3' ? 'suspeitos' : 'usuarios'} ORDER BY id`)[0].values.map((v) => String(v[0]));
    assert.deepEqual(nomes, c.suspeitos.map((s) => s.nome));
  }
});

test('o app não carrega o gabarito', () => {
  const texto = JSON.stringify(DESV_CASOS);
  assert.doesNotMatch(texto, /culpad[oa]\s*[:=]/i);
});
