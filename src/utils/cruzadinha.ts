/** Letra digitada na Cruzadinha -> A-Z sem acento (ou '' se não for letra). */
export function letraNormalizada(ch: string): string {
  const l = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  return /^[A-Z]$/.test(l) ? l : '';
}
