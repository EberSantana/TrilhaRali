import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { CTF_APPS_SCRIPT } from './ctfAppsScript.ts';
import { gabaritoAberto } from '../utils/gabaritoTeste';

type Json = Record<string, any>;

function createBackend() {
  const sheets = new Map<string, any[][]>();
  const leituras = { n: 0 };
  const makeSheet = (name: string) => {
    const data = sheets.get(name)!;
    const range = (row: number, col: number, nr = 1, nc = 1) => ({
      setValue: (v: unknown) => {
        while (data.length < row) data.push([]);
        data[row - 1][col - 1] = v;
      },
      setValues: (vals: unknown[][]) => {
        vals.forEach((r, i) => {
          while (data.length < row + i) data.push([]);
          r.forEach((v, j) => (data[row + i - 1][col + j - 1] = v));
        });
      },
      setNumberFormat: () => {},
      getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => (data[row - 1 + i] || [])[col - 1 + j] ?? '')),
    });
    return {
      appendRow: (r: unknown[]) => void data.push(r.slice()),
      deleteRow: (row: number) => void data.splice(row - 1, 1),
      getDataRange: () => ({ getValues: () => { leituras.n++; return data.map((r) => r.slice()); } }),
      getRange: range,
      getLastRow: () => data.length,
      getMaxRows: () => 1000,
    };
  };
  const ctx: Json = {
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (n: string) => (sheets.has(n) ? makeSheet(n) : null),
        insertSheet: (n: string) => {
          sheets.set(n, []);
          return makeSheet(n);
        },
      }),
    },
    CacheService: (() => { const m = new Map<string, string>(); const c = { get: (k: string) => m.get(k) ?? null, put: (k: string, v: string) => void m.set(k, v), remove: (k: string) => void m.delete(k) }; return { getScriptCache: () => c }; })(),
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => null, setProperty: () => {} }) },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (s: string) => ({ content: s, setMimeType() { return this; } }),
    },
    Utilities: { getUuid: () => 'u-' + Math.random().toString(36).slice(2) + Date.now() },
    Date,
    Math,
    JSON,
    Number,
    String,
    Error,
  };
  vm.createContext(ctx);
  vm.runInContext(CTF_APPS_SCRIPT, ctx);
  ctx.requireBancoKey = (req: Json) => { if (req.chave !== 'chave-banco') throw Object.assign(new Error('Chave do banco inválida.'), { userMessage: true }); };
  // simula o aparelho do aluno: guarda a chave devolvida no join e a reenvia nas entradas seguintes
  const chaves = new Map<string, string>();
  const call = (body: Json): Json => {
    const id = body.action === 'join' ? `${String(body.token).toUpperCase()}|${String(body.nome).trim().toLowerCase()}` : '';
    if (id && body.chave === undefined && chaves.has(id)) body = { ...body, chave: chaves.get(id) };
    const r = JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(body) } }).content);
    if (id && r.chave) chaves.set(id, r.chave);
    return r;
  };
  return { call, ctx, sheets, leituras };
}


const K = { chave: 'chave-banco' };
const missions = [{ tag_id: 't1', categoria: 'DQL', pacote: 'P', pergunta: 'Q1?', resposta: '8', alternativas: [], xp: 10 }];

function comTurma() {
  const b = createBackend();
  const t = b.call({ action: 'turmaSalvar', ...K, nome: '2º B', alunos: [{ m: '2024001', n: 'Ana Souza' }, { m: '2024002', n: 'Bruno Lima' }, { m: '2024003', n: 'Carla Dias' }, { m: '', n: 'ana souza' }] });
  return { ...b, turma: t };
}

test('cadastro da turma: só com a chave do banco, sem nomes repetidos', () => {
  const b = comTurma();
  assert.equal(b.turma.alunos.length, 3);
  assert.match(b.call({ action: 'turmasList', chave: 'x' }).error, /Chave do banco/);
  assert.equal(b.call({ action: 'turmasList', ...K }).turmas[0].nome, '2º B');
});

