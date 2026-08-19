/**
 * ROUTING — vysledky.js
 * ============================================================================
 * Ukládání a čtení výsledků zkoušek. Statický web nemá kam ukládat jinam
 * než do prohlížeče (zadání, část 10).
 *
 *   localStorage["routing.vysledky"] = [
 *     { lekce: 1, pokus: 1, datum: "2026-08-18T16:40:00Z",
 *       procenta: 83, body: 83, maximum: 100,
 *       otazky: [ { c: 1, tema: "strategie", body: 20, max: 20 }, ... ] }
 *   ]
 *
 * PRAVIDLA:
 * - Do celkového hodnocení kurzu se počítá jen `pokus === 1`. Opakování je
 *   povolené a žádoucí, ale nikdy nepřepisuje původní záznam — `ulozPokus`
 *   proto vždy PŘIDÁ nový záznam, nikdy nic nemaže ani nenahrazuje.
 * - Formát je verzovaný polem `verze` — ale na úrovni EXPORTNÍHO souboru
 *   (`exportJSON`/`stahniSoubor`), ne uvnitř každého záznamu: to je místo,
 *   které se bude při migraci formátu skutečně číst.
 * ============================================================================
 */

const KLIC = 'routing.vysledky';

/** Přečte všechny uložené pokusy ze všech lekcí. Nikdy nevyhodí — při poškozených datech vrátí prázdné pole. */
export function nactiVsechny() {
  try {
    const raw = localStorage.getItem(KLIC);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/**
 * Uloží nový pokus o zkoušku. Číslo pokusu se spočítá samo (počet
 * dosavadních pokusů dané lekce + 1) — volající kód ho nezadává.
 *
 * @param {number} lekce
 * @param {{c:number, tema:string, body:number, max:number}[]} otazky
 * @param {{body?:number, maximum?:number}} [souhrn] — když chybí, spočítá se součtem z `otazky`
 * @returns {Object} — uložený záznam
 */
export function ulozPokus(lekce, otazky, souhrn = {}) {
  const vsechny = nactiVsechny();
  const predchozich = vsechny.filter(z => z.lekce === lekce).length;
  const body = souhrn.body ?? otazky.reduce((s, o) => s + o.body, 0);
  const maximum = souhrn.maximum ?? otazky.reduce((s, o) => s + o.max, 0);
  const zaznam = {
    lekce,
    pokus: predchozich + 1,
    datum: new Date().toISOString(),
    procenta: maximum ? Math.round((body / maximum) * 100) : 0,
    body,
    maximum,
    otazky,
  };
  vsechny.push(zaznam);
  localStorage.setItem(KLIC, JSON.stringify(vsechny));
  return zaznam;
}

/** Všechny pokusy dané lekce, v pořadí, jak byly uloženy. */
export function pokusyLekce(lekce) {
  return nactiVsechny().filter(z => z.lekce === lekce);
}

/** Jen první pokusy ze všech lekcí — tohle (a jen tohle) patří do celkového hodnocení kurzu. */
export function prvniPokusy() {
  return nactiVsechny().filter(z => z.pokus === 1);
}

/**
 * Zařadí procenta do jednoho ze čtyř pásem (zadání, část 10). Hranice jsou
 * stejné ve všech lekcích; slovní hodnocení a konkrétní doporučení pro
 * dané pásmo si každá lekce drží ve vlastním slovníku
 * (`data/preklady/lekce-NN.json`), protože musí být konkrétní
 * („vrať se ke cvičení s bunkrem“, ne „zopakuj si látku“).
 * @param {number} procenta
 * @returns {'vyborne'|'dobre'|'projdes'|'zopakuj'}
 */
export function pasmo(procenta) {
  if (procenta >= 90) return 'vyborne';
  if (procenta >= 75) return 'dobre';
  if (procenta >= 50) return 'projdes';
  return 'zopakuj';
}

/** Exportní formát jako řetězec — obalený objekt s polem `verze` pro budoucí migraci. */
export function exportJSON() {
  return JSON.stringify({ verze: 1, vysledky: nactiVsechny() }, null, 2);
}

/** Nahraje výsledky ze staženého souboru zpět do `localStorage`. Přijímá jak obalený formát `{verze,vysledky}`, tak čisté pole (starší/cizí export). */
export function importJSON(text) {
  const parsed = JSON.parse(text);
  const vysledky = Array.isArray(parsed) ? parsed : parsed.vysledky;
  if (!Array.isArray(vysledky)) throw new Error('Neplatný formát souboru s výsledky.');
  localStorage.setItem(KLIC, JSON.stringify(vysledky));
  return vysledky;
}

/** Spustí stažení aktuálních výsledků jako soubor `routing-vysledky.json`. */
export function stahniSoubor(nazev = 'routing-vysledky.json') {
  const blob = new Blob([exportJSON()], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nazev;
  a.click();
  URL.revokeObjectURL(a.href);
}
