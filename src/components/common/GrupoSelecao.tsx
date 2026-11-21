import React, { useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * Padrão de grupo recolhível dos seletores do professor (Desvendando, perguntas da sala do CTF e do Rali NFC, Cruzada):
 * caixa de marcar tudo (com estado parcial), seta, título, contador marcados/total e o conteúdo logo abaixo.
 */
export type CorSelecao = 'violet' | 'orange' | 'emerald' | 'cyan';

export const COR_SELECAO: Record<CorSelecao, { caixa: string; ativo: string; texto: string; foco: string }> = {
  violet: { caixa: 'accent-violet-500', ativo: 'border-violet-500/60 bg-violet-500/10', texto: 'text-violet-300', foco: 'focus-visible:ring-violet-500' },
  orange: { caixa: 'accent-orange-500', ativo: 'border-orange-500/60 bg-orange-500/10', texto: 'text-orange-300', foco: 'focus-visible:ring-orange-500' },
  emerald: { caixa: 'accent-emerald-500', ativo: 'border-emerald-500/60 bg-emerald-500/10', texto: 'text-emerald-300', foco: 'focus-visible:ring-emerald-500' },
  cyan: { caixa: 'accent-cyan-500', ativo: 'border-cyan-500/60 bg-cyan-500/10', texto: 'text-cyan-300', foco: 'focus-visible:ring-cyan-500' },
};

/** Caixa de marcar com o estado "parcial" (alguns itens marcados). */
export const Tri: React.FC<{ checked: boolean; partial: boolean; onChange: () => void; label: string; cor: CorSelecao }> = ({ checked, partial, onChange, label, cor }) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = partial && !checked;
  }, [partial, checked]);
  return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} aria-label={label} className={`h-4 w-4 shrink-0 cursor-pointer ${COR_SELECAO[cor].caixa}`} />;
};

/** Contador "marcados/total" (ou qualquer texto curto) */
export const Chip: React.FC<{ children: React.ReactNode; destaque?: string }> = ({ children, destaque = '' }) => (
  <span className={`inline-flex shrink-0 items-center rounded-md border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-[10px] font-bold text-slate-300 ${destaque}`}>{children}</span>
);

interface GrupoProps {
  /** area = agrupa disciplinas; disciplina = padrão; assunto = dentro da disciplina */
  nivel?: 'area' | 'disciplina' | 'assunto';
  titulo: string;
  /** linha pequena abaixo do título (ex.: "3 assunto(s) · 40 perguntas") */
  resumo?: string;
  marcados: number;
  total: number;
  /** texto do contador, se não for marcados/total */
  contador?: string;
  aberto: boolean;
  onAlternarAberto: () => void;
  onMarcarTudo: () => void;
  rotuloMarcar: string;
  cor: CorSelecao;
  /** selo extra à direita (ex.: "pacote pronto", duplas que resolveram) */
  extra?: React.ReactNode;
  children?: React.ReactNode;
}

const ESTILO = {
  area: { caixa: 'rounded-2xl border-2', titulo: 'text-sm font-black uppercase tracking-wide text-white', miolo: 'space-y-2 p-2', linha: 'px-3 py-2.5' },
  disciplina: { caixa: 'rounded-xl border', titulo: 'text-xs font-bold uppercase tracking-wider text-slate-200', miolo: 'space-y-1.5 p-2', linha: 'px-3 py-2' },
  assunto: { caixa: 'rounded-lg border', titulo: 'text-xs font-semibold text-slate-100', miolo: 'px-2 pb-2', linha: 'px-2 py-1.5' },
} as const;

export const GrupoSelecao: React.FC<GrupoProps> = ({ nivel = 'disciplina', titulo, resumo, marcados, total, contador, aberto, onAlternarAberto, onMarcarTudo, rotuloMarcar, cor, extra, children }) => {
  const c = COR_SELECAO[cor];
  const e = ESTILO[nivel];
  const Seta = aberto ? ChevronDown : ChevronRight;
  return (
    <div role="treeitem" aria-expanded={aberto} className={`overflow-hidden ${e.caixa} ${marcados > 0 ? c.ativo : nivel === 'area' ? 'border-slate-700 bg-slate-900/40' : 'border-slate-800 bg-slate-950/50'}`}>
      <div className={`flex items-center gap-2 ${e.linha}`}>
        <Tri checked={total > 0 && marcados === total} partial={marcados > 0} onChange={onMarcarTudo} label={rotuloMarcar} cor={cor} />
        <button type="button" onClick={onAlternarAberto} aria-expanded={aberto} className={`flex min-w-0 flex-1 items-center gap-2 rounded-md text-left outline-none focus-visible:ring-2 ${c.foco}`}>
          <Seta className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="min-w-0 flex-1">
            <span className={`block break-words ${e.titulo}`}>{titulo}</span>
            {resumo && <span className="block text-[10px] font-normal normal-case tracking-normal text-slate-400">{resumo}</span>}
          </span>
          {extra}
          <Chip destaque={marcados > 0 ? c.texto : ''}>{contador ?? `${marcados}/${total}`}</Chip>
        </button>
      </div>
      {aberto && children != null && <div className={`border-t border-slate-800 bg-slate-950/40 ${e.miolo}`} role="group">{children}</div>}
    </div>
  );
};

/** Áreas para agrupar as disciplinas quando a lista é longa. O que não estiver aqui vai para "Outras". */
const AREAS: { nome: string; disciplinas: string[] }[] = [
  { nome: 'Dados', disciplinas: ['Banco de Dados'] },
  { nome: 'Redes e Segurança', disciplinas: ['Redes de Computadores', 'Projeto de Redes', 'Segurança da Informação'] },
  { nome: 'Desenvolvimento', disciplinas: ['Engenharia de Software', 'Construção de Sites 1', 'Construção de Sites', 'Programação 1', 'Programação Web (back-end)'] },
  { nome: 'Fundamentos', disciplinas: ['Informática Básica', 'Fundamentos para Sistemas de Informação', 'Fundamentos de Sistemas Operacionais', 'Organização de Computadores', 'Lógica', 'Mapas Mentais de TI'] },
];
/** Com até 6 disciplinas a lista cabe sem agrupar (é o caso do Desvendando); acima disso agrupa em áreas */
export const MIN_PARA_AGRUPAR = 7;

export function agruparPorArea<T extends { nome: string }>(itens: T[]): { nome: string; itens: T[] }[] {
  const usados = new Set<string>();
  const grupos = AREAS.map((a) => {
    const lista = itens.filter((d) => a.disciplinas.includes(d.nome));
    lista.forEach((d) => usados.add(d.nome));
    return { nome: a.nome, itens: lista };
  });
  const resto = itens.filter((d) => !usados.has(d.nome));
  if (resto.length) grupos.push({ nome: 'Outras', itens: resto });
  return grupos.filter((g) => g.itens.length > 0);
}

/** Alterna um valor num conjunto (estado de grupos abertos) */
export function alternaNoConjunto(set: Set<string>, chave: string): Set<string> {
  const n = new Set(set);
  if (n.has(chave)) n.delete(chave);
  else n.add(chave);
  return n;
}
