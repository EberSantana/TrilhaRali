import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { CTF_APPS_SCRIPT } from '../data/ctfAppsScript';
import { gabaritoAberto } from './gabaritoTeste';

// Executa o código real do Desvendando (Apps Script) num simulador mínimo da planilha
const trecho = (de: string, ate: string) => CTF_APPS_SCRIPT.slice(CTF_APPS_SCRIPT.indexOf(de), CTF_APPS_SCRIPT.indexOf(ate));
type Row = Record<string, unknown> & { _row: number };

function servidor() {
  const guardado = new Map<string, string>();
  const cache = { get: (k: string) => guardado.get(k) ?? null, put: (k: string, v: string) => void guardado.set(k, v), remove: (k: string) => void guardado.delete(k) };
  const desv = gabaritoAberto().desv!;
  const sheets: Record<string, Row[]> = {
    DesvRanking: [], DesvSalas: [], DesvDuplas: [], CtfSalas: [],
    DesvGabarito: Object.entries(desv).map(([caso, g], i) => ({ _row: i + 2, caso, suspeito: g.suspeito, pontos: g.pontos, explicacao: g.explicacao })),
  };
  let n = 0;
  const ctx: Record<string, unknown> = {
    readRows: (nome: string) => sheets[nome].map((r) => ({ ...r })),
    appendObj: (nome: string, o: Record<string, unknown>) => sheets[nome].push({ ...o, _row: sheets[nome].length + 2 }),
    updateRow: (nome: string, row: number, o: Record<string, unknown>) => Object.assign(sheets[nome].find((r) => r._row === row)!, o),
    safeText: (v: string) => v,
    genToken: () => `T${String(++n).padStart(5, 'A')}`,
    randomFrom: () => 'chave-prof',
    TOKEN_CHARS: 'ABC',
    fail: (m: string) => { throw new Error(m); },
    CacheService: { getScriptCache: () => cache },
    requireBancoKey: (req: { chave?: string }) => { if (req.chave !== 'chave-banco') throw new Error('Chave do banco inválida.'); },
  };
  vm.createContext(ctx);
  vm.runInContext(trecho('// ---------- Desvendando', '// ---------- Grande ranking da Cruzada'), ctx);
  vm.runInContext(trecho('function cruzRankingNome', 'function cruzRankingLista'), ctx);
  vm.runInContext(trecho('function papeisModo', 'function cleanName'), ctx);
  const call = (fn: string, req: Record<string, unknown>) => JSON.parse(JSON.stringify((ctx[fn] as (r: unknown) => unknown)(req)));
  return { sheets, call };
}

const DUPLA_A = 'aparelho_dupla_a1';
const DUPLA_B = 'aparelho_dupla_b2';

function salaCom(casos: string[]) {
  const s = servidor();
  const { token, adminKey } = s.call('createDesvRoom', { nome: '2º B', casos });
  return { ...s, token, adminKey };
}

test('o professor cria a sala só com os casos escolhidos; caso inexistente é ignorado', () => {
  const s = salaCom(['c3', 'c99', 'c3', 'c1']);
  assert.deepEqual(s.call('desvProf', { token: s.token, adminKey: s.adminKey }).sala.casos, ['c3', 'c1']);
  assert.throws(() => s.call('desvProf', { token: s.token, adminKey: 'errada' }), /Chave de professor/);
});

