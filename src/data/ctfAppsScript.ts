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
  CtfSalas: ['token', 'nome', 'admin_key', 'status', 'modo', 'criada_em', 'total_fases', 'banco_liberado', 'timer', 'tipo', 'ordem', 'terminal_liberado', 'debriefing_liberado', 'encerrada_em', 'cruzadinha_dicas', 'cruzadinha_palavras', 'cruzadinha_gabarito', 'cruzadinha_grade', 'cruzadinha_disc'],
  CtfMissoes: ['token', 'fase', 'tag_id', 'categoria', 'pacote', 'pergunta', 'resposta', 'alternativas', 'xp', 'opcoes', 'explicacao'],
  CtfAlunos: ['token', 'nome', 'nome_key', 'fase_atual', 'xp', 'acertos', 'erros', 'fogos', 'entrou_em', 'ultimo_acerto', 'ultimo_erro', 'integrantes', 'chave', 'xp_cruz'],
  CtfCapturas: ['token', 'tag_id', 'nome', 'posicao', 'xp', 'is_fogo', 'timestamp'],
  CtfCruzCapturas: ['token', 'nome_key', 'palavra', 'posicao', 'ajuda', 'xp', 'timestamp', 'grade', 'palavra_id'],
  CtfCruzDicas: ['token', 'grade', 'nome_key', 'tipo', 'palavra_id', 'indice', 'timestamp'],
  CruzBanco: ['disciplina', 'palavra', 'dica', 'ativo'],
  CtfLog: ['quando', 'token', 'sala', 'tipo', 'evento', 'detalhe'],
  CtfResumo: ['token', 'sala', 'tipo', 'criada_em', 'encerrada_em', 'duracao_min', 'perguntas', 'participantes', 'acertos', 'erros', 'taxa_acerto', 'xp_total', 'xp_medio'],
  CtfAnalise: ['token', 'sala', 'fase', 'tag_id', 'pacote', 'pergunta', 'acertos', 'participantes', 'taxa_acerto'],
  Banco: ['id', 'disciplina', 'assunto', 'tipo', 'pergunta', 'resposta', 'aceitas', 'opcoes', 'xp', 'explicacao', 'ativo', 'atualizado_em'],
  NfcPublicadas: ['tag_id', 'disciplina', 'assunto', 'tipo', 'pergunta', 'resposta', 'aceitas', 'opcoes', 'xp', 'explicacao', 'publicada_em']
};
var TEXT_SHEETS = { CtfMissoes: 1, Banco: 1, NfcPublicadas: 1 };
var TOKEN_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
var TOKEN_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
var WRITE_ACTIONS = { createRoom: 1, join: 1, submit: 1, raliSubmit: 1, setStatus: 1, setBanco: 1, setTerminal: 1, setCruzadinha: 1, cruzBancoImport: 1, cruzState: 1, cruzCheck: 1, cruzHint: 1, setDebriefing: 1, setTimer: 1, raliTimer: 1, setTema: 1, bancoSave: 1, bancoDelete: 1, bancoImport: 1, nfcPublish: 1 };
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
  return out({ ok: true, servico: 'Trilha Rali', versao: 19 });
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
    case 'setCruzadinha': return setCruzadinha(req);
    case 'cruzState': return cruzState(req);
    case 'cruzBancoImport': return cruzBancoImport(req);
    case 'cruzBancoResumo': return cruzBancoResumo(req);
    case 'cruzCheck': return cruzCheck(req);
    case 'cruzHint': return cruzHint(req);
    case 'setDebriefing': return setDebriefing(req);
    case 'debriefTeacher': return debriefTeacher(req);
    case 'debriefStudent': return debriefStudent(req);
    case 'setTimer': return setTimer(req);
    case 'raliTimer': return raliTimer(req);
    case 'raliEstado': return raliEstado();
    case 'setTema': return setTema(req);
    case 'salasList': return salasList(req);
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
  if (!room) fail('Sala não encontrada. Confira o token.');
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
    ordem: isCruz(room) ? 'cruzadinha' : isLivre(room) ? 'livre' : 'sequencial',
    total: Number(room.total_fases),
    banco: room.banco_liberado === true || String(room.banco_liberado).toLowerCase() === 'true',
    terminal: room.terminal_liberado === true || String(room.terminal_liberado).toLowerCase() === 'true',
    cruzadinha: cruzadinhaDicas(room),
    cruzadinha_palavras: cruzadinhaPalavras(room),
    cruzadinha_versao: cruzadinhaDicas(room) === null ? undefined : (cruzGrade(room) || {}).id,
    debriefing: room.debriefing_liberado === true || String(room.debriefing_liberado).toLowerCase() === 'true',
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
  if (!me) fail('Aluno não encontrado nesta sala. Entre novamente.');

  var cruz = isCruz(room);
  var fase = cruz ? Number(me.acertos) || 0 : Number(me.fase_atual);
  var concluido = cruz ? fase >= total : fase > total;
  var missao = null;
  if (!concluido && !cruz) {
    var m = missionRow(room.token, fase);
    if (!m) fail('Fase não encontrada na sala.');
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
      return { nome: a.nome, fase: cruz ? Number(a.acertos) || 0 : Number(a.fase_atual), xp: Number(a.xp), fogos: Number(a.fogos) };
    }),
    total_alunos: ranked.length
  };
}

