# 3 i rad

Ett litet "3 i rad"-spel (tic-tac-toe) byggt i ren HTML, CSS och JavaScript.
Inga ramverk, inga byggverktyg och inga npm-paket – filerna körs precis som
de ligger.

## Så startar du spelet

Dubbelklicka på `index.html`, eller högerklicka och välj "Öppna med" och din
webbläsare. Det är allt. Du behöver ingen server och inget installerat.

Vill du ändå köra det via en lokal server (till exempel för att slippa
webbläsarens begränsningar för `file://`), räcker det med:

```bash
python3 -m http.server 8000
```

Öppna sedan <http://localhost:8000> i webbläsaren.

## Funktioner

- **Två spellägen** – två spelare på samma enhet, eller mot datorn.
- **Tre svårighetsgrader** när du spelar mot datorn:
  - *Lätt* – datorn drar helt slumpmässigt.
  - *Medel* – datorn tar sin egen vinst när den kan, och blockerar annars din.
  - *Svår* – datorn använder minimax och räknar igenom hela partiet. Den går
    inte att besegra; det bästa du kan få ut är oavgjort.
- **Poängräkning** för hela sessionen: vinster, förluster och oavgjorda.
- **Vinstraden markeras** tydligt med grön ram, och övriga rutor tonas ned.
- **Statusrad** som visar vems tur det är och vem som vann.
- **Ny omgång** – börjar om men behåller poängen.
- **Ångra drag** – tar tillbaka senaste draget. I datorläget tas två drag
  bort (datorns svar och ditt eget), så att det blir din tur igen.
- **Nollställ poäng** – nollar poängtavlan och startar en ny omgång.
- **Mörkt och ljust tema** med en växlingsknapp uppe till höger. Valet sparas
  i webbläsaren, och första gången följer spelet ditt systemval.
- **Responsiv design** som fungerar på både mobil och dator.
- **Animationer** när ett drag görs och när någon vinner. Om du har valt att
  minska rörelser i operativsystemet stängs animationerna av automatiskt.

## Filer

| Fil | Innehåll |
| --- | --- |
| `index.html` | Sidans struktur: rutnät, menyer, poängtavla och knappar. |
| `style.css` | All formgivning, färgvariabler för de två temana och animationer. |
| `script.js` | Spellogiken: regler, datorns drag, poäng, ångra och temabyte. |

Koden är kommenterad på svenska och uppdelad i numrerade avsnitt, så att det
går att läsa uppifrån och ner.

## Bra att veta

- **X börjar alltid.** I läget mot datorn är du X och datorn är O.
- **Poängen nollställs när du byter spelläge**, eftersom siffrorna betyder
  olika saker i de två lägena (Spelare X/O respektive du/datorn).
- **Poängen sparas inte** mellan sidladdningar – den gäller för sessionen.
  Bara temavalet ligger kvar.
