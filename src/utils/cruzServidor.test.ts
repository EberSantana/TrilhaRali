import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
// Executa o código do Apps Script (v13) num simulador mínimo para conferir a regra de XP.
test('cruzSubmit soma só a diferença e respeita limites', () => {
  const src = readFileSync(new URL('../data/ctfAppsScript.ts', import.meta.url), 'utf8');
  const code = src.slice(src.indexOf('var CRUZ_XP_MAX'), src.indexOf('// Debriefing: gabarito da sala'));
  const rows: Record<string, unknown>[] = [{ nome_key: 'ana', xp: 30, xp_cruz: 0, _row: 2 }];
  const ctx: Record<string, unknown> = {
    requireRoom: () => ({ status: 'aberta', timer: '', tipo: 'ctf', cruzadinha_dicas: 5 }),
    requireTimerOpen: () => {}, parseTimer: () => null, Date,
    cruzadinhaDicas: (r: { cruzadinha_dicas: unknown }) => (r.cruzadinha_dicas === '' ? null : Number(r.cruzadinha_dicas)),
    fail: (m: string) => { throw new Error(m); }, norm: (x: string) => String(x).toLowerCase(),
    playersOf: () => rows, updateRow: (_s: string, _r: number, o: Record<string, unknown>) => Object.assign(rows[0], o),
    isLivre: () => false, buildState: () => ({}), raliBuildState: () => ({}), Number, Math,
  };
  vm.createContext(ctx); vm.runInContext(code, ctx);
  const f = ctx.cruzSubmit as (r: unknown) => { cruz: { xp: number } };
  f({ token: 'T', nome: 'Ana', xp: 100 }); assert.equal(rows[0].xp, 130);
  f({ token: 'T', nome: 'Ana', xp: 100 }); assert.equal(rows[0].xp, 130);
  f({ token: 'T', nome: 'Ana', xp: 60 }); assert.equal(rows[0].xp, 130);
  f({ token: 'T', nome: 'Ana', xp: 250 }); assert.equal(rows[0].xp, 280);
  f({ token: 'T', nome: 'Ana', xp: 99999 }); assert.equal(rows[0].xp_cruz, 1500);
  assert.equal(rows[0].xp, 30 + 1500);
});
