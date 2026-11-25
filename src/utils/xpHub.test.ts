import { test } from 'node:test';
import assert from 'node:assert/strict';
import { juntarXp } from './xpHub';

test('guarda o maior XP de cada sala', () => {
  let r = juntarXp(null, 'ABC', { tipo: 'ctf', sala: 'SQL', xp: 30 }, 1);
  r = juntarXp(r, 'ABC', { tipo: 'ctf', sala: 'SQL', xp: 20 }, 2);
  r = juntarXp(r, 'XYZ', { tipo: 'desv', sala: 'Casos', xp: 15 }, 3);
  assert.equal(r.salas.ABC.xp, 30);
  assert.equal(r.salas.ABC.em, 1);
  assert.equal(r.salas.XYZ.tipo, 'desv');
});
