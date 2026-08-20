# Upplägg för vanliga uppdrag

Fyra mönster som täcker det mesta. Varje mönster säger vilka hjältar som
körs, i vilken ordning och vad du får tillbaka.

---

## 1. Spaning på bredden

**När:** du behöver veta hur något hänger ihop i en kodbas du inte kan.

**Upplägg:** flera Scouts parallellt, en fråga var. De rör inget och kan inte
krocka, så det finns ingen anledning att köra dem i tur och ordning.

```
Scout A → "Var definieras datamodellerna? Ge sökvägar och radnummer."
Scout B → "Var sker anropen mot externa API:er? Ge sökvägar och radnummer."
Scout C → "Hur ser testupplägget ut? Vilka kommandon kör testerna?"
```

**Du får:** tre konkreta kartor. Du sätter ihop bilden.

**Fallgrop:** frågor som överlappar ger tre svar på samma sak. Skär frågorna
efter område, inte efter formulering.

---

## 2. Parallellt bygge

**När:** en funktion som delar sig i delar som inte rör samma filer.

**Upplägg:** Oracle först om upplägget är oklart. Sedan flera Forge
parallellt, var och en med sina egna filer och `isolation: "worktree"`.
Warden sist på den samlade diffen.

```
Oracle  → planen och gränsdragningen
   ↓
Forge A → äger src/api/**        Forge B → äger src/ui/**
   ↓
du      → sätter ihop, löser gemensamma filer, kör bygget
   ↓
Warden  → granskar helheten
```

**Du får:** delar som går att sätta ihop.

**Fallgrop:** gemensamma filer — routing, `package.json`, typdefinitioner
som båda behöver. Antingen äger du dem själv, eller så gör Oracle dem klara
*före* bygget så ingen Forge behöver röra dem.

---

## 3. Bygg och granska i par

**När:** en avgränsad ändring där det är viktigare att den blir rätt än att
den blir snabb.

**Upplägg:** Forge bygger, Warden granskar, du avgör vad som ska åtgärdas.
Kör två varv om granskningen hittar något av vikt.

```
Forge  → bygger
   ↓
Warden → "hitta indata som ger fel svar eller krasch"
   ↓
du     → avgör vad som är verkligt och skickar tillbaka till Forge
```

**Du får:** en ändring som någon har försökt slå sönder.

**Fallgrop:** att skicka Wardens fynd rakt till Forge utan att bedöma dem.
Granskare hittar också saker som inte är problem. Du är filtret.

---

## 4. Två vägar mot varandra

**När:** ett vägval där argumenten går isär och ingen vet svaret.

**Upplägg:** två Oracle, en per väg, var och en med uppdraget att utreda
sin väg på riktigt — inte att argumentera för den.

```
Oracle A → "Utred väg 1. Vad kostar den, vad går sönder, vad blir enklare?"
Oracle B → "Utred väg 2. Samma frågor."
   ↓
du       → jämför och rekommenderar
```

**Du får:** två underbyggda utredningar i stället för en magkänsla.

**Fallgrop:** att be dem argumentera. Två advokater ger två partsinlagor.
Be om kostnader och konsekvenser, så går svaren att jämföra.

---

## Att välja rätt

| Situationen | Mönstret |
| --- | --- |
| Vet inte var något finns | 1 — spaning på bredden |
| Vet vad som ska byggas, det är stort | 2 — parallellt bygge |
| Vet vad som ska byggas, det är känsligt | 3 — bygg och granska i par |
| Vet inte vilken väg som är rätt | 4 — två vägar mot varandra |
| Inget av ovanstående | Gör det själv |

Sista raden är den som används mest.
