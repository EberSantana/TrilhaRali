/** Leitura da lista de palavras da Cruzadinha que o professor importa (o banco fica só na planilha dele). */

export const CRUZ_DISCIPLINAS = ['Banco de Dados', 'Informática Básica', 'Construção de Sites 1', 'Fundamentos de Sistemas Operacionais'] as const;
export type CruzDisciplina = (typeof CRUZ_DISCIPLINAS)[number];

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const APELIDOS: Record<string, CruzDisciplina> = {
  'banco de dados': 'Banco de Dados', bd: 'Banco de Dados', sql: 'Banco de Dados',
  'informatica basica': 'Informática Básica', informatica: 'Informática Básica', info: 'Informática Básica',
  'construcao de sites 1': 'Construção de Sites 1', 'construcao de sites': 'Construção de Sites 1', sites: 'Construção de Sites 1', web: 'Construção de Sites 1',
  'fundamentos de sistemas operacionais': 'Fundamentos de Sistemas Operacionais', 'sistemas operacionais': 'Fundamentos de Sistemas Operacionais', linux: 'Fundamentos de Sistemas Operacionais', so: 'Fundamentos de Sistemas Operacionais',
};

export interface Leitura {
  linhas: [CruzDisciplina, string, string][];
  erros: string[];
}

/** Uma palavra por linha: disciplina;palavra;dica (aceita também tabulação, como ao colar da planilha). */
export function lerBanco(texto: string): Leitura {
  const linhas: Leitura['linhas'] = [];
  const erros: string[] = [];
  const vistas = new Set<string>();
  texto.replace(/^﻿/, '').split(/\r?\n/).forEach((bruta, i) => {
    const l = bruta.trim();
    if (!l || l.startsWith('#')) return;
    const partes = (l.includes('\t') ? l.split('\t') : l.split(';')).map((p) => p.trim());
    if (i === 0 && semAcento(partes[0]) === 'disciplina') return;
    const disc = APELIDOS[semAcento(partes[0] ?? '')];
    const palavra = (partes[1] ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
    const dica = partes.slice(2).join('; ').trim();
    if (!disc) erros.push(`Linha ${i + 1}: disciplina "${partes[0] ?? ''}" desconhecida`);
    else if (palavra.length < 3 || palavra.length > 16) erros.push(`Linha ${i + 1}: a palavra precisa ter de 3 a 16 letras`);
    else if (!dica) erros.push(`Linha ${i + 1}: falta a dica`);
    else if (vistas.has(disc + palavra)) erros.push(`Linha ${i + 1}: ${palavra} repetida`);
    else {
      vistas.add(disc + palavra);
      linhas.push([disc, palavra, dica]);
    }
  });
  return { linhas, erros };
}
