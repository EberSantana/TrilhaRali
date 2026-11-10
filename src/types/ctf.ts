import { ScoringMode } from './index';

export interface CtfRoomInfo {
  token: string;
  nome: string;
  status: 'aberta' | 'encerrada';
  modo: ScoringMode;
  total: number;
}

export interface CtfPlayer {
  nome: string;
  fase: number;
  xp: number;
  acertos: number;
  erros: number;
  fogos: number;
  posicao: number;
  concluido: boolean;
}

export interface CtfMission {
  fase: number;
  tag_id: string;
  categoria: string;
  pacote: string;
  pergunta: string;
  xp_base: number;
  xp_atual: number;
  capturas_anteriores: number;
}

export interface CtfRankingRow {
  nome: string;
  fase: number;
  xp: number;
  fogos: number;
}

export interface CtfAward {
  xp: number;
  posicao: number;
  isFogo: boolean;
  modo: ScoringMode;
}

export interface CtfState {
  sala: CtfRoomInfo;
  aluno: CtfPlayer;
  missao: CtfMission | null;
  ranking: CtfRankingRow[];
  total_alunos: number;
  correto?: boolean;
  premio?: CtfAward;
}

export interface CtfTeacherStudent {
  nome: string;
  fase_atual: number;
  xp: number;
  acertos: number;
  erros: number;
  fogos: number;
  ultimo_acerto: number | '';
}

export interface CtfTeacherView {
  sala: CtfRoomInfo;
  alunos: CtfTeacherStudent[];
}

export interface CtfMissionPayload {
  tag_id: string;
  categoria: string;
  pacote: string;
  pergunta: string;
  resposta: string;
  alternativas: string[];
  xp: number;
}

export interface CtfStoredRoom {
  token: string;
  nome: string;
  adminKey: string;
  api: string;
  criada: number;
}
