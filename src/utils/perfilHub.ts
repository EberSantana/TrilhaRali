/**
 * Perfil do aluno do Trilha Rali HUB (portal de estudos).
 * O HUB e os jogos ficam no mesmo endereço (ebersantana.github.io), então os jogos leem
 * o perfil que o HUB guarda no aparelho e o aluno não precisa digitar o nome de novo.
 */
export const URL_HUB = 'https://ebersantana.github.io/disciplinas/';
export const CHAVE_PERFIL_HUB = 'perfil:aluno';

export interface PerfilHub {
  nome: string;
  apelido: string;
  turma: string;
  curso: string;
}

/** Converte o JSON guardado pelo HUB em perfil; devolve null se faltar o essencial. */
export function interpretarPerfilHub(bruto: string | null): PerfilHub | null {
  if (!bruto) return null;
  try {
    const p = JSON.parse(bruto);
    if (!p || typeof p !== 'object' || !p.id || typeof p.nome !== 'string' || p.nome.trim().length < 2) return null;
    const nome = p.nome.trim().replace(/\s+/g, ' ');
    return {
      nome,
      apelido: String(p.apelido || nome.split(' ')[0] || '').trim(),
      turma: String(p.turma || '').trim(),
      curso: String(p.curso || '').trim(),
    };
  } catch {
    return null;
  }
}

export function lerPerfilHub(): PerfilHub | null {
  try {
    return interpretarPerfilHub(typeof localStorage === 'undefined' ? null : localStorage.getItem(CHAVE_PERFIL_HUB));
  } catch {
    return null;
  }
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** Nome do perfil como aparece na lista da turma da sala (ignora acentos e maiúsculas); '' se não estiver. */
export function nomeNaLista(perfil: PerfilHub | null, alunos: string[] | null | undefined): string {
  if (!perfil || !alunos?.length) return '';
  const alvo = norm(perfil.nome);
  return alunos.find((a) => norm(a) === alvo) ?? '';
}
