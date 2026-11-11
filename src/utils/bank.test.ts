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

import { filterBank, pickRandom, setCtfPrefill, takeCtfPrefill } from './bank.ts';
import { BankQuestion } from '../types/bank';

const mk = (id: string, disciplina: string, ativo: boolean, assunto = 'A'): BankQuestion => ({
  id, disciplina, assunto, tipo: 'exata', pergunta: `Pergunta ${id}?`, resposta: 'x', aceitas: [], opcoes: [], xp: 10, explicacao: '', ativo,
});

test('filterBank: por padrão só ativas; incluirInativas traz todas (mesma regra NFC/CTF)', () => {
  const list = [mk('1', 'Redes', true), mk('2', 'Redes', false), mk('3', 'SO', false, 'B')];
  assert.deepEqual(filterBank(list, {}).map((q) => q.id), ['1']);
  assert.deepEqual(filterBank(list, { incluirInativas: true }).map((q) => q.id).sort(), ['1', '2', '3']);
  assert.deepEqual(filterBank(list, { incluirInativas: true, disciplina: 'SO' }).map((q) => q.id), ['3']);
  assert.deepEqual(filterBank(list, { incluirInativas: true, assunto: 'B' }).map((q) => q.id), ['3']);
  assert.deepEqual(filterBank(list, { incluirInativas: true, busca: 'pergunta 2' }).map((q) => q.id), ['2']);
});

test('pickRandom: sorteia sem repetir e respeita o limite', () => {
  const r = pickRandom([1, 2, 3, 4, 5], 3, () => 0.3);
  assert.equal(r.length, 3);
  assert.equal(new Set(r).size, 3);
  assert.equal(pickRandom([1, 2], 10).length, 2);
  assert.equal(pickRandom([1, 2], 0).length, 0);
});

test('prefill do CTF é lido uma única vez', () => {
  const store: Record<string, string> = {};
  (globalThis as any).sessionStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
  setCtfPrefill(['a', 'b']);
  assert.deepEqual(takeCtfPrefill(), ['a', 'b']);
  assert.deepEqual(takeCtfPrefill(), []);
});

test('auditBank: letra como resposta vira correção automática; repetida e enunciado com resposta são apontados', async () => {
  const { auditBank } = await import('./bank');
  const base = { disciplina: 'BD', assunto: '', tipo: 'multipla' as const, aceitas: [], opcoes: ['Alpha', 'Beta', 'Gama'], xp: 10, explicacao: '', ativo: true };
  const lista = [
    { ...base, id: '1', pergunta: 'Qual é a segunda letra grega?', resposta: 'B' },
    { ...base, id: '2', pergunta: 'Qual é a primeira letra grega?', resposta: 'Alpha' },
    { ...base, id: '3', pergunta: 'Qual é a primeira letra grega?', resposta: 'Alpha' },
    { ...base, id: '4', tipo: 'exata' as const, opcoes: [], pergunta: 'A resposta é fundamental e ponto.', resposta: 'fundamental' },
  ];
  const r = auditBank(lista);
  assert.deepEqual(r.map((x) => x.id), ['1', '3', '4']);
  assert.equal(r[0].conserto?.resposta, 'Beta');
  assert.match(r[1].problemas.join(), /repetida/);
  assert.match(r[2].problemas.join(), /enunciado/);
});
