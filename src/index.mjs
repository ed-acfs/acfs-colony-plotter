/**
 * Il calcolo completo degli obiettivi, come funzione: lo usano il comando (bin/targets.mjs) e il
 * server dello Squadrone (acfs-server, che lo rifà ogni giorno e lo serve su /v1/colonisation).
 */
import { anchorsFrom } from './anchors.mjs';
import { ringedBodiesAround, systemsAround } from './spansh.mjs';
import { CLAIM_RADIUS_LY, buildTargets } from './targets.mjs';

export { anchorsFrom } from './anchors.mjs';
export { buildTargets, CLAIM_RADIUS_LY } from './targets.mjs';

/** Le ricerche su Spansh attorno a ogni punto di partenza: una alla volta, con una pausa (vedi spansh.mjs). */
export async function searchAround(anchors, { log = () => {} } = {}) {
  const found = [];
  const ringed = [];
  for (const [index, anchor] of anchors.entries()) {
    try {
      found.push(await systemsAround(anchor.name, CLAIM_RADIUS_LY));
      ringed.push(...await ringedBodiesAround(anchor.name, CLAIM_RADIUS_LY));
    } catch (err) {
      log(`${anchor.name}: ricerca su Spansh non riuscita (${err.message})`);
      found.push([]);
    }
    if ((index + 1) % 25 === 0) log(`  ${index + 1}/${anchors.length}`);
  }
  return { found, ringed };
}

/** Il JSON degli obiettivi, nel formato che servono il server e legge il tool. */
export function colonisationData(anchors, targets, faction) {
  return {
    generated_at: new Date().toISOString(),
    faction,
    radius_ly: CLAIM_RADIUS_LY,
    anchors: anchors.map(({ name, id64, x, y, z, stations }) => ({ name, id64, x, y, z, stations })),
    count: targets.length,
    targets,
  };
}

/**
 * Dai record di Spansh dei nostri sistemi (formato `bgs.json`, con `assets`) agli obiettivi: punti di
 * partenza, ricerche su Spansh (qualche minuto), obiettivi. `log` riceve l'avanzamento.
 */
export async function computeColonisation(records, faction, { log = () => {} } = {}) {
  const anchors = anchorsFrom(records, faction);
  log(`${anchors.length} punti di partenza`);
  const { found, ringed } = await searchAround(anchors, { log });
  return colonisationData(anchors, buildTargets(anchors, found, faction, { ringed }), faction);
}
