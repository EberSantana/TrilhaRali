import React, { useState } from 'react';
import { BankManager } from './bank/BankManager';
import {
  BarChart3,
  BookOpenCheck,
  Database,
  Flag,
  KeyRound,
  Library,
  Lock,
  MonitorPlay,
  Puzzle,
  Radio,
  ArrowLeft,
  Sheet,
  ShieldCheck,
  Users,
  Search,
  GraduationCap,
  HelpCircle,
} from 'lucide-react';
import { AvisoServidor } from './common/AvisoServidor';

import { ThemePicker } from './common/ThemePicker';
import { useTheme } from '../utils/theme';

interface TeacherHubProps {
  isTeacher: boolean;
  onHome: () => void;
  onRequireTeacher: () => void;
  onOpenProjector: () => void;
  onOpenMissions: () => void;
  onOpenDebriefing: () => void;
  onOpenSql: () => void;
  onOpenSheets: () => void;
  onOpenRaliRooms: () => void;
  onOpenCtfRooms: () => void;
  onOpenCruzRooms: () => void;
  onOpenDesvRooms: () => void;
  onOpenQuemRooms: () => void;
  onOpenTurmas: () => void;
  onOpenAoVivo: () => void;
  onOpenAccount: () => void;
}

interface ToolProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
}

const Tool: React.FC<ToolProps> = ({ title, description, icon, onClick, disabled, badge }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`text-left rounded-xl border p-4 transition ${
      disabled
        ? 'border-slate-800 bg-slate-900/40 opacity-60 cursor-not-allowed'
        : 'border-slate-800 bg-slate-900/70 hover:border-emerald-500/50 hover:bg-slate-900'
    }`}
  >
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-9 h-9 shrink-0 rounded-lg bg-slate-800 text-emerald-300 flex items-center justify-center">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>
      </div>
    </div>
  </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mt-8">
    <h2 className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">{title}</h2>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  </section>
);



