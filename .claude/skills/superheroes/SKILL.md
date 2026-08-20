---
name: superheroes
description: "Dela upp ett större arbete på flera specialiserade Claude-agenter som arbetar parallellt och sätt ihop resultatet. Använd när användaren ber om att köra flera agenter, bottar eller ett team på samma uppgift, vill parallellisera ett större bygge, eller ber om spaning i en okänd kodbas på bredden. Triggerord - superheroes, superhjältar, flera agenter, parallellt, subagenter, dela upp projektet, kör ett team, multi-agent, fan out, swarm."
---

# Superheroes

Att sätta ihop ett lag av specialiserade agenter för ett arbete som är för
stort för en ensam agent — och att få ihop deras resultat till något som
faktiskt fungerar.

Temat är superhjältar. Substansen är arbetsfördelning. Det svåra är aldrig
att starta agenter; det svåra är att dela upp arbetet så att de inte går i
vägen för varandra, och att sätta ihop det de lämnar tillbaka.

---

## Först: ska laget kallas in alls?

Att starta en agent är dyrt. Varje agent börjar kall och måste läsa in sig
på nytt — kontext du redan har försvinner inte över till den. **Fem agenter
som var och en läser samma sak är långsammare och sämre än en agent som
redan kan det.**

Kalla in laget bara om alla tre stämmer:

1. **Det delar sig.** Arbetet går att skära i minst två delar som inte
   behöver vänta på varandra.
2. **Delarna rör olika filer.** Två agenter får aldrig äga samma fil.
3. **Delarna är stora nog.** En del som tar en agent tre verktygsanrop var
   inte värd en agent.

Faller något av dem: gör jobbet själv. Det är rätt svar oftare än man tror.

Gör inte heller detta oombett — användaren ska ha bett om det. Att den här
skillen körs räknas som att de har bett om det.

---

## Steg 1 — Skär upp uppdraget

Skriv ner delarna innan du startar något. För varje del:

| Fält | Betydelse |
| --- | --- |
| **Uppdrag** | Vad som ska vara gjort, i en mening. |
| **Äger** | De filer eller kataloger som *bara* den här agenten får ändra. |
| **Rör inte** | Det som ligger nära men tillhör någon annan. |
| **Lämnar ifrån sig** | Vad du får tillbaka: en patch, en lista, ett svar. |

Filägarskapet är det som gör eller förstör hela upplägget. Överlappar två
agenters ägarlistor kommer de skriva över varandra, och du märker det först
när allt ska sättas ihop. Överlappar de: slå ihop delarna till en, eller
gör den gemensamma filen till ditt eget ansvar.

**Gemensamma filer hanterar du själv, före eller efter.** Sådant som
`package.json`, routingtabeller, index-filer och migrationer har en enda
ägare: du.

---

## Steg 2 — Sätt laget

Fyra roller täcker nästan allt. `references/roster.md` har hela beskrivningen
och hur du lägger till egna.

| Hjälte | Kraft | Använd till |
| --- | --- | --- |
| **Scout** | Ser allt, rör inget | Hitta var något finns, kartlägga en okänd kodbas |
| **Oracle** | Ser framåt | Utreda en design, väga två vägar mot varandra |
| **Forge** | Bygger | Skriva koden för en avgränsad del |
| **Warden** | Misstror allt | Granska, köra tester, leta hål |

Ge varje hjälte minsta möjliga verktygsuppsättning. En Scout som inte kan
skriva kan inte råka skriva.

Matcha rollen mot arbetet, inte tvärtom. Behöver uppdraget bara spaning är
det ett Scout-uppdrag, inte ett helt lag.

---

## Steg 3 — Skriv briefingen

En agent ser inte det du ser. Den får bara sin prompt. Den vanligaste
orsaken till att ett uppdrag misslyckas är att briefingen förutsatte något
agenten inte kunde veta.

Varje briefing ska innehålla:

- **Uppdraget** — vad som ska vara gjort, konkret.
- **Kontexten** — det du redan vet och som annars måste grävas fram igen:
  filsökvägar, mönster som gäller i projektet, beslut som redan är tagna.
- **Gränsen** — vilka filer agenten äger, och vad den inte får röra.
- **Formen på svaret** — exakt vad du vill ha tillbaka. "Lista filerna och
  radnumren" ger något användbart; "kolla på det här" ger en uppsats.
- **Kvalitetskravet** — vilka kommandon som ska vara gröna innan den är klar.

Skriv briefingen som till någon som är kompetent men helt ny på projektet.
Den bilden är exakt sann.

---

## Steg 4 — Skicka ut laget

Starta med `Agent` och `subagent_type` satt till hjältens namn.

- **Kör dem parallellt.** Alla oberoende uppdrag startas i samma svar, annars
  köar de och du har förlorat hela poängen.
- **Låt dem gå i bakgrunden.** Det är förvalt. Kör bara i förgrunden när
  nästa steg omöjligt kan göras utan svaret.
- **Isolera de som skriver.** Ska två agenter bygga samtidigt: ge dem
  `isolation: "worktree"` så får var och en sin egen git-worktree och de kan
  inte trampa i varandras arbetskopia.
- **Håll koll på uppdragen** med `TaskCreate` och `TaskUpdate` när de är fler
  än ett par.

Agenternas slutrapport visas aldrig för användaren. Det som ska fram måste du
återge själv.

---

## Steg 5 — Håll ihop laget

- `ListAgents` visar vilka som är igång.
- `SendMessage` fortsätter en agent som redan har kontexten. Använd det för
  följdfrågor — att starta en ny agent innebär att allt läses in igen.
- Hittar du hellre nästa uppgift åt en agent som blivit klar än startar en
  till: en agent som redan kan området är billigare än en ny.

Hitta du på vad en agent som fortfarande arbetar kommer att svara är alltid
fel. Vänta på beskedet.

---

## Steg 6 — Samla ihop

**Det här är ditt jobb, aldrig en agents.** Ingen agent har sett helheten.

1. Läs igenom vad var och en faktiskt ändrade — lita inte på rapporten.
2. Sätt ihop delarna och lös konflikterna i de gemensamma filerna.
3. Kör projektets riktiga kontroller: tester, linter, typkontroll, bygge.
4. Läs den samlade diffen som en helhet. Delar som var rimliga var för sig
   blir ofta motsägelsefulla ihop — två agenter som löste samma sak på två
   sätt, dubbla hjälpfunktioner, namn som inte hänger ihop.
5. Berätta för användaren vad som gjordes, inte hur många agenter som körde.

Grönt bygge är kravet. Att alla agenter rapporterade "klart" är det inte.

---

## Vanliga misstag

| Misstag | Vad som händer |
| --- | --- |
| Två agenter äger samma fil | Sista skrivningen vinner, tyst |
| Briefing utan kontext | Agenten gräver fram det du redan visste |
| Fan-out på för små delar | Långsammare än att göra det själv |
| Litar på rapporten | "Klart" utan att något kördes |
| Ny agent för en följdfråga | Kastar bort kontexten som redan fanns |
| Integrationen lämnad till en agent | Ingen av dem har sett helheten |

---

## Referenser

- `references/roster.md` — hjältarnas roller, verktyg och hur du skapar egna.
- `references/uppdrag.md` — färdiga upplägg för vanliga sorters arbete.
