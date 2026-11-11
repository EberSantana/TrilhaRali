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
  const call = (body: Json): Json => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(body) } }).content);
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
  assert.match(call({ action: 'bancoList', chave: 'x' }).error, /ainda nao foi configurado/);
  const b = ready();
  assert.match(b.call({ action: 'bancoList', chave: 'errada' }).error, /Chave do banco invalida/);
  assert.match(b.call({ action: 'bancoList' }).error, /Chave do banco invalida/);
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
  assert.match(call({ action: 'bancoDelete', chave, id: 'nao-existe' }).error, /nao encontrada/);
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
  assert.match(call({ action: 'nfcPublish', chave: 'errada', missoes }).error, /Chave do banco invalida/);
  assert.match(call({ action: 'nfcPublish', chave, missoes: [{ tag_id: 'xx', ...exata }] }).error, /Tag invalida/);
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
