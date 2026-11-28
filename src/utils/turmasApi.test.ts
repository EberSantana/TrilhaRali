import test from 'node:test';
import assert from 'node:assert/strict';
import { lerListaAlunos, notasCsv } from './turmasApi';

test('lê a lista colada: matrícula;nome, matrícula<TAB>nome (SUAP) ou só o nome, sem repetidos nem cabeçalho', () => {
  const l = lerListaAlunos('Matrícula;Nome\n2024001;Ana Souza\n2024002\tBruno  Lima\nCarla Dias\nana souza\n\n');
  assert.deepEqual(l, [{ m: '2024001', n: 'Ana Souza' }, { m: '2024002', n: 'Bruno Lima' }, { m: '', n: 'Carla Dias' }]);
  assert.deepEqual(lerListaAlunos('Ana Souza;2024001'), [{ m: '2024001', n: 'Ana Souza' }]);
});

test('CSV das notas abre no Excel (BOM e ponto e vírgula)', () => {
  const c = notasCsv('2º B', [{ m: '1', n: 'Ana; Souza', ctf: 10, cruz: 0, rali: 5, desv: 60, total: 75 }]);
  assert.ok(c.startsWith('﻿Turma;2º B\nMatrícula;Aluno;CTF;Cruzada;Rali NFC;Desvendando;Quem sou eu?;Total\n'));
  assert.ok(c.includes('1;"Ana; Souza";10;0;5;60;0;75'));
});
