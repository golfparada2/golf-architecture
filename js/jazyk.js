/**
 * ROUTING — jazyk.js
 * ============================================================================
 * Přepínač jazyka a plnění slovníku. Jedna instance na stránku.
 *
 * PRAVIDLA (zadání, část 6):
 * - Volba jazyka se drží v `localStorage` pod `routing.lang` a odráží se
 *   v adrese jako `?lang=en`, aby šel odkaz sdílet.
 * - Výchozí jazyk podle `navigator.language`, ale uložená volba (nebo
 *   parametr v URL) má přednost.
 * - `document.documentElement.lang` se přepíná spolu s textem.
 * - Prvky v HTML se značí `data-t="klic"` nebo `data-t="sekce.klic"`
 *   (tečková cesta do vnořeného slovníku). `jazyk.js` je naplní přes
 *   `innerHTML` — slovník tedy smí obsahovat jednoduché značky (`<b>`,
 *   `<em>`), ale nikdy nesmí obsahovat necenzurovaný uživatelský vstup.
 * - Popisky uvnitř kresby (klíč `L` ve slovníku) čte přímo kreslicí
 *   funkce plátu, ne tenhle modul — při přepnutí jazyka se má **celý plát
 *   překreslit**, ne přepisovat jednotlivé `<text>`. Proto `vytvorJazyk()`
 *   nabízí `on(fn)`: registruj tam překreslovací funkci plátu a zavolá se
 *   po každé změně jazyka i hned na startu.
 *
 * POUŽITÍ:
 *   import { nactiSlovnik, vytvorJazyk, t } from '../../js/jazyk.js';
 *   const slovnik = await nactiSlovnik('../../data/preklady/lekce-01.json');
 *   const jazyk = vytvorJazyk(slovnik);
 *   jazyk.on(lang => kreslPlat(svg, slovnik, lang));
 * ============================================================================
 */

const KLIC_ULOZISTE = 'routing.lang';

/**
 * Zjistí, jakým jazykem se má stránka otevřít — parametr v URL má
 * přednost před uloženou volbou, uložená volba před `navigator.language`.
 * @returns {'cs'|'en'}
 */
export function zjistiJazyk() {
  const zUrl = new URLSearchParams(location.search).get('lang');
  if (zUrl === 'cs' || zUrl === 'en') return zUrl;
  const ulozeny = localStorage.getItem(KLIC_ULOZISTE);
  if (ulozeny === 'cs' || ulozeny === 'en') return ulozeny;
  return (navigator.language || 'cs').toLowerCase().startsWith('en') ? 'en' : 'cs';
}

/**
 * Stáhne a naparsuje slovník JSON. Vyhodí čitelnou chybu, když se to
 * nepodaří — ať to není tichá bílá stránka.
 * @param {string} url — relativní cesta, nikdy začínající lomítkem (Pages v podadresáři)
 */
export async function nactiSlovnik(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Slovník „${url}“ se nepodařilo načíst (HTTP ${res.status}).`);
  return res.json();
}

/**
 * Přečte hodnotu ze slovníku podle tečkové cesty, např. `t(slovnik, 'cs', 'teeShot.title')`.
 * @param {Object} slovnik — `{ cs: {...}, en: {...} }`
 * @param {'cs'|'en'} lang
 * @param {string} klic
 */
export function t(slovnik, lang, klic) {
  let v = slovnik[lang];
  for (const cast of klic.split('.')) {
    if (v == null) return undefined;
    v = v[cast];
  }
  return v;
}

/**
 * Vytvoří řadič jazyka pro aktuální stránku: naplní všechny `[data-t]`
 * prvky, zapojí tlačítka `.lang button[data-l]`, udržuje `localStorage`,
 * `?lang=` v adrese a `document.documentElement.lang`.
 *
 * @param {Object} slovnik — `{ cs: {...}, en: {...} }`
 * @param {{ titul?: (lang:'cs'|'en') => string }} [opts] — `titul` nastaví
 *   `document.title` při každé změně jazyka
 * @returns {{
 *   readonly lang: 'cs'|'en',
 *   nastav: (lang:'cs'|'en') => void,
 *   on: (fn: (lang:'cs'|'en') => void) => void,
 *   t: (klic:string) => any,
 * }}
 */
export function vytvorJazyk(slovnik, opts = {}) {
  let lang = zjistiJazyk();
  const posluchaci = [];

  function naplnText(el) {
    const klic = el.dataset.t;
    const hodnota = t(slovnik, lang, klic);
    if (hodnota == null) return;
    if (el.dataset.tAttr) el.setAttribute(el.dataset.tAttr, hodnota);
    else el.innerHTML = hodnota;
  }

  function aplikuj() {
    document.documentElement.lang = lang;
    if (opts.titul) document.title = opts.titul(lang);
    document.querySelectorAll('[data-t]').forEach(naplnText);
    document.querySelectorAll('.lang button[data-l]').forEach(b => {
      b.setAttribute('aria-current', String(b.dataset.l === lang));
    });
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
    posluchaci.forEach(fn => fn(lang));
  }

  function nastav(novyLang) {
    if (novyLang !== 'cs' && novyLang !== 'en') return;
    lang = novyLang;
    localStorage.setItem(KLIC_ULOZISTE, lang);
    aplikuj();
  }

  document.querySelectorAll('.lang button[data-l]').forEach(b => {
    b.addEventListener('click', () => nastav(b.dataset.l));
  });

  aplikuj();

  return {
    get lang() { return lang; },
    nastav,
    on(fn) { posluchaci.push(fn); fn(lang); },
    t: (klic) => t(slovnik, lang, klic),
  };
}
