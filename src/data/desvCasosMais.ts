import type { DesvCaso } from './desvCasos';

/**
 * Desvendando: casos extras (c17 a c60). Fecham 10 casos em cada disciplina: Lógica, Banco de Dados, Construção de Sites,
 * Informática Básica, Redes de Computadores e Segurança da Informação.
 * O gabarito NÃO fica aqui (veja desvCasos.ts): desvCasos.test.ts prova que cada caso tem uma única solução.
 */
const SEED_C23 = `-- Caso: O Boletim Adulterado
CREATE TABLE professores (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, disciplina TEXT NOT NULL);
INSERT INTO professores VALUES
(1, 'Ana Paula Dias', 'Matemática'), (2, 'Bernardo Luz', 'História'), (3, 'Cátia Mendes', 'Português'),
(4, 'Douglas Ramos', 'Física'), (5, 'Eunice Prado', 'Química'), (6, 'Fernando Vaz', 'Geografia');
CREATE TABLE alteracoes_nota (
  id INTEGER PRIMARY KEY, id_professor INTEGER NOT NULL REFERENCES professores(id),
  aluno TEXT NOT NULL, nota_antes REAL NOT NULL, nota_depois REAL NOT NULL, horario TEXT NOT NULL
);
INSERT INTO alteracoes_nota (id_professor, aluno, nota_antes, nota_depois, horario) VALUES
(1, 'Lara', 6.0, 6.5, '10:20'), (1, 'Caio', 4.0, 7.0, '15:40'), (2, 'Nina', 7.0, 7.5, '19:05'),
(3, 'Pedro', 5.0, 5.5, '09:10'), (4, 'Sol', 2.0, 6.0, '16:30'), (4, 'Teo', 6.5, 7.0, '20:10'),
(5, 'Rafa', 3.5, 8.0, '21:47'), (6, 'Ugo', 8.0, 8.0, '17:50');
CREATE TABLE avisos (id INTEGER PRIMARY KEY, texto TEXT NOT NULL);
INSERT INTO avisos (texto) VALUES
('Mudanças de nota só são permitidas até as 18:00.'),
('Correções de até 1 ponto são normais; acima disso, só com ata.');
`;

const SEED_C24 = `-- Caso: O Estoque da Cantina
CREATE TABLE funcionarios (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, turno TEXT NOT NULL);
INSERT INTO funcionarios VALUES
(1, 'Gabriela Neri', 'manhã'), (2, 'Heitor Sá', 'manhã'), (3, 'Irene Lopes', 'tarde'),
(4, 'João Vidal', 'tarde'), (5, 'Karla Teles', 'noite'), (6, 'Lucas Brito', 'noite');
CREATE TABLE movimentos (
  id INTEGER PRIMARY KEY, id_func INTEGER NOT NULL REFERENCES funcionarios(id),
  item TEXT NOT NULL, qtd INTEGER NOT NULL, tipo TEXT NOT NULL
);
INSERT INTO movimentos (id_func, item, qtd, tipo) VALUES
(1, 'Refrigerante', 30, 'entrada'), (2, 'Suco', 20, 'saida'), (3, 'Refrigerante', 40, 'saida'),
(4, 'Biscoito', 25, 'saida'), (5, 'Refrigerante', 200, 'entrada'), (6, 'Refrigerante', 120, 'saida');
CREATE TABLE avisos (id INTEGER PRIMARY KEY, texto TEXT NOT NULL);
INSERT INTO avisos (texto) VALUES
('Saídas acima de 50 unidades exigem autorização do gerente, e ninguém pediu.'),
('Entradas são compras; só as saídas diminuem o estoque.');
`;

const SEED_C25 = `-- Caso: A Matrícula em Dois Lugares
CREATE TABLE alunos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);
INSERT INTO alunos VALUES (1, 'Marina Cruz'), (2, 'Nando Alves'), (3, 'Olga Pires'), (4, 'Paulo Seixas'), (5, 'Quésia Lima'), (6, 'Raul Bastos');
CREATE TABLE turmas (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, dia TEXT NOT NULL, horario TEXT NOT NULL);
INSERT INTO turmas VALUES
(1, 'Algoritmos', 'seg', '08:00'), (2, 'Banco de Dados', 'seg', '08:00'), (3, 'Redes', 'ter', '10:00'),
(4, 'Web', 'qua', '08:00'), (5, 'Lógica', 'seg', '10:00');
CREATE TABLE matriculas (id INTEGER PRIMARY KEY, id_aluno INTEGER NOT NULL REFERENCES alunos(id), id_turma INTEGER NOT NULL REFERENCES turmas(id));
INSERT INTO matriculas (id_aluno, id_turma) VALUES
(1, 1), (1, 3), (2, 2), (2, 4), (3, 1), (3, 2), (4, 3), (4, 5), (5, 1), (5, 5), (6, 4);
CREATE TABLE avisos (id INTEGER PRIMARY KEY, texto TEXT NOT NULL);
INSERT INTO avisos (texto) VALUES ('Uma pessoa não pode estar em duas turmas no mesmo dia e no mesmo horário.');
`;

const SEED_C26 = `-- Caso: O Livro que Nunca Voltou
CREATE TABLE usuarios (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);
INSERT INTO usuarios VALUES (1, 'Sandra Melo'), (2, 'Tales Nunes'), (3, 'Úrsula Reis'), (4, 'Valdir Cano'), (5, 'Wesley Ito'), (6, 'Yasmim Gois');
CREATE TABLE livros (id INTEGER PRIMARY KEY, titulo TEXT NOT NULL, valor REAL NOT NULL);
INSERT INTO livros VALUES (1, 'Banco de Dados', 90), (2, 'Redes de Computadores', 120), (3, 'Algoritmos', 70), (4, 'Dicionário', 40), (5, 'Atlas Raro', 480);
CREATE TABLE emprestimos (
  id INTEGER PRIMARY KEY, id_usuario INTEGER NOT NULL REFERENCES usuarios(id),
  id_livro INTEGER NOT NULL REFERENCES livros(id), retirada TEXT NOT NULL, devolucao TEXT
);
INSERT INTO emprestimos (id_usuario, id_livro, retirada, devolucao) VALUES
(1, 1, '2026-10-01', '2026-10-10'), (2, 3, '2026-10-05', NULL), (3, 2, '2026-10-06', '2026-10-20'),
(4, 4, '2026-10-02', NULL), (5, 5, '2026-10-03', NULL), (6, 2, '2026-10-12', '2026-10-25');
CREATE TABLE avisos (id INTEGER PRIMARY KEY, texto TEXT NOT NULL);
INSERT INTO avisos (texto) VALUES
('Empréstimo sem data de devolução (NULL) ainda não foi devolvido.'),
('A biblioteca só abre ocorrência para o livro de maior valor que não foi devolvido.');
`;

const SEED_C27 = `-- Caso: O Pagamento em Dobro
CREATE TABLE atendentes (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);
INSERT INTO atendentes VALUES (1, 'Zuleica Prado'), (2, 'Abílio Costa'), (3, 'Beatriz Tole'), (4, 'Clóvis Fraga'), (5, 'Débora Maia'), (6, 'Edgar Pinto');
CREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente TEXT NOT NULL, valor REAL NOT NULL);
INSERT INTO pedidos VALUES (1, 'Marcos', 50), (2, 'Nayara', 80), (3, 'Otávio', 30), (4, 'Paula', 120), (5, 'Quintino', 45);
CREATE TABLE pagamentos (
  id INTEGER PRIMARY KEY, id_pedido INTEGER NOT NULL REFERENCES pedidos(id),
  id_atendente INTEGER NOT NULL REFERENCES atendentes(id), valor REAL NOT NULL
);
INSERT INTO pagamentos (id_pedido, id_atendente, valor) VALUES
(1, 1, 50), (2, 2, 40), (2, 2, 40), (3, 3, 30), (4, 4, 120), (5, 6, 45), (5, 6, 45);
CREATE TABLE avisos (id INTEGER PRIMARY KEY, texto TEXT NOT NULL);
INSERT INTO avisos (texto) VALUES
('Pagamento parcelado é permitido, desde que a soma não passe do valor do pedido.'),
('Cobrar acima do valor do pedido é fraude.');
`;

const SEED_C28 = `-- Caso: O Ranking Manipulado
CREATE TABLE jogadores (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);
INSERT INTO jogadores VALUES (1, 'Fabiana Rios'), (2, 'Gustavo Lage'), (3, 'Helena Dutra'), (4, 'Ivan Moura'), (5, 'Jéssica Alvim'), (6, 'Kléber Souto');
CREATE TABLE partidas (id INTEGER PRIMARY KEY, id_jogador INTEGER NOT NULL REFERENCES jogadores(id), pontos INTEGER NOT NULL, data TEXT NOT NULL);
INSERT INTO partidas (id_jogador, pontos, data) VALUES
(1, 100, '2026-11-02'), (1, 120, '2026-11-03'), (1, 110, '2026-11-04'),
(2, 90, '2026-11-02'), (2, 95, '2026-11-03'), (2, 105, '2026-11-04'),
(3, 130, '2026-11-02'), (3, 140, '2026-11-03'),
(4, 105, '2026-11-02'), (4, 98, '2026-11-03'), (4, 102, '2026-11-04'),
(5, 600, '2026-11-02'), (5, 650, '2026-11-03'), (5, 580, '2026-11-04'),
(6, 500, '2026-11-04');
CREATE TABLE avisos (id INTEGER PRIMARY KEY, texto TEXT NOT NULL);
INSERT INTO avisos (texto) VALUES
('Só vale desconfiar de quem jogou pelo menos 3 partidas: com uma só, pode ter sido sorte.'),
('Suspeito: média de pontos acima do DOBRO da média geral de todas as partidas.');
`;

const SEED_C49 = `-- Caso: O Consumo de Banda Misterioso
CREATE TABLE usuarios (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);
INSERT INTO usuarios VALUES (1, 'Tadeu Brum'), (2, 'Ubiratã Gil'), (3, 'Vânia Dória'), (4, 'Wellington Paz'), (5, 'Ximena Rocha'), (6, 'Yan Teixeira');
CREATE TABLE dispositivos (id INTEGER PRIMARY KEY, id_usuario INTEGER NOT NULL REFERENCES usuarios(id), apelido TEXT NOT NULL);
INSERT INTO dispositivos VALUES
(1, 1, 'celular'), (2, 2, 'notebook'), (3, 3, 'notebook'), (4, 3, 'celular'),
(5, 4, 'notebook'), (6, 5, 'tablet'), (7, 6, 'celular');
CREATE TABLE consumo (id INTEGER PRIMARY KEY, id_dispositivo INTEGER NOT NULL REFERENCES dispositivos(id), dia TEXT NOT NULL, mb INTEGER NOT NULL);
INSERT INTO consumo (id_dispositivo, dia, mb) VALUES
(1, '2026-11-09', 300), (1, '2026-11-10', 400), (2, '2026-11-09', 500), (2, '2026-11-10', 450),
(3, '2026-11-09', 600), (3, '2026-11-10', 650), (4, '2026-11-10', 700),
(5, '2026-11-09', 900), (5, '2026-11-10', 400), (6, '2026-11-09', 200), (7, '2026-11-10', 350);
CREATE TABLE avisos (id INTEGER PRIMARY KEY, texto TEXT NOT NULL);
INSERT INTO avisos (texto) VALUES
('Cada pessoa pode ter mais de um aparelho: some o consumo de todos.'),
('O consumo é registrado por aparelho, em megabytes (mb), por dia.');
`;

