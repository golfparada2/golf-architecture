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
export function blob(cx, cy, rx, ry, rot, seed, amp = 0.09, n = 60) {
  const r = rng(seed);
  const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
  const co = Math.cos(rot), si = Math.sin(rot);
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * 6.283185;
    const w = 1 + amp * (
      Math.sin(t * 3 + ph[0]) * 0.5 +
      Math.sin(t * 5 + ph[1]) * 0.3 +
      Math.sin(t * 7 + ph[2]) * 0.2
    );
    const x = Math.cos(t) * rx * w, y = Math.sin(t) * ry * w;
    d += (i ? 'L' : 'M') + (cx + x * co - y * si).toFixed(1) + ' ' + (cy + x * si + y * co).toFixed(1) + ' ';
  }
  return d + 'Z';
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
  const r = rng(seed);
  const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
  const co = Math.cos(rot), si = Math.sin(rot);
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * 6.283185;
    const w = 1 + amp * (
      Math.sin(t * 3 + ph[0]) * 0.5 +
      Math.sin(t * 5 + ph[1]) * 0.3 +
      Math.sin(t * 7 + ph[2]) * 0.2
    );
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

/* ============================================================================
 * KARTY JAMEK — vykreslení `data/jamky/*.json` (zadání, část 12)
 *
 * Souřadnice v kartě jsou v metrech od odpaliště: x = boční odchylka
 * (kladně vpravo), y = vzdálenost po ose hry (roste směrem ke greenu).
 * Tenhle blok je „ta stejná funkce", která má podle zadání (část 5)
 * vykreslit libovolnou jamku — stačí jí dát jinou kartu.
 * ==========================================================================*/

/**
 * Ohraničující obdélník všech tvarů v `tvary` (green, bunkry, hazardy) v
 * metrech, s okrajem. Odpaliště (0,0) je vždy zahrnuté, i kdyby žádný tvar
 * nezasahoval tak blízko.
 * @param {Object} tvary — pole `tvary` z karty jamky
 * @param {{okraj?:number}} [opts]
 */
