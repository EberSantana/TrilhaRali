import React, { useState, useEffect } from 'react';
import { 
  Sheet, 
  Copy, 
  Check, 
  ExternalLink, 
  Save, 
  FileSpreadsheet, 
  AlertCircle,
  HelpCircle,
  Download,
  GraduationCap
} from 'lucide-react';
import { getAppsScriptUrl, saveAppsScriptUrl } from '../utils/storage';
import { getMissions } from '../utils/missionsStore';
import { Team } from '../types';

interface GoogleSheetsModalProps {
  teams: Team[];
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({ teams }) => {
  const [appsScriptUrl, setAppsScriptUrl] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [savedUrl, setSavedUrl] = useState(false);

  const [testFeedback, setTestFeedback] = useState<{ type: 'success' | 'error' | 'loading'; message: string } | null>(null);

  useEffect(() => {
    setAppsScriptUrl(getAppsScriptUrl());
  }, []);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    saveAppsScriptUrl(appsScriptUrl);
    setSavedUrl(true);
    setTestFeedback(null);
    setTimeout(() => setSavedUrl(false), 2000);
  };

  const handleTestSend = async () => {
    if (!appsScriptUrl) {
      setTestFeedback({ type: 'error', message: 'Insira a URL do Google Apps Script antes de testar.' });
      return;
    }
    setTestFeedback({ type: 'loading', message: 'Enviando disparo de teste para o Google Sheets...' });
    try {
      await fetch(appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag_id: 'tag_01', resposta: 'teste', equipe: 'Equipe A (Alpha)' }),
      });
      setTestFeedback({
        type: 'success',
        message: '✔ Webhook alcançado com sucesso! A requisição foi entregue ao seu Google Apps Script.',
      });
    } catch (err) {
      setTestFeedback({
        type: 'error',
        message: `Erro ao enviar para o Apps Script: ${String(err)}`,
      });
    }
  };

  const appsScriptCode = `// ==========================================================
// BACKEND GOOGLE APPS SCRIPT - RALI IFSTB (IFS CAMPUS TOBIAS BARRETO)
// Cole em: Extensões > Apps Script na sua planilha Google Sheets
// ==========================================================

function doPost(e) {
  try {
    var sheetMissoes = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Missoes");
    var sheetEquipes = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Equipes");
    
    // Recebe e formata os dados enviados pelo Web App
    var dados = JSON.parse(e.postData.contents);
    var tagLida = dados.tag_id; // Ex: 'tag_01'
    var respostaAluno = dados.resposta.toString().toLowerCase().trim();
    var nomeEquipe = dados.equipe; // Ex: 'Equipe A (Alpha)'

    // Busca os dados das missões
    var missoes = sheetMissoes.getDataRange().getValues();
    
    // Percorre as missões para encontrar a tag correspondente
    for (var i = 1; i < missoes.length; i++) {
      if (missoes[i][0] == tagLida) {
        var respostaGabarito = missoes[i][2].toString().toLowerCase().trim();
        
        if (respostaGabarito == respostaAluno) {
          var xpBase = parseInt(missoes[i][3]);
          var xpGanho = xpBase;
          var posicao = 1;
          var isFogo = false;

          // Modo CTF Dinâmico: calcula posição de chegada e decaimento no servidor
          if (dados.modo_pontuacao == "ctf_dynamic") {
            var capturas = registrarCaptura(tagLida, nomeEquipe, xpBase);
            posicao = capturas.posicao;
            xpGanho = capturas.xp;
            isFogo = capturas.isFogo;
          }
          
          // Função interna para adicionar o XP na aba Equipes
          adicionarXP(sheetEquipes, nomeEquipe, xpGanho);
          
          return ContentService.createTextOutput(JSON.stringify({
            "status": "sucesso", 
            "mensagem": (isFogo ? "🔥 " : "") + "Correto! +" + xpGanho + " XP",
            "xp_ganho": xpGanho,
            "posicao_captura": posicao,
            "is_fogo": isFogo
          })).setMimeType(ContentService.MimeType.JSON);
        } else {
          return ContentService.createTextOutput(JSON.stringify({
            "status": "erro", 
            "mensagem": "Resposta Incorreta. Tente novamente!"
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      "status": "erro", 
      "mensagem": "Tag não encontrada no banco de dados."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "erro", 
      "mensagem": "Erro no servidor: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// CTF Dinâmico: registra a captura na aba "Capturas" (tag, equipe, posição, XP, 🔥)
// e devolve a posição de chegada. Crie a aba "Capturas" ou deixe o script criá-la.
function registrarCaptura(tagId, nomeEquipe, xpBase) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Capturas");
  if (!sheet) {
    sheet = ss.insertSheet("Capturas");
    sheet.appendRow(["timestamp", "tag_id", "equipe", "posicao_captura", "xp", "is_fogo"]);
  }
  var linhas = sheet.getDataRange().getValues();
  var anteriores = 0;
  for (var k = 1; k < linhas.length; k++) {
    if (linhas[k][1] == tagId) {
      if (linhas[k][2] == nomeEquipe) {
        // Equipe já pontuou esta tag: devolve o registro existente sem duplicar
        return { posicao: linhas[k][3], xp: 0, isFogo: false };
      }
      anteriores++;
    }
  }
  var posicao = anteriores + 1;
  var decaimento = Math.max(1, Math.round(xpBase * 0.1));
  var piso = Math.min(xpBase, Math.max(3, Math.round(xpBase * 0.4)));
  var xp = Math.max(piso, xpBase - (posicao - 1) * decaimento);
  var isFogo = posicao == 1;
  sheet.appendRow([new Date(), tagId, nomeEquipe, posicao, xp, isFogo ? "🔥" : ""]);
  return { posicao: posicao, xp: xp, isFogo: isFogo };
}

// Função para procurar a equipe na aba e somar a pontuação
function adicionarXP(sheetEquipes, nomeEquipe, xp) {
  var equipes = sheetEquipes.getDataRange().getValues();
  for (var j = 1; j < equipes.length; j++) {
    if (equipes[j][0] == nomeEquipe) {
      var xpAtual = parseInt(equipes[j][1]);
      sheetEquipes.getRange(j + 1, 2).setValue(xpAtual + xp);
      return;
    }
  }
}

// Endpoint GET: Retorna dados em tempo real (Pergunta da Tag ou Ranking das Equipes)
function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  
  // Se o celular consultar a pergunta da tag (?tag=tag_01):
  if (params.tag) {
    var sheetMissoes = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Missoes");
    if (sheetMissoes) {
      var missoes = sheetMissoes.getDataRange().getValues();
      for (var i = 1; i < missoes.length; i++) {
        if (missoes[i][0] == params.tag) {
          return ContentService.createTextOutput(JSON.stringify({
            status: "sucesso",
            tag_id: missoes[i][0],
            pergunta: missoes[i][1],
            xp_valor: missoes[i][3] || 10
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({
      status: "erro",
      mensagem: "Tag não encontrada na planilha"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Padrão: Retorna o ranking consolidado das equipes
  var sheetEquipes = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Equipes");
  var dados = sheetEquipes ? sheetEquipes.getDataRange().getValues() : [];
  var ranking = [];
  for (var j = 1; j < dados.length; j++) {
    ranking.push({ nome: dados[j][0], xp: dados[j][1] });
  }
  return ContentService.createTextOutput(JSON.stringify(ranking))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleExportCsv = (type: 'missoes' | 'equipes') => {
    let content = '';
    let filename = '';
    if (type === 'missoes') {
      content = 'Tag_ID,Pergunta,Resposta_Curta,XP\n' +
        getMissions().map(m => `"${m.tag_id}","${m.pergunta.replace(/"/g, '""')}","${m.resposta_curta}",${m.xp_valor}`).join('\n');
      filename = 'planilha_missoes.csv';
    } else {
      content = 'Nome_Equipe,XP_Total\n' +
        teams.map(t => `"${t.nome}",${t.xp_total}`).join('\n');
      filename = 'planilha_equipes.csv';
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            IFS Campus Tobias Barreto
          </span>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" />
            Prof. Eber Santana
          </span>
          <span className="text-xs text-slate-400">• Integração Serverless Google Sheets</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <span>Integração Google Sheets & Apps Script</span>
          <Sheet className="w-8 h-8 text-emerald-400" />
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Como indicado no material do IFS, você pode conectar sua planilha do Google Drive como banco de dados em nuvem sem pagar por servidores.
        </p>
      </div>

      {/* 3 Steps Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 font-black text-base flex items-center justify-center">
            1
          </div>
          <h3 className="font-bold text-white text-base">Passo 1: Planilha no Google Drive</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Crie uma planilha com 2 abas: <strong>Missoes</strong> (Tag_ID, Pergunta, Resposta_Curta, XP) e <strong>Equipes</strong> (Nome_Equipe, XP_Total).
          </p>
          <div className="flex flex-col gap-1.5 pt-2">
            <button
              onClick={() => handleExportCsv('missoes')}
              className="text-xs py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar CSV Missoes (50)</span>
            </button>
            <button
              onClick={() => handleExportCsv('equipes')}
              className="text-xs py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar CSV Equipes</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 font-black text-base flex items-center justify-center">
            2
          </div>
          <h3 className="font-bold text-white text-base">Passo 2: Código no Apps Script</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Na planilha, clique em <strong>Extensões &gt; Apps Script</strong>. Apague o código anterior e cole o script <code className="text-teal-300">doPost(e)</code> fornecido abaixo.
          </p>
          <button
            onClick={handleCopyScript}
            className="w-full text-xs py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center justify-center gap-1.5 transition"
          >
            {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedScript ? 'Código Copiado!' : 'Copiar Código Apps Script'}</span>
          </button>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 font-black text-base flex items-center justify-center">
            3
          </div>
          <h3 className="font-bold text-white text-base">Passo 3: Implantar como App da Web</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Clique em <strong>Implantar &gt; Nova implantação</strong>. Tipo: <em>App da Web</em>. Quem pode acessar: <em>Qualquer pessoa</em>. Cole a URL gerada abaixo.
          </p>
        </div>
      </div>

      {/* Apps Script URL Input Form */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-teal-400" />
          Conectar URL do Google Apps Script (Opcional)
        </h3>
        <p className="text-xs text-slate-400">
          Se configurada, cada resposta correta no celular enviará um POST para a sua planilha Google em tempo real.
        </p>

        <form onSubmit={handleSaveUrl} className="space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 w-full">
            <input
              type="url"
              value={appsScriptUrl}
              onChange={(e) => setAppsScriptUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 min-w-0 w-full bg-slate-950 font-mono text-xs sm:text-sm text-teal-300 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition whitespace-nowrap"
              >
                {savedUrl ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{savedUrl ? 'Salvo!' : 'Salvar URL'}</span>
              </button>
              <button
                type="button"
                onClick={handleTestSend}
                className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition whitespace-nowrap shadow-sm"
              >
                <span>🧪 Testar Envio</span>
              </button>
            </div>
          </div>

          {testFeedback && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              testFeedback.type === 'success' 
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' 
                : testFeedback.type === 'error'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {testFeedback.type === 'success' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              {testFeedback.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{testFeedback.message}</span>
            </div>
          )}
        </form>
      </div>

      {/* GitHub Repository & GitHub Pages Deployment Card */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-sm">
              Git
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-teal-400">Hospedagem no GitHub Pages</span>
              <h3 className="text-lg font-bold text-white">EberSantana / TrilhaRali</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/EberSantana/TrilhaRali"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver no GitHub</span>
            </a>
            <a
              href="https://ebersantana.github.io/TrilhaRali/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-teal-600/20 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir GitHub Pages</span>
            </a>
          </div>
        </div>

        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Comandos para enviar ao repositório https://github.com/EberSantana/TrilhaRali:
          </span>
          <pre className="font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`git remote add origin https://github.com/EberSantana/TrilhaRali.git
git branch -M main
git add .
git commit -m "feat: Trilha Rali NFC - IFS Campus Tobias Barreto"
git push -u origin main`}
          </pre>
          <p className="text-[11px] text-slate-400 mt-2">
            * O fluxo de trabalho <code className="text-teal-300">.github/workflows/deploy.yml</code> já está configurado. No GitHub, vá em <strong>Settings &gt; Pages &gt; Source: GitHub Actions</strong> e o deploy será 100% automático.
          </p>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="font-mono text-xs font-bold text-teal-300">
            Código Apps Script Completo (doPost + adicionarXP + doGet)
          </span>
          <button
            onClick={handleCopyScript}
            className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center gap-1.5 transition"
          >
            {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedScript ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>

        <pre className="font-mono text-xs text-teal-200/90 bg-slate-950 p-6 rounded-2xl border border-slate-800 overflow-x-auto leading-relaxed max-h-[450px]">
          {appsScriptCode}
        </pre>
      </div>
    </div>
  );
};
