import { useEffect, useState } from 'react';
import type { ModoPapeis } from '../components/turmas/Papeis';
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
  /** Quem sou eu? (servidor v37+; ausente nos anteriores) */
  quem?: number;
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
  const cab = ['Matrícula', 'Aluno', 'CTF', 'Cruzada', 'Rali NFC', 'Desvendando', 'Quem sou eu?', 'Total'];
  const esc = (v: string | number) => (/[;"\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const linhas = alunos.map((a) => [a.m, a.n, a.ctf, a.cruz, a.rali, a.desv, a.quem ?? 0, a.total].map(esc).join(';'));
  return '﻿' + [`Turma;${esc(turma)}`, cab.join(';'), ...linhas].join('\n') + '\n';
}

export interface TurmaDaSala {
  nome: string;
  alunos: string[];
  /** Nomes que já entraram na sala (em outra equipe, dupla ou celular). */
  ocupados: string[];
}

/** Dados públicos da sala para a tela de entrada: lista da turma (ou null) e o modo dos papéis. */
export interface SalaPublica {
  turma: TurmaDaSala | null;
  papeis: ModoPapeis;
}

export const salaPublica = (token: string, gid?: string): Promise<SalaPublica | null> =>
  ctfCall<{ turma: (Omit<TurmaDaSala, 'ocupados'> & { ocupados?: string[] }) | null; papeis?: string }>('salaTurma', { token, ...(gid ? { gid } : {}) })
    .then((r) => ({ turma: r.turma ? { ...r.turma, ocupados: r.turma.ocupados ?? [] } : null, papeis: (r.papeis ?? '') as ModoPapeis }))
    .catch(() => null);

/** Nomes da turma de uma sala (para o aluno escolher). null = sala sem turma ou servidor antigo. */
export const nomesDaSala = (token: string, gid?: string) => salaPublica(token, gid).then((r) => r?.turma ?? null);

/** O professor libera um nome (o aluno trocou de celular). */
export const liberarNome = (token: string, adminKey: string, nome: string) => ctfCall<{ ok: true }>('liberarNome', { token, adminKey, nome });

/** Compara nomes sem acento e sem diferença de maiúsculas. */
export const normNome = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** Busca os dados da sala assim que o token parece completo (6 caracteres) e os atualiza a cada 15 s. */
export function useSalaPublica(token: string, gid?: string) {
  const [info, setInfo] = useState<SalaPublica | null>(null);
  useEffect(() => {
    const t = token.trim().toUpperCase();
    setInfo(null);
    if (t.length !== 6) return;
    let vivo = true;
    const busca = () => void salaPublica(t, gid).then((r) => vivo && setInfo(r));
    const id = window.setTimeout(busca, 350);
    const ciclo = window.setInterval(busca, 15000);
    return () => {
      vivo = false;
      window.clearTimeout(id);
      window.clearInterval(ciclo);
    };
  }, [token, gid]);
  return info;
}

/** Só a lista da turma da sala (null = sala sem turma). */
export const useTurmaDaSala = (token: string, gid?: string) => useSalaPublica(token, gid)?.turma ?? null;

/** Turmas do professor para escolher ao criar uma sala (vazio sem a chave do banco). */
/** Turmas cadastradas e, se não deu para carregar, o motivo (chave ausente, chave antiga ou sem rede). */
export function useTurmasEstado(): { turmas: Turma[]; erro: string } {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [erro, setErro] = useState('');
  useEffect(() => {
    if (!getBancoKey()) {
      setErro('A chave do banco não está conectada neste navegador. Entre em Professor e informe a chave.');
      return;
    }
    let vivo = true;
    listarTurmas()
      .then((t) => {
        if (!vivo) return;
        setTurmas(t);
        setErro('');
      })
      .catch((e: unknown) => {
        if (!vivo) return;
        const m = e instanceof Error ? e.message : '';
        setErro(/chave/i.test(m) ? 'A chave do banco deste navegador está desatualizada. Entre em Professor e informe a chave nova.' : `Não consegui carregar as turmas${m ? `: ${m}` : '.'}`);
      });
    return () => {
      vivo = false;
    };
  }, []);
  return { turmas, erro };
}

export function useTurmas() {
  return useTurmasEstado().turmas;
}