// ---------- Acoes ----------

function isCruz(room) {
  return room.tipo !== 'rali' && String(room.ordem) === 'cruzadinha';
}

// Sala de Cruzadinha: em vez de perguntas, o professor escolhe a disciplina; o servidor monta a grade na hora
// e o aluno entra direto nela. O ranking conta as palavras acertadas.
function createCruzRoom(req) {
  var disc = String(req.disciplina || '');
  if (CRUZ_DISCIPLINAS.indexOf(disc) < 0) fail('Escolha a disciplina da Cruzadinha.');
  var palavras = Math.max(6, Math.min(25, Math.floor(Number(req.palavras)) || 12));
  var dicas = Math.max(0, Math.min(30, Math.floor(Number(req.dicas)) || 0));
  var banco = cruzBanco().filter(function (b) { return b.disciplina === disc; });
  if (banco.length < 6) fail('O banco da Cruzadinha tem poucas palavras ativas para ' + disc + '. Importe as palavras em "Banco de palavras".');
  var grade = cruzMontar(banco, palavras);
  var nome = String(req.nome || 'Cruzadinha').substring(0, 80);
  var modo = req.modo === 'ctf_dynamic' ? 'ctf_dynamic' : 'fixed';
  var existing = readRows('CtfSalas').map(function (r) { return String(r.token); });
  var token;
  do { token = genToken(); } while (existing.indexOf(token) >= 0);
  var adminKey = randomFrom(TOKEN_CHARS + 'abcdefghijkmnpqrstuvwxyz', 24);
  appendObj('CtfSalas', {
    token: token, nome: nome, admin_key: adminKey, status: 'aberta',
    modo: modo, criada_em: new Date().toISOString(), total_fases: grade.palavras.length,
    banco_liberado: false,
    timer: req.minutos ? JSON.stringify(timerApply(null, 'config', req.minutos, Date.now())) : '',
    tipo: 'ctf', ordem: 'cruzadinha',
    cruzadinha_dicas: dicas, cruzadinha_palavras: palavras, cruzadinha_grade: JSON.stringify(grade), cruzadinha_disc: disc
  });
  logEvento({ token: token, nome: nome, tipo: 'ctf' }, 'criada', 'cruzadinha de ' + disc + '; ' + grade.palavras.length + ' palavras; ' + dicas + ' dicas; modo ' + modo);
  return { token: token, adminKey: adminKey, total: grade.palavras.length, tipo: 'ctf', ordem: 'cruzadinha' };
}

function createRoom(req) {
  if (req.tipo !== 'rali' && req.ordem === 'cruzadinha') return createCruzRoom(req);
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

  logEvento({ token: token, nome: nome, tipo: tipo }, 'criada', missions.length + ' perguntas; modo ' + modo + (tipo === 'ctf' ? '; ordem ' + ordem : ''));

  var sh = getSheet('CtfMissoes');
  var rows = missions.map(function (m, i) {
    return [token, i + 1, m.tag_id, m.categoria || '', m.pacote || '', m.pergunta, m.resposta,
      JSON.stringify(m.alternativas || []), m.xp || 10, JSON.stringify(m.opcoes || []),
      String(m.explicacao || '').substring(0, 800)];
  });
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, SHEET_HEADERS.CtfMissoes.length).setValues(rows);
  return { token: token, adminKey: adminKey, total: missions.length, tipo: tipo, ordem: ordem };
}

