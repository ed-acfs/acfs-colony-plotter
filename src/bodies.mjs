/**
 * I corpi interessanti di un sistema, uno per uno, come li elenca il Colony Finder dei Canonn
 * (richiesta dell'utente del 25 ottobre 2026: "tutto quanto c'era da Canonn"): i tipi di corpo rari,
 * ogni gigante gassoso, e per ogni corpo la biologia specie per specie e la geologia. La biologia
 * conta per le economie (Colonization Mega Guide: gli organici aggiungono Agriculture e Terraforming
 * e rafforzano Agriculture, High Tech e Tourism; i geologici aggiungono Extraction e Industrial).
 *
 * L'elenco dei tipi rari è quello dei Canonn (sono nomi del gioco, non codice: il loro repo non ha
 * licenza); Spansh li dà come `subtype` nella ricerca dei sistemi, e la biologia e la geologia nei
 * `landmarks` (`type` il genere, `subtype` la specie; `value` > 0 solo per la biologia).
 */

export const RARE_SUBTYPES = new Set([
  'High metal content world', 'Rocky body', 'Metal-rich body', 'Water world', 'Gas giant with water-based life',
  'Neutron Star', 'T Tauri Star', 'Gas giant with ammonia-based life', 'Ammonia world', 'Earth-like world',
  'Black Hole', 'Water giant', 'Helium-rich gas giant', 'M (Red giant) Star', 'White Dwarf (DC) Star',
  'Herbig Ae/Be Star', 'White Dwarf (DA) Star', 'White Dwarf (DAB) Star', 'K (Yellow-Orange giant) Star',
  'Wolf-Rayet O Star', 'S-type Star', 'MS-type Star', 'White Dwarf (DB) Star', 'CN Star',
  'A (Blue-White super giant) Star', 'White Dwarf (DCV) Star', 'B (Blue-White super giant) Star',
  'White Dwarf (DAV) Star', 'Wolf-Rayet C Star', 'Wolf-Rayet N Star', 'Wolf-Rayet NC Star',
  'F (White super giant) Star', 'G (White-Yellow super giant) Star', 'White Dwarf (DBV) Star',
  'M (Red super giant) Star', 'CJ Star', 'White Dwarf (DAZ) Star', 'White Dwarf (DBZ) Star', 'C Star',
  'Wolf-Rayet Star', 'White Dwarf (DQ) Star', 'Helium gas giant', 'White Dwarf (D) Star',
]);

const isBiology = landmark => typeof landmark?.value === 'number' && landmark.value > 0;
/** I landmark geologici; Spansh mette fra i landmark anche le stazioni a terra, che non contano. */
const isGeology = landmark => /geyser|fumarole|lava spout|gas vent/i.test(landmark?.type ?? '');

/**
 * I corpi interessanti, nell'ordine di Spansh: `name`, `subtype`, `rare` (tipo raro o gigante
 * gassoso), `terraformable`, `ringed`, `biology` ({ genus, species }), `geology` (es. "Water Ice Geyser"),
 * `distance` dalla stella d'arrivo (Ls). Un corpo comune entra se ha biologia o geologia.
 */
export function interestingBodies(bodies = [], ringedNames = new Set()) {
  const found = [];
  for (const body of bodies) {
    const subtype = body.subtype ?? '';
    const rare = RARE_SUBTYPES.has(subtype) || (body.type === 'Planet' && /gas giant/i.test(subtype));
    const landmarks = body.landmarks ?? [];
    const biology = [];
    for (const l of landmarks.filter(isBiology)) {
      const species = l.subtype ?? l.type;
      if (!biology.some(b => b.species === species)) biology.push({ genus: l.type ?? species, species });
    }
    const geology = [...new Set(landmarks.filter(isGeology).map(l => l.subtype ?? l.type))];
    if (!rare && biology.length === 0 && geology.length === 0) continue;
    found.push({
      name: body.name,
      subtype,
      rare,
      terraformable: /terraformable|candidate/i.test(body.terraforming_state ?? '') && !/^not/i.test(body.terraforming_state ?? ''),
      ringed: ringedNames.has(body.name),
      biology,
      geology,
      distance: body.distance_to_arrival ?? null,
    });
  }
  return found;
}
