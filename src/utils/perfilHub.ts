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

const CHAVE_BANCO = 'rali_banco_chave_v1';
const CHAVE_IGNORADO = 'rali_perfil_hub_ignorado';
export const EVENTO_PERFIL_HUB = 'rali-perfil-hub';

/** Aparelho do professor: quem tem a chave do banco conectada não herda o login de estudante do HUB. */
function aparelhoDoProfessor(): boolean {
  try {
    return !!localStorage.getItem(CHAVE_BANCO);
  } catch {
    return false;
  }
}

function idDoPerfilHub(): string {
  try {
    return String(JSON.parse(localStorage.getItem(CHAVE_PERFIL_HUB) || 'null')?.id || '');
  } catch {
    return '';
  }
}

/** "Não sou eu": este perfil do HUB deixa de valer nos jogos até que outra pessoa entre no HUB. */
export function ignorarPerfilHub(): void {
  try {
    localStorage.setItem(CHAVE_IGNORADO, idDoPerfilHub());
    window.dispatchEvent(new Event(EVENTO_PERFIL_HUB));
  } catch {
    /* sem armazenamento */
  }
}

export function lerPerfilHub(): PerfilHub | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    if (aparelhoDoProfessor()) return null;
    const id = idDoPerfilHub();
    if (id && localStorage.getItem(CHAVE_IGNORADO) === id) return null;
    return interpretarPerfilHub(localStorage.getItem(CHAVE_PERFIL_HUB));
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
