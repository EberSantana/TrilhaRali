/**
 * Backend do módulo CTF (Google Apps Script).
 * É um projeto SEPARADO do script do Rali NFC: cole em uma planilha à parte e publique como Web App
 * (Executar como: você • Quem tem acesso: Qualquer pessoa).
 *
 * As respostas ficam apenas na planilha: o aluno recebe somente a pergunta da fase atual e a
 * validação (e o avanço de fase) acontece no servidor.
 */
const SCRIPT_BASE = String.raw`// ==========================================================
// TRILHA RALI - MODULO CTF (IFS CAMPUS TOBIAS BARRETO)
// Cole em: Extensoes > Apps Script de uma planilha NOVA.
// Implantar > Nova implantacao > Aplicativo da Web
//   Executar como: Eu  |  Quem pode acessar: Qualquer pessoa
// ==========================================================

var SHEET_HEADERS = {
  CtfSalas: ['token', 'nome', 'admin_key', 'status', 'modo', 'criada_em', 'total_fases', 'banco_liberado', 'timer', 'tipo', 'ordem', 'terminal_liberado', 'debriefing_liberado', 'encerrada_em', 'cruzadinha_dicas', 'cruzadinha_palavras', 'cruzadinha_gabarito', 'cruzadinha_grade', 'cruzadinha_disc', 'cruzadinha_assuntos', 'cruzadinha_reveals', 'turma', 'papeis'],
  CtfMissoes: ['token', 'fase', 'tag_id', 'categoria', 'pacote', 'pergunta', 'resposta', 'alternativas', 'xp', 'opcoes', 'explicacao'],
  CtfAlunos: ['token', 'nome', 'nome_key', 'fase_atual', 'xp', 'acertos', 'erros', 'fogos', 'entrou_em', 'ultimo_acerto', 'ultimo_erro', 'integrantes', 'chave', 'xp_cruz', 'avatar'],
  CtfCapturas: ['token', 'tag_id', 'nome', 'posicao', 'xp', 'is_fogo', 'timestamp'],
  CtfCruzCapturas: ['token', 'nome_key', 'palavra', 'posicao', 'ajuda', 'xp', 'timestamp', 'grade', 'palavra_id'],
  CtfCruzDicas: ['token', 'grade', 'nome_key', 'tipo', 'palavra_id', 'indice', 'timestamp'],
  CruzBanco: ['disciplina', 'palavra', 'dica', 'ativo', 'assunto'],
  CtfLog: ['quando', 'token', 'sala', 'tipo', 'evento', 'detalhe'],
  CruzRanking: ['quando', 'nome', 'pontos', 'palavras', 'dicas', 'assuntos', 'gid'],
  DesvRanking: ['quando', 'nome', 'gid', 'caso', 'pontos', 'erros', 'dicas', 'token'],
  DesvSalas: ['token', 'nome', 'admin_key', 'status', 'casos', 'criada_em', 'turma', 'papeis'],
  Turmas: ['id', 'nome', 'alunos', 'atualizado_em'],
  DesvDuplas: ['token', 'gid', 'nome', 'integrantes', 'entrou_em', 'avatar'],
  DesvGabarito: ['caso', 'suspeito', 'pontos', 'explicacao'],
  CtfResumo: ['token', 'sala', 'tipo', 'criada_em', 'encerrada_em', 'duracao_min', 'perguntas', 'participantes', 'acertos', 'erros', 'taxa_acerto', 'xp_total', 'xp_medio'],
  CtfAnalise: ['token', 'sala', 'fase', 'tag_id', 'pacote', 'pergunta', 'acertos', 'participantes', 'taxa_acerto'],
  CtfErros: ['token', 'tag_id', 'nome_key', 'timestamp'],
  Banco: ['id', 'disciplina', 'assunto', 'tipo', 'pergunta', 'resposta', 'aceitas', 'opcoes', 'xp', 'explicacao', 'ativo', 'atualizado_em'],
  NfcPublicadas: ['tag_id', 'disciplina', 'assunto', 'tipo', 'pergunta', 'resposta', 'aceitas', 'opcoes', 'xp', 'explicacao', 'publicada_em']
};
var TEXT_SHEETS = { CtfMissoes: 1, Banco: 1, NfcPublicadas: 1, CruzRanking: 1, DesvRanking: 1, DesvGabarito: 1, DesvSalas: 1, DesvDuplas: 1, Turmas: 1 };
var TOKEN_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
var TOKEN_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
var WRITE_ACTIONS = { createRoom: 1, deleteRoom: 1, desvApagar: 1, join: 1, submit: 1, raliSubmit: 1, setStatus: 1, setBanco: 1, setTerminal: 1, setCruzadinha: 1, cruzBancoImport: 1, cruzState: 1, cruzCheck: 1, cruzHint: 1, cruzTreinoRanking: 1, desvAcusar: 1, createDesvRoom: 1, turmaSalvar: 1, turmaExcluir: 1, liberarNome: 1, desvEntrar: 1, desvProf: 1, setDebriefing: 1, setTimer: 1, raliTimer: 1, setTema: 1, bancoSave: 1, bancoDelete: 1, bancoImport: 1, nfcPublish: 1 };
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
  return out({ ok: true, servico: 'Trilha Rali', versao: 35, revisao: '__REVISAO__' });
}

// ===== BACKUP SEMANAL =====
// Rode UMA vez a funcao instalarBackup() no editor (menu Executar) para agendar a copia automatica.
// Toda segunda-feira, de madrugada, o script copia esta planilha para o Drive e guarda as 8 copias mais recentes.
function backupSemanal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var fuso = Session.getScriptTimeZone();
  var nome = 'Backup Trilha Rali ' + Utilities.formatDate(new Date(), fuso, 'yyyy-MM-dd HH-mm');
  DriveApp.getFileById(ss.getId()).makeCopy(nome);
  var it = DriveApp.searchFiles("title contains 'Backup Trilha Rali ' and trashed = false and mimeType = 'application/vnd.google-apps.spreadsheet'");
  var lista = [];
  while (it.hasNext()) { var f = it.next(); lista.push({ f: f, t: f.getDateCreated().getTime() }); }
  lista.sort(function (a, b) { return b.t - a.t; });
  for (var i = 8; i < lista.length; i++) lista[i].f.setTrashed(true);
  return nome;
}

function instalarBackup() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'backupSemanal') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('backupSemanal').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(3).create();
  return backupSemanal();
}

function doPost(e) {
  var req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return out({ error: 'Requisicao invalida.' });
  }
  var lock = null;
  ROWS_MEMO = {};
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
    case 'deleteRoom': return deleteRoom(req);
    case 'setBanco': return setBanco(req);
    case 'setTerminal': return setTerminal(req);
    case 'setCruzadinha': return setCruzadinha(req);
    case 'cruzState': return cruzState(req);
    case 'cruzBancoImport': return cruzBancoImport(req);
    case 'cruzBancoResumo': return cruzBancoResumo(req);
    case 'cruzAssuntos': return cruzAssuntos(req);
    case 'cruzCheck': return cruzCheck(req);
    case 'cruzHint': return cruzHint(req);
    case 'cruzTreinoNovo': return cruzTreinoNovo(req);
    case 'cruzTreinoEstado': return cruzTreinoEstado(req);
    case 'cruzTreinoCheck': return cruzTreinoCheck(req);
    case 'cruzTreinoHint': return cruzTreinoHint(req);
    case 'cruzTreinoRanking': return cruzTreinoRanking(req);
    case 'cruzRanking': return cruzRanking(req);
    case 'desvAcusar': return desvAcusar(req);
    case 'desvRanking': return desvRanking(req);
    case 'createDesvRoom': return createDesvRoom(req);
    case 'desvEntrar': return desvEntrar(req);
    case 'desvEstado': return desvEstado(req);
    case 'desvProf': return desvProf(req);
    case 'desvApagar': return desvApagar(req);
    case 'desvSalasList': return desvSalasList(req);
    case 'desvGabaritoSet': return desvGabaritoSet(req);
    case 'turmasList': return turmasList(req);
    case 'turmaSalvar': return turmaSalvar(req);
    case 'turmaExcluir': return turmaExcluir(req);
    case 'turmaNotas': return turmaNotas(req);
    case 'turmaAnalise': return turmaAnalise(req);
    case 'salaTurma': return salaTurma(req);
    case 'liberarNome': return liberarNome(req);
    case 'cruzRankingApagar': return cruzRankingApagar(req);
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
    case 'nfcSet': return nfcSet(req);
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

// Cada aba e lida uma vez por requisicao: as leituras seguintes vem da memoria (copias das linhas).
// Toda gravacao limpa a memoria da aba (memoLimpa), entao nunca se le dado velho.
var ROWS_MEMO = {};

function memoLimpa(name) {
  if (name) delete ROWS_MEMO[name]; else ROWS_MEMO = {};
}

function readRows(name) {
  var rows = ROWS_MEMO[name];
  if (!rows) {
    var values = getSheet(name).getDataRange().getValues();
    var head = values[0];
    rows = [];
    for (var i = 1; i < values.length; i++) {
      var o = { _row: i + 1 };
      for (var j = 0; j < head.length; j++) o[head[j]] = values[i][j];
      rows.push(o);
    }
    ROWS_MEMO[name] = rows;
  }
  return rows.map(function (r) { var c = {}; for (var k in r) c[k] = r[k]; return c; });
}

function appendObj(name, obj) {
  var head = SHEET_HEADERS[name];
  getSheet(name).appendRow(head.map(function (k) { return obj[k] === undefined ? '' : obj[k]; }));
  memoLimpa(name);
}

function updateRow(name, row, obj) {
  var head = SHEET_HEADERS[name];
  var sh = getSheet(name);
  var campos = Object.keys(obj).filter(function (k) { return head.indexOf(k) >= 0; });
  if (campos.length >= 3) {
    // varias colunas: uma leitura e uma gravacao da linha, em vez de uma chamada por campo
    var faixa = sh.getRange(row, 1, 1, head.length);
    var linha = faixa.getValues()[0];
    campos.forEach(function (k) { linha[head.indexOf(k)] = obj[k]; });
    faixa.setValues([linha]);
  } else {
    campos.forEach(function (k) { sh.getRange(row, head.indexOf(k) + 1).setValue(obj[k]); });
  }
  memoLimpa(name);
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
    tipo: tipoOut(room),
    ordem: isCruz(room) ? 'cruzadinha' : isLivre(room) ? 'livre' : 'sequencial',
    total: Number(room.total_fases),
    banco: room.banco_liberado === true || String(room.banco_liberado).toLowerCase() === 'true',
    terminal: room.terminal_liberado === true || String(room.terminal_liberado).toLowerCase() === 'true',
    cruzadinha: cruzadinhaDicas(room),
    cruzadinha_reveals: cruzadinhaReveals(room),
    cruzadinha_palavras: cruzadinhaPalavras(room),
    cruzadinha_assuntos: cruzRotulos(cruzSelecaoSala(room)),
    cruzadinha_versao: cruzadinhaDicas(room) === null ? undefined : (cruzGrade(room) || {}).id,
    debriefing: room.debriefing_liberado === true || String(room.debriefing_liberado).toLowerCase() === 'true',
    timer: timerOut(parseTimer(room.timer), Date.now()),
    tema: getTema(),
    papeis: String(room.papeis || ''),
    agora: Date.now()
  };
}

// Papeis da dupla/equipe (piloto, copiloto, engenheiro): '' = sem papeis, rodizio = giram a cada acerto,
// fixos = nao mudam, dupla = os alunos trocam quando quiserem.
function papeisModo(v, padrao, aceitaIndividual) {
  var m = String(v === undefined ? padrao : v || '');
  if (m === 'individual') return aceitaIndividual ? m : '';
  return m === 'rodizio' || m === 'fixos' || m === 'dupla' ? m : '';
}

// Capacete escolhido pelo aluno (avatar): so ids conhecidos, para nao gravar texto livre na planilha.
var AVATARES_OK = { rubi: 1, oceano: 1, floresta: 1, sol: 1, laranja: 1, violeta: 1, rosa: 1, noturno: 1, gelo: 1, turquesa: 1, lima: 1, vinho: 1 };
function avatarId(v) {
  // um capacete por integrante da dupla/trio, na ordem da cabine: "rubi,oceano,sol" (posicao sem escolha fica vazia)
  var partes = String(v || '').toLowerCase().split(',').slice(0, 3).map(function (x) { x = x.trim(); return AVATARES_OK[x] ? x : ''; });
  while (partes.length && !partes[partes.length - 1]) partes.pop();
  return partes.join(',');
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
      erros: Number(me.erros), fogos: Number(me.fogos), posicao: pos, concluido: concluido,
      integrantes: parseList(me.integrantes), avatar: String(me.avatar || '')
    },
    missao: missao,
    ranking: ranked.slice(0, 15).map(function (a) {
      return { nome: a.nome, fase: cruz ? Number(a.acertos) || 0 : Number(a.fase_atual), xp: Number(a.xp), fogos: Number(a.fogos), avatar: String(a.avatar || '') };
    }),
    total_alunos: ranked.length
  };
}

// ---------- Acoes ----------

// Cruzada Online e um modulo proprio (tipo 'cruz'). Salas da v19 (tipo ctf + ordem cruzadinha) continuam valendo.
function isCruz(room) {
  return room.tipo !== 'rali' && (room.tipo === 'cruz' || String(room.ordem) === 'cruzadinha');
}

// Tipo mostrado fora do servidor: rali, cruz ou ctf
function tipoOut(room) {
  return room.tipo === 'rali' ? 'rali' : isCruz(room) ? 'cruz' : 'ctf';
}

// Sala de Cruzadinha: em vez de perguntas, o professor escolhe a disciplina; o servidor monta a grade na hora
// e o aluno entra direto nela. O ranking conta as palavras acertadas.
function createCruzRoom(req) {
  var sel = cruzSelecaoReq(req);
  if (!sel.length) fail('Escolha ao menos uma disciplina para a Cruzadinha.');
  var disc = cruzDiscsDe(sel).join('|');
  var palavras = Math.max(6, Math.min(25, Math.floor(Number(req.palavras)) || 12));
  var dicas = Math.max(0, Math.min(30, Math.floor(Number(req.dicas)) || 0));
  var banco = cruzFonte(sel);
  if (banco.length < 6) fail(cruzPoucas(sel, banco.length));
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
    tipo: 'cruz', ordem: 'cruzadinha', turma: turmaIdValido(req.turma),
    cruzadinha_dicas: dicas, cruzadinha_reveals: cruzLimiteReveals(req.reveals, 5), cruzadinha_palavras: palavras, cruzadinha_grade: JSON.stringify(grade), cruzadinha_disc: disc,
    cruzadinha_assuntos: JSON.stringify(sel)
  });
  logEvento({ token: token, nome: nome, tipo: 'cruz' }, 'criada', 'cruzada de ' + cruzRotulos(sel).join(', ') + '; ' + grade.palavras.length + ' palavras; ' + dicas + ' dicas; modo ' + modo);
  return { token: token, adminKey: adminKey, total: grade.palavras.length, tipo: 'cruz', ordem: 'cruzadinha' };
}

function createRoom(req) {
  if (req.tipo !== 'rali' && (req.tipo === 'cruz' || req.ordem === 'cruzadinha')) return createCruzRoom(req);
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
    papeis: tipo === 'rali' || tipo === 'ctf' ? papeisModo(req.papeis, '', false) : '',
    tipo: tipo,
    ordem: ordem,
    turma: turmaIdValido(req.turma)
  });

  logEvento({ token: token, nome: nome, tipo: tipo }, 'criada', missions.length + ' perguntas; modo ' + modo + (tipo === 'ctf' ? '; ordem ' + ordem : ''));

  var sh = getSheet('CtfMissoes');
  var rows = missions.map(function (m, i) {
    return [token, i + 1, m.tag_id, m.categoria || '', m.pacote || '', m.pergunta, m.resposta,
      JSON.stringify(m.alternativas || []), m.xp || 10, JSON.stringify(m.opcoes || []),
      String(m.explicacao || '').substring(0, 800)];
  });
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, SHEET_HEADERS.CtfMissoes.length).setValues(rows);
  memoLimpa('CtfMissoes');
  return { token: token, adminKey: adminKey, total: missions.length, tipo: tipo, ordem: ordem };
}

function join(req) {
  var room = requireRoom(req.token);
  var nome = cleanName(req.nome);
  var comEquipe = room.tipo === 'rali' || (room.tipo === 'ctf' && !!room.papeis);
  if (room.tipo !== 'rali') nome = nomeDaTurma(room.turma, nome);
  if (comEquipe && room.turma) req.integrantes = (Array.isArray(req.integrantes) ? req.integrantes : []).map(function (n) { return nomeDaTurma(room.turma, n); });
  var key = norm(nome);
  var found = playersOf(room.token).filter(function (a) { return a.nome_key === key; })[0];
  var chave = String(req.chave || '');
  if (found && found.chave && String(found.chave) !== chave) {
    // O aluno perdeu o aparelho/navegador e confirmou "sou eu": volta com a chave que ja existe (o outro aparelho continua valendo).
    if (room.turma && req.retomar) chave = String(found.chave);
    else if (room.turma) fail('Este nome já entrou na sala em outro celular. Se você trocou de aparelho ou de navegador, toque no seu nome na lista e escolha "Sou eu, retomar".');
    else fail('Já existe alguém com este nome nesta sala. Use outro nome (ex.: nome e sobrenome).');
  }
  if (comEquipe && room.turma && !found) {
    var jaNaSala = {};
    playersOf(room.token).forEach(function (a) {
      parseList(a.integrantes).forEach(function (n) { jaNaSala[norm(n)] = String(a.nome); });
      if (room.tipo === 'ctf') jaNaSala[norm(a.nome)] = String(a.nome);
    });
    if (room.tipo === 'ctf' && jaNaSala[key]) fail(nome + ' já está na dupla de ' + jaNaSala[key] + '.');
    (req.integrantes || []).forEach(function (n) {
      if (norm(n) === key) fail(n + ' foi escolhido duas vezes.');
      if (jaNaSala[norm(n)]) fail(n + ' já está na equipe ' + jaNaSala[norm(n)] + '.');
    });
  }
  var avatar = avatarId(req.avatar);
  if (found && avatar && String(found.avatar || '') !== avatar) updateRow('CtfAlunos', found._row, { avatar: avatar });
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
      integrantes: comEquipe ? JSON.stringify(cleanMembers(req.integrantes)) : '',
      avatar: avatar
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
    appendObj('CtfErros', { token: room.token, tag_id: String(m.tag_id), nome_key: key, timestamp: agora });
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
      return { nome: a.nome, fase: Number(a.acertos), xp: Number(a.xp), fogos: Number(a.fogos), avatar: String(a.avatar || '') };
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
    appendObj('CtfErros', { token: room.token, tag_id: tag, nome_key: key, timestamp: agora });
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

// O aluno trocou de celular: o professor apaga a chave do nome e o proximo aparelho que entrar com ele assume.
function liberarNome(req) {
  var room = requireAdmin(req);
  var key = norm(req.nome);
  var a = playersOf(room.token).filter(function (p) { return p.nome_key === key; })[0];
  if (!a) fail('Esse nome não está na sala.');
  updateRow('CtfAlunos', a._row, { chave: '' });
  return { ok: true };
}

function teacherRoom(req) {
  var room = requireAdmin(req);
  var alunos = rankPlayers(playersOf(room.token)).map(function (a) {
    return {
      nome: a.nome, fase_atual: Number(a.fase_atual), xp: Number(a.xp), acertos: Number(a.acertos),
      erros: Number(a.erros), fogos: Number(a.fogos), ultimo_acerto: a.ultimo_acerto === '' ? '' : Number(a.ultimo_acerto),
      ultimo_erro: a.ultimo_erro === '' || a.ultimo_erro === undefined ? '' : Number(a.ultimo_erro),
      entrou_em: a.entrou_em === '' || a.entrou_em === undefined ? '' : Number(a.entrou_em),
      integrantes: parseList(a.integrantes)
    };
  });
  var sala = roomInfo(room);
  return { sala: sala, alunos: alunos, agora: Date.now() };
}

// Apaga de vez uma sala ENCERRADA e tudo o que ela gerou (alunos, capturas, dicas, resumo e analise).
// O CtfLog fica como registro. Precisa da chave de professor da sala.
function deleteRoom(req) {
  var room = requireAdmin(req);
  if (room.status !== 'encerrada' && req.encerrar !== true) fail('Encerre a sala antes de apagá-la de vez.');
  var abas = ['CtfMissoes', 'CtfAlunos', 'CtfCapturas', 'CtfErros', 'CtfCruzCapturas', 'CtfCruzDicas', 'CtfResumo', 'CtfAnalise', 'CtfSalas'];
  var total = 0;
  abas.forEach(function (nome) {
    var rows = readRows(nome);
    for (var i = rows.length - 1; i >= 0; i--) {
      if (String(rows[i].token) === room.token) { getSheet(nome).deleteRow(rows[i]._row); total++; }
    }
    memoLimpa(nome);
  });
  logEvento(room, 'apagada', total + ' linhas removidas');
  return { ok: true, apagadas: total };
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

// "Revelar palavra" tem limite proprio (padrao 5, maximo 10), separado das dicas de letra. Coluna vazia = padrao;
// sem dicas de letra (0) tambem nao ha como revelar palavra.
function cruzadinhaReveals(room) {
  var d = cruzadinhaDicas(room);
  if (d === 0) return 0;
  var v = room.cruzadinha_reveals;
  if (v === '' || v === null || v === undefined) return 5;
  var n = Number(v);
  return isNaN(n) ? 5 : Math.max(0, Math.min(10, Math.floor(n)));
}

function cruzLimiteReveals(v, padrao) {
  if (v === null || v === undefined || v === '') return padrao;
  return Math.max(0, Math.min(10, Math.floor(Number(v)) || 0));
}

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
  if (room.cruzadinha_disc) return String(room.cruzadinha_disc).split('|').map(cruzDiscNome).filter(function (d) { return d; });
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

// Banco de palavras: aba CruzBanco (disciplina, palavra, dica, ativo, assunto). Marque "nao" em ativo para tirar uma palavra.
// Desde a v22 as perguntas ativas do Banco de perguntas tambem viram palavras: a resposta (uma ou duas palavras,
// 3 a 16 letras) e a palavra e a pergunta e a dica, no mesmo assunto. A aba CruzBanco vence se a palavra se repetir.
function cruzAssuntoLimpo(v) {
  var a = String(v === undefined || v === null ? '' : v).replace(/\s+/g, ' ').trim();
  return a || 'Geral';
}

// Nome de disciplina como esta no Banco (qualquer uma serve; as quatro da v20 continuam com os mesmos nomes).
function cruzDiscNome(v) {
  return String(v === undefined || v === null ? '' : v).replace(/\s+/g, ' ').trim().substring(0, 80);
}

// Pergunta do Banco so serve de dica de cruzada se ficar clara SEM alternativas e tiver uma unica resposta:
// multipla escolha e perguntas do tipo "qual destes..." / "assinale..." / "abaixo" ficam de fora.
function cruzPerguntaServe(r, dica) {
  if (r.tipo === 'multipla') return false;
  var t = ' ' + dica.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') + ' ';
  return !/\b(qual|quais|que)\s+(destes?|destas?|dos|das|d[oa]s? seguintes?)\b|\b(dentre|assinale|marque|alternativas?|opcoes|opcao|abaixo|acima|seguintes?|a seguir|todas as anteriores|nenhuma das)\b/.test(t);
}

// Palavras da Cruzada (CruzBanco + perguntas do Banco): guardadas 2 min no cache do servidor, ja filtradas.
// Salvar/apagar/importar pelo painel limpa o cache na hora; edicao direta na planilha aparece em ate 2 min.
function bancoCacheLimpa() {
  var c = CacheService.getScriptCache();
  c.remove('cruzBanco_v29');
  c.remove('cruzAssuntos_v23');
}

function cruzBanco() {
  var cache = CacheService.getScriptCache();
  var guardado = cache.get('cruzBanco_v29');
  if (guardado) {
    try { return JSON.parse(guardado); } catch (e) { /* recalcula */ }
  }
  var lista = cruzBancoMontar();
  try {
    var txt = JSON.stringify(lista);
    if (txt.length < 90000) cache.put('cruzBanco_v29', txt, 120); // limite do cache: 100 KB por item
  } catch (e) { /* sem cache */ }
  return lista;
}

function cruzBancoMontar() {
  var out = [], vistas = {};
  readRows('CruzBanco').forEach(function (r) {
    var a = cruzLetras(r.ativo);
    if (a === 'NAO' || a === 'FALSE' || a === 'N') return;
    var disc = cruzDiscNome(r.disciplina), palavra = cruzLetras(r.palavra), dica = String(r.dica || '').trim();
    if (!disc || palavra.length < 3 || palavra.length > 16 || !dica || vistas[disc + '|' + palavra]) return;
    vistas[disc + '|' + palavra] = true;
    out.push({ disciplina: disc, assunto: cruzAssuntoLimpo(r.assunto), palavra: palavra, dica: dica, fonte: 'palavras' });
  });
  readRows('Banco').forEach(function (r) {
    if (!(r.ativo === true || String(r.ativo).toLowerCase() === 'true')) return;
    var disc = cruzDiscNome(r.disciplina);
    var bruta = String(r.resposta === undefined || r.resposta === null ? '' : r.resposta).trim();
    if (!disc || !/^[A-Za-zÀ-ÿ]+([ -][A-Za-zÀ-ÿ]+)?$/.test(bruta)) return;
    var palavra = cruzLetras(bruta), dica = String(r.pergunta || '').replace(/\s+/g, ' ').trim();
    if (palavra.length < 3 || palavra.length > 16 || !dica || dica.length > 200) return;
    if (cruzLetras(dica).indexOf(palavra) >= 0) return; // a pergunta entregaria a resposta
    if (!cruzPerguntaServe(r, dica)) return;
    if (vistas[disc + '|' + palavra]) return;
    vistas[disc + '|' + palavra] = true;
    out.push({ disciplina: disc, assunto: cruzAssuntoLimpo(r.assunto), palavra: palavra, dica: dica, fonte: 'banco' });
  });
  return out;
}

// Selecao de disciplinas e assuntos: lista de pares [disciplina, assunto]; assunto vazio = a disciplina inteira.
// Aceita o formato novo (selecao: [{disciplina, assuntos: []}]) e o da v22 (disciplina + assuntos).
function cruzSelecaoReq(req) {
  var itens = Array.isArray(req.selecao) ? req.selecao : (req.disciplina ? [{ disciplina: req.disciplina, assuntos: req.assuntos }] : []);
  var out = [], vistos = {};
  function add(d, a) {
    var k = d + '\u0001' + a;
    if (d && !vistos[k] && out.length < 300) { vistos[k] = true; out.push([d, a]); }
  }
  itens.slice(0, 60).forEach(function (it) {
    var d = cruzDiscNome(it && it.disciplina);
    var as = Array.isArray(it && it.assuntos) ? it.assuntos.slice(0, 60) : [];
    if (!as.length) add(d, '');
    else as.forEach(function (a) { add(d, cruzAssuntoLimpo(a).substring(0, 80)); });
  });
  return out;
}

function cruzDiscsDe(sel) {
  var out = [];
  sel.forEach(function (e) { if (out.indexOf(e[0]) < 0) out.push(e[0]); });
  return out;
}

// Selecao gravada na sala; salas antigas (so disciplina, ou so assuntos da v22) continuam funcionando.
function cruzSelecaoSala(room) {
  var discs = cruzDisciplinas(room);
  var v = [];
  try { v = JSON.parse(room.cruzadinha_assuntos || '[]'); } catch (e) { v = []; }
  var out = [];
  (Array.isArray(v) ? v : []).forEach(function (e) {
    if (Array.isArray(e) && e[0]) out.push([cruzDiscNome(e[0]), e[1] ? cruzAssuntoLimpo(e[1]) : '']);
    else if (typeof e === 'string' && e) out.push([discs[0], cruzAssuntoLimpo(e)]);
  });
  return out.length ? out : discs.map(function (d) { return [d, '']; });
}

function cruzRotulos(sel) {
  var inteiras = {};
  sel.forEach(function (e) { if (!e[1]) inteiras[e[0]] = true; });
  var out = [];
  sel.forEach(function (e) {
    if (e[1] ? !inteiras[e[0]] : true) out.push(e[1] ? e[0] + ' › ' + e[1] : e[0]);
  });
  return out;
}

// Palavras ativas das disciplinas/assuntos escolhidos.
function cruzFonte(sel) {
  var por = {};
  sel.forEach(function (e) {
    var d = por[e[0]] || (por[e[0]] = { todos: false, assuntos: {} });
    if (!e[1]) d.todos = true;
    else d.assuntos[cruzLetras(e[1])] = true;
  });
  return cruzBanco().filter(function (b) {
    var d = por[b.disciplina];
    return d && (d.todos || d.assuntos[cruzLetras(b.assunto)]);
  });
}

function cruzPoucas(sel, n) {
  var multi = sel.some(function (e) { return e[1]; });
  return multi
    ? 'O recorte escolhido tem só ' + n + ' palavra(s) (mínimo 6). Marque mais assuntos ou disciplinas.'
    : 'O banco da Cruzadinha tem poucas palavras ativas para ' + cruzDiscsDe(sel).join(', ') + '. Importe as palavras em "Banco de palavras" ou cadastre perguntas de resposta curta no Banco de perguntas.';
}

// Assuntos de cada disciplina com a quantidade de palavras (so contagens; nada de resposta sai daqui).
function cruzAssuntos(req) {
  var cache = CacheService.getScriptCache();
  var guardado = cache.get('cruzAssuntos_v23');
  if (guardado) return JSON.parse(guardado);
  var por = {};
  cruzBanco().forEach(function (b) {
    var d = por[b.disciplina] || (por[b.disciplina] = {});
    d[b.assunto] = (d[b.assunto] || 0) + 1;
  });
  var out = {};
  Object.keys(por).sort(function (x, y) { return x.localeCompare(y); }).forEach(function (d) {
    out[d] = Object.keys(por[d]).sort(function (x, y) { return x.localeCompare(y); }).map(function (a) { return { assunto: a, n: por[d][a] }; });
  });
  var r = { assuntos: out };
  cache.put('cruzAssuntos_v23', JSON.stringify(r), 60);
  return r;
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
  // Palavras muito longas alargam a grade (e viram casas minusculas no celular): so entram se faltarem outras
  var curtas = cruzEmbaralhar(unicas.filter(function (p) { return p.palavra.length <= 13; }));
  var longas = cruzEmbaralhar(unicas.filter(function (p) { return p.palavra.length > 13; }));
  var base = curtas.concat(longas).slice(0, max);
  var melhor = null;
  for (var it = 0; it < 150; it++) {
    var cs = cruzTentar(base, it % 2 === 1), m = cruzMedir(cs);
    var sc = cs.length * 1000 - Math.max(m.h, m.w) * 30 - m.w * 25 - m.h * m.w;
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
  if (req.reveals !== undefined) upd.cruzadinha_reveals = cruzLimiteReveals(req.reveals, 5);
  var atual = cruzGrade(room);
  if (dicas !== '' && (!atual || req.nova === true || cruzadinhaPalavras(room) !== palavras)) {
    var sel = cruzSelecaoSala(room);
    var banco = cruzFonte(sel);
    if (banco.length < 6) fail(cruzPoucas(sel, banco.length));
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
  return { room: room, grade: grade, limite: limite, limitePal: cruzadinhaReveals(room), key: key, me: me, dicas: dicas, caps: caps };
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
    usadas: ctx.dicas.filter(function (d) { return d.tipo !== 'palavra'; }).length,
    limite_palavra: ctx.limitePal,
    usadas_palavra: ctx.dicas.filter(function (d) { return d.tipo === 'palavra'; }).length,
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

// Confere uma palavra completa. Cada letra revelada por dica tira 2 pontos da palavra; toda revelada vale 0.
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
  var xp = Math.max(0, Math.round(pontos(p.palavra.length * 10, posicao, ctx.room.modo)) - 2 * ajudadas);
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
  return cruzRetorno(ctx, { correta: true, id: p.id, nova: { palavra: p.palavra, posicao: posicao, xp: xp, ajuda: ajudadas > 0 } });
}

// ---------- Cruzada Online: treino livre (sem sala e sem token; o ranking geral e opcional, ao terminar) ----------
// O aluno escolhe o assunto e o servidor monta a grade. O gabarito fica so no cache do servidor (6 h),
// nunca na planilha nem no navegador. Conferencia e dicas funcionam como na sala, mas nada vai para o ranking.
function treinoGet(gid) {
  var raw = CacheService.getScriptCache().get('cruzT_' + String(gid));
  if (!raw) fail('Este treino expirou. Gere uma nova cruzada.');
  return JSON.parse(raw);
}

function treinoPut(t) {
  CacheService.getScriptCache().put('cruzT_' + String(t.grade.id), JSON.stringify(t), 21600);
}

function treinoCtx(t) {
  var caps = t.resolvidas.map(function (r) { return { nome_key: 'treino', palavra_id: r.id, posicao: 1, xp: r.xp }; });
  return { grade: t.grade, limite: t.limite, limitePal: t.limitePal === undefined ? Math.min(5, t.limite) : t.limitePal, key: 'treino', dicas: t.dicas, caps: caps };
}

function treinoRetorno(t, extra) {
  var c = cruzSaida(treinoCtx(t));
  for (var k in (extra || {})) c[k] = extra[k];
  return { cruz: c };
}

function cruzTreinoNovo(req) {
  var sel = cruzSelecaoReq(req);
  if (!sel.length) fail('Escolha ao menos uma disciplina para a cruzada.');
  var palavras = Math.max(6, Math.min(25, Math.floor(Number(req.palavras)) || 12));
  var dicas = req.dicas === undefined || req.dicas === null || req.dicas === '' ? 30 : Math.max(0, Math.min(30, Math.floor(Number(req.dicas)) || 0));
  var reveals = dicas === 0 ? 0 : cruzLimiteReveals(req.reveals, 5);
  var banco = cruzFonte(sel);
  if (banco.length < 6) fail(cruzPoucas(sel, banco.length));
  var grade = cruzMontar(banco, palavras);
  grade.id = Date.now() * 1000 + Math.floor(Math.random() * 1000);
  var t = { grade: grade, limite: dicas, limitePal: reveals, dicas: [], resolvidas: [], selecao: sel };
  treinoPut(t);
  return treinoRetorno(t);
}

function cruzTreinoEstado(req) {
  return treinoRetorno(treinoGet(req.gid));
}

function cruzTreinoCheck(req) {
  var t = treinoGet(req.gid);
  var p = t.grade.palavras[Number(req.id)];
  if (!p) fail('Palavra não encontrada.');
  var ctx = treinoCtx(t);
  if (cruzLetras(req.tentativa) !== p.palavra) return treinoRetorno(t, { correta: false, id: p.id });
  if (cruzMinhas(ctx)[p.id]) return treinoRetorno(t, { correta: true, id: p.id });
  var rev = cruzReveladas(ctx), cel = cruzCelulas(p), ajudadas = 0;
  cel.forEach(function (rc) { if (rev[rc[0] + ',' + rc[1]]) ajudadas++; });
  if (ajudadas === cel.length) return treinoRetorno(t, { correta: true, id: p.id });
  var xp = Math.max(0, p.palavra.length * 10 - 2 * ajudadas);
  t.resolvidas.push({ id: p.id, xp: xp });
  treinoPut(t);
  return treinoRetorno(t, { correta: true, id: p.id, nova: { palavra: p.palavra, posicao: 1, xp: xp, ajuda: ajudadas > 0 } });
}

// ---------- Desvendando com Conhecimento (casos de mistério, em duplas, liberados pelo professor) ----------
// O professor cria a sala, escolhe e libera os casos; as duplas entram com o token. O navegador envia a acusacao e
// o servidor confere, conta os erros e grava os pontos. O gabarito fica SO na aba DesvGabarito da planilha.
function desvGabarito() {
  var cache = CacheService.getScriptCache();
  var g = cache.get('desvGab_v31');
  if (g) return JSON.parse(g);
  var mapa = {};
  readRows('DesvGabarito').forEach(function (r) {
    var c = String(r.caso || '').trim();
    if (c) mapa[c] = { suspeito: Number(r.suspeito) || 0, pontos: Number(r.pontos) || 0, explicacao: String(r.explicacao || '') };
  });
  cache.put('desvGab_v31', JSON.stringify(mapa), 600);
  return mapa;
}

function desvGid(v) {
  var g = String(v || '');
  if (!/^[A-Za-z0-9_-]{8,40}$/.test(g)) fail('Identificador do aparelho inválido. Recarregue a página.');
  return g;
}

function desvCasosLista(v) {
  var lista = Array.isArray(v) ? v : [];
  var gab = desvGabarito();
  var vistos = {};
  return lista.map(String).filter(function (c) {
    if (!gab[c] || vistos[c]) return false;
    vistos[c] = 1;
    return true;
  });
}

function desvSala(token) {
  var t = String(token || '').toUpperCase().trim();
  var r = readRows('DesvSalas').filter(function (x) { return String(x.token) === t; })[0];
  if (!r) fail('Sala não encontrada. Confira o token com o professor.');
  var casos = [];
  try { casos = JSON.parse(String(r.casos || '[]')); } catch (e) { casos = []; }
  r.casosLista = casos;
  return r;
}

function desvSalaAdmin(req) {
  var r = desvSala(req.token);
  if (String(r.admin_key) !== String(req.adminKey || '')) fail('Chave de professor inválida para esta sala.');
  return r;
}

function createDesvRoom(req) {
  var gab = desvGabarito();
  if (!Object.keys(gab).length) fail('O gabarito do Desvendando ainda não foi carregado na planilha (aba DesvGabarito).');
  var casos = desvCasosLista(req.casos);
  var existentes = readRows('DesvSalas').map(function (r) { return String(r.token); })
    .concat(readRows('CtfSalas').map(function (r) { return String(r.token); }));
  var token;
  do { token = genToken(); } while (existentes.indexOf(token) >= 0);
  var adminKey = randomFrom(TOKEN_CHARS + 'abcdefghijkmnpqrstuvwxyz', 24);
  appendObj('DesvSalas', {
    token: token, nome: safeText(String(req.nome || 'Desvendando').substring(0, 80)), admin_key: adminKey,
    status: 'aberta', casos: JSON.stringify(casos), criada_em: new Date().toISOString(), turma: turmaIdValido(req.turma), papeis: papeisModo(req.papeis, 'rodizio', true)
  });
  return { token: token, adminKey: adminKey, casos: casos };
}

function desvDupla(token, gid) {
  return readRows('DesvDuplas').filter(function (d) { return String(d.token) === token && String(d.gid) === gid; })[0];
}

function desvEntrar(req) {
  var sala = desvSala(req.token);
  if (String(sala.status) !== 'aberta') fail('Esta sala já foi encerrada pelo professor.');
  var gid = desvGid(req.gid);
  var nome = cruzRankingNome(req.nome);
  var integrantes = String(req.integrantes || '').replace(/\s+/g, ' ').trim().substring(0, 120);
  var individual = String(sala.papeis) === 'individual';
  var avatar = avatarId(req.avatar);
  if (sala.turma) {
    var lista = Array.isArray(req.integrantes) ? req.integrantes : String(req.integrantes || '').split(',');
    lista = lista.map(function (n) { return String(n).trim(); }).filter(function (n) { return n; });
    if (individual ? lista.length !== 1 : !lista.length || lista.length > 3) fail(individual ? 'Escolha o seu nome na lista.' : 'Escolha o piloto, o copiloto e, se for trio, o engenheiro.');
    lista = lista.map(function (n) { return nomeDaTurma(sala.turma, n); });
    var vistos = {};
    lista.forEach(function (n) { if (vistos[norm(n)]) fail(n + ' foi escolhido duas vezes.'); vistos[norm(n)] = 1; });
    integrantes = lista.join(', ');
  }
  var token = String(sala.token);
  var ja = desvDupla(token, gid);
  if (sala.turma && !ja) {
    // mesma dupla em outro celular: assume a dupla antiga (pontos continuam); nomes em outra dupla = recusa
    var chaveDe = function (txt) { return String(txt || '').split(',').map(function (n) { return norm(n.trim()); }).filter(function (n) { return n; }).sort().join('|'); };
    var minha = chaveDe(integrantes);
    var duplasSala = readRows('DesvDuplas').filter(function (d) { return String(d.token) === token; });
    var mesma = duplasSala.filter(function (d) { return chaveDe(d.integrantes) === minha; })[0];
    if (mesma) {
      var antigo = String(mesma.gid);
      updateRow('DesvDuplas', mesma._row, { gid: gid, nome: safeText(nome), integrantes: safeText(integrantes), avatar: avatar || String(mesma.avatar || '') });
      readRows('DesvRanking').forEach(function (r) { if (String(r.token) === token && String(r.gid) === antigo) updateRow('DesvRanking', r._row, { gid: gid }); });
      memoLimpa('DesvDuplas'); memoLimpa('DesvRanking');
      return desvEstado({ token: token, gid: gid });
    }
    duplasSala.forEach(function (d) {
      String(d.integrantes || '').split(',').forEach(function (n) {
        if (n.trim() && vistos[norm(n.trim())]) fail(n.trim() + ' já está na dupla ' + String(d.nome) + '. Entrem com a mesma formação de antes ou falem com o professor.');
      });
    });
  }
  if (ja) updateRow('DesvDuplas', ja._row, { nome: safeText(nome), integrantes: safeText(integrantes), avatar: avatar || String(ja.avatar || '') });
  else appendObj('DesvDuplas', { token: token, gid: gid, nome: safeText(nome), integrantes: safeText(integrantes), entrou_em: new Date().toISOString(), avatar: avatar });
  return desvEstado({ token: token, gid: gid });
}

function desvRankingSala(token) {
  var por = {};
  readRows('DesvRanking').forEach(function (r) {
    if (String(r.token) !== token) return;
    var g = String(r.gid);
    var e = por[g] || (por[g] = { nome: String(r.nome), pontos: 0, casos: 0, quando: String(r.quando) });
    e.pontos += Number(r.pontos) || 0;
    e.casos++;
    if (String(r.quando) > e.quando) e.quando = String(r.quando);
  });
  var nomes = {};
  var avatares = {};
  readRows('DesvDuplas').forEach(function (d) { if (String(d.token) === token) { nomes[String(d.gid)] = String(d.nome); avatares[String(d.gid)] = String(d.avatar || ''); } });
  var lista = Object.keys(por).map(function (g) { var e = por[g]; e.nome = nomes[g] || e.nome; e.avatar = avatares[g] || ''; return e; });
  lista.sort(function (a, b) { return b.pontos - a.pontos || (a.quando < b.quando ? -1 : 1); });
  return lista.map(function (x, i) { return { pos: i + 1, nome: x.nome, pontos: x.pontos, casos: x.casos, avatar: x.avatar }; });
}

function desvEstado(req) {
  var sala = desvSala(req.token);
  var token = String(sala.token);
  var gid = desvGid(req.gid);
  var dupla = desvDupla(token, gid);
  if (!dupla) fail('Entre na sala com o nome da dupla.');
  var resolvidos = {};
  readRows('DesvRanking').forEach(function (r) { if (String(r.token) === token && String(r.gid) === gid) resolvidos[String(r.caso)] = Number(r.pontos) || 0; });
  return {
    sala: { token: token, nome: String(sala.nome), status: String(sala.status), casos: sala.casosLista, papeis: String(sala.papeis || '') },
    dupla: { nome: String(dupla.nome), integrantes: String(dupla.integrantes || ''), avatar: String(dupla.avatar || '') },
    resolvidos: resolvidos,
    ranking: desvRankingSala(token).slice(0, 50)
  };
}

function desvAcusar(req) {
  var sala = desvSala(req.token);
  var token = String(sala.token);
  if (String(sala.status) !== 'aberta') fail('Esta sala já foi encerrada pelo professor.');
  var gid = desvGid(req.gid);
  var dupla = desvDupla(token, gid);
  if (!dupla) fail('Entre na sala com o nome da dupla.');
  var gab = desvGabarito();
  if (!Object.keys(gab).length) fail('O gabarito do Desvendando ainda não foi carregado na planilha (aba DesvGabarito).');
  var caso = gab[String(req.caso)];
  if (!caso) fail('Caso desconhecido.');
  if (sala.casosLista.indexOf(String(req.caso)) < 0) fail('Este caso ainda não foi liberado pelo professor.');
  var ja = readRows('DesvRanking').filter(function (r) { return String(r.token) === token && String(r.gid) === gid && String(r.caso) === String(req.caso); })[0];
  if (ja) return { correto: true, jaResolvido: true, pontos: Number(ja.pontos) || 0, explicacao: caso.explicacao };
  var cache = CacheService.getScriptCache();
  var chave = 'desv_' + token + '_' + gid + '_' + req.caso;
  var erros = Number(cache.get(chave) || 0);
  if ((Number(req.suspeito) || 0) !== caso.suspeito) {
    erros++;
    cache.put(chave, String(erros), 21600);
    return { correto: false, erros: erros, valeAgora: desvPontos(caso, erros, req.dicas) };
  }
  var pontos = desvPontos(caso, erros, req.dicas);
  appendObj('DesvRanking', { quando: new Date().toISOString(), nome: String(dupla.nome), gid: gid, caso: String(req.caso), pontos: pontos, erros: erros, dicas: Math.max(0, Math.min(5, Number(req.dicas) || 0)), token: token });
  cache.remove(chave);
  return { correto: true, pontos: pontos, erros: erros, explicacao: caso.explicacao };
}

function desvPontos(caso, erros, dicas) {
  var d = Math.max(0, Math.min(5, Number(dicas) || 0));
  return Math.max(20, caso.pontos - 15 * erros - 10 * d);
}

// Ranking da sala (aberto: serve para o telão)
function desvRanking(req) {
  var sala = desvSala(req.token);
  return { sala: { nome: String(sala.nome), status: String(sala.status) }, ranking: desvRankingSala(String(sala.token)) };
}

// Gabarito do Desvendando enviado pelo app do professor (que o abre com a chave do banco): casos novos
// passam a valer sem colar nada na planilha. Substitui a aba DesvGabarito inteira.
function desvGabaritoSet(req) {
  requireBancoKey(req);
  var linhas = Array.isArray(req.linhas) ? req.linhas : [];
  var vals = [];
  linhas.slice(0, 1000).forEach(function (l) {
    var c = String((l && l.caso) || '').trim();
    var sus = Number(l && l.suspeito) || 0;
    if (!/^c\d{1,4}$/.test(c) || sus < 1) return;
    vals.push([c, String(sus), String(Number(l.pontos) || 0), String(l.explicacao || '').slice(0, 1000)]);
  });
  if (!vals.length) fail('Gabarito vazio.');
  var sh = getSheet('DesvGabarito');
  var head = SHEET_HEADERS.DesvGabarito;
  sh.clearContents();
  sh.getRange(1, 1, 1, head.length).setValues([head]);
  sh.getRange(2, 1, vals.length, head.length).setNumberFormat('@').setValues(vals);
  memoLimpa('DesvGabarito');
  CacheService.getScriptCache().remove('desvGab_v31');
  return { casos: vals.length };
}

// Salas do Desvendando guardadas no servidor: com a chave do banco, o professor recupera todas em qualquer aparelho
function desvSalasList(req) {
  requireBancoKey(req);
  var duplas = {};
  readRows('DesvDuplas').forEach(function (d) { var t = String(d.token); duplas[t] = (duplas[t] || 0) + 1; });
  return {
    salas: readRows('DesvSalas').slice(-200).reverse().map(function (r) {
      var casos = [];
      try { casos = JSON.parse(String(r.casos || '[]')); } catch (e) { casos = []; }
      return {
        token: String(r.token), nome: String(r.nome), adminKey: String(r.admin_key), status: String(r.status) === 'encerrada' ? 'encerrada' : 'aberta',
        criada: new Date(r.criada_em).getTime() || 0, casos: casos.length, duplas: duplas[String(r.token)] || 0
      };
    })
  };
}

// Apaga de vez uma sala do Desvendando: a sala, as duplas e os pontos dela somem da planilha.
function desvApagar(req) {
  var sala = desvSalaAdmin(req);
  var token = String(sala.token);
  var total = 0;
  ['DesvRanking', 'DesvDuplas', 'DesvSalas'].forEach(function (nome) {
    var rows = readRows(nome);
    for (var i = rows.length - 1; i >= 0; i--) {
      if (String(rows[i].token) === token) { getSheet(nome).deleteRow(rows[i]._row); total++; }
    }
    memoLimpa(nome);
  });
  return { ok: true, apagadas: total };
}

// Painel do professor: liberar casos, encerrar/reabrir e acompanhar duplas e acertos
function desvProf(req) {
  var sala = desvSalaAdmin(req);
  var token = String(sala.token);
  if (req.op === 'casos') {
    var casos = desvCasosLista(req.casos);
    updateRow('DesvSalas', sala._row, { casos: JSON.stringify(casos) });
    sala.casosLista = casos;
  } else if (req.op === 'status') {
    var st = req.status === 'encerrada' ? 'encerrada' : 'aberta';
    updateRow('DesvSalas', sala._row, { status: st });
    sala.status = st;
  }
  var duplas = readRows('DesvDuplas').filter(function (d) { return String(d.token) === token; });
  var porCaso = {};
  readRows('DesvRanking').forEach(function (r) {
    if (String(r.token) !== token) return;
    var c = String(r.caso);
    porCaso[c] = (porCaso[c] || 0) + 1;
  });
  return {
    sala: { token: token, nome: String(sala.nome), status: String(sala.status), casos: sala.casosLista },
    duplas: duplas.map(function (d) { return { nome: String(d.nome), integrantes: String(d.integrantes || '') }; }),
    resolvidosPorCaso: porCaso,
    ranking: desvRankingSala(token)
  };
}

// ---------- Analise da turma (professor) ----------
// Junta todas as salas ligadas a turma: participacao e desempenho de cada aluno, perguntas mais dificeis
// (acertos e tentativas erradas), assuntos (pacote) e casos do Desvendando.
function turmaAnalise(req) {
  requireBancoKey(req);
  var t = turmaLer(req.id);
  if (!t) fail('Turma não encontrada.');
  var salas = readRows('CtfSalas').filter(function (r) { return String(r.turma) === t.id; });
  var dsalas = readRows('DesvSalas').filter(function (r) { return String(r.turma) === t.id; });
  var salaDe = {};
  salas.forEach(function (r) { salaDe[String(r.token)] = r; });
  var dsalaDe = {};
  dsalas.forEach(function (r) { dsalaDe[String(r.token)] = r; });

  var alunos = {};
  t.alunos.forEach(function (a) {
    alunos[norm(a.n)] = { n: a.n, total: 0, ctf: 0, cruz: 0, rali: 0, desv: 0, salas: {}, acertos: 0, erros: 0, ultimo: 0 };
  });
  var credita = function (nome, campo, pts, token, acertos, erros, quando) {
    var x = alunos[norm(nome)];
    if (!x) return;
    x[campo] += pts;
    x.total += pts;
    x.salas[token] = 1;
    x.acertos += acertos;
    x.erros += erros;
    if (quando > x.ultimo) x.ultimo = quando;
  };
  var participantes = {};
  readRows('CtfAlunos').forEach(function (r) {
    var token = String(r.token);
    var sala = salaDe[token];
    if (!sala) return;
    participantes[token] = (participantes[token] || 0) + 1;
    var tipo = tipoOut(sala);
    var campo = tipo === 'cruz' ? 'cruz' : tipo === 'rali' ? 'rali' : 'ctf';
    var membros = parseList(r.integrantes);
    if (tipo !== 'rali') membros = [String(r.nome)].concat(membros);
    var quando = Math.max(Number(r.entrou_em) || 0, Number(r.ultimo_acerto) || 0, Number(r.ultimo_erro) || 0);
    membros.forEach(function (n) { credita(n, campo, Number(r.xp) || 0, token, Number(r.acertos) || 0, Number(r.erros) || 0, quando); });
  });

  // perguntas (CTF e Rali NFC)
  var acertosTag = {}, errosTag = {};
  readRows('CtfCapturas').forEach(function (c) { if (salaDe[String(c.token)]) { var k = String(c.token) + '|' + String(c.tag_id); acertosTag[k] = (acertosTag[k] || 0) + 1; } });
  readRows('CtfErros').forEach(function (c) { if (salaDe[String(c.token)]) { var k = String(c.token) + '|' + String(c.tag_id); errosTag[k] = (errosTag[k] || 0) + 1; } });
  var perguntas = {};
  readRows('CtfMissoes').forEach(function (m) {
    var token = String(m.token);
    if (!salaDe[token] || isCruz(salaDe[token])) return;
    var tag = String(m.tag_id);
    var p = perguntas[tag] || (perguntas[tag] = { tag_id: tag, pergunta: String(m.pergunta || ''), pacote: String(m.pacote || ''), categoria: String(m.categoria || ''), salas: 0, participantes: 0, acertos: 0, erros: 0 });
    p.salas++;
    p.participantes += participantes[token] || 0;
    p.acertos += acertosTag[token + '|' + tag] || 0;
    p.erros += errosTag[token + '|' + tag] || 0;
  });
  var listaPerg = Object.keys(perguntas).map(function (k) { return perguntas[k]; }).filter(function (p) { return p.participantes > 0; });
  var assuntos = {};
  listaPerg.forEach(function (p) {
    var a = assuntos[p.pacote || 'Sem assunto'] || (assuntos[p.pacote || 'Sem assunto'] = { assunto: p.pacote || 'Sem assunto', perguntas: 0, participantes: 0, acertos: 0, erros: 0 });
    a.perguntas++;
    a.participantes += p.participantes;
    a.acertos += p.acertos;
    a.erros += p.erros;
  });

  // Desvendando
  var integrantesDe = {}, duplasSala = {};
  readRows('DesvDuplas').forEach(function (d) {
    var token = String(d.token);
    if (!dsalaDe[token]) return;
    duplasSala[token] = (duplasSala[token] || 0) + 1;
    var membros = String(d.integrantes || '').split(',').map(function (x) { return x.trim(); }).filter(function (x) { return x; });
    integrantesDe[token + '|' + String(d.gid)] = membros;
    var quando = Date.parse(String(d.entrou_em)) || 0;
    membros.forEach(function (n) { credita(n, 'desv', 0, token, 0, 0, quando); });
  });
  var casos = {};
  readRows('DesvRanking').forEach(function (r) {
    var token = String(r.token);
    if (!dsalaDe[token]) return;
    var c = casos[String(r.caso)] || (casos[String(r.caso)] = { caso: String(r.caso), resolvidos: 0, erros: 0, dicas: 0, pontos: 0 });
    c.resolvidos++;
    c.erros += Number(r.erros) || 0;
    c.dicas += Number(r.dicas) || 0;
    c.pontos += Number(r.pontos) || 0;
    var quando = Date.parse(String(r.quando)) || 0;
    (integrantesDe[token + '|' + String(r.gid)] || []).forEach(function (n) { credita(n, 'desv', Number(r.pontos) || 0, token, 1, Number(r.erros) || 0, quando); });
  });
  var duplasTotal = 0;
  Object.keys(duplasSala).forEach(function (k) { duplasTotal += duplasSala[k]; });

  return {
    turma: { id: t.id, nome: t.nome, alunos: t.alunos.length },
    salas: salas.map(function (r) {
      return { token: String(r.token), nome: String(r.nome), tipo: tipoOut(r), status: String(r.status), criada: String(r.criada_em), participantes: participantes[String(r.token)] || 0 };
    }).concat(dsalas.map(function (r) {
      return { token: String(r.token), nome: String(r.nome), tipo: 'desv', status: String(r.status), criada: String(r.criada_em), participantes: duplasSala[String(r.token)] || 0 };
    })),
    alunos: t.alunos.map(function (a) {
      var x = alunos[norm(a.n)];
      return { n: x.n, total: x.total, ctf: x.ctf, cruz: x.cruz, rali: x.rali, desv: x.desv, salas: Object.keys(x.salas).length, tokens: Object.keys(x.salas), acertos: x.acertos, erros: x.erros, ultimo: x.ultimo };
    }),
    perguntas: listaPerg,
    assuntos: Object.keys(assuntos).map(function (k) { return assuntos[k]; }),
    casos: Object.keys(casos).map(function (k) { return casos[k]; }),
    duplas: duplasTotal
  };
}

// ---------- Turmas (lista de alunos) e notas ----------
// O professor cadastra a turma uma vez (matricula e nome). Sala ligada a uma turma: o aluno escolhe o proprio nome
// na lista, e o relatorio soma os pontos de cada aluno em todas as salas da turma (CTF, Cruzada, Rali NFC e Desvendando).
function turmaLer(id) {
  var r = readRows('Turmas').filter(function (t) { return String(t.id) === String(id || ''); })[0];
  if (!r) return null;
  var alunos = [];
  try { alunos = JSON.parse(String(r.alunos || '[]')); } catch (e) { alunos = []; }
  return { _row: r._row, id: String(r.id), nome: String(r.nome), alunos: alunos };
}

function turmaIdValido(id) {
  if (!id) return '';
  if (!turmaLer(id)) fail('Turma não encontrada.');
  return String(id);
}

// Confere o nome com a lista da turma e devolve o nome como cadastrado (sala sem turma: aceita o nome digitado)
function nomeDaTurma(turmaId, nome) {
  if (!turmaId) return nome;
  var t = turmaLer(turmaId);
  if (!t) return nome;
  var k = norm(nome);
  var achou = t.alunos.filter(function (a) { return norm(a.n) === k; })[0];
  if (!achou) fail('Escolha o seu nome na lista da turma.');
  return achou.n;
}

function turmaAlunosLimpos(lista) {
  var vistos = {};
  var out = [];
  (Array.isArray(lista) ? lista : []).forEach(function (a) {
    var n = String((a && a.n) || '').replace(/\s+/g, ' ').trim().replace(/^[=+\-@]+/, '').substring(0, 60);
    var m = String((a && a.m) || '').replace(/[^\w.\-\/]/g, '').substring(0, 20);
    if (n.length < 2 || vistos[norm(n)]) return;
    vistos[norm(n)] = 1;
    out.push({ m: m, n: n });
  });
  if (out.length > 80) fail('Uma turma pode ter até 80 alunos.');
  return out;
}

function turmasList(req) {
  requireBancoKey(req);
  return {
    turmas: readRows('Turmas').map(function (r) {
      var t = turmaLer(r.id);
      return { id: t.id, nome: t.nome, alunos: t.alunos };
    })
  };
}

function turmaSalvar(req) {
  requireBancoKey(req);
  var nome = String(req.nome || '').replace(/\s+/g, ' ').trim().substring(0, 60);
  if (nome.length < 2) fail('Dê um nome à turma.');
  var alunos = turmaAlunosLimpos(req.alunos);
  if (!alunos.length) fail('Cadastre ao menos um aluno.');
  var agora = new Date().toISOString();
  var t = req.id ? turmaLer(req.id) : null;
  if (t) {
    updateRow('Turmas', t._row, { nome: safeText(nome), alunos: JSON.stringify(alunos), atualizado_em: agora });
    return { id: t.id, nome: nome, alunos: alunos };
  }
  var id = 'T' + randomFrom(TOKEN_CHARS, 7);
  appendObj('Turmas', { id: id, nome: safeText(nome), alunos: JSON.stringify(alunos), atualizado_em: agora });
  return { id: id, nome: nome, alunos: alunos };
}

function turmaExcluir(req) {
  requireBancoKey(req);
  var t = turmaLer(req.id);
  if (!t) fail('Turma não encontrada.');
  getSheet('Turmas').deleteRow(t._row);
  memoLimpa('Turmas');
  return { ok: true };
}

// Para a tela de entrada do aluno: so os nomes (sem matricula)
function salaTurma(req) {
  var t = String(req.token || '').toUpperCase().trim();
  var sala = readRows('CtfSalas').filter(function (r) { return String(r.token) === t; })[0];
  var desv = !sala;
  if (desv) sala = readRows('DesvSalas').filter(function (r) { return String(r.token) === t; })[0];
  if (!sala) fail('Sala não encontrada. Confira o token.');
  var turma = turmaLer(sala.turma);
  var papeis = String(sala.papeis || '');
  if (!turma) return { turma: null, papeis: papeis };
  return { papeis: papeis, turma: { nome: turma.nome, alunos: turma.alunos.map(function (a) { return a.n; }), ocupados: nomesOcupados(sala, t, req.gid, desv) } };
}

// Nomes da turma que ja entraram na sala (o aparelho do aluno mostra bloqueados). gid = a propria dupla, que nao conta.
function nomesOcupados(sala, token, gid, desv) {
  var usados = [];
  if (desv) {
    var g = String(gid || '');
    readRows('DesvDuplas').forEach(function (d) {
      if (String(d.token) !== token || String(d.gid) === g) return;
      String(d.integrantes || '').split(',').forEach(function (n) { if (n.trim()) usados.push(n.trim()); });
    });
    return usados;
  }
  playersOf(token).forEach(function (a) {
    if (String(sala.tipo) === 'rali') parseList(a.integrantes).forEach(function (n) { usados.push(String(n)); });
    else {
      if (a.chave) usados.push(String(a.nome));
      parseList(a.integrantes).forEach(function (n) { usados.push(String(n)); });
    }
  });
  return usados;
}

function turmaNotas(req) {
  requireBancoKey(req);
  var t = turmaLer(req.id);
  if (!t) fail('Turma não encontrada.');
  var salas = readRows('CtfSalas').filter(function (r) { return String(r.turma) === t.id; });
  var desvSalas = readRows('DesvSalas').filter(function (r) { return String(r.turma) === t.id; });
  var tipoDe = {};
  salas.forEach(function (r) { tipoDe[String(r.token)] = tipoOut(r); });
  var notas = {};
  t.alunos.forEach(function (a) { notas[norm(a.n)] = { m: a.m, n: a.n, ctf: 0, cruz: 0, rali: 0, desv: 0 }; });
  readRows('CtfAlunos').forEach(function (r) {
    var tipo = tipoDe[String(r.token)];
    if (!tipo) return;
    var xp = Number(r.xp) || 0;
    if (tipo === 'rali') {
      var membros = [];
      try { membros = JSON.parse(String(r.integrantes || '[]')); } catch (e) { membros = []; }
      membros.forEach(function (n) { var x = notas[norm(n)]; if (x) x.rali += xp; });
    } else {
      var campo = tipo === 'cruz' ? 'cruz' : 'ctf';
      var x = notas[String(r.nome_key)];
      if (x) x[campo] += xp;
      parseList(r.integrantes).forEach(function (n) { var y = notas[norm(n)]; if (y && y !== x) y[campo] += xp; });
    }
  });
  var desvTokens = {};
  desvSalas.forEach(function (r) { desvTokens[String(r.token)] = 1; });
  var integrantesDe = {};
  readRows('DesvDuplas').forEach(function (d) { if (desvTokens[String(d.token)]) integrantesDe[String(d.token) + '|' + String(d.gid)] = String(d.integrantes || '').split(','); });
  readRows('DesvRanking').forEach(function (r) {
    var membros = integrantesDe[String(r.token) + '|' + String(r.gid)];
    if (!membros) return;
    membros.forEach(function (n) { var x = notas[norm(n)]; if (x) x.desv += Number(r.pontos) || 0; });
  });
  var alunos = t.alunos.map(function (a) {
    var x = notas[norm(a.n)];
    x.total = x.ctf + x.cruz + x.rali + x.desv;
    return x;
  });
  return { turma: { id: t.id, nome: t.nome }, salas: salas.length + desvSalas.length, alunos: alunos };
}

// ---------- Grande ranking da Cruzada (treino livre) ----------
// Ao terminar a grade o aluno informa o nome e o SERVIDOR grava os pontos que ele de fato fez (guardados no cache do
// treino); o navegador nunca envia a pontuacao. Cada treino entra no ranking uma unica vez.
function cruzRankingNome(v) {
  var n = String(v === undefined || v === null ? '' : v).replace(/\s+/g, ' ').trim();
  if (n.length < 2) fail('Escreva seu nome (pelo menos 2 letras).');
  if (n.length > 30) fail('O nome pode ter até 30 caracteres.');
  if (!/[A-Za-zÀ-ÿ]/.test(n)) fail('O nome precisa ter letras.');
  return n;
}

function cruzRankingLista() {
  var rows = readRows('CruzRanking').map(function (r) {
    return { nome: String(r.nome), pontos: Number(r.pontos) || 0, palavras: Number(r.palavras) || 0, assuntos: String(r.assuntos || ''), quando: String(r.quando), gid: String(r.gid), _row: r._row };
  });
  rows.sort(function (a, b) { return b.pontos - a.pontos || (a.quando < b.quando ? -1 : 1); });
  return rows;
}

function cruzTreinoRanking(req) {
  var t = treinoGet(req.gid);
  var nome = cruzRankingNome(req.nome);
  var s = cruzSaida(treinoCtx(t));
  // Palavra conta como feita se foi acertada OU se todas as letras foram reveladas por dica (vale 0 e nao fica nas resolvidas)
  var rev = cruzReveladas(treinoCtx(t)), minhas = cruzMinhas(treinoCtx(t));
  var feitas = t.grade.palavras.filter(function (p) {
    return minhas[p.id] || cruzCelulas(p).every(function (rc) { return rev[rc[0] + ',' + rc[1]]; });
  }).length;
  if (!s.grade.palavras.length || feitas < s.grade.palavras.length) fail('Termine a cruzada para entrar no ranking.');
  if (t.ranqueado) fail('Esta cruzada já está no ranking.');
  var assuntos = (t.selecao || []).map(function (e) { return e[1] ? e[0] + ' › ' + e[1] : e[0]; }).join(' + ').substring(0, 120);
  var quando = new Date().toISOString();
  memoLimpa('CruzRanking');
  getSheet('CruzRanking').appendRow([quando, safeText(nome), s.xp, s.grade.palavras.length, s.usadas + s.usadas_palavra, safeText(assuntos), String(t.grade.id)]);
  t.ranqueado = nome;
  treinoPut(t);
  CacheService.getScriptCache().remove('cruzRanking_v28');
  var lista = cruzRankingLista();
  var pos = 0;
  lista.forEach(function (r, i) { if (r.gid === String(t.grade.id)) pos = i + 1; });
  return { ranking: { posicao: pos, total: lista.length, pontos: s.xp, nome: nome } };
}

function cruzRanking(req) {
  var cache = CacheService.getScriptCache();
  var guardado = cache.get('cruzRanking_v28');
  if (guardado) return JSON.parse(guardado);
  var lista = cruzRankingLista();
  var r = { ranking: lista.slice(0, 100).map(function (x, i) { return { pos: i + 1, nome: x.nome, pontos: x.pontos, palavras: x.palavras, assuntos: x.assuntos, quando: x.quando }; }), total: lista.length };
  cache.put('cruzRanking_v28', JSON.stringify(r), 30);
  return r;
}

// Moderacao: o professor remove um nome inadequado (tambem da para apagar a linha na aba CruzRanking)
function cruzRankingApagar(req) {
  requireAdmin(req);
  var alvo = cruzRankingLista().filter(function (r) { return r.gid === String(req.gid); })[0];
  if (!alvo) fail('Entrada não encontrada.');
  getSheet('CruzRanking').deleteRow(alvo._row);
  memoLimpa('CruzRanking');
  CacheService.getScriptCache().remove('cruzRanking_v28');
  return { ok: true };
}

function cruzTreinoHint(req) {
  var t = treinoGet(req.gid);
  var tipo = req.tipo === 'palavra' ? 'palavra' : 'letra';
  var c0 = treinoCtx(t);
  cruzLimiteDica(c0, tipo, 'neste treino');
  var p = t.grade.palavras[Number(req.id)];
  if (!p) fail('Palavra não encontrada.');
  var ctx = treinoCtx(t);
  if (cruzMinhas(ctx)[p.id]) fail('Essa palavra já está resolvida.');
  var indice = tipo === 'letra' ? Math.floor(Number(req.indice)) : '';
  var cel = cruzCelulas(p), rev = cruzReveladas(ctx);
  if (tipo === 'letra') {
    if (!(indice >= 0 && indice < cel.length)) fail('Escolha uma letra da palavra.');
    if (rev[cel[indice][0] + ',' + cel[indice][1]]) fail('Essa letra já foi revelada.');
  }
  t.dicas.push({ tipo: tipo, palavra_id: p.id, indice: indice });
  treinoPut(t);
  return treinoRetorno(t, { dica: tipo, id: p.id });
}

// Banco da Cruzadinha pelo painel do professor (qualquer sala aberta por ele serve de chave).
function cruzBancoResumo(req) {
  requireAdmin(req);
  var por = {}, doBanco = {};
  cruzBanco().forEach(function (b) {
    por[b.disciplina] = (por[b.disciplina] || 0) + 1;
    if (!doBanco[b.disciplina]) doBanco[b.disciplina] = 0;
    if (b.fonte === 'banco') doBanco[b.disciplina]++;
  });
  return { por_disciplina: por, do_banco: doBanco };
}

function cruzBancoImport(req) {
  requireAdmin(req);
  var vals = [];
  (Array.isArray(req.linhas) ? req.linhas : []).slice(0, 3000).forEach(function (l) {
    var d = cruzDiscNome(l && l[0]);
    var p = cruzLetras(l && l[1]);
    var dica = safeText(String(l && l[2] || '').trim().substring(0, 200));
    var assunto = l && l[3] ? safeText(cruzAssuntoLimpo(l[3]).substring(0, 80)) : '';
    if (d && p.length >= 3 && p.length <= 16 && dica) vals.push([d, p, dica, 'sim', assunto]);
  });
  if (!vals.length) fail('Nenhuma linha válida. Use o formato: disciplina;assunto;palavra;dica');
  var sh = getSheet('CruzBanco');
  if (req.substituir === true && sh.getLastRow() > 1) sh.deleteRows(2, sh.getLastRow() - 1);
  sh.getRange(sh.getLastRow() + 1, 1, vals.length, 5).setValues(vals);
  memoLimpa('CruzBanco');
  CacheService.getScriptCache().remove('cruzBanco_v29');
  CacheService.getScriptCache().remove('cruzAssuntos_v23');
  var r = cruzBancoResumo(req);
  r.importadas = vals.length;
  return r;
}

// Dica: o servidor entrega a letra (ou a palavra) e conta o uso. Nao gasta dica com letra ja conhecida.
// Cada tipo de dica tem o seu limite: letras (cruzadinha_dicas) e revelar palavra (cruzadinha_reveals)
function cruzLimiteDica(ctx, tipo, onde) {
  var usadas = ctx.dicas.filter(function (d) { return (d.tipo === 'palavra') === (tipo === 'palavra'); }).length;
  var limite = tipo === 'palavra' ? ctx.limitePal : ctx.limite;
  if (usadas >= limite) {
    if (!ctx.limite) fail('As dicas estão desativadas ' + onde + '.');
    fail(tipo === 'palavra' ? 'Suas revelações de palavra acabaram (' + limite + ').' : 'Suas dicas de letra acabaram (' + limite + ').');
  }
}

function cruzHint(req) {
  var ctx = cruzContexto(req, true);
  var tipo = req.tipo === 'palavra' ? 'palavra' : 'letra';
  cruzLimiteDica(ctx, tipo, 'nesta sala');
  var p = ctx.grade.palavras[Number(req.id)];
  if (!p) fail('Palavra não encontrada.');
  if (cruzMinhas(ctx)[p.id]) fail('Essa palavra já está resolvida.');
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
      tipo: tipoOut(room), evento: evento, detalhe: safeText(detalhe)
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
      token: room.token, sala: safeText(room.nome), tipo: tipoOut(room),
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
    memoLimpa('CtfAnalise');
    var d = debriefList(room);
    var linhas = d.itens.map(function (it) {
      return [room.token, safeText(room.nome), it.fase, it.tag_id, safeText(it.pacote), safeText(it.pergunta), it.acertos,
        d.total_alunos, d.total_alunos ? Math.round(100 * it.acertos / d.total_alunos) : 0];
    });
    if (linhas.length) sh.getRange(sh.getLastRow() + 1, 1, linhas.length, SHEET_HEADERS.CtfAnalise.length).setValues(linhas);
    memoLimpa('CtfAnalise');
  } catch (err) {}
}

// Lista as salas guardadas no servidor (precisa da chave do banco). Serve de historico em qualquer aparelho.
function salasList(req) {
  requireBancoKey(req);
  var salas = readRows('CtfSalas').slice(-200).reverse().map(function (r) {
    var st = statsOf(r);
    return {
      token: String(r.token), nome: String(r.nome), tipo: tipoOut(r),
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
    bancoCacheLimpa();
  } else {
    id = newBancoId(rows.map(function (r) { return String(r.id); }));
    appendObj('Banco', bancoToValues(id, c));
    bancoCacheLimpa();
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
      memoLimpa('Banco');
      bancoCacheLimpa();
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
    memoLimpa('Banco');
    bancoCacheLimpa();
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
  memoLimpa('NfcPublicadas');
  PropertiesService.getScriptProperties().setProperty('NFC_SOMENTE_BANCO', req.somenteBanco === false ? 'false' : 'true');
  return { total: values.length };
}

// Publico: os celulares dos alunos leem o conjunto publicado (o Rali NFC valida no aparelho, como as missoes padrao)
// Sem a chave do banco (aparelho de aluno) a lista vem sem resposta, aceitas e explicacao: a conferencia e no servidor.
function bancoChaveOk(req) {
  var hash = PropertiesService.getScriptProperties().getProperty('BANCO_KEY_HASH');
  return !!hash && !!req && sha256hex(String(req.chave || '')) === hash;
}

function nfcSet(req) {
  var professor = bancoChaveOk(req);
  var rows = readRows('NfcPublicadas').filter(function (r) { return String(r.tag_id) !== ''; });
  return {
    somenteBanco: PropertiesService.getScriptProperties().getProperty('NFC_SOMENTE_BANCO') !== 'false',
    missoes: rows.map(function (r) {
      return {
        tag_id: String(r.tag_id), disciplina: r.disciplina, assunto: r.assunto, tipo: r.tipo === 'multipla' ? 'multipla' : 'exata',
        pergunta: r.pergunta, resposta: professor ? String(r.resposta) : '', aceitas: professor ? parseList(r.aceitas) : [], opcoes: parseList(r.opcoes),
        xp: Number(r.xp) || 10, explicacao: professor ? r.explicacao || '' : ''
      };
    })
  };
}
`;

/** Impressão digital do código do servidor (FNV-1a de 32 bits): muda sozinha a cada alteração do script. */
function revisaoDe(texto: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** Revisão que o site espera do servidor. O doGet do script publicado devolve a mesma revisão. */
export const REVISAO_SCRIPT = revisaoDe(SCRIPT_BASE);
export const VERSAO_SCRIPT = 35;
export const CTF_APPS_SCRIPT = SCRIPT_BASE.replace('__REVISAO__', REVISAO_SCRIPT);
