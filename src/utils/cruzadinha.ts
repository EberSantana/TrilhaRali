/** Cruzadinha: gerador de grade, normalização de letras e pontuação. Tudo roda no navegador. */
import { bancoDas, type DisciplinaCruz, type PalavraCruz } from '../data/cruzadinhaBanco';

export type Dir = 'A' | 'D';
export interface PalavraGrade {
  id: number;
  palavra: string;
  dica: string;
  r: number;
  c: number;
  dir: Dir;
  n: number;
  celulas: [number, number][];
}
export interface Grade {
  h: number;
  w: number;
  palavras: PalavraGrade[];
}

/** Gerador pseudoaleatório com semente: a mesma sala monta a mesma cruzadinha para todos os alunos. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashTexto(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Letra digitada -> A-Z sem acento (ou '' se não for letra). */
export function letraNormalizada(ch: string): string {
  const l = ch.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  return /^[A-Z]$/.test(l) ? l : '';
}

function embaralhar<T>(arr: T[], rnd: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Colocada { palavra: string; dica: string; r: number; c: number; dir: Dir }

function tentar(lista: PalavraCruz[], rnd: () => number, porTamanho: boolean): Colocada[] {
  const ws = embaralhar(lista, rnd);
  if (porTamanho) ws.sort((a, b) => b[0].length - a[0].length);
  const g = new Map<string, string>();
  const k = (r: number, c: number) => `${r},${c}`;
  const colocadas: Colocada[] = [];
  const cabe = (w: string, r: number, c: number, d: Dir): number => {
    const dr = d === 'D' ? 1 : 0;
    const dc = d === 'A' ? 1 : 0;
    if (g.has(k(r - dr, c - dc)) || g.has(k(r + dr * w.length, c + dc * w.length))) return -1;
    let cruz = 0;
    for (let i = 0; i < w.length; i++) {
      const rr = r + dr * i;
      const cc = c + dc * i;
      const e = g.get(k(rr, cc));
      if (e !== undefined) {
        if (e !== w[i]) return -1;
        cruz++;
      } else if (g.has(k(rr + dc, cc + dr)) || g.has(k(rr - dc, cc - dr))) return -1;
    }
    return cruz;
  };
  const por = (p: PalavraCruz, r: number, c: number, d: Dir) => {
    const dr = d === 'D' ? 1 : 0;
    const dc = d === 'A' ? 1 : 0;
    for (let i = 0; i < p[0].length; i++) g.set(k(r + dr * i, c + dc * i), p[0][i]);
    colocadas.push({ palavra: p[0], dica: p[1], r, c, dir: d });
  };
  por(ws[0], 0, 0, 'A');
  for (const p of ws.slice(1)) {
    let melhor: [number, number, number, Dir] | null = null;
    for (const d of ['A', 'D'] as Dir[]) {
      for (const [key, ch] of g) {
        const [r, c] = key.split(',').map(Number);
        for (let i = 0; i < p[0].length; i++) {
          if (p[0][i] !== ch) continue;
          const rr = d === 'A' ? r : r - i;
          const cc = d === 'A' ? c - i : c;
          const s = cabe(p[0], rr, cc, d);
          if (s >= 1 && (!melhor || s > melhor[0] || (s === melhor[0] && rnd() < 0.5))) melhor = [s, rr, cc, d];
        }
      }
    }
    if (melhor) por(p, melhor[1], melhor[2], melhor[3]);
  }
  return colocadas;
}

function medir(cs: Colocada[]) {
  const rs = cs.flatMap((x) => [x.r, x.r + (x.dir === 'D' ? x.palavra.length - 1 : 0)]);
  const cols = cs.flatMap((x) => [x.c, x.c + (x.dir === 'A' ? x.palavra.length - 1 : 0)]);
  const r0 = Math.min(...rs);
  const c0 = Math.min(...cols);
  return { r0, c0, h: Math.max(...rs) - r0 + 1, w: Math.max(...cols) - c0 + 1 };
}

/** Monta a grade com até `max` palavras do banco: tenta várias disposições e fica com a que cabe mais palavras e é mais compacta. */
export function montarGrade(banco: PalavraCruz[], semente: number, max = 12): Grade {
  const rnd = mulberry32(semente);
  const unicas = [...new Map(banco.map((p) => [p[0], p])).values()];
  const base = embaralhar(unicas, rnd).slice(0, max);
  let melhor: { cs: Colocada[]; sc: number } | null = null;
  for (let it = 0; it < 300; it++) {
    const cs = tentar(base, rnd, it % 2 === 1);
    const m = medir(cs);
    const sc = cs.length * 1000 - Math.max(m.h, m.w) * 10 - m.h * m.w;
    if (!melhor || sc > melhor.sc) melhor = { cs, sc };
  }
  const cs = melhor!.cs;
  const { r0, c0, h, w } = medir(cs);
  const norm = cs.map((x) => ({ ...x, r: x.r - r0, c: x.c - c0 }));
  const inicios = [...new Set(norm.map((x) => x.r * 1000 + x.c))].sort((a, b) => a - b);
  const palavras: PalavraGrade[] = norm.map((x, id) => ({
    id,
    palavra: x.palavra,
    dica: x.dica,
    r: x.r,
    c: x.c,
    dir: x.dir,
    n: inicios.indexOf(x.r * 1000 + x.c) + 1,
    celulas: [...x.palavra].map((_, j) => (x.dir === 'A' ? [x.r, x.c + j] : [x.r + j, x.c]) as [number, number]),
  }));
  return { h, w, palavras };
}

/** Palavras da grade de uma sala (o professor grava esta lista no servidor, que confere o que o aluno envia). */
export function gabaritoDaSala(token: string, disciplinas: DisciplinaCruz[], palavras: number): string[] {
  return montarGrade(bancoDas(disciplinas), hashTexto(token), palavras).palavras.map((p) => p.palavra);
}

/** XP de uma palavra resolvida: 10 por letra; dica de letra corta pela metade; revelar a palavra zera. */
export function xpPalavra(tamanho: number, ajuda: 0 | 1 | 2): number {
  if (ajuda === 2) return 0;
  return Math.round(tamanho * 10 * (ajuda === 1 ? 0.5 : 1));
}