test('sala ligada à turma: o aluno escolhe o nome da lista (sem matrícula) e nome de fora é recusado', () => {
  const b = comTurma();
  const sala = b.call({ action: 'createRoom', nome: 'CTF', missions, modo: 'fixed', turma: b.turma.id });
  const lista = b.call({ action: 'salaTurma', token: sala.token });
  assert.deepEqual(lista.turma.alunos, ['Ana Souza', 'Bruno Lima', 'Carla Dias']);
  assert.ok(!JSON.stringify(lista).includes('2024001'));
  assert.match(b.call({ action: 'join', token: sala.token, nome: 'Fulano' }).error, /lista da turma/);
  const ok = b.call({ action: 'join', token: sala.token, nome: 'ana   SOUZA' });
  assert.ok(!ok.error, ok.error);
  // sala sem turma continua aceitando qualquer nome
  const livre = b.call({ action: 'createRoom', nome: 'Livre', missions, modo: 'fixed' });
  assert.equal(b.call({ action: 'salaTurma', token: livre.token }).turma, null);
  assert.ok(!b.call({ action: 'join', token: livre.token, nome: 'Qualquer Nome' }).error);
});

test('notas da turma somam CTF, Rali NFC (cada integrante) e Desvendando (cada integrante da dupla)', () => {
  const b = comTurma();
  const ctf = b.call({ action: 'createRoom', nome: 'CTF', missions, modo: 'fixed', turma: b.turma.id });
  b.call({ action: 'join', token: ctf.token, nome: 'Ana Souza' });
  const r1 = b.call({ action: 'submit', token: ctf.token, nome: 'Ana Souza', resposta: '8' });
  assert.ok(!r1.error, r1.error);
  const rali = b.call({ action: 'createRoom', tipo: 'rali', nome: 'Rali', missions, modo: 'fixed', turma: b.turma.id });
  const eq = b.call({ action: 'join', token: rali.token, nome: 'Os Joins', integrantes: ['bruno lima', 'Carla Dias'] });
  assert.ok(!eq.error, eq.error);
  assert.match(b.call({ action: 'join', token: rali.token, nome: 'Outra', integrantes: ['Zé'] }).error, /lista da turma/);
  const r2 = b.call({ action: 'raliSubmit', token: rali.token, nome: 'Os Joins', tag_id: 't1', resposta: '8' });
  assert.ok(!r2.error, r2.error);
  // Desvendando: gabarito na aba DesvGabarito
  const desv = gabaritoAberto().desv!;
  b.sheets.set('DesvGabarito', [['caso', 'suspeito', 'pontos', 'explicacao'], ...Object.entries(desv).map(([c, g]) => [c, g.suspeito, g.pontos, g.explicacao])]);
  const ds = b.call({ action: 'createDesvRoom', nome: 'Desv', casos: ['c1'], turma: b.turma.id });
  assert.match(b.call({ action: 'desvEntrar', token: ds.token, gid: 'aparelho_dupla_x1', nome: 'Dupla', integrantes: ['Zé'] }).error, /lista da turma/);
  assert.ok(!b.call({ action: 'desvEntrar', token: ds.token, gid: 'aparelho_dupla_x1', nome: 'Dupla', integrantes: ['Ana Souza', 'Carla Dias'] }).error);
  assert.equal(b.call({ action: 'desvAcusar', token: ds.token, gid: 'aparelho_dupla_x1', caso: 'c1', suspeito: desv.c1.suspeito }).pontos, desv.c1.pontos);

  const n = b.call({ action: 'turmaNotas', ...K, id: b.turma.id });
  const por = Object.fromEntries(n.alunos.map((a: Json) => [a.n, a]));
  assert.equal(n.salas, 3);
  assert.deepEqual([por['Ana Souza'].ctf, por['Ana Souza'].desv, por['Ana Souza'].total], [10, desv.c1.pontos, 10 + desv.c1.pontos]);
  assert.equal(por['Bruno Lima'].rali, por['Carla Dias'].rali);
  assert.ok(por['Bruno Lima'].rali > 0);
  assert.equal(por['Carla Dias'].total, por['Carla Dias'].rali + desv.c1.pontos);
  assert.equal(por['Ana Souza'].m, '2024001');
});

