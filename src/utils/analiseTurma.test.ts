import test from 'node:test';
import assert from 'node:assert/strict';
import { analiseCsv, assuntosOrdenados, perguntasDificeis, precisamAtencao, resumo, type Analise } from './analiseTurma';

const aluno = (n: string, total: number, salas: number, acertos: number, erros: number) => ({ n, total, ctf: total, cruz: 0, rali: 0, desv: 0, salas, acertos, erros, ultimo: 0 });
const base: Analise = {
  turma: { id: 'T1', nome: '2º B', alunos: 4 },
  salas: [{ token: 'AAA111', nome: 'CTF', tipo: 'ctf', status: 'encerrada', criada: '', participantes: 3 }],
  alunos: [aluno('Ana', 100, 1, 8, 2), aluno('Bruno', 90, 1, 2, 6), aluno('Carla', 20, 1, 1, 0), aluno('Davi', 0, 0, 0, 0)],
  perguntas: [
    { tag_id: 'a', pergunta: 'Fácil', pacote: 'SQL', categoria: '', salas: 1, participantes: 3, acertos: 3, erros: 0 },
    { tag_id: 'b', pergunta: 'Difícil', pacote: 'Modelagem', categoria: '', salas: 1, participantes: 3, acertos: 1, erros: 5 },
  ],
  assuntos: [
    { assunto: 'SQL', perguntas: 1, participantes: 3, acertos: 3, erros: 0 },
    { assunto: 'Modelagem', perguntas: 1, participantes: 3, acertos: 1, erros: 5 },
  ],
  casos: [],
  duplas: 0,
};

test('resumo: participação, taxa geral e média só de quem jogou', () => {
  assert.deepEqual(resumo(base), { participaram: 3, total: 4, salas: 1, taxa: 58, media: 70 });
});

test('precisam de atenção: sem participação, muitos erros e pontos baixos', () => {
  const r = Object.fromEntries(precisamAtencao(base).map((x) => [x.aluno.n, x.motivos]));
  assert.deepEqual(r['Davi'], ['sem_participacao']);
  assert.deepEqual(r['Bruno'], ['muitos_erros']);
  assert.deepEqual(r['Carla'], ['pontos_baixos']);
  assert.equal(r['Ana'], undefined);
});

test('perguntas e assuntos mais difíceis primeiro; CSV com a coluna de atenção', () => {
  assert.equal(perguntasDificeis(base)[0].tag_id, 'b');
  assert.equal(perguntasDificeis(base)[0].taxa, 33);
  assert.equal(assuntosOrdenados(base)[0].assunto, 'Modelagem');
  const csv = analiseCsv(base);
  assert.match(csv, /Bruno;1;90;90;0;0;0;2;6;25;Erra mais do que acerta/);
  assert.match(csv, /Davi;0;0;0;0;0;0;0;0;;Não participou/);
});

test('sumiu: jogou antes, mas não as 2 salas mais recentes (com 3 ou mais salas)', () => {
  const salas = ['2026-11-01', '2026-11-08', '2026-11-15'].map((criada, i) => ({ token: `S${i}`, nome: '', tipo: 'ctf', status: 'encerrada', criada, participantes: 2 }));
  const a: Analise = { ...base, salas, alunos: [{ ...aluno('Eva', 50, 1, 3, 1), tokens: ['S0'] }, { ...aluno('Fábio', 60, 2, 3, 1), tokens: ['S0', 'S2'] }] };
  const r = Object.fromEntries(precisamAtencao(a).map((x) => [x.aluno.n, x.motivos]));
  assert.deepEqual(r['Eva'], ['sumiu']);
  assert.equal(r['Fábio'], undefined);
});
