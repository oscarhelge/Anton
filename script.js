/* =========================================================
   3 i rad – spellogik
   Filen är uppdelad i:
   1. Konstanter
   2. Speltillstånd
   3. Referenser till HTML-element
   4. Uppritning av spelplanen
   5. Att göra ett drag
   6. Regler: vinst och oavgjort
   7. Datorns drag (lätt, medel, svår)
   8. Knappar: ny omgång, ångra, nollställ poäng
   9. Tema (mörkt/ljust)
   10. Start
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   1. Konstanter
   --------------------------------------------------------- */

/* Rutorna numreras 0-8 så här:

     0 | 1 | 2
    ---+---+---
     3 | 4 | 5
    ---+---+---
     6 | 7 | 8
*/

// De åtta raderna som ger vinst.
const VINNANDE_RADER = [
  [0, 1, 2], // översta raden
  [3, 4, 5], // mittenraden
  [6, 7, 8], // nedersta raden
  [0, 3, 6], // vänstra kolumnen
  [1, 4, 7], // mittenkolumnen
  [2, 5, 8], // högra kolumnen
  [0, 4, 8], // diagonal uppifrån vänster
  [2, 4, 6]  // diagonal uppifrån höger
];

// X börjar alltid. I läget "mot datorn" är människan X och datorn O.
const SPELARE_X = "X";
const SPELARE_O = "O";

/* ---------------------------------------------------------
   2. Speltillstånd
   Här ligger allt som beskriver hur spelet ser ut just nu.
   --------------------------------------------------------- */

const spel = {
  // Spelplanen: nio platser som är null, "X" eller "O".
  plan: new Array(9).fill(null),

  // Är omgången slut (någon vann eller det blev oavgjort)?
  slut: false,

  // De tre rutorna som gav vinst, eller null om ingen har vunnit.
  vinnandeRad: null,

  // Vem vann senaste omgången: "X", "O", "oavgjort" eller null.
  sistaResultat: null,

  // Spelläge: "tva" (två spelare) eller "dator" (mot datorn).
  lage: "tva",

  // Svårighetsgrad mot datorn: "latt", "medel" eller "svar".
  svarighet: "medel",

  // Alla drag som gjorts, i tur och ordning. Används av ångra-knappen.
  historik: [],

  // Sant medan datorn "tänker", så att man inte hinner klicka emellan.
  datornTanker: false
};

// Poäng för hela sessionen (nollställs när sidan laddas om).
const poang = {
  X: 0,
  O: 0,
  oavgjort: 0
};

/* ---------------------------------------------------------
   3. Referenser till HTML-element
   --------------------------------------------------------- */

const spelplanEl = document.getElementById("spelplan");
const statusEl = document.getElementById("statusText");

const lageValEl = document.getElementById("lageVal");
const svarighetValEl = document.getElementById("svarighetVal");
const svarighetsBoxEl = document.getElementById("svarighetsBox");

const poangXEl = document.getElementById("poangX");
const poangOEl = document.getElementById("poangO");
const poangOavgjortEl = document.getElementById("poangOavgjort");
const etikettXEl = document.getElementById("etikettX");
const etikettOEl = document.getElementById("etikettO");

const nyOmgangKnapp = document.getElementById("nyOmgangKnapp");
const angraKnapp = document.getElementById("angraKnapp");
const nollstallKnapp = document.getElementById("nollstallKnapp");
const temaKnapp = document.getElementById("temaKnapp");
const temaIkon = document.getElementById("temaIkon");

// De nio knapparna i rutnätet. Fylls i av skapaSpelplan().
const rutor = [];

/* ---------------------------------------------------------
   4. Uppritning av spelplanen
   --------------------------------------------------------- */

/**
 * Skapar de nio knapparna i rutnätet en gång, när sidan laddas.
 */
function skapaSpelplan() {
  for (let index = 0; index < 9; index++) {
    const ruta = document.createElement("button");
    ruta.type = "button";
    ruta.className = "ruta";
    ruta.dataset.index = String(index);
    ruta.setAttribute("aria-label", "Ruta " + (index + 1));

    // Varje ruta lyssnar på klick och skickar vidare sitt eget nummer.
    ruta.addEventListener("click", function () {
      hanteraKlick(index);
    });

    spelplanEl.appendChild(ruta);
    rutor.push(ruta);
  }
}

