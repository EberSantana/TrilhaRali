import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { CTF_APPS_SCRIPT } from '../data/ctfAppsScript';
import { BANCO_TESTE } from './cruzBancoTeste';

// Executa o código real da Cruzada Online do Apps Script (v22) num simulador mínimo da planilha.
const trecho = (de: string, ate: string) => CTF_APPS_SCRIPT.slice(CTF_APPS_SCRIPT.indexOf(de), CTF_APPS_SCRIPT.indexOf(ate));
type Row = Record<string, unknown> & { _row: number };
const plain = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

interface Palavra { id: number; palavra: string; r: number; c: number; dir: 'A' | 'D'; n: number; dica: string }
interface Saida {
  grade: { id: number; h: number; w: number; palavras: Record<string, unknown>[] };
  limite: number; usadas: number; limite_palavra: number; usadas_palavra: number; reveladas: [number, number, string][];
  resolvidas: { id: number; palavra: string; posicao: number; xp: number }[]; xp: number;
  correta?: boolean; nova?: { palavra: string; posicao: number; xp: number };
}

function planilha(modo = 'fixed', tags = ['web_01', 'web_02']) {
  const guardado = new Map<string, string>();
  const cache = { get: (k: string) => guardado.get(k) ?? null, put: (k: string, v: string) => void guardado.set(k, v) };
  const sheets: Record<string, Row[]> = {
    CtfSalas: [{ _row: 2, token: 'T', status: 'aberta', modo, tipo: 'ctf', timer: '', cruzadinha_dicas: '', cruzadinha_palavras: '', cruzadinha_grade: '' }],
    CtfMissoes: tags.map((t, i) => ({ _row: i + 2, token: 'T', tag_id: t })),
    CtfAlunos: ['ana', 'bia', 'caio'].map((n, i) => ({ _row: i + 2, token: 'T', nome_key: n, xp: 0, xp_cruz: 0 })),
    CtfCruzCapturas: [], CtfCruzDicas: [], Banco: [],
    CruzBanco: Object.entries(BANCO_TESTE).flatMap(([d, l]) => l.map(([palavra, dica]) => ({ disciplina: d, palavra, dica, ativo: 'sim' } as Record<string, unknown>))).map((r, i) => ({ ...r, _row: i + 2 })),
  };
  const sala = sheets.CtfSalas[0];
  const ctx: Record<string, unknown> = {
    readRows: (n: string) => sheets[n] ?? [],
    appendObj: (n: string, o: Record<string, unknown>) => sheets[n].push({ ...o, _row: sheets[n].length + 2 }),
    updateRow: (n: string, row: number, o: Record<string, unknown>) => Object.assign(sheets[n].find((r) => r._row === row)!, o),
    getSheet: (n: string) => ({
      getLastRow: () => sheets[n].length + 1,
      deleteRows: (de: number, qtd: number) => sheets[n].splice(de - 2, qtd),
      getRange: () => ({
        setValues: (vals: unknown[][]) => vals.forEach((v) => sheets[n].push({ _row: sheets[n].length + 2, disciplina: v[0], palavra: v[1], dica: v[2], ativo: v[3], assunto: v[4] })),
      }),
    }),
    safeText: (v: string) => (/^[=+\-@]/.test(v) ? "'" + v : v),
    requireAdmin: () => sala, requireRoom: () => sala, roomInfo: () => ({}), logEvento: () => {},
    requireTimerOpen: () => {}, parseTimer: () => null, isLivre: () => false,
    buildState: () => ({}), raliBuildState: () => ({}),
    norm: (x: string) => String(x).toLowerCase(),
    playersOf: () => sheets.CtfAlunos,
    fail: (m: string) => { throw new Error(m); },
    CacheService: { getScriptCache: () => cache },
  };
  vm.createContext(ctx);
  vm.runInContext(trecho('function pontos', 'function randomFrom'), ctx);
  vm.runInContext(trecho('function isCruz', 'function createCruzRoom'), ctx);
  vm.runInContext(trecho('// ---------- Cruzadinha ----------', '// Debriefing: gabarito da sala'), ctx);
  const call = (fn: string, req: Record<string, unknown>) => plain((ctx[fn] as (r: unknown) => unknown)(req)) as { cruz: Saida };
  const grade = () => JSON.parse(String(sala.cruzadinha_grade)) as { id: number; h: number; w: number; palavras: Palavra[] };
  return { sheets, sala, ctx, call, grade };
}

