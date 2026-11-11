import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { CTF_APPS_SCRIPT } from './ctfAppsScript.ts';

type Json = Record<string, any>;

function createBackend() {
  const sheets = new Map<string, any[][]>();
  const props = new Map<string, string>();
  const makeSheet = (name: string) => {
    const data = sheets.get(name)!;
    return {
      appendRow: (r: unknown[]) => void data.push(r.slice()),
      getDataRange: () => ({ getValues: () => data.map((r) => r.slice()) }),
      getRange: (row: number, col: number) => ({
        setValue: (v: unknown) => {
          while (data.length < row) data.push([]);
          data[row - 1][col - 1] = v;
        },
        setValues: (vals: unknown[][]) =>
          vals.forEach((r, i) => {
            while (data.length < row + i) data.push([]);
            r.forEach((v, j) => (data[row + i - 1][col + j - 1] = v));
          }),
        setNumberFormat: () => {},
      }),
      getLastRow: () => data.length,
      getMaxRows: () => 1000,
      deleteRow: (r: number) => void data.splice(r - 1, 1),
      deleteRows: (start: number, n: number) => void data.splice(start - 1, n),
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
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k: string) => props.get(k) ?? null,
        setProperty: (k: string, v: string) => void props.set(k, v),
      }),
    },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' },
      Charset: { UTF_8: 'utf8' },
      computeDigest: (_alg: string, text: string) =>
        Array.from(createHash('sha256').update(text, 'utf8').digest()).map((b) => (b > 127 ? b - 256 : b)),
      sleep: () => {},
      getUuid: () => 'u-' + Math.random().toString(36).slice(2) + Date.now(),
    },
    Logger: { log: () => {} },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (s: string) => ({ content: s, setMimeType() { return this; } }),
    },
    Date, Math, JSON, Number, String, Error, Array,
  };
  vm.createContext(ctx);
  vm.runInContext(CTF_APPS_SCRIPT, ctx);
  const chaves = new Map<string, string>();
  const call = (body: Json): Json => {
    const id = body.action === 'join' ? `${String(body.token).toUpperCase()}|${String(body.nome).trim().toLowerCase()}` : '';
    if (id && body.chave === undefined && chaves.has(id)) body = { ...body, chave: chaves.get(id) };
    const r = JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(body) } }).content);
    if (id && r.chave) chaves.set(id, r.chave);
    return r;
  };
  return { call, ctx, sheets };
}

const exata = { disciplina: 'Redes de Computadores', assunto: 'Camada de rede', tipo: 'exata', pergunta: 'Qual protocolo traduz nomes em IPs?', resposta: 'DNS', aceitas: ['dns server'], xp: 15 };
const multipla = { disciplina: 'Segurança da Informação', assunto: 'Criptografia', tipo: 'multipla', pergunta: 'Qual destes é um algoritmo simétrico?', resposta: 'AES', opcoes: ['RSA', 'AES', 'ECC'], xp: 20 };

function ready() {
  const b = createBackend();
  const chave = b.ctx.setupBanco();
  return { ...b, chave };
}

test('o banco exige a chave gerada por setupBanco', () => {
  const { call, chave } = createBackend() as any;
  assert.match(call({ action: 'bancoList', chave: 'x' }).error, /ainda não foi configurado/);
  const b = ready();
  assert.match(b.call({ action: 'bancoList', chave: 'errada' }).error, /Chave do banco inválida/);
  assert.match(b.call({ action: 'bancoList' }).error, /Chave do banco inválida/);
  assert.deepEqual(b.call({ action: 'bancoPing', chave: b.chave }), { ok: true });
  assert.equal(b.chave.length, 20);
  void chave;
});