/**
 * Ritar om hela spelplanen så att den stämmer med spel.plan.
 */
function ritaOmPlanen() {
  const harVinnare = spel.vinnandeRad !== null;
  spelplanEl.classList.toggle("har-vinnare", harVinnare);

  for (let index = 0; index < 9; index++) {
    const ruta = rutor[index];
    const tecken = spel.plan[index];

    ruta.classList.remove("vinnande");

    if (tecken === null) {
      ruta.textContent = "";
      ruta.classList.remove("spelare-x", "spelare-o");
    } else if (ruta.textContent !== tecken) {
      // Rutan har precis fått ett nytt tecken. Tecknet läggs i en egen
      // <span> så att pop-animationen bara gäller själva symbolen.
      // Vi rör bara rutor som faktiskt har ändrats, annars skulle alla
      // gamla X och O poppa fram på nytt vid varje drag.
      const markering = document.createElement("span");
      markering.className = "markering";
      markering.textContent = tecken;
      ruta.replaceChildren(markering);

      ruta.classList.remove("spelare-x", "spelare-o");
      ruta.classList.add(tecken === SPELARE_X ? "spelare-x" : "spelare-o");
    }

    // Uppläsningsstöd: berätta vad rutan innehåller.
    ruta.setAttribute(
      "aria-label",
      "Ruta " + (index + 1) + (tecken === null ? ", tom" : ", " + tecken)
    );

    // En ruta går att klicka på om den är tom, omgången pågår
    // och det inte är datorns tur.
    ruta.disabled = tecken !== null || spel.slut || spel.datornTanker;

    // Markera den vinnande raden.
    if (harVinnare && spel.vinnandeRad.includes(index)) {
      ruta.classList.add("vinnande");
    }
  }

  // Ångra-knappen är bara meningsfull om något drag har gjorts.
  angraKnapp.disabled = spel.historik.length === 0 || spel.datornTanker;
}

/**
 * Räknar ut vems tur det är utifrån hur många drag som gjorts.
 * X börjar, så jämnt antal drag betyder att det är X:s tur.
 */
function turenTillhor() {
  return spel.historik.length % 2 === 0 ? SPELARE_X : SPELARE_O;
}

/**
 * Ger ett läsbart namn på en spelare, anpassat efter spelläget.
 */
function namnPa(tecken) {
  if (spel.lage === "dator") {
    return tecken === SPELARE_X ? "Du" : "Datorn";
  }
  return "Spelare " + tecken;
}

/**
 * Uppdaterar textraden ovanför spelplanen.
 */
function uppdateraStatus() {
  statusEl.classList.remove("status--vinst");

  if (spel.slut) {
    if (spel.sistaResultat === "oavgjort") {
      statusEl.textContent = "Oavgjort!";
    } else {
      const namn = namnPa(spel.sistaResultat);
      // "Du vann!" men "Datorn vann!" – båda fungerar med samma mall.
      statusEl.textContent = namn + " vann!";
      statusEl.classList.add("status--vinst");
    }
    return;
  }

  if (spel.datornTanker) {
    statusEl.textContent = "Datorn tänker …";
    return;
  }

  if (spel.lage === "dator") {
    statusEl.textContent = "Din tur (" + SPELARE_X + ")";
  } else {
    statusEl.textContent = "Tur: Spelare " + turenTillhor();
  }
}

/**
 * Skriver ut poängen och sätter rätt etiketter för spelläget.
 */
function uppdateraPoangtavla() {
  poangXEl.textContent = String(poang.X);
  poangOEl.textContent = String(poang.O);
  poangOavgjortEl.textContent = String(poang.oavgjort);

  if (spel.lage === "dator") {
    etikettXEl.textContent = "Vinster (du)";
    etikettOEl.textContent = "Förluster (dator)";
  } else {
    etikettXEl.textContent = "Spelare X";
    etikettOEl.textContent = "Spelare O";
  }
}

