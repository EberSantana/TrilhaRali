import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_MISSIONS } from './missions';
import { CONSOLE_MISSIONS } from './consoleMissions';
import { BD_MISSIONS } from './bdMissions';
import { RPG_MISSIONS } from './rpgMissions';
import { RPG_CONSOLE_MISSIONS } from './rpgConsoleMissions';
import { INFO_MISSIONS } from './infoMissions';
import { WEB_MISSIONS } from './webMissions';
import { LINUX_MISSIONS } from './linuxMissions';

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
