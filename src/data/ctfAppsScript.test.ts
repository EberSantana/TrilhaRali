import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { CTF_APPS_SCRIPT } from './ctfAppsScript.ts';
import { computeXpForPosition } from '../utils/scoring.ts';
import { normalizeAnswer } from '../utils/validation.ts';

type Json = Record<string, any>;

function createBackend() {
  const sheets = new Map<string, any[][]>();
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
    });
    return {
      appendRow: (r: unknown[]) => void data.push(r.slice()),
      getDataRange: () => ({ getValues: () => data.map((r) => r.slice()) }),
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
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (s: string) => ({ content: s, setMimeType() { return this; } }),
    },
    Date,
    Math,
    JSON,
    Number,
    String,
    Error,
  };
  vm.createContext(ctx);
  vm.runInContext(CTF_APPS_SCRIPT, ctx);
  const call = (body: Json): Json =>
    JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(body) } }).content);
  return { call, ctx, sheets };
}

const missions = [
  { tag_id: 't1', categoria: 'DDL', pacote: 'P1', pergunta: 'Q1?', resposta: 'DROP TABLE', alternativas: ['drop'], xp: 10 },
  { tag_id: 't2', categoria: 'DQL', pacote: 'P1', pergunta: 'Q2?', resposta: '145', alternativas: [], xp: 20 },
  { tag_id: 't3', categoria: 'DML', pacote: 'P2', pergunta: 'Q3?', resposta: 'Verdadeiro', alternativas: [], xp: 30 },
];

test('fluxo completo: sala, entrada por token+nome e avanço obrigatório de fase', () => {
  const { call } = createBackend();
  const room = call({ action: 'createRoom', nome: 'Turma A', modo: 'fixed', missions });
  assert.match(room.token, /^[A-Z][A-Z2-9]{5}$/);
  assert.equal(room.total, 3);

  assert.match(call({ action: 'join', token: 'ZZZZZZ', nome: 'Ana' }).error, /Sala nao encontrada/);
  assert.match(call({ action: 'join', token: room.token, nome: 'A' }).error, /minimo 2/);

  const joined = call({ action: 'join', token: room.token.toLowerCase(), nome: '  Ana  Souza ' });
  assert.equal(joined.aluno.nome, 'Ana Souza');
  assert.equal(joined.aluno.fase, 1);
  assert.equal(joined.missao.pergunta, 'Q1?');
  assert.equal(JSON.stringify(joined).includes('DROP TABLE'), false, 'o gabarito não pode vazar para o aluno');

  // Errar não avança, conta erro e ativa o intervalo anti-força-bruta
  const wrong = call({ action: 'submit', token: room.token, nome: 'Ana Souza', resposta: 'delete' });
  assert.equal(wrong.correto, false);
  assert.equal(wrong.aluno.fase, 1);
  assert.equal(wrong.aluno.erros, 1);
  assert.match(call({ action: 'submit', token: room.token, nome: 'Ana Souza', resposta: 'drop table' }).error, /Aguarde/);
});

test('acertar libera só a próxima fase; ao final o aluno conclui', async () => {
  const { call, sheets } = createBackend();
  const room = call({ action: 'createRoom', nome: 'T', modo: 'fixed', missions });
  call({ action: 'join', token: room.token, nome: 'Bia' });

  const r1 = call({ action: 'submit', token: room.token, nome: 'bia', resposta: 'DROP TABLE;' });
  assert.equal(r1.correto, true);
  assert.equal(r1.aluno.fase, 2);
  assert.equal(r1.missao.pergunta, 'Q2?');
  assert.equal(r1.aluno.xp, 10);

  // A resposta da fase 1 não vale na fase 2
  assert.equal(call({ action: 'submit', token: room.token, nome: 'Bia', resposta: 'drop' }).correto, false);
  sheets.get('CtfAlunos')![1][10] = 0; // zera o intervalo de erro para o teste

  const r2 = call({ action: 'submit', token: room.token, nome: 'Bia', resposta: '145' });
  assert.equal(r2.aluno.fase, 3);
  const r3 = call({ action: 'submit', token: room.token, nome: 'Bia', resposta: 'verdadeiro' });
  assert.equal(r3.aluno.concluido, true);
  assert.equal(r3.missao, null);
  assert.equal(r3.aluno.xp, 60);
  assert.match(call({ action: 'submit', token: room.token, nome: 'Bia', resposta: 'x' }).error, /concluiu/);
});

