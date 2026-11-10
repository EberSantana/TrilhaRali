import test from 'node:test';
import assert from 'node:assert/strict';
import { computeXpForPosition, getNextCaptureScore, describeCurrentValue } from './scoring.ts';
import type { Team } from '../types/index.ts';

const team = (id: string, done: string[] = []): Team => ({
  id,
  nome: id,
  cor: 'bg-emerald-500',
  xp_total: 0,
  missoes_concluidas: done,
  erros_count: 0,
  alunos: [],
});

test('modo fixo mantém o XP original em qualquer posição', () => {
  for (const pos of [1, 2, 7, 20]) assert.equal(computeXpForPosition(10, pos, 'fixed'), 10);
  assert.equal(computeXpForPosition(10, 5, undefined), 10);
});

test('CTF dinâmico: missão de 10 XP segue a tabela 10, 9, 8, 7 e piso em 4', () => {
  const xs = [1, 2, 3, 4, 5, 6, 7, 8, 12].map((p) => computeXpForPosition(10, p, 'ctf_dynamic'));
  assert.deepEqual(xs, [10, 9, 8, 7, 6, 5, 4, 4, 4]);
});

test('CTF dinâmico escala o decaimento para missões maiores e respeita o piso de 40%', () => {
  assert.equal(computeXpForPosition(100, 1, 'ctf_dynamic'), 100);
  assert.equal(computeXpForPosition(100, 2, 'ctf_dynamic'), 90);
  assert.equal(computeXpForPosition(100, 30, 'ctf_dynamic'), 40);
  assert.equal(computeXpForPosition(30, 2, 'ctf_dynamic'), 27);
  assert.equal(computeXpForPosition(30, 99, 'ctf_dynamic'), 12);
});

test('piso nunca passa do XP base nem zera', () => {
  assert.equal(computeXpForPosition(2, 5, 'ctf_dynamic'), 2);
  assert.ok(computeXpForPosition(10, 1000, 'ctf_dynamic') > 0);
});

test('getNextCaptureScore conta equipes que já resolveram e marca o 🔥 só na 1ª', () => {
  const mission = { tag_id: 'tag_01', xp_valor: 10 };
  const empty = [team('a'), team('b')];
  const first = getNextCaptureScore(mission, empty, 'ctf_dynamic');
  assert.deepEqual([first.posicao, first.xp, first.isFogo], [1, 10, true]);

  const afterTwo = [team('a', ['tag_01']), team('b', ['tag_01']), team('c')];
  const third = getNextCaptureScore(mission, afterTwo, 'ctf_dynamic');
  assert.deepEqual([third.posicao, third.xp, third.isFogo], [3, 8, false]);

  const fixed = getNextCaptureScore(mission, empty, 'fixed');
  assert.equal(fixed.isFogo, false);
  assert.equal(fixed.xp, 10);
});

test('mensagens do celular refletem o valor atual da flag', () => {
  const mission = { tag_id: 'tag_01', xp_valor: 10 };
  assert.match(describeCurrentValue(getNextCaptureScore(mission, [team('a')], 'ctf_dynamic')), /FLAG INTACTA.*10 XP/);
  assert.match(
    describeCurrentValue(getNextCaptureScore(mission, [team('a', ['tag_01']), team('b', ['tag_01'])], 'ctf_dynamic')),
    /2 equipes já resolveram.*8 XP/
  );
});