export function rozsahJamky(tvary, { okraj = 15 } = {}) {
  const tvary_ = [tvary.green, ...(tvary.bunkry || []), ...(tvary.hazardy || [])].filter(Boolean);
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  tvary_.forEach(s => {
    minX = Math.min(minX, s.x - s.rx); maxX = Math.max(maxX, s.x + s.rx);
    minY = Math.min(minY, s.y - s.ry); maxY = Math.max(maxY, s.y + s.ry);
  });
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
 * Podélná osa (y) se navíc zkracuje faktorem `zkraceni` — pravidlo 5 ze
 * zadání: jamka 345 m dlouhá a 45 m široká by v pravém měřítku byla
 * nepoužitelný proužek, přesně jako v tištěných yardage boocích ji
 * zkracujeme zhruba na polovinu. Boční osa (x) se nezkracuje.
 * `vykresliJamku()` pak zkrácení přiznává měřítkem po straně (pravidlo 5).
 *
 * @param {ReturnType<typeof rozsahJamky>} rozsah
 * @param {{cilovaSirka?:number, zkraceni?:number}} [opts]
 */
export function meritkoJamky(rozsah, { cilovaSirka = 300, zkraceni = 0.55 } = {}) {
  const meritkoX = cilovaSirka / rozsah.sirka;
  const meritkoY = meritkoX * zkraceni;
  return {
    meritkoX, meritkoY,
    sirka: cilovaSirka,
    vyska: rozsah.vyska * meritkoY,
    minX: rozsah.minX * meritkoX,
    maxY: rozsah.maxY,
  };
}

/**
 * Vykreslí libovolnou kartu jamky z `data/jamky/*.json` — okolní trávník,
 * hazardy, bunkry, green se šrafurou a radiální obrubou, praporek,
 * odpaliště a po straně měřítko přiznávající podélné zkrácení.
 *
 * @param {SVGSVGElement} svg — dostane nový `viewBox`, obsah se smaže a překreslí
 * @param {Object} karta — jeden soubor z `data/jamky/*.json`
 * @param {{cilovaSirka?:number, zkraceni?:number, okraj?:number}} [opts]
 * @returns {ReturnType<typeof meritkoJamky>} — měřítko, kdyby ho volající kód potřeboval dál (např. pro vlastní popisky)
 */
export function vykresliJamku(svg, karta, opts = {}) {
  const t = karta.tvary;
  const rozsah = rozsahJamky(t, { okraj: opts.okraj });
  const m = meritkoJamky(rozsah, opts);
  const px = (x) => x * m.meritkoX;
  const py = (y) => (m.maxY - y) * m.meritkoY;

  svg.setAttribute('viewBox', `${m.minX} 0 ${m.sirka} ${m.vyska}`);
  clear(svg);
  const defs = E(svg, 'defs', {});

  E(svg, 'rect', { x: m.minX, y: 0, width: m.sirka, height: m.vyska, fill: V('--turf-d', svg), opacity: 0.22 });

  (t.hazardy || []).forEach((h) => {
    const d = blob(px(h.x), py(h.y), h.rx * m.meritkoX, h.ry * m.meritkoY, h.rot, h.seed, h.amp, 44);
    const barva = h.typ === 'voda' ? V('--water', svg) : V('--turf-d', svg);
    E(svg, 'path', { d, fill: barva, opacity: 0.7, stroke: V('--ink', svg), 'stroke-width': 0.8 });
  });

  (t.bunkry || []).forEach((b, i) => {
    const bx = px(b.x), by = py(b.y), brx = b.rx * m.meritkoX, bry = b.ry * m.meritkoY;
    const d = blob(bx, by, brx, bry, b.rot, b.seed, b.amp, 40);
    const id = 'bk' + i + Math.round(b.seed);
    clipPath(defs, id, d);
    E(svg, 'path', { d, fill: V('--sand', svg) });
    stipple(svg, id, { x: bx - brx, y: by - bry, w: brx * 2, h: bry * 2 }, 24, b.seed + 3);
    E(svg, 'path', { d, fill: 'none', stroke: V('--ink', svg), 'stroke-width': 0.9 });
    radial(svg, blobPts(bx, by, brx, bry, b.rot, b.seed, b.amp, 40), b.seed + 4, { len: 6, w: 0.45, op: 0.6 });
  });

  if (t.green) {
    const g = t.green;
    const gx = px(g.x), gy = py(g.y), grx = g.rx * m.meritkoX, gry = g.ry * m.meritkoY;
    const d = blob(gx, gy, grx, gry, g.rot, g.seed, g.amp, 50);
    const id = 'gr' + Math.round(g.seed);
    clipPath(defs, id, d);
    E(svg, 'path', { d, fill: V('--turf', svg) });
    hatch(svg, id, { x: gx - grx, y: gy - gry, w: grx * 2, h: gry * 2 }, 1, 3, { op: 0.16, seed: g.seed + 1 });
    E(svg, 'path', { d, fill: 'none', stroke: V('--ink', svg), 'stroke-width': 1 });
    radial(svg, blobPts(gx, gy, grx, gry, g.rot, g.seed, g.amp, 50), g.seed + 2, { len: 5, w: 0.4, op: 0.5 });
    pin(svg, gx, gy, { h: Math.max(6, gry * 0.7) });
    E(svg, 'text', { x: gx, y: gy - gry - 6, class: 'lab sm', 'text-anchor': 'middle' }, 'GREEN');
  }

  const tx0 = px(0), ty0 = py(0);
  E(svg, 'rect', { x: tx0 - 6, y: ty0 - 4, width: 12, height: 8, rx: 1.5, fill: V('--turf', svg), stroke: V('--ink', svg), 'stroke-width': 0.9 });

  meritkoPoStrane(svg, { x: m.minX + 6, dole: ty0, meritkoY: m.meritkoY });
  return m;
}

/**
 * Nakreslí po straně plátu jamky drobné měřítko (značky po 50 m) — přiznání
 * podélného zkrácení podle pravidla 5 ze zadání. Interní pomůcka
 * `vykresliJamku()`, ale je exportovaná pro případ, že ji bude chtít
 * lekce použít samostatně (např. na plátu, kde se jamka kreslí ručně).
 * @param {Element} svg
 * @param {{x:number, dole:number, meritkoY:number, krokM?:number, pocet?:number}} cfg
 */
export function meritkoPoStrane(svg, { x, dole, meritkoY, krokM = 50, pocet = 3 }) {
  const g = E(svg, 'g', { stroke: V('--ink2', svg), 'stroke-width': 0.8, opacity: 0.65, fill: 'none' });
  for (let i = 0; i <= pocet; i++) {
    const metru = i * krokM;
    const y = dole - metru * meritkoY;
    E(g, 'line', { x1: x, y1: y, x2: x + 10, y2: y });
    E(svg, 'text', { x: x + 13, y: y + 4, class: 'lab sm' }, `${metru} m`);
  }
}
