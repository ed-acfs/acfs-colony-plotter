# Colonization Mega Guide: cosa serve al Colony Plotter

Riassunto della [Elite Dangerous Colonization Mega Guide](https://docs.google.com/document/d/1toXyDQglwVACFKx8umXhP8QcMSAUYPcP6k3STIV2-hE/edit) di CMDR Mechan, **versione 2.3.0** (gioco 4.2.1.2; la 2.4.0 è in lavorazione e non include ancora il ridimensionamento della patch 4.2.2.0). Letta il 25 ottobre 2026, su indicazione dell'utente, fino all'Appendice D; l'Appendice E (il codex del gioco) non c'era nel testo esportato. Quando la guida cambia versione, rileggerla e aggiornare questo file.

Le regole che decidono il comportamento del motore stanno anche nel `CLAUDE.md` del tool ("Fazioni di un sistema colonizzato"): se questo file e quello non coincidono, vale il `CLAUDE.md` del tool, che riporta le correzioni dell'utente.

## Reclamare un sistema

- **Contatto di Colonizzazione**: nei sistemi della Bolla e nei sistemi colonizzati da giocatori **con il porto primario completato**. I sistemi abitati fuori dalla Bolla e non colonizzati (es. Colonia) non lo hanno. Per l'utente ce l'ha ogni stazione, non gli insediamenti.
- **Raggio**: fino a **15,00 ly** dal Contatto. Oltre serve un **ponte** (bridging): una catena di avamposti, uno ogni 15 ly; la guida rimanda al [Colonisation Plotter di Spansh](https://spansh.co.uk/colonisation). I porti primari dei sistemi ponte devono essere **avamposti** (il minimo da costruire).
- **Costo e tempi**: 25 milioni di crediti, non rimborsati. **24 ore** per posare il beacon (se scadono, il sistema resta bloccato per 24 ore per tutti), poi **4 settimane** per completare il porto primario.
- **Periodo di esclusiva** (patch 4.4.1.2): completato il porto primario, solo l'architetto può reclamare da lì per **30 minuti**, poi tutto il suo Squadrone per **23,5 ore**, poi chiunque. Per un ponte dello Squadrone è il momento in cui il pilota successivo deve essere pronto.
- **Porto primario**: è l'unica struttura che non si può mai demolire; la sua posizione nel sistema è fissa (la bandierina nella mappa del sistema in modalità architetto) e non si legge da Spansh.

## Fazioni del sistema nuovo

Con uno Squadrone associato a una minor faction: **60%** la fazione che controlla la **stazione** di partenza; **20%** chi controlla il **sistema** di partenza, se è un'altra, altrimenti la seconda per influenza; **13%** la fazione dello Squadrone; **6%** un'Anarchy dal sistema più vicino in cui è presente. Correzione dell'utente (25 ottobre 2026): se la stazione è nostra, Flotta Stellare ha solo il 60%, non anche il 13%. Le strutture costruite dopo il porto primario vanno a fazioni del sistema scelte a caso.

## Scegliere il sistema (sezione "What To Consider When Selecting A System To Architect")

- **Scopo**: raffineria → pianeti rocciosi; industria → ghiacciati; estrazione → HMC o Metal-rich (meglio con anelli) o molte cinture e pianeti con anelli (per le basi su asteroide); turismo → stelle non di sequenza principale, Earth-like o Water world.
- **Slot**: pianeti grandi (fino a 10 slot, oltre 7 è raro) e molti slot nello spazio. Nelle FAQ: cercare **almeno 10 slot a terra e 10 nello spazio**; senza slot a terra le possibilità sono molto limitate.
- **Compattezza**: meglio corpi raccolti attorno alla stella principale che sparsi fra stelle lontane; un porto primario a 250.000 Ls costringe a costruire con le carrier.
- **Raffineria vicina**: serve un porto con pad grande e raffineria a distanza accettabile, per i metalli.
- **Concorrenza**: un sistema molto ambito va pianificato come una corsa.

## Corpi ed economie (porti "colony")

| Corpo | Economie ereditate |
|---|---|
| Black hole, Neutron, White dwarf | High Tech, Tourism |
| Nane brune e altre stelle | Military |
| Earth-like world | Agriculture, High Tech, Military, Tourism |
| Water world | Agriculture, Tourism |
| Ammonia world | High Tech, Tourism |
| Gigante gassoso | High Tech, Industrial |
| High metal content e Metal-rich | Extraction |
| Rocky ice | Industrial, Refinery |
| Rocky | Refinery |
| Icy | Industrial |

Modificatori (non si sommano fra loro né con l'economia del corpo): **anelli** (anche cinture di asteroidi delle stelle) → Extraction; **organici** → Agriculture e Terraforming; **geologici** → Extraction e Industrial.

Legami forti: Extraction, Industrial e Refinery salgono nei sistemi con risorse **Major o Pristine** e scendono con Low o Depleted; Tourism sale nei sistemi con Black hole, White dwarf o Neutron star e attorno a Earth-like, Water e Ammonia world; Agriculture sale attorno a Earth-like e Water world e con gli organici, scende sui corpi ghiacciati e su quelli in rotazione sincrona (tidally locked).

Conclusioni della guida utili per il punteggio:
- **Rocky ice world**: forse il miglior pianeta del gioco per produrre i materiali della colonizzazione (raffineria più industria); raro.
- **Rocky world**: la base migliore per una raffineria pura, o la fattoria migliore fuori dai Water world.
- **Water world**: le migliori fattorie spaziali; un porto Tier 3 arriva a circa **1,8 miliardi** di abitanti.
- **Earth-like world**: "simbolo" della colonizzazione e la popolazione più alta (**3,1 miliardi** con un Tier 3), ma fattorie solo discrete.
- La popolazione aumenta la produzione della sola struttura, la qualità delle emissioni e **lo sforzo per cambiare il controllo BGS** del sistema.

## Altre cose da sapere

- **Material Trader**: non si possono avere nelle colonie. **Tech Broker** umano: solo con una stazione Dodec. **Interstellar Factors**: solo nei sistemi a sicurezza bassa.
- **Porti Tier 2 e Tier 3**: il costo in punti costruzione cresce a ogni porto (il primario non conta): conviene un Tier 3 come primario nei sistemi "capitale" e costruire i Tier 3 prima dei Tier 2.
- **Strumenti** citati dalla guida: [Raven Colonial](https://ravencolonial.com/#home) (pianificazione del sistema), il foglio di DaftMav, l'Hybrid Market Planner di Ian Doncaster, il Colonisation Plotter di Spansh (ponti).
- **Crediti per l'architetto**: punteggio del sistema × circa 10.000 crediti a settimana; poco, non è un motivo per colonizzare.

## Cosa cambia nel motore (proposte, da decidere con l'utente)

1. **Rocky ice world** come motivo (oggi non c'è) e, in generale, i motivi per **scopo** (raffineria, agricoltura, estrazione, turismo) invece di un solo punteggio.
2. La **riserva del sistema** (Pristine, Major) conta per estrazione, industria e raffineria anche oltre gli anelli.
3. **Compattezza** e **distanza dei corpi dalla stella d'arrivo** (`distance_to_arrival` è nella ricerca di Spansh): un sistema con i corpi utili a 200.000 Ls vale meno.
4. **Raffineria con pad grande più vicina** per ogni obiettivo.
5. **Ponte**: le tappe da costruire come avamposti, con il periodo di esclusiva di 24 ore per lo Squadrone fra una tappa e l'altra.