test('nomes já usados: aparecem ocupados, outro celular é recusado e o professor libera', () => {
  const b = comTurma();
  const sala = b.call({ action: 'createRoom', nome: 'CTF', missions, modo: 'fixed', turma: b.turma.id });
  b.call({ action: 'join', token: sala.token, nome: 'Ana Souza' });
  assert.deepEqual(b.call({ action: 'salaTurma', token: sala.token }).turma.ocupados, ['Ana Souza']);
  assert.match(b.call({ action: 'join', token: sala.token, nome: 'Ana Souza', chave: 'outro-celular' }).error, /retomar/);
  assert.match(b.call({ action: 'liberarNome', token: sala.token, adminKey: 'errada', nome: 'Ana Souza' }).error, /inválida/);
  assert.ok(b.call({ action: 'liberarNome', token: sala.token, adminKey: sala.adminKey, nome: 'Ana Souza' }).ok);
  const novo = b.call({ action: 'join', token: sala.token, nome: 'Ana Souza', chave: 'outro-celular' });
  assert.ok(!novo.error, novo.error);

  const rali = b.call({ action: 'createRoom', tipo: 'rali', nome: 'Rali', missions, modo: 'fixed', turma: b.turma.id });
  b.call({ action: 'join', token: rali.token, nome: 'Os Joins', integrantes: ['Bruno Lima'] });
  assert.match(b.call({ action: 'join', token: rali.token, nome: 'Outra', integrantes: ['bruno lima', 'Carla Dias'] }).error, /já está na equipe Os Joins/);
});

test('Desvendando: piloto e copiloto na ordem, mesma dupla em outro celular mantém os pontos', () => {
  const b = comTurma();
  const desv = gabaritoAberto().desv!;
  b.sheets.set('DesvGabarito', [['caso', 'suspeito', 'pontos', 'explicacao'], ...Object.entries(desv).map(([c, g]) => [c, g.suspeito, g.pontos, g.explicacao])]);
  const ds = b.call({ action: 'createDesvRoom', nome: 'Desv', casos: ['c1'], turma: b.turma.id });
  const e1 = b.call({ action: 'desvEntrar', token: ds.token, gid: 'aparelho_dupla_a1', nome: 'Dupla', integrantes: ['Carla Dias', 'Ana Souza'] });
  assert.equal(e1.dupla.integrantes, 'Carla Dias, Ana Souza');
  assert.match(b.call({ action: 'desvEntrar', token: ds.token, gid: 'aparelho_dupla_b1', nome: 'Dupla B', integrantes: ['Ana Souza', 'Ana Souza'] }).error, /duas vezes/);
  b.call({ action: 'desvAcusar', token: ds.token, gid: 'aparelho_dupla_a1', caso: 'c1', suspeito: desv.c1.suspeito });
  assert.deepEqual(b.call({ action: 'salaTurma', token: ds.token, gid: 'aparelho_dupla_b1' }).turma.ocupados, ['Carla Dias', 'Ana Souza']);
  assert.match(b.call({ action: 'desvEntrar', token: ds.token, gid: 'aparelho_dupla_b1', nome: 'Dupla B', integrantes: ['Bruno Lima', 'Ana Souza'] }).error, /já está na dupla/);
  const troca = b.call({ action: 'desvEntrar', token: ds.token, gid: 'aparelho_dupla_b1', nome: 'Dupla', integrantes: ['Ana Souza', 'Carla Dias'] });
  assert.ok(!troca.error, troca.error);
  assert.equal(troca.resolvidos.c1, desv.c1.pontos);
  assert.equal(troca.dupla.integrantes, 'Ana Souza, Carla Dias');
});

