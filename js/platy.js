/**
 * ROUTING — platy.js
 * ============================================================================
 * Kreslicí knihovna pro perokresbu se šrafováním, jak se kreslila v golfových
 * almanaších přelomu 19. a 20. století. Vytažena a sjednocena z prototypů
 * `redan-plat-dvojjazycne.html`, `cviceni-bunkr-perokresba.html` a
 * `test-lekce-01.html` — všechny tři obsahovaly téměř identické kopie týchž
 * funkcí, jen s drobně odlišnými výchozími hodnotami. Tady je to na jednom
 * místě, zdokumentované, se stejným chováním všude v kurzu.
 *
 * PRINCIP: nikde v kurzu není bitmapa. Každý tvar (green, bunkr, fairway,
 * jezero, miniatura ve zkoušce) je SVG cesta spočítaná touto knihovnou.
 * Stejná funkce pak vykreslí libovolnou jamku z `data/jamky/*.json` — stačí
 * jí dát jiná čísla.
 *
 * BAREVNOST: funkce v tomto souboru nikdy nemají barvu zapsanou natvrdo.
 * Barvu si volající kód přečte přes `V('--turf')` apod. až v okamžiku
 * kreslení — recoloring celého kurzu je tak otázka úpravy `assets/styl.css`,
 * ne hledání barev v JS.
 *
 * NÁHODA: `rng(seed)` je deterministický generátor (Lehmer/Park–Miller).
 * Stejné semínko → stejný tvar při každém načtení stránky. Různá semínka →
 * různé tvary. Nikdy nepoužívej `Math.random()` uvnitř kreslicích funkcí —
 * jen tam, kde má být kresba záměrně jiná při každém spuštění (např.
 * simulace dopadů v `js/simulace.js`).
 *
 * HUSTOTA ŠRAFURY: `hatch`, `radial` a `stipple` čtou proměnnou CSS
 * `--hatch-density` z elementu, do kterého kreslí (viz `assets/styl.css`,
 * oddíl 2). Na studijním plátu je `1` (plná hustota), na pracovním plátu —
 * stačí dát `class="plate-work"` na `<svg>` — je to `.33`, jak žádá
 * pravidlo 1 ze zadání („čím víc dat na plátu, tím tišší kresba"). Volající
 * kód tedy nikde nepočítá vlastní zeslabené konstanty, jen označí plát.
 *
 * POUŽITÍ (ES modul, žádný build krok):
 *   import { blob, blobPts, hatch, radial, stipple, E, V, clipPath }
 *     from '../js/platy.js';
 * ============================================================================
 */

/** Jmenný prostor SVG — potřeba všude, kde se prvky tvoří přes createElementNS. */
export const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Přečte hodnotu CSS proměnné v místě daného elementu (výchozí `document.body`).
 * Vlastní proměnné (`--turf`, `--ink`, `--hatch-density`, …) se dědí stromem
 * DOM stejně jako jiné CSS vlastnosti, takže čtení na konkrétním elementu
 * (typicky ten, do kterého se právě kreslí) respektuje i lokální přepisy,
 * např. `class="plate-work"` na jednom konkrétním `<svg>`.
 *
 * @param {string} name — jméno proměnné včetně `--`
 * @param {Element} [el] — element, jehož computed style se čte
 * @returns {string} — ořezaná textová hodnota (barva, číslo jako řetězec…)
 */
export function V(name, el = document.body) {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

/**
 * Vytvoří SVG element, nastaví mu atributy a volitelně textový obsah,
 * připojí ho k rodiči a vrátí ho. Základní stavební kámen celé knihovny —
 * všechny ostatní funkce jím tvoří `<path>`, `<g>`, `<circle>` apod.
 *
 * @param {Element} parent — kam se element připojí
 * @param {string} tag — název SVG značky, např. 'path', 'g', 'circle'
 * @param {Object<string,string|number>} [attrs] — atributy k nastavení
 * @param {string} [text] — textový obsah (pro `<text>`)
 * @returns {SVGElement}
 */
export function E(parent, tag, attrs = {}, text) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (text != null) el.textContent = text;
  parent.appendChild(el);
  return el;
}

/** Vyprázdní obsah plátu před překreslením (např. při přepnutí jazyka). */
export function clear(svg) {
  svg.innerHTML = '';
}

/**
 * Deterministický generátor pseudonáhodných čísel z 32bitového semínka
 * (Lehmerův LCG, násobitel 16807, modul 2^31 − 1 — "minimal standard").
 * Volá se jednou na semínko a vrátí funkci, která při každém zavolání
 * vrátí další číslo z intervalu [0, 1).
 *
 * @param {number} seed — celé číslo, různé pro každý tvar na plátu
 * @returns {() => number}
 */
export function rng(seed) {
  let x = seed;
  return () => {
    x = (x * 16807) % 2147483647;
    return x / 2147483647;
  };
}

/**
 * Vytvoří `<clipPath>` s daným `id` obsahující cestu `d` a vloží ho do
 * `defs`. Používá se všude, kde se má šrafura nebo tečkování omezit jen na
 * plochu tvaru (green, bunkr, fairway…) — `hatch()` a `stipple()` níže
 * očekávají existující `clipPath` s tímto `id`.
 *
 * @param {SVGDefsElement} defs
 * @param {string} id
 * @param {string} d — SVG path data, typicky výstup `blob()`
 * @returns {SVGClipPathElement}
 */
export function clipPath(defs, id, d) {
  const c = E(defs, 'clipPath', { id });
  E(c, 'path', { d });
  return c;
}

/**
 * Spočítá SVG path data organického tvaru — elipsa rozvlněná součtem tří
 * sinusovek s náhodnou fází. Tímhle jsou nakreslené všechny greeny, bunkry,
 * jezera a okolní trávníky v kurzu; nic není ruční kresba.
 *
 * @param {number} cx — střed X
 * @param {number} cy — střed Y
 * @param {number} rx — poloosa X před rozvlněním
 * @param {number} ry — poloosa Y před rozvlněním
 * @param {number} rot — natočení tvaru v radiánech
 * @param {number} seed — semínko náhody (stejné → stejný tvar)
 * @param {number} [amp=.09] — amplituda vlnění, 0 = čistá elipsa,
 *   0.05–0.08 jemný tvar (green), 0.15–0.18 nepravidelný tvar (bunkr)
 * @param {number} [n=60] — počet segmentů obrysu; nižší (~40) stačí pro
 *   drobné miniatury (např. obrázkové volby ve zkoušce)
 * @returns {string} — SVG path data (atribut `d`), uzavřená cesta
 */
/* ---------------------------------------------------------------------------
 * Rozvlnění obrysu — JEDNA definice pro `blob()` i `blobPts()`
 *
 * Přepsáno v Kroku 16 podle nového zadání ke schématům reálných jamek.
 * Dvě věci se změnily:
 *
 * 1. Vypadl nejvyšší harmonický člen (sin 7t). Green, bunkr ani odpaliště
 *    nevznikly v přírodě — někdo je nakreslil na papíře a shrnovač je
 *    vyhrnul, takže mají plynulou křivku, ne roztřepený okraj. Vysoká
 *    frekvence dělala z navrženého tvaru chvějící se skvrnu.
 * 2. Amplituda se globálně tlumí koeficientem `TLUMENI`. Kdyby se místo
 *    toho přepsalo `amp` v sedmnácti kartách, rozjelo by se to při první
 *    nové kartě — takhle platí pravidlo na jednom místě.
 *
 * Zbytek nepravidelnosti (chvění pera) zůstává tam, kam patří: na okraji
 * fairwaye a roughu, který skutečně dělá sekačka, ne rýsovací prkno.
 * Ten je ve `fairwayOsa()`.
 * ------------------------------------------------------------------------ */
const TLUMENI = 0.55;

function fazeObrysu(seed) {
  const r = rng(seed);
  return [r() * 6.28, r() * 6.28];
}

function vlnaObrysu(amp, ph, t) {
  return 1 + amp * TLUMENI * (Math.sin(t * 3 + ph[0]) * 0.72 + Math.sin(t * 5 + ph[1]) * 0.28);
}

