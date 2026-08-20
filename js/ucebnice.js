/**
 * ROUTING — ucebnice.js
 * ============================================================================
 * Kostra UČEBNICE: to, co má mít každá kapitola, ale co v kurzu chybělo
 * (viz AUDIT.md, body 1.4–1.6 a 2.1).
 *
 *   1. „Kde jsem"      — drobečková navigace + ukazatel sedmi kroků lekce
 *   2. „Co se naučím"  — jedna až tři věty na začátku kapitoly
 *   3. „Zapamatuj si"  — tři až pět bodů na konci kapitoly
 *   4. „Kde jsem skončil" — poslední navštívená sekce v `localStorage`
 *   5. Kontextová nápověda — odborný pojem v textu se dá klepnutím vysvětlit,
 *      aniž by student musel opustit stránku
 *
 * ZÁSADY, KTERÉ TENHLE MODUL DODRŽUJE:
 * - Žádný řetězec natvrdo. Texty rozhraní žijí v `data/preklady/ui.json`,
 *   obsah kapitol ve slovníku dané lekce.
 * - Všechny cesty relativní (GitHub Pages v podadresáři) — proto skoro každá
 *   funkce bere `zaklad`, tedy cestu ke kořeni webu z aktuální stránky
 *   (`'../../'` ze sekce lekce, `'../'` z přehledu, `''` z kořene).
 * - Nic se nevykresluje na stránku, která si o to neřekne: chybí-li cílový
 *   element nebo data, funkce tiše skončí.
 * ============================================================================
 */

import { sekceLekce, nazevSekce, CELKEM_LEKCI_HOTOVO } from './sekce-nav.js';

const KLIC_POSTUP = 'routing.postup';
let UI = null;

/**
 * Načte sdílený slovník rozhraní. Volá se jednou za stránku; výsledek se
 * drží v modulu, takže opakované volání nic nestahuje.
 * @param {string} zaklad — relativní cesta ke kořeni webu, např. '../../'
 */
export async function nactiUI(zaklad = '') {
  if (UI) return UI;
  const res = await fetch(`${zaklad}data/preklady/ui.json`);
  if (!res.ok) throw new Error(`Slovník rozhraní se nepodařilo načíst (HTTP ${res.status}).`);
  UI = await res.json();
  nactiVerzi(zaklad);          // datum v patičce — doplněk, neblokuje stránku
  return UI;
}

/** Text z `ui.json` v daném jazyce. */
export function u(lang, klic) {
  return (UI && UI[lang] && UI[lang][klic]) || '';
}

const cislo2 = (n) => String(n).padStart(2, '0');

/* ==========================================================================
 * 1 · Kde jsem — drobečky a ukazatel kroků
 * ======================================================================== */

/**
 * Drobečková navigace „Kurz › Lekce 1 › Approach". Poslední položka je
 * aktuální stránka a nemá odkaz (`aria-current="page"`).
 *
 * @param {Element} el — kam se vykreslí (obvykle `<nav class="drobky">`)
 * @param {{lekce:number, index:number, jazyk:Object, zaklad?:string}} cfg
 */
export function vykresliDrobky(el, { lekce, index, jazyk, zaklad = '../../' }) {
  if (!el) return;
  const lang = jazyk.lang;
  const sekce = sekceLekce(lekce);
  const s = sekce[index];

  const polozky = [
    { text: u(lang, 'prehled'), href: `${zaklad}prehled/index.html` },
    { text: u(lang, 'lekceN').replace('{n}', lekce), href: `${zaklad}lekce/${cislo2(lekce)}/index.html` },
    { text: nazevSekce(jazyk, s, index), href: null },
  ];

  el.setAttribute('aria-label', u(lang, 'drobkyLabel'));
  el.innerHTML = '';
  const ol = document.createElement('ol');
  polozky.forEach((p) => {
    const li = document.createElement('li');
    if (p.href) {
      const a = document.createElement('a');
      a.href = p.href; a.textContent = p.text;
      li.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.setAttribute('aria-current', 'page');
      span.textContent = p.text;
      li.appendChild(span);
    }
    ol.appendChild(li);
  });
  el.appendChild(ol);
}

