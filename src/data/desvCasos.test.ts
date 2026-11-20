import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import { DESV_CASOS, DesvCasoCodigo, DesvCasoLogica, DesvCasoSql } from './desvCasos';
import { EFEITOS_MAIS, LOGICA_MAIS, PROVA_MAIS, TABELA_SUSPEITOS_MAIS, PistaLogica } from './desvCasosMais.test-data';
import { CTF_APPS_SCRIPT } from './ctfAppsScript';
import { gabaritoAberto } from '../utils/gabaritoTeste';

type Ficha = Record<string, [string, string]>;
function perms<T>(xs: T[]): T[][] {
  if (xs.length <= 1) return [xs];
  return xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]));
}
// As pistas em texto do caso, traduzidas para regras (só no teste: o app não carrega a solução)
const REGRAS: Record<string, Array<(f: Ficha) => boolean>> = {
  c1: [
    (f) => f.Ana[1] === 'Escada',
    (f) => Object.values(f).every(([l, o]) => l !== 'Biblioteca' || o === 'Crachá clonado'),
    (f) => f.Bruno[0] !== 'Laboratório' && f.Bruno[0] !== 'Biblioteca',
    (f) => f.Caio[1] !== 'Chave reserva',
  ],
  c2: [
    (f) => Object.values(f).every(([l, o]) => l !== 'Cantina' || o === 'Celular'),
    (f) => f.Elisa[1] === 'Notebook',
    (f) => f['Fábio'][0] === 'Auditório' || f['Fábio'][0] === 'Cantina',
    (f) => f.Diego[1] !== 'Cabo de rede' && f.Diego[1] !== 'Pendrive',
    (f) => Object.values(f).every(([l, o]) => o !== 'Notebook' || (l !== 'Sala de Redes' && l !== 'Auditório')),
    (f) => Object.values(f).every(([l, o]) => l !== 'Auditório' || o !== 'Pendrive'),
  ],
  c13: [
    (f) => Object.values(f).every(([l, o]) => l !== 'Biblioteca' || o === 'Mochila'),
    (f) => f.Iara[1] === 'Fone de ouvido',
    (f) => f.Hugo[1] === 'Mochila',
    (f) => Object.values(f).every(([l, o]) => l !== 'Pátio' || o === 'Fone de ouvido'),
    (f) => Object.values(f).every(([l, o]) => o !== 'Guarda-chuva' || l !== 'Cantina'),
    (f) => f.Jonas[0] !== 'Laboratório',
  ],
  c14: [
    (f) => f.Nando[1] === 'Chave mestra',
    (f) => f.Marta[0] !== 'Quadra',
    (f) => f['Olívia'][0] === 'Pátio' || f['Olívia'][0] === 'Secretaria',
    (f) => f.Paulo[1] === 'Grampeador',
    (f) => Object.values(f).every(([l, o]) => l !== 'Secretaria' || o === 'Pasta azul'),
    (f) => Object.values(f).every(([l, o]) => o !== 'Grampeador' || l !== 'Copiadora'),
    (f) => Object.values(f).every(([l, o]) => l !== 'Quadra' || o === 'Garrafa térmica'),
    (f) => f.Nando[0] === 'Sala de Provas' || f.Nando[0] === 'Secretaria',
  ],
};
const LOCAL_DO_CRIME: Record<string, string> = { c1: 'Laboratório', c2: 'Sala de Redes', c13: 'Laboratório', c14: 'Sala de Provas' };
// Casos c17 a c60 (lógica): as pistas vêm como dados e viram regras aqui
function regraDe(p: PistaLogica): (f: Ficha) => boolean {
  const [t, a, b, c] = p;
  switch (t) {
    case 'pos': return (f) => f[a][1] === b;
    case 'negobj': return (f) => f[a][1] !== b;
    case 'negloc': return (f) => f[a][0] !== b;
    case 'lo': return (f) => Object.values(f).every(([l, o]) => l !== a || o === b);
    case 'onotl': return (f) => Object.values(f).every(([l, o]) => o !== a || l !== b);
    case 'or': return (f) => f[a][0] === b || f[a][0] === c;
    default: throw new Error(`pista desconhecida: ${t}`);
  }
}
for (const [id, d] of Object.entries(LOGICA_MAIS)) { REGRAS[id] = d.clues.map(regraDe); LOCAL_DO_CRIME[id] = d.crime; }
// Consulta que prova o culpado em cada caso de SQL
const PROVA: Record<string, string> = {
  c3: `SELECT s.id FROM catraca c JOIN suspeitos s ON s.id = c.id_suspeito
       WHERE c.sala = 'Laboratório 2' AND c.entrada <= '14:25' AND c.saida >= '14:15'
         AND s.cor_mochila = 'vermelha' AND s.altura_cm > 175`,
  c4: `SELECT u.id FROM alteracoes a JOIN sessoes s ON s.ip = a.ip AND a.horario BETWEEN s.inicio AND s.fim
       JOIN usuarios u ON u.id = s.id_usuario
       WHERE a.comando LIKE '%placar%' AND a.horario > '18:00'`,
  c15: `SELECT u.id FROM usuarios u JOIN acessos a ON a.id_usuario = u.id
        JOIN permissoes p ON p.id_usuario = u.id AND p.area = 'Obras Raras'
        WHERE a.porta = 'lateral' AND a.entrada < '17:00' AND a.saida > '16:00'`,
  c16: `SELECT f.id FROM funcionarios f JOIN turnos t ON t.id_func = f.id
        JOIN estornos e ON e.dia = t.dia AND e.horario BETWEEN t.inicio AND t.fim
        WHERE e.nota_fiscal IS NULL
        GROUP BY f.id HAVING COUNT(DISTINCT e.id) = (SELECT COUNT(*) FROM estornos WHERE nota_fiscal IS NULL)`,
};
const TABELA_SUSPEITOS: Record<string, string> = { c3: 'suspeitos', c4: 'usuarios', c15: 'usuarios', c16: 'funcionarios', ...TABELA_SUSPEITOS_MAIS };
Object.assign(PROVA, PROVA_MAIS);

