# Zadání pro Cowork — ROUTING, lekce 1–3

Verze 2 · statický web na GitHub Pages

---

## 1 · Co stavíme

Výukovou aplikaci o golfové architektuře. Cílový uživatel: **středoškolák 15–19 let, aktivní golfista**. Zná pravidla, hendikepový systém a běžnou terminologii hry. O navrhování hřišť neví nic. Nemluv s ním jako s dítětem, ale ani jako s kolegou architektem.

Kurz má 18 lekcí. Toto zadání pokrývá **první tři**. Až budou hotové a odsouhlasené, teprve pak se pouštěj dál.

**Vedoucí zásada:** méně čtení, víc dívání. Text je popisek ke kresbě, ne naopak. Když princip nejde ukázat na obrázku, buď je špatně nakreslený, nebo to není princip.

---

## 2 · Kde to poběží

**GitHub Pages — statický web, žádný server.** Z toho plyne několik tvrdých omezení, která ovlivňují každé rozhodnutí níž:

| Omezení | Co to znamená |
|---|---|
| Žádný backend | Výsledky testů se ukládají do `localStorage` prohlížeče, ne na server |
| Žádná databáze | Data o jamkách jsou statické JSON soubory v repozitáři |
| Žádné tajné klíče | Nikdy nevkládej API klíče do kódu — repozitář je veřejný |
| Podadresář | Stránky běží na `uzivatel.github.io/routing/`, takže **všechny cesty musí být relativní** |

### Bez build kroku

Piš čisté ES moduly, které prohlížeč načte přímo. **Žádný webpack, žádný Vite, žádné `npm run build`.** Důvod: aplikaci bude spravovat student, ne tým vývojářů, a nasazení musí být „commit a hotovo".

Když někde nutně potřebuješ nástroj, zdůvodni to v `poznamky.md` a nech rozhodnout.

### Písma

**Nepoužívej Google Fonts z CDN.** Načtení z jejich serveru odesílá IP adresu návštěvníka třetí straně, což je u vzdělávacího projektu pro nezletilé zbytečný problém. Stáhni Playfair Display a EB Garamond (obě mají licenci SIL Open Font License) do `assets/fonts/` a načti je přes `@font-face` s `font-display: swap`.

Ber jen řezy, které se skutečně používají, ve formátu `woff2`, se znakovou sadou latin + latin-ext (kvůli češtině).

---

## 3 · Referenční soubory

Přiložené prototypy prostuduj dřív, než začneš cokoli psát. Definují vizuální jazyk i technické řešení:

| Soubor | Co ukazuje |
|---|---|
| `redan-plat-dvojjazycne.html` | **Studijní plát** — perokresba, redakční sazba, přepínač jazyka, responzivita |
| `cviceni-bunkr-perokresba.html` | **Pracovní plát** — interaktivní: umísťování bunkru, simulace 100 hráčů, zápis z kola |
| `test-lekce-01.html` | **Zkouška** — šest otázek za 100 bodů, obrázkové volby, bodování, rozpis odpovědí |
| `golf-prototyp-v2.html` | **Model simulace** — dva plány hry, měření, zda je jamka strategická |

Nekopíruj je stranu po straně. Vytáhni z nich kreslicí funkce, paletu, sazbu a model — a stav na nich.

---

## 4 · Repozitář

```
/
├─ index.html                 rozcestník kurzu, přehled lekcí a výsledků
├─ .nojekyll                  vypne zpracování Jekyllem
├─ README.md                  jak spustit lokálně, jak přidat lekci
├─ LICENSE
├─ assets/
│  ├─ fonts/                  woff2, self-hosted
│  └─ styl.css                sdílené proměnné, sazba, responzivní pravidla
├─ js/
│  ├─ platy.js                kreslicí knihovna
│  ├─ simulace.js             model hry
│  ├─ zkouska.js              vykreslení a vyhodnocení testu
│  ├─ jazyk.js                přepínač a slovníky
│  └─ vysledky.js             ukládání a přehled
├─ data/
│  ├─ jamky/*.json            karty jamek včetně tvarových dat
│  └─ preklady/*.json         slovníky cs/en po lekcích
└─ lekce/
   ├─ 01/index.html
   ├─ 02/index.html
   └─ 03/index.html
```