/**
 * Tichý ukazatel sedmi kroků lekce. Každý krok je odkaz — student se může
 * vrátit na kteroukoli část, aniž by musel přes rozcestník lekce.
 *
 * @param {Element} el
 * @param {{lekce:number, index:number, jazyk:Object}} cfg
 */
export function vykresliKroky(el, { lekce, index, jazyk }) {
  if (!el) return;
  const lang = jazyk.lang;
  el.setAttribute('aria-label', u(lang, 'krokyLabel'));
  el.innerHTML = '';
  sekceLekce(lekce).forEach((s, i) => {
    const a = document.createElement('a');
    a.className = 'krok';
    a.href = s.soubor;
    if (i === index) a.setAttribute('aria-current', 'step');
    const nazev = nazevSekce(jazyk, s, i);
    a.innerHTML = `<span class="kc">${cislo2(i + 1)}</span><span class="kn">${nazev}</span>`;
    a.title = `${u(lang, 'krokZ').replace('{n}', i + 1)} — ${nazev}`;
    el.appendChild(a);
  });
}

/* ==========================================================================
 * 2 a 3 · Rám kapitoly — „Co se naučím" a „Zapamatuj si"
 * ======================================================================== */

/**
 * „Co se tady naučím" — jedna až tři věty formulované z pohledu studenta.
 * Text čte ze slovníku lekce pod klíčem `<sekce>.cile` (pole řetězců).
 *
 * @param {Element} el @param {Object} jazyk @param {string} klicSekce
 */
export function vykresliCile(el, jazyk, klicSekce) {
  if (!el) return;
  const cile = jazyk.t(klicSekce + '.cile');
  if (!Array.isArray(cile) || !cile.length) { el.hidden = true; return; }
  el.hidden = false;
  el.className = 'cileBox';
  el.innerHTML = `<h2>${u(jazyk.lang, 'coSeNaucim')}</h2><ul>${cile.map((c) => `<li>${c}</li>`).join('')}</ul>`;
}

/**
 * „Zapamatuj si" — tři až pět bodů na konci kapitoly. Bez toho student
 * dočte stránku a neví, co si má odnést (audit, bod 2.1).
 *
 * @param {Element} el @param {Object} jazyk @param {string} klicSekce
 */
export function vykresliZapamatuj(el, jazyk, klicSekce) {
  if (!el) return;
  const body = jazyk.t(klicSekce + '.zapamatuj');
  if (!Array.isArray(body) || !body.length) { el.hidden = true; return; }
  el.hidden = false;
  el.className = 'zapamatujBox';
  el.innerHTML = `<h2>${u(jazyk.lang, 'zapamatujSi')}</h2><ol>${body.map((b) => `<li>${b}</li>`).join('')}</ol>`;
}

/* ==========================================================================
 * 4 · Kde jsem skončil
 * ======================================================================== */

/**
 * Zapamatuje poslední otevřenou sekci. Ukládá jen čísla a klíč, žádný text —
 * aby záznam přežil změnu jazyka i přepis obsahu lekce.
 * @param {{lekce:number, index:number}} kde
 */
export function ulozPostup({ lekce, index }) {
  try {
    localStorage.setItem(KLIC_POSTUP, JSON.stringify({ lekce, index, kdy: new Date().toISOString() }));
  } catch { /* soukromý režim prohlížeče — na funkci kurzu to nic nemění */ }
}

/** Poslední otevřená sekce, nebo `null`. Nikdy nevyhodí. */
export function nactiPostup() {
  try {
    const raw = localStorage.getItem(KLIC_POSTUP);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p.lekce !== 'number' || typeof p.index !== 'number') return null;
    if (p.lekce < 1 || p.lekce > CELKEM_LEKCI_HOTOVO) return null;
    const sekce = sekceLekce(p.lekce);
    if (p.index < 0 || p.index >= sekce.length) return null;
    return { ...p, soubor: `lekce/${cislo2(p.lekce)}/${sekce[p.index].soubor}`, klic: sekce[p.index].klic };
  } catch { return null; }
}

