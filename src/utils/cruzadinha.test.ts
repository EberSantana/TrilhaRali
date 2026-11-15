import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BANCO_CRUZADINHA, disciplinasDasTags } from '../data/cruzadinhaBanco';
import { hashTexto, letraNormalizada, montarGrade, xpPalavra } from './cruzadinha';

test('letraNormalizada tira acento e rejeita o que não é letra', () => {
  assert.equal(letraNormalizada('ç'), 'C');
  assert.equal(letraNormalizada('é'), 'E');
  assert.equal(letraNormalizada('7'), '');
  assert.equal(letraNormalizada('ab'), '');
});

test('xpPalavra: dica de letra corta pela metade e revelar zera', () => {
  assert.equal(xpPalavra(5, 0), 50);
  assert.equal(xpPalavra(5, 1), 25);
  assert.equal(xpPalavra(5, 2), 0);
});

test('disciplinasDasTags mapeia os prefixos e cai em Banco de Dados', () => {
  assert.deepEqual(disciplinasDasTags(['info_01', 'web_02', 'info_09']).sort(), ['Construção de Sites 1', 'Informática Básica']);
  assert.deepEqual(disciplinasDasTags(['linux_01']), ['Fundamentos de Sistemas Operacionais']);
  assert.deepEqual(disciplinasDasTags([]), ['Banco de Dados']);
  assert.deepEqual(disciplinasDasTags(['sql_01']), ['Banco de Dados']);
});

test('o banco só tem palavras A-Z, sem repetição por disciplina', () => {
  for (const [disc, lista] of Object.entries(BANCO_CRUZADINHA)) {
    const vistas = new Set<string>();
    for (const [p, dica] of lista) {
      assert.match(p, /^[A-Z]{3,13}$/, `${disc}: ${p}`);
      assert.ok(dica.length > 5, `${disc}: dica de ${p}`);
      assert.ok(!vistas.has(p), `${disc}: repetida ${p}`);
      vistas.add(p);
    }
    assert.ok(lista.length >= 12, disc);
  }
});

test('montarGrade: mesma semente, mesma grade; palavras cruzadas e consistentes', () => {
  for (const [disc, lista] of Object.entries(BANCO_CRUZADINHA)) {
    const a = montarGrade(lista, hashTexto('ABC234'));
    const b = montarGrade(lista, hashTexto('ABC234'));
    assert.deepEqual(a, b, disc);
    assert.ok(a.palavras.length >= 8, `${disc}: só ${a.palavras.length} palavras`);
    assert.ok(a.h <= 18 && a.w <= 18, `${disc}: grade ${a.h}x${a.w}`);
    const cel = new Map<string, string>();
    for (const p of a.palavras) {
      assert.equal(p.celulas.length, p.palavra.length);
      p.celulas.forEach(([r, c], i) => {
        assert.ok(r >= 0 && c >= 0 && r < a.h && c < a.w);
        const k = `${r},${c}`;
        if (cel.has(k)) assert.equal(cel.get(k), p.palavra[i], `${disc}: conflito em ${k}`);
        cel.set(k, p.palavra[i]);
      });
    }
    // toda palavra cruza com outra
    for (const p of a.palavras) {
      const outras = a.palavras.filter((q) => q.id !== p.id);
      assert.ok(p.celulas.some(([r, c]) => outras.some((q) => q.celulas.some(([x, y]) => x === r && y === c))), `${disc}: ${p.palavra} isolada`);
    }
    // numeração: início igual => mesmo número
    const porInicio = new Map<string, number>();
    for (const p of a.palavras) {
      const k = `${p.r},${p.c}`;
      if (porInicio.has(k)) assert.equal(porInicio.get(k), p.n);
      porInicio.set(k, p.n);
    }
  }
});

test('semente diferente pode gerar outra grade', () => {
  const l = BANCO_CRUZADINHA['Banco de Dados'];
  const a = montarGrade(l, hashTexto('AAAAAA'));
  const b = montarGrade(l, hashTexto('ZZZZZZ'));
  assert.notDeepEqual(a.palavras.map((p) => p.palavra).sort(), b.palavras.map((p) => p.palavra).sort());
});

test('montarGrade respeita a quantidade pedida pelo professor (6 a 16)', () => {
  const banco = [...BANCO_CRUZADINHA['Informática Básica'], ...BANCO_CRUZADINHA['Construção de Sites 1']];
  for (const n of [6, 10, 16]) {
    const g = montarGrade(banco, hashTexto('QTD' + n), n);
    assert.ok(g.palavras.length <= n, `${n}: gerou ${g.palavras.length}`);
    assert.ok(g.palavras.length >= n - 3, `${n}: só encaixou ${g.palavras.length}`);
  }
});