### Lokální spuštění
ES moduly nefungují přes `file://`. Do README napiš, že se spouští `python3 -m http.server` nebo `npx serve` v kořeni.

### Nasazení
Pages ze složky `/` na větvi `main`. Soubor `.nojekyll` v kořeni je povinný — bez něj GitHub ignoruje složky začínající podtržítkem a rozbíjí strukturu.

### Práce ve větvích
Jedna lekce = jedna větev = jeden pull request. Do `main` jde jen odsouhlasený obsah. V popisu PR uveď, co je hotové a co zbývá ověřit.

---

## 5 · Vizuální systém

### Idiom
Perokresba se šrafováním, jak se kreslila v golfových almanaších přelomu 19. a 20. století. **Všechno se generuje kódem, žádné bitmapy.** Důvod je praktický: stejná funkce pak vykreslí libovolnou jamku z `data/jamky/`.

### Paleta

```
--paper   #F7F1E0   podklad, také obrys popisků
--ink     #1E1B15   perokresba, hlavní text
--ink2    #4A443A   vedlejší text, vodicí linky, stipl
--olive   #3B4A2A   nadpisy, tlačítka
--turf    #A9B983   green a fairway
--turf-d  #8B9C64   okolní trávník
--sand    #F1E5C8   bunkry
--water   #9DB6C2   voda
--flag    #B0452C   praporek, důraz, chybná odpověď
--good    #3F6B45   správná odpověď
```

### Písmo
- **Playfair Display** 900 — velké nadpisy plátu
- **EB Garamond** 400/500 a kurziva — text, popisky, tabulky
- Žádné bezpatkové písmo nikde v kurzu.

### Kreslicí knihovna `js/platy.js`

Vytáhni z prototypů a zdokumentuj:

- `blob(cx,cy,rx,ry,rot,seed,amp)` — organický tvar ze součtu sinusovek
- `blobPts(...)` — body obrysu i s normálami
- `radial(pts,seed,{len,w,op})` — šrafura vyzařující kolmo od okraje
- `hatch(clipId,box,angle,gap,{op,seed})` — rovnoběžná šrafura uvnitř tvaru
- `stipple(clipId,box,n,seed)` — tečkování písku

Každý tvar dostane vlastní **semínko náhody**: vypadá pokaždé jinak, ale při každém načtení stejně.

### Pravidla, která se neporušují

1. **Čím víc dat na plátu, tím tišší kresba.** Studijní plát smí být hutný a tmavý. Na pracovním plátu, kde jsou dopady ran a čísla, jdi se šrafurou zhruba na třetinu hustoty.
2. **Popisky mají obrys v barvě papíru:** `paint-order: stroke; stroke: var(--paper); stroke-width: 4px`. Bez toho zanikají ve šrafuře.
3. **Velikost popisků nejméně 15 jednotek viewBoxu, prostrkání nejvýš 0,08 em.** Kapitálky s velkým prostrkáním jsou v malé velikosti nečitelné.
4. **Popisky patří do volných míst**, ne přes kresbu. Když to nejde, veď k prvku tenkou vodicí linku.
5. **Podélné zkrácení plánu.** Jamka 345 m široká 45 m je v pravém měřítku nepoužitelný proužek. Zkrať podélnou osu zhruba na polovinu, jako v tištěných yardage boocích, a měřítko po straně to přiznej.

---

## 6 · Dvojjazyčnost

Celý kurz je **česky a anglicky**, s přepínačem na každé obrazovce. Referenční implementace: `redan-plat-dvojjazycne.html`.

### Technika
- Texty žijí v `data/preklady/lekce-NN.json` se strukturou `{ cs: {...}, en: {...} }`. **Žádný řetězec nepatří natvrdo do značek ani do kreslicího kódu.**
- Prvky v HTML se značí `data-t="klic"`, modul `jazyk.js` je naplní.
- Popisky uvnitř kresby jsou v tomtéž slovníku pod klíčem `L`. Při přepnutí se **plát překreslí celý** — je to levnější než přepisovat jednotlivé `<text>` a nehrozí, že se něco zapomene.
- Volba jazyka se drží v `localStorage` pod `routing.lang` a odráží se v adrese jako `?lang=en`, aby šel odkaz sdílet.
- Výchozí jazyk podle `navigator.language`, ale uložená volba má přednost.
- `document.documentElement.lang` se přepíná spolu s textem kvůli dělení slov a čtečkám.