/* ---------------------------------------------------------
   5. Att göra ett drag
   --------------------------------------------------------- */

/**
 * Körs när användaren klickar på en ruta.
 */
function hanteraKlick(index) {
  // Ignorera klicket om omgången är slut, rutan är upptagen
  // eller datorn håller på att dra.
  if (spel.slut || spel.plan[index] !== null || spel.datornTanker) {
    return;
  }

  gorDrag(index, turenTillhor());

  // Om omgången fortfarande pågår och vi spelar mot datorn
  // är det nu datorns tur.
  if (!spel.slut && spel.lage === "dator") {
    startaDatornsDrag();
  }
}

/**
 * Lägger ett tecken i en ruta och kontrollerar om omgången är slut.
 */
function gorDrag(index, tecken) {
  spel.plan[index] = tecken;
  spel.historik.push(index);

  kontrolleraOmgangen();
  ritaOmPlanen();
  uppdateraStatus();
}

/* ---------------------------------------------------------
   6. Regler: vinst och oavgjort
   --------------------------------------------------------- */

/**
 * Letar efter tre i rad på en spelplan.
 * Returnerar { tecken, rad } vid vinst, annars null.
 * Funktionen tar emot planen som argument så att minimax kan
 * använda samma funktion på sina egna testplaner.
 */
function hittaVinnare(plan) {
  for (const rad of VINNANDE_RADER) {
    const [a, b, c] = rad;
    if (plan[a] !== null && plan[a] === plan[b] && plan[a] === plan[c]) {
      return { tecken: plan[a], rad: rad };
    }
  }
  return null;
}

/**
 * Ger en lista med alla tomma rutor på en plan.
 */
function ledigaRutor(plan) {
  const lediga = [];
  for (let index = 0; index < plan.length; index++) {
    if (plan[index] === null) {
      lediga.push(index);
    }
  }
  return lediga;
}

/**
 * Kollar om omgången är avgjord och uppdaterar poängen i så fall.
 */
function kontrolleraOmgangen() {
  const resultat = hittaVinnare(spel.plan);

  if (resultat) {
    spel.slut = true;
    spel.vinnandeRad = resultat.rad;
    spel.sistaResultat = resultat.tecken;
    poang[resultat.tecken] += 1;
  } else if (ledigaRutor(spel.plan).length === 0) {
    // Planen är full utan tre i rad.
    spel.slut = true;
    spel.vinnandeRad = null;
    spel.sistaResultat = "oavgjort";
    poang.oavgjort += 1;
  }

  uppdateraPoangtavla();
}

/* ---------------------------------------------------------
   7. Datorns drag
   --------------------------------------------------------- */

/**
 * Startar datorns drag med en kort paus, så att det känns som
 * att den tänker i stället för att svara blixtsnabbt.
 */
function startaDatornsDrag() {
  spel.datornTanker = true;
  ritaOmPlanen();
  uppdateraStatus();

  setTimeout(function () {
    spel.datornTanker = false;

    // Omgången kan ha startats om medan pausen pågick.
    if (spel.slut || ledigaRutor(spel.plan).length === 0) {
      ritaOmPlanen();
      uppdateraStatus();
      return;
    }

    const index = valjDatorDrag();
    gorDrag(index, SPELARE_O);
  }, 350);
}

/**
 * Väljer vilken ruta datorn ska ta, utifrån vald svårighetsgrad.
 */
function valjDatorDrag() {
  if (spel.svarighet === "latt") {
    return dragLatt(spel.plan);
  }
  if (spel.svarighet === "medel") {
    return dragMedel(spel.plan);
  }
  return dragSvar(spel.plan);
}

/**
 * LÄTT: datorn tar en helt slumpmässig ledig ruta.
 */
function dragLatt(plan) {
  const lediga = ledigaRutor(plan);
  const slumpPlats = Math.floor(Math.random() * lediga.length);
  return lediga[slumpPlats];
}

