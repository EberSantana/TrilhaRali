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
  Sheet,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface TeacherHubProps {
  isTeacher: boolean;
  activeRoomName?: string;
  teamsCount: number;
  submissionsCount: number;
  onRequireTeacher: () => void;
  onOpenRooms: () => void;
  onOpenProjector: () => void;
  onOpenMissions: () => void;
  onOpenDebriefing: () => void;
  onOpenSql: () => void;
  onOpenSheets: () => void;
  onOpenCtfPanel: () => void;
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

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-1 truncate text-lg font-black text-white">{value}</div>
  </div>
);

export const TeacherHub: React.FC<TeacherHubProps> = (p) => {
  const [showBank, setShowBank] = useState(false);
  if (!p.isTeacher) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-center">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-white">Área do professor</h1>
        <p className="mt-2 text-sm text-slate-400">
          Digite o seu PIN para gerenciar salas, missões, CTF e o banco de perguntas.
        </p>
        <button
          type="button"
          onClick={p.onRequireTeacher}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500"
        >
          <KeyRound className="w-4 h-4" />
          Entrar com PIN
        </button>
      </div>
    );
  }

  if (showBank) return <BankManager onBack={() => setShowBank(false)} />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300">
            <ShieldCheck className="w-4 h-4" />
            Modo professor ativo
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">Painel do professor</h1>
          <p className="mt-1 text-sm text-slate-400">Tudo o que você administra na Trilha Rali, em um só lugar.</p>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Sala ativa (Rali NFC)" value={p.activeRoomName || '—'} />
        <Stat label="Equipes" value={String(p.teamsCount)} />
        <Stat label="Envios registrados" value={String(p.submissionsCount)} />
      </div>

      <Section title="Rali NFC">
        <Tool title="Salas e equipes" description="Crie turmas e cadastre os alunos de cada equipe." icon={<Users className="w-5 h-5" />} onClick={p.onOpenRooms} />
        <Tool title="Telão do rali" description="Ranking ao vivo e modo de pontuação para projetar." icon={<MonitorPlay className="w-5 h-5" />} onClick={p.onOpenProjector} />
        <Tool title="Missões e gabarito" description="Catálogo das missões, etiquetas NFC/QR e respostas." icon={<BookOpenCheck className="w-5 h-5" />} onClick={p.onOpenMissions} />
        <Tool title="Debriefing" description="Erros e acertos da turma para a conversa final." icon={<BarChart3 className="w-5 h-5" />} onClick={p.onOpenDebriefing} />
        <Tool title="Console SQL do professor" description="Banco do rali para testar consultas." icon={<Database className="w-5 h-5" />} onClick={p.onOpenSql} />
        <Tool title="Planilha (Google Sheets)" description="Exportação e backend do Apps Script." icon={<Sheet className="w-5 h-5" />} onClick={p.onOpenSheets} />
      </Section>

      <Section title="CTF Online">
        <Tool title="Painel do CTF" description="Salas com token, fases, liberação do banco, ranking e telão." icon={<Flag className="w-5 h-5" />} onClick={p.onOpenCtfPanel} />
      </Section>

      <Section title="Banco de perguntas">
        <Tool
          title="Minhas perguntas e respostas"
          description="Cadastre perguntas por disciplina (resposta exata ou múltipla escolha) e use no NFC e no CTF."
          icon={<Library className="w-5 h-5" />}
          onClick={() => setShowBank(true)}
        />
      </Section>

      <Section title="Conta">
        <Tool title="PIN e sessão" description="Altere o PIN ou saia do modo professor." icon={<KeyRound className="w-5 h-5" />} onClick={p.onOpenAccount} />
      </Section>
    </div>
  );
};
