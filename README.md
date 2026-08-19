# ROUTING — kurz golfové architektury

Výuková aplikace o golfové architektuře pro středoškolské golfisty (15–19 let).
Statický web, žádný server, běží na GitHub Pages. Viz `zadani.md` pro plné zadání.

Stav: **lekce 1–3 hotové** (kroky 1–6 z postupu, část 14 zadání) — kreslicí
knihovna, 10 karet jamek, tři kompletní lekce (Proč jamka vypadá, jak
vypadá / Čtení pozemku / Routing) i rozcestník s přehledem výsledků.
Lekce 4–18 přibudou v dalších krocích podle stejného vzoru.

Web je vícestránkový (ne SPA) — každá lekce je rozdělená na 7 samostatných
HTML stránek + mini-rozcestník lekce, kořenová `index.html` je úvodní
stránka kurzu a funkční rozcestník lekcí/výsledků žije na
`prehled/index.html`. Navíc jsou tu dvě samostatné referenční stránky:
`slovnicek/` (všech 38 pojmů kurzu abecedně a dvojjazyčně) a `jamky/`
(sbírka deseti rozebraných jamek v jednotném formátu). 7 z 10 karet reálných jamek má i skutečnou fotku
(volně licencované snímky z Wikimedia Commons); zbylé čtyři (Cypress Point,
Sand Hills, Zbraslav, Dobrouč) žádnou volně licencovanou fotku nemají — viz
`poznamky.md`.

## Lokální spuštění

ES moduly (`<script type="module">`) nefungují přes `file://` — prohlížeč je
z bezpečnostních důvodů blokuje. Spusť v kořeni repozitáře jednoduchý lokální
server:

```bash
python3 -m http.server 8000
# nebo
npx serve
```

a otevři `http://localhost:8000/`.

## Struktura

```
/
├─ index.html          úvodní (marketingová) stránka celého kurzu
├─ prehled/
│  └─ index.html        funkční rozcestník — seznam lekcí a přehled výsledků
├─ .nojekyll            vypne zpracování Jekyllem (povinné, viz níže)
├─ assets/
│  ├─ fonts/            Fraunces + Literata, self-hosted, woff2
│  ├─ foto/              reálné fotky jamek a úvodní fotka (Wikimedia Commons, viz níže)
│  └─ styl.css          sdílené proměnné, sazba, responzivní pravidla
├─ js/
│  ├─ platy.js           kreslicí knihovna (perokresba, šrafura)
│  ├─ simulace.js         statistický model hry
│  ├─ zkouska.js           vykreslení a vyhodnocení testu
│  ├─ jazyk.js             přepínač jazyka a slovníky
│  ├─ vysledky.js          ukládání výsledků a přehled
│  ├─ spolecne.js          sdílené vzorce lekcí (karta jamky, otevřené otázky, slovníček)
│  ├─ sekce-nav.js         navigace mezi sekcemi vícestránkové lekce
│  └─ ucebnice.js          kostra učebnice — drobečky, ukazatel kroků, „Co se naučím“,
│                          „Zapamatuj si“, „pokračuj kde jsi skončil“, kontextová
│                          nápověda ke slovníčku, ovládání pracovního plátu klávesnicí
├─ data/
│  ├─ jamky/*.json       karty jamek včetně tvarových dat (a `foto`, pokud existuje)
│  └─ preklady/*.json     slovníky cs/en:
│                          `uvod.json` = úvodní stránka · `rozcestnik.json` = `prehled/`
│                          `lekce-NN.json` = lekce · `ui.json` = sdílené texty rozhraní
│                          `slovnik-pojmu.json` = globální slovníček
│                          `jamky.json` = sbírka jamek
└─ lekce/
   ├─ 01/
   │  ├─ index.html       mini-rozcestník lekce (přehled sedmi sekcí)
   │  ├─ 1-tee-shot.html
   │  ├─ 2-fairway.html
   │  ├─ 3-ceska-jamka.html
   │  ├─ 4-approach.html
   │  ├─ 5-putt.html
   │  ├─ 6-slovnicek.html
   │  └─ 7-zkouska.html
   ├─ 02/  (stejná struktura)
   └─ 03/  (stejná struktura)
```

Každá lekce je tedy sedm samostatných HTML stránek (ne jedna dlouhá SPA
stránka) plus vlastní mini-rozcestník `index.html`, mezi kterými se
prochází sdílenou navigační lištou dole (`js/sekce-nav.js`).

