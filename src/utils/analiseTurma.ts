import { ctfCall } from './ctfApi';
import { getBancoKey } from './bankApi';

export interface AnaliseAluno {
  n: string;
  total: number;
  ctf: number;
  cruz: number;
  rali: number;
  desv: number;
  salas: number;
  /** Salas em que o aluno jogou (servidor v31 em diante). */
  tokens?: string[];
  acertos: number;
  erros: number;
  ultimo: number;
}
export interface AnalisePergunta {
  tag_id: string;
  pergunta: string;
  pacote: string;
  categoria: string;
  salas: number;
  participantes: number;
  acertos: number;
  erros: number;
}
export interface AnaliseAssunto {
  assunto: string;
  perguntas: number;
  participantes: number;
  acertos: number;
  erros: number;
}
export interface AnaliseCaso {
  caso: string;
  resolvidos: number;
  erros: number;
  dicas: number;
  pontos: number;
}
export interface AnaliseSala {
  token: string;
  nome: string;
  tipo: string;
  status: string;
  criada: string;
  participantes: number;
}
export interface Analise {
  turma: { id: string; nome: string; alunos: number };
  salas: AnaliseSala[];
  alunos: AnaliseAluno[];
  perguntas: AnalisePergunta[];
  assuntos: AnaliseAssunto[];
  casos: AnaliseCaso[];
  duplas: number;
}

export const analiseDaTurma = (id: string) => ctfCall<Analise>('turmaAnalise', { id, chave: getBancoKey() });

/** Percentual inteiro (0–100) ou null quando não há base. */
export const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : null);

export type Motivo = 'sem_participacao' | 'muitos_erros' | 'pontos_baixos' | 'sumiu';
export const MOTIVOS: Record<Motivo, string> = {
  sem_participacao: 'Não participou de nenhuma sala',
  muitos_erros: 'Erra mais do que acerta',
  pontos_baixos: 'Pontos bem abaixo da média',
  sumiu: 'Não jogou as 2 últimas salas',
};

/** Indicadores gerais da turma. */
export function resumo(a: Analise) {
  const ativos = a.alunos.filter((x) => x.salas > 0);
  const acertos = ativos.reduce((s, x) => s + x.acertos, 0);
  const erros = ativos.reduce((s, x) => s + x.erros, 0);
  const pontos = ativos.reduce((s, x) => s + x.total, 0);
  return {
    participaram: ativos.length,
    total: a.alunos.length,
    salas: a.salas.length,
    taxa: pct(acertos, acertos + erros),
    media: ativos.length ? Math.round(pontos / ativos.length) : 0,
  };
}

/**
 * Alunos que pedem atenção do professor, com os motivos. Regras simples e explicáveis:
 * nenhuma sala; mais erros que acertos (com pelo menos 4 tentativas); menos de 40% da média de pontos;
 * ausente nas salas mais recentes (participou antes, mas não das 2 últimas, quando há 3 ou mais salas).
 */
export function precisamAtencao(a: Analise): { aluno: AnaliseAluno; motivos: Motivo[] }[] {
  const { media } = resumo(a);
  const recentes = a.salas.length >= 3 ? new Set([...a.salas].sort((x, y) => (x.criada < y.criada ? 1 : -1)).slice(0, 2).map((s) => s.token)) : null;
  return a.alunos
    .map((aluno) => {
      const motivos: Motivo[] = [];
      if (aluno.salas === 0) motivos.push('sem_participacao');
      else {
        if (aluno.acertos + aluno.erros >= 4 && aluno.erros > aluno.acertos) motivos.push('muitos_erros');
        if (media > 0 && aluno.total < media * 0.4) motivos.push('pontos_baixos');
        if (recentes && aluno.tokens && !aluno.tokens.some((t) => recentes.has(t))) motivos.push('sumiu');
      }
      return { aluno, motivos };
    })
    .filter((x) => x.motivos.length)
    .sort((x, y) => y.motivos.length - x.motivos.length || x.aluno.total - y.aluno.total);
}

/** Perguntas com menor taxa de acerto (desempate: mais tentativas erradas). */
export function perguntasDificeis(a: Analise, n = 8) {
  return a.perguntas
    .map((p) => ({ ...p, taxa: pct(p.acertos, p.participantes) ?? 0 }))
    .sort((x, y) => x.taxa - y.taxa || y.erros - x.erros)
    .slice(0, n);
}

export function assuntosOrdenados(a: Analise) {
  return a.assuntos.map((s) => ({ ...s, taxa: pct(s.acertos, s.participantes) ?? 0 })).sort((x, y) => x.taxa - y.taxa);
}

/** CSV da análise por aluno (abre no Excel/Planilhas: separador ; e acentos certos). */
export function analiseCsv(a: Analise): string {
  const at = new Map(precisamAtencao(a).map((x) => [x.aluno.n, x.motivos.map((m) => MOTIVOS[m]).join(' / ')]));
  const esc = (v: string | number) => (/[;"\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const cab = ['Aluno', 'Salas', 'Pontos', 'CTF', 'Cruzada', 'Rali NFC', 'Desvendando', 'Acertos', 'Erros', 'Taxa de acerto (%)', 'Atenção'];
  const linhas = a.alunos.map((x) => [x.n, x.salas, x.total, x.ctf, x.cruz, x.rali, x.desv, x.acertos, x.erros, pct(x.acertos, x.acertos + x.erros) ?? '', at.get(x.n) ?? ''].map(esc).join(';'));
  return '﻿' + [`Turma;${esc(a.turma.nome)}`, cab.join(';'), ...linhas].join('\n') + '\n';
}
