import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { CTF_APPS_SCRIPT } from '../data/ctfAppsScript';
import { BANCO_TESTE } from './cruzBancoTeste';

// Executa o código real da Cruzada Online do Apps Script (v20) num simulador mínimo da planilha.
const trecho = (de: string, ate: string) => CTF_APPS_SCRIPT.slice(CTF_APPS_SCRIPT.indexOf(de), CTF_APPS_SCRIPT.indexOf(ate));
type Row = Record<string, unknown> & { _row: number };
const plain = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

interface Palavra { id: number; palavra: string; r: number; c: number; dir: 'A' | 'D'; n: number; dica: string }
interface Saida {
  grade: { id: number; h: number; w: number; palavras: Record<string, unknown>[] };
  limite: number; usadas: number; reveladas: [number, number, string][];
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
    CtfCruzCapturas: [], CtfCruzDicas: [],
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
        setValues: (vals: unknown[][]) => vals.forEach((v) => sheets[n].push({ _row: sheets[n].length + 2, disciplina: v[0], palavra: v[1], dica: v[2], ativo: v[3] })),
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
    linhas: [['Banco de Dados', 'Primária', 'Chave da linha'], ['Banco de Dados', 'X', 'curta'], ['Química', 'ATOMO', 'x'], ['Banco de Dados', 'TUPLA', '=HYPERLINK("x")']],
  }) as unknown as { importadas: number; por_disciplina: Record<string, number> };
  assert.equal(r.importadas, 2);
  assert.equal(r.por_disciplina['Banco de Dados'], 2);
  assert.equal(r.por_disciplina['Informática Básica'], 0);
  assert.deepEqual(p.sheets.CruzBanco.map((x) => [x.palavra, x.dica]), [['PRIMARIA', 'Chave da linha'], ['TUPLA', '\'=HYPERLINK("x")']]);
  p.call('cruzBancoImport', { substituir: false, linhas: [['Informática Básica', 'MOUSE', 'Aponta']] });
  assert.equal(p.sheets.CruzBanco.length, 3);
  assert.throws(() => p.call('cruzBancoImport', { linhas: [['Química', 'ATOMO', 'x']] }), /Nenhuma linha válida/);
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
    assert.ok(g.h <= 26 && g.w <= 26, `${tag}: ${g.h}x${g.w}`);
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
  liberar(p, 2);
  const [w1, w2] = p.grade().palavras;
  const s = p.call('cruzHint', { nome: 'Ana', tipo: 'letra', id: w1.id, indice: 0 }).cruz;
  assert.equal(s.usadas, 1);
  assert.deepEqual(s.reveladas, [[...celulas(w1)[0], w1.palavra[0]]]);
  assert.throws(() => p.call('cruzHint', { nome: 'Ana', tipo: 'letra', id: w1.id, indice: 0 }), /já foi revelada/);
  assert.equal(p.call('cruzCheck', { nome: 'Ana', id: w1.id, tentativa: w1.palavra }).cruz.nova!.xp, Math.round(w1.palavra.length * 5));
  p.call('cruzHint', { nome: 'Ana', tipo: 'palavra', id: w2.id });
  assert.throws(() => p.call('cruzHint', { nome: 'Ana', tipo: 'letra', id: w2.id, indice: 0 }), /dicas acabaram/);
  const r = p.call('cruzCheck', { nome: 'Ana', id: w2.id, tentativa: w2.palavra }).cruz;
  assert.equal(r.correta, true);
  assert.equal(r.nova, undefined); // palavra revelada não pontua
  // as dicas são de cada aluno
  assert.equal(p.call('cruzState', { nome: 'Bia' }).cruz.usadas, 0);
});

test('sem dicas (0) o servidor recusa; oculta ou sem grade, recusa tudo', () => {
  const p = planilha();
  liberar(p, 0);
  assert.throws(() => p.call('cruzHint', { nome: 'Ana', tipo: 'palavra', id: 0 }), /desativou as dicas/);
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
  assert.throws(() => (ctx.createRoom as (q: unknown) => unknown)({ tipo: 'cruz', disciplina: 'Química' }), /Escolha a disciplina/);
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
  h = call('cruzTreinoHint', { gid, id: c.id, tipo: 'letra', indice: 1 });
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
  assert.throws(() => call('cruzTreinoNovo', { disciplina: 'Química' }), /assunto/);
  p.sheets.CruzBanco.length = 0;
  assert.throws(() => call('cruzTreinoNovo', { disciplina: 'Banco de Dados' }), /Ainda não há palavras/);
});