test('salvar, listar, editar e apagar perguntas', () => {
  const { call, chave } = ready();
  const a = call({ action: 'bancoSave', chave, pergunta: exata }).pergunta;
  const m = call({ action: 'bancoSave', chave, pergunta: multipla }).pergunta;
  assert.match(a.id, /^Q[A-Z2-9]{6}$/);
  assert.notEqual(a.id, m.id);
  assert.deepEqual(a.aceitas, ['dns server']);
  assert.deepEqual(m.opcoes, ['RSA', 'AES', 'ECC']);
  assert.equal(m.tipo, 'multipla');

  let list = call({ action: 'bancoList', chave }).perguntas;
  assert.equal(list.length, 2);
  assert.equal(list.find((q: Json) => q.id === a.id).ativo, true);

  const edited = call({ action: 'bancoSave', chave, pergunta: { ...exata, id: a.id, resposta: 'DNS (Domain Name System)', ativo: false } }).pergunta;
  assert.equal(edited.id, a.id);
  list = call({ action: 'bancoList', chave }).perguntas;
  assert.equal(list.length, 2, 'editar não duplica');
  const again = list.find((q: Json) => q.id === a.id);
  assert.equal(again.resposta, 'DNS (Domain Name System)');
  assert.equal(again.ativo, false);

  assert.deepEqual(call({ action: 'bancoDelete', chave, id: a.id }), { ok: true });
  assert.equal(call({ action: 'bancoList', chave }).perguntas.length, 1);
  assert.match(call({ action: 'bancoDelete', chave, id: 'nao-existe' }).error, /não encontrada/);
});

test('valida perguntas inválidas', () => {
  const { call, chave } = ready();
  const err = (p: Json) => call({ action: 'bancoSave', chave, pergunta: { ...exata, ...p } }).error as string;
  assert.match(err({ disciplina: '' }), /disciplina/);
  assert.match(err({ pergunta: 'oi' }), /ao menos 5/);
  assert.match(err({ resposta: '  ' }), /resposta correta/);
  assert.match(err({ tipo: 'multipla', resposta: 'X', opcoes: ['A', 'B'] }), /uma das alternativas/);
  assert.match(err({ tipo: 'multipla', resposta: 'A', opcoes: ['A'] }), /2 a 6/);
  assert.match(err({ tipo: 'multipla', resposta: 'A', opcoes: ['A', 'a ', 'á'] }), /2 a 6/, 'alternativas repetidas contam uma só vez');
  const ok = call({ action: 'bancoSave', chave, pergunta: { ...exata, xp: 999 } }).pergunta;
  assert.equal(ok.xp, 10, 'xp fora da faixa volta ao padrão');
});

test('respostas continuam texto (007, 1.0) e variações iguais ao gabarito são descartadas', () => {
  const { call, chave } = ready();
  const q = call({ action: 'bancoSave', chave, pergunta: { ...exata, resposta: '007', aceitas: ['7', '007', ' 007 '] } }).pergunta;
  assert.equal(q.resposta, '007');
  assert.deepEqual(q.aceitas, ['7']);
});

test('importação aceita as válidas e relata as inválidas', () => {
  const { call, chave } = ready();
  const r = call({ action: 'bancoImport', chave, perguntas: [exata, { ...exata, pergunta: 'x' }, multipla] });
  assert.equal(r.importadas, 2);
  assert.equal(r.erros.length, 1);
  assert.equal(r.erros[0].linha, 2);
  const ids = call({ action: 'bancoList', chave }).perguntas.map((q: Json) => q.id);
  assert.equal(new Set(ids).size, 2, 'ids únicos');
  assert.match(call({ action: 'bancoImport', chave, perguntas: [] }).error, /Nada para importar/);
});

test('CTF com múltipla escolha: o aluno vê as alternativas, nunca o gabarito, e responde pelo texto', () => {
  const { call } = ready();
  const room = call({
    action: 'createRoom', nome: 'Turma', modo: 'fixed',
    missions: [{ tag_id: 'banco_1', categoria: 'Criptografia', pacote: 'Segurança da Informação', pergunta: multipla.pergunta, resposta: 'AES', alternativas: [], xp: 20, opcoes: ['RSA', 'AES', 'ECC'] }],
  });
  const j = call({ action: 'join', token: room.token, nome: 'Caio' });
  assert.deepEqual(j.missao.opcoes, ['RSA', 'AES', 'ECC']);
  assert.equal(j.missao.resposta, undefined);
  const wrong = call({ action: 'submit', token: room.token, nome: 'Caio', resposta: 'RSA' });
  assert.equal(wrong.correto, false);
});

test('CTF com múltipla escolha: acertar pelo texto da alternativa conclui a fase', () => {
  const { call } = ready();
  const room = call({
    action: 'createRoom', nome: 'Turma', modo: 'fixed',
    missions: [{ tag_id: 'banco_1', categoria: 'C', pacote: 'P', pergunta: multipla.pergunta, resposta: 'AES', alternativas: [], xp: 20, opcoes: ['RSA', 'AES', 'ECC'] }],
  });
  call({ action: 'join', token: room.token, nome: 'Dani' });
  const ok = call({ action: 'submit', token: room.token, nome: 'Dani', resposta: 'aes' });
  assert.equal(ok.correto, true);
  assert.equal(ok.aluno.concluido, true);
  assert.equal(ok.aluno.xp, 20);
});

