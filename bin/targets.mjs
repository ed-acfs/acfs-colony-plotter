#!/usr/bin/env node
/**
 * Calcola gli obiettivi di colonizzazione e li scrive in un JSON.
 *
 *   node bin/targets.mjs                         tutti i punti di partenza (qualche minuto: una ricerca su Spansh per sistema)
 *   node bin/targets.mjs --anchor "HIP 21437"    solo da uno o più sistemi (ripetere --anchor)
 *   node bin/targets.mjs --out data/targets.json --source <url o file di bgs.json> --faction "Flotta Stellare"
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { anchorsFrom } from '../src/anchors.mjs';
import { ringedBodiesAround, systemsAround } from '../src/spansh.mjs';
import { CLAIM_RADIUS_LY, buildTargets } from '../src/targets.mjs';

const { values } = parseArgs({
  options: {
    anchor: { type: 'string', multiple: true },
    out: { type: 'string', default: 'data/targets.json' },
    source: { type: 'string', default: 'https://flottastellare.it/acfs-bgs-tool/data/bgs.json' },
    faction: { type: 'string', default: 'Flotta Stellare' },
  },
});

async function loadRecords(source) {
  const text = /^https?:/.test(source) ? await (await fetch(source)).text() : readFileSync(source, 'utf8');
  return JSON.parse(text).results ?? [];
}

const records = await loadRecords(values.source);
let anchors = anchorsFrom(records, values.faction);
if (values.anchor?.length) {
  const wanted = new Set(values.anchor.map(name => name.toLowerCase()));
  anchors = anchors.filter(a => wanted.has(a.name.toLowerCase()));
  const missing = values.anchor.filter(name => !anchors.some(a => a.name.toLowerCase() === name.toLowerCase()));
  if (missing.length) console.warn(`Nessuna stazione di ${values.faction} in: ${missing.join(', ')}`);
}
console.log(`${anchors.length} punti di partenza`);

const found = [];
const ringed = [];
for (const [index, anchor] of anchors.entries()) {
  try {
    found.push(await systemsAround(anchor.name, CLAIM_RADIUS_LY));
    ringed.push(...await ringedBodiesAround(anchor.name, CLAIM_RADIUS_LY));
  } catch (err) {
    console.warn(`${anchor.name}: ricerca su Spansh non riuscita (${err.message})`);
    found.push([]);
  }
  if ((index + 1) % 25 === 0) console.log(`  ${index + 1}/${anchors.length}`);
}

const targets = buildTargets(anchors, found, values.faction, { ringed });
mkdirSync(path.dirname(values.out), { recursive: true });
writeFileSync(values.out, JSON.stringify({
  generated_at: new Date().toISOString(),
  faction: values.faction,
  radius_ly: CLAIM_RADIUS_LY,
  anchors: anchors.map(({ name, id64, x, y, z, stations }) => ({ name, id64, x, y, z, stations })),
  count: targets.length,
  targets,
}, null, 1));
const free = targets.filter(t => t.status === 'free');
console.log(`${targets.length} obiettivi (${free.length} liberi, ${targets.length - free.length} già reclamati) in ${values.out}`);
for (const t of free.slice(0, 10)) {
  console.log(`  ${t.score.toString().padStart(2)}  ${t.name.padEnd(30)} ${t.from[0].distance.toFixed(1).padStart(5)} ly da ${t.from[0].name}  ${t.reasons.map(r => r.key).join(', ')}`);
}
