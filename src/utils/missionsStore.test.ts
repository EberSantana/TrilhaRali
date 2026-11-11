import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeMissions } from './missionsStore.ts';
import { ALL_MISSIONS } from '../data/missions.ts';
import { LINUX_MISSIONS } from '../data/linuxMissions.ts';

const PADRAO = [...ALL_MISSIONS, ...LINUX_MISSIONS];
import { emptyDraft } from './bank.ts';

const pub = (tag: string) => ({ ...emptyDraft('Redes'), pergunta: 'Pergunta de teste?', resposta: 'ok', tag_id: tag });

test('sem publicação, valem as missões padrão', () => {
  assert.deepEqual(mergeMissions(null), PADRAO);
  assert.deepEqual(mergeMissions({ somenteBanco: true, missoes: [] }), PADRAO);
});

test('somenteBanco usa só as perguntas do professor, mantendo o módulo Linux', () => {
  const m = mergeMissions({ somenteBanco: true, missoes: [pub('tag_01'), pub('tag_02')] });
  assert.deepEqual(m.slice(0, 2).map((x) => x.tag_id), ['tag_01', 'tag_02']);
  assert.equal(m.slice(2).every((x) => x.tag_id.startsWith('linux_')), true);
  assert.equal(m.length, 2 + LINUX_MISSIONS.length);
  assert.equal(m[0].package, 'banco');
});

test('modo misto troca só as tags publicadas e acrescenta as novas', () => {
  const m = mergeMissions({ somenteBanco: false, missoes: [pub('tag_01'), pub('tag_99')] });
  assert.equal(m.length, PADRAO.length + 1);
  assert.equal(m.find((x) => x.tag_id === 'tag_01')!.package, 'banco');
  assert.equal(m.find((x) => x.tag_id === 'tag_02')!.package, ALL_MISSIONS.find((x) => x.tag_id === 'tag_02')!.package);
  assert.equal(m[m.length - 1].tag_id, 'tag_99');
});
