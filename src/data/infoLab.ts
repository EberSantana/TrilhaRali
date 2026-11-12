import type { Grade } from '../utils/planilha';

/**
 * Laboratório de Informática do CTF: arquivos simulados que o aluno abre no navegador para achar as respostas
 * das missões de Informática Básica (ficha do computador, pasta de arquivos, navegador, e-mail, nuvem,
 * documento, planilha e apresentação). Os dados são fixos: o gabarito de cada missão é conferido por
 * infoMissions.test.ts a partir deles.
 */
export interface LabSistema { id: string; tipo: 'ficha'; nome: string; linhas: [string, string][] }
export interface LabPasta { id: string; tipo: 'pasta'; nome: string; arquivos: { nome: string; mb: number }[] }
export interface LabWeb { id: string; tipo: 'web'; nome: string; url: string; titulo: string; paragrafos: string[] }
export interface LabEmail {
  id: string; tipo: 'email'; nome: string;
  de: string; para: string[]; cc: string[]; cco: string[]; assunto: string; data: string;
  anexos: { nome: string; mb: number }[]; corpo: string[];
}
export interface LabNuvem { id: string; tipo: 'nuvem'; nome: string; usado: string; arquivos: { nome: string; dono: string; permissao: string }[] }
export interface LabDocBloco {
  tipo: 'titulo' | 'titulo1' | 'paragrafo' | 'tabela' | 'imagem' | 'quebra' | 'lista';
  texto?: string;
  fonte?: string; tamanho?: number; negrito?: boolean; alinhamento?: string;
  espacamento?: string; recuo?: string; erros?: string[];
  linhas?: string[][]; itens?: string[]; legenda?: string; largura?: string; pagina: number;
}
export interface LabDocumento {
  id: string; tipo: 'documento'; nome: string; cabecalho: string; rodape: string;
  pagina: { papel: string; orientacao: string; margens: string; visualizacao: string };
  blocos: LabDocBloco[];
}
export interface LabPlanilha { id: string; tipo: 'planilha'; nome: string; abas: { nome: string; grade: Grade }[] }
export interface LabSlide { titulo: string; layout: string; itens: string[]; transicao: string; animacao: string }
export interface LabSlides {
  id: string; tipo: 'slides'; nome: string;
  mestre: { fundo: string; fonte: string; rodape: string; numeracao: boolean };
  slides: LabSlide[];
}
export type LabArquivo = LabSistema | LabPasta | LabWeb | LabEmail | LabNuvem | LabDocumento | LabPlanilha | LabSlides;

export const LAB_FICHA: LabSistema = {
  id: 'ficha', tipo: 'ficha', nome: 'Ficha do computador',
  linhas: [
    ['Tipo', 'Desktop (torre)'],
    ['Processador (CPU)', 'Intel Core i5 · 4 núcleos · 3,2 GHz'],
    ['Memória RAM', '8 GB (DDR4)'],
    ['Armazenamento', 'SSD 256 GB'],
    ['Placa de vídeo', 'Integrada'],
    ['Sistema operacional', 'Windows 11 (64 bits)'],
    ['Periféricos de entrada', 'Teclado, mouse, microfone'],
    ['Periféricos de saída', 'Monitor, caixas de som, impressora'],
    ['Conexão de rede', 'Ethernet e Wi-Fi'],
    ['Programas instalados', 'Navegador, editor de texto, planilha, slides, antivírus'],
  ],
};

export const LAB_PASTA: LabPasta = {
  id: 'pasta', tipo: 'pasta', nome: 'Pasta Documentos',
  arquivos: [
    { nome: 'relatorio.docx', mb: 2 },
    { nome: 'notas.xlsx', mb: 1 },
    { nome: 'aula.pptx', mb: 12 },
    { nome: 'foto1.jpg', mb: 4 },
    { nome: 'foto2.jpg', mb: 3 },
    { nome: 'musica.mp3', mb: 6 },
    { nome: 'video.mp4', mb: 450 },
    { nome: 'leiame.txt', mb: 1 },
    { nome: 'setup.exe', mb: 25 },
    { nome: 'backup.zip', mb: 100 },
  ],
};

