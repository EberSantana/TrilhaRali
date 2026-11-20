import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
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
    DesvRanking: [],
    DesvGabarito: Object.entries(desv).map(([caso, g], i) => ({ _row: i + 2, caso, suspeito: g.suspeito, pontos: g.pontos, explicacao: g.explicacao })),
  };
  const ctx: Record<string, unknown> = {
    readRows: (n: string) => sheets[n].map((r) => ({ ...r })),
    appendObj: (n: string, o: Record<string, unknown>) => sheets[n].push({ ...o, _row: sheets[n].length + 2 }),
    safeText: (v: string) => v,
    sha256hex: (t: string) => createHash('sha256').update(String(t)).digest('hex'),
    Utilities: { base64Decode: (b: string) => Buffer.from(b, 'base64'), newBlob: (buf: Buffer) => ({ getDataAsString: () => buf.toString('utf8') }) },
    fail: (m: string) => { throw new Error(m); },
    CacheService: { getScriptCache: () => cache },
  };
  vm.createContext(ctx);
  vm.runInContext(trecho('// ---------- Desvendando', '// ---------- Grande ranking da Cruzada'), ctx);
  vm.runInContext(trecho('function cruzRankingNome', 'function cruzRankingLista'), ctx);
  const call = (fn: string, req: Record<string, unknown>) => JSON.parse(JSON.stringify((ctx[fn] as (r: unknown) => unknown)(req)));
  return { sheets, call };
}

const GID = 'aparelho_teste_01';

test('acusação errada desconta 15 e a certa grava os pontos uma vez só', () => {
  const s = servidor();
  const e1 = s.call('desvAcusar', { gid: GID, nome: 'Lia', caso: 'c3', suspeito: 2, dicas: 0 });
  assert.deepEqual([e1.correto, e1.erros, e1.valeAgora], [false, 1, 85]);
  const ok = s.call('desvAcusar', { gid: GID, nome: 'Lia', caso: 'c3', suspeito: 5, dicas: 1 });
  assert.equal(ok.correto, true);
  assert.equal(ok.pontos, 75); // 100 - 15 (1 erro) - 10 (1 dica)
  assert.match(ok.explicacao, /Eduardo/);
  const de_novo = s.call('desvAcusar', { gid: GID, nome: 'Lia', caso: 'c3', suspeito: 5, dicas: 0 });
  assert.equal(de_novo.jaResolvido, true);
  assert.equal(s.sheets.DesvRanking.length, 1);
});

test('pontuação mínima de 20 e ranking soma os casos por aparelho', () => {
  const s = servidor();
  for (let i = 0; i < 9; i++) s.call('desvAcusar', { gid: GID, nome: 'Lia', caso: 'c1', suspeito: 2 });
  assert.equal(s.call('desvAcusar', { gid: GID, nome: 'Lia', caso: 'c1', suspeito: 1 }).pontos, 20);
  s.call('desvAcusar', { gid: GID, nome: 'Lia', caso: 'c4', suspeito: 8 });
  s.call('desvAcusar', { gid: 'outro_aparelho_02', nome: 'Rui', caso: 'c2', suspeito: 4 });
  const r = s.call('desvRanking', {});
  assert.deepEqual(r.ranking.map((x: { nome: string; pontos: number; casos: number }) => [x.nome, x.pontos, x.casos]), [['Lia', 140, 2], ['Rui', 80, 1]]);
  assert.deepEqual(s.call('desvMeus', { gid: GID }).resolvidos, { c1: 20, c4: 120 });
});

test('valida caso, nome e aparelho', () => {
  const s = servidor();
  assert.throws(() => s.call('desvAcusar', { gid: GID, nome: 'Lia', caso: 'c99', suspeito: 1 }), /Caso desconhecido/);
  assert.throws(() => s.call('desvAcusar', { gid: GID, nome: 'L', caso: 'c1', suspeito: 1 }), /nome/);
  assert.throws(() => s.call('desvAcusar', { gid: 'x', nome: 'Lia', caso: 'c1', suspeito: 1 }), /aparelho/);
});

test('sem a aba DesvGabarito preenchida o servidor avisa em vez de aceitar qualquer acusação', () => {
  const s = servidor();
  s.sheets.DesvGabarito.length = 0;
  assert.throws(() => s.call('desvAcusar', { gid: GID, nome: 'Lia', caso: 'c1', suspeito: 1 }), /DesvGabarito/);
});
