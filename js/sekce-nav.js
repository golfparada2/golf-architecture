/**
 * ROUTING — sekce-nav.js
 * ============================================================================
 * Sdílená navigace mezi sekcemi rozdělené lekce. Přidáno při úpravě po
 * nasazení na GitHub Pages: uživatel chtěl místo jedné dlouhé stránky na
 * lekci víc skutečných HTML stránek (viz poznamky.md) — každá lekce má teď
 * 7 sekcí, každá na vlastní stránce `lekce/NN/<pořadí>-<slug>.html`, plus
 * `lekce/NN/index.html` jako mini-rozcestník té jedné lekce (přehled sekcí,
 * stejný vzor jako hlavní `prehled/index.html`).
 *
 * Pořadí a soubor každé sekce je tu na jednom místě, aby se nerozjelo mezi
 * 21 stránkami (3 lekce × 7 sekcí) — `klic` je tečková cesta do slovníku
 * dané lekce (`data/preklady/lekce-NN.json`), odkud se čte `over`/`title`
 * pro popisky v navigaci i pro seznam na mini-rozcestníku.
 * ==========================================================================*/

export const CELKEM_LEKCI_HOTOVO = 7;
export const CELKEM_LEKCI = 18;

/** Sekce jsou u všech hotových lekcí ve stejném pořadí a se stejným
 * počtem stránek (7) — liší se jen `klic` u první sekce (lekce 1 má tee shot
 * rozdělený na dva pláty `teeShot1`/`teeShot2`, ale jako sekci/stránku ji
 * pojmenovává jen `teeShot1`, druhý plát žije na téže stránce). */
export function sekceLekce(lekce) {
  const teeShotKlic = lekce === 1 ? 'teeShot1' : 'teeShot';
  return [
    { soubor: '1-tee-shot.html', klic: teeShotKlic },
    { soubor: '2-fairway.html', klic: 'fairway' },
    { soubor: '3-ceska-jamka.html', klic: 'ceskaJamka' },
    { soubor: '4-approach.html', klic: 'approachNadpis' },
    { soubor: '5-putt.html', klic: 'putt' },
    { soubor: '6-slovnicek.html', klic: 'slovnicek' },
    { soubor: '7-zkouska.html', klic: 'zkouska' },
  ];
}

/**
 * Krátký název sekce pro navigaci. Nadpis plátu je rozdělený na `over`
 * a `title` („Šest otázek za" + „100 bodů") — v drobečcích ani v ukazateli
 * kroků se to nedá použít, protože samotné „100 bodů" nic neříká. Proto má
 * každá lekce ve slovníku `nav.sekceNazvy`: sedm krátkých, srovnatelných
 * jmen. Když chybí, poskládá se náhrada z `over` + `title`.
 */
export function nazevSekce(jazyk, sekce, index) {
  const nazvy = jazyk.t('nav.sekceNazvy');
  if (Array.isArray(nazvy) && nazvy[index]) return nazvy[index];
  const over = jazyk.t(sekce.klic + '.over') || '';
  const title = jazyk.t(sekce.klic + '.title') || '';
  return (over + ' ' + title).trim();
}

function lekce2(n) { return String(n).padStart(2, '0'); }

/**
 * Vykreslí „Krok N z 7“ popisek a spodní prev/next navigaci na sekční
 * stránce. Volá se z `jazyk.on()`, ať se při přepnutí jazyka přepíšou i
 * popisky sousedních sekcí.
 *
 * @param {{lekce:number, index:number, jazyk:Object, krokEl:Element, navEl:Element}} cfg
 */
export function vykresliNavSekci({ lekce, index, jazyk, krokEl, navEl }) {
  const sekce = sekceLekce(lekce);
  if (krokEl) krokEl.textContent = jazyk.t('nav.krok').replace('{n}', index + 1);

  navEl.innerHTML = '';

  // Předchozí — na první sekci vede zpátky na mini-rozcestník lekce.
  const pred = document.createElement('a');
  pred.className = 'navBtn';
  if (index === 0) {
    pred.href = 'index.html';
    pred.innerHTML = `<span class="k">← ${jazyk.t('nav.prehled')}</span>`;
  } else {
    const s = sekce[index - 1];
    pred.href = s.soubor;
    pred.innerHTML = `<span class="k">← ${jazyk.t('nav.predchozi')}</span><span class="n">${nazevSekce(jazyk, s, index - 1)}</span>`;
  }
  navEl.appendChild(pred);

  // Další — na poslední sekci (zkouška) vede na mini-rozcestník příští
  // lekce, pokud existuje, jinak je zneaktivněná (další lekce zatím není
  // hotová — viz zadání, část 14, průběžné dodávání).
  const dalsi = document.createElement('a');
  dalsi.className = 'navBtn dalsi';
  if (index === sekce.length - 1) {
    if (lekce < CELKEM_LEKCI_HOTOVO) {
      dalsi.href = `../${lekce2(lekce + 1)}/index.html`;
      dalsi.innerHTML = `<span class="k">${jazyk.t('nav.dalsiLekce')} →</span>`;
    } else {
      /* Konec poslední hotové lekce byl do redesignu slepý — zneaktivněné
         tlačítko a nic dál (AUDIT.md, bod 2.6). Teď vede do sbírky jamek,
         která je hotová a dá se v ní pokračovat. */
      dalsi.href = '../../jamky/index.html';
      dalsi.innerHTML = `<span class="k">${jazyk.t('nav.konecKurzu')} →</span>`;
    }
  } else {
    const s = sekce[index + 1];
    dalsi.href = s.soubor;
    dalsi.innerHTML = `<span class="k">${jazyk.t('nav.dalsi')} →</span><span class="n">${nazevSekce(jazyk, s, index + 1)}</span>`;
  }
  navEl.appendChild(dalsi);
}
