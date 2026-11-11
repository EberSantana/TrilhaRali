import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Clipboard, Database, Flag, Link2, Loader2, Lock, Plus, Power, RefreshCw, Settings, Trash2, Trophy, Unlock, Users } from 'lucide-react';
import { ALL_MISSIONS } from '../../data/missions';
import { CONSOLE_MISSIONS } from '../../data/consoleMissions';

// Todas as missões que a sala pode usar: as clássicas + as 50 resolvíveis no Console SQLite
const CTF_POOL = [...CONSOLE_MISSIONS, ...ALL_MISSIONS];
const isConsolePackage = (id: string) => id.startsWith('console_');
import { CTF_APPS_SCRIPT } from '../../data/ctfAppsScript';
import { CtfProjector } from './CtfProjector';
import { CtfMissionPayload, CtfStoredRoom, CtfTeacherView } from '../../types/ctf';
import { ScoringMode } from '../../types';
import {
  buildStudentLink,
  ctfCall,
  getCtfApiUrl,
  getTeacherRooms,
  explainInvalidApiUrl,
  isValidApiUrl,
  saveCtfApiUrl,
  saveTeacherRooms,
} from '../../utils/ctfApi';
import { DEFAULT_CTF_API_URL } from '../../config';
import { BankQuestion } from '../../types/bank';
import { bankToCtfPayload } from '../../utils/bank';
import { getBancoKey, listBanco } from '../../utils/bankApi';

const POLL_MS = 10_000;

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
  };
  return { copied, copy };
}

