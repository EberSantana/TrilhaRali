/**
 * Backend do módulo CTF (Google Apps Script).
 * É um projeto SEPARADO do script do Rali NFC: cole em uma planilha à parte e publique como Web App
 * (Executar como: você • Quem tem acesso: Qualquer pessoa).
 *
 * As respostas ficam apenas na planilha: o aluno recebe somente a pergunta da fase atual e a
 * validação (e o avanço de fase) acontece no servidor.
 */
export const CTF_APPS_SCRIPT = String.raw`// ==========================================================
// RALI IFSTB - MODULO CTF (IFS CAMPUS TOBIAS BARRETO)
// Cole em: Extensoes > Apps Script de uma planilha NOVA.
// Implantar > Nova implantacao > Aplicativo da Web
//   Executar como: Eu  |  Quem pode acessar: Qualquer pessoa
// ==========================================================

var SHEET_HEADERS = {
  CtfSalas: ['token', 'nome', 'admin_key', 'status', 'modo', 'criada_em', 'total_fases', 'banco_liberado', 'timer', 'tipo', 'ordem', 'terminal_liberado'],
  CtfMissoes: ['token', 'fase', 'tag_id', 'categoria', 'pacote', 'pergunta', 'resposta', 'alternativas', 'xp', 'opcoes'],
  CtfAlunos: ['token', 'nome', 'nome_key', 'fase_atual', 'xp', 'acertos', 'erros', 'fogos', 'entrou_em', 'ultimo_acerto', 'ultimo_erro', 'integrantes'],
  CtfCapturas: ['token', 'tag_id', 'nome', 'posicao', 'xp', 'is_fogo', 'timestamp'],
  Banco: ['id', 'disciplina', 'assunto', 'tipo', 'pergunta', 'resposta', 'aceitas', 'opcoes', 'xp', 'explicacao', 'ativo', 'atualizado_em'],
  NfcPublicadas: ['tag_id', 'disciplina', 'assunto', 'tipo', 'pergunta', 'resposta', 'aceitas', 'opcoes', 'xp', 'explicacao', 'publicada_em']
};
var TEXT_SHEETS = { CtfMissoes: 1, Banco: 1, NfcPublicadas: 1 };
var TOKEN_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
var TOKEN_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
var WRITE_ACTIONS = { createRoom: 1, join: 1, submit: 1, raliSubmit: 1, setStatus: 1, setBanco: 1, setTerminal: 1, setTimer: 1, raliTimer: 1, setTema: 1, bancoSave: 1, bancoDelete: 1, bancoImport: 1, nfcPublish: 1 };
var HEADERS_OK = {};
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
  return out({ ok: true, servico: 'Trilha Rali', versao: 6 });
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
    case 'raliTag': return raliTag(req);
    case 'raliSubmit': return raliSubmit(req);
    case 'teacherRoom': return teacherRoom(req);
    case 'setStatus': return setStatus(req);
    case 'setBanco': return setBanco(req);
    case 'setTerminal': return setTerminal(req);
    case 'setTimer': return setTimer(req);
    case 'raliTimer': return raliTimer(req);
    case 'raliEstado': return raliEstado();
    case 'setTema': return setTema(req);
    case 'bancoPing': requireBancoKey(req); return { ok: true };
    case 'bancoList': return bancoList(req);
    case 'bancoSave': return bancoSave(req);
    case 'bancoDelete': return bancoDelete(req);
    case 'bancoImport': return bancoImport(req);
    case 'nfcPublish': return nfcPublish(req);
    case 'nfcSet': return nfcSet();
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
    if (TEXT_SHEETS[name]) {
      // Evita que respostas como "007" ou "1.0" virem numeros
      sh.getRange(1, 1, sh.getMaxRows(), SHEET_HEADERS[name].length).setNumberFormat('@');
    }
    HEADERS_OK[name] = true;
  }
  if (!HEADERS_OK[name]) {
    // Planilhas criadas por versoes anteriores do script ganham as colunas novas
    var head = sh.getDataRange().getValues()[0] || [];
    if (head.length < SHEET_HEADERS[name].length) {
      sh.getRange(1, 1, 1, SHEET_HEADERS[name].length).setValues([SHEET_HEADERS[name]]);
    }
    HEADERS_OK[name] = true;
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

// CTF livre: o aluno escolhe a ordem dos desafios (como o Rali, mas individual). Salas antigas (sem o campo) ficam em ordem.
function isLivre(room) {
  return room.tipo !== 'rali' && String(room.ordem) === 'livre';
}

function roomInfo(room) {
  return {
    token: room.token,
    nome: room.nome,
    status: room.status,
    modo: room.modo,
    tipo: room.tipo === 'rali' ? 'rali' : 'ctf',
    ordem: isLivre(room) ? 'livre' : 'sequencial',
    total: Number(room.total_fases),
    banco: room.banco_liberado === true || String(room.banco_liberado).toLowerCase() === 'true',
    terminal: room.terminal_liberado === true || String(room.terminal_liberado).toLowerCase() === 'true',
    timer: timerOut(parseTimer(room.timer), Date.now()),
    tema: getTema(),
    agora: Date.now()
  };
}

function cleanName(nome) {
  var n = String(nome || '').replace(/\s+/g, ' ').trim().replace(/^[=+\-@]+/, '').trim();
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
      opcoes: parseList(m.opcoes),
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
  var tipo = req.tipo === 'rali' ? 'rali' : 'ctf';
  var ordem = tipo === 'ctf' && req.ordem === 'livre' ? 'livre' : 'sequencial';
  if (tipo === 'rali' || ordem === 'livre') {
    var vistas = {};
    missions.forEach(function (m) {
      var id = String(m.tag_id);
      if (vistas[id]) fail('Etiqueta repetida na sala: ' + id);
      vistas[id] = 1;
    });
  }

  var existing = readRows('CtfSalas').map(function (r) { return String(r.token); });
  var token;
  do { token = genToken(); } while (existing.indexOf(token) >= 0);
  var adminKey = randomFrom(TOKEN_CHARS + 'abcdefghijkmnpqrstuvwxyz', 24);

  appendObj('CtfSalas', {
    token: token, nome: nome, admin_key: adminKey, status: 'aberta',
    modo: modo, criada_em: new Date().toISOString(), total_fases: missions.length,
    banco_liberado: req.bancoLiberado === true,
    timer: req.minutos ? JSON.stringify(timerApply(null, 'config', req.minutos, Date.now())) : '',
    tipo: tipo,
    ordem: ordem
  });

  var sh = getSheet('CtfMissoes');
  var rows = missions.map(function (m, i) {
    return [token, i + 1, m.tag_id, m.categoria || '', m.pacote || '', m.pergunta, m.resposta,
      JSON.stringify(m.alternativas || []), m.xp || 10, JSON.stringify(m.opcoes || [])];
  });
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, SHEET_HEADERS.CtfMissoes.length).setValues(rows);
  return { token: token, adminKey: adminKey, total: missions.length, tipo: tipo, ordem: ordem };
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
      erros: 0, fogos: 0, entrou_em: Date.now(),
      integrantes: room.tipo === 'rali' ? JSON.stringify(cleanMembers(req.integrantes)) : ''
    });
  }
  return room.tipo === 'rali' || isLivre(room) ? raliBuildState(room, key) : buildState(room, key);
}

function stateFor(req) {
  var room = requireRoom(req.token);
  return room.tipo === 'rali' || isLivre(room) ? raliBuildState(room, norm(req.nome)) : buildState(room, norm(req.nome));
}

function submit(req) {
  var room = requireRoom(req.token);
  if (room.status !== 'aberta') fail('A sala foi encerrada pelo professor.');
  requireTimerOpen(parseTimer(room.timer), Date.now());
  var key = norm(req.nome);
  var me = playersOf(room.token).filter(function (a) { return a.nome_key === key; })[0];
  if (!me) fail('Aluno nao encontrado nesta sala. Entre novamente.');

  if (isLivre(room)) fail('Esta sala e livre: escolha um desafio na lista.');
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

// ---------- Rali NFC: salas com equipes (as missoes sao resolvidas em qualquer ordem, por etiqueta) ----------

function cleanMembers(list) {
  var out = [];
  (Array.isArray(list) ? list : []).forEach(function (n) {
    var t = String(n || '').replace(/\s+/g, ' ').trim().replace(/^[=+\-@]+/, '').trim();
    if (t.length >= 2 && out.length < 8) out.push(t.substring(0, 40));
  });
  return out;
}

function raliBuildState(room, key) {
  var players = playersOf(room.token);
  var ranked = rankPlayers(players);
  var me = null;
  var pos = 0;
  for (var i = 0; i < ranked.length; i++) {
    if (ranked[i].nome_key === key) { me = ranked[i]; pos = i + 1; break; }
  }
  if (!me) fail((room.tipo === 'rali' ? 'Equipe' : 'Aluno') + ' nao encontrado(a) nesta sala. Entre novamente.');

  var caps = readRows('CtfCapturas').filter(function (c) { return String(c.token) === room.token; });
  var minhas = {};
  var porTag = {};
  caps.forEach(function (c) {
    porTag[String(c.tag_id)] = (porTag[String(c.tag_id)] || 0) + 1;
    if (c.nome === me.nome) minhas[String(c.tag_id)] = 1;
  });
  var missoes = readRows('CtfMissoes')
    .filter(function (m) { return String(m.token) === room.token; })
    .map(function (m) {
      var tag = String(m.tag_id);
      return {
        tag_id: tag, categoria: m.categoria, pacote: m.pacote, xp_base: Number(m.xp),
        xp_atual: pontos(Number(m.xp), (porTag[tag] || 0) + 1, room.modo),
        capturas: porTag[tag] || 0, concluida: minhas[tag] === 1
      };
    });
  return {
    sala: roomInfo(room),
    equipe: {
      nome: me.nome, integrantes: parseList(me.integrantes), xp: Number(me.xp), acertos: Number(me.acertos),
      erros: Number(me.erros), fogos: Number(me.fogos), posicao: pos
    },
    aluno: {
      nome: me.nome, fase: 1, xp: Number(me.xp), acertos: Number(me.acertos),
      erros: Number(me.erros), fogos: Number(me.fogos), posicao: pos, concluido: false
    },
    missoes: missoes,
    ranking: ranked.slice(0, 15).map(function (a) {
      return { nome: a.nome, fase: Number(a.acertos), xp: Number(a.xp), fogos: Number(a.fogos) };
    }),
    total_equipes: ranked.length,
    total_alunos: ranked.length
  };
}

function raliMission(room, tag) {
  var rows = readRows('CtfMissoes');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].token) === room.token && String(rows[i].tag_id).toLowerCase() === String(tag || '').trim().toLowerCase()) return rows[i];
  }
  fail('Esta etiqueta nao faz parte da sala.');
}

function raliTeam(room, nome) {
  var key = norm(nome);
  var me = playersOf(room.token).filter(function (a) { return a.nome_key === key; })[0];
  if (!me) fail((room.tipo === 'rali' ? 'Equipe' : 'Aluno') + ' nao encontrado(a) nesta sala. Entre novamente.');
  return me;
}

function raliTag(req) {
  var room = requireRoom(req.token);
  if (room.tipo !== 'rali' && !isLivre(room)) fail('Esta sala e do CTF em ordem.');
  var me = raliTeam(room, req.nome);
  var m = raliMission(room, req.tag_id);
  var caps = readRows('CtfCapturas').filter(function (c) {
    return String(c.token) === room.token && String(c.tag_id) === String(m.tag_id);
  });
  var jaResolvida = caps.some(function (c) { return c.nome === me.nome; });
  var base = Number(m.xp);
  return {
    sala: roomInfo(room),
    ja_resolvida: jaResolvida,
    missao: {
      tag_id: String(m.tag_id), categoria: m.categoria, pacote: m.pacote,
      pergunta: m.pergunta, opcoes: parseList(m.opcoes), xp_base: base,
      xp_atual: pontos(base, caps.length + 1, room.modo), capturas_anteriores: caps.length
    }
  };
}

function raliSubmit(req) {
  var room = requireRoom(req.token);
  if (room.tipo !== 'rali' && !isLivre(room)) fail('Esta sala e do CTF em ordem.');
  if (room.status !== 'aberta') fail('A sala foi encerrada pelo professor.');
  requireTimerOpen(parseTimer(room.timer), Date.now());
  var me = raliTeam(room, req.nome);
  var m = raliMission(room, req.tag_id);
  var tag = String(m.tag_id);

  var caps = readRows('CtfCapturas').filter(function (c) {
    return String(c.token) === room.token && String(c.tag_id) === tag;
  });
  if (caps.some(function (c) { return c.nome === me.nome; })) fail(room.tipo === 'rali' ? 'Sua equipe ja resolveu esta missao.' : 'Voce ja resolveu este desafio.');

  var agora = Date.now();
  if (me.ultimo_erro && agora - Number(me.ultimo_erro) < ERROR_COOLDOWN_MS) {
    fail('Aguarde alguns segundos antes de tentar novamente.');
  }
  var ans = norm(req.resposta);
  if (!ans) fail('Digite a resposta antes de enviar.');
  var aceitas = [norm(m.resposta)];
  try {
    JSON.parse(m.alternativas || '[]').forEach(function (a) { aceitas.push(norm(a)); });
  } catch (err) { /* sem alternativas */ }

  var key = norm(me.nome);
  if (aceitas.indexOf(ans) < 0) {
    updateRow('CtfAlunos', me._row, { erros: Number(me.erros) + 1, ultimo_erro: agora });
    var errState = raliBuildState(room, key);
    errState.correto = false;
    return errState;
  }

  var posicao = caps.length + 1;
  var xp = pontos(Number(m.xp), posicao, room.modo);
  var isFogo = room.modo === 'ctf_dynamic' && posicao === 1;
  appendObj('CtfCapturas', {
    token: room.token, tag_id: tag, nome: me.nome, posicao: posicao, xp: xp,
    is_fogo: isFogo ? '🔥' : '', timestamp: new Date().toISOString()
  });
  updateRow('CtfAlunos', me._row, {
    xp: Number(me.xp) + xp,
    acertos: Number(me.acertos) + 1,
    fogos: Number(me.fogos) + (isFogo ? 1 : 0),
    ultimo_acerto: agora
  });
  var st = raliBuildState(room, key);
  st.correto = true;
  st.premio = { xp: xp, posicao: posicao, isFogo: isFogo, modo: room.modo, tag_id: tag };
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
      erros: Number(a.erros), fogos: Number(a.fogos), ultimo_acerto: a.ultimo_acerto === '' ? '' : Number(a.ultimo_acerto),
      integrantes: parseList(a.integrantes)
    };
  });
  return { sala: roomInfo(room), alunos: alunos };
}

function setBanco(req) {
  var room = requireAdmin(req);
  var liberado = req.liberado === true;
  updateRow('CtfSalas', room._row, { banco_liberado: liberado });
  room.banco_liberado = liberado;
  return { sala: roomInfo(room) };
}

function setTerminal(req) {
  var room = requireAdmin(req);
  var liberado = req.liberado === true;
  updateRow('CtfSalas', room._row, { terminal_liberado: liberado });
  room.terminal_liberado = liberado;
  return { sala: roomInfo(room) };
}

function setStatus(req) {
  var room = requireAdmin(req);
  var status = req.status === 'encerrada' ? 'encerrada' : 'aberta';
  updateRow('CtfSalas', room._row, { status: status });
  room.status = status;
  return { sala: roomInfo(room) };
}

// ---------- Cronometro e tema ----------
// O cronometro e guardado como {d: duracao em minutos, f: fim em ms (0 = parado), r: segundos restantes}.
// Com cronometro configurado, as respostas so valem enquanto ele esta rodando.

var TIMER_MIN = 5;
var TIMER_MAX = 120;

function clampMin(m) {
  var n = Math.round(Number(m) / 5) * 5;
  if (!(n >= TIMER_MIN)) n = TIMER_MIN;
  if (n > TIMER_MAX) n = TIMER_MAX;
  return n;
}

function parseTimer(v) {
  try {
    var t = typeof v === 'string' && v ? JSON.parse(v) : null;
    if (t && Number(t.d) > 0) return { d: Number(t.d), f: Number(t.f) || 0, r: Number(t.r) || 0 };
  } catch (err) {}
  return null;
}

function timerLeft(t, now) {
  return t.f > 0 ? Math.max(0, Math.ceil((t.f - now) / 1000)) : Math.max(0, t.r);
}

function timerApply(t, op, minutos, now) {
  if (op === 'off') return null;
  if (op === 'config') {
    var d = clampMin(minutos);
    return { d: d, f: 0, r: d * 60 };
  }
  if (op === 'sync') {
    // O telao do Rali NFC espelha aqui o relogio que roda no aparelho do professor
    var seg = Math.max(0, Math.min(TIMER_MAX * 60, Math.round(Number(req_segundos(minutos)))));
    var dur = clampMin(minutos && minutos.duracao ? minutos.duracao : Math.ceil(seg / 60));
    return minutos && minutos.rodando && seg > 0 ? { d: dur, f: now + seg * 1000, r: seg } : { d: dur, f: 0, r: seg };
  }
  if (!t) fail('Defina primeiro a duracao do cronometro.');
  var left = timerLeft(t, now);
  if (op === 'start') {
    if (left <= 0) fail('O tempo acabou. Adicione tempo ou reinicie o cronometro.');
    return { d: t.d, f: now + left * 1000, r: left };
  }
  if (op === 'pause') return { d: t.d, f: 0, r: left };
  if (op === 'reset') return { d: t.d, f: 0, r: t.d * 60 };
  if (op === 'add') {
    var delta = Math.round(Number(minutos) || 5) * 60;
    var next = Math.max(0, Math.min(TIMER_MAX * 60, left + delta));
    return t.f > 0 ? { d: t.d, f: now + next * 1000, r: next } : { d: t.d, f: 0, r: next };
  }
  fail('Operacao de cronometro desconhecida.');
}

function req_segundos(o) {
  return o && typeof o === 'object' ? o.segundos : 0;
}

function timerOut(t, now) {
  if (!t) return null;
  var left = timerLeft(t, now);
  return { duracaoMin: t.d, fimEm: t.f, restanteS: left, rodando: t.f > 0 && left > 0, esgotado: left <= 0 };
}

function requireTimerOpen(t, now) {
  if (!t) return;
  if (timerLeft(t, now) <= 0) fail('Tempo esgotado! As respostas foram bloqueadas.');
  if (!(t.f > 0)) fail('O cronometro esta parado. Aguarde o professor iniciar.');
}

function getTema() {
  var v = PropertiesService.getScriptProperties().getProperty('TEMA');
  return v === 'claro' || v === 'escuro' ? v : '';
}

function setTimer(req) {
  var room = requireAdmin(req);
  var t = timerApply(parseTimer(room.timer), req.op, req.minutos, Date.now());
  var raw = t ? JSON.stringify(t) : '';
  updateRow('CtfSalas', room._row, { timer: raw });
  room.timer = raw;
  return { sala: roomInfo(room) };
}

// Cronometro do Rali NFC: um so por planilha, controlado pelo professor (chave do banco)
function raliTimer(req) {
  requireBancoKey(req);
  var props = PropertiesService.getScriptProperties();
  var arg = req.op === 'sync' ? { segundos: req.segundos, duracao: req.minutos, rodando: req.rodando === true } : req.minutos;
  var t = timerApply(parseTimer(props.getProperty('RALI_TIMER')), req.op, arg, Date.now());
  props.setProperty('RALI_TIMER', t ? JSON.stringify(t) : '');
  return raliEstado();
}

// Publico: os celulares dos alunos leem o cronometro do Rali NFC e o tema escolhido pelo professor
function raliEstado() {
  var now = Date.now();
  return {
    timer: timerOut(parseTimer(PropertiesService.getScriptProperties().getProperty('RALI_TIMER')), now),
    tema: getTema(),
    agora: now
  };
}

function setTema(req) {
  requireBancoKey(req);
  var tema = req.tema === 'escuro' ? 'escuro' : 'claro';
  PropertiesService.getScriptProperties().setProperty('TEMA', tema);
  return { tema: tema };
}

// ---------- Banco de perguntas do professor ----------
// A chave do banco fica nas Propriedades do script (BANCO_KEY_HASH). Rode setupBanco() UMA vez no editor:
// ela gera a chave, guarda so o hash e mostra a chave no Registro de execucao.

function parseList(v) {
  if (v === undefined || v === null || v === '') return [];
  try {
    var a = JSON.parse(v);
    return Array.isArray(a) ? a.map(String) : [];
  } catch (err) {
    return [];
  }
}

function sha256hex(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text), Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ('0' + ((b < 0 ? b + 256 : b) & 255).toString(16)).slice(-2); }).join('');
}

function setupBanco() {
  var key = randomFrom(TOKEN_CHARS + 'abcdefghijkmnpqrstuvwxyz', 20);
  PropertiesService.getScriptProperties().setProperty('BANCO_KEY_HASH', sha256hex(key));
  Logger.log('CHAVE DO BANCO (guarde com voce): ' + key);
  return key;
}

function requireBancoKey(req) {
  var hash = PropertiesService.getScriptProperties().getProperty('BANCO_KEY_HASH');
  if (!hash) fail('O banco de perguntas ainda nao foi configurado. Rode setupBanco() no editor do Apps Script.');
  if (sha256hex(String(req.chave || '')) !== hash) {
    Utilities.sleep(1200);
    fail('Chave do banco invalida.');
  }
}

function cleanQuestion(q) {
  q = q || {};
  var disciplina = String(q.disciplina || '').replace(/\s+/g, ' ').trim();
  var assunto = String(q.assunto || '').replace(/\s+/g, ' ').trim();
  var pergunta = String(q.pergunta || '').trim();
  var tipo = q.tipo === 'multipla' ? 'multipla' : 'exata';
  var resposta = String(q.resposta === undefined || q.resposta === null ? '' : q.resposta).trim();
  var xp = Number(q.xp);
  if (!disciplina) fail('Informe a disciplina.');
  if (disciplina.length > 80) fail('Disciplina muito longa.');
  if (assunto.length > 80) fail('Assunto muito longo.');
  if (pergunta.length < 5) fail('A pergunta precisa ter ao menos 5 caracteres.');
  if (pergunta.length > 1500) fail('Pergunta muito longa (maximo 1500 caracteres).');
  if (!resposta) fail('Informe a resposta correta.');
  if (resposta.length > 300) fail('Resposta muito longa.');
  if (!(xp >= 1 && xp <= 100)) xp = 10;
  var aceitas = [];
  var opcoes = [];
  if (tipo === 'multipla') {
    var seen = {};
    parseListInput(q.opcoes).forEach(function (o) {
      var k = norm(o);
      if (k && !seen[k]) { seen[k] = true; opcoes.push(String(o).trim()); }
    });
    if (opcoes.length < 2 || opcoes.length > 6) fail('Multipla escolha precisa de 2 a 6 alternativas diferentes.');
    if (!seen[norm(resposta)]) fail('A resposta correta precisa ser uma das alternativas.');
  } else {
    parseListInput(q.aceitas).forEach(function (a) {
      var t = String(a).trim();
      if (t && norm(t) !== norm(resposta) && aceitas.indexOf(t) < 0) aceitas.push(t);
    });
    if (aceitas.length > 10) fail('Maximo de 10 variacoes aceitas.');
  }
  return {
    disciplina: disciplina, assunto: assunto, tipo: tipo, pergunta: pergunta, resposta: resposta,
    aceitas: aceitas, opcoes: opcoes, xp: Math.round(xp), explicacao: String(q.explicacao || '').trim().substring(0, 1000),
    ativo: q.ativo !== false
  };
}

function parseListInput(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return v.split(/\r?\n/);
  return [];
}

function bancoRowOut(r) {
  return {
    id: String(r.id), disciplina: r.disciplina, assunto: r.assunto, tipo: r.tipo === 'multipla' ? 'multipla' : 'exata',
    pergunta: r.pergunta, resposta: String(r.resposta), aceitas: parseList(r.aceitas), opcoes: parseList(r.opcoes),
    xp: Number(r.xp) || 10, explicacao: r.explicacao || '',
    ativo: r.ativo === true || String(r.ativo).toLowerCase() === 'true',
    atualizado_em: r.atualizado_em ? String(r.atualizado_em) : ''
  };
}

function bancoToValues(id, c) {
  return {
    id: id, disciplina: c.disciplina, assunto: c.assunto, tipo: c.tipo, pergunta: c.pergunta, resposta: c.resposta,
    aceitas: JSON.stringify(c.aceitas), opcoes: JSON.stringify(c.opcoes), xp: c.xp, explicacao: c.explicacao,
    ativo: c.ativo, atualizado_em: new Date().toISOString()
  };
}

function bancoList(req) {
  requireBancoKey(req);
  return { perguntas: readRows('Banco').filter(function (r) { return String(r.id) !== ''; }).map(bancoRowOut) };
}

function newBancoId(existing) {
  var id;
  do { id = 'Q' + randomFrom(TOKEN_CHARS, 6); } while (existing.indexOf(id) >= 0);
  return id;
}

function bancoSave(req) {
  requireBancoKey(req);
  var c = cleanQuestion(req.pergunta);
  var rows = readRows('Banco');
  var id = req.pergunta && req.pergunta.id ? String(req.pergunta.id) : '';
  var found = null;
  for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === id && id) { found = rows[i]; break; } }
  if (found) {
    updateRow('Banco', found._row, bancoToValues(id, c));
  } else {
    id = newBancoId(rows.map(function (r) { return String(r.id); }));
    appendObj('Banco', bancoToValues(id, c));
  }
  var saved = bancoToValues(id, c);
  return { pergunta: bancoRowOut(saved) };
}

function bancoDelete(req) {
  requireBancoKey(req);
  var id = String(req.id || '');
  var rows = readRows('Banco');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].id) === id) {
      getSheet('Banco').deleteRow(rows[i]._row);
      return { ok: true };
    }
  }
  fail('Pergunta nao encontrada.');
}

function bancoImport(req) {
  requireBancoKey(req);
  var list = req.perguntas || [];
  if (!list.length) fail('Nada para importar.');
  if (list.length > 300) fail('Maximo de 300 perguntas por importacao.');
  var ids = readRows('Banco').map(function (r) { return String(r.id); });
  var values = [];
  var erros = [];
  list.forEach(function (q, i) {
    try {
      var c = cleanQuestion(q);
      var id = newBancoId(ids);
      ids.push(id);
      var o = bancoToValues(id, c);
      values.push(SHEET_HEADERS.Banco.map(function (k) { return o[k]; }));
    } catch (err) {
      erros.push({ linha: i + 1, motivo: err && err.userMessage ? err.message : String(err) });
    }
  });
  if (values.length) {
    var sh = getSheet('Banco');
    sh.getRange(sh.getLastRow() + 1, 1, values.length, SHEET_HEADERS.Banco.length).setValues(values);
  }
  return { importadas: values.length, erros: erros };
}

// ---------- Publicacao para o Rali NFC ----------

function nfcPublish(req) {
  requireBancoKey(req);
  var list = req.missoes || [];
  if (list.length > 200) fail('Maximo de 200 missoes publicadas.');
  var now = new Date().toISOString();
  var seen = {};
  var values = list.map(function (m) {
    var tag = String(m.tag_id || '').trim().toLowerCase();
    if (!/^tag_[a-z0-9_]+$/.test(tag)) fail('Tag invalida: ' + tag);
    if (seen[tag]) fail('Tag repetida: ' + tag);
    seen[tag] = true;
    var c;
    try { c = cleanQuestion(m); } catch (err) { fail(tag + ': ' + (err && err.message ? err.message : String(err))); }
    var o = { tag_id: tag, disciplina: c.disciplina, assunto: c.assunto, tipo: c.tipo, pergunta: c.pergunta,
      resposta: c.resposta, aceitas: JSON.stringify(c.aceitas), opcoes: JSON.stringify(c.opcoes), xp: c.xp,
      explicacao: c.explicacao, publicada_em: now };
    return SHEET_HEADERS.NfcPublicadas.map(function (k) { return o[k]; });
  });
  var sh = getSheet('NfcPublicadas');
  if (sh.getLastRow() > 1) sh.deleteRows(2, sh.getLastRow() - 1);
  if (values.length) sh.getRange(2, 1, values.length, SHEET_HEADERS.NfcPublicadas.length).setValues(values);
  PropertiesService.getScriptProperties().setProperty('NFC_SOMENTE_BANCO', req.somenteBanco === false ? 'false' : 'true');
  return { total: values.length };
}

// Publico: os celulares dos alunos leem o conjunto publicado (o Rali NFC valida no aparelho, como as missoes padrao)
function nfcSet() {
  var rows = readRows('NfcPublicadas').filter(function (r) { return String(r.tag_id) !== ''; });
  return {
    somenteBanco: PropertiesService.getScriptProperties().getProperty('NFC_SOMENTE_BANCO') !== 'false',
    missoes: rows.map(function (r) {
      return {
        tag_id: String(r.tag_id), disciplina: r.disciplina, assunto: r.assunto, tipo: r.tipo === 'multipla' ? 'multipla' : 'exata',
        pergunta: r.pergunta, resposta: String(r.resposta), aceitas: parseList(r.aceitas), opcoes: parseList(r.opcoes),
        xp: Number(r.xp) || 10, explicacao: r.explicacao || ''
      };
    })
  };
}
`;
