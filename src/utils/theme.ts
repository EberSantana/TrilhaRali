import { useSyncExternalStore } from 'react';

/** 'claro' = Quadro claro (padrão) · 'escuro' = Arena escura (alternativa para sala escura) */
export type Theme = 'escuro' | 'claro';

// v2: o padrão passou a ser o Quadro claro; quem tinha escolhido o escuro antes volta ao padrão
const KEY = 'trilha_tema_v2';
const listeners = new Set<() => void>();

export const THEMES: { id: Theme; nome: string; descricao: string }[] = [
  { id: 'claro', nome: 'Quadro claro', descricao: 'Padrão. Fundo claro e alto contraste, ótimo para sala iluminada, projetor e impressão.' },
  { id: 'escuro', nome: 'Arena escura', descricao: 'Fundo escuro com verde e laranja, para sala com pouca luz.' },
];

export const isTheme = (v: unknown): v is Theme => v === 'escuro' || v === 'claro';

function load(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return isTheme(v) ? v : 'claro';
  } catch {
    return 'claro';
  }
}

let current: Theme = typeof window === 'undefined' ? 'claro' : load();

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
