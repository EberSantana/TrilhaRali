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
}

interface DesvBase {
  id: string;
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

export type DesvCaso = DesvCasoLogica | DesvCasoSql;

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

export const DESV_CASOS: DesvCaso[] = [
  {
    id: 'c1',
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
];