test('papéis: o professor escolhe o modo; CTF em dupla credita o copiloto nas notas', () => {
  const b = comTurma();
  const ctf = b.call({ action: 'createRoom', nome: 'CTF dupla', missions, modo: 'fixed', turma: b.turma.id, papeis: 'fixos' });
  assert.equal(b.call({ action: 'salaTurma', token: ctf.token }).papeis, 'fixos');
  const st = b.call({ action: 'join', token: ctf.token, nome: 'Ana Souza', integrantes: ['Bruno Lima'] });
  assert.deepEqual(st.aluno.integrantes, ['Bruno Lima']);
  assert.equal(st.sala.papeis, 'fixos');
  assert.match(b.call({ action: 'join', token: ctf.token, nome: 'Bruno Lima', integrantes: ['Carla Dias'] }).error, /já está na dupla/);
  b.call({ action: 'submit', token: ctf.token, nome: 'Ana Souza', resposta: '8' });
  const n = b.call({ action: 'turmaNotas', ...K, id: b.turma.id });
  const por = Object.fromEntries(n.alunos.map((a: Json) => [a.n, a]));
  assert.equal(por['Ana Souza'].ctf, 10);
  assert.equal(por['Bruno Lima'].ctf, 10);
  // CTF sem papéis continua individual; Desvendando começa em rodízio
  const solo = b.call({ action: 'createRoom', nome: 'CTF', missions, modo: 'fixed' });
  assert.equal(b.call({ action: 'join', token: solo.token, nome: 'Zé Silva' }).sala.papeis, '');
  b.sheets.set('DesvGabarito', [['caso', 'suspeito', 'pontos', 'explicacao'], ['c1', 'x', 10, '']]);
  const ds = b.call({ action: 'createDesvRoom', nome: 'Desv', casos: ['c1'] });
  assert.equal(b.call({ action: 'desvEntrar', token: ds.token, gid: 'aparelho_dupla_z1', nome: 'Dupla Z', integrantes: 'A e B' }).sala.papeis, 'rodizio');
  const dd = b.call({ action: 'createDesvRoom', nome: 'Desv2', casos: ['c1'], papeis: 'dupla' });
  assert.equal(b.call({ action: 'desvEntrar', token: dd.token, gid: 'aparelho_dupla_z2', nome: 'Dupla Z', integrantes: 'A e B' }).sala.papeis, 'dupla');
});

test('avatar: capacete escolhido vai para o ranking; só ids conhecidos; Desvendando individual aceita um nome só', () => {
  const b = comTurma();
  const ctf = b.call({ action: 'createRoom', nome: 'CTF', missions, modo: 'fixed', turma: b.turma.id, papeis: 'individual' });
  assert.equal(b.call({ action: 'salaTurma', token: ctf.token }).papeis, '', 'individual só existe no Desvendando');
  const st = b.call({ action: 'join', token: ctf.token, nome: 'Ana Souza', avatar: 'rubi' });
  assert.equal(st.aluno.avatar, 'rubi');
  b.call({ action: 'join', token: ctf.token, nome: 'Bruno Lima', avatar: '<script>' });
  const rk = b.call({ action: 'join', token: ctf.token, nome: 'Ana Souza', chave: st.chave, avatar: 'oceano' }).ranking;
  assert.equal(rk.find((r: Json) => r.nome === 'Ana Souza').avatar, 'oceano');
  assert.equal(rk.find((r: Json) => r.nome === 'Bruno Lima').avatar, '');

  b.sheets.set('DesvGabarito', [['caso', 'suspeito', 'pontos', 'explicacao'], ['c1', 'x', 10, '']]);
  const ds = b.call({ action: 'createDesvRoom', nome: 'Desv', casos: ['c1'], turma: b.turma.id, papeis: 'individual' });
  assert.equal(b.call({ action: 'salaTurma', token: ds.token }).papeis, 'individual');
  assert.match(b.call({ action: 'desvEntrar', token: ds.token, gid: 'aparelho_solo_1', nome: 'X', integrantes: ['Ana Souza', 'Bruno Lima'] }).error, /seu nome/);
  const e = b.call({ action: 'desvEntrar', token: ds.token, gid: 'aparelho_solo_1', nome: 'Ana Souza', integrantes: ['Ana Souza'], avatar: 'sol' });
  assert.equal(e.dupla.integrantes, 'Ana Souza');
  assert.equal(e.dupla.avatar, 'sol');
});

test('retomar: aluno que perdeu o navegador volta ao mesmo progresso com "retomar"; sem isso continua bloqueado', () => {
  const b = comTurma();
  const ctf = b.call({ action: 'createRoom', nome: 'CTF', missions, modo: 'fixed', turma: b.turma.id });
  const a = b.call({ action: 'join', token: ctf.token, nome: 'Ana Souza', avatar: 'rubi' });
  b.call({ action: 'submit', token: ctf.token, nome: 'Ana Souza', resposta: '8' });
  const rec = b.call({ action: 'join', token: ctf.token, nome: 'Ana Souza', chave: 'outro-navegador' }); assert.match(rec.error, /Sou eu, retomar/);
  const volta = b.call({ action: 'join', token: ctf.token, nome: 'Ana Souza', retomar: true });
  assert.ok(!volta.error, volta.error);
  assert.equal(volta.chave, a.chave, 'o aparelho antigo continua valendo');
  assert.equal(volta.aluno.xp, 10);
  const livre = b.call({ action: 'createRoom', nome: 'CTF livre', missions, modo: 'fixed' });
  b.call({ action: 'join', token: livre.token, nome: 'Zé Silva' });
  assert.match(b.call({ action: 'join', token: livre.token, nome: 'Zé Silva', chave: 'outro', retomar: true }).error, /outro|Já existe/, 'sem turma não retoma por nome');
});

