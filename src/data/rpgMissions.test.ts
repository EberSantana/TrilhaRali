import test from 'node:test';
import assert from 'node:assert/strict';
import { RPG_MISSIONS as RPG_MISSIONS_SEM } from './rpgMissions';
import { ALL_MISSIONS as ALL_MISSIONS_SEM } from './missions';
import { LINUX_MISSIONS as LINUX_MISSIONS_SEM } from './linuxMissions';
import { CONSOLE_MISSIONS as CONSOLE_MISSIONS_SEM } from './consoleMissions';
import { BD_MISSIONS as BD_MISSIONS_SEM } from './bdMissions';
import { INFO_MISSIONS as INFO_MISSIONS_SEM } from './infoMissions';
import { WEB_MISSIONS as WEB_MISSIONS_SEM } from './webMissions';
import { comGabarito } from '../utils/gabaritoTeste';
const RPG_MISSIONS = comGabarito(RPG_MISSIONS_SEM);
const ALL_MISSIONS = comGabarito(ALL_MISSIONS_SEM);
const LINUX_MISSIONS = comGabarito(LINUX_MISSIONS_SEM);
const CONSOLE_MISSIONS = comGabarito(CONSOLE_MISSIONS_SEM);
const BD_MISSIONS = comGabarito(BD_MISSIONS_SEM);
const INFO_MISSIONS = comGabarito(INFO_MISSIONS_SEM);
const WEB_MISSIONS = comGabarito(WEB_MISSIONS_SEM);


const norm = (s: string) =>
  String(s).toLowerCase().trim().replace(/^["']|["']$/g, '').replace(/;+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

test('a saga tem capítulos em ordem, com ids e tags únicos em todo o catálogo', () => {
  assert.ok(RPG_MISSIONS.length >= 20);
  const all = [...ALL_MISSIONS, ...LINUX_MISSIONS, ...CONSOLE_MISSIONS, ...BD_MISSIONS, ...INFO_MISSIONS, ...WEB_MISSIONS, ...RPG_MISSIONS];
  assert.equal(new Set(all.map((m) => m.id)).size, all.length);
  assert.equal(new Set(all.map((m) => m.tag_id.toLowerCase())).size, all.length);
  RPG_MISSIONS.forEach((m, i) => {
    assert.equal(m.package, 'bd_rpg');
    assert.ok(m.pergunta.startsWith(`Capítulo ${i + 1} —`), `capítulo ${i + 1} fora de ordem`);
  });
});

test('cobre os cinco assuntos da ementa', () => {
  const t = norm(RPG_MISSIONS.map((m) => m.pergunta + ' ' + m.resposta_curta + ' ' + m.explanation).join(' '));
  for (const termo of ['sgbd', 'nosql', 'grafos', 'entidade', 'cardinalidade', 'chave primaria', 'chave estrangeira', '1fn', 'create table', 'alter table', 'where', 'having', 'inner join', 'distinct', 'update', 'acid', 'indice', 'backup', 'delete']) {
    assert.ok(t.includes(termo), `falta ${termo}`);
  }
});

test('o gabarito está entre as opções, não aparece no enunciado e as alternativas aceitam a resposta', () => {
  for (const m of RPG_MISSIONS) {
    const r = norm(m.resposta_curta);
    assert.ok((m.alternatives || []).map(norm).includes(r), `#${m.id}: alternatives sem a resposta`);
    if (m.opcoes) {
      assert.equal(new Set(m.opcoes.map(norm)).size, m.opcoes.length, `#${m.id}: opções repetidas`);
      assert.ok(m.opcoes.map(norm).includes(r), `#${m.id}: opções sem a resposta`);
    } else if (r.length >= 5) {
      assert.ok(!norm(m.pergunta).includes(r), `#${m.id}: enunciado entrega a resposta`);
    }
  }
});