/**
 * Vykreslí odkaz „Pokračuj tam, kde jsi skončil". Vyžaduje slovník lekce,
 * ze které se má vzít název sekce — proto ho stránka, která má jen vlastní
 * slovník (rozcestník), předá jako `nazevSekce`.
 *
 * @param {Element} el
 * @param {{lang:'cs'|'en', zaklad?:string, nazevSekce?:string, popis?:string}} cfg
 * @returns {boolean} — `true`, když se odkaz vykreslil
 */
export function vykresliPokracovat(el, { lang, zaklad = '', nazevSekce, popis }) {
  if (!el) return false;
  const p = nactiPostup();
  if (!p) { el.hidden = true; return false; }
  el.hidden = false;
  el.className = 'pokracovat';
  el.href = zaklad + p.soubor;
  el.innerHTML =
    `<span class="k">${u(lang, 'pokracovatKicker')}</span>` +
    `<span class="n">${nazevSekce || u(lang, 'lekceN').replace('{n}', p.lekce)}</span>` +
    `<span class="s">${popis || u(lang, 'krokZ').replace('{n}', p.index + 1)}</span>`;
  return true;
}

/* ==========================================================================
 * 5 · Kontextová nápověda ke slovníčku
 *
 * Odborný pojem se v textu podtrhne tečkovaně a po klepnutí (nebo Enterem)
 * se pod ním rozbalí vysvětlení. Řešení je záměrně klikací, ne hover —
 * na telefonu, kde se kurz čte hlavně, hover neexistuje.
 *
 * Označí se VŽDY JEN PRVNÍ výskyt každého pojmu na stránce a nejvýš
 * `maxOznaceni` pojmů celkem: učebnice, ve které je podtržené každé druhé
 * slovo, se nedá číst.
 * ======================================================================== */

const PRESKOCIT_ZNACKY = new Set(['SCRIPT', 'STYLE', 'SVG', 'TEXTAREA', 'BUTTON', 'A',
  'H1', 'H2', 'H3', 'H4', 'CODE', 'SUMMARY', 'OPTION', 'LABEL']);
const PRESKOCIT_TRIDY = ['drobky', 'kroky', 'foot', 'kartaPrameny', 'prameny', 'pojemBublina',
  'lab', 'eyebrow', 'krokLabel', 'listMark', 'cileBox', 'zapamatujBox', 'sekceNav', 'topbar', 'abeceda'];

