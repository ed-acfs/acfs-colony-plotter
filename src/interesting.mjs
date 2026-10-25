/**
 * Perché un sistema è un buon obiettivo di colonizzazione, dai suoi corpi come li dà la ricerca
 * di Spansh (`type`, `subtype`, `landmarks`). Criteri dell'utente (25 ottobre 2026): Earth-like,
 * Water world, due o più stelle; quelli del Colony Finder dei Canonn "certamente in linea": molti
 * corpi, stelle e pianeti rari, giganti gassosi con vita, segnali biologici. Ogni motivo ha un peso,
 * e il punteggio (la somma) ordina gli obiettivi: i pesi sono qui sotto, da ritoccare a piacere.
 */

/** Più corpi di così: un sistema grande, da molte strutture. */
export const MANY_BODIES = 40;

/** I motivi, con il peso; `key` è stabile e serve all'interfaccia per tradurlo. */
export const REASONS = {
  earthLike: { weight: 10 },
  waterWorld: { weight: 6 },
  ammoniaWorld: { weight: 4 },
  lifeGasGiant: { weight: 3 },
  waterGiant: { weight: 3 },
  rareStar: { weight: 3 },
  multipleStars: { weight: 2 },
  manyBodies: { weight: 2 },
  biology: { weight: 2 },
  terraformable: { weight: 1 },
};

const ORDER = Object.keys(REASONS);

/** Stelle rare (sottotipo che contiene una di queste parole). */
const RARE_STAR_MARKERS = ['Black Hole', 'Neutron', 'Wolf-Rayet', 'White Dwarf', 'Herbig', 'T Tauri', 'giant', 'Carbon', 'C Star', 'CN Star', 'CJ Star', 'S-type', 'MS-type'];

/**
 * I motivi per cui il sistema interessa, ognuno con i corpi che lo danno (per mostrarli).
 * `bodies`: i corpi della ricerca di Spansh.
 */
export function reasonsFor(bodies = [], bodyCount = bodies.length) {
  const found = new Map();
  const add = (key, body) => {
    const names = found.get(key) ?? [];
    if (body && !names.includes(body.name)) names.push(body.name);
    found.set(key, names);
  };
  const stars = bodies.filter(b => b.type === 'Star');
  for (const body of bodies) {
    const subtype = body.subtype ?? '';
    if (body.type === 'Planet') {
      if (subtype === 'Earth-like world') add('earthLike', body);
      if (subtype === 'Water world') add('waterWorld', body);
      if (subtype === 'Ammonia world') add('ammoniaWorld', body);
      if (subtype === 'Water giant') add('waterGiant', body);
      if (/gas giant with .*life/i.test(subtype)) add('lifeGasGiant', body);
      if (/terraformable|candidate/i.test(body.terraforming_state ?? '')) add('terraformable', body);
    }
    if (body.type === 'Star' && RARE_STAR_MARKERS.some(marker => subtype.includes(marker))) add('rareStar', body);
    if ((body.landmarks ?? []).some(isBiology)) add('biology', body);
  }
  if (stars.length >= 2) found.set('multipleStars', stars.map(s => s.name));
  if (bodyCount > MANY_BODIES) found.set('manyBodies', []);
  return [...found.entries()]
    .map(([key, bodies]) => ({ key, bodies }))
    .sort((a, b) => REASONS[b.key].weight - REASONS[a.key].weight || ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
}

export function scoreOf(reasons) {
  return reasons.reduce((sum, r) => sum + REASONS[r.key].weight, 0);
}

/** Un landmark biologico (una specie, con un valore per l'esobiologia), non un geyser o una fumarola. */
function isBiology(landmark) {
  return typeof landmark?.value === 'number' && landmark.value > 0;
}
