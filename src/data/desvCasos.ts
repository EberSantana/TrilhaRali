/**
 * Desvendando com Conhecimento: casos de mistério em que só uma resposta pode ser provada.
 * Inspirado nos enigmas do perfil @clube.enigma (Clube do Enigma) no Instagram.
 * O gabarito NÃO fica aqui: o servidor (Apps Script, DESV_GABARITO) confere a acusação.
 * desvCasos.test.ts prova que cada caso tem uma única solução.
 */

export interface DesvSuspeito {
  id: number;
  nome: string;
  detalhe?: string;
  /** casos de código: o trecho que essa pessoa escreveu */
  codigo?: string;
}

interface DesvBase {
  id: string;
  disciplina: 'Lógica' | 'Banco de Dados' | 'Construção de Sites' | 'Informática Básica';
  titulo: string;
  nivel: 'Aquecimento' | 'Intermediário' | 'Detetive' | 'Mestre';
  pontos: number;
  historia: string;
  pergunta: string;
  suspeitos: DesvSuspeito[];
  dicas: string[];
}

export interface DesvCasoLogica extends DesvBase {
  tipo: 'logica';
  locais: string[];
  objetos: string[];
  objetoRotulo: string;
  pistas: string[];
}

export interface DesvCasoSql extends DesvBase {
  tipo: 'sql';
  seed: string;
  tabelas: string;
}

/** Construção de Sites e Informática Básica: cada suspeito tem uma evidência (código, ficha, e-mail, fórmula...); antes: um trecho de HTML ou CSS; as pistas descrevem o efeito na página */
export interface DesvCasoCodigo extends DesvBase {
  tipo: 'codigo';
  linguagem: 'HTML' | 'CSS' | 'Ficha técnica' | 'E-mail' | 'Documento' | 'Planilha';
  /** código comum a todos os suspeitos (a página onde o trecho entrou) */
  base?: string;
  /** título do bloco base (padrão: "Página onde o trecho entrou") */
  baseRotulo?: string;
  pistas: string[];
}

export type DesvCaso = DesvCasoLogica | DesvCasoSql | DesvCasoCodigo;

const SEED_NOTEBOOK = `-- Caso: O Notebook do Laboratório 2
CREATE TABLE suspeitos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  funcao TEXT NOT NULL,
  altura_cm INTEGER NOT NULL,
  cor_mochila TEXT NOT NULL
);
INSERT INTO suspeitos VALUES
(1, 'Arthur Lima', 'Aluno', 182, 'vermelha'),
(2, 'Beatriz Souza', 'Aluna', 165, 'vermelha'),
(3, 'Carlos Dias', 'Técnico de laboratório', 178, 'preta'),
(4, 'Daniela Reis', 'Professora', 170, 'azul'),
(5, 'Eduardo Nunes', 'Aluno', 188, 'vermelha'),
(6, 'Fernanda Melo', 'Aluna', 176, 'vermelha'),
(7, 'Gustavo Pires', 'Vigilante', 181, 'preta'),
(8, 'Helena Cruz', 'Aluna', 159, 'verde');

-- Registros da catraca de cada sala (horário HH:MM)
CREATE TABLE catraca (
  id INTEGER PRIMARY KEY,
  id_suspeito INTEGER NOT NULL REFERENCES suspeitos(id),
  sala TEXT NOT NULL,
  entrada TEXT NOT NULL,
  saida TEXT NOT NULL
);
INSERT INTO catraca (id_suspeito, sala, entrada, saida) VALUES
(1, 'Laboratório 2', '13:00', '13:50'),
(1, 'Biblioteca', '14:00', '15:00'),
(2, 'Laboratório 2', '14:12', '14:40'),
(3, 'Laboratório 2', '14:05', '14:30'),
(4, 'Sala dos Professores', '13:00', '16:00'),
(5, 'Quadra', '13:00', '14:10'),
(5, 'Laboratório 2', '14:15', '14:20'),
(5, 'Biblioteca', '14:30', '15:00'),
(6, 'Laboratório 2', '14:00', '14:12'),
(6, 'Cantina', '14:15', '14:45'),
(7, 'Laboratório 2', '15:00', '15:10'),
(8, 'Laboratório 1', '14:00', '15:00');

CREATE TABLE depoimentos (
  id INTEGER PRIMARY KEY,
  id_suspeito INTEGER NOT NULL REFERENCES suspeitos(id),
  texto TEXT NOT NULL
);
INSERT INTO depoimentos (id_suspeito, texto) VALUES
(4, 'Às 14:15 o notebook ainda estava na bancada do Laboratório 2. Às 14:25 tinha sumido.'),
(8, 'Do corredor, vi alguém com uma mochila VERMELHA saindo apressado do Laboratório 2.'),
(7, 'Pela câmera do corredor dá para ver que a pessoa era alta: mais de 1,75 m.'),
(3, 'Eu fiquei no fundo do laboratório consertando um projetor e não vi nada.');
`;