### Sazba
- **Popisky v kresbě piš rovnou na dva řádky.** Čeština bývá o pětinu delší; jednořádkový popisek, který vyjde anglicky, v češtině přeteče.
- Souřadnice popisků musí sedět pro delší z obou jazyků. Kontroluj obojí, ne jen češtinu.
- Míry přepínej s jazykem: česky metry, anglicky yardy. V kartách jamek uváděj oboje.
- **Odborné názvy zůstávají anglicky i v české verzi** — *Redan, green, fairway, links*. Není to lenost: veškerá literatura je anglicky a student, který se naučí „šikmý plošinový green", nenajde v knize nic.
- Jména hřišť, jamek a architektů se nepřekládají nikdy.

### Rozhodnutí, které musí padnout před psaním
Česká sekce s domácími hřišti (viz obsah lekcí) dává smysl jen v české verzi. **Rozhodni s objednatelem, jestli se v anglické verzi vypustí, nebo nahradí něčím jiným** — mění to strukturu lekce a pozdější úprava je drahá.

---

## 7 · Responzivita

Kurz se bude číst hlavně na telefonu. Ověřuj na šířkách **320, 375 a 768 px v obou jazycích**.

- Velikosti písma přes `clamp()`, ne pevné pixely: `clamp(15.5px, 4.3vw, 17px)` pro text, `clamp(42px, 15vw, 62px)` pro velký titul.
- Vnitřní okraj stránky rovněž `clamp(14px, 4.5vw, 20px)`.
- **Kresba je vždy `width:100%; height:auto`** s pevným `viewBox`. Nikdy pevné rozměry.
- Trojice „tří prvků" se pod 360 px rozpadá ze tří sloupců do tří řádků, kde je kresba vlevo a text vpravo.
- Dotykové cíle nejméně 32 px na výšku, včetně přepínače jazyka.
- Popisky v kresbě mají velikost v jednotkách `viewBox`, takže se zmenšují spolu s ní. Proto nejméně 15 jednotek — na displeji 320 px z toho vyjde asi 12 px, což je minimum.
- Respektuj `prefers-reduced-motion` u všech animací.

---

## 8 · Model simulace `js/simulace.js`

Statistický, ne fyzikální. Zajímá nás, kam míč dopadne a jak často, ne jak se točí.

| Hráč | Drive | Rozptyl podélný | Rozptyl boční | Max. železo |
|---|---|---|---|---|
| HCP 0 | 250 m | ±13 m | ±18 m | 185 m |
| HCP 9 | 220 m | ±15 m | ±26 m | 165 m |
| HCP 18 | 195 m | ±18 m | ±34 m | 150 m |
| HCP 24 | 175 m | ±20 m | ±42 m | 140 m |

- Rány na green: boční chyba ≈ 6 % délky rány u HCP 0, 12 % u HCP 24; podélná ≈ 7 %.
- Násobiče podle ležení: fairway 1,0 · raft 1,35 a délka × 0,9 · bunkr 1,6 a délka × 0,75.
- Putty podle vzdálenosti: do 2 m → 1,60 · 2–5 m → 1,85 · 5–10 m → 2,05 · 10–20 m → 2,25 · nad 20 m → 2,50.
- Voda a out: trestná rána, míč se pokládá zpět na trávu.
- Strop 10 ran na jamce.

Rozptyly jsou směrodatné odchylky normálního rozdělení. Kalibraci ověř na veřejných datech o rozptylu ran podle hendikepu (Arccos, USGA) a případnou úpravu čísel zdůvodni v `poznamky.md`.

**Zobrazení dopadů:** ne barevná teplotní mapa. Plné inkoustové body = HCP 0, křížky = HCP 24. Vypadá to jako polní zápisník a čte se to líp.

---

## 9 · Struktura lekce

| Část | Podoba | Rozsah |
|---|---|---|
| **Tee shot** | jeden studijní plát | 1 princip, 1 věta k zapamatování |
| **Fairway** | 2–3 pláty reálných jamek | ke každé „tři prvky" |
| **Approach** | pracovní plát, interaktivní | úkol + měřitelná zpětná vazba |
| **Putt** | 3 otevřené otázky | žádné memorování |
| **Zkouška** | bodovaný test | 6 otázek za 100 bodů |

