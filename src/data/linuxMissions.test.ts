import test from 'node:test';
import assert from 'node:assert/strict';
import { LINUX_MISSIONS } from './linuxMissions';
import { ALL_MISSIONS } from './missions';
import { createShell, runLine } from '../utils/shell';
import { normalizeAnswer as norm } from '../utils/validation';

test('missões de Linux: ids e tags únicos (também frente às 50 padrão)', () => {
  const all = [...ALL_MISSIONS, ...LINUX_MISSIONS];
  assert.equal(new Set(all.map((m) => m.id)).size, all.length);
  assert.equal(new Set(all.map((m) => m.tag_id.toLowerCase())).size, all.length);
});

test('toda resposta é reproduzida rodando a solução no terminal simulado', () => {
  for (const m of LINUX_MISSIONS) {
    const out = norm(runLine(createShell(), m.sample_query || '').out);
    const aceitas = [m.resposta_curta, ...(m.alternatives || [])].map(norm);
    assert.ok(aceitas.some((a) => out.includes(a)), `#${m.id}: saída "${out}" não contém ${JSON.stringify(aceitas)}`);
  }
});

test('o enunciado não entrega a resposta', () => {
  for (const m of LINUX_MISSIONS) {
    const r = norm(m.resposta_curta);
    if (r.length >= 5) assert.ok(!norm(m.pergunta).includes(r), `#${m.id}: enunciado contém a resposta`);
  }
});
