// Script SQL completo para criação do banco de dados das aulas (SQLite)
// Inclui o esquema do Rali (equipes e missões) e as tabelas dos desafios práticos

export const BANCO_RALI_SQL = `-- ==========================================================
-- RALI DE BANCO DE DADOS - IFS CAMPUS TOBIAS BARRETO
-- Prof. EBTT - Script Oficial de Inicialização (SQLite)
-- Salve como: banco_rali.sql e execute no SQLite / SQLite Online
-- ==========================================================

PRAGMA foreign_keys = ON;

-- 1. TABELAS DO SISTEMA GAMIFICADO
DROP TABLE IF EXISTS equipes;
CREATE TABLE equipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  xp_total INTEGER DEFAULT 0
);

DROP TABLE IF EXISTS missoes;
CREATE TABLE missoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_id TEXT UNIQUE NOT NULL, -- Texto gravado na NTAG213 (ex: 'tag_01')
  pergunta TEXT NOT NULL,       -- O que aparece no app
  resposta_curta TEXT NOT NULL, -- Gabarito exato
  xp_valor INTEGER NOT NULL
);

-- Dados Iniciais das Equipes
INSERT INTO equipes (nome, xp_total) VALUES 
('Equipe A (Alpha)', 0),
('Equipe B (Beta)', 0),
('Equipe C (Cyber)', 0),
('Equipe D (Delta)', 0),
('Equipe E (Echo)', 0),
('Equipe F (Fox)', 0),
('Equipe G (Gamma)', 0),
('Equipe H (Hacker)', 0),
('Equipe I (Infinity)', 0),
('Equipe J (Jedi)', 0);

-- Dados Iniciais das Missões (30 Desafios Padronizados)
INSERT INTO missoes (tag_id, pergunta, resposta_curta, xp_valor) VALUES
('tag_01', 'DDL: Qual comando apaga a estrutura de uma tabela inteira?', 'drop table', 10),
('tag_02', 'DQL: Rode um SELECT COUNT(*) na tabela Funcionarios. Qual o número total?', '145', 20),
('tag_03', 'DQL: Faça um JOIN entre Vendas e Produtos. Qual o nome do produto mais vendido?', 'notebook dell', 20),
('tag_04', 'DML: Qual cláusula é obrigatória usar com UPDATE para não alterar todas as linhas?', 'where', 10),
('tag_05', 'DQL (Boss): Use subquery para achar o aluno com a maior nota. Digite o nome dele.', 'juliane', 30),
('tag_acad_01', 'Conceitual: Na relação ALUNO (1,1) contrata PLANO (0,N), qual tabela deve receber a Chave Estrangeira (FK)?', 'aluno', 10),
('tag_acad_02', 'Lógico: Qual é o nome exato do atributo identificador (Chave Primária) da entidade PLANO?', 'cod_plano', 10),
('tag_acad_03', 'Físico (Tipagem): Qual foi o tipo de dado sugerido no roteiro para armazenar o campo valor_mensal?', 'decimal', 20),
('tag_acad_04', 'Caça ao Bug: Qual é o comando SQL gerado pelo brModelo que precisamos APAGAR no SQLite?', 'alter table', 30),
('tag_acad_05', 'Configuração: Qual é o comando completo usado para ligar verificação de Chaves Estrangeiras?', 'pragma foreign_keys = on', 40),
('tag_acad_06', 'Boss (Desafio Lógico): Se a cardinalidade fosse (0,N) nos dois lados, o que surgiria?', 'nova tabela', 50),
('tag_crud_01', 'CREATE: Ao inserir um bem informando apenas descrição e setor, o que o banco insere nas colunas vazias?', 'null', 10),
('tag_crud_02', 'READ: Qual função agregadora usamos junto com GROUP BY para descobrir o total por situação?', 'count', 10),
('tag_crud_03', 'READ/SORT: Qual cláusula usamos no final do SELECT para ordenar os registros?', 'order by', 20),
('tag_crud_04', 'UPDATE: Qual cláusula é de uso obrigatório no UPDATE para impedir alterar a tabela inteira?', 'where', 30),
('tag_crud_05', 'DELETE (Armadilha): Se o aluno executar DELETE FROM bens; sem filtro, o que acontecerá?', 'apaga tudo', 50),
('tag_bib_01', 'Chaves: Qual restrição aplicamos no id para garantir que ele seja identificador único?', 'primary key', 10),
('tag_bib_02', 'Integridade: Ao tentar dar DELETE em aluno com empréstimo ativo, isso é defesa da chave...', 'estrangeira', 20),
('tag_bib_03', 'INNER JOIN: Que cláusula escrevemos logo após o JOIN para ensinar o predicado de junção?', 'on', 30),
('tag_bib_04', 'LEFT JOIN: Se usarmos LEFT JOIN, os alunos sem empréstimo aparecerão com qual valor nas colunas?', 'null', 40),
('tag_bib_05', 'Apelidos: O uso de letras como a, e logo após a tabela no FROM serve para criar qual recurso?', 'apelido', 20),
('tag_sup_01', 'Teste 01: No SQLite, escrever a palavra apenas JOIN produz exatamente o mesmo resultado que INNER JOIN? (Verdadeiro/Falso)', 'verdadeiro', 10),
('tag_sup_02', 'Teste 13: Em SQL, para testar se a categoria está vazia, a forma correta é usar = NULL? (Verdadeiro/Falso)', 'falso', 10),
('tag_sup_03', 'Teste 03: O cruzamento total pelo CROSS JOIN exige que exista cláusula ON? (Verdadeiro/Falso)', 'falso', 20),
('tag_sup_04', 'Teste 27: Uma Foreign Key nunca pode apontar para uma coluna que não seja Primary Key? (Verdadeiro/Falso)', 'falso', 30),
('tag_sup_05', 'Versão: Qual função do sistema usamos com um SELECT para descobrir a versão do SQLite?', 'sqlite_version', 50),
('tag_extra_01', 'DTL (Salvar): Qual é o comando utilizado para confirmar e salvar definitivamente uma transação?', 'commit', 20),
('tag_extra_02', 'DTL (Desfazer): Se você inseriu um dado errado numa transação BEGIN, qual comando usa para desfazer?', 'rollback', 20),
('tag_extra_03', 'DCL (Permissão): Qual comando DCL é utilizado de forma teórica para dar permissão de leitura?', 'grant', 30),
('tag_extra_04', 'Sintaxe (Nulos): A expressão = NULL nunca é verdadeira. Qual é a forma correta?', 'is null', 30);


-- 2. TABELAS DE SUPORTE AOS DESAFIOS PRÁTICOS DOS ALUNOS NO PC
-- Tabela de Funcionários (tag_02)
DROP TABLE IF EXISTS Funcionarios;
CREATE TABLE Funcionarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL,
  salario REAL NOT NULL,
  setor TEXT NOT NULL
);

-- Popula 145 funcionários para o SELECT COUNT(*) da tag_02
WITH RECURSIVE cnt(x) AS (
  SELECT 1
  UNION ALL
  SELECT x + 1 FROM cnt WHERE x < 145
)
INSERT INTO Funcionarios (nome, cargo, salario, setor)
SELECT 
  'Funcionario ' || x, 
  CASE (x % 4) WHEN 0 THEN 'Analista' WHEN 1 THEN 'Desenvolvedor' WHEN 2 THEN 'Suporte' ELSE 'Gerente' END,
  2500 + (x * 35.5),
  CASE (x % 3) WHEN 0 THEN 'TI' WHEN 1 THEN 'Financeiro' ELSE 'RH' END
FROM cnt;

-- Tabelas de Produtos e Vendas (tag_03)
DROP TABLE IF EXISTS Vendas;
DROP TABLE IF EXISTS Produtos;

CREATE TABLE Produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  preco REAL NOT NULL
);

CREATE TABLE Vendas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_produto INTEGER NOT NULL,
  quantidade INTEGER NOT NULL,
  data_venda DATE DEFAULT CURRENT_DATE,
  FOREIGN KEY (id_produto) REFERENCES Produtos(id)
);

INSERT INTO Produtos (id, nome, preco) VALUES 
(1, 'Notebook Dell', 4200.00),
(2, 'Mouse Sem Fio', 89.90),
(3, 'Teclado Mecânico', 249.00),
(4, 'Monitor 24 Pol', 890.00);

INSERT INTO Vendas (id_produto, quantidade) VALUES 
(1, 45), (1, 30), (1, 60), -- Notebook Dell lidera as vendas!
(2, 20), (2, 15),
(3, 10), (3, 8),
(4, 12);

-- Tabela Alunos (tag_05 - Subquery Boss)
DROP TABLE IF EXISTS Alunos;
CREATE TABLE Alunos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  nota REAL NOT NULL
);

INSERT INTO Alunos (nome, nota) VALUES 
('Carlos Andrade', 8.5),
('Juliane', 9.8), -- Maior nota!
('Marcos Souza', 7.2),
('Beatriz Lima', 9.1),
('Rodrigo Santos', 6.8);

-- Tabela Bens Patrimoniais (Pacote CRUD 16)
DROP TABLE IF EXISTS bens;
CREATE TABLE bens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao TEXT NOT NULL,
  setor TEXT,
  situacao TEXT DEFAULT 'Ativo',
  valor REAL
);

INSERT INTO bens (descricao, setor, situacao, valor) VALUES 
('Mesa Computador', 'Laboratório 01', 'Ativo', 450.00),
('Cadeira Giratória', 'Laboratório 01', 'Ativo', 320.00),
('Ar Condicionado', 'Laboratório 01', 'Em Manutenção', 2100.00),
('Projetor Epson', 'Auditório', 'Ativo', 3500.00),
('Switch 24 Portas', 'Rack Central', 'Ativo', 1800.00);

-- Tabelas da Biblioteca (Pacote Biblioteca)
DROP TABLE IF EXISTS Emprestimos;
DROP TABLE IF EXISTS Livros;

CREATE TABLE Livros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL
);

CREATE TABLE Emprestimos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_aluno INTEGER NOT NULL,
  id_livro INTEGER NOT NULL,
  data_retirada DATE DEFAULT CURRENT_DATE,
  FOREIGN KEY (id_aluno) REFERENCES Alunos(id),
  FOREIGN KEY (id_livro) REFERENCES Livros(id)
);

INSERT INTO Livros (id, titulo, autor) VALUES 
(1, 'Sistemas de Banco de Dados', 'Navathe'),
(2, 'SQL Completo e Prático', 'Silberschatz'),
(3, 'Modelagem Conceitual', 'Heuser');

INSERT INTO Emprestimos (id_aluno, id_livro) VALUES 
(1, 1),
(2, 2);
`;

/**
 * Versão do banco para os ALUNOS (CTF): sem as tabelas do sistema do Rali (equipes e missoes),
 * porque `missoes` guarda os gabaritos (resposta_curta). Mantém apenas os dados dos desafios.
 */
const SEED_SUPPORT_MARKER = '-- 2. TABELAS DE SUPORTE';
const SEED_SYSTEM_MARKER = '-- 1. TABELAS DO SISTEMA GAMIFICADO';
export const BANCO_CTF_SQL = (() => {
  const start = BANCO_RALI_SQL.indexOf(SEED_SYSTEM_MARKER);
  const end = BANCO_RALI_SQL.indexOf(SEED_SUPPORT_MARKER);
  if (start < 0 || end < start) return BANCO_RALI_SQL; // proteção: o teste abaixo falha se isso acontecer
  return (
    BANCO_RALI_SQL.slice(0, start) +
    '-- (Tabelas do sistema do Rali omitidas nesta versão dos alunos)\n\n' +
    BANCO_RALI_SQL.slice(end)
  );
})();
