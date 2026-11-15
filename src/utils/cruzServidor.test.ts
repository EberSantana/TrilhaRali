import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { gabaritoDaSala, hashTexto, montarGrade } from './cruzadinha';
import { bancoDas } from '../data/cruzadinhaBanco';

// Estes testes executam o código do Apps Script (v15) num simulador mínimo para conferir as regras do servidor.
const src = readFileSync(new URL('../data/ctfAppsScript.ts', import.meta.url), 'utf8');
const trecho = (de: string, ate: string) => src.slice(src.indexOf(de), src.indexOf(ate));

function servidor(gabarito: string, dicasLimite: number | null = 5) {
  const rows: Record<string, unknown>[] = [{ nome_key: 'ana', xp: 30, xp_cruz: 0, _row: 2 }];
  const ctx: Record<string, unknown> = {
    requireRoom: () => ({ status: 'aberta', timer: '', tipo: 'ctf', token: 'T', cruzadinha_gabarito: gabarito }),
    requireTimerOpen: () => {}, parseTimer: () => null, Date, Array, String, Number, Math, Object, isNaN,
    cruzadinhaDicas: () => dicasLimite,
    fail: (m: string) => { throw new Error(m); }, norm: (x: string) => String(x).toLowerCase(),
    playersOf: () => rows, updateRow: (_s: string, _r: number, o: Record<string, unknown>) => Object.assign(rows[0], o),
    isLivre: () => false, buildState: () => ({}), raliBuildState: () => ({}),
    readRows: () => [{ token: 'T', tag_id: 'web_01' }, { token: 'T', tag_id: 'info_02' }, { token: 'OUTRA', tag_id: 'sql_01' }],
  };
  vm.createContext(ctx);
  vm.runInContext(trecho('function cruzDisciplinas', '// Debriefing: gabarito da sala'), ctx);
  return { rows, submit: ctx.cruzSubmit as (r: unknown) => { cruz: { xp: number } }, disc: ctx.cruzDisciplinas as (r: unknown) => string[] };
}

test('cruzSubmit só conta palavra do gabarito, sem repetir, com XP por nível de ajuda', () => {
  const { rows, submit } = servidor('BORDA,LISTA,CSS');
  submit({ token: 'T', nome: 'Ana', dicas: 0, palavras: [['BORDA', 0], ['BORDA', 0], ['XYZW', 0], ['CSS', 1]] });
  assert.equal(rows[0].xp_cruz, 50 + 15);
  assert.equal(rows[0].xp, 30 + 65);
  submit({ token: 'T', nome: 'Ana', dicas: 0, palavras: [['BORDA', 0], ['LISTA', 2]] }); // menor que o anterior: não tira nem soma
  assert.equal(rows[0].xp, 95);
  submit({ token: 'T', nome: 'Ana', dicas: 0, palavras: [['BORDA', 0], ['LISTA', 0], ['CSS', 0]] });
  assert.equal(rows[0].xp_cruz, 50 + 50 + 30);
  assert.equal(rows[0].xp, 30 + 130);
});

test('cruzSubmit não aceita XP inventado nem mais dicas que o limite', () => {
  const { rows, submit } = servidor('BORDA');
  submit({ token: 'T', nome: 'Ana', dicas: 0, palavras: [['QUALQUER', 0], ['OUTRA', 0]], xp: 99999 });
  assert.equal(rows[0].xp, 30);
  assert.throws(() => submit({ token: 'T', nome: 'Ana', dicas: 6, palavras: [['BORDA', 0]] }), /limite de dicas/);
  assert.throws(() => servidor('', 5).submit({ token: 'T', nome: 'Ana', dicas: 0, palavras: [] }), /liberar a Cruzadinha de novo/);
  assert.throws(() => servidor('BORDA', null).submit({ token: 'T', nome: 'Ana', dicas: 0, palavras: [] }), /não está liberada/);
});

test('o servidor deduz as disciplinas pelas tags das missões da sala', () => {
  assert.deepEqual(servidor('A').disc({ token: 'T' }), ['Construção de Sites 1', 'Informática Básica']);
});

test('o gabarito do professor é exatamente a grade que o aluno monta', () => {
  const disc = ['Construção de Sites 1', 'Informática Básica'] as const;
  const gab = gabaritoDaSala('ABC234', [...disc], 10);
  const aluno = montarGrade(bancoDas([...disc]), hashTexto('ABC234'), 10).palavras.map((p) => p.palavra);
  assert.deepEqual(gab, aluno);
});

test('cruzadinhaPalavras: padrão 12 e limites 6 a 16', () => {
  const ctx: Record<string, unknown> = { Number, Math, isNaN };
  vm.createContext(ctx);
  vm.runInContext(trecho('function cruzadinhaPalavras', 'function setCruzadinha'), ctx);
  const f = ctx.cruzadinhaPalavras as (r: unknown) => number;
  assert.equal(f({}), 12);
  assert.equal(f({ cruzadinha_palavras: 3 }), 6);
  assert.equal(f({ cruzadinha_palavras: 40 }), 16);
  assert.equal(f({ cruzadinha_palavras: 9 }), 9);
});