const liberar = (p: ReturnType<typeof planilha>, dicas = 3, palavras = 12, nova = false) => p.call('setCruzadinha', { dicas, palavras, nova });
const celulas = (p: Palavra) => [...p.palavra].map((_, i) => (p.dir === 'A' ? [p.r, p.c + i] : [p.r + i, p.c]));

test('o código público do script não traz nenhum banco de palavras', () => {
  for (const lista of Object.values(BANCO_TESTE)) for (const [palavra, dica] of lista) assert.ok(!CTF_APPS_SCRIPT.includes(dica), palavra);
  assert.ok(!/CARDINALIDADE|FORMULARIO|PROCESSADOR/.test(CTF_APPS_SCRIPT));
});

test('banco vazio: o servidor pede para importar as palavras', () => {
  const p = planilha();
  p.sheets.CruzBanco.length = 0;
  assert.throws(() => liberar(p), /Importe as palavras/);
});

test('cruzBancoImport: importa, substitui, valida e protege contra fórmula', () => {
  const p = planilha();
  const r = p.call('cruzBancoImport', {
    substituir: true,
    linhas: [['Banco de Dados', 'Primária', 'Chave da linha'], ['Banco de Dados', 'X', 'curta'], ['', 'ATOMO', 'sem disciplina'], ['Banco de Dados', 'TUPLA', '=HYPERLINK("x")']],
  }) as unknown as { importadas: number; por_disciplina: Record<string, number> };
  assert.equal(r.importadas, 2);
  assert.equal(r.por_disciplina['Banco de Dados'], 2);
  assert.equal(r.por_disciplina['Informática Básica'], undefined);
  assert.deepEqual(p.sheets.CruzBanco.map((x) => [x.palavra, x.dica]), [['PRIMARIA', 'Chave da linha'], ['TUPLA', '\'=HYPERLINK("x")']]);
  p.call('cruzBancoImport', { substituir: false, linhas: [['Informática Básica', 'MOUSE', 'Aponta']] });
  assert.equal(p.sheets.CruzBanco.length, 3);
  assert.throws(() => p.call('cruzBancoImport', { linhas: [['', 'ATOMO', 'x'], ['Química', 'AB', 'curta']] }), /Nenhuma linha válida/);
});

test('ao liberar, o servidor monta uma grade válida só com a disciplina da sala', () => {
  const p = planilha();
  liberar(p, 3, 12);
  const g = p.grade();
  assert.ok(g.palavras.length >= 11 && g.palavras.length <= 12);
  const sites = new Set(p.sheets.CruzBanco.filter((r) => r.disciplina === 'Construção de Sites 1').map((r) => r.palavra));
  const mapa = new Map<string, string>();
  for (const w of g.palavras) {
    assert.ok(sites.has(w.palavra), `${w.palavra} não é de Construção de Sites 1`);
    celulas(w).forEach(([r, c], i) => {
      assert.ok(r >= 0 && c >= 0 && r < g.h && c < g.w);
      const k = `${r},${c}`;
      if (mapa.has(k)) assert.equal(mapa.get(k), w.palavra[i]);
      mapa.set(k, w.palavra[i]);
    });
  }
  for (const w of g.palavras) {
    const outras = g.palavras.filter((q) => q.id !== w.id).flatMap(celulas).map(String);
    assert.ok(celulas(w).some((c) => outras.includes(String(c))), `${w.palavra} isolada`);
  }
});

test('com 25 palavras a grade continua cabível', () => {
  for (const tag of ['info_01', 'web_01', 'linux_01', 'sql_01']) {
    const p = planilha('fixed', [tag]);
    liberar(p, 3, 25);
    const g = p.grade();
    assert.ok(g.palavras.length >= 22, `${tag}: ${g.palavras.length}`);
    assert.ok(g.h <= 30 && g.w <= 30, `${tag}: ${g.h}x${g.w}`);
  }
});

