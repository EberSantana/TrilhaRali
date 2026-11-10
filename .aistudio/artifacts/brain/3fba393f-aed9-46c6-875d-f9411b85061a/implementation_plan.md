# Plano de Implementação: Menu Unificado & Página Sobre o Rali

## 1. Diagnóstico do Problema Visual
* **Empilhamento e Duplicidade:** Havia três níveis de cabeçalho na mesma tela (faixa preta do topo, menu de navegação e o bloco superior do telão), repetindo cronômetro, logotipo do IFS e fase da dinâmica.
* **Rolagem Desconexa:** A faixa superior subia enquanto o menu fixava (`sticky`), gerando uma quebra estética não profissional.
* **Falta de Página Institucional "Sobre":** O projeto não possuía uma aba dedicada com a metodologia pedagógica, arquitetura de tags NTAG213 e créditos institucionais completos.

---

## 2. Ações Planejadas

### Fase 1: Unificação e Limpeza da Barra de Navegação (`src/components/Navbar.tsx`)
- Unificar o cabeçalho em uma **barra única, sólida e elegante** (sem faixas soltas que se separam ao rolar).
- Exibir com clareza o **Logotipo Oficial do IFS**, título **Rali SQL** e a assinatura **Desenvolvido e Supervisionado pelo Professor Eber Santana**.
- **Remover a duplicação do cronômetro no menu:** no menu fica apenas a navegação fluida, o botão de seleção da sala ativa e o controle de som.
- Adicionar a nova aba **"Sobre o Projeto"** (`about`) com ícone institucional.

### Fase 2: Criação da Página "Sobre o Rali" (`src/components/AboutView.tsx`)
Criar uma visão institucional completa e detalhada com:
1. **Identificação Acadêmica:**
   - Ministério da Educação • Instituto Federal de Sergipe (IFS) • Campus Tobias Barreto
   - Docente Responsável: **Professor Eber Santana** (concepção pedagógica, elaboração das 50 missões e supervisão técnica)
2. **Metodologia dos 100 Minutos:**
   - 00 a 15 min: Briefing & Divisão das 10 Equipes (eleição do aluno scanner)
   - 15 a 85 min: Sprint de Código (resolução nos PCs e submissão rápida no celular)
   - 85 a 90 min: Hard Stop (bloqueio das respostas e consagração do pódio)
   - 90 a 100 min: Debriefing (análise guiada das dúvidas mais frequentes no telão)
3. **Tecnologia & Hardware:**
   - Tags NFC NTAG213 (ISO/IEC 14443A, 13.56 MHz)
   - Web NFC API nativa com fallback para simulador
   - Banco de dados SQLite local no laboratório
   - Arquitetura Serverless com Google Sheets & Apps Script
4. **Matriz das 50 Missões (9 Pacotes):**
   - Visão pedagógica da progressão de DDL, DQL, DML, DCL, TCL, JOINs e Modelo Entidade-Relacionamento
5. **Recursos & Links:**
   - Botão para visualizar/baixar o PDF de regras do laboratório
   - Link para o repositório oficial no GitHub (`https://github.com/EberSantana/ralibd`)

### Fase 3: Ajustes no Telão (`ClassroomProjector.tsx`) e `App.tsx`
- Refinar o bloco superior do Telão para que se integre de forma harmônica à nova barra superior unificada.
- Adicionar o gerenciamento da nova aba `about` em `App.tsx`.
- Testar e validar a compilação e a navegação responsiva em telas de notebook e projetores de laboratório.
