/**
 * Turmas únicas: a lista oficial de turmas e alunos fica no Trilha Rali HUB (planilha do portal).
 * Os jogos importam essa lista para as próprias turmas, então o professor cadastra cada aluno uma vez só.
 */
import { listarTurmas, salvarTurma, type AlunoTurma, type Turma } from './turmasApi';
import { getBancoKey } from './bankApi';

export interface AlunoHub {
  turma?: string;
  nome?: string;
  matricula?: string | number;
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** Agrupa os alunos do HUB por turma, no formato das turmas dos jogos (sem nomes repetidos, até 80 por turma). */
export function montarTurmasDoHub(alunos: AlunoHub[]): { nome: string; alunos: AlunoTurma[] }[] {
  const por: Record<string, { nome: string; alunos: AlunoTurma[]; vistos: Set<string> }> = {};
  for (const a of alunos) {
    const t = String(a.turma ?? '').replace(/\s+/g, ' ').trim();
    const n = String(a.nome ?? '').replace(/\s+/g, ' ').trim();
    if (t.length < 2 || n.length < 2) continue;
    const g = (por[norm(t)] ??= { nome: t.slice(0, 60), alunos: [], vistos: new Set() });
    if (g.vistos.has(norm(n)) || g.alunos.length >= 80) continue;
    g.vistos.add(norm(n));
    g.alunos.push({ m: String(a.matricula ?? '').replace(/[^\w.\-/]/g, '').slice(0, 20), n: n.slice(0, 60) });
  }
  return Object.values(por)
    .map(({ nome, alunos }) => ({ nome, alunos: alunos.sort((x, y) => x.n.localeCompare(y.n, 'pt-BR')) }))
    .sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR'));
}

/** Liga cada turma do HUB à turma dos jogos de mesmo nome (ou cria). */
export function planoDeImportacao(doHub: { nome: string; alunos: AlunoTurma[] }[], existentes: Turma[]) {
  return doHub.map((t) => {
    const ja = existentes.find((e) => norm(e.nome) === norm(t.nome));
    const igual = ja && JSON.stringify(ja.alunos.map((a) => a.n).sort()) === JSON.stringify(t.alunos.map((a) => a.n).sort());
    return { id: ja?.id, nome: t.nome, alunos: t.alunos, acao: !ja ? ('criar' as const) : igual ? ('igual' as const) : ('atualizar' as const) };
  });
}

async function urlDoHub(): Promise<string> {
  const txt = await fetch(new URL('../disciplinas/config.js', window.location.href).href, { cache: 'no-store' }).then((r) => r.text());
  const m = /RANKING_URL\s*=\s*["']([^"']+)["']/.exec(txt);
  if (!m) throw new Error('Não achei o endereço do HUB (config.js).');
  return m[1].trim();
}

function chaveDoHub(): string {
  try {
    return sessionStorage.getItem('pt-prof-chave') || getBancoKey();
  } catch {
    return getBancoKey();
  }
}

export interface ResultadoImportacao {
  criadas: number;
  atualizadas: number;
  iguais: number;
}

/** Busca as turmas no HUB (painel do professor) e grava nas turmas dos jogos. */
export async function importarTurmasDoHub(): Promise<ResultadoImportacao> {
  const chave = chaveDoHub();
  if (!chave) throw new Error('Entre na Área do professor para importar as turmas.');
  const url = await urlDoHub();
  const r = await fetch(url, { method: 'POST', body: JSON.stringify({ acao: 'painel', chave }) }).then((x) => x.json());
  if (!r || !r.ok || !Array.isArray(r.alunos)) {
    throw new Error(r?.erro ? `HUB: ${r.erro} (use a mesma senha nos dois painéis)` : 'Não foi possível ler as turmas do HUB.');
  }
  const plano = planoDeImportacao(montarTurmasDoHub(r.alunos), await listarTurmas());
  const res: ResultadoImportacao = { criadas: 0, atualizadas: 0, iguais: 0 };
  for (const p of plano) {
    if (p.acao === 'igual') { res.iguais++; continue; }
    await salvarTurma({ id: p.id, nome: p.nome, alunos: p.alunos });
    if (p.acao === 'criar') res.criadas++; else res.atualizadas++;
  }
  return res;
}

/** Uma vez por sessão do professor, em segundo plano. */
export function importarTurmasDoHubUmaVez(): void {
  try {
    if (sessionStorage.getItem('rali_turmas_hub_ok')) return;
    sessionStorage.setItem('rali_turmas_hub_ok', '1');
  } catch {
    return;
  }
  importarTurmasDoHub().catch(() => {
    try { sessionStorage.removeItem('rali_turmas_hub_ok'); } catch { /* */ }
  });
}