test('o aluno recebe a grade sem as letras', () => {
  const p = planilha();
  liberar(p);
  const s = p.call('cruzState', { nome: 'Ana' }).cruz;
  for (const w of s.grade.palavras) {
    assert.equal(w.palavra, undefined);
    assert.equal(typeof w.tam, 'number');
  }
  const json = JSON.stringify(s);
  for (const w of p.grade().palavras) if (w.palavra.length >= 5) assert.ok(!json.includes(`"${w.palavra}"`), w.palavra);
});

test('cruzCheck: errada não pontua; certa pontua uma vez; aceita acento e minúscula', () => {
  const p = planilha();
  liberar(p);
  const w = p.grade().palavras[0];
  assert.equal(p.call('cruzCheck', { nome: 'Ana', id: w.id, tentativa: 'X'.repeat(w.palavra.length) }).cruz.correta, false);
  assert.equal(p.sheets.CtfCruzCapturas.length, 0);
  const r = p.call('cruzCheck', { nome: 'Ana', id: w.id, tentativa: w.palavra.toLowerCase() }).cruz;
  assert.equal(r.correta, true);
  assert.equal(r.nova!.xp, w.palavra.length * 10);
  assert.deepEqual(r.resolvidas.map((x) => x.palavra), [w.palavra]);
  p.call('cruzCheck', { nome: 'Ana', id: w.id, tentativa: w.palavra });
  assert.equal(p.sheets.CtfCruzCapturas.length, 1);
  assert.equal(p.sheets.CtfAlunos[0].xp, w.palavra.length * 10);
  assert.equal(p.sheets.CtfAlunos[0].xp_cruz, w.palavra.length * 10);
});

test('modo CTF Dinâmico: quem fecha primeiro ganha mais', () => {
  const p = planilha('ctf_dynamic');
  liberar(p);
  const w = p.grade().palavras.find((x) => x.palavra.length >= 5)!;
  const xps = ['Bia', 'Ana', 'Caio'].map((n) => p.call('cruzCheck', { nome: n, id: w.id, tentativa: w.palavra }).cruz.nova!.xp);
  const b = w.palavra.length * 10;
  const d = Math.max(1, Math.round(b * 0.1));
  assert.deepEqual(xps, [b, b - d, b - 2 * d]);
});

test('dicas: o servidor entrega a letra, conta o uso, respeita o limite e desconta o XP', () => {
  const p = planilha();
  liberar(p, 1);
  p.call('setCruzadinha', { dicas: 1, palavras: 12, reveals: 1 });
  const [w1, w2, w3] = p.grade().palavras;
  const s = p.call('cruzHint', { nome: 'Ana', tipo: 'letra', id: w1.id, indice: 0 }).cruz;
  assert.equal(s.usadas, 1);
  assert.equal(s.limite, 1);
  assert.equal(s.limite_palavra, 1);
  assert.equal(s.usadas_palavra, 0);
  assert.deepEqual(s.reveladas, [[...celulas(w1)[0], w1.palavra[0]]]);
  assert.throws(() => p.call('cruzHint', { nome: 'Ana', tipo: 'letra', id: w1.id, indice: 0 }), /já foi revelada|dicas de letra acabaram/);
  assert.equal(p.call('cruzCheck', { nome: 'Ana', id: w1.id, tentativa: w1.palavra }).cruz.nova!.xp, Math.round(w1.palavra.length * 5));
  const rv = p.call('cruzHint', { nome: 'Ana', tipo: 'palavra', id: w2.id }).cruz;
  assert.equal(rv.usadas, 1, 'revelar palavra não gasta as dicas de letra');
  assert.equal(rv.usadas_palavra, 1);
  assert.throws(() => p.call('cruzHint', { nome: 'Ana', tipo: 'letra', id: w3.id, indice: 0 }), /dicas de letra acabaram/);
  assert.throws(() => p.call('cruzHint', { nome: 'Ana', tipo: 'palavra', id: w3.id }), /revelações de palavra acabaram/);
  const r = p.call('cruzCheck', { nome: 'Ana', id: w2.id, tentativa: w2.palavra }).cruz;
  assert.equal(r.correta, true);
  assert.equal(r.nova, undefined); // palavra revelada não pontua
  // as dicas são de cada aluno
  assert.equal(p.call('cruzState', { nome: 'Bia' }).cruz.usadas, 0);
});

