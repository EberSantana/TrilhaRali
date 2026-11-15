import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BANCO_CRUZADINHA } from '../data/cruzadinhaBanco';
import { letraNormalizada } from './cruzadinha';

test('letraNormalizada tira acento e rejeita o que não é letra', () => {
  assert.equal(letraNormalizada('ç'), 'C');
  assert.equal(letraNormalizada('é'), 'E');
  assert.equal(letraNormalizada('7'), '');
  assert.equal(letraNormalizada('ab'), '');
});

test('o banco padrão só tem palavras A-Z, sem repetição por disciplina', () => {
  for (const [disc, lista] of Object.entries(BANCO_CRUZADINHA)) {
    const vistas = new Set<string>();
    for (const [p, dica] of lista) {
      assert.match(p, /^[A-Z]{3,13}$/, `${disc}: ${p}`);
      assert.ok(dica.length > 5, `${disc}: dica de ${p}`);
      assert.ok(!vistas.has(p), `${disc}: repetida ${p}`);
      vistas.add(p);
    }
    assert.ok(lista.length >= 30, disc);
  }
});
