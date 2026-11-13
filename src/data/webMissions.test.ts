import test from 'node:test';
import assert from 'node:assert/strict';
import { WEB_MISSIONS } from './webMissions';
import { ALL_MISSIONS } from './missions';
import { LINUX_MISSIONS } from './linuxMissions';
import { BD_MISSIONS } from './bdMissions';
import { INFO_MISSIONS } from './infoMissions';
import { CONSOLE_MISSIONS } from './consoleMissions';
import { SITE_CSS, SITE_HTML, montarDocumento } from './webLab';

// Mesma normalização do servidor (Apps Script) e do app
const norm = (s: string) =>
  String(s).toLowerCase().trim().replace(/^["']|["']$/g, '').replace(/;+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

const H = SITE_HTML;
const conta = (re: RegExp, s = H) => (s.match(re) || []).length;
/** Trecho do HTML entre a abertura e o fechamento de uma tag (primeira ocorrência). */
const bloco = (abre: RegExp, fecha: string, s = H) => {
  const i = s.search(abre);
  return s.slice(i, s.indexOf(fecha, i) + fecha.length);
};
/** Valor de uma propriedade numa regra do estilo.css (busca pelo seletor exato). */
const css = (sel: string, prop: string) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\#]/g, '\\$&');
  const m = new RegExp(`(^|\\n)${esc} \\{([^}]*)\\}`).exec(SITE_CSS);
  assert.ok(m, `regra ${sel} não existe`);
  const d = new RegExp(`(^|\\s)${prop}:\\s*([^;]+);`).exec(m![2]);
  assert.ok(d, `${sel} não tem ${prop}`);
  return d![2].trim();
};
const px = (v: string) => Number(v.replace('px', ''));
const attr = (tag: RegExp, nome: string) => new RegExp(`${nome}="([^"]*)"`).exec(H.match(tag)![0])![1];
const nav = bloco(/<nav/, '</nav>');
const ol = bloco(/<ol>/, '</ol>');
const tbody = bloco(/<tbody>/, '</tbody>');
const precos = [...tbody.matchAll(/<td>(\d+)<\/td>/g)].map((m) => Number(m[1]));
const soma = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const raiz = 16;
const decimal = (v: string) => v.replace('s', '').replace('.', ',');
const card = { w: px(css('.card', 'width')), pad: px(css('.card', 'padding')), borda: px(css('.card', 'border').split(' ')[0]) };

const CALC: Record<string, () => string> = {
  web_02: () => String(conta(/<li>/g, ol)),
  web_04: () => attr(/<img[^>]*>/, 'alt'),
  web_06: () => /<caption>([^<]*)<\/caption>/.exec(H)![1],
  web_08: () => /<button[^>]*>([^<]*)<\/button>/.exec(H)![1],
  web_10: () => attr(/<header[^>]*>/, 'id'),
  web_12: () => css('body', 'background-color'),
  web_13: () => css('.dica', 'float'),
  web_14: () => css('body', 'font-family').split(',')[0],
  web_16: () => css('.destaque', 'text-align'),
  web_18: () => css('body', 'font-size'),
  web_21: () => String(conta(/<a /g, nav)),
  web_22: () => /<a href="([^"]+)">Preços<\/a>/.exec(H)![1],
  web_23: () => String(conta(/<tr>/g, tbody)),
  web_24: () => String(conta(/<option>/g)),
  web_25: () => attr(/<input[^>]*id="email"[^>]*>/, 'type'),
  web_26: () => /<legend>([^<]*)<\/legend>/.exec(H)![1],
  web_27: () => /<dt>([^<]*)<\/dt>\s*<dd>Café forte extraído sob pressão\.<\/dd>/.exec(H)![1],
  web_28: () => String(conta(/<section/g)),
  web_29: () => '<' + /<(\w+)[^>]*>[^<]*sem açúcar/.exec(H)![1] + '>',
  web_30: () => `target="${attr(/<a [^>]*IFS[^>]*>/, 'target')}"`,
  web_31: () => css('.menu a:hover', 'color'),
  web_32: () => css('.menu ul', 'justify-content'),
  web_33: () => /^([\w-]+)\(/.exec(css('header', 'background-image'))![1],
  web_34: () => decimal(css('.menu a', 'transition').split(' ')[1]),
  web_35: () => css('h1', 'text-transform'),
  web_36: () => decimal(css('.dica', 'opacity')),
  web_37: () => css('header', 'z-index'),
  web_38: () => css('h2, h3', 'color'),
  web_39: () => 'Descendente',
  web_40: () => css('fieldset', 'flex-direction'),
  web_41: () => String(soma(precos)),
  web_42: () => String(soma(precos) - Number(/<tfoot>[\s\S]*?<td>(\d+)<\/td>/.exec(H)![1])),
  web_43: () => String(conta(/<label for="/g)),
  web_44: () => attr(/<input[^>]*required[^>]*>/, 'id'),
  web_45: () => String(conta(/<source /g)),
  web_46: () => attr(/<audio[\s\S]*?<source[^>]*>/, 'type'),
  web_47: () => String(conta(/<li>/g)),
  web_48: () => String(conta(/ id="/g)),
  web_49: () => String(attr(/<p class="promo[^>]*>/, 'class').split(' ').length),
  web_50: () => attr(/<html[^>]*>/, 'lang'),
  web_51: () => (css('*', 'box-sizing') === 'border-box' ? String(card.w) : 'erro'),
  web_52: () => String(card.w + 2 * card.pad + 2 * card.borda),
  web_53: () => String(card.w - 2 * card.pad - 2 * card.borda),
  web_54: () => /\.promo \{ color: (#\w+); \}/.exec(H)![1],
  web_56: () => String(Number(css('h1', 'font-size').replace('rem', '')) * raiz),
  web_57: () => String(px(css('body', 'font-size')) * Number(css('body', 'line-height'))),
  web_58: () => String(Number(css('.dica', 'padding').replace('em', '')) * px(css('body', 'font-size'))),
  web_59: () => css('footer', 'overflow'),
  web_60: () => css('header', 'position'),
};

test('são 60 missões: 20 fáceis, 20 médias e 20 difíceis, com ids e tags únicos', () => {
  assert.equal(WEB_MISSIONS.length, 60);
  for (const p of ['web_facil', 'web_medio', 'web_dificil']) assert.equal(WEB_MISSIONS.filter((m) => m.package === p).length, 20, p);
  const all = [...ALL_MISSIONS, ...LINUX_MISSIONS, ...CONSOLE_MISSIONS, ...BD_MISSIONS, ...INFO_MISSIONS, ...WEB_MISSIONS];
  assert.equal(new Set(all.map((m) => m.id)).size, all.length);
  assert.equal(new Set(all.map((m) => m.tag_id.toLowerCase())).size, all.length);
});

test('cada nível tem 10 de HTML e 10 de CSS e cobre todos os temas do dicionário', () => {
  for (const p of ['web_facil', 'web_medio', 'web_dificil'])
    for (const c of ['HTML', 'CSS']) assert.equal(WEB_MISSIONS.filter((m) => m.package === p && m.category === c).length, 10, `${p} ${c}`);
  const temas = new Set(WEB_MISSIONS.map((m) => m.location_suggestion.split(' · ')[1]));
  for (const t of ['HTML: Listas', 'HTML: Links e mídia', 'HTML: Tabelas', 'HTML: Formulários', 'HTML: Estrutura semântica', 'HTML: Atributos',
    'CSS: Como aplicar o CSS', 'CSS: Seletores', 'CSS: Cor e fundo', 'CSS: Texto e fonte', 'CSS: Modelo de caixa',
    'CSS: Exibição e posicionamento', 'CSS: Flexbox', 'CSS: Efeitos, unidades e cores'])
    assert.ok(temas.has(t), `falta ${t}`);
});

test('toda missão do Ateliê Web tem gabarito calculado a partir do código do site', () => {
  for (const m of WEB_MISSIONS) {
    const calc = CALC[m.tag_id];
    if (m.location_suggestion.startsWith('Ateliê Web') && !m.opcoes) assert.ok(calc, `${m.tag_id} deveria ter gabarito calculado`);
    if (!calc) continue;
    assert.equal(norm(calc()), norm(m.resposta_curta), `${m.tag_id}: ${m.pergunta}`);
  }
});

test('múltipla escolha: resposta entre as opções, sem opções repetidas', () => {
  for (const m of WEB_MISSIONS.filter((x) => x.opcoes)) {
    assert.ok(m.opcoes!.some((o) => norm(o) === norm(m.resposta_curta)), m.tag_id);
    assert.equal(new Set(m.opcoes!.map(norm)).size, m.opcoes!.length, m.tag_id);
  }
});

test('alternativas incluem a resposta e a pergunta aberta não entrega o gabarito', () => {
  for (const m of WEB_MISSIONS) {
    assert.ok((m.alternatives ?? []).some((a) => norm(a) === norm(m.resposta_curta)), m.tag_id);
    if (!m.opcoes && m.resposta_curta.length > 3) assert.ok(!norm(m.pergunta).includes(norm(m.resposta_curta)), `${m.tag_id} vaza a resposta`);
  }
});

test('a pré-visualização troca o <link> do estilo.css pelo CSS e aceita fragmentos', () => {
  const doc = montarDocumento(SITE_HTML, 'body{color:red}');
  assert.ok(!doc.includes('href="estilo.css"'));
  assert.ok(doc.includes('<style>\nbody{color:red}\n</style>'));
  assert.ok(doc.includes('.promo { color: #c0392b; }'));
  assert.ok(doc.includes('data-src="mapa.html" srcdoc="') && !doc.includes(' src="mapa.html"'));
  const frag = montarDocumento('<p>oi</p>', 'p{}');
  assert.ok(frag.startsWith('<!DOCTYPE html>') && frag.includes('<body><p>oi</p></body>'));
});
