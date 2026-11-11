import React, { useEffect, useMemo, useState } from 'react';
import { Check, Clipboard, Download, Printer, QrCode } from 'lucide-react';
import { Mission } from '../types';
import { buildTagLink } from '../utils/tagLink';

interface TagLabelsProps {
  /** missões disponíveis (já filtradas por pacote/busca no catálogo) */
  missions: Mission[];
}

const defaultBase = () => (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '');

export const TagLabels: React.FC<TagLabelsProps> = ({ missions }) => {
  const [base, setBase] = useState(defaultBase);
  const [qty, setQty] = useState(missions.length);
  const [qrs, setQrs] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => setQty((q) => Math.min(Math.max(1, q), Math.max(1, missions.length))), [missions.length]);

  const chosen = useMemo(() => missions.slice(0, Math.max(0, Math.min(qty, missions.length))), [missions, qty]);
  const linkOf = (m: Mission) => buildTagLink(base, m.tag_id);

  // QR gerado no navegador, só quando esta tela abre
  useEffect(() => {
    let alive = true;
    (async () => {
      const { default: QRCode } = await import('qrcode');
      const entries = await Promise.all(
        chosen.map(async (m) => [m.tag_id, await QRCode.toDataURL(buildTagLink(base, m.tag_id), { margin: 1, width: 240, errorCorrectionLevel: 'M' })] as const)
      );
      if (alive) setQrs(Object.fromEntries(entries));
    })().catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [chosen, base]);

  const linesText = chosen.map((m) => `${m.tag_id}\t${linkOf(m)}`).join('\n');

  const copyLinks = async () => {
    try {
      await navigator.clipboard.writeText(linesText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const downloadCsv = () => {
    const csv = ['tag,link,categoria,xp', ...chosen.map((m) => `${m.tag_id},${linkOf(m)},${m.category},${m.xp_valor}`)].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tags_rali.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <style>{`@media print { body * { visibility: hidden !important; } #tag-labels, #tag-labels * { visibility: visible !important; } #tag-labels { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Endereço do app (vai dentro de cada tag e QR)
            <input
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white normal-case tracking-normal focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Quantas tags
            <input
              type="number"
              min={1}
              max={missions.length}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 1)}
              className="mt-1.5 w-28 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={copyLinks} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />} Copiar lista de links
          </button>
          <button onClick={downloadCsv} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2">
            <Download className="w-4 h-4" /> Baixar CSV
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2">
            <Printer className="w-4 h-4" /> Imprimir etiquetas
          </button>
        </div>

        <div className="text-xs text-slate-300 leading-relaxed bg-amber-950/30 border border-amber-500/30 rounded-xl p-3">
          <strong className="text-amber-300">Gravar no NFC Tools:</strong> Escrever → Adicionar registro → <strong>URL/URI</strong> → cole o link da tag → Escrever → encoste a NTAG213.
          Depois é só encostar o celular na tag, sem abrir o app antes: o Android abre direto na missão (e o iPhone também). Cole a etiqueta com QR ao lado da tag como reserva.
        </div>
      </div>

      <div id="tag-labels" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {chosen.map((m) => (
          <div key={m.tag_id} className="bg-white text-slate-900 rounded-xl border-2 border-dashed border-slate-400 p-3 flex flex-col items-center gap-1.5 print:break-inside-avoid">
            {qrs[m.tag_id] ? (
              <img src={qrs[m.tag_id]} alt={`QR da ${m.tag_id}`} className="w-full max-w-[140px] aspect-square" />
            ) : (
              <div className="w-[140px] aspect-square flex items-center justify-center text-slate-300">
                <QrCode className="w-10 h-10" />
              </div>
            )}
            <span className="font-mono font-black text-lg text-emerald-700 leading-none">{m.tag_id}</span>
            <span className="text-[10px] font-bold uppercase text-slate-500">
              {m.category} • +{m.xp_valor} XP
            </span>
            <span className="text-[9px] text-slate-400">Rali IFSTB</span>
          </div>
        ))}
      </div>
    </div>
  );
};
