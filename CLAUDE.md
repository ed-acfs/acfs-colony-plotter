# Istruzioni per Claude Code

Colony Plotter dello Squadrone ACFS. Progetto, decisioni e stato stanno nella **fase 13 di `ROADMAP.md` del repo [acfs-bgs-tool](https://github.com/ed-acfs/acfs-bgs-tool)** (di solito in `../acfs-bgs-tool`): leggila a inizio sessione. Valgono le regole generali del `CLAUDE.md` di quel repo (lingua, commit, push, due PC, termini del gioco, regole della colonizzazione), salvo quanto scritto qui.

## Regole

- Rispondi in italiano; codice e commenti in italiano come in `acfs-server`.
- Niente riga `Co-Authored-By: Claude …` nei commit. Chiedi conferma prima di `git push`.
- `git config core.autocrlf input` in questo repo, su ogni PC.
- Spansh è un servizio gratuito: una ricerca alla volta, con una pausa, e mai dal browser (non manda CORS).
- Le regole del gioco (raggio, Contatto, fazioni del sistema nuovo) non si deducono: stanno nel `CLAUDE.md` del tool, "Fazioni di un sistema colonizzato"; se manca qualcosa, chiedere all'utente.
- La **Colonization Mega Guide** (guida di riferimento indicata dall'utente) è riassunta in [`docs/mega-guide.md`](docs/mega-guide.md), con la versione letta: leggerla prima di cambiare i criteri degli obiettivi o il Ponte, e rileggere la guida quando esce una versione nuova.
