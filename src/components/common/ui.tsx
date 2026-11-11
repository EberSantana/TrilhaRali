import React, { useEffect, useState } from 'react';

type Variant = 'primary' | 'orange' | 'secondary' | 'danger' | 'warn' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-emerald-600 hover:bg-emerald-500 border-emerald-600 text-white shadow-sm',
  orange: 'bg-orange-600 hover:bg-orange-500 border-orange-600 text-white shadow-sm',
  secondary: 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-100 shadow-sm',
  danger: 'bg-rose-600 hover:bg-rose-500 border-rose-600 text-white shadow-sm',
  warn: 'bg-amber-600 hover:bg-amber-500 border-amber-600 text-white shadow-sm',
  ghost: 'bg-transparent hover:bg-slate-800 border-transparent text-slate-300',
};
const SIZE: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-3 text-base gap-2.5',
};

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
}

/** Botão padrão do sistema: o mesmo desenho no painel, no telão e no celular. */
export const Btn: React.FC<BtnProps> = ({ variant = 'secondary', size = 'md', icon, className = '', children, type = 'button', ...rest }) => (
  <button
    type={type}
    {...rest}
    className={`inline-flex items-center justify-center rounded-lg border font-semibold whitespace-nowrap transition outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT[variant]} ${SIZE[size]} ${className}`}
  >
    {icon}
    {children}
  </button>
);

/** Barra de ferramentas: agrupa botões relacionados e separa os grupos com uma linha fina. */
export const Toolbar: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = '' }) => (
  <div role="toolbar" aria-label={label} className={`flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-sm ${className}`}>
    {children}
  </div>
);

export const ToolbarDivider: React.FC = () => <span className="mx-1 hidden h-6 w-px bg-slate-800 sm:block" aria-hidden />;

/** QR code (carrega a biblioteca só quando é usado). */
export const QrImage: React.FC<{ text: string; size?: number; label?: string }> = ({ text, size = 160, label = 'QR code' }) => {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let alive = true;
    import('qrcode')
      .then(({ default: QRCode }) => QRCode.toDataURL(text, { margin: 1, width: size * 2, errorCorrectionLevel: 'M' }))
      .then((url) => alive && setSrc(url))
      .catch(() => alive && setSrc(''));
    return () => {
      alive = false;
    };
  }, [text, size]);
  if (!src) return <div style={{ width: size, height: size }} className="rounded-lg bg-slate-800" aria-hidden />;
  // fundo branco fixo: o QR precisa de contraste em qualquer tema
  return <img src={src} alt={label} width={size} height={size} className="rounded-lg bg-white p-1" />;
};

/** Cabeçalho de seção numerado (1 Perguntas · 2 Turma · 3 Ao vivo · 4 Resultados). */
export const StepTitle: React.FC<{ n: number; title: string; hint?: string; tone?: 'emerald' | 'orange' }> = ({ n, title, hint, tone = 'emerald' }) => (
  <div className="flex items-center gap-3">
    <span className={`w-7 h-7 shrink-0 rounded-full text-xs font-black flex items-center justify-center text-white ${tone === 'emerald' ? 'bg-emerald-600' : 'bg-orange-600'}`}>{n}</span>
    <div>
      <h3 className="text-base font-black text-white leading-tight">{title}</h3>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  </div>
);
