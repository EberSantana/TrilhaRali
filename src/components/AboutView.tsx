import React from 'react';
import { 
  GraduationCap, 
  Clock, 
  Smartphone, 
  Database, 
  Tag, 
  Award, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  Users, 
  Flame, 
  Sparkles,
  Layers,
  ShieldCheck,
  Cpu,
  Tv
} from 'lucide-react';
import { IfsLogo } from './IfsLogo';
import { TrilhaLogo } from './TrilhaLogo';
import { ALL_MISSIONS } from '../data/missions';

interface AboutViewProps {
  onNavigateToTab?: (tab: 'projector' | 'scanner' | 'missions') => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigateToTab }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-slate-200">
      {/* Institutional Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 rounded-3xl p-6 sm:p-10 border border-emerald-800/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-2 bg-gradient-to-l from-red-600 via-emerald-500 to-transparent" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                Ministério da Educação • Rede Federal
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300">
                IFS Campus Tobias Barreto
              </span>
            </div>

            <div className="flex items-center gap-4">
              <TrilhaLogo variant="full" height={150} className="rounded-2xl" />
              <IfsLogo size="lg" className="p-2 bg-white/5 rounded-2xl border border-emerald-500/30 shrink-0" />
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  Trilha Rali
                </h1>
                <p className="text-base sm:text-lg text-emerald-400 font-semibold mt-1 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>Desenvolvido e Supervisionado pelo <strong>Professor Eber Santana</strong></span>
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              A <strong>Trilha Rali</strong> é uma metodologia ativa gamificada concebida para o laboratório de informática do IFS. Em uma dinâmica cronometrada de <strong>100 minutos</strong>, os alunos integram teoria e prática de Banco de Dados Relacional, conectando a exploração física do ambiente por meio de etiquetas de radiofrequência (NTAG213) à resolução de desafios reais no SQLite.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <a
              href="./assets/aistudio/App_Educativo_com_Tags_NFC_0c115954.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition text-center"
            >
              <FileText className="w-4 h-4" />
              <span>Abrir PDF de Regras</span>
            </a>

            <a
              href="https://github.com/EberSantana/ralibd"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition text-center"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Repositório GitHub</span>
            </a>

            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('projector')}
                className="px-5 py-3 rounded-2xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <Tv className="w-4 h-4" />
                <span>Ir para o Telão</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: 4 Fases da Dinâmica de 100 Minutos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-black text-white tracking-tight">
            Metodologia da Dinâmica de 100 Minutos
          </h2>
        </div>
        <p className="text-slate-400 text-sm">
          A aula é rigorosamente estruturada em 4 fases sequenciais para maximizar o engajamento e a consolidação do aprendizado:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Fase 1 */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-sky-800/40 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  00 a 15 min
                </span>
                <span className="font-mono text-xs text-slate-400 font-bold">Fase 1</span>
              </div>
              <h3 className="text-lg font-bold text-white">Briefing & Regras</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Divisão dos estudantes em até 10 equipes multidisciplinares. Cada equipe elege seu <strong>Aluno Scanner Oficial</strong> (responsável pelo celular com NFC). O professor projeta o Telão e alinha o objetivo.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-sky-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Alinhamento pedagógico
            </div>
          </div>

          {/* Fase 2 */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-emerald-800/40 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  15 a 85 min
                </span>
                <span className="font-mono text-xs text-slate-400 font-bold">Fase 2 (70 min)</span>
              </div>
              <h3 className="text-lg font-bold text-white">Sprint do Rali</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Alunos caçam as tags espalhadas pelo laboratório, escaneiam a missão física no celular, escrevem e testam a query SQL nos computadores e enviam a resposta curta. O ranking no telão atualiza ao vivo.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              Execução ativa e mentoria
            </div>
          </div>

          {/* Fase 3 */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-amber-800/40 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  85 a 90 min
                </span>
                <span className="font-mono text-xs text-slate-400 font-bold">Fase 3 (5 min)</span>
              </div>
              <h3 className="text-lg font-bold text-white">Hard Stop & Pódio</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bloqueio imediato do recebimento de respostas no telão ("Mãos para cima!"). O sistema toca o gongo sonoro oficial, o cronômetro trava e o pódio revela os 3 primeiros colocados com chuva de confetes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Celebração e gamificação
            </div>
          </div>

          {/* Fase 4 */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-purple-800/40 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  90 a 100 min
                </span>
                <span className="font-mono text-xs text-slate-400 font-bold">Fase 4 (10 min)</span>
              </div>
              <h3 className="text-lg font-bold text-white">Debriefing Guiado</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                O professor utiliza a aba <em>Debriefing</em> para projetar no telão as 3 questões que tiveram maior índice de erro no rali, realizando a correção comentada e fixando os conceitos difíceis.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-purple-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Consolidação pedagógica
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Arquitetura Tecnológica & Hardware */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-emerald-900/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 flex items-center justify-center border border-emerald-600/30">
            <Cpu className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Tags NFC NTAG213</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Etiquetas adesivas de 13.56 MHz (ISO 14443A) com 144 bytes de memória útil. Gravadas facilmente com o aplicativo gratuito <strong>NFC Tools</strong> gravando apenas o ID de cada missão (ex: <code className="text-emerald-300">tag_01</code>, <code className="text-emerald-300">tag_join_01</code>).
          </p>
        </div>

        <div className="bg-slate-900/90 rounded-3xl p-6 border border-emerald-900/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 flex items-center justify-center border border-emerald-600/30">
            <Database className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Banco SQLite Laboratorial</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            O arquivo <code className="text-emerald-300 font-mono">banco_rali.sql</code> pré-carrega as tabelas relacionais (<code className="text-slate-300">Funcionarios</code>, <code className="text-slate-300">Produtos</code>, <code className="text-slate-300">Vendas</code>, <code className="text-slate-300">Livros</code>, etc.) direto no SQLite dos computadores ou no SQLite Online.
          </p>
        </div>

        <div className="bg-slate-900/90 rounded-3xl p-6 border border-emerald-900/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 flex items-center justify-center border border-emerald-600/30">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Salas & Alunos por Turma</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Permite salvar e alternar entre diferentes turmas (Salas do Rali), cadastrar nominalmente os estudantes de cada equipe, definir o Aluno Scanner e exportar a <strong>Ata Oficial</strong> em arquivo de texto para avaliação.
          </p>
        </div>
      </div>

      {/* Arsenal dos 9 Pacotes (50 Missões) */}
      <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Matriz Pedagógica
            </span>
            <h2 className="text-2xl font-black text-white mt-1">
              Arsenal Oficial das 50 Missões (9 Pacotes)
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-slate-950 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            Total: {ALL_MISSIONS.length} Desafios Padronizados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-emerald-400 block">1. MVP Clássico (5 missões)</strong>
            <p className="text-slate-400">SELECT, WHERE, COUNT, ORDER BY e Subquery Boss (100 XP).</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-emerald-400 block">2. Academia & Modelagem (6 missões)</strong>
            <p className="text-slate-400">Cardinalidades (1,1) e (0,N), Chaves Estrangeiras, DECIMAL e N:N.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-emerald-400 block">3. 16 Comandos CRUD (5 missões)</strong>
            <p className="text-slate-400">INSERT com NULL, COUNT + GROUP BY, ORDER BY e DELETE perigoso.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-emerald-400 block">4. Biblioteca Municipal (5 missões)</strong>
            <p className="text-slate-400">Integridade referencial, INNER JOIN ... ON, LEFT JOIN com nulos.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-emerald-400 block">5. Supermercado & Estoque (5 missões)</strong>
            <p className="text-slate-400">Boss Verdadeiro/Falso, CROSS JOIN, IS NULL e versão do SQLite.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-emerald-400 block">6. Fechamento & Desafios (4 missões)</strong>
            <p className="text-slate-400">Transações DTL (COMMIT / ROLLBACK) e permissões DCL (GRANT).</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-emerald-400 block">7. Rali dos JOINs (6 missões)</strong>
            <p className="text-slate-400">INNER JOIN, LEFT JOIN, múltiplos relacionamentos e produto cartesiano.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-emerald-400 block">8. Mutação DML (5 missões)</strong>
            <p className="text-slate-400">Cláusula SET, UPDATE sem WHERE acidental e deleção de tuplas.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-emerald-400 block">9. Subconjuntos de Diagrama (9 missões)</strong>
            <p className="text-slate-400">Leitura de Diagramas MER/DER, DDL vs DML, TRUNCATE, SAVEPOINT e MERGE.</p>
          </div>
        </div>
      </div>

      {/* Créditos Institucionais Finais */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <IfsLogo size="sm" />
          <div>
            <p className="font-bold text-slate-200">
              Instituto Federal de Educação, Ciência e Tecnologia de Sergipe (IFS)
            </p>
            <p className="text-emerald-400">
              Campus Tobias Barreto • Docente Responsável: Prof. Eber Santana
            </p>
          </div>
        </div>

        <div className="text-center sm:text-right font-mono text-[11px]">
          <span>Ano Letivo 2026 • Disciplina de Banco de Dados</span>
        </div>
      </div>
    </div>
  );
};
