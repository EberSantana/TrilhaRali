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
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => null, setProperty: () => {} }) },
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

test('terminal Linux: oculto por padrão, só o professor libera', () => {
  const { call } = createBackend();
  const room = call({ action: 'createRoom', nome: 'T', modo: 'fixed', missions });
  assert.equal(call({ action: 'join', token: room.token, nome: 'Ana' }).sala.terminal, false);
  assert.match(call({ action: 'setTerminal', token: room.token, adminKey: 'errada', liberado: true }).error, /invalida/);
  assert.equal(call({ action: 'setTerminal', token: room.token, adminKey: room.adminKey, liberado: true }).sala.terminal, true);
  assert.equal(call({ action: 'state', token: room.token, nome: 'Ana' }).sala.terminal, true);
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

test('Rali NFC online: sala por equipes, missões em qualquer ordem, XP e ranking no servidor', () => {
  const { call, sheets } = createBackend();
  assert.match(call({ action: 'createRoom', nome: 'X', tipo: 'rali', missions: [missions[0], missions[0]] }).error, /repetida/);
  const room = call({ action: 'createRoom', nome: 'Rali 1', tipo: 'rali', modo: 'ctf_dynamic', missions });
  assert.equal(room.tipo, 'rali');
  assert.equal(call({ action: 'teacherRoom', token: room.token, adminKey: room.adminKey }).sala.tipo, 'rali');

  const a = call({ action: 'join', token: room.token, nome: 'Equipe Alfa', integrantes: ['Ana', ' ', 'Bia Souza'] });
  assert.equal(a.sala.tipo, 'rali');
  assert.equal(a.equipe.nome, 'Equipe Alfa');
  assert.deepEqual(a.equipe.integrantes, ['Ana', 'Bia Souza']);
  assert.equal(a.missoes.length, 3);
  assert.equal(JSON.stringify(a).includes('DROP TABLE'), false, 'o gabarito não pode vazar para a equipe');
  call({ action: 'join', token: room.token, nome: 'Equipe Beta' });

  // etiqueta fora da sala e sala do tipo errado
  assert.match(call({ action: 'raliTag', token: room.token, nome: 'Equipe Alfa', tag_id: 'zzz' }).error, /nao faz parte/);
  const ctfRoom = call({ action: 'createRoom', nome: 'C', missions });
  call({ action: 'join', token: ctfRoom.token, nome: 'Caio' });
  assert.match(call({ action: 'raliTag', token: ctfRoom.token, nome: 'Caio', tag_id: 't1' }).error, /CTF em ordem/);

  // ordem livre: começa pela t3
  const info = call({ action: 'raliTag', token: room.token, nome: 'Equipe Alfa', tag_id: 'T3' });
  assert.equal(info.missao.pergunta, 'Q3?');
  assert.equal(info.ja_resolvida, false);
  const ok = call({ action: 'raliSubmit', token: room.token, nome: 'equipe alfa', tag_id: 't3', resposta: 'verdadeiro' });
  assert.equal(ok.correto, true);
  assert.equal(ok.premio.xp, 30);
  assert.equal(ok.premio.isFogo, true);
  assert.equal(ok.equipe.acertos, 1);
  assert.equal(ok.missoes.find((m: Json) => m.tag_id === 't3').concluida, true);

  // mesma equipe não captura duas vezes; outra equipe ganha menos (dinâmico) e sem fogo
  assert.match(call({ action: 'raliSubmit', token: room.token, nome: 'Equipe Alfa', tag_id: 't3', resposta: 'Verdadeiro' }).error, /ja resolveu/);
  const b = call({ action: 'raliSubmit', token: room.token, nome: 'Equipe Beta', tag_id: 't3', resposta: 'Verdadeiro' });
  assert.equal(b.premio.posicao, 2);
  assert.equal(b.premio.xp, 27);
  assert.equal(b.premio.isFogo, false);

  // erro conta e aplica o intervalo
  const wrong = call({ action: 'raliSubmit', token: room.token, nome: 'Equipe Beta', tag_id: 't1', resposta: 'x' });
  assert.equal(wrong.correto, false);
  assert.equal(wrong.equipe.erros, 1);
  assert.match(call({ action: 'raliSubmit', token: room.token, nome: 'Equipe Beta', tag_id: 't1', resposta: 'drop' }).error, /Aguarde/);

  const st = call({ action: 'state', token: room.token, nome: 'Equipe Beta' });
  assert.equal(st.ranking[0].nome, 'Equipe Alfa');
  assert.equal(st.ranking[0].fase, 1);
  assert.equal(st.total_equipes, 2);

  // sala encerrada bloqueia envios
  call({ action: 'setStatus', token: room.token, adminKey: room.adminKey, status: 'encerrada' });
  sheets.get('CtfAlunos')![2][10] = 0;
  assert.match(call({ action: 'raliSubmit', token: room.token, nome: 'Equipe Beta', tag_id: 't1', resposta: 'drop' }).error, /encerrada/);
});

test('nomes que começam com = + - @ não viram fórmula na planilha', () => {
  const { call } = createBackend();
  const missions = [{ tag_id: 't1', categoria: 'DQL', pacote: 'P', pergunta: 'Q?', resposta: 'a', alternativas: [], xp: 10 }];
  const room = call({ action: 'createRoom', nome: 'Seg', modo: 'fixed', missions });
  const st = call({ action: 'join', token: room.token, nome: '=HYPERLINK("http://x","clique")' });
  assert.ok(!/^[=+\-@]/.test(st.aluno.nome), st.aluno.nome);
});

test('CTF livre: o aluno escolhe a ordem, ranking por pontos; em ordem e salas antigas seguem fase a fase', () => {
  const { call, sheets } = createBackend();
  assert.match(call({ action: 'createRoom', nome: 'X', ordem: 'livre', missions: [missions[0], missions[0]] }).error, /repetida/);

  const room = call({ action: 'createRoom', nome: 'Livre', ordem: 'livre', modo: 'ctf_dynamic', missions });
  assert.equal(room.tipo, 'ctf');
  assert.equal(room.ordem, 'livre');
  assert.equal(call({ action: 'teacherRoom', token: room.token, adminKey: room.adminKey }).sala.ordem, 'livre');

  const a = call({ action: 'join', token: room.token, nome: 'Ana Lima' });
  assert.equal(a.sala.ordem, 'livre');
  assert.equal(a.aluno.nome, 'Ana Lima');
  assert.equal(a.missoes.length, 3);
  assert.equal(a.missoes[0].xp_atual, 10);
  assert.equal(JSON.stringify(a).includes('DROP TABLE'), false, 'o gabarito não pode vazar');
  assert.equal(JSON.stringify(a).includes('Q1?'), false, 'a pergunta só vem ao abrir o desafio');
  call({ action: 'join', token: room.token, nome: 'Bruno Reis' });

  // o envio por fase não vale numa sala livre
  assert.match(call({ action: 'submit', token: room.token, nome: 'Ana Lima', resposta: 'x' }).error, /livre/);

  // começa pelo último desafio
  const info = call({ action: 'raliTag', token: room.token, nome: 'Ana Lima', tag_id: 't3' });
  assert.equal(info.missao.pergunta, 'Q3?');
  const ok = call({ action: 'raliSubmit', token: room.token, nome: 'Ana Lima', tag_id: 't3', resposta: 'verdadeiro' });
  assert.equal(ok.correto, true);
  assert.equal(ok.premio.isFogo, true);
  assert.equal(ok.aluno.acertos, 1);
  assert.equal(ok.aluno.xp, 30);
  assert.equal(ok.missoes.find((m: Json) => m.tag_id === 't3').concluida, true);
  assert.match(call({ action: 'raliSubmit', token: room.token, nome: 'Ana Lima', tag_id: 't3', resposta: 'Verdadeiro' }).error, /Voce ja resolveu/);

  // o 2º aluno ganha menos nesse desafio e o valor mostrado já cai
  assert.equal(call({ action: 'state', token: room.token, nome: 'Bruno Reis' }).missoes.find((m: Json) => m.tag_id === 't3').xp_atual, 27);
  const b = call({ action: 'raliSubmit', token: room.token, nome: 'Bruno Reis', tag_id: 't3', resposta: 'Verdadeiro' });
  assert.equal(b.premio.xp, 27);

  // ranking por pontos (desempate pelo primeiro a pontuar); o state devolve o ranking do aluno
  const st = call({ action: 'state', token: room.token, nome: 'Bruno Reis' });
  assert.equal(st.ranking[0].nome, 'Ana Lima');
  assert.equal(st.ranking[0].fase, 1);
  assert.equal(st.total_alunos, 2);
  assert.equal(st.aluno.posicao, 2);

  // sala encerrada bloqueia
  call({ action: 'setStatus', token: room.token, adminKey: room.adminKey, status: 'encerrada' });
  sheets.get('CtfAlunos')![2][10] = 0;
  assert.match(call({ action: 'raliSubmit', token: room.token, nome: 'Ana Lima', tag_id: 't1', resposta: 'drop' }).error, /encerrada/);

  // em ordem (e sala criada sem o campo, como as antigas) continuam sequenciais
  const seq = call({ action: 'createRoom', nome: 'Seq', ordem: 'sequencial', missions });
  assert.equal(seq.ordem, 'sequencial');
  const legado = call({ action: 'createRoom', nome: 'Antiga', missions });
  assert.equal(legado.ordem, 'sequencial');
  const s1 = call({ action: 'join', token: legado.token, nome: 'Caio Alves' });
  assert.equal(s1.sala.ordem, 'sequencial');
  assert.equal(s1.missao.fase, 1);
  assert.equal(s1.missoes, undefined);
  assert.match(call({ action: 'raliTag', token: legado.token, nome: 'Caio Alves', tag_id: 't1' }).error, /CTF em ordem/);
});
