import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { CTF_APPS_SCRIPT, REVISAO_SCRIPT, VERSAO_SCRIPT } from '../data/ctfAppsScript';
import { situacao } from './servidorVersao';

test('o script publicado devolve a mesma revisão que o site espera', () => {
  assert.match(REVISAO_SCRIPT, /^[0-9a-f]{8}$/);
  assert.ok(!CTF_APPS_SCRIPT.includes('__REVISAO__'));
  const ctx: Record<string, unknown> = { ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t: string) => ({ setMimeType: () => ({ t }) }) } };
  vm.createContext(ctx);
  vm.runInContext(CTF_APPS_SCRIPT, ctx);
  const r = (ctx.doGet as () => { t: string })();
  assert.deepEqual(JSON.parse(r.t), { ok: true, servico: 'Trilha Rali', versao: VERSAO_SCRIPT, revisao: REVISAO_SCRIPT });
});

test('situação: igual = ok; revisão diferente ou ausente = desatualizado; sem resposta', () => {
  assert.equal(situacao({ versao: VERSAO_SCRIPT, revisao: REVISAO_SCRIPT }), 'ok');
  assert.equal(situacao({ versao: VERSAO_SCRIPT, revisao: '00000000' }), 'desatualizado');
  assert.equal(situacao({ versao: VERSAO_SCRIPT }), 'desatualizado');
  assert.equal(situacao({ versao: 30, revisao: REVISAO_SCRIPT }), 'desatualizado');
  assert.equal(situacao(null), 'sem-resposta');
});