test('sem dicas (0) o servidor recusa; oculta ou sem grade, recusa tudo', () => {
  const p = planilha();
  liberar(p, 0);
  assert.throws(() => p.call('cruzHint', { nome: 'Ana', tipo: 'palavra', id: 0 }), /desativadas nesta sala/);
  p.call('setCruzadinha', { dicas: null, palavras: 12 });
  assert.throws(() => p.call('cruzState', { nome: 'Ana' }), /não está liberada/);
});

test('mudar só as dicas mantém a grade; mudar palavras ou pedir nova grade sorteia outra', () => {
  const p = planilha();
  liberar(p, 3, 12);
  const a = p.sala.cruzadinha_grade;
  liberar(p, 5, 12);
  assert.equal(p.sala.cruzadinha_grade, a);
  liberar(p, 5, 8);
  const b = p.sala.cruzadinha_grade;
  assert.notEqual(b, a);
  assert.ok(p.grade().palavras.length <= 8);
  liberar(p, 5, 8, true);
  assert.notEqual(p.sala.cruzadinha_grade, b);
});

test('o professor pode editar a aba CruzBanco: palavra com acento, palavra desativada e banco curto', () => {
  const p = planilha();
  liberar(p);
  for (const r of p.sheets.CruzBanco) if (r.disciplina === 'Construção de Sites 1') r.ativo = 'não';
  p.sheets.CruzBanco.push({ _row: 999, disciplina: 'Construção de Sites 1', palavra: 'Ação', dica: 'Teste com acento', ativo: 'sim' });
  assert.throws(() => liberar(p, 3, 12, true), /poucas palavras/);
  const sites = p.sheets.CruzBanco.filter((r) => r.disciplina === 'Construção de Sites 1');
  sites.slice(0, 8).forEach((r) => (r.ativo = 'sim'));
  liberar(p, 3, 25, true);
  const ativas = new Set(sites.filter((r) => r.ativo === 'sim').map((r) => String(r.palavra).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()));
  const nomes = p.grade().palavras.map((w) => w.palavra);
  assert.ok(nomes.length >= 6);
  assert.ok(nomes.every((n) => ativas.has(n)), nomes.join(','));
});

test('Cruzada Online (v20): sala com tipo próprio; cria com a disciplina, o aluno joga direto e o ranking conta palavras', () => {
  const p = planilha('ctf_dynamic', []);
  const ctx = p.ctx;
  Object.assign(ctx, {
    genToken: () => 'CRUZ01',
    randomFrom: () => 'chave',
    timerApply: () => null,
    TOKEN_CHARS: 'ABC',
  });
  vm.runInContext(trecho('function isCruz', 'function join('), ctx);
  const r = plain((ctx.createRoom as (q: unknown) => Record<string, unknown>)({ tipo: 'cruz', disciplina: 'Informática Básica', palavras: 10, dicas: 4, modo: 'ctf_dynamic', nome: 'Cruz' }));
  assert.equal(r.ordem, 'cruzadinha');
  assert.equal(r.tipo, 'cruz');
  const sala = p.sheets.CtfSalas.find((s) => s.token === 'CRUZ01')!;
  assert.equal(sala.tipo, 'cruz');
  assert.equal(plain((ctx.tipoOut as (x: unknown) => string)(sala)), 'cruz');
  // salas da v19 (ctf + cruzadinha) continuam sendo Cruzada; CTF e Rali não mudam
  assert.equal((ctx.tipoOut as (x: unknown) => string)({ tipo: 'ctf', ordem: 'cruzadinha' }), 'cruz');
  assert.equal((ctx.tipoOut as (x: unknown) => string)({ tipo: 'ctf', ordem: 'livre' }), 'ctf');
  assert.equal((ctx.tipoOut as (x: unknown) => string)({ tipo: 'rali' }), 'rali');
  assert.equal(sala.cruzadinha_disc, 'Informática Básica');
  assert.equal(sala.cruzadinha_dicas, 4);
  const g = JSON.parse(String(sala.cruzadinha_grade)) as { palavras: { id: number; palavra: string }[] };
  assert.equal(Number(sala.total_fases), g.palavras.length);
  const info = new Set(p.sheets.CruzBanco.filter((b) => b.disciplina === 'Informática Básica').map((b) => b.palavra));
  assert.ok(g.palavras.every((w) => info.has(w.palavra)));
  assert.throws(() => (ctx.createRoom as (q: unknown) => unknown)({ tipo: 'cruz', disciplina: '' }), /Escolha ao menos uma disciplina/);
});