// O culpado de cada caso vem do gabarito criptografado (o servidor usa a aba DesvGabarito, com os mesmos dados)
function gabarito(caso: string): number {
  const g = gabaritoAberto().desv?.[caso];
  assert.ok(g, `gabarito de ${caso}`);
  return g!.suspeito;
}

test('cada caso de lógica tem exatamente uma solução, e ela bate com o gabarito do servidor', () => {
  for (const c of DESV_CASOS.filter((x): x is DesvCasoLogica => x.tipo === 'logica')) {
    const nomes = c.suspeitos.map((s) => s.nome);
    const sols: Ficha[] = [];
    for (const l of perms(c.locais)) for (const o of perms(c.objetos)) {
      const f: Ficha = Object.fromEntries(nomes.map((n, i) => [n, [l[i], o[i]]]));
      if (REGRAS[c.id].every((r) => r(f))) sols.push(f);
    }
    assert.equal(sols.length, 1, `${c.id} tem ${sols.length} soluções`);
    assert.equal(REGRAS[c.id].length, c.pistas.length, `${c.id}: pistas e regras divergem`);
    const culpado = nomes.find((n) => sols[0][n][0] === LOCAL_DO_CRIME[c.id])!;
    assert.equal(c.suspeitos.find((s) => s.nome === culpado)!.id, gabarito(c.id));
  }
});

test('cada caso de SQL aponta um único culpado no banco do caso, igual ao gabarito do servidor', async () => {
  const SQL = await initSqlJs();
  for (const c of DESV_CASOS.filter((x): x is DesvCasoSql => x.tipo === 'sql')) {
    const db = new SQL.Database();
    db.exec(c.seed);
    const r = db.exec(PROVA[c.id]);
    const ids = r.length ? r[0].values.map((v) => Number(v[0])) : [];
    assert.deepEqual(ids, [gabarito(c.id)], `${c.id}: prova deu ${JSON.stringify(ids)}`);
    assert.ok(c.suspeitos.length >= 6, `${c.id}: poucos suspeitos`);
    const nomes = db.exec(`SELECT nome FROM ${TABELA_SUSPEITOS[c.id]} ORDER BY id`)[0].values.map((v) => String(v[0]));
    assert.deepEqual(nomes, c.suspeitos.map((s) => s.nome));
  }
});

test('o app não carrega o gabarito', () => {
  const texto = JSON.stringify(DESV_CASOS);
  assert.doesNotMatch(texto, /culpad[oa]\s*[:=]/i);
});