function join(req) {
  var room = requireRoom(req.token);
  var nome = cleanName(req.nome);
  var key = norm(nome);
  var found = playersOf(room.token).filter(function (a) { return a.nome_key === key; })[0];
  var chave = String(req.chave || '');
  if (found && found.chave && String(found.chave) !== chave) {
    fail('Já existe alguém com este nome nesta sala. Use outro nome (ex.: nome e sobrenome).');
  }
  if (found && !found.chave) {
    // linha criada antes da v9: ganha a chave do primeiro aparelho que voltar a entrar
    chave = Utilities.getUuid();
    updateRow('CtfAlunos', found._row, { chave: chave });
  }
  if (!found) {
    if (room.status !== 'aberta') fail('Esta sala está encerrada.');
    chave = Utilities.getUuid();
    appendObj('CtfAlunos', {
      chave: chave,
      token: room.token, nome: nome, nome_key: key, fase_atual: 1, xp: 0, acertos: 0,
      erros: 0, fogos: 0, entrou_em: Date.now(),
      integrantes: room.tipo === 'rali' ? JSON.stringify(cleanMembers(req.integrantes)) : ''
    });
  }
  var st = room.tipo === 'rali' || isLivre(room) ? raliBuildState(room, key) : buildState(room, key);
  st.chave = chave;
  return st;
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
  if (!me) fail('Aluno não encontrado nesta sala. Entre novamente.');

  if (isLivre(room)) fail('Esta sala e livre: escolha um desafio na lista.');
  var total = Number(room.total_fases);
  var fase = Number(me.fase_atual);
  if (fase > total) fail('Você já concluiu todas as fases!');

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
  if (!me) fail((room.tipo === 'rali' ? 'Equipe' : 'Aluno') + ' não encontrado(a) nesta sala. Entre novamente.');

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
  fail('Esta etiqueta não faz parte da sala.');
}