const SEED_PLACAR = `-- Caso: A Fraude no Placar do Interclasse
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  turma TEXT NOT NULL
);
INSERT INTO usuarios VALUES
(1, 'Isadora Brito', '1A'),
(2, 'João Pedro Sá', '2B'),
(3, 'Kauã Moreira', '2B'),
(4, 'Larissa Teles', '3A'),
(5, 'Marcos Vieira', 'Professor'),
(6, 'Natália Gomes', '1A'),
(7, 'Otávio Ramos', '3A'),
(8, 'Rafaela Torres', '2B');

CREATE TABLE maquinas (
  ip TEXT PRIMARY KEY,
  sala TEXT NOT NULL
);
INSERT INTO maquinas VALUES
('10.0.0.5', 'Coordenação de Esportes'),
('10.0.0.23', 'Laboratório 3'),
('10.0.0.31', 'Laboratório 3'),
('10.0.0.40', 'Biblioteca');

-- Quem estava logado em qual máquina (horário HH:MM)
CREATE TABLE sessoes (
  id INTEGER PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuarios(id),
  ip TEXT NOT NULL REFERENCES maquinas(ip),
  inicio TEXT NOT NULL,
  fim TEXT NOT NULL
);
INSERT INTO sessoes (id_usuario, ip, inicio, fim) VALUES
(5, '10.0.0.5', '17:00', '17:30'),
(1, '10.0.0.23', '20:00', '21:00'),
(2, '10.0.0.23', '21:30', '21:44'),
(8, '10.0.0.23', '21:45', '21:55'),
(3, '10.0.0.31', '21:40', '22:00'),
(4, '10.0.0.40', '21:00', '22:00'),
(6, '10.0.0.40', '19:00', '19:40'),
(7, '10.0.0.31', '18:00', '18:30');

-- Todo comando que alterou o banco do placar
CREATE TABLE alteracoes (
  id INTEGER PRIMARY KEY,
  horario TEXT NOT NULL,
  ip TEXT NOT NULL,
  comando TEXT NOT NULL
);
INSERT INTO alteracoes (horario, ip, comando) VALUES
('17:10', '10.0.0.5', 'UPDATE placar SET pontos = 12 WHERE turma = ''2B'''),
('17:12', '10.0.0.5', 'UPDATE placar SET pontos = 15 WHERE turma = ''3A'''),
('18:10', '10.0.0.31', 'INSERT INTO fotos (evento) VALUES (''Final de vôlei'')'),
('20:30', '10.0.0.23', 'UPDATE agenda SET local = ''Quadra 2'' WHERE id = 4'),
('21:47', '10.0.0.23', 'UPDATE placar SET pontos = 99 WHERE turma = ''2B''');

CREATE TABLE avisos (
  id INTEGER PRIMARY KEY,
  texto TEXT NOT NULL
);
INSERT INTO avisos (texto) VALUES
('Só a Coordenação de Esportes pode mudar o placar, e só em horário de expediente (até 18:00).'),
('O sistema registra o IP de toda alteração, mas não o usuário.');
`;

const SEED_LIVRO = `-- Caso: O Livro Raro da Biblioteca
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  turma TEXT NOT NULL
);
INSERT INTO usuarios VALUES
(1, 'Abel Cardoso', '1A'),
(2, 'Bianca Lemos', '1A'),
(3, 'Cauã Ribeiro', '2B'),
(4, 'Dayane Pinto', '2B'),
(5, 'Elias Barros', '3A'),
(6, 'Flávia Rocha', '3A'),
(7, 'Gil Araújo', 'Professor'),
(8, 'Hana Duarte', '1A');

-- Quem pode entrar na sala de Obras Raras
CREATE TABLE permissoes (
  id INTEGER PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuarios(id),
  area TEXT NOT NULL
);
INSERT INTO permissoes (id_usuario, area) VALUES
(1, 'Acervo Geral'),
(2, 'Obras Raras'),
(3, 'Obras Raras'),
(4, 'Obras Raras'),
(5, 'Obras Raras'),
(6, 'Obras Raras'),
(7, 'Acervo Geral'),
(8, 'Acervo Geral');

-- Entradas e saídas da Biblioteca no dia do sumiço (horário HH:MM)
CREATE TABLE acessos (
  id INTEGER PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuarios(id),
  entrada TEXT NOT NULL,
  saida TEXT NOT NULL,
  porta TEXT NOT NULL
);
INSERT INTO acessos (id_usuario, entrada, saida, porta) VALUES
(1, '15:00', '15:50', 'principal'),
(2, '15:00', '15:30', 'lateral'),
(2, '16:30', '16:50', 'principal'),
(3, '16:10', '16:45', 'lateral'),
(4, '16:20', '17:30', 'principal'),
(5, '17:10', '17:40', 'lateral'),
(6, '14:00', '15:30', 'lateral'),
(7, '16:05', '16:50', 'principal'),
(8, '16:50', '17:20', 'lateral');

CREATE TABLE avisos (
  id INTEGER PRIMARY KEY,
  texto TEXT NOT NULL
);
INSERT INTO avisos (texto) VALUES
('O livro raro foi conferido na estante às 16:00 e a falta foi notada às 17:00.'),
('Só quem tem permissão para Obras Raras consegue abrir a vitrine.'),
('O detector da porta principal apita com livros sem baixa. Quem levou o livro saiu pela porta lateral.');
`;

