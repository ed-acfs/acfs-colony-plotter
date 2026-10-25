/**
 * Gli obiettivi: i sistemi entro il raggio di colonizzazione da una nostra stazione, disabitati, con
 * il perché interessano e da dove partire. Un sistema raggiungibile da più punti di partenza compare
 * una volta sola, con tutti i punti di partenza dal più vicino.
 */
import { factionSplit } from './anchors.mjs';
import { reasonsFor, scoreOf } from './interesting.mjs';

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
 * attorno. Restano i sistemi liberi o reclamati (questi segnati, per sapere che sono presi), senza
 * i punti di partenza stessi; ordinati dal punteggio più alto.
 */
export function buildTargets(anchors, found, faction, { radius = CLAIM_RADIUS_LY } = {}) {
  const targets = new Map();
  anchors.forEach((anchor, index) => {
    for (const system of found[index] ?? []) {
      const status = colonisationStatus(system);
      if (status === 'populated' || status === 'colonised') continue;
      const id64 = String(system.id64 ?? system.id);
      const away = distance(anchor, system);
      if (away > radius) continue;
      let target = targets.get(id64);
      if (!target) {
        const reasons = reasonsFor(system.bodies ?? [], system.body_count ?? (system.bodies ?? []).length);
        target = {
          name: system.name,
          id64,
          x: system.x,
          y: system.y,
          z: system.z,
          status,
          bodyCount: system.body_count ?? null,
          stars: (system.bodies ?? []).filter(b => b.type === 'Star').map(b => b.subtype),
          reasons,
          score: scoreOf(reasons),
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
