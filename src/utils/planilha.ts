/**
 * Mini planilha do Laboratório de Informática: avalia fórmulas no estilo Excel em português
 * (separador ";" e vírgula decimal): =SOMA(B2:B9), =MEDIA(D2:D9), =SE(D2>=6;"Aprovado";"Reprovado"),
 * =CONT.SE(E2:E9;"Aprovado"), =MAIOR(B2:B9;1), =SOMASE(...), operadores + - * / e comparações.
 * Sem eval: um analisador recursivo próprio, seguro para texto digitado pelo aluno.
 */
export type Grade = string[][];
export type Valor = number | string | boolean;

export const colName = (i: number): string => {
  let n = i + 1;
  let s = '';
  while (n > 0) {
    s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

const colIndex = (s: string): number => [...s].reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0) - 1;

export const ERRO = '#ERRO!';

export function formatar(v: Valor): string {
  if (typeof v === 'boolean') return v ? 'VERDADEIRO' : 'FALSO';
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return '#DIV/0!';
    return String(Math.round(v * 1e6) / 1e6).replace('.', ',');
  }
  return v;
}

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

function paraNumero(s: string): number | null {
  const t = s.trim().replace(',', '.');
  return t !== '' && /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null;
}

class Fim extends Error {}

export function avaliarCelula(grade: Grade, r: number, c: number, prof = 0): Valor {
  if (prof > 20) throw new Fim('ciclo');
  const bruto = (grade[r]?.[c] ?? '').trim();
  if (bruto === '') return '';
  if (bruto.startsWith('=')) return avaliarFormula(grade, bruto, prof + 1);
  const n = paraNumero(bruto);
  return n !== null ? n : bruto;
}

export function avaliarFormula(grade: Grade, formula: string, prof = 0): Valor {
  try {
    return new Analisador(grade, formula.replace(/^=/, ''), prof).raiz();
  } catch {
    return ERRO;
  }
}

type Lista = Valor[];

class Analisador {
  private i = 0;
  constructor(private g: Grade, private t: string, private prof: number) {}

  raiz(): Valor {
    const v = this.comparacao();
    this.esp();
    if (this.i < this.t.length) throw new Fim('sobra');
    return this.escalar(v);
  }

  private esp() {
    while (this.t[this.i] === ' ') this.i++;
  }
  private escalar(v: Valor | Lista): Valor {
    if (Array.isArray(v)) throw new Fim('intervalo solto');
    return v;
  }
  private num(v: Valor | Lista): number {
    const e = this.escalar(v);
    if (typeof e === 'number') return e;
    if (e === '') return 0;
    if (typeof e === 'boolean') return e ? 1 : 0;
    const n = paraNumero(e);
    if (n === null) throw new Fim('texto');
    return n;
  }

  private comparacao(): Valor | Lista {
    let a = this.soma();
    for (;;) {
      this.esp();
      const m = /^(>=|<=|<>|=|>|<)/.exec(this.t.slice(this.i));
      if (!m) return a;
      this.i += m[1].length;
      const b = this.soma();
      a = comparar(this.escalar(a), m[1], this.escalar(b));
    }
  }
  private soma(): Valor | Lista {
    let a = this.produto();
    for (;;) {
      this.esp();
      const op = this.t[this.i];
      if (op !== '+' && op !== '-') return a;
      this.i++;
      const b = this.produto();
      a = op === '+' ? this.num(a) + this.num(b) : this.num(a) - this.num(b);
    }
  }
  private produto(): Valor | Lista {
    let a = this.unario();
    for (;;) {
      this.esp();
      const op = this.t[this.i];
      if (op !== '*' && op !== '/') return a;
      this.i++;
      const b = this.unario();
      if (op === '*') a = this.num(a) * this.num(b);
      else {
        const d = this.num(b);
        if (d === 0) throw new Fim('div0');
        a = this.num(a) / d;
      }
    }
  }
  private unario(): Valor | Lista {
    this.esp();
    if (this.t[this.i] === '-') {
      this.i++;
      return -this.num(this.unario());
    }
    return this.atomo();
  }

