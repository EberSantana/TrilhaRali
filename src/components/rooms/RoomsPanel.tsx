import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Clipboard, Database, Download, Flag, Link2, Loader2, Lock, MonitorPlay, Plus, Power, Radio, RefreshCw, Trash2, Unlock, Users } from 'lucide-react';
import { useMissions } from '../../utils/missionsStore';
import { RoomProjector } from './RoomProjector';
import { BackendSetup } from './BackendSetup';
import { CtfMissionPayload, CtfStoredRoom, CtfTeacherView, RoomTipo } from '../../types/ctf';
import { ScoringMode } from '../../types';
import { buildStudentLink, ctfCall, explainInvalidApiUrl, getCtfApiUrl, getTeacherRooms, isValidApiUrl, saveTeacherRooms } from '../../utils/ctfApi';
import { BankQuestion } from '../../types/bank';
import { bankToCtfPayload, takeCtfPrefill } from '../../utils/bank';
import { BankPicker } from '../bank/BankPicker';
import { getBancoKey, listBanco } from '../../utils/bankApi';
import { TimerControl } from '../common/TimerControl';
import { TimerOp } from '../../utils/timer';
import { Btn, QrImage, StepTitle } from '../common/ui';

const POLL_MS = 10_000;

const COPY: Record<RoomTipo, { nome: string; tagline: string; plural: string; singular: string; unidade: string; entrada: string }> = {
  rali: {
    nome: 'Rali NFC',
    tagline: 'Equipes pelo laboratório: cada equipe lê as etiquetas e resolve as missões em qualquer ordem.',
    plural: 'equipes',
    singular: 'equipe',
    unidade: 'missões',
    entrada: 'com o token da sala e o nome da equipe',
  },
  ctf: {
    nome: 'CTF Online',
    tagline: 'Alunos individuais: cada um avança de fase resolvendo a fase atual.',
    plural: 'alunos',
    singular: 'aluno',
    unidade: 'fases',
    entrada: 'com o token da sala e o próprio nome',
  },
};

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
  };
  return { copied, copy };
}

interface RoomsPanelProps {
  tipo: RoomTipo;
  onBack: () => void;
  /** atalhos extras do ambiente (ex.: etiquetas NFC, modo local) */
  tools?: React.ReactNode;
}

/**
 * Painel do professor de UM ambiente (Rali NFC ou CTF Online), sempre no mesmo roteiro:
 * 1 Perguntas · 2 Turma · 3 Ao vivo · 4 Resultados. Os dois ambientes compartilham o banco de perguntas.
 */