test('treino livre: gera a grade sem letras, confere, conta dicas e não toca no ranking', () => {
  const p = planilha();
  const call = (fn: string, req: Record<string, unknown>) => p.call(fn, req) as unknown as { cruz: Saida };
  const novo = call('cruzTreinoNovo', { disciplina: 'Informática Básica', palavras: 8, dicas: 2 });
  const gid = novo.cruz.grade.id;
  assert.equal(novo.cruz.limite, 2);
  assert.ok(novo.cruz.grade.palavras.length >= 6);
  // o aluno nunca recebe a palavra: só o tamanho e a dica
  assert.ok(novo.cruz.grade.palavras.every((w) => !('palavra' in w) && typeof w.tam === 'number'));
  // o gabarito existe só no cache do servidor
  const gab = plain((p.ctx.treinoGet as (g: number) => { grade: { palavras: Palavra[] } })(gid)).grade.palavras;
  const [a, b, c, d] = gab;

  let r = call('cruzTreinoCheck', { gid, id: a.id, tentativa: 'ZZZ' });
  assert.equal(r.cruz.correta, false);
  assert.equal(r.cruz.xp, 0);
  r = call('cruzTreinoCheck', { gid, id: a.id, tentativa: a.palavra.toLowerCase() });
  assert.equal(r.cruz.correta, true);
  assert.equal(r.cruz.nova?.xp, a.palavra.length * 10);
  assert.equal(r.cruz.xp, a.palavra.length * 10);
  // repetir a mesma palavra não soma de novo
  r = call('cruzTreinoCheck', { gid, id: a.id, tentativa: a.palavra });
  assert.equal(r.cruz.xp, a.palavra.length * 10);
  assert.equal(r.cruz.nova, undefined);

  // dica: o servidor entrega a letra e conta; palavra com ajuda vale metade
  let h = call('cruzTreinoHint', { gid, id: b.id, tipo: 'letra', indice: 0 });
  assert.equal(h.cruz.usadas, 1);
  assert.deepEqual(h.cruz.reveladas.map((x) => x[2]), [b.palavra[0]]);
  r = call('cruzTreinoCheck', { gid, id: b.id, tentativa: b.palavra });
  assert.equal(r.cruz.nova?.xp, Math.round(b.palavra.length * 10 * 0.5));
  assert.throws(() => call('cruzTreinoHint', { gid, id: a.id, tipo: 'letra', indice: 0 }), /já está resolvida/);
  for (let i = 1; ; i++) {
    try { h = call('cruzTreinoHint', { gid, id: c.id, tipo: 'letra', indice: i % c.palavra.length }); break; } catch (e) { if (!/já foi revelada/.test(String(e))) throw e; }
  }
  assert.equal(h.cruz.usadas, 2);
  assert.throws(() => call('cruzTreinoHint', { gid, id: d.id, tipo: 'letra', indice: 0 }), /acabaram/);

  // continua de onde parou ao recarregar
  const st = call('cruzTreinoEstado', { gid });
  assert.equal(st.cruz.resolvidas.length, 2);
  assert.equal(st.cruz.usadas, 2);
  assert.ok(st.cruz.grade.palavras.every((w) => !('palavra' in w)));

  // nada vai para o ranking nem para a planilha da sala
  assert.equal(p.sheets.CtfCruzCapturas.length, 0);
  assert.equal(p.sheets.CtfCruzDicas.length, 0);
  assert.ok(p.sheets.CtfAlunos.every((x) => x.xp === 0 && x.xp_cruz === 0));

  assert.throws(() => call('cruzTreinoEstado', { gid: 1 }), /expirou/);
  assert.throws(() => call('cruzTreinoNovo', { disciplina: 'Química' }), /poucas palavras ativas para Química/);
  p.sheets.CruzBanco.length = 0;
  assert.throws(() => call('cruzTreinoNovo', { disciplina: 'Banco de Dados' }), /poucas palavras ativas para Banco de Dados/);
});