Ke každé lekci navíc **slovníček** (5–8 pojmů česky i anglicky), **vzorové odpovědi pro lektora** (co je dobrá odpověď, jaká je nejčastější chyba) a **kritéria hodnocení** úkolu ve 3–4 bodech.

---

## 10 · Zkouška

Referenční implementace: `test-lekce-01.html`. Drž se jí.

### Skladba
Šest otázek, dohromady vždy **rovných 100 bodů**, aby šly lekce mezi sebou porovnávat.

| Typ | Body | Kolik jich má být |
|---|---|---|
| **Obrázková volba** — student vybírá z miniatur jamek | 20 | nejméně dvě |
| **Jedna správná ze čtyř** | 15 | tři až čtyři |
| **Více správných** s částečnými body | 15 | nejvýš jedna |

U otázky s více správnými se za správnou volbu body přičítají a za špatnou odečítají, na nule se to zastaví. Student to musí vědět dopředu — napiš to do nápovědy k otázce.

**Nejméně dvě otázky v každé lekci musí být obrázkové.** Kurz učí dívat se; test, který se dá projít odříkáním pouček, měří něco jiného, než co učíme.

### Průběh
1. Student odpovídá na všech šest. Ukazatel nahoře ukazuje, kolik zbývá.
2. Tlačítko **Odevzdat** je neaktivní, dokud není zodpovězeno všechno.
3. Po odevzdání se **u každé otázky odhalí správné řešení**: barevně se označí správná volba i studentova volba, pod otázku přijde vysvětlení.
4. Vysvětlení má tři části — **která odpověď je správná**, **proč**, a **proč jsou ostatní špatně**. Zakonči odkazem, na který plát se má student vrátit.
5. Nakonec souhrn ve třech patrech: procenta a body · počty správně a chybně · **rozpis po otázkách**, kde je u každé vidět, co student odpověděl, a u chybných i správné řešení.

Nikdy neodhaluj správnou odpověď průběžně.

### Hodnocení

| Výsledek | Slovní hodnocení | Co se řekne studentovi |
|---|---|---|
| 90–100 % | Výborně | Pokračuj na další lekci |
| 75–89 % | Dobré | Projdi si pláty u chybných otázek a jdi dál |
| 50–74 % | Projdeš | Vrať se ke konkrétnímu cvičení, než začneš další lekci |
| pod 50 % | Zopakuj | Vrať se na začátek lekce |

Hranice jsou stejné ve všech lekcích. Slovní hodnocení musí být **konkrétní** — ne „zopakuj si látku", ale „vrať se ke cvičení s bunkrem".

### Ukládání výsledků `js/vysledky.js`

Statický web nemá kam ukládat jinam než do prohlížeče.

```
localStorage["routing.vysledky"] = [
  { lekce: 1, pokus: 1, datum: "2026-08-18T16:40:00Z",
    procenta: 83, body: 83, maximum: 100,
    otazky: [ { c:1, tema:"strategie", body:20, max:20 }, ... ] }
]
```

- **Do celkového hodnocení kurzu se počítá jen první pokus.** Opakování je povolené a žádoucí, ale nesmí přepsat původní výsledek — jinak z měření nezbude nic. Ukládej všechny pokusy, do rozboru ber `pokus === 1`.
- Na rozcestníku `index.html` nabídni **stažení výsledků jako JSON** a jejich zpětné načtení. Bez toho student o všechno přijde, když si vyčistí prohlížeč nebo přejde na jiné zařízení.
- Uveď na rozcestníku větou, že se výsledky ukládají jen v prohlížeči a nikam se neodesílají.
- Verzuj formát polem `verze`, ať se dá později migrovat.

### Závěrečné vyhodnocení
Po deváté lekci vznikne **rozbor podle témat, ne průměr známek**. Zajímá nás profil: který okruh studentovi sedí a který ne.

- celkové procento z devíti lekcí
- pořadí témat od nejsilnějšího po nejslabší
- tři konkrétní lekce nebo pláty, ke kterým se vyplatí vrátit
- vývoj v čase — zlepšuje se, nebo klesá?

Tagy témat drž konzistentní napříč lekcemi, jinak z rozboru nic nevyjde. Pro lekce 1–3 použij: *strategie · trest · riziko a odměna · umístění hazardu · čtení terénu · voda a odtok · vítr a slunce · routing · bezpečnost · rytmus hřiště*.