const SEED_C50 = `-- Caso: A Porta Aberta
CREATE TABLE responsaveis (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);
INSERT INTO responsaveis VALUES (1, 'Zélio Barros'), (2, 'Alícia Sena'), (3, 'Bruno Faria'), (4, 'Carla Duarte'), (5, 'Diego Tomé'), (6, 'Estela Maia');
CREATE TABLE hosts (id INTEGER PRIMARY KEY, id_resp INTEGER NOT NULL REFERENCES responsaveis(id), nome TEXT NOT NULL);
INSERT INTO hosts VALUES (1, 1, 'srv-web'), (2, 2, 'srv-bd'), (3, 3, 'srv-arq'), (4, 4, 'pc-lab1'), (5, 5, 'pc-lab2'), (6, 6, 'srv-mail');
CREATE TABLE portas_autorizadas (porta INTEGER PRIMARY KEY);
INSERT INTO portas_autorizadas VALUES (22), (80), (443);
CREATE TABLE portas_abertas (id INTEGER PRIMARY KEY, id_host INTEGER NOT NULL REFERENCES hosts(id), porta INTEGER NOT NULL, aberta_em TEXT NOT NULL);
INSERT INTO portas_abertas (id_host, porta, aberta_em) VALUES
(1, 80, '09:00'), (1, 443, '09:00'), (2, 3306, '10:30'), (2, 22, '10:30'),
(3, 22, '19:15'), (4, 22, '20:00'), (5, 8080, '21:10'), (6, 25, '08:45');
CREATE TABLE avisos (id INTEGER PRIMARY KEY, texto TEXT NOT NULL);
INSERT INTO avisos (texto) VALUES
('Entre 08:00 e 18:00 a equipe de redes pode abrir qualquer porta para testes.'),
('Depois das 18:00 só as portas da tabela portas_autorizadas podem ficar abertas.');
`;

const SEED_C59 = `-- Caso: O Acesso Forçado
CREATE TABLE usuarios (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, perfil TEXT NOT NULL);
INSERT INTO usuarios VALUES
(1, 'Fábio Tavares', 'Secretaria'), (2, 'Gisele Arruda', 'Professora'), (3, 'Horácio Leal', 'Professor'),
(4, 'Ingrid Sales', 'Coordenação'), (5, 'Jonas Pádua', 'Professor'), (6, 'Kátia Bomfim', 'Secretaria');
CREATE TABLE logins (
  id INTEGER PRIMARY KEY, id_usuario INTEGER NOT NULL REFERENCES usuarios(id),
  horario TEXT NOT NULL, ip TEXT NOT NULL, sucesso INTEGER NOT NULL
);
INSERT INTO logins (id_usuario, horario, ip, sucesso) VALUES
(1, '08:00', '200.17.141.20', 1),
(2, '09:00', '200.17.141.30', 0), (2, '09:05', '200.17.141.30', 0), (2, '09:10', '200.17.141.30', 1),
(3, '10:00', '200.17.141.41', 0), (3, '10:05', '200.17.141.41', 0), (3, '10:09', '200.17.141.41', 0),
(4, '03:00', '185.220.101.4', 0), (4, '03:01', '185.220.101.4', 0), (4, '03:02', '185.220.101.4', 0), (4, '03:05', '185.220.101.4', 1),
(5, '11:00', '200.17.141.52', 1), (5, '11:30', '200.17.141.52', 0), (5, '11:31', '200.17.141.52', 0), (5, '11:32', '200.17.141.52', 0),
(6, '13:00', '200.17.141.60', 0), (6, '13:02', '200.17.141.60', 1);
CREATE TABLE avisos (id INTEGER PRIMARY KEY, texto TEXT NOT NULL);
INSERT INTO avisos (texto) VALUES
('Sucesso = 1 e falha = 0 na coluna sucesso.'),
('Força bruta: 3 ou mais falhas seguidas por um acesso com sucesso DEPOIS delas.');
`;

const SEED_C60 = `-- Caso: O Vazamento das Notas
CREATE TABLE usuarios (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, perfil TEXT NOT NULL);
INSERT INTO usuarios VALUES
(1, 'Marta Colares', 'Secretaria'), (2, 'Nilton Aguiar', 'Professor'), (3, 'Olímpia Santos', 'Aluno'),
(4, 'Plínio Veras', 'Estagiário'), (5, 'Quitéria Lobo', 'Professor'), (6, 'Renato Gouveia', 'Aluno');
CREATE TABLE arquivos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, sigiloso INTEGER NOT NULL);
INSERT INTO arquivos VALUES (1, 'notas_finais.xlsx', 1), (2, 'cardapio.pdf', 0), (3, 'senhas_prof.txt', 1), (4, 'horarios.pdf', 0);
CREATE TABLE downloads (
  id INTEGER PRIMARY KEY, id_usuario INTEGER NOT NULL REFERENCES usuarios(id),
  id_arquivo INTEGER NOT NULL REFERENCES arquivos(id), horario TEXT NOT NULL
);
INSERT INTO downloads (id_usuario, id_arquivo, horario) VALUES
(1, 1, '21:00'), (2, 2, '20:00'), (3, 1, '10:00'), (4, 3, '23:40'), (5, 4, '22:00'), (6, 1, '14:00');
CREATE TABLE avisos (id INTEGER PRIMARY KEY, texto TEXT NOT NULL);
INSERT INTO avisos (texto) VALUES
('O vazamento foi de um arquivo sigiloso (sigiloso = 1), baixado depois das 18:00.'),
('Só quem tem perfil Secretaria pode baixar arquivos sigilosos.');
`;

