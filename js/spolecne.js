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
import { u } from './ucebnice.js';

/**
 * Nejaktuálnější délka jamky.
 *
 * Do teď se zobrazovala `delky[0]` — u Pebble Beach 18 tedy historických
 * 315 m z roku 1919 (kdy to byla par 4) místo dnešních 497 m (nález
 * auditu). „Poslední záznam v poli" ale taky nestačí: u TPC Sawgrass 17
 * je na prvním místě turnajová hodnota z roku 2025 a na druhém starší
 * „ikonických" 137 yardů. Pole prostě není chronologické.
 *
 * Pravidlo je proto: (1) záznam, který se sám označuje jako aktuální,
 * (2) jinak ten s nejvyšším rokem, (3) jinak poslední.
 */
function aktualniDelka(karta) {
  const d = (karta.delky || []).filter(Boolean);
  if (!d.length) return null;
  const oznaceny = d.find((x) => /aktuáln|current/i.test(x.odpaliste || ''));
  if (oznaceny) return oznaceny;
  const sRokem = d.filter((x) => typeof x.rok === 'number');
  if (sRokem.length) return sRokem.reduce((a, b) => (b.rok > a.rok ? b : a));
  return d[d.length - 1];
}

/**
 * Vykreslí kartu jedné reálné jamky a připojí ji do `container`.
 *
 * POŘADÍ (přeskládané při redesignu — audit, bod 2.2): student nejdřív
 * potřebuje vědět, na co se dívá a jakou otázku jamka klade, teprve pak má
 * smysl mu ukázat kresbu. Do teď byl obrázek první a jméno hřiště až páté.
 *
 *   1. hlavička — hřiště, jamka, par, délka, architekt, rok
 *   2. otázka jamky
 *   3. OBRAZ — schéma + „na co se dívat" + fotografie
 *   4. rozbor „Tři prvky"
 *   5. lekce přenositelná do vlastního návrhu
 *   6. prameny (sbalené, ať neutopí rozbor)
 *
 * Na širokém displeji sedí obraz vlevo a text vpravo (viz `styl.css`,
 * oddíl 16) — čte se to jako architektonická publikace, ne jako seznam.
 *
 * Plát se kreslí AŽ po připojení do živého dokumentu — jinak `V()` a
 * `getComputedTextLength()` v `platy.js` nemají co číst (past z kroku 4).
 *
 * @param {Element} container
 * @param {Object} karta — obsah `data/jamky/<id>.json`
 * @param {Object} slovnik — `{ cs:{...}, en:{...} }` aktuální lekce
 * @param {'cs'|'en'} lang
 * @param {{uroven?:number, zaklad?:string, stitek?:{stitek:string,proc:string}}} [opts]
 *   `stitek` je filozofie jamky pro lekci 1. `zaklad` je relativní
 *   cesta ke kořeni webu (fotky), např. '../../' ze sekce lekce, '../' ze sbírky
 */