test('CTF dinâmico: 🔥 para o 1º a capturar e decaimento igual ao do app', () => {
  const { call, ctx } = createBackend();
  const room = call({ action: 'createRoom', nome: 'T', modo: 'ctf_dynamic', missions });
  for (const n of ['Ana', 'Bia', 'Caio']) call({ action: 'join', token: room.token, nome: n });

  const a = call({ action: 'submit', token: room.token, nome: 'Ana', resposta: 'drop table' });
  assert.deepEqual([a.premio.posicao, a.premio.xp, a.premio.isFogo], [1, 10, true]);
  assert.equal(a.aluno.fogos, 1);

  const preview = call({ action: 'state', token: room.token, nome: 'Bia' });
  assert.equal(preview.missao.capturas_anteriores, 1);
  assert.equal(preview.missao.xp_atual, 9);

  const b = call({ action: 'submit', token: room.token, nome: 'Bia', resposta: 'drop table' });
  assert.deepEqual([b.premio.posicao, b.premio.xp, b.premio.isFogo], [2, 9, false]);

  // Fórmula do servidor idêntica à do app para várias bases e posições
  for (const base of [10, 20, 30, 40, 50, 100]) {
    for (let pos = 1; pos <= 40; pos++) {
      assert.equal(ctx.pontos(base, pos, 'ctf_dynamic'), computeXpForPosition(base, pos, 'ctf_dynamic'), `${base}/${pos}`);
    }
  }
  // Normalização do servidor idêntica à do app
  for (const s of ['  DROP TABLE; ', '"WHERE"', 'Chave Primária', 'pragma   foreign_keys = on;']) {
    assert.equal(ctx.norm(s), normalizeAnswer(s));
  }
});

test('download do banco: oculto por padrão, só o professor libera e esconde', () => {
  const { call } = createBackend();
  const room = call({ action: 'createRoom', nome: 'T', modo: 'fixed', missions });
  assert.equal(call({ action: 'join', token: room.token, nome: 'Ana' }).sala.banco, false);

  assert.match(call({ action: 'setBanco', token: room.token, adminKey: 'errada', liberado: true }).error, /invalida/);
  assert.equal(call({ action: 'state', token: room.token, nome: 'Ana' }).sala.banco, false);

  assert.equal(call({ action: 'setBanco', token: room.token, adminKey: room.adminKey, liberado: true }).sala.banco, true);
  assert.equal(call({ action: 'state', token: room.token, nome: 'Ana' }).sala.banco, true);
  assert.equal(call({ action: 'setBanco', token: room.token, adminKey: room.adminKey, liberado: false }).sala.banco, false);

  const aberta = call({ action: 'createRoom', nome: 'T2', modo: 'fixed', missions, bancoLiberado: true });
  assert.equal(call({ action: 'join', token: aberta.token, nome: 'Bia' }).sala.banco, true);
});

test('ranking, painel do professor, chave de admin e sala encerrada', () => {
  const { call } = createBackend();
  const room = call({ action: 'createRoom', nome: 'T', modo: 'fixed', missions });
  call({ action: 'join', token: room.token, nome: 'Ana' });
  call({ action: 'join', token: room.token, nome: 'Bia' });
  call({ action: 'submit', token: room.token, nome: 'Bia', resposta: 'drop table' });

  const st = call({ action: 'state', token: room.token, nome: 'Ana' });
  assert.deepEqual(st.ranking.map((r: Json) => r.nome), ['Bia', 'Ana']);
  assert.equal(st.aluno.posicao, 2);

  assert.match(call({ action: 'teacherRoom', token: room.token, adminKey: 'errada' }).error, /invalida/);
  const view = call({ action: 'teacherRoom', token: room.token, adminKey: room.adminKey });
  assert.equal(view.alunos.length, 2);
  assert.equal(view.alunos[0].nome, 'Bia');
  assert.equal(JSON.stringify(view).includes('admin_key'), false);

  assert.match(call({ action: 'setStatus', token: room.token, adminKey: 'x', status: 'encerrada' }).error, /invalida/);
  assert.equal(call({ action: 'setStatus', token: room.token, adminKey: room.adminKey, status: 'encerrada' }).sala.status, 'encerrada');
  assert.match(call({ action: 'submit', token: room.token, nome: 'Ana', resposta: 'drop table' }).error, /encerrada/);
  assert.match(call({ action: 'join', token: room.token, nome: 'Novo Aluno' }).error, /encerrada/);
  // quem já estava na sala ainda consegue ver o estado/ranking
  assert.equal(call({ action: 'join', token: room.token, nome: 'Ana' }).sala.status, 'encerrada');
});