function lzeOznacit(uzel) {
  for (let el = uzel.parentElement; el; el = el.parentElement) {
    if (PRESKOCIT_ZNACKY.has(el.tagName)) return false;
    if (el.classList && PRESKOCIT_TRIDY.some((t) => el.classList.contains(t))) return false;
  }
  return true;
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/** Sestaví regulární výraz pro hledaný tvar pojmu, s hranicí slova i pro češtinu. */
function vyrazProPojem(tvar) {
  const jadro = escapeRe(tvar);
  try {
    return new RegExp(`(?<![\\p{L}\\p{N}])(${jadro})`, 'iu');
  } catch {
    // starší prohlížeč bez lookbehind — hranice slova stačí přibližně
    return new RegExp(`\\b(${jadro})`, 'i');
  }
}

/**
 * Projde text uvnitř `koren` a první výskyt každého pojmu ze slovníčku
 * promění v tlačítko s vysvětlením.
 *
 * @param {{koren:Element, slovnik:Object, lang:'cs'|'en', zaklad?:string,
 *          maxOznaceni?:number}} cfg
 */
export function zapojPojmy({ koren, slovnik, lang, zaklad = '../../', maxOznaceni = 9 }) {
  if (!koren || !slovnik || !slovnik[lang]) return;
  const pojmy = (slovnik[lang].pojmy || []).slice()
    // delší pojmy napřed, ať „strategická jamka" nesežere „jamka"
    .sort((a, b) => (b.pojem || '').length - (a.pojem || '').length);

  let oznaceno = 0;

  for (const pojem of pojmy) {
    if (oznaceno >= maxOznaceni) break;
    const tvary = (pojem.hledat && pojem.hledat.length ? pojem.hledat : [pojem.pojem])
      .slice().sort((a, b) => b.length - a.length);
    if (najdiAOznac(koren, tvary, pojem, lang, zaklad)) oznaceno++;
  }
}

function najdiAOznac(koren, tvary, pojem, lang, zaklad) {
  const chodec = document.createTreeWalker(koren, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeValue.trim().length > 2 && lzeOznacit(n))
      ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  const uzly = [];
  let n;
  while ((n = chodec.nextNode())) uzly.push(n);

  for (const uzel of uzly) {
    for (const tvar of tvary) {
      const re = vyrazProPojem(tvar);
      const m = re.exec(uzel.nodeValue);
      if (!m) continue;
      const zacatek = m.index + (m[0].length - m[1].length);
      const konec = zacatek + m[1].length;

      const pred = uzel.nodeValue.slice(0, zacatek);
      const slovo = uzel.nodeValue.slice(zacatek, konec);
      const za = uzel.nodeValue.slice(konec);

      const rodic = uzel.parentNode;
      const btn = vytvorTlacitkoPojmu(slovo, pojem, lang, zaklad);
      rodic.insertBefore(document.createTextNode(pred), uzel);
      rodic.insertBefore(btn, uzel);
      rodic.insertBefore(document.createTextNode(za), uzel);
      rodic.removeChild(uzel);
      return true;
    }
  }
  return false;
}

function vytvorTlacitkoPojmu(slovo, pojem, lang, zaklad) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pojemRef';
  btn.textContent = slovo;
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', `${u(lang, 'pojemOtevrit')}: ${pojem.pojem}`);

  btn.addEventListener('click', () => {
    const otevreno = btn.getAttribute('aria-expanded') === 'true';
    const dalsi = btn.nextElementSibling;
    if (otevreno && dalsi && dalsi.classList.contains('pojemBublina')) {
      dalsi.remove();
      btn.setAttribute('aria-expanded', 'false');
      return;
    }
    const bublina = document.createElement('span');
    bublina.className = 'pojemBublina';
    bublina.innerHTML =
      `<b>${pojem.pojem}</b> — ${pojem.popis} ` +
      `<a href="${zaklad}slovnicek/index.html">${u(lang, 'celySlovnicek')}</a>`;
    btn.after(bublina);
    btn.setAttribute('aria-expanded', 'true');
  });
  return btn;
}

/* ==========================================================================
 * Rámec sekční stránky — jedno volání místo šesti
 *
 * Každá z 21 sekčních stránek potřebuje totéž: drobečky, ukazatel kroků,
 * „Co se naučím", „Zapamatuj si", zapamatování postupu a kontextovou
 * nápovědu. Kdyby si to volala každá stránka po částech, přidání šesté
 * věci by znamenalo 21 úprav.
 * ======================================================================== */

/**
 * @param {{lekce:number, index:number, jazyk:Object, slovnikPojmu?:Object,
 *          zaklad?:string}} cfg
 */
export function vykresliRamec({ lekce, index, jazyk, slovnikPojmu, zaklad = '../../' }) {
  const $ = (id) => document.getElementById(id);
  const klicSekce = sekceLekce(lekce)[index].klic;

  vykresliDrobky($('drobky'), { lekce, index, jazyk, zaklad });
  vykresliKroky($('kroky'), { lekce, index, jazyk });
  vykresliCile($('cileBox'), jazyk, klicSekce);
  vykresliVyzkousej($('vyzkousejBox'), jazyk, klicSekce, `routing.vyzkousej.l${lekce}.${klicSekce}`);
  vykresliZapamatuj($('zapamatujBox'), jazyk, klicSekce);
  ulozPostup({ lekce, index });

  if (slovnikPojmu) {
    zapojPojmy({ koren: document.getElementById('obsah') || document.body,
                 slovnik: slovnikPojmu, lang: jazyk.lang, zaklad });
  }
}

