import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_MISSIONS as ALL_MISSIONS_SEM } from './missions';
import { CONSOLE_MISSIONS as CONSOLE_MISSIONS_SEM } from './consoleMissions';
import { BD_MISSIONS as BD_MISSIONS_SEM } from './bdMissions';
import { RPG_MISSIONS as RPG_MISSIONS_SEM } from './rpgMissions';
import { RPG_CONSOLE_MISSIONS as RPG_CONSOLE_MISSIONS_SEM } from './rpgConsoleMissions';
import { INFO_MISSIONS as INFO_MISSIONS_SEM } from './infoMissions';
import { WEB_MISSIONS as WEB_MISSIONS_SEM } from './webMissions';
import { LINUX_MISSIONS as LINUX_MISSIONS_SEM } from './linuxMissions';
import { comGabarito } from '../utils/gabaritoTeste';
const ALL_MISSIONS = comGabarito(ALL_MISSIONS_SEM);
const CONSOLE_MISSIONS = comGabarito(CONSOLE_MISSIONS_SEM);
const BD_MISSIONS = comGabarito(BD_MISSIONS_SEM);
const RPG_MISSIONS = comGabarito(RPG_MISSIONS_SEM);
const RPG_CONSOLE_MISSIONS = comGabarito(RPG_CONSOLE_MISSIONS_SEM);
const INFO_MISSIONS = comGabarito(INFO_MISSIONS_SEM);
const WEB_MISSIONS = comGabarito(WEB_MISSIONS_SEM);
const LINUX_MISSIONS = comGabarito(LINUX_MISSIONS_SEM);


// Auditoria geral de todas as perguntas prontas (Rali NFC, CTF e RPG), com a mesma normalização do servidor
const norm = (s: string) =>
  String(s).toLowerCase().trim().replace(/^["']|["']$/g, '').replace(/;+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
const TODAS = [...ALL_MISSIONS, ...CONSOLE_MISSIONS, ...BD_MISSIONS, ...RPG_MISSIONS, ...RPG_CONSOLE_MISSIONS, ...INFO_MISSIONS, ...WEB_MISSIONS, ...LINUX_MISSIONS];

test('toda pergunta tem enunciado, resposta, explicação e XP', () => {
  for (const m of TODAS) {
    assert.ok(m.pergunta.trim() && m.resposta_curta.trim() && m.explanation.trim(), `#${m.id} incompleta`);
    assert.ok(m.xp_valor > 0, `#${m.id} sem XP`);
  }
});

test('nenhuma pergunta se repete no catálogo', () => {
  const vistos = new Map<string, number>();
  for (const m of TODAS) {
    const q = norm(m.pergunta);
    assert.ok(!vistos.has(q), `#${m.id} repete #${vistos.get(q)}`);
    vistos.set(q, m.id);
  }
});

test('múltipla escolha: opções sem repetição, com a resposta, e nenhuma opção errada é aceita como certa', () => {
  for (const m of TODAS.filter((x) => x.opcoes?.length)) {
    const op = m.opcoes!.map(norm);
    const certa = norm(m.resposta_curta);
    const aceitas = [m.resposta_curta, ...(m.alternatives || [])].map(norm);
    assert.equal(new Set(op).size, op.length, `#${m.id} opções repetidas`);
    assert.ok(op.includes(certa), `#${m.id} opções sem a resposta`);
    assert.deepEqual(op.filter((o) => o !== certa && aceitas.includes(o)), [], `#${m.id} aceita uma opção errada`);
    assert.ok(op.length >= 2 && op.length <= 6, `#${m.id} quantidade de opções`);
  }
});

test('a resposta curta sempre é aceita pelo próprio gabarito', () => {
  for (const m of TODAS) assert.ok([m.resposta_curta, ...(m.alternatives || [])].map(norm).includes(norm(m.resposta_curta)), `#${m.id}`);
});