`js/`, `data/` a `lekce/01–03` jsou hotové a naplněné. Lekce 4–18 přibudou
postupně stejným způsobem (viz „Jak přidat lekci" níže).

## Jak přidat lekci

1. Vytvoř větev `lekce-NN` z `main`.
2. Karta(y) jamek do `data/jamky/*.json` (struktura viz zadání, část 12).
3. Slovník lekce do `data/preklady/lekce-NN.json`, klíč `{ cs: {...}, en: {...} }`.
4. `lekce/NN/` — sedm stránek (`1-tee-shot.html` … `7-zkouska.html`, obsah
   Tee shot / Fairway / Approach / Putt / Zkouška podle zadání část 9) plus
   `index.html` jako mini-rozcestník lekce. Nejrychlejší cesta je zkopírovat
   `lekce/01/` jako šablonu a upravit obsah — sdílené kousky (karta jamky,
   otevřené otázky, slovníček, navigace mezi sekcemi) už jedou přes
   `js/spolecne.js` a `js/sekce-nav.js`, není potřeba je psát znovu. Žádný
   řetězec natvrdo v kódu, žádná absolutní cesta (začínající `/`) — Pages
   běží v podadresáři.
5. Otevři pull request do `main` s popisem, co je hotové a co zbývá ověřit.
   Jedna lekce = jedna větev = jeden PR.
6. Po schválení a mergi přidej lekci do seznamu v
   `data/preklady/rozcestnik.json` (klíč `lekce`) — zobrazí se na
   `prehled/index.html` automaticky.

## Nasazení

GitHub Pages, zdroj `/` (root) na větvi `main`. Soubor `.nojekyll` v kořeni je
povinný — bez něj GitHub Pages spouští stránky přes Jekyll, který ignoruje
složky začínající podtržítkem a jinak láme strukturu statického webu.

Protože stránky poběží v podadresáři (`uzivatel.github.io/routing/`), žádná
cesta v kódu nesmí začínat lomítkem — vždy relativně (`assets/styl.css`, ne
`/assets/styl.css`).

## Písma

Fraunces (nadpisy) a Literata (běžný text), obě pod
[SIL Open Font License 1.1](https://scripts.sil.org/OFL) — viz
`assets/fonts/LICENSE-fraunces.txt` a `assets/fonts/LICENSE-literata.txt`.
Soubory jsou self-hosted ve `assets/fonts/` jako `woff2`, jen řezy skutečně
použité v sazbě. Žádné volání na Google Fonts CDN.

Každý řez má DVĚ `@font-face` pravidla (`latin` + `latin-ext`), každé se
svým `unicode-range` — díky tomu si prohlížeč sám vybere soubor podle
konkrétního znaku, včetně české diakritiky (č, ř, š, ě, ý, ů, ď, ť, ň),
místo aby (jako dřívější Playfair Display/EB Garamond nasazení) načetl jen
první soubor v seznamu a nechal diakritiku tiše spadnout na systémový
font. Viz `poznamky.md` pro plné zdůvodnění opravy.

## Fotky

`assets/foto/` obsahuje úvodní fotku a fotky sedmi z deseti reálných jamek —
všechny volně licencované snímky stažené z Wikimedia Commons (CC BY / CC
BY-SA / public domain). Autor, licence a zdrojový odkaz jsou u každé fotky
uvedené v datech karty jamky (`data/jamky/*.json`, klíč `foto`) a zobrazují
se jako popisek pod fotkou na stránce. Karty bez volně licencované fotky
(Cypress Point, Sand Hills, Golf Zbraslav, Golf Dobrouč) fotku nemají a
zůstávají jen se schématickým nákresem — jde o soukromé nebo málo
fotografované kluby, u kterých se žádný vhodně licencovaný snímek
nepodařilo dohledat.

## Výsledky testů

Statický web nemá kam ukládat výsledky jinam než do prohlížeče
(`localStorage`). Rozcestník nabízí stažení výsledků jako JSON a jejich
zpětné načtení — bez toho student o výsledky přijde při vyčištění prohlížeče
nebo přechodu na jiné zařízení.

## Licence

Kód: viz `LICENSE`. Obsah lekcí (texty, karty jamek) podléhá stejné licenci
jako kód, pokud `LICENSE` neuvádí jinak.


## Kostra učebnice (`js/ucebnice.js`)

Redesign z 8/2026 (viz `AUDIT.md`) zavedl na každou sekční stránku stejný
rám. Stránka si o něj řekne jedním voláním:

```js
import { nactiUI, vykresliRamec } from '../../js/ucebnice.js';

await nactiUI('../../');
const slovnikPojmu = await nactiSlovnik('../../data/preklady/slovnik-pojmu.json');

jazyk.on(() => {
  // …vlastní obsah stránky…
  vykresliNavSekci({ lekce: 1, index: 0, jazyk, krokEl: $('krokLabel'), navEl: $('sekceNav') });
  vykresliRamec({ lekce: 1, index: 0, jazyk, slovnikPojmu });
});
```

Stránka k tomu potřebuje ve značkách jen prázdné schránky:

```html
<nav class="drobky" id="drobky"></nav>
<nav class="kroky" id="kroky"></nav>
<div class="cileBox" id="cileBox" hidden></div>
<div class="zapamatujBox" id="zapamatujBox" hidden></div>
```

Obsah rámu žije ve slovníku lekce pod klíčem sekce:

```json
"teeShot": {
  "cile":      ["Vyjmenuju pět věcí, které architekt na pozemku hledá…"],
  "zapamatuj": ["Dobrý pozemek se nekreslí. Čte se…", "…"]
}
```

`nav.sekceNazvy` v témž slovníku drží sedm krátkých názvů sekcí — používají
je drobečky, ukazatel kroků i navigace „Předchozí / Další“.

## Jak přidat pojem do slovníčku

`data/preklady/slovnik-pojmu.json` je sbírka pojmů z jednotlivých lekcí plus
doplňky. Každý pojem má:

```json
{ "pojem": "Dogleg", "popis": "Jamka, jejíž fairway se v polovině lomí…",
  "hledat": ["dogleg", "doglegu", "doglegem"], "kde": [1] }
```

`hledat` jsou tvary, které se hledají v textu stránek — čeština skloňuje,
takže tvarů bývá víc. `kde` je seznam lekcí, kde je pojem vysvětlený
(prázdné = doplňkový pojem kurzu). Kontextová nápověda označí na stránce
**jen první výskyt** každého pojmu a nejvýš devět pojmů celkem — učebnice,
ve které je podtržené každé druhé slovo, se nedá číst.