export const LAB_WEB: LabWeb = {
  id: 'web', tipo: 'web', nome: 'Navegador',
  url: 'https://www.ifs.edu.br/cursos/informatica?turma=2026#matriz',
  titulo: 'Curso de Informática · IFS',
  paragrafos: ['Conheça a matriz curricular do curso de Informática.', 'Inscrições abertas para a turma deste ano.'],
};

export const LAB_EMAIL: LabEmail = {
  id: 'email', tipo: 'email', nome: 'E-mail enviado',
  de: 'coordenacao@ifs.edu.br',
  para: ['ana@ifs.edu.br', 'bruno@ifs.edu.br'],
  cc: ['diretoria@ifs.edu.br'],
  cco: ['pais@ifs.edu.br'],
  assunto: 'Reunião pedagógica',
  data: '10/03/2026',
  anexos: [{ nome: 'pauta.pdf', mb: 2 }, { nome: 'ata_anterior.docx', mb: 3 }, { nome: 'presenca.xlsx', mb: 1 }],
  corpo: ['Prezados,', 'Convocamos todos para a reunião pedagógica do dia 15/03. A pauta e a ata anterior seguem em anexo.', 'Atenciosamente, Coordenação.'],
};

export const LAB_NUVEM: LabNuvem = {
  id: 'nuvem', tipo: 'nuvem', nome: 'Nuvem (Meu Drive)', usado: '4 GB de 15 GB',
  arquivos: [
    { nome: 'Plano de aula.docx', dono: 'Você', permissao: 'Proprietário' },
    { nome: 'Notas 2026.xlsx', dono: 'Carla', permissao: 'Editor' },
    { nome: 'Prova.pdf', dono: 'Daniel', permissao: 'Leitor' },
    { nome: 'Fotos da turma.zip', dono: 'Elisa', permissao: 'Leitor' },
    { nome: 'Cronograma.pptx', dono: 'Elisa', permissao: 'Comentarista' },
    { nome: 'Projeto.docx', dono: 'Fábio', permissao: 'Editor' },
    { nome: 'Rascunho.txt', dono: 'Fábio', permissao: 'Leitor' },
  ],
};

export const LAB_DOC: LabDocumento = {
  id: 'doc', tipo: 'documento', nome: 'relatorio.docx',
  cabecalho: 'IFS · Relatório de Atividades',
  rodape: 'Página {n} de 2',
  pagina: { papel: 'A4', orientacao: 'Retrato', margens: '2,5 cm', visualizacao: 'Layout de impressão' },
  blocos: [
    { tipo: 'titulo', texto: 'Relatório de Atividades 2026', fonte: 'Arial', tamanho: 18, negrito: true, alinhamento: 'Centralizado', pagina: 1 },
    { tipo: 'titulo1', texto: '1. Introdução', fonte: 'Arial', tamanho: 14, negrito: true, alinhamento: 'Esquerda', pagina: 1 },
    {
      tipo: 'paragrafo', texto: 'Este relatório resume as atividades do curso de Informática Básica realizadas no primeiro semestre.',
      fonte: 'Times New Roman', tamanho: 12, alinhamento: 'Justificado', espacamento: '1,5', recuo: '1,25 cm', pagina: 1,
    },
    { tipo: 'titulo1', texto: '2. Resultados', fonte: 'Arial', tamanho: 14, negrito: true, alinhamento: 'Esquerda', pagina: 1 },
    {
      tipo: 'tabela', pagina: 1,
      linhas: [['Mês', 'Alunos', 'Aprovados'], ['Março', '30', '24'], ['Abril', '28', '25'], ['Maio', '27', '26']],
    },
    { tipo: 'imagem', texto: 'grafico.png', legenda: 'Figura 1 – Aprovados por mês', largura: '8 cm', alinhamento: 'Centralizado', pagina: 1 },
    { tipo: 'quebra', texto: 'Quebra de página', pagina: 1 },
    { tipo: 'titulo1', texto: '3. Conclusão', fonte: 'Arial', tamanho: 14, negrito: true, alinhamento: 'Esquerda', pagina: 2 },
    { tipo: 'lista', itens: ['Turmas concluídas', 'Frequência acima de 75%', 'Material digital entregue'], pagina: 2 },
    {
      tipo: 'paragrafo', texto: 'Os alunos realisaram todas as atividades propostas.',
      fonte: 'Times New Roman', tamanho: 12, alinhamento: 'Justificado', espacamento: '1,5', recuo: '1,25 cm', erros: ['realisaram'], pagina: 2,
    },
  ],
};

