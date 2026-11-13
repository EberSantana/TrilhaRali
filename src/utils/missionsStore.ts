import { useSyncExternalStore } from 'react';
import { Mission } from '../types';
import { PublishedSet } from '../types/bank';
import { ALL_MISSIONS } from '../data/missions';
import { LINUX_MISSIONS } from '../data/linuxMissions';
import { INFO_MISSIONS } from '../data/infoMissions';
import { WEB_MISSIONS } from '../data/webMissions';
import { BD_MISSIONS } from '../data/bdMissions';

/** Catálogo padrão: as 50 missões NTAG213 + Linux + as 60 missões de Banco de Dados (console SQLite). */
const BASE: Mission[] = [...ALL_MISSIONS, ...LINUX_MISSIONS, ...BD_MISSIONS, ...INFO_MISSIONS, ...WEB_MISSIONS];
const EXTRAS: Mission[] = [...LINUX_MISSIONS, ...BD_MISSIONS, ...INFO_MISSIONS, ...WEB_MISSIONS];
import { publishedToMission } from './bank';
import { fetchNfcSet } from './bankApi';
import { getCtfApiUrl } from './ctfApi';

const KEY = 'rali_nfc_published_v1';

function load(): PublishedSet | null {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : null;
    return v && Array.isArray(v.missoes) ? v : null;
  } catch {
    return null;
  }
}

/** Junta as 50 missões padrão com o conjunto que o professor publicou (se houver). */
export function mergeMissions(set: PublishedSet | null): Mission[] {
  if (!set || set.missoes.length === 0) return BASE;
  const custom = set.missoes.map(publishedToMission);
  if (set.somenteBanco) {
    // Linux e Banco de Dados (console) são à parte das 50 missões NTAG: continuam no catálogo mesmo no modo "só meu banco"
    const tags = new Set(custom.map((m) => m.tag_id.toLowerCase()));
    return [...custom, ...EXTRAS.filter((m) => !tags.has(m.tag_id.toLowerCase()))];
  }
  const byTag = new Map(custom.map((m) => [m.tag_id.toLowerCase(), m]));
  const replaced = BASE.map((m) => byTag.get(m.tag_id.toLowerCase()) ?? m);
  const known = new Set(BASE.map((m) => m.tag_id.toLowerCase()));
  return [...replaced, ...custom.filter((m) => !known.has(m.tag_id.toLowerCase()))];
}

let published: PublishedSet | null = typeof window === 'undefined' ? null : load();
let merged: Mission[] = mergeMissions(published);
const listeners = new Set<() => void>();

function set(next: PublishedSet | null) {
  published = next;
  merged = mergeMissions(next);
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export const getMissions = () => merged;

export function subscribeMissions(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Atualiza o conjunto publicado; sem internet, continua com a última cópia guardada no aparelho. */
export async function refreshPublished(): Promise<void> {
  if (!getCtfApiUrl()) return;
  try {
    const remote = await fetchNfcSet();
    if (JSON.stringify(remote) !== JSON.stringify(published)) set(remote.missoes.length ? remote : null);
  } catch {
    // mantém o cache local
  }
}

/** Usado logo depois de o professor publicar, para ele ver o resultado no mesmo aparelho. */
export function setPublishedLocal(next: PublishedSet | null) {
  set(next && next.missoes.length ? next : null);
}

export const useMissions = (): Mission[] => useSyncExternalStore(subscribeMissions, getMissions, getMissions);
