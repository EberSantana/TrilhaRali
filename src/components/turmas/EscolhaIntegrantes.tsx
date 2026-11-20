import React from 'react';

/** Integrantes escolhidos na lista da turma (Rali NFC e Desvendando). O valor é a lista separada por vírgula. */
export const EscolhaIntegrantes: React.FC<{ alunos: string[]; value: string; onChange: (v: string) => void; max: number; accent?: string }> = ({ alunos, value, onChange, max, accent = 'accent-emerald-600' }) => {
  const marcados = value.split(',').map((x) => x.trim()).filter(Boolean);
  const alterna = (n: string) => {
    const novo = marcados.includes(n) ? marcados.filter((x) => x !== n) : marcados.length < max ? [...marcados, n] : marcados;
    onChange(novo.join(', '));
  };
  return (
    <div className="max-h-56 space-y-1 overflow-auto rounded-xl border border-slate-700 bg-slate-950 p-2">
      {alunos.map((n) => {
        const on = marcados.includes(n);
        return (
          <label key={n} className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${on ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900'}`}>
            <input type="checkbox" checked={on} disabled={!on && marcados.length >= max} onChange={() => alterna(n)} className={`h-4 w-4 ${accent}`} />
            {n}
          </label>
        );
      })}
    </div>
  );
};