/* ==========================================================================
 * 6 · Ovládání pracovního plátu klávesnicí
 *
 * Interaktivní úkoly („Kam patří bunkr", „Kam green nesmí", „Šest jamek")
 * do teď reagovaly jen na klepnutí myší nebo prstem — kdo ovládá počítač
 * klávesnicí, nemohl je vůbec splnit (AUDIT.md, bod 3.7).
 *
 * Řešení je záměrně jednoduché a stejné na všech třech plátech: plát je
 * fokusovatelný, šipky posouvají zaměřovač, Enter nebo mezerník potvrdí
 * volbu. Poloha se hlásí v procentech šířky a výšky plánu, protože metry
 * jsou na každém plátu jinak veliké.
 * ======================================================================== */

/**
 * @param {SVGSVGElement} svg
 * @param {{sirka:number, vyska:number, jazyk:Object,
 *          onVyber:(x:number,y:number)=>void, popis?:string,
 *          krok?:number, stavEl?:Element}} cfg
 *   `sirka`/`vyska` jsou rozměry viewBoxu, `onVyber` dostane souřadnice
 *   v týchž jednotkách jako `click` handler stránky.
 */
export function ovladaniKlavesnici(svg, { sirka, vyska, jazyk, onVyber, popis, krok = 20, stavEl }) {
  if (!svg) return;
  let x = sirka / 2, y = vyska / 2;
  let aktivni = false;

  svg.setAttribute('tabindex', '0');
  svg.setAttribute('role', 'application');
  if (popis) svg.setAttribute('aria-label', popis);

  function hlas() {
    if (!stavEl) return;
    stavEl.textContent = u(jazyk.lang, 'kurzorPoloha')
      .replace('{x}', Math.round((x / sirka) * 100))
      .replace('{y}', Math.round((1 - y / vyska) * 100));
  }

  function kresliKurzor() {
    if (!aktivni) return;
    const stary = svg.querySelector('.kurzorPlanu');
    if (stary) stary.remove();
    const g = document.createElementNS(SVG_NS_LOKAL, 'g');
    g.setAttribute('class', 'kurzorPlanu');
    g.setAttribute('aria-hidden', 'true');
    g.innerHTML =
      `<circle cx="${x}" cy="${y}" r="11" fill="none" stroke="${V('--flag', svg)}" stroke-width="1.6"/>` +
      `<path d="M${x - 17} ${y} h9 M${x + 8} ${y} h9 M${x} ${y - 17} v9 M${x} ${y + 8} v9" ` +
      `stroke="${V('--flag', svg)}" stroke-width="1.6" fill="none"/>`;
    svg.appendChild(g);
  }

  svg.addEventListener('focus', () => { aktivni = true; kresliKurzor(); hlas(); });
  svg.addEventListener('blur', () => {
    aktivni = false;
    const stary = svg.querySelector('.kurzorPlanu');
    if (stary) stary.remove();
  });

  svg.addEventListener('keydown', (ev) => {
    const d = ev.shiftKey ? krok * 3 : krok;
    let zpracovano = true;
    switch (ev.key) {
      case 'ArrowLeft': x = Math.max(0, x - d); break;
      case 'ArrowRight': x = Math.min(sirka, x + d); break;
      case 'ArrowUp': y = Math.max(0, y - d); break;
      case 'ArrowDown': y = Math.min(vyska, y + d); break;
      case 'Enter': case ' ': onVyber(x, y); break;
      default: zpracovano = false;
    }
    if (!zpracovano) return;
    ev.preventDefault();
    kresliKurzor();
    hlas();
  });

  return { kresliKurzor };
}

const SVG_NS_LOKAL = 'http://www.w3.org/2000/svg';

