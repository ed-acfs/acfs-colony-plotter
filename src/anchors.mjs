/**
 * I punti di partenza: i sistemi con almeno una stazione controllata dalla nostra fazione. Ogni
 * stazione ha il Contatto di Colonizzazione (indicazione dell'utente, 25 ottobre 2026), e chi parte
 * da una stazione nostra dà alla nostra fazione il 60% del sistema nuovo (vedi CLAUDE.md del tool).
 *
 * Legge il `bgs.json` del tool (record di Spansh con `assets`, l'elenco sintetico delle stazioni).
 */

/** Non sono stazioni con un Contatto: cantieri, navi della colonizzazione, megaship, carrier. */
const NOT_A_STATION = /construction|colonisation ship|mega ship|fleet carrier|drake-class/i;

/** La stazione può fare da partenza; gli insediamenti di Odyssey per ora sì, come le altre (da verificare). */
export function isContactStation(asset) {
  if (!asset?.name || !asset.type) return false;
  return !NOT_A_STATION.test(asset.type) && !NOT_A_STATION.test(asset.name);
}

/**
 * I punti di partenza dai record di `bgs.json`: nome, coordinate, le nostre stazioni e le fazioni
 * del sistema (per dire chi prende il 20%).
 */
export function anchorsFrom(records, faction) {
  const anchors = [];
  for (const record of records) {
    const stations = (record.assets ?? []).filter(a => a.controlling_minor_faction === faction && isContactStation(a));
    if (stations.length === 0 || typeof record.x !== 'number') continue;
    anchors.push({
      name: record.name,
      id64: String(record.id64 ?? record.id ?? ''),
      x: record.x,
      y: record.y,
      z: record.z,
      controllingFaction: record.controlling_minor_faction ?? null,
      factions: (record.minor_faction_presences ?? [])
        .map(p => ({ name: p.name, influence: p.influence }))
        .sort((a, b) => b.influence - a.influence),
      stations: stations.map(s => ({ name: s.name, type: s.type })),
    });
  }
  return anchors;
}

/**
 * Le fazioni del sistema nuovo se la richiesta parte da una nostra stazione di `anchor` (regola
 * della Colonization Mega Guide, vedi CLAUDE.md del tool): 60% la fazione della stazione (la
 * nostra), 20% chi controlla il sistema se è un'altra, altrimenti la seconda per influenza; 13% la
 * fazione dello Squadrone (la nostra, di nuovo: l'utente lo verificherà al primo caso); 6% un'Anarchy vicina.
 */
export function factionSplit(anchor, faction) {
  const second = anchor.controllingFaction && anchor.controllingFaction !== faction
    ? anchor.controllingFaction
    : anchor.factions.find(f => f.name !== faction)?.name ?? null;
  return [
    { share: 60, faction },
    { share: 20, faction: second },
    { share: 13, faction },
    { share: 6, faction: null, note: 'anarchy' },
  ];
}
