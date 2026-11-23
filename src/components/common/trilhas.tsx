import React from 'react';
import { Flag, Puzzle, Radio, Search } from 'lucide-react';
import type { Accent, PassoComoJogar } from './ModuleShell';

/** Identidade de cada trilha (a mesma da entrada do portal) e o seu "como jogar". */
export const TRILHAS: Record<'rali' | 'ctf' | 'cruz' | 'desv', { accent: Accent; icon: React.ReactNode; title: string; tagline: string; comoJogar: PassoComoJogar[] }> = {
  rali: {
    accent: 'emerald',
    icon: <Radio className="w-5 h-5" />,
    title: 'Rali NFC',
    tagline: 'Em equipe, pelo laboratório',
    comoJogar: [
      { titulo: 'Entre com a equipe', texto: 'Digite o token da sala que o professor mostrou e o nome da sua equipe.' },
      { titulo: 'Ache as etiquetas', texto: 'Encoste o celular na etiqueta NFC da mesa (ou leia o QR code). A missão abre na tela.' },
      { titulo: 'Responda', texto: 'Cada acerto soma XP para a equipe. Na pontuação dinâmica, quem acerta primeiro ganha mais.' },
      { titulo: 'Acompanhe o telão', texto: 'O ranking das equipes aparece no telão até o tempo acabar.' },
    ],
  },
  ctf: {
    accent: 'orange',
    icon: <Flag className="w-5 h-5" />,
    title: 'CTF Online',
    tagline: 'Individual, fase a fase',
    comoJogar: [
      { titulo: 'Entre na sala', texto: 'Entre com o seu curso e nome (pelo HUB) e digite o token da sala.' },
      { titulo: 'Resolva as fases', texto: 'Leia a pergunta e envie a resposta. Algumas pedem o Console SQL, o terminal Linux ou o laboratório.' },
      { titulo: 'Use as ferramentas', texto: 'Quando a fase citar o console ou o laboratório, abra a ferramenta logo abaixo da pergunta e investigue.' },
      { titulo: 'Suba no ranking', texto: 'Cada acerto dá XP. O Top 5 aparece no telão e o gabarito comentado é liberado pelo professor no fim.' },
    ],
  },
  cruz: {
    accent: 'cyan',
    icon: <Puzzle className="w-5 h-5" />,
    title: 'Cruzada Online',
    tagline: 'Individual, por assunto',
    comoJogar: [
      { titulo: 'Escolha como jogar', texto: 'Sala da turma (com o token do professor) ou Treino livre, em que você escolhe o assunto.' },
      { titulo: 'Preencha a grade', texto: 'Toque numa palavra para ver a dica e digite a resposta. As palavras são conferidas no servidor.' },
      { titulo: 'Dicas custam pontos', texto: 'Cada letra revelada tira 2 pontos da palavra, e uma palavra revelada inteira vale 0. As dicas são limitadas.' },
      { titulo: 'Entre no ranking', texto: 'No treino livre, ao terminar a grade, escreva seu nome para entrar no Grande Ranking.' },
    ],
  },
  desv: {
    accent: 'violet',
    icon: <Search className="w-5 h-5" />,
    title: 'Desvendando',
    tagline: 'Mistérios em dupla, liberados pelo professor',
    comoJogar: [
      { titulo: 'Monte a cabine', texto: 'Digite o token da sala e o nome da dupla. Cada um escolhe o seu nome no capacete: o piloto (vermelho, nº 1) fica com o celular e faz a acusação; o copiloto (verde, nº 2) lê as pistas e anota no caderno. O professor define se os papéis giram a cada caso, ficam fixos ou se vocês trocam quando quiserem.' },
      { titulo: 'Espere os casos', texto: 'Só aparecem os casos que o professor liberou para a sua turma. Novos casos surgem sozinhos na lista.' },
      { titulo: 'Investigue juntos', texto: 'Leiam a história e as pistas e usem a grade, o banco de dados do caso ou as evidências. Só uma resposta pode ser provada.' },
      { titulo: 'Acusem com certeza', texto: 'Cada acusação errada tira 15 pontos e cada dica tira 10. Ao acertar, vem a explicação e os pontos vão para o ranking da sala.' },
    ],
  },
};
