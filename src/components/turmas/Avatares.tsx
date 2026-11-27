import React, { useEffect, useState } from 'react';
import { Capacete, CapaceteArte, type Papel, type PinturaCapacete } from './Capacete';

export interface AvatarCapacete {
  id: string;
  nome: string;
  pintura: PinturaCapacete;
}

const V_ESCURA: [string, string] = ['#0b1220', '#475569'];
const V_AMBAR: [string, string] = ['#7c2d12', '#fbbf24'];
const V_AZUL: [string, string] = ['#0c4a6e', '#38bdf8'];

/** Catálogo de capacetes para o aluno escolher como avatar. O id é o que fica salvo (aparelho e planilha). */
export const AVATARES: AvatarCapacete[] = [
  { id: 'rubi', nome: 'Rubi', pintura: { casco: '#ef4444', casco2: '#991b1b', viseira: V_ESCURA, faixa: '#ffffff', filete: '#fbbf24', numero: '1', padrao: 'faixa' } },
  { id: 'oceano', nome: 'Oceano', pintura: { casco: '#3b82f6', casco2: '#1e3a8a', viseira: V_ESCURA, faixa: '#ffffff', filete: '#38bdf8', numero: '2', padrao: 'listra' } },
  { id: 'floresta', nome: 'Floresta', pintura: { casco: '#22c55e', casco2: '#15803d', viseira: V_AMBAR, faixa: '#ffffff', filete: '#0f172a', numero: '3', padrao: 'raio' } },
  { id: 'sol', nome: 'Sol', pintura: { casco: '#facc15', casco2: '#ca8a04', viseira: V_ESCURA, faixa: '#0f172a', filete: '#ffffff', numero: '4', padrao: 'xadrez' } },
  { id: 'laranja', nome: 'Laranja', pintura: { casco: '#fb923c', casco2: '#c2410c', viseira: V_ESCURA, faixa: '#ffffff', filete: '#0f172a', numero: '5', padrao: 'faixa' } },
  { id: 'violeta', nome: 'Violeta', pintura: { casco: '#a855f7', casco2: '#6b21a8', viseira: V_AMBAR, faixa: '#ffffff', filete: '#f0abfc', numero: '6', padrao: 'listra' } },
  { id: 'rosa', nome: 'Rosa', pintura: { casco: '#f472b6', casco2: '#be185d', viseira: V_ESCURA, faixa: '#ffffff', filete: '#fde047', numero: '7', padrao: 'raio' } },
  { id: 'noturno', nome: 'Noturno', pintura: { casco: '#334155', casco2: '#0f172a', viseira: V_AMBAR, faixa: '#fbbf24', filete: '#ffffff', numero: '8', padrao: 'xadrez' } },
  { id: 'gelo', nome: 'Gelo', pintura: { casco: '#e2e8f0', casco2: '#94a3b8', viseira: V_AZUL, faixa: '#38bdf8', filete: '#0f172a', numero: '9', padrao: 'faixa' } },
  { id: 'turquesa', nome: 'Turquesa', pintura: { casco: '#14b8a6', casco2: '#115e59', viseira: V_ESCURA, faixa: '#ffffff', filete: '#fbbf24', numero: '10', padrao: 'listra' } },
  { id: 'lima', nome: 'Lima', pintura: { casco: '#a3e635', casco2: '#4d7c0f', viseira: V_ESCURA, faixa: '#0f172a', filete: '#ffffff', numero: '11', padrao: 'raio' } },
  { id: 'vinho', nome: 'Vinho', pintura: { casco: '#9f1239', casco2: '#4c0519', viseira: V_AMBAR, faixa: '#ffffff', filete: '#fda4af', numero: '12', padrao: 'xadrez' } },
];

export const avatarPorId = (id: string | null | undefined) => AVATARES.find((a) => a.id === id) ?? null;

const CHAVE_AVATAR = 'rali_avatar_v1';
const EVENTO_AVATAR = 'rali-avatar';

export function lerAvatar(): string {
  try {
    const v = localStorage.getItem(CHAVE_AVATAR) || '';
    return avatarPorId(v) ? v : '';
  } catch {
    return '';
  }
}

export function salvarAvatar(id: string) {
  try {
    localStorage.setItem(CHAVE_AVATAR, id);
  } catch {
    /* sem armazenamento: vale só nesta tela */
  }
  window.dispatchEvent(new Event(EVENTO_AVATAR));
}

/** Avatar escolhido neste aparelho (e a função para trocar). */
export function useAvatar(): [string, (id: string) => void] {
  const [id, setId] = useState(lerAvatar);
  useEffect(() => {
    const at = () => setId(lerAvatar());
    window.addEventListener(EVENTO_AVATAR, at);
    return () => window.removeEventListener(EVENTO_AVATAR, at);
  }, []);
  return [id, salvarAvatar];
}

/** Capacete do aluno (ou um capacete cinza, se ele ainda não escolheu). */
export const AvatarCapacete: React.FC<{ id?: string | null; size?: number; className?: string }> = ({ id, size = 40, className = '' }) => {
  const a = avatarPorId(id);
  const pintura: PinturaCapacete = a?.pintura ?? { casco: '#64748b', casco2: '#334155', viseira: V_ESCURA, faixa: '#cbd5e1', filete: '#94a3b8', numero: '?', padrao: 'faixa' };
  return <CapaceteArte pintura={pintura} size={size} className={className} title={a ? `Capacete ${a.nome}` : 'Capacete'} />;
};

const CHAVE_DUPLA = 'rali_avatares_dupla_v1';
const EVENTO_DUPLA = 'rali-avatares-dupla';