test('análise da turma: participação, perguntas difíceis (com tentativas erradas), assuntos e casos', () => {
  const b = comTurma();
  const miss2 = [...missions, { tag_id: 't2', categoria: 'DDL', pacote: 'Modelagem', pergunta: 'Q2?', resposta: 'pk', alternativas: [], xp: 10 }];
  const ctf = b.call({ action: 'createRoom', nome: 'CTF', missions: miss2, modo: 'fixed', turma: b.turma.id, ordem: 'livre' });
  b.call({ action: 'join', token: ctf.token, nome: 'Ana Souza' });
  b.call({ action: 'join', token: ctf.token, nome: 'Bruno Lima' });
  b.ctx.ERROR_COOLDOWN_MS = 0;
  b.call({ action: 'raliSubmit', token: ctf.token, nome: 'Ana Souza', tag_id: 't2', resposta: 'errado' });
  b.call({ action: 'raliSubmit', token: ctf.token, nome: 'Bruno Lima', tag_id: 't2', resposta: 'errado' });
  b.call({ action: 'raliSubmit', token: ctf.token, nome: 'Ana Souza', tag_id: 't1', resposta: '8' });
  b.call({ action: 'raliSubmit', token: ctf.token, nome: 'Bruno Lima', tag_id: 't1', resposta: '8' });
  const a = b.call({ action: 'turmaAnalise', ...K, id: b.turma.id });
  assert.ok(!a.error, a.error);
  assert.equal(a.turma.alunos, 3);
  const por = Object.fromEntries(a.alunos.map((x: Json) => [x.n, x]));
  assert.equal(por['Ana Souza'].salas, 1);
  assert.equal(por['Carla Dias'].salas, 0);
  assert.deepEqual([por['Ana Souza'].acertos, por['Ana Souza'].erros], [1, 1]);
  const t2 = a.perguntas.find((p: Json) => p.tag_id === 't2');
  assert.deepEqual([t2.participantes, t2.acertos, t2.erros], [2, 0, 2]);
  assert.equal(a.assuntos.find((x: Json) => x.assunto === 'Modelagem').acertos, 0);
  assert.match(b.call({ action: 'turmaAnalise', chave: 'x', id: b.turma.id }).error, /Chave do banco/);
});

test('apagar de vez: Desvendando e CTF aberto somem do servidor e não voltam na lista', () => {
  const b = comTurma();
  const desv = gabaritoAberto().desv!;
  b.sheets.set('DesvGabarito', [['caso', 'suspeito', 'pontos', 'explicacao'], ...Object.entries(desv).map(([c, g]) => [c, g.suspeito, g.pontos, g.explicacao])]);
  const ds = b.call({ action: 'createDesvRoom', nome: 'Desv', casos: ['c1'] });
  b.call({ action: 'desvEntrar', token: ds.token, gid: 'aparelho_dupla_a1', nome: 'Dupla A', integrantes: 'Ana' });
  assert.match(b.call({ action: 'desvApagar', token: ds.token, adminKey: 'errada' }).error, /inválida/);
  assert.ok(b.call({ action: 'desvApagar', token: ds.token, adminKey: ds.adminKey }).ok);
  assert.equal(b.call({ action: 'desvSalasList', ...K }).salas.filter((x: Json) => x.token === ds.token).length, 0);

  const sala = b.call({ action: 'createRoom', nome: 'CTF', missions, modo: 'fixed' });
  assert.match(b.call({ action: 'deleteRoom', token: sala.token, adminKey: sala.adminKey }).error, /Encerre/);
  assert.ok(b.call({ action: 'deleteRoom', token: sala.token, adminKey: sala.adminKey, encerrar: true }).ok);
  assert.equal(b.call({ action: 'salasList', ...K }).salas.filter((x: Json) => x.token === sala.token).length, 0);
});
