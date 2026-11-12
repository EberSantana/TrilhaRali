import test from 'node:test';
import assert from 'node:assert/strict';
import { INFO_MISSIONS } from './infoMissions';
import { ALL_MISSIONS } from './missions';
import { LINUX_MISSIONS } from './linuxMissions';
import { BD_MISSIONS } from './bdMissions';
import { CONSOLE_MISSIONS } from './consoleMissions';
import { LAB_DOC, LAB_EMAIL, LAB_FICHA, LAB_NUVEM, LAB_PASTA, LAB_PLANILHA, LAB_SLIDES, LAB_WEB } from './infoLab';
import { avaliarCelula, avaliarFormula, formatar } from '../utils/planilha';

// Mesma normalização do servidor (Apps Script) e do app
const norm = (s: string) =>
  String(s).toLowerCase().trim().replace(/^["']|["']$/g, '').replace(/;+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

const notas = LAB_PLANILHA.abas[0].grade;
const vendas = LAB_PLANILHA.abas[1].grade;
const ficha = (k: string) => LAB_FICHA.linhas.find((l) => l[0] === k)![1];
const doc = (t: string) => LAB_DOC.blocos.filter((b) => b.tipo === t);
const intro = doc('paragrafo')[0];
const tabela = doc('tabela')[0].linhas!;
const ext = (n: string) => n.split('.').pop()!;
const soma = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const mb = soma(LAB_PASTA.arquivos.map((a) => a.mb));
const ssdMb = 256 * 1024;

/** Gabarito calculado a partir dos dados do laboratório (as missões só de múltipla escolha ficam de fora). */
const CALC: Record<string, () => string> = {
  info_02: () => ficha('Memória RAM').split(' ')[0],
  info_04: () => ficha('Sistema operacional').replace(' (64 bits)', ''),
  info_06: () => LAB_WEB.url.split('://')[0],
  info_07: () => LAB_EMAIL.assunto,
  info_10: () => intro.fonte!,
  info_12: () => doc('titulo')[0].alinhamento!,
  info_14: () => formatar(avaliarCelula(notas, 1, 1)),
  info_18: () => LAB_SLIDES.slides[0].titulo,
  info_19: () => String(LAB_SLIDES.slides.length),
  info_21: () => String(LAB_PASTA.arquivos.filter((a) => ext(a.nome) === 'jpg').length),
  info_22: () => [...LAB_PASTA.arquivos].sort((a, b) => b.mb - a.mb)[0].nome,
  info_24: () => String(ficha('Periféricos de entrada').split(',').length),
  info_25: () => new URL(LAB_WEB.url).hostname.replace(/^www\./, ''),
  info_26: () => String(LAB_EMAIL.para.length),
  info_28: () => String(LAB_NUVEM.arquivos.filter((a) => ['Proprietário', 'Editor'].includes(a.permissao)).length),
  info_29: () => intro.espacamento!,
  info_31: () => String(tabela.length),
  info_32: () => intro && doc('paragrafo').flatMap((b) => b.erros ?? [])[0],
  info_33: () => formatar(avaliarCelula(notas, 3, 3)),
  info_34: () => {
    const linhas = notas.slice(1);
    return linhas.reduce((m, l) => (Number(l[2]) > Number(m[2]) ? l : m))[0];
  },
  info_35: () => formatar(avaliarCelula(vendas, 3, 3)),
  info_36: () => formatar(avaliarFormula(notas, '=SOMA(B2:B9)')),
  info_37: () => LAB_SLIDES.slides[1].transicao,
  info_38: () => LAB_SLIDES.slides[2].layout,
  info_40: () => LAB_SLIDES.slides[3].animacao,
  info_41: () => String(mb),
  info_42: () => String(LAB_PASTA.arquivos.filter((a) => ['jpg', 'mp3', 'mp4'].includes(ext(a.nome))).length),
  info_43: () => String(Number(ficha('Memória RAM').split(' ')[0]) * 1024),
  info_44: () => String(ssdMb - mb),
  info_45: () => LAB_EMAIL.cco[0],
  info_46: () => new URL(LAB_WEB.url).searchParams.get('turma')!,
  info_47: () => String(soma(LAB_EMAIL.anexos.map((a) => a.mb))),
  info_48: () => String(LAB_NUVEM.arquivos.filter((a) => ['Leitor', 'Comentarista'].includes(a.permissao)).length),
  info_49: () => String(doc('titulo1').find((b) => b.texto === '3. Conclusão')!.pagina),
  info_50: () => intro.recuo!.replace(' cm', ''),
  info_51: () => String(soma(tabela.slice(1).map((l) => Number(l[2])))),
  info_52: () => String(doc('lista')[0].itens!.length + doc('lista')[0].pagina),
  info_53: () => formatar(avaliarFormula(notas, '=CONT.SE(E2:E9;"Aprovado")')),
  info_54: () => formatar(avaliarFormula(vendas, '=SOMA(D2:D6)')),
  info_55: () => formatar(avaliarFormula(notas, '=MEDIA(D2:D9)')),
  info_56: () => {
    const ord = notas.slice(1).map((_, i) => ({ nome: notas[i + 1][0], m: Number(avaliarCelula(notas, i + 1, 3)) })).sort((a, b) => b.m - a.m);
    return ord[2].nome;
  },
  info_57: () => String(LAB_SLIDES.slides.filter((s) => s.transicao !== 'Nenhuma').length),
  info_58: () => String(LAB_SLIDES.slides.findIndex((s) => s.animacao.startsWith('Saída')) + 1),
  info_59: () => LAB_SLIDES.mestre.rodape,
  info_60: () => String(LAB_SLIDES.slides.filter((s) => s.layout === 'Título e conteúdo' && s.animacao !== 'Nenhuma').length),
};

test('são 60 missões: 20 fáceis, 20 médias e 20 difíceis, com ids e tags únicos', () => {
  assert.equal(INFO_MISSIONS.length, 60);
  for (const p of ['info_facil', 'info_medio', 'info_dificil']) assert.equal(INFO_MISSIONS.filter((m) => m.package === p).length, 20, p);
  const all = [...ALL_MISSIONS, ...LINUX_MISSIONS, ...CONSOLE_MISSIONS, ...BD_MISSIONS, ...INFO_MISSIONS];
  assert.equal(new Set(all.map((m) => m.id)).size, all.length);
  assert.equal(new Set(all.map((m) => m.tag_id.toLowerCase())).size, all.length);
});

test('cada unidade da ementa tem 4 missões por nível (5 unidades x 4 x 3)', () => {
  const unidades = ['Hardware e Software', 'Internet e E-mail', 'Editor de Texto', 'Editor de Planilha', 'Slides'];
  for (const p of ['info_facil', 'info_medio', 'info_dificil'])
    for (const u of unidades) assert.equal(INFO_MISSIONS.filter((m) => m.package === p && m.location_suggestion.endsWith(u)).length, 4, `${p} ${u}`);
});

test('toda missão do Laboratório tem gabarito calculado a partir dos arquivos e aceito como resposta', () => {
  for (const m of INFO_MISSIONS) {
    const calc = CALC[m.tag_id];
    if (m.location_suggestion.startsWith('Laboratório')) assert.ok(calc, `${m.tag_id} deveria ter gabarito calculado`);
    if (!calc) continue;
    assert.equal(norm(calc()), norm(m.resposta_curta), `${m.tag_id}: ${m.pergunta}`);
  }
});

test('as de múltipla escolha têm a resposta entre as opções', () => {
  const mc = INFO_MISSIONS.filter((m) => m.opcoes);
  assert.ok(mc.length >= 15);
  for (const m of mc) {
    assert.ok(m.opcoes!.some((o) => norm(o) === norm(m.resposta_curta)), m.tag_id);
    assert.equal(new Set(m.opcoes!.map(norm)).size, m.opcoes!.length, `${m.tag_id}: opções repetidas`);
  }
});

test('alternativas incluem a resposta e a pergunta não entrega o gabarito', () => {
  for (const m of INFO_MISSIONS) {
    assert.ok((m.alternatives ?? []).some((a) => norm(a) === norm(m.resposta_curta)), m.tag_id);
    if (m.resposta_curta.length > 4 && !m.opcoes) assert.ok(!norm(m.pergunta).includes(norm(m.resposta_curta)), `${m.tag_id} vaza a resposta`);
  }
});

test('a mini planilha entende fórmulas em português', () => {
  assert.equal(formatar(avaliarFormula(notas, '=SOMA(B2:C3)')), '28');
  assert.equal(formatar(avaliarFormula(notas, '=MAIOR(B2:B9;2)')), '9');
  assert.equal(formatar(avaliarFormula(notas, '=SE(B2>5;"sim";"nao")')), 'sim');
  assert.equal(formatar(avaliarFormula(notas, '=CONT.VALORES(A2:A9)')), '8');
  assert.equal(formatar(avaliarFormula(notas, '=2+3*4')), '14');
  assert.equal(formatar(avaliarFormula(notas, '=SOMASE(E2:E9;"Aprovado";B2:B9)')), '42');
  assert.equal(formatar(avaliarFormula(notas, '=1/0')), '#ERRO!');
  assert.equal(formatar(avaliarFormula(notas, '=FOO(1)')), '#ERRO!');
  assert.equal(formatar(avaliarFormula(notas, '=SOMA(')), '#ERRO!');
});
