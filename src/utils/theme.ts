import { useSyncExternalStore } from 'react';

/** 'escuro' = Arena escura (proposta A) · 'claro' = Quadro claro (proposta B) */
export type Theme = 'escuro' | 'claro';

const KEY = 'trilha_tema_v1';
const listeners = new Set<() => void>();

export const THEMES: { id: Theme; nome: string; descricao: string }[] = [
  { id: 'escuro', nome: 'Arena escura', descricao: 'Fundo escuro com verde e laranja. Pódio no telão.' },
  { id: 'claro', nome: 'Quadro claro', descricao: 'Fundo claro e alto contraste, para sala iluminada ou projetor fraco.' },
];

export const isTheme = (v: unknown): v is Theme => v === 'escuro' || v === 'claro';

function load(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return isTheme(v) ? v : 'escuro';
  } catch {
    return 'escuro';
  }
}

let current: Theme = typeof window === 'undefined' ? 'escuro' : load();

function paint() {
  if (typeof document !== 'undefined') document.documentElement.dataset.theme = current;
}

export const getTheme = () => current;

export function setTheme(next: Theme) {
  if (next === current) return;
  current = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // ignore
  }
  paint();
  listeners.forEach((l) => l());
}

/** Tema vindo do servidor (escolha do professor). Vazio = o professor ainda não definiu: mantém o do aparelho. */
export function applyServerTheme(tema: unknown) {
  if (isTheme(tema)) setTheme(tema);
}

export function initTheme() {
  paint();
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const useTheme = (): Theme => useSyncExternalStore(subscribe, getTheme, getTheme);
