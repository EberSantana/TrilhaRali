import { BankQuestion, BankQuestionDraft, PublishedMission } from '../types/bank';
import { CtfMissionPayload } from '../types/ctf';
import { Mission } from '../types';
import { normalizeAnswer } from './validation';

/** Disciplinas do site https://ebersantana.github.io/disciplinas/ (o professor também pode digitar outra). */
export const DISCIPLINAS = [
  'Banco de Dados',
  'Redes de Computadores',
  'Projeto de Redes',
  'Informática Básica',
  'Engenharia de Software',
  'Construção de Sites 1',
  'Segurança da Informação',
  'Mapas Mentais de TI',
  'Fundamentos para Sistemas de Informação',
  'Organização de Computadores',
  'Programação 1',
  'Programação Web (back-end)',
  'Fundamentos de Sistemas Operacionais',
];

export function emptyDraft(disciplina = ''): BankQuestionDraft {
  return { disciplina, assunto: '', tipo: 'exata', pergunta: '', resposta: '', aceitas: [], opcoes: [], xp: 10, explicacao: '', ativo: true };
}

const clean = (s: unknown) => String(s ?? '').replace(/\s+/g, ' ').trim();

/** Mesmas regras do servidor (Apps Script). Devolve a mensagem de erro, ou null se estiver tudo certo. */
export function validateDraft(q: BankQuestionDraft): string | null {
  if (!clean(q.disciplina)) return 'Informe a disciplina.';
  if (clean(q.pergunta).length < 5) return 'A pergunta precisa ter ao menos 5 caracteres.';
  if (q.pergunta.length > 1500) return 'Pergunta muito longa (máximo 1500 caracteres).';
  if (!clean(q.resposta)) return 'Informe a resposta correta.';
  if (!(q.xp >= 1 && q.xp <= 100)) return 'O XP deve ficar entre 1 e 100.';
  if (q.tipo === 'multipla') {
    const keys = new Set(q.opcoes.map(normalizeAnswer).filter(Boolean));
    if (keys.size < 2 || keys.size > 6) return 'Múltipla escolha precisa de 2 a 6 alternativas diferentes.';
    if (!keys.has(normalizeAnswer(q.resposta))) return 'A resposta correta precisa ser uma das alternativas.';
  }
  return null;
}

/** Remove vazios e repetidos para enviar ao servidor. */
export function tidyDraft(q: BankQuestionDraft): BankQuestionDraft {
  const uniq = (list: string[]) => {
    const seen = new Set<string>();
    return list
      .map((x) => x.trim())
      .filter((x) => {
        const k = normalizeAnswer(x);
        if (!k || seen.has(k)) return false;
        seen.add(k);
        return true;
      });
  };
  return {
    ...q,
    disciplina: clean(q.disciplina),
    assunto: clean(q.assunto),
    pergunta: q.pergunta.trim(),
    resposta: q.resposta.trim(),
    aceitas: q.tipo === 'exata' ? uniq(q.aceitas).filter((a) => normalizeAnswer(a) !== normalizeAnswer(q.resposta)) : [],
    opcoes: q.tipo === 'multipla' ? uniq(q.opcoes) : [],
    explicacao: q.explicacao.trim(),
  };
}

export function bankToCtfPayload(q: BankQuestion): CtfMissionPayload {
  return {
    tag_id: `banco_${q.id}`,
    categoria: q.assunto || 'Geral',
    pacote: q.disciplina,
    pergunta: q.pergunta,
    resposta: q.resposta,
    alternativas: q.tipo === 'exata' ? q.aceitas : [],
    xp: q.xp,
    opcoes: q.tipo === 'multipla' ? q.opcoes : [],
    explicacao: q.explicacao || '',
  };
}

export function publishedToMission(p: PublishedMission, index: number): Mission {
  return {
    id: 1000 + index,
    tag_id: p.tag_id,
    package: 'banco',
    packageName: p.disciplina,
    category: 'Geral',
    pergunta: p.pergunta,
    resposta_curta: p.resposta,
    alternatives: p.aceitas,
    xp_valor: p.xp,
    location_suggestion: 'Mesa do laboratório',
    explanation: p.explicacao || p.assunto || '',
    ...(p.tipo === 'multipla' ? { opcoes: p.opcoes } : {}),
  };
}

/** tag_01, tag_02, … a partir de um número inicial. */
export const tagName = (n: number) => `tag_${String(n).padStart(2, '0')}`;

// ---------- Importar / exportar ----------

export const CSV_HEADER = ['disciplina', 'assunto', 'tipo', 'pergunta', 'resposta', 'aceitas', 'opcoes', 'xp', 'explicacao'];

function splitCsvLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === delim) {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
}

/** Quebra o texto em linhas respeitando quebras dentro de aspas. */
function csvLines(text: string): string[] {
  const lines: string[] = [];
  let cur = '';
  let quoted = false;
  for (const c of text.replace(/\r\n?/g, '\n')) {
    if (c === '"') quoted = !quoted;
    if (c === '\n' && !quoted) {
      lines.push(cur);
      cur = '';
    } else cur += c;
  }
  if (cur.trim()) lines.push(cur);
  return lines.filter((l) => l.trim());
}

const toList = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : String(v ?? '').split('|').map((x) => x.trim()).filter(Boolean);

function fromRecord(r: Record<string, unknown>): BankQuestionDraft {
  const tipo = String(r.tipo ?? '').toLowerCase().startsWith('m') ? 'multipla' : 'exata';
  const xp = Number(r.xp);
  return tidyDraft({
    disciplina: String(r.disciplina ?? ''),
    assunto: String(r.assunto ?? ''),
    tipo,
    pergunta: String(r.pergunta ?? ''),
    resposta: String(r.resposta ?? ''),
    aceitas: toList(r.aceitas),
    opcoes: toList(r.opcoes),
    xp: Number.isFinite(xp) && xp > 0 ? xp : 10,
    explicacao: String(r.explicacao ?? ''),
    ativo: r.ativo === undefined ? true : r.ativo !== false && String(r.ativo).toLowerCase() !== 'false',
  });
}

export interface ImportResult {
  perguntas: BankQuestionDraft[];
  erros: string[];
}

/** Aceita JSON (lista de perguntas) ou CSV com cabeçalho (separador ; , ou tab; listas separadas por |). */
export function parseImport(text: string, defaultDisciplina = ''): ImportResult {
  const raw = text.trim().replace(/^﻿/, '');
  const records: Record<string, unknown>[] = [];
  const erros: string[] = [];
  if (!raw) return { perguntas: [], erros: ['O texto está vazio.'] };

  if (raw.startsWith('[') || raw.startsWith('{')) {
    try {
      const data = JSON.parse(raw);
      const list = Array.isArray(data) ? data : Array.isArray(data?.perguntas) ? data.perguntas : [data];
      list.forEach((x: unknown) => records.push((x ?? {}) as Record<string, unknown>));
    } catch {
      return { perguntas: [], erros: ['JSON inválido. Confira vírgulas e aspas.'] };
    }
  } else {
    const lines = csvLines(raw);
    const first = lines[0];
    const delim = [';', '\t', ','].sort((a, b) => first.split(b).length - first.split(a).length)[0];
    const head = splitCsvLine(first, delim).map((h) => normalizeAnswer(h));
    if (!head.includes('pergunta') || !head.includes('resposta')) {
      return { perguntas: [], erros: ['Cabeçalho não encontrado. A primeira linha deve ter: ' + CSV_HEADER.join(';')] };
    }
    lines.slice(1).forEach((l) => {
      const cells = splitCsvLine(l, delim);
      const rec: Record<string, unknown> = {};
      head.forEach((h, i) => (rec[h] = cells[i] ?? ''));
      records.push(rec);
    });
  }

  const perguntas: BankQuestionDraft[] = [];
  records.forEach((r, i) => {
    const q = fromRecord(r);
    if (!q.disciplina) q.disciplina = defaultDisciplina;
    const err = validateDraft(q);
    if (err) erros.push(`Linha ${i + 1}: ${err}`);
    else perguntas.push(q);
  });
  return { perguntas, erros };
}

export function exportJson(list: BankQuestion[]): string {
  return JSON.stringify(
    list.map(({ id: _id, atualizado_em: _at, ...q }) => q),
    null,
    2
  );
}

