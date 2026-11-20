import { useEffect, useState } from 'react';
import { ctfCall } from './ctfApi';
import { getBancoKey } from './bankApi';

export interface AlunoTurma {
  /** matrícula (opcional) */
  m: string;
  /** nome como aparece para o aluno escolher */
  n: string;
}
export interface Turma {
  id: string;
  nome: string;
  alunos: AlunoTurma[];
}
export interface NotaAluno extends AlunoTurma {
  ctf: number;
  cruz: number;
  rali: number;
  desv: number;
  total: number;
}

const comChave = (x: Record<string, unknown> = {}) => ({ ...x, chave: getBancoKey() });
export const listarTurmas = () => ctfCall<{ turmas: Turma[] }>('turmasList', comChave()).then((r) => r.turmas);
export const salvarTurma = (t: { id?: string; nome: string; alunos: AlunoTurma[] }) => ctfCall<Turma>('turmaSalvar', comChave(t));
export const excluirTurma = (id: string) => ctfCall<{ ok: true }>('turmaExcluir', comChave({ id }));
export const notasDaTurma = (id: string) => ctfCall<{ turma: { id: string; nome: string }; salas: number; alunos: NotaAluno[] }>('turmaNotas', comChave({ id }));

/**
 * Lê a lista colada pelo professor: um aluno por linha, "matrícula;nome", "matrícula<TAB>nome" (colado do SUAP
 * ou da planilha) ou só o nome.
 */
export function lerListaAlunos(texto: string): AlunoTurma[] {
  const out: AlunoTurma[] = [];
  const vistos = new Set<string>();
  for (const bruta of texto.split(/\r?\n/)) {
    const linha = bruta.trim();
    if (!linha) continue;
    const partes = linha.split(/\t|;/).map((x) => x.trim()).filter(Boolean);
    if (partes.some((p) => /^(nome|aluno|alunos|matr[ií]cula|estudante)$/i.test(p))) continue; // cabeçalho
    let m = '';
    let n = linha;
    if (partes.length >= 2) {
      const comNumero = partes.find((p) => /\d{3,}/.test(p) && !/[a-zà-ÿ]{3,}/i.test(p));
      m = comNumero || '';
      n = partes.filter((p) => p !== comNumero).join(' ');
    }
    n = n.replace(/\s+/g, ' ').trim();
    const k = n.toLowerCase();
    if (n.length < 2 || vistos.has(k) || /^(nome|aluno|matr[ií]cula)$/i.test(n)) continue;
    vistos.add(k);
    out.push({ m, n });
  }
  return out;
}

/** CSV para planilha/SUAP: separado por ponto e vírgula e com BOM, para o Excel abrir com acentos. */
export function notasCsv(turma: string, alunos: NotaAluno[]): string {
  const cab = ['Matrícula', 'Aluno', 'CTF', 'Cruzada', 'Rali NFC', 'Desvendando', 'Total'];
  const esc = (v: string | number) => (/[;"\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const linhas = alunos.map((a) => [a.m, a.n, a.ctf, a.cruz, a.rali, a.desv, a.total].map(esc).join(';'));
  return '﻿' + [`Turma;${esc(turma)}`, cab.join(';'), ...linhas].join('\n') + '\n';
}

/** Nomes da turma de uma sala (para o aluno escolher). null = sala sem turma ou servidor antigo. */
export const nomesDaSala = (token: string) =>
  ctfCall<{ turma: { nome: string; alunos: string[] } | null }>('salaTurma', { token }).then((r) => r.turma).catch(() => null);

/** Busca a lista da turma assim que o token parece completo (6 caracteres). */
export function useTurmaDaSala(token: string) {
  const [turma, setTurma] = useState<{ nome: string; alunos: string[] } | null>(null);
  useEffect(() => {
    const t = token.trim().toUpperCase();
    setTurma(null);
    if (t.length !== 6) return;
    let vivo = true;
    const id = window.setTimeout(() => {
      void nomesDaSala(t).then((r) => vivo && setTurma(r));
    }, 350);
    return () => {
      vivo = false;
      window.clearTimeout(id);
    };
  }, [token]);
  return turma;
}

/** Turmas do professor para escolher ao criar uma sala (vazio sem a chave do banco). */
export function useTurmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  useEffect(() => {
    if (!getBancoKey()) return;
    let vivo = true;
    listarTurmas().then((t) => vivo && setTurmas(t)).catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);
  return turmas;
}
