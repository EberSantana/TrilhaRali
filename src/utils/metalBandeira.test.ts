import test from 'node:test';
import assert from 'node:assert/strict';
import { metalDoDesafio } from '../components/common/Bandeira';

test('metal da bandeira: terços pelo XP entre os desafios da sala', () => {
  const xps = [10, 10, 20, 20, 30, 30];
  assert.equal(metalDoDesafio(10, xps), 'bronze');
  assert.equal(metalDoDesafio(20, xps), 'prata');
  assert.equal(metalDoDesafio(30, xps), 'ouro');
});

test('metal da bandeira: XP igual em todos vira prata, e sala vazia também', () => {
  assert.equal(metalDoDesafio(50, [50, 50, 50]), 'prata');
  assert.equal(metalDoDesafio(50, []), 'prata');
});

test('metal da bandeira não depende da escala de XP', () => {
  const a = [5, 10, 15, 20, 25, 30];
  const b = a.map((x) => x * 100);
  assert.deepEqual(a.map((x) => metalDoDesafio(x, a)), b.map((x) => metalDoDesafio(x, b)));
  assert.deepEqual(a.map((x) => metalDoDesafio(x, a)), ['bronze', 'bronze', 'prata', 'prata', 'ouro', 'ouro']);
});
