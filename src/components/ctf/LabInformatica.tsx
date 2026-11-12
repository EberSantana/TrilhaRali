import { useMemo, useState } from 'react';
import { FlaskConical, FileText, Globe, HardDrive, Cloud, Mail, Presentation, Sheet as SheetIcon, FolderOpen, ArrowDown, ArrowUp } from 'lucide-react';
import {
  LAB_ARQUIVOS,
  type LabArquivo,
  type LabDocBloco,
  type LabDocumento,
  type LabEmail,
  type LabNuvem,
  type LabPasta,
  type LabPlanilha,
  type LabSistema,
  type LabSlides,
  type LabWeb,
} from '../../data/infoLab';
import { avaliarCelula, avaliarFormula, colName, formatar } from '../../utils/planilha';

const ICONE: Record<LabArquivo['tipo'], typeof FileText> = {
  ficha: HardDrive, pasta: FolderOpen, web: Globe, email: Mail, nuvem: Cloud, documento: FileText, planilha: SheetIcon, slides: Presentation,
};

const CAIXA = 'bg-slate-950 border border-slate-800 rounded-xl';

/** Laboratório de Informática: arquivos simulados para as missões de Informática Básica (só leitura, roda no navegador). */
export function LabInformatica() {
  const [id, setId] = useState(LAB_ARQUIVOS[0].id);
  const arq = LAB_ARQUIVOS.find((a) => a.id === id) ?? LAB_ARQUIVOS[0];
  return (
    <section className="bg-slate-900 border border-sky-500/30 rounded-2xl overflow-hidden" aria-label="Laboratório de Informática">
      <header className="px-4 py-3 flex items-center gap-2 border-b border-slate-800 bg-sky-500/5">
        <FlaskConical className="w-5 h-5 text-sky-300" />
        <h3 className="font-black text-white">Laboratório de Informática</h3>
        <span className="text-xs text-slate-400 hidden sm:inline">Abra os arquivos abaixo para encontrar as respostas dos desafios.</span>
      </header>
      <div role="tablist" aria-label="Arquivos do laboratório" className="flex gap-1 overflow-x-auto px-2 pt-2 border-b border-slate-800">
        {LAB_ARQUIVOS.map((a) => {
          const Icon = ICONE[a.tipo];
          const on = a.id === arq.id;
          return (
            <button
              key={a.id}
              role="tab"
              aria-selected={on}
              onClick={() => setId(a.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-bold border border-b-0 transition ${
                on ? 'bg-slate-950 border-slate-700 text-sky-200' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {a.nome}
            </button>
          );
        })}
      </div>
      <div className="p-3 sm:p-4 min-w-0">
        {arq.tipo === 'ficha' && <Ficha a={arq} />}
        {arq.tipo === 'pasta' && <Pasta a={arq} />}
        {arq.tipo === 'web' && <Web a={arq} />}
        {arq.tipo === 'email' && <Email a={arq} />}
        {arq.tipo === 'nuvem' && <Nuvem a={arq} />}
        {arq.tipo === 'documento' && <Documento a={arq} />}
        {arq.tipo === 'planilha' && <Planilha a={arq} />}
        {arq.tipo === 'slides' && <Slides a={arq} />}
      </div>
    </section>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="text-left px-3 py-2 text-[11px] uppercase tracking-wider text-slate-400 font-bold">{children}</th>;
const Td = ({ children, cls = '' }: { children: React.ReactNode; cls?: string }) => <td className={`px-3 py-2 text-sm text-slate-200 ${cls}`}>{children}</td>;

function Ficha({ a }: { a: LabSistema }) {
  return (
    <div className={`${CAIXA} overflow-hidden`}>
      <div className="px-3 py-2 text-xs font-bold text-slate-400 border-b border-slate-800">Propriedades do sistema · Laboratório 03</div>
      <table className="w-full"><tbody>
        {a.linhas.map(([k, v]) => (
          <tr key={k} className="border-b border-slate-800/70 last:border-0"><Td cls="font-bold text-sky-200 w-2/5">{k}</Td><Td>{v}</Td></tr>
        ))}
      </tbody></table>
    </div>
  );
}

function Pasta({ a }: { a: LabPasta }) {
  return (
    <div className={`${CAIXA} overflow-x-auto`}>
      <div className="px-3 py-2 text-xs font-bold text-slate-400 border-b border-slate-800">C:\Usuários\aluno\{a.nome}</div>
      <table className="w-full min-w-[320px]">
        <thead><tr className="border-b border-slate-800"><Th>Nome</Th><Th>Tipo</Th><Th>Tamanho</Th></tr></thead>
        <tbody>
          {a.arquivos.map((f) => (
            <tr key={f.nome} className="border-b border-slate-800/70 last:border-0">
              <Td cls="font-mono">{f.nome}</Td><Td cls="text-slate-400">Arquivo .{f.nome.split('.').pop()}</Td><Td cls="font-mono">{f.mb} MB</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Web({ a }: { a: LabWeb }) {
  return (
    <div className={`${CAIXA} overflow-hidden`}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 bg-slate-900">
        <Globe className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="flex-1 min-w-0 truncate rounded-full bg-slate-800 px-3 py-1 text-xs sm:text-sm font-mono text-slate-100" title={a.url}>{a.url}</div>
      </div>
      <div className="p-4 space-y-2">
        <h4 className="text-lg font-black text-white">{a.titulo}</h4>
        {a.paragrafos.map((p) => <p key={p} className="text-sm text-slate-300">{p}</p>)}
      </div>
    </div>
  );
}

function Email({ a }: { a: LabEmail }) {
  const L = ({ k, v }: { k: string; v: string }) => (
    <div className="flex gap-2 text-sm"><span className="w-16 shrink-0 font-bold text-slate-400">{k}</span><span className="text-slate-100 break-all">{v}</span></div>
  );
  return (
    <div className={`${CAIXA} p-4 space-y-1.5`}>
      <L k="De" v={a.de} /><L k="Para" v={a.para.join(', ')} /><L k="Cc" v={a.cc.join(', ')} /><L k="Cco" v={a.cco.join(', ')} />
      <L k="Assunto" v={a.assunto} /><L k="Data" v={a.data} />
      <div className="flex flex-wrap gap-2 pt-1">
        {a.anexos.map((x) => <span key={x.nome} className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-200">📎 {x.nome} · {x.mb} MB</span>)}
      </div>
      <div className="pt-3 mt-2 border-t border-slate-800 space-y-2">{a.corpo.map((p) => <p key={p} className="text-sm text-slate-300">{p}</p>)}</div>
      <p className="text-[11px] text-slate-500 pt-1">Visão de quem enviou: o campo Cco só aparece para o remetente.</p>
    </div>
  );
}

function Nuvem({ a }: { a: LabNuvem }) {
  return (
    <div className={`${CAIXA} overflow-x-auto`}>
      <div className="px-3 py-2 text-xs font-bold text-slate-400 border-b border-slate-800 flex justify-between"><span>{a.nome}</span><span>Armazenamento: {a.usado}</span></div>
      <table className="w-full min-w-[320px]">
        <thead><tr className="border-b border-slate-800"><Th>Arquivo</Th><Th>Dono</Th><Th>Sua permissão</Th></tr></thead>
        <tbody>
          {a.arquivos.map((f) => (
            <tr key={f.nome} className="border-b border-slate-800/70 last:border-0"><Td>{f.nome}</Td><Td>{f.dono}</Td><Td cls="font-bold text-sky-200">{f.permissao}</Td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Documento({ a }: { a: LabDocumento }) {
  const [sel, setSel] = useState<number | null>(2);
  const [sumario, setSumario] = useState(false);
  const props = (b: LabDocBloco): [string, string][] => {
    const r: [string, string][] = [];
    const nomeTipo = { titulo: 'Título', titulo1: 'Título 1', paragrafo: 'Normal', tabela: 'Tabela', imagem: 'Imagem', quebra: 'Quebra', lista: 'Lista com marcadores' }[b.tipo];
    r.push(['Estilo', nomeTipo]);
    if (b.fonte) r.push(['Fonte', b.fonte]);
    if (b.tamanho) r.push(['Tamanho', `${b.tamanho} pt`]);
    if (b.negrito) r.push(['Negrito', 'sim']);
    if (b.alinhamento) r.push(['Alinhamento', b.alinhamento]);
    if (b.espacamento) r.push(['Espaçamento entre linhas', b.espacamento]);
    if (b.recuo) r.push(['Recuo da primeira linha', b.recuo]);
    if (b.largura) r.push(['Largura', b.largura]);
    if (b.linhas) r.push(['Linhas x colunas', `${b.linhas.length} x ${b.linhas[0].length}`]);
    if (b.itens) r.push(['Itens', String(b.itens.length)]);
    r.push(['Página', String(b.pagina)]);
    return r;
  };
  const paginas = [1, 2];
  const titulos = a.blocos.filter((b) => b.tipo === 'titulo1');
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-3">
      <div className="space-y-3 min-w-0">
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
          {([['Papel', a.pagina.papel], ['Orientação', a.pagina.orientacao], ['Margens', a.pagina.margens], ['Visualização', a.pagina.visualizacao]] as const).map(([k, v]) => <span key={k} className="px-2 py-1 rounded bg-slate-800"><b className="text-slate-300">{k}:</b> {v}</span>)}
          <button onClick={() => setSumario((s) => !s)} className="px-2 py-1 rounded bg-sky-500/15 border border-sky-500/40 text-sky-200 font-bold">{sumario ? 'Ocultar sumário' : 'Mostrar sumário'}</button>
        </div>
        {sumario && (
          <div className={`${CAIXA} p-3 text-sm text-slate-200`}>
            <b className="text-white">Sumário</b>
            {titulos.map((t) => <div key={t.texto} className="flex justify-between border-b border-dotted border-slate-700 py-0.5"><span>{t.texto}</span><span>{t.pagina}</span></div>)}
          </div>
        )}
        {paginas.map((p) => (
          <div key={p} className="bg-white text-slate-900 rounded-md shadow-lg p-5 sm:p-6 space-y-3 min-h-[200px]">
            <div className="text-[11px] text-slate-500 border-b border-slate-300 pb-1">{a.cabecalho}</div>
            {a.blocos.map((b, i) => (b.pagina !== p ? null : (
              <div
                key={i}
                role="button"
                tabIndex={0}
                onClick={() => setSel(i)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSel(i)}
                className={`cursor-pointer rounded px-1 -mx-1 ${sel === i ? 'ring-2 ring-sky-500 bg-sky-50' : 'hover:bg-slate-100'}`}
              >
                <BlocoDoc b={b} />
              </div>
            )))}
            <div className="text-[11px] text-slate-500 border-t border-slate-300 pt-1 text-right">{a.rodape.replace('{n}', String(p))}</div>
          </div>
        ))}
      </div>
      <aside className={`${CAIXA} p-3 h-fit text-sm`} aria-live="polite">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Propriedades</div>
        {sel === null ? <p className="text-slate-500 text-xs">Clique em um trecho do documento.</p> : props(a.blocos[sel]).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2 py-0.5 border-b border-slate-800/70 last:border-0"><span className="text-slate-400">{k}</span><span className="text-slate-100 text-right">{v}</span></div>
        ))}
      </aside>
    </div>
  );
}

function BlocoDoc({ b }: { b: LabDocBloco }) {
  const al = b.alinhamento === 'Centralizado' ? 'center' : b.alinhamento === 'Justificado' ? 'justify' : 'left';
  const estilo = { fontFamily: b.fonte, fontSize: b.tamanho ? Math.min(b.tamanho, 22) + 'px' : undefined, fontWeight: b.negrito ? 700 : 400, textAlign: al } as const;
  switch (b.tipo) {
    case 'tabela':
      return (
        <table className="w-full border border-slate-400 text-sm"><tbody>
          {b.linhas!.map((l, i) => <tr key={i}>{l.map((c, j) => <td key={j} className={`border border-slate-400 px-2 py-0.5 ${i === 0 ? 'font-bold bg-slate-100' : ''}`}>{c}</td>)}</tr>)}
        </tbody></table>
      );
    case 'imagem':
      return (
        <figure className="text-center">
          <div className="mx-auto w-40 h-20 bg-slate-200 border border-slate-400 flex items-center justify-center text-xs text-slate-500">🖼️ {b.texto}</div>
          <figcaption className="text-xs text-slate-600 mt-1">{b.legenda}</figcaption>
        </figure>
      );
    case 'quebra':
      return <div className="text-center text-[11px] text-slate-400 border-t border-dashed border-slate-400 pt-1">— {b.texto} —</div>;
    case 'lista':
      return <ul className="list-disc pl-6 text-sm">{b.itens!.map((x) => <li key={x}>{x}</li>)}</ul>;
    default: {
      const partes = b.erros?.length ? b.texto!.split(new RegExp(`(${b.erros.join('|')})`)) : [b.texto!];
      return (
        <p style={{ ...estilo, textIndent: b.recuo ? '1.5em' : undefined, lineHeight: b.espacamento ? 1.5 : undefined }}>
          {partes.map((t, i) => (b.erros?.includes(t) ? <span key={i} className="underline decoration-wavy decoration-red-500">{t}</span> : t))}
        </p>
      );
    }
  }
}

function Planilha({ a }: { a: LabPlanilha }) {
  const [aba, setAba] = useState(0);
  const [cel, setCel] = useState<[number, number] | null>(null);
  const [teste, setTeste] = useState('');
  const [ord, setOrd] = useState<{ col: number; desc: boolean } | null>(null);
  const [fCol, setFCol] = useState(0);
  const [fTxt, setFTxt] = useState('');
  const g = a.abas[aba].grade;
  const ncols = Math.max(...g.map((l) => l.length));
  const valores = useMemo(() => g.map((_, r) => Array.from({ length: ncols }, (_, c) => avaliarCelula(g, r, c))), [g, ncols]);
  let ordem = g.map((_, r) => r).slice(1);
  if (fTxt.trim()) ordem = ordem.filter((r) => formatar(valores[r][fCol]).toLowerCase().includes(fTxt.trim().toLowerCase()));
  if (ord) {
    const k = ord.col;
    ordem = [...ordem].sort((x, y) => {
      const a1 = valores[x][k], b1 = valores[y][k];
      const d = typeof a1 === 'number' && typeof b1 === 'number' ? a1 - b1 : formatar(a1).localeCompare(formatar(b1), 'pt-BR');
      return ord.desc ? -d : d;
    });
  }
  const mostrarFormula = cel ? (g[cel[0]]?.[cel[1]] ?? '') : '';
  const resultado = teste.trim() ? (teste.trim().startsWith('=') ? formatar(avaliarFormula(g, teste.trim())) : 'Comece com =') : '';
  const clicarCab = (c: number) => setOrd((o) => (o && o.col === c ? (o.desc ? null : { col: c, desc: true }) : { col: c, desc: false }));
  return (
    <div className="space-y-2 min-w-0">
      <div role="tablist" aria-label="Guias da planilha" className="flex gap-1">
        {a.abas.map((x, i) => (
          <button key={x.nome} role="tab" aria-selected={i === aba} onClick={() => { setAba(i); setCel(null); setOrd(null); setFTxt(''); setFCol(0); }}
            className={`px-3 py-1 rounded-md text-xs font-bold border ${i === aba ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200' : 'border-slate-700 text-slate-400 hover:text-white'}`}>{x.nome}</button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-1 rounded bg-slate-800 font-mono text-slate-300 w-14 text-center">{cel ? colName(cel[1]) + (cel[0] + 1) : '—'}</span>
        <span className="text-slate-500 italic">fx</span>
        <div className="flex-1 min-w-0 truncate px-2 py-1 rounded bg-slate-800 font-mono text-slate-100 min-h-[26px]">{mostrarFormula}</div>
      </div>
      <div className={`${CAIXA} overflow-x-auto`}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr><th className="w-8 bg-slate-900 border border-slate-800" />{Array.from({ length: ncols }, (_, c) => <th key={c} className="bg-slate-900 border border-slate-800 px-2 py-1 text-[11px] text-slate-400">{colName(c)}</th>)}</tr>
            <tr>
              <th className="bg-slate-900 border border-slate-800 text-[11px] text-slate-400">1</th>
              {g[0].map((h, c) => (
                <th key={c} className="border border-slate-800 bg-emerald-500/10 px-2 py-1 text-left">
                  <button onClick={() => clicarCab(c)} className="font-bold text-emerald-200 flex items-center gap-1" title="Clique para classificar">
                    {h}{ord?.col === c && (ord.desc ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordem.map((r) => (
              <tr key={r}>
                <td className="bg-slate-900 border border-slate-800 text-[11px] text-slate-400 text-center">{r + 1}</td>
                {Array.from({ length: ncols }, (_, c) => {
                  const v = valores[r][c];
                  return (
                    <td key={c} onClick={() => setCel([r, c])}
                      className={`border border-slate-800 px-2 py-1 cursor-cell ${typeof v === 'number' ? 'text-right font-mono' : ''} ${cel && cel[0] === r && cel[1] === c ? 'outline outline-2 outline-emerald-400 bg-emerald-500/10' : ''} text-slate-100`}>
                      {formatar(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-slate-400">Filtro:</span>
        <select value={fCol} onChange={(e) => setFCol(Number(e.target.value))} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100" aria-label="Coluna do filtro">
          {g[0].map((h, c) => <option key={c} value={c}>{h}</option>)}
        </select>
        <input value={fTxt} onChange={(e) => setFTxt(e.target.value)} placeholder="contém…" className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100 w-32" aria-label="Texto do filtro" />
        <span className="text-slate-500">{ordem.length} de {g.length - 1} linhas</span>
      </div>
      <div className={`${CAIXA} p-3 space-y-1.5`}>
        <label htmlFor="lab-formula" className="text-xs font-bold text-slate-400">Teste uma fórmula nesta guia (ex.: =SOMA(B2:B9) ou =CONT.SE(E2:E9;"Aprovado"))</label>
        <div className="flex gap-2 items-center">
          <input id="lab-formula" value={teste} onChange={(e) => setTeste(e.target.value)} autoComplete="off" spellCheck={false}
            className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="=SOMA(B2:B9)" />
          <span className="font-mono text-sm text-emerald-300 min-w-[4rem] text-right" aria-live="polite">{resultado && `= ${resultado}`}</span>
        </div>
        <p className="text-[11px] text-slate-500">Funções: SOMA, MEDIA, MAIOR, MENOR, MAX, MIN, CONT.NUM, CONT.VALORES, CONT.SE, SOMASE, SE, ARRED. Separe argumentos com ponto e vírgula.</p>
      </div>
    </div>
  );
}

function Slides({ a }: { a: LabSlides }) {
  const [n, setN] = useState(0);
  const [mestre, setMestre] = useState(false);
  const s = a.slides[n];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3 min-w-0">
      <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-72" aria-label="Miniaturas">
        {a.slides.map((x, i) => (
          <button key={i} onClick={() => { setN(i); setMestre(false); }} className={`shrink-0 w-24 sm:w-full text-left rounded-md border p-1.5 text-[10px] ${i === n && !mestre ? 'border-sky-400 bg-sky-500/10' : 'border-slate-700 bg-slate-950'}`}>
            <span className="text-slate-500">{i + 1}</span> <span className="text-slate-200 font-bold line-clamp-2">{x.titulo}</span>
          </button>
        ))}
        <button onClick={() => setMestre(true)} className={`shrink-0 w-24 sm:w-full rounded-md border p-1.5 text-[10px] font-bold ${mestre ? 'border-amber-400 bg-amber-500/10 text-amber-200' : 'border-slate-700 text-slate-400'}`}>Slide mestre</button>
      </div>
      <div className="space-y-2 min-w-0">
        {mestre ? (
          <div className={`${CAIXA} p-4 space-y-1.5`}>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-300">Slide mestre</div>
            {([['Fundo', a.mestre.fundo], ['Fonte', a.mestre.fonte], ['Rodapé', a.mestre.rodape], ['Numeração de slides', a.mestre.numeracao ? 'ativada' : 'desativada']] as const).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm border-b border-slate-800/70 py-0.5"><span className="text-slate-400">{k}</span><span className="text-slate-100">{v}</span></div>
            ))}
          </div>
        ) : (
          <>
            <div className="aspect-video rounded-lg bg-blue-700 text-white p-4 flex flex-col justify-between shadow-lg">
              <div>
                <div className={`font-black ${s.layout === 'Slide de título' ? 'text-2xl text-center mt-6' : 'text-lg'}`} style={{ fontFamily: a.mestre.fonte }}>{s.titulo}</div>
                <div className={`mt-2 text-sm ${s.layout === 'Duas colunas' ? 'grid grid-cols-2 gap-3' : s.layout === 'Slide de título' ? 'text-center' : ''}`}>
                  {s.itens.map((i) => <div key={i}>{s.layout === 'Título e conteúdo' || s.layout === 'Duas colunas' ? '• ' : ''}{i}</div>)}
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-blue-100"><span>{a.mestre.rodape}</span><span>{a.mestre.numeracao ? n + 1 : ''}</span></div>
            </div>
            <div className={`${CAIXA} p-3`} aria-live="polite">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Slide {n + 1} · propriedades</div>
              {([['Layout', s.layout], ['Transição', s.transicao], ['Animação', s.animacao]] as const).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm border-b border-slate-800/70 last:border-0 py-0.5"><span className="text-slate-400">{k}</span><span className="text-slate-100">{v}</span></div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
