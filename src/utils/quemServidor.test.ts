import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { CTF_APPS_SCRIPT } from '../data/ctfAppsScript';
import { CONCEITOS_QUEM } from '../data/quemSouEu';

// Executa o código real do Quem sou eu? do Apps Script (v37) num simulador mínimo da planilha.
const trecho = (de: string, ate: string) => {
  const i = CTF_APPS_SCRIPT.indexOf(de);
  const f = CTF_APPS_SCRIPT.indexOf(ate, i);
  assert.ok(i >= 0 && f > i, `trecho ${de}`);
  return CTF_APPS_SCRIPT.slice(i, f);
};
type Row = Record<string, unknown> & { _row: number };
const plain = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

interface Estado {
  aluno: { fase: number; xp: number; acertos: number; erros: number; concluido: boolean };
  missao: null | { fase: number; pergunta: string; dicas: string[]; dicas_total: number; xp_base: number; xp_atual: number; xp_proxima: number | null };
  correto?: boolean;
  pulou?: boolean;
  premio?: { xp: number; dicas: number };
  revelada?: { resposta: string; explicacao: string };
}

const DICAS = ['Sou um comando.', 'Pertenço à DQL.', 'Não altero dados.', 'Ando com FROM.', 'SELECT ___'];

function servidor(modo = 'fixed') {
  const sheets: Record<string, Row[]> = { CtfSalas: [], CtfMissoes: [], CtfAlunos: [], CtfCapturas: [], CtfErros: [] };
  const push = (n: string, o: Record<string, unknown>) => sheets[n].push({ ...o, _row: sheets[n].length + 2 });
  const ctx: Record<string, unknown> = {
    SHEET_HEADERS: { CtfMissoes: ['token', 'fase', 'tag_id', 'categoria', 'pacote', 'pergunta', 'resposta', 'alternativas', 'xp', 'opcoes', 'explicacao'] },
    TOKEN_CHARS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
    ERROR_COOLDOWN_MS: 0,
    readRows: (n: string) => sheets[n].map((r) => ({ ...r })),
    appendObj: push,
    updateRow: (n: string, row: number, o: Record<string, unknown>) => Object.assign(sheets[n].find((r) => r._row === row)!, o),
    getSheet: (n: string) => ({
      getLastRow: () => sheets[n].length + 1,
      getRange: () => ({ setValues: (vals: unknown[][]) => vals.forEach((v) => push(n, Object.fromEntries((ctx.SHEET_HEADERS as Record<string, string[]>)[n].map((k, i) => [k, v[i]])))) }),
    }),
    memoLimpa: () => {},
    genToken: () => 'QSE123',
    randomFrom: () => 'chave-admin',
    turmaIdValido: () => '',
    timerApply: () => null,
    logEvento: () => {},
    requireTimerOpen: () => {},
    parseTimer: () => null,
    roomInfo: (r: Row) => ({ tipo: r.tipo }),
    requireRoom: () => sheets.CtfSalas[0],
    isLivre: () => false,
    norm: (x: string) => String(x ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(),
    playersOf: (t: string) => sheets.CtfAlunos.filter((a) => a.token === t).map((a) => ({ ...a })),
    fail: (m: string) => { throw new Error(m); },
    Date,
  };
  vm.createContext(ctx);
  vm.runInContext(trecho('function pontos', 'function randomFrom'), ctx);
  vm.runInContext(trecho('function rankPlayers', '// ---------- Acoes ----------'), ctx);
  vm.runInContext(trecho('function isCruz', 'function createCruzRoom'), ctx);
  vm.runInContext(trecho('function stateFor', '// ---------- Rali NFC'), ctx);
  vm.runInContext(trecho('// ---------- Quem sou eu? ----------', '// ---------- Cruzadinha ----------'), ctx);
  vm.runInContext(trecho('function parseList', 'function parseListInput'), ctx);
  const call = (fn: string, req: Record<string, unknown>) => plain((ctx[fn] as (r: unknown) => unknown)(req)) as Estado;
  const criar = (missions: Record<string, unknown>[]) => {
    const r = plain((ctx.createQuemRoom as (r: unknown) => { token: string; tipo: string; total: number })({ nome: 'Teste', modo, missions }));
    sheets.CtfSalas[0].tipo = 'quem';
    push('CtfAlunos', { token: r.token, nome: 'Ana', nome_key: 'ana', fase_atual: 1, xp: 0, acertos: 0, erros: 0, fogos: 0 });
    return r;
  };
  return { sheets, call, criar, ctx };
}

const duas = [
  { tag_id: 'q1', categoria: 'Banco de Dados', pacote: 'Fácil', dicas: DICAS, resposta: 'SELECT', alternativas: ['comando select'], xp: 10, explicacao: 'Consulta dados.' },
  { tag_id: 'q2', categoria: 'Redes', pacote: 'Média', dicas: ['A', 'B', 'C'], resposta: 'DNS', alternativas: [], xp: 20, explicacao: 'Traduz nomes.' },
];

test('cria a sala com tipo quem e guarda as dicas da rodada', () => {
  const s = servidor();
  const r = s.criar(duas);
  assert.equal(r.tipo, 'quem');
  assert.equal(r.total, 2);
  assert.equal(s.sheets.CtfSalas[0].ordem, 'sequencial');
  assert.deepEqual(JSON.parse(String(s.sheets.CtfMissoes[0].pergunta)), DICAS);
  assert.equal((s.ctx.tipoOut as (r: unknown) => string)(s.sheets.CtfSalas[0]), 'quem');
});

test('recusa conceito sem resposta ou com menos de 2 dicas', () => {
  assert.throws(() => servidor().criar([{ ...duas[0], resposta: '' }]), /sem resposta/);
  assert.throws(() => servidor().criar([{ ...duas[0], dicas: ['só uma'] }]), /ao menos 2 dicas/);
  assert.throws(() => servidor().criar([]), /ao menos um conceito/);
});

test('o aluno vê só a primeira dica e o XP cheio; cada dica aberta tira 20%', () => {
  const s = servidor();
  s.criar(duas);
  let st = s.call('stateFor', { token: 'QSE123', nome: 'Ana' });
  assert.deepEqual(st.missao!.dicas, [DICAS[0]]);
  assert.equal(st.missao!.pergunta, '', 'a lista completa de dicas não sai para o aluno');
  assert.equal(st.missao!.dicas_total, 5);
  assert.equal(st.missao!.xp_atual, 10);
  assert.equal(st.missao!.xp_proxima, 8);
  st = s.call('quemDica', { token: 'QSE123', nome: 'Ana' });
  assert.deepEqual(st.missao!.dicas, DICAS.slice(0, 2));
  assert.equal(st.missao!.xp_atual, 8);
  for (let i = 0; i < 3; i++) st = s.call('quemDica', { token: 'QSE123', nome: 'Ana' });
  assert.equal(st.missao!.dicas.length, 5);
  assert.equal(st.missao!.xp_atual, 2, 'piso de 20%');
  assert.equal(st.missao!.xp_proxima, null);
  assert.throws(() => s.call('quemDica', { token: 'QSE123', nome: 'Ana' }), /Todas as dicas/);
});

test('acerto com 2 dicas vale 80%, aceita variação sem acento e zera as dicas da rodada seguinte', () => {
  const s = servidor();
  s.criar(duas);
  s.call('quemDica', { token: 'QSE123', nome: 'Ana' });
  const errado = s.call('submit', { token: 'QSE123', nome: 'Ana', resposta: 'insert' });
  assert.equal(errado.correto, false);
  assert.equal(errado.aluno.erros, 1);
  const st = s.call('submit', { token: 'QSE123', nome: 'Ana', resposta: 'Comando SELECT' });
  assert.equal(st.correto, true);
  assert.equal(st.premio!.xp, 8);
  assert.equal(st.premio!.dicas, 2);
  assert.deepEqual(st.revelada, { resposta: 'SELECT', explicacao: 'Consulta dados.' });
  assert.equal(st.aluno.xp, 8);
  assert.equal(st.missao!.fase, 2);
  assert.deepEqual(st.missao!.dicas, ['A'], 'rodada nova começa com uma dica');
  assert.equal(st.missao!.xp_atual, 20);
});

test('pular só depois de abrir todas as dicas: passa sem XP, conta erro e mostra a resposta', () => {
  const s = servidor();
  s.criar(duas);
  assert.throws(() => s.call('quemPular', { token: 'QSE123', nome: 'Ana' }), /Abra todas as dicas/);
  for (let i = 0; i < 4; i++) s.call('quemDica', { token: 'QSE123', nome: 'Ana' });
  const st = s.call('quemPular', { token: 'QSE123', nome: 'Ana' });
  assert.equal(st.pulou, true);
  assert.equal(st.revelada!.resposta, 'SELECT');
  assert.equal(st.aluno.xp, 0);
  assert.equal(st.aluno.erros, 1);
  assert.equal(st.missao!.fase, 2);
  assert.equal(st.missao!.dicas.length, 1);
});

test('modo corrida: o primeiro a acertar ganha o XP cheio, os seguintes perdem 10% por posição, e o desconto das dicas soma', () => {
  const s = servidor('ctf_dynamic');
  s.criar(duas);
  s.sheets.CtfAlunos.push({ _row: 3, token: 'QSE123', nome: 'Bia', nome_key: 'bia', fase_atual: 1, xp: 0, acertos: 0, erros: 0, fogos: 0 });
  assert.equal(s.call('submit', { token: 'QSE123', nome: 'Ana', resposta: 'select' }).premio!.xp, 10);
  s.call('quemDica', { token: 'QSE123', nome: 'Bia' });
  assert.equal(s.call('submit', { token: 'QSE123', nome: 'Bia', resposta: 'select' }).premio!.xp, 7, '9 XP da 2ª posição × 80%');
});

test('o banco público tem 54 conceitos com 5 dicas, 3 por nível em cada disciplina', () => {
  assert.equal(CONCEITOS_QUEM.length, 54);
  const conta = new Map<string, number>();
  for (const c of CONCEITOS_QUEM) {
    assert.equal(c.dicas.length, 5, c.tag_id);
    assert.equal(c.xp, { facil: 10, media: 20, dificil: 30 }[c.nivel], c.tag_id);
    conta.set(`${c.disciplina}|${c.nivel}`, (conta.get(`${c.disciplina}|${c.nivel}`) ?? 0) + 1);
  }
  for (const n of conta.values()) assert.equal(n, 3);
  assert.equal(new Set(CONCEITOS_QUEM.map((c) => c.tag_id)).size, 54);
});
