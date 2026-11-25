import { test } from 'node:test';
import assert from 'node:assert/strict';
import { juntarXp, precisaEnviar } from './xpHub';

test('guarda o maior XP de cada sala', () => {
  let r = juntarXp(null, 'ABC', { tipo: 'ctf', sala: 'SQL', xp: 30 }, 1);
  r = juntarXp(r, 'ABC', { tipo: 'ctf', sala: 'SQL', xp: 20 }, 2);
  r = juntarXp(r, 'XYZ', { tipo: 'desv', sala: 'Casos', xp: 15 }, 3);
  assert.equal(r.salas.ABC.xp, 30);
  assert.equal(r.salas.ABC.em, 1);
  assert.equal(r.salas.XYZ.tipo, 'desv');
});

test('precisaEnviar: só quando alguma sala mudou depois do último envio', () => {
  const r = { salas: { A: { tipo: 'ctf' as const, sala: 's', xp: 10, em: 100 }, B: { tipo: 'desv' as const, sala: 's', xp: 5, em: 200 } } };
  assert.equal(precisaEnviar(r, 0), true);
  assert.equal(precisaEnviar(r, 150), true);
  assert.equal(precisaEnviar(r, 200), false);
  assert.equal(precisaEnviar(null, 0), false);
});