---

## 11 · Obsah lekcí

### Lekce 1 — Proč jamka vypadá, jak vypadá

**Princip:** Dobrá jamka se neptá „umíš to?", ale „kolik si troufneš?"

**Tee shot — plát „Tři otázky".** Jeden pozemek, tři filozofie: trestající (jedna cesta), strategická (dvě rozumné cesty), heroická (plynulá škála odvahy). Přepínač mezi nimi.

**Druhý princip — trest úměrný chybě.** Chyba o dva metry nesmí stát stejně jako chyba o dvacet. Ukaž na plátu s posuvníkem: stejná odchylka, dvě jamky, dvě různé daně.

**Fairway — reálné jamky:** TPC Sawgrass 17 (trestající) · Pebble Beach 18 (heroická) · Riviera 10 (strategická, krátká par 4 na dosah drivem).

**Česká jamka:** vyber takovou, kde je volba mezi bezpečnou a agresivní cestou skutečná. Kandidáti k prověření: Albatross, Karlštejn, Kaskáda, Ypsilon, Čeladná, Konopiště, Mariánské Lázně, Golf Park Plzeň.

**Approach — pracovní plát „Kam patří bunkr".** Vychází z přiloženého prototypu. Student klepnutím umístí bunkr, pustí 100 hráčů, porovná HCP 0 a HCP 24 proti výchozímu stavu.

Zpětná vazba podle rozdílů oproti prázdné jamce:
- zdrží HCP 24 výrazně víc než HCP 0 → **trest**, patří dál od odpaliště
- zdrží HCP 0 víc než HCP 24 → **strategie**, hlídá odměnu a ne cestu
- neovlivní nikoho → **dekorace**, leží mimo dopadové zóny
- zdrží oba stejně → jamka je těžší, ale ne zajímavější

**Druhý úkol — křivka rovnováhy.** Posuvník „jak těsně kolem hazardu" a proti sobě dvě křivky: co získám zkrácením přístupu a co ztratím rostoucí pravděpodobností hazardu. Student hledá průsečík. Tady se láme celá lekce.

### Lekce 2 — Čtení pozemku

**Princip:** Architekt nezačíná kreslením. Začíná tím, že po pozemku několik dní chodí.

**Tee shot — plát „Pět věcí, které hledám".** Jeden pozemek v pěti přepínatelných vrstvách:
1. **Vrstevnice** — nejcennější je střední převýšení; plochý je nudný, strmý nehratelný a drahý
2. **Odtok vody** — nejpodceňovanější věc; green nikdy do nejnižšího bodu
3. **Slunce** — green celý den ve stínu nikdy nebude fungovat; tráva potřebuje ranní slunce, aby oschla rosa
4. **Vítr** — v Česku převažuje západní až severozápadní; tři dlouhé par 4 proti němu za sebou jsou trest
5. **Podloží** — písek je drenáž zdarma, jíl noční můra, skála 40 cm pod povrchem znamená, že tam nikdy nevykopeš rybník

Každá vrstva má vlastní kresebný slovník: vrstevnice tenkými linkami, odtok šipkami spádnic, stín šrafurou, vítr růžicí, podloží řezem terénem.

**Fairway:** Sand Hills v Nebrasce jako hřiště spíš nalezené než postavené · Ballybunion Old nebo Royal County Down jako práce s dunami.

**Česká jamka:** taková, kde je vidět, jak pozemek diktoval řešení — ideálně údolí, potok nebo prudký svah.

**Approach — dva úkoly:**
1. **Na plátu:** pozemek s vrstevnicemi a potokem; označ tři místa, kde green **nesmí** být, a zdůvodni každé jednou větou.
2. **V terénu:** jdi ven — na hřiště, do parku, na louku. Vyfoť místo a popiš, kudy po dešti teče voda, kde je ráno stín a odkud fouká.

Terénní úkol je jediný v kurzu, který dostane studenta z pokoje. Neškrtej ho. Fotku ukládej jen lokálně (nahrání souboru, zobrazení v prohlížeči) — statický web nemá kam ji poslat a ani nemá.

### Lekce 3 — Routing

**Princip:** Routing rozhoduje o kvalitě hřiště víc než všechno ostatní dohromady. Bunkry jsou to, co je vidět na fotkách; routing je to, co rozhodne, jestli je hřiště dobré.