export const RoomsPanel: React.FC<RoomsPanelProps> = ({ tipo, onBack, tools }) => {
  const txt = COPY[tipo];
  const nfc = tipo === 'rali';
  const tone = nfc ? 'emerald' : 'orange';
  const { copied, copy } = useCopy();
  const [apiUrl, setApiUrl] = useState(getCtfApiUrl);
  const [showSetup, setShowSetup] = useState(() => !getCtfApiUrl());
  const [allRooms, setAllRooms] = useState<CtfStoredRoom[]>(getTeacherRooms);
  const rooms = useMemo(() => allRooms.filter((r) => (r.tipo ?? 'ctf') === tipo), [allRooms, tipo]);
  const [activeToken, setActiveToken] = useState<string | null>(() => getTeacherRooms().find((r) => (r.tipo ?? 'ctf') === tipo)?.token ?? null);
  const [view, setView] = useState<CtfTeacherView | null>(null);
  const [projecting, setProjecting] = useState(false);
  const [monitorError, setMonitorError] = useState('');
  const [timerBusy, setTimerBusy] = useState(false);
  const [timerError, setTimerError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Passo 1: perguntas
  const [nome, setNome] = useState('');
  const [modo, setModo] = useState<ScoringMode>('ctf_dynamic');
  const catalog = useMissions();
  const pool = useMemo(
    () => catalog.map((m) => ({ package: m.package as string, packageName: m.packageName, m })),
    [catalog]
  );
  const packages = useMemo(() => {
    const map = new Map<string, { id: string; nome: string; count: number }>();
    pool.forEach((p) => {
      const cur = map.get(p.package) || { id: p.package, nome: p.packageName, count: 0 };
      cur.count++;
      map.set(p.package, cur);
    });
    return Array.from(map.values());
  }, [pool]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    // os dois ambientes começam com todo o catálogo marcado
    setSelected(new Set(packages.map((p) => p.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, packages.length]);

  const [bank, setBank] = useState<BankQuestion[]>([]);
  const [bankMsg, setBankMsg] = useState('');
  const [bankSel, setBankSel] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!getBancoKey()) {
      setBankMsg('Conecte o banco de perguntas em Professor → Banco de perguntas para usar as suas perguntas aqui.');
      return;
    }
    listBanco()
      .then((list) => {
        setBank(list);
        if (!nfc) {
          // Seleção vinda do Banco de perguntas ("CTF Online")
          const pre = new Set(takeCtfPrefill().filter((id) => list.some((q) => q.id === id)));
          if (pre.size) {
            setBankSel(pre);
            setSelected(new Set());
          }
        }
      })
      .catch((e) => setBankMsg(e instanceof Error ? e.message : String(e)));
  }, [nfc]);
  const bankPool = useMemo(() => bank.filter((q) => bankSel.has(q.id)), [bank, bankSel]);
  const chosen = pool.filter((p) => selected.has(p.package));
  const total = chosen.length + bankPool.length;

  const activeRoom = rooms.find((r) => r.token === activeToken) || null;
  const persist = (next: CtfStoredRoom[]) => {
    setAllRooms(next);
    saveTeacherRooms(next);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiUrl || !isValidApiUrl(apiUrl)) {
      setError(apiUrl ? explainInvalidApiUrl(apiUrl) : 'Configure primeiro a URL do servidor (Google Apps Script).');
      setShowSetup(true);
      return;
    }
    if (total === 0) {
      setError('Selecione ao menos uma pergunta.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const missions: CtfMissionPayload[] = chosen.map(({ m }) => ({
        tag_id: m.tag_id,
        categoria: 'category' in m ? m.category : '',
        pacote: m.packageName,
        pergunta: m.pergunta,
        resposta: m.resposta_curta,
        alternativas: m.alternatives || [],
        xp: m.xp_valor,
        ...(nfc && m.opcoes?.length ? { opcoes: m.opcoes } : {}),
      }));
      missions.push(...bankPool.map(bankToCtfPayload));
      const nomeSala = nome.trim() || `${txt.nome} ${new Date().toLocaleDateString('pt-BR')}`;
      const res = await ctfCall<{ token: string; adminKey: string; tipo?: string }>('createRoom', { nome: nomeSala, modo, missions, bancoLiberado: false, tipo }, apiUrl);
      if (nfc && res.tipo !== 'rali') {
        throw new Error('O servidor está numa versão antiga e criou uma sala de CTF. Atualize o script do Apps Script (versão 6) e publique uma nova versão.');
      }
      const stored: CtfStoredRoom = { tipo, token: res.token, adminKey: res.adminKey, nome: nomeSala, api: apiUrl, criada: Date.now() };
      persist([stored, ...allRooms]);
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
    if (next === 'encerrada' && !window.confirm(`Encerrar a sala? ${nfc ? 'As equipes' : 'Os alunos'} não poderão mais enviar respostas e o resultado final será exibido.`)) return;
    try {
      await ctfCall('setStatus', { token: activeRoom.token, adminKey: activeRoom.adminKey, status: next }, activeRoom.api);
      loadView();
    } catch (err) {
      setMonitorError(err instanceof Error ? err.message : String(err));
    }
  };

  const skewMs = useMemo(() => (view?.sala.agora ? Date.now() - view.sala.agora : 0), [view]);
  const handleTimer = async (op: TimerOp, minutos?: number) => {
    if (!activeRoom) return;
    if (op === 'off' && !window.confirm('Desligar o cronômetro? A sala fica sem limite de tempo.')) return;
    setTimerBusy(true);
    setTimerError('');
    try {
      const r = await ctfCall<Pick<CtfTeacherView, 'sala'>>('setTimer', { token: activeRoom.token, adminKey: activeRoom.adminKey, op, minutos }, activeRoom.api);
      setView((v) => (v ? { ...v, sala: r.sala } : v));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setTimerError(/desconhecida/i.test(msg) ? 'O servidor desta sala é de uma versão anterior. Atualize o código do Apps Script e publique uma nova versão.' : msg);
    } finally {
      setTimerBusy(false);
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
    persist(allRooms.filter((r) => r.token !== token));
    if (activeToken === token) setActiveToken(rooms.find((r) => r.token !== token)?.token ?? null);
  };

  const downloadCsv = () => {
    if (!view || !activeRoom) return;
    // Planilhas executam células que começam com = + - @ : o apóstrofo as mantém como texto
    const esc = (v: string | number) => `"${String(v).replace(/^([=+\-@])/, "'$1").replace(/"/g, '""')}"`;
    const head = [txt.singular, ...(nfc ? ['integrantes'] : []), 'posicao', 'xp', nfc ? 'missoes_resolvidas' : 'fases_concluidas', 'erros', 'fogos'];
    const lines = view.alunos.map((a, i) =>
      [a.nome, ...(nfc ? [(a.integrantes || []).join('; ')] : []), i + 1, a.xp, nfc ? a.acertos : Math.min(a.fase_atual - 1, view.sala.total), a.erros, a.fogos].map(esc).join(',')
    );
    const blob = new Blob(['﻿' + [head.map(esc).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `resultado-${tipo}-${activeRoom.token}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const inviteLink = activeRoom ? buildStudentLink(activeRoom.token, activeRoom.api, tipo) : '';
  const siteLink = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/${tipo}` : '';
  const Icon = nfc ? Radio : Flag;
  const accentText = nfc ? 'text-emerald-300' : 'text-orange-300';
  const input = `w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 ${nfc ? 'focus:ring-emerald-500' : 'focus:ring-orange-500'}`;
  const accentCheck = nfc ? 'accent-emerald-600' : 'accent-orange-500';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <header className="space-y-3">
        <Btn variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>Painel do professor</Btn>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${nfc ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-orange-500/10 border-orange-500/30 text-orange-300'}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{txt.nome} · painel do professor</h1>
              <p className="text-sm text-slate-400 max-w-2xl">{txt.tagline}</p>
            </div>
          </div>
          {tools && <div className="flex flex-wrap items-center gap-2">{tools}</div>}
        </div>
        <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs" aria-label="Roteiro da aula">
          {['Perguntas', 'Turma', 'Ao vivo', 'Resultados'].map((l, i) => (
            <li key={l} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 font-bold text-slate-300">
              <span className={`w-5 h-5 rounded-full text-[11px] font-black text-white flex items-center justify-center ${nfc ? 'bg-emerald-600' : 'bg-orange-600'}`}>{i + 1}</span>
              {l}
            </li>
          ))}
        </ol>
      </header>

      <BackendSetup apiUrl={apiUrl} onApiUrl={setApiUrl} open={showSetup} onToggle={() => setShowSetup((v) => !v)} onError={setError} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1 · Perguntas e nova sala */}
        <form onSubmit={handleCreate} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4 h-fit">
          <StepTitle n={1} title="Perguntas e nova sala" hint="Escolha o conteúdo e gere o token." tone={tone} />
          <label className="block space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Nome da sala</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Turma 2026.1 · Banco de Dados" className={input} />
          </label>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pontuação</span>
            <div className="grid grid-cols-2 gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1" role="radiogroup" aria-label="Pontuação">
              {(['ctf_dynamic', 'fixed'] as ScoringMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={modo === m}
                  onClick={() => setModo(m)}
                  className={`px-2 py-2 rounded-lg text-xs font-bold transition ${modo === m ? (nfc ? 'bg-emerald-600 text-white' : 'bg-orange-600 text-white') : 'text-slate-400 hover:text-white'}`}
                >
                  {m === 'ctf_dynamic' ? '🔥 CTF Dinâmico' : 'XP fixo'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              {modo === 'ctf_dynamic' ? 'Quanto mais participantes resolvem a mesma missão, menos ela vale (mínimo 40%). Quem resolve primeiro ganha 🔥.' : 'Cada missão vale sempre o XP original.'}
            </p>
          </div>

          <fieldset className="space-y-1.5">
            <legend className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Missões do catálogo: {total}
            </legend>
            <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
              {packages.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm text-slate-200 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={(e) => {
                      const next = new Set(selected);
                      if (e.target.checked) next.add(p.id);
                      else next.delete(p.id);
                      setSelected(next);
                    }}
                    className={accentCheck}
                  />
                  <span className="flex-1 truncate">{p.nome}</span>
                  <span className="text-xs font-mono text-slate-500">{p.count}</span>
                </label>
              ))}
            </div>
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Do meu banco de perguntas {bankPool.length > 0 && <span className={accentText}>· {bankPool.length} escolhida(s)</span>}
              </div>
              {bank.length > 0 ? (
                <BankPicker questions={bank} selected={bankSel} onChange={setBankSel} accent={nfc ? 'emerald' : 'orange'} />
              ) : (
                <p className="text-[11px] text-slate-500">{bankMsg || 'Seu banco de perguntas está vazio.'}</p>
              )}
            </div>
          </fieldset>

          {error && <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-lg p-2.5">{error}</p>}

          <Btn type="submit" size="lg" variant={nfc ? 'primary' : 'orange'} disabled={busy} className="w-full" icon={busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}>
            Criar sala e gerar token
          </Btn>
        </form>

        {/* 2 · Turma · 3 · Ao vivo · 4 · Resultados */}
        <div className="lg:col-span-2 space-y-4">
          {rooms.length > 0 && (
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Salas">
              {rooms.map((r) => (
                <button
                  key={r.token}
                  role="tab"
                  aria-selected={r.token === activeToken}
                  onClick={() => setActiveToken(r.token)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    r.token === activeToken
                      ? nfc ? 'bg-emerald-600/15 border-emerald-500 text-emerald-200' : 'bg-orange-600/15 border-orange-500 text-orange-200'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-mono">{r.token}</span> · {r.nome}
                </button>
              ))}
            </div>
          )}

          {!activeRoom ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-10 text-center text-sm text-slate-400">
              Crie uma sala para gerar o token. {nfc ? 'As equipes' : 'Os alunos'} abrem <span className="font-mono text-slate-300">{siteLink || `…/#/${tipo}`}</span>, digitam o token e {nfc ? 'o nome da equipe' : 'o nome'} e começam.
            </div>
          ) : (
            <>
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4" aria-label="Turma">
                <StepTitle n={2} title="Turma" hint={`Passe o token, o link ou o QR code para ${nfc ? 'as equipes' : 'os alunos'}.`} tone={tone} />
                <div className="flex flex-wrap items-center justify-between gap-5">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Token · {activeRoom.nome}</div>
                    <div className={`text-5xl font-mono font-black tracking-[0.25em] select-all ${accentText}`}>{activeRoom.token}</div>
                    <p className="mt-2 text-xs text-slate-400">
                      Entrar em <span className="font-mono text-slate-200">{siteLink}</span> {txt.entrada}.
                      {view && (
                        <span className={`ml-2 inline-flex items-center gap-1 font-bold ${view.sala.status === 'aberta' ? 'text-emerald-400' : 'text-red-400'}`}>
                          <Power className="w-3 h-3" /> {view.sala.status === 'aberta' ? 'sala aberta' : 'sala encerrada'}
                        </span>
                      )}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Btn size="sm" onClick={() => copy('token', activeRoom.token)} icon={copied === 'token' ? <Check className="w-4 h-4 text-emerald-500" /> : <Clipboard className="w-4 h-4" />}>Copiar token</Btn>
                      <Btn size="sm" onClick={() => copy('link', inviteLink)} icon={copied === 'link' ? <Check className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4" />}>Copiar link de convite</Btn>
                      {!nfc && (
                        <Btn size="sm" disabled={!view} onClick={toggleBanco} icon={<Database className="w-4 h-4" />} title="Mostra ou esconde o console SQLite e o download do banco para os alunos">
                          Console SQL: {view?.sala.banco ? 'liberado' : 'oculto'}
                        </Btn>
                      )}
                      <Btn size="sm" variant="ghost" onClick={() => forgetRoom(activeRoom.token)} icon={<Trash2 className="w-4 h-4" />} title="Remover da lista deste navegador">Remover</Btn>
                    </div>
                  </div>
                  <QrImage text={inviteLink} size={132} label="QR code do convite" />
                </div>
              </section>

              <section className="space-y-3" aria-label="Ao vivo">
                <StepTitle n={3} title="Ao vivo" hint="Cronômetro, telão e controle da sala." tone={tone} />
                <TimerControl timer={view?.sala.timer} skewMs={skewMs} busy={timerBusy || !view} error={timerError} onOp={handleTimer} />
                <div className="flex flex-wrap items-center gap-2">
                  <Btn size="lg" variant={nfc ? 'primary' : 'orange'} onClick={() => setProjecting(true)} icon={<MonitorPlay className="w-5 h-5" />} title="Ranking e cronômetro em tela cheia">
                    Abrir telão
                  </Btn>
                  <Btn
                    size="lg"
                    variant={view?.sala.status === 'encerrada' ? 'primary' : 'danger'}
                    disabled={!view}
                    onClick={toggleStatus}
                    icon={view?.sala.status === 'encerrada' ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  >
                    {view?.sala.status === 'encerrada' ? 'Reabrir sala' : 'Encerrar sala'}
                  </Btn>
                  <Btn size="lg" onClick={loadView} icon={<RefreshCw className="w-5 h-5" />} aria-label="Atualizar agora">Atualizar</Btn>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4" aria-label="Resultados">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <StepTitle n={4} title="Resultados" hint="Ranking e andamento, atualizados sozinhos." tone={tone} />
                  <Btn size="sm" disabled={!view || view.alunos.length === 0} onClick={downloadCsv} icon={<Download className="w-4 h-4" />}>Baixar CSV</Btn>
                </div>
                {monitorError && <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-lg p-2.5">{monitorError}</p>}
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Users className={`w-4 h-4 ${nfc ? 'text-emerald-400' : 'text-orange-400'}`} /> {view ? view.alunos.length : '…'} {view?.alunos.length === 1 ? txt.singular : txt.plural} · {view?.sala.total ?? '…'} {txt.unidade}
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="text-left px-3 py-2">#</th>
                        <th className="text-left px-3 py-2">{nfc ? 'Equipe' : 'Aluno'}</th>
                        <th className="text-left px-3 py-2 min-w-[140px]">Progresso</th>
                        <th className="text-right px-3 py-2">XP</th>
                        <th className="text-right px-3 py-2">🔥</th>
                        <th className="text-right px-3 py-2">Erros</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {(view?.alunos ?? []).map((a, i) => {
                        const tot = Math.max(1, view!.sala.total);
                        const done = nfc ? Math.min(a.acertos, tot) : Math.min(a.fase_atual - 1, tot);
                        return (
                          <tr key={`${a.nome}-${i}`} className="hover:bg-slate-950/50">
                            <td className="px-3 py-2 font-mono text-slate-500">{i + 1}</td>
                            <td className="px-3 py-2">
                              <div className="font-semibold text-slate-100">{a.nome}</div>
                              {nfc && a.integrantes && a.integrantes.length > 0 && <div className="text-[11px] text-slate-400">{a.integrantes.join(', ')}</div>}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${(done / tot) * 100}%` }} />
                                </div>
                                <span className="font-mono text-xs text-slate-400 w-12 text-right">{done}/{tot}</span>
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
                            Aguardando {nfc ? 'as equipes' : 'os alunos'} entrarem com o token…
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-slate-500">Atualiza sozinho a cada 10 segundos. A chave de administração desta sala fica salva só neste navegador.</p>
              </section>
            </>
          )}
        </div>
      </div>
      {projecting && activeRoom && <RoomProjector room={activeRoom} tipo={tipo} inviteLink={inviteLink} onClose={() => setProjecting(false)} />}
    </div>
  );
};
