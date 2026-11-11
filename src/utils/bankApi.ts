import { BankQuestion, BankQuestionDraft, PublishedMission, PublishedSet } from '../types/bank';
import { ctfCall } from './ctfApi';

const KEY = 'rali_banco_chave_v1';

export function getBancoKey(): string {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
}

export function saveBancoKey(key: string) {
  try {
    localStorage.setItem(KEY, key.trim());
  } catch {
    // ignore
  }
}

export function clearBancoKey() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

const withKey = (extra: Record<string, unknown> = {}, chave = getBancoKey()) => ({ chave, ...extra });

export const pingBanco = (chave: string) => ctfCall<{ ok: true }>('bancoPing', withKey({}, chave));

export const listBanco = () => ctfCall<{ perguntas: BankQuestion[] }>('bancoList', withKey()).then((r) => r.perguntas);

export const saveQuestion = (pergunta: BankQuestionDraft) =>
  ctfCall<{ pergunta: BankQuestion }>('bancoSave', withKey({ pergunta })).then((r) => r.pergunta);

export const deleteQuestion = (id: string) => ctfCall<{ ok: true }>('bancoDelete', withKey({ id }));

export const importQuestions = (perguntas: BankQuestionDraft[]) =>
  ctfCall<{ importadas: number; erros: Array<{ linha: number; erro?: string; motivo: string }> }>('bancoImport', withKey({ perguntas }));

export const publishNfc = (missoes: PublishedMission[], somenteBanco: boolean) =>
  ctfCall<{ total: number }>('nfcPublish', withKey({ missoes, somenteBanco }));

/** Público: o celular do aluno lê o conjunto publicado pelo professor. */
export const fetchNfcSet = () => ctfCall<PublishedSet>('nfcSet');
