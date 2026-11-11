export type BankQuestionType = 'exata' | 'multipla';

export interface BankQuestionDraft {
  id?: string;
  disciplina: string;
  assunto: string;
  tipo: BankQuestionType;
  pergunta: string;
  /** Exata: o gabarito. Múltipla escolha: o texto da alternativa correta. */
  resposta: string;
  /** Exata: variações que também valem (ex.: sinônimos). */
  aceitas: string[];
  /** Múltipla escolha: todas as alternativas (inclui a correta). */
  opcoes: string[];
  xp: number;
  explicacao: string;
  ativo: boolean;
}

export interface BankQuestion extends BankQuestionDraft {
  id: string;
  atualizado_em?: string;
}

/** Missão publicada para o Rali NFC (vai para o celular dos alunos). */
export interface PublishedMission extends BankQuestionDraft {
  tag_id: string;
}

export interface PublishedSet {
  somenteBanco: boolean;
  missoes: PublishedMission[];
}