test('a dupla entra com o token e só acusa casos liberados; erro desconta 15 e o acerto grava uma vez', () => {
  const s = salaCom(['c3']);
  const e = s.call('desvEntrar', { token: s.token.toLowerCase(), gid: DUPLA_A, nome: 'Lia e Rui', integrantes: 'Lia, Rui' });
  assert.deepEqual(e.sala.casos, ['c3']);
  assert.throws(() => s.call('desvAcusar', { token: s.token, gid: DUPLA_A, caso: 'c1', suspeito: 1 }), /não foi liberado/);
  const erro = s.call('desvAcusar', { token: s.token, gid: DUPLA_A, caso: 'c3', suspeito: 2, dicas: 0 });
  assert.deepEqual([erro.correto, erro.valeAgora], [false, 85]);
  const ok = s.call('desvAcusar', { token: s.token, gid: DUPLA_A, caso: 'c3', suspeito: 5, dicas: 1 });
  assert.deepEqual([ok.correto, ok.pontos], [true, 75]);
  assert.equal(s.call('desvAcusar', { token: s.token, gid: DUPLA_A, caso: 'c3', suspeito: 5 }).jaResolvido, true);
  assert.equal(s.sheets.DesvRanking.length, 1);
  assert.deepEqual(s.call('desvEstado', { token: s.token, gid: DUPLA_A }).resolvidos, { c3: 75 });
});

test('liberar caso no meio da aula, ranking só da sala e sala encerrada bloqueia acusações', () => {
  const s = salaCom(['c1']);
  s.call('desvEntrar', { token: s.token, gid: DUPLA_A, nome: 'Dupla A' });
  s.call('desvEntrar', { token: s.token, gid: DUPLA_B, nome: 'Dupla B' });
  s.call('desvAcusar', { token: s.token, gid: DUPLA_A, caso: 'c1', suspeito: 1 });
  s.call('desvProf', { token: s.token, adminKey: s.adminKey, op: 'casos', casos: ['c1', 'c4'] });
  s.call('desvAcusar', { token: s.token, gid: DUPLA_B, caso: 'c4', suspeito: 8 });
  // outra turma, outra sala: não entra neste ranking
  const outra = s.call('createDesvRoom', { nome: '3º A', casos: ['c1'] });
  s.call('desvEntrar', { token: outra.token, gid: 'aparelho_outra_t1', nome: 'Outra turma' });
  s.call('desvAcusar', { token: outra.token, gid: 'aparelho_outra_t1', caso: 'c1', suspeito: 1 });
  const r = s.call('desvRanking', { token: s.token }).ranking;
  assert.deepEqual(r.map((x: { nome: string; pontos: number }) => [x.nome, x.pontos]), [['Dupla B', 120], ['Dupla A', 60]]);
  const p = s.call('desvProf', { token: s.token, adminKey: s.adminKey, op: 'status', status: 'encerrada' });
  assert.equal(p.duplas.length, 2);
  assert.deepEqual(p.resolvidosPorCaso, { c1: 1, c4: 1 });
  assert.throws(() => s.call('desvAcusar', { token: s.token, gid: DUPLA_A, caso: 'c4', suspeito: 8 }), /encerrada/);
  assert.throws(() => s.call('desvEntrar', { token: s.token, gid: 'aparelho_nova_c3', nome: 'Nova' }), /encerrada/);
});

test('sem entrar na sala não acusa, e sem gabarito na planilha não cria sala', () => {
  const s = salaCom(['c1']);
  assert.throws(() => s.call('desvAcusar', { token: s.token, gid: DUPLA_A, caso: 'c1', suspeito: 1 }), /Entre na sala/);
  assert.throws(() => s.call('desvEntrar', { token: 'ZZZZZZ', gid: DUPLA_A, nome: 'X Y' }), /Sala não encontrada/);
  const v = servidor();
  v.sheets.DesvGabarito.length = 0;
  assert.throws(() => v.call('createDesvRoom', { casos: ['c1'] }), /DesvGabarito/);
});

test('com a chave do banco o professor recupera as salas em outro aparelho (com a chave de cada sala)', () => {
  const s = salaCom(['c1']);
  s.call('desvEntrar', { token: s.token, gid: DUPLA_A, nome: 'Dupla A' });
  assert.throws(() => s.call('desvSalasList', { chave: 'errada' }), /Chave do banco/);
  const l = s.call('desvSalasList', { chave: 'chave-banco' }).salas;
  assert.equal(l.length, 1);
  assert.deepEqual([l[0].token, l[0].adminKey, l[0].casos, l[0].duplas, l[0].status], [s.token, s.adminKey, 1, 1, 'aberta']);
});