export function kartaJamky(container, karta, slovnik, lang, opts = {}) {
  const K = slovnik[lang].spolecneKarty;
  const uroven = opts.uroven || 2;
  const zaklad = opts.zaklad || '../../';

  const wrap = document.createElement('article');
  wrap.className = 'karta';
  container.appendChild(wrap);

  /* --- 1. hlavička ---------------------------------------------------- */
  const hlavicka = document.createElement('div');
  hlavicka.className = 'kartaHlavicka';
  wrap.appendChild(hlavicka);

  /* Štítek filozofie jamky („Trestající / Strategická / Heroická") s jednou
     větou proč. Bez něj student projde tři karty a netuší, která je která —
     lekce to říkala jen v perexu a v „Zapamatuj si", ne u samotné jamky. */
  if (opts.stitek && opts.stitek.stitek) {
    const st = document.createElement('p');
    st.className = 'kartaStitek';
    st.innerHTML = `<b>${opts.stitek.stitek}</b>${opts.stitek.proc ? ' — ' + opts.stitek.proc : ''}`;
    hlavicka.appendChild(st);
  }

  const hlava = document.createElement('p');
  hlava.className = 'kartaHlava';
  hlava.textContent = `${karta.zeme} · #${karta.jamka} · par ${karta.par}`;
  hlavicka.appendChild(hlava);

  const nazev = karta.nazev && karta.nazev[lang]
    ? `${karta.hriste} — ${karta.nazev[lang]}`
    : karta.hriste;
  const h = document.createElement('h' + uroven);
  h.className = 'kartaNazev';
  h.textContent = nazev;
  hlavicka.appendChild(h);

  const dl = aktualniDelka(karta);
  const architekt = karta.architekt.uvadeny[lang];
  const meta = document.createElement('p');
  meta.className = 'kartaMeta';
  const delkaText = dl && dl.m != null ? `${dl.m} m / ${dl.yd} yd` : '—';
  meta.innerHTML =
    `<b>${K.delkaLabel}</b> ${delkaText} &nbsp;·&nbsp; ` +
    `<b>${K.architektLabel}</b> ${architekt} &nbsp;·&nbsp; ` +
    `<b>${K.vznikLabel}</b> ${karta.vznik}`;
  hlavicka.appendChild(meta);

  // starší délky se ukazují jako poznámka — jamky se prodlužují a číslo bez
  // roku je bezcenné (zadání, část 12), ale hlavní údaj má být ten dnešní
  if ((karta.delky || []).length > 1) {
    const starsi = document.createElement('p');
    starsi.className = 'kartaDelky';
    starsi.textContent = u(lang, 'historickeDelky') + ': ' + karta.delky
      .filter((x) => x !== dl)
      .sort((a, b) => (a.rok || 0) - (b.rok || 0))
      .map((d) => `${d.m} m${d.rok ? ` (${d.rok})` : ''}`).join(' · ');
    hlavicka.appendChild(starsi);
  }

  /* --- 2. otázka jamky ------------------------------------------------ */
  const otazka = document.createElement('p');
  otazka.className = 'kartaOtazka';
  otazka.innerHTML = `<b>${K.otazkaLabel}:</b> ${karta.otazka[lang]}`;
  hlavicka.appendChild(otazka);

  /* --- 3. obraz: schéma, na co se dívat, fotografie -------------------- */
  const obraz = document.createElement('div');
  obraz.className = 'kartaObraz';
  wrap.appendChild(obraz);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  obraz.appendChild(svg);
  vykresliJamku(svg, karta, { lang });

  /* Přepínač tisku (Krok 38): stejná kresba, jen bez barev — pro tisk na
     černobílé tiskárně nebo pro pracovní list. `--turf`/`--sand`/`--water`
     se čtou z CSS AŽ při kreslení (viz `platy.js`, hlavička souboru), takže
     samotné přidání třídy na `<svg>` nestačí — je nutné kartu překreslit,
     aby `V()` uvnitř `vykresliJamku()` sáhla po nové (přepsané) hodnotě. */
  const tiskToggle = document.createElement('div');
  tiskToggle.className = 'toggle';
  const tiskBtn = document.createElement('button');
  tiskBtn.type = 'button';
  tiskBtn.setAttribute('aria-pressed', 'false');
  tiskBtn.textContent = u(lang, 'tiskRezim');
  tiskBtn.addEventListener('click', () => {
    const zapnuto = svg.classList.toggle('rezimTisk');
    tiskBtn.setAttribute('aria-pressed', String(zapnuto));
    vykresliJamku(svg, karta, { lang });
  });
  tiskToggle.appendChild(tiskBtn);
  obraz.appendChild(tiskToggle);

  if (karta.naCoSeDivat && karta.naCoSeDivat[lang]) {
    const divat = document.createElement('p');
    divat.className = 'kartaDivat';
    divat.innerHTML = `<b>${u(lang, 'naCoSeDivat')}.</b> ${karta.naCoSeDivat[lang]}`;
    obraz.appendChild(divat);
  }

  if (karta.foto) {
    const f = karta.foto;
    const fig = document.createElement('figure');
    fig.className = 'kartaFoto';
    const img = document.createElement('img');
    img.src = `${zaklad}assets/foto/${f.soubor}`;
    img.alt = (f.alt && f.alt[lang]) || `${karta.hriste} #${karta.jamka}`;
    img.loading = 'lazy';
    img.decoding = 'async';
    // pevné rozměry brání poskočení sazby při načtení (audit, bod 3.6)
    if (f.sirka) { img.width = f.sirka; img.height = f.vyska; }
    fig.appendChild(img);
    const cap = document.createElement('figcaption');
    const pozn = f.poznamka && f.poznamka[lang] ? ` — ${f.poznamka[lang]}` : '';
    cap.innerHTML = `${K.fotoLabel || 'Foto'}${pozn} · ${f.autor}, ` +
      `<a href="${f.licenceUrl}" target="_blank" rel="noopener">${f.licence}</a>, ` +
      `<a href="${f.zdrojUrl}" target="_blank" rel="noopener">Wikimedia Commons</a>`;
    fig.appendChild(cap);
    obraz.appendChild(fig);
  }

  /* --- 4. rozbor „Tři prvky" ------------------------------------------ */
  const rozbor = document.createElement('div');
  rozbor.className = 'kartaRozbor';
  wrap.appendChild(rozbor);

  const specsHead = document.createElement('div');
  specsHead.className = 'hr';
  specsHead.innerHTML = `<span>${K.specsHead}</span>`;
  rozbor.appendChild(specsHead);

  const specs = document.createElement('div');
  specs.className = 'specs kartaPrvky';
  karta.prvky.forEach((p) => {
    const d = document.createElement('div');
    d.className = 'spec';
    d.innerHTML = `<h${uroven + 1}>${p.nazev[lang]}</h${uroven + 1}><div class="bar"></div><p>${p.popis[lang]}</p>`;
    specs.appendChild(d);
  });
  rozbor.appendChild(specs);

  /* --- 5. lekce přenositelná do vlastního návrhu ----------------------- */
  if (karta.lekce && karta.lekce[lang]) {
    const l = document.createElement('p');
    l.className = 'kartaLekce';
    l.innerHTML = `<b>${u(lang, 'lekceZJamky')}</b>${karta.lekce[lang]}`;
    rozbor.appendChild(l);
  }

  /* --- 6. prameny (sbalené) ------------------------------------------- */
  const det = document.createElement('details');
  det.className = 'prameny';
  const sum = document.createElement('summary');
  sum.textContent = `${u(lang, 'prameny') || K.prameny} (${karta.prameny.length})`;
  det.appendChild(sum);
  const seznam = document.createElement('p');
  seznam.innerHTML = karta.prameny
    .map((p) => `<a href="${p.url}" target="_blank" rel="noopener">${p.titul}</a>`).join(' · ');
  det.appendChild(seznam);
  if (karta.tvary && karta.tvary.poznamka) {
    const pozn = document.createElement('p');
    pozn.style.marginTop = '8px';
    pozn.style.fontStyle = 'italic';
    pozn.textContent = u(lang, 'schemaPoznamka') + '. ' + (lang === 'cs' ? karta.tvary.poznamka : '');
    det.appendChild(pozn);
  }
  rozbor.appendChild(det);

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
