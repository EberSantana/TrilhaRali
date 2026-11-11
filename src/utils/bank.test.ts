import test from 'node:test';
import assert from 'node:assert/strict';
import { bankToCtfPayload, CSV_TEMPLATE, emptyDraft, exportCsv, parseImport, publishedToMission, tagName, tidyDraft, validateDraft } from './bank.ts';
import { validateAnswer } from './validation.ts';

const base = { ...emptyDraft('Redes'), pergunta: 'Qual protocolo traduz nomes?', resposta: 'DNS' };

test('validateDraft segue as regras do servidor', () => {
  assert.equal(validateDraft(base), null);
  assert.match(validateDraft({ ...base, disciplina: ' ' })!, /disciplina/);
  assert.match(validateDraft({ ...base, pergunta: 'oi' })!, /5 caracteres/);
  assert.match(validateDraft({ ...base, resposta: '' })!, /resposta correta/);
  assert.match(validateDraft({ ...base, xp: 0 })!, /XP/);
  const m = { ...base, tipo: 'multipla' as const, resposta: 'AES', opcoes: ['RSA', 'AES'] };
  assert.equal(validateDraft(m), null);
  assert.match(validateDraft({ ...m, resposta: 'DES' })!, /uma das alternativas/);
  assert.match(validateDraft({ ...m, opcoes: ['AES'] })!, /2 a 6/);
  assert.match(validateDraft({ ...m, opcoes: ['a', 'b', 'c', 'd', 'e', 'f', 'g'], resposta: 'a' })!, /2 a 6/);
});

test('tidyDraft remove vazios, repetidos e variações iguais ao gabarito', () => {
  const t = tidyDraft({ ...base, aceitas: ['dns', ' ', 'DNS server', 'dns server'] });
  assert.deepEqual(t.aceitas, ['DNS server']);
  const m = tidyDraft({ ...base, tipo: 'multipla', resposta: 'AES', opcoes: ['RSA', 'aes', 'AES', ' '], aceitas: ['x'] });
  assert.deepEqual(m.opcoes, ['RSA', 'aes']);
  assert.deepEqual(m.aceitas, []);
});

test('importa CSV com ; , aspas e listas com |', () => {
  const csv = 'disciplina;assunto;tipo;pergunta;resposta;aceitas;opcoes;xp;explicacao\n' +
    'Redes;Camada;exata;"Qual protocolo traduz nomes; em IPs?";DNS;dns server|resolver;;12;\n' +
    'SI;Cripto;multipla;Qual é simétrico?;AES;;RSA|AES|ECC;15;"Mesma chave"\n' +
    'SI;Cripto;exata;x;y;;;;';
  const r = parseImport(csv);
  assert.equal(r.perguntas.length, 2);
  assert.equal(r.erros.length, 1);
  assert.match(r.erros[0], /Linha 3/);
  assert.equal(r.perguntas[0].pergunta, 'Qual protocolo traduz nomes; em IPs?');
  assert.deepEqual(r.perguntas[0].aceitas, ['dns server', 'resolver']);
  assert.equal(r.perguntas[0].xp, 12);
  assert.equal(r.perguntas[1].tipo, 'multipla');
  assert.deepEqual(r.perguntas[1].opcoes, ['RSA', 'AES', 'ECC']);
});

test('importa JSON e usa a disciplina padrão quando faltar', () => {
  const r = parseImport(JSON.stringify([{ pergunta: 'Quanto é 2+2?', resposta: '4' }]), 'Programação 1');
  assert.equal(r.erros.length, 0);
  assert.equal(r.perguntas[0].disciplina, 'Programação 1');
  assert.match(parseImport('[{').erros[0], /JSON inválido/);
  assert.match(parseImport('algo solto').erros[0], /Cabeçalho/);
  assert.match(parseImport('  ').erros[0], /vazio/);
});

test('o modelo de CSV importa sem erros e exportar/importar preserva tudo', () => {
  const r = parseImport(CSV_TEMPLATE);
  assert.deepEqual(r.erros, []);
  assert.equal(r.perguntas.length, 2);
  const again = parseImport(exportCsv(r.perguntas));
  assert.deepEqual(again.perguntas, r.perguntas);
});

test('missões do banco: payload do CTF e missão do NFC validam a resposta certa', () => {
  const q = { ...base, id: 'Q1', tipo: 'multipla' as const, resposta: 'AES', opcoes: ['RSA', 'AES'], assunto: 'Cripto', xp: 20 };
  const p = bankToCtfPayload(q);
  assert.equal(p.tag_id, 'banco_Q1');
  assert.deepEqual(p.opcoes, ['RSA', 'AES']);
  assert.deepEqual(p.alternativas, []);
  const m = publishedToMission({ ...q, tag_id: 'tag_01' }, 0);
  assert.deepEqual(m.opcoes, ['RSA', 'AES']);
  assert.equal(validateAnswer(m, 'aes').correto, true);
  assert.equal(validateAnswer(m, 'RSA').correto, false);
  assert.equal(tagName(7), 'tag_07');
});
