import { REVISAO_SCRIPT, VERSAO_SCRIPT } from '../data/ctfAppsScript';
import { getCtfApiUrl } from './ctfApi';

export type SituacaoServidor = 'ok' | 'desatualizado' | 'sem-resposta';
export interface InfoServidor {
  situacao: SituacaoServidor;
  versao?: number;
  revisao?: string;
}

/** Compara o que o servidor publicado diz com o que o site espera. Sem "revisao" = script anterior a esta checagem. */
export function situacao(r: { versao?: number; revisao?: string } | null): SituacaoServidor {
  if (!r || typeof r.versao !== 'number') return 'sem-resposta';
  if (r.versao < VERSAO_SCRIPT || r.revisao !== REVISAO_SCRIPT) return 'desatualizado';
  return 'ok';
}

const K = 'rali_servidor_versao_v1';
const VALIDADE_MS = 10 * 60_000;

/** Pergunta a versão ao servidor (GET, sem chave). Guarda a resposta por 10 min nesta aba. */
export async function conferirServidor(api = getCtfApiUrl(), forcar = false): Promise<InfoServidor> {
  if (!api) return { situacao: 'sem-resposta' };
  try {
    const c = JSON.parse(sessionStorage.getItem(K) || 'null') as { api: string; em: number; r: InfoServidor } | null;
    if (!forcar && c && c.api === api && Date.now() - c.em < VALIDADE_MS && c.r.situacao !== 'sem-resposta') return c.r;
  } catch {
    /* sem cache */
  }
  try {
    const r = (await fetch(`${api}?action=versao`).then((x) => x.json())) as { versao?: number; revisao?: string };
    const info: InfoServidor = { situacao: situacao(r), versao: r.versao, revisao: r.revisao };
    try {
      sessionStorage.setItem(K, JSON.stringify({ api, em: Date.now(), r: info }));
    } catch {
      /* modo privado */
    }
    return info;
  } catch {
    return { situacao: 'sem-resposta' };
  }
}
