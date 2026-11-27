import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resumoPainel } from './painelAoVivo';

const al = (nome: string, o: any = {}) => ({ nome, fase_atual: 1, xp: 0, acertos: 0, erros: 0, fogos: 0, ultimo_acerto: '' as const, ...o });

test('separa ativos, parados e quem mais errou', () => {
  const agora = 1_000_000_000;
  const r = resumoPainel({ sala: {} as any, agora, alunos: [
    al('A', { entrou_em: agora - 30_000 }),
    al('B', { entrou_em: agora - 600_000, ultimo_acerto: agora - 5 * 60_000, erros: 4 }),
    al('C', { entrou_em: agora - 900_000, ultimo_erro: agora - 20_000, erros: 9 }),
  ] });
  assert.equal(r.ativos, 2);
  assert.deepEqual(r.parados, [{ nome: 'B', minutos: 5 }]);
  assert.deepEqual(r.maisErros.map((x) => x.nome), ['C', 'B']);
  assert.ok(r.disponivel);
});

test('servidor antigo: sem horários, painel indisponível', () => {
  const r = resumoPainel({ sala: {} as any, alunos: [al('A')] });
  assert.equal(r.disponivel, false);
  assert.equal(r.parados.length, 0);
});