  private atomo(): Valor | Lista {
    this.esp();
    const resto = this.t.slice(this.i);
    if (resto[0] === '(') {
      this.i++;
      const v = this.comparacao();
      this.esp();
      if (this.t[this.i++] !== ')') throw new Fim('paren');
      return v;
    }
    if (resto[0] === '"') {
      const fim = resto.indexOf('"', 1);
      if (fim < 0) throw new Fim('aspas');
      this.i += fim + 1;
      return resto.slice(1, fim);
    }
    let m = /^\d+(?:[.,]\d+)?/.exec(resto);
    if (m) {
      this.i += m[0].length;
      return Number(m[0].replace(',', '.'));
    }
    m = /^([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ.]*)\(/.exec(resto);
    if (m) {
      this.i += m[0].length;
      const args: (Valor | Lista)[] = [];
      this.esp();
      if (this.t[this.i] === ')') this.i++;
      else {
        for (;;) {
          args.push(this.comparacao());
          this.esp();
          const ch = this.t[this.i++];
          if (ch === ')') break;
          if (ch !== ';') throw new Fim('sep');
        }
      }
      return this.funcao(semAcento(m[1]), args);
    }
    m = /^\$?([A-Za-z]{1,2})\$?(\d+)(?::\$?([A-Za-z]{1,2})\$?(\d+))?/.exec(resto);
    if (m) {
      this.i += m[0].length;
      const c1 = colIndex(m[1].toUpperCase());
      const r1 = Number(m[2]) - 1;
      if (m[3]) {
        const c2 = colIndex(m[3].toUpperCase());
        const r2 = Number(m[4]) - 1;
        const out: Lista = [];
        for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++)
          for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) out.push(avaliarCelula(this.g, r, c, this.prof));
        return out;
      }
      return avaliarCelula(this.g, r1, c1, this.prof);
    }
    throw new Fim('símbolo');
  }

  private numeros(args: (Valor | Lista)[]): number[] {
    const out: number[] = [];
    for (const a of args) {
      if (Array.isArray(a)) for (const x of a) typeof x === 'number' && out.push(x);
      else out.push(this.num(a));
    }
    return out;
  }

  private funcao(nome: string, args: (Valor | Lista)[]): Valor {
    const lista = (a: Valor | Lista | undefined): Lista => (Array.isArray(a) ? a : a === undefined ? [] : [a]);
    switch (nome) {
      case 'SOMA':
        return this.numeros(args).reduce((a, b) => a + b, 0);
      case 'MEDIA': {
        const n = this.numeros(args);
        if (!n.length) throw new Fim('div0');
        return n.reduce((a, b) => a + b, 0) / n.length;
      }
      case 'MAX':
      case 'MAXIMO': {
        const n = this.numeros(args);
        return n.length ? Math.max(...n) : 0;
      }
      case 'MIN':
      case 'MINIMO': {
        const n = this.numeros(args);
        return n.length ? Math.min(...n) : 0;
      }
      case 'MAIOR':
      case 'MENOR': {
        const n = this.numeros([args[0]]).sort((a, b) => (nome === 'MAIOR' ? b - a : a - b));
        const k = this.num(args[1]);
        if (k < 1 || k > n.length) throw new Fim('k');
        return n[k - 1];
      }
      case 'CONT.NUM':
        return lista(args[0]).filter((x) => typeof x === 'number').length;
      case 'CONT.VALORES':
        return lista(args[0]).filter((x) => x !== '').length;
      case 'CONT.SE': {
        const crit = criterio(this.escalar(args[1]));
        return lista(args[0]).filter(crit).length;
      }
      case 'SOMASE': {
        const crit = criterio(this.escalar(args[1]));
        const alvo = lista(args[2] ?? args[0]);
        return lista(args[0]).reduce<number>((s, x, k) => (crit(x) && typeof alvo[k] === 'number' ? s + (alvo[k] as number) : s), 0);
      }
      case 'SE': {
        const cond = this.escalar(args[0]);
        const ok = typeof cond === 'boolean' ? cond : this.num(cond) !== 0;
        return this.escalar((ok ? args[1] : args[2]) ?? false);
      }
      case 'ARRED': {
        const f = 10 ** this.num(args[1] ?? 0);
        return Math.round(this.num(args[0]) * f) / f;
      }
      default:
        throw new Fim('função');
    }
  }
}

function comparar(a: Valor, op: string, b: Valor): boolean {
  const x = typeof a === 'string' && paraNumero(a) !== null ? Number(paraNumero(a)) : a;
  const y = typeof b === 'string' && paraNumero(b) !== null ? Number(paraNumero(b)) : b;
  const tx = typeof x === 'number', ty = typeof y === 'number';
  const l = tx && ty ? (x as number) : String(x).toLowerCase();
  const r = tx && ty ? (y as number) : String(y).toLowerCase();
  switch (op) {
    case '=': return l === r;
    case '<>': return l !== r;
    case '>': return l > r;
    case '<': return l < r;
    case '>=': return l >= r;
    default: return l <= r;
  }
}

function criterio(c: Valor): (x: Valor) => boolean {
  const s = String(c);
  const m = /^(>=|<=|<>|=|>|<)?(.*)$/.exec(s)!;
  const op = m[1] || '=';
  const alvo: Valor = paraNumero(m[2]) !== null ? Number(paraNumero(m[2])) : m[2];
  return (x) => x !== '' && comparar(x, op, alvo);
}
