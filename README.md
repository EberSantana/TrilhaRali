# Rali IFSTB - App Educativo com Tags NFC 🏷️⚡

**Instituto Federal de Sergipe (IFS) - Campus Tobias Barreto**  
**Docente:** Prof. Eber Santana  
**Repositório:** [https://github.com/EberSantana/ralibd](https://github.com/EberSantana/ralibd)  
**Acesso Online (GitHub Pages):** [https://ebersantana.github.io/ralibd/](https://ebersantana.github.io/ralibd/)

---

## 🎯 Sobre o Sistema

Sistema gamificado para a condução do **Rali de Banco de Dados de 100 minutos** no laboratório de informática. 

Os alunos utilizam celulares Android com **NFC (NTAG213)** para escanear missões físicas espalhadas pela sala, resolvem consultas SQL (DQL, DML, DDL, DTL, DCL) no SQLite dos computadores e submetem apenas a resposta curta no aplicativo. A pontuação atualiza em tempo real no **Telão do Laboratório** com pódio, sons de comemoração e debriefing final.

---

## ⏱️ Estrutura da Dinâmica de 100 Minutos

| Tempo | Fase | Ações do Professor e dos Alunos |
|---|---|---|
| **00 a 15 min** | **Briefing & Divisão** | Divisão da turma em 10 grupos. Projeção da aba *Telão Ranking*. Cada equipe elege 1 aluno scanner. |
| **15 a 85 min** | **A Largada (Sprint de Código)** | Alunos escaneiam as tags, resolvem as queries no PC e enviam respostas curtas. Professor circula prestando mentoria. |
| **85 a 90 min** | **Hard Stop & Premiação** | Bloqueio imediato de novas respostas ("Mãos para cima!"), revelação dos campeões no pódio e pontuação bônus. |
| **90 a 100 min** | **Debriefing Pedagógico** | Projeção dos desafios com maior taxa de erro no telão com resolução comentada. |

---

## 🔥 Modos de Pontuação

No **Telão** (aba Ranking), o professor escolhe o modo de pontuação (exige o PIN do Modo Professor):

| Modo | Regra |
|---|---|
| **Rali Tradicional** | Cada missão sempre vale o XP original. |
| **CTF Dinâmico** | O valor cai conforme mais equipes capturam a mesma tag: perde 10% do XP base por posição (ex.: missão de 10 XP → 10, 9, 8, 7…), com piso de 40% (nunca zera). A 1ª equipe a capturar ganha o 🔥. |

- **Celular:** antes de enviar, o aluno vê o valor atual da flag ("🔥 FLAG INTACTA!" ou "⚠️ 2 equipes já resolveram: vale 8 XP").
- **Telão:** o feed destaca o 🔥 e o placar mostra quantos 🔥 cada equipe conquistou.
- **Google Sheets:** o webhook envia `modo_pontuacao`, `posicao_captura`, `xp_estimado` e `is_fogo`; o Apps Script atualizado registra cada captura na aba `Capturas`. Cole o script novamente na aba **Sheets** do app.

---

## 🚩 Dois módulos: Rali NFC e CTF Online

O topo do app alterna entre os módulos (o endereço `#/ctf` abre direto o CTF):

- **Rali NFC** — dinâmica em equipes com tags NTAG213 no laboratório (descrita acima).
- **CTF Online** — cada aluno joga sozinho no próprio navegador. **Uma missão por fase, em ordem fixa: só avança quem resolve a fase atual.**

**Fluxo do CTF**

1. **Professor** (aba *Professor*, exige PIN): configura uma vez o servidor (Google Apps Script), escolhe os pacotes de missões e o modo de pontuação (🔥 CTF Dinâmico ou XP fixo) e clica em **Criar sala e gerar token**.
2. **Alunos** abrem o site em `#/ctf`, digitam o **token da sala** e o **nome** e começam na fase 1. Voltar com o mesmo nome retoma de onde pararam.
3. O professor acompanha em tempo real (progresso, XP, 🔥, erros) e pode **encerrar/reabrir** a sala.

**Servidor do CTF (uma vez)**: crie uma planilha Google **nova**, cole o script copiado do painel do professor em *Extensões > Apps Script* e publique como Web App (*Executar como: Eu* • *Acesso: Qualquer pessoa*). Cole a URL `/exec` no painel. Para os alunos digitarem só o token, coloque a mesma URL em `DEFAULT_CTF_API_URL` (`src/config.ts`); sem isso, use o **link de convite** gerado no painel.

**Segurança:** as respostas ficam na planilha, e a validação e o avanço de fase acontecem no servidor (o aluno só recebe a pergunta da fase atual, com intervalo de 3 s após cada erro). O banco de questões do app é público no código-fonte, então um aluno muito curioso poderia lê-lo nos arquivos do site; para provas valendo nota, use missões inéditas.

---

## 🚀 Como Publicar no seu GitHub Pages (`EberSantana/ralibd`)

### 1. Clonar ou Inicializar o Repositório Local

Se você estiver na sua máquina local:

```bash
# 1. Clone o repositório criado no GitHub
git clone https://github.com/EberSantana/ralibd.git
cd ralibd

# 2. Instale as dependências
npm install

# 3. Teste localmente no seu computador
npm run dev
```

### 2. Ativar o GitHub Pages Automático (GitHub Actions)

O repositório já inclui o arquivo `.github/workflows/deploy.yml`. Para ativar a publicação automática:

1. Acesse o seu repositório: [https://github.com/EberSantana/ralibd](https://github.com/EberSantana/ralibd).
2. Clique na aba **Settings** (Configurações) no topo.
3. No menu lateral esquerdo, clique em **Pages**.
4. Em **Build and deployment > Source**, selecione **GitHub Actions**.
5. Faça um `git push` para a branch `main`:
   ```bash
   git add .
   git commit -m "feat: Rali IFSTB inicial para o IFS Campus Tobias Barreto"
   git push origin main
   ```
6. O GitHub irá compilar o projeto e em cerca de 1 minuto seu site estará no ar em:  
   👉 **`https://ebersantana.github.io/ralibd/`**

---

## 🏷️ Como Gravar as 50 Tags NFC NTAG213 (App NFC Tools)

Use o aplicativo gratuito **NFC Tools** (Android ou iOS):
1. Abra o app **NFC Tools**.
2. Toque na aba **Escrever** (*Write*).
3. Toque em **Adicionar um registro** (*Add a record*) > **Texto** (*Text*).
4. Digite o ID da tag (exemplo: `tag_01`, `tag_join_01`, `tag_img_01`, etc.).
5. Toque em **Escrever** (*Write*) e encoste o celular na etiqueta adesiva NTAG213.

### Mapeamento dos 9 Pacotes de Missões (50 Desafios)

| Pacote | Tags | Conteúdo Pedagógico | Local Físico Sugerido |
|---|---|---|---|
| **1. MVP Base** | `tag_01` a `tag_05` | DDL (DROP TABLE), COUNT Funcionários, JOIN Vendas/Produtos, WHERE no UPDATE, Subquery Boss (100 XP) | Bancadas 01-03, Quadro, Mesa Professor |
| **2. Academia** | `tag_acad_01` a `tag_acad_06` | Cardinalidade (1,1) e (0,N), FK, Tipagem DECIMAL, Bugs brModelo, PRAGMA foreign_keys, N:N | Quadro Branco, Monitores Laterais, Mesa Professor |
| **3. 16 CRUD** | `tag_crud_01` a `tag_crud_05` | INSERT/NULL, COUNT + GROUP BY, ORDER BY, Cláusula WHERE, Armadilha DELETE sem WHERE | Bancadas 04 a 08 |
| **4. Biblioteca** | `tag_bib_01` a `tag_bib_05` | PRIMARY KEY, Integridade Referencial, INNER JOIN ... ON, LEFT JOIN/NULL, Aliases (Apelidos) | Bancadas 09-10, Estantes, Porta Entrada |
| **5. Supermercado** | `tag_sup_01` a `tag_sup_05` | Verdadeiro/Falso Boss: JOIN implícito, Sintaxe IS NULL, CROSS JOIN sem ON, FK em UNIQUE, `sqlite_version` | Rack Servidor, Mural, Monitores |
| **6. Fechamento** | `tag_extra_01` a `tag_extra_04` | DTL (COMMIT / ROLLBACK), DCL (GRANT) e sintaxe de nulos | Bancadas Centrais, Pilares, Saída do Lab |
| **7. Rali dos JOINs** | `tag_join_01` a `tag_join_06` | INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN, CROSS JOIN e produto cartesiano (5x4=20) | Bancadas 03, 05, 07, 09 e Rack |
| **8. Mutação DML** | `tag_dml_01` a `tag_dml_05` | Cláusula SET, UPDATE sem WHERE (todas), DELETE linha vs coluna, Chave Estrangeira, UPDATE no CRUD | Terminais 02, 04, 06, 08 |
| **9. Subconjuntos SQL** | `tag_img_01` a `tag_img_09` | DDL, DML, DCL, TCL, TRUNCATE vs DELETE, SAVEPOINT, GRANT, MERGE (Upsert) e REVOKE | Quadro Branco e Pilares do Laboratório |

---

## 👥 Gestão de Integrantes & Salas de Rali (Registro Pedagógico)

O aplicativo conta com o sistema de **Salas do Rali & Alunos por Equipe**:
- **Salas de Rali:** Permite criar uma sala para cada turma/semestre (ex: *Turma 2026.1 - Sábado Manhã*), registrando a data, as equipes participantes, as pontuações e o histórico de submissões.
- **Nomes dos Alunos:** Em cada equipe, é possível cadastrar os nomes dos alunos integrantes e eleger o **Aluno Scanner Oficial**.
- **Relatório de Avaliação:** Exportação do relatório da sala em formato de texto/relatório oficial para lançamento de notas e pontuação bônus.

---

## 💻 Banco de Dados SQLite do Laboratório (`banco_rali.sql`)

O script SQL completo está disponível no arquivo `src/utils/sqlSeed.ts` e pode ser copiado ou baixado com 1 clique diretamente na aba **Banco SQLite** da aplicação web.

Ele contém:
- As tabelas do sistema gamificado: `equipes` e `missoes`.
- As tabelas populadas dos desafios dos alunos:
  - `Funcionarios` (145 linhas para o desafio de contagem).
  - `Produtos` & `Vendas` (para a junção de produtos mais vendidos).
  - `Alunos` (com notas para a subquery).
  - `bens`, `Livros`, `Emprestimos`, `Plano`.

---

## 📊 Conexão com Google Sheets (Opcional)

Se desejar replicar as notas ao vivo para uma planilha no seu Google Drive sem custos de servidor:
1. Crie uma planilha com as abas **Missoes** e **Equipes** (use os botões de exportação CSV na aba **Sheets** do app).
2. Cole o código Apps Script (`doPost`) em **Extensões > Apps Script**.
3. Clique em **Implantar > Nova Implantação > App da Web** (Acesso: *Qualquer pessoa*).
4. Cole a URL no campo de configuração da aba **Sheets** do aplicativo.

### Missões do Console SQLite (50 fases)

O CTF Online traz um banco de 50 missões (`src/data/consoleMissions.ts`) que só se resolvem executando comandos no Console SQLite: consultas, agregações, JOINs, subconsultas, DDL e integridade. São os pacotes "Console" ao criar a sala (marcados por padrão). Cada resposta é verificada nos testes (`npx tsx --test src/data/*.test.ts`) executando a solução no banco entregue aos alunos.

### Ranking Top 5 e telão

Na tela do aluno, o ranking mostra o Top 5 com pódio, setas de subida/descida (▲ ▼) e "+XP" por alguns segundos quando alguém pontua; se o aluno está fora do Top 5, sua posição aparece abaixo. Atualiza a cada 10 s. No painel do professor, o botão "Projetar ranking" abre o Top 5 em tela cheia (atualiza a cada 5 s, Esc fecha) com o token para novos alunos entrarem.

### Rali NFC: abrir pela tag, etiquetas e aviso de tag repetida

- **Link da tag:** `https://…/ralibd/#/tag/tag_07` abre o app direto no Scanner, já com a missão carregada. Grave esse link na tag NFC como registro URL (NFC Tools) para o aluno só encostar o celular; funciona no Android e no iPhone. O mesmo link vira um QR code de reserva.
- **Etiquetas:** em "50 Missões" → "Etiquetas NFC/QR" o professor escolhe a quantidade de tags, copia a lista de links, baixa o CSV e imprime as etiquetas (QR + código + categoria + XP; sem pergunta nem resposta).
- **Tag repetida:** se a equipe abre uma tag que já resolveu, aparece "⚠️ Atenção: tag já resolvida", com quem resolveu e a hora, e não pontua de novo. Também informa quais outras equipes já resolveram (neste aparelho).
