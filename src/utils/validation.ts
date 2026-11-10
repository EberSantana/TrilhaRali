import { Mission } from '../types';

/**
 * Normaliza a resposta do aluno para comparação resiliente:
 * - Converte para minúsculas
 * - Remove espaços sobressalentes
 * - Remove aspas simples/duplas e ponto e vírgula final
 * - Remove acentos comuns para não penalizar digitação rápida
 */
export function normalizeAnswer(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/;+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface ValidationResult {
  correto: boolean;
  xpGanho: number;
  mensagem: string;
  mission?: Mission;
}

export function validateAnswer(
  mission: Mission | undefined,
  rawStudentAnswer: string,
  alreadyCompleted: boolean = false
): ValidationResult {
  if (!mission) {
    return {
      correto: false,
      xpGanho: 0,
      mensagem: 'Etiqueta NFC não cadastrada no banco de missões.',
    };
  }

  if (alreadyCompleted) {
    return {
      correto: false,
      xpGanho: 0,
      mensagem: `Atenção: Sua equipe já concluiu a missão ${mission.tag_id} anteriormente!`,
      mission,
    };
  }

  const cleanStudent = normalizeAnswer(rawStudentAnswer);
  const cleanOfficial = normalizeAnswer(mission.resposta_curta);

  if (!cleanStudent) {
    return {
      correto: false,
      xpGanho: 0,
      mensagem: 'Por favor, digite a resposta curta antes de enviar.',
      mission,
    };
  }

  // Compara com a resposta oficial
  let matched = cleanStudent === cleanOfficial;

  // Compara com sinônimos / formatos aceitáveis adicionais
  if (!matched && mission.alternatives && mission.alternatives.length > 0) {
    matched = mission.alternatives.some(alt => normalizeAnswer(alt) === cleanStudent);
  }

  if (matched) {
    return {
      correto: true,
      xpGanho: mission.xp_valor,
      mensagem: `🎉 Resposta Correta! +${mission.xp_valor} XP adicionados à sua equipe!`,
      mission,
    };
  }

  return {
    correto: false,
    xpGanho: 0,
    mensagem: '❌ Resposta incorreta. Revise a query no computador e tente novamente!',
    mission,
  };
}
