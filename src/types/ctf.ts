import { ScoringMode } from './index';
import type { TimerInfo } from '../utils/timer';
import type { Theme } from '../utils/theme';

/** ctf = CTF Online (individual, fase a fase) · rali = Rali NFC (equipes, missões por etiqueta) */
export type RoomTipo = 'ctf' | 'rali';

/** livre = painel de desafios · sequencial = fase a fase */
export type CtfOrdem = 'livre' | 'sequencial';

export interface CtfRoomInfo {
  token: string;
  /** ausente em backends anteriores à versão 6 (sempre CTF) */
  tipo?: RoomTipo;
  /** CTF: 'livre' = painel de desafios (o aluno escolhe a ordem); 'sequencial' = fase a fase. Ausente em salas antigas (sequencial). */
  ordem?: CtfOrdem;
  nome: string;
  status: 'aberta' | 'encerrada';
  modo: ScoringMode;
  total: number;
  terminal?: boolean; // professor liberou o terminal Linux simulado
  debriefing?: boolean; // professor liberou o gabarito (debriefing) para os alunos
  banco: boolean; // professor liberou o download do banco de dados para os alunos
  /** cronômetro da sala (null = sala sem tempo); ausente em backends antigos */
  timer?: TimerInfo | null;
  /** tema escolhido pelo professor ('' = não definido) */
  tema?: Theme | '';
  /** relógio do servidor no momento da resposta (ms) */
  agora?: number;
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
  opcoes?: string[]; // Múltipla escolha: alternativas (o gabarito nunca vem junto)
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
  /** CTF livre: todos os desafios da sala (sem pergunta nem gabarito) */
  missoes?: RaliMissionRef[];
  correto?: boolean;
  premio?: CtfAward & { tag_id?: string };
}

export interface CtfTeacherStudent {
  nome: string;
  fase_atual: number;
  xp: number;
  acertos: number;
  erros: number;
  fogos: number;
  ultimo_acerto: number | '';
  /** Rali NFC: nomes dos integrantes da equipe (opcional) */
  integrantes?: string[];
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
  opcoes?: string[];
  explicacao?: string;
}

export interface CtfStoredRoom {
  /** salas antigas não têm este campo: são do CTF */
  tipo?: RoomTipo;
  token: string;
  nome: string;
  adminKey: string;
  api: string;
  criada: number;
  /** guardado neste navegador para montar o histórico; a fonte da verdade é a planilha */
  status?: 'aberta' | 'encerrada';
  encerradaEm?: number;
}

// ---------- Rali NFC online (salas com equipes) ----------

export interface RaliTeam {
  nome: string;
  integrantes: string[];
  xp: number;
  acertos: number;
  erros: number;
  fogos: number;
  posicao: number;
}

/** Missão da sala vista pela equipe: sem pergunta nem gabarito (a pergunta só vem ao ler a etiqueta). */
export interface RaliMissionRef {
  tag_id: string;
  categoria: string;
  pacote: string;
  xp_base: number;
  /** quanto vale agora (cai conforme mais gente resolve) */
  xp_atual?: number;
  capturas: number;
  concluida: boolean;
}

export interface RaliMission {
  tag_id: string;
  categoria: string;
  pacote: string;
  pergunta: string;
  opcoes: string[];
  xp_base: number;
  xp_atual: number;
  capturas_anteriores: number;
}

export interface RaliState {
  sala: CtfRoomInfo;
  equipe: RaliTeam;
  missoes: RaliMissionRef[];
  ranking: CtfRankingRow[];
  total_equipes: number;
  correto?: boolean;
  premio?: CtfAward & { tag_id?: string };
}

export interface RaliTagInfo {
  sala: CtfRoomInfo;
  ja_resolvida: boolean;
  missao: RaliMission;
}

/** Item do debriefing da sala: pergunta, gabarito, explicação e quantos acertaram */
export interface CtfDebriefItem {
  fase: number;
  tag_id: string;
  categoria: string;
  pacote: string;
  pergunta: string;
  resposta: string;
  alternativas: string[];
  opcoes: string[];
  xp: number;
  explicacao: string;
  acertos: number;
}

export interface CtfDebrief {
  sala: CtfRoomInfo;
  itens: CtfDebriefItem[];
  total_alunos: number;
}
