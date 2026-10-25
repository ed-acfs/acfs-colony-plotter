/**
 * Gli obiettivi: i sistemi entro il raggio di colonizzazione da una nostra stazione, disabitati, con
 * il perché interessano e da dove partire. Un sistema raggiungibile da più punti di partenza compare
 * una volta sola, con tutti i punti di partenza dal più vicino.
 */
import { factionSplit } from './anchors.mjs';
import { interestingBodies } from './bodies.mjs';
import { reasonsFor } from './interesting.mjs';
import { purposeScores } from './purposes.mjs';

/** Il raggio entro cui si può reclamare un sistema dal Contatto (ly). */
export const CLAIM_RADIUS_LY = 15;

const round = (value, digits = 2) => Math.round(value * 10 ** digits) / 10 ** digits;

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

/**
 * Come sta un sistema per la colonizzazione: `free` (nessuno lo ha reclamato), `claimed` (in
 * costruzione), `colonised` (già abitato da una colonia) o `populated` (abitato da sempre: non si
 * colonizza).
 */
export function colonisationStatus(system) {
  if (system.is_being_colonised) return 'claimed';
  if (system.is_colonised) return (system.population ?? 0) > 0 ? 'colonised' : 'claimed';
  if ((system.population ?? 0) > 0 || system.controlling_minor_faction) return 'populated';
  return 'free';
}

/**
 * `found`: per ogni punto di partenza (`anchors`, stesso ordine), i sistemi che la ricerca ha dato
 * attorno; `ringed`: i corpi con anelli trovati attorno ai punti di partenza (in qualunque ordine).
 * Restano i sistemi liberi o reclamati (questi segnati, per sapere che sono presi), senza i punti
 * di partenza stessi; ordinati dal punteggio dello scopo migliore (vedi purposes.mjs).
 */
export function buildTargets(anchors, found, faction, { radius = CLAIM_RADIUS_LY, ringed = [] } = {}) {
  const targets = new Map();
  const ringsBySystem = new Map();
  for (const body of ringed) {
    const id64 = String(body.system_id64);
    const list = ringsBySystem.get(id64) ?? [];
    if (!list.some(b => b.name === body.name)) list.push(body);
    ringsBySystem.set(id64, list);
  }
  anchors.forEach((anchor, index) => {
    for (const system of found[index] ?? []) {
      const status = colonisationStatus(system);
      if (status === 'populated' || status === 'colonised') continue;
      const id64 = String(system.id64 ?? system.id);
      const away = distance(anchor, system);
      if (away > radius) continue;
      let target = targets.get(id64);
      if (!target) {
        const ringedHere = ringsBySystem.get(id64) ?? [];
        const reasons = reasonsFor(system.bodies ?? [], system.body_count ?? (system.bodies ?? []).length, ringedHere);
        const { scores, best, reserve } = purposeScores(system.bodies ?? [], ringedHere);
        target = {
          name: system.name,
          id64,
          x: system.x,
          y: system.y,
          z: system.z,
          status,
          bodyCount: system.body_count ?? null,
          stars: (system.bodies ?? []).filter(b => b.type === 'Star').map(b => b.subtype),
          rings: ringedHere.map(b => ({
            body: b.name,
            subtype: b.subtype ?? null,
            rings: (b.rings ?? []).map(r => ({
              type: r.type,
              reserve: b.reserve_level ?? null,
              hotspots: (r.signals ?? []).map(s => ({ name: s.name, count: s.count })),
            })),
          })),
          reserve,
          bodies: interestingBodies(system.bodies ?? [], new Set(ringedHere.map(b => b.name))),
          reasons,
          purposes: scores,
          bestPurpose: best,
          score: best ? scores[best].score : 0,
          spanshUpdatedAt: system.updated_at ?? null,
          from: [],
        };
        targets.set(id64, target);
      }
      if (!target.from.some(f => f.name === anchor.name)) {
        target.from.push({
          name: anchor.name,
          id64: anchor.id64,
          distance: round(away),
          stations: anchor.stations,
          factions: factionSplit(anchor, faction),
        });
      }
    }
  });
  for (const target of targets.values()) target.from.sort((a, b) => a.distance - b.distance);
  return [...targets.values()].sort((a, b) => b.score - a.score || a.from[0].distance - b.from[0].distance || a.name.localeCompare(b.name));
}
