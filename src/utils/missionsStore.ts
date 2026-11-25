import { useSyncExternalStore } from 'react';
import { Mission } from '../types';
import { PublishedSet } from '../types/bank';
import { ALL_MISSIONS } from '../data/missions';
import { LINUX_MISSIONS } from '../data/linuxMissions';
import { INFO_MISSIONS } from '../data/infoMissions';
import { WEB_MISSIONS } from '../data/webMissions';
import { BD_MISSIONS } from '../data/bdMissions';
import { RPG_MISSIONS } from '../data/rpgMissions';
import { RPG_CONSOLE_MISSIONS } from '../data/rpgConsoleMissions';

/** Catálogo padrão: as 50 missões NTAG213 + Linux + as 60 missões de Banco de Dados (console SQLite). */
const BASE: Mission[] = [...ALL_MISSIONS, ...LINUX_MISSIONS, ...BD_MISSIONS, ...RPG_MISSIONS, ...RPG_CONSOLE_MISSIONS, ...INFO_MISSIONS, ...WEB_MISSIONS];
const EXTRAS: Mission[] = [...LINUX_MISSIONS, ...BD_MISSIONS, ...RPG_MISSIONS, ...RPG_CONSOLE_MISSIONS, ...INFO_MISSIONS, ...WEB_MISSIONS];
import { publishedToMission } from './bank';
import { fetchNfcSet, getBancoKey } from './bankApi';
import { abrirGabarito, aplicarGabarito, Gabarito, GabaritoCifrado } from './gabarito';
import GABARITO_CIFRADO from '../data/gabarito.enc.json';
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
let gabarito: Gabarito | null = null;
let merged: Mission[] = mergeMissions(published);
const listeners = new Set<() => void>();

function recalcula() {
  merged = aplicarGabarito(mergeMissions(published), gabarito);
  listeners.forEach((l) => l());
}

/** Gabarito do Desvendando (só com o gabarito aberto pela chave do banco). */
export const gabaritoDesv = () => gabarito?.desv ?? null;

/** O gabarito das missões prontas está aberto neste aparelho (professor com a chave do banco)? */
export const gabaritoAberto = () => gabarito !== null;

/** Abre o gabarito com a chave do banco; chave errada ou ausente deixa fechado. */
export async function abrirGabaritoCom(chave: string): Promise<boolean> {
  if (!chave) {
    gabarito = null;
    recalcula();
    return false;
  }
  try {
    gabarito = await abrirGabarito(GABARITO_CIFRADO as GabaritoCifrado, chave);
  } catch {
    gabarito = null;
  }
  recalcula();
  return gabarito !== null;
}

if (typeof window !== 'undefined') {
  void abrirGabaritoCom(getBancoKey());
  window.addEventListener('rali-banco-chave', () => void abrirGabaritoCom(getBancoKey()));
}

function set(next: PublishedSet | null) {
  published = next;
  merged = aplicarGabarito(mergeMissions(next), gabarito);
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
