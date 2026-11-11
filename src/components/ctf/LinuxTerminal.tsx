import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'lucide-react';
import { complete, createShell, promptOf, runLine, type ShellState } from '../../utils/shell';

interface Line {
  prompt?: string;
  text: string;
}

const BANNER = 'Terminal Linux simulado — roda só no seu navegador, nada afeta o seu computador.\nDigite  help  para ver os comandos. TAB completa, ↑ ↓ mostram o histórico.';

/** Terminal Linux de brinquedo para a aula; liberado pelo professor, como o Console SQL. */
export function LinuxTerminal() {
  const shell = useRef<ShellState>(createShell());
  const [lines, setLines] = useState<Line[]>([{ text: BANNER }]);
  const [input, setInput] = useState('');
  const [prompt, setPrompt] = useState(() => promptOf(shell.current));
  const hist = useRef<{ i: number }>({ i: -1 });
  const box = useRef<HTMLDivElement>(null);
  const inp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const submit = () => {
    const cmd = input;
    const st = shell.current;
    const echo: Line = { prompt, text: cmd };
    if (!cmd.trim()) {
      setLines((l) => [...l, echo]);
      setInput('');
      return;
    }
    const r = runLine(st, cmd);
    setLines((l) => (r.clear ? [] : [...l, echo, ...(r.out ? [{ text: r.out.replace(/\n$/, '') }] : [])]));
    setPrompt(promptOf(st));
    setInput('');
    hist.current.i = -1;
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const st = shell.current;
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const h = st.history;
      if (!h.length) return;
      const cur = hist.current.i;
      const next = e.key === 'ArrowUp' ? (cur < 0 ? h.length - 1 : Math.max(0, cur - 1)) : cur < 0 ? -1 : cur + 1 >= h.length ? -1 : cur + 1;
      hist.current.i = next;
      setInput(next < 0 ? '' : h[next]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const r = complete(st, input);
      setInput(r.line);
      if (r.options.length > 1) setLines((l) => [...l, { prompt, text: input }, { text: r.options.join('  ') }]);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 sm:p-5" aria-label="Terminal Linux">
      <div className="mb-3 flex items-center gap-2">
        <Terminal className="h-4 w-4 text-emerald-400" />
        <h3 className="text-sm font-bold text-slate-100">Terminal Linux</h3>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">simulado</span>
      </div>
      <div
        ref={box}
        onClick={() => inp.current?.focus()}
        className="h-72 overflow-y-auto rounded-xl border border-[#1f2a26] bg-[#0b1210] p-3 font-mono text-[13px] leading-relaxed text-[#d7e6df]"
      >
        {lines.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">
            {l.prompt !== undefined && <span className="text-[#6ee7a8]">{l.prompt} </span>}
            {l.text}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[#6ee7a8]">{prompt}</span>
          <input
            ref={inp}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            aria-label="Comando"
            className="min-w-0 flex-1 bg-transparent font-mono text-[13px] text-[#d7e6df] caret-[#6ee7a8] outline-none"
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-400">Pratique comandos como ls, cd, cat, grep, chmod. Use reset para recomeçar.</p>
    </section>
  );
}
