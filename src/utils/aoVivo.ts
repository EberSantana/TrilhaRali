import type { CtfTeacherStudent } from '../types/ctf';

export type MotivoAjuda = 'sem_acerto' | 'muitos_erros' | 'parado';
export const MOTIVO_AJUDA: Record<MotivoAjuda, string> = {
  sem_acerto: 'Ainda não acertou nenhuma',
  muitos_erros: 'Muitas tentativas erradas',
  parado: 'Sem acertar há um tempo',
};

/**
 * Quem precisa do professor agora, durante a aula (regras simples e explicáveis):
 * - nenhum acerto e 2 ou mais erros;
 * - 3 ou mais erros e mais que o dobro dos acertos;
 * - já acertou antes, mas está há mais de `minParado` minutos sem acertar e ainda não terminou.
 */
export function precisamAjuda(alunos: CtfTeacherStudent[], total: number, agora = Date.now(), minParado = 8) {
  return alunos
    .map((a) => {
      const motivos: MotivoAjuda[] = [];
      if (a.acertos === 0 && a.erros >= 2) motivos.push('sem_acerto');
      else if (a.erros >= 3 && a.erros > a.acertos * 2) motivos.push('muitos_erros');
      const terminou = total > 0 && a.acertos >= total;
      if (!terminou && a.ultimo_acerto !== '' && a.acertos > 0 && agora - Number(a.ultimo_acerto) > minParado * 60_000) motivos.push('parado');
      const minutos = a.ultimo_acerto === '' ? null : Math.floor((agora - Number(a.ultimo_acerto)) / 60_000);
      return { aluno: a, motivos, minutos };
    })
    .filter((x) => x.motivos.length)
    .sort((x, y) => y.aluno.erros - x.aluno.erros);
}

/** Indicadores da sala ao vivo. */
export function placar(alunos: CtfTeacherStudent[], total: number) {
  const acertos = alunos.reduce((s, a) => s + a.acertos, 0);
  const erros = alunos.reduce((s, a) => s + a.erros, 0);
  return {
    jogando: alunos.length,
    acertos,
    taxa: acertos + erros > 0 ? Math.round((acertos / (acertos + erros)) * 100) : null,
    terminaram: total > 0 ? alunos.filter((a) => a.acertos >= total).length : 0,
  };
}