const csvCell = (v: string) => (/[;"\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export function exportCsv(list: Array<BankQuestionDraft>): string {
  const rows = list.map((q) =>
    [q.disciplina, q.assunto, q.tipo, q.pergunta, q.resposta, q.aceitas.join('|'), q.opcoes.join('|'), String(q.xp), q.explicacao].map(csvCell).join(';')
  );
  return [CSV_HEADER.join(';'), ...rows].join('\n');
}

export const CSV_TEMPLATE = exportCsv([
  { ...emptyDraft('Redes de Computadores'), assunto: 'Camada de rede', pergunta: 'Qual protocolo traduz nomes em endereços IP?', resposta: 'DNS', aceitas: ['dns server'], xp: 10 },
  { ...emptyDraft('Segurança da Informação'), assunto: 'Criptografia', tipo: 'multipla', pergunta: 'Qual destes é um algoritmo simétrico?', resposta: 'AES', opcoes: ['RSA', 'AES', 'ECC'], xp: 15, explicacao: 'AES usa a mesma chave para cifrar e decifrar.' },
]);

// ---------- Seleção (usada pelo Rali NFC e pelo CTF Online) ----------

export interface BankFilter {
  disciplina?: string;
  assunto?: string;
  busca?: string;
  incluirInativas?: boolean;
}

/** Mesma regra de filtro nos dois módulos: por padrão só perguntas ativas. */
export function filterBank(list: BankQuestion[], f: BankFilter): BankQuestion[] {
  const term = (f.busca || '').trim().toLowerCase();
  return list
    .filter((q) => (f.incluirInativas ? true : q.ativo))
    .filter((q) => !f.disciplina || q.disciplina === f.disciplina)
    .filter((q) => !f.assunto || q.assunto === f.assunto)
    .filter((q) => !term || `${q.pergunta} ${q.assunto} ${q.resposta}`.toLowerCase().includes(term))
    .sort(
      (a, b) =>
        a.disciplina.localeCompare(b.disciplina, 'pt-BR') ||
        a.assunto.localeCompare(b.assunto, 'pt-BR') ||
        a.pergunta.localeCompare(b.pergunta, 'pt-BR')
    );
}

/** Sorteia até n itens sem repetir (rand injetável para testes). */
export function pickRandom<T>(list: T[], n: number, rand: () => number = Math.random): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.max(0, Math.min(n, a.length)));
}

/** Seleção levada do Banco de perguntas para a criação de uma sala de CTF. */
const PREFILL_KEY = 'trilha_ctf_prefill_v1';
export function setCtfPrefill(ids: string[]) {
  try { sessionStorage.setItem(PREFILL_KEY, JSON.stringify(ids)); } catch { /* ignore */ }
}
export function takeCtfPrefill(): string[] {
  try {
    const raw = sessionStorage.getItem(PREFILL_KEY);
    sessionStorage.removeItem(PREFILL_KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v.map(String) : [];
  } catch { return []; }
}

// ---------- Auditoria do banco ----------

export interface AuditIssue {
  id: string;
  pergunta: string;
  problemas: string[];
  /** correção segura e automática (quando existe) */
  conserto?: BankQuestionDraft;
  consertoDescricao?: string;
}

const LETRAS = 'abcdef';

/**
 * Procura problemas em todas as perguntas: regras do servidor, resposta escrita como letra (A, B, C…),
 * resposta que aparece no enunciado, perguntas repetidas e alternativas parecidas demais.
 */
export function auditBank(list: BankQuestion[]): AuditIssue[] {
  const out: AuditIssue[] = [];
  const vistas = new Map<string, string>();
  for (const q of list) {
    const problemas: string[] = [];
    let conserto: BankQuestionDraft | undefined;
    let consertoDescricao: string | undefined;
    const erro = validateDraft(q);
    if (erro) {
      problemas.push(erro);
      if (q.tipo === 'multipla') {
        const r = clean(q.resposta);
        const letra = r.replace(/[).:\s-]+$/g, '').toLowerCase();
        const idx = letra.length === 1 ? LETRAS.indexOf(letra) : -1;
        const opcoes = q.opcoes.map(clean).filter(Boolean);
        if (idx >= 0 && opcoes[idx]) {
          conserto = { ...q, resposta: opcoes[idx], opcoes };
          consertoDescricao = `trocar a resposta “${q.resposta}” pelo texto da alternativa ${letra.toUpperCase()}: “${opcoes[idx]}”`;
        } else {
          const parecida = opcoes.filter((o) => normalizeAnswer(o).includes(normalizeAnswer(r)) || normalizeAnswer(r).includes(normalizeAnswer(o)));
          if (r && parecida.length === 1) {
            conserto = { ...q, resposta: parecida[0], opcoes };
            consertoDescricao = `usar a alternativa “${parecida[0]}” como resposta`;
          }
        }
      }
    }
    const resp = normalizeAnswer(q.resposta);
    if (q.tipo === 'exata' && resp.length >= 6 && normalizeAnswer(q.pergunta).includes(resp)) problemas.push('O enunciado contém a resposta.');
    const chave = `${normalizeAnswer(q.disciplina)}|${normalizeAnswer(q.pergunta)}`;
    const outra = vistas.get(chave);
    if (outra) problemas.push('Pergunta repetida no banco.');
    else vistas.set(chave, q.id);
    if (problemas.length) out.push({ id: q.id, pergunta: q.pergunta, problemas, conserto, consertoDescricao });
  }
  return out;
}