test('deleteRoom (v21): apaga de vez a sala encerrada e tudo dela; recusa sala aberta', () => {
  const abas: Record<string, { _row: number; token: string }[]> = {};
  ['CtfSalas', 'CtfMissoes', 'CtfAlunos', 'CtfCapturas', 'CtfCruzCapturas', 'CtfCruzDicas', 'CtfResumo', 'CtfAnalise'].forEach((n) => {
    abas[n] = [{ _row: 2, token: 'A' }, { _row: 3, token: 'B' }, { _row: 4, token: 'A' }];
  });
  const sala = { _row: 2, token: 'A', status: 'encerrada', admin_key: 'k' };
  const ctx: Record<string, unknown> = {
    readRows: (n: string) => abas[n].map((r) => ({ ...r })),
    getSheet: (n: string) => ({ deleteRow: (linha: number) => { abas[n] = abas[n].filter((r) => r._row !== linha).map((r) => ({ ...r, _row: r._row > linha ? r._row - 1 : r._row })); } }),
    requireAdmin: () => sala, logEvento: () => {},
    fail: (m: string) => { throw new Error(m); },
  };
  vm.createContext(ctx);
  vm.runInContext(trecho('function deleteRoom', 'function setBanco'), ctx);
  sala.status = 'aberta';
  assert.throws(() => (ctx.deleteRoom as (r: unknown) => unknown)({}), /Encerre a sala/);
  sala.status = 'encerrada';
  const r = plain((ctx.deleteRoom as (r: unknown) => { apagadas: number })({}));
  assert.equal(r.apagadas, 16);
  for (const n of Object.keys(abas)) assert.deepEqual(abas[n].map((x) => x.token), ['B'], n);
});

// ---------- v22: perguntas do Banco por assunto viram palavras da Cruzada ----------
const perguntaBanco = (id: number, disciplina: string, assunto: string, resposta: string, pergunta: string, extra: Record<string, unknown> = {}): Row => ({
  _row: id + 2, id: `B${id}`, disciplina, assunto, tipo: 'exata', pergunta, resposta, ativo: true, ...extra,
});

function comBanco() {
  const p = planilha();
  p.sheets.CruzBanco.length = 0;
  const q = [
    ['Joins', 'INNER', 'Junção que traz só as linhas com par nas duas tabelas'],
    ['Joins', 'LEFT', 'Junção que mantém todas as linhas da tabela da esquerda'],
    ['Joins', 'RIGHT', 'Junção que mantém todas as linhas da tabela da direita'],
    ['Joins', 'CROSS', 'Junção que gera o produto cartesiano'],
    ['Joins', 'NATURAL', 'Junção feita pelas colunas de mesmo nome'],
    ['Joins', 'OUTER', 'Junção externa, que preserva linhas sem par'],
    ['Chaves', 'primária', 'Identifica cada linha da tabela de forma única'],
    ['Chaves', 'estrangeira', 'Coluna que aponta para a chave de outra tabela'],
    ['Chaves', 'candidata', 'Coluna que poderia ser escolhida como identificador'],
    ['Chaves', 'composta', 'Chave formada por mais de uma coluna'],
    ['Chaves', 'alternativa', 'Candidata que não foi escolhida como principal'],
    ['Chaves', 'surrogate', 'Chave artificial, sem significado no negócio'],
  ];
  q.forEach(([a, r, d], i) => p.sheets.Banco.push(perguntaBanco(i + 1, 'Banco de Dados', a, r, d)));
  return p;
}

test('v22: perguntas ativas do Banco viram palavras, cada uma no seu assunto, e a pergunta vira a dica', () => {
  const p = comBanco();
  p.sheets.Banco.push(
    perguntaBanco(20, 'Banco de Dados', 'Joins', 'SELECT * FROM t', 'Comando que lista tudo'), // frase com símbolos: não serve
    perguntaBanco(21, 'Banco de Dados', 'Joins', 'DESATIVADA', 'Pergunta desativada', { ativo: false }),
    perguntaBanco(22, 'Banco de Dados', 'Joins', 'CHAVE', 'A chave é aquilo que identifica a linha'), // a pergunta entrega a resposta
    perguntaBanco(23, 'Banco de Dados', 'Joins', 'SO', 'Resposta curta demais'),
    perguntaBanco(24, 'Química', 'Átomos', 'PROTON', 'Partícula de carga positiva do núcleo'),
    perguntaBanco(25, 'Banco de Dados', 'Joins', 'DISTINCT', 'x'.repeat(250)), // dica longa demais
  );
  const r = p.call('cruzAssuntos', {}) as unknown as { assuntos: Record<string, { assunto: string; n: number }[]> };
  assert.deepEqual(r.assuntos['Banco de Dados'], [{ assunto: 'Chaves', n: 6 }, { assunto: 'Joins', n: 6 }]);
  assert.deepEqual(r.assuntos['Química'], [{ assunto: 'Átomos', n: 1 }], 'qualquer disciplina do Banco aparece');
  assert.deepEqual(Object.keys(r.assuntos), ['Banco de Dados', 'Química']);
  assert.ok(!JSON.stringify(r).includes('INNER'), 'nenhuma resposta sai na lista de assuntos');
});

