# Laget

Fyra roller med tydligt skilda krafter. Poängen med att hålla dem åtskilda
är inte tematik utan begränsning: en agent som saknar skrivverktyg kan inte
råka skriva, och en agent med ett smalt uppdrag ger ett smalt, användbart
svar i stället för en uppsats.

---

## Scout — spanaren

**Kraft:** ser allt, rör ingenting.
**Verktyg:** läsning och sökning. Inga skrivverktyg.

Till att hitta saker. "Var hanteras inloggningen?", "vilka filer rör
prisberäkningen?", "finns det redan något som gör det här?"

Scout läser utdrag, inte hela filer. Den lokaliserar kod — den granskar den
inte. Vill du ha ett omdöme om kodens kvalitet är det Warden du vill ha.

Be alltid om filsökvägar och radnummer i svaret. Annars får du en
sammanfattning du inte kan agera på.

Flera Scouts samtidigt är ofta rätt: de rör ingenting och kan inte krocka.

---

## Oracle — orakelet

**Kraft:** ser framåt.
**Verktyg:** läsning och sökning. Inga skrivverktyg.

Till att tänka innan något byggs. "Hur bör det här struktureras?", "vad går
sönder om vi byter ut X?", "vilken av de här två vägarna är bäst och varför?"

Oracle lämnar ifrån sig en plan eller ett omdöme, aldrig kod. Be om
avvägningarna, inte bara slutsatsen — och be om en rekommendation, inte en
lista med alternativ.

Kör Oracle *före* Forge, inte parallellt. Att bygga medan planen skrivs
betyder att något byggdes på fel plan.

---

## Forge — byggaren

**Kraft:** bygger.
**Verktyg:** alla.

Till att faktiskt skriva koden för en avgränsad del.

Forge är den enda rollen som ändrar filer, och därför den enda som kan
förstöra för de andra. Två regler:

1. **Exklusivt ägarskap.** Briefingen räknar upp de filer Forge får ändra.
   Ingen annan agent har någon av dem.
2. **Isolera vid parallellt bygge.** Kör flera Forge samtidigt: ge var och en
   `isolation: "worktree"`, så arbetar de i varsin git-worktree.

Briefingen ska säga vilka kommandon som ska vara gröna innan uppdraget är
klart. Utan det får du kod som ser klar ut.

---

## Warden — väktaren

**Kraft:** misstror allt.
**Verktyg:** läsning, sökning och möjlighet att köra tester.

Till att leta hål. Granska en diff, köra testerna, hitta det som går sönder.

Warden ska vara uttalat misstänksam. En briefing som säger "granska det här"
ger artiga kommentarer; en som säger "hitta indata som får det här att ge fel
svar eller krascha" ger buggar.

Kör Warden *efter* Forge, på det som faktiskt byggdes. Att granska något som
fortfarande skrivs är bortkastat.

---

## Egna hjältar

En hjälte är en fil i `.claude/agents/` med frontmatter:

```markdown
---
name: namnet-du-anropar-med
description: När den här hjälten ska användas.
tools: Read, Grep, Glob
---

Systemprompten. Skriv den som en rollbeskrivning: vad hjälten är bra på,
hur svaret ska se ut, och vad den aldrig ska göra.
```

- `name` är det du sätter som `subagent_type` när du startar agenten.
- `tools` begränsar verktygen. Utelämnas den ärvs alla. Var snål — det är
  den enskilt viktigaste raden.
- `model` kan läggas till för att köra hjälten på en annan modell än den som
  kör just nu. Kör `/model` för att se vilka som finns.

Namnen krockar med andra agenter om de heter likadant. Byt namn på filerna
om du redan har en `scout` eller `oracle` i projektet.

---

## Inbyggda alternativ

Behöver du inte egna roller finns färdiga typer att sätta som
`subagent_type`:

| Typ | Motsvarar ungefär |
| --- | --- |
| `Explore` | Scout — läser bara, byggd för breda sökningar |
| `Plan` | Oracle — arkitektur och upplägg |
| `general-purpose` | Forge — alla verktyg, öppet uppdrag |
