import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bestReserve, purposeScores, reach } from '../src/purposes.mjs';

const body = (name, type, subtype, extra = {}) => ({ name, type, subtype, distance_to_arrival: 100, ...extra });
const bio = [{ type: 'Tussock', value: 1766600 }];
const geo = [{ type: 'Geyser', value: 0 }];

test('Rocky ice world: raffineria e industria; Water world: fattoria', () => {
  const { scores, best } = purposeScores([body('A', 'Star', 'K (Yellow-Orange) Star'), body('A 1', 'Planet', 'Rocky Ice world'), body('A 2', 'Planet', 'Water world')]);
  assert.equal(scores.refinery.score, 4);
  assert.equal(scores.industrial.score, 3);
  assert.equal(scores.agriculture.score, 5);
  assert.equal(best, 'agriculture');
  assert.deepEqual(scores.agriculture.bodies, ['A 2']);
});

test('organici e geologici insieme rovinano la raffineria; organici da soli fanno una fattoria su un roccioso', () => {
  assert.equal(purposeScores([body('A 1', 'Planet', 'Rocky body', { landmarks: [...bio, ...geo] })]).scores.refinery.score, 0);
  const { scores } = purposeScores([body('A 1', 'Planet', 'Rocky body', { landmarks: bio })]);
  assert.equal(scores.refinery.score, 3);
  assert.equal(scores.agriculture.score, 3);
});

test('anelli ed estrazione, con il bonus della riserva Pristine', () => {
  const ringed = [{ name: 'A 1', reserve_level: 'Pristine' }];
  const { scores, reserve } = purposeScores([body('A 1', 'Planet', 'High metal content world')], ringed);
  assert.equal(reserve, 'Pristine');
  assert.equal(scores.extraction.score, 2 + 2 + 2);
  assert.equal(bestReserve([{ reserve_level: 'Major' }, { reserve_level: 'Pristine' }]), 'Pristine');
});

test('i corpi lontani valgono la metà, troppo lontani niente; lo stesso tipo conta al massimo tre volte', () => {
  assert.equal(reach({ distance_to_arrival: 30_000 }), 0.5);
  assert.equal(reach({ distance_to_arrival: 150_000 }), 0);
  const far = purposeScores([body('A 1', 'Planet', 'Water world', { distance_to_arrival: 50_000 })]);
  assert.equal(far.scores.agriculture.score, 2.5);
  const icy = purposeScores(Array.from({ length: 6 }, (_, i) => body(`A ${i}`, 'Planet', 'Icy body')));
  assert.equal(icy.scores.industrial.score, 3);
});

test('stelle degeneri: high tech e turismo', () => {
  const { scores } = purposeScores([body('A', 'Star', 'Neutron Star')]);
  assert.equal(scores.hightech.score, 3);
  assert.equal(scores.tourism.score, 3);
});

test('le stazioni a terra fra i landmark non sono geologia', async () => {
  const { interestingBodies } = await import('../src/bodies.mjs');
  const found = interestingBodies([
    body('A 1', 'Planet', 'Icy body', { landmarks: [{ type: 'Surface Station', subtype: 'Settlement', value: 0 }] }),
    body('A 2', 'Planet', 'Icy body', { landmarks: [{ type: 'Geyser', subtype: 'Water Ice Geyser', value: 0 }] }),
    body('A 3', 'Planet', 'Rocky body', { landmarks: [{ type: 'Tussock', subtype: 'Tussock Cultro', value: 1766600 }] }),
  ]);
  assert.deepEqual(found.map(b => [b.name, b.geology, b.biology]), [
    ['A 2', ['Water Ice Geyser'], []],
    ['A 3', [], [{ genus: 'Tussock', species: 'Tussock Cultro' }]],
  ]);
});