export const CtfTeacher: React.FC = () => {
  const { copied, copy } = useCopy();
  const [apiUrl, setApiUrl] = useState(getCtfApiUrl);
  const [showSetup, setShowSetup] = useState(() => !getCtfApiUrl());
  const [rooms, setRooms] = useState<CtfStoredRoom[]>(getTeacherRooms);
  const [activeToken, setActiveToken] = useState<string | null>(() => getTeacherRooms()[0]?.token ?? null);
  const [view, setView] = useState<CtfTeacherView | null>(null);
  const [projecting, setProjecting] = useState(false);
  const [monitorError, setMonitorError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Formulário de nova sala
  const [nome, setNome] = useState('');
  const [modo, setModo] = useState<ScoringMode>('ctf_dynamic');
  const [bancoLiberado, setBancoLiberado] = useState(false);
  const packages = useMemo(() => {
    const map = new Map<string, { id: string; nome: string; count: number }>();
    CTF_POOL.forEach((m) => {
      const cur = map.get(m.package) || { id: m.package, nome: m.packageName, count: 0 };
      cur.count++;
      map.set(m.package, cur);
    });
    return Array.from(map.values());
  }, []);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(packages.filter((p) => isConsolePackage(p.id)).map((p) => p.id)));
  // Perguntas do banco do professor (Google Sheets), escolhidas por disciplina
  const [bank, setBank] = useState<BankQuestion[]>([]);
  const [bankMsg, setBankMsg] = useState('');
  const [bankDiscs, setBankDiscs] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!getBancoKey()) {
      setBankMsg('Conecte o banco em Professor → Banco de perguntas para usar as suas perguntas aqui.');
      return;
    }
    listBanco()
      .then((list) => setBank(list.filter((q) => q.ativo)))
      .catch((e) => setBankMsg(e instanceof Error ? e.message : String(e)));
  }, []);
  const bankByDisc = useMemo(() => {
    const m = new Map<string, number>();
    bank.forEach((q) => m.set(q.disciplina, (m.get(q.disciplina) || 0) + 1));
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
  }, [bank]);
  const bankPool = useMemo(() => bank.filter((q) => bankDiscs.has(q.disciplina)), [bank, bankDiscs]);
  const totalPhases = CTF_POOL.filter((m) => selected.has(m.package)).length + bankPool.length;

  const activeRoom = rooms.find((r) => r.token === activeToken) || null;

  const persistRooms = (next: CtfStoredRoom[]) => {
    setRooms(next);
    saveTeacherRooms(next);
  };

  const handleSaveApi = () => {
    if (!isValidApiUrl(apiUrl)) {
      setError(explainInvalidApiUrl(apiUrl));
      return;
    }
    saveCtfApiUrl(apiUrl);
    setError('');
    setShowSetup(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiUrl || !isValidApiUrl(apiUrl)) {
      setError(apiUrl ? explainInvalidApiUrl(apiUrl) : 'Configure primeiro a URL do backend (Google Apps Script).');
      setShowSetup(true);
      return;
    }
    if (totalPhases === 0) {
      setError('Selecione ao menos um pacote de missões.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const missions: CtfMissionPayload[] = CTF_POOL.filter((m) => selected.has(m.package)).map((m) => ({
        tag_id: m.tag_id,
        categoria: m.category,
        pacote: m.packageName,
        pergunta: m.pergunta,
        resposta: m.resposta_curta,
        alternativas: m.alternatives || [],
        xp: m.xp_valor,
      }));
      missions.push(...bankPool.map(bankToCtfPayload));
      const res = await ctfCall<{ token: string; adminKey: string }>(
        'createRoom',
        { nome: nome.trim() || `CTF ${new Date().toLocaleDateString('pt-BR')}`, modo, missions, bancoLiberado },
        apiUrl
      );
      const stored: CtfStoredRoom = {
        token: res.token,
        adminKey: res.adminKey,
        nome: nome.trim() || `CTF ${new Date().toLocaleDateString('pt-BR')}`,
        api: apiUrl,
        criada: Date.now(),
      };
      persistRooms([stored, ...rooms]);
      setActiveToken(stored.token);
      setNome('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const loadView = useCallback(async () => {
    if (!activeRoom) return;
    try {
      const v = await ctfCall<CtfTeacherView>('teacherRoom', { token: activeRoom.token, adminKey: activeRoom.adminKey }, activeRoom.api);
      setView(v);
      setMonitorError('');
    } catch (err) {
      setMonitorError(err instanceof Error ? err.message : String(err));
    }
  }, [activeRoom]);

  useEffect(() => {
    setView(null);
    if (!activeRoom) return;
    loadView();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') loadView();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [activeRoom, loadView]);

  const toggleStatus = async () => {
    if (!activeRoom || !view) return;
    const next = view.sala.status === 'aberta' ? 'encerrada' : 'aberta';
    if (next === 'encerrada' && !window.confirm('Encerrar a sala? Os alunos não poderão mais enviar respostas.')) return;
    try {
      await ctfCall('setStatus', { token: activeRoom.token, adminKey: activeRoom.adminKey, status: next }, activeRoom.api);
      loadView();
    } catch (err) {
      setMonitorError(err instanceof Error ? err.message : String(err));
    }
  };

  const toggleBanco = async () => {
    if (!activeRoom || !view) return;
    try {
      await ctfCall('setBanco', { token: activeRoom.token, adminKey: activeRoom.adminKey, liberado: !view.sala.banco }, activeRoom.api);
      loadView();
    } catch (err) {
      setMonitorError(err instanceof Error ? err.message : String(err));
    }
  };

  const forgetRoom = (token: string) => {
    if (!window.confirm('Remover esta sala da lista deste navegador? (Os dados continuam na planilha.)')) return;
    const next = rooms.filter((r) => r.token !== token);
    persistRooms(next);
    if (activeToken === token) setActiveToken(next[0]?.token ?? null);
  };

  const inviteLink = activeRoom ? buildStudentLink(activeRoom.token, activeRoom.api) : '';
  const siteLink = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/ctf` : '';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Backend */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <button onClick={() => setShowSetup((v) => !v)} className="w-full flex items-center justify-between text-left">
          <span className="font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-sky-400" /> Servidor do CTF (Google Apps Script)
            {isValidApiUrl(apiUrl) ? (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">configurado</span>
            ) : (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">pendente</span>
            )}
          </span>
          <span className="text-xs text-slate-400">{showSetup ? 'ocultar' : 'mostrar'}</span>
        </button>

        {showSetup && (
          <div className="space-y-4 pt-2 border-t border-slate-800 text-sm text-slate-300">
            <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-400">
              <li>Crie uma planilha Google <strong>nova</strong> (separada da do Rali NFC) e abra <em>Extensões &gt; Apps Script</em>.</li>
              <li>Apague o código e cole o script abaixo.</li>
              <li><em>Implantar &gt; Nova implantação &gt; Aplicativo da Web</em>: executar como <strong>Eu</strong>, acesso <strong>Qualquer pessoa</strong>.</li>
              <li>Copie a URL do Web App (termina em <code>/exec</code>) e cole aqui.</li>
            </ol>
            <button
              onClick={() => copy('script', CTF_APPS_SCRIPT)}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold flex items-center gap-2"
            >
              {copied === 'script' ? <Check className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />} Copiar script do servidor
            </button>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <button onClick={handleSaveApi} className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold">
                Salvar URL
              </button>
            </div>
            {!DEFAULT_CTF_API_URL && (
              <p className="text-[11px] text-slate-500">
                Para os alunos digitarem só o token (sem link de convite), coloque esta URL em <code>DEFAULT_CTF_API_URL</code> no arquivo <code>src/config.ts</code> do projeto e publique.
              </p>
            )}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nova sala */}
        <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 h-fit">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-orange-400" /> Nova sala CTF
          </h3>
          <label className="block space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Nome da sala</span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Turma 2026.1 - SQL"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </label>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pontuação</span>
            <div className="grid grid-cols-2 gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
              {(['ctf_dynamic', 'fixed'] as ScoringMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModo(m)}
                  className={`px-2 py-2 rounded-lg text-xs font-bold transition ${modo === m ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {m === 'ctf_dynamic' ? '🔥 CTF Dinâmico' : 'XP fixo'}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm text-slate-200 bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 cursor-pointer">
            <input type="checkbox" checked={bancoLiberado} onChange={(e) => setBancoLiberado(e.target.checked)} className="accent-orange-500 mt-1" />
            <span>
              Liberar o banco de dados e o console SQLite já na entrada
              <span className="block text-[11px] text-slate-500">Desmarcado: os alunos só veem o console e o download quando você liberar.</span>
            </span>
          </label>

          <fieldset className="space-y-1.5">
            <legend className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Fases (uma missão por fase, em ordem): {totalPhases}
            </legend>
            <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
              {packages.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm text-slate-200 bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={(e) => {
                      const next = new Set(selected);
                      if (e.target.checked) next.add(p.id);
                      else next.delete(p.id);
                      setSelected(next);
                    }}
                    className="accent-orange-500"
                  />
                  <span className="flex-1 truncate">{p.nome}</span>
                  <span className="text-xs font-mono text-slate-500">{p.count}</span>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Os pacotes “Console” (50 fases) são resolvidos inteiramente no Console SQLite. Os demais são as missões clássicas; “Subconjuntos SQL” depende de um diagrama no quadro.
            </p>
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Do meu banco de perguntas</div>
              {bankByDisc.length > 0 ? (
                <div className="space-y-1">
                  {bankByDisc.map(([d, n]) => (
                    <label key={d} className="flex items-center gap-2 text-sm text-slate-200 bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bankDiscs.has(d)}
                        onChange={(e) => {
                          const next = new Set(bankDiscs);
                          if (e.target.checked) next.add(d);
                          else next.delete(d);
                          setBankDiscs(next);
                        }}
                        className="accent-orange-500"
                      />
                      <span className="flex-1 truncate">{d}</span>
                      <span className="text-xs font-mono text-slate-500">{n}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">{bankMsg || 'Seu banco não tem perguntas ativas ainda.'}</p>
              )}
            </div>
            {!bancoLiberado && [...selected].some(isConsolePackage) && (
              <p className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
                Atenção: os pacotes “Console” precisam do console liberado. Marque a opção de liberar o banco abaixo, ou use o botão “Banco” no monitor depois.
              </p>
            )}
          </fieldset>

          {error && <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-lg p-2.5">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl font-black bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Flag className="w-5 h-5" />} CRIAR SALA E GERAR TOKEN
          </button>
        </form>

        {/* Monitoramento */}
        <div className="lg:col-span-2 space-y-4">
          {rooms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {rooms.map((r) => (
                <button
                  key={r.token}
                  onClick={() => setActiveToken(r.token)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    r.token === activeToken ? 'bg-orange-600/20 border-orange-500 text-orange-200' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-mono">{r.token}</span> • {r.nome}
                </button>
              ))}
            </div>
          )}

          {!activeRoom ? (
            <div className="bg-slate-900/60 border border-dashed border-slate-700 rounded-2xl p-10 text-center text-slate-400 text-sm">
              Crie uma sala para gerar o token. Os alunos abrem <span className="font-mono text-slate-300">{siteLink || '…/#/ctf'}</span>, digitam o token e o nome e começam na fase 1.
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Token da sala • {activeRoom.nome}</div>
                  <div className="text-5xl font-mono font-black tracking-[0.25em] text-orange-300 select-all">{activeRoom.token}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => copy('token', activeRoom.token)} className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold flex items-center gap-1.5">
                    {copied === 'token' ? <Check className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />} Token
                  </button>
                  <button onClick={() => copy('link', inviteLink)} className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold flex items-center gap-1.5">
                    {copied === 'link' ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />} Link de convite
                  </button>
                  <button
                    onClick={toggleBanco}
                    disabled={!view}
                    className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border disabled:opacity-50 ${
                      view?.sala.banco ? 'bg-sky-600/20 border-sky-500 text-sky-200 hover:bg-sky-600/30' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                    title="Mostra ou esconde o console SQLite e o download do banco para os alunos"
                  >
                    <Database className="w-4 h-4" /> Banco: {view?.sala.banco ? 'liberado' : 'oculto'}
                  </button>
                  <button
                    onClick={() => setProjecting(true)}
                    className="px-3 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500 text-amber-200 text-xs font-bold flex items-center gap-1.5"
                    title="Abre o top 5 em tela cheia para projetar"
                  >
                    <Trophy className="w-4 h-4" /> Projetar ranking
                  </button>
                  <button onClick={loadView} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700" title="Atualizar agora" aria-label="Atualizar">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleStatus}
                    disabled={!view}
                    className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 text-white ${
                      view?.sala.status === 'encerrada' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                    } disabled:opacity-50`}
                  >
                    {view?.sala.status === 'encerrada' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {view?.sala.status === 'encerrada' ? 'Reabrir' : 'Encerrar'}
                  </button>
                  <button onClick={() => forgetRoom(activeRoom.token)} className="p-2 rounded-lg text-slate-500 hover:text-rose-300 hover:bg-slate-800 border border-slate-800" title="Remover da lista" aria-label="Remover da lista">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Alunos entram em <span className="font-mono text-slate-200">{siteLink}</span> com este token e o próprio nome.
                {view && (
                  <span className={`ml-2 inline-flex items-center gap-1 font-bold ${view.sala.status === 'aberta' ? 'text-emerald-400' : 'text-red-400'}`}>
                    <Power className="w-3 h-3" /> {view.sala.status === 'aberta' ? 'sala aberta' : 'sala encerrada'}
                  </span>
                )}
              </p>

              {monitorError && <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-lg p-2.5">{monitorError}</p>}

              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Users className="w-4 h-4 text-emerald-400" /> {view ? view.alunos.length : '…'} {view?.alunos.length === 1 ? 'aluno' : 'alunos'} • {view?.sala.total ?? '…'} fases
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-sm">
                  <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="text-left px-3 py-2">#</th>
                      <th className="text-left px-3 py-2">Aluno</th>
                      <th className="text-left px-3 py-2 min-w-[140px]">Progresso</th>
                      <th className="text-right px-3 py-2">XP</th>
                      <th className="text-right px-3 py-2">🔥</th>
                      <th className="text-right px-3 py-2">Erros</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(view?.alunos ?? []).map((a, i) => {
                      const total = view!.sala.total;
                      const done = Math.min(a.fase_atual - 1, total);
                      return (
                        <tr key={`${a.nome}-${i}`} className="hover:bg-slate-950/50">
                          <td className="px-3 py-2 font-mono text-slate-500">{i + 1}</td>
                          <td className="px-3 py-2 font-semibold text-slate-100">{a.nome}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${(done / total) * 100}%` }} />
                              </div>
                              <span className="font-mono text-xs text-slate-400 w-12 text-right">
                                {done}/{total}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-emerald-300">{a.xp}</td>
                          <td className="px-3 py-2 text-right font-mono text-orange-300">{a.fogos || ''}</td>
                          <td className="px-3 py-2 text-right font-mono text-rose-300">{a.erros}</td>
                        </tr>
                      );
                    })}
                    {view && view.alunos.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                          Aguardando os alunos entrarem com o token…
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-500">Atualiza sozinho a cada 10 segundos. A chave de administração desta sala fica salva só neste navegador.</p>
            </div>
          )}
        </div>
      </div>
      {projecting && activeRoom && <CtfProjector room={activeRoom} siteLink={siteLink} onClose={() => setProjecting(false)} />}
    </div>
  );
};
