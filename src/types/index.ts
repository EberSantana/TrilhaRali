export type MissionPackage = 
  | 'mvp' 
  | 'academia' 
  | 'crud16' 
  | 'biblioteca' 
  | 'supermercado' 
  | 'fechamento'
  | 'joins'
  | 'dml'
  | 'diagrama';

export type SqlCategory = 
  | 'DDL' 
  | 'DML' 
  | 'DQL' 
  | 'Modelagem' 
  | 'DTL' 
  | 'DCL' 
  | 'TCL'
  | 'Boss' 
  | 'Sintaxe';

export interface Mission {
  id: number;
  tag_id: string; // Ex: 'tag_01', 'tag_join_01', 'tag_img_01'
  package: MissionPackage;
  packageName: string;
  category: SqlCategory;
  pergunta: string;
  resposta_curta: string; // Gabarito normalizado
  alternatives?: string[]; // Sinônimos aceitáveis
  xp_valor: number;
  location_suggestion: string; // Ex: "Mesa do Professor", "Monitor 03"
  explanation: string; // Explicação para o Debriefing (90-100 min)
  sample_query?: string; // Query SQL correspondente para projetar no telão
}

export interface Team {
  id: string;
  nome: string;
  cor: string;
  xp_total: number;
  missoes_concluidas: string[]; // Lista de tag_id já acertadas
  erros_count: number;
  ultimo_acerto?: number;
  alunos: string[]; // Lista com nomes dos alunos da equipe
  scanner_aluno?: string; // Nome do aluno que está operando o celular
  fogos_count?: number; // 🔥 Quantidade de missões capturadas em 1º lugar (modo CTF Dinâmico)
}

export interface SubmissionLog {
  id: string;
  timestamp: number;
  equipe_id: string;
  equipe_nome: string;
  tag_id: string;
  pergunta_resumo: string;
  resposta_aluno: string;
  correto: boolean;
  xp_ganho: number;
  mensagem: string;
  autor_aluno?: string;
  posicao_captura?: number; // Ordem de chegada da equipe nesta missão (1 = primeira)
  is_fogo?: boolean; // 🔥 true quando a equipe foi a 1ª a capturar a tag (modo CTF Dinâmico)
}

/**
 * Modo de pontuação do Rali:
 * - 'fixed': Rali Tradicional — cada missão sempre vale o XP original.
 * - 'ctf_dynamic': CTF Dinâmico — o valor cai conforme mais equipes capturam a mesma tag.
 */
export type ScoringMode = 'fixed' | 'ctf_dynamic';

export type ClassPhase = 'briefing' | 'sprint' | 'hard_stop' | 'debriefing';

export interface ClassSessionState {
  timerSecondsRemaining: number;
  totalSeconds: number;
  isRunning: boolean;
  isSubmissionsLocked: boolean;
  activePhase: ClassPhase;
  soundEnabled: boolean;
  scoringMode?: ScoringMode; // Ausente em salas antigas = 'fixed'
}

export interface RallyRoom {
  id: string;
  nome: string;
  disciplina: string;
  dataCriacao: string;
  status: 'ativa' | 'finalizada';
  teams: Team[];
  logs: SubmissionLog[];
  sessionState: ClassSessionState;
  anotacoes?: string;
}
