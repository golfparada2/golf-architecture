/**
 * ROUTING — simulace.js
 * ============================================================================
 * Statistický model hry — zajímá nás kam míč dopadne a jak často, ne jak se
 * točí. Čísla podle zadání, část 8. Používá `js/platy.js` pro nic (je čistě
 * matematický), ale kreslicí kód v lekcích ho importuje vedle `platy.js` a
 * kreslí podle toho, co tenhle modul spočítá.
 *
 * ROZPTYLY jsou směrodatné odchylky normálního rozdělení (Gaussovo
 * rozdělení), ne maximální odchylka — hráč se semkne kolem cíle většinou
 * blíž, než rozptyl napovídá, ale občas i o dost dál.
 * ============================================================================
 */

/**
 * Čtyři referenční hráči podle hendikepu. Vzdálenosti v metrech.
 * Kalibrace podle zadání, část 8 (veřejná data Arccos/USGA o rozptylu ran
 * podle hendikepu) — pokud se čísla někdy upraví, zdůvodni to v
 * `poznamky.md`, ne jen v komentáři tady.
 */
export const HRACI = {
  0:  { hcp: 0,  jmeno: 'HCP 0',  drive: 250, sigLong: 13, sigLat: 18, maxIron: 185 },
  9:  { hcp: 9,  jmeno: 'HCP 9',  drive: 220, sigLong: 15, sigLat: 26, maxIron: 165 },
  18: { hcp: 18, jmeno: 'HCP 18', drive: 195, sigLong: 18, sigLat: 34, maxIron: 150 },
  24: { hcp: 24, jmeno: 'HCP 24', drive: 175, sigLong: 20, sigLat: 42, maxIron: 140 },
};

/**
 * Boční chyba přiblížení na green jako podíl vzdálenosti rány — 6 % u
 * HCP 0, 12 % u HCP 24, lineárně interpolováno mezi nimi (zadání dává jen
 * dva krajní body, ne čísla pro HCP 9/18).
 * @param {number} hcp
 * @returns {number} — podíl, ne procento (0.06–0.12)
 */
export function bocniChyba(hcp) {
  return 0.06 + (Math.min(Math.max(hcp, 0), 24) / 24) * 0.06;
}

/** Podélná chyba přiblížení na green — konstantní 7 % vzdálenosti rány pro všechny hráče. */
export const PODELNA_CHYBA = 0.07;

/** Multiplikátory rozptylu a dosahu podle ležení (zadání, část 8). */
export const LEZENI = {
  fairway: { rozptyl: 1.0, dosah: 1.0 },
  rough:   { rozptyl: 1.35, dosah: 0.9 },
  bunkr:   { rozptyl: 1.6, dosah: 0.75 },
};

/** Strop ran na jamce. */
export const MAX_RAN = 10;

/**
 * Náhodné číslo z normálního (Gaussova) rozdělení, střed 0, směrodatná
 * odchylka 1 — Box–Muller transformace. Volej `rnd` pro vlastní zdroj
 * náhody (výchozí `Math.random`); pro deterministické opakování testů
 * dosaď generátor z `platy.js` → `rng(seed)`.
 * @param {() => number} [rnd]
 */
export function gauss(rnd = Math.random) {
  let u = 0, v = 0;
  while (!u) u = rnd();
  while (!v) v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Očekávaný počet ran na putty podle vzdálenosti od jamky v metrech
 * (zadání, část 8).
 * @param {number} distM
 */
export function putty(distM) {
  if (distM < 2) return 1.60;
  if (distM < 5) return 1.85;
  if (distM < 10) return 2.05;
  if (distM < 20) return 2.25;
  return 2.50;
}

/**
 * Totéž jako `putty()`, ale plynule interpolované mezi středy pásem místo
 * skoků na hranicích — pro grafy řízené posuvníkem (např. pracovní plát
 * „Kde je rovnováha"), kde by schodovitá funkce na malém rozsahu vzdáleností
 * často vůbec nezareagovala na pohyb jezdce (student by viděl plochou
 * čáru a myslel by si, že je něco rozbité). Kotevní body mají stejné
 * hodnoty jako středy pásem `putty()`; mimo krajní kotvy je funkce plochá.
 * @param {number} distM
 */
const PUTTY_KOTVY = [[0, 1.60], [1, 1.60], [3.5, 1.85], [7.5, 2.05], [15, 2.25], [25, 2.50]];
export function puttyPlynule(distM) {
  const k = PUTTY_KOTVY;
  if (distM <= k[0][0]) return k[0][1];
  if (distM >= k[k.length - 1][0]) return k[k.length - 1][1];
  for (let i = 0; i < k.length - 1; i++) {
    const [d0, v0] = k[i], [d1, v1] = k[i + 1];
    if (distM >= d0 && distM <= d1) return v0 + (v1 - v0) * ((distM - d0) / (d1 - d0));
  }
  return k[k.length - 1][1];
}

/**
 * Přibližná distribuční funkce normovaného normálního rozdělení
 * (Abramowitz–Stegun 26.2.17, chyba < 7.5×10⁻⁸) — kolik procent hodnot
 * padne pod `z` směrodatných odchylek od středu. Používá se k odhadu
 * pravděpodobnosti, že rána mine bezpečnou marži kolem hazardu (viz
 * `js/simulace.js` v pracovním plátu „Kde je rovnováha").
 * @param {number} z
 * @returns {number} — 0 až 1
 */
export function normCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) p = 1 - p;
  return p;
}