**Tee shot — plát „Nejdřív najdi greeny".** Většina architektů hledá nejprve 18 skvělých míst pro greeny a teprve k nim vede jamky. Ukaž to ve dvou krocích: nejdřív jen body v terénu, pak jamky mezi nimi.

**Pravidla, která se skládají zároveň:**
- krátké přechody, od greenu na další odpaliště ideálně do 50 m
- střídat směry kvůli větru i slunci; nikdy čtyři jamky za sebou stejným směrem
- na posledních jamkách nehrát přímo do zapadajícího slunce
- nekřížit koridory; minimální rozestup os sousedních jamek zhruba 60–70 m
- rovnováha parů — čtyři par 3, čtyři par 5, deset par 4 je zvyk, ne zákon
- dramaturgie: klidný začátek, vrchol kolem 12.–13., silný závěr

**Fairway:** St Andrews Old Course jako celek — dvojgreeny, cesta tam a zpět, porušená pravidla, která fungují · Cypress Point jako routing podřízený jednomu úseku pobřeží.

**Česká ukázka:** zde vyber celé hřiště, ne jamku, a rozeber jeho routing — ideálně takové, kde je vidět kompromis vůči tvaru pozemku nebo poloze klubovny.

**Approach — pracovní plát „Šest jamek".** Pozemek zhruba 60 ha s vrstevnicemi, potokem a příjezdovou cestou. Student:
1. označí šest nejlepších míst pro greeny (zatím žádné jamky)
2. propojí je do šesti jamek
3. dostane změřeno: celkovou délku přechodů, kolik jamek vede stejným směrem, kde se kříží koridory

Zpětná vazba musí být konkrétní: *„Jamky 3, 4 a 5 vedou všechny na západ — v odpoledním větru z toho bude nejtěžší část hřiště. Zvaž otočení jamky 4."*

Toto je nejtěžší úkol v kurzu a je záměrně brzy. Chceme, aby student od začátku myslel v celku.

---

## 12 · Data o jamkách

Každá rozebíraná jamka dostane soubor v `data/jamky/`. Struktura:

```json
{
  "id": "north-berwick-15",
  "hriste": "North Berwick, West Links",
  "zeme": "GB-SCT",
  "jamka": 15,
  "nazev": "Redan",
  "par": 3,
  "delky": [{ "odpaliste": "medal", "yardy": 189, "rok": 2025 }],
  "architekt": { "uvadeny": "David Strath", "jistota": "sporné",
                 "poznamka": "část pramenů uvádí, že jamku nenavrhl nikdo konkrétní" },
  "vznik": 1869,
  "gps": { "tee": [56.0, -2.7], "green": [56.0, -2.7] },
  "otazka": "Jak dostat míč k praporku, když míření přímo na něj nefunguje?",
  "tvary": { "green": {...}, "bunkry": [...], "hazardy": [...] },
  "prvky": [ { "nazev": {...}, "popis": {...} } ],
  "prameny": [ { "titul": "...", "url": "..." } ]
}
```

Texty uvnitř jsou vždy objekt `{ "cs": "...", "en": "..." }`. **Délky vždy s rokem** — jamky se prodlužují a číslo bez data je bezcenné.

Pro lekce 1–3 to znamená zhruba **deset souborů**.

---

## 13 · Ověřování a právo

- **Všechna fakta ověř na webu.** Neuváděj číslo, které jsi nedohledal.
- U sporných údajů **uveď obě verze.** Vzor z hotového plátu: autorství Redanu se nejčastěji připisuje Davidu Strathovi, ale jiné prameny tvrdí, že jamku nenavrhl nikdo konkrétní. Golfová historie je z velké části dohad a student se to má dozvědět.
- **Preferuj primární zdroje:** weby hřišť, texty architektonických kanceláří, EIGCA, ASGCA, publikované rozhovory.
- **Nekopíruj text.** Všechno přepiš vlastními slovy, citace nanejvýš jedna věta se zdrojem.
- **Nevkládej satelitní snímky ani fotografie do repozitáře.** U každé jamky uveď GPS a odkaz. Snímky z Google Maps se do vlastní aplikace vkládat nesmí; veřejný repozitář by to jen zviditelnil.
- V `LICENSE` vyřeš licenci obsahu i kódu a v README uveď, že písma jsou pod SIL OFL.
- U české sekce piš poctivě — co se povedlo, co je kompromis vůči pozemku nebo rozpočtu. Student si to půjde zkontrolovat.
- Když k dané české jamce nenajdeš dost podkladů, vyber jinou. Nespekuluj.