/** Um capacete por integrante da dupla/trio (na ordem da cabine); guardado neste aparelho. */
export function useAvataresDupla(): [string[], (i: number, id: string) => void] {
  const ler = (): string[] => {
    try {
      const v = JSON.parse(localStorage.getItem(CHAVE_DUPLA) || '[]');
      return Array.isArray(v) ? v.map((x) => (avatarPorId(String(x)) ? String(x) : '')).slice(0, 3) : [];
    } catch {
      return [];
    }
  };
  const [lista, setLista] = useState<string[]>(ler);
  useEffect(() => {
    const at = () => setLista(ler());
    window.addEventListener(EVENTO_DUPLA, at);
    return () => window.removeEventListener(EVENTO_DUPLA, at);
  }, []);
  const muda = (i: number, id: string) => {
    const novo = [0, 1, 2].map((j) => (j === i ? id : lista[j] ?? ''));
    try {
      localStorage.setItem(CHAVE_DUPLA, JSON.stringify(novo));
    } catch {
      /* modo privado */
    }
    setLista(novo);
    window.dispatchEvent(new Event(EVENTO_DUPLA));
  };
  return [lista, muda];
}

/** "rubi,oceano" (um por integrante, na ordem da cabine) -> lista com vazios onde não escolheu. */
export const listaAvatares = (v?: string | null): string[] => String(v ?? '').split(',').map((x) => x.trim());

/** Capacetes de toda a dupla lado a lado (ou o capacete único). */
export const AvataresJuntos: React.FC<{ value?: string | null; size?: number; className?: string }> = ({ value, size = 36, className = '' }) => {
  const ids = listaAvatares(value).filter((x) => avatarPorId(x)).slice(0, 3);
  if (!ids.length) return null;
  return (
    <span className={`inline-flex shrink-0 items-center ${className}`}>
      {ids.map((id, i) => (
        <AvatarCapacete key={`${id}-${i}`} id={id} size={size} className={i ? '-ml-3' : ''} />
      ))}
    </span>
  );
};

/** Capacete da vez: o que o aluno escolheu; sem escolha, o capacete colorido do papel. */
export const CapaceteDaVez: React.FC<{ papel: Papel; avatar?: string | null; size?: number; className?: string }> = ({ papel, avatar, size = 48, className = '' }) =>
  avatarPorId(avatar) ? <AvatarCapacete id={avatar} size={size} className={className} /> : <Capacete papel={papel} size={size} className={className} />;

/** Grade para o aluno escolher o capacete. */
export const SeletorAvatar: React.FC<{ value: string; onChange: (id: string) => void; foco?: string; bloqueados?: string[] }> = ({ value, onChange, foco = 'focus-visible:ring-violet-500', bloqueados = [] }) => (
  <div role="radiogroup" aria-label="Escolha o seu capacete" className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
    {AVATARES.map((a) => {
      const on = value === a.id;
      const ocupado = !on && bloqueados.includes(a.id);
      return (
        <button
          key={a.id}
          type="button"
          role="radio"
          aria-checked={on}
          disabled={ocupado}
          title={ocupado ? 'Já escolhido por outro da dupla' : undefined}
          onClick={() => onChange(a.id)}
          className={`flex flex-col items-center gap-0.5 rounded-xl border px-1 py-1.5 outline-none focus-visible:ring-2 ${foco} ${on ? 'border-amber-400 bg-amber-400/10' : ocupado ? 'cursor-not-allowed border-slate-800 bg-slate-950 opacity-30' : 'border-slate-800 bg-slate-950 hover:border-slate-600'}`}
        >
          <AvatarCapacete id={a.id} size={48} />
          <span className={`text-[10px] font-bold ${on ? 'text-amber-300' : 'text-slate-400'}`}>{a.nome}</span>
        </button>
      );
    })}
  </div>
);

/** Cada integrante da dupla escolhe o próprio capacete: toque no integrante e depois no capacete. */
export const EscolhaCapacetes: React.FC<{ papeis: Papel[]; nomes: string[]; avatares: string[]; onChange: (i: number, id: string) => void; foco?: string }> = ({ papeis, nomes, avatares, onChange, foco }) => {
  const [vez, setVez] = useState(0);
  const atual = Math.min(vez, papeis.length - 1);
  const outros = avatares.filter((_, j) => j !== atual && j < papeis.length).filter(Boolean);
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5" role="tablist" aria-label="Quem está escolhendo o capacete">
        {papeis.map((p, i) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={i === atual}
            onClick={() => setVez(i)}
            className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-2 py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${i === atual ? 'border-amber-400 bg-amber-400/10' : 'border-slate-800 bg-slate-950 hover:border-slate-600'}`}
          >
            <CapaceteDaVez papel={p} avatar={avatares[i]} size={36} />
            <span className="min-w-0">
              <span className="block truncate text-[11px] font-black uppercase tracking-wide text-slate-300">{p === 'piloto' ? 'Piloto' : p === 'copiloto' ? 'Copiloto' : 'Engenheiro'}</span>
              <span className="block truncate text-[11px] text-slate-400">{nomes[i]?.split(' ')[0] || (avatares[i] ? 'capacete escolhido' : 'escolher capacete')}</span>
            </span>
          </button>
        ))}
      </div>
      <SeletorAvatar
        value={avatares[atual] ?? ''}
        onChange={(id) => {
          onChange(atual, id);
          const prox = papeis.findIndex((_, j) => j !== atual && !avatares[j]);
          if (prox > atual) setVez(prox);
        }}
        bloqueados={outros}
        foco={foco}
      />
    </div>
  );
};
