/**
 * Le ricerche su Spansh: i sistemi entro un raggio da un sistema, con i loro corpi. Spansh non
 * manda CORS, quindi queste ricerche le fa il server (o lo script), mai il browser. Una ricerca
 * alla volta, con una pausa fra l'una e l'altra, per non pesare su un servizio gratuito.
 */

const SEARCH_URL = 'https://spansh.co.uk/api/systems/search';
const PAGE_SIZE = 100;
const PAUSE_MS = 1000;
const TIMEOUT_MS = 30_000;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/** Una pagina della ricerca; ritenta due volte se Spansh non risponde. */
async function searchPage(body, fetchImpl) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchImpl(SEARCH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'acfs-colony-plotter (ed-acfs)' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`Spansh ha risposto ${response.status}`);
      return await response.json();
    } catch (err) {
      lastError = err;
      await sleep(PAUSE_MS * 3 * (attempt + 1));
    }
  }
  throw lastError;
}

/** I sistemi entro `radius` ly da `systemName`, dal più vicino, con i corpi. */
export async function systemsAround(systemName, radius, { fetchImpl = fetch, pause = PAUSE_MS } = {}) {
  const systems = [];
  for (let page = 0; ; page++) {
    const data = await searchPage({
      filters: { distance: { min: '0', max: String(radius) } },
      reference_system: systemName,
      sort: [{ distance: { direction: 'asc' } }],
      size: PAGE_SIZE,
      page,
    }, fetchImpl);
    systems.push(...(data.results ?? []));
    if (systems.length >= (data.count ?? 0) || (data.results ?? []).length === 0) break;
    await sleep(pause);
  }
  return systems;
}