---

## 14 · Postup

Po každém kroku se zastav pro zpětnou vazbu:

1. **Kostra repozitáře** — struktura složek, `styl.css`, self-hostovaná písma, `.nojekyll`, README, prázdný rozcestník. Ověř, že to jede na Pages.
2. **`platy.js`** — kreslicí knihovna vytažená z prototypů, zdokumentovaná, ukázaná na dvou tvarech.
3. **Karty jamek** — všech deset, ověřených. Bez nich nemá smysl psát lekce; jinak si text vybírá příklady tak, aby potvrdily předem napsanou tezi.
4. **Lekce 1** celá, včetně obou interaktivních úkolů a zkoušky.
5. **Lekce 2 a 3.**
6. **Rozcestník a přehled výsledků** — až když existují data, ze kterých se dá přehled sestavit.
7. **Revize celku** — neopakují se principy? Roste obtížnost plynule? Nechybí něco, co budou potřebovat lekce 4–9?

---

## 15 · Výstupy

Kromě kódu podle struktury v části 4:

```
knihovna-jamek.md      10 karet v čitelné podobě, řazeno podle hřiště
slovnik.md             česko-anglicky, abecedně
prehled-ukolu.md       všechny úkoly s kritérii hodnocení
testy.md               18 otázek, řešení, tagy témat, bodování
poznamky.md            co jsi nemohl ověřit, kde vidíš slabá místa, co bys změnil
```

---

## 16 · Definice hotového

Lekce je hotová, když:

- princip z Tee shotu se dá shrnout do jedné věty a ta věta je na plátu
- každé tvrzení o reálné jamce má dohledatelný pramen
- pláty jsou čitelné na telefonu — popisky nezanikají ve šrafuře
- **všechen text je v obou jazycích** a přepínač funguje i na popiscích uvnitř kresby
- žádný řetězec není natvrdo v kódu; vše je ve slovníku
- ověřeno na šířkách 320, 375 a 768 px v obou jazycích
- zkouška má rovných 100 bodů, nejméně dvě obrázkové otázky, u každé odpovědi vysvětlení a v souhrnu rozpis, co student odpověděl a co bylo správně
- žádnou otázku ve zkoušce nelze zodpovědět bez toho, aby student lekci prošel
- výsledek se uloží, přežije obnovení stránky a dá se stáhnout jako JSON
- **stránka běží na GitHub Pages v podadresáři** — žádná absolutní cesta, žádná konzolová chyba
- student, který lekci projde, umí něco udělat, ne jen vyjmenovat

---

## 17 · Čeho se vyvarovat

- **Superlativů.** „Nejkrásnější jamka na světě" nikoho nic nenaučí.
- **Anekdot bez principu.** Historky z turnajů patří do textu jen tam, kde ilustrují návrhové rozhodnutí.
- **Čtvrtého prvku.** Šablonovou jamku lze rozebrat na deset detailů, ale zapamatovatelná je jen trojice. Když se ti nevejde čtvrtý, není dost důležitý.
- **Vydávání názoru za fakt.** Golfová architektura má ostré tábory — minimalismus proti inženýrskému přístupu, restaurace proti modernizaci. Kde píšeš tezi jedné školy, napiš to.
- **Přeceňování Augusty.** Nejvíc vysílané hřiště světa, ale ne nejlepší učební materiál.
- **Bezpatkového písma a barevných teplotních map.** Vypadnou z idiomu a plát se rozpadne.
- **Absolutních cest** začínajících lomítkem. Na Pages v podadresáři nefungují.
- **Ternárního operátoru uvnitř `classList.add()`.** Jakmile jedna větev vrátí prázdný řetězec, celý skript spadne. Ověřeno v prototypu.

---

## Doplněk zadání — jak dělat schémata reálných jamek (22. 8. 2026)

Zadal objednatel v samostatné konverzaci. Tady je to zapsané v repozitáři,
ať se na to nedá zapomenout. Body 1–9 jsou zadání, bod 10 je rozhodnutí
učiněné při zapracování a je označené.