test('v22: o treino filtra por assunto e as palavras vêm só dele', () => {
  const p = comBanco();
  const t = p.call('cruzTreinoNovo', { disciplina: 'Banco de Dados', palavras: 6, dicas: 0, assuntos: ['Chaves'] });
  assert.ok(t.cruz.grade.palavras.length >= 5);
  const chaves = new Set(['PRIMARIA', 'ESTRANGEIRA', 'CANDIDATA', 'COMPOSTA', 'ALTERNATIVA', 'SURROGATE']);
  const g = JSON.parse((p.ctx.CacheService as { getScriptCache(): { get(k: string): string } }).getScriptCache().get(`cruzT_${t.cruz.grade.id}`)) as { grade: { palavras: Palavra[] } };
  for (const w of g.grade.palavras) assert.ok(chaves.has(w.palavra), `${w.palavra} não é do assunto Chaves`);
  assert.ok(!JSON.stringify(t).includes('PRIMARIA'), 'o aluno não recebe as letras');
});

test('v22: assunto com poucas palavras é recusado com uma mensagem clara; vários assuntos somam', () => {
  const p = comBanco();
  p.sheets.Banco.length = 8; // Joins fica com 6 e Chaves com 2
  assert.throws(() => p.call('cruzTreinoNovo', { disciplina: 'Banco de Dados', assuntos: ['Chaves'] }), /só 2 palavra\(s\).*mínimo 6/);
  const t = p.call('cruzTreinoNovo', { disciplina: 'Banco de Dados', palavras: 6, assuntos: ['Chaves', 'Joins'] });
  assert.ok(t.cruz.grade.palavras.length >= 5);
  const sem = p.call('cruzTreinoNovo', { disciplina: 'Banco de Dados', palavras: 6 });
  assert.ok(sem.cruz.grade.palavras.length >= 5, 'sem filtro usa todos os assuntos');
});

test('v22: a aba CruzBanco ganha assunto, vence repetidas do Banco e o resumo conta de onde vem', () => {
  const p = comBanco();
  const r = p.call('cruzBancoImport', {
    substituir: true,
    linhas: [['Banco de Dados', 'inner', 'Dica do professor', 'Joins'], ['Banco de Dados', 'VIEW', 'Tabela virtual', ''], ['Banco de Dados', 'INDICE', 'Acelera buscas', '=1+1']],
  }) as unknown as { importadas: number; por_disciplina: Record<string, number>; do_banco: Record<string, number> };
  assert.equal(r.importadas, 3);
  assert.deepEqual(p.sheets.CruzBanco.map((x) => [x.palavra, x.assunto]), [['INNER', 'Joins'], ['VIEW', ''], ['INDICE', "'=1+1"]]);
  assert.equal(r.por_disciplina['Banco de Dados'], 14); // 12 do Banco + 3 do CruzBanco - INNER repetida
  assert.equal(r.do_banco['Banco de Dados'], 11);
  const lista = p.call('cruzAssuntos', {}) as unknown as { assuntos: Record<string, { assunto: string; n: number }[]> };
  assert.ok(lista.assuntos['Banco de Dados'].some((a) => a.assunto === 'Geral' && a.n === 1), 'palavra sem assunto cai em Geral');
});