const SEED_CAIXA = `-- Caso: O Desvio no Caixa da Cantina
CREATE TABLE funcionarios (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL
);
INSERT INTO funcionarios VALUES
(1, 'Ivo Prado', 'Caixa'),
(2, 'Joana Veras', 'Caixa'),
(3, 'Kleber Dantas', 'Atendente'),
(4, 'Lívia Matos', 'Caixa'),
(5, 'Marcelo Sena', 'Atendente'),
(6, 'Nair Campos', 'Caixa'),
(7, 'Orlando Reis', 'Gerente'),
(8, 'Priscila Neves', 'Atendente');

-- Turnos de cada pessoa no caixa (horário HH:MM)
CREATE TABLE turnos (
  id INTEGER PRIMARY KEY,
  id_func INTEGER NOT NULL REFERENCES funcionarios(id),
  dia TEXT NOT NULL,
  inicio TEXT NOT NULL,
  fim TEXT NOT NULL
);
INSERT INTO turnos (id_func, dia, inicio, fim) VALUES
(1, '2026-11-09', '08:00', '12:00'),
(1, '2026-11-10', '08:00', '12:00'),
(1, '2026-11-11', '08:00', '13:00'),
(2, '2026-11-09', '12:00', '18:00'),
(2, '2026-11-10', '14:00', '18:00'),
(2, '2026-11-11', '12:00', '18:00'),
(3, '2026-11-09', '08:00', '12:00'),
(3, '2026-11-10', '14:00', '18:00'),
(3, '2026-11-11', '14:00', '18:00'),
(4, '2026-11-09', '09:00', '13:00'),
(4, '2026-11-10', '08:00', '14:00'),
(4, '2026-11-11', '08:00', '13:00'),
(5, '2026-11-09', '09:00', '11:00'),
(5, '2026-11-10', '15:00', '17:00'),
(5, '2026-11-11', '11:30', '13:00'),
(6, '2026-11-09', '13:00', '18:00'),
(6, '2026-11-10', '15:00', '18:00'),
(7, '2026-11-09', '10:00', '10:10'),
(7, '2026-11-10', '15:30', '16:00'),
(7, '2026-11-11', '12:00', '12:30'),
(8, '2026-11-09', '08:00', '10:14'),
(8, '2026-11-10', '15:41', '18:00'),
(8, '2026-11-11', '12:06', '15:00');

-- Todo estorno feito no caixa; estorno legítimo tem nota fiscal
CREATE TABLE estornos (
  id INTEGER PRIMARY KEY,
  dia TEXT NOT NULL,
  horario TEXT NOT NULL,
  valor REAL NOT NULL,
  nota_fiscal TEXT
);
INSERT INTO estornos (dia, horario, valor, nota_fiscal) VALUES
('2026-11-09', '10:15', 89.90, NULL),
('2026-11-09', '14:00', 32.00, 'NF-2217'),
('2026-11-10', '09:00', 18.50, 'NF-2230'),
('2026-11-10', '15:40', 120.00, NULL),
('2026-11-11', '12:05', 75.50, NULL);

CREATE TABLE avisos (
  id INTEGER PRIMARY KEY,
  texto TEXT NOT NULL
);
INSERT INTO avisos (texto) VALUES
('Estorno sem nota fiscal é irregular: foram três, em três dias seguidos.'),
('O sistema não grava quem fez o estorno, só o dia e o horário.'),
('Quem desviou o dinheiro estava de turno no caixa nos três estornos irregulares.');
`;