export const TeacherHub: React.FC<TeacherHubProps> = (p) => {
  const claro = useTheme() === 'claro';
  const [showBank, setShowBank] = useState(false);
  if (!p.isTeacher) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-center">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-white">Área do professor</h1>
        <p className="mt-2 text-sm text-slate-400">
          Entre com a chave do banco para gerenciar turmas, salas, missões e o banco de perguntas.
        </p>
        <button
          type="button"
          onClick={p.onRequireTeacher}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500"
        >
          <KeyRound className="w-4 h-4" />
          Entrar com a chave do banco
        </button>
        <div className="mt-4">
          <button type="button" onClick={p.onHome} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800"><ArrowLeft className="w-3.5 h-3.5" />Início</button>
        </div>
      </div>
    );
  }

  if (showBank) return <BankManager onBack={() => setShowBank(false)} onOpenCtf={() => { setShowBank(false); p.onOpenCtfRooms(); }} />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-10">
      <header
        className="flex flex-wrap items-center gap-4 rounded-[22px] px-5 py-5 sm:px-7"
        style={{ background: claro ? 'linear-gradient(115deg,#F2FBF4 0%,#E3F7E8 60%,#BDEFCD 100%)' : 'linear-gradient(115deg,#0F2A1F 0%,#0E3A27 60%,#145A34 100%)', boxShadow: '0 8px 24px rgba(0,120,53,.12)' }}
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl sm:text-4xl font-black italic leading-none tracking-tight" style={{ color: claro ? '#0F172A' : '#F1F5F9' }}>Área do professor · Jogos</h1>
          <p className="mt-1.5 text-sm sm:text-base font-semibold" style={{ color: claro ? '#334155' : '#CBD5E1' }}>Salas, turmas, banco de perguntas e aula ao vivo da Trilha Rali.</p>
        </div>
        <a
          href="https://ebersantana.github.io/disciplinas/professor.html"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm font-bold text-slate-200 shadow-sm transition hover:bg-slate-800"
          title="Acompanhamento das turmas e liberação de disciplinas"
        >
          Painel de estudos
        </a>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          Modo professor ativo
        </span>
      </header>

      <div className="mt-5">
        <AvisoServidor />
      </div>

      <button
        type="button"
        onClick={p.onOpenAoVivo}
        className="mt-6 flex w-full items-center gap-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 text-left transition hover:bg-rose-500/15 outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
      >
        <span className="relative flex h-3 w-3 shrink-0" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-black text-white">Aula ao vivo</span>
          <span className="block text-sm text-slate-300">Todas as salas abertas num só lugar: token e QR, cronômetro, telão, quem precisa de ajuda, ranking e encerrar.</span>
        </span>
        <MonitorPlay className="h-6 w-6 shrink-0 text-rose-300" />
      </button>

      <Section title="Preparar a aula">
        <Tool
          title="Turmas e notas"
          description="Lista de alunos de cada turma (cole do SUAP), notas de todos os módulos em CSV e a análise da turma."
          icon={<GraduationCap className="w-5 h-5" />}
          onClick={p.onOpenTurmas}
        />
        <Tool
          title="Banco de perguntas"
          description="Cadastre e importe perguntas por disciplina. A mesma seleção vai para o Rali NFC e o CTF Online."
          icon={<Library className="w-5 h-5" />}
          onClick={() => setShowBank(true)}
        />
        <Tool title="Etiquetas NFC e QR" description="Catálogo das missões e links para gravar nas etiquetas do Rali NFC." icon={<BookOpenCheck className="w-5 h-5" />} onClick={p.onOpenMissions} />
      </Section>

      <Section title="Criar e gerenciar salas">
        <Tool title="Rali NFC" description="Equipes no laboratório lendo etiquetas. Papéis de piloto, copiloto e engenheiro." icon={<Radio className="w-5 h-5" />} onClick={p.onOpenRaliRooms} />
        <Tool title="CTF Online" description="Fases individuais ou em dupla, com Console SQL, cronômetro e telão." icon={<Flag className="w-5 h-5" />} onClick={p.onOpenCtfRooms} />
        <Tool title="Cruzada Online" description="Palavras cruzadas por assunto; sem sala, a turma usa o Treino livre." icon={<Puzzle className="w-5 h-5" />} onClick={p.onOpenCruzRooms} />
        <Tool title="Desvendando" description="Casos de mistério em dupla, liberados por você durante a aula." icon={<Search className="w-5 h-5" />} onClick={p.onOpenDesvRooms} />
        <Tool title="Quem sou eu?" description="O aluno adivinha o conceito pelas dicas: fácil, média ou difícil, XP fixo ou corrida." icon={<HelpCircle className="w-5 h-5" />} onClick={p.onOpenQuemRooms} />
      </Section>

      <Section title="Ferramentas">
        <Tool title="Console SQLite (Banco de Dados)" description="Banco de exemplo para testar consultas nas aulas de SQL." icon={<Database className="w-5 h-5" />} onClick={p.onOpenSql} />
        <Tool title="Chave e sessão" description="Troque a chave do banco ou saia do modo professor." icon={<KeyRound className="w-5 h-5" />} onClick={p.onOpenAccount} />
      </Section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Aparência</h2>
        <ThemePicker />
      </section>

      <details className="group mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <summary className="cursor-pointer list-none text-xs font-black uppercase tracking-[0.18em] text-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded">
          <span className="inline-block transition group-open:rotate-90">▸</span> Avançado (ferramentas antigas e configuração)
        </summary>
        <p className="mt-3 text-xs text-slate-500">Modo local, sem servidor, e a configuração da planilha. No dia a dia você não precisa delas.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Tool title="Rali local" description="Salas e equipes guardadas só neste navegador, com telão local (sem internet)." icon={<Users className="w-5 h-5" />} onClick={p.onOpenProjector} />
          <Tool title="Debriefing do rali local" description="Erros e acertos do rali local para a conversa final." icon={<BarChart3 className="w-5 h-5" />} onClick={p.onOpenDebriefing} />
          <Tool title="Planilha (Google Sheets)" description="Exportação e configuração do servidor (Apps Script)." icon={<Sheet className="w-5 h-5" />} onClick={p.onOpenSheets} />
        </div>
      </details>
    </div>
  );
};
