/**
 * XP dos jogos para a página de Conquistas do Trilha Rali HUB.
 * Guarda, por aluno do HUB, o melhor XP de cada sala (CTF, Cruzada e Desvendando) neste aparelho
 * e envia para a planilha do HUB (aba Jornadas), para valer em qualquer aparelho em que o aluno entrar.
 */
import { lerPerfilHub } from './perfilHub';
import { urlDoHub } from './turmasHub';

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

export const chaveEnviado = (alunoId: string) => `hub-jogos-enviado:${alunoId}`;

/** Só precisa enviar se alguma sala mudou depois do último envio que deu certo. */
export function precisaEnviar(resumo: ResumoJogos | null, enviadoEm: number): boolean {
  return Object.values(resumo?.salas ?? {}).some((s) => (s.em || 0) > enviadoEm);
}

export function registrarXpJogo(token: string, novo: Omit<SalaXp, 'em'>): void {
  const p = lerPerfilHubComId();
  if (!p || !token || !(novo.xp >= 0)) return;
  try {
    const k = chaveXp(p);
    const atual = JSON.parse(localStorage.getItem(k) || 'null') as ResumoJogos | null;
    const velho = atual?.salas?.[token];
    if (velho && velho.xp >= novo.xp && (velho.acertos ?? 0) >= (novo.acertos ?? 0)) return; // nada novo
    localStorage.setItem(k, JSON.stringify(juntarXp(atual, token, novo)));
  } catch {
    /* sem espaço ou navegador restrito */
    return;
  }
  agendarEnvio();
}

/* ---------- envio para a planilha do HUB (acao "jornada", que junta as salas de todos os aparelhos) ---------- */
let timer: ReturnType<typeof setTimeout> | null = null;
let enviando = false;

function agendarEnvio(ms = 4000): void {
  if (typeof window === 'undefined') return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void enviarXpParaHub(), ms);
}

/** Envia o resumo dos jogos deste aparelho; devolve true se a planilha confirmou. */
export async function enviarXpParaHub(keepalive = false): Promise<boolean> {
  if (enviando) return false;
  let perfil: { id?: string; pin?: string; turma?: string } | null = null;
  try {
    perfil = JSON.parse(localStorage.getItem('perfil:aluno') || 'null');
  } catch {
    return false;
  }
  if (!perfil?.id || !perfil.pin || !perfil.turma) return false;
  const k = chaveXp(perfil.id);
  let resumo: ResumoJogos | null = null;
  try {
    resumo = JSON.parse(localStorage.getItem(k) || 'null');
  } catch {
    return false;
  }
  const enviadoEm = Number(localStorage.getItem(chaveEnviado(perfil.id)) || 0);
  if (!precisaEnviar(resumo, enviadoEm)) return true;
  enviando = true;
  const agora = Date.now();
  try {
    const url = await urlDoHub();
    const r = await fetch(url, {
      method: 'POST',
      keepalive,
      body: JSON.stringify({ acao: 'jornada', turma: perfil.turma, id: perfil.id, pin: perfil.pin, jogos: resumo?.salas ?? {} }),
    }).then((x) => x.json());
    if (!r?.ok) return false;
    localStorage.setItem(chaveEnviado(perfil.id), String(agora));
    // Traz as salas jogadas em outros aparelhos (a planilha devolve o resumo completo).
    const doServidor = r.jornada?.jogos as Record<string, SalaXp> | undefined;
    if (doServidor && typeof doServidor === 'object') {
      const atual = (JSON.parse(localStorage.getItem(k) || 'null') as ResumoJogos | null) ?? { salas: {} };
      for (const [t, s] of Object.entries(doServidor)) {
        if (!atual.salas[t] || (s.xp || 0) > atual.salas[t].xp) atual.salas[t] = { ...s, em: Math.min(s.em || 0, agora) };
      }
      localStorage.setItem(k, JSON.stringify(atual));
    }
    return true;
  } catch {
    return false; // sem internet: tenta de novo na próxima sala ou quando abrir os jogos
  } finally {
    enviando = false;
  }
}

/** Ao abrir os jogos e ao sair da página: envia o que ficou pendente (por exemplo, jogou sem internet). */
export function iniciarEnvioXp(): void {
  if (typeof window === 'undefined') return;
  agendarEnvio(2500);
  window.addEventListener('online', () => agendarEnvio(1000));
  window.addEventListener('pagehide', () => void enviarXpParaHub(true));
}

function lerPerfilHubComId(): string {
  if (!lerPerfilHub()) return '';
  try {
    return String(JSON.parse(localStorage.getItem('perfil:aluno') || 'null')?.id || '');
  } catch {
    return '';
  }
}
