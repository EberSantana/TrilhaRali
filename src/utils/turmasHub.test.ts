import { test } from 'node:test';
import assert from 'node:assert/strict';
import { montarTurmasDoHub, planoDeImportacao } from './turmasHub';

test('agrupa os alunos do HUB por turma, sem repetir nomes', () => {
  const t = montarTurmasDoHub([
    { turma: 'Integrado · 2º ano', nome: 'Bruno Lima', matricula: 2025002 },
    { turma: 'Integrado · 2º ano', nome: 'Ana  Souza', matricula: '2025001' },
    { turma: 'Integrado · 2º ano', nome: 'ana souza' },
    { turma: 'Subsequente 2026.2', nome: 'Carla Dias' },
    { turma: '', nome: 'Sem Turma' },
  ]);
  assert.deepEqual(t, [
    { nome: 'Integrado · 2º ano', alunos: [{ m: '2025001', n: 'Ana Souza' }, { m: '2025002', n: 'Bruno Lima' }] },
    { nome: 'Subsequente 2026.2', alunos: [{ m: '', n: 'Carla Dias' }] },
  ]);
});

test('plano: cria a turma nova, atualiza a que mudou e pula a igual', () => {
  const hub = montarTurmasDoHub([
    { turma: 'T1', nome: 'Ana Souza' },
    { turma: 'T2', nome: 'Bruno Lima' },
    { turma: 'T3', nome: 'Carla Dias' },
  ]);
  const p = planoDeImportacao(hub, [
    { id: 'A', nome: 't2', alunos: [{ m: '', n: 'Bruno Lima' }] },
    { id: 'B', nome: 'T3', alunos: [{ m: '', n: 'Outra Pessoa' }] },
  ]);
  assert.deepEqual(p.map((x) => [x.nome, x.acao, x.id]), [['T1', 'criar', undefined], ['T2', 'igual', 'A'], ['T3', 'atualizar', 'B']]);
});