export const LAB_PLANILHA: LabPlanilha = {
  id: 'planilha', tipo: 'planilha', nome: 'notas.xlsx',
  abas: [
    {
      nome: 'Notas',
      grade: [
        ['Aluno', 'Nota 1', 'Nota 2', 'Média', 'Situação'],
        ['Ana', '8', '9', '=MEDIA(B2:C2)', '=SE(D2>=6;"Aprovado";"Reprovado")'],
        ['Bruno', '6', '5', '=MEDIA(B3:C3)', '=SE(D3>=6;"Aprovado";"Reprovado")'],
        ['Carla', '10', '9', '=MEDIA(B4:C4)', '=SE(D4>=6;"Aprovado";"Reprovado")'],
        ['Daniel', '4', '6', '=MEDIA(B5:C5)', '=SE(D5>=6;"Aprovado";"Reprovado")'],
        ['Elisa', '7', '7', '=MEDIA(B6:C6)', '=SE(D6>=6;"Aprovado";"Reprovado")'],
        ['Fábio', '9', '10', '=MEDIA(B7:C7)', '=SE(D7>=6;"Aprovado";"Reprovado")'],
        ['Gabi', '5', '4', '=MEDIA(B8:C8)', '=SE(D8>=6;"Aprovado";"Reprovado")'],
        ['Hugo', '8', '6', '=MEDIA(B9:C9)', '=SE(D9>=6;"Aprovado";"Reprovado")'],
      ],
    },
    {
      nome: 'Vendas',
      grade: [
        ['Produto', 'Qtd', 'Preço (R$)', 'Total (R$)'],
        ['Caneta', '10', '2.5', '=B2*C2'],
        ['Caderno', '4', '18', '=B3*C3'],
        ['Mochila', '2', '90', '=B4*C4'],
        ['Lápis', '20', '1', '=B5*C5'],
        ['Régua', '5', '4', '=B6*C6'],
      ],
    },
  ],
};

export const LAB_SLIDES: LabSlides = {
  id: 'slides', tipo: 'slides', nome: 'aula.pptx',
  mestre: { fundo: 'Azul', fonte: 'Calibri', rodape: 'IFS · 2026', numeracao: true },
  slides: [
    { titulo: 'Informática Básica', layout: 'Slide de título', itens: ['Prof. Eber Santana'], transicao: 'Desvanecer', animacao: 'Nenhuma' },
    { titulo: 'Hardware e Software', layout: 'Título e conteúdo', itens: ['Processador', 'Memória', 'Sistema operacional'], transicao: 'Empurrar', animacao: 'Entrada: Surgir' },
    { titulo: 'Internet', layout: 'Duas colunas', itens: ['Navegadores', 'E-mail', 'Nuvem', 'Buscadores'], transicao: 'Empurrar', animacao: 'Entrada: Zoom' },
    { titulo: 'Uso da Internet', layout: 'Título e conteúdo', itens: ['Gráfico de barras'], transicao: 'Desvanecer', animacao: 'Ênfase: Pulsar' },
    { titulo: 'Dicas', layout: 'Título e conteúdo', itens: ['Salve sempre', 'Faça backup'], transicao: 'Nenhuma', animacao: 'Saída: Desaparecer' },
    { titulo: 'Obrigado!', layout: 'Slide de título', itens: ['Dúvidas?'], transicao: 'Desvanecer', animacao: 'Nenhuma' },
  ],
};

export const LAB_ARQUIVOS: LabArquivo[] = [LAB_FICHA, LAB_PASTA, LAB_WEB, LAB_EMAIL, LAB_NUVEM, LAB_DOC, LAB_PLANILHA, LAB_SLIDES];
