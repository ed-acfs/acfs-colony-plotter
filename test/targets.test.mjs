import assert from 'node:assert/strict';
import { test } from 'node:test';
import { anchorsFrom, factionSplit, isContactStation } from '../src/anchors.mjs';
import { reasonsFor, scoreOf } from '../src/interesting.mjs';
import { buildTargets, colonisationStatus } from '../src/targets.mjs';

const FS = 'Flotta Stellare';
const star = (name, subtype = 'K (Yellow-Orange) Star') => ({ name, type: 'Star', subtype });
const planet = (name, subtype, extra = {}) => ({ name, type: 'Planet', subtype, ...extra });

test('i motivi: Earth-like, Water world, più stelle, biologia, dal più pesante', () => {
  const reasons = reasonsFor([
    star('A'),
    star('B', 'Neutron Star'),
    planet('A 1', 'Water world'),
    planet('A 2', 'Earth-like world'),
    planet('A 3', 'High metal content world', { landmarks: [{ subtype: 'Tussock Cultro', value: 1766600 }] }),
    planet('A 4', 'Icy body', { landmarks: [{ subtype: 'Water Ice Geyser', value: 0 }] }),
  ]);
  assert.deepEqual(reasons.map(r => r.key), ['earthLike', 'waterWorld', 'rareStar', 'multipleStars', 'biology']);
  assert.deepEqual(reasons.find(r => r.key === 'multipleStars').bodies, ['A', 'B']);
  assert.equal(scoreOf(reasons), 10 + 6 + 3 + 2 + 2);
});

test('una stella sola e niente di raro: nessun motivo, salvo i molti corpi', () => {
  assert.deepEqual(reasonsFor([star('A'), planet('A 1', 'Icy body')]), []);
  assert.deepEqual(reasonsFor([star('A')], 41).map(r => r.key), ['manyBodies']);
});

test('punti di partenza: solo i sistemi con una nostra stazione vera, non cantieri o navi', () => {
  assert.equal(isContactStation({ name: 'Orbital Construction Site: X', type: 'Space Construction Depot' }), false);
  assert.equal(isContactStation({ name: 'System Colonisation Ship', type: 'Planetary Outpost' }), false);
  assert.equal(isContactStation({ name: 'Biggle Port', type: 'Coriolis Starport' }), true);
  assert.equal(isContactStation({ name: 'Burroughs Settlement', type: 'Settlement' }), false);
  assert.equal(isContactStation({ name: 'Lamarck Arsenal', type: null }), false);
  const anchors = anchorsFrom([
    { name: 'Nostro', id64: 1, x: 0, y: 0, z: 0, controlling_minor_faction: FS,
      minor_faction_presences: [{ name: FS, influence: 0.6 }, { name: 'Altri', influence: 0.3 }],
      assets: [{ name: 'Porto', type: 'Outpost', controlling_minor_faction: FS }] },
    { name: 'Solo cantiere', id64: 2, x: 1, y: 0, z: 0,
      assets: [{ name: 'Orbital Construction Site: Y', type: 'Space Construction Depot', controlling_minor_faction: FS }] },
  ], FS);
  assert.deepEqual(anchors.map(a => a.name), ['Nostro']);
  assert.deepEqual(factionSplit(anchors[0], FS).map(f => [f.share, f.faction]), [[60, FS], [20, 'Altri'], [13, null], [6, null]]);
});

test('il 20% va a chi controlla il sistema se non è la fazione della stazione', () => {
  const anchor = { controllingFaction: 'Civitas Dei', factions: [{ name: 'Civitas Dei', influence: 0.5 }, { name: FS, influence: 0.4 }] };
  assert.equal(factionSplit(anchor, FS)[1].faction, 'Civitas Dei');
});

test('stato della colonizzazione', () => {
  assert.equal(colonisationStatus({ population: 0 }), 'free');
  assert.equal(colonisationStatus({ population: 0, is_colonised: true, is_being_colonised: true }), 'claimed');
  assert.equal(colonisationStatus({ population: 70000, is_colonised: true }), 'colonised');
  assert.equal(colonisationStatus({ population: 132659, is_colonised: false }), 'populated');
});

test('obiettivi: uniti fra più punti di partenza, abitati esclusi, dal punteggio più alto', () => {
  const anchors = [
    { name: 'Uno', id64: '1', x: 0, y: 0, z: 0, controllingFaction: FS, factions: [{ name: FS, influence: 1 }], stations: [{ name: 'P1', type: 'Outpost' }] },
    { name: 'Due', id64: '2', x: 10, y: 0, z: 0, controllingFaction: FS, factions: [{ name: FS, influence: 1 }], stations: [{ name: 'P2', type: 'Outpost' }] },
  ];
  const sys = (id64, name, x, bodies, extra = {}) => ({ id64, name, x, y: 0, z: 0, population: 0, body_count: bodies.length, bodies, ...extra });
  const found = [
    [sys(10, 'Acqua', 6, [star('a'), planet('a1', 'Water world')]), sys(11, 'Vuoto', 3, [star('b')]), sys(12, 'Città', 2, [star('c')], { population: 5000 })],
    [sys(10, 'Acqua', 6, [star('a'), planet('a1', 'Water world')]), sys(13, 'Terra', 20, [star('d'), planet('d1', 'Earth-like world')])],
  ];
  const targets = buildTargets(anchors, found, FS);
  assert.deepEqual(targets.map(t => t.name), ['Terra', 'Acqua', 'Vuoto']);
  const acqua = targets.find(t => t.name === 'Acqua');
  assert.deepEqual(acqua.from.map(f => [f.name, f.distance]), [['Due', 4], ['Uno', 6]]);
  assert.equal(targets.find(t => t.name === 'Terra').from[0].name, 'Due');
});

test('anelli: per le RES, molti anelli da tre corpi in su, con riserva e hotspot', () => {
  const anchors = [{ name: 'Uno', id64: '1', x: 0, y: 0, z: 0, controllingFaction: FS, factions: [{ name: FS, influence: 1 }], stations: [] }];
  const sys = (id64, name, x) => ({ id64, name, x, y: 0, z: 0, population: 0, body_count: 1, bodies: [star(`${name} A`)] });
  const ring = (system_id64, name, type, signals) => ({ system_id64, name, subtype: 'Class I gas giant', reserve_level: 'Pristine', rings: [{ type, signals }] });
  const targets = buildTargets(anchors, [[sys(10, 'Anelli', 5), sys(11, 'Pochi', 6)]], FS, {
    ringed: [ring(10, 'Anelli 1', 'Icy', [{ name: 'Void Opal', count: 1 }]), ring(10, 'Anelli 2', 'Metal Rich'), ring(10, 'Anelli 3', 'Icy'), ring(11, 'Pochi 1', 'Rocky')],
  });
  assert.deepEqual(targets.map(t => [t.name, t.reasons.map(r => r.key)]), [['Anelli', ['manyRings']], ['Pochi', ['rings']]]);
  assert.deepEqual(targets[0].rings[0], { body: 'Anelli 1', subtype: 'Class I gas giant', rings: [{ type: 'Icy', reserve: 'Pristine', hotspots: [{ name: 'Void Opal', count: 1 }] }] });
});
