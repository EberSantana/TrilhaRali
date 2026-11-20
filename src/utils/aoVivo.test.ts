import test from 'node:test';
import assert from 'node:assert/strict';
import { placar, precisamAjuda } from './aoVivo';

const a = (nome: string, acertos: number, erros: number, minAtras: number | null) => ({
  nome, fase_atual: acertos + 1, xp: acertos * 10, acertos, erros, fogos: 0,
  ultimo_acerto: minAtras === null ? ('' as const) : 1_000_000_000 - minAtras * 60_000,
});
const agora = 1_000_000_000;

test('quem precisa de ajuda: sem acerto, muitos erros e parado; quem terminou não entra', () => {
  const r = Object.fromEntries(precisamAjuda([a('Ana', 0, 3, null), a('Bia', 1, 4, 1), a('Caio', 2, 0, 12), a('Duda', 5, 1, 20), a('Eva', 2, 1, 2)], 5, agora).map((x) => [x.aluno.nome, x.motivos]));
  assert.deepEqual(r['Ana'], ['sem_acerto']);
  assert.deepEqual(r['Bia'], ['muitos_erros']);
  assert.deepEqual(r['Caio'], ['parado']);
  assert.equal(r['Duda'], undefined);
  assert.equal(r['Eva'], undefined);
});

test('placar: jogando, acertos, taxa e quantos terminaram', () => {
  assert.deepEqual(placar([a('Ana', 5, 0, 1), a('Bia', 1, 3, 1)], 5), { jogando: 2, acertos: 6, taxa: 67, terminaram: 1 });
  assert.equal(placar([], 5).taxa, null);
});
