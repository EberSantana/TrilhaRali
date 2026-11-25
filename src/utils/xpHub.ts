/**
 * XP dos jogos para a página de Conquistas do Trilha Rali HUB (mesmo endereço, mesmo aparelho).
 * Guarda, por aluno do HUB, o melhor XP de cada sala: CTF, Cruzada e Desvendando.
 */
import { lerPerfilHub } from './perfilHub';

export type TipoJogo = 'ctf' | 'cruz' | 'desv' | 'rali';
export interface SalaXp {
  tipo: TipoJogo;
  sala: string;
  xp: number;
  acertos?: number;
  em: number;
}
export interface ResumoJogos {
  salas: Record<string, SalaXp>;
}

export const chaveXp = (alunoId: string) => `hub-jogos:${alunoId}`;

/** Junta o XP novo ao resumo, mantendo o maior XP de cada sala. */
export function juntarXp(atual: ResumoJogos | null, token: string, novo: Omit<SalaXp, 'em'>, agora = Date.now()): ResumoJogos {
  const r: ResumoJogos = { salas: { ...(atual?.salas ?? {}) } };
  const velho = r.salas[token];
  if (!velho || novo.xp >= velho.xp) r.salas[token] = { ...novo, em: agora };
  return r;
}

export function registrarXpJogo(token: string, novo: Omit<SalaXp, 'em'>): void {
  const p = lerPerfilHubComId();
  if (!p || !token || !(novo.xp >= 0)) return;
  try {
    const k = chaveXp(p);
    const atual = JSON.parse(localStorage.getItem(k) || 'null') as ResumoJogos | null;
    localStorage.setItem(k, JSON.stringify(juntarXp(atual, token, novo)));
  } catch {
    /* sem espaço ou navegador restrito */
  }
}

function lerPerfilHubComId(): string {
  if (!lerPerfilHub()) return '';
  try {
    return String(JSON.parse(localStorage.getItem('perfil:aluno') || 'null')?.id || '');
  } catch {
    return '';
  }
}
