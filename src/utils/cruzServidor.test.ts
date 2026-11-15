import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { gabaritoDaSala, hashTexto, montarGrade } from './cruzadinha';
import { bancoDas } from '../data/cruzadinhaBanco';

// Estes testes executam o código do Apps Script (v16) num simulador mínimo para conferir as regras do servidor.
const src = readFileSync(new URL('../data/ctfAppsScript.ts', import.meta.url), 'utf8');
const trecho = (de: string, ate: string) => src.slice(src.indexOf(de), src.indexOf(ate));

function servidor(gabarito: string, dicasLimite: number | null = 5, modo = 'fixed') {
  const alunos: Record<string, unknown>[] = [
    { nome_key: 'ana', xp: 30, xp_cruz: 0, _row: 2 },
    { nome_key: 'bia', xp: 0, xp_cruz: 0, _row: 3 },
    { nome_key: 'caio', xp: 0, xp_cruz: 0, _row: 4 },
  ];
  const capturas: Record<string, unknown>[] = [];
  const ctx: Record<string, unknown> = {
    requireRoom: () => ({ status: 'aberta', timer: '', tipo: 'ctf', modo, token: 'T', cruzadinha_gabarito: gabarito }),
    requireTimerOpen: () => {}, parseTimer: () => null, Date, Array, String, Number, Math, Object, isNaN,
    cruzadinhaDicas: () => dicasLimite,
    fail: (m: string) => { throw new Error(m); }, norm: (x: string) => String(x).toLowerCase(),
    playersOf: () => alunos,
    updateRow: (_s: string, row: number, o: Record<string, unknown>) => Object.assign(alunos.find((a) => a._row === row)!, o),
    appendObj: (_s: string, o: Record<string, unknown>) => capturas.push(o),
    isLivre: () => false, buildState: () => ({}), raliBuildState: () => ({}),
    readRows: (sheet: string) => (sheet === 'CtfCruzCapturas' ? capturas : [{ token: 'T', tag_id: 'web_01' }, { token: 'T', tag_id: 'info_02' }, { token: 'OUTRA', tag_id: 'sql_01' }]),
  };
  vm.createContext(ctx);
  vm.runInContext(trecho('function pontos', 'function randomFrom'), ctx);
  vm.runInContext(trecho('function cruzDisciplinas', '// Debriefing: gabarito da sala'), ctx);
  const submit = ctx.cruzSubmit as (r: unknown) => { cruz: { xp: number; novas: { palavra: string; posicao: number; xp: number }[] } };
  return { alunos, capturas, submit, disc: ctx.cruzDisciplinas as (r: unknown) => string[] };
}

const envio = (nome: string, palavras: [string, number][], dicas = 0) => ({ token: 'T', nome, dicas, palavras });

test('cruzSubmit só conta palavra do gabarito, uma vez por aluno, com desconto de dica', () => {
  const { alunos, submit } = servidor('BORDA,LISTA,CSS');
  const r = submit(envio('Ana', [['BORDA', 0], ['BORDA', 0], ['XYZW', 0], ['CSS', 1]]));
  assert.equal(r.cruz.xp, 50 + 15);
  assert.equal(alunos[0].xp, 30 + 65);
  submit(envio('Ana', [['BORDA', 0], ['CSS', 0]])); // já pontuadas: nada muda
  assert.equal(alunos[0].xp, 95);
  submit(envio('Ana', [['BORDA', 0], ['CSS', 1], ['LISTA', 2]])); // revelada vale 0
  assert.equal(alunos[0].xp_cruz, 65);
});

test('modo fixo: todos ganham o mesmo; modo dinâmico: quem fecha primeiro ganha mais', () => {
  const fixo = servidor('BORDA', 5, 'fixed');
  for (const n of ['Ana', 'Bia', 'Caio']) fixo.submit(envio(n, [['BORDA', 0]]));
  assert.deepEqual(fixo.capturas.map((c) => c.xp), [50, 50, 50]);

  const din = servidor('BORDA,CARDINALIDADE', 5, 'ctf_dynamic');
  din.submit(envio('Bia', [['BORDA', 0]]));
  din.submit(envio('Ana', [['BORDA', 1]]));
  const r = din.submit(envio('Caio', [['BORDA', 0]]));
  assert.deepEqual(din.capturas.map((c) => [c.posicao, c.xp]), [[1, 50], [2, 23], [3, 40]]); // 45 * 0,5 = 22,5 -> 23
  assert.deepEqual(JSON.parse(JSON.stringify(r.cruz.novas)), [{ palavra: 'BORDA', posicao: 3, xp: 40 }]);
  // piso de 40%: a partir da 7ª posição a palavra de 130 XP vale 52
  for (let i = 0; i < 8; i++) din.alunos.push({ nome_key: 'x' + i, xp: 0, xp_cruz: 0, _row: 10 + i });
  for (let i = 0; i < 8; i++) din.submit(envio('X' + i, [['CARDINALIDADE', 0]]));
  assert.deepEqual(din.capturas.filter((c) => c.palavra === 'CARDINALIDADE').map((c) => c.xp), [130, 117, 104, 91, 78, 65, 52, 52]);
});

test('cruzSubmit não aceita XP inventado nem mais dicas que o limite', () => {
  const { alunos, submit } = servidor('BORDA');
  submit({ ...envio('Ana', [['QUALQUER', 0], ['OUTRA', 0]]), xp: 99999 });
  assert.equal(alunos[0].xp, 30);
  assert.throws(() => submit(envio('Ana', [['BORDA', 0]], 6)), /limite de dicas/);
  assert.throws(() => servidor('', 5).submit(envio('Ana', [])), /liberar a Cruzadinha de novo/);
  assert.throws(() => servidor('BORDA', null).submit(envio('Ana', [])), /não está liberada/);
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

test('cruzadinhaPalavras: padrão 12 e limites 6 a 25', () => {
  const ctx: Record<string, unknown> = { Number, Math, isNaN };
  vm.createContext(ctx);
  vm.runInContext(trecho('function cruzadinhaPalavras', 'function setCruzadinha'), ctx);
  const f = ctx.cruzadinhaPalavras as (r: unknown) => number;
  assert.equal(f({}), 12);
  assert.equal(f({ cruzadinha_palavras: 3 }), 6);
  assert.equal(f({ cruzadinha_palavras: 40 }), 25);
  assert.equal(f({ cruzadinha_palavras: 9 }), 9);
});
