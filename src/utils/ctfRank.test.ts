import test from 'node:test';
import assert from 'node:assert/strict';
import { computeRankChanges, rankSignature } from './ctfRank';

const r = (nome: string, xp: number) => ({ nome, xp, fase: 1, fogos: 0 });

test('primeira leitura não mostra mudanças', () => {
  const c = computeRankChanges(null, [r('Ana', 10), r('Bia', 5)]);
  assert.equal(c.get('Ana')!.delta, 0);
  assert.equal(c.get('Ana')!.xpGain, 0);
  assert.equal(c.get('Bia')!.isNew, false);
});

test('detecta subida, descida e XP ganho', () => {
  const prev = [r('Ana', 30), r('Bia', 20), r('Cai', 10)];
  const next = [r('Cai', 40), r('Ana', 30), r('Bia', 20)];
  const c = computeRankChanges(prev, next);
  assert.deepEqual(c.get('Cai'), { pos: 1, delta: 2, xpGain: 30, isNew: false });
  assert.deepEqual(c.get('Ana'), { pos: 2, delta: -1, xpGain: 0, isNew: false });
  assert.deepEqual(c.get('Bia'), { pos: 3, delta: -1, xpGain: 0, isNew: false });
});

test('quem acabou de entrar é marcado como novo', () => {
  const c = computeRankChanges([r('Ana', 10)], [r('Ana', 10), r('Duda', 0)]);
  assert.equal(c.get('Duda')!.isNew, true);
  assert.equal(c.get('Ana')!.delta, 0);
});

test('assinatura muda só quando algo muda', () => {
  const a = [r('Ana', 10)];
  assert.equal(rankSignature(a), rankSignature([r('Ana', 10)]));
  assert.notEqual(rankSignature(a), rankSignature([r('Ana', 20)]));
});
