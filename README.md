# ACFS Colony Plotter

Motore del Colony Plotter dello Squadrone **Alto Comando Flotta Stellare** (ACFS): trova gli obiettivi di colonizzazione attorno alle stazioni controllate da **Flotta Stellare** e, in seguito, i ponti (bridging) per raggiungere quelli lontani. Progetto, decisioni e stato stanno nella **fase 13 di `ROADMAP.md` del repo [acfs-bgs-tool](https://github.com/ed-acfs/acfs-bgs-tool)**. I risultati li esporrà [`acfs-server`](https://github.com/ed-acfs/acfs-server) e li mostrerà una sezione "Colonizzazione" del tool.

## Obiettivi

```bash
npm run targets                                  # tutti i punti di partenza (qualche minuto)
node bin/targets.mjs --anchor "HIP 21437"        # solo da uno o più sistemi (ripetere --anchor)
npm test
```

Scrive `data/targets.json` (cartella ignorata da git). Node 24, nessuna dipendenza.

1. **Punti di partenza** (`src/anchors.mjs`): i sistemi del `bgs.json` del tool con almeno una stazione controllata da Flotta Stellare. Ogni stazione ha il Contatto di Colonizzazione; cantieri, navi della colonizzazione, megaship e carrier non contano.
2. **Ricerca** (`src/spansh.mjs`): per ogni punto di partenza, i sistemi entro 15 ly dalla ricerca di Spansh, che dà anche i disabitati con i loro corpi. Una ricerca alla volta, con una pausa: niente archivio della galassia da 117 GB.
3. **Obiettivi** (`src/targets.mjs`): i sistemi liberi (popolazione 0, senza fazioni, non reclamati) e quelli già reclamati (segnati come tali), con tutti i punti di partenza da cui si raggiungono, dal più vicino, e le fazioni che avrebbe il sistema nuovo partendo da una nostra stazione (60% Flotta Stellare, 20% chi controlla il sistema di partenza o la seconda fazione, 13% la fazione dello Squadrone, 6% un'Anarchy vicina).
4. **Perché interessa** (`src/interesting.mjs`): Earth-like, Water world, Ammonia world, giganti gassosi con vita, Water giant, stelle rare, due o più stelle, più di 40 corpi, segnali biologici, pianeti terraformabili. Ogni motivo ha un peso; la somma ordina gli obiettivi. Criteri dell'utente, in linea con quelli del Colony Finder dei Canonn (di cui si riprende solo l'idea: il loro repo non ha licenza).

## Formato di `data/targets.json`

In cima `generated_at`, `faction`, `radius_ly`, `anchors` (i punti di partenza con le nostre stazioni) e `count`; poi `targets`, dal punteggio più alto:

| Campo | |
|---|---|
| `name`, `id64`, `x`, `y`, `z` | Il sistema (`id64` come stringa) |
| `status` | `free` (libero) o `claimed` (reclamato, in costruzione) |
| `bodyCount`, `stars` | Numero di corpi e sottotipi delle stelle |
| `reasons`, `score` | I motivi (`key` e i corpi che lo danno) e il punteggio |
| `from` | I punti di partenza entro 15 ly, dal più vicino: `name`, `distance`, `stations` (nostre), `factions` (le quote del sistema nuovo) |
| `spanshUpdatedAt` | Ultimo aggiornamento del sistema su Spansh |

## Licenza

MIT, come il tool.