/**
 * MEDEL: datorn vinner om den kan, blockerar annars spelarens
 * vinst, och drar i övrigt slumpmässigt.
 */
function dragMedel(plan) {
  // 1. Finns det ett drag som gör att datorn vinner direkt?
  const vinstDrag = hittaAvgorandeDrag(plan, SPELARE_O);
  if (vinstDrag !== null) {
    return vinstDrag;
  }

  // 2. Är motståndaren på väg att vinna? Blockera i så fall.
  const blockDrag = hittaAvgorandeDrag(plan, SPELARE_X);
  if (blockDrag !== null) {
    return blockDrag;
  }

  // 3. Annars: slumpmässigt drag.
  return dragLatt(plan);
}

/**
 * Letar efter en ruta där `tecken` får tre i rad på nästa drag.
 * Returnerar rutans nummer, eller null om det inte finns någon.
 */
function hittaAvgorandeDrag(plan, tecken) {
  for (const index of ledigaRutor(plan)) {
    // Testa draget på en kopia av planen.
    const testPlan = plan.slice();
    testPlan[index] = tecken;

    const resultat = hittaVinnare(testPlan);
    if (resultat && resultat.tecken === tecken) {
      return index;
    }
  }
  return null;
}

/**
 * SVÅR: minimax. Datorn provar alla möjliga fortsättningar av
 * partiet och väljer det drag som ger bäst resultat även om
 * motståndaren spelar perfekt. Mot den här går det inte att vinna.
 */
function dragSvar(plan) {
  const resultat = minimax(plan, SPELARE_O, 0);
  return resultat.drag;
}

/**
 * Minimax-algoritmen.
 *
 * plan     – spelplanen som ska utvärderas
 * iTur     – vems tur det är i den här tänkta ställningen
 * djup     – hur många drag in i framtiden vi är
 *
 * Returnerar { poang, drag } där poäng är:
 *   positivt  = bra för datorn (O)
 *   negativt  = bra för spelaren (X)
 *   0         = oavgjort
 *
 * Vi drar av djupet från poängen så att datorn föredrar att
 * vinna snabbt och att förlora så sent som möjligt.
 */
function minimax(plan, iTur, djup) {
  const resultat = hittaVinnare(plan);

  if (resultat) {
    if (resultat.tecken === SPELARE_O) {
      return { poang: 10 - djup, drag: null };
    }
    return { poang: djup - 10, drag: null };
  }

  const lediga = ledigaRutor(plan);
  if (lediga.length === 0) {
    return { poang: 0, drag: null }; // Full plan utan vinnare = oavgjort.
  }

  // Datorn (O) vill ha så hög poäng som möjligt,
  // spelaren (X) vill ha så låg poäng som möjligt.
  const datornsTur = iTur === SPELARE_O;
  let bastaPoang = datornsTur ? -Infinity : Infinity;
  let bastaDrag = lediga[0];

  for (const index of lediga) {
    const testPlan = plan.slice();
    testPlan[index] = iTur;

    // Räkna ut vad som händer efter det här draget, med
    // motståndaren vid rodret.
    const nastaTur = datornsTur ? SPELARE_X : SPELARE_O;
    const utfall = minimax(testPlan, nastaTur, djup + 1);

    if (datornsTur ? utfall.poang > bastaPoang : utfall.poang < bastaPoang) {
      bastaPoang = utfall.poang;
      bastaDrag = index;
    }
  }

  return { poang: bastaPoang, drag: bastaDrag };
}

/* ---------------------------------------------------------
   8. Knappar
   --------------------------------------------------------- */

/**
 * Startar en ny omgång men behåller poängen.
 */
function nyOmgang() {
  spel.plan = new Array(9).fill(null);
  spel.slut = false;
  spel.vinnandeRad = null;
  spel.sistaResultat = null;
  spel.historik = [];
  spel.datornTanker = false;

  ritaOmPlanen();
  uppdateraStatus();
}

/**
 * Tar tillbaka senaste draget.
 *
 * I läget "mot datorn" tas två drag bort: datorns svar och ditt
 * eget drag. Annars skulle datorn bara lägga tillbaka samma drag
 * direkt och ångra-knappen kändes meningslös.
 */