test('v22: a nova grade da sala respeita os assuntos gravados nela', () => {
  const p = comBanco();
  p.sala.tipo = 'cruz';
  p.sala.cruzadinha_disc = 'Banco de Dados';
  p.sala.cruzadinha_assuntos = JSON.stringify(['Joins']);
  liberar(p, 3, 6, true);
  const joins = new Set(['INNER', 'LEFT', 'RIGHT', 'CROSS', 'NATURAL', 'OUTER']);
  for (const w of p.grade().palavras) assert.ok(joins.has(w.palavra), `${w.palavra} não é de Joins`);
  p.sala.cruzadinha_assuntos = JSON.stringify(['Assunto inexistente']);
  assert.throws(() => liberar(p, 3, 6, true), /O recorte escolhido tem só 0 palavra/);
});

test('v23: seleção com várias disciplinas e assuntos; disciplina inteira ou só alguns assuntos', () => {
  const p = comBanco();
  p.sheets.Banco.length = 12;
  ['Rede', 'Cabo', 'Roteador', 'Switch', 'Firewall', 'Gateway'].forEach((r, i) =>
    p.sheets.Banco.push(perguntaBanco(40 + i, 'Redes de Computadores', i < 3 ? 'Equipamentos' : 'Segurança', r, `Equipamento ou proteção numero ${i} da infraestrutura`)));
  const a = p.call('cruzAssuntos', {}) as unknown as { assuntos: Record<string, { assunto: string; n: number }[]> };
  assert.deepEqual(Object.keys(a.assuntos), ['Banco de Dados', 'Redes de Computadores']);
  const g = (selecao: unknown) => {
    const t = p.call('cruzTreinoNovo', { selecao, palavras: 6, dicas: 0 });
    return (JSON.parse((p.ctx.CacheService as { getScriptCache(): { get(k: string): string } }).getScriptCache().get(`cruzT_${t.cruz.grade.id}`)) as { grade: { palavras: Palavra[] } }).grade.palavras.map((w) => w.palavra);
  };
  const redes = new Set(['REDE', 'CABO', 'ROTEADOR', 'SWITCH', 'FIREWALL', 'GATEWAY']);
  assert.ok(g([{ disciplina: 'Redes de Computadores', assuntos: [] }]).every((w) => redes.has(w)));
  const mista = g([{ disciplina: 'Redes de Computadores', assuntos: ['Equipamentos'] }, { disciplina: 'Banco de Dados', assuntos: ['Joins'] }]);
  assert.ok(mista.length >= 5 && mista.every((w) => ['REDE', 'CABO', 'ROTEADOR', 'INNER', 'LEFT', 'RIGHT', 'CROSS', 'NATURAL', 'OUTER'].includes(w)), mista.join());
  assert.throws(() => g([{ disciplina: 'Redes de Computadores', assuntos: ['Equipamentos'] }]), /só 3 palavra\(s\)/);
});

test('v25: limites separados — 30 dicas de letra e 5 revelações de palavra por padrão', () => {
  const p = planilha();
  liberar(p, 30, 25);
  const e = p.call('cruzState', { nome: 'Ana' }).cruz;
  assert.equal(e.limite, 30);
  assert.equal(e.limite_palavra, 5, 'sem configurar, são 5 revelações');
  const ids = p.grade().palavras.map((w) => w.id);
  for (let i = 0; i < 5; i++) p.call('cruzHint', { nome: 'Ana', tipo: 'palavra', id: ids[i] });
  assert.throws(() => p.call('cruzHint', { nome: 'Ana', tipo: 'palavra', id: ids[5] }), /revelações de palavra acabaram \(5\)/);
  // uma letra ainda não revelada (palavras cruzadas já podem ter entregue algumas)
  let letra: Saida | undefined;
  for (let i = 0; !letra; i++) {
    try { letra = p.call('cruzHint', { nome: 'Ana', tipo: 'letra', id: ids[5], indice: i }).cruz; } catch (e) { if (!/já foi revelada/.test(String(e))) throw e; }
  }
  assert.equal(letra.usadas, 1);
  assert.equal(letra.usadas_palavra, 5);
  const t = p.call('cruzTreinoNovo', { selecao: [{ disciplina: 'Construção de Sites 1', assuntos: [] }], palavras: 10 }).cruz;
  assert.equal(t.limite, 30);
  assert.equal(t.limite_palavra, 5);
  const t0 = p.call('cruzTreinoNovo', { selecao: [{ disciplina: 'Construção de Sites 1', assuntos: [] }], palavras: 10, dicas: 0 }).cruz;
  assert.equal(t0.limite_palavra, 0, 'sem dicas, sem revelar palavra');
});