1. **Kreslí se kódem, ne generátorem obrázků.** Generátor obrázků neumí
   mlčet: na dotaz „14. jamka Karlštejna, par 3, rybník vpravo" nakreslí
   věrohodnou jamku, která neexistuje — s bunkry, které tam nejsou. Studentovi
   bude připadat stejně důvěryhodná jako to, co se tři dny ověřovalo.
   AI obrázek smí být nanejvýš **atmosférická ilustrace** (linksová krajina
   do hlavičky, ilustrace pojmu ve slovníčku), viditelně označená, nikdy
   s tvrzením „tohle je jamka X".
2. **Navržené tvary jsou hladké.** Green, bunkr ani odpaliště nevznikly
   v přírodě — někdo je nakreslil a shrnovač je vyhrnul. Kreslí se plynulou
   křivkou. Lomená čára mezi vrcholy polygonu je artefakt datového formátu,
   ne vlastnost jamky.
3. **Chvění pera patří jen tam, kde je nepravidelnost skutečná** — na okraj
   fairwaye a roughu, který dělá sekačka, ne rýsovací prkno. I ten se má po
   rozechvění vyhladit, aby byl organický a přitom plynulý.
4. **Rough má výplň a texturu, fairway je čistý světlý koridor.** Posekaný
   pruh se pak čte jako světlé místo vyříznuté z hrubšího okolí — přesně
   jak ho hráč vidí z odpaliště.
5. **Barva je akvarelový nádech přes perokresbu**, ne výplně z mapové
   aplikace: fairway světle, rough tmavší olivová, green sytější, písek
   pískový, voda modrošedá, terénní kresba v teplé sepii. Musí jít vypnout
   a dostat čistou perokresbu na tisk.
6. **Když kresba používá náhodu, geometrie se počítá JEDNOU** a všechny
   vrstvy (výplň, textura, inkoustová linka) z ní jen čerpají. Dva průchody
   generátorem znamenají dvě různé fáze — a inkoustová linka pak leží kousek
   vedle barvy.
7. **Terén se kreslí jen tam, kde jsou výšková data.** Šrafy sklonu (krátké
   tahy po spádnici, delší a hustší na prudkém svahu, na rovině žádné)
   a vrstevnice patří do kresby, ale bez naměřených výšek se nekreslí nic.
   Prázdné místo je lepší než smyšlený terén.
8. **Cíl u dat: nahradit parametrický model skutečnými polygony.**
   `fairway.ohyb` s jedním číslem nikdy neuloží skutečný tvar (narazilo se
   na to u Zbraslavi 1). Zdroje: OpenStreetMap má golfová hřiště zmapovaná
   jako polygony (`golf=fairway`, `golf=green`, `golf=tee`, `golf=bunker`,
   `golf=water_hazard`) pod licencí ODbL — stačí uvést zdroj; výšky ČÚZK
   DMR 5G jsou od roku 2023 otevřená data se střední chybou 0,18 m
   v odkrytém terénu. Postup: **nejdřív adaptér** (ze stávajících parametrů
   vyrob polygony a projeď jím všechny karty beze změny dat), teprve pak
   jamku po jamce nahrazovat parametry skutečnými obrysy. Opačné pořadí by
   znamenalo migrovat data i engine naráz a při první chybě nevědět, co ji
   způsobilo.
9. **Hranice u cizích podkladů.** Dívat se smíš na cokoli — ortofoto,
   birdie book, fotka z klubového webu. Zjistíš z toho **fakt** („bunkr je
   240 metrů od odpaliště, patnáct metrů vlevo od osy"), a fakta chráněná
   nejsou. Nesmíš dvě věci: publikovat cizí fotku bez licence a obkreslit
   cizí plánek tak, že výsledné SVG je jeho kopie. Rozdíl je v tom, jestli
   přebíráš čísla, nebo kresbu.
10. **(Rozhodnutí při zapracování, ne zadání.) Perspektiva se u karet jamek
    nepoužívá.** Zúžení vzdálenějších částí jamky vypadá dobře, ale mění
    boční měřítko podle vzdálenosti — a karty jamek tisknou po straně
    měřítko v metrech. Buď měřítko, nebo perspektiva; učebnice, která
    přiznává podélné zkrácení, si nemůže dovolit tiše zkreslit i šířku.
    Na ilustrativních plátech, kde se nic neměří, by perspektiva vadit
    nemusela.