export const DESV_CASOS_MAIS: DesvCaso[] = [
  {
    "id": "c17",
    "disciplina": "Lógica",
    "tipo": "logica",
    "titulo": "A Merenda Sumida",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "A caixa de merenda do lanche sumiu da Cozinha da escola. Três funcionários estavam em locais diferentes, cada um com um objeto diferente.",
    "pergunta": "Quem estava na Cozinha e levou a merenda?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Rui"
      },
      {
        "id": 2,
        "nome": "Sara"
      },
      {
        "id": 3,
        "nome": "Tiago"
      }
    ],
    "locais": [
      "Cozinha",
      "Refeitório",
      "Pátio"
    ],
    "objetoRotulo": "Objeto",
    "objetos": [
      "Colher",
      "Balde",
      "Avental"
    ],
    "pistas": [
      "Rui estava com o balde.",
      "Quem estava no Pátio usava a colher.",
      "Tiago estava com a colher.",
      "O balde não estava na Cozinha."
    ],
    "dicas": [
      "Comece pelas pistas que dão um objeto a alguém.",
      "Cada local e cada objeto aparecem uma única vez."
    ]
  },
  {
    "id": "c18",
    "disciplina": "Lógica",
    "tipo": "logica",
    "titulo": "O Violão Desaparecido",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "O violão da turma sumiu da Sala de Música durante o intervalo. Três estudantes estavam em lugares diferentes, cada um com um objeto diferente.",
    "pergunta": "Quem estava na Sala de Música e levou o violão?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Vítor"
      },
      {
        "id": 2,
        "nome": "Wanda"
      },
      {
        "id": 3,
        "nome": "Xavier"
      }
    ],
    "locais": [
      "Sala de Música",
      "Auditório",
      "Quadra"
    ],
    "objetoRotulo": "Objeto",
    "objetos": [
      "Capa",
      "Afinador",
      "Palheta"
    ],
    "pistas": [
      "O afinador não estava na Sala de Música.",
      "A palheta não estava na Sala de Música.",
      "Xavier estava no Auditório ou na Sala de Música.",
      "Wanda estava com a palheta.",
      "O afinador não estava no Auditório."
    ],
    "dicas": [
      "Se um objeto só pode estar em um lugar, elimine os outros.",
      "Anote numa tabela o que cada pista descarta."
    ]
  },
  {
    "id": "c19",
    "disciplina": "Lógica",
    "tipo": "logica",
    "titulo": "O Medalhão do Interclasse",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "O medalhão do campeão do Interclasse sumiu da Secretaria. Quatro pessoas estavam no prédio, cada uma em um lugar e com um objeto diferente.",
    "pergunta": "Quem estava na Secretaria e pegou o medalhão?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yago"
      },
      {
        "id": 2,
        "nome": "Zélia"
      },
      {
        "id": 3,
        "nome": "Alan"
      },
      {
        "id": 4,
        "nome": "Bruna"
      }
    ],
    "locais": [
      "Secretaria",
      "Quadra",
      "Cantina",
      "Biblioteca"
    ],
    "objetoRotulo": "Objeto",
    "objetos": [
      "Apito",
      "Cronômetro",
      "Prancheta",
      "Bandeira"
    ],
    "pistas": [
      "Alan estava na Cantina ou na Secretaria.",
      "Quem estava na Biblioteca usava o cronômetro.",
      "Alan não estava com a prancheta.",
      "Bruna estava na Biblioteca ou na Cantina.",
      "Alan não estava na Secretaria.",
      "Quem estava na Quadra usava o apito.",
      "Yago não estava com a prancheta."
    ],
    "dicas": [
      "Procure primeiro as pistas que prendem uma pessoa a um objeto.",
      "Quando sobrar um só lugar para alguém, marque."
    ]
  },
  {
    "id": "c20",
    "disciplina": "Lógica",
    "tipo": "logica",
    "titulo": "O Segredo do Arquivo",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Uma ata confidencial desapareceu do Arquivo. Quatro funcionários estavam em setores diferentes, cada um com um objeto de trabalho diferente.",
    "pergunta": "Quem estava no Arquivo e levou a ata?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Cássio"
      },
      {
        "id": 2,
        "nome": "Dora"
      },
      {
        "id": 3,
        "nome": "Ênio"
      },
      {
        "id": 4,
        "nome": "Flávia"
      }
    ],
    "locais": [
      "Arquivo",
      "Diretoria",
      "Protocolo",
      "Almoxarifado"
    ],
    "objetoRotulo": "Objeto",
    "objetos": [
      "Carimbo",
      "Pasta",
      "Grampeador",
      "Chave"
    ],
    "pistas": [
      "Dora estava no Almoxarifado ou no Protocolo.",
      "Flávia estava no Almoxarifado ou no Protocolo.",
      "Ênio estava com a chave.",
      "Quem estava na Diretoria usava o carimbo.",
      "Flávia não estava com a pasta.",
      "A pasta não estava no Almoxarifado."
    ],
    "dicas": [
      "Uma pista do tipo \"ou\" restringe bastante: use-a cedo.",
      "Teste a hipótese e veja se alguma pista é quebrada."
    ]
  },
  {
    "id": "c21",
    "disciplina": "Lógica",
    "tipo": "logica",
    "titulo": "O Sumiço dos Tablets",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "O carrinho de tablets sumiu do Laboratório. Cinco pessoas estavam na escola, cada uma em um lugar e com um objeto diferente.",
    "pergunta": "Quem estava no Laboratório e levou os tablets?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Gilda"
      },
      {
        "id": 2,
        "nome": "Hélio"
      },
      {
        "id": 3,
        "nome": "Ivete"
      },
      {
        "id": 4,
        "nome": "Jair"
      },
      {
        "id": 5,
        "nome": "Karina"
      }
    ],
    "locais": [
      "Sala de Aula",
      "Laboratório",
      "Sala dos Professores",
      "Biblioteca",
      "Pátio"
    ],
    "objetoRotulo": "Objeto",
    "objetos": [
      "Mochila",
      "Carrinho",
      "Chave",
      "Lanterna",
      "Cadeado"
    ],
    "pistas": [
      "Jair estava com o cadeado.",
      "Gilda estava com a lanterna.",
      "Hélio estava no Laboratório ou na Sala dos Professores.",
      "Ivete estava com a mochila.",
      "Karina não estava no Pátio.",
      "Karina estava no Pátio ou na Sala dos Professores.",
      "Jair estava no Pátio ou na Sala de Aula.",
      "Karina estava com a chave.",
      "Gilda estava no Pátio ou na Sala dos Professores."
    ],
    "dicas": [
      "Com cinco pessoas, faça uma grade de pessoas × locais e outra de pessoas × objetos.",
      "Resolva as pistas mais fortes antes das pistas de negação."
    ]
  },
  {
    "id": "c22",
    "disciplina": "Lógica",
    "tipo": "logica",
    "titulo": "A Chave da Reitoria",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "A chave do cofre sumiu da Reitoria. Cinco pessoas estavam no campus, cada uma em um lugar diferente e com um objeto diferente.",
    "pergunta": "Quem estava na Reitoria e pegou a chave do cofre?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Lauro"
      },
      {
        "id": 2,
        "nome": "Marisa"
      },
      {
        "id": 3,
        "nome": "Nilo"
      },
      {
        "id": 4,
        "nome": "Otília"
      },
      {
        "id": 5,
        "nome": "Pedro"
      }
    ],
    "locais": [
      "Reitoria",
      "Garagem",
      "Guarita",
      "Refeitório",
      "Almoxarifado"
    ],
    "objetoRotulo": "Objeto",
    "objetos": [
      "Rádio",
      "Uniforme",
      "Garrafa",
      "Prancheta",
      "Crachá"
    ],
    "pistas": [
      "Quem estava na Guarita usava o rádio.",
      "Marisa não estava no Almoxarifado.",
      "Marisa estava com o crachá.",
      "Otília estava na Garagem ou no Refeitório.",
      "A prancheta não estava no Refeitório.",
      "Otília não estava na Garagem.",
      "Nilo estava na Garagem ou no Refeitório.",
      "Quem estava na Garagem usava o uniforme.",
      "Lauro estava na Garagem ou na Guarita."
    ],
    "dicas": [
      "Procure combinações que só funcionam de um jeito.",
      "Se uma hipótese gera contradição, descarte-a."
    ]
  },
  {
    "id": "c23",
    "disciplina": "Banco de Dados",
    "tipo": "sql",
    "titulo": "O Boletim Adulterado",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "No fechamento do bimestre, uma nota subiu muito e ninguém sabe quem mexeu. O sistema guarda cada alteração de nota. São seis professores suspeitos.",
    "pergunta": "Quem adulterou a nota? Investigue no banco do caso e acuse.",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Ana Paula Dias"
      },
      {
        "id": 2,
        "nome": "Bernardo Luz"
      },
      {
        "id": 3,
        "nome": "Cátia Mendes"
      },
      {
        "id": 4,
        "nome": "Douglas Ramos"
      },
      {
        "id": 5,
        "nome": "Eunice Prado"
      },
      {
        "id": 6,
        "nome": "Fernando Vaz"
      }
    ],
    "tabelas": "professores, alteracoes_nota, avisos",
    "seed": SEED_C23,
    "dicas": [
      "Os avisos dão dois filtros: o horário limite e o tamanho da correção.",
      "A diferença nota_depois - nota_antes mostra quanto a nota subiu."
    ]
  },
  {
    "id": "c24",
    "disciplina": "Banco de Dados",
    "tipo": "sql",
    "titulo": "O Estoque da Cantina",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "O estoque de refrigerantes da cantina zerou do dia para a noite. Cada movimentação é registrada com o nome de quem a fez. São seis funcionários.",
    "pergunta": "Quem retirou o estoque sem autorização? Investigue no banco do caso e acuse.",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Gabriela Neri"
      },
      {
        "id": 2,
        "nome": "Heitor Sá"
      },
      {
        "id": 3,
        "nome": "Irene Lopes"
      },
      {
        "id": 4,
        "nome": "João Vidal"
      },
      {
        "id": 5,
        "nome": "Karla Teles"
      },
      {
        "id": 6,
        "nome": "Lucas Brito"
      }
    ],
    "tabelas": "funcionarios, movimentos, avisos",
    "seed": SEED_C24,
    "dicas": [
      "Separe entradas de saídas pela coluna tipo.",
      "O aviso dá o limite de 50 unidades."
    ]
  },
  {
    "id": "c25",
    "disciplina": "Banco de Dados",
    "tipo": "sql",
    "titulo": "A Matrícula em Dois Lugares",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Um aluno aparece matriculado em duas turmas que acontecem no mesmo dia e horário, o que é impossível. O sistema guarda as matrículas e os horários de cada turma. São seis alunos.",
    "pergunta": "Quem está matriculado em duas turmas ao mesmo tempo? Investigue no banco do caso e acuse.",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Marina Cruz"
      },
      {
        "id": 2,
        "nome": "Nando Alves"
      },
      {
        "id": 3,
        "nome": "Olga Pires"
      },
      {
        "id": 4,
        "nome": "Paulo Seixas"
      },
      {
        "id": 5,
        "nome": "Quésia Lima"
      },
      {
        "id": 6,
        "nome": "Raul Bastos"
      }
    ],
    "tabelas": "alunos, turmas, matriculas, avisos",
    "seed": SEED_C25,
    "dicas": [
      "Junte matriculas e turmas pelo id da turma.",
      "GROUP BY aluno, dia e horário com HAVING COUNT(*) > 1 acha o conflito."
    ]
  },
  {
    "id": "c26",
    "disciplina": "Banco de Dados",
    "tipo": "sql",
    "titulo": "O Livro que Nunca Voltou",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "A biblioteca fechou o semestre com livros emprestados que nunca voltaram, mas só o de maior valor gera uma ocorrência. Seis usuários têm empréstimos no sistema.",
    "pergunta": "Quem está com o livro mais valioso que nunca foi devolvido? Investigue no banco do caso e acuse.",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Sandra Melo"
      },
      {
        "id": 2,
        "nome": "Tales Nunes"
      },
      {
        "id": 3,
        "nome": "Úrsula Reis"
      },
      {
        "id": 4,
        "nome": "Valdir Cano"
      },
      {
        "id": 5,
        "nome": "Wesley Ito"
      },
      {
        "id": 6,
        "nome": "Yasmim Gois"
      }
    ],
    "tabelas": "usuarios, livros, emprestimos, avisos",
    "seed": SEED_C26,
    "dicas": [
      "Quem não devolveu tem devolucao IS NULL (não use = NULL).",
      "Ordene pelo valor do livro, do maior para o menor, e fique com o primeiro."
    ]
  },
  {
    "id": "c27",
    "disciplina": "Banco de Dados",
    "tipo": "sql",
    "titulo": "O Pagamento em Dobro",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "Um cliente reclamou de ter pago duas vezes o mesmo pedido na cantina. Parcelar um pedido é permitido, mas cobrar mais do que ele vale não é. São seis atendentes.",
    "pergunta": "Quem registrou pagamentos que somam mais do que o valor do pedido? Investigue no banco do caso e acuse.",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Zuleica Prado"
      },
      {
        "id": 2,
        "nome": "Abílio Costa"
      },
      {
        "id": 3,
        "nome": "Beatriz Tole"
      },
      {
        "id": 4,
        "nome": "Clóvis Fraga"
      },
      {
        "id": 5,
        "nome": "Débora Maia"
      },
      {
        "id": 6,
        "nome": "Edgar Pinto"
      }
    ],
    "tabelas": "atendentes, pedidos, pagamentos, avisos",
    "seed": SEED_C27,
    "dicas": [
      "Agrupe os pagamentos por pedido e por atendente.",
      "Compare SUM(valor dos pagamentos) com o valor do pedido."
    ]
  },
  {
    "id": "c28",
    "disciplina": "Banco de Dados",
    "tipo": "sql",
    "titulo": "O Ranking Manipulado",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "O ranking do jogo da escola mostrou um jogador com pontos impossíveis. Um jogador de uma partida só pode ter tido sorte; por isso só vale desconfiar de quem jogou pelo menos 3 vezes e tem média acima do dobro da média geral. São seis jogadores.",
    "pergunta": "Quem manipulou o ranking? Investigue no banco do caso e acuse.",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Fabiana Rios"
      },
      {
        "id": 2,
        "nome": "Gustavo Lage"
      },
      {
        "id": 3,
        "nome": "Helena Dutra"
      },
      {
        "id": 4,
        "nome": "Ivan Moura"
      },
      {
        "id": 5,
        "nome": "Jéssica Alvim"
      },
      {
        "id": 6,
        "nome": "Kléber Souto"
      }
    ],
    "tabelas": "jogadores, partidas, avisos",
    "seed": SEED_C28,
    "dicas": [
      "A média geral vem de uma subconsulta: (SELECT AVG(pontos) FROM partidas).",
      "Use GROUP BY jogador com HAVING para as duas condições."
    ]
  },
  {
    "id": "c29",
    "disciplina": "Construção de Sites",
    "tipo": "codigo",
    "linguagem": "HTML",
    "titulo": "O Link do Contato",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "A página da escola foi publicada com o link de contato quebrado: não abria a página certa, saía do site e, no celular, o botão ficou sem texto. Seis estudantes escreveram versões do link.",
    "pergunta": "De quem é a versão que foi publicada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Aline",
        "codigo": "<a href=\"contato.html\" target=\"_blank\"><img src=\"envelope.png\"></a>"
      },
      {
        "id": 2,
        "nome": "Bento",
        "codigo": "<a href=\"contato.htm\"><img src=\"envelope.png\"></a>"
      },
      {
        "id": 3,
        "nome": "Clara",
        "codigo": "<a href=\"contato.htm\" target=\"_blank\">Fale conosco</a>"
      },
      {
        "id": 4,
        "nome": "Davi",
        "codigo": "<a href=\"contato.htm\" target=\"_blank\"><img src=\"envelope.png\"></a>"
      },
      {
        "id": 5,
        "nome": "Elisa",
        "codigo": "<a href=\"contato.html\"><img src=\"envelope.png\"></a>"
      },
      {
        "id": 6,
        "nome": "Fabrício",
        "codigo": "<a href=\"contato.htm\">Fale conosco</a>"
      }
    ],
    "pistas": [
      "O endereço apontava para contato.htm, um arquivo que não existe (o certo é contato.html).",
      "O link abria em OUTRA aba.",
      "O link não tinha texto: era só uma imagem sem alt."
    ],
    "dicas": [
      "O nome do arquivo no href precisa ser idêntico ao do arquivo, inclusive a extensão.",
      "Abrir em nova aba é função do atributo target=\"_blank\"."
    ]
  },
  {
    "id": "c30",
    "disciplina": "Construção de Sites",
    "tipo": "codigo",
    "linguagem": "HTML",
    "titulo": "A Tabela de Notas",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "A tabela de notas da turma saiu sem destaque no cabeçalho, sem descrição para leitores de tela e quebrou o resto da página. Seis estudantes mexeram nesse trecho.",
    "pergunta": "Qual versão foi publicada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Gabi",
        "codigo": "<table>\n  <tr><td>Aluno</td><td>Nota</td></tr>\n  <tr><td>Ana</td><td>9,0</td></tr>"
      },
      {
        "id": 2,
        "nome": "Hugo",
        "codigo": "<table>\n  <caption>Notas do 1º bimestre</caption>\n  <tr><td>Aluno</td><td>Nota</td></tr>\n  <tr><td>Ana</td><td>9,0</td></tr>"
      },
      {
        "id": 3,
        "nome": "Iara",
        "codigo": "<table>\n  <tr><td>Aluno</td><td>Nota</td></tr>\n  <tr><td>Ana</td><td>9,0</td></tr>\n</table>"
      },
      {
        "id": 4,
        "nome": "Jonas",
        "codigo": "<table>\n  <caption>Notas do 1º bimestre</caption>\n  <tr><th>Aluno</th><th>Nota</th></tr>\n  <tr><td>Ana</td><td>9,0</td></tr>"
      },
      {
        "id": 5,
        "nome": "Kátia",
        "codigo": "<table>\n  <caption>Notas do 1º bimestre</caption>\n  <tr><td>Aluno</td><td>Nota</td></tr>\n  <tr><td>Ana</td><td>9,0</td></tr>\n</table>"
      },
      {
        "id": 6,
        "nome": "Léo",
        "codigo": "<table>\n  <tr><th>Aluno</th><th>Nota</th></tr>\n  <tr><td>Ana</td><td>9,0</td></tr>"
      }
    ],
    "pistas": [
      "O cabeçalho usava <td>, e não <th>.",
      "A tabela não tinha <caption> (legenda).",
      "A tabela ficou aberta: faltava o </table>."
    ],
    "dicas": [
      "Células de cabeçalho têm uma tag própria, diferente de <td>.",
      "Toda tag que abre precisa fechar."
    ]
  },
  {
    "id": "c31",
    "disciplina": "Construção de Sites",
    "tipo": "codigo",
    "linguagem": "HTML",
    "titulo": "O Topo Sem Semântica",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "A auditoria de acessibilidade reprovou a página da feira de ciências: o leitor de tela não reconhecia o topo, o menu nem o conteúdo principal. Seis estudantes enviaram versões do código.",
    "pergunta": "Qual versão foi publicada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Marta",
        "codigo": "<div><h1>Feira de Ciências</h1></div>\n<div class=\"menu\"><a href=\"#projetos\">Projetos</a></div>\n<main><p>Venha conhecer os projetos.</p></main>"
      },
      {
        "id": 2,
        "nome": "Nuno",
        "codigo": "<header><h1>Feira de Ciências</h1></header>\n<nav><a href=\"#projetos\">Projetos</a></nav>\n<div><p>Venha conhecer os projetos.</p></div>"
      },
      {
        "id": 3,
        "nome": "Olga",
        "codigo": "<div><h1>Feira de Ciências</h1></div>\n<nav><a href=\"#projetos\">Projetos</a></nav>\n<main><p>Venha conhecer os projetos.</p></main>"
      },
      {
        "id": 4,
        "nome": "Pablo",
        "codigo": "<header><h1>Feira de Ciências</h1></header>\n<div class=\"menu\"><a href=\"#projetos\">Projetos</a></div>\n<div><p>Venha conhecer os projetos.</p></div>"
      },
      {
        "id": 5,
        "nome": "Quênia",
        "codigo": "<div><h1>Feira de Ciências</h1></div>\n<nav><a href=\"#projetos\">Projetos</a></nav>\n<div><p>Venha conhecer os projetos.</p></div>"
      },
      {
        "id": 6,
        "nome": "Renan",
        "codigo": "<div><h1>Feira de Ciências</h1></div>\n<div class=\"menu\"><a href=\"#projetos\">Projetos</a></div>\n<div><p>Venha conhecer os projetos.</p></div>"
      }
    ],
    "pistas": [
      "O topo era um <div>, e não um <header>.",
      "O menu não estava dentro de <nav>.",
      "O conteúdo principal ficava num <div>, e não em <main>."
    ],
    "dicas": [
      "Tags semânticas dizem ao leitor de tela o papel de cada área da página.",
      "As três tags procuradas são header, nav e main."
    ]
  },
  {
    "id": "c32",
    "disciplina": "Construção de Sites",
    "tipo": "codigo",
    "linguagem": "HTML",
    "titulo": "A Página que Não Cabia no Celular",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "No celular, a página do clube ficou com texto minúsculo, uma foto que passava da borda da tela e um menu espremido em linha. Seis estudantes enviaram versões do cabeçalho e do CSS.",
    "pergunta": "Qual versão foi publicada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Sílvia",
        "codigo": "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<style>\n  img { max-width: 100%; }\n</style>"
      },
      {
        "id": 2,
        "nome": "Tomás",
        "codigo": "<style>\n  img { width: 800px; }\n</style>"
      },
      {
        "id": 3,
        "nome": "Úrsula",
        "codigo": "<style>\n  img { max-width: 100%; }\n  @media (max-width: 600px) { nav { flex-direction: column; } }\n</style>"
      },
      {
        "id": 4,
        "nome": "Vítor",
        "codigo": "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<style>\n  img { width: 800px; }\n</style>"
      },
      {
        "id": 5,
        "nome": "Wanda",
        "codigo": "<style>\n  img { max-width: 100%; }\n</style>"
      },
      {
        "id": 6,
        "nome": "Xavi",
        "codigo": "<style>\n  img { width: 800px; }\n  @media (max-width: 600px) { nav { flex-direction: column; } }\n</style>"
      }
    ],
    "pistas": [
      "Faltava a meta viewport (o texto ficou minúsculo no celular).",
      "A foto tinha largura fixa e passava da borda da tela.",
      "Não havia @media: o menu não virava coluna."
    ],
    "dicas": [
      "Três ingredientes deixam uma página responsiva: viewport, imagens fluidas e media queries.",
      "max-width: 100% impede a imagem de passar do espaço onde está."
    ]
  },
  {
    "id": "c33",
    "disciplina": "Construção de Sites",
    "tipo": "codigo",
    "linguagem": "CSS",
    "titulo": "O Botão Fantasma",
    "nivel": "Detetive",
    "pontos": 100,
    "baseRotulo": "O trecho de HTML da página",
    "base": "<button class=\"comprar\">Comprar</button>\n<p>Texto abaixo do botão</p>",
    "historia": "O botão \"Comprar\" sumiu da loja da escola, mas as pessoas que usam o teclado ainda conseguiam apertá-lo com a tecla Tab. Seis estudantes escreveram a regra de CSS que \"escondeu\" o botão.",
    "pergunta": "De quem é a regra que foi publicada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Gael",
        "codigo": ".comprar { display: none; }"
      },
      {
        "id": 2,
        "nome": "Heitor",
        "codigo": ".comprar { visibility: hidden; }"
      },
      {
        "id": 3,
        "nome": "Iara",
        "codigo": ".comprar { opacity: 0; }"
      },
      {
        "id": 4,
        "nome": "Joana",
        "codigo": ".comprar { position: absolute; left: -9999px; }"
      },
      {
        "id": 5,
        "nome": "Kauê",
        "codigo": ".comprar { color: red; }"
      },
      {
        "id": 6,
        "nome": "Lia",
        "codigo": ".comprar { display: none; opacity: 1; }"
      }
    ],
    "pistas": [
      "O botão não aparecia na tela.",
      "O espaço do botão continuava na página (o texto abaixo não subiu).",
      "O botão ainda podia receber foco com a tecla Tab."
    ],
    "dicas": [
      "display: none tira o elemento do fluxo da página; visibility: hidden e opacity: 0 não.",
      "Elementos invisíveis só recebem foco do teclado se ainda existirem na árvore de acessibilidade."
    ]
  },
  {
    "id": "c34",
    "disciplina": "Construção de Sites",
    "tipo": "codigo",
    "linguagem": "CSS",
    "titulo": "A Caixa de 340 Pixels",
    "nivel": "Mestre",
    "pontos": 120,
    "baseRotulo": "O trecho de HTML da página",
    "base": "<div class=\"caixa\">Conteúdo</div>",
    "historia": "A caixa de destaque do site precisava ocupar exatamente 340px na tela, com 300px de área útil e uma borda visível. Seis estudantes escreveram o CSS. Lembre: sem box-sizing, o padrão é content-box (padding e borda somam à largura).",
    "pergunta": "De quem é o CSS que atende a tudo?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Marta",
        "codigo": ".caixa { width: 300px; padding: 20px; box-sizing: content-box; }"
      },
      {
        "id": 2,
        "nome": "Nuno",
        "codigo": ".caixa { width: 300px; padding: 20px; box-sizing: border-box; }"
      },
      {
        "id": 3,
        "nome": "Olga",
        "codigo": ".caixa { width: 300px; padding: 10px; border: 10px solid #333; }"
      },
      {
        "id": 4,
        "nome": "Pablo",
        "codigo": ".caixa { width: 340px; padding: 20px; box-sizing: border-box; }"
      },
      {
        "id": 5,
        "nome": "Quênia",
        "codigo": ".caixa { width: 340px; padding: 20px; border: 2px solid; box-sizing: border-box; }"
      },
      {
        "id": 6,
        "nome": "Renan",
        "codigo": ".caixa { width: 300px; padding: 20px; border: 2px solid; }"
      }
    ],
    "pistas": [
      "A caixa ocupava 340px de largura TOTAL na tela.",
      "A área útil do conteúdo (dentro do padding) tinha 300px.",
      "A caixa tinha borda visível."
    ],
    "dicas": [
      "Em content-box: largura total = width + padding dos dois lados + borda dos dois lados.",
      "Em border-box, o width já inclui padding e borda."
    ]
  },
  {
    "id": "c35",
    "disciplina": "Informática Básica",
    "tipo": "codigo",
    "linguagem": "Planilha",
    "titulo": "A Soma que Não Fechou",
    "nivel": "Aquecimento",
    "pontos": 60,
    "baseRotulo": "As notas na planilha (a fórmula foi escrita em B6)",
    "base": "     |  B\n  2  |  10\n  3  |  20\n  4  |  30\n  5  |  40\n  6  |  ?",
    "historia": "A planilha de arrecadação da gincana tinha quatro valores e um total que precisava dar 100. Seis monitores escreveram uma fórmula para a célula B6, e só uma foi para a planilha oficial.",
    "pergunta": "De quem é a fórmula que deu o total certo?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Ana",
        "codigo": "=SOMA(B2:B5)"
      },
      {
        "id": 2,
        "nome": "Bruno",
        "codigo": "=B2+B3+B4+B5"
      },
      {
        "id": 3,
        "nome": "Caio",
        "codigo": "=SOMA(B2;B3;B4;B5)"
      },
      {
        "id": 4,
        "nome": "Duda",
        "codigo": "=SOMA(B2:B4)"
      },
      {
        "id": 5,
        "nome": "Enzo",
        "codigo": "=MEDIA(B2:B5)"
      },
      {
        "id": 6,
        "nome": "Fábia",
        "codigo": "=B2+B3+B4"
      }
    ],
    "pistas": [
      "O total exibido foi 100.",
      "A fórmula usava a função SOMA.",
      "A fórmula usava o intervalo com dois pontos (ex.: B2:B5)."
    ],
    "dicas": [
      "Calcule cada fórmula com 10, 20, 30 e 40.",
      "B2:B5 é o intervalo de B2 até B5; B2;B5 são só duas células."
    ]
  },
  {
    "id": "c36",
    "disciplina": "Informática Básica",
    "tipo": "codigo",
    "linguagem": "E-mail",
    "titulo": "O Anexo da Prova",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "O professor reclamou de um e-mail com a prova: chegou sem o arquivo, sem assunto e todo mundo da turma via o endereço dos colegas. Seis monitores escreveram versões do e-mail.",
    "pergunta": "Qual versão foi enviada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Giane",
        "codigo": "Para: professor@ifs.edu.br\nCco: turma1a@ifs.edu.br\nAssunto: \nAnexo: (nenhum)"
      },
      {
        "id": 2,
        "nome": "Heitor",
        "codigo": "Para: professor@ifs.edu.br\nCc: turma1a@ifs.edu.br\nAssunto: Prova de Lógica\nAnexo: prova.pdf"
      },
      {
        "id": 3,
        "nome": "Ivone",
        "codigo": "Para: professor@ifs.edu.br\nCco: turma1a@ifs.edu.br\nAssunto: Prova de Lógica\nAnexo: (nenhum)"
      },
      {
        "id": 4,
        "nome": "Júlio",
        "codigo": "Para: professor@ifs.edu.br\nCc: turma1a@ifs.edu.br\nAssunto: \nAnexo: prova.pdf"
      },
      {
        "id": 5,
        "nome": "Karen",
        "codigo": "Para: professor@ifs.edu.br\nCc: turma1a@ifs.edu.br\nAssunto: \nAnexo: (nenhum)"
      },
      {
        "id": 6,
        "nome": "Lauro",
        "codigo": "Para: professor@ifs.edu.br\nCc: turma1a@ifs.edu.br\nAssunto: Prova de Lógica\nAnexo: (nenhum)"
      }
    ],
    "pistas": [
      "O e-mail chegou sem o anexo da prova.",
      "O e-mail chegou sem assunto.",
      "Todos viram os endereços dos colegas (a turma estava em Cc, e não em Cco)."
    ],
    "dicas": [
      "Cco esconde os destinatários uns dos outros; Cc mostra.",
      "Confira com atenção as linhas Assunto e Anexo."
    ]
  },
  {
    "id": "c37",
    "disciplina": "Informática Básica",
    "tipo": "codigo",
    "linguagem": "Documento",
    "titulo": "O Trabalho sem Estilos",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "O trabalho da turma deu dor de cabeça: o painel de navegação ficou vazio, os números das páginas não acompanharam as mudanças e o sumário ficou desatualizado. Seis alunos entregaram versões do arquivo.",
    "pergunta": "Qual versão foi entregue?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Marcelo",
        "codigo": "Títulos: estilo Título 1\nNúmero das páginas: automático, no rodapé\nSumário: digitado à mão"
      },
      {
        "id": 2,
        "nome": "Nair",
        "codigo": "Títulos: negrito aplicado à mão\nNúmero das páginas: automático, no rodapé\nSumário: gerado automaticamente"
      },
      {
        "id": 3,
        "nome": "Otto",
        "codigo": "Títulos: negrito aplicado à mão\nNúmero das páginas: digitado à mão\nSumário: digitado à mão"
      },
      {
        "id": 4,
        "nome": "Paloma",
        "codigo": "Títulos: estilo Título 1\nNúmero das páginas: digitado à mão\nSumário: digitado à mão"
      },
      {
        "id": 5,
        "nome": "Quirino",
        "codigo": "Títulos: negrito aplicado à mão\nNúmero das páginas: automático, no rodapé\nSumário: digitado à mão"
      },
      {
        "id": 6,
        "nome": "Rita",
        "codigo": "Títulos: negrito aplicado à mão\nNúmero das páginas: digitado à mão\nSumário: gerado automaticamente"
      }
    ],
    "pistas": [
      "Os títulos eram só texto em negrito: o painel de navegação ficou vazio.",
      "Os números das páginas foram digitados à mão e não mudaram.",
      "O sumário foi digitado à mão e não atualizava com um clique."
    ],
    "dicas": [
      "O painel de navegação só enxerga parágrafos com estilos de título.",
      "Numeração e sumário automáticos se atualizam sozinhos."
    ]
  },
  {
    "id": "c38",
    "disciplina": "Informática Básica",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "O Computador que Não Rodava o Jogo",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "O jogo educativo travou em um computador do laboratório: pouca memória, disco lento e fonte fraca. Seis fichas técnicas foram anexadas ao chamado.",
    "pergunta": "De quem é a ficha do computador que travou?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Sandro",
        "codigo": "Processador: Core i3\nMemória RAM: 4 GB\nArmazenamento: HD 500 GB\nFonte: 300 W"
      },
      {
        "id": 2,
        "nome": "Tânia",
        "codigo": "Processador: Core i3\nMemória RAM: 4 GB\nArmazenamento: SSD 512 GB\nFonte: 500 W"
      },
      {
        "id": 3,
        "nome": "Ubirajara",
        "codigo": "Processador: Core i3\nMemória RAM: 16 GB\nArmazenamento: HD 500 GB\nFonte: 300 W"
      },
      {
        "id": 4,
        "nome": "Valéria",
        "codigo": "Processador: Core i3\nMemória RAM: 4 GB\nArmazenamento: SSD 512 GB\nFonte: 300 W"
      },
      {
        "id": 5,
        "nome": "Wesley",
        "codigo": "Processador: Core i3\nMemória RAM: 4 GB\nArmazenamento: HD 500 GB\nFonte: 500 W"
      },
      {
        "id": 6,
        "nome": "Yara",
        "codigo": "Processador: Core i3\nMemória RAM: 16 GB\nArmazenamento: SSD 512 GB\nFonte: 300 W"
      }
    ],
    "pistas": [
      "Tinha menos de 8 GB de memória RAM.",
      "Guardava os arquivos em HD, e não em SSD.",
      "A fonte era de menos de 400 W."
    ],
    "dicas": [
      "Compare cada ficha com as três pistas, uma de cada vez.",
      "SSD é o armazenamento mais rápido; HD tem disco giratório."
    ]
  },
  {
    "id": "c39",
    "disciplina": "Informática Básica",
    "tipo": "codigo",
    "linguagem": "Planilha",
    "titulo": "O Desconto Certo",
    "nivel": "Detetive",
    "pontos": 100,
    "baseRotulo": "O preço na planilha (a fórmula foi escrita em B3)",
    "base": "     |  B\n  2  |  200\n  3  |  ?",
    "historia": "A loja da escola anunciou 10% de desconto em um produto de R$ 200. Seis monitores escreveram uma fórmula para a célula B3, e só uma foi usada na etiqueta.",
    "pergunta": "De quem é a fórmula usada na etiqueta?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Ana",
        "codigo": "=B2*0,9"
      },
      {
        "id": 2,
        "nome": "Bruno",
        "codigo": "=B2-B2/10"
      },
      {
        "id": 3,
        "nome": "Caio",
        "codigo": "=200*0,9"
      },
      {
        "id": 4,
        "nome": "Duda",
        "codigo": "=B2*90"
      },
      {
        "id": 5,
        "nome": "Enzo",
        "codigo": "=B2-10"
      },
      {
        "id": 6,
        "nome": "Fábia",
        "codigo": "=B2*10%"
      }
    ],
    "pistas": [
      "O valor exibido foi 180.",
      "A fórmula usava a referência B2 (e não o número 200 digitado).",
      "A fórmula usava o sinal de multiplicação (*)."
    ],
    "dicas": [
      "10% de desconto é pagar 90% do preço: 200 × 0,9.",
      "Na planilha, 10% é o mesmo que 0,1."
    ]
  },
  {
    "id": "c40",
    "disciplina": "Informática Básica",
    "tipo": "codigo",
    "linguagem": "Documento",
    "titulo": "A Citação nas Normas",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "A banca devolveu o TCC de uma turma com um único aluno dentro da ABNT quanto à citação longa. Lembre: citação com mais de 3 linhas tem recuo de 4 cm, fonte menor que a do texto (10) e precisa constar nas referências.",
    "pergunta": "De quem é a versão que está de acordo com a ABNT?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Zélia",
        "codigo": "Citação longa (mais de 3 linhas): recuo de 4 cm\nFonte da citação: tamanho 12 (igual ao texto)\nReferência no final: SILVA, 2020 consta na lista"
      },
      {
        "id": 2,
        "nome": "Alan",
        "codigo": "Citação longa (mais de 3 linhas): recuo de 4 cm\nFonte da citação: tamanho 10\nReferência no final: SILVA, 2020 não consta na lista"
      },
      {
        "id": 3,
        "nome": "Berta",
        "codigo": "Citação longa (mais de 3 linhas): sem recuo\nFonte da citação: tamanho 12 (igual ao texto)\nReferência no final: SILVA, 2020 consta na lista"
      },
      {
        "id": 4,
        "nome": "Cleber",
        "codigo": "Citação longa (mais de 3 linhas): recuo de 4 cm\nFonte da citação: tamanho 10\nReferência no final: SILVA, 2020 consta na lista"
      },
      {
        "id": 5,
        "nome": "Dalva",
        "codigo": "Citação longa (mais de 3 linhas): recuo de 4 cm\nFonte da citação: tamanho 12 (igual ao texto)\nReferência no final: SILVA, 2020 não consta na lista"
      },
      {
        "id": 6,
        "nome": "Edu",
        "codigo": "Citação longa (mais de 3 linhas): sem recuo\nFonte da citação: tamanho 10\nReferência no final: SILVA, 2020 consta na lista"
      }
    ],
    "pistas": [
      "A citação longa estava recuada 4 cm da margem esquerda.",
      "A citação usava fonte tamanho 10 (menor que o texto).",
      "A fonte citada (SILVA, 2020) constava na lista de referências."
    ],
    "dicas": [
      "Confira as três exigências uma a uma em cada versão.",
      "Só uma versão cumpre as três ao mesmo tempo."
    ]
  },
  {
    "id": "c41",
    "disciplina": "Redes de Computadores",
    "tipo": "codigo",
    "linguagem": "Configuração",
    "titulo": "O PC sem Internet",
    "nivel": "Aquecimento",
    "pontos": 60,
    "baseRotulo": "A rede da escola",
    "base": "Rede da escola: 192.168.1.0/24 · gateway (roteador): 192.168.1.1",
    "historia": "Um computador novo do laboratório não conseguia navegar. A equipe de redes recebeu seis configurações e só uma deixou o PC acessar sites.",
    "pergunta": "De quem é a configuração que funcionou?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Adriano",
        "codigo": "IP: 192.168.1.20\nMáscara: 255.255.255.0\nGateway: 192.168.1.1\nDNS: (não configurado)"
      },
      {
        "id": 2,
        "nome": "Bianca",
        "codigo": "IP: 192.168.1.20\nMáscara: 255.255.255.0\nGateway: 192.168.1.1\nDNS: 8.8.8.8"
      },
      {
        "id": 3,
        "nome": "Cesar",
        "codigo": "IP: 192.168.2.20\nMáscara: 255.255.255.252\nGateway: 192.168.1.1\nDNS: 8.8.8.8"
      },
      {
        "id": 4,
        "nome": "Denise",
        "codigo": "IP: 192.168.1.20\nMáscara: 255.255.255.252\nGateway: 192.168.1.1\nDNS: (não configurado)"
      },
      {
        "id": 5,
        "nome": "Edson",
        "codigo": "IP: 192.168.2.20\nMáscara: 255.255.255.0\nGateway: 192.168.1.1\nDNS: 8.8.8.8"
      },
      {
        "id": 6,
        "nome": "Flávia",
        "codigo": "IP: 192.168.1.20\nMáscara: 255.255.255.252\nGateway: 192.168.1.1\nDNS: 8.8.8.8"
      }
    ],
    "pistas": [
      "O IP estava na mesma rede do roteador (192.168.1.x).",
      "A máscara permitia enxergar o roteador (255.255.255.0).",
      "Havia um servidor DNS configurado."
    ],
    "dicas": [
      "Para falar com o roteador, IP e gateway precisam estar na mesma sub-rede.",
      "Sem DNS, o computador não traduz nomes de sites em IPs."
    ]
  },
  {
    "id": "c42",
    "disciplina": "Redes de Computadores",
    "tipo": "codigo",
    "linguagem": "Terminal",
    "titulo": "O Ping da Prova",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Antes da prova online, seis técnicos testaram a conexão com o servidor. Só um teste mostrou uma rede saudável.",
    "pergunta": "De quem é o teste que mostrou a rede saudável?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Gilberto",
        "codigo": "> ping www.ifs.edu.br\nResposta de 200.17.141.1: tempo=142 ms\n4 enviados, 2 recebidos (50% de perda)"
      },
      {
        "id": 2,
        "nome": "Hilda",
        "codigo": "> ping 200.17.141.1\nResposta de 200.17.141.1: tempo=142 ms\n4 enviados, 4 recebidos (0% de perda)"
      },
      {
        "id": 3,
        "nome": "Ivan",
        "codigo": "> ping www.ifs.edu.br\nResposta de 200.17.141.1: tempo=18 ms\n4 enviados, 2 recebidos (50% de perda)"
      },
      {
        "id": 4,
        "nome": "Janaína",
        "codigo": "> ping www.ifs.edu.br\nResposta de 200.17.141.1: tempo=142 ms\n4 enviados, 4 recebidos (0% de perda)"
      },
      {
        "id": 5,
        "nome": "Kléber",
        "codigo": "> ping www.ifs.edu.br\nResposta de 200.17.141.1: tempo=18 ms\n4 enviados, 4 recebidos (0% de perda)"
      },
      {
        "id": 6,
        "nome": "Lúcia",
        "codigo": "> ping 200.17.141.1\nResposta de 200.17.141.1: tempo=18 ms\n4 enviados, 4 recebidos (0% de perda)"
      }
    ],
    "pistas": [
      "Nenhum pacote se perdeu (0% de perda).",
      "A resposta veio em menos de 50 ms.",
      "O teste foi feito pelo nome do site (www.ifs.edu.br), e não pelo IP."
    ],
    "dicas": [
      "Perda de pacotes e tempo alto são sinais de rede com problemas.",
      "Pingar pelo nome também testa o DNS."
    ]
  },
  {
    "id": "c43",
    "disciplina": "Redes de Computadores",
    "tipo": "codigo",
    "linguagem": "Configuração",
    "titulo": "O Conflito de IP",
    "nivel": "Detetive",
    "pontos": 100,
    "baseRotulo": "A rede do laboratório",
    "base": "Rede 192.168.0.0/24 · gateway correto: 192.168.0.1\nIPs já em uso: 192.168.0.10, .11 e .120\nO DHCP distribui de .100 a .200 (servidores fixos devem ficar fora dessa faixa).",
    "historia": "O novo servidor de arquivos derrubou parte do laboratório assim que foi ligado. Seis técnicos propuseram uma configuração de IP fixo, e só uma não gerava nenhum problema.",
    "pergunta": "De quem é a configuração correta?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Moisés",
        "codigo": "IP: 192.168.0.150\nMáscara: 255.255.255.0\nGateway: 192.168.0.254"
      },
      {
        "id": 2,
        "nome": "Nádia",
        "codigo": "IP: 192.168.0.10\nMáscara: 255.255.255.0\nGateway: 192.168.0.1"
      },
      {
        "id": 3,
        "nome": "Orestes",
        "codigo": "IP: 192.168.0.150\nMáscara: 255.255.255.0\nGateway: 192.168.0.1"
      },
      {
        "id": 4,
        "nome": "Priscila",
        "codigo": "IP: 192.168.0.50\nMáscara: 255.255.255.0\nGateway: 192.168.0.254"
      },
      {
        "id": 5,
        "nome": "Quincas",
        "codigo": "IP: 192.168.0.120\nMáscara: 255.255.255.0\nGateway: 192.168.0.1"
      },
      {
        "id": 6,
        "nome": "Rosália",
        "codigo": "IP: 192.168.0.50\nMáscara: 255.255.255.0\nGateway: 192.168.0.1"
      }
    ],
    "pistas": [
      "O IP escolhido não estava em uso por outra máquina.",
      "O IP ficava fora da faixa do DHCP (.100 a .200).",
      "O gateway estava correto (192.168.0.1)."
    ],
    "dicas": [
      "Dois dispositivos com o mesmo IP geram conflito.",
      "Um IP fixo dentro da faixa do DHCP pode ser entregue a outro aparelho depois."
    ]
  },
  {
    "id": "c44",
    "disciplina": "Redes de Computadores",
    "tipo": "codigo",
    "linguagem": "Terminal",
    "titulo": "O Traceroute Interrompido",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "Seis técnicos rodaram o traceroute até o servidor da escola. Só um mostrou uma rota curta, saudável e chegando ao destino.",
    "pergunta": "De quem é o traceroute da rota saudável?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Samuel",
        "codigo": "> traceroute 200.17.141.1\n1  192.168.1.1   1 ms\n2  10.0.0.1   4 ms\n3  200.17.141.1   12 ms"
      },
      {
        "id": 2,
        "nome": "Telma",
        "codigo": "> traceroute 200.17.141.1\n1  192.168.1.1   1 ms\n2  10.0.0.1   4 ms\n3  * * *   (esgotado)"
      },
      {
        "id": 3,
        "nome": "Ugo",
        "codigo": "> traceroute 200.17.141.1\n1  192.168.1.1   1 ms\n2  10.0.0.1   4 ms\n3  172.16.0.1   30 ms\n4  172.16.1.1   35 ms\n5  200.17.141.1   12 ms"
      },
      {
        "id": 4,
        "nome": "Vera",
        "codigo": "> traceroute 200.17.141.1\n1  192.168.1.1   1 ms\n2  10.0.0.1   85 ms\n3  200.17.141.1   12 ms"
      },
      {
        "id": 5,
        "nome": "Wagner",
        "codigo": "> traceroute 200.17.141.1\n1  192.168.1.1   1 ms\n2  10.0.0.1   4 ms\n3  172.16.0.1   30 ms\n4  172.16.1.1   35 ms\n5  * * *   (esgotado)"
      },
      {
        "id": 6,
        "nome": "Zilá",
        "codigo": "> traceroute 200.17.141.1\n1  192.168.1.1   1 ms\n2  10.0.0.1   85 ms\n3  172.16.0.1   30 ms\n4  172.16.1.1   35 ms\n5  200.17.141.1   12 ms"
      }
    ],
    "pistas": [
      "O último salto respondeu (o destino foi alcançado).",
      "A rota passou por apenas 3 saltos.",
      "O segundo salto respondeu em menos de 10 ms."
    ],
    "dicas": [
      "Cada linha do traceroute é um salto (roteador no caminho).",
      "\"* * *\" significa que o salto não respondeu."
    ]
  },
  {
    "id": "c45",
    "disciplina": "Redes de Computadores",
    "tipo": "codigo",
    "linguagem": "Regras",
    "titulo": "A Regra do Firewall",
    "nivel": "Mestre",
    "pontos": 120,
    "baseRotulo": "O que o firewall precisava fazer",
    "base": "O site da escola roda em 10.0.0.10, porta 80. Só a rede do laboratório (192.168.1.0/24) deveria acessar.",
    "historia": "O firewall da escola foi configurado e o acesso ao site do laboratório funcionou como esperado. Seis técnicos enviaram a regra que escreveram.",
    "pergunta": "De quem é a regra que foi aplicada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Abel",
        "codigo": "permitir udp 192.168.1.0/24 -> 10.0.0.10:80"
      },
      {
        "id": 2,
        "nome": "Bruna",
        "codigo": "permitir tcp qualquer -> 10.0.0.10:80"
      },
      {
        "id": 3,
        "nome": "Caetano",
        "codigo": "permitir tcp 192.168.1.0/24 -> 10.0.0.10:80"
      },
      {
        "id": 4,
        "nome": "Débora",
        "codigo": "bloquear udp 192.168.1.0/24 -> 10.0.0.10:80"
      },
      {
        "id": 5,
        "nome": "Elias",
        "codigo": "permitir udp qualquer -> 10.0.0.10:80"
      },
      {
        "id": 6,
        "nome": "Fátima",
        "codigo": "bloquear tcp 192.168.1.0/24 -> 10.0.0.10:80"
      }
    ],
    "pistas": [
      "A regra permitia o acesso (e não bloqueava).",
      "A regra valia só para o protocolo TCP.",
      "A regra liberava apenas a rede do laboratório (192.168.1.0/24)."
    ],
    "dicas": [
      "HTTP funciona sobre TCP.",
      "Libere apenas a origem necessária, nunca \"qualquer\"."
    ]
  },
  {
    "id": "c46",
    "disciplina": "Redes de Computadores",
    "tipo": "logica",
    "titulo": "A Queda do Wi-Fi",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "O Wi-Fi da escola caiu porque alguém desligou um equipamento na Sala de Redes. Três técnicos estavam em locais diferentes, cada um com um equipamento.",
    "pergunta": "Quem estava na Sala de Redes e desligou o Wi-Fi?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Ícaro"
      },
      {
        "id": 2,
        "nome": "Joice"
      },
      {
        "id": 3,
        "nome": "Kleiton"
      }
    ],
    "locais": [
      "Sala de Redes",
      "Biblioteca",
      "Auditório"
    ],
    "objetoRotulo": "Equipamento",
    "objetos": [
      "Switch",
      "Roteador",
      "Cabo de rede"
    ],
    "pistas": [
      "Kleiton não estava no Auditório.",
      "Joice estava na Biblioteca ou na Sala de Redes.",
      "Kleiton não estava na Sala de Redes.",
      "Quem estava no Auditório usava o roteador.",
      "O switch não estava na Biblioteca."
    ],
    "dicas": [
      "Cada técnico tem um equipamento e um local só dele.",
      "Cruze as pistas de equipamento com as de local."
    ]
  },
  {
    "id": "c47",
    "disciplina": "Redes de Computadores",
    "tipo": "logica",
    "titulo": "O Cabo Cortado",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Um cabo de rede foi cortado no Corredor durante a reforma. Quatro técnicos estavam em lugares diferentes, cada um com uma ferramenta diferente.",
    "pergunta": "Quem estava no Corredor e cortou o cabo?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Leandro"
      },
      {
        "id": 2,
        "nome": "Mirela"
      },
      {
        "id": 3,
        "nome": "Nelson"
      },
      {
        "id": 4,
        "nome": "Odete"
      }
    ],
    "locais": [
      "Laboratório 1",
      "Laboratório 2",
      "Corredor",
      "Sala de Redes"
    ],
    "objetoRotulo": "Ferramenta",
    "objetos": [
      "Alicate",
      "Testador de cabo",
      "Crimpador",
      "Rolo de cabo"
    ],
    "pistas": [
      "Quem estava no Laboratório 2 usava o rolo de cabo.",
      "Nelson estava no Laboratório 2 ou na Sala de Redes.",
      "Leandro estava com o testador de cabo.",
      "Nelson estava com o crimpador.",
      "Mirela estava no Corredor ou na Sala de Redes."
    ],
    "dicas": [
      "O alicate corta cabos: quem poderia tê-lo?",
      "Comece pelas pistas que ligam alguém a uma ferramenta."
    ]
  },
  {
    "id": "c48",
    "disciplina": "Redes de Computadores",
    "tipo": "logica",
    "titulo": "O Switch Desligado",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "O switch principal foi desligado na Sala do Servidor e a rede inteira parou. Cinco pessoas estavam na escola, cada uma em um lugar e com um equipamento diferente.",
    "pergunta": "Quem estava na Sala do Servidor e desligou o switch?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Paula"
      },
      {
        "id": 2,
        "nome": "Quirino"
      },
      {
        "id": 3,
        "nome": "Rosana"
      },
      {
        "id": 4,
        "nome": "Sílvio"
      },
      {
        "id": 5,
        "nome": "Tânia"
      }
    ],
    "locais": [
      "Sala de Redes",
      "Sala do Servidor",
      "Auditório",
      "Biblioteca",
      "Cantina"
    ],
    "objetoRotulo": "Equipamento",
    "objetos": [
      "Switch",
      "Patch panel",
      "Notebook",
      "Cabo de rede",
      "Roteador"
    ],
    "pistas": [
      "Rosana estava na Sala de Redes ou na Sala do Servidor.",
      "Quirino estava com o notebook.",
      "Rosana estava com o switch.",
      "Quem estava na Cantina usava o cabo de rede.",
      "Sílvio estava com o roteador.",
      "Quem estava no Auditório usava o roteador.",
      "Quirino estava na Cantina ou na Sala do Servidor.",
      "Paula não estava com o patch panel."
    ],
    "dicas": [
      "Monte uma grade de cinco linhas e vá riscando.",
      "Pistas do tipo \"quem estava em X usava Y\" valem para todos."
    ]
  },
  {
    "id": "c49",
    "disciplina": "Redes de Computadores",
    "tipo": "sql",
    "titulo": "O Consumo de Banda Misterioso",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "A internet da escola ficou lenta e o gráfico de consumo mostra um usuário puxando muitos dados, somando todos os aparelhos dele. Seis usuários estão cadastrados.",
    "pergunta": "Quem consumiu mais dados no total? Investigue no banco do caso e acuse.",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Tadeu Brum"
      },
      {
        "id": 2,
        "nome": "Ubiratã Gil"
      },
      {
        "id": 3,
        "nome": "Vânia Dória"
      },
      {
        "id": 4,
        "nome": "Wellington Paz"
      },
      {
        "id": 5,
        "nome": "Ximena Rocha"
      },
      {
        "id": 6,
        "nome": "Yan Teixeira"
      }
    ],
    "tabelas": "usuarios, dispositivos, consumo, avisos",
    "seed": SEED_C49,
    "dicas": [
      "O consumo é por aparelho; a pessoa vem da tabela dispositivos.",
      "Agrupe por usuário e some o consumo (SUM) antes de ordenar."
    ]
  },
  {
    "id": "c50",
    "disciplina": "Redes de Computadores",
    "tipo": "sql",
    "titulo": "A Porta Aberta",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "Uma varredura de portas encontrou um serviço aberto fora do permitido. A equipe de redes pode abrir portas para testes entre 08:00 e 18:00, mas fora desse período só as portas autorizadas. Cada servidor tem um responsável. São seis suspeitos.",
    "pergunta": "Quem deixou uma porta não autorizada aberta fora do horário de testes? Investigue no banco do caso e acuse.",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Zélio Barros"
      },
      {
        "id": 2,
        "nome": "Alícia Sena"
      },
      {
        "id": 3,
        "nome": "Bruno Faria"
      },
      {
        "id": 4,
        "nome": "Carla Duarte"
      },
      {
        "id": 5,
        "nome": "Diego Tomé"
      },
      {
        "id": 6,
        "nome": "Estela Maia"
      }
    ],
    "tabelas": "responsaveis, hosts, portas_abertas, portas_autorizadas, avisos",
    "seed": SEED_C50,
    "dicas": [
      "NOT IN (SELECT ...) filtra as portas que não estão na lista autorizada.",
      "Some a condição de horário: aberta_em > '18:00'."
    ]
  },
  {
    "id": "c51",
    "disciplina": "Segurança da Informação",
    "tipo": "codigo",
    "linguagem": "E-mail",
    "titulo": "O Golpe do Boleto",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "A secretaria recebeu seis e-mails sobre um boleto. Só um era phishing, com todos os sinais clássicos de golpe.",
    "pergunta": "Qual e-mail era o golpe?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Álvaro",
        "codigo": "De: suporte@banco-seguro.xyz\nLink: \"banco.com.br/boleto\" -> http://bit.ly/x8Kq2\nMensagem: Seu boleto vence dia 25."
      },
      {
        "id": 2,
        "nome": "Beth",
        "codigo": "De: suporte@banco.com.br\nLink: \"banco.com.br/boleto\" -> https://banco.com.br/boleto\nMensagem: Informe sua senha em 10 minutos ou a conta será bloqueada."
      },
      {
        "id": 3,
        "nome": "Cláudio",
        "codigo": "De: suporte@banco-seguro.xyz\nLink: \"banco.com.br/boleto\" -> http://bit.ly/x8Kq2\nMensagem: Informe sua senha em 10 minutos ou a conta será bloqueada."
      },
      {
        "id": 4,
        "nome": "Dirce",
        "codigo": "De: suporte@banco-seguro.xyz\nLink: \"banco.com.br/boleto\" -> https://banco.com.br/boleto\nMensagem: Seu boleto vence dia 25."
      },
      {
        "id": 5,
        "nome": "Egídio",
        "codigo": "De: suporte@banco.com.br\nLink: \"banco.com.br/boleto\" -> http://bit.ly/x8Kq2\nMensagem: Informe sua senha em 10 minutos ou a conta será bloqueada."
      },
      {
        "id": 6,
        "nome": "Fabíola",
        "codigo": "De: suporte@banco-seguro.xyz\nLink: \"banco.com.br/boleto\" -> https://banco.com.br/boleto\nMensagem: Informe sua senha em 10 minutos ou a conta será bloqueada."
      }
    ],
    "pistas": [
      "O remetente não era do domínio oficial do banco (banco.com.br).",
      "O link mostrado levava a outro endereço, encurtado.",
      "Pedia a senha com urgência."
    ],
    "dicas": [
      "Confira o domínio depois do @ e o destino real do link.",
      "Pressa e pedido de senha são marcas de phishing."
    ]
  },
  {
    "id": "c52",
    "disciplina": "Segurança da Informação",
    "tipo": "codigo",
    "linguagem": "Log",
    "titulo": "O Login Suspeito",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "O servidor da secretaria registrou seis acessos à conta \"secretaria\" nesta semana. Só um tem todos os sinais de ataque por força bruta.",
    "pergunta": "Qual registro é do ataque?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Gustavo",
        "codigo": "1 falha de senha\n14:30 LOGIN OK usuario=secretaria\norigem=185.220.101.4 (Rússia)"
      },
      {
        "id": 2,
        "nome": "Helena",
        "codigo": "7 falhas de senha seguidas\n14:30 LOGIN OK usuario=secretaria\norigem=200.17.141.20 (Sergipe, Brasil)"
      },
      {
        "id": 3,
        "nome": "Igor",
        "codigo": "1 falha de senha\n03:12 LOGIN OK usuario=secretaria\norigem=185.220.101.4 (Rússia)"
      },
      {
        "id": 4,
        "nome": "Joelma",
        "codigo": "7 falhas de senha seguidas\n14:30 LOGIN OK usuario=secretaria\norigem=185.220.101.4 (Rússia)"
      },
      {
        "id": 5,
        "nome": "Kaio",
        "codigo": "7 falhas de senha seguidas\n03:12 LOGIN OK usuario=secretaria\norigem=200.17.141.20 (Sergipe, Brasil)"
      },
      {
        "id": 6,
        "nome": "Luísa",
        "codigo": "7 falhas de senha seguidas\n03:12 LOGIN OK usuario=secretaria\norigem=185.220.101.4 (Rússia)"
      }
    ],
    "pistas": [
      "Antes do acesso, houve 5 ou mais tentativas com senha errada.",
      "O acesso ocorreu de madrugada (entre 00:00 e 05:00).",
      "O IP de origem era de outro país."
    ],
    "dicas": [
      "Ataque de força bruta tenta muitas senhas em sequência.",
      "Compare horário e origem com o uso normal da secretaria."
    ]
  },
  {
    "id": "c53",
    "disciplina": "Segurança da Informação",
    "tipo": "codigo",
    "linguagem": "Configuração",
    "titulo": "A Senha Quebrada",
    "nivel": "Intermediário",
    "pontos": 80,
    "baseRotulo": "A conta atacada",
    "base": "Usuário: ana",
    "historia": "Um ataque quebrou uma senha em poucos segundos. A equipe de segurança listou seis senhas candidatas.",
    "pergunta": "De quem é a senha que foi quebrada em segundos?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Ícaro",
        "codigo": "senha: ana123"
      },
      {
        "id": 2,
        "nome": "Jandira",
        "codigo": "senha: Zq7#k"
      },
      {
        "id": 3,
        "nome": "Klaus",
        "codigo": "senha: ana@Xk9!"
      },
      {
        "id": 4,
        "nome": "Letícia",
        "codigo": "senha: sol2020"
      },
      {
        "id": 5,
        "nome": "Murilo",
        "codigo": "senha: Ana2026ok"
      },
      {
        "id": 6,
        "nome": "Nilza",
        "codigo": "senha: Bola#Azul9"
      }
    ],
    "pistas": [
      "Tinha menos de 8 caracteres.",
      "Não tinha nenhum símbolo especial (como # ou @).",
      "Continha o nome do usuário (ana)."
    ],
    "dicas": [
      "Conte os caracteres e procure símbolos como #, @ e !.",
      "Senhas com o nome do usuário são as primeiras tentadas por atacantes."
    ]
  },
  {
    "id": "c54",
    "disciplina": "Segurança da Informação",
    "tipo": "codigo",
    "linguagem": "Regras",
    "titulo": "A Permissão Aberta",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "O arquivo de notas foi alterado por quem não devia. A auditoria listou seis permissões possíveis do arquivo \"notas.txt\" (formato do Linux: dono, grupo e outros).",
    "pergunta": "Qual permissão deixou o arquivo aberto como na ocorrência?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Otávio",
        "codigo": "-rw-r---w- 1 aluno turma notas.txt"
      },
      {
        "id": 2,
        "nome": "Penha",
        "codigo": "-rw-r--r-- 1 aluno turma notas.txt"
      },
      {
        "id": 3,
        "nome": "Quirino",
        "codigo": "-rw-r--rw- 1 root turma notas.txt"
      },
      {
        "id": 4,
        "nome": "Rosângela",
        "codigo": "-rw-r--rw- 1 aluno turma notas.txt"
      },
      {
        "id": 5,
        "nome": "Sérgio",
        "codigo": "-rw-r----- 1 aluno turma notas.txt"
      },
      {
        "id": 6,
        "nome": "Teresa",
        "codigo": "-rw-r--r-- 1 root turma notas.txt"
      }
    ],
    "pistas": [
      "Qualquer usuário podia LER o arquivo (outros com \"r\").",
      "Qualquer usuário podia ALTERAR o arquivo (outros com \"w\").",
      "O dono do arquivo era o próprio aluno (e não o root)."
    ],
    "dicas": [
      "As três últimas letras da permissão valem para \"outros\" (qualquer usuário).",
      "r = ler, w = escrever, x = executar."
    ]
  },
  {
    "id": "c55",
    "disciplina": "Segurança da Informação",
    "tipo": "codigo",
    "linguagem": "Documento",
    "titulo": "O Plano de Backup",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "Depois do ataque de ransomware, a direção pediu o plano de backup mais seguro. Seis técnicos enviaram a ficha do seu plano.",
    "pergunta": "De quem é o plano que atende às três boas práticas?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Ulisses",
        "codigo": "Cópia fora da escola: sim\nTeste de restauração: nunca feito\nBackup criptografado: sim"
      },
      {
        "id": 2,
        "nome": "Vânia",
        "codigo": "Cópia fora da escola: sim\nTeste de restauração: já feito\nBackup criptografado: não"
      },
      {
        "id": 3,
        "nome": "Wilma",
        "codigo": "Cópia fora da escola: não\nTeste de restauração: nunca feito\nBackup criptografado: sim"
      },
      {
        "id": 4,
        "nome": "Xande",
        "codigo": "Cópia fora da escola: sim\nTeste de restauração: nunca feito\nBackup criptografado: não"
      },
      {
        "id": 5,
        "nome": "Yolanda",
        "codigo": "Cópia fora da escola: sim\nTeste de restauração: já feito\nBackup criptografado: sim"
      },
      {
        "id": 6,
        "nome": "Zacarias",
        "codigo": "Cópia fora da escola: não\nTeste de restauração: já feito\nBackup criptografado: sim"
      }
    ],
    "pistas": [
      "Havia uma cópia fora da escola (off-site).",
      "A restauração já tinha sido testada.",
      "O backup era criptografado."
    ],
    "dicas": [
      "Um backup que nunca foi restaurado em teste pode não funcionar.",
      "Cópia no mesmo prédio não protege contra incêndio ou roubo."
    ]
  },
  {
    "id": "c56",
    "disciplina": "Segurança da Informação",
    "tipo": "logica",
    "titulo": "O Crachá Clonado",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "Um crachá foi clonado e usado para entrar na Sala de TI. Três pessoas estavam em lugares diferentes, cada uma com um objeto diferente.",
    "pergunta": "Quem estava na Sala de TI e clonou o crachá?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Ubirajara"
      },
      {
        "id": 2,
        "nome": "Valéria"
      },
      {
        "id": 3,
        "nome": "Wilson"
      }
    ],
    "locais": [
      "Portaria",
      "Biblioteca",
      "Sala de TI"
    ],
    "objetoRotulo": "Objeto",
    "objetos": [
      "Leitor RFID",
      "Crachá",
      "Notebook"
    ],
    "pistas": [
      "Wilson estava na Biblioteca ou na Portaria.",
      "Quem estava na Biblioteca usava o notebook.",
      "Wilson não estava com o crachá.",
      "Ubirajara estava na Biblioteca ou na Portaria.",
      "O crachá não estava na Sala de TI."
    ],
    "dicas": [
      "Quem tem o leitor RFID tem como clonar.",
      "Cruze objeto e local pessoa por pessoa."
    ]
  },
  {
    "id": "c57",
    "disciplina": "Segurança da Informação",
    "tipo": "logica",
    "titulo": "O Pendrive Suspeito",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Um pendrive infectado foi plugado em um computador do Laboratório. Quatro pessoas estavam em lugares diferentes, cada uma com um objeto diferente.",
    "pergunta": "Quem estava no Laboratório e plugou o pendrive?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Xênia"
      },
      {
        "id": 2,
        "nome": "Yuri"
      },
      {
        "id": 3,
        "nome": "Zilda"
      },
      {
        "id": 4,
        "nome": "Adão"
      }
    ],
    "locais": [
      "Laboratório",
      "Secretaria",
      "Biblioteca",
      "Auditório"
    ],
    "objetoRotulo": "Objeto",
    "objetos": [
      "Pendrive",
      "Cabo USB",
      "Mouse",
      "HD externo"
    ],
    "pistas": [
      "Zilda estava no Auditório ou na Secretaria.",
      "Adão estava com o cabo USB.",
      "Xênia estava no Auditório ou na Secretaria.",
      "Yuri estava no Auditório ou no Laboratório.",
      "O pendrive não estava na Secretaria.",
      "Zilda estava com o HD externo.",
      "Xênia não estava no Auditório."
    ],
    "dicas": [
      "Quem pode ter o pendrive suspeito?",
      "Elimine locais e objetos que não combinam."
    ]
  },
  {
    "id": "c58",
    "disciplina": "Segurança da Informação",
    "tipo": "logica",
    "titulo": "A Senha na Parede",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "A senha do Wi-Fi dos professores apareceu colada na parede da Sala dos Professores. Cinco pessoas estavam em lugares diferentes, cada uma com um objeto diferente.",
    "pergunta": "Quem estava na Sala dos Professores e colou a senha na parede?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Benedito"
      },
      {
        "id": 2,
        "nome": "Cíntia"
      },
      {
        "id": 3,
        "nome": "Dario"
      },
      {
        "id": 4,
        "nome": "Eliana"
      },
      {
        "id": 5,
        "nome": "Fausto"
      }
    ],
    "locais": [
      "Sala dos Professores",
      "Secretaria",
      "Coordenação",
      "Corredor",
      "Cantina"
    ],
    "objetoRotulo": "Objeto",
    "objetos": [
      "Post-it",
      "Caneta",
      "Agenda",
      "Marcador",
      "Celular"
    ],
    "pistas": [
      "Benedito estava na Cantina ou na Secretaria.",
      "Quem estava na Cantina usava o celular.",
      "Eliana não estava com o celular.",
      "Eliana estava na Cantina ou na Secretaria.",
      "Fausto estava com a caneta.",
      "Dario estava na Cantina ou na Sala dos Professores.",
      "Quem estava no Corredor usava o marcador.",
      "Dario estava com o post-it."
    ],
    "dicas": [
      "Anote cada pista na grade assim que ler.",
      "Pistas de negação costumam fechar os últimos casos."
    ]
  },
  {
    "id": "c59",
    "disciplina": "Segurança da Informação",
    "tipo": "sql",
    "titulo": "O Acesso Forçado",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "Uma conta do sistema foi invadida por força bruta: várias tentativas erradas e, depois, um acesso com sucesso. O servidor guarda cada login. São seis usuários.",
    "pergunta": "Qual conta foi invadida? Investigue no banco do caso e acuse.",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Fábio Tavares"
      },
      {
        "id": 2,
        "nome": "Gisele Arruda"
      },
      {
        "id": 3,
        "nome": "Horácio Leal"
      },
      {
        "id": 4,
        "nome": "Ingrid Sales"
      },
      {
        "id": 5,
        "nome": "Jonas Pádua"
      },
      {
        "id": 6,
        "nome": "Kátia Bomfim"
      }
    ],
    "tabelas": "usuarios, logins, avisos",
    "seed": SEED_C59,
    "dicas": [
      "Junte logins duas vezes: uma para as falhas (sucesso = 0) e outra para o sucesso.",
      "O sucesso precisa ter horário maior que o da falha."
    ]
  },
  {
    "id": "c60",
    "disciplina": "Segurança da Informação",
    "tipo": "sql",
    "titulo": "O Vazamento das Notas",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "Um arquivo sigiloso foi baixado de madrugada e vazou na internet. O servidor guarda cada download, e só a Secretaria tem autorização para baixar arquivos sigilosos. São seis usuários.",
    "pergunta": "Quem baixou o arquivo sigiloso sem ter autorização, fora do horário? Investigue no banco do caso e acuse.",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Marta Colares"
      },
      {
        "id": 2,
        "nome": "Nilton Aguiar"
      },
      {
        "id": 3,
        "nome": "Olímpia Santos"
      },
      {
        "id": 4,
        "nome": "Plínio Veras"
      },
      {
        "id": 5,
        "nome": "Quitéria Lobo"
      },
      {
        "id": 6,
        "nome": "Renato Gouveia"
      }
    ],
    "tabelas": "usuarios, arquivos, downloads, avisos",
    "seed": SEED_C60,
    "dicas": [
      "Junte usuarios, downloads e arquivos.",
      "Três condições: sigiloso = 1, horário depois das 18:00 e perfil diferente de Secretaria."
    ]
  }
];
