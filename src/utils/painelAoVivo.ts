import type { CtfTeacherStudent, CtfTeacherView } from '../types/ctf';

/** Minutos sem nenhuma atividade para considerar a equipe parada. */
export const PARADO_MIN = 2;

export interface ResumoPainel {
  ativos: number;
  parados: { nome: string; minutos: number }[];
  maisErros: { nome: string; erros: number }[];
  /** false quando o servidor é antigo e não manda horário de atividade */
  disponivel: boolean;
}

/** Última atividade conhecida (entrada, acerto ou erro), em ms. 0 = desconhecida. */
export function ultimaAtividade(a: CtfTeacherStudent): number {
  return Math.max(Number(a.entrou_em) || 0, Number(a.ultimo_acerto) || 0, Number(a.ultimo_erro) || 0);
}

export function minutosParado(a: CtfTeacherStudent, agora: number): number | null {
  const u = ultimaAtividade(a);
  return u ? Math.max(0, Math.floor((agora - u) / 60000)) : null;
}

export function resumoPainel(view: CtfTeacherView, relogioLocal = Date.now()): ResumoPainel {
  const agora = view.agora || relogioLocal;
  const disponivel = view.alunos.some((a) => ultimaAtividade(a) > 0);
  const parados: ResumoPainel['parados'] = [];
  let ativos = 0;
  for (const a of view.alunos) {
    const m = minutosParado(a, agora);
    if (m === null) continue;
    if (m >= PARADO_MIN) parados.push({ nome: a.nome, minutos: m }); else ativos++;
  }
  parados.sort((x, y) => y.minutos - x.minutos);
  const maisErros = view.alunos.filter((a) => a.erros > 0).sort((x, y) => y.erros - x.erros).slice(0, 3).map((a) => ({ nome: a.nome, erros: a.erros }));
  return { ativos, parados, maisErros, disponivel };
}
