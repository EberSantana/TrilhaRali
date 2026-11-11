import test from 'node:test';
import assert from 'node:assert/strict';
import { clampMinutes, crossedAlert, DURATIONS, elapsedFraction, formatClock, remainingSeconds, timerPhase, TimerInfo } from './timer.ts';

const t = (p: Partial<TimerInfo>): TimerInfo => ({ duracaoMin: 60, fimEm: 0, restanteS: 3600, rodando: false, esgotado: false, ...p });

test('durações vão de 5 a 120 minutos em passos de 5', () => {
  assert.equal(DURATIONS.length, 24);
  assert.deepEqual([DURATIONS[0], DURATIONS[23]], [5, 120]);
  assert.deepEqual([clampMinutes(1), clampMinutes(7), clampMinutes(8), clampMinutes(121), clampMinutes(NaN)], [5, 5, 10, 120, 5]);
});

test('tempo restante usa o fim do servidor e corrige o relógio do aparelho', () => {
  const server = 1_000_000;
  const rodando = t({ fimEm: server + 90_000, rodando: true });
  assert.equal(remainingSeconds(rodando, 0, server), 90);
  // aparelho 10 min adiantado: skew = local - servidor
  assert.equal(remainingSeconds(rodando, 600_000, server + 600_000 + 30_000), 60);
  assert.equal(remainingSeconds(rodando, 0, server + 200_000), 0);
  assert.equal(remainingSeconds(t({ restanteS: 510 }), 0, server), 510);
  assert.equal(remainingSeconds(null, 0, server), 0);
});

test('fases do relógio: parado, normal, aviso (5 min), crítico (1 min) e fim', () => {
  const run = t({ fimEm: 1, rodando: true });
  assert.equal(timerPhase(null, 0), 'parado');
  assert.equal(timerPhase(t({}), 3600), 'parado');
  assert.equal(timerPhase(run, 301), 'normal');
  assert.equal(timerPhase(run, 300), 'aviso');
  assert.equal(timerPhase(run, 60), 'critico');
  assert.equal(timerPhase(run, 0), 'fim');
  assert.equal(timerPhase(t({ restanteS: 0 }), 0), 'fim');
});

test('formato, progresso e alertas', () => {
  assert.deepEqual([formatClock(0), formatClock(65), formatClock(7200)], ['00:00', '01:05', '120:00']);
  assert.equal(elapsedFraction(t({}), 1800), 0.5);
  assert.equal(elapsedFraction(t({}), 4000), 0); // tempo extra além da duração
  assert.deepEqual(
    [crossedAlert(301, 300), crossedAlert(300, 299), crossedAlert(61, 60), crossedAlert(1, 0), crossedAlert(0, 0), crossedAlert(400, 30)],
    ['aviso', null, 'critico', 'fim', null, 'critico']
  );
});