test('salas sem opcoes (antigas) continuam funcionando', () => {
  const { call } = ready();
  const room = call({ action: 'createRoom', nome: 'Velha', modo: 'fixed', missions: [{ tag_id: 't1', categoria: 'DQL', pacote: 'P', pergunta: 'Q1?', resposta: '145', alternativas: [], xp: 10 }] });
  const j = call({ action: 'join', token: room.token, nome: 'Eva' });
  assert.deepEqual(j.missao.opcoes, []);
});

test('publicação NFC: só o professor publica, qualquer celular lê, e vazio restaura o padrão', () => {
  const { call, chave } = ready();
  assert.deepEqual(call({ action: 'nfcSet' }), { somenteBanco: true, missoes: [] });
  const missoes = [{ tag_id: 'tag_01', ...exata }, { tag_id: 'TAG_02', ...multipla }];
  assert.match(call({ action: 'nfcPublish', chave: 'errada', missoes }).error, /Chave do banco inválida/);
  assert.match(call({ action: 'nfcPublish', chave, missoes: [{ tag_id: 'xx', ...exata }] }).error, /Tag inválida/);
  assert.match(call({ action: 'nfcPublish', chave, missoes: [{ tag_id: 'tag_01', ...exata }, { tag_id: 'tag_01', ...exata }] }).error, /repetida/);

  assert.equal(call({ action: 'nfcPublish', chave, missoes, somenteBanco: false }).total, 2);
  const set = call({ action: 'nfcSet' });
  assert.equal(set.somenteBanco, false);
  assert.deepEqual(set.missoes.map((m: Json) => m.tag_id), ['tag_01', 'tag_02']);
  assert.deepEqual(set.missoes[1].opcoes, ['RSA', 'AES', 'ECC']);

  // republicar substitui tudo
  assert.equal(call({ action: 'nfcPublish', chave, missoes: [missoes[0]] }).total, 1);
  assert.equal(call({ action: 'nfcSet' }).missoes.length, 1);
  assert.equal(call({ action: 'nfcPublish', chave, missoes: [] }).total, 0);
  assert.equal(call({ action: 'nfcSet' }).missoes.length, 0);
});

// ---------- Cronômetro e tema ----------

function withClock() {
  const b = ready();
  let now = 1_800_000_000_000;
  b.ctx.Date = Object.assign(function (...a: any[]) { return new (Date as any)(...(a.length ? a : [now])); }, { now: () => now });
  return { ...b, tick: (s: number) => void (now += s * 1000) };
}

const fases = [
  { tag_id: 't1', categoria: 'DDL', pacote: 'P1', pergunta: 'Q1?', resposta: 'A', alternativas: [], xp: 10 },
  { tag_id: 't2', categoria: 'DQL', pacote: 'P1', pergunta: 'Q2?', resposta: 'B', alternativas: [], xp: 10 },
];

test('cronômetro do CTF: duração de 5 a 120 em passos de 5, iniciar, pausar e tempo extra', () => {
  const { call, tick } = withClock();
  const sala = call({ action: 'createRoom', nome: 'S', modo: 'fixed', missions: fases });
  const adm = { token: sala.token, adminKey: sala.adminKey };
  assert.equal(call({ action: 'teacherRoom', ...adm }).sala.timer, null);

  assert.equal(call({ action: 'setTimer', ...adm, op: 'config', minutos: 3 }).sala.timer.duracaoMin, 5);
  assert.equal(call({ action: 'setTimer', ...adm, op: 'config', minutos: 500 }).sala.timer.duracaoMin, 120);
  let t = call({ action: 'setTimer', ...adm, op: 'config', minutos: 12 }).sala.timer;
  assert.deepEqual([t.duracaoMin, t.restanteS, t.rodando, t.esgotado], [10, 600, false, false]);

  t = call({ action: 'setTimer', ...adm, op: 'start' }).sala.timer;
  assert.equal(t.rodando, true);
  tick(90);
  t = call({ action: 'setTimer', ...adm, op: 'pause' }).sala.timer;
  assert.deepEqual([t.restanteS, t.rodando], [510, false]);
  tick(600); // pausado: o tempo não corre
  assert.equal(call({ action: 'teacherRoom', ...adm }).sala.timer.restanteS, 510);
  t = call({ action: 'setTimer', ...adm, op: 'add', minutos: 5 }).sala.timer;
  assert.equal(t.restanteS, 810);
  assert.equal(call({ action: 'setTimer', ...adm, op: 'reset' }).sala.timer.restanteS, 600);
  assert.equal(call({ action: 'setTimer', ...adm, op: 'off' }).sala.timer, null);
  assert.match(call({ action: 'setTimer', token: sala.token, adminKey: 'x', op: 'start' }).error, /Chave de professor inválida/);
});

