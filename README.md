# ROUTING — kurz golfové architektury

Výuková aplikace o golfové architektuře pro středoškolské golfisty (15–19 let).
Statický web, žádný server, běží na GitHub Pages. Viz `zadani.md` pro plné zadání.

Stav: **lekce 1–3 hotové** (kroky 1–6 z postupu, část 14 zadání) — kreslicí
knihovna, 10 karet jamek, tři kompletní lekce (Proč jamka vypadá, jak
vypadá / Čtení pozemku / Routing) i rozcestník s přehledem výsledků.
Lekce 4–18 přibudou v dalších krocích podle stejného vzoru.

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
├─ index.html          rozcestník kurzu, přehled lekcí a výsledků
├─ .nojekyll            vypne zpracování Jekyllem (povinné, viz níže)
├─ assets/
│  ├─ fonts/            Playfair Display + EB Garamond, self-hosted, woff2
│  └─ styl.css          sdílené proměnné, sazba, responzivní pravidla
├─ js/
│  ├─ platy.js           kreslicí knihovna (perokresba, šrafura)
│  ├─ simulace.js         statistický model hry
│  ├─ zkouska.js           vykreslení a vyhodnocení testu
│  ├─ jazyk.js             přepínač jazyka a slovníky
│  └─ vysledky.js          ukládání výsledků a přehled
├─ data/
│  ├─ jamky/*.json       karty jamek včetně tvarových dat
│  └─ preklady/*.json     slovníky cs/en po lekcích
└─ lekce/
   ├─ 01/index.html
   ├─ 02/index.html
   └─ 03/index.html
```

`js/`, `data/` a `lekce/01–03` jsou hotové a naplněné. Lekce 4–18 přibudou
postupně stejným způsobem (viz „Jak přidat lekci" níže).

## Jak přidat lekci

1. Vytvoř větev `lekce-NN` z `main`.
2. Karta(y) jamek do `data/jamky/*.json` (struktura viz zadání, část 12).
3. Slovník lekce do `data/preklady/lekce-NN.json`, klíč `{ cs: {...}, en: {...} }`.
4. `lekce/NN/index.html` — Tee shot, Fairway, Approach, Putt, Zkouška
   (struktura viz zadání, část 9). Žádný řetězec natvrdo v kódu, žádná
   absolutní cesta (začínající `/`) — Pages běží v podadresáři.
5. Otevři pull request do `main` s popisem, co je hotové a co zbývá ověřit.
   Jedna lekce = jedna větev = jeden PR.
6. Po schválení a mergi přidej lekci do seznamu na `index.html`.

## Nasazení

GitHub Pages, zdroj `/` (root) na větvi `main`. Soubor `.nojekyll` v kořeni je
povinný — bez něj GitHub Pages spouští stránky přes Jekyll, který ignoruje
složky začínající podtržítkem a jinak láme strukturu statického webu.

Protože stránky poběží v podadresáři (`uzivatel.github.io/routing/`), žádná
cesta v kódu nesmí začínat lomítkem — vždy relativně (`assets/styl.css`, ne
`/assets/styl.css`).

## Písma

Playfair Display a EB Garamond, obě pod
[SIL Open Font License 1.1](https://scripts.sil.org/OFL) — viz
`assets/fonts/LICENSE-playfair-display.txt` a
`assets/fonts/LICENSE-eb-garamond.txt`. Soubory jsou self-hosted ve
`assets/fonts/` jako `woff2`, znaková sada latin + latin-ext, jen řezy
skutečně použité v sazbě (viz `poznamky.md` pro zdůvodnění zdroje souborů).
Žádné volání na Google Fonts CDN.

## Výsledky testů

Statický web nemá kam ukládat výsledky jinam než do prohlížeče
(`localStorage`). Rozcestník nabízí stažení výsledků jako JSON a jejich
zpětné načtení — bez toho student o výsledky přijde při vyčištění prohlížeče
nebo přechodu na jiné zařízení.

## Licence

Kód: viz `LICENSE`. Obsah lekcí (texty, karty jamek) podléhá stejné licenci
jako kód, pokud `LICENSE` neuvádí jinak.
