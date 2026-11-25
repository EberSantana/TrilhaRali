import type { DesvCaso } from './desvCasos';

/**
 * Desvendando: casos por tema (c61 a c150), 10 em cada: Windows 11, MS-DOS, Word, Excel, PowerPoint, Introdução à Informática, Hardware e Software, Introdução à Segurança da Informação, Vírus e Antivírus.
 * Cada suspeito tem uma evidência (configuração, comando, documento, planilha, slide, ficha ou log) e as pistas
 * descrevem o efeito observado. O gabarito NÃO fica aqui: desvCasos.test.ts prova que cada caso tem uma única solução.
 */
export const DESV_CASOS_TEMAS: DesvCaso[] = [
  {
    "id": "c61",
    "disciplina": "Windows 11",
    "tipo": "codigo",
    "linguagem": "Configuração",
    "titulo": "O Arquivo que Sumiu da Pasta",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "Um aluno salvou o trabalho e não achou mais o arquivo na pasta. Seis colegas mexeram no notebook dele e cada um deixou uma configuração diferente no Explorador de Arquivos.",
    "pergunta": "Qual configuração estava no notebook do aluno?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Abel",
        "codigo": "Itens ocultos: desmarcado\nExtensões de nomes de arquivos: marcado\nExibição da pasta: Detalhes"
      },
      {
        "id": 2,
        "nome": "Bia",
        "codigo": "Itens ocultos: marcado\nExtensões de nomes de arquivos: desmarcado\nExibição da pasta: Detalhes"
      },
      {
        "id": 3,
        "nome": "Caetano",
        "codigo": "Itens ocultos: marcado\nExtensões de nomes de arquivos: desmarcado\nExibição da pasta: Ícones grandes"
      },
      {
        "id": 4,
        "nome": "Dalva",
        "codigo": "Itens ocultos: desmarcado\nExtensões de nomes de arquivos: desmarcado\nExibição da pasta: Ícones grandes"
      },
      {
        "id": 5,
        "nome": "Elias",
        "codigo": "Itens ocultos: desmarcado\nExtensões de nomes de arquivos: desmarcado\nExibição da pasta: Detalhes"
      },
      {
        "id": 6,
        "nome": "Fabiana",
        "codigo": "Itens ocultos: desmarcado\nExtensões de nomes de arquivos: marcado\nExibição da pasta: Ícones grandes"
      }
    ],
    "pistas": [
      "O arquivo tinha o atributo oculto e não aparecia na pasta.",
      "Não dava para ver se os arquivos terminavam em .docx ou .pdf.",
      "Não apareciam colunas com data de modificação e tamanho."
    ],
    "dicas": [
      "No Explorador, o menu Exibir mostra itens ocultos e extensões.",
      "A exibição Detalhes é a que mostra colunas."
    ]
  },
  {
    "id": "c62",
    "disciplina": "Windows 11",
    "tipo": "codigo",
    "linguagem": "Configuração",
    "titulo": "A Barra de Tarefas Diferente",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "Na feira de ciências, a professora procurou o botão Iniciar no canto e não achou. Seis pessoas configuraram o computador da feira.",
    "pergunta": "Qual configuração estava no computador da feira?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Gilson",
        "codigo": "Alinhamento da barra de tarefas: À esquerda\nOcultar a barra automaticamente: ativado\nWidgets: desativado"
      },
      {
        "id": 2,
        "nome": "Helena",
        "codigo": "Alinhamento da barra de tarefas: Centralizado\nOcultar a barra automaticamente: ativado\nWidgets: ativado"
      },
      {
        "id": 3,
        "nome": "Ícaro",
        "codigo": "Alinhamento da barra de tarefas: Centralizado\nOcultar a barra automaticamente: ativado\nWidgets: desativado"
      },
      {
        "id": 4,
        "nome": "Joana",
        "codigo": "Alinhamento da barra de tarefas: Centralizado\nOcultar a barra automaticamente: desativado\nWidgets: ativado"
      },
      {
        "id": 5,
        "nome": "Kleber",
        "codigo": "Alinhamento da barra de tarefas: Centralizado\nOcultar a barra automaticamente: desativado\nWidgets: desativado"
      },
      {
        "id": 6,
        "nome": "Lívia",
        "codigo": "Alinhamento da barra de tarefas: À esquerda\nOcultar a barra automaticamente: ativado\nWidgets: ativado"
      }
    ],
    "pistas": [
      "O botão Iniciar ficava no meio da barra, e não no canto.",
      "A barra só aparecia quando o mouse descia até a borda da tela.",
      "Ao passar o mouse no canto da barra, abria um painel de notícias e clima."
    ],
    "dicas": [
      "O Windows 11 vem com os ícones centralizados.",
      "Ocultar automaticamente faz a barra sumir até o mouse descer."
    ]
  },
  {
    "id": "c63",
    "disciplina": "Windows 11",
    "tipo": "codigo",
    "linguagem": "Configuração",
    "titulo": "A Tela que Apagava Sozinha",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "Durante a prova on-line, a tela de um computador apagou várias vezes e, logo depois, ele entrou em suspensão. Seis técnicos deixaram configurações de energia diferentes.",
    "pergunta": "Qual configuração causou o problema?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Mateus",
        "codigo": "Desligar a tela após: 15 minutos\nSuspender após: 5 minutos\nModo de energia: Desempenho máximo"
      },
      {
        "id": 2,
        "nome": "Noemi",
        "codigo": "Desligar a tela após: Nunca\nSuspender após: 5 minutos\nModo de energia: Economia de bateria máxima"
      },
      {
        "id": 3,
        "nome": "Osvaldo",
        "codigo": "Desligar a tela após: 1 minuto\nSuspender após: 5 minutos\nModo de energia: Economia de bateria máxima"
      },
      {
        "id": 4,
        "nome": "Priscila",
        "codigo": "Desligar a tela após: 1 minuto\nSuspender após: 5 minutos\nModo de energia: Equilibrado"
      },
      {
        "id": 5,
        "nome": "Quênia",
        "codigo": "Desligar a tela após: 1 minuto\nSuspender após: 1 hora\nModo de energia: Economia de bateria máxima"
      },
      {
        "id": 6,
        "nome": "Renan",
        "codigo": "Desligar a tela após: 1 minuto\nSuspender após: Nunca\nModo de energia: Equilibrado"
      }
    ],
    "pistas": [
      "Bastava o aluno ficar um minuto lendo a questão para a tela apagar.",
      "Poucos minutos parado e o computador já entrava em suspensão.",
      "O brilho estava baixo e o desempenho reduzido para poupar bateria."
    ],
    "dicas": [
      "Procure em Configurações > Sistema > Energia e bateria.",
      "Compare os tempos com o que aconteceu na prova."
    ]
  },
  {
    "id": "c64",
    "disciplina": "Windows 11",
    "tipo": "codigo",
    "linguagem": "Configuração",
    "titulo": "A Cópia que Não Voltava",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Durante a aula, um aluno copiou três trechos seguidos e, ao apertar Win + V, só apareceu um aviso. As notificações também não apareciam e as janelas estavam escuras. Seis colegas mostraram configurações.",
    "pergunta": "Qual era a configuração do computador do aluno?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Sabrina",
        "codigo": "Histórico da área de transferência: desativado\nNão perturbe: desativado\nModo de cor: Escuro"
      },
      {
        "id": 2,
        "nome": "Tiago",
        "codigo": "Histórico da área de transferência: desativado\nNão perturbe: desativado\nModo de cor: Claro"
      },
      {
        "id": 3,
        "nome": "Úrsula",
        "codigo": "Histórico da área de transferência: ativado\nNão perturbe: ativado\nModo de cor: Escuro"
      },
      {
        "id": 4,
        "nome": "Valdir",
        "codigo": "Histórico da área de transferência: ativado\nNão perturbe: ativado\nModo de cor: Claro"
      },
      {
        "id": 5,
        "nome": "Wanda",
        "codigo": "Histórico da área de transferência: desativado\nNão perturbe: ativado\nModo de cor: Claro"
      },
      {
        "id": 6,
        "nome": "Xande",
        "codigo": "Histórico da área de transferência: desativado\nNão perturbe: ativado\nModo de cor: Escuro"
      }
    ],
    "pistas": [
      "Só o último trecho copiado ficava guardado: o Win + V pedia para ativar o histórico.",
      "As notificações estavam silenciadas.",
      "As janelas e o menu Iniciar estavam com fundo escuro."
    ],
    "dicas": [
      "Win + V abre o histórico da área de transferência.",
      "Personalização > Cores muda o modo claro ou escuro."
    ]
  },
  {
    "id": "c65",
    "disciplina": "Windows 11",
    "tipo": "codigo",
    "linguagem": "Configuração",
    "titulo": "A Atualização no Meio da Aula",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "O computador do professor reiniciou sozinho às 10h para instalar atualizações, no meio da aula. Seis configurações do Windows Update foram encontradas.",
    "pergunta": "Qual configuração estava no computador do professor?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yago",
        "codigo": "Horário ativo: das 13h às 18h\nReiniciar o mais rápido possível: desativado\nPausar atualizações: pausado por 1 semana"
      },
      {
        "id": 2,
        "nome": "Zuleica",
        "codigo": "Horário ativo: das 13h às 18h\nReiniciar o mais rápido possível: ativado\nPausar atualizações: pausado por 1 semana"
      },
      {
        "id": 3,
        "nome": "Arnaldo",
        "codigo": "Horário ativo: das 7h às 12h\nReiniciar o mais rápido possível: ativado\nPausar atualizações: não pausado"
      },
      {
        "id": 4,
        "nome": "Betina",
        "codigo": "Horário ativo: das 13h às 18h\nReiniciar o mais rápido possível: ativado\nPausar atualizações: não pausado"
      },
      {
        "id": 5,
        "nome": "Cícero",
        "codigo": "Horário ativo: das 7h às 12h\nReiniciar o mais rápido possível: ativado\nPausar atualizações: pausado por 1 semana"
      },
      {
        "id": 6,
        "nome": "Denise",
        "codigo": "Horário ativo: das 13h às 18h\nReiniciar o mais rápido possível: desativado\nPausar atualizações: não pausado"
      }
    ],
    "pistas": [
      "As 10h da manhã ficavam fora do período em que o Windows evita reiniciar.",
      "O Windows não esperou o professor reiniciar quando quisesse.",
      "As atualizações estavam liberadas para instalar."
    ],
    "dicas": [
      "O Windows evita reiniciar dentro do horário ativo.",
      "Atualização pausada não reinicia o computador."
    ]
  },
  {
    "id": "c66",
    "disciplina": "Windows 11",
    "tipo": "codigo",
    "linguagem": "Configuração",
    "titulo": "A Conta sem Senha",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Um notebook do laboratório foi usado por um desconhecido: entrou direto, instalou um programa e a tela não trancou quando o dono saiu. Seis fichas de conta foram levantadas.",
    "pergunta": "Qual ficha é a do notebook usado?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Edson",
        "codigo": "Opção de entrada: sem senha nem PIN\nTipo de conta: Administrador\nBloqueio dinâmico: desativado"
      },
      {
        "id": 2,
        "nome": "Flávia",
        "codigo": "Opção de entrada: sem senha nem PIN\nTipo de conta: Padrão\nBloqueio dinâmico: desativado"
      },
      {
        "id": 3,
        "nome": "Gustavo",
        "codigo": "Opção de entrada: sem senha nem PIN\nTipo de conta: Padrão\nBloqueio dinâmico: ativado"
      },
      {
        "id": 4,
        "nome": "Hilda",
        "codigo": "Opção de entrada: Windows Hello (rosto)\nTipo de conta: Administrador\nBloqueio dinâmico: desativado"
      },
      {
        "id": 5,
        "nome": "Isaque",
        "codigo": "Opção de entrada: sem senha nem PIN\nTipo de conta: Administrador\nBloqueio dinâmico: ativado"
      },
      {
        "id": 6,
        "nome": "Jussara",
        "codigo": "Opção de entrada: Windows Hello (rosto)\nTipo de conta: Administrador\nBloqueio dinâmico: ativado"
      }
    ],
    "pistas": [
      "Ninguém precisou digitar nada nem mostrar o rosto para entrar.",
      "A conta tinha permissão para instalar programas sem pedir senha de outra pessoa.",
      "A tela não trancou quando o celular do dono se afastou."
    ],
    "dicas": [
      "Veja Configurações > Contas > Opções de entrada.",
      "O bloqueio dinâmico tranca o PC quando o celular pareado se afasta."
    ]
  },
  {
    "id": "c67",
    "disciplina": "Windows 11",
    "tipo": "codigo",
    "linguagem": "Configuração",
    "titulo": "O Disco C: Lotado",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "O disco C: do computador da secretaria ficou cheio. Seis relatórios de Armazenamento foram analisados.",
    "pergunta": "Qual relatório é do computador da secretaria?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Kauê",
        "codigo": "Sensor de Armazenamento: desativado\nLixeira: 18 GB\nPasta Downloads: 40 GB\nArquivos temporários: 300 MB"
      },
      {
        "id": 2,
        "nome": "Lorena",
        "codigo": "Sensor de Armazenamento: desativado\nLixeira: 18 GB\nPasta Downloads: 40 GB\nArquivos temporários: 12 GB"
      },
      {
        "id": 3,
        "nome": "Moisés",
        "codigo": "Sensor de Armazenamento: desativado\nLixeira: 200 MB\nPasta Downloads: 40 GB\nArquivos temporários: 12 GB"
      },
      {
        "id": 4,
        "nome": "Nádia",
        "codigo": "Sensor de Armazenamento: desativado\nLixeira: 18 GB\nPasta Downloads: 2 GB\nArquivos temporários: 12 GB"
      },
      {
        "id": 5,
        "nome": "Otávio",
        "codigo": "Sensor de Armazenamento: desativado\nLixeira: 18 GB\nPasta Downloads: 2 GB\nArquivos temporários: 300 MB"
      },
      {
        "id": 6,
        "nome": "Paula",
        "codigo": "Sensor de Armazenamento: ativado, limpa toda semana\nLixeira: 18 GB\nPasta Downloads: 40 GB\nArquivos temporários: 12 GB"
      }
    ],
    "pistas": [
      "Nada era limpo sozinho no computador.",
      "A Lixeira nunca tinha sido esvaziada.",
      "Os arquivos baixados ocupavam dezenas de gigabytes.",
      "Os temporários também tinham se acumulado."
    ],
    "dicas": [
      "O Sensor de Armazenamento apaga temporários e esvazia a Lixeira sozinho.",
      "Confira uma linha de cada vez."
    ]
  },
  {
    "id": "c68",
    "disciplina": "Windows 11",
    "tipo": "codigo",
    "linguagem": "Configuração",
    "titulo": "O Computador que Demorava a Ligar",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "Um computador levava minutos para ficar pronto depois de ligar. Seis listas de Aplicativos de inicialização foram exportadas do Gerenciador de Tarefas.",
    "pergunta": "Qual lista é a do computador lento?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Raí",
        "codigo": "Jogo da loja: Habilitado · impacto alto\nAtualizador da impressora: Habilitado · impacto alto\nAplicativo de chat: Habilitado · impacto médio\nSegurança do Windows: Habilitado · impacto baixo"
      },
      {
        "id": 2,
        "nome": "Sueli",
        "codigo": "Jogo da loja: Habilitado · impacto alto\nAtualizador da impressora: Desabilitado\nAplicativo de chat: Habilitado · impacto médio\nSegurança do Windows: Habilitado · impacto baixo"
      },
      {
        "id": 3,
        "nome": "Talita",
        "codigo": "Jogo da loja: Habilitado · impacto alto\nAtualizador da impressora: Habilitado · impacto alto\nAplicativo de chat: Desabilitado\nSegurança do Windows: Habilitado · impacto baixo"
      },
      {
        "id": 4,
        "nome": "Ubiratã",
        "codigo": "Jogo da loja: Habilitado · impacto alto\nAtualizador da impressora: Habilitado · impacto alto\nAplicativo de chat: Desabilitado\nSegurança do Windows: Desabilitado"
      },
      {
        "id": 5,
        "nome": "Vanessa",
        "codigo": "Jogo da loja: Habilitado · impacto alto\nAtualizador da impressora: Habilitado · impacto alto\nAplicativo de chat: Habilitado · impacto médio\nSegurança do Windows: Desabilitado"
      },
      {
        "id": 6,
        "nome": "Wellington",
        "codigo": "Jogo da loja: Desabilitado\nAtualizador da impressora: Habilitado · impacto alto\nAplicativo de chat: Habilitado · impacto médio\nSegurança do Windows: Habilitado · impacto baixo"
      }
    ],
    "pistas": [
      "Um jogo abria junto com o Windows e pesava muito.",
      "O programa da impressora também abria na inicialização.",
      "O chat abria sozinho ao ligar.",
      "A proteção do sistema continuava ligada desde o início."
    ],
    "dicas": [
      "No Gerenciador de Tarefas, a guia Aplicativos de inicialização mostra o impacto.",
      "O antivírus deve continuar habilitado."
    ]
  },
  {
    "id": "c69",
    "disciplina": "Windows 11",
    "tipo": "codigo",
    "linguagem": "Configuração",
    "titulo": "A Pasta Vista na Feira",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "Na feira de ciências, outro notebook conseguiu ver a pasta compartilhada de um aluno pela rede do evento, mesmo com o firewall ligado. Seis configurações de rede foram coletadas.",
    "pergunta": "Qual configuração deixou a pasta visível?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yolanda",
        "codigo": "Perfil da rede: Rede pública\nDescoberta de rede: ativada\nCompartilhamento de arquivos e impressoras: ativado\nFirewall do Windows: ativado"
      },
      {
        "id": 2,
        "nome": "Zeno",
        "codigo": "Perfil da rede: Rede privada\nDescoberta de rede: ativada\nCompartilhamento de arquivos e impressoras: ativado\nFirewall do Windows: desativado"
      },
      {
        "id": 3,
        "nome": "Adriana",
        "codigo": "Perfil da rede: Rede privada\nDescoberta de rede: desativada\nCompartilhamento de arquivos e impressoras: ativado\nFirewall do Windows: ativado"
      },
      {
        "id": 4,
        "nome": "Benedito",
        "codigo": "Perfil da rede: Rede privada\nDescoberta de rede: ativada\nCompartilhamento de arquivos e impressoras: desativado\nFirewall do Windows: desativado"
      },
      {
        "id": 5,
        "nome": "Celina",
        "codigo": "Perfil da rede: Rede privada\nDescoberta de rede: ativada\nCompartilhamento de arquivos e impressoras: desativado\nFirewall do Windows: ativado"
      },
      {
        "id": 6,
        "nome": "Diogo",
        "codigo": "Perfil da rede: Rede privada\nDescoberta de rede: ativada\nCompartilhamento de arquivos e impressoras: ativado\nFirewall do Windows: ativado"
      }
    ],
    "pistas": [
      "O Windows tratou a rede do evento como se fosse a rede de casa.",
      "O notebook aparecia para os outros computadores da rede.",
      "A pasta estava liberada para acesso pela rede.",
      "O firewall estava ligado."
    ],
    "dicas": [
      "Em rede pública o Windows esconde o computador dos outros.",
      "O firewall libera o compartilhamento quando ele está ativado."
    ]
  },
  {
    "id": "c70",
    "disciplina": "Windows 11",
    "tipo": "codigo",
    "linguagem": "Configuração",
    "titulo": "O Ponto de Restauração que Faltou",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "Depois de instalar um driver, o computador passou a travar. O técnico tentou voltar ao estado anterior e não conseguiu, e os arquivos da Área de Trabalho também não tinham cópia. Seis fichas foram verificadas.",
    "pergunta": "Qual ficha é a do computador que não voltou?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Elaine",
        "codigo": "Proteção do sistema (disco C): ativada\nPontos de restauração: 3 pontos\nHistórico de Arquivos: desativado\nBackup do OneDrive: apenas Documentos"
      },
      {
        "id": 2,
        "nome": "Fausto",
        "codigo": "Proteção do sistema (disco C): ativada\nPontos de restauração: 3 pontos\nHistórico de Arquivos: desativado\nBackup do OneDrive: Área de Trabalho, Documentos e Imagens"
      },
      {
        "id": 3,
        "nome": "Glória",
        "codigo": "Proteção do sistema (disco C): desativada\nPontos de restauração: nenhum\nHistórico de Arquivos: desativado\nBackup do OneDrive: apenas Documentos"
      },
      {
        "id": 4,
        "nome": "Henrique",
        "codigo": "Proteção do sistema (disco C): desativada\nPontos de restauração: nenhum\nHistórico de Arquivos: ativado\nBackup do OneDrive: apenas Documentos"
      },
      {
        "id": 5,
        "nome": "Iolanda",
        "codigo": "Proteção do sistema (disco C): ativada\nPontos de restauração: 3 pontos\nHistórico de Arquivos: ativado\nBackup do OneDrive: apenas Documentos"
      },
      {
        "id": 6,
        "nome": "Jair",
        "codigo": "Proteção do sistema (disco C): desativada\nPontos de restauração: nenhum\nHistórico de Arquivos: desativado\nBackup do OneDrive: Área de Trabalho, Documentos e Imagens"
      }
    ],
    "pistas": [
      "O Windows não guardava fotografias do sistema antes das instalações.",
      "Não havia nenhum ponto para onde voltar.",
      "Não existiam versões antigas dos arquivos num disco externo.",
      "A nuvem não copiava a Área de Trabalho."
    ],
    "dicas": [
      "A Restauração do Sistema precisa de pontos de restauração.",
      "Histórico de Arquivos e OneDrive protegem arquivos, não o sistema."
    ]
  },
  {
    "id": "c71",
    "disciplina": "MS-DOS",
    "tipo": "codigo",
    "linguagem": "Terminal",
    "titulo": "O Diretório Errado",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "Na aula de prompt, um aluno tentou abrir o arquivo NOTAS.TXT, que está em C:\\TRABALHO, e recebeu erro. Seis colegas mostraram a sequência que digitaram.",
    "pergunta": "Quem digitou a sequência que deu erro?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Abel",
        "codigo": "Pasta atual: C:\\>\nComando: TYPE NOTAS.TXT\nResposta: Arquivo não encontrado"
      },
      {
        "id": 2,
        "nome": "Bia",
        "codigo": "Pasta atual: C:\\>\nComando: TYPE C:\\TRABALHO\\NOTAS.TXT\nResposta: mostrou o conteúdo"
      },
      {
        "id": 3,
        "nome": "Caetano",
        "codigo": "Pasta atual: C:\\TRABALHO>\nComando: TYPE C:\\TRABALHO\\NOTAS.TXT\nResposta: mostrou o conteúdo"
      },
      {
        "id": 4,
        "nome": "Dalva",
        "codigo": "Pasta atual: C:\\ESCOLA>\nComando: TYPE C:\\TRABALHO\\NOTAS.TXT\nResposta: mostrou o conteúdo"
      },
      {
        "id": 5,
        "nome": "Elias",
        "codigo": "Pasta atual: C:\\ESCOLA>\nComando: TYPE NOTAS.TXT\nResposta: Arquivo não encontrado"
      },
      {
        "id": 6,
        "nome": "Fabiana",
        "codigo": "Pasta atual: C:\\TRABALHO>\nComando: TYPE NOTAS.TXT\nResposta: mostrou o conteúdo"
      }
    ],
    "pistas": [
      "O prompt estava na raiz do disco.",
      "O comando pedia o arquivo só pelo nome, sem o caminho.",
      "O conteúdo do arquivo não apareceu na tela."
    ],
    "dicas": [
      "Sem o caminho completo, o DOS procura só na pasta atual.",
      "TYPE mostra o conteúdo de um arquivo de texto."
    ]
  },
  {
    "id": "c72",
    "disciplina": "MS-DOS",
    "tipo": "codigo",
    "linguagem": "Terminal",
    "titulo": "A Pasta Criada no Lugar Errado",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "O professor pediu uma pasta PROJETO dentro de ESCOLA. Seis alunos digitaram comandos e só um criou a pasta na raiz do disco.",
    "pergunta": "Quem criou a pasta na raiz?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Gilson",
        "codigo": "Pasta atual: C:\\JOGOS>\nComando: MD PROJETO\nResultado do DIR em C:\\ESCOLA: PROJETO não aparece"
      },
      {
        "id": 2,
        "nome": "Helena",
        "codigo": "Pasta atual: C:\\ESCOLA>\nComando: MD ESCOLA\\PROJETO\nResultado do DIR em C:\\ESCOLA: PROJETO não aparece"
      },
      {
        "id": 3,
        "nome": "Ícaro",
        "codigo": "Pasta atual: C:\\>\nComando: MD ESCOLA\\PROJETO\nResultado do DIR em C:\\ESCOLA: PROJETO aparece"
      },
      {
        "id": 4,
        "nome": "Joana",
        "codigo": "Pasta atual: C:\\JOGOS>\nComando: MD \\ESCOLA\\PROJETO\nResultado do DIR em C:\\ESCOLA: PROJETO aparece"
      },
      {
        "id": 5,
        "nome": "Kleber",
        "codigo": "Pasta atual: C:\\ESCOLA>\nComando: MD PROJETO\nResultado do DIR em C:\\ESCOLA: PROJETO aparece"
      },
      {
        "id": 6,
        "nome": "Lívia",
        "codigo": "Pasta atual: C:\\>\nComando: MD PROJETO\nResultado do DIR em C:\\ESCOLA: PROJETO não aparece"
      }
    ],
    "pistas": [
      "Quando o comando foi digitado, o prompt estava na raiz do disco.",
      "O comando não indicava a pasta ESCOLA no caminho.",
      "Ao listar a pasta ESCOLA, a pasta nova não estava lá."
    ],
    "dicas": [
      "MD (ou MKDIR) cria a pasta na pasta atual.",
      "Confira onde o prompt estava."
    ]
  },
  {
    "id": "c73",
    "disciplina": "MS-DOS",
    "tipo": "codigo",
    "linguagem": "Terminal",
    "titulo": "O Comando que Apagou Tudo",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "A pasta FOTOS amanheceu vazia. O histórico de comandos de seis contas foi recuperado.",
    "pergunta": "Qual histórico apagou as fotos?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Mateus",
        "codigo": "Pasta atual: C:\\FOTOS>\nComando: DIR *.*\nConfirmação \"Tem certeza (S/N)?\": nenhuma pergunta"
      },
      {
        "id": 2,
        "nome": "Noemi",
        "codigo": "Pasta atual: C:\\FOTOS>\nComando: DEL *.TMP\nConfirmação \"Tem certeza (S/N)?\": nenhuma pergunta"
      },
      {
        "id": 3,
        "nome": "Osvaldo",
        "codigo": "Pasta atual: C:\\FOTOS>\nComando: DEL *.*\nConfirmação \"Tem certeza (S/N)?\": respondeu S"
      },
      {
        "id": 4,
        "nome": "Priscila",
        "codigo": "Pasta atual: C:\\FOTOS>\nComando: DEL *.*\nConfirmação \"Tem certeza (S/N)?\": respondeu N"
      },
      {
        "id": 5,
        "nome": "Quênia",
        "codigo": "Pasta atual: C:\\BACKUP>\nComando: DEL *.*\nConfirmação \"Tem certeza (S/N)?\": respondeu S"
      },
      {
        "id": 6,
        "nome": "Renan",
        "codigo": "Pasta atual: C:\\BACKUP>\nComando: DEL *.*\nConfirmação \"Tem certeza (S/N)?\": respondeu N"
      }
    ],
    "pistas": [
      "O comando foi digitado dentro da pasta das fotos.",
      "O comando apagava qualquer arquivo, de qualquer nome e extensão.",
      "A pessoa confirmou a exclusão quando o DOS perguntou."
    ],
    "dicas": [
      "O curinga * representa qualquer nome ou extensão.",
      "DEL *.* pede confirmação antes de apagar."
    ]
  },
  {
    "id": "c74",
    "disciplina": "MS-DOS",
    "tipo": "codigo",
    "linguagem": "Terminal",
    "titulo": "A Cópia Incompleta",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Só os arquivos de texto do relatório chegaram ao pendrive (unidade E:). Seis alunos mostraram o comando usado.",
    "pergunta": "Quem copiou só os arquivos de texto?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Sabrina",
        "codigo": "Comando: COPY *.DOC E:\\\nPasta atual: C:\\RELATORIO>\nMensagem final: 6 arquivo(s) copiado(s)"
      },
      {
        "id": 2,
        "nome": "Tiago",
        "codigo": "Comando: COPY *.TXT E:\\\nPasta atual: C:\\RELATORIO>\nMensagem final: 3 arquivo(s) copiado(s)"
      },
      {
        "id": 3,
        "nome": "Úrsula",
        "codigo": "Comando: COPY *.* E:\\\nPasta atual: C:\\RELATORIO>\nMensagem final: 9 arquivo(s) copiado(s)"
      },
      {
        "id": 4,
        "nome": "Valdir",
        "codigo": "Comando: COPY *.TXT E:\\\nPasta atual: C:\\FOTOS>\nMensagem final: 0 arquivo(s) copiado(s)"
      },
      {
        "id": 5,
        "nome": "Wanda",
        "codigo": "Comando: COPY *.* E:\\\nPasta atual: C:\\>\nMensagem final: 4 arquivo(s) copiado(s)"
      },
      {
        "id": 6,
        "nome": "Xande",
        "codigo": "Comando: COPY *.TXT E:\\\nPasta atual: C:\\>\nMensagem final: 0 arquivo(s) copiado(s)"
      }
    ],
    "pistas": [
      "O comando copiava só os arquivos de texto.",
      "Os arquivos saíram da pasta do relatório.",
      "A mensagem final confirmou 3 arquivos copiados."
    ],
    "dicas": [
      "*.TXT seleciona só arquivos com extensão TXT.",
      "A pasta atual decide de onde os arquivos saem."
    ]
  },
  {
    "id": "c75",
    "disciplina": "MS-DOS",
    "tipo": "codigo",
    "linguagem": "Terminal",
    "titulo": "O Nome Trocado",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "O arquivo TRABALHO.DOC da pasta ESCOLA sumiu e apareceu um FINAL.DOC no lugar. Seis comandos foram encontrados no histórico.",
    "pergunta": "Quem trocou o nome do arquivo?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yago",
        "codigo": "Comando: DEL TRABALHO.DOC\nPasta atual: C:\\ESCOLA>\nDIR depois do comando: nenhum dos dois"
      },
      {
        "id": 2,
        "nome": "Zuleica",
        "codigo": "Comando: REN TRABALHO.DOC FINAL.DOC\nPasta atual: C:\\ESCOLA>\nDIR depois do comando: só FINAL.DOC"
      },
      {
        "id": 3,
        "nome": "Arnaldo",
        "codigo": "Comando: MOVE TRABALHO.DOC C:\\JOGOS\nPasta atual: C:\\ESCOLA>\nDIR depois do comando: nenhum dos dois"
      },
      {
        "id": 4,
        "nome": "Betina",
        "codigo": "Comando: REN TRABALHO.DOC FINAL.DOC\nPasta atual: C:\\JOGOS>\nDIR depois do comando: nenhum dos dois"
      },
      {
        "id": 5,
        "nome": "Cícero",
        "codigo": "Comando: COPY TRABALHO.DOC FINAL.DOC\nPasta atual: C:\\ESCOLA>\nDIR depois do comando: TRABALHO.DOC e FINAL.DOC"
      },
      {
        "id": 6,
        "nome": "Denise",
        "codigo": "Comando: COPY TRABALHO.DOC FINAL.DOC\nPasta atual: C:\\JOGOS>\nDIR depois do comando: nenhum dos dois"
      }
    ],
    "pistas": [
      "O comando mudou o nome sem criar um segundo arquivo.",
      "Aconteceu na pasta ESCOLA.",
      "Depois do comando, o DIR da pasta mostrava só o nome novo."
    ],
    "dicas": [
      "REN (RENAME) troca o nome; COPY cria um segundo arquivo.",
      "Depois de renomear, o nome antigo some."
    ]
  },
  {
    "id": "c76",
    "disciplina": "MS-DOS",
    "tipo": "codigo",
    "linguagem": "Terminal",
    "titulo": "A Tela Cheia de Texto",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "O professor pediu para listar só os nomes dos arquivos, sem detalhes, página por página. Seis alunos mostraram o comando e o que apareceu.",
    "pergunta": "Quem usou o comando certo?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Edson",
        "codigo": "Comando: DIR /W /P\nFormato da lista: nomes em colunas, sem data e tamanho\nAo encher a tela: pausa e pede uma tecla"
      },
      {
        "id": 2,
        "nome": "Flávia",
        "codigo": "Comando: DIR /W /S\nFormato da lista: nomes em colunas, sem data e tamanho\nAo encher a tela: rola até o fim sem parar"
      },
      {
        "id": 3,
        "nome": "Gustavo",
        "codigo": "Comando: DIR /P\nFormato da lista: uma linha por arquivo, com data e tamanho\nAo encher a tela: pausa e pede uma tecla"
      },
      {
        "id": 4,
        "nome": "Hilda",
        "codigo": "Comando: DIR\nFormato da lista: uma linha por arquivo, com data e tamanho\nAo encher a tela: rola até o fim sem parar"
      },
      {
        "id": 5,
        "nome": "Isaque",
        "codigo": "Comando: DIR /S\nFormato da lista: uma linha por arquivo, com data e tamanho\nAo encher a tela: rola até o fim sem parar"
      },
      {
        "id": 6,
        "nome": "Jussara",
        "codigo": "Comando: DIR /W\nFormato da lista: nomes em colunas, sem data e tamanho\nAo encher a tela: rola até o fim sem parar"
      }
    ],
    "pistas": [
      "O comando tinha uma opção para formato largo e outra para pausar.",
      "Na tela apareciam só os nomes, lado a lado.",
      "Dava tempo de ler cada página antes de continuar."
    ],
    "dicas": [
      "/W mostra em formato largo (só nomes).",
      "/P pausa a cada tela."
    ]
  },
  {
    "id": "c77",
    "disciplina": "MS-DOS",
    "tipo": "codigo",
    "linguagem": "Terminal",
    "titulo": "O Disco Formatado",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "O pendrive com o trabalho do grupo foi formatado por engano. Seis registros de comando foram analisados.",
    "pergunta": "Qual registro formatou o pendrive do grupo?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Kauê",
        "codigo": "Comando: FORMAT E:\nUnidade E:: leitor de cartão vazio\nConfirmação: respondeu S\nRótulo do volume depois: em branco"
      },
      {
        "id": 2,
        "nome": "Lorena",
        "codigo": "Comando: CHKDSK E:\nUnidade E:: pendrive do grupo\nConfirmação: nenhuma pergunta\nRótulo do volume depois: GRUPO3"
      },
      {
        "id": 3,
        "nome": "Moisés",
        "codigo": "Comando: FORMAT E:\nUnidade E:: pendrive do grupo\nConfirmação: respondeu S\nRótulo do volume depois: em branco"
      },
      {
        "id": 4,
        "nome": "Nádia",
        "codigo": "Comando: CHKDSK E:\nUnidade E:: leitor de cartão vazio\nConfirmação: nenhuma pergunta\nRótulo do volume depois: GRUPO3"
      },
      {
        "id": 5,
        "nome": "Otávio",
        "codigo": "Comando: FORMAT A:\nUnidade E:: pendrive do grupo\nConfirmação: respondeu S\nRótulo do volume depois: GRUPO3"
      },
      {
        "id": 6,
        "nome": "Paula",
        "codigo": "Comando: FORMAT E:\nUnidade E:: pendrive do grupo\nConfirmação: respondeu N\nRótulo do volume depois: GRUPO3"
      }
    ],
    "pistas": [
      "O comando apaga a unidade inteira, e não só verifica erros.",
      "A unidade atingida era a do pendrive do grupo.",
      "A pessoa confirmou quando o DOS avisou que tudo seria apagado.",
      "Depois, o nome GRUPO3 do pendrive tinha sumido."
    ],
    "dicas": [
      "FORMAT apaga a unidade inteira; CHKDSK só verifica.",
      "Depois de formatar, o rótulo antigo some."
    ]
  },
  {
    "id": "c78",
    "disciplina": "MS-DOS",
    "tipo": "codigo",
    "linguagem": "Terminal",
    "titulo": "O Arquivo de Lote Quebrado",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "O arquivo INICIAR.BAT deveria esconder os comandos, limpar a tela, entrar na pasta JOGO e abrir o jogo. Seis versões foram entregues e só uma funcionou.",
    "pergunta": "Qual versão do INICIAR.BAT funcionou?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Raí",
        "codigo": "Linha 1: @ECHO OFF\nLinha 2: CLS\nLinha 3: CD..\nLinha 4: JOGO.EXE"
      },
      {
        "id": 2,
        "nome": "Sueli",
        "codigo": "Linha 1: @ECHO OFF\nLinha 2: CLS\nLinha 3: CD JOGO\nLinha 4: JOGO.EXE"
      },
      {
        "id": 3,
        "nome": "Talita",
        "codigo": "Linha 1: @ECHO OFF\nLinha 2: DEL *.*\nLinha 3: CD JOGO\nLinha 4: JOGO.EXE"
      },
      {
        "id": 4,
        "nome": "Ubiratã",
        "codigo": "Linha 1: @ECHO OFF\nLinha 2: CLS\nLinha 3: CD JOGO\nLinha 4: TYPE JOGO.EXE"
      },
      {
        "id": 5,
        "nome": "Vanessa",
        "codigo": "Linha 1: @ECHO OFF\nLinha 2: CLS\nLinha 3: CD..\nLinha 4: TYPE JOGO.EXE"
      },
      {
        "id": 6,
        "nome": "Wellington",
        "codigo": "Linha 1: ECHO ON\nLinha 2: CLS\nLinha 3: CD JOGO\nLinha 4: JOGO.EXE"
      }
    ],
    "pistas": [
      "Os comandos do lote não apareciam na tela enquanto ele rodava.",
      "A tela ficou limpa e nenhum arquivo sumiu.",
      "O lote entrou na pasta do jogo, e não na pasta de cima.",
      "O jogo foi executado, e não exibido como texto embaralhado."
    ],
    "dicas": [
      "CLS limpa a tela; CD entra na pasta; CD.. sobe uma pasta.",
      "@ECHO OFF esconde os comandos enquanto o lote roda."
    ]
  },
  {
    "id": "c79",
    "disciplina": "MS-DOS",
    "tipo": "codigo",
    "linguagem": "Terminal",
    "titulo": "A Árvore Escondida",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "O professor pediu a estrutura de pastas do disco, com os arquivos, salva num arquivo para imprimir. Seis comandos foram usados.",
    "pergunta": "Quem gerou o arquivo certo?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yolanda",
        "codigo": "Comando: TREE C:\\ > ARVORE.TXT\nMostra pastas e subpastas: sim, em forma de árvore\nMostra os arquivos: não\nSaída: gravada em ARVORE.TXT"
      },
      {
        "id": 2,
        "nome": "Zeno",
        "codigo": "Comando: TREE C:\\ /F > ARVORE.TXT\nMostra pastas e subpastas: sim, em forma de árvore\nMostra os arquivos: sim\nSaída: gravada em ARVORE.TXT"
      },
      {
        "id": 3,
        "nome": "Adriana",
        "codigo": "Comando: DIR C:\\\nMostra pastas e subpastas: não, só a pasta atual\nMostra os arquivos: sim\nSaída: só na tela"
      },
      {
        "id": 4,
        "nome": "Benedito",
        "codigo": "Comando: TREE C:\\ /F\nMostra pastas e subpastas: sim, em forma de árvore\nMostra os arquivos: sim\nSaída: só na tela"
      },
      {
        "id": 5,
        "nome": "Celina",
        "codigo": "Comando: DIR C:\\ > ARVORE.TXT\nMostra pastas e subpastas: não, só a pasta atual\nMostra os arquivos: sim\nSaída: gravada em ARVORE.TXT"
      },
      {
        "id": 6,
        "nome": "Diogo",
        "codigo": "Comando: TREE C:\\\nMostra pastas e subpastas: sim, em forma de árvore\nMostra os arquivos: não\nSaída: só na tela"
      }
    ],
    "pistas": [
      "O comando desenhava a estrutura de pastas.",
      "Apareciam também as subpastas, com linhas ligando umas às outras.",
      "Os arquivos de cada pasta também estavam na lista.",
      "O resultado ficou num arquivo, pronto para imprimir."
    ],
    "dicas": [
      "TREE desenha as pastas; /F inclui os arquivos.",
      "O sinal > manda a saída para um arquivo."
    ]
  },
  {
    "id": "c80",
    "disciplina": "MS-DOS",
    "tipo": "codigo",
    "linguagem": "Terminal",
    "titulo": "O Atributo Somente Leitura",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "Ninguém conseguia salvar alterações no arquivo PROVAS.TXT, mas ele continuava aparecendo na pasta. Seis alunos executaram o comando ATTRIB.",
    "pergunta": "Quem deixou o arquivo protegido?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Elaine",
        "codigo": "Comando: ATTRIB +R PROVAS.TXT\nAtributos mostrados depois: R\nAo salvar no editor: Acesso negado\nArquivo aparece no DIR: sim"
      },
      {
        "id": 2,
        "nome": "Fausto",
        "codigo": "Comando: ATTRIB -R PROVAS.TXT\nAtributos mostrados depois: A\nAo salvar no editor: salvou normalmente\nArquivo aparece no DIR: sim"
      },
      {
        "id": 3,
        "nome": "Glória",
        "codigo": "Comando: ATTRIB +A PROVAS.TXT\nAtributos mostrados depois: A\nAo salvar no editor: salvou normalmente\nArquivo aparece no DIR: sim"
      },
      {
        "id": 4,
        "nome": "Henrique",
        "codigo": "Comando: ATTRIB +H PROVAS.TXT\nAtributos mostrados depois: H\nAo salvar no editor: salvou normalmente\nArquivo aparece no DIR: não"
      },
      {
        "id": 5,
        "nome": "Iolanda",
        "codigo": "Comando: ATTRIB +S PROVAS.TXT\nAtributos mostrados depois: S\nAo salvar no editor: salvou normalmente\nArquivo aparece no DIR: não"
      },
      {
        "id": 6,
        "nome": "Jair",
        "codigo": "Comando: ATTRIB +R +H PROVAS.TXT\nAtributos mostrados depois: R H\nAo salvar no editor: Acesso negado\nArquivo aparece no DIR: não"
      }
    ],
    "pistas": [
      "O comando ligou a proteção contra gravação.",
      "O ATTRIB mostrava o arquivo como somente leitura.",
      "O editor não conseguia gravar as alterações.",
      "O arquivo continuava aparecendo no DIR."
    ],
    "dicas": [
      "+R liga o somente leitura; +H esconde o arquivo.",
      "Arquivo oculto não aparece no DIR comum."
    ]
  },
  {
    "id": "c81",
    "disciplina": "Word",
    "tipo": "codigo",
    "linguagem": "Documento",
    "titulo": "O Título que Não Entrou no Sumário",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "O sumário automático do relatório saiu sem o capítulo 2. Seis alunos mostraram como formataram o capítulo.",
    "pergunta": "Qual formatação estava no relatório entregue?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Abel",
        "codigo": "Estilo do título do capítulo 2: Título 1\nSumário: Inserido pela guia Referências\nAtualizar sumário: Feito antes de entregar"
      },
      {
        "id": 2,
        "nome": "Bia",
        "codigo": "Estilo do título do capítulo 2: Normal, com negrito e fonte 16\nSumário: Inserido pela guia Referências\nAtualizar sumário: Nunca feito"
      },
      {
        "id": 3,
        "nome": "Caetano",
        "codigo": "Estilo do título do capítulo 2: Normal, com negrito e fonte 16\nSumário: Inserido pela guia Referências\nAtualizar sumário: Feito antes de entregar"
      },
      {
        "id": 4,
        "nome": "Dalva",
        "codigo": "Estilo do título do capítulo 2: Normal, com negrito e fonte 16\nSumário: Digitado à mão\nAtualizar sumário: Nunca feito"
      },
      {
        "id": 5,
        "nome": "Elias",
        "codigo": "Estilo do título do capítulo 2: Título 1\nSumário: Inserido pela guia Referências\nAtualizar sumário: Nunca feito"
      },
      {
        "id": 6,
        "nome": "Fabiana",
        "codigo": "Estilo do título do capítulo 2: Normal, com negrito e fonte 16\nSumário: Digitado à mão\nAtualizar sumário: Feito antes de entregar"
      }
    ],
    "pistas": [
      "O título parecia um título, mas para o Word era um parágrafo comum.",
      "O sumário era automático e mostrava os outros capítulos com página.",
      "Atualizar o sumário não resolveu o problema."
    ],
    "dicas": [
      "O sumário automático só lista parágrafos com estilos de título.",
      "Negrito e fonte grande não transformam um parágrafo em título."
    ]
  },
  {
    "id": "c82",
    "disciplina": "Word",
    "tipo": "codigo",
    "linguagem": "Documento",
    "titulo": "A Página em Branco no Meio",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "O trabalho impresso saiu com uma página em branco antes da conclusão. Seis versões do arquivo foram comparadas com as marcas de formatação ligadas.",
    "pergunta": "Qual versão foi impressa?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Gilson",
        "codigo": "Antes da conclusão: muitos ENTER seguidos (¶¶¶¶)\nVisualização: Layout de Impressão\nTamanho do papel: Carta"
      },
      {
        "id": 2,
        "nome": "Helena",
        "codigo": "Antes da conclusão: muitos ENTER seguidos (¶¶¶¶)\nVisualização: Modo de Leitura\nTamanho do papel: Carta"
      },
      {
        "id": 3,
        "nome": "Ícaro",
        "codigo": "Antes da conclusão: Quebra de página\nVisualização: Layout de Impressão\nTamanho do papel: Carta"
      },
      {
        "id": 4,
        "nome": "Joana",
        "codigo": "Antes da conclusão: Quebra de página\nVisualização: Layout de Impressão\nTamanho do papel: A4"
      },
      {
        "id": 5,
        "nome": "Kleber",
        "codigo": "Antes da conclusão: muitos ENTER seguidos (¶¶¶¶)\nVisualização: Modo de Leitura\nTamanho do papel: A4"
      },
      {
        "id": 6,
        "nome": "Lívia",
        "codigo": "Antes da conclusão: muitos ENTER seguidos (¶¶¶¶)\nVisualização: Layout de Impressão\nTamanho do papel: A4"
      }
    ],
    "pistas": [
      "Com as marcas ligadas, apareciam vários símbolos de parágrafo vazios antes da conclusão.",
      "O arquivo estava no modo que mostra as páginas como serão impressas.",
      "O papel configurado era o padrão brasileiro de 21 x 29,7 cm."
    ],
    "dicas": [
      "Ligue o botão ¶ para ver ENTER e quebras.",
      "A quebra de página empurra o texto sem criar parágrafos vazios."
    ]
  },
  {
    "id": "c83",
    "disciplina": "Word",
    "tipo": "codigo",
    "linguagem": "Documento",
    "titulo": "A Margem Fora da Norma",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "A professora devolveu o trabalho porque as margens não seguiam a ABNT (3 cm em cima e à esquerda, 2 cm embaixo e à direita). Seis configurações de página foram encontradas.",
    "pergunta": "Qual configuração estava no trabalho devolvido?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Mateus",
        "codigo": "Margem superior: 2,5 cm\nMargem esquerda: 3 cm\nMargem direita: 3 cm"
      },
      {
        "id": 2,
        "nome": "Noemi",
        "codigo": "Margem superior: 2,5 cm\nMargem esquerda: 2,5 cm\nMargem direita: 3 cm"
      },
      {
        "id": 3,
        "nome": "Osvaldo",
        "codigo": "Margem superior: 2,5 cm\nMargem esquerda: 2,5 cm\nMargem direita: 2 cm"
      },
      {
        "id": 4,
        "nome": "Priscila",
        "codigo": "Margem superior: 3 cm\nMargem esquerda: 3 cm\nMargem direita: 3 cm"
      },
      {
        "id": 5,
        "nome": "Quênia",
        "codigo": "Margem superior: 2,5 cm\nMargem esquerda: 3 cm\nMargem direita: 2 cm"
      },
      {
        "id": 6,
        "nome": "Renan",
        "codigo": "Margem superior: 3 cm\nMargem esquerda: 3 cm\nMargem direita: 2 cm"
      }
    ],
    "pistas": [
      "A margem de cima tinha menos de 3 cm.",
      "A margem esquerda estava correta.",
      "A margem direita estava correta."
    ],
    "dicas": [
      "ABNT: superior e esquerda 3 cm; inferior e direita 2 cm.",
      "Confira margem por margem."
    ]
  },
  {
    "id": "c84",
    "disciplina": "Word",
    "tipo": "codigo",
    "linguagem": "Documento",
    "titulo": "O Número da Página que Não Mudava",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Depois de incluir um capítulo novo, todos os números de página ficaram errados. Seis alunos mostraram o rodapé do trabalho.",
    "pergunta": "Qual rodapé estava no trabalho?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Sabrina",
        "codigo": "Número da página: digitado à mão em cada página\nRodapé: diferente na primeira página\nAlinhamento do número: centralizado"
      },
      {
        "id": 2,
        "nome": "Tiago",
        "codigo": "Número da página: campo inserido em Inserir > Número de Página\nRodapé: igual em todas as páginas\nAlinhamento do número: centralizado"
      },
      {
        "id": 3,
        "nome": "Úrsula",
        "codigo": "Número da página: campo inserido em Inserir > Número de Página\nRodapé: igual em todas as páginas\nAlinhamento do número: à direita"
      },
      {
        "id": 4,
        "nome": "Valdir",
        "codigo": "Número da página: digitado à mão em cada página\nRodapé: diferente na primeira página\nAlinhamento do número: à direita"
      },
      {
        "id": 5,
        "nome": "Wanda",
        "codigo": "Número da página: digitado à mão em cada página\nRodapé: igual em todas as páginas\nAlinhamento do número: à direita"
      },
      {
        "id": 6,
        "nome": "Xande",
        "codigo": "Número da página: digitado à mão em cada página\nRodapé: igual em todas as páginas\nAlinhamento do número: centralizado"
      }
    ],
    "pistas": [
      "Os números não se atualizaram sozinhos depois do capítulo novo.",
      "A capa também mostrava o rodapé, igual às outras páginas.",
      "O número ficava no canto direito do rodapé."
    ],
    "dicas": [
      "Número de página automático é um campo que se atualiza.",
      "Texto digitado não acompanha mudanças."
    ]
  },
  {
    "id": "c85",
    "disciplina": "Word",
    "tipo": "codigo",
    "linguagem": "Documento",
    "titulo": "A Imagem que Fugia do Lugar",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "No folheto da escola, a foto do laboratório pulava de página toda vez que alguém digitava um parágrafo acima. Seis versões do arquivo foram analisadas.",
    "pergunta": "Qual versão foi usada no folheto?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yago",
        "codigo": "Layout da imagem: Alinhado com o texto\nTamanho da imagem: largura de toda a página\nLegenda: digitada numa caixa de texto"
      },
      {
        "id": 2,
        "nome": "Zuleica",
        "codigo": "Layout da imagem: Alinhado com o texto\nTamanho da imagem: largura de toda a página\nLegenda: inserida em Referências > Inserir Legenda"
      },
      {
        "id": 3,
        "nome": "Arnaldo",
        "codigo": "Layout da imagem: Alinhado com o texto\nTamanho da imagem: metade da largura\nLegenda: inserida em Referências > Inserir Legenda"
      },
      {
        "id": 4,
        "nome": "Betina",
        "codigo": "Layout da imagem: Alinhado com o texto\nTamanho da imagem: metade da largura\nLegenda: digitada numa caixa de texto"
      },
      {
        "id": 5,
        "nome": "Cícero",
        "codigo": "Layout da imagem: Quadrado\nTamanho da imagem: largura de toda a página\nLegenda: inserida em Referências > Inserir Legenda"
      },
      {
        "id": 6,
        "nome": "Denise",
        "codigo": "Layout da imagem: Atrás do texto\nTamanho da imagem: largura de toda a página\nLegenda: digitada numa caixa de texto"
      }
    ],
    "pistas": [
      "A foto se comportava como se fosse uma letra no meio do texto.",
      "A foto ocupava a largura inteira, de margem a margem.",
      "A legenda era numerada automaticamente (\"Figura 1\")."
    ],
    "dicas": [
      "Alinhado com o texto: a imagem se comporta como uma letra grande.",
      "Imagem muito grande não cabe no fim da página e pula."
    ]
  },
  {
    "id": "c86",
    "disciplina": "Word",
    "tipo": "codigo",
    "linguagem": "Documento",
    "titulo": "O Texto em Duas Colunas",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "O jornal da turma deveria ter só a segunda página em duas colunas, mas a primeira também ficou assim. Seis versões foram comparadas.",
    "pergunta": "Qual versão foi publicada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Edson",
        "codigo": "Quebra antes da segunda página: Quebra de seção (próxima página)\nColunas aplicadas em: Documento inteiro\nLinha entre colunas: marcada"
      },
      {
        "id": 2,
        "nome": "Flávia",
        "codigo": "Quebra antes da segunda página: Quebra de página comum\nColunas aplicadas em: Desta seção em diante\nLinha entre colunas: desmarcada"
      },
      {
        "id": 3,
        "nome": "Gustavo",
        "codigo": "Quebra antes da segunda página: Quebra de página comum\nColunas aplicadas em: Documento inteiro\nLinha entre colunas: desmarcada"
      },
      {
        "id": 4,
        "nome": "Hilda",
        "codigo": "Quebra antes da segunda página: Quebra de página comum\nColunas aplicadas em: Desta seção em diante\nLinha entre colunas: marcada"
      },
      {
        "id": 5,
        "nome": "Isaque",
        "codigo": "Quebra antes da segunda página: Quebra de seção (próxima página)\nColunas aplicadas em: Documento inteiro\nLinha entre colunas: desmarcada"
      },
      {
        "id": 6,
        "nome": "Jussara",
        "codigo": "Quebra antes da segunda página: Quebra de página comum\nColunas aplicadas em: Documento inteiro\nLinha entre colunas: marcada"
      }
    ],
    "pistas": [
      "O documento tinha uma seção só, do começo ao fim.",
      "As colunas valiam para o arquivo todo.",
      "Havia um traço vertical separando as colunas."
    ],
    "dicas": [
      "Colunas diferentes no mesmo arquivo pedem quebra de seção.",
      "Quebra de página não cria uma seção nova."
    ]
  },
  {
    "id": "c87",
    "disciplina": "Word",
    "tipo": "codigo",
    "linguagem": "Documento",
    "titulo": "A Revisão que Sumiu",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "A coordenadora pediu para ver o que cada aluno alterou no texto, mas as mudanças apareceram sem marca nenhuma. Seis arquivos foram verificados na guia Revisão.",
    "pergunta": "Qual arquivo foi entregue?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Kauê",
        "codigo": "Controlar Alterações: desligado durante a edição\nComentários: nenhum\nProteção do documento: sem restrição\nExibir marcação: Sem Marcação"
      },
      {
        "id": 2,
        "nome": "Lorena",
        "codigo": "Controlar Alterações: desligado durante a edição\nComentários: nenhum\nProteção do documento: sem restrição\nExibir marcação: Marcação Simples"
      },
      {
        "id": 3,
        "nome": "Moisés",
        "codigo": "Controlar Alterações: desligado durante a edição\nComentários: nenhum\nProteção do documento: somente leitura\nExibir marcação: Sem Marcação"
      },
      {
        "id": 4,
        "nome": "Nádia",
        "codigo": "Controlar Alterações: ligado durante a edição\nComentários: nenhum\nProteção do documento: sem restrição\nExibir marcação: Marcação Simples"
      },
      {
        "id": 5,
        "nome": "Otávio",
        "codigo": "Controlar Alterações: desligado durante a edição\nComentários: nenhum\nProteção do documento: somente leitura\nExibir marcação: Marcação Simples"
      },
      {
        "id": 6,
        "nome": "Paula",
        "codigo": "Controlar Alterações: desligado durante a edição\nComentários: 3 comentários\nProteção do documento: sem restrição\nExibir marcação: Marcação Simples"
      }
    ],
    "pistas": [
      "As mudanças não ficaram registradas como alterações.",
      "Também não havia nenhum balão de comentário.",
      "Qualquer pessoa podia editar o arquivo.",
      "O modo de exibição não escondia marcas: elas simplesmente não existiam."
    ],
    "dicas": [
      "Controlar Alterações registra inserções e exclusões.",
      "Sem Marcação esconde as marcas, mas elas continuam lá."
    ]
  },
  {
    "id": "c88",
    "disciplina": "Word",
    "tipo": "codigo",
    "linguagem": "Documento",
    "titulo": "As Cartas da Formatura",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "A secretaria enviou convites personalizados, mas todos saíram com o nome «Nome» no lugar do nome do aluno. Seis versões da mala direta foram analisadas.",
    "pergunta": "Qual versão gerou os convites?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Raí",
        "codigo": "Lista de destinatários: nenhuma lista selecionada\nCampo no texto: «Nome» inserido como campo\nVisualizar resultados: desligado\nConcluir e Mesclar: não feito: imprimiu o modelo"
      },
      {
        "id": 2,
        "nome": "Sueli",
        "codigo": "Lista de destinatários: planilha com os alunos\nCampo no texto: «Nome» inserido como campo\nVisualizar resultados: ligado\nConcluir e Mesclar: Editar documentos individuais"
      },
      {
        "id": 3,
        "nome": "Talita",
        "codigo": "Lista de destinatários: planilha com os alunos\nCampo no texto: «Nome» inserido como campo\nVisualizar resultados: ligado\nConcluir e Mesclar: não feito: imprimiu o modelo"
      },
      {
        "id": 4,
        "nome": "Ubiratã",
        "codigo": "Lista de destinatários: planilha com os alunos\nCampo no texto: «Nome» inserido como campo\nVisualizar resultados: desligado\nConcluir e Mesclar: Editar documentos individuais"
      },
      {
        "id": 5,
        "nome": "Vanessa",
        "codigo": "Lista de destinatários: planilha com os alunos\nCampo no texto: «Nome» inserido como campo\nVisualizar resultados: desligado\nConcluir e Mesclar: não feito: imprimiu o modelo"
      },
      {
        "id": 6,
        "nome": "Wellington",
        "codigo": "Lista de destinatários: planilha com os alunos\nCampo no texto: Nome digitado à mão\nVisualizar resultados: desligado\nConcluir e Mesclar: não feito: imprimiu o modelo"
      }
    ],
    "pistas": [
      "A lista de alunos estava ligada ao documento.",
      "O nome era um campo da mala direta.",
      "Na tela apareciam os nomes dos campos, e não os dados.",
      "O que foi impresso foi o modelo, sem mesclar."
    ],
    "dicas": [
      "Visualizar resultados mostra os dados no lugar dos campos.",
      "Só o Concluir e Mesclar gera um convite por aluno."
    ]
  },
  {
    "id": "c89",
    "disciplina": "Word",
    "tipo": "codigo",
    "linguagem": "Documento",
    "titulo": "A Lista que Recomeçava",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "No manual do laboratório, a lista numerada de passos voltava ao 1 depois de cada imagem. Seis versões foram comparadas.",
    "pergunta": "Qual versão estava no manual?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yolanda",
        "codigo": "Numeração depois da imagem: Continuar numeração\nTipo de lista: Numerada automática\nEstilo dos passos: Lista com números\nImagens: em parágrafo próprio entre os passos"
      },
      {
        "id": 2,
        "nome": "Zeno",
        "codigo": "Numeração depois da imagem: Reiniciar em 1\nTipo de lista: Numerada automática\nEstilo dos passos: Lista com números\nImagens: dentro do mesmo parágrafo do passo"
      },
      {
        "id": 3,
        "nome": "Adriana",
        "codigo": "Numeração depois da imagem: Reiniciar em 1\nTipo de lista: Numerada automática\nEstilo dos passos: Lista com números\nImagens: em parágrafo próprio entre os passos"
      },
      {
        "id": 4,
        "nome": "Benedito",
        "codigo": "Numeração depois da imagem: Reiniciar em 1\nTipo de lista: Números digitados à mão\nEstilo dos passos: Lista com números\nImagens: em parágrafo próprio entre os passos"
      },
      {
        "id": 5,
        "nome": "Celina",
        "codigo": "Numeração depois da imagem: Reiniciar em 1\nTipo de lista: Numerada automática\nEstilo dos passos: Normal\nImagens: dentro do mesmo parágrafo do passo"
      },
      {
        "id": 6,
        "nome": "Diogo",
        "codigo": "Numeração depois da imagem: Reiniciar em 1\nTipo de lista: Numerada automática\nEstilo dos passos: Normal\nImagens: em parágrafo próprio entre os passos"
      }
    ],
    "pistas": [
      "Depois de cada imagem, a lista voltava a contar do 1.",
      "Os números eram criados pelo Word, e não digitados.",
      "Os passos usavam o estilo de lista numerada.",
      "Cada imagem ficava num parágrafo só dela, entre dois passos."
    ],
    "dicas": [
      "Clique com o botão direito no número para Continuar numeração.",
      "A imagem em parágrafo próprio quebra a sequência."
    ]
  },
  {
    "id": "c90",
    "disciplina": "Word",
    "tipo": "codigo",
    "linguagem": "Documento",
    "titulo": "O Cabeçalho da Capa",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "Na entrega final, o nome da escola apareceu no cabeçalho também da capa, que deveria ficar limpa, e o número 1 apareceu nela. Seis versões foram comparadas.",
    "pergunta": "Qual versão foi entregue?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Elaine",
        "codigo": "Primeira página diferente: desmarcado\nCabeçalho: vazio\nNúmero de página: campo no rodapé, começando em 1\nQuebra depois da capa: Quebra de página"
      },
      {
        "id": 2,
        "nome": "Fausto",
        "codigo": "Primeira página diferente: marcado\nCabeçalho: nome da escola em todas as páginas\nNúmero de página: campo no rodapé, começando em 1\nQuebra depois da capa: Quebra de página"
      },
      {
        "id": 3,
        "nome": "Glória",
        "codigo": "Primeira página diferente: desmarcado\nCabeçalho: nome da escola em todas as páginas\nNúmero de página: campo no rodapé, começando em 1\nQuebra depois da capa: Quebra de página"
      },
      {
        "id": 4,
        "nome": "Henrique",
        "codigo": "Primeira página diferente: desmarcado\nCabeçalho: nome da escola em todas as páginas\nNúmero de página: começando em 0\nQuebra depois da capa: Quebra de seção (próxima página)"
      },
      {
        "id": 5,
        "nome": "Iolanda",
        "codigo": "Primeira página diferente: desmarcado\nCabeçalho: nome da escola em todas as páginas\nNúmero de página: começando em 0\nQuebra depois da capa: Quebra de página"
      },
      {
        "id": 6,
        "nome": "Jair",
        "codigo": "Primeira página diferente: desmarcado\nCabeçalho: nome da escola em todas as páginas\nNúmero de página: campo no rodapé, começando em 1\nQuebra depois da capa: Quebra de seção (próxima página)"
      }
    ],
    "pistas": [
      "A capa usava o mesmo cabeçalho das outras páginas.",
      "O nome da escola estava no cabeçalho.",
      "A numeração era automática e começava no 1 já na capa.",
      "Não havia seção separada para a capa."
    ],
    "dicas": [
      "Primeira página diferente deixa a capa com cabeçalho próprio.",
      "Uma quebra de seção também permite numeração separada."
    ]
  },
  {
    "id": "c91",
    "disciplina": "Excel",
    "tipo": "codigo",
    "linguagem": "Planilha",
    "titulo": "A Soma da Cantina",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "A soma das vendas da semana (B2 a B6) deu errado no relatório da cantina. Seis monitores escreveram a fórmula de B7.",
    "pergunta": "De quem é a fórmula que foi usada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Abel",
        "codigo": "Fórmula em B7: =SOMA(B2:B6)\nResultado mostrado: número (o Excel calculou)\nFormato de B7: Moeda"
      },
      {
        "id": 2,
        "nome": "Bia",
        "codigo": "Fórmula em B7: =SOMA(B2:B5)\nResultado mostrado: número (o Excel calculou)\nFormato de B7: Moeda"
      },
      {
        "id": 3,
        "nome": "Caetano",
        "codigo": "Fórmula em B7: =SOMA(B2:B6)\nResultado mostrado: número (o Excel calculou)\nFormato de B7: Geral"
      },
      {
        "id": 4,
        "nome": "Dalva",
        "codigo": "Fórmula em B7: SOMA(B2:B6)\nResultado mostrado: o texto da fórmula\nFormato de B7: Moeda"
      },
      {
        "id": 5,
        "nome": "Elias",
        "codigo": "Fórmula em B7: =SOMA(B2:B5)\nResultado mostrado: número (o Excel calculou)\nFormato de B7: Geral"
      },
      {
        "id": 6,
        "nome": "Fabiana",
        "codigo": "Fórmula em B7: SOMA(B2:B5)\nResultado mostrado: o texto da fórmula\nFormato de B7: Geral"
      }
    ],
    "pistas": [
      "A soma deixou de fora o último dia da semana.",
      "Em B7 apareceu um valor calculado, e não o texto da fórmula.",
      "O total aparecia com R$ na frente."
    ],
    "dicas": [
      "A semana tinha cinco dias: B2, B3, B4, B5 e B6.",
      "Fórmula sem o sinal de igual vira texto."
    ]
  },
  {
    "id": "c92",
    "disciplina": "Excel",
    "tipo": "codigo",
    "linguagem": "Planilha",
    "titulo": "A Média que Contou o Zero",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "A média da turma ficou baixa porque um aluno faltoso entrou com nota 0, quando deveria ficar em branco. Seis fórmulas foram testadas na célula C10.",
    "pergunta": "Qual fórmula estava na planilha?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Gilson",
        "codigo": "Fórmula em C10: =SOMA(C2:C9)\nCélula do aluno faltoso: 0 digitado\nCasas decimais: nenhuma"
      },
      {
        "id": 2,
        "nome": "Helena",
        "codigo": "Fórmula em C10: =MÉDIA(C2:C9)\nCélula do aluno faltoso: 0 digitado\nCasas decimais: 1"
      },
      {
        "id": 3,
        "nome": "Ícaro",
        "codigo": "Fórmula em C10: =MÉDIA(C2:C9)\nCélula do aluno faltoso: vazia\nCasas decimais: 1"
      },
      {
        "id": 4,
        "nome": "Joana",
        "codigo": "Fórmula em C10: =MÁXIMO(C2:C9)\nCélula do aluno faltoso: 0 digitado\nCasas decimais: 1"
      },
      {
        "id": 5,
        "nome": "Kleber",
        "codigo": "Fórmula em C10: =MÉDIA(C2:C9)\nCélula do aluno faltoso: vazia\nCasas decimais: nenhuma"
      },
      {
        "id": 6,
        "nome": "Lívia",
        "codigo": "Fórmula em C10: =MÉDIA(C2:C9)\nCélula do aluno faltoso: 0 digitado\nCasas decimais: nenhuma"
      }
    ],
    "pistas": [
      "A célula calculava a média aritmética das notas.",
      "O aluno faltoso entrou na conta com nota zero.",
      "O resultado aparecia com uma casa depois da vírgula."
    ],
    "dicas": [
      "MÉDIA ignora células vazias, mas conta o zero.",
      "SOMA não é média."
    ]
  },
  {
    "id": "c93",
    "disciplina": "Excel",
    "tipo": "codigo",
    "linguagem": "Planilha",
    "titulo": "O Cifrão que Faltou",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "Na tabela de preços com desconto, só a primeira linha ficou certa: ao arrastar a fórmula, as outras usaram células vazias. O desconto está em F1. Seis fórmulas foram escritas em C2.",
    "pergunta": "Qual fórmula foi arrastada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Mateus",
        "codigo": "Fórmula em C2: =B2*0,9\nFórmula que apareceu em C3: =B3*0,9\nResultado em C3: preço com desconto"
      },
      {
        "id": 2,
        "nome": "Noemi",
        "codigo": "Fórmula em C2: =B2-B2*F1\nFórmula que apareceu em C3: =B3-B3*F2\nResultado em C3: preço sem desconto"
      },
      {
        "id": 3,
        "nome": "Osvaldo",
        "codigo": "Fórmula em C2: =B2*(1-$F1)\nFórmula que apareceu em C3: =B3*(1-$F2)\nResultado em C3: preço sem desconto"
      },
      {
        "id": 4,
        "nome": "Priscila",
        "codigo": "Fórmula em C2: =B2*(1-$F$1)\nFórmula que apareceu em C3: =B3*(1-$F$1)\nResultado em C3: preço com desconto"
      },
      {
        "id": 5,
        "nome": "Quênia",
        "codigo": "Fórmula em C2: =B2*(1-F1)\nFórmula que apareceu em C3: =B3*(1-F2)\nResultado em C3: preço sem desconto"
      },
      {
        "id": 6,
        "nome": "Renan",
        "codigo": "Fórmula em C2: =B2*(1-F$1)\nFórmula que apareceu em C3: =B3*(1-F$1)\nResultado em C3: preço com desconto"
      }
    ],
    "pistas": [
      "Na primeira linha, a fórmula era preço × (1 − desconto), sem nenhum $.",
      "Ao arrastar, a referência do desconto desceu uma linha.",
      "Na segunda linha, o preço ficou igual ao original."
    ],
    "dicas": [
      "O $ trava a linha e a coluna quando a fórmula é copiada.",
      "F2 está vazio, e 1 - 0 = 1."
    ]
  },
  {
    "id": "c94",
    "disciplina": "Excel",
    "tipo": "codigo",
    "linguagem": "Planilha",
    "titulo": "A Aprovação Invertida",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "A planilha de notas marcou como \"Reprovado\" um aluno com média 7, a média para passar. Seis fórmulas de situação foram escritas em D2.",
    "pergunta": "Qual fórmula estava na planilha?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Sabrina",
        "codigo": "Fórmula em D2: =SE(C2>=7;\"Aprovado\";\"Reprovado\")\nMédia do aluno em C2: 8\nResultado em D2: Aprovado"
      },
      {
        "id": 2,
        "nome": "Tiago",
        "codigo": "Fórmula em D2: =SE(C2>7;\"Aprovado\";\"Reprovado\")\nMédia do aluno em C2: 6,5\nResultado em D2: Reprovado"
      },
      {
        "id": 3,
        "nome": "Úrsula",
        "codigo": "Fórmula em D2: =SE(C2>=7;\"Aprovado\";\"Reprovado\")\nMédia do aluno em C2: 7\nResultado em D2: Aprovado"
      },
      {
        "id": 4,
        "nome": "Valdir",
        "codigo": "Fórmula em D2: =SE(C2>=7;\"Aprovado\";\"Reprovado\")\nMédia do aluno em C2: 6,5\nResultado em D2: Reprovado"
      },
      {
        "id": 5,
        "nome": "Wanda",
        "codigo": "Fórmula em D2: =SE(C2>7;\"Aprovado\";\"Reprovado\")\nMédia do aluno em C2: 8\nResultado em D2: Aprovado"
      },
      {
        "id": 6,
        "nome": "Xande",
        "codigo": "Fórmula em D2: =SE(C2>7;\"Aprovado\";\"Reprovado\")\nMédia do aluno em C2: 7\nResultado em D2: Reprovado"
      }
    ],
    "pistas": [
      "A fórmula só aprovava médias acima de 7, e não a partir de 7.",
      "O aluno tinha exatamente a média mínima.",
      "A célula mostrou que ele não passou."
    ],
    "dicas": [
      "> é \"maior que\"; >= é \"maior ou igual\".",
      "Com média exatamente 7, só >= aprova."
    ]
  },
  {
    "id": "c95",
    "disciplina": "Excel",
    "tipo": "codigo",
    "linguagem": "Planilha",
    "titulo": "O Gráfico Enganoso",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "O gráfico de pizza da eleição do grêmio mostrou uma chapa com fatia enorme, porque o total de votos entrou como se fosse uma chapa. Seis versões do gráfico foram encontradas.",
    "pergunta": "Qual versão foi publicada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yago",
        "codigo": "Intervalo de dados: A1:B4\nTipo de gráfico: Pizza\nRótulos de dados: Porcentagem"
      },
      {
        "id": 2,
        "nome": "Zuleica",
        "codigo": "Intervalo de dados: A1:B5 (incluindo a linha Total)\nTipo de gráfico: Colunas\nRótulos de dados: Porcentagem"
      },
      {
        "id": 3,
        "nome": "Arnaldo",
        "codigo": "Intervalo de dados: A1:B5 (incluindo a linha Total)\nTipo de gráfico: Pizza\nRótulos de dados: Valor"
      },
      {
        "id": 4,
        "nome": "Betina",
        "codigo": "Intervalo de dados: A1:B5 (incluindo a linha Total)\nTipo de gráfico: Colunas\nRótulos de dados: Valor"
      },
      {
        "id": 5,
        "nome": "Cícero",
        "codigo": "Intervalo de dados: A1:B4\nTipo de gráfico: Pizza\nRótulos de dados: Valor"
      },
      {
        "id": 6,
        "nome": "Denise",
        "codigo": "Intervalo de dados: A1:B5 (incluindo a linha Total)\nTipo de gráfico: Pizza\nRótulos de dados: Porcentagem"
      }
    ],
    "pistas": [
      "A linha com o total de votos entrou no gráfico.",
      "O gráfico era redondo, dividido em fatias.",
      "As fatias mostravam percentuais."
    ],
    "dicas": [
      "A linha 5 tem o total de votos.",
      "Na pizza, cada fatia é uma parte do todo."
    ]
  },
  {
    "id": "c96",
    "disciplina": "Excel",
    "tipo": "codigo",
    "linguagem": "Planilha",
    "titulo": "O PROCV que Errou o Preço",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "O caixa da feira cobrou o preço do produto errado. A tabela de produtos fica em A2:C20 (código, nome, preço). Seis fórmulas foram escritas.",
    "pergunta": "Qual fórmula estava no caixa?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Edson",
        "codigo": "Fórmula: =PROCV(E2;A2:C20;3;FALSO)\nColuna devolvida: preço\nCódigos da tabela: fora de ordem"
      },
      {
        "id": 2,
        "nome": "Flávia",
        "codigo": "Fórmula: =PROCV(E2;A2:C20;3;VERDADEIRO)\nColuna devolvida: nome\nCódigos da tabela: em ordem crescente"
      },
      {
        "id": 3,
        "nome": "Gustavo",
        "codigo": "Fórmula: =PROCV(E2;A2:C20;3;VERDADEIRO)\nColuna devolvida: preço\nCódigos da tabela: fora de ordem"
      },
      {
        "id": 4,
        "nome": "Hilda",
        "codigo": "Fórmula: =PROCV(E2;A2:C20;3;VERDADEIRO)\nColuna devolvida: preço\nCódigos da tabela: em ordem crescente"
      },
      {
        "id": 5,
        "nome": "Isaque",
        "codigo": "Fórmula: =PROCV(E2;A2:C20;3;FALSO)\nColuna devolvida: preço\nCódigos da tabela: em ordem crescente"
      },
      {
        "id": 6,
        "nome": "Jussara",
        "codigo": "Fórmula: =PROCV(E2;A2:C20;3;VERDADEIRO)\nColuna devolvida: nome\nCódigos da tabela: fora de ordem"
      }
    ],
    "pistas": [
      "A busca não era exata: aceitava o valor mais próximo.",
      "O caixa mostrou um valor em reais, e não um nome.",
      "Os códigos da tabela não estavam em ordem crescente."
    ],
    "dicas": [
      "A 3ª coluna é a do preço.",
      "VERDADEIRO faz busca aproximada e precisa da tabela em ordem."
    ]
  },
  {
    "id": "c97",
    "disciplina": "Excel",
    "tipo": "codigo",
    "linguagem": "Planilha",
    "titulo": "O Total que Virou Texto",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "A soma do estoque deu 0, mas as quantidades estavam na tela. As células vieram de um sistema antigo. Seis diagnósticos foram feitos.",
    "pergunta": "Qual diagnóstico corresponde à planilha do estoque?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Kauê",
        "codigo": "Alinhamento dos números: à esquerda\nTriângulo verde no canto: aparece\nFórmula do total: =CONT.VALORES(B2:B30)\nResultado do total: 29"
      },
      {
        "id": 2,
        "nome": "Lorena",
        "codigo": "Alinhamento dos números: à direita\nTriângulo verde no canto: não aparece\nFórmula do total: =SOMA(B2:B30)\nResultado do total: soma correta"
      },
      {
        "id": 3,
        "nome": "Moisés",
        "codigo": "Alinhamento dos números: à direita\nTriângulo verde no canto: não aparece\nFórmula do total: =CONT.VALORES(B2:B30)\nResultado do total: 29"
      },
      {
        "id": 4,
        "nome": "Nádia",
        "codigo": "Alinhamento dos números: à direita\nTriângulo verde no canto: não aparece\nFórmula do total: =SOMA(B2:B29)\nResultado do total: soma sem a última linha"
      },
      {
        "id": 5,
        "nome": "Otávio",
        "codigo": "Alinhamento dos números: à esquerda\nTriângulo verde no canto: aparece\nFórmula do total: =SOMA(B2:B30)\nResultado do total: 0"
      },
      {
        "id": 6,
        "nome": "Paula",
        "codigo": "Alinhamento dos números: à esquerda\nTriângulo verde no canto: não aparece (aviso desligado)\nFórmula do total: =SOMA(B2:B30)\nResultado do total: 0"
      }
    ],
    "pistas": [
      "As quantidades estavam encostadas à esquerda da célula.",
      "O Excel mostrava um aviso no canto de cada quantidade.",
      "O total usava a função de somar.",
      "O total mostrou zero."
    ],
    "dicas": [
      "Número guardado como texto fica à esquerda.",
      "O triângulo verde avisa \"número armazenado como texto\"."
    ]
  },
  {
    "id": "c98",
    "disciplina": "Excel",
    "tipo": "codigo",
    "linguagem": "Planilha",
    "titulo": "O Filtro Esquecido",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "O relatório enviado à direção mostrava só 12 alunos, mas a turma tem 35. Seis versões da planilha foram abertas.",
    "pergunta": "Qual versão foi enviada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Raí",
        "codigo": "Filtro na coluna Turma: ativo: só \"2B\"\nNúmeros das linhas: azuis e pulando\nBarra de status: 12 de 35 registros encontrados\nLinhas ocultas manualmente: nenhuma"
      },
      {
        "id": 2,
        "nome": "Sueli",
        "codigo": "Filtro na coluna Turma: sem filtro\nNúmeros das linhas: pretos, pulando de 7 para 13\nBarra de status: 35 registros\nLinhas ocultas manualmente: 5 linhas"
      },
      {
        "id": 3,
        "nome": "Talita",
        "codigo": "Filtro na coluna Turma: sem filtro\nNúmeros das linhas: pretos, pulando de 20 para 23\nBarra de status: 35 registros\nLinhas ocultas manualmente: 2 linhas"
      },
      {
        "id": 4,
        "nome": "Ubiratã",
        "codigo": "Filtro na coluna Turma: ativo: só \"1A\"\nNúmeros das linhas: azuis e pulando\nBarra de status: 10 de 35 registros encontrados\nLinhas ocultas manualmente: nenhuma"
      },
      {
        "id": 5,
        "nome": "Vanessa",
        "codigo": "Filtro na coluna Turma: sem filtro\nNúmeros das linhas: pretos e seguidos\nBarra de status: 35 registros\nLinhas ocultas manualmente: nenhuma"
      },
      {
        "id": 6,
        "nome": "Wellington",
        "codigo": "Filtro na coluna Turma: ativo: só \"2B\"\nNúmeros das linhas: azuis e pulando\nBarra de status: 12 de 35 registros encontrados\nLinhas ocultas manualmente: 5 linhas"
      }
    ],
    "pistas": [
      "Só os alunos de uma turma estavam visíveis.",
      "Os números das linhas apareciam em azul e saltando.",
      "A barra de status dizia que apareciam 12 de 35 registros.",
      "Ninguém escondeu linhas com o botão direito."
    ],
    "dicas": [
      "Números de linha azuis indicam filtro.",
      "A barra de status diz quantos registros o filtro mostra."
    ]
  },
  {
    "id": "c99",
    "disciplina": "Excel",
    "tipo": "codigo",
    "linguagem": "Planilha",
    "titulo": "A Data que Virou Número",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "Na planilha de entregas, as datas apareciam como 45627, 45628... Seis versões foram analisadas.",
    "pergunta": "Qual versão estava na planilha de entregas?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yolanda",
        "codigo": "Formato da coluna de datas: Geral\nValor de 45627: foi digitado como texto\nFórmula de prazo: =TEXTO(B2;\"dd/mm\")\nResultado do prazo: o mesmo texto digitado"
      },
      {
        "id": 2,
        "nome": "Zeno",
        "codigo": "Formato da coluna de datas: Data abreviada\nValor de 45627: é uma data guardada como número de série\nFórmula de prazo: =TEXTO(B2;\"dd/mm\")\nResultado do prazo: dia e mês, como texto"
      },
      {
        "id": 3,
        "nome": "Adriana",
        "codigo": "Formato da coluna de datas: Geral\nValor de 45627: é uma data guardada como número de série\nFórmula de prazo: =TEXTO(B2;\"dd/mm\")\nResultado do prazo: dia e mês, como texto"
      },
      {
        "id": 4,
        "nome": "Benedito",
        "codigo": "Formato da coluna de datas: Data abreviada\nValor de 45627: é uma data guardada como número de série\nFórmula de prazo: =B2+7\nResultado do prazo: data uma semana depois"
      },
      {
        "id": 5,
        "nome": "Celina",
        "codigo": "Formato da coluna de datas: Geral\nValor de 45627: é uma data guardada como número de série\nFórmula de prazo: =B2+7\nResultado do prazo: 45634"
      },
      {
        "id": 6,
        "nome": "Diogo",
        "codigo": "Formato da coluna de datas: Geral\nValor de 45627: foi digitado como texto\nFórmula de prazo: =B2+7\nResultado do prazo: #VALOR!"
      }
    ],
    "pistas": [
      "A coluna estava com o formato padrão, sem formato de data.",
      "O número era a data guardada do jeito que o Excel guarda datas.",
      "O prazo foi calculado somando 7 à data.",
      "O prazo também apareceu como um número de cinco dígitos."
    ],
    "dicas": [
      "O Excel guarda datas como números de série.",
      "Mudar o formato para Data mostra a data de novo."
    ]
  },
  {
    "id": "c100",
    "disciplina": "Excel",
    "tipo": "codigo",
    "linguagem": "Planilha",
    "titulo": "A Tabela Dinâmica Desatualizada",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "A tabela dinâmica do relatório de vendas não mostrou as vendas da última semana, que já estavam na planilha. Seis versões foram analisadas.",
    "pergunta": "Qual versão foi apresentada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Elaine",
        "codigo": "Fonte de dados: A1:D120 (intervalo fixo)\nLinhas da planilha de vendas: 150\nAtualizar tudo: não clicado\nCampo de valores: Soma de Valor"
      },
      {
        "id": 2,
        "nome": "Fausto",
        "codigo": "Fonte de dados: A1:D120 (intervalo fixo)\nLinhas da planilha de vendas: 150\nAtualizar tudo: clicado depois de colar\nCampo de valores: Contagem de Valor"
      },
      {
        "id": 3,
        "nome": "Glória",
        "codigo": "Fonte de dados: Tabela \"Vendas\" (cresce sozinha)\nLinhas da planilha de vendas: 150\nAtualizar tudo: não clicado\nCampo de valores: Soma de Valor"
      },
      {
        "id": 4,
        "nome": "Henrique",
        "codigo": "Fonte de dados: A1:D120 (intervalo fixo)\nLinhas da planilha de vendas: 150\nAtualizar tudo: clicado depois de colar\nCampo de valores: Soma de Valor"
      },
      {
        "id": 5,
        "nome": "Iolanda",
        "codigo": "Fonte de dados: A1:D120 (intervalo fixo)\nLinhas da planilha de vendas: 120\nAtualizar tudo: não clicado\nCampo de valores: Soma de Valor"
      },
      {
        "id": 6,
        "nome": "Jair",
        "codigo": "Fonte de dados: A1:D120 (intervalo fixo)\nLinhas da planilha de vendas: 150\nAtualizar tudo: não clicado\nCampo de valores: Contagem de Valor"
      }
    ],
    "pistas": [
      "A tabela dinâmica lia um intervalo que não cresce sozinho.",
      "A planilha de vendas tinha mais linhas do que a fonte da tabela dinâmica.",
      "Ninguém mandou atualizar a tabela dinâmica.",
      "Os valores eram somados, e não contados."
    ],
    "dicas": [
      "Tabela dinâmica não atualiza sozinha.",
      "Um intervalo fixo não inclui linhas novas."
    ]
  },
  {
    "id": "c101",
    "disciplina": "PowerPoint",
    "tipo": "codigo",
    "linguagem": "Apresentação",
    "titulo": "O Slide Ilegível no Telão",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "Na apresentação do projeto, ninguém conseguiu ler o slide 3 no telão. Seis versões do slide foram encontradas.",
    "pergunta": "Qual versão foi apresentada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Abel",
        "codigo": "Tamanho do texto: 12 pt\nContraste: texto preto em fundo branco\nQuantidade de texto: parágrafo de 15 linhas"
      },
      {
        "id": 2,
        "nome": "Bia",
        "codigo": "Tamanho do texto: 28 pt\nContraste: texto cinza-claro em fundo branco\nQuantidade de texto: 4 tópicos curtos"
      },
      {
        "id": 3,
        "nome": "Caetano",
        "codigo": "Tamanho do texto: 12 pt\nContraste: texto preto em fundo branco\nQuantidade de texto: 4 tópicos curtos"
      },
      {
        "id": 4,
        "nome": "Dalva",
        "codigo": "Tamanho do texto: 12 pt\nContraste: texto cinza-claro em fundo branco\nQuantidade de texto: parágrafo de 15 linhas"
      },
      {
        "id": 5,
        "nome": "Elias",
        "codigo": "Tamanho do texto: 12 pt\nContraste: texto cinza-claro em fundo branco\nQuantidade de texto: 4 tópicos curtos"
      },
      {
        "id": 6,
        "nome": "Fabiana",
        "codigo": "Tamanho do texto: 28 pt\nContraste: texto cinza-claro em fundo branco\nQuantidade de texto: parágrafo de 15 linhas"
      }
    ],
    "pistas": [
      "A letra era pequena demais para quem estava no fundo do auditório.",
      "A cor do texto quase sumia no fundo.",
      "Era um bloco enorme de texto corrido."
    ],
    "dicas": [
      "Para telão, use texto a partir de 24 pt.",
      "Prefira poucos tópicos curtos com bom contraste."
    ]
  },
  {
    "id": "c102",
    "disciplina": "PowerPoint",
    "tipo": "codigo",
    "linguagem": "Apresentação",
    "titulo": "A Apresentação que Começou do Meio",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "Ao apertar o botão de apresentar, a apresentação começou no slide 5. Seis alunos mostraram o que fizeram.",
    "pergunta": "Quem fez a apresentação começar no slide 5?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Gilson",
        "codigo": "Botão usado: Do Começo (F5)\nSlide selecionado antes: slide 5\nSlides ocultos: slides 1 a 4 ocultos"
      },
      {
        "id": 2,
        "nome": "Helena",
        "codigo": "Botão usado: Do Começo (F5)\nSlide selecionado antes: slide 5\nSlides ocultos: nenhum"
      },
      {
        "id": 3,
        "nome": "Ícaro",
        "codigo": "Botão usado: Do Começo (F5)\nSlide selecionado antes: slide 1\nSlides ocultos: slides 1 a 4 ocultos"
      },
      {
        "id": 4,
        "nome": "Joana",
        "codigo": "Botão usado: Do Slide Atual (Shift + F5)\nSlide selecionado antes: slide 1\nSlides ocultos: slides 1 a 4 ocultos"
      },
      {
        "id": 5,
        "nome": "Kleber",
        "codigo": "Botão usado: Do Slide Atual (Shift + F5)\nSlide selecionado antes: slide 1\nSlides ocultos: nenhum"
      },
      {
        "id": 6,
        "nome": "Lívia",
        "codigo": "Botão usado: Do Slide Atual (Shift + F5)\nSlide selecionado antes: slide 5\nSlides ocultos: nenhum"
      }
    ],
    "pistas": [
      "O botão usado começava pelo slide que estava selecionado.",
      "O aluno estava editando o slide 5 antes de apresentar.",
      "Nenhum slide estava escondido."
    ],
    "dicas": [
      "F5 começa do slide 1; Shift + F5, do slide selecionado.",
      "Slides ocultos são pulados."
    ]
  },
  {
    "id": "c103",
    "disciplina": "PowerPoint",
    "tipo": "codigo",
    "linguagem": "Apresentação",
    "titulo": "As Anotações que Apareceram no Telão",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "O apresentador queria ver as anotações só no notebook, mas o telão mostrou as anotações e o cronômetro. Seis configurações foram verificadas.",
    "pergunta": "Qual configuração estava no notebook?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Mateus",
        "codigo": "Modo de Exibição do Apresentador: ativado\nMonitor da apresentação: Monitor 2 (telão)\nProjeção: Estender"
      },
      {
        "id": 2,
        "nome": "Noemi",
        "codigo": "Modo de Exibição do Apresentador: ativado\nMonitor da apresentação: Principal (notebook)\nProjeção: Duplicar"
      },
      {
        "id": 3,
        "nome": "Osvaldo",
        "codigo": "Modo de Exibição do Apresentador: ativado\nMonitor da apresentação: Principal (notebook)\nProjeção: Estender"
      },
      {
        "id": 4,
        "nome": "Priscila",
        "codigo": "Modo de Exibição do Apresentador: desativado\nMonitor da apresentação: Principal (notebook)\nProjeção: Duplicar"
      },
      {
        "id": 5,
        "nome": "Quênia",
        "codigo": "Modo de Exibição do Apresentador: ativado\nMonitor da apresentação: Monitor 2 (telão)\nProjeção: Duplicar"
      },
      {
        "id": 6,
        "nome": "Renan",
        "codigo": "Modo de Exibição do Apresentador: desativado\nMonitor da apresentação: Principal (notebook)\nProjeção: Estender"
      }
    ],
    "pistas": [
      "O modo que mostra anotações e cronômetro estava ligado.",
      "Os slides foram enviados para a tela do próprio notebook.",
      "O telão funcionava como uma segunda tela, diferente da do notebook."
    ],
    "dicas": [
      "O Modo do Apresentador mostra anotações no monitor que não é o da apresentação.",
      "Se a apresentação vai para o notebook, o Modo do Apresentador vai para o telão."
    ]
  },
  {
    "id": "c104",
    "disciplina": "PowerPoint",
    "tipo": "codigo",
    "linguagem": "Apresentação",
    "titulo": "A Transição Exagerada",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Os jurados reclamaram de efeitos que demoravam e de sons a cada slide. Seis versões foram analisadas na guia Transições.",
    "pergunta": "Qual versão foi apresentada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Sabrina",
        "codigo": "Transição: Vórtice\nDuração: 05,00 s\nSom: [Sem Som]"
      },
      {
        "id": 2,
        "nome": "Tiago",
        "codigo": "Transição: Vórtice\nDuração: 00,70 s\nSom: Aplausos"
      },
      {
        "id": 3,
        "nome": "Úrsula",
        "codigo": "Transição: Vórtice\nDuração: 00,70 s\nSom: [Sem Som]"
      },
      {
        "id": 4,
        "nome": "Valdir",
        "codigo": "Transição: Vórtice\nDuração: 05,00 s\nSom: Aplausos"
      },
      {
        "id": 5,
        "nome": "Wanda",
        "codigo": "Transição: Esmaecer\nDuração: 05,00 s\nSom: [Sem Som]"
      },
      {
        "id": 6,
        "nome": "Xande",
        "codigo": "Transição: Esmaecer\nDuração: 05,00 s\nSom: Aplausos"
      }
    ],
    "pistas": [
      "A troca de slide girava a tela num redemoinho.",
      "Cada troca levava vários segundos.",
      "Cada troca vinha com som de palmas."
    ],
    "dicas": [
      "Transições discretas e curtas são mais profissionais.",
      "O som da transição toca a cada troca de slide."
    ]
  },
  {
    "id": "c105",
    "disciplina": "PowerPoint",
    "tipo": "codigo",
    "linguagem": "Apresentação",
    "titulo": "O Vídeo que Não Tocou",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "No notebook do auditório, o vídeo do slide 4 apareceu como um quadro preto com um aviso. Seis versões do arquivo foram analisadas.",
    "pergunta": "Qual versão foi levada ao auditório?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yago",
        "codigo": "Como o vídeo entrou: Vincular ao arquivo\nPasta do vídeo: na Área de Trabalho do computador de casa\nTamanho do arquivo .pptx: 3 MB"
      },
      {
        "id": 2,
        "nome": "Zuleica",
        "codigo": "Como o vídeo entrou: Inserir (incorporado)\nPasta do vídeo: na Área de Trabalho do computador de casa\nTamanho do arquivo .pptx: 180 MB"
      },
      {
        "id": 3,
        "nome": "Arnaldo",
        "codigo": "Como o vídeo entrou: Inserir (incorporado)\nPasta do vídeo: na pasta Vídeos do notebook do auditório\nTamanho do arquivo .pptx: 180 MB"
      },
      {
        "id": 4,
        "nome": "Betina",
        "codigo": "Como o vídeo entrou: Vincular ao arquivo\nPasta do vídeo: na pasta Vídeos do notebook do auditório\nTamanho do arquivo .pptx: 3 MB"
      },
      {
        "id": 5,
        "nome": "Cícero",
        "codigo": "Como o vídeo entrou: Inserir (incorporado)\nPasta do vídeo: junto com a apresentação no pendrive\nTamanho do arquivo .pptx: 180 MB"
      },
      {
        "id": 6,
        "nome": "Denise",
        "codigo": "Como o vídeo entrou: Vincular ao arquivo\nPasta do vídeo: junto com a apresentação no pendrive\nTamanho do arquivo .pptx: 3 MB"
      }
    ],
    "pistas": [
      "O vídeo não estava dentro do arquivo da apresentação.",
      "O arquivo do vídeo tinha ficado em outro computador.",
      "O arquivo da apresentação era pequeno demais para ter um vídeo dentro."
    ],
    "dicas": [
      "Vídeo vinculado não vai dentro do .pptx.",
      "Um arquivo de 3 MB não tem um vídeo dentro."
    ]
  },
  {
    "id": "c106",
    "disciplina": "PowerPoint",
    "tipo": "codigo",
    "linguagem": "Apresentação",
    "titulo": "O Slide Mestre Esquecido",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "O logotipo da escola deveria aparecer em todos os slides, mas só saiu no primeiro. Seis alunos mostraram onde puseram o logo.",
    "pergunta": "Quem colocou o logotipo?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Edson",
        "codigo": "Onde o logo foi colado: no slide 1, no modo Normal\nLayout dos outros slides: Título e Conteúdo\nTema: mesmo tema em todos"
      },
      {
        "id": 2,
        "nome": "Flávia",
        "codigo": "Onde o logo foi colado: no Slide Mestre\nLayout dos outros slides: Título e Conteúdo\nTema: temas diferentes"
      },
      {
        "id": 3,
        "nome": "Gustavo",
        "codigo": "Onde o logo foi colado: no slide 1, no modo Normal\nLayout dos outros slides: Em Branco\nTema: temas diferentes"
      },
      {
        "id": 4,
        "nome": "Hilda",
        "codigo": "Onde o logo foi colado: no slide 1, no modo Normal\nLayout dos outros slides: Título e Conteúdo\nTema: temas diferentes"
      },
      {
        "id": 5,
        "nome": "Isaque",
        "codigo": "Onde o logo foi colado: no Slide Mestre\nLayout dos outros slides: Título e Conteúdo\nTema: mesmo tema em todos"
      },
      {
        "id": 6,
        "nome": "Jussara",
        "codigo": "Onde o logo foi colado: no slide 1, no modo Normal\nLayout dos outros slides: Em Branco\nTema: mesmo tema em todos"
      }
    ],
    "pistas": [
      "O logo foi colado só em um slide, editando normalmente.",
      "Os outros slides tinham título e área de conteúdo.",
      "Todos os slides usavam o mesmo tema."
    ],
    "dicas": [
      "O que entra no Slide Mestre aparece em todos os slides.",
      "Colar no modo Normal afeta só aquele slide."
    ]
  },
  {
    "id": "c107",
    "disciplina": "PowerPoint",
    "tipo": "codigo",
    "linguagem": "Apresentação",
    "titulo": "A Apresentação Automática",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "Na feira, o computador deveria passar os slides sozinho e recomeçar no fim. A apresentação parou no slide 1. Seis configurações foram encontradas.",
    "pergunta": "Qual configuração estava no computador da feira?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Kauê",
        "codigo": "Avançar slide: Ao clicar com o mouse\nRepetir até pressionar Esc: marcado\nTipo de apresentação: Apresentada em um quiosque\nUsar intervalos: marcado"
      },
      {
        "id": 2,
        "nome": "Lorena",
        "codigo": "Avançar slide: Ao clicar com o mouse\nRepetir até pressionar Esc: marcado\nTipo de apresentação: Apresentada em um quiosque\nUsar intervalos: desmarcado"
      },
      {
        "id": 3,
        "nome": "Moisés",
        "codigo": "Avançar slide: Ao clicar com o mouse\nRepetir até pressionar Esc: desmarcado\nTipo de apresentação: Apresentada em um quiosque\nUsar intervalos: marcado"
      },
      {
        "id": 4,
        "nome": "Nádia",
        "codigo": "Avançar slide: Ao clicar com o mouse\nRepetir até pressionar Esc: marcado\nTipo de apresentação: Apresentada por um orador\nUsar intervalos: desmarcado"
      },
      {
        "id": 5,
        "nome": "Otávio",
        "codigo": "Avançar slide: Ao clicar com o mouse\nRepetir até pressionar Esc: marcado\nTipo de apresentação: Apresentada por um orador\nUsar intervalos: marcado"
      },
      {
        "id": 6,
        "nome": "Paula",
        "codigo": "Avançar slide: Após 00:10\nRepetir até pressionar Esc: marcado\nTipo de apresentação: Apresentada em um quiosque\nUsar intervalos: marcado"
      }
    ],
    "pistas": [
      "Os slides só trocavam quando alguém clicava.",
      "A apresentação estava pronta para recomeçar no fim.",
      "Estava no modo próprio para rodar sozinha num estande.",
      "A opção de usar tempos estava marcada, mas nenhum tempo foi definido."
    ],
    "dicas": [
      "O modo quiosque só avança por tempo.",
      "Sem um tempo em \"Após\", o slide nunca troca sozinho."
    ]
  },
  {
    "id": "c108",
    "disciplina": "PowerPoint",
    "tipo": "codigo",
    "linguagem": "Apresentação",
    "titulo": "O Arquivo Grande Demais",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "A apresentação não pôde ser enviada pelo e-mail da escola, que aceita até 25 MB. Seis versões foram analisadas.",
    "pergunta": "Qual versão não pôde ser enviada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Raí",
        "codigo": "Fotos: 30 fotos compactadas para 150 ppi\nExcluir áreas cortadas das imagens: marcado\nFontes incorporadas: não\nTamanho final: 12 MB"
      },
      {
        "id": 2,
        "nome": "Sueli",
        "codigo": "Fotos: 30 fotos de 8 MB, sem compactar\nExcluir áreas cortadas das imagens: desmarcado\nFontes incorporadas: sim\nTamanho final: 240 MB"
      },
      {
        "id": 3,
        "nome": "Talita",
        "codigo": "Fotos: 30 fotos compactadas para 150 ppi\nExcluir áreas cortadas das imagens: desmarcado\nFontes incorporadas: sim\nTamanho final: 19 MB"
      },
      {
        "id": 4,
        "nome": "Ubiratã",
        "codigo": "Fotos: 30 fotos compactadas para 150 ppi\nExcluir áreas cortadas das imagens: marcado\nFontes incorporadas: sim\nTamanho final: 14 MB"
      },
      {
        "id": 5,
        "nome": "Vanessa",
        "codigo": "Fotos: 30 fotos de 8 MB, sem compactar\nExcluir áreas cortadas das imagens: marcado\nFontes incorporadas: sim\nTamanho final: 205 MB"
      },
      {
        "id": 6,
        "nome": "Wellington",
        "codigo": "Fotos: 30 fotos de 8 MB, sem compactar\nExcluir áreas cortadas das imagens: desmarcado\nFontes incorporadas: não\nTamanho final: 238 MB"
      }
    ],
    "pistas": [
      "As fotos estavam na resolução original da câmera.",
      "As partes cortadas das fotos continuavam guardadas no arquivo.",
      "As fontes foram salvas dentro do arquivo.",
      "O arquivo passava de 200 MB."
    ],
    "dicas": [
      "Arquivo > Compactar Imagens reduz o tamanho das fotos.",
      "Áreas cortadas continuam guardadas se não forem excluídas."
    ]
  },
  {
    "id": "c109",
    "disciplina": "PowerPoint",
    "tipo": "codigo",
    "linguagem": "Apresentação",
    "titulo": "A Animação Fora de Ordem",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "No slide da célula, a legenda \"Núcleo\" apareceu antes da imagem do núcleo. Seis versões do Painel de Animação foram comparadas.",
    "pergunta": "Qual versão foi apresentada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yolanda",
        "codigo": "1ª animação: Legenda \"Núcleo\" · Ao Clicar\n2ª animação: Imagem do núcleo · Após Anterior\nEfeito da imagem: Voar para dentro\nAtraso: 01,00"
      },
      {
        "id": 2,
        "nome": "Zeno",
        "codigo": "1ª animação: Legenda \"Núcleo\" · Ao Clicar\n2ª animação: Imagem do núcleo · Após Anterior\nEfeito da imagem: Voar para dentro\nAtraso: 00,00"
      },
      {
        "id": 3,
        "nome": "Adriana",
        "codigo": "1ª animação: Imagem do núcleo · Ao Clicar\n2ª animação: Imagem do núcleo · Após Anterior\nEfeito da imagem: Surgir\nAtraso: 00,00"
      },
      {
        "id": 4,
        "nome": "Benedito",
        "codigo": "1ª animação: Legenda \"Núcleo\" · Ao Clicar\n2ª animação: Imagem do núcleo · Após Anterior\nEfeito da imagem: Surgir\nAtraso: 01,00"
      },
      {
        "id": 5,
        "nome": "Celina",
        "codigo": "1ª animação: Legenda \"Núcleo\" · Ao Clicar\n2ª animação: Legenda \"Núcleo\" · Após Anterior\nEfeito da imagem: Surgir\nAtraso: 00,00"
      },
      {
        "id": 6,
        "nome": "Diogo",
        "codigo": "1ª animação: Legenda \"Núcleo\" · Ao Clicar\n2ª animação: Imagem do núcleo · Após Anterior\nEfeito da imagem: Surgir\nAtraso: 00,00"
      }
    ],
    "pistas": [
      "No Painel de Animação, a legenda estava em primeiro.",
      "A imagem vinha logo depois da animação anterior, sem clique.",
      "A imagem simplesmente aparecia, sem se mover.",
      "Não havia nenhum atraso entre as duas animações."
    ],
    "dicas": [
      "O Painel de Animação mostra a ordem de cima para baixo.",
      "Após Anterior começa logo depois da animação anterior."
    ]
  },
  {
    "id": "c110",
    "disciplina": "PowerPoint",
    "tipo": "codigo",
    "linguagem": "Apresentação",
    "titulo": "O Hiperlink Quebrado",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "No slide de menu, o botão \"Ir para o Quiz\" abria o navegador com erro em vez de ir para o slide 9. Seis versões do botão foram encontradas.",
    "pergunta": "Qual versão do botão foi apresentada?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Elaine",
        "codigo": "Tipo de link: Página da Web: quiz.html\nAção ao clicar: Hiperlink\nBotão no slide: Menu (slide 2)\nModo em que foi testado: Apresentação de Slides"
      },
      {
        "id": 2,
        "nome": "Fausto",
        "codigo": "Tipo de link: Página da Web: quiz.html\nAção ao clicar: Hiperlink\nBotão no slide: slide 9\nModo em que foi testado: Normal"
      },
      {
        "id": 3,
        "nome": "Glória",
        "codigo": "Tipo de link: Colocar neste documento: slide 9\nAção ao clicar: Hiperlink\nBotão no slide: Menu (slide 2)\nModo em que foi testado: Apresentação de Slides"
      },
      {
        "id": 4,
        "nome": "Henrique",
        "codigo": "Tipo de link: Página da Web: quiz.html\nAção ao clicar: Hiperlink\nBotão no slide: Menu (slide 2)\nModo em que foi testado: Normal"
      },
      {
        "id": 5,
        "nome": "Iolanda",
        "codigo": "Tipo de link: Página da Web: quiz.html\nAção ao clicar: Hiperlink\nBotão no slide: slide 9\nModo em que foi testado: Apresentação de Slides"
      },
      {
        "id": 6,
        "nome": "Jair",
        "codigo": "Tipo de link: Página da Web: quiz.html\nAção ao clicar: Nenhuma\nBotão no slide: Menu (slide 2)\nModo em que foi testado: Apresentação de Slides"
      }
    ],
    "pistas": [
      "O link apontava para fora da apresentação.",
      "O botão tinha uma ação ao ser clicado.",
      "O botão ficava no slide de menu.",
      "O teste foi feito com a apresentação rodando."
    ],
    "dicas": [
      "Para ir a outro slide, use \"Colocar neste documento\".",
      "Links só funcionam no modo de apresentação."
    ]
  },
  {
    "id": "c111",
    "disciplina": "Introdução à Informática",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "O Pendrive Pequeno Demais",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "Um aluno não conseguiu copiar o vídeo do trabalho, de 6 GB, para o pendrive. Seis fichas de pendrive foram verificadas.",
    "pergunta": "De quem é o pendrive que não aceitou o vídeo?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Abel",
        "codigo": "Capacidade: 32 GB\nEspaço livre: 3,5 GB\nSistema de arquivos: FAT32"
      },
      {
        "id": 2,
        "nome": "Bia",
        "codigo": "Capacidade: 32 GB\nEspaço livre: 20 GB\nSistema de arquivos: exFAT"
      },
      {
        "id": 3,
        "nome": "Caetano",
        "codigo": "Capacidade: 16 GB\nEspaço livre: 10 GB\nSistema de arquivos: FAT32"
      },
      {
        "id": 4,
        "nome": "Dalva",
        "codigo": "Capacidade: 4 GB\nEspaço livre: 3,5 GB\nSistema de arquivos: exFAT"
      },
      {
        "id": 5,
        "nome": "Elias",
        "codigo": "Capacidade: 4 GB\nEspaço livre: 3,5 GB\nSistema de arquivos: FAT32"
      },
      {
        "id": 6,
        "nome": "Fabiana",
        "codigo": "Capacidade: 16 GB\nEspaço livre: 10 GB\nSistema de arquivos: NTFS"
      }
    ],
    "pistas": [
      "O vídeo era maior que o espaço total do pendrive.",
      "Sobravam menos de 4 GB livres.",
      "O pendrive usava um sistema de arquivos que não aceita arquivo com mais de 4 GB."
    ],
    "dicas": [
      "1 GB = 1024 MB.",
      "FAT32 não aceita arquivos com mais de 4 GB."
    ]
  },
  {
    "id": "c112",
    "disciplina": "Introdução à Informática",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "A Unidade de Medida Trocada",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "No cartaz da feira, um grupo escreveu os tamanhos dos arquivos em ordem crescente, mas errou. Seis cartazes foram recolhidos.",
    "pergunta": "Qual cartaz estava na feira?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Gilson",
        "codigo": "Ordem escrita: KB < GB < MB < TB\nMenor unidade citada: byte\n1 byte: 8 bits"
      },
      {
        "id": 2,
        "nome": "Helena",
        "codigo": "Ordem escrita: KB < GB < MB < TB\nMenor unidade citada: bit\n1 byte: 10 bits"
      },
      {
        "id": 3,
        "nome": "Ícaro",
        "codigo": "Ordem escrita: KB < GB < MB < TB\nMenor unidade citada: byte\n1 byte: 10 bits"
      },
      {
        "id": 4,
        "nome": "Joana",
        "codigo": "Ordem escrita: KB < MB < GB < TB\nMenor unidade citada: byte\n1 byte: 10 bits"
      },
      {
        "id": 5,
        "nome": "Kleber",
        "codigo": "Ordem escrita: KB < GB < MB < TB\nMenor unidade citada: bit\n1 byte: 8 bits"
      },
      {
        "id": 6,
        "nome": "Lívia",
        "codigo": "Ordem escrita: KB < MB < GB < TB\nMenor unidade citada: byte\n1 byte: 8 bits"
      }
    ],
    "pistas": [
      "O megabyte apareceu depois do gigabyte.",
      "O cartaz começava pelo byte, e não pelo bit.",
      "A relação entre byte e bit estava correta."
    ],
    "dicas": [
      "A ordem certa é bit, byte, KB, MB, GB, TB.",
      "1 byte tem 8 bits."
    ]
  },
  {
    "id": "c113",
    "disciplina": "Introdução à Informática",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "O Arquivo com a Extensão Errada",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "A professora pediu o trabalho em PDF, mas recebeu um arquivo que abriu no editor de texto. Seis alunos mostraram as propriedades do arquivo enviado.",
    "pergunta": "Quem enviou esse arquivo?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Mateus",
        "codigo": "Nome do arquivo: trabalho.pdf\nTipo: Documento PDF\nTamanho: 0 KB"
      },
      {
        "id": 2,
        "nome": "Noemi",
        "codigo": "Nome do arquivo: trabalho.docx\nTipo: Documento do Microsoft Word\nTamanho: 48 KB"
      },
      {
        "id": 3,
        "nome": "Osvaldo",
        "codigo": "Nome do arquivo: trabalho.pdf\nTipo: Documento PDF\nTamanho: 48 KB"
      },
      {
        "id": 4,
        "nome": "Priscila",
        "codigo": "Nome do arquivo: trabalho.odt\nTipo: Texto do LibreOffice\nTamanho: 48 KB"
      },
      {
        "id": 5,
        "nome": "Quênia",
        "codigo": "Nome do arquivo: trabalho.pdf\nTipo: Documento PDF\nTamanho: 210 KB"
      },
      {
        "id": 6,
        "nome": "Renan",
        "codigo": "Nome do arquivo: trabalho.docx\nTipo: Documento do Microsoft Word\nTamanho: 0 KB"
      }
    ],
    "pistas": [
      "A extensão era a de um documento do Word.",
      "O Windows identificava o arquivo como documento do editor de texto.",
      "O arquivo não estava vazio."
    ],
    "dicas": [
      "A extensão indica o tipo do arquivo.",
      "Arquivo de 0 KB está vazio."
    ]
  },
  {
    "id": "c114",
    "disciplina": "Introdução à Informática",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "A Pasta Perdida",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Um aluno salvou o trabalho e disse que estava na pasta Escola, dentro de Documentos. Seis caminhos foram encontrados no histórico de arquivos recentes.",
    "pergunta": "Qual caminho é o do trabalho do aluno?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Sabrina",
        "codigo": "Caminho: C:\\Usuários\\Ana\\Downloads\\Escola\\trabalho.docx\nUnidade: D:\nNome do arquivo: trabalho.docx"
      },
      {
        "id": 2,
        "nome": "Tiago",
        "codigo": "Caminho: C:\\Usuários\\Ana\\Downloads\\Escola\\trabalho.docx\nUnidade: C:\nNome do arquivo: trabalho.docx"
      },
      {
        "id": 3,
        "nome": "Úrsula",
        "codigo": "Caminho: C:\\Usuários\\Ana\\Downloads\\Escola\\trabalho.docx\nUnidade: D:\nNome do arquivo: trabalho (1).docx"
      },
      {
        "id": 4,
        "nome": "Valdir",
        "codigo": "Caminho: C:\\Usuários\\Ana\\Downloads\\Escola\\trabalho.docx\nUnidade: C:\nNome do arquivo: trabalho (1).docx"
      },
      {
        "id": 5,
        "nome": "Wanda",
        "codigo": "Caminho: C:\\Usuários\\Ana\\Documentos\\Escola\\trabalho.docx\nUnidade: C:\nNome do arquivo: trabalho (1).docx"
      },
      {
        "id": 6,
        "nome": "Xande",
        "codigo": "Caminho: C:\\Usuários\\Ana\\Documentos\\Escola\\trabalho.docx\nUnidade: C:\nNome do arquivo: trabalho.docx"
      }
    ],
    "pistas": [
      "O arquivo foi parar dentro de Downloads, e não de Documentos.",
      "O arquivo estava no disco principal.",
      "O nome não ganhou número de cópia."
    ],
    "dicas": [
      "Leia o caminho da esquerda para a direita: cada \\ entra numa pasta.",
      "O navegador costuma salvar em Downloads."
    ]
  },
  {
    "id": "c115",
    "disciplina": "Introdução à Informática",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "O Atalho que Não Abria",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Depois de limpar a Área de Trabalho, o ícone do jogo educativo dizia que o destino não existia mais. Seis alunos contaram o que apagaram.",
    "pergunta": "Quem apagou o arquivo de verdade?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yago",
        "codigo": "Ícone na Área de Trabalho: tem setinha no canto\nO que foi para a Lixeira: a pasta do jogo em C:\\Jogos\nLixeira: com itens"
      },
      {
        "id": 2,
        "nome": "Zuleica",
        "codigo": "Ícone na Área de Trabalho: não tem setinha\nO que foi para a Lixeira: a pasta do jogo em C:\\Jogos\nLixeira: com itens"
      },
      {
        "id": 3,
        "nome": "Arnaldo",
        "codigo": "Ícone na Área de Trabalho: não tem setinha\nO que foi para a Lixeira: a pasta do jogo em C:\\Jogos\nLixeira: esvaziada"
      },
      {
        "id": 4,
        "nome": "Betina",
        "codigo": "Ícone na Área de Trabalho: tem setinha no canto\nO que foi para a Lixeira: a pasta do jogo em C:\\Jogos\nLixeira: esvaziada"
      },
      {
        "id": 5,
        "nome": "Cícero",
        "codigo": "Ícone na Área de Trabalho: tem setinha no canto\nO que foi para a Lixeira: só um atalho\nLixeira: com itens"
      },
      {
        "id": 6,
        "nome": "Denise",
        "codigo": "Ícone na Área de Trabalho: tem setinha no canto\nO que foi para a Lixeira: só um atalho\nLixeira: esvaziada"
      }
    ],
    "pistas": [
      "O ícone que restou era um atalho.",
      "O que foi apagado foram os arquivos do jogo, e não um atalho.",
      "Não dava mais para restaurar pela Lixeira."
    ],
    "dicas": [
      "Atalho é só um apontador, com uma setinha no ícone.",
      "Apagar o atalho não apaga o programa."
    ]
  },
  {
    "id": "c116",
    "disciplina": "Introdução à Informática",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "O Computador que Não Conectava",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Um notebook não conseguia abrir nenhum site, enquanto os outros funcionavam. Seis fichas de rede foram coletadas.",
    "pergunta": "Qual ficha é a do notebook sem internet?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Edson",
        "codigo": "Wi-Fi: ligado, conectado à rede \"Visitantes\"\nModo avião: desligado\nMensagem: Conectado"
      },
      {
        "id": 2,
        "nome": "Flávia",
        "codigo": "Wi-Fi: ligado, conectado à rede \"IFS-Alunos\"\nModo avião: desligado\nMensagem: Sem internet, protegida"
      },
      {
        "id": 3,
        "nome": "Gustavo",
        "codigo": "Wi-Fi: ligado, conectado à rede \"IFS-Alunos\"\nModo avião: desligado\nMensagem: Conectado"
      },
      {
        "id": 4,
        "nome": "Hilda",
        "codigo": "Wi-Fi: ligado, conectado à rede \"Visitantes\"\nModo avião: desligado\nMensagem: Sem internet, protegida"
      },
      {
        "id": 5,
        "nome": "Isaque",
        "codigo": "Wi-Fi: desligado pelo modo avião\nModo avião: ligado\nMensagem: Modo avião"
      },
      {
        "id": 6,
        "nome": "Jussara",
        "codigo": "Wi-Fi: ligado, sem nenhuma rede conectada\nModo avião: desligado\nMensagem: Não conectado"
      }
    ],
    "pistas": [
      "O notebook estava ligado a uma rede diferente da dos colegas.",
      "O modo avião não era o problema.",
      "O Windows mostrava que estava conectado à rede, mas sem internet."
    ],
    "dicas": [
      "\"Sem internet\" significa que a rede existe, mas não chega à internet.",
      "Confira o nome da rede."
    ]
  },
  {
    "id": "c117",
    "disciplina": "Introdução à Informática",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "O Arquivo Compactado",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "O professor recebeu um arquivo .zip e, ao abrir os documentos direto de dentro dele, as alterações não foram salvas. Seis alunos contaram o que fizeram.",
    "pergunta": "Quem passou pelo problema?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Kauê",
        "codigo": "Arquivo recebido: trabalhos.zip\nExtraiu antes de abrir: não\nOnde salvou: na pasta Escola"
      },
      {
        "id": 2,
        "nome": "Lorena",
        "codigo": "Arquivo recebido: trabalhos.pdf\nExtraiu antes de abrir: não\nOnde salvou: na pasta Escola"
      },
      {
        "id": 3,
        "nome": "Moisés",
        "codigo": "Arquivo recebido: trabalhos.zip\nExtraiu antes de abrir: sim\nOnde salvou: na pasta Escola"
      },
      {
        "id": 4,
        "nome": "Nádia",
        "codigo": "Arquivo recebido: trabalhos.zip\nExtraiu antes de abrir: sim\nOnde salvou: na pasta temporária"
      },
      {
        "id": 5,
        "nome": "Otávio",
        "codigo": "Arquivo recebido: trabalhos.zip\nExtraiu antes de abrir: não\nOnde salvou: na pasta temporária"
      },
      {
        "id": 6,
        "nome": "Paula",
        "codigo": "Arquivo recebido: trabalhos.pdf\nExtraiu antes de abrir: não\nOnde salvou: na pasta temporária"
      }
    ],
    "pistas": [
      "O arquivo era compactado.",
      "Os documentos foram abertos sem extrair.",
      "As alterações foram para uma pasta temporária do sistema."
    ],
    "dicas": [
      "Arquivo .zip junta e compacta vários arquivos.",
      "Extraia antes de editar."
    ]
  },
  {
    "id": "c118",
    "disciplina": "Introdução à Informática",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "A Impressora Errada",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "O trabalho do aluno não saiu na impressora do laboratório, mas também não deu erro. Seis telas de impressão foram fotografadas.",
    "pergunta": "Qual tela é a do aluno?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Raí",
        "codigo": "Impressora escolhida: HP Laboratório 2\nPáginas: Página atual\nCópias: 1\nResultado: ficou na fila com erro"
      },
      {
        "id": 2,
        "nome": "Sueli",
        "codigo": "Impressora escolhida: HP Laboratório 2\nPáginas: Todas\nCópias: 0\nResultado: nada aconteceu"
      },
      {
        "id": 3,
        "nome": "Talita",
        "codigo": "Impressora escolhida: Microsoft Print to PDF\nPáginas: Página atual\nCópias: 1\nResultado: pediu um nome de arquivo para salvar"
      },
      {
        "id": 4,
        "nome": "Ubiratã",
        "codigo": "Impressora escolhida: Microsoft Print to PDF\nPáginas: Todas\nCópias: 1\nResultado: pediu um nome de arquivo para salvar"
      },
      {
        "id": 5,
        "nome": "Vanessa",
        "codigo": "Impressora escolhida: Microsoft Print to PDF\nPáginas: Todas\nCópias: 0\nResultado: nada aconteceu"
      },
      {
        "id": 6,
        "nome": "Wellington",
        "codigo": "Impressora escolhida: HP Laboratório 2\nPáginas: Todas\nCópias: 1\nResultado: ficou na fila com erro"
      }
    ],
    "pistas": [
      "A impressora escolhida não era uma impressora física.",
      "Todas as páginas foram mandadas.",
      "Foi pedida uma cópia.",
      "Em vez de imprimir, o computador pediu um lugar para salvar."
    ],
    "dicas": [
      "\"Microsoft Print to PDF\" cria um arquivo, não imprime no papel.",
      "Confira o nome da impressora."
    ]
  },
  {
    "id": "c119",
    "disciplina": "Introdução à Informática",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "O Navegador Cheio de Barras",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "Um computador do laboratório abria uma página de busca estranha e cheia de anúncios. Seis fichas do navegador foram verificadas.",
    "pergunta": "Qual ficha é a do computador do laboratório?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yolanda",
        "codigo": "Página inicial: buscafacil-top.net\nExtensões instaladas: nenhuma extra\nMecanismo de pesquisa padrão: buscafacil-top.net\nNavegador atualizado: sim"
      },
      {
        "id": 2,
        "nome": "Zeno",
        "codigo": "Página inicial: google.com.br\nExtensões instaladas: \"Cupom Grátis\" e \"Barra Rápida\"\nMecanismo de pesquisa padrão: buscafacil-top.net\nNavegador atualizado: sim"
      },
      {
        "id": 3,
        "nome": "Adriana",
        "codigo": "Página inicial: buscafacil-top.net\nExtensões instaladas: \"Cupom Grátis\" e \"Barra Rápida\"\nMecanismo de pesquisa padrão: Google\nNavegador atualizado: não"
      },
      {
        "id": 4,
        "nome": "Benedito",
        "codigo": "Página inicial: buscafacil-top.net\nExtensões instaladas: \"Cupom Grátis\" e \"Barra Rápida\"\nMecanismo de pesquisa padrão: buscafacil-top.net\nNavegador atualizado: não"
      },
      {
        "id": 5,
        "nome": "Celina",
        "codigo": "Página inicial: buscafacil-top.net\nExtensões instaladas: \"Cupom Grátis\" e \"Barra Rápida\"\nMecanismo de pesquisa padrão: buscafacil-top.net\nNavegador atualizado: sim"
      },
      {
        "id": 6,
        "nome": "Diogo",
        "codigo": "Página inicial: buscafacil-top.net\nExtensões instaladas: \"Cupom Grátis\" e \"Barra Rápida\"\nMecanismo de pesquisa padrão: Google\nNavegador atualizado: sim"
      }
    ],
    "pistas": [
      "A página inicial tinha sido trocada por um site desconhecido.",
      "Havia extensões que ninguém lembrava de ter instalado.",
      "As pesquisas da barra de endereço também iam para o site estranho.",
      "O navegador estava na versão mais nova."
    ],
    "dicas": [
      "Extensões podem trocar a página inicial e a pesquisa.",
      "Atualizar o navegador não remove extensões."
    ]
  },
  {
    "id": "c120",
    "disciplina": "Introdução à Informática",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "O Armazenamento na Nuvem",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "Um aluno perdeu o pendrive, mas recuperou o trabalho em outro computador. Seis alunos contaram onde guardavam os arquivos.",
    "pergunta": "Quem recuperou o trabalho?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Elaine",
        "codigo": "Onde salvava: só no pendrive\nSincronização: ativada\nConta usada: conta da escola\nÚltimo salvamento: sincronizado às 21h"
      },
      {
        "id": 2,
        "nome": "Fausto",
        "codigo": "Onde salvava: OneDrive (nuvem)\nSincronização: ativada\nConta usada: conta de um colega\nÚltimo salvamento: pendente de envio"
      },
      {
        "id": 3,
        "nome": "Glória",
        "codigo": "Onde salvava: OneDrive (nuvem)\nSincronização: pausada\nConta usada: conta da escola\nÚltimo salvamento: sincronizado às 21h"
      },
      {
        "id": 4,
        "nome": "Henrique",
        "codigo": "Onde salvava: OneDrive (nuvem)\nSincronização: ativada\nConta usada: conta da escola\nÚltimo salvamento: sincronizado às 21h"
      },
      {
        "id": 5,
        "nome": "Iolanda",
        "codigo": "Onde salvava: OneDrive (nuvem)\nSincronização: ativada\nConta usada: conta da escola\nÚltimo salvamento: pendente de envio"
      },
      {
        "id": 6,
        "nome": "Jair",
        "codigo": "Onde salvava: OneDrive (nuvem)\nSincronização: ativada\nConta usada: conta de um colega\nÚltimo salvamento: sincronizado às 21h"
      }
    ],
    "pistas": [
      "Os arquivos ficavam num serviço on-line.",
      "As alterações iam para a internet automaticamente.",
      "Ele entrou com a própria conta da escola no outro computador.",
      "A última versão já tinha subido antes de ele perder o pendrive."
    ],
    "dicas": [
      "Nuvem é armazenamento em servidores na internet.",
      "Sincronização pausada não envia as alterações."
    ]
  },
  {
    "id": "c121",
    "disciplina": "Hardware e Software",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "O Computador sem Vídeo",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "Um computador do laboratório liga, as ventoinhas giram, mas o monitor fica preto e o computador apita. Seis fichas de manutenção foram anexadas.",
    "pergunta": "Qual ficha é a do computador com problema?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Abel",
        "codigo": "Memória RAM: pente solto do slot\nFonte: funcionando\nCabo do monitor: desconectado"
      },
      {
        "id": 2,
        "nome": "Bia",
        "codigo": "Memória RAM: pente solto do slot\nFonte: queimada\nCabo do monitor: desconectado"
      },
      {
        "id": 3,
        "nome": "Caetano",
        "codigo": "Memória RAM: bem encaixada\nFonte: funcionando\nCabo do monitor: conectado na placa de vídeo"
      },
      {
        "id": 4,
        "nome": "Dalva",
        "codigo": "Memória RAM: pente solto do slot\nFonte: funcionando\nCabo do monitor: conectado na placa de vídeo"
      },
      {
        "id": 5,
        "nome": "Elias",
        "codigo": "Memória RAM: bem encaixada\nFonte: funcionando\nCabo do monitor: desconectado"
      },
      {
        "id": 6,
        "nome": "Fabiana",
        "codigo": "Memória RAM: pente solto do slot\nFonte: queimada\nCabo do monitor: conectado na placa de vídeo"
      }
    ],
    "pistas": [
      "Um componente de memória não estava bem encaixado.",
      "O computador recebia energia: as ventoinhas giravam.",
      "O monitor estava ligado ao computador."
    ],
    "dicas": [
      "Bipes ao ligar indicam erro de hardware no teste inicial (POST).",
      "Se a fonte estivesse queimada, nada giraria."
    ]
  },
  {
    "id": "c122",
    "disciplina": "Hardware e Software",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "A Classificação do Material",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "Na prova prática, os alunos classificaram itens em hardware e software. Uma lista foi entregue com um erro só. Seis listas foram corrigidas.",
    "pergunta": "Qual lista tinha um erro só?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Gilson",
        "codigo": "Teclado: software\nWindows 11: software\nDriver da impressora: hardware"
      },
      {
        "id": 2,
        "nome": "Helena",
        "codigo": "Teclado: hardware\nWindows 11: hardware\nDriver da impressora: hardware"
      },
      {
        "id": 3,
        "nome": "Ícaro",
        "codigo": "Teclado: hardware\nWindows 11: software\nDriver da impressora: hardware"
      },
      {
        "id": 4,
        "nome": "Joana",
        "codigo": "Teclado: hardware\nWindows 11: software\nDriver da impressora: software"
      },
      {
        "id": 5,
        "nome": "Kleber",
        "codigo": "Teclado: software\nWindows 11: software\nDriver da impressora: software"
      },
      {
        "id": 6,
        "nome": "Lívia",
        "codigo": "Teclado: hardware\nWindows 11: hardware\nDriver da impressora: software"
      }
    ],
    "pistas": [
      "O teclado estava classificado corretamente.",
      "O sistema operacional estava classificado corretamente.",
      "O driver foi colocado no grupo errado."
    ],
    "dicas": [
      "Hardware é a parte física; software são os programas.",
      "Driver é um programa que faz o sistema conversar com o equipamento."
    ]
  },
  {
    "id": "c123",
    "disciplina": "Hardware e Software",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "O Programa que Não Instalava",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "Um software de edição de vídeo não instalou em um notebook. Os requisitos mínimos: Windows 64 bits, 8 GB de RAM e 10 GB livres. Seis fichas foram verificadas.",
    "pergunta": "Qual ficha é a do notebook em que não instalou?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Mateus",
        "codigo": "Sistema operacional: Windows 11 64 bits\nMemória RAM: 16 GB\nEspaço livre no disco: 120 GB"
      },
      {
        "id": 2,
        "nome": "Noemi",
        "codigo": "Sistema operacional: Windows 11 64 bits\nMemória RAM: 8 GB\nEspaço livre no disco: 6 GB"
      },
      {
        "id": 3,
        "nome": "Osvaldo",
        "codigo": "Sistema operacional: Windows 10 32 bits\nMemória RAM: 4 GB\nEspaço livre no disco: 6 GB"
      },
      {
        "id": 4,
        "nome": "Priscila",
        "codigo": "Sistema operacional: Windows 11 64 bits\nMemória RAM: 4 GB\nEspaço livre no disco: 6 GB"
      },
      {
        "id": 5,
        "nome": "Quênia",
        "codigo": "Sistema operacional: Windows 11 64 bits\nMemória RAM: 4 GB\nEspaço livre no disco: 120 GB"
      },
      {
        "id": 6,
        "nome": "Renan",
        "codigo": "Sistema operacional: Windows 10 32 bits\nMemória RAM: 4 GB\nEspaço livre no disco: 120 GB"
      }
    ],
    "pistas": [
      "O sistema era de 64 bits.",
      "A memória estava abaixo do mínimo.",
      "Havia espaço de sobra no disco."
    ],
    "dicas": [
      "Compare cada linha com os requisitos mínimos.",
      "Basta um requisito faltar para não instalar."
    ]
  },
  {
    "id": "c124",
    "disciplina": "Hardware e Software",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "A Impressora que Não Imprimia",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "A impressora nova aparece no Gerenciador de Dispositivos com um triângulo amarelo e não imprime. Seis fichas foram analisadas.",
    "pergunta": "Qual ficha é a do computador da impressora nova?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Sabrina",
        "codigo": "Cabo USB: conectado\nDriver: instalado\nStatus no Gerenciador de Dispositivos: Desativado pelo usuário"
      },
      {
        "id": 2,
        "nome": "Tiago",
        "codigo": "Cabo USB: conectado\nDriver: instalado\nStatus no Gerenciador de Dispositivos: Funcionando corretamente"
      },
      {
        "id": 3,
        "nome": "Úrsula",
        "codigo": "Cabo USB: desconectado\nDriver: não instalado\nStatus no Gerenciador de Dispositivos: não aparece na lista"
      },
      {
        "id": 4,
        "nome": "Valdir",
        "codigo": "Cabo USB: conectado\nDriver: instalado (versão errada)\nStatus no Gerenciador de Dispositivos: Erro no driver (código 39)"
      },
      {
        "id": 5,
        "nome": "Wanda",
        "codigo": "Cabo USB: desconectado\nDriver: instalado\nStatus no Gerenciador de Dispositivos: não aparece na lista"
      },
      {
        "id": 6,
        "nome": "Xande",
        "codigo": "Cabo USB: conectado\nDriver: não instalado\nStatus no Gerenciador de Dispositivos: Dispositivo desconhecido"
      }
    ],
    "pistas": [
      "A impressora estava ligada ao computador pelo cabo.",
      "Faltava o programa que faz o Windows conversar com a impressora.",
      "O Windows não sabia que tipo de equipamento era."
    ],
    "dicas": [
      "O triângulo amarelo indica problema de driver.",
      "Sem cabo, a impressora nem apareceria."
    ]
  },
  {
    "id": "c125",
    "disciplina": "Hardware e Software",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "O Notebook que Esquentava",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Um notebook desligava sozinho depois de 20 minutos de uso. Seis relatórios de diagnóstico foram coletados.",
    "pergunta": "Qual relatório é o do notebook que desligava?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yago",
        "codigo": "Temperatura do processador: 98 °C\nCooler: girando devagar, cheio de poeira\nBateria: saúde 90%\nSuperfície de uso: em cima da mesa"
      },
      {
        "id": 2,
        "nome": "Zuleica",
        "codigo": "Temperatura do processador: 55 °C\nCooler: girando devagar, cheio de poeira\nBateria: saúde 90%\nSuperfície de uso: em cima da cama"
      },
      {
        "id": 3,
        "nome": "Arnaldo",
        "codigo": "Temperatura do processador: 98 °C\nCooler: limpo, girando normal\nBateria: saúde 90%\nSuperfície de uso: em cima da cama"
      },
      {
        "id": 4,
        "nome": "Betina",
        "codigo": "Temperatura do processador: 98 °C\nCooler: girando devagar, cheio de poeira\nBateria: saúde 90%\nSuperfície de uso: em cima da cama"
      },
      {
        "id": 5,
        "nome": "Cícero",
        "codigo": "Temperatura do processador: 98 °C\nCooler: girando devagar, cheio de poeira\nBateria: saúde 20%\nSuperfície de uso: em cima da mesa"
      },
      {
        "id": 6,
        "nome": "Denise",
        "codigo": "Temperatura do processador: 98 °C\nCooler: girando devagar, cheio de poeira\nBateria: saúde 20%\nSuperfície de uso: em cima da cama"
      }
    ],
    "pistas": [
      "O processador chegava perto do limite de temperatura.",
      "O ar não circulava direito.",
      "A bateria estava boa.",
      "As entradas de ar ficavam bloqueadas pelo tecido."
    ],
    "dicas": [
      "Superaquecimento faz o computador desligar para se proteger.",
      "Bateria ruim desliga quando está fora da tomada, não pelo calor."
    ]
  },
  {
    "id": "c126",
    "disciplina": "Hardware e Software",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "O Disco que Fazia Barulho",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Um computador ficou muito lento e fazia estalos. O técnico suspeita do disco. Seis relatórios foram analisados.",
    "pergunta": "Qual relatório é o do computador dos estalos?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Edson",
        "codigo": "Tipo de armazenamento: HD (disco giratório)\nStatus S.M.A.R.T.: OK\nEspaço livre: 2%"
      },
      {
        "id": 2,
        "nome": "Flávia",
        "codigo": "Tipo de armazenamento: SSD\nStatus S.M.A.R.T.: Cuidado: setores realocados\nEspaço livre: 45%"
      },
      {
        "id": 3,
        "nome": "Gustavo",
        "codigo": "Tipo de armazenamento: HD (disco giratório)\nStatus S.M.A.R.T.: Cuidado: setores realocados\nEspaço livre: 45%"
      },
      {
        "id": 4,
        "nome": "Hilda",
        "codigo": "Tipo de armazenamento: SSD\nStatus S.M.A.R.T.: Cuidado: setores realocados\nEspaço livre: 2%"
      },
      {
        "id": 5,
        "nome": "Isaque",
        "codigo": "Tipo de armazenamento: HD (disco giratório)\nStatus S.M.A.R.T.: Cuidado: setores realocados\nEspaço livre: 2%"
      },
      {
        "id": 6,
        "nome": "Jussara",
        "codigo": "Tipo de armazenamento: HD (disco giratório)\nStatus S.M.A.R.T.: OK\nEspaço livre: 45%"
      }
    ],
    "pistas": [
      "O armazenamento tinha partes mecânicas.",
      "O próprio disco avisava que estava falhando.",
      "Havia bastante espaço livre."
    ],
    "dicas": [
      "SSD não tem partes móveis, então não faz estalos.",
      "O S.M.A.R.T. é o autodiagnóstico do disco."
    ]
  },
  {
    "id": "c127",
    "disciplina": "Hardware e Software",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "O Monitor Embaçado",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "Na apresentação, as letras pareciam borradas no monitor novo de 1920 x 1080. Seis configurações de tela foram encontradas.",
    "pergunta": "Qual configuração estava no computador?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Kauê",
        "codigo": "Resolução: 1366 x 768\nEscala: 150%\nCabo: VGA"
      },
      {
        "id": 2,
        "nome": "Lorena",
        "codigo": "Resolução: 1366 x 768\nEscala: 100%\nCabo: VGA"
      },
      {
        "id": 3,
        "nome": "Moisés",
        "codigo": "Resolução: 1920 x 1080 (recomendado)\nEscala: 100%\nCabo: HDMI"
      },
      {
        "id": 4,
        "nome": "Nádia",
        "codigo": "Resolução: 1920 x 1080 (recomendado)\nEscala: 100%\nCabo: VGA"
      },
      {
        "id": 5,
        "nome": "Otávio",
        "codigo": "Resolução: 1366 x 768\nEscala: 150%\nCabo: HDMI"
      },
      {
        "id": 6,
        "nome": "Paula",
        "codigo": "Resolução: 1366 x 768\nEscala: 100%\nCabo: HDMI"
      }
    ],
    "pistas": [
      "A resolução estava abaixo da resolução nativa do monitor.",
      "Os elementos estavam no tamanho normal.",
      "O cabo era digital."
    ],
    "dicas": [
      "Monitores LCD ficam nítidos na resolução nativa.",
      "O Windows marca a resolução nativa como \"recomendado\"."
    ]
  },
  {
    "id": "c128",
    "disciplina": "Hardware e Software",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "O Software Pirata",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "A auditoria encontrou um computador com programa sem licença e com risco de vírus. Seis relatórios foram analisados.",
    "pergunta": "Qual relatório é o do computador irregular?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Raí",
        "codigo": "Editor de imagens: versão \"crackeada\" baixada de site desconhecido\nSuíte de escritório: LibreOffice (software livre)\nAntivírus: sem alertas\nSistema operacional: Windows ativado com licença da escola"
      },
      {
        "id": 2,
        "nome": "Sueli",
        "codigo": "Editor de imagens: versão \"crackeada\" baixada de site desconhecido\nSuíte de escritório: LibreOffice (software livre)\nAntivírus: alerta de cavalo de Troia no ativador\nSistema operacional: Windows não ativado"
      },
      {
        "id": 3,
        "nome": "Talita",
        "codigo": "Editor de imagens: versão \"crackeada\" baixada de site desconhecido\nSuíte de escritório: LibreOffice (software livre)\nAntivírus: alerta de cavalo de Troia no ativador\nSistema operacional: Windows ativado com licença da escola"
      },
      {
        "id": 4,
        "nome": "Ubiratã",
        "codigo": "Editor de imagens: versão \"crackeada\" baixada de site desconhecido\nSuíte de escritório: sem licença\nAntivírus: alerta de cavalo de Troia no ativador\nSistema operacional: Windows ativado com licença da escola"
      },
      {
        "id": 5,
        "nome": "Vanessa",
        "codigo": "Editor de imagens: assinatura da escola\nSuíte de escritório: LibreOffice (software livre)\nAntivírus: alerta de cavalo de Troia no ativador\nSistema operacional: Windows ativado com licença da escola"
      },
      {
        "id": 6,
        "nome": "Wellington",
        "codigo": "Editor de imagens: versão \"crackeada\" baixada de site desconhecido\nSuíte de escritório: LibreOffice (software livre)\nAntivírus: sem alertas\nSistema operacional: Windows não ativado"
      }
    ],
    "pistas": [
      "O editor de imagens foi baixado de um site que distribui programas pagos de graça.",
      "O programa de escritório era livre e legal.",
      "O antivírus apontou um cavalo de Troia no programa que \"ativava\" o editor.",
      "O Windows estava em dia."
    ],
    "dicas": [
      "Software livre pode ser usado e distribuído legalmente.",
      "Ativadores piratas costumam trazer malware."
    ]
  },
  {
    "id": "c129",
    "disciplina": "Hardware e Software",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "O Upgrade que Não Adiantou",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "A escola trocou peças de um computador para deixá-lo mais rápido, mas ele continuou demorando para abrir programas. Seis fichas de upgrade foram entregues.",
    "pergunta": "Qual ficha é a do upgrade que não adiantou?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yolanda",
        "codigo": "Peça trocada: mouse e teclado\nArmazenamento: HD 5400 rpm\nMemória RAM: 4 GB\nProcessador: Core i5"
      },
      {
        "id": 2,
        "nome": "Zeno",
        "codigo": "Peça trocada: RAM de 4 para 8 GB\nArmazenamento: HD 5400 rpm\nMemória RAM: 8 GB\nProcessador: Core i5"
      },
      {
        "id": 3,
        "nome": "Adriana",
        "codigo": "Peça trocada: mouse e teclado\nArmazenamento: SSD\nMemória RAM: 8 GB\nProcessador: Core i5"
      },
      {
        "id": 4,
        "nome": "Benedito",
        "codigo": "Peça trocada: mouse e teclado\nArmazenamento: HD 5400 rpm\nMemória RAM: 4 GB\nProcessador: Celeron"
      },
      {
        "id": 5,
        "nome": "Celina",
        "codigo": "Peça trocada: monitor novo\nArmazenamento: SSD\nMemória RAM: 8 GB\nProcessador: Core i5"
      },
      {
        "id": 6,
        "nome": "Diogo",
        "codigo": "Peça trocada: HD por SSD\nArmazenamento: SSD\nMemória RAM: 4 GB\nProcessador: Core i5"
      }
    ],
    "pistas": [
      "As peças novas eram só periféricos de entrada.",
      "O sistema continuava num disco lento.",
      "A memória continuava pequena.",
      "O processador era razoável."
    ],
    "dicas": [
      "Para abrir programas mais rápido, SSD e RAM fazem mais diferença.",
      "Periféricos não mudam o desempenho."
    ]
  },
  {
    "id": "c130",
    "disciplina": "Hardware e Software",
    "tipo": "codigo",
    "linguagem": "Ficha técnica",
    "titulo": "A Licença Errada",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "O laboratório recebeu uma notificação: um programa estava sendo usado em mais máquinas do que a licença permite. Seis relatórios de licenças foram analisados.",
    "pergunta": "Qual relatório é o do programa da notificação?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Elaine",
        "codigo": "Tipo de licença: proprietária, por máquina\nLicenças compradas: 10\nComputadores com o programa: 25\nChave de ativação: a mesma em todos os computadores"
      },
      {
        "id": 2,
        "nome": "Fausto",
        "codigo": "Tipo de licença: freeware\nLicenças compradas: não se aplica\nComputadores com o programa: 40\nChave de ativação: não usa chave"
      },
      {
        "id": 3,
        "nome": "Glória",
        "codigo": "Tipo de licença: proprietária, por máquina\nLicenças compradas: 30\nComputadores com o programa: 25\nChave de ativação: uma chave por computador"
      },
      {
        "id": 4,
        "nome": "Henrique",
        "codigo": "Tipo de licença: software livre (GPL)\nLicenças compradas: não se aplica\nComputadores com o programa: 25\nChave de ativação: não usa chave"
      },
      {
        "id": 5,
        "nome": "Iolanda",
        "codigo": "Tipo de licença: proprietária, por máquina\nLicenças compradas: 10\nComputadores com o programa: 10\nChave de ativação: uma chave por computador"
      },
      {
        "id": 6,
        "nome": "Jair",
        "codigo": "Tipo de licença: proprietária, por máquina\nLicenças compradas: 10\nComputadores com o programa: 25\nChave de ativação: uma chave por computador"
      }
    ],
    "pistas": [
      "Era uma licença que limita o número de computadores.",
      "A escola tinha comprado poucas licenças.",
      "O programa estava em mais computadores do que as licenças.",
      "Uma única chave foi reaproveitada em várias máquinas."
    ],
    "dicas": [
      "Software livre e freeware não limitam o número de instalações.",
      "Licença por máquina vale para um computador cada."
    ]
  },
  {
    "id": "c131",
    "disciplina": "Introdução à Segurança da Informação",
    "tipo": "codigo",
    "linguagem": "Regras",
    "titulo": "O Pilar Quebrado",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "O site de notas da escola ficou fora do ar no dia da divulgação. Seis alunos classificaram o incidente na atividade de Segurança.",
    "pergunta": "Quem classificou corretamente?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Abel",
        "codigo": "Pilar atingido: Confidencialidade\nAs notas foram alteradas?: não\nAs notas vazaram?: sim"
      },
      {
        "id": 2,
        "nome": "Bia",
        "codigo": "Pilar atingido: Disponibilidade\nAs notas foram alteradas?: não\nAs notas vazaram?: não"
      },
      {
        "id": 3,
        "nome": "Caetano",
        "codigo": "Pilar atingido: Confidencialidade\nAs notas foram alteradas?: não\nAs notas vazaram?: não"
      },
      {
        "id": 4,
        "nome": "Dalva",
        "codigo": "Pilar atingido: Disponibilidade\nAs notas foram alteradas?: sim\nAs notas vazaram?: não"
      },
      {
        "id": 5,
        "nome": "Elias",
        "codigo": "Pilar atingido: Disponibilidade\nAs notas foram alteradas?: não\nAs notas vazaram?: sim"
      },
      {
        "id": 6,
        "nome": "Fabiana",
        "codigo": "Pilar atingido: Disponibilidade\nAs notas foram alteradas?: sim\nAs notas vazaram?: sim"
      }
    ],
    "pistas": [
      "O problema foi não conseguir acessar a informação quando precisava.",
      "As notas continuavam certas.",
      "Ninguém de fora viu as notas."
    ],
    "dicas": [
      "Confidencialidade: só quem pode vê. Integridade: não é alterado. Disponibilidade: está lá quando precisa.",
      "Leia o que aconteceu de verdade."
    ]
  },
  {
    "id": "c132",
    "disciplina": "Introdução à Segurança da Informação",
    "tipo": "codigo",
    "linguagem": "Regras",
    "titulo": "A Senha Fraca",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "Uma conta do laboratório foi invadida em poucos minutos por um programa que testa senhas. Seis senhas cadastradas foram analisadas.",
    "pergunta": "Qual era a senha da conta invadida?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Gilson",
        "codigo": "Tamanho: 14 caracteres\nTipos de caracteres: só números\nTem dado pessoal: sim, data de nascimento"
      },
      {
        "id": 2,
        "nome": "Helena",
        "codigo": "Tamanho: 14 caracteres\nTipos de caracteres: só números\nTem dado pessoal: não"
      },
      {
        "id": 3,
        "nome": "Ícaro",
        "codigo": "Tamanho: 6 caracteres\nTipos de caracteres: só números\nTem dado pessoal: não"
      },
      {
        "id": 4,
        "nome": "Joana",
        "codigo": "Tamanho: 6 caracteres\nTipos de caracteres: letras, números e símbolos\nTem dado pessoal: não"
      },
      {
        "id": 5,
        "nome": "Kleber",
        "codigo": "Tamanho: 6 caracteres\nTipos de caracteres: só números\nTem dado pessoal: sim, data de nascimento"
      },
      {
        "id": 6,
        "nome": "Lívia",
        "codigo": "Tamanho: 6 caracteres\nTipos de caracteres: letras, números e símbolos\nTem dado pessoal: sim, data de nascimento"
      }
    ],
    "pistas": [
      "A senha era curta.",
      "A senha não tinha letras nem símbolos.",
      "A senha era a data de aniversário do dono."
    ],
    "dicas": [
      "Senhas longas e variadas demoram muito mais para quebrar.",
      "Datas pessoais são as primeiras tentativas."
    ]
  },
  {
    "id": "c133",
    "disciplina": "Introdução à Segurança da Informação",
    "tipo": "codigo",
    "linguagem": "Regras",
    "titulo": "O E-mail de Phishing",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "Vários alunos entregaram a senha num site falso. Seis e-mails foram encontrados nas caixas de entrada.",
    "pergunta": "Qual e-mail foi o golpe?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Mateus",
        "codigo": "Remetente: suporte@ifs-seguranca-conta.com\nAssunto: URGENTE: sua conta será bloqueada hoje\nLink: leva a ifs-login.verificar-conta.net"
      },
      {
        "id": 2,
        "nome": "Noemi",
        "codigo": "Remetente: suporte@ifs-seguranca-conta.com\nAssunto: URGENTE: sua conta será bloqueada hoje\nLink: leva a ifs.edu.br"
      },
      {
        "id": 3,
        "nome": "Osvaldo",
        "codigo": "Remetente: suporte@ifs-seguranca-conta.com\nAssunto: Calendário de provas\nLink: leva a ifs-login.verificar-conta.net"
      },
      {
        "id": 4,
        "nome": "Priscila",
        "codigo": "Remetente: suporte@ifs.edu.br\nAssunto: URGENTE: sua conta será bloqueada hoje\nLink: leva a ifs.edu.br"
      },
      {
        "id": 5,
        "nome": "Quênia",
        "codigo": "Remetente: suporte@ifs.edu.br\nAssunto: URGENTE: sua conta será bloqueada hoje\nLink: leva a ifs-login.verificar-conta.net"
      },
      {
        "id": 6,
        "nome": "Renan",
        "codigo": "Remetente: suporte@ifs-seguranca-conta.com\nAssunto: Calendário de provas\nLink: leva a ifs.edu.br"
      }
    ],
    "pistas": [
      "O endereço de quem enviou não era do domínio da escola.",
      "O e-mail criava pressa e medo.",
      "O link levava a um site de fora."
    ],
    "dicas": [
      "Confira o domínio do remetente e do link.",
      "Pressa e ameaça são sinais de golpe."
    ]
  },
  {
    "id": "c134",
    "disciplina": "Introdução à Segurança da Informação",
    "tipo": "codigo",
    "linguagem": "Regras",
    "titulo": "A Mesa Limpa",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Na auditoria, uma sala deixou dados expostos a quem passava. Seis salas foram fotografadas.",
    "pergunta": "Qual sala descumpriu a política?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Sabrina",
        "codigo": "Computador: desbloqueado com a pessoa ausente\nPapéis na mesa: lista de alunos com CPF\nSenha: num post-it no monitor"
      },
      {
        "id": 2,
        "nome": "Tiago",
        "codigo": "Computador: desbloqueado com a pessoa ausente\nPapéis na mesa: lista de alunos com CPF\nSenha: guardada no gerenciador"
      },
      {
        "id": 3,
        "nome": "Úrsula",
        "codigo": "Computador: bloqueado (Win + L)\nPapéis na mesa: lista de alunos com CPF\nSenha: guardada no gerenciador"
      },
      {
        "id": 4,
        "nome": "Valdir",
        "codigo": "Computador: desbloqueado com a pessoa ausente\nPapéis na mesa: nenhum\nSenha: guardada no gerenciador"
      },
      {
        "id": 5,
        "nome": "Wanda",
        "codigo": "Computador: bloqueado (Win + L)\nPapéis na mesa: lista de alunos com CPF\nSenha: num post-it no monitor"
      },
      {
        "id": 6,
        "nome": "Xande",
        "codigo": "Computador: desbloqueado com a pessoa ausente\nPapéis na mesa: nenhum\nSenha: num post-it no monitor"
      }
    ],
    "pistas": [
      "Qualquer um podia usar o computador da sala.",
      "Havia documentos com dados pessoais à vista.",
      "A senha estava à vista de todos."
    ],
    "dicas": [
      "Política de mesa e tela limpas: nada sensível à vista.",
      "Win + L bloqueia o Windows."
    ]
  },
  {
    "id": "c135",
    "disciplina": "Introdução à Segurança da Informação",
    "tipo": "codigo",
    "linguagem": "Regras",
    "titulo": "A Autenticação em Dois Fatores",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Mesmo com a senha vazada, uma conta não foi invadida. Seis configurações de conta foram analisadas.",
    "pergunta": "Qual conta resistiu?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yago",
        "codigo": "Senha: vazada em outro site\nVerificação em duas etapas: ativada, com aplicativo autenticador\nTentativa de acesso: bloqueada: código não informado"
      },
      {
        "id": 2,
        "nome": "Zuleica",
        "codigo": "Senha: vazada em outro site\nVerificação em duas etapas: desativada\nTentativa de acesso: acesso concedido"
      },
      {
        "id": 3,
        "nome": "Arnaldo",
        "codigo": "Senha: nunca vazou\nVerificação em duas etapas: desativada\nTentativa de acesso: nenhuma tentativa"
      },
      {
        "id": 4,
        "nome": "Betina",
        "codigo": "Senha: nunca vazou\nVerificação em duas etapas: desativada\nTentativa de acesso: bloqueada: senha errada"
      },
      {
        "id": 5,
        "nome": "Cícero",
        "codigo": "Senha: vazada em outro site\nVerificação em duas etapas: ativada, com aplicativo autenticador\nTentativa de acesso: acesso concedido: código roubado por telefone"
      },
      {
        "id": 6,
        "nome": "Denise",
        "codigo": "Senha: nunca vazou\nVerificação em duas etapas: ativada, com aplicativo autenticador\nTentativa de acesso: nenhuma tentativa"
      }
    ],
    "pistas": [
      "A senha dessa conta estava numa lista de senhas vazadas.",
      "Era preciso um código do celular além da senha.",
      "O invasor parou no pedido do código."
    ],
    "dicas": [
      "A verificação em duas etapas pede algo que você sabe e algo que você tem.",
      "Senha sozinha é um fator só."
    ]
  },
  {
    "id": "c136",
    "disciplina": "Introdução à Segurança da Informação",
    "tipo": "codigo",
    "linguagem": "Regras",
    "titulo": "O Backup que Salvou o Trabalho",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "O notebook de um aluno foi roubado, mas ele recuperou o trabalho inteiro. Seis alunos contaram como faziam cópia.",
    "pergunta": "Quem recuperou o trabalho?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Edson",
        "codigo": "Cópia: diária\nOnde ficava a cópia: na nuvem e num HD em casa\nTestou a restauração: não"
      },
      {
        "id": 2,
        "nome": "Flávia",
        "codigo": "Cópia: diária\nOnde ficava a cópia: no próprio notebook\nTestou a restauração: não"
      },
      {
        "id": 3,
        "nome": "Gustavo",
        "codigo": "Cópia: nunca fez\nOnde ficava a cópia: na nuvem e num HD em casa\nTestou a restauração: sim"
      },
      {
        "id": 4,
        "nome": "Hilda",
        "codigo": "Cópia: diária\nOnde ficava a cópia: no próprio notebook\nTestou a restauração: sim"
      },
      {
        "id": 5,
        "nome": "Isaque",
        "codigo": "Cópia: diária\nOnde ficava a cópia: na nuvem e num HD em casa\nTestou a restauração: sim"
      },
      {
        "id": 6,
        "nome": "Jussara",
        "codigo": "Cópia: nunca fez\nOnde ficava a cópia: na nuvem e num HD em casa\nTestou a restauração: não"
      }
    ],
    "pistas": [
      "Ele fazia cópia todos os dias.",
      "A cópia ficava fora do notebook roubado.",
      "Ele já tinha testado se a cópia abria."
    ],
    "dicas": [
      "Backup no mesmo aparelho some junto com ele.",
      "Regra 3-2-1: 3 cópias, 2 mídias, 1 fora de casa."
    ]
  },
  {
    "id": "c137",
    "disciplina": "Introdução à Segurança da Informação",
    "tipo": "codigo",
    "linguagem": "Regras",
    "titulo": "A Engenharia Social",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "Uma pessoa ligou para a secretaria dizendo ser do suporte e conseguiu a senha do sistema. Seis relatos de ligação foram registrados.",
    "pergunta": "Qual relato é o do golpe?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Kauê",
        "codigo": "Quem ligou se apresentou como: mãe de aluno\nO que pediu: a senha para \"corrigir um erro\"\nConferiu a identidade: não\nUrgência: disse que o sistema cairia em 10 minutos"
      },
      {
        "id": 2,
        "nome": "Lorena",
        "codigo": "Quem ligou se apresentou como: técnico do suporte da reitoria\nO que pediu: a senha para \"corrigir um erro\"\nConferiu a identidade: sim, ligou de volta para o número oficial\nUrgência: disse que o sistema cairia em 10 minutos"
      },
      {
        "id": 3,
        "nome": "Moisés",
        "codigo": "Quem ligou se apresentou como: técnico do suporte da reitoria\nO que pediu: a senha para \"corrigir um erro\"\nConferiu a identidade: não\nUrgência: nenhuma"
      },
      {
        "id": 4,
        "nome": "Nádia",
        "codigo": "Quem ligou se apresentou como: técnico do suporte da reitoria\nO que pediu: a senha para \"corrigir um erro\"\nConferiu a identidade: sim, ligou de volta para o número oficial\nUrgência: nenhuma"
      },
      {
        "id": 5,
        "nome": "Otávio",
        "codigo": "Quem ligou se apresentou como: técnico do suporte da reitoria\nO que pediu: a senha para \"corrigir um erro\"\nConferiu a identidade: não\nUrgência: disse que o sistema cairia em 10 minutos"
      },
      {
        "id": 6,
        "nome": "Paula",
        "codigo": "Quem ligou se apresentou como: técnico do suporte da reitoria\nO que pediu: o horário da reunião\nConferiu a identidade: não\nUrgência: disse que o sistema cairia em 10 minutos"
      }
    ],
    "pistas": [
      "A pessoa fingiu ser da equipe de TI.",
      "A pessoa pediu a senha.",
      "Ninguém confirmou quem era.",
      "A pessoa pressionou para responder rápido."
    ],
    "dicas": [
      "Suporte de verdade nunca pede a sua senha.",
      "Confirme ligando para o número oficial."
    ]
  },
  {
    "id": "c138",
    "disciplina": "Introdução à Segurança da Informação",
    "tipo": "codigo",
    "linguagem": "Regras",
    "titulo": "A Integridade do Arquivo",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "O arquivo de instalação baixado no laboratório foi alterado por alguém no caminho. Seis registros de download foram conferidos.",
    "pergunta": "Qual download foi alterado?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Raí",
        "codigo": "Assinatura digital do instalador: válida (editora oficial)\nHash SHA-256 calculado (oficial: 9f2c…a71b): 9f2c…a71b\nOrigem: espelho não oficial\nTamanho: igual ao oficial"
      },
      {
        "id": 2,
        "nome": "Sueli",
        "codigo": "Assinatura digital do instalador: válida (editora oficial)\nHash SHA-256 calculado (oficial: 9f2c…a71b): 9f2c…a71b\nOrigem: site oficial\nTamanho: igual ao oficial"
      },
      {
        "id": 3,
        "nome": "Talita",
        "codigo": "Assinatura digital do instalador: inválida\nHash SHA-256 calculado (oficial: 9f2c…a71b): 4d10…c3e8\nOrigem: espelho não oficial\nTamanho: 2 KB maior que o oficial"
      },
      {
        "id": 4,
        "nome": "Ubiratã",
        "codigo": "Assinatura digital do instalador: inválida\nHash SHA-256 calculado (oficial: 9f2c…a71b): 4d10…c3e8\nOrigem: site oficial\nTamanho: 2 KB maior que o oficial"
      },
      {
        "id": 5,
        "nome": "Vanessa",
        "codigo": "Assinatura digital do instalador: ausente\nHash SHA-256 calculado (oficial: 9f2c…a71b): 4d10…c3e8\nOrigem: espelho não oficial\nTamanho: igual ao oficial"
      },
      {
        "id": 6,
        "nome": "Wellington",
        "codigo": "Assinatura digital do instalador: válida (editora oficial)\nHash SHA-256 calculado (oficial: 9f2c…a71b): 7b55…0d12\nOrigem: site oficial\nTamanho: igual ao oficial"
      }
    ],
    "pistas": [
      "A assinatura digital do arquivo não foi reconhecida.",
      "O hash calculado não bateu com o publicado no site oficial.",
      "O arquivo foi baixado de outro site.",
      "O arquivo baixado era um pouco maior."
    ],
    "dicas": [
      "Hash diferente significa arquivo diferente.",
      "Baixe sempre da fonte oficial."
    ]
  },
  {
    "id": "c139",
    "disciplina": "Introdução à Segurança da Informação",
    "tipo": "codigo",
    "linguagem": "Regras",
    "titulo": "O Princípio do Menor Privilégio",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "Um estagiário apagou sem querer a pasta de notas de toda a escola. Seis fichas de permissão foram analisadas.",
    "pergunta": "Qual ficha é a do estagiário?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yolanda",
        "codigo": "Função: estagiário da secretaria\nPermissão na pasta Notas: Controle total\nPrecisa alterar notas no trabalho: sim\nConta compartilhada: não"
      },
      {
        "id": 2,
        "nome": "Zeno",
        "codigo": "Função: estagiário da secretaria\nPermissão na pasta Notas: Somente leitura\nPrecisa alterar notas no trabalho: não\nConta compartilhada: não"
      },
      {
        "id": 3,
        "nome": "Adriana",
        "codigo": "Função: estagiário da secretaria\nPermissão na pasta Notas: Controle total\nPrecisa alterar notas no trabalho: não\nConta compartilhada: não"
      },
      {
        "id": 4,
        "nome": "Benedito",
        "codigo": "Função: estagiário da secretaria\nPermissão na pasta Notas: Controle total\nPrecisa alterar notas no trabalho: sim\nConta compartilhada: sim"
      },
      {
        "id": 5,
        "nome": "Celina",
        "codigo": "Função: estagiário da secretaria\nPermissão na pasta Notas: Controle total\nPrecisa alterar notas no trabalho: não\nConta compartilhada: sim"
      },
      {
        "id": 6,
        "nome": "Diogo",
        "codigo": "Função: coordenador\nPermissão na pasta Notas: Controle total\nPrecisa alterar notas no trabalho: não\nConta compartilhada: não"
      }
    ],
    "pistas": [
      "A pessoa era estagiária.",
      "Ela podia apagar a pasta inteira.",
      "A função dela não exigia mexer nas notas.",
      "A conta era só dela."
    ],
    "dicas": [
      "Menor privilégio: cada um só com o acesso que precisa.",
      "Controle total permite apagar."
    ]
  },
  {
    "id": "c140",
    "disciplina": "Introdução à Segurança da Informação",
    "tipo": "codigo",
    "linguagem": "Regras",
    "titulo": "O Vazamento pela Rede Aberta",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "Os dados de login de um professor foram capturados enquanto ele usava o Wi-Fi da praça. Seis relatórios de conexão foram analisados.",
    "pergunta": "Qual relatório é o do professor?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Elaine",
        "codigo": "Rede: Wi-Fi aberto, sem senha\nSite de login: http:// (sem cadeado)\nVPN: ligada\nDispositivo: notebook pessoal"
      },
      {
        "id": 2,
        "nome": "Fausto",
        "codigo": "Rede: Wi-Fi aberto, sem senha\nSite de login: http:// (sem cadeado)\nVPN: desligada\nDispositivo: notebook da escola"
      },
      {
        "id": 3,
        "nome": "Glória",
        "codigo": "Rede: Wi-Fi aberto, sem senha\nSite de login: http:// (sem cadeado)\nVPN: ligada\nDispositivo: notebook da escola"
      },
      {
        "id": 4,
        "nome": "Henrique",
        "codigo": "Rede: rede da escola com WPA2\nSite de login: http:// (sem cadeado)\nVPN: desligada\nDispositivo: notebook pessoal"
      },
      {
        "id": 5,
        "nome": "Iolanda",
        "codigo": "Rede: Wi-Fi aberto, sem senha\nSite de login: http:// (sem cadeado)\nVPN: desligada\nDispositivo: notebook pessoal"
      },
      {
        "id": 6,
        "nome": "Jair",
        "codigo": "Rede: Wi-Fi aberto, sem senha\nSite de login: https:// (com cadeado)\nVPN: desligada\nDispositivo: notebook pessoal"
      }
    ],
    "pistas": [
      "A rede não tinha senha nem criptografia.",
      "O site não protegia os dados no caminho.",
      "Não havia túnel protegendo a conexão.",
      "Era o notebook pessoal dele."
    ],
    "dicas": [
      "Em HTTP os dados viajam sem criptografia.",
      "VPN cria um túnel criptografado."
    ]
  },
  {
    "id": "c141",
    "disciplina": "Vírus e Antivírus",
    "tipo": "codigo",
    "linguagem": "Log",
    "titulo": "O Anexo Executável",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "O computador da secretaria foi infectado depois que alguém abriu um anexo de \"boleto\". Seis anexos foram encontrados nos e-mails.",
    "pergunta": "Qual anexo infectou o computador?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Abel",
        "codigo": "Nome do anexo: boleto.pdf.exe\nRemetente: cobranca@pagamentos-rapidos.biz\nAlerta do antivírus: Trojan detectado"
      },
      {
        "id": 2,
        "nome": "Bia",
        "codigo": "Nome do anexo: boleto.pdf.exe\nRemetente: financeiro@ifs.edu.br\nAlerta do antivírus: nenhum"
      },
      {
        "id": 3,
        "nome": "Caetano",
        "codigo": "Nome do anexo: boleto.pdf\nRemetente: cobranca@pagamentos-rapidos.biz\nAlerta do antivírus: nenhum"
      },
      {
        "id": 4,
        "nome": "Dalva",
        "codigo": "Nome do anexo: boleto.pdf.exe\nRemetente: financeiro@ifs.edu.br\nAlerta do antivírus: Trojan detectado"
      },
      {
        "id": 5,
        "nome": "Elias",
        "codigo": "Nome do anexo: boleto.pdf\nRemetente: cobranca@pagamentos-rapidos.biz\nAlerta do antivírus: Trojan detectado"
      },
      {
        "id": 6,
        "nome": "Fabiana",
        "codigo": "Nome do anexo: boleto.pdf.exe\nRemetente: cobranca@pagamentos-rapidos.biz\nAlerta do antivírus: nenhum"
      }
    ],
    "pistas": [
      "O arquivo tinha duas extensões, e a última era de programa.",
      "O remetente não era da escola.",
      "O antivírus acusou um cavalo de Troia."
    ],
    "dicas": [
      "A última extensão é a que vale: .exe é programa.",
      "Esconder extensões ajuda o golpe."
    ]
  },
  {
    "id": "c142",
    "disciplina": "Vírus e Antivírus",
    "tipo": "codigo",
    "linguagem": "Log",
    "titulo": "O Ransomware do Laboratório",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "Os arquivos de um computador viraram .lockd e apareceu uma mensagem pedindo pagamento em criptomoeda. Seis relatórios foram coletados.",
    "pergunta": "Qual relatório é o do computador sequestrado?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Gilson",
        "codigo": "Extensão dos arquivos: .lockd\nMensagem na tela: nenhuma\nAntivírus: atualizado hoje"
      },
      {
        "id": 2,
        "nome": "Helena",
        "codigo": "Extensão dos arquivos: .docx\nMensagem na tela: pede pagamento para devolver os arquivos\nAntivírus: atualizado hoje"
      },
      {
        "id": 3,
        "nome": "Ícaro",
        "codigo": "Extensão dos arquivos: .lockd\nMensagem na tela: pede pagamento para devolver os arquivos\nAntivírus: atualizado hoje"
      },
      {
        "id": 4,
        "nome": "Joana",
        "codigo": "Extensão dos arquivos: .docx\nMensagem na tela: pede pagamento para devolver os arquivos\nAntivírus: desatualizado há 8 meses"
      },
      {
        "id": 5,
        "nome": "Kleber",
        "codigo": "Extensão dos arquivos: .lockd\nMensagem na tela: nenhuma\nAntivírus: desatualizado há 8 meses"
      },
      {
        "id": 6,
        "nome": "Lívia",
        "codigo": "Extensão dos arquivos: .lockd\nMensagem na tela: pede pagamento para devolver os arquivos\nAntivírus: desatualizado há 8 meses"
      }
    ],
    "pistas": [
      "Os arquivos tinham uma extensão nova e não abriam.",
      "Havia um pedido de resgate.",
      "As vacinas do antivírus estavam velhas."
    ],
    "dicas": [
      "Ransomware criptografa arquivos e pede resgate.",
      "Antivírus desatualizado não reconhece ameaças novas."
    ]
  },
  {
    "id": "c143",
    "disciplina": "Vírus e Antivírus",
    "tipo": "codigo",
    "linguagem": "Log",
    "titulo": "O Pendrive que Espalhou",
    "nivel": "Aquecimento",
    "pontos": 60,
    "historia": "Vários computadores do laboratório foram infectados no mesmo dia. Todos receberam o mesmo pendrive. Seis registros foram analisados.",
    "pergunta": "Qual registro mostra o pendrive que espalhou a infecção?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Mateus",
        "codigo": "Arquivo no pendrive: autorun.inf + atalho \"Fotos.lnk\"\nPastas originais: ocultas\nVerificação ao plugar: feita, nada encontrado"
      },
      {
        "id": 2,
        "nome": "Noemi",
        "codigo": "Arquivo no pendrive: só fotos .jpg\nPastas originais: ocultas\nVerificação ao plugar: feita, nada encontrado"
      },
      {
        "id": 3,
        "nome": "Osvaldo",
        "codigo": "Arquivo no pendrive: só fotos .jpg\nPastas originais: ocultas\nVerificação ao plugar: não feita"
      },
      {
        "id": 4,
        "nome": "Priscila",
        "codigo": "Arquivo no pendrive: autorun.inf + atalho \"Fotos.lnk\"\nPastas originais: visíveis\nVerificação ao plugar: não feita"
      },
      {
        "id": 5,
        "nome": "Quênia",
        "codigo": "Arquivo no pendrive: autorun.inf + atalho \"Fotos.lnk\"\nPastas originais: visíveis\nVerificação ao plugar: feita, nada encontrado"
      },
      {
        "id": 6,
        "nome": "Renan",
        "codigo": "Arquivo no pendrive: autorun.inf + atalho \"Fotos.lnk\"\nPastas originais: ocultas\nVerificação ao plugar: não feita"
      }
    ],
    "pistas": [
      "O pendrive tinha um arquivo de execução automática e um atalho falso.",
      "As pastas verdadeiras tinham sido escondidas.",
      "Ninguém mandou o antivírus verificar o pendrive."
    ],
    "dicas": [
      "Worms de pendrive escondem pastas e criam atalhos.",
      "Verifique pendrives antes de abrir."
    ]
  },
  {
    "id": "c144",
    "disciplina": "Vírus e Antivírus",
    "tipo": "codigo",
    "linguagem": "Log",
    "titulo": "O Falso Antivírus",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "Um site mostrou \"Seu computador tem 37 vírus!\" e mandou baixar um \"limpador\". Seis históricos de navegação foram analisados.",
    "pergunta": "Qual histórico é o do computador enganado?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Sabrina",
        "codigo": "Aviso: pop-up no navegador com contagem de vírus\nPrograma baixado: LimpaPC-Pro.exe de site desconhecido\nCobrança: pediu R$ 99 para \"remover os vírus\""
      },
      {
        "id": 2,
        "nome": "Tiago",
        "codigo": "Aviso: pop-up no navegador com contagem de vírus\nPrograma baixado: nenhum\nCobrança: pediu R$ 99 para \"remover os vírus\""
      },
      {
        "id": 3,
        "nome": "Úrsula",
        "codigo": "Aviso: pop-up no navegador com contagem de vírus\nPrograma baixado: nenhum\nCobrança: nenhuma"
      },
      {
        "id": 4,
        "nome": "Valdir",
        "codigo": "Aviso: notificação da Segurança do Windows\nPrograma baixado: LimpaPC-Pro.exe de site desconhecido\nCobrança: nenhuma"
      },
      {
        "id": 5,
        "nome": "Wanda",
        "codigo": "Aviso: notificação da Segurança do Windows\nPrograma baixado: LimpaPC-Pro.exe de site desconhecido\nCobrança: pediu R$ 99 para \"remover os vírus\""
      },
      {
        "id": 6,
        "nome": "Xande",
        "codigo": "Aviso: pop-up no navegador com contagem de vírus\nPrograma baixado: LimpaPC-Pro.exe de site desconhecido\nCobrança: nenhuma"
      }
    ],
    "pistas": [
      "O aviso apareceu dentro de uma página da web.",
      "Foi baixado um programa de um site desconhecido.",
      "O programa pediu dinheiro."
    ],
    "dicas": [
      "Site nenhum consegue verificar o seu computador pelo navegador.",
      "Falso antivírus é um tipo de golpe (scareware)."
    ]
  },
  {
    "id": "c145",
    "disciplina": "Vírus e Antivírus",
    "tipo": "codigo",
    "linguagem": "Log",
    "titulo": "A Quarentena",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "O antivírus encontrou uma ameaça num arquivo de trabalho e o aluno quer saber o que aconteceu. Seis registros do antivírus foram exportados.",
    "pergunta": "Qual registro é o do arquivo do aluno?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yago",
        "codigo": "Ação tomada: Excluído\nArquivo: trabalho_final.docm\nAmeaça: nenhuma"
      },
      {
        "id": 2,
        "nome": "Zuleica",
        "codigo": "Ação tomada: Movido para a quarentena\nArquivo: trabalho_final.docm\nAmeaça: macro maliciosa"
      },
      {
        "id": 3,
        "nome": "Arnaldo",
        "codigo": "Ação tomada: Movido para a quarentena\nArquivo: trabalho_final.docm\nAmeaça: nenhuma"
      },
      {
        "id": 4,
        "nome": "Betina",
        "codigo": "Ação tomada: Permitido\nArquivo: trabalho_final.docm\nAmeaça: macro maliciosa"
      },
      {
        "id": 5,
        "nome": "Cícero",
        "codigo": "Ação tomada: Movido para a quarentena\nArquivo: trabalho_final.docx\nAmeaça: macro maliciosa"
      },
      {
        "id": 6,
        "nome": "Denise",
        "codigo": "Ação tomada: Movido para a quarentena\nArquivo: trabalho_final.docx\nAmeaça: nenhuma"
      }
    ],
    "pistas": [
      "O arquivo foi isolado, mas não apagado.",
      "O arquivo era de um tipo do Word que pode guardar macros.",
      "O perigo estava num código automático dentro do documento."
    ],
    "dicas": [
      "A quarentena isola o arquivo sem apagar.",
      "Arquivos .docm podem ter macros."
    ]
  },
  {
    "id": "c146",
    "disciplina": "Vírus e Antivírus",
    "tipo": "codigo",
    "linguagem": "Log",
    "titulo": "O Spyware do Teclado",
    "nivel": "Intermediário",
    "pontos": 80,
    "historia": "A senha de um aluno foi roubada mesmo sem ele cair em golpe de e-mail. O técnico achou um programa espião. Seis relatórios foram analisados.",
    "pergunta": "Qual relatório é o do computador espionado?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Edson",
        "codigo": "Programa encontrado: keylogger\nComo chegou: junto com um jogo pirata\nConexões de saída: nenhuma estranha\nAntivírus em tempo real: ativado"
      },
      {
        "id": 2,
        "nome": "Flávia",
        "codigo": "Programa encontrado: keylogger\nComo chegou: atualização oficial\nConexões de saída: envia arquivo para servidor desconhecido a cada hora\nAntivírus em tempo real: desativado pelo usuário"
      },
      {
        "id": 3,
        "nome": "Gustavo",
        "codigo": "Programa encontrado: keylogger\nComo chegou: junto com um jogo pirata\nConexões de saída: envia arquivo para servidor desconhecido a cada hora\nAntivírus em tempo real: desativado pelo usuário"
      },
      {
        "id": 4,
        "nome": "Hilda",
        "codigo": "Programa encontrado: keylogger\nComo chegou: junto com um jogo pirata\nConexões de saída: nenhuma estranha\nAntivírus em tempo real: desativado pelo usuário"
      },
      {
        "id": 5,
        "nome": "Isaque",
        "codigo": "Programa encontrado: keylogger\nComo chegou: junto com um jogo pirata\nConexões de saída: envia arquivo para servidor desconhecido a cada hora\nAntivírus em tempo real: ativado"
      },
      {
        "id": 6,
        "nome": "Jussara",
        "codigo": "Programa encontrado: adware\nComo chegou: junto com um jogo pirata\nConexões de saída: envia arquivo para servidor desconhecido a cada hora\nAntivírus em tempo real: desativado pelo usuário"
      }
    ],
    "pistas": [
      "O programa registrava tudo o que era digitado.",
      "Veio escondido num jogo baixado de forma ilegal.",
      "O computador mandava dados para fora regularmente.",
      "A proteção em tempo real estava desligada."
    ],
    "dicas": [
      "Keylogger grava as teclas digitadas.",
      "Programas piratas são porta de entrada para malware."
    ]
  },
  {
    "id": "c147",
    "disciplina": "Vírus e Antivírus",
    "tipo": "codigo",
    "linguagem": "Log",
    "titulo": "O Adware das Propagandas",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "Um computador mostrava propagandas até fora do navegador. Seis relatórios foram coletados.",
    "pergunta": "Qual relatório é o do computador com propagandas?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Kauê",
        "codigo": "Programa instalado junto: \"OfertasJá\" (adware)\nInstalação: instalação personalizada, desmarcando extras\nOnde aparecem os anúncios: na Área de Trabalho e no navegador\nDano aos arquivos: nenhum"
      },
      {
        "id": 2,
        "nome": "Lorena",
        "codigo": "Programa instalado junto: \"OfertasJá\" (adware)\nInstalação: \"Avançar\" em tudo num instalador gratuito\nOnde aparecem os anúncios: na Área de Trabalho e no navegador\nDano aos arquivos: nenhum"
      },
      {
        "id": 3,
        "nome": "Moisés",
        "codigo": "Programa instalado junto: \"OfertasJá\" (adware)\nInstalação: \"Avançar\" em tudo num instalador gratuito\nOnde aparecem os anúncios: só em sites\nDano aos arquivos: nenhum"
      },
      {
        "id": 4,
        "nome": "Nádia",
        "codigo": "Programa instalado junto: \"OfertasJá\" (adware)\nInstalação: \"Avançar\" em tudo num instalador gratuito\nOnde aparecem os anúncios: na Área de Trabalho e no navegador\nDano aos arquivos: arquivos criptografados"
      },
      {
        "id": 5,
        "nome": "Otávio",
        "codigo": "Programa instalado junto: \"OfertasJá\" (adware)\nInstalação: \"Avançar\" em tudo num instalador gratuito\nOnde aparecem os anúncios: só em sites\nDano aos arquivos: arquivos criptografados"
      },
      {
        "id": 6,
        "nome": "Paula",
        "codigo": "Programa instalado junto: nenhum extra\nInstalação: \"Avançar\" em tudo num instalador gratuito\nOnde aparecem os anúncios: na Área de Trabalho e no navegador\nDano aos arquivos: nenhum"
      }
    ],
    "pistas": [
      "Um programa de propagandas veio junto com outro.",
      "O usuário não leu as opções do instalador.",
      "Os anúncios apareciam fora do navegador.",
      "Os arquivos estavam intactos."
    ],
    "dicas": [
      "Adware mostra propagandas; ransomware criptografa.",
      "Leia cada tela do instalador."
    ]
  },
  {
    "id": "c148",
    "disciplina": "Vírus e Antivírus",
    "tipo": "codigo",
    "linguagem": "Log",
    "titulo": "A Vacina Desatualizada",
    "nivel": "Detetive",
    "pontos": 100,
    "historia": "Uma ameaça nova infectou só um dos computadores do laboratório. Seis relatórios do antivírus foram comparados.",
    "pergunta": "Qual relatório é o do computador infectado?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Raí",
        "codigo": "Última atualização das definições: há 45 dias\nProteção em tempo real: ativada\nProteção baseada em nuvem: ativada\nÚltima verificação completa: há 3 meses"
      },
      {
        "id": 2,
        "nome": "Sueli",
        "codigo": "Última atualização das definições: hoje\nProteção em tempo real: ativada\nProteção baseada em nuvem: desativada\nÚltima verificação completa: há 3 meses"
      },
      {
        "id": 3,
        "nome": "Talita",
        "codigo": "Última atualização das definições: há 45 dias\nProteção em tempo real: ativada\nProteção baseada em nuvem: ativada\nÚltima verificação completa: ontem"
      },
      {
        "id": 4,
        "nome": "Ubiratã",
        "codigo": "Última atualização das definições: há 45 dias\nProteção em tempo real: desativada\nProteção baseada em nuvem: desativada\nÚltima verificação completa: há 3 meses"
      },
      {
        "id": 5,
        "nome": "Vanessa",
        "codigo": "Última atualização das definições: há 45 dias\nProteção em tempo real: ativada\nProteção baseada em nuvem: desativada\nÚltima verificação completa: há 3 meses"
      },
      {
        "id": 6,
        "nome": "Wellington",
        "codigo": "Última atualização das definições: há 45 dias\nProteção em tempo real: ativada\nProteção baseada em nuvem: desativada\nÚltima verificação completa: ontem"
      }
    ],
    "pistas": [
      "O antivírus não conhecia ameaças recentes.",
      "A proteção em tempo real estava ligada.",
      "O antivírus não consultava a nuvem.",
      "Fazia tempo que ninguém verificava o disco todo."
    ],
    "dicas": [
      "Definições velhas não reconhecem vírus novos.",
      "A proteção na nuvem ajuda contra ameaças recentes."
    ]
  },
  {
    "id": "c149",
    "disciplina": "Vírus e Antivírus",
    "tipo": "codigo",
    "linguagem": "Log",
    "titulo": "O Worm da Rede",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "Uma infecção se espalhou sozinha pela rede do laboratório, sem ninguém abrir arquivos. Seis relatórios de rede foram coletados.",
    "pergunta": "Qual relatório mostra o computador por onde começou?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Yolanda",
        "codigo": "Atualizações do Windows: pendentes há 1 ano\nPorta 445 (compartilhamento): aberta para toda a rede\nTráfego: tenta conectar em centenas de IPs por minuto\nPrimeira detecção: 08:02"
      },
      {
        "id": 2,
        "nome": "Zeno",
        "codigo": "Atualizações do Windows: em dia\nPorta 445 (compartilhamento): aberta para toda a rede\nTráfego: tenta conectar em centenas de IPs por minuto\nPrimeira detecção: 08:02"
      },
      {
        "id": 3,
        "nome": "Adriana",
        "codigo": "Atualizações do Windows: pendentes há 1 ano\nPorta 445 (compartilhamento): bloqueada pelo firewall\nTráfego: tenta conectar em centenas de IPs por minuto\nPrimeira detecção: 08:02"
      },
      {
        "id": 4,
        "nome": "Benedito",
        "codigo": "Atualizações do Windows: pendentes há 1 ano\nPorta 445 (compartilhamento): aberta para toda a rede\nTráfego: tenta conectar em centenas de IPs por minuto\nPrimeira detecção: 10:40"
      },
      {
        "id": 5,
        "nome": "Celina",
        "codigo": "Atualizações do Windows: pendentes há 1 ano\nPorta 445 (compartilhamento): aberta para toda a rede\nTráfego: normal\nPrimeira detecção: 10:40"
      },
      {
        "id": 6,
        "nome": "Diogo",
        "codigo": "Atualizações do Windows: pendentes há 1 ano\nPorta 445 (compartilhamento): aberta para toda a rede\nTráfego: normal\nPrimeira detecção: 08:02"
      }
    ],
    "pistas": [
      "O sistema tinha falhas sem correção.",
      "O compartilhamento estava exposto à rede toda.",
      "O computador procurava outras máquinas sem parar.",
      "Foi o primeiro a ser detectado."
    ],
    "dicas": [
      "Worm se espalha sozinho explorando falhas.",
      "Sistema sem atualização é o alvo preferido."
    ]
  },
  {
    "id": "c150",
    "disciplina": "Vírus e Antivírus",
    "tipo": "codigo",
    "linguagem": "Log",
    "titulo": "A Verificação Completa",
    "nivel": "Mestre",
    "pontos": 120,
    "historia": "Depois da limpeza, o técnico precisa provar que o computador ficou limpo. Seis relatórios de verificação foram entregues.",
    "pergunta": "Qual relatório prova a limpeza?",
    "suspeitos": [
      {
        "id": 1,
        "nome": "Elaine",
        "codigo": "Tipo de verificação: Completa\nDefinições usadas: atualizadas hoje\nAmeaças encontradas: 0\nVerificação offline: não feita"
      },
      {
        "id": 2,
        "nome": "Fausto",
        "codigo": "Tipo de verificação: Completa\nDefinições usadas: atualizadas hoje\nAmeaças encontradas: 0\nVerificação offline: feita (Microsoft Defender Offline)"
      },
      {
        "id": 3,
        "nome": "Glória",
        "codigo": "Tipo de verificação: Completa\nDefinições usadas: atualizadas hoje\nAmeaças encontradas: 2 em quarentena\nVerificação offline: não feita"
      },
      {
        "id": 4,
        "nome": "Henrique",
        "codigo": "Tipo de verificação: Completa\nDefinições usadas: atualizadas hoje\nAmeaças encontradas: 2 em quarentena\nVerificação offline: feita (Microsoft Defender Offline)"
      },
      {
        "id": 5,
        "nome": "Iolanda",
        "codigo": "Tipo de verificação: Completa\nDefinições usadas: de 2 meses atrás\nAmeaças encontradas: 0\nVerificação offline: feita (Microsoft Defender Offline)"
      },
      {
        "id": 6,
        "nome": "Jair",
        "codigo": "Tipo de verificação: Rápida\nDefinições usadas: atualizadas hoje\nAmeaças encontradas: 0\nVerificação offline: feita (Microsoft Defender Offline)"
      }
    ],
    "pistas": [
      "Todos os arquivos e programas do disco foram verificados.",
      "O antivírus estava com as definições do dia.",
      "Nenhuma ameaça foi encontrada.",
      "Também foi feita a verificação antes do Windows carregar."
    ],
    "dicas": [
      "Verificação rápida olha só os lugares mais comuns.",
      "A verificação offline pega ameaças que se escondem com o Windows ligado."
    ]
  }
];
