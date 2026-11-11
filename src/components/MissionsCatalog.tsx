import React, { useState } from 'react';
import { 
  Tag, 
  Search, 
  Copy, 
  Check, 
  Printer, 
  Smartphone, 
  MapPin, 
  Sparkles, 
  ExternalLink,
  BookOpen,
  GraduationCap,
  Eye,
  EyeOff
} from 'lucide-react';
import { Mission, MissionPackage } from '../types';
import { useMissions } from '../utils/missionsStore';
import { IfsLogo } from './IfsLogo';
import { TagLabels } from './TagLabels';

export const MissionsCatalog: React.FC = () => {
  const missions = useMissions();
  const [selectedPackage, setSelectedPackage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [isPrintMode, setIsPrintMode] = useState<boolean>(false);
  const [showGabarito, setShowGabarito] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(false);

  const packages: { id: string; label: string; count: number }[] = [
    { id: 'all', label: `Todas as ${missions.length} Missões`, count: missions.length },
    { id: 'mvp', label: '1. MVP Base', count: missions.filter(m => m.package === 'mvp').length },
    { id: 'academia', label: '2. Academia (Modelagem)', count: missions.filter(m => m.package === 'academia').length },
    { id: 'crud16', label: '3. 16 Comandos CRUD', count: missions.filter(m => m.package === 'crud16').length },
    { id: 'biblioteca', label: '4. Biblioteca (JOINs)', count: missions.filter(m => m.package === 'biblioteca').length },
    { id: 'supermercado', label: '5. Supermercado (Boss V/F)', count: missions.filter(m => m.package === 'supermercado').length },
    { id: 'fechamento', label: '6. Fechamento (DTL/DCL)', count: missions.filter(m => m.package === 'fechamento').length },
    { id: 'joins', label: '7. Rali dos JOINs', count: missions.filter(m => m.package === 'joins').length },
    { id: 'dml', label: '8. Mutação DML', count: missions.filter(m => m.package === 'dml').length },
    { id: 'diagrama', label: '9. Subconjuntos SQL', count: missions.filter(m => m.package === 'diagrama').length },
    { id: 'banco', label: 'Meu banco (publicadas)', count: missions.filter(m => m.package === 'banco').length },
  ].filter((p) => p.id !== 'banco' || p.count > 0);

  const filteredMissions = missions.filter((m) => {
    const matchesPackage = selectedPackage === 'all' || m.package === selectedPackage;
    const matchesSearch =
      m.tag_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.pergunta.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.resposta_curta.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPackage && matchesSearch;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(text);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                IFS Campus Tobias Barreto
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Supervisão: Prof. Eber Santana
              </span>
              <span className="text-xs text-slate-400">• Missões Padronizadas NTAG213</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <span>Catálogo de missões</span>
              <Tag className="w-8 h-8 text-emerald-400" />
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Grave os IDs nas etiquetas NTAG213 usando o app NFC Tools e espalhe pelo laboratório de informática do IFS.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowGabarito(!showGabarito)}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition border ${
                showGabarito
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Ocultar respostas durante a dinâmica para não vazar spoiler aos alunos"
            >
              {showGabarito ? (
                <>
                  <EyeOff className="w-4 h-4 text-amber-400" />
                  <span>Ocultar Gabarito</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>Gabarito (Professor)</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition border ${
                showLabels ? 'bg-sky-600/20 text-sky-200 border-sky-500/50' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
              title="Gera o link e o QR de cada tag para gravar no NFC e imprimir"
            >
              <Smartphone className="w-4 h-4" />
              <span>{showLabels ? 'Voltar ao catálogo' : 'Etiquetas NFC/QR'}</span>
            </button>
            <button
              onClick={() => setIsPrintMode(!isPrintMode)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrintMode ? 'Modo Normal' : 'Cartões para Impressão'}</span>
            </button>
            {isPrintMode && (
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Agora</span>
              </button>
            )}
          </div>
        </div>

        {/* NFC Tools Quick Guide Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300">Como gravar as tags no app NFC Tools (Android/iOS):</strong>
              <span className="block mt-0.5 text-slate-300">
                1. Abra o NFC Tools &gt; 2. Toque em <strong>Escrever</strong> &gt; 3. Adicionar registro do tipo <strong>URL/URI</strong> &gt; 4. Cole o link da tag (botão <em>Etiquetas NFC/QR</em> gera todos) &gt; 5. Toque em <strong>Escrever</strong> e aproxime a NTAG213. Com o link gravado, basta encostar o celular na tag. (Também funciona o registro do tipo Texto com <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">tag_01</code>, mas aí o aluno precisa apertar o botão de escanear antes.)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Cards View */}
      {showLabels ? (
        <TagLabels missions={filteredMissions} />
      ) : isPrintMode ? (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-center justify-between">
            <span>
              Mostrando os 30 cartões formatados para recorte e colagem no laboratório do IFS.
            </span>
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs"
            >
              Imprimir
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-2">
            {filteredMissions.map((m) => (
              <div
                key={m.tag_id}
                className="papel bg-white text-slate-900 p-5 rounded-2xl border-2 border-dashed border-slate-400 flex flex-col justify-between space-y-3 shadow-md print:break-inside-avoid"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-mono font-black text-xl text-emerald-700">
                    {m.tag_id}
                  </span>
                  <span className="font-black text-xs px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
                    +{m.xp_valor} XP
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-500">
                    {m.category} • {m.packageName}
                  </span>
                  <p className="text-xs font-bold text-slate-800 line-clamp-3">
                    {m.pergunta}
                  </p>
                </div>

                <div className="pt-2 border-t text-[11px] text-slate-600 flex items-center gap-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{m.location_suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Regular Interactive View */
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Package Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedPackage === pkg.id
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {pkg.label} ({pkg.count})
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tag, pergunta ou categoria..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Missions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMissions.map((mission) => (
              <div
                key={mission.tag_id}
                className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {mission.tag_id}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                        {mission.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      <Sparkles className="w-3.5 h-3.5" />
                      +{mission.xp_valor} XP
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                      {mission.packageName}
                    </span>
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      {mission.pergunta}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Gabarito:</span>
                    {showGabarito ? (
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                        "{mission.resposta_curta}"
                      </span>
                    ) : (
                      <span className="font-mono text-slate-500 italic text-[11px] bg-slate-800/80 px-2 py-0.5 rounded">
                        🔒 Oculto durante o Rali
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{mission.location_suggestion}</span>
                    </span>

                    <button
                      onClick={() => copyToClipboard(mission.tag_id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px] font-semibold shrink-0"
                      title="Copiar texto para NFC Tools"
                    >
                      {copiedTag === mission.tag_id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
