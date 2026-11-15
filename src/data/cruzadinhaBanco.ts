/**
 * Banco de palavras da Cruzadinha (ambiente de estudo do CTF). Cada palavra vem sem acento e em maiúsculas, com
 * uma dica curta. São termos gerais da disciplina: não repetem o gabarito das missões da sala.
 */
export type DisciplinaCruz = 'Banco de Dados' | 'Informática Básica' | 'Construção de Sites 1' | 'Fundamentos de Sistemas Operacionais';
export type PalavraCruz = readonly [palavra: string, dica: string];

export const BANCO_CRUZADINHA: Record<DisciplinaCruz, PalavraCruz[]> = {
  'Banco de Dados': [
    ['CARDINALIDADE', 'Quantidade de ocorrências entre duas entidades (1:N, N:N)'],
    ['TRANSACAO', 'Conjunto de operações tratado como uma unidade'],
    ['ROLLBACK', 'Comando que desfaz uma transação'],
    ['COMMIT', 'Comando que confirma uma transação'],
    ['SELECT', 'Comando da DQL para consultar dados'],
    ['INSERT', 'Comando que adiciona uma nova linha'],
    ['UPDATE', 'Comando que altera linhas existentes'],
    ['DELETE', 'Comando que remove linhas'],
    ['TABELA', 'Estrutura de linhas e colunas do banco'],
    ['CHAVE', 'Primária ou estrangeira: identifica ou liga registros'],
    ['SQLITE', 'Banco embutido usado no console da plataforma'],
    ['REGISTRO', 'Uma linha de uma tabela'],
    ['COLUNA', 'Campo de uma tabela'],
    ['GRANT', 'Comando da DCL que concede permissões'],
    ['INDICE', 'Estrutura que acelera buscas em uma coluna'],
    ['ENTIDADE', 'Objeto do mundo real representado no modelo ER'],
    ['ATRIBUTO', 'Característica de uma entidade'],
    ['NORMALIZACAO', 'Organizar tabelas para reduzir redundância'],
  ],
  'Informática Básica': [
    ['PROCESSADOR', 'Componente considerado o cérebro do computador'],
    ['MEMORIA', 'RAM: onde ficam os dados em uso no momento'],
    ['TECLADO', 'Periférico de entrada usado para digitar'],
    ['NAVEGADOR', 'Programa para acessar páginas da Internet'],
    ['PLANILHA', 'Editor de células com fórmulas, como o Excel'],
    ['APRESENTACAO', 'Arquivo criado no PowerPoint (.pptx)'],
    ['NUVEM', 'Armazenamento de arquivos na Internet'],
    ['ANEXO', 'Arquivo enviado junto com um e-mail'],
    ['SUMARIO', 'Lista de títulos com número de página'],
    ['CELULA', 'Cruzamento de uma coluna com uma linha'],
    ['FORMULA', 'Começa com o sinal de igual em uma planilha'],
    ['MONITOR', 'Periférico de saída que mostra a imagem'],
    ['EMAIL', 'Mensagem eletrônica com Para, Cc e Cco'],
    ['SLIDE', 'Cada página de uma apresentação'],
    ['PASTA', 'Local que organiza arquivos no computador'],
    ['IMPRESSORA', 'Periférico de saída que coloca o texto no papel'],
    ['SOFTWARE', 'Parte lógica do computador: programas'],
    ['HARDWARE', 'Parte física do computador'],
  ],
  'Construção de Sites 1': [
    ['FORMULARIO', 'Tag que reúne os campos para o usuário enviar dados'],
    ['FLEXBOX', 'Modelo de layout ativado com display: flex'],
    ['PADDING', 'Espaço interno entre o conteúdo e a borda'],
    ['SELETOR', 'Parte da regra CSS que escolhe os elementos a estilizar'],
    ['ATRIBUTO', 'Informação extra dentro da tag, como href ou alt'],
    ['TABELA', 'Estrutura de linhas e colunas criada com a tag table'],
    ['MARGIN', 'Espaço externo ao redor de um elemento'],
    ['CLASSE', 'Atributo reaproveitável, escrito com ponto no CSS'],
    ['BORDA', 'Linha que contorna a caixa do elemento'],
    ['HTML', 'Linguagem de marcação que estrutura a página'],
    ['CSS', 'Linguagem que define a aparência da página'],
    ['LINK', 'Âncora que leva a outra página'],
    ['FONTE', 'font-family escolhe a ___ do texto'],
    ['TAG', 'Marca entre sinais de menor e maior que forma um elemento'],
    ['IMAGEM', 'Tag img exibe uma ___ na página'],
    ['TITULO', 'Tag h1 define o ___ principal'],
    ['LISTA', 'Estrutura criada com ul ou ol'],
    ['CABECALHO', 'Parte do topo da página, tag header'],
  ],
  'Fundamentos de Sistemas Operacionais': [
    ['TERMINAL', 'Janela onde se digitam comandos de texto'],
    ['DIRETORIO', 'Outro nome para pasta no Linux'],
    ['PERMISSAO', 'Define quem pode ler, escrever ou executar'],
    ['KERNEL', 'Núcleo do sistema operacional'],
    ['SHELL', 'Interpretador que recebe os comandos digitados'],
    ['USUARIO', 'Conta que usa o sistema'],
    ['PROCESSO', 'Programa em execução na memória'],
    ['SCRIPT', 'Arquivo com uma sequência de comandos'],
    ['PACOTE', 'Software empacotado para instalação'],
    ['ROOT', 'Superusuário do Linux'],
    ['GREP', 'Comando que procura texto dentro de arquivos'],
    ['SUDO', 'Executa um comando com privilégios de administrador'],
    ['PIPE', 'Barra vertical que liga a saída de um comando à entrada de outro'],
    ['ARQUIVO', 'Unidade que guarda dados em um diretório'],
    ['BASH', 'Shell padrão de muitas distribuições Linux'],
    ['CHMOD', 'Comando que muda permissões'],
    ['LOGS', 'Registros de eventos do sistema'],
    ['DISTRO', 'Versão do Linux, como Ubuntu ou Debian'],
  ],
};

/** Disciplinas de uma sala, a partir das tags das missões (info_ / web_ / linux_; o resto é Banco de Dados). */
export function disciplinasDasTags(tags: string[]): DisciplinaCruz[] {
  const set = new Set<DisciplinaCruz>();
  for (const t of tags) {
    const k = t.toLowerCase();
    if (!k) continue;
    if (k.startsWith('info_')) set.add('Informática Básica');
    else if (k.startsWith('web_')) set.add('Construção de Sites 1');
    else if (k.startsWith('linux_')) set.add('Fundamentos de Sistemas Operacionais');
    else set.add('Banco de Dados');
  }
  return set.size ? [...set] : ['Banco de Dados'];
}
