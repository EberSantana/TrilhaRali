import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ALL_MISSIONS } from './missions';
import { CONSOLE_MISSIONS } from './consoleMissions';
import { BD_MISSIONS } from './bdMissions';
import { RPG_MISSIONS } from './rpgMissions';
import { RPG_CONSOLE_MISSIONS } from './rpgConsoleMissions';
import { INFO_MISSIONS } from './infoMissions';
import { WEB_MISSIONS } from './webMissions';
import { LINUX_MISSIONS } from './linuxMissions';
import { gabaritoAberto } from '../utils/gabaritoTeste';

const PUBLICAS = [...ALL_MISSIONS, ...CONSOLE_MISSIONS, ...BD_MISSIONS, ...RPG_MISSIONS, ...RPG_CONSOLE_MISSIONS, ...INFO_MISSIONS, ...WEB_MISSIONS, ...LINUX_MISSIONS];

test('o código público das missões não traz resposta, explicação nem consulta de solução', () => {
  for (const m of PUBLICAS) {
    assert.equal(m.resposta_curta, '', `#${m.id}`);
    assert.equal(m.explanation, '', `#${m.id}`);
    assert.equal(m.alternatives, undefined, `#${m.id}`);
    assert.equal(m.sample_query, undefined, `#${m.id}`);
  }
});

test('o gabarito criptografado cobre todas as missões e não aparece em texto claro nos arquivos do site', () => {
  const g = gabaritoAberto();
  for (const m of PUBLICAS) assert.ok(g.missoes[m.tag_id]?.r, `sem gabarito: ${m.tag_id}`);
  const fontes = fs.readdirSync('src/data').filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts')).map((f) => fs.readFileSync(`src/data/${f}`, 'utf8')).join('\n');
  // explicações são textos longos e únicos: nenhuma pode estar no código
  for (const [tag, x] of Object.entries(g.missoes)) if (x.e.length > 30) assert.ok(!fontes.includes(x.e), `explicação de ${tag} em texto claro`);
});

test('Quem sou eu?: todo conceito tem resposta no gabarito e as dicas não entregam a resposta', async () => {
  const { CONCEITOS_QUEM } = await import('./quemSouEu');
  const g = gabaritoAberto();
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const c of CONCEITOS_QUEM) {
    const x = g.missoes[c.tag_id];
    assert.ok(x?.r && x.e.length > 30, `sem gabarito: ${c.tag_id}`);
    if (x.r.length > 3) for (const d of c.dicas) assert.ok(!new RegExp(`\\b${norm(x.r)}\\b`).test(norm(d)), `${c.tag_id}: a dica "${d}" entrega a resposta`);
  }
});
