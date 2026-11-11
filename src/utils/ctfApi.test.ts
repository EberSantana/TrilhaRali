import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidApiUrl, explainInvalidApiUrl, parseCtfHash } from './ctfApi.ts';

const OK = 'https://script.google.com/macros/s/AKfycbxAbC-123_xyz/exec';
const EDITOR = 'https://script.google.com/u/0/home/projects/1xyEJk9z6xxtes081Cx9JS2JknSc8NKXGlatPVInhcDlPfkOKSNfzoYqV/edit';
const SHEET = 'https://docs.google.com/spreadsheets/d/1SK-hQnN/edit?gid=0#gid=0';

test('aceita só a URL do Web App publicado', () => {
  assert.equal(isValidApiUrl(OK), true);
  assert.equal(isValidApiUrl(`  ${OK}  `), true);
  assert.equal(isValidApiUrl('https://script.google.com/a/macros/ifs.edu.br/s/AKfycbx_1/exec'), true);
  assert.equal(isValidApiUrl(EDITOR), false);
  assert.equal(isValidApiUrl(SHEET), false);
  assert.equal(isValidApiUrl('https://script.google.com/macros/s/AKfycbx/dev'), false);
  assert.equal(isValidApiUrl('http://script.google.com/macros/s/AKfycbx/exec'), false);
});

test('mensagem de erro orienta conforme o link colado', () => {
  assert.match(explainInvalidApiUrl(SHEET), /planilha/);
  assert.match(explainInvalidApiUrl(EDITOR), /editor/);
  assert.match(explainInvalidApiUrl('abc'), /\/exec/);
});

test('link de convite só carrega api válida', () => {
  assert.deepEqual(parseCtfHash(`#/ctf?t=abc123&api=${encodeURIComponent(OK)}`), { token: 'ABC123', api: OK });
  assert.deepEqual(parseCtfHash(`#/ctf?t=abc123&api=${encodeURIComponent(EDITOR)}`), { token: 'ABC123', api: undefined });
});

import { acentua } from './ctfApi';
test('acentua mensagens do servidor', () => {
  assert.equal(acentua('Sala nao encontrada. Confira o token.'), 'Sala não encontrada. Confira o token.');
  assert.equal(acentua('Esta sala esta encerrada.'), 'Esta sala está encerrada.');
});