// Construção de Sites: o efeito de cada trecho, conferido à mão (id > classe > elemento; empate: vale a última regra;
// content-box soma padding e borda). Cada linha: o que cada pista afirma, na ordem das pistas.
const EFEITOS: Record<string, Record<string, boolean[]>> = {
  //        pdf    mesma aba  sem alt
  c5: { Ana: [true, false, false], Bruno: [false, true, true], Caio: [true, true, false], Duda: [true, true, true], Enzo: [true, false, true], 'Fábia': [false, true, true] },
  //        sem validação  apaga  rótulo não foca
  c6: { Gael: [false, false, false], 'Heloísa': [true, true, false], Igor: [true, true, true], 'Júlia': [true, true, false], Luan: [false, true, true], Maya: [true, false, true] },
  //        branco no branco  texto branco pelo id
  c7: { Nina: [false, false], Otto: [true, true], Pietra: [true, false], Quim: [false, false], Rosa: [false, true], Saulo: [false, true], 'Tainá': [false, false], Uriel: [false, false] },
  //        mesma linha  total 300  conteúdo 260
  //        8 GB RAM  SSD  livre
  c9: { Ana: [true, false, true], Bruno: [false, true, false], Caio: [true, true, false], Duda: [true, true, true], Enzo: [false, true, true], 'Fábia': [false, true, true] },
  //        prova.pdf  vê destinatários  turma como cópia
  c10: { Gael: [true, false, false], 'Heloísa': [true, true, false], Igor: [true, true, true], 'Júlia': [false, true, true], Luan: [false, true, true], Maya: [true, false, false] },
  //        fonte/espaço ABNT  margens ABNT  só o alinhamento errado
  c11: { Vera: [true, true, false], Wagner: [true, true, true], Xavier: [false, true, true], Yasmin: [true, true, false], Zeca: [true, false, true], Alice: [false, true, true], 'Benício': [true, false, true], 'Cecília': [false, true, false] },
  //        > 10  três notas  decimal   (valores: 8; 17,33; 8; 24; 11; 9; 19; 10)
  c12: { Nina: [false, true, false], Otto: [true, true, true], Pietra: [false, true, false], Quim: [true, true, false], Rosa: [true, false, false], Saulo: [false, false, false], 'Tainá': [true, true, false], Uriel: [false, true, false] },
  ...EFEITOS_MAIS,
  c8: { Vera: [true, false, false], Wagner: [true, true, true], Xavier: [false, true, true], Yasmin: [false, true, false], Zeca: [true, true, false], Alice: [true, true, false], 'Benício': [false, true, true], 'Cecília': [false, true, true] },
};

test('cada caso de evidências (Sites, Informática, Redes e Segurança) tem um só trecho que satisfaz todas as pistas, igual ao gabarito do servidor', () => {
  const casos = DESV_CASOS.filter((x): x is DesvCasoCodigo => x.tipo === 'codigo');
  assert.equal(casos.length, 30);
  for (const c of casos) {
    const ef = EFEITOS[c.id];
    assert.deepEqual(Object.keys(ef).sort(), c.suspeitos.map((s) => s.nome).sort(), `${c.id}: suspeitos`);
    for (const v of Object.values(ef)) assert.equal(v.length, c.pistas.length, `${c.id}: pistas`);
    assert.ok(c.suspeitos.every((s) => s.codigo), `${c.id}: falta código`);
    const culpados = c.suspeitos.filter((s) => ef[s.nome].every(Boolean));
    assert.equal(culpados.length, 1, `${c.id}: ${culpados.length} culpados`);
    assert.equal(culpados[0].id, gabarito(c.id));
  }
});

test('o código público não traz o culpado nem a explicação de nenhum caso', () => {
  const desv = gabaritoAberto().desv!;
  assert.equal(Object.keys(desv).length, DESV_CASOS.length);
  for (const [caso, g] of Object.entries(desv)) {
    assert.ok(!CTF_APPS_SCRIPT.includes(g.explicacao.slice(0, 40)), `${caso}: explicação no script`);
    assert.ok(!JSON.stringify(DESV_CASOS).includes(g.explicacao.slice(0, 40)), `${caso}: explicação no app`);
  }
  assert.doesNotMatch(CTF_APPS_SCRIPT, /DESV_GABARITO|desv:c\d/);
});

test('são 6 disciplinas com 10 casos cada, ids c1 a c60 sem repetição', () => {
  const por = new Map<string, number>();
  for (const c of DESV_CASOS) por.set(c.disciplina, (por.get(c.disciplina) ?? 0) + 1);
  assert.equal(por.size, 6);
  for (const [d, n] of por) assert.equal(n, 10, `${d}: ${n} casos`);
  assert.deepEqual(DESV_CASOS.map((c) => c.id).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))), Array.from({ length: 60 }, (_, i) => `c${i + 1}`));
});