/**
 * Pole bodů → plynulá uzavřená cesta (Catmull–Rom převedená na kubické
 * Bézierovy segmenty). Křivka prochází PŘESNĚ zadanými body, takže normály
 * z `blobPts()` na ní pořád sedí — jen mezi body nevede lomená čára.
 *
 * @param {{x:number,y:number}[]} pts
 * @returns {string} — SVG path data
 */
export function hladkaCesta(pts) {
  const n = pts.length;
  if (n < 3) return '';
  const P = (i) => pts[((i % n) + n) % n];
  let d = `M${P(0).x.toFixed(1)} ${P(0).y.toFixed(1)} `;
  for (let i = 0; i < n; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} `;
  }
  return d + 'Z';
}

export function blob(cx, cy, rx, ry, rot, seed, amp = 0.09, n = 60) {
  const ph = fazeObrysu(seed);
  const co = Math.cos(rot), si = Math.sin(rot);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * 6.283185;
    const w = vlnaObrysu(amp, ph, t);
    const x = Math.cos(t) * rx * w, y = Math.sin(t) * ry * w;
    pts.push({ x: cx + x * co - y * si, y: cy + x * si + y * co });
  }
  return hladkaCesta(pts);
}

/**
 * Totéž rozvlnění jako `blob()`, ale místo path data vrátí pole bodů na
 * obrysu spolu s jednotkovou normálou (směr "ven" z tvaru) v každém bodě.
 * Na tohle navazuje `radial()` — šrafura vyzařující kolmo od okraje
 * (naznačuje sráz greenu, hloubku bunkru apod.).
 *
 * DŮLEŽITÉ: volej se stejnými parametry (cx, cy, rx, ry, rot, seed, amp)
 * jako odpovídající `blob()`, jinak normály nebudou sedět na obrysu tvaru.
 *
 * @param {number} cx @param {number} cy @param {number} rx @param {number} ry
 * @param {number} rot @param {number} seed @param {number} [amp=.09]
 * @param {number} [n=60]
 * @returns {{x:number,y:number,nx:number,ny:number}[]}
 */
export function blobPts(cx, cy, rx, ry, rot, seed, amp = 0.09, n = 60) {
  const ph = fazeObrysu(seed);
  const co = Math.cos(rot), si = Math.sin(rot);
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * 6.283185;
    const w = vlnaObrysu(amp, ph, t);
    const x = Math.cos(t) * rx * w, y = Math.sin(t) * ry * w;
    // normála elipsy v bodě (x,y): gradient x²/rx² + y²/ry², normalizovaný
    const nx = x / (rx * rx), ny = y / (ry * ry);
    const L = Math.hypot(nx, ny) || 1;
    out.push({
      x: cx + x * co - y * si,
      y: cy + x * si + y * co,
      nx: (nx / L) * co - (ny / L) * si,
      ny: (nx / L) * si + (ny / L) * co,
    });
  }
  return out;
}

/**
 * Šrafura vyzařující kolmo od okraje tvaru — krátké čárky ve směru normály
 * v každém bodě z `blobPts()`. Používá se na okrajích greenů a bunkrů, aby
 * kresba naznačila svah/hloubku, ne jen obrys.
 *
 * Hustota se automaticky násobí proměnnou `--hatch-density` čtenou z
 * `parent` (viz hlavička souboru) — na pracovním plátu tedy stačí, aby měl
 * `<svg>` třídu `plate-work`, a čárky budou samy tišší.
 *
 * @param {Element} parent — kam se čárky vykreslí (obvykle přímo `<svg>`)
 * @param {{x:number,y:number,nx:number,ny:number}[]} pts — z `blobPts()`
 * @param {number} seed — semínko pro náhodnou délku jednotlivých čárek
 * @param {{len?:number,w?:number,op?:number}} [opts]
 *   `len` základní délka čárky, `w` tloušťka linky, `op` základní krytí
 *   (před vynásobením hustotou plátu)
 */
export function radial(parent, pts, seed, { len = 12, w = 0.6, op = 0.6 } = {}) {
  const r = rng(seed);
  const density = parseFloat(V('--hatch-density', parent)) || 1;
  const g = E(parent, 'g', {
    stroke: V('--ink', parent), 'stroke-width': w,
    'stroke-linecap': 'round', opacity: op * density, fill: 'none',
  });
  pts.forEach(q => {
    const L = len * (0.5 + r() * 0.8);
    E(g, 'line', {
      x1: q.x.toFixed(1), y1: q.y.toFixed(1),
      x2: (q.x + q.nx * L).toFixed(1), y2: (q.y + q.ny * L).toFixed(1),
    });
  });
}

/**
 * Rovnoběžná šrafura uvnitř tvaru (vyžaduje existující `clipPath`, viz
 * `clipPath()` výše) — takhle je vykreslené vnitřní stínování fairwaye,
 * greenu i okolního trávníku. Čáry mírně chvějí polohu (`r() - 0.5`), aby
 * nevznikl strojový rastr.
 *
 * Hustota se stejně jako u `radial()` automaticky násobí proměnnou
 * `--hatch-density` čtenou z `parent`.
 *
 * @param {Element} parent
 * @param {string} clipId — `id` existujícího `clipPath` (bez `url(#…)`)
 * @param {{x:number,y:number,w:number,h:number}} box — ohraničující
 *   obdélník tvaru; šrafura se generuje přes celý box a ořízne clip-path
 * @param {number} angle — směr čar v radiánech
 * @param {number} gap — rozestup čar
 * @param {{w?:number,op?:number,seed?:number}} [opts]
 */
export function hatch(parent, clipId, box, angle, gap, { w = 0.5, op = 0.32, seed = 9 } = {}) {
  const r = rng(seed);
  const density = parseFloat(V('--hatch-density', parent)) || 1;
  const g = E(parent, 'g', {
    'clip-path': `url(#${clipId})`, stroke: V('--ink', parent),
    'stroke-width': w, opacity: op * density, fill: 'none',
  });
  const co = Math.cos(angle), si = Math.sin(angle);
  const diag = Math.hypot(box.w, box.h);
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  for (let d = -diag / 2; d <= diag / 2; d += gap) {
    const mx = cx - si * d + (r() - 0.5), my = cy + co * d + (r() - 0.5);
    E(g, 'line', {
      x1: (mx - co * diag / 2).toFixed(1), y1: (my - si * diag / 2).toFixed(1),
      x2: (mx + co * diag / 2).toFixed(1), y2: (my + si * diag / 2).toFixed(1),
    });
  }
}

/**
 * Tečkování písku uvnitř tvaru (vyžaduje existující `clipPath`). Náhodně
 * rozmístěné tečky s mírně proměnlivým poloměrem.
 *
 * Hustota (krytí) se stejně jako u ostatních funkcí násobí proměnnou
 * `--hatch-density` čtenou z `parent` — na pracovním plátu je tečkování
 * písku tišší stejně jako šrafura.
 *
 * @param {Element} parent
 * @param {string} clipId — `id` existujícího `clipPath`
 * @param {{x:number,y:number,w:number,h:number}} box — oblast, do které se
 *   tečky losují (typicky mírně větší než ohraničující box tvaru)
 * @param {number} n — počet teček
 * @param {number} seed
 * @param {{op?:number}} [opts]
 */
export function stipple(parent, clipId, box, n, seed, { op = 0.5 } = {}) {
  const r = rng(seed);
  const density = parseFloat(V('--hatch-density', parent)) || 1;
  const g = E(parent, 'g', {
    'clip-path': `url(#${clipId})`, fill: V('--ink2', parent), opacity: op * density,
  });
  for (let i = 0; i < n; i++) {
    E(g, 'circle', {
      cx: (box.x + r() * box.w).toFixed(1),
      cy: (box.y + r() * box.h).toFixed(1),
      r: (0.5 + r() * 0.6).toFixed(2),
    });
  }
}

/**
 * Praporek na jamce — kolík, vlaječka a bod jamky. Ve všech třech
 * prototypech byla tahle kresba zkopírovaná znovu a znovu se stejnými
 * čísly; tady je jednou, parametricky.
 *
 * @param {Element} parent
 * @param {number} x @param {number} y — poloha jamky (bod na greenu)
 * @param {{h?:number,r?:number,flagW?:number,flagH?:number}} [opts]
 *   `h` výška kolíku, `r` poloměr bodu jamky, `flagW`/`flagH` rozměry vlaječky
 */
export function pin(parent, x, y, { h = 26, r = 3, flagW = 18, flagH = 6 } = {}) {
  const g = E(parent, 'g', {});
  E(g, 'circle', { cx: x, cy: y, r, fill: V('--ink', parent) });
  E(g, 'line', {
    x1: x, y1: y, x2: x, y2: y - h,
    stroke: V('--ink', parent), 'stroke-width': 1.2,
  });
  E(g, 'path', {
    d: `M${x} ${y - h} l${flagW} ${flagH / 2} -${flagW} ${flagH / 2} Z`,
    fill: V('--flag', parent), stroke: V('--ink', parent), 'stroke-width': 0.9,
  });
  return g;
}

/**
 * Vytvoří vyplněný tvar s vnitřní šrafurou a obrysem v jednom volání —
 * shrnuje trojici kroků (`fill` → `clipPath` + `hatch` → obrysový `stroke`),
 * která se v prototypech opakuje ručně u každého greenu, bunkru i fairwaye.
 * Nepovinné — kdo chce vrstvy řídit sám (např. dodat mezi fill a hatch ještě
 * `radial()`, jako u greenu na Redanu), použije `clipPath()`, `hatch()` a
 * `E()` zvlášť.
 *
 * @param {Element} parent
 * @param {SVGDefsElement} defs
 * @param {string} id — unikátní id pro vygenerovaný clipPath
 * @param {string} d — path data tvaru (výstup `blob()`)
 * @param {{fill:string,hatchAngle?:number,hatchGap?:number,hatchOp?:number,
 *   hatchSeed?:number,strokeW?:number,fillOpacity?:number}} opts
 *   `fill` je hodnota barvy (typicky výstup `V('--turf')` apod.), ne jméno
 *   proměnné — funkce barvu sama nečte, aby šla použít i mimo `--` paletu.
 * @returns {SVGGElement} — obalová skupina se všemi třemi vrstvami
 */
export function filledShape(parent, defs, id, d, opts) {
  const {
    fill, hatchAngle = 1, hatchGap = 4, hatchOp = 0.2, hatchSeed = 1,
    strokeW = 1.2, fillOpacity = 1,
  } = opts;
  clipPath(defs, id, d);
  const g = E(parent, 'g', {});
  E(g, 'path', { d, fill, opacity: fillOpacity });
  if (hatchGap) hatch(g, id, bboxOf(d), hatchAngle, hatchGap, { op: hatchOp, seed: hatchSeed });
  E(g, 'path', { d, fill: 'none', stroke: V('--ink', parent), 'stroke-width': strokeW });
  return g;
}

/**
 * Spočítá ohraničující obdélník z SVG path data tvaru `blob()`. Pomocná
 * funkce pro `filledShape()` — parsuje jen souřadnice za `M`/`L` příkazy,
 * což pro výstup `blob()` stačí (žádné křivky, jen lomené čáry).
 *
 * @param {string} d
 * @returns {{x:number,y:number,w:number,h:number}}
 */
export function bboxOf(d) {
  const nums = d.match(/-?\d+(\.\d+)?/g).map(Number);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < nums.length; i += 2) {
    const x = nums[i], y = nums[i + 1];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/**
 * Trsy trávy — krátké obloučky rozeseté po ploše, textura roughu.
 *
 * Přidáno v Kroku 16. Rough se od redesignu kreslil jako plocha bez
 * struktury, takže se od fairwaye lišil jen odstínem. Trsy dělají to, co
 * na starých perokresbách: posekaný koridor se pak čte jako světlé místo
 * vyříznuté z hrubšího okolí.
 *
 * POZOR NA POŘADÍ: trsy se kreslí NA PODKLAD, ještě před fairwayí, a
 * fairway je pak překryje. Ořezávat je „všude kromě fairwaye" by chtělo
 * masku a zbytečnou složitost.
 *
 * @param {Element} parent
 * @param {{x:number,y:number,w:number,h:number}} box
 * @param {number} n — počet trsů
 * @param {number} seed
 * @param {{op?:number, velikost?:number}} [opts]
 */
export function trsy(parent, box, n, seed, { op = 0.35, velikost = 3.2 } = {}) {
  const r = rng(seed);
  const density = parseFloat(V('--hatch-density', parent)) || 1;
  const g = E(parent, 'g', {
    stroke: V('--ink', parent), 'stroke-width': 0.45, fill: 'none',
    opacity: op * density, 'stroke-linecap': 'round',
  });
  for (let i = 0; i < n; i++) {
    const x = box.x + r() * box.w;
    const y = box.y + r() * box.h;
    const v = velikost * (0.6 + r() * 0.8);
    const roztec = v * 0.55;
    let d = '';
    for (let k = -1; k <= 1; k++) {
      const x0 = x + k * roztec;
      const naklon = (r() - 0.5) * v * 0.7;
      d += `M${x0.toFixed(1)} ${y.toFixed(1)} Q${(x0 + naklon * 0.5).toFixed(1)} ${(y - v * 0.6).toFixed(1)} ${(x0 + naklon).toFixed(1)} ${(y - v).toFixed(1)} `;
    }
    E(g, 'path', { d });
  }
}

/**
 * Výškový profil jamky jako proužek pod plánem — přesně to, co mají
 * klubové plánky (Ostravice, Slapy): vodorovná osa je délka jamky, svislá
 * převýšení, a u konce je napsané, o kolik metrů jamka klesá nebo stoupá.
 *
 * Kreslí se JEN tehdy, když karta má `tvary.profil` — tedy když je
 * převýšení doložené pramenem. Půdorys převýšení zobrazit neumí a
 * vymýšlet si ho nebudeme; radši prázdné místo než smyšlený terén.
 *
 * @param {Element} svg
 * @param {{x:number, y:number, w:number, h:number,
 *          celkemM:number, delkaM:number, lang:'cs'|'en'}} cfg
 *   `celkemM` je záporné číslo, když jamka klesá.
 */
export function profilTerenu(svg, { x, y, w, h, celkemM, delkaM, lang = 'cs' }) {
  const ink = V('--ink', svg), ink2 = V('--ink2', svg), turfD = V('--turf-d', svg);
  const klesa = celkemM < 0;
  const yStart = klesa ? y : y + h;
  const yEnd = klesa ? y + h : y;
  const g = E(svg, 'g', {});
  E(g, 'path', {
    d: `M${x} ${yStart} L${(x + w).toFixed(1)} ${yEnd} L${(x + w).toFixed(1)} ${(y + h).toFixed(1)} L${x} ${(y + h).toFixed(1)} Z`,
    fill: turfD, opacity: 0.55,
  });
  E(g, 'path', {
    d: `M${x} ${yStart} L${(x + w).toFixed(1)} ${yEnd}`,
    stroke: ink, 'stroke-width': 1, fill: 'none',
  });
  E(svg, 'text', { x: (x - 4).toFixed(1), y: (yStart + 3.5).toFixed(1), class: 'lab sm meritko', 'text-anchor': 'end', opacity: 0.85 }, '0');
  E(svg, 'text', { x: (x + w + 4).toFixed(1), y: (yEnd + 3.5).toFixed(1), class: 'lab sm meritko', 'text-anchor': 'start', opacity: 0.85 },
    (celkemM > 0 ? '+' : '\u2212') + Math.abs(celkemM) + ' m');
  E(svg, 'text', { x: (x + w / 2).toFixed(1), y: (y + h + 13).toFixed(1), class: 'lab sm', 'text-anchor': 'middle', fill: ink2 },
    lang === 'cs' ? 'V\u00dd\u0160KOV\u00dd PROFIL' : 'ELEVATION PROFILE');
}

/* ============================================================================
 * KARTY JAMEK — vykreslení `data/jamky/*.json` (zadání, část 12)
 *
 * Souřadnice v kartě jsou v metrech od odpaliště: x = boční odchylka
 * (kladně vpravo), y = vzdálenost po ose hry (roste směrem ke greenu).
 * Tenhle blok je „ta stejná funkce", která má podle zadání (část 5)
 * vykreslit libovolnou jamku — stačí jí dát jinou kartu.
 *
 * PŘEPSÁNO PŘI REDESIGNU (2026-08-19). Původní `vykresliJamku()` kreslila
 * jen podklad, hazardy, bunkry, green a odpaliště — bez fairwaye, bez linie
 * hry, bez popisků. Výsledek byl plát, kde 60 % plochy byla prázdná tráva a
 * student se z něj nedozvěděl nic: nevěděl, kudy se hraje, kde se rozhoduje
 * ani jak se který bunkr jmenuje, přestože `tvary.bunkry[].label` byly
 * v datech od začátku a jen se nečetly.
 *
 * Nová verze kreslí v tomto pořadí (zdola nahoru):
 *   1. okolní trávník (rough)
 *   2. fairway jako STUHA podél kvadratické Bézierovy křivky — skutečný
 *      dogleg, ne rovný obdélník; šířka roste od odpaliště ke greenu
 *   3. hazardy (voda s vlnkami, ne plochá barva)
 *   4. green (výplň, šrafura, radiální obruba)
 *   5. bunkry — AŽ NAD greenem, takže greenside bunkr nezmizí pod ním
 *      (past zapsaná v `poznamky.md`); obrys greenu se pak dotáhne znovu
 *   6. linie hry (čárkovaně, po ose stuhy) a dopadová zóna
 *   7. odpaliště, praporek
 *   8. popisky s vodicí linkou — vždy úplně nahoře, ať nezaniknou ve šrafuře
 *   9. měřítko po straně (přiznání podélného zkrácení)
 *
 * PŘÍSTUPNOST: `vykresliJamku()` sama doplní `<title>` a `<desc>` sestavené
 * z dat karty, takže plát není pro čtečku obrazovky prázdný obrázek.
 * ==========================================================================*/

/**
 * Ohraničující obdélník všech tvarů v `tvary` (green, bunkry, hazardy) v
 * metrech, s okrajem. Odpaliště (0,0) je vždy zahrnuté, i kdyby žádný tvar
 * nezasahoval tak blízko. Bere v úvahu i šířku fairwaye a jeho ohyb, aby
 * stuha nevyjela z plátu.
 *
 * @param {Object} tvary — pole `tvary` z karty jamky
 * @param {{okraj?:number}} [opts]
 */
export function rozsahJamky(tvary, { okraj = 22 } = {}) {
  const tvary_ = [tvary.green, ...(tvary.bunkry || []), ...(tvary.hazardy || [])].filter(Boolean);
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  tvary_.forEach(s => {
    minX = Math.min(minX, s.x - s.rx); maxX = Math.max(maxX, s.x + s.rx);
    minY = Math.min(minY, s.y - s.ry); maxY = Math.max(maxY, s.y + s.ry);
  });

  // fairwayová stuha se může vyklenout mimo bunkry i green
  const f = tvary.fairway;
  if (f && tvary.green) {
    const polovina = Math.max(f.sirkaTee ?? 30, f.sirkaGreen ?? 40) / 2;
    const ohyb = f.ohyb || 0;
    // vrchol kvadratické Bézierovy křivky leží v polovině mezi osou a řídicím bodem
    const vrchol = ohyb / 2;
    minX = Math.min(minX, Math.min(0, vrchol, tvary.green.x) - polovina);
    maxX = Math.max(maxX, Math.max(0, vrchol, tvary.green.x) + polovina);
  }

  minX -= okraj; maxX += okraj; minY -= okraj; maxY += okraj;
  return { minX, maxX, minY, maxY, sirka: maxX - minX, vyska: maxY - minY };
}

/**
 * Ohraničující obdélník karty, která místo parametrů nese SKUTEČNÉ OBRYSY
 * (`tvary.obrys`) — polygony v metrech od zadního odpaliště, x kladně
 * vpravo, y podél osy hry. Přidáno v Kroku 17 podle bodu 8 doplňku zadání.
 *
 * @param {Object} obrys @param {{okraj?:number}} [opts]
 */
export function rozsahZObrysu(obrys, { okraj = 22 } = {}) {
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  const vezmi = (body) => body.forEach(([x, y]) => {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  });
  if (obrys.green) vezmi(obrys.green.body);
  (Array.isArray(obrys.odpaliste) ? obrys.odpaliste : (obrys.odpaliste ? [obrys.odpaliste] : [])).forEach((t) => vezmi(t.body));
  (obrys.fairway || []).forEach((f) => vezmi(f.body));
  (obrys.bunkry || []).forEach((b) => vezmi(b.body));
  (obrys.voda || []).forEach((w) => vezmi(w.body));
  minX -= okraj; maxX += okraj; minY -= okraj; maxY += okraj;
  return { minX, maxX, minY, maxY, sirka: maxX - minX, vyska: maxY - minY };
}

/**
 * Spočítá měřítko pro převod „hole-local" metrů na jednotky viewBoxu
 * shodné s ostatními pláty v kurzu — `.lab`/`.lab.sm` v `styl.css` čtou
 * velikost popisků v jednotkách viewBoxu (pravidlo 3 ze zadání), takže
 * bez převodu na sdílenou škálu by karta jamky (viewBox v desítkách až
 * stovkách metrů) měla buď obrovské, nebo neviditelné popisky.
 *
 * Podélná osa (y) se zkracuje faktorem `zkraceni` — pravidlo 5 ze zadání.
 * NOVÉ: zkrácení je navíc omezené `maxPomer` (poměr výška : šířka plátu).
 * Bez toho vycházel u dlouhých jamek (Pebble Beach, 500 m) plát vysoký
 * skoro dvakrát tolik co široký — nepoužitelný proužek na mobilu i na
 * desktopu. Skutečně použité zkrácení se vrací jako `zkraceniPouzite`,
 * aby ho `meritkoPoStrane()` mohlo poctivě přiznat.
 *
 * @param {ReturnType<typeof rozsahJamky>} rozsah
 * @param {{cilovaSirka?:number, zkraceni?:number, maxPomer?:number}} [opts]
 */
export function meritkoJamky(rozsah, opts = {}) {
  const cilovaSirka = opts.cilovaSirka ?? 340;
  const zkraceni = opts.zkraceni ?? 0.55;
  const maxPomer = opts.maxPomer ?? 1.5;
  const meritkoX = cilovaSirka / rozsah.sirka;
  let meritkoY = meritkoX * zkraceni;
  const maxVyska = cilovaSirka * maxPomer;
  if (rozsah.vyska * meritkoY > maxVyska) meritkoY = maxVyska / rozsah.vyska;
  return {
    meritkoX, meritkoY,
    zkraceniPouzite: meritkoY / meritkoX,
    sirka: cilovaSirka,
    vyska: rozsah.vyska * meritkoY,
    minX: rozsah.minX * meritkoX,
    maxY: rozsah.maxY,
  };
}

/* ---------------------------------------------------------------------------
 * Fairwayová stuha podél Bézierovy křivky
 *
 * Bézierovy křivky jsou afinně invariantní — řídicí body se počítají
 * v „přirozeném" souřadném systému karty (metry) a teprve výsledné body se
 * transformují přes px()/py(). Výsledek je stejný, jako počítat rovnou
 * v pixelech, jen se to líp čte a `ohyb` zůstává v metrech i v datech.
 * ------------------------------------------------------------------------ */

/** Bod na kvadratické Bézierově křivce pro parametr t ∈ ⟨0,1⟩. */
function bezier(p0, p1, p2, t) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

/**
 * Spočítá osu a obrys fairwayové stuhy v METRECH karty.
 *
 * @param {{od:{x,y}, do:{x,y}, ohyb?:number, sirkaTee?:number,
 *          sirkaGreen?:number, seed?:number, kroku?:number}} cfg
 *   `ohyb` je boční posun řídicího bodu v metrech (kladně doprava) — tím
 *   vzniká dogleg. `sirkaTee`/`sirkaGreen` je šířka stuhy v metrech.
 * @returns {{osa:{x,y}[], levy:{x,y}[], pravy:{x,y}[]}}
 */
export function fairwayOsa({ od, doo, ohyb = 0, sirkaTee = 30, sirkaGreen = 40, seed = 7, kroku = 48 }) {
  const dx = doo.x - od.x, dy = doo.y - od.y;
  const delka = Math.hypot(dx, dy) || 1;
  // jednotková normála k ose (doprava od směru hry)
  const nx = dy / delka, ny = -dx / delka;
  const stred = { x: (od.x + doo.x) / 2, y: (od.y + doo.y) / 2 };
  const rid = { x: stred.x + nx * ohyb, y: stred.y + ny * ohyb };

  const r = rng(seed);
  // fáze se losují JEDNOU, ne v každém kroku — jinak z vlnění vznikne
  // roztřepený šum místo plynulého okraje (chyba objevená při redesignu)
  const ph = [r() * 6.28, r() * 6.28, r() * 6.28, r() * 6.28];
  const osa = [], levy = [], pravy = [];
  for (let i = 0; i <= kroku; i++) {
    const t = i / kroku;
    const b = bezier(od, rid, doo, t);
    const b2 = bezier(od, rid, doo, Math.min(1, t + 0.01));
    const tx = b2.x - b.x, ty = b2.y - b.y;
    const L = Math.hypot(tx, ty) || 1;
    const px_ = ty / L, py_ = -tx / L;          // normála v tomto bodě
    const w = (sirkaTee + (sirkaGreen - sirkaTee) * t) / 2;
    // jemné vlnění okraje, ať stuha nevypadá jako strojově rovná
    const vlnaL = 1 + 0.075 * (Math.sin(t * 6.5 + ph[0]) * 0.6 + Math.sin(t * 11 + ph[1]) * 0.4);
    const vlnaP = 1 + 0.075 * (Math.sin(t * 5.5 + ph[2]) * 0.6 + Math.sin(t * 9 + ph[3]) * 0.4);
    osa.push(b);
    levy.push({ x: b.x - px_ * w * vlnaL, y: b.y - py_ * w * vlnaL });
    pravy.push({ x: b.x + px_ * w * vlnaP, y: b.y + py_ * w * vlnaP });
  }
  return { osa, levy, pravy };
}

/** Pole bodů → SVG path data (lomená čára). `uzavrit` přidá `Z`. */
function cesta(pts, uzavrit = false) {
  let d = '';
  pts.forEach((p, i) => { d += (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ' '; });
  return uzavrit ? d + 'Z' : d.trim();
}

/**
 * Vlnky na vodní ploše — vodorovné vlnovky ořezané tvarem hazardu.
 * Bez nich je voda plochá barevná skvrna, která na perokresbě vypadá jako
 * chyba tisku (viz audit, bod 2.3).
 *
 * @param {Element} parent @param {string} clipId
 * @param {{x:number,y:number,w:number,h:number}} box @param {number} seed
 */
export function vlnky(parent, clipId, box, seed) {
  const r = rng(seed);
  const density = parseFloat(V('--hatch-density', parent)) || 1;
  const g = E(parent, 'g', {
    'clip-path': `url(#${clipId})`, stroke: V('--ink', parent),
    'stroke-width': 0.55, opacity: 0.4 * density, fill: 'none', 'stroke-linecap': 'round',
  });
  const krok = 7;
  for (let y = box.y; y <= box.y + box.h; y += krok) {
    const posun = r() * 10;
    let d = `M${(box.x - 6).toFixed(1)} ${(y + r() * 2).toFixed(1)}`;
    for (let x = box.x - 6 + posun; x < box.x + box.w + 8; x += 9) {
      d += ` q4.5 -2.6 9 0`;
    }
    E(g, 'path', { d });
  }
}

/* ---------------------------------------------------------------------------
 * Popisky s vodicí linkou
 *
 * Referenční styl (perokresby template holes) popisuje prvky krátkým
 * jménem u okraje plátu a tenkou linkou k prvku. Dvě věci se přitom snadno
 * podcení a obojí je v `poznamky.md` jako past:
 *   - šířka textu (a tedy oříznutí o okraj viewBoxu) — směr `text-anchor`
 *     roste u `start` a `end` opačně;
 *   - svislé kolize popisků, když leží dva prvky blízko sebe.
 * `rozmistiPopisky()` řeší obojí najednou.
 * ------------------------------------------------------------------------ */

/**
 * Šířka textu v jednotkách viewBoxu. Měří se SKUTEČNĚ (`getComputedTextLength`)
 * na dočasném `<text>` — odhad „počet znaků × konstanta" se u verzálek
 * s prostrkáním plete o desítky procent a popisky pak vyjedou z plátu
 * (past zapsaná v `poznamky.md`, znovu potvrzená při redesignu).
 * Když plát ještě není v živém dokumentu, měření vrátí 0 a použije se
 * konzervativní odhad.
 */
function sirkaTextu(svg, text) {
  const el = E(svg, 'text', { class: 'lab sm', x: -9999, y: -9999 }, text);
  let w = 0;
  try { w = el.getComputedTextLength(); } catch { w = 0; }
  el.remove();
  return w || text.length * 9.6;
}

/**
 * Rozmístí popisky k prvkům plátu tak, aby se nepřekrývaly a nevyjely
 * z plátu, a vykreslí je i s vodicí linkou.
 *
 * @param {Element} svg
 * @param {{x:number,y:number,text:string}[]} polozky — poloha PRVKU (ne popisku)
 *   v jednotkách viewBoxu
 * @param {{minX:number,sirka:number,vyska:number,rozestup?:number}} plat
 */
export function rozmistiPopisky(svg, polozky, plat) {
  const rozestup = plat.rozestup ?? 18;
  const okrajX = 6;
  const hornihranice = plat.hornihranice ?? 14;
  const dolniHranice = plat.dolniHranice ?? (plat.vyska - 6);
  const strany = { L: [], P: [] };

  const stred = plat.minX + plat.sirka / 2;
  polozky.forEach((p) => {
    (p.x <= stred ? strany.L : strany.P).push({ ...p, w: sirkaTextu(svg, p.text) });
  });

  const g = E(svg, 'g', { class: 'popisky' });

  Object.entries(strany).forEach(([strana, seznam]) => {
    seznam.sort((a, b) => a.y - b.y);
    let posledni = hornihranice - rozestup;
    seznam.forEach((p) => {
      p.ly = Math.max(p.y, posledni + rozestup);
      posledni = p.ly;
    });
    const pretok = posledni - dolniHranice;
    if (pretok > 0) {
      seznam.forEach((p) => { p.ly -= pretok; });
      // po posunu nahoru mohl první popisek vyjet nad plát — sroluj zpět dolů
      let horni = hornihranice;
      seznam.forEach((p) => { p.ly = Math.max(p.ly, horni); horni = p.ly + rozestup; });
    }

    seznam.forEach((p) => {
      const anchor = strana === 'L' ? 'end' : 'start';
      const lx = strana === 'L'
        ? plat.minX + okrajX + p.w
        : plat.minX + plat.sirka - okrajX - p.w;
      const konecLinky = strana === 'L' ? lx + 3 : lx - 3;
      const ohyb = (konecLinky + p.x) / 2;
      E(g, 'path', {
        class: 'lead',
        d: `M${konecLinky.toFixed(1)} ${(p.ly - 3.5).toFixed(1)} L${ohyb.toFixed(1)} ${(p.ly - 3.5).toFixed(1)} L${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
      });
      E(g, 'text', { x: lx.toFixed(1), y: p.ly.toFixed(1), class: 'lab sm', 'text-anchor': anchor }, p.text);
    });
  });
  return g;
}

/* ------------------------------------------------------------------------ */

/**
 * Krátký popisek prvku pro kresbu (`zkratka`), s náhradou.
 *
 * `zkratka: null` v datech popisek VYPNE. Používá se u shluků — tři bunkery
 * u greenu vedle sebe nepotřebují tři popisky, které se stejně přetlačí;
 * pojmenuje se prostřední („TŘI BUNKERY VPRAVO") a zbylé dva zůstanou tiché.
 * Dlouhý `label` pro čtečku obrazovky si přitom nechá každý z nich.
 */
function zkratkaPrvku(prvek, lang, nahrada) {
  if ('zkratka' in prvek && prvek.zkratka === null) return null;
  const z = prvek.zkratka && prvek.zkratka[lang];
  return (z || nahrada || '').toUpperCase();
}

/**
 * Sestaví textový popis plátu pro čtečku obrazovky (`<desc>`) z dat karty —
 * z dlouhých popisků `label`, které se do kresby nevejdou, ale pro
 * nevidomého studenta jsou tím nejcennějším, co karta má.
 *
 * @param {Object} karta @param {'cs'|'en'} lang
 * @returns {string}
 */
export function popisJamkyProCtecku(karta, lang) {
  const t = karta.tvary;
  const cs = lang === 'cs';
  const kusy = [];
  const delka = karta.delky && karta.delky[0];
  kusy.push(cs
    ? `Schéma jamky ${karta.jamka} hřiště ${karta.hriste}, par ${karta.par}${delka ? `, ${delka.m} metrů` : ''}.`
    : `Schematic plan of hole ${karta.jamka} at ${karta.hriste}, par ${karta.par}${delka ? `, ${delka.yd} yards` : ''}.`);
  if (t.fairway && t.fairway.ohyb) {
    const doprava = t.fairway.ohyb > 0;
    kusy.push(cs
      ? `Fairway se stáčí ${doprava ? 'doprava' : 'doleva'}.`
      : `The fairway bends to the ${doprava ? 'right' : 'left'}.`);
  }
  (t.hazardy || []).forEach((h) => {
    const l = h.label && h.label[lang];
    if (l) kusy.push(l.charAt(0).toUpperCase() + l.slice(1) + '.');
  });
  (t.bunkry || []).forEach((b) => {
    const l = b.label && b.label[lang];
    if (l) kusy.push(l.charAt(0).toUpperCase() + l.slice(1) + '.');
  });
  kusy.push(t.poznamka
    ? (cs ? 'Kresba je schéma, ne přesný půdorys.' : 'The drawing is a schematic, not an exact plan.')
    : '');
  return kusy.filter(Boolean).join(' ');
}

/**
 * Vykreslí libovolnou kartu jamky z `data/jamky/*.json`.
 *
 * @param {SVGSVGElement} svg — dostane nový `viewBox`, obsah se smaže a překreslí
 * @param {Object} karta — jeden soubor z `data/jamky/*.json`
 * @param {{
 *   lang?: 'cs'|'en',
 *   popisky?: Object,        // texty pro kresbu (green, odpaliste, dopadovaZona, …)
 *   cilovaSirka?: number, zkraceni?: number, okraj?: number, maxPomer?: number,
 *   sPopisky?: boolean,      // vypnout popisky prvků (miniatury ve zkoušce)
 * }} [opts]
 * @returns {ReturnType<typeof meritkoJamky>}
 */
export function vykresliJamku(svg, karta, opts = {}) {
  const lang = opts.lang || 'cs';
  const P = Object.assign({
    green: lang === 'cs' ? 'GREEN' : 'GREEN',
    odpaliste: lang === 'cs' ? 'ODPALIŠTĚ' : 'TEE',
    dopadovaZona: lang === 'cs' ? 'DOPADOVÁ ZÓNA' : 'LANDING ZONE',
    bunkr: lang === 'cs' ? 'BUNKR' : 'BUNKER',
    voda: lang === 'cs' ? 'VODA' : 'WATER',
    rough: lang === 'cs' ? 'ROUGH' : 'ROUGH',
    primaLinie: lang === 'cs' ? 'PŘÍMÁ LINIE' : 'DIRECT LINE',
  }, opts.popisky || {});
  const sPopisky = opts.sPopisky !== false;

  const t = karta.tvary;
  /* Karta může nést buď PARAMETRY (ohyb, šířky — původní model z Kroku 9),
     nebo SKUTEČNÉ OBRYSY v metrech (`tvary.obrys`, Krok 17). Obojí se
     kreslí toutéž funkcí, jen se jinak spočítá rozsah a jinak vzniknou
     tvary. Parametrická cesta zůstává, protože většina karet zatím
     skutečná data nemá — a přepisovat je bez dat by znamenalo vyměnit
     přiznané zjednodušení za nepřiznané. */
  const obrys = t.obrys || null;
  const rozsah = obrys
    ? rozsahZObrysu(obrys, { okraj: t.okraj ?? opts.okraj })
    : rozsahJamky(t, { okraj: t.okraj ?? opts.okraj });
  /* Karta smí podélné zkrácení doladit sama (`tvary.zkraceni`, `tvary.maxPomer`).
     Použij to jen tam, kde je hloubka greenu nebo hazardu součástí výkladu —
     u Karlštejna 14 je green 19 × 35 m a při běžném zkrácení vyjde skoro
     kulatý, což si protiřečí s textem karty. Měřítko po straně zkrácení
     přiznává v obou případech. */
  const m = meritkoJamky(rozsah, Object.assign({}, opts, {
    zkraceni: t.zkraceni ?? opts.zkraceni,
    maxPomer: t.maxPomer ?? opts.maxPomer,
  }));
  const px = (x) => x * m.meritkoX;
  const py = (y) => (m.maxY - y) * m.meritkoY;

  /* Popisky „GREEN" a „ODPALIŠTĚ" leží nad greenem a pod odpalištěm, tedy
     mimo plochu odvozenou z metrů. viewBox se proto rozšíří o pár jednotek
     na všechny strany — v jednotkách viewBoxu, ne v metrech, protože jde
     o velikost písma, ne o kus pozemku. */
  const padH = 22, padD = t.profil ? 78 : 26, padR = 4;
  const padL = 58;   // levý žlab jen pro měřítko — bez něj se popisky prvků
                     // a značky měřítka tisknou přes sebe
  svg.setAttribute('viewBox',
    `${(m.minX - padL).toFixed(1)} ${-padH} ${(m.sirka + padL + padR).toFixed(1)} ${(m.vyska + padH + padD).toFixed(1)}`);
  clear(svg);

  /* --- přístupnost: název a popis plátu ------------------------------- */
  const idBase = 'plan-' + karta.id;
  E(svg, 'title', { id: idBase + '-t' },
    lang === 'cs' ? `${karta.hriste}, jamka ${karta.jamka} — schéma` : `${karta.hriste}, hole ${karta.jamka} — schematic plan`);
  E(svg, 'desc', { id: idBase + '-d' }, popisJamkyProCtecku(karta, lang));
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-labelledby', `${idBase}-t ${idBase}-d`);

  const defs = E(svg, 'defs', {});
  let gx = 0, gy = 0;

  /* --- 1. okolní trávník ----------------------------------------------
     Rough je od Kroku 16 výrazně přítomnější a má texturu trsů. Fairway se
     pak čte jako světlý posekaný koridor vyříznutý z hrubšího okolí — tak,
     jak ho hráč vidí z odpaliště. Trsy se kreslí SEM, pod fairway, která je
     překryje (viz komentář u `trsy()`). */
  E(svg, 'rect', { x: m.minX - padL, y: -padH, width: m.sirka + padL + padR, height: m.vyska + padH + padD, fill: V('--turf-d', svg), opacity: 0.42 });
  trsy(svg, { x: m.minX, y: -padH, w: m.sirka, h: m.vyska + padH + padD }, Math.round((m.sirka * (m.vyska + padH + padD)) / 620), (karta.id || '').length + 4200, { op: 0.26, velikost: 3.8 });

  const popisky = [];

  /* --- 2a. kresba ze skutečných obrysů --------------------------------
     Polygony jdou přes `hladkaCesta()` stejně jako všechno ostatní: body
     z OpenStreetMap jsou vzorky obrysu, ne rohy — lomená čára mezi nimi by
     byla artefakt formátu, ne tvar bunkru (doplněk zadání, bod 2). */
  if (obrys) {
    const cestaZBodu = (body) => hladkaCesta(body.map(([x, y]) => ({ x: px(x), y: py(y) })));

    (obrys.fairway || []).forEach((f, i) => {
      const d = cestaZBodu(f.body);
      const id = 'ofw' + i + '-' + karta.id;
      clipPath(defs, id, d);
      E(svg, 'path', { d, fill: V('--turf', svg), opacity: 1 });
      hatch(svg, id, bboxOf(d), Math.PI / 2, 5, { op: 0.11, seed: 5100 + i });
      E(svg, 'path', { d, fill: 'none', stroke: V('--ink', svg), 'stroke-width': 1 });
    });

    (obrys.voda || []).forEach((w, i) => {
      const d = cestaZBodu(w.body);
      const id = 'ovd' + i + '-' + karta.id;
      const bb = bboxOf(d);
      clipPath(defs, id, d);
      E(svg, 'path', { d, fill: V('--water', svg), opacity: 0.82 });
      vlnky(svg, id, bb, 5200 + i);
      E(svg, 'path', { d, fill: 'none', stroke: V('--ink', svg), 'stroke-width': 0.9 });
      const z = zkratkaPrvku(w, lang, P.voda);
      if (sPopisky && z) popisky.push({ x: bb.x + bb.w / 2, y: bb.y + bb.h / 2, text: z });
    });

    if (obrys.green) {
      const d = cestaZBodu(obrys.green.body);
      const bb = bboxOf(d);
      const id = 'ogr-' + karta.id;
      clipPath(defs, id, d);
      E(svg, 'path', { d, fill: V('--turf', svg) });
      hatch(svg, id, bb, 1, 3, { op: 0.16, seed: 5301 });
      E(svg, 'path', { d, fill: 'none', stroke: V('--ink', svg), 'stroke-width': 1.3 });
      gx = bb.x + bb.w / 2; gy = bb.y + bb.h / 2;
    }

    (obrys.bunkry || []).forEach((b, i) => {
      const d = cestaZBodu(b.body);
      const bb = bboxOf(d);
      const id = 'obk' + i + '-' + karta.id;
      clipPath(defs, id, d);
      E(svg, 'path', { d, fill: V('--sand', svg) });
      stipple(svg, id, bb, 22, 5400 + i);
      E(svg, 'path', { d, fill: 'none', stroke: V('--ink', svg), 'stroke-width': 0.9 });
      const z = zkratkaPrvku(b, lang, P.bunkr);
      if (sPopisky && z) popisky.push({ x: bb.x + bb.w / 2, y: bb.y + bb.h / 2, text: z });
    });
  }

  /* --- 2. fairway jako stuha podél Bézierovy křivky --------------------
     Par 3 fairway nemá (hraje se přímo na green) — u něj se stuha vynechá
     a nakreslí se jen linie hry. --------------------------------------- */
  let osaBody = null;
  const f = t.fairway;
  if (t.green && !obrys) {
    const cil = { x: t.green.x, y: t.green.y - t.green.ry * 0.6 };
    const start = { x: 0, y: f && f.zacatek != null ? f.zacatek : 0 };
    const geo = fairwayOsa({
      od: start, doo: cil,
      ohyb: (f && f.ohyb) || 0,
      sirkaTee: (f && f.sirkaTee) || 30,
      sirkaGreen: (f && f.sirkaGreen) || 40,
      seed: (f && f.seed) || 4001,
    });
    osaBody = geo.osa.map((p) => ({ x: px(p.x), y: py(p.y) }));

    if (f) {
      /* Obrys stuhy vede přes `hladkaCesta()`, ne lomenou čarou: chvění pera
         na okraji fairwaye má být organické, ale plynulé. Lomená čára mezi
         vzorky je artefakt vzorkování, ne vlastnost jamky. */
      const obrys = [...geo.levy, ...geo.pravy.slice().reverse()].map((p) => ({ x: px(p.x), y: py(p.y) }));
      const d = hladkaCesta(obrys);
      const id = 'fw-' + karta.id;
      clipPath(defs, id, d);
      E(svg, 'path', { d, fill: V('--turf', svg), opacity: 1 });
      hatch(svg, id, bboxOf(d), Math.PI / 2, 5, { op: 0.11, seed: (f.seed || 4001) + 1 });
      E(svg, 'path', { d, fill: 'none', stroke: V('--ink', svg), 'stroke-width': 1 });
    }
  }

  /* --- 3. hazardy (voda s vlnkami) ------------------------------------ */
  (obrys ? [] : (t.hazardy || [])).forEach((h, i) => {
    const hx = px(h.x), hy = py(h.y), hrx = h.rx * m.meritkoX, hry = h.ry * m.meritkoY;
    const d = blob(hx, hy, hrx, hry, h.rot, h.seed, h.amp, 44);
    const jeVoda = h.typ === 'voda';
    const id = 'hz' + i + '-' + karta.id;
    clipPath(defs, id, d);
    E(svg, 'path', { d, fill: jeVoda ? V('--water', svg) : V('--turf-d', svg), opacity: jeVoda ? 0.8 : 0.75 });
    if (jeVoda) vlnky(svg, id, { x: hx - hrx, y: hy - hry, w: hrx * 2, h: hry * 2 }, h.seed + 5);
    else hatch(svg, id, { x: hx - hrx, y: hy - hry, w: hrx * 2, h: hry * 2 }, 0.9, 4, { op: 0.22, seed: h.seed + 5 });
    E(svg, 'path', { d, fill: 'none', stroke: V('--ink', svg), 'stroke-width': 0.9 });
    const popH = zkratkaPrvku(h, lang, jeVoda ? P.voda : P.rough);
    if (sPopisky && popH) popisky.push({ x: hx, y: hy, text: popH });
  });

  /* --- 4. green (výplň, šrafura, obruba) ------------------------------ */
  let greenObrys = null;
  if (t.green && !obrys) {
    const g = t.green;
    gx = px(g.x); gy = py(g.y);
    const grx = g.rx * m.meritkoX, gry = g.ry * m.meritkoY;
    greenObrys = blob(gx, gy, grx, gry, g.rot, g.seed, g.amp, 50);
    const id = 'gr-' + karta.id;
    clipPath(defs, id, greenObrys);
    E(svg, 'path', { d: greenObrys, fill: V('--turf', svg) });
    hatch(svg, id, { x: gx - grx, y: gy - gry, w: grx * 2, h: gry * 2 }, 1, 3, { op: 0.16, seed: g.seed + 1 });
    radial(svg, blobPts(gx, gy, grx, gry, g.rot, g.seed, g.amp, 50), g.seed + 2, { len: 5, w: 0.4, op: 0.5 });
  }

  /* --- 5. bunkry — AŽ NAD greenem ------------------------------------- */
  (obrys ? [] : (t.bunkry || [])).forEach((b, i) => {
    const bx = px(b.x), by = py(b.y), brx = b.rx * m.meritkoX, bry = b.ry * m.meritkoY;
    const d = blob(bx, by, brx, bry, b.rot, b.seed, b.amp, 40);
    const id = 'bk' + i + '-' + karta.id;
    clipPath(defs, id, d);
    E(svg, 'path', { d, fill: V('--sand', svg) });
    stipple(svg, id, { x: bx - brx, y: by - bry, w: brx * 2, h: bry * 2 }, 24, b.seed + 3);
    E(svg, 'path', { d, fill: 'none', stroke: V('--ink', svg), 'stroke-width': 0.9 });
    radial(svg, blobPts(bx, by, brx, bry, b.rot, b.seed, b.amp, 40), b.seed + 4, { len: 6, w: 0.45, op: 0.6 });
    const popB = zkratkaPrvku(b, lang, P.bunkr);
    if (sPopisky && popB) popisky.push({ x: bx, y: by, text: popB });
  });

  // obrys greenu se dotáhne znovu, ať ho greenside bunkr nepřekryje
  if (greenObrys) E(svg, 'path', { d: greenObrys, fill: 'none', stroke: V('--ink', svg), 'stroke-width': 1.2 });

  /* --- 6. linie hry a dopadová zóna ----------------------------------- */
  if (osaBody) {
    E(svg, 'path', {
      d: cesta(osaBody), fill: 'none', stroke: V('--ink2', svg),
      'stroke-width': 1, opacity: 0.55, 'stroke-dasharray': '5 5', 'stroke-linecap': 'round',
    });
  }
  /* Přímá linie z odpaliště na green — u doglegu s hazardem v ohybu je to
     ta druhá, odvážnější cesta. Bez ní je na plánu vidět jen bezpečná
     trasa a student nemá co porovnávat. Zapíná se `tvary.primaLinie: true`.
     Funguje i u karet kreslených ze skutečných obrysů, kde `tvary.green`
     (parametrický green) vůbec neexistuje — cíl se pak bere z `obrys.green`. */
  if (t.primaLinie && (t.green || (obrys && obrys.green))) {
    E(svg, 'path', {
      d: `M${px(0).toFixed(1)} ${py(0).toFixed(1)} L${gx.toFixed(1)} ${gy.toFixed(1)}`,
      fill: 'none', stroke: V('--flag', svg), 'stroke-width': 1,
      opacity: 0.65, 'stroke-dasharray': '2 4', 'stroke-linecap': 'round',
    });
    if (sPopisky) {
      popisky.push({ x: (px(0) + gx) / 2, y: (py(0) + gy) / 2, text: P.primaLinie });
    }
  }

  const dz = t.dopadovaZona;
  if (dz && sPopisky) {
    const y1 = py(dz.od), y2 = py(dz.do);
    const stredY = (y1 + y2) / 2;
    // úzká svorka po ose hry — ne agresivní kruh, jen dvě tenké značky
    const osaX = osaBody
      ? osaBody.reduce((nej, p) => (Math.abs(p.y - stredY) < Math.abs(nej.y - stredY) ? p : nej), osaBody[0]).x
      : px(0);
    const g = E(svg, 'g', { stroke: V('--ink2', svg), 'stroke-width': 0.9, opacity: 0.7, fill: 'none' });
    E(g, 'path', { d: `M${(osaX - 13).toFixed(1)} ${y1.toFixed(1)} h26 M${(osaX - 13).toFixed(1)} ${y2.toFixed(1)} h26` });
    E(g, 'path', { d: `M${(osaX - 13).toFixed(1)} ${y1.toFixed(1)} V${y2.toFixed(1)} M${(osaX + 13).toFixed(1)} ${y1.toFixed(1)} V${y2.toFixed(1)}`, 'stroke-dasharray': '2 4' });
    popisky.push({ x: osaX, y: stredY, text: P.dopadovaZona });
  }

  /* --- 7. odpaliště a praporek ---------------------------------------- */
  const tx0 = px(0), ty0 = py(0);
  if (obrys && obrys.odpaliste) {
    /* Odpališť bývá na jamce několik — kreslí se všechna, jak to dělá
       birdie book. Počátek soustavy leží v tom nejzadnějším, které je
       v datech. */
    (Array.isArray(obrys.odpaliste) ? obrys.odpaliste : [obrys.odpaliste]).forEach((t) => {
      const d = hladkaCesta(t.body.map(([x, y]) => ({ x: px(x), y: py(y) })));
      E(svg, 'path', { d, fill: V('--turf', svg), stroke: V('--ink', svg), 'stroke-width': 1 });
    });
  } else {
    E(svg, 'rect', { x: tx0 - 7, y: ty0 - 5, width: 14, height: 9, rx: 1.5, fill: V('--turf', svg), stroke: V('--ink', svg), 'stroke-width': 1 });
  }
  if (obrys && obrys.green) pin(svg, gx, gy, { h: 13, r: 1.8, flagW: 10, flagH: 4.2 });
  else if (t.green) pin(svg, gx, gy, { h: Math.max(9, t.green.ry * m.meritkoY * 0.8), flagW: 11, flagH: 4.5 });

  /* --- 8. popisky ------------------------------------------------------ */
  let yGreenPopisek = null;
  if (sPopisky) {
    E(svg, 'text', { x: tx0, y: ty0 + 18, class: 'lab sm', 'text-anchor': 'middle' }, P.odpaliste);
    if (t.green || obrys) {
      const ryPx = obrys && obrys.green ? (bboxOf(hladkaCesta(obrys.green.body.map(([x, y]) => ({ x: px(x), y: py(y) })))).h / 2) : (t.green.ry * m.meritkoY);
      yGreenPopisek = gy - ryPx - 9;
      E(svg, 'text', { x: gx, y: yGreenPopisek, class: 'lab sm', 'text-anchor': 'middle' }, P.green);
    }
    if (popisky.length) {
      rozmistiPopisky(svg, popisky, {
        minX: m.minX, sirka: m.sirka, vyska: m.vyska,
        // popisky prvků nesmí kolidovat s popiskem greenu nahoře ani
        // s popiskem odpaliště dole
        hornihranice: (yGreenPopisek != null ? Math.max(-padH + 12, yGreenPopisek + 18) : -padH + 12),
        dolniHranice: ty0 + 4,
      });
    }
  }

  /* --- 8b. výškový profil (jen když ho karta doloží) -------------------- */
  if (t.profil && typeof t.profil.celkemM === 'number') {
    const sirkaP = Math.min(m.sirka * 0.62, 190);
    profilTerenu(svg, {
      x: m.minX + (m.sirka - sirkaP) / 2, y: ty0 + 36, w: sirkaP, h: 16,
      celkemM: t.profil.celkemM, delkaM: t.green ? t.green.y : 0, lang,
    });
  }

  /* --- 9. měřítko po straně ------------------------------------------- */
  const nejdelsi = obrys && obrys.green ? Math.max(...obrys.green.body.map((b) => b[1])) : (t.green ? t.green.y : 0);
  /* Krok měřítka se volí podle délky jamky. Dřív tu bylo natvrdo 100 m
     a `Math.max(2, …)`, což na krátké jamce vynutilo druhou značku ZA
     greenem: par 3 dlouhá 129 m dostala značku „200 m", která spadla mimo
     plátno (past nalezená strojovou kontrolou v Kroku 27). Značka nikdy
     nesmí ležet dál, než kam sahá jamka. */
  const krokM = nejdelsi >= 260 ? 100 : (nejdelsi >= 120 ? 50 : 25);
  meritkoPoStrane(svg, {
    x: m.minX - padL + 5, dole: ty0, meritkoY: m.meritkoY,
    pocet: Math.max(1, Math.floor(nejdelsi / krokM)), krokM,
  });

  return m;
}

/**
 * Nakreslí po straně plátu jamky drobné měřítko — přiznání podélného
 * zkrácení podle pravidla 5 ze zadání.
 *
 * @param {Element} svg
 * @param {{x:number, dole:number, meritkoY:number, krokM?:number, pocet?:number}} cfg
 */
export function meritkoPoStrane(svg, { x, dole, meritkoY, krokM = 100, pocet = 3 }) {
  const g = E(svg, 'g', { stroke: V('--ink2', svg), 'stroke-width': 0.8, opacity: 0.6, fill: 'none' });
  for (let i = 1; i <= pocet; i++) {
    const metru = i * krokM;
    const y = dole - metru * meritkoY;
    E(g, 'line', { x1: x, y1: y, x2: x + 8, y2: y });
    E(svg, 'text', { x: x + 11, y: y + 3.5, class: 'lab sm meritko', opacity: 0.8 }, `${metru} m`);
  }
}