export const DESV_CASOS: DesvCaso[] = [
  {
    id: 'c1',
    disciplina: 'Lógica',
    tipo: 'logica',
    titulo: 'O Troféu da Feira de Ciências',
    nivel: 'Aquecimento',
    pontos: 60,
    historia:
      'Na manhã da Feira de Ciências, o troféu sumiu do Laboratório. Três estudantes estavam no prédio, cada um em um lugar diferente e cada um com um objeto diferente.',
    pergunta: 'Quem estava no Laboratório e levou o troféu?',
    suspeitos: [
      { id: 1, nome: 'Ana' },
      { id: 2, nome: 'Bruno' },
      { id: 3, nome: 'Caio' },
    ],
    locais: ['Biblioteca', 'Laboratório', 'Quadra'],
    objetoRotulo: 'Objeto',
    objetos: ['Escada', 'Crachá clonado', 'Chave reserva'],
    pistas: [
      'Ana estava com a escada.',
      'Quem estava na Biblioteca usava o crachá clonado.',
      'Bruno não esteve no Laboratório nem na Biblioteca.',
      'Caio não estava com a chave reserva.',
    ],
    dicas: ['Comece pelo Bruno: só sobra um lugar para ele.', 'Quem está com a escada pode estar na Biblioteca?'],
  },
  {
    id: 'c2',
    disciplina: 'Lógica',
    tipo: 'logica',
    titulo: 'Sabotagem no Servidor da Escola',
    nivel: 'Intermediário',
    pontos: 80,
    historia:
      'O servidor da escola foi desligado de propósito na Sala de Redes, bem na hora da prova online. Quatro pessoas estavam no prédio, cada uma num local e com um equipamento diferente.',
    pergunta: 'Quem estava na Sala de Redes e sabotou o servidor?',
    suspeitos: [
      { id: 1, nome: 'Diego' },
      { id: 2, nome: 'Elisa' },
      { id: 3, nome: 'Fábio' },
      { id: 4, nome: 'Gabi' },
    ],
    locais: ['Sala de Redes', 'Cantina', 'Secretaria', 'Auditório'],
    objetoRotulo: 'Equipamento',
    objetos: ['Notebook', 'Cabo de rede', 'Celular', 'Pendrive'],
    pistas: [
      'Quem estava na Cantina usava o celular.',
      'Elisa estava com o notebook.',
      'Fábio estava no Auditório ou na Cantina.',
      'Diego não estava com o cabo de rede nem com o pendrive.',
      'O notebook não estava na Sala de Redes nem no Auditório.',
      'Quem estava no Auditório não tinha o pendrive.',
    ],
    dicas: ['Descubra primeiro onde está o notebook: a Cantina já tem o celular.', 'Se Diego só pode ter um equipamento, onde ele está?'],
  },
  {
    id: 'c3',
    disciplina: 'Banco de Dados',
    tipo: 'sql',
    titulo: 'O Notebook do Laboratório 2',
    nivel: 'Detetive',
    pontos: 100,
    historia:
      'O notebook novo do Laboratório 2 desapareceu à tarde. As câmeras de dentro da sala estavam desligadas para manutenção, mas a catraca registra quem entra e sai, e quatro pessoas deram depoimento. São oito suspeitos.',
    pergunta: 'Quem levou o notebook? Investigue no banco do caso e acuse.',
    suspeitos: [
      { id: 1, nome: 'Arthur Lima' },
      { id: 2, nome: 'Beatriz Souza' },
      { id: 3, nome: 'Carlos Dias' },
      { id: 4, nome: 'Daniela Reis' },
      { id: 5, nome: 'Eduardo Nunes' },
      { id: 6, nome: 'Fernanda Melo' },
      { id: 7, nome: 'Gustavo Pires' },
      { id: 8, nome: 'Helena Cruz' },
    ],
    tabelas: 'suspeitos, catraca, depoimentos',
    seed: SEED_NOTEBOOK,
    dicas: [
      'Leia os depoimentos primeiro: SELECT * FROM depoimentos;',
      'Use JOIN entre catraca e suspeitos e filtre a sala e a janela de horário em que o notebook sumiu.',
    ],
  },
  {
    id: 'c4',
    disciplina: 'Banco de Dados',
    tipo: 'sql',
    titulo: 'A Fraude no Placar do Interclasse',
    nivel: 'Mestre',
    pontos: 120,
    historia:
      'Na manhã da final, o placar do Interclasse amanheceu com 99 pontos para uma turma. Alguém mexeu no banco de dados à noite. O sistema guarda o IP de cada alteração e as sessões de quem estava logado em cada máquina. São oito suspeitos.',
    pergunta: 'Quem fraudou o placar? Prove pelo banco do caso e acuse.',
    suspeitos: [
      { id: 1, nome: 'Isadora Brito' },
      { id: 2, nome: 'João Pedro Sá' },
      { id: 3, nome: 'Kauã Moreira' },
      { id: 4, nome: 'Larissa Teles' },
      { id: 5, nome: 'Marcos Vieira' },
      { id: 6, nome: 'Natália Gomes' },
      { id: 7, nome: 'Otávio Ramos' },
      { id: 8, nome: 'Rafaela Torres' },
    ],
    tabelas: 'usuarios, maquinas, sessoes, alteracoes, avisos',
    seed: SEED_PLACAR,
    dicas: [
      'Leia os avisos e procure em alteracoes o comando no placar feito fora do horário permitido.',
      'Com o IP e o horário da alteração, procure em sessoes quem estava logado NAQUELE momento (inicio <= horário <= fim).',
    ],
  },
{
    id: 'c5',
    disciplina: 'Construção de Sites',
    tipo: 'codigo',
    linguagem: 'HTML',
    titulo: 'O Link do Cardápio',
    nivel: 'Aquecimento',
    pontos: 60,
    historia:
      'A página da cantina foi publicada com dois problemas: o link do cardápio tirou o visitante do site e um leitor de tela não conseguiu descrever a foto do prato. Seis estudantes mexeram nesse trecho, cada um em uma versão.',
    pergunta: 'De quem é a versão que foi publicada?',
    suspeitos: [
      { id: 1, nome: 'Ana', codigo: '<a href="cardapio.pdf" target="_blank">Cardápio</a>\n<img src="prato.jpg" alt="Prato do dia">' },
      { id: 2, nome: 'Bruno', codigo: '<a href="cardapio.html">Cardápio</a>\n<img src="prato.jpg">' },
      { id: 3, nome: 'Caio', codigo: '<a href="cardapio.pdf">Cardápio</a>\n<img src="prato.jpg" alt="Prato do dia">' },
      { id: 4, nome: 'Duda', codigo: '<a href="cardapio.pdf">Cardápio</a>\n<img src="prato.jpg">' },
      { id: 5, nome: 'Enzo', codigo: '<a href="cardapio.pdf" target="_blank">Cardápio</a>\n<img src="prato.jpg">' },
      { id: 6, nome: 'Fábia', codigo: '<a href="#cardapio">Cardápio</a>\n<img src="prato.jpg" title="Prato do dia">' },
    ],
    pistas: [
      'O link publicado abria o arquivo cardapio.pdf.',
      'O link abria na MESMA aba, e o visitante saía do site.',
      'A foto não tinha texto alternativo para leitores de tela (o atributo title não serve para isso).',
    ],
    dicas: ['Qual atributo faz um link abrir em nova aba?', 'O texto alternativo de uma imagem fica no atributo alt.'],
  },
  {
    id: 'c6',
    disciplina: 'Construção de Sites',
    tipo: 'codigo',
    linguagem: 'HTML',
    titulo: 'O Formulário do Interclasse',
    nivel: 'Intermediário',
    pontos: 80,
    base: '<form action="/inscricao" method="post">\n  <!-- aqui entrou o trecho de cada suspeito -->\n</form>',
    historia:
      'As inscrições do Interclasse deram errado: chegaram e-mails sem @, ninguém conseguia enviar o formulário e os alunos reclamaram que o rótulo do campo "não funcionava". Seis estudantes enviaram versões do trecho do formulário.',
    pergunta: 'Qual versão foi publicada?',
    suspeitos: [
      { id: 1, nome: 'Gael', codigo: '<label for="email">E-mail</label>\n<input id="email" type="email">\n<button type="submit">Enviar</button>' },
      { id: 2, nome: 'Heloísa', codigo: '<label for="email">E-mail</label>\n<input id="email" type="text">\n<button type="reset">Enviar</button>' },
      { id: 3, nome: 'Igor', codigo: '<label>E-mail</label>\n<input id="email" type="text">\n<button type="reset">Enviar</button>' },
      { id: 4, nome: 'Júlia', codigo: '<label>E-mail <input type="text"></label>\n<button type="reset">Enviar</button>' },
      { id: 5, nome: 'Luan', codigo: '<label>E-mail</label>\n<input type="email">\n<button type="reset">Enviar</button>' },
      { id: 6, nome: 'Maya', codigo: '<label>E-mail</label>\n<input type="text">\n<button>Enviar</button>' },
    ],
    pistas: [
      'O navegador aceitava e-mail sem @: não havia validação de e-mail.',
      'Clicar no botão apagava tudo o que foi digitado, em vez de enviar.',
      'Clicar no texto "E-mail" NÃO levava o cursor para o campo.',
    ],
    dicas: [
      'Um botão dentro de um <form> sem type envia o formulário. Qual type apaga os campos?',
      'O rótulo leva o cursor ao campo quando tem for igual ao id do campo, ou quando envolve o campo.',
    ],
  },
  {
    id: 'c7',
    disciplina: 'Construção de Sites',
    tipo: 'codigo',
    linguagem: 'CSS',
    titulo: 'O Botão Invisível',
    nivel: 'Detetive',
    pontos: 100,
    base: '<button id="comprar" class="btn destaque">Comprar</button>',
    historia:
      'Na loja virtual da feira, o botão "Comprar" sumiu: o texto ficou branco num fundo branco. Oito estudantes mandaram uma folha de estilo para esse botão, e só uma foi publicada. Lembre: id vence classe, classe vence elemento e, no empate, vale a regra que vem depois.',
    pergunta: 'De quem é o CSS que deixou o botão invisível?',
    suspeitos: [
      { id: 1, nome: 'Nina', codigo: '.btn { color: white; background: white; }\n#comprar { background: green; }' },
      { id: 2, nome: 'Otto', codigo: '#comprar { color: white; }\n.destaque { color: black; background: white; }' },
      { id: 3, nome: 'Pietra', codigo: '.btn.destaque { color: white; }\n.btn { background: white; }' },
      { id: 4, nome: 'Quim', codigo: 'button { color: white; background: white; }\n.btn { color: navy; }' },
      { id: 5, nome: 'Rosa', codigo: '.destaque { background: white; }\n#comprar { color: white; background: navy; }' },
      { id: 6, nome: 'Saulo', codigo: 'button { background: white; }\n#comprar { color: white; }\n.btn { background: #222; }' },
      { id: 7, nome: 'Tainá', codigo: '#comprar { color: black; }\n.btn.destaque { color: white; background: white; }' },
      { id: 8, nome: 'Uriel', codigo: '.btn { color: white; background: white; }\n.btn { background: gray; }' },
    ],
    pistas: [
      'No resultado final, o texto e o fundo do botão ficaram brancos.',
      'A regra que deixou o TEXTO branco usava o seletor de id (#comprar).',
    ],
    dicas: [
      'Para cada versão, descubra qual regra vence na cor do texto e qual vence no fundo.',
      'Duas versões deixam o botão branco no branco. A pista 2 separa as duas.',
    ],
  },
  {
    id: 'c8',
    disciplina: 'Construção de Sites',
    tipo: 'codigo',
    linguagem: 'CSS',
    titulo: 'A Vitrine que Estourou',
    nivel: 'Mestre',
    pontos: 120,
    base:
      '<div class="vitrine">\n  <div class="card">Bolo</div>\n  <div class="card">Pastel</div>\n  <div class="card">Suco</div>\n</div>\n\n/* CSS comum a todas as versões */\n.vitrine { width: 800px; }\n.card { flex-shrink: 0; }',
    historia:
      'A vitrine da cantina tem 800px de largura, mas os três cartões passaram da borda e ficou uma barra de rolagem. Oito estudantes enviaram o CSS da vitrine. Atenção ao modelo de caixa: no padrão (content-box), padding e borda SOMAM à largura; com border-box, ficam DENTRO dela.',
    pergunta: 'De quem é o CSS que fez a vitrine estourar?',
    suspeitos: [
      { id: 1, nome: 'Vera', codigo: '.vitrine { display: flex; }\n.card { width: 260px; padding: 20px; box-sizing: border-box; }' },
      { id: 2, nome: 'Wagner', codigo: '.vitrine { display: flex; }\n.card { width: 260px; padding: 20px; }' },
      { id: 3, nome: 'Xavier', codigo: '.vitrine { display: block; }\n.card { width: 260px; padding: 20px; }' },
      { id: 4, nome: 'Yasmin', codigo: '.vitrine { display: flex; flex-direction: column; }\n.card { width: 280px; padding: 10px; }' },
      { id: 5, nome: 'Zeca', codigo: '.vitrine { display: flex; }\n.card { width: 280px; border: 10px solid #ccc; }' },
      { id: 6, nome: 'Alice', codigo: '.vitrine { display: flex; }\n.card { width: 300px; padding: 30px; box-sizing: border-box; }' },
      { id: 7, nome: 'Benício', codigo: '.vitrine { display: grid; }\n.card { width: 260px; padding: 20px; }' },
      { id: 8, nome: 'Cecília', codigo: '.vitrine { display: flex; flex-wrap: wrap; }\n.card { width: 260px; padding: 20px; }' },
    ],
    pistas: [
      'Os três cartões ficaram na MESMA linha, lado a lado.',
      'Cada cartão ocupava 300px de largura total na tela (3 × 300 = 900px, mais que os 800px da vitrine).',
      'A área de conteúdo de cada cartão, sem padding e sem borda, tinha 260px.',
    ],
    dicas: [
      'display: block e grid (sem colunas) empilham; flex-wrap: wrap joga o que não cabe para a linha de baixo.',
      'Largura total no content-box = width + padding dos dois lados + borda dos dois lados.',
    ],
  },
{
    id: 'c9',
    disciplina: 'Informática Básica',
    tipo: 'codigo',
    linguagem: 'Ficha técnica',
    titulo: 'A Máquina Trocada da Sala Maker',
    nivel: 'Aquecimento',
    pontos: 60,
    historia:
      'O computador de edição de vídeo da Sala Maker foi trocado por outro durante o recesso. Seis técnicos montaram máquinas naquela semana e cada um deixou a ficha técnica da sua. A máquina encontrada na sala foi examinada.',
    pergunta: 'De quem é a máquina que apareceu na Sala Maker?',
    suspeitos: [
      { id: 1, nome: 'Ana', codigo: 'Memória RAM: 8 GB\nArmazenamento: HD 1 TB\nSistema: Linux Ubuntu' },
      { id: 2, nome: 'Bruno', codigo: 'Memória RAM: 16 GB\nArmazenamento: SSD 512 GB\nSistema: Windows 11' },
      { id: 3, nome: 'Caio', codigo: 'Memória RAM: 8 GB\nArmazenamento: SSD 256 GB\nSistema: Windows 11' },
      { id: 4, nome: 'Duda', codigo: 'Memória RAM: 8 GB\nArmazenamento: SSD 480 GB\nSistema: Linux Mint' },
      { id: 5, nome: 'Enzo', codigo: 'Memória RAM: 4 GB\nArmazenamento: SSD 240 GB\nSistema: Linux Ubuntu' },
      { id: 6, nome: 'Fábia', codigo: 'Memória RAM: 4 GB\nArmazenamento: SSD 1 TB + pendrive de 8 GB\nSistema: Linux Mint' },
    ],
    pistas: [
      'A máquina encontrada tinha 8 GB de memória RAM (pendrive não é memória RAM).',
      'O armazenamento era um SSD, sem partes mecânicas.',
      'O sistema operacional era um software livre.',
    ],
    dicas: ['HD tem disco e cabeça de leitura que se movem; SSD usa chips de memória flash.', 'Linux é software livre; o Windows é proprietário.'],
  },
  {
    id: 'c10',
    disciplina: 'Informática Básica',
    tipo: 'codigo',
    linguagem: 'E-mail',
    titulo: 'O E-mail da Prova Vazada',
    nivel: 'Intermediário',
    pontos: 80,
    historia:
      'A prova de amanhã chegou na caixa de entrada da turma do 2º B. Seis pessoas enviaram e-mails sobre a prova naquela tarde. O provedor guardou o cabeçalho de cada mensagem enviada.',
    pergunta: 'Quem enviou o e-mail que vazou a prova?',
    suspeitos: [
      { id: 1, nome: 'Gael', codigo: 'Para: coordenacao@escola.edu.br\nCco: turma2b@escola.edu.br\nAnexo: prova.pdf' },
      { id: 2, nome: 'Heloísa', codigo: 'Para: turma2b@escola.edu.br\nAnexo: prova.pdf' },
      { id: 3, nome: 'Igor', codigo: 'Para: coordenacao@escola.edu.br\nCc: turma2b@escola.edu.br\nAnexo: prova.pdf' },
      { id: 4, nome: 'Júlia', codigo: 'Para: coordenacao@escola.edu.br\nCc: turma2b@escola.edu.br\nAnexo: gabarito.docx' },
      { id: 5, nome: 'Luan', codigo: 'Para: coordenacao@escola.edu.br\nCc: turma2b@escola.edu.br\nAnexo: (nenhum)' },
      { id: 6, nome: 'Maya', codigo: 'Para: diretoria@escola.edu.br\nCco: turma2b@escola.edu.br\nAnexo: prova.pdf' },
    ],
    pistas: [
      'A mensagem que vazou trazia o arquivo prova.pdf anexado.',
      'Quem recebeu conseguia ver a lista de todos os destinatários da mensagem.',
      'A turma NÃO estava no campo "Para": recebeu a mensagem como cópia.',
    ],
    dicas: ['Em Cco (cópia oculta), quem recebe não vê os outros destinatários.', 'Cc é a cópia comum, visível para todos.'],
  },
  {
    id: 'c11',
    disciplina: 'Informática Básica',
    tipo: 'codigo',
    linguagem: 'Documento',
    titulo: 'O Relatório Fora da Norma',
    nivel: 'Detetive',
    pontos: 100,
    historia:
      'O relatório da Feira de Ciências foi devolvido pela banca por estar fora das normas da ABNT. Oito estudantes formataram versões do documento no editor de texto, e só uma foi entregue.',
    pergunta: 'Qual versão foi entregue à banca?',
    suspeitos: [
      { id: 1, nome: 'Vera', codigo: 'Fonte: Arial 12\nEspaçamento: 1,5\nMargens: sup 3 · esq 3 · inf 2 · dir 2 cm\nAlinhamento: justificado' },
      { id: 2, nome: 'Wagner', codigo: 'Fonte: Arial 12\nEspaçamento: 1,5\nMargens: sup 3 · esq 3 · inf 2 · dir 2 cm\nAlinhamento: à esquerda' },
      { id: 3, nome: 'Xavier', codigo: 'Fonte: Arial 12\nEspaçamento: 2,0\nMargens: sup 3 · esq 3 · inf 2 · dir 2 cm\nAlinhamento: à esquerda' },
      { id: 4, nome: 'Yasmin', codigo: 'Fonte: Times New Roman 12\nEspaçamento: 1,5\nMargens: sup 3 · esq 3 · inf 2 · dir 2 cm\nAlinhamento: justificado' },
      { id: 5, nome: 'Zeca', codigo: 'Fonte: Arial 12\nEspaçamento: 1,5\nMargens: sup 2 · esq 2 · inf 3 · dir 3 cm\nAlinhamento: à esquerda' },
      { id: 6, nome: 'Alice', codigo: 'Fonte: Arial 14\nEspaçamento: 1,5\nMargens: sup 3 · esq 3 · inf 2 · dir 2 cm\nAlinhamento: à esquerda' },
      { id: 7, nome: 'Benício', codigo: 'Fonte: Arial 12\nEspaçamento: 1,5\nMargens: 2,5 cm em todos os lados\nAlinhamento: à esquerda' },
      { id: 8, nome: 'Cecília', codigo: 'Fonte: Arial 12\nEspaçamento: 1,0\nMargens: sup 3 · esq 3 · inf 2 · dir 2 cm\nAlinhamento: centralizado' },
    ],
    pistas: [
      'Fonte, tamanho e espaçamento entre linhas estavam de acordo com a ABNT.',
      'As margens também seguiam a ABNT.',
      'O único problema apontado pela banca foi o alinhamento do texto.',
    ],
    dicas: [
      'ABNT para trabalhos: Arial ou Times New Roman tamanho 12, espaçamento 1,5 e texto justificado.',
      'Margens ABNT: superior e esquerda 3 cm; inferior e direita 2 cm.',
    ],
  },
  {
    id: 'c12',
    disciplina: 'Informática Básica',
    tipo: 'codigo',
    linguagem: 'Planilha',
    titulo: 'A Média Impossível do Boletim',
    nivel: 'Mestre',
    pontos: 120,
    baseRotulo: 'As notas na planilha',
    base: '     |  B  |  C  |  D  |  E (média)\n  2  |  8  |  6  |  10 |  ?',
    historia:
      'O boletim de um aluno saiu com uma média maior que 10, o que é impossível. Oito monitores escreveram uma fórmula para a célula E2, e só uma foi copiada para a planilha oficial. Lembre: na planilha, multiplicação e divisão são calculadas antes de soma e subtração.',
    pergunta: 'De quem é a fórmula que gerou a média impossível?',
    suspeitos: [
      { id: 1, nome: 'Nina', codigo: '=MEDIA(B2:D2)' },
      { id: 2, nome: 'Otto', codigo: '=B2+C2+D2/3' },
      { id: 3, nome: 'Pietra', codigo: '=(B2+C2+D2)/3' },
      { id: 4, nome: 'Quim', codigo: '=SOMA(B2:D2)' },
      { id: 5, nome: 'Rosa', codigo: '=B2+C2/2' },
      { id: 6, nome: 'Saulo', codigo: '=MEDIA(B2;D2)' },
      { id: 7, nome: 'Tainá', codigo: '=(B2+C2)+D2/2' },
      { id: 8, nome: 'Uriel', codigo: '=MAXIMO(B2:D2)' },
    ],
    pistas: [
      'O boletim mostrou um valor MAIOR que 10.',
      'A fórmula usava as três notas: B2, C2 e D2.',
      'O valor exibido tinha casas decimais (não era um número inteiro).',
    ],
    dicas: [
      'Calcule cada fórmula com B2 = 8, C2 = 6 e D2 = 10, respeitando a ordem das operações.',
      'B2:D2 é o intervalo de B2 até D2; B2;D2 são só as duas células.',
    ],
  },
  {
    id: 'c13',
    disciplina: 'Lógica',
    tipo: 'logica',
    titulo: 'O Projetor Desaparecido',
    nivel: 'Intermediário',
    pontos: 80,
    historia:
      'O projetor da turma sumiu do Laboratório durante o intervalo. Quatro estudantes estavam no prédio, cada um em um lugar diferente e cada um com um item diferente.',
    pergunta: 'Quem estava no Laboratório e levou o projetor?',
    suspeitos: [
      { id: 1, nome: 'Hugo' },
      { id: 2, nome: 'Iara' },
      { id: 3, nome: 'Jonas' },
      { id: 4, nome: 'Kátia' },
    ],
    locais: ['Laboratório', 'Biblioteca', 'Cantina', 'Pátio'],
    objetoRotulo: 'Item',
    objetos: ['Mochila', 'Guarda-chuva', 'Boné', 'Fone de ouvido'],
    pistas: [
      'Quem estava na Biblioteca usava a mochila.',
      'Iara estava com o fone de ouvido.',
      'Hugo estava com a mochila.',
      'Quem estava no Pátio usava o fone de ouvido.',
      'O guarda-chuva não estava na Cantina.',
      'Jonas não estava no Laboratório.',
    ],
    dicas: ['Dois dos itens já têm dono: onde estão Hugo e Iara?', 'Sobram o Laboratório e a Cantina para Jonas e Kátia.'],
  },
  {
    id: 'c14',
    disciplina: 'Lógica',
    tipo: 'logica',
    titulo: 'A Prova que Vazou',
    nivel: 'Mestre',
    pontos: 120,
    historia:
      'A prova final foi levada da Sala de Provas pouco antes da aplicação. Cinco servidores estavam na escola, cada um em um local e com um objeto diferente, e só um deles estava na Sala de Provas.',
    pergunta: 'Quem estava na Sala de Provas e pegou a prova?',
    suspeitos: [
      { id: 1, nome: 'Lúcio' },
      { id: 2, nome: 'Marta' },
      { id: 3, nome: 'Nando' },
      { id: 4, nome: 'Olívia' },
      { id: 5, nome: 'Paulo' },
    ],
    locais: ['Sala de Provas', 'Copiadora', 'Pátio', 'Quadra', 'Secretaria'],
    objetoRotulo: 'Objeto',
    objetos: ['Pen drive', 'Pasta azul', 'Grampeador', 'Garrafa térmica', 'Chave mestra'],
    pistas: [
      'Nando estava com a chave mestra.',
      'Marta não estava na Quadra.',
      'Olívia estava no Pátio ou na Secretaria.',
      'Paulo estava com o grampeador.',
      'Quem estava na Secretaria usava a pasta azul.',
      'O grampeador não estava na Copiadora.',
      'Quem estava na Quadra usava a garrafa térmica.',
      'Nando estava na Sala de Provas ou na Secretaria.',
    ],
    dicas: ['Veja quem não pode ficar na Secretaria: ela é da pasta azul.', 'Depois de achar o Nando, descubra onde o Paulo (grampeador) pode estar.'],
  },
  {
    id: 'c15',
    disciplina: 'Banco de Dados',
    tipo: 'sql',
    titulo: 'O Livro Raro da Biblioteca',
    nivel: 'Detetive',
    pontos: 100,
    historia:
      'Um livro raro desapareceu da vitrine da Biblioteca à tarde. A catraca guarda as entradas e saídas, e a coordenação lembra que só algumas pessoas podem abrir a vitrine. São oito suspeitos.',
    pergunta: 'Quem levou o livro raro? Investigue no banco do caso e acuse.',
    suspeitos: [
      { id: 1, nome: 'Abel Cardoso' },
      { id: 2, nome: 'Bianca Lemos' },
      { id: 3, nome: 'Cauã Ribeiro' },
      { id: 4, nome: 'Dayane Pinto' },
      { id: 5, nome: 'Elias Barros' },
      { id: 6, nome: 'Flávia Rocha' },
      { id: 7, nome: 'Gil Araújo' },
      { id: 8, nome: 'Hana Duarte' },
    ],
    tabelas: 'usuarios, permissoes, acessos, avisos',
    seed: SEED_LIVRO,
    dicas: [
      'Leia os avisos primeiro: SELECT * FROM avisos; eles trazem o horário e a porta.',
      'Uma pessoa estava na Biblioteca durante o sumiço quando entrou antes do fim da janela e saiu depois do início dela. Junte acessos e permissoes.',
    ],
  },
  {
    id: 'c16',
    disciplina: 'Banco de Dados',
    tipo: 'sql',
    titulo: 'O Desvio no Caixa da Cantina',
    nivel: 'Mestre',
    pontos: 120,
    historia:
      'O caixa da cantina fechou a semana com dinheiro a menos. Alguém fez estornos sem nota fiscal, mas o sistema não grava quem foi: só o dia e o horário. Os turnos de cada pessoa estão registrados. São oito suspeitos.',
    pergunta: 'Quem desviou o dinheiro? Prove pelo banco do caso e acuse.',
    suspeitos: [
      { id: 1, nome: 'Ivo Prado' },
      { id: 2, nome: 'Joana Veras' },
      { id: 3, nome: 'Kleber Dantas' },
      { id: 4, nome: 'Lívia Matos' },
      { id: 5, nome: 'Marcelo Sena' },
      { id: 6, nome: 'Nair Campos' },
      { id: 7, nome: 'Orlando Reis' },
      { id: 8, nome: 'Priscila Neves' },
    ],
    tabelas: 'funcionarios, turnos, estornos, avisos',
    seed: SEED_CAIXA,
    dicas: [
      'Estorno sem nota fiscal tem nota_fiscal IS NULL. Quantos são?',
      'Junte turnos e estornos pelo dia e pelo horário, agrupe por funcionário e confira quem apareceu em TODOS os estornos irregulares (GROUP BY com HAVING COUNT(...)).',
    ],
  },
];
