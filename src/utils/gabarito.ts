import type { Mission } from '../types';

/**
 * Gabarito das missões prontas: fica CRIPTOGRAFADO no site (src/data/gabarito.enc.json) e só abre com a chave do
 * banco do professor. Assim o aluno que inspeciona o código do site não encontra as respostas.
 * Formato: AES-256-GCM com chave derivada por PBKDF2-SHA256 (dados = cifra + tag de 16 bytes, em base64).
 */
export interface GabaritoMissao {
  r: string;
  a?: string[];
  e: string;
  q?: string;
}
export interface Gabarito {
  v: number;
  missoes: Record<string, GabaritoMissao>;
  /** Desvendando: culpado de cada caso (o servidor confere pela aba DesvGabarito da planilha) */
  desv?: Record<string, { suspeito: number; pontos: number; explicacao: string }>;
}
export interface GabaritoCifrado {
  v: number;
  iter: number;
  salt: string;
  iv: string;
  data: string;
}

/** Missão sem as partes que revelam a resposta (o que fica no código público). */
export type MissaoPublica = Omit<Mission, 'resposta_curta' | 'alternatives' | 'explanation' | 'sample_query'>;

/** Monta a missão completa com campos vazios: as telas funcionam, mas sem gabarito. */
export const semGabarito = (lista: MissaoPublica[]): Mission[] => lista.map((m) => ({ ...m, resposta_curta: '', explanation: '' }));

export function aplicarGabarito(lista: Mission[], g: Gabarito | null): Mission[] {
  if (!g) return lista;
  return lista.map((m) => {
    const x = g.missoes[m.tag_id];
    if (!x || m.resposta_curta) return m;
    return { ...m, resposta_curta: x.r, alternatives: x.a, explanation: x.e, ...(x.q ? { sample_query: x.q } : {}) };
  });
}

const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/** Abre o gabarito no navegador (Web Crypto). Chave errada: rejeita. */
export async function abrirGabarito(c: GabaritoCifrado, chave: string): Promise<Gabarito> {
  const sub = globalThis.crypto.subtle;
  const base = await sub.importKey('raw', new TextEncoder().encode(chave.trim()), 'PBKDF2', false, ['deriveKey']);
  const k = await sub.deriveKey({ name: 'PBKDF2', salt: b64(c.salt), iterations: c.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const claro = await sub.decrypt({ name: 'AES-GCM', iv: b64(c.iv) }, k, b64(c.data));
  return JSON.parse(new TextDecoder().decode(claro)) as Gabarito;
}
