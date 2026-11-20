/**
 * Computador do laboratório: a sessão do aluno fica salva no navegador. Se ela ficou parada por mais de
 * HORAS_PARADA (outra aula, outra turma), a tela pergunta "Vocês são ...?" antes de continuar.
 * Na mesma aula o uso é marcado a cada atualização, então a mesma dupla não vê a pergunta.
 */
export const HORAS_PARADA = 2;

const k = (modulo: string) => `rali_uso_${modulo}`;

export function marcarUso(modulo: string, agora = Date.now()) {
  try {
    localStorage.setItem(k(modulo), String(agora));
  } catch {
    /* modo privado */
  }
}

export function sessaoParada(modulo: string, agora = Date.now(), horas = HORAS_PARADA): boolean {
  try {
    const t = Number(localStorage.getItem(k(modulo)));
    return !t || agora - t > horas * 3600_000;
  } catch {
    return false;
  }
}