function raliTeam(room, nome) {
  var key = norm(nome);
  var me = playersOf(room.token).filter(function (a) { return a.nome_key === key; })[0];
  if (!me) fail((room.tipo === 'rali' ? 'Equipe' : 'Aluno') + ' não encontrado(a) nesta sala. Entre novamente.');
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
  if (caps.some(function (c) { return c.nome === me.nome; })) fail(room.tipo === 'rali' ? 'Sua equipe já resolveu esta missão.' : 'Você já resolveu este desafio.');

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
  if (String(room.admin_key) !== String(req.adminKey || '')) fail('Chave de professor inválida para esta sala.');
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
  var sala = roomInfo(room);
  return { sala: sala, alunos: alunos };
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

// ---------- Cruzadinha ----------
// A grade e montada AQUI, a partir da aba CruzBanco, e fica gravada na sala. Desde a v18 o banco de palavras
// NAO vem no codigo (que e publico): o professor importa a lista pelo painel e ela existe so na planilha. O aluno recebe so o desenho da grade, os numeros e as dicas, sem as
// letras. Cada palavra completa e conferida aqui (cruzCheck), as dicas sao entregues e contadas aqui (cruzHint)
// e o XP e calculado aqui. No modo CTF Dinamico, quem fecha a palavra primeiro ganha mais (regra das missoes).
var CRUZ_DISCIPLINAS = ['Banco de Dados', 'Informática Básica', 'Construção de Sites 1', 'Fundamentos de Sistemas Operacionais'];

// Coluna vazia = Cruzadinha oculta; 0 = liberada sem dicas.
function cruzadinhaDicas(room) {
  var v = room.cruzadinha_dicas;
  if (v === '' || v === null || v === undefined) return null;
  var n = Number(v);
  return isNaN(n) ? null : Math.max(0, Math.min(30, Math.floor(n)));
}

// Quantidade de palavras da grade (6 a 25; vazio = 12).
function cruzadinhaPalavras(room) {
  var n = Number(room.cruzadinha_palavras);
  return !n || isNaN(n) ? 12 : Math.max(6, Math.min(25, Math.floor(n)));
}

function cruzDisciplinas(room) {
  if (room.cruzadinha_disc) return [String(room.cruzadinha_disc)];
  var set = {};
  readRows('CtfMissoes').forEach(function (m) {
    if (String(m.token) !== room.token) return;
    var t = String(m.tag_id || '').toLowerCase();
    var d = t.indexOf('info_') === 0 ? 'Informática Básica'
      : t.indexOf('web_') === 0 ? 'Construção de Sites 1'
      : t.indexOf('linux_') === 0 ? 'Fundamentos de Sistemas Operacionais'
      : 'Banco de Dados';
    set[d] = true;
  });
  var lista = Object.keys(set).sort();
  return lista.length ? lista : ['Banco de Dados'];
}

function cruzLetras(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
}

// Banco de palavras: aba CruzBanco (disciplina, palavra, dica, ativo). Marque "nao" em ativo para tirar uma palavra.
function cruzBanco() {
  return readRows('CruzBanco').filter(function (r) {
    var a = cruzLetras(r.ativo);
    return a !== 'NAO' && a !== 'FALSE' && a !== 'N';
  }).map(function (r) {
    return { disciplina: String(r.disciplina || '').trim(), palavra: cruzLetras(r.palavra), dica: String(r.dica || '').trim() };
  }).filter(function (r) { return r.palavra.length >= 3 && r.palavra.length <= 16 && r.dica; });
}

function cruzEmbaralhar(a) {
  a = a.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function cruzTentar(lista, porTamanho) {
  var ws = cruzEmbaralhar(lista);
  if (porTamanho) ws.sort(function (a, b) { return b.palavra.length - a.palavra.length; });
  var g = {};
  var col = [];
  function k(r, c) { return r + ',' + c; }
  function cabe(w, r, c, d) {
    var dr = d === 'D' ? 1 : 0, dc = d === 'A' ? 1 : 0;
    if (g[k(r - dr, c - dc)] || g[k(r + dr * w.length, c + dc * w.length)]) return -1;
    var cruz = 0;
    for (var i = 0; i < w.length; i++) {
      var rr = r + dr * i, cc = c + dc * i, e = g[k(rr, cc)];
      if (e) { if (e !== w[i]) return -1; cruz++; }
      else if (g[k(rr + dc, cc + dr)] || g[k(rr - dc, cc - dr)]) return -1;
    }
    return cruz;
  }
  function por(p, r, c, d) {
    var dr = d === 'D' ? 1 : 0, dc = d === 'A' ? 1 : 0;
    for (var i = 0; i < p.palavra.length; i++) g[k(r + dr * i, c + dc * i)] = p.palavra[i];
    col.push({ palavra: p.palavra, dica: p.dica, r: r, c: c, dir: d });
  }
  por(ws[0], 0, 0, 'A');
  for (var x = 1; x < ws.length; x++) {
    var p = ws[x], melhor = null, chaves = Object.keys(g);
    for (var di = 0; di < 2; di++) {
      var d = di ? 'D' : 'A';
      for (var q = 0; q < chaves.length; q++) {
        var rc = chaves[q].split(','), r = Number(rc[0]), c = Number(rc[1]), ch = g[chaves[q]];
        for (var i = 0; i < p.palavra.length; i++) {
          if (p.palavra[i] !== ch) continue;
          var rr = d === 'A' ? r : r - i, cc = d === 'A' ? c - i : c, s = cabe(p.palavra, rr, cc, d);
          if (s >= 1 && (!melhor || s > melhor[0] || (s === melhor[0] && Math.random() < 0.5))) melhor = [s, rr, cc, d];
        }
      }
    }
    if (melhor) por(p, melhor[1], melhor[2], melhor[3]);
  }
  return col;
}

function cruzMedir(cs) {
  var r0 = Infinity, c0 = Infinity, r1 = -Infinity, c1 = -Infinity;
  cs.forEach(function (x) {
    r0 = Math.min(r0, x.r); c0 = Math.min(c0, x.c);
    r1 = Math.max(r1, x.r + (x.dir === 'D' ? x.palavra.length - 1 : 0));
    c1 = Math.max(c1, x.c + (x.dir === 'A' ? x.palavra.length - 1 : 0));
  });
  return { r0: r0, c0: c0, h: r1 - r0 + 1, w: c1 - c0 + 1 };
}

// Tenta varias disposicoes: mais palavras primeiro; depois grade compacta e nao muito larga (celular).
function cruzMontar(banco, max) {
  var vistas = {}, unicas = [];
  banco.forEach(function (p) { if (!vistas[p.palavra]) { vistas[p.palavra] = 1; unicas.push(p); } });
  var base = cruzEmbaralhar(unicas).slice(0, max);
  var melhor = null;
  for (var it = 0; it < 150; it++) {
    var cs = cruzTentar(base, it % 2 === 1), m = cruzMedir(cs);
    var sc = cs.length * 1000 - Math.max(m.h, m.w) * 30 - m.w * 10 - m.h * m.w;
    if (!melhor || sc > melhor.sc) melhor = { cs: cs, sc: sc, m: m };
  }
  var mm = melhor.m, inicios = [];
  melhor.cs.forEach(function (x) {
    x.r -= mm.r0; x.c -= mm.c0;
    if (inicios.indexOf(x.r * 1000 + x.c) < 0) inicios.push(x.r * 1000 + x.c);
  });
  inicios.sort(function (a, b) { return a - b; });
  return {
    id: Date.now(), h: mm.h, w: mm.w,
    palavras: melhor.cs.map(function (x, i) {
      return { id: i, palavra: x.palavra, dica: x.dica, r: x.r, c: x.c, dir: x.dir, n: inicios.indexOf(x.r * 1000 + x.c) + 1 };
    })
  };
}

function cruzCelulas(p) {
  var out = [];
  for (var i = 0; i < p.palavra.length; i++) out.push(p.dir === 'A' ? [p.r, p.c + i] : [p.r + i, p.c]);
  return out;
}

function cruzGrade(room) {
  try {
    var g = JSON.parse(room.cruzadinha_grade || '');
    return g && g.palavras && g.palavras.length ? g : null;
  } catch (e) {
    return null;
  }
}

function setCruzadinha(req) {
  var room = requireAdmin(req);
  var dicas = req.dicas === null || req.dicas === undefined || req.dicas === '' ? '' : Math.max(0, Math.min(30, Math.floor(Number(req.dicas)) || 0));
  var palavras = Math.max(6, Math.min(25, Math.floor(Number(req.palavras)) || 12));
  var upd = { cruzadinha_dicas: dicas, cruzadinha_palavras: palavras };
  var atual = cruzGrade(room);
  if (dicas !== '' && (!atual || req.nova === true || cruzadinhaPalavras(room) !== palavras)) {
    var disc = cruzDisciplinas(room);
    var banco = cruzBanco().filter(function (b) { return disc.indexOf(b.disciplina) >= 0; });
    if (banco.length < 6) fail('O banco da Cruzadinha tem poucas palavras ativas para: ' + disc.join(', ') + '. Importe as palavras em "Banco de palavras".');
    var nova = cruzMontar(banco, palavras);
    upd.cruzadinha_grade = JSON.stringify(nova);
    if (isCruz(room)) upd.total_fases = nova.palavras.length;
  }
  updateRow('CtfSalas', room._row, upd);
  for (var kk in upd) room[kk] = upd[kk];
  logEvento(room, 'cruzadinha', dicas === '' ? 'oculta' : 'liberada: ' + palavras + ' palavras, ' + dicas + ' dicas');
  return { sala: roomInfo(room) };
}

function cruzContexto(req, escrita) {
  var room = requireRoom(req.token);
  if (escrita) {
    if (room.status !== 'aberta') fail('A sala foi encerrada pelo professor.');
    requireTimerOpen(parseTimer(room.timer), Date.now());
  }
  var limite = cruzadinhaDicas(room);
  if (limite === null) fail('A Cruzadinha não está liberada nesta sala.');
  var grade = cruzGrade(room);
  if (!grade) fail('O professor precisa liberar a Cruzadinha de novo.');
  var key = norm(req.nome);
  var me = playersOf(room.token).filter(function (a) { return a.nome_key === key; })[0];
  if (!me) fail('Aluno não encontrado nesta sala. Entre novamente.');
  var gid = String(grade.id);
  var dicas = readRows('CtfCruzDicas').filter(function (d) {
    return String(d.token) === room.token && String(d.grade) === gid && d.nome_key === key;
  });
  var caps = readRows('CtfCruzCapturas').filter(function (c) { return String(c.token) === room.token && String(c.grade) === gid; });
  return { room: room, grade: grade, limite: limite, key: key, me: me, dicas: dicas, caps: caps };
}

// Casas reveladas por dica: { "r,c": letra }
function cruzReveladas(ctx) {
  var rev = {};
  ctx.dicas.forEach(function (d) {
    var p = ctx.grade.palavras[Number(d.palavra_id)];
    if (!p) return;
    var cel = cruzCelulas(p);
    cel.forEach(function (rc, i) {
      if (d.tipo === 'palavra' || i === Number(d.indice)) rev[rc[0] + ',' + rc[1]] = p.palavra[i];
    });
  });
  return rev;
}

function cruzMinhas(ctx) {
  var m = {};
  ctx.caps.forEach(function (c) { if (c.nome_key === ctx.key) m[Number(c.palavra_id)] = c; });
  return m;
}

// O que o aluno recebe: a grade SEM as letras, as casas reveladas por dica e as palavras que ele ja acertou.
function cruzSaida(ctx) {
  var rev = cruzReveladas(ctx), minhas = cruzMinhas(ctx), xp = 0;
  var resolvidas = Object.keys(minhas).map(function (id) {
    var c = minhas[id], p = ctx.grade.palavras[Number(id)];
    xp += Number(c.xp) || 0;
    return { id: Number(id), palavra: p ? p.palavra : '', posicao: Number(c.posicao), xp: Number(c.xp) || 0 };
  });
  return {
    grade: {
      id: ctx.grade.id, h: ctx.grade.h, w: ctx.grade.w,
      palavras: ctx.grade.palavras.map(function (p) {
        return { id: p.id, n: p.n, dir: p.dir, r: p.r, c: p.c, tam: p.palavra.length, dica: p.dica };
      })
    },
    limite: ctx.limite,
    usadas: ctx.dicas.length,
    reveladas: Object.keys(rev).map(function (k) { var rc = k.split(','); return [Number(rc[0]), Number(rc[1]), rev[k]]; }),
    resolvidas: resolvidas,
    xp: xp
  };
}

function cruzRetorno(ctx, extra) {
  var st = ctx.room.tipo === 'rali' || isLivre(ctx.room) ? raliBuildState(ctx.room, ctx.key) : buildState(ctx.room, ctx.key);
  st.cruz = cruzSaida(ctx);
  for (var k in (extra || {})) st.cruz[k] = extra[k];
  return st;
}

function cruzState(req) {
  return cruzRetorno(cruzContexto(req, false));
}

// Confere uma palavra completa. Palavra com casa revelada por dica vale metade; toda revelada vale 0.
function cruzCheck(req) {
  var ctx = cruzContexto(req, true);
  var p = ctx.grade.palavras[Number(req.id)];
  if (!p) fail('Palavra não encontrada.');
  if (cruzLetras(req.tentativa) !== p.palavra) return cruzRetorno(ctx, { correta: false, id: p.id });
  if (cruzMinhas(ctx)[p.id]) return cruzRetorno(ctx, { correta: true, id: p.id });
  var rev = cruzReveladas(ctx), cel = cruzCelulas(p), ajudadas = 0;
  cel.forEach(function (rc) { if (rev[rc[0] + ',' + rc[1]]) ajudadas++; });
  if (ajudadas === cel.length) return cruzRetorno(ctx, { correta: true, id: p.id });
  var posicao = ctx.caps.filter(function (c) { return Number(c.palavra_id) === p.id; }).length + 1;
  var xp = Math.round(pontos(p.palavra.length * 10, posicao, ctx.room.modo) * (ajudadas ? 0.5 : 1));
  var row = {
    token: ctx.room.token, grade: ctx.grade.id, nome_key: ctx.key, palavra: p.palavra, palavra_id: p.id,
    posicao: posicao, ajuda: ajudadas ? 1 : 0, xp: xp, timestamp: new Date().toISOString()
  };
  appendObj('CtfCruzCapturas', row);
  ctx.caps.push(row);
  var fogo = ctx.room.modo === 'ctf_dynamic' && posicao === 1;
  var updAluno = { xp: Number(ctx.me.xp) + xp, xp_cruz: (Number(ctx.me.xp_cruz) || 0) + xp };
  if (isCruz(ctx.room)) {
    // Na sala de Cruzadinha cada palavra conta como um acerto (e o primeiro a fechar ganha o fogo)
    updAluno.acertos = (Number(ctx.me.acertos) || 0) + 1;
    updAluno.fogos = (Number(ctx.me.fogos) || 0) + (fogo ? 1 : 0);
    updAluno.ultimo_acerto = Date.now();
    ctx.me.acertos = updAluno.acertos;
  }
  updateRow('CtfAlunos', ctx.me._row, updAluno);
  ctx.me.xp = updAluno.xp;
  return cruzRetorno(ctx, { correta: true, id: p.id, nova: { palavra: p.palavra, posicao: posicao, xp: xp } });
}

// Banco da Cruzadinha pelo painel do professor (qualquer sala aberta por ele serve de chave).
function cruzBancoResumo(req) {
  requireAdmin(req);
  var por = {};
  CRUZ_DISCIPLINAS.forEach(function (d) { por[d] = 0; });
  cruzBanco().forEach(function (b) { if (por[b.disciplina] !== undefined) por[b.disciplina]++; });
  return { por_disciplina: por };
}

function cruzBancoImport(req) {
  requireAdmin(req);
  var vals = [];
  (Array.isArray(req.linhas) ? req.linhas : []).slice(0, 3000).forEach(function (l) {
    var d = String(l && l[0] || '').trim();
    var p = cruzLetras(l && l[1]);
    var dica = safeText(String(l && l[2] || '').trim().substring(0, 200));
    if (CRUZ_DISCIPLINAS.indexOf(d) >= 0 && p.length >= 3 && p.length <= 16 && dica) vals.push([d, p, dica, 'sim']);
  });
  if (!vals.length) fail('Nenhuma linha válida. Use o formato: disciplina;palavra;dica');
  var sh = getSheet('CruzBanco');
  if (req.substituir === true && sh.getLastRow() > 1) sh.deleteRows(2, sh.getLastRow() - 1);
  sh.getRange(sh.getLastRow() + 1, 1, vals.length, 4).setValues(vals);
  var r = cruzBancoResumo(req);
  r.importadas = vals.length;
  return r;
}

// Dica: o servidor entrega a letra (ou a palavra) e conta o uso. Nao gasta dica com letra ja conhecida.
function cruzHint(req) {
  var ctx = cruzContexto(req, true);
  if (ctx.dicas.length >= ctx.limite) fail(ctx.limite ? 'Suas dicas acabaram.' : 'O professor desativou as dicas nesta sala.');
  var p = ctx.grade.palavras[Number(req.id)];
  if (!p) fail('Palavra não encontrada.');
  if (cruzMinhas(ctx)[p.id]) fail('Essa palavra já está resolvida.');
  var tipo = req.tipo === 'palavra' ? 'palavra' : 'letra';
  var indice = tipo === 'letra' ? Math.floor(Number(req.indice)) : '';
  var cel = cruzCelulas(p), rev = cruzReveladas(ctx);
  if (tipo === 'letra') {
    if (!(indice >= 0 && indice < cel.length)) fail('Escolha uma letra da palavra.');
    if (rev[cel[indice][0] + ',' + cel[indice][1]]) fail('Essa letra já foi revelada.');
  }
  var row = { token: ctx.room.token, grade: ctx.grade.id, nome_key: ctx.key, tipo: tipo, palavra_id: p.id, indice: indice, timestamp: new Date().toISOString() };
  appendObj('CtfCruzDicas', row);
  ctx.dicas.push(row);
  return cruzRetorno(ctx, { dica: tipo, id: p.id });
}

// Debriefing: gabarito da sala (pergunta, resposta, explicacao e quantos acertaram).
// O professor sempre ve; os alunos so veem depois que o professor libera.
function debriefList(room) {
  if (isCruz(room)) {
    var g = cruzGrade(room);
    var porPal = {};
    readRows('CtfCruzCapturas').forEach(function (c) {
      if (String(c.token) === room.token && g && String(c.grade) === String(g.id)) porPal[Number(c.palavra_id)] = (porPal[Number(c.palavra_id)] || 0) + 1;
    });
    var lista = (g ? g.palavras : []).slice().sort(function (a, b) { return a.n - b.n || (a.dir < b.dir ? -1 : 1); });
    return {
      sala: roomInfo(room),
      itens: lista.map(function (p, i) {
        return {
          fase: i + 1, tag_id: 'cruz_' + p.id, categoria: p.n + (p.dir === 'A' ? ' horizontal' : ' vertical'), pacote: 'Cruzadinha',
          pergunta: p.dica, resposta: p.palavra, alternativas: [], opcoes: [], xp: p.palavra.length * 10, explicacao: '',
          acertos: porPal[p.id] || 0
        };
      }),
      total_alunos: playersOf(room.token).length
    };
  }
  var caps = readRows('CtfCapturas').filter(function (c) { return String(c.token) === room.token; });
  var porTag = {};
  caps.forEach(function (c) { porTag[String(c.tag_id)] = (porTag[String(c.tag_id)] || 0) + 1; });
  var itens = readRows('CtfMissoes')
    .filter(function (m) { return String(m.token) === room.token; })
    .sort(function (a, b) { return Number(a.fase) - Number(b.fase); })
    .map(function (m) {
      return {
        fase: Number(m.fase), tag_id: String(m.tag_id), categoria: m.categoria, pacote: m.pacote,
        pergunta: m.pergunta, resposta: String(m.resposta), alternativas: parseList(m.alternativas),
        opcoes: parseList(m.opcoes), xp: Number(m.xp), explicacao: String(m.explicacao || ''),
        acertos: porTag[String(m.tag_id)] || 0
      };
    });
  return { sala: roomInfo(room), itens: itens, total_alunos: playersOf(room.token).length };
}

function debriefTeacher(req) {
  return debriefList(requireAdmin(req));
}

function debriefStudent(req) {
  var room = requireRoom(req.token);
  var liberado = room.debriefing_liberado === true || String(room.debriefing_liberado).toLowerCase() === 'true';
  if (!liberado) fail('O professor ainda não liberou o debriefing.');
  return debriefList(room);
}

function setDebriefing(req) {
  var room = requireAdmin(req);
  var liberado = req.liberado === true;
  updateRow('CtfSalas', room._row, { debriefing_liberado: liberado });
  room.debriefing_liberado = liberado;
  logEvento(room, liberado ? 'debriefing_liberado' : 'debriefing_oculto', '');
  return { sala: roomInfo(room) };
}

function setStatus(req) {
  var room = requireAdmin(req);
  var status = req.status === 'encerrada' ? 'encerrada' : 'aberta';
  updateRow('CtfSalas', room._row, { status: status, encerrada_em: status === 'encerrada' ? new Date().toISOString() : '' });
  room.status = status;
  if (status === 'encerrada') {
    room.encerrada_em = new Date().toISOString();
    gravarResumo(room);
  }
  logEvento(room, status === 'encerrada' ? 'encerrada' : 'reaberta', '');
  return { sala: roomInfo(room) };
}

// ---------- Registro (log) e analise ----------
// CtfLog: um evento por linha. CtfResumo: uma linha por sala (atualizada ao encerrar).
// CtfAnalise: uma linha por pergunta de cada sala encerrada (acertos e taxa), para estudar as perguntas.

function safeText(v) {
  var t = String(v === undefined || v === null ? '' : v);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function logEvento(room, evento, detalhe) {
  try {
    appendObj('CtfLog', {
      quando: new Date().toISOString(), token: room.token, sala: safeText(room.nome),
      tipo: room.tipo === 'rali' ? 'rali' : 'ctf', evento: evento, detalhe: safeText(detalhe)
    });
  } catch (err) {}
}

function statsOf(room) {
  var ps = playersOf(room.token);
  var ac = 0, er = 0, xp = 0;
  ps.forEach(function (a) { ac += Number(a.acertos) || 0; er += Number(a.erros) || 0; xp += Number(a.xp) || 0; });
  return {
    participantes: ps.length, acertos: ac, erros: er, xp_total: xp,
    xp_medio: ps.length ? Math.round(xp / ps.length) : 0,
    taxa_acerto: ac + er ? Math.round(100 * ac / (ac + er)) : 0
  };
}

function gravarResumo(room) {
  try {
    var st = statsOf(room);
    var ini = new Date(room.criada_em).getTime();
    var fim = new Date(room.encerrada_em).getTime();
    var obj = {
      token: room.token, sala: safeText(room.nome), tipo: room.tipo === 'rali' ? 'rali' : 'ctf',
      criada_em: room.criada_em, encerrada_em: room.encerrada_em,
      duracao_min: ini && fim ? Math.round((fim - ini) / 60000) : '',
      perguntas: Number(room.total_fases), participantes: st.participantes, acertos: st.acertos,
      erros: st.erros, taxa_acerto: st.taxa_acerto, xp_total: st.xp_total, xp_medio: st.xp_medio
    };
    var found = readRows('CtfResumo').filter(function (r) { return String(r.token) === room.token; })[0];
    if (found) updateRow('CtfResumo', found._row, obj); else appendObj('CtfResumo', obj);

    var antigos = readRows('CtfAnalise').filter(function (r) { return String(r.token) === room.token; });
    var sh = getSheet('CtfAnalise');
    for (var i = antigos.length - 1; i >= 0; i--) sh.deleteRow(antigos[i]._row);
    var d = debriefList(room);
    var linhas = d.itens.map(function (it) {
      return [room.token, safeText(room.nome), it.fase, it.tag_id, safeText(it.pacote), safeText(it.pergunta), it.acertos,
        d.total_alunos, d.total_alunos ? Math.round(100 * it.acertos / d.total_alunos) : 0];
    });
    if (linhas.length) sh.getRange(sh.getLastRow() + 1, 1, linhas.length, SHEET_HEADERS.CtfAnalise.length).setValues(linhas);
  } catch (err) {}
}

// Lista as salas guardadas no servidor (precisa da chave do banco). Serve de historico em qualquer aparelho.
function salasList(req) {
  requireBancoKey(req);
  var salas = readRows('CtfSalas').slice(-200).reverse().map(function (r) {
    var st = statsOf(r);
    return {
      token: String(r.token), nome: String(r.nome), tipo: r.tipo === 'rali' ? 'rali' : 'ctf',
      adminKey: String(r.admin_key), status: r.status === 'encerrada' ? 'encerrada' : 'aberta',
      criada: new Date(r.criada_em).getTime() || 0,
      encerrada: r.encerrada_em ? new Date(r.encerrada_em).getTime() || 0 : 0,
      total: Number(r.total_fases), participantes: st.participantes, taxa_acerto: st.taxa_acerto, xp_medio: st.xp_medio
    };
  });
  return { salas: salas };
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
  if (!(t.f > 0)) fail('O cronômetro está parado. Aguarde o professor iniciar.');
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
  if (!hash) fail('O banco de perguntas ainda não foi configurado. Rode setupBanco() no editor do Apps Script.');
  if (sha256hex(String(req.chave || '')) !== hash) {
    Utilities.sleep(1200);
    fail('Chave do banco inválida.');
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
  fail('Pergunta não encontrada.');
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
  if (list.length > 200) fail('Máximo de 200 missões publicadas.');
  var now = new Date().toISOString();
  var seen = {};
  var values = list.map(function (m) {
    var tag = String(m.tag_id || '').trim().toLowerCase();
    if (!/^(tag|linux)_[a-z0-9_]+$/.test(tag)) fail('Tag inválida: ' + tag);
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