function angraDrag() {
  if (spel.historik.length === 0 || spel.datornTanker) {
    return;
  }

  // Om omgången redan var avgjord ska poängen som just delades ut
  // tas tillbaka igen.
  if (spel.slut && spel.sistaResultat !== null) {
    if (spel.sistaResultat === "oavgjort") {
      poang.oavgjort = Math.max(0, poang.oavgjort - 1);
    } else {
      poang[spel.sistaResultat] = Math.max(0, poang[spel.sistaResultat] - 1);
    }
  }

  spel.slut = false;
  spel.vinnandeRad = null;
  spel.sistaResultat = null;

  taBortSenasteDrag();

  // I datorläge: ta bort ytterligare ett drag om det nu skulle
  // vara datorns tur, så att bollen hamnar hos dig igen.
  if (spel.lage === "dator" && turenTillhor() === SPELARE_O && spel.historik.length > 0) {
    taBortSenasteDrag();
  }

  uppdateraPoangtavla();
  ritaOmPlanen();
  uppdateraStatus();
}

/**
 * Plockar bort det sist spelade draget från planen och historiken.
 */
function taBortSenasteDrag() {
  const index = spel.historik.pop();
  spel.plan[index] = null;
}

/**
 * Nollställer poängtavlan och startar en ny omgång.
 */
function nollstallPoang() {
  poang.X = 0;
  poang.O = 0;
  poang.oavgjort = 0;

  uppdateraPoangtavla();
  nyOmgang();
}

/**
 * Körs när man byter spelläge i rullgardinsmenyn.
 * Poängen nollställs eftersom siffrorna betyder olika saker i de
 * två lägena (spelare X/O respektive du/datorn).
 */
function bytLage(nyttLage) {
  spel.lage = nyttLage;
  svarighetsBoxEl.hidden = nyttLage !== "dator";

  nollstallPoang();
}

/* ---------------------------------------------------------
   9. Tema (mörkt/ljust)
   --------------------------------------------------------- */

/**
 * Uppdaterar ikonen på temaknappen så att den visar vad man
 * byter TILL om man klickar.
 */
function uppdateraTemaIkon() {
  const nuvarandeTema = document.documentElement.getAttribute("data-theme");
  temaIkon.textContent = nuvarandeTema === "dark" ? "☀️" : "🌙";
}

/**
 * Växlar mellan mörkt och ljust tema och sparar valet i webbläsaren.
 */
function vaxlaTema() {
  const nuvarandeTema = document.documentElement.getAttribute("data-theme");
  const nyttTema = nuvarandeTema === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", nyttTema);

  // Spara valet så att det finns kvar nästa gång sidan öppnas.
  // localStorage kan vara blockerat, och då ska spelet ändå fungera.
  try {
    localStorage.setItem("treIRad.tema", nyttTema);
  } catch (fel) {
    /* Temat gäller ändå för den här sidvisningen. */
  }

  uppdateraTemaIkon();
}

/* ---------------------------------------------------------
   10. Start
   --------------------------------------------------------- */

/**
 * Kopplar ihop alla knappar och startar första omgången.
 */
function startaSpelet() {
  skapaSpelplan();

  nyOmgangKnapp.addEventListener("click", nyOmgang);
  angraKnapp.addEventListener("click", angraDrag);
  nollstallKnapp.addEventListener("click", nollstallPoang);
  temaKnapp.addEventListener("click", vaxlaTema);

  lageValEl.addEventListener("change", function (handelse) {
    bytLage(handelse.target.value);
  });

  svarighetValEl.addEventListener("change", function (handelse) {
    spel.svarighet = handelse.target.value;
    nyOmgang();
  });

  // Se till att spelet startar i samma läge som menyerna visar.
  spel.lage = lageValEl.value;
  spel.svarighet = svarighetValEl.value;
  svarighetsBoxEl.hidden = spel.lage !== "dator";

  uppdateraTemaIkon();
  uppdateraPoangtavla();
  nyOmgang();
}

startaSpelet();