/**
 * Odehraje jednu jamku jedním hráčem proti zadanému cíli odpalu. Volající
 * kód dodá geometrii přes `resolveLie(x, y)`, která pro libovolný bod
 * vrátí `{ typ: 'fairway'|'rough'|'bunkr'|'green', trest?: boolean, x?, y? }`
 * — `trest: true` znamená vodu nebo OB (viz `x`/`y` jako místo, kam se míč
 * vrací). Souřadnice jsou v metrech, střed osy odpaliště = (0, 0), `y`
 * roste směrem k jamce.
 *
 * DVA RŮZNÉ „DOPADY": `dopadOdpalu` je místo, kam skutečně dosedla ODPALOVÁ
 * rána (než ji další rány v cyklu posunou dál) — tohle chce vykreslit
 * cvičení „Kam patří bunkr“, kde jde o rozptyl DRIVU, ne o to, kde hra na
 * jamce skončila. `dopad` je naopak KONEČNÁ poloha míče (typicky na
 * greenu) — pro případ, že by budoucí cvičení chtělo vidět tohle misto.
 * Nepleť si je: `dopadOdpalu` × `dopad` nejsou totéž od druhé rány dál.
 *
 * @param {{hcp:number,drive:number,sigLong:number,sigLat:number,maxIron:number}} hrac
 * @param {{pin:{x:number,y:number}, aim:{x:number,y:number},
 *   resolveLie:(x:number,y:number)=>Object, rnd?:()=>number, maxRan?:number}} opts
 * @returns {{rany:number, dopad:{x:number,y:number}, dopadOdpalu:{x:number,y:number},
 *   fairway:boolean, bunkr:boolean, trest:boolean}}
 */
export function odehrajJamku(hrac, { pin, aim, resolveLie, rnd = Math.random, maxRan = MAX_RAN }) {
  const cilVzdal = Math.hypot(aim.x, aim.y) || 1;
  const dosah = Math.min(cilVzdal, hrac.drive * 1.02);
  const ux = aim.x / cilVzdal, uy = aim.y / cilVzdal;
  const dist = dosah + gauss(rnd) * hrac.sigLong;
  const lat = gauss(rnd) * hrac.sigLat;
  let x = ux * dist - uy * lat;
  let y = uy * dist + ux * lat;
  const dopadOdpalu = { x, y };

  let ran = 1, fairway = false, bunkr = false, trest = false;
  let lie = resolveLie(x, y);
  if (lie.trest) {
    ran++; trest = true; x = lie.x; y = lie.y; lie = { typ: 'rough' };
  } else if (lie.typ === 'fairway') {
    fairway = true;
  } else if (lie.typ === 'bunkr') {
    bunkr = true;
  } else if (lie.typ === 'green') {
    return { rany: 1 + putty(Math.hypot(pin.x - x, pin.y - y)), dopad: { x, y }, dopadOdpalu, fairway: true, bunkr: false, trest: false };
  }

  for (let n = 0; n < maxRan; n++) {
    ran++;
    const l = LEZENI[lie.typ] || LEZENI.fairway;
    const dx = pin.x - x, dy = pin.y - y;
    const zbyva = Math.hypot(dx, dy) || 1;
    const d = Math.min(zbyva, hrac.maxIron * l.dosah);
    const nx = dx / zbyva, ny = dy / zbyva;
    const chybaB = gauss(rnd) * bocniChyba(hrac.hcp) * d * l.rozptyl;
    const chybaP = gauss(rnd) * PODELNA_CHYBA * d * l.rozptyl;
    x += nx * (d + chybaP) - ny * chybaB;
    y += ny * (d + chybaP) + nx * chybaB;

    const r = resolveLie(x, y);
    if (r.trest) { ran++; trest = true; x = r.x; y = r.y; lie = { typ: 'rough' }; continue; }
    if (r.typ === 'green') { ran += putty(Math.hypot(pin.x - x, pin.y - y)); lie = r; break; }
    lie = r;
  }
  return { rany: Math.min(ran, maxRan), dopad: { x, y }, dopadOdpalu, fairway, bunkr, trest };
}

/**
 * Odehraje `n` kol (výchozí 100, viz zadání pro pracovní plát „Kam patří
 * bunkr") a vrátí souhrnné statistiky. `dopady` jsou místa dopadu ODPALOVÉ
 * rány (`dopadOdpalu` z `odehrajJamku`), ne konečná poloha na jamce — to je
 * to, co cvičení s umístěním bunkru skutečně chce vykreslit.
 * @param {Object} hrac
 * @param {Object} opts — stejné jako u `odehrajJamku`, bez `rnd` se použije `Math.random`
 * @param {number} [n=100]
 */
export function odehrajKolo(hrac, opts, n = 100) {
  let sumRan = 0, fw = 0, bk = 0, tr = 0;
  const dopady = [];
  for (let i = 0; i < n; i++) {
    const r = odehrajJamku(hrac, opts);
    sumRan += r.rany;
    if (r.fairway) fw++;
    if (r.bunkr) bk++;
    if (r.trest) tr++;
    dopady.push(r.dopadOdpalu);
  }
  return {
    prumer: sumRan / n,
    fairwayPct: (fw / n) * 100,
    bunkrPct: (bk / n) * 100,
    trestPct: (tr / n) * 100,
    dopady,
  };
}