test('com cronômetro, o CTF só aceita respostas enquanto ele roda e bloqueia ao zerar', () => {
  const { call, tick } = withClock();
  const sala = call({ action: 'createRoom', nome: 'S', modo: 'fixed', missions: fases, minutos: 5 });
  const adm = { token: sala.token, adminKey: sala.adminKey };
  const eu = { token: sala.token, nome: 'Ana' };
  assert.equal(call({ action: 'join', ...eu }).sala.timer.restanteS, 300);
  assert.match(call({ action: 'submit', ...eu, resposta: 'A' }).error, /cronômetro está parado/);

  call({ action: 'setTimer', ...adm, op: 'start' });
  assert.equal(call({ action: 'submit', ...eu, resposta: 'A' }).correto, true);
  tick(301);
  const st = call({ action: 'state', ...eu });
  assert.deepEqual([st.sala.timer.esgotado, st.sala.timer.rodando, st.sala.timer.restanteS], [true, false, 0]);
  assert.match(call({ action: 'submit', ...eu, resposta: 'B' }).error, /Tempo esgotado/);
  assert.match(call({ action: 'setTimer', ...adm, op: 'start' }).error, /tempo acabou/);

  // tempo extra reabre a sala
  assert.equal(call({ action: 'setTimer', ...adm, op: 'add', minutos: 5 }).sala.timer.rodando, true);
  assert.equal(call({ action: 'submit', ...eu, resposta: 'B' }).correto, true);
});

test('sala sem cronômetro continua aceitando respostas como antes', () => {
  const { call } = withClock();
  const sala = call({ action: 'createRoom', nome: 'S', modo: 'fixed', missions: fases });
  const eu = { token: sala.token, nome: 'Ana' };
  call({ action: 'join', ...eu });
  assert.equal(call({ action: 'submit', ...eu, resposta: 'A' }).correto, true);
});

test('cronômetro do Rali NFC e tema: só o professor altera, qualquer aluno lê', () => {
  const { call, chave, tick } = withClock();
  assert.deepEqual(call({ action: 'raliEstado' }).timer, null);
  assert.equal(call({ action: 'raliEstado' }).tema, '');
  assert.match(call({ action: 'raliTimer', chave: 'x', op: 'config', minutos: 60 }).error, /Chave do banco inválida/);
  assert.match(call({ action: 'setTema', chave: 'x', tema: 'claro' }).error, /Chave do banco inválida/);
  assert.match(call({ action: 'raliTimer', chave, op: 'start' }).error, /Defina primeiro a duracao/);

  assert.equal(call({ action: 'raliTimer', chave, op: 'config', minutos: 60 }).timer.restanteS, 3600);
  call({ action: 'raliTimer', chave, op: 'start' });
  tick(600);
  const e = call({ action: 'raliEstado' });
  assert.deepEqual([e.timer.restanteS, e.timer.rodando, typeof e.agora], [3000, true, 'number']);

  // o telão do professor espelha o relógio local (segundos exatos, rodando ou parado)
  let s = call({ action: 'raliTimer', chave, op: 'sync', segundos: 754, minutos: 45, rodando: true }).timer;
  assert.deepEqual([s.duracaoMin, s.restanteS, s.rodando], [45, 754, true]);
  s = call({ action: 'raliTimer', chave, op: 'sync', segundos: 0, minutos: 45, rodando: true }).timer;
  assert.deepEqual([s.restanteS, s.rodando, s.esgotado], [0, false, true]);
  s = call({ action: 'raliTimer', chave, op: 'sync', segundos: 99999, minutos: 120, rodando: false }).timer;
  assert.deepEqual([s.restanteS, s.rodando], [7200, false]);

  assert.equal(call({ action: 'setTema', chave, tema: 'claro' }).tema, 'claro');
  assert.equal(call({ action: 'raliEstado' }).tema, 'claro');
  assert.equal(call({ action: 'setTema', chave, tema: 'qualquer' }).tema, 'claro');
});
