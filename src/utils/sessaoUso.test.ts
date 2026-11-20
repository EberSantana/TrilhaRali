import test from 'node:test';
import assert from 'node:assert/strict';
import { marcarUso, sessaoParada } from './sessaoUso';

const mem = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
  key: () => null,
  length: 0,
};

test('sessão parada: sem registro pergunta; na mesma aula não; depois de 2 h pergunta de novo', () => {
  const t0 = 1_800_000_000_000;
  assert.equal(sessaoParada('desv', t0), true);
  marcarUso('desv', t0);
  assert.equal(sessaoParada('desv', t0 + 50 * 60_000), false);
  assert.equal(sessaoParada('desv', t0 + 3 * 3600_000), true);
  assert.equal(sessaoParada('ctf', t0), true);
});
