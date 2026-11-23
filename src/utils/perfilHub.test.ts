import { test } from 'node:test';
import assert from 'node:assert/strict';
import { interpretarPerfilHub, nomeNaLista } from './perfilHub';

test('lê o perfil do HUB', () => {
  const p = interpretarPerfilHub(JSON.stringify({ id: 'x1', pin: '1234', nome: '  Maria   Souza ', apelido: 'Maria', curso: 'Integrado · 2º ano', turma: 'INT 2A' }));
  assert.deepEqual(p, { nome: 'Maria Souza', apelido: 'Maria', turma: 'INT 2A', curso: 'Integrado · 2º ano' });
});

test('perfil inválido ou ausente vira null', () => {
  assert.equal(interpretarPerfilHub(null), null);
  assert.equal(interpretarPerfilHub('{quebrado'), null);
  assert.equal(interpretarPerfilHub(JSON.stringify({ nome: 'Sem id' })), null);
  assert.equal(interpretarPerfilHub(JSON.stringify({ id: 'a', nome: 'A' })), null);
});

test('apelido cai no primeiro nome', () => {
  assert.equal(interpretarPerfilHub(JSON.stringify({ id: 'a', nome: 'João Pedro Lima' }))?.apelido, 'João');
});

test('acha o nome na lista da turma ignorando acentos e maiúsculas', () => {
  const p = interpretarPerfilHub(JSON.stringify({ id: 'a', nome: 'joao pedro' }));
  assert.equal(nomeNaLista(p, ['Ana Lima', 'João Pedro']), 'João Pedro');
  assert.equal(nomeNaLista(p, ['Ana Lima']), '');
  assert.equal(nomeNaLista(null, ['Ana Lima']), '');
});
