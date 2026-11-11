import { useSyncExternalStore } from 'react';
import { ctfCall, getCtfApiUrl } from './ctfApi';
import { getBancoKey } from './bankApi';
import { applyServerTheme, Theme } from './theme';
import { TimerInfo } from './timer';

/** Estado do Rali NFC compartilhado pelo servidor: cronômetro do professor e tema. */
export interface RaliEstado {
  timer: TimerInfo | null;
  tema: Theme | '';
  agora: number;
}

export interface RaliSnapshot {
  timer: TimerInfo | null;
  /** relógio local − relógio do servidor, medido na última leitura */
  skewMs: number;
}

const POLL_MS = 30_000;
const EMPTY: RaliSnapshot = { timer: null, skewMs: 0 };

let snap: RaliSnapshot = EMPTY;
let users = 0;
let pollId: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function accept(e: RaliEstado) {
  snap = { timer: e.timer ?? null, skewMs: Date.now() - (Number(e.agora) || Date.now()) };
  applyServerTheme(e.tema);
  listeners.forEach((l) => l());
}

export async function refreshRali(): Promise<void> {
  if (!getCtfApiUrl()) return;
  try {
    accept(await ctfCall<RaliEstado>('raliEstado'));
  } catch {
    // sem internet ou backend antigo: segue sem cronômetro remoto
  }
}

/** O professor pode espelhar o relógio para os celulares quando o banco (chave) está configurado. */
export const canSyncRali = () => Boolean(getCtfApiUrl() && getBancoKey());

/** Envia o relógio do telão do professor para o servidor. Falha em silêncio: o telão continua local. */
export async function pushRaliTimer(segundos: number, rodando: boolean, duracaoMin: number): Promise<void> {
  if (!canSyncRali()) return;
  try {
    accept(await ctfCall<RaliEstado>('raliTimer', { chave: getBancoKey(), op: 'sync', segundos, rodando, minutos: duracaoMin }));
  } catch {
    // ignore
  }
}

export async function saveServerTheme(tema: Theme): Promise<boolean> {
  if (!canSyncRali()) return false;
  try {
    await ctfCall<{ tema: Theme }>('setTema', { chave: getBancoKey(), tema });
    return true;
  } catch {
    return false;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  users += 1;
  if (users === 1) {
    refreshRali();
    pollId = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') refreshRali();
    }, POLL_MS);
  }
  return () => {
    listeners.delete(cb);
    users -= 1;
    if (users === 0 && pollId) {
      clearInterval(pollId);
      pollId = null;
    }
  };
}

const get = () => snap;

/** Lê o cronômetro do Rali NFC; consulta o servidor a cada 30 s enquanto algum componente estiver usando. */
export const useRaliSession = (): RaliSnapshot => useSyncExternalStore(subscribe, get, get);