/** Lokální kopie čtení CSS proměnné — ať `ucebnice.js` nemusí táhnout celé `platy.js`. */
function V(name, el) {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

/* ==========================================================================
 * 7 · „Vyzkoušej" — krátký úkol na konci kapitoly
 *
 * Pedagogický model kurzu je: Co se naučím → Princip → Podívej se →
 * Rozebři → Vyzkoušej → Zapamatuj si. Sekce s pracovními pláty a otevřenými
 * otázkami mají „Vyzkoušej" v podobě samotného úkolu; sekce s reálnými
 * jamkami a slovníčkem ho neměly vůbec — student je jen přečetl.
 *
 * Odpověď se ukládá do prohlížeče, nikam se neodesílá a nikdo ji nehodnotí.
 * Není to test, je to způsob, jak přinutit hlavu něco s látkou udělat.
 * ======================================================================== */

/**
 * @param {Element} el
 * @param {Object} jazyk
 * @param {string} klicSekce
 * @param {string} ulozisteKlic — např. 'routing.vyzkousej.l1.fairway'
 */
export function vykresliVyzkousej(el, jazyk, klicSekce, ulozisteKlic) {
  if (!el) return;
  const v = jazyk.t(klicSekce + '.vyzkousej');
  if (!v || !v.otazka) { el.hidden = true; return; }
  el.hidden = false;
  el.className = 'vyzkousejBox';

  let ulozeno = '';
  try { ulozeno = localStorage.getItem(ulozisteKlic) || ''; } catch { ulozeno = ''; }

  el.innerHTML = '';
  const h = document.createElement('h2');
  h.textContent = u(jazyk.lang, 'vyzkousej');
  const p = document.createElement('p');
  p.className = 'otazka';
  p.textContent = v.otazka;
  const ta = document.createElement('textarea');
  ta.placeholder = v.placeholder || '';
  ta.value = ulozeno;
  ta.setAttribute('aria-label', v.otazka);
  const stav = document.createElement('p');
  stav.className = 'puttSaved';
  stav.textContent = ulozeno ? u(jazyk.lang, 'vyzkousejUlozeno') : '';
  ta.addEventListener('input', () => {
    try { localStorage.setItem(ulozisteKlic, ta.value); } catch { /* soukromý režim */ }
    stav.textContent = u(jazyk.lang, 'vyzkousejUlozeno');
  });
  el.append(h, p, ta, stav);
}

/* ==========================================================================
 * 8 · Datum poslední aktualizace v patičce
 *
 * Statický web bez build kroku si datum nedoplní sám, takže žije v
 * `data/verze.json` a udržuje se ručně. Vykresluje se do patičky každé
 * stránky — a protože patičku mají všechny stránky stejnou, instaluje se
 * samo z `nactiUI()`, aby se to nemuselo dopisovat do dvaceti sedmi
 * souborů zvlášť.
 *
 * Jazyk se hlídá přes `MutationObserver` na atributu `lang` kořenového
 * elementu: `jazyk.js` ho přepíná spolu s textem, takže se stačí svézt
 * s ním a není potřeba žádné další propojení.
 * ======================================================================== */

let VERZE = null;

function formatujDatum(iso, lang) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const den = d.getDate(), mesic = d.getMonth() + 1, rok = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return lang === 'cs'
    ? `${den}. ${mesic}. ${rok} v ${hh}:${mm}`
    : `${rok}-${String(mesic).padStart(2, '0')}-${String(den).padStart(2, '0')} ${hh}:${mm}`;
}

function vykresliAktualizaci() {
  if (!VERZE || !VERZE.aktualizovano) return;
  const lang = document.documentElement.lang === 'en' ? 'en' : 'cs';
  document.querySelectorAll('footer.foot, .foot').forEach((foot) => {
    let el = foot.querySelector('.aktualizace');
    if (!el) {
      el = document.createElement('span');
      el.className = 'aktualizace';
      foot.appendChild(el);
    }
    const t = document.createElement('time');
    t.dateTime = VERZE.aktualizovano;
    t.textContent = formatujDatum(VERZE.aktualizovano, lang);
    el.textContent = (lang === 'cs' ? 'Aktualizováno ' : 'Updated ');
    el.appendChild(t);
  });
}

/** Načte `data/verze.json` a nainstaluje datum do patičky. Volá `nactiUI()`. */
async function nactiVerzi(zaklad) {
  if (VERZE) { vykresliAktualizaci(); return; }
  try {
    const res = await fetch(`${zaklad}data/verze.json`);
    if (!res.ok) return;               // datum je doplněk, ne podmínka běhu
    VERZE = await res.json();
  } catch { return; }
  vykresliAktualizaci();
  new MutationObserver(vykresliAktualizaci)
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
}
