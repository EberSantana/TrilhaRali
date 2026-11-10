/**
 * Backend do módulo CTF (Google Apps Script).
 * É um projeto SEPARADO do script do Rali NFC: cole em uma planilha à parte e publique como Web App
 * (Executar como: você • Quem tem acesso: Qualquer pessoa).
 *
 * As respostas ficam apenas na planilha: o aluno recebe somente a pergunta da fase atual e a
 * validação (e o avanço de fase) acontece no servidor.
 */
export const CTF_APPS_SCRIPT = String.raw`// ==========================================================
// RALI SQL - MODULO CTF (IFS CAMPUS TOBIAS BARRETO)
// Cole em: Extensoes > Apps Script de uma planilha NOVA.
// Implantar > Nova implantacao > Aplicativo da Web
//   Executar como: Eu  |  Quem pode acessar: Qualquer pessoa
// ==========================================================

var SHEET_HEADERS = {
  CtfSalas: ['token', 'nome', 'admin_key', 'status', 'modo', 'criada_em', 'total_fases'],
  CtfMissoes: ['token', 'fase', 'tag_id', 'categoria', 'pacote', 'pergunta', 'resposta', 'alternativas', 'xp'],
  CtfAlunos: ['token', 'nome', 'nome_key', 'fase_atual', 'xp', 'acertos', 'erros', 'fogos', 'entrou_em', 'ultimo_acerto', 'ultimo_erro'],
  CtfCapturas: ['token', 'tag_id', 'nome', 'posicao', 'xp', 'is_fogo', 'timestamp']
};
var TOKEN_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
var TOKEN_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
var WRITE_ACTIONS = { createRoom: 1, join: 1, submit: 1, setStatus: 1 };
var ERROR_COOLDOWN_MS = 3000;

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function fail(msg) {
  var e = new Error(msg);
  e.userMessage = true;
  throw e;
}

function doGet(e) {
  return out({ ok: true, servico: 'Rali SQL CTF', versao: 1 });
}

function doPost(e) {
  var req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return out({ error: 'Requisicao invalida.' });
  }
  var lock = null;
  try {
    if (WRITE_ACTIONS[req.action]) {
      lock = LockService.getScriptLock();
      lock.waitLock(25000);
    }
    return out(route(req));
  } catch (err) {
    return out({ error: err && err.userMessage ? err.message : 'Erro no servidor: ' + err });
  } finally {
    if (lock) lock.releaseLock();
  }
}

function route(req) {
  switch (req.action) {
    case 'ping': return { ok: true };
    case 'createRoom': return createRoom(req);
    case 'join': return join(req);
    case 'state': return stateFor(req);
    case 'submit': return submit(req);
    case 'teacherRoom': return teacherRoom(req);
    case 'setStatus': return setStatus(req);
    default: fail('Acao desconhecida.');
  }
}

// ---------- Utilitarios de planilha ----------

function getSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(SHEET_HEADERS[name]);
    if (name === 'CtfMissoes') {
      // Evita que respostas como "007" ou "1.0" virem numeros
      sh.getRange(1, 1, sh.getMaxRows(), SHEET_HEADERS[name].length).setNumberFormat('@');
    }
  }
  return sh;
}

function readRows(name) {
  var values = getSheet(name).getDataRange().getValues();
  var head = values[0];
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var o = { _row: i + 1 };
    for (var j = 0; j < head.length; j++) o[head[j]] = values[i][j];
    rows.push(o);
  }
  return rows;
}

function appendObj(name, obj) {
  var head = SHEET_HEADERS[name];
  getSheet(name).appendRow(head.map(function (k) { return obj[k] === undefined ? '' : obj[k]; }));
}

function updateRow(name, row, obj) {
  var head = SHEET_HEADERS[name];
  var sh = getSheet(name);
  for (var k in obj) {
    var idx = head.indexOf(k);
    if (idx >= 0) sh.getRange(row, idx + 1).setValue(obj[k]);
  }
}

// ---------- Regras ----------

function norm(s) {
  return String(s === undefined || s === null ? '' : s)
    .toLowerCase()
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/;+$/, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Mesma regra do app: 10% do XP base por posicao, piso de 40% (minimo 3, nunca acima do base)
function pontos(xpBase, posicao, modo) {
  if (modo !== 'ctf_dynamic') return xpBase;
  var decaimento = Math.max(1, Math.round(xpBase * 0.1));
  var piso = Math.min(xpBase, Math.max(3, Math.round(xpBase * 0.4)));
  return Math.max(piso, xpBase - (Math.max(1, posicao) - 1) * decaimento);
}

function randomFrom(chars, n) {
  var s = '';
  for (var i = 0; i < n; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

function genToken() {
  // Comeca com letra para o Sheets nunca interpretar o token como numero
  return randomFrom(TOKEN_LETTERS, 1) + randomFrom(TOKEN_CHARS, 5);
}

function findRoom(token) {
  var t = String(token || '').trim().toUpperCase();
  var rooms = readRows('CtfSalas');
  for (var i = 0; i < rooms.length; i++) {
    if (String(rooms[i].token) === t) return rooms[i];
  }
  return null;
}

function requireRoom(token) {
  var room = findRoom(token);
  if (!room) fail('Sala nao encontrada. Confira o token.');
  room.token = String(room.token);
  return room;
}

function roomInfo(room) {
  return {
    token: room.token,
    nome: room.nome,
    status: room.status,
    modo: room.modo,
    total: Number(room.total_fases)
  };
}

function cleanName(nome) {
  var n = String(nome || '').replace(/\s+/g, ' ').trim();
  if (n.length < 2) fail('Digite seu nome (minimo 2 letras).');
  if (n.length > 40) fail('Nome muito longo (maximo 40 caracteres).');
  return n;
}

function playersOf(token) {
  return readRows('CtfAlunos').filter(function (a) { return String(a.token) === token; });
}

function rankPlayers(list) {
  return list.slice().sort(function (a, b) {
    return Number(b.xp) - Number(a.xp) ||
      Number(b.fase_atual) - Number(a.fase_atual) ||
      (Number(a.ultimo_acerto) || Infinity) - (Number(b.ultimo_acerto) || Infinity);
  });
}

function missionRow(token, fase) {
  var rows = readRows('CtfMissoes');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].token) === token && Number(rows[i].fase) === fase) return rows[i];
  }
  return null;
}

function buildState(room, nomeKey) {
  var total = Number(room.total_fases);
  var players = playersOf(room.token);
  var ranked = rankPlayers(players);
  var me = null;
  var pos = 0;
  for (var i = 0; i < ranked.length; i++) {
    if (ranked[i].nome_key === nomeKey) { me = ranked[i]; pos = i + 1; break; }
  }
  if (!me) fail('Aluno nao encontrado nesta sala. Entre novamente.');

  var fase = Number(me.fase_atual);
  var concluido = fase > total;
  var missao = null;
  if (!concluido) {
    var m = missionRow(room.token, fase);
    if (!m) fail('Fase nao encontrada na sala.');
    var anteriores = readRows('CtfCapturas').filter(function (c) {
      return String(c.token) === room.token && String(c.tag_id) === String(m.tag_id);
    }).length;
    var base = Number(m.xp);
    missao = {
      fase: fase,
      tag_id: String(m.tag_id),
      categoria: m.categoria,
      pacote: m.pacote,
      pergunta: m.pergunta,
      xp_base: base,
      xp_atual: pontos(base, anteriores + 1, room.modo),
      capturas_anteriores: anteriores
    };
  }
  return {
    sala: roomInfo(room),
    aluno: {
      nome: me.nome, fase: fase, xp: Number(me.xp), acertos: Number(me.acertos),
      erros: Number(me.erros), fogos: Number(me.fogos), posicao: pos, concluido: concluido
    },
    missao: missao,
    ranking: ranked.slice(0, 15).map(function (a) {
      return { nome: a.nome, fase: Number(a.fase_atual), xp: Number(a.xp), fogos: Number(a.fogos) };
    }),
    total_alunos: ranked.length
  };
}

// ---------- Acoes ----------

function createRoom(req) {
  var missions = req.missions || [];
  if (!missions.length) fail('Selecione ao menos uma missao.');
  if (missions.length > 200) fail('Maximo de 200 fases por sala.');
  var nome = String(req.nome || 'Sala CTF').substring(0, 80);
  var modo = req.modo === 'ctf_dynamic' ? 'ctf_dynamic' : 'fixed';

  var existing = readRows('CtfSalas').map(function (r) { return String(r.token); });
  var token;
  do { token = genToken(); } while (existing.indexOf(token) >= 0);
  var adminKey = randomFrom(TOKEN_CHARS + 'abcdefghijkmnpqrstuvwxyz', 24);

  appendObj('CtfSalas', {
    token: token, nome: nome, admin_key: adminKey, status: 'aberta',
    modo: modo, criada_em: new Date().toISOString(), total_fases: missions.length
  });

  var sh = getSheet('CtfMissoes');
  var rows = missions.map(function (m, i) {
    return [token, i + 1, m.tag_id, m.categoria || '', m.pacote || '', m.pergunta, m.resposta,
      JSON.stringify(m.alternativas || []), m.xp || 10];
  });
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, SHEET_HEADERS.CtfMissoes.length).setValues(rows);
  return { token: token, adminKey: adminKey, total: missions.length };
}

function join(req) {
  var room = requireRoom(req.token);
  var nome = cleanName(req.nome);
  var key = norm(nome);
  var found = playersOf(room.token).filter(function (a) { return a.nome_key === key; })[0];
  if (!found) {
    if (room.status !== 'aberta') fail('Esta sala esta encerrada.');
    appendObj('CtfAlunos', {
      token: room.token, nome: nome, nome_key: key, fase_atual: 1, xp: 0, acertos: 0,
      erros: 0, fogos: 0, entrou_em: Date.now()
    });
  }
  return buildState(room, key);
}

function stateFor(req) {
  var room = requireRoom(req.token);
  return buildState(room, norm(req.nome));
}

function submit(req) {
  var room = requireRoom(req.token);
  if (room.status !== 'aberta') fail('A sala foi encerrada pelo professor.');
  var key = norm(req.nome);
  var me = playersOf(room.token).filter(function (a) { return a.nome_key === key; })[0];
  if (!me) fail('Aluno nao encontrado nesta sala. Entre novamente.');

  var total = Number(room.total_fases);
  var fase = Number(me.fase_atual);
  if (fase > total) fail('Voce ja concluiu todas as fases!');

  var agora = Date.now();
  if (me.ultimo_erro && agora - Number(me.ultimo_erro) < ERROR_COOLDOWN_MS) {
    fail('Aguarde alguns segundos antes de tentar novamente.');
  }

  var ans = norm(req.resposta);
  if (!ans) fail('Digite a resposta antes de enviar.');
  var m = missionRow(room.token, fase);
  var aceitas = [norm(m.resposta)];
  try {
    JSON.parse(m.alternativas || '[]').forEach(function (a) { aceitas.push(norm(a)); });
  } catch (err) { /* sem alternativas */ }

  if (aceitas.indexOf(ans) < 0) {
    updateRow('CtfAlunos', me._row, { erros: Number(me.erros) + 1, ultimo_erro: agora });
    var errState = buildState(room, key);
    errState.correto = false;
    return errState;
  }

  var anteriores = readRows('CtfCapturas').filter(function (c) {
    return String(c.token) === room.token && String(c.tag_id) === String(m.tag_id);
  }).length;
  var posicao = anteriores + 1;
  var xp = pontos(Number(m.xp), posicao, room.modo);
  var isFogo = room.modo === 'ctf_dynamic' && posicao === 1;

  appendObj('CtfCapturas', {
    token: room.token, tag_id: m.tag_id, nome: me.nome, posicao: posicao, xp: xp,
    is_fogo: isFogo ? '🔥' : '', timestamp: new Date().toISOString()
  });
  updateRow('CtfAlunos', me._row, {
    fase_atual: fase + 1,
    xp: Number(me.xp) + xp,
    acertos: Number(me.acertos) + 1,
    fogos: Number(me.fogos) + (isFogo ? 1 : 0),
    ultimo_acerto: agora
  });

  var st = buildState(room, key);
  st.correto = true;
  st.premio = { xp: xp, posicao: posicao, isFogo: isFogo, modo: room.modo };
  return st;
}

function requireAdmin(req) {
  var room = requireRoom(req.token);
  if (String(room.admin_key) !== String(req.adminKey || '')) fail('Chave de professor invalida para esta sala.');
  return room;
}

function teacherRoom(req) {
  var room = requireAdmin(req);
  var alunos = rankPlayers(playersOf(room.token)).map(function (a) {
    return {
      nome: a.nome, fase_atual: Number(a.fase_atual), xp: Number(a.xp), acertos: Number(a.acertos),
      erros: Number(a.erros), fogos: Number(a.fogos), ultimo_acerto: a.ultimo_acerto === '' ? '' : Number(a.ultimo_acerto)
    };
  });
  return { sala: roomInfo(room), alunos: alunos };
}

function setStatus(req) {
  var room = requireAdmin(req);
  var status = req.status === 'encerrada' ? 'encerrada' : 'aberta';
  updateRow('CtfSalas', room._row, { status: status });
  room.status = status;
  return { sala: roomInfo(room) };
}
`;
