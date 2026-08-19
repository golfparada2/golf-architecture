/**
 * ROUTING — spolecne.js
 * ============================================================================
 * Sdílené vzorce, které se opakují v každé lekci: karta reálné jamky, tři
 * otevřené otázky s ukládáním konceptu a slovníček pojmů. Vytažené z
 * `lekce/01/index.html` až v kroku 5 — lekce 1 zůstává, jak byla schválená
 * a dodaná (nepřepisuji dodaný kód kvůli refaktoringu), tenhle modul
 * používají teprve lekce 2 a výš.
 *
 * Očekávaná struktura slovníku pro `kartaJamky`:
 *   slovnik[lang].spolecneKarty = { specsHead, parLabel, delkaLabel,
 *     architektLabel, vznikLabel, prameny, otazkaLabel }
 * (stejný tvar jako v `data/preklady/lekce-01.json`.)
 * ============================================================================
 */

import { vykresliJamku } from './platy.js';

/**
 * Vykreslí kartu jedné reálné jamky (plát + textový panel) a připojí ji do
 * `container`. Plát se kreslí AŽ po připojení do živého dokumentu — jinak
 * `V()`/`getComputedStyle()` v `platy.js` vrátí prázdné CSS proměnné a tvary
 * vyjdou černé (past objevená v kroku 4, viz `poznamky.md`).
 *
 * @param {Element} container
 * @param {Object} karta — obsah `data/jamky/<id>.json`
 * @param {Object} slovnik — `{ cs:{...}, en:{...} }` aktuální lekce
 * @param {'cs'|'en'} lang
 */
export function kartaJamky(container, karta, slovnik, lang) {
  const wrap = document.createElement('div');
  wrap.className = 'karta';
  container.appendChild(wrap);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('role', 'img');
  wrap.appendChild(svg);
  vykresliJamku(svg, karta);

  const K = slovnik[lang].spolecneKarty;
  const nazev = karta.nazev && karta.nazev[lang] ? `${karta.hriste} — ${karta.nazev[lang]}` : `${karta.hriste} · #${karta.jamka}`;
  const dl = karta.delky[0];
  const architekt = karta.architekt.uvadeny[lang];

  const hlava = document.createElement('p');
  hlava.className = 'kartaHlava';
  hlava.textContent = karta.zeme + ' · #' + karta.jamka;
  wrap.appendChild(hlava);

  const h3 = document.createElement('p');
  h3.className = 'kartaNazev';
  h3.textContent = nazev;
  wrap.appendChild(h3);

  const meta = document.createElement('p');
  meta.className = 'kartaMeta';
  meta.innerHTML = `<b>${K.parLabel}</b> ${karta.par} &nbsp;·&nbsp; <b>${K.delkaLabel}</b> ${dl.m} m / ${dl.yd} yd &nbsp;·&nbsp; <b>${K.architektLabel}</b> ${architekt} &nbsp;·&nbsp; <b>${K.vznikLabel}</b> ${karta.vznik}`;
  wrap.appendChild(meta);

  const otazka = document.createElement('p');
  otazka.className = 'kartaOtazka';
  otazka.innerHTML = `<b>${K.otazkaLabel}:</b> ${karta.otazka[lang]}`;
  wrap.appendChild(otazka);

  const specsHead = document.createElement('div');
  specsHead.className = 'hr';
  specsHead.style.marginTop = '16px';
  specsHead.innerHTML = `<span>${K.specsHead}</span>`;
  wrap.appendChild(specsHead);

  const specs = document.createElement('div');
  specs.className = 'specs kartaPrvky';
  karta.prvky.forEach((p) => {
    const d = document.createElement('div');
    d.className = 'spec';
    d.innerHTML = `<h3>${p.nazev[lang]}</h3><div class="bar"></div><p>${p.popis[lang]}</p>`;
    specs.appendChild(d);
  });
  wrap.appendChild(specs);

  const prameny = document.createElement('p');
  prameny.className = 'kartaPrameny';
  prameny.innerHTML = `<b>${K.prameny}:</b> ` + karta.prameny.map((p) => `<a href="${p.url}" target="_blank" rel="noopener">${p.titul}</a>`).join(' · ');
  wrap.appendChild(prameny);

  return wrap;
}

/**
 * Vykreslí N otevřených otázek s textovými poli, jejichž koncepty se
 * ukládají do `localStorage` (žádné bodování — viz zadání, část 9: „Putt —
 * 3 otevřené otázky, žádné memorování").
 *
 * @param {{
 *   container: Element, slovnik: Object,
 *   jazyk: { lang:'cs'|'en', t:(klic:string)=>any },
 *   klicOtazky: string,           // tečková cesta k poli otázek, např. 'putt.otazky'
 *   klicPlaceholder: string,      // tečková cesta k placeholderu
 *   klicUlozeno: string,          // tečková cesta k „uloženo" hlášce
 *   ulozisteKlic: string,         // localStorage klíč, např. 'routing.poznamky.lekce2'
 * }} cfg
 */
export function vytvorPutt(cfg) {
  const { container, jazyk, klicOtazky, klicPlaceholder, klicUlozeno, ulozisteKlic } = cfg;

  function nacti() {
    try {
      const a = JSON.parse(localStorage.getItem(ulozisteKlic) || '[]');
      return Array.isArray(a) ? a : [];
    } catch {
      return [];
    }
  }
  function uloz(i, text) {
    const a = nacti();
    a[i] = text;
    localStorage.setItem(ulozisteKlic, JSON.stringify(a));
  }

  function render() {
    container.innerHTML = '';
    const otazky = jazyk.t(klicOtazky) || [];
    const ulozene = nacti();
    otazky.forEach((text, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'puttQ';
      const p = document.createElement('p');
      p.className = 'otazka';
      p.textContent = text;
      const ta = document.createElement('textarea');
      ta.placeholder = jazyk.t(klicPlaceholder);
      ta.value = ulozene[i] || '';
      const saved = document.createElement('p');
      saved.className = 'puttSaved';
      saved.textContent = ta.value ? jazyk.t(klicUlozeno) : '';
      ta.addEventListener('input', () => {
        uloz(i, ta.value);
        saved.textContent = jazyk.t(klicUlozeno);
      });
      wrap.appendChild(p); wrap.appendChild(ta); wrap.appendChild(saved);
      container.appendChild(wrap);
    });
  }
  render();
  return { render };
}

/**
 * Vykreslí slovníček pojmů (5–8 dvojic pojem/popis, zadání část 9) jako
 * definiční seznam.
 * @param {Element} container
 * @param {{lang:'cs'|'en', t:(klic:string)=>any}} jazyk
 * @param {string} klicPojmy — tečková cesta k poli `[{pojem,popis}]`
 */
export function renderSlovnicek(container, jazyk, klicPojmy) {
  container.innerHTML = '';
  (jazyk.t(klicPojmy) || []).forEach((p) => {
    const div = document.createElement('div');
    div.className = 'pojem';
    const dt = document.createElement('dt'); dt.textContent = p.pojem;
    const dd = document.createElement('dd'); dd.textContent = p.popis;
    div.appendChild(dt); div.appendChild(dd);
    container.appendChild(div);
  });
}
