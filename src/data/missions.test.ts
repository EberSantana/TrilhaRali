import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_MISSIONS } from './missions';
import { normalizeAnswer as norm } from '../utils/validation';

test('missões padrão: ids e tags únicos, XP válido', () => {
  assert.equal(new Set(ALL_MISSIONS.map((m) => m.id)).size, ALL_MISSIONS.length);
  assert.equal(new Set(ALL_MISSIONS.map((m) => m.tag_id)).size, ALL_MISSIONS.length);
  for (const m of ALL_MISSIONS) assert.ok(m.xp_valor >= 1 && m.xp_valor <= 100, `${m.tag_id}: XP ${m.xp_valor}`);
});

test('missões de múltipla escolha: a resposta é uma das opções e não há opções repetidas', () => {
  for (const m of ALL_MISSIONS.filter((x) => x.opcoes?.length)) {
    const keys = m.opcoes!.map(norm);
    assert.equal(new Set(keys).size, keys.length, `${m.tag_id}: opções repetidas`);
    assert.ok(keys.includes(norm(m.resposta_curta)), `${m.tag_id}: resposta fora das opções`);
  }
});

test('o enunciado não entrega a resposta (respostas longas)', () => {
  for (const m of ALL_MISSIONS) {
    const r = norm(m.resposta_curta);
    if (r.length >= 6) assert.ok(!norm(m.pergunta.replace(/\(Verdadeiro\/Falso\)/i, '')).includes(r), `${m.tag_id}: enunciado contém a resposta`);
  }
});
