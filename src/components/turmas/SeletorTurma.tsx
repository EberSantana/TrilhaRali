import React from 'react';
import type { Turma } from '../../utils/turmasApi';

/** Escolha da turma ao criar uma sala: com turma, o aluno entra escolhendo o próprio nome e a sala conta nas notas. */
export const SeletorTurma: React.FC<{ turmas: Turma[]; value: string; onChange: (id: string) => void; className?: string }> = ({ turmas, value, onChange, className = '' }) => (
  <label className="block space-y-1">
    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Turma</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      <option value="">Sem turma (o aluno digita o nome)</option>
      {turmas.map((t) => (
        <option key={t.id} value={t.id}>
          {t.nome} · {t.alunos.length} alunos
        </option>
      ))}
    </select>
    {!turmas.length && <span className="block text-xs text-slate-500">Cadastre turmas em Professor → Turmas e notas para o aluno escolher o nome na lista.</span>}
  </label>
);
