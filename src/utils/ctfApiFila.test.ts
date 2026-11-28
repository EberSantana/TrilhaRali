import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ctfCall, _setEsperaCtf } from './ctfApi';

const resp = (o: unknown) => ({ json: async () => o }) as Response;

test('repete quando o servidor está ocupado e depois entra', async () => {
  _setEsperaCtf(async () => {});
  let n = 0;
  (globalThis as any).fetch = async () => resp(++n < 3 ? { error: 'Erro no servidor: Exception: Could not obtain lock after 25 seconds.' } : { ok: true });
  assert.deepEqual(await ctfCall('submit', {}, 'https://x/exec'), { ok: true });
  assert.equal(n, 3);
});

test('não repete erro de regra (ex.: sala encerrada)', async () => {
  _setEsperaCtf(async () => {});
  let n = 0;
  (globalThis as any).fetch = async () => { n++; return resp({ error: 'Sala encerrada.' }); };
  await assert.rejects(() => ctfCall('join', {}, 'https://x/exec'), /Sala encerrada/);
  assert.equal(n, 1);
});

test('queda de rede só repete ações seguras', async () => {
  _setEsperaCtf(async () => {});
  let n = 0;
  (globalThis as any).fetch = async () => { n++; throw new Error('off'); };
  await assert.rejects(() => ctfCall('submit', {}, 'https://x/exec'), /Sem conexão/);
  assert.equal(n, 1);
  n = 0;
  await assert.rejects(() => ctfCall('state', {}, 'https://x/exec'), /Sem conexão/);
  assert.equal(n, 5);
});

test('desiste depois de várias tentativas com mensagem amigável', async () => {
  _setEsperaCtf(async () => {});
  (globalThis as any).fetch = async () => resp({ error: 'Erro no servidor: Exception: Lock timeout' });
  await assert.rejects(() => ctfCall('submit', {}, 'https://x/exec'), /servidor está cheio/);
});

test('reconhece a mensagem de bloqueio em português do Apps Script', async () => {
  _setEsperaCtf(async () => {});
  let n = 0;
  (globalThis as any).fetch = async () => resp(++n < 2 ? { error: 'Erro no servidor: Exception: Tempo limite do bloqueio: outro processo manteve o bloqueio por muito tempo.' } : { ok: true });
  assert.deepEqual(await ctfCall('join', {}, 'https://x/exec'), { ok: true });
  assert.equal(n, 2);
});
