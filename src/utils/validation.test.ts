import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnswer, validateAnswer } from './validation.ts';
import { ALL_MISSIONS } from '../data/missions.ts';

test('normalizeAnswer trims, lowercases, and removes punctuation/accents', () => {
  assert.equal(normalizeAnswer('  DROP TABLE; '), 'drop table');
  assert.equal(normalizeAnswer('"WHERE"'), 'where');
  assert.equal(normalizeAnswer('Chave Primária'), 'chave primaria');
  assert.equal(normalizeAnswer('pragma   foreign_keys = on;'), 'pragma foreign_keys = on');
});

test('validateAnswer verifies exact and alternative answers', () => {
  const m1 = ALL_MISSIONS.find(m => m.tag_id === 'tag_01');
  assert.ok(m1);

  // Correct
  const res1 = validateAnswer(m1, 'DROP TABLE');
  assert.equal(res1.correto, true);
  assert.equal(res1.xpGanho, 10);

  // Correct with lowercase & semicolon
  const res2 = validateAnswer(m1, 'drop table;');
  assert.equal(res2.correto, true);

  // Incorrect
  const res3 = validateAnswer(m1, 'DELETE TABLE');
  assert.equal(res3.correto, false);
  assert.equal(res3.xpGanho, 0);

  // Already completed
  const res4 = validateAnswer(m1, 'DROP TABLE', true);
  assert.equal(res4.correto, false);
  assert.match(res4.mensagem, /já concluiu/i);
});

test('validateAnswer handles alternatives like notebook dell', () => {
  const m3 = ALL_MISSIONS.find(m => m.tag_id === 'tag_03');
  assert.ok(m3);

  const res1 = validateAnswer(m3, 'Notebook Dell');
  assert.equal(res1.correto, true);

  const res2 = validateAnswer(m3, 'notebook');
  assert.equal(res2.correto, true);
});

test('validateAnswer handles true/false Brazilian accents', () => {
  const m22 = ALL_MISSIONS.find(m => m.tag_id === 'tag_sup_01');
  assert.ok(m22);

  const res1 = validateAnswer(m22, 'Verdadeiro');
  assert.equal(res1.correto, true);

  const m23 = ALL_MISSIONS.find(m => m.tag_id === 'tag_sup_02');
  assert.ok(m23);
  const res2 = validateAnswer(m23, 'Falso');
  assert.equal(res2.correto, true);
});

test('ALL_MISSIONS contains exactly 50 validated missions from CSV', () => {
  assert.equal(ALL_MISSIONS.length, 50);

  // Check tag_05 boss is 100 XP
  const m5 = ALL_MISSIONS.find(m => m.tag_id === 'tag_05');
  assert.equal(m5?.xp_valor, 100);

  // Check new JOIN missions
  const mJoin1 = ALL_MISSIONS.find(m => m.tag_id === 'tag_join_01');
  assert.equal(validateAnswer(mJoin1, 'inner join').correto, true);

  const mJoin6 = ALL_MISSIONS.find(m => m.tag_id === 'tag_join_06');
  assert.equal(validateAnswer(mJoin6, '20').correto, true);

  // Check new DML missions
  const mDml1 = ALL_MISSIONS.find(m => m.tag_id === 'tag_dml_01');
  assert.equal(validateAnswer(mDml1, 'SET').correto, true);

  // Check new Diagram missions
  const mImg1 = ALL_MISSIONS.find(m => m.tag_id === 'tag_img_01');
  assert.equal(validateAnswer(mImg1, 'DDL').correto, true);

  const mImg4 = ALL_MISSIONS.find(m => m.tag_id === 'tag_img_04');
  assert.equal(validateAnswer(mImg4, 'TCL').correto, true);
});

