/**
 * Il punteggio per scopo (decisione dell'utente del 25 ottobre 2026: "come indica la guida"): per
 * ogni economia che si vuole costruire, quanto il sistema è adatto. Le regole vengono dalla
 * Colonization Mega Guide 2.3.0 (riassunta in docs/mega-guide.md):
 *
 * - corpi ed economie ereditate dai porti "colony": Rocky → Refinery; Rocky ice → Refinery e
 *   Industrial ("forse il miglior pianeta del gioco per i materiali"); Icy → Industrial;
 *   High metal content e Metal-rich → Extraction; Gigante gassoso → High Tech e Industrial;
 *   Earth-like → Agriculture, High Tech, Military, Tourism; Water world → Agriculture e Tourism
 *   ("le migliori fattorie spaziali"); Ammonia world → High Tech e Tourism; Black hole, Neutron e
 *   White dwarf → High Tech e Tourism;
 * - modificatori: anelli → Extraction; organici (biologia) → Agriculture; geologici → Extraction
 *   e Industrial, ma rovinano raffinerie e fattorie se ci sono anche gli organici;
 * - riserve Pristine o Major → più forza a Extraction, Industrial e Refinery in tutto il sistema;
 * - i corpi troppo lontani dalla stella d'arrivo valgono meno ("un porto a 250.000 Ls costringe a
 *   costruire con le carrier").
 *
 * I pesi sono una prima taratura, da ritoccare con l'utente sui sistemi veri. Per ogni scopo:
 * punti e corpi che li danno.
 */

export const PURPOSES = ['refinery', 'industrial', 'extraction', 'agriculture', 'tourism', 'hightech'];

/** Oltre queste distanze dalla stella d'arrivo (Ls) un corpo vale la metà, poi niente. */
export const NEAR_LS = 25_000;
export const FAR_LS = 100_000;

/** Quanti corpi dello stesso tipo contano al massimo per uno scopo: oltre, il sistema non migliora più di tanto. */
const MAX_SAME = 3;

const DEGENERATE_STAR = /Black Hole|Neutron|White Dwarf/;

/** Quanto conta un corpo per la sua distanza: 1 vicino, 0,5 lontano, 0 troppo lontano. */
export function reach(body) {
  const ls = body.distance_to_arrival ?? 0;
  return ls <= NEAR_LS ? 1 : ls <= FAR_LS ? 0.5 : 0;
}

const hasBiology = body => (body.landmarks ?? []).some(l => typeof l.value === 'number' && l.value > 0);
const hasGeology = body => (body.landmarks ?? []).some(l => /geyser|fumarole|lava spout|gas vent/i.test(l.type ?? ''));

/**
 * Che cosa porta un corpo a ciascuno scopo: [scopo, punti] (prima della distanza).
 * `ringed`: il corpo ha anelli (dalla ricerca dei corpi).
 */
function contributions(body, ringed) {
  const subtype = body.subtype ?? '';
  const bio = hasBiology(body);
  const geo = hasGeology(body);
  const out = [];
  if (body.type === 'Star') {
    if (DEGENERATE_STAR.test(subtype)) out.push(['hightech', 3], ['tourism', 3]);
    return out;
  }
  switch (subtype) {
    case 'Earth-like world':
      out.push(['agriculture', 3], ['tourism', 5], ['hightech', 4]);
      break;
    case 'Water world':
      out.push(['agriculture', 5], ['tourism', 4]);
      break;
    case 'Ammonia world':
      out.push(['hightech', 5], ['tourism', 4]);
      break;
    case 'Rocky Ice world':
      if (!(bio && geo)) out.push(['refinery', 4], ['industrial', 3]);
      break;
    case 'Rocky body':
      if (!(bio && geo)) out.push(['refinery', 3]);
      if (bio && !geo) out.push(['agriculture', 3]);
      break;
    case 'Icy body':
      out.push(['industrial', 1]);
      if (geo) out.push(['extraction', 1]);
      break;
    case 'High metal content world':
    case 'Metal-rich body':
      out.push(['extraction', 2]);
      if (bio) out.push(['agriculture', 2]);
      if (geo) out.push(['industrial', 1]);
      break;
    default:
      if (/gas giant/i.test(subtype)) out.push(['hightech', 1], ['industrial', 1]);
  }
  if (ringed) out.push(['extraction', 2]);
  return out;
}

/** Riserva migliore del sistema, dai corpi con anelli (l'unico posto in cui Spansh la dà nella ricerca). */
export function bestReserve(ringedBodies = []) {
  const order = ['Pristine', 'Major', 'Common', 'Low', 'Depleted'];
  const found = ringedBodies.map(b => b.reserve_level).filter(r => order.includes(r));
  return found.sort((a, b) => order.indexOf(a) - order.indexOf(b))[0] ?? null;
}

/**
 * I punteggi per scopo: { scopo: { score, bodies } } e lo scopo migliore. `bodies`: corpi della
 * ricerca dei sistemi; `ringedBodies`: i suoi corpi con anelli (ricerca dei corpi).
 */
export function purposeScores(bodies = [], ringedBodies = []) {
  const ringedNames = new Set(ringedBodies.map(b => b.name));
  const perPurpose = Object.fromEntries(PURPOSES.map(p => [p, { score: 0, bodies: [], counted: new Map() }]));
  for (const body of bodies) {
    const factor = reach(body);
    if (factor === 0) continue;
    for (const [purpose, points] of contributions(body, ringedNames.has(body.name))) {
      const entry = perPurpose[purpose];
      const kind = `${body.subtype}:${points}`;
      const seen = entry.counted.get(kind) ?? 0;
      if (seen >= MAX_SAME) continue;
      entry.counted.set(kind, seen + 1);
      entry.score += points * factor;
      if (!entry.bodies.includes(body.name)) entry.bodies.push(body.name);
    }
  }
  const reserve = bestReserve(ringedBodies);
  if (reserve === 'Pristine' || reserve === 'Major') {
    const bonus = reserve === 'Pristine' ? 2 : 1;
    for (const purpose of ['extraction', 'industrial', 'refinery']) {
      if (perPurpose[purpose].score > 0) perPurpose[purpose].score += bonus;
    }
  }
  const scores = Object.fromEntries(PURPOSES.map(p => [p, { score: Math.round(perPurpose[p].score * 10) / 10, bodies: perPurpose[p].bodies }]));
  const best = PURPOSES.reduce((a, b) => (scores[b].score > scores[a].score ? b : a));
  return { scores, best: scores[best].score > 0 ? best : null, reserve };
}
