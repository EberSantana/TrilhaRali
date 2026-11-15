import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BANCO_TESTE } from './cruzBancoTeste';
import { lerBanco } from './cruzBanco';
import { letraNormalizada } from './cruzadinha';

test('letraNormalizada tira acento e rejeita o que não é letra', () => {
  assert.equal(letraNormalizada('ç'), 'C');
  assert.equal(letraNormalizada('é'), 'E');
  assert.equal(letraNormalizada('7'), '');
  assert.equal(letraNormalizada('ab'), '');
});

test('o banco de teste só tem palavras A-Z, sem repetição por disciplina', () => {
  for (const [disc, lista] of Object.entries(BANCO_TESTE)) {
    const vistas = new Set<string>();
    for (const [p, dica] of lista) {
      assert.match(p, /^[A-Z]{3,13}$/, `${disc}: ${p}`);
      assert.ok(dica.length > 5, `${disc}: dica de ${p}`);
      assert.ok(!vistas.has(p), `${disc}: repetida ${p}`);
      vistas.add(p);
    }
    assert.ok(lista.length >= 30, disc);
  }
});

test('lerBanco: aceita ; ou tabulação, apelidos de disciplina, acento e cabeçalho; aponta erros', () => {
  const r = lerBanco(
    '\uFEFFdisciplina;palavra;dica\n' +
      'Banco de Dados;Primária;Chave que identifica a linha\n' +
      'sites\thref\tAtributo do link\n' +
      'linux;GREP;Procura texto; em arquivos\n' +
      '# comentário\n' +
      'química;ATOMO;Partícula\n' +
      'bd;AB;Curta demais\n' +
      'bd;TUPLA;\n' +
      'BD;primaria;repetida\n',
  );
  assert.deepEqual(r.linhas, [
    ['Banco de Dados', 'PRIMARIA', 'Chave que identifica a linha'],
    ['Construção de Sites 1', 'HREF', 'Atributo do link'],
    ['Fundamentos de Sistemas Operacionais', 'GREP', 'Procura texto; em arquivos'],
  ]);
  assert.equal(r.erros.length, 4);
  assert.match(r.erros[0], /química/);
});
