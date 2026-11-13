import { useEffect, useMemo, useRef, useState } from 'react';
import { Code2, Eye, FileCode2, MousePointerClick, Paintbrush, PenSquare, RotateCcw, Store } from 'lucide-react';
import { EDITOR_CSS_INICIAL, EDITOR_HTML_INICIAL, SITE_CSS, SITE_HTML, montarDocumento } from '../../data/webLab';

const CHAVE = 'atelie-web-editor';
const CAIXA = 'bg-slate-950 border border-slate-800 rounded-xl';

type Aba = 'site' | 'html' | 'css' | 'editor';

/** Ateliê Web: ambiente CTF de Construção de Sites 1. A pré-visualização roda num iframe sem scripts (sandbox). */
export function AtelieWeb() {
  const [aba, setAba] = useState<Aba>('site');
  const abas: { id: Aba; nome: string; Icon: typeof Eye }[] = [
    { id: 'site', nome: 'Site do Café (visualizar)', Icon: Store },
    { id: 'html', nome: 'index.html', Icon: FileCode2 },
    { id: 'css', nome: 'estilo.css', Icon: Paintbrush },
    { id: 'editor', nome: 'Editor', Icon: PenSquare },
  ];
  const docSite = useMemo(() => montarDocumento(SITE_HTML, SITE_CSS), []);
  return (
    <section className="bg-slate-900 border border-fuchsia-500/30 rounded-2xl overflow-hidden min-w-0" aria-label="Ateliê Web">
      <header className="px-4 py-3 flex items-center gap-2 border-b border-slate-800 bg-fuchsia-500/5">
        <Code2 className="w-5 h-5 text-fuchsia-300" />
        <h3 className="font-black text-white">Ateliê Web</h3>
        <span className="text-xs text-slate-400 hidden sm:inline">Inspecione o site do Café Sertão ou teste seu HTML e CSS no Editor.</span>
      </header>
      <div role="tablist" aria-label="Ateliê Web" className="flex gap-1 overflow-x-auto px-2 pt-2 border-b border-slate-800">
        {abas.map(({ id, nome, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={aba === id}
            onClick={() => setAba(id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-bold border border-b-0 transition ${
              aba === id ? 'bg-slate-950 border-slate-700 text-fuchsia-200' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {nome}
          </button>
        ))}
      </div>
      <div className="p-3 sm:p-4 min-w-0">
        {aba === 'site' && <Previa doc={docSite} altura={520} />}
        {aba === 'html' && <Codigo texto={SITE_HTML} />}
        {aba === 'css' && <Codigo texto={SITE_CSS} />}
        {aba === 'editor' && <Editor />}
      </div>
    </section>
  );
}

function Codigo({ texto }: { texto: string }) {
  const linhas = texto.replace(/\n$/, '').split('\n');
  return (
    <div className={`${CAIXA} overflow-auto max-h-[520px]`}>
      <pre className="text-[12.5px] leading-5 font-mono py-2">
        {linhas.map((l, i) => (
          <div key={i} className="flex">
            <span className="select-none w-10 shrink-0 pr-3 text-right text-slate-600">{i + 1}</span>
            <code className="text-slate-100 whitespace-pre">{l || ' '}</code>
          </div>
        ))}
      </pre>
    </div>
  );
}

interface Inspecao {
  tag: string;
  id: string;
  classes: string;
  props: [string, string][];
}

const PROPS: [string, string][] = [
  ['Largura total (com padding e borda)', '@offsetWidth'],
  ['Altura total', '@offsetHeight'],
  ['width', 'width'],
  ['box-sizing', 'box-sizing'],
  ['padding', 'padding'],
  ['border', 'border'],
  ['margin', 'margin'],
  ['display', 'display'],
  ['position', 'position'],
  ['color', 'color'],
  ['background-color', 'background-color'],
  ['font-family', 'font-family'],
  ['font-size', 'font-size'],
  ['font-weight', 'font-weight'],
  ['line-height', 'line-height'],
  ['opacity', 'opacity'],
];

/** rgb(192, 57, 43) -> #c0392b (mantém rgba com transparência como está). */
function hex(v: string): string {
  const m = /^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/.exec(v);
  if (!m || (m[4] !== undefined && m[4] !== '1')) return v;
  return '#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('');
}

/** Pré-visualização segura (sem scripts) com o modo Inspecionar: clique num elemento e veja os estilos calculados. */
function Previa({ doc, altura }: { doc: string; altura: number }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [inspecionar, setInspecionar] = useState(true);
  const [info, setInfo] = useState<Inspecao | null>(null);
  const modo = useRef(inspecionar);
  modo.current = inspecionar;

  useEffect(() => setInfo(null), [doc]);

  const aoCarregar = () => {
    const d = ref.current?.contentDocument;
    const w = ref.current?.contentWindow;
    if (!d || !w) return;
    let atual: HTMLElement | null = null;
    let outlineAntigo = '';
    const limpar = () => {
      if (atual) atual.style.outline = outlineAntigo;
      atual = null;
    };
    d.addEventListener('mouseover', (e) => {
      if (!modo.current) return limpar();
      const el = e.target as HTMLElement;
      if (el === atual || !el.style) return;
      limpar();
      atual = el;
      outlineAntigo = el.style.outline;
      el.style.outline = '2px solid #d946ef';
    });
    d.addEventListener('mouseleave', limpar);
    d.addEventListener(
      'click',
      (e) => {
        if (!modo.current) return;
        e.preventDefault();
        const el = e.target as HTMLElement;
        const cs = w.getComputedStyle(el);
        const props = PROPS.map(([rot, p]): [string, string] => {
          if (p === '@offsetWidth') return [rot, `${el.offsetWidth}px`];
          if (p === '@offsetHeight') return [rot, `${el.offsetHeight}px`];
          const v = cs.getPropertyValue(p);
          return [rot, p.includes('color') ? hex(v) : p === 'border' ? `${cs.borderTopWidth} ${cs.borderTopStyle} ${hex(cs.borderTopColor)}` : v];
        });
        setInfo({ tag: el.tagName.toLowerCase(), id: el.id, classes: el.getAttribute('class') || '', props });
      },
      true
    );
  };

  return (
    <div className="space-y-2 min-w-0">
      <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
        <input type="checkbox" checked={inspecionar} onChange={(e) => setInspecionar(e.target.checked)} className="accent-fuchsia-500" />
        <MousePointerClick className="w-3.5 h-3.5 text-fuchsia-300" /> Inspecionar: clique num elemento para ver os estilos calculados
      </label>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-3 min-w-0">
        <iframe
          ref={ref}
          title="Pré-visualização do site"
          sandbox="allow-same-origin"
          srcDoc={doc}
          onLoad={aoCarregar}
          className="w-full rounded-xl border border-slate-700 bg-white"
          style={{ height: altura }}
        />
        <aside className={`${CAIXA} p-3 text-xs h-fit`} aria-live="polite">
          <div className="font-bold uppercase tracking-wider text-slate-400 mb-2">Inspecionar</div>
          {!info ? (
            <p className="text-slate-500">Clique em um elemento da página.</p>
          ) : (
            <>
              <div className="font-mono text-fuchsia-200 mb-2 break-all">
                &lt;{info.tag}
                {info.id && <span className="text-sky-300"> id="{info.id}"</span>}
                {info.classes && <span className="text-amber-300"> class="{info.classes}"</span>}&gt;
              </div>
              {info.props.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 py-0.5 border-b border-slate-800/70 last:border-0">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-slate-100 font-mono text-right break-all">{v}</span>
                </div>
              ))}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function lerSalvo(): { html: string; css: string } {
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE) || 'null');
    if (s && typeof s.html === 'string' && typeof s.css === 'string') return s;
  } catch {
    /* sem armazenamento: usa o modelo */
  }
  return { html: EDITOR_HTML_INICIAL, css: EDITOR_CSS_INICIAL };
}

function Editor() {
  const [inicial] = useState(lerSalvo);
  const [html, setHtml] = useState(inicial.html);
  const [css, setCss] = useState(inicial.css);
  const [doc, setDoc] = useState(() => montarDocumento(inicial.html, inicial.css));

  useEffect(() => {
    const t = setTimeout(() => {
      setDoc(montarDocumento(html, css));
      try {
        localStorage.setItem(CHAVE, JSON.stringify({ html, css }));
      } catch {
        /* ignora */
      }
    }, 350);
    return () => clearTimeout(t);
  }, [html, css]);

  const tab = (set: (v: string) => void) => (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: a, selectionEnd: b, value } = el;
    set(value.slice(0, a) + '  ' + value.slice(b));
    requestAnimationFrame(() => el.setSelectionRange(a + 2, a + 2));
  };

  const Area = ({ id, rotulo, valor, set }: { id: string; rotulo: string; valor: string; set: (v: string) => void }) => (
    <div className="space-y-1 min-w-0">
      <label htmlFor={id} className="text-xs font-bold text-slate-400">{rotulo}</label>
      <textarea
        id={id}
        value={valor}
        onChange={(e) => set(e.target.value)}
        onKeyDown={tab(set)}
        spellCheck={false}
        autoCapitalize="none"
        autoComplete="off"
        className="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-[12.5px] leading-5 text-slate-100 focus:ring-2 focus:ring-fuchsia-500 outline-none resize-y"
      />
    </div>
  );

  return (
    <div className="space-y-3 min-w-0">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setHtml(SITE_HTML); setCss(SITE_CSS); }} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-fuchsia-500/15 border border-fuchsia-500/40 text-fuchsia-200 hover:bg-fuchsia-500/25 flex items-center gap-1.5">
          <Store className="w-3.5 h-3.5" /> Carregar o site do Café no editor
        </button>
        <button onClick={() => { setHtml(EDITOR_HTML_INICIAL); setCss(EDITOR_CSS_INICIAL); }} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" /> Voltar ao modelo inicial
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {Area({ id: 'atelie-html', rotulo: 'HTML', valor: html, set: setHtml })}
        {Area({ id: 'atelie-css', rotulo: 'CSS (estilo.css)', valor: css, set: setCss })}
      </div>
      <Previa doc={doc} altura={380} />
      <p className="text-[11px] text-slate-500">A pré-visualização não executa JavaScript. O que você digitar fica salvo só neste navegador.</p>
    </div>
  );
}
