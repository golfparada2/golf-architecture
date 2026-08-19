# Audit webu ROUTING — a plán proměny v učebnici

Stav ke dni 19. 8. 2026 · repozitář `golfparada2/golf-architecture` · živě na `golfparada2.github.io/golf-architecture/`

Audit vznikl na skutečném kódu (klon repozitáře) a na skutečném běhu stránek — spustil jsem web
lokálně a nasnímal ho na šířkách **1440 px** a **375 px** v obou jazycích. Nic jsem zatím nezměnil.

---

## 0 · Shrnutí na jeden odstavec

Web má **výrazně lepší základ, než je u projektů tohohle typu obvyklé**: čistý bezbuildový kód,
poctivá dvojjazyčnost bez jediného natvrdo zapsaného řetězce, self-hostovaná písma, ověřená data
o jamkách s prameny a licencemi, funkční zkoušky s ukládáním výsledků. Typografie a paleta jsou
kultivované a už teď působí jako publikace, ne jako firemní web.

Slabé místo není technika ani vzhled. Je to **výuka**. Web zatím **vypráví**, ale neučí v krocích:
student nikde nedostane odpověď na otázku „co se tady naučím" a „co si mám zapamatovat", schémata
reálných jamek nevysvětlují prakticky nic (a to je přesně to místo, kde má učebnice o architektuře
stát a padat), a navigace neumí ani jednu ze tří věcí, které student od učebnice čeká — kde jsem,
kam dál, a kde jsem posledně skončil.

---

## 1 · Informační architektura

### Co existuje

```
index.html                 úvodní (marketingová) stránka
prehled/index.html         rozcestník kurzu — 18 lekcí, výsledky, export/import
lekce/NN/index.html        mini-rozcestník jedné lekce (7 sekcí)
lekce/NN/1-tee-shot        princip na studijním plátu
lekce/NN/2-fairway         2–3 reálné jamky
lekce/NN/3-ceska-jamka     jedna česká jamka
lekce/NN/4-approach        interaktivní úkol(y)
lekce/NN/5-putt            3 otevřené otázky
lekce/NN/6-slovnicek       5–8 pojmů
lekce/NN/7-zkouska         test za 100 bodů
dev/*.html                 vývojářské náhledy (neodkazované, veřejné)
```

Hotové jsou lekce 1–3 z 18. Karet jamek je 10 a **všechny se skutečně používají** — žádná leží ladem.

### Co na tom nesedí

| # | Nález | Proč to vadí studentovi |
|---|---|---|
| 1.1 | **Dva rozcestníky za sebou.** `index.html` → `prehled/index.html` → `lekce/NN/index.html` → teprve obsah. Než student uvidí první kus učiva, projde třemi seznamy. | Než se dostane k učení, třikrát si vybírá. Na mobilu to jsou tři obrazovky scrollování. |
| 1.2 | **Oba CTA na úvodní stránce vedou na tutéž adresu.** „Otevřít kurz" i „Přehled všech lekcí" → `prehled/index.html`. | Nabídka dvou možností, které nejsou dvě možnosti. Klasická falešná volba. |
| 1.3 | **15 řádků „Připravujeme"** na rozcestníku. Tři hotové lekce, pod nimi patnáct prázdných řádků, které zabírají 70 % stránky. | Kurz vypadá spíš nehotově než rozestavěně. Hotový obsah se ztrácí. |
| 1.4 | **Není žádná drobečková navigace.** Na sekční stránce (`lekce/01/4-approach.html`) je jen odkaz „← Přehled lekce" a text „Krok 4 ze 7". Chybí „Kurz › Lekce 1 › Approach". | Student, který přijde z odkazu nebo z vyhledávače, nemá jak zjistit, kde je. |
| 1.5 | **Slovníček je uvězněný v lekci.** Sedm pojmů je na `lekce/01/6-slovnicek.html`, ale když student narazí na slovo *dogleg* v lekci 3, nemá kam sáhnout. Žádný globální slovníček neexistuje. | Pojmy se vysvětlují jednou a pak se předpokládají. To je přesně to, co učebnice dělat nemá. |
| 1.6 | **Není „pokračovat, kde jsem skončil".** `localStorage` ukládá výsledky zkoušek a poznámky, ale ne poslední navštívenou sekci. | Student, který se vrátí za týden, musí znovu proklikat tři rozcestníky a vzpomínat. |
| 1.7 | **Není přehled principů ani seznam případových studií.** Deset ověřených jamek je rozstrkaných po lekcích, nedají se procházet jako sbírka. | Ta sbírka je největší hodnota webu a není vidět. |
| 1.8 | **`dev/` je veřejné a neodkazované.** Dvě vývojářské stránky visí na produkci. | Neškodí, ale nepatří tam. |

---

## 2 · Kde je výuka příliš rychlá nebo nejasná

Tohle je jádro auditu.

### 2.1 Chybí rám kapitoly — začátek i konec

Každá sekce začne rovnou nadpisem plátu a skončí navigační lištou. **Nikde** není:

- **„Co se naučím"** — jedna až tři věty z pohledu studenta, hned nahoře.
- **„Zapamatuj si"** — tři až pět bodů na konci.

Je tam sice `.principBox` („Principy k zapamatování"), ale je to **jedna věta uprostřed stránky**,
ne shrnutí na konci, a na stránkách s reálnými jamkami, slovníčkem a otevřenými otázkami chybí úplně.

**Praktický test:** otevřel jsem `lekce/01/2-fairway.html` a zkusil po přečtení vyjmenovat, co si mám
odnést. Nejde to — stránka končí třetí kartou jamky a hned navigací na další sekci.

### 2.2 Pořadí uvnitř karty jamky je obrácené

`kartaJamky()` v `js/spolecne.js` skládá kartu takhle:

```
1. schéma jamky (SVG)
2. fotografie
3. země · číslo jamky
4. název hřiště
5. par / délka / architekt / rok
6. otázka jamky
7. „Tři prvky"
8. prameny
```

Student **nejdřív vidí obrázek a teprve pak se dozví, čeho se týká a na co se má dívat.** Správné
pořadí pro učení je opačné: kdo · co řeší · **teď se podívej na tohle** · rozbor · co si odnést.

### 2.3 Schémata reálných jamek — největší problém webu

Vzal jsem si `lekce/01/2-fairway.html` a prohlédl vykreslené pláty. Co student uvidí:

- **TPC Sawgrass 17:** ovál greenu nahoře, pod ním 250 metrů prázdné plochy a měřítko po straně.
  Island green — jamka celá o vodě — **nemá nakreslenou vodu** (v `tvary.hazardy` je, ale
  vykreslí se jako bledá kaňka za greenem).
- **Pebble Beach 18:** obrovská modrá skvrna přes tři čtvrtiny plátu a maličký green v rohu.
  Fairway žádná, dogleg podél zálivu žádný, linie hry žádná.
- **Riviera 10:** čtyři bunkry plovoucí v prázdnu. Ani green–tee osa, ani fairway.

Příčina je v kódu, ne v datech. `vykresliJamku()` v `js/platy.js` (řádky 429–478) kreslí **jen**
podklad, hazardy, bunkry, green a odpaliště. Nekreslí:

- **fairway** — vůbec žádný tvar, proto ta prázdnota;
- **linii hry** odpaliště → dopadová zóna → green;
- **popisky bunkrů a hazardů** — ačkoli `tvary.bunkry[].label` a `tvary.hazardy[].label`
  **v datech existují a jsou přeložené do obou jazyků**, kód je nikdy nepřečte;
- **texturu vody** — voda je plochá barva, vypadá jako chyba tisku;
- **dopadovou zónu** — místo, kde se rozhoduje, není označené.

Navíc `zkraceni: 0.55` a `okraj: 15 m` dávají u dlouhých jamek plát vysoký přes 600 jednotek, kde
je 60 % plochy prázdná tráva. A green se kreslí **jako poslední, nad vším** — bunkr blízko greenu
se pod ním schová (je to i v `poznamky.md` jako známá past).

> Tohle je přesně ten bod, který jsi otevřel v „Kroku 8" a nechal nedodělaný. Beru ho jako součást
> redesignu, ne jako samostatný úkol — bez použitelných schémat nemá učebnice o architektuře smysl.

### 2.4 Kde text supluje obraz

| Místo | Co je teď | Co by mělo být vidět |
|---|---|---|
| „Tři prvky" u každé jamky | tři odstavce textu ve třech sloupcích | tři **výřezy schématu** s vodicí linkou k tomu prvku |
| Lekce 2 — pět vrstev pozemku | přepínač funguje dobře, tohle je nejlepší plát na webu | (ponechat, je to vzor pro ostatní) |
| Slovníček | jen text pojem/popis | u geometrických pojmů (dogleg, punchbowl, redan) drobný piktogram |
| Riviera 10 — „tři strategie z odpaliště" | popsáno slovy v textu | tři čárkované linie na schématu |

### 2.5 Terminologie se nevysvětluje při prvním výskytu

Slova jako *dogleg*, *approach*, *lay-up*, *green surrounds*, *punchbowl*, *links* padnou v textu
lekce dřív, než se objeví ve slovníčku (a v pozdějších lekcích se prostě předpokládají). Rozhodnutí
držet odbornou terminologii anglicky je **správné a nechávám ho** — ale musí ho doprovázet
kontextová nápověda přímo v textu.

### 2.6 Nemrtvé a rušivé prvky

- **Šedivá pásma „Připravujeme"** (15 ×) — viz 1.3.
- **„Zatím poslední hotová lekce"** — konec lekce 3 je slepý konec bez nabídky, co dál.
- **`alert()`** při importu výsledků (`prehled/index.html`) — vytrhne studenta z prostředí.
- **Dlouhé bloky pramenů** pod každou kartou (u Pebble Beach šest odkazů v jednom odstavci) —
  poctivé, ale vizuálně to utopí „Tři prvky", které jsou důležitější.
- **Duplicitní CSS**: `prehled/index.html` má 37 řádků lokálního stylu, který je z 80 % totožný
  s `.tocItem` v `styl.css`. Stejně tak `.lanes` v lekci 1.

### 2.7 Co naopak stojí za zachování — a nesahat na to

1. **Perokresba se šrafurou** (`blob`, `hatch`, `radial`, `stipple`) — vlastní vizuální jazyk,
   který web odlišuje od každého jiného e-learningu. Zůstává beze změny.
2. **Dvojjazyčnost přes slovníky** — architektonicky správně vyřešená, ani jeden řetězec v kódu.
3. **Přepínač pěti vrstev pozemku** v lekci 2 — nejlepší výukový prvek na webu.
4. **Simulace 100 hráčů** („Kam patří bunkr") — měřitelná zpětná vazba, přesně jak má úkol vypadat.
5. **Křivka rovnováhy** risk/reward — obtížné téma podané posuvníkem.
6. **Zkoušky** — 100 bodů, vysvětlení u každé otázky, rozpis odpovědí, ukládání a export.
7. **Data o jamkách** — s prameny, s přiznanou nejistotou u autorství, s licencemi fotek.
8. **Poctivost** — `tvary.poznamka` přiznává, že schéma není půdorys. To se nikde neztrácí.

---

## 3 · Rozhraní, typografie, mobil

### Co funguje

- Paleta je tlumená a soudržná. Sazba `eyebrow → h1 → dashline → lede` je redakčně čistá.
- Mobil (375 px) je **lepší než desktop** — je vidět, že se navrhoval mobile-first.
- Velikosti přes `clamp()`, dotykové cíle 32 px, `prefers-reduced-motion` je respektován.
- Písma jsou self-hostovaná, 276 kB celkem, správně rozdělená `unicode-range` pro češtinu.

### Co nefunguje

| # | Nález | Dopad |
|---|---|---|
| 3.1 | **Desktop je jen roztažený mobil.** `--plate-max: 560px` platí pro celé `<body>`, takže na monitoru 1440 px je obsah v úzkém proužku uprostřed a **880 px je prázdných**. | Web nevypadá jako publikace, ale jako mobilní stránka otevřená na počítači. Schémata jamek se kreslí do 560 px a proto jsou nečitelně malá. |
| 3.2 | **Sekční stránky nemají `<h1>`.** Mají jen `<h2>`. Ověřeno na všech 21 sekcích. | Porušená hierarchie nadpisů — vadí čtečkám i vyhledávačům. |
| 3.3 | **Žádné landmarky.** Nikde `<main>`, `<nav>`, `<header>`, `<footer>`, žádný „přeskočit na obsah". | Uživatel čtečky musí projít celou hlavičku na každé z 25 stránek. |
| 3.4 | **SVG pláty jsou pro čtečku prázdné.** `kartaJamky()` nastaví `role="img"` bez `aria-label` a bez `<title>`. | Celá schémata jsou pro nevidomého studenta neexistující. |
| 3.5 | **Kontrast pod normou** na drobných textech: `.listMark` **3,43 : 1**, `.spec .sub` a `.foot` **4,42 : 1** (norma AA žádá 4,5). Spočítáno, ne odhadnuto. | Popisky pod obrázky a v patičce jsou na slunci na telefonu nečitelné. |
| 3.6 | **Fotky nemají `width`/`height`.** 7 fotek, dohromady 927 kB, žádné rozměry v HTML, hero se nenačítá líně. | Layout poskočí při načtení (CLS), na mobilních datech se čeká. |
| 3.7 | **Chybí `focus-visible` na některých interaktivních SVG** (klepání do plánu v úkolu „Kam patří bunkr" je jen myší/dotykem). | Úkol nelze splnit klávesnicí. |
| 3.8 | **Přepínač jazyka nemá `lang` atribut na tlačítkách** a `aria-label="Language"` je jen anglicky. | Drobnost, ale čtečka přečte „ČES" česky i v anglické verzi. |
| 3.9 | **Zkouška: focus se po odevzdání nepřesune** na výsledek. | Klávesnicový uživatel netuší, že se něco stalo. |

### Výkon

Dobrá zpráva: **žádná chyba v konzoli** na žádné z testovaných stránek, žádné externí volání,
žádná knihovna třetí strany. Celý web je ~2,3 MB včetně fotek a písem. Slabina je jen v obrázcích
(bod 3.6) a v tom, že se `platy.js` importuje i tam, kde se nekreslí.

---

## 4 · Plán změn

### NUTNÉ — bez toho to není učebnice

| # | Změna | Co to zlepší |
|---|---|---|
| N1 | **Přepsat `vykresliJamku()`**: fairway jako zakřivená stuha (dogleg), linie hry, dopadová zóna, popisky bunkrů a hazardů z dat s vodicí linkou, textura vody, green kreslený **pod** okolními prvky. Parametr `ohyb` a šířka fairwaye se přesunou z kódu do `data/jamky/*.json`. | Schémata konečně **vysvětlují** jamku. Tohle je největší jednotlivý přínos celého redesignu. |
| N2 | **Rám kapitoly**: nová komponenta `Co se naučím` nahoře a `Zapamatuj si` (3–5 bodů) dole na **každé** sekční stránce, v obou jazycích. | Student ví do 10 sekund, co ho čeká, a po dočtení ví, co si má odnést. |
| N3 | **Přeskládat kartu jamky** do pořadí: kdo a co · otázka jamky · **foto** · **schéma s „na co se dívat"** · rozbor „Tři prvky" · lekce k přenesení · prameny (sbalené). | Obraz začne vysvětlovat, místo aby ilustroval už přečtený text. |
| N4 | **Desktopová sazba.** Zavést dvě šířky: text drží ~62–68 znaků, obraz a schémata se roztahují do širšího sloupce. `--plate-max` přestane platit pro `<body>`. | Web bude působit jako publikace. Schémata budou čitelná. |
| N5 | **Sémantika a přístupnost**: `<h1>` na každé stránce, `<main>/<nav>/<header>/<footer>`, odkaz „přeskočit na obsah", `aria-label` a `<title>` u každého SVG plátu, oprava tří kontrastů, `width`/`height` u fotek. | Web bude ovladatelný klávesnicí a čitelný čtečkou. |
| N6 | **Drobečková navigace + postup v kapitole.** Tichý řádek „Kurz › Lekce 1 › Approach" a tenký ukazatel 7 kroků nahoře. | Student vždy ví, kde je a kolik zbývá. |

### DOPORUČENÉ — výrazně to zvedne kvalitu

| # | Změna | Co to zlepší |
|---|---|---|
| D1 | **Globální slovníček** `slovnicek/index.html` — všechny pojmy ze všech lekcí, abecedně, dvojjazyčně; plus **kontextová nápověda**: pojem v textu se podtrhne tečkovaně a po klepnutí ukáže vysvětlení, aniž by student opustil stránku. | Terminologie přestane být překážkou. |
| D2 | **Sbírka případových studií** `jamky/index.html` — všech 10 jamek jako procházitelná galerie s jednotným formátem (název, autor, místo, rok, otázka jamky, co hráč vidí, jaké rozhodnutí dělá, proč to funguje, přenositelná lekce). | Největší hodnota webu se konečně dá procházet. |
| D3 | **„Pokračovat, kde jsi skončil"** — poslední navštívená sekce v `localStorage`, tlačítko na úvodní stránce i na rozcestníku. | Návrat po týdnu trvá jedno klepnutí. |
| D4 | **Studijní mapa místo seznamu.** Rozcestník přestane být 18 řádků; hotové lekce dostanou prostor, budoucí se sbalí do jednoho tichého řádku „Připravujeme lekce 4–18". | Hotový obsah přestane mizet v prázdnu. |
| D5 | **Rozšířit „Tři prvky" o výřez schématu** — u každého prvku malý detail plátu s vodicí linkou. | Text přestane suplovat obraz (bod 2.4). |
| D6 | **Sjednotit CSS** — vytáhnout duplicitní lokální styly do `styl.css`, zavést jednotný systém pro popisky, poznámky, citace a úkoly. | Údržba jedním člověkem zůstane možná. |
| D7 | **Úvodní stránka odpoví na „kde mám začít"** — jeden hlavní CTA, druhý ztiší; přidat větu „Kurz je zatím ze tří lekcí, další přibývají." | Falešná volba (bod 1.2) zmizí. |

### VOLITELNÉ — až zbude čas

| # | Změna |
|---|---|
| V1 | Fotky do `webp` + `srcset` (ušetří ~60 % dat). |
| V2 | Tisková podoba kapitoly (`@media print`) — studenti si věci tisknou. |
| V3 | Piktogramy u geometrických pojmů ve slovníčku. |
| V4 | Přesun `dev/` mimo produkci. |
| V5 | Příprava třetího jazyka (struktura slovníků to už umožňuje, chybí jen výběr jazyka v UI). |

---

## 5 · Čeho se v redesignu nedotknu

- **Ověřená fakta a prameny.** Nic nedopisuji, nic nespekuluji. Kde chybí podklad, zůstane přiznáno.
- **Obsah zkoušek** (otázky, body, vysvětlení) — jen sazba a přístupnost.
- **Model simulace** `js/simulace.js` — čísla jsou zdůvodněná v `poznamky.md`.
- **Struktura dat o jamkách** — jen se doplní pole, nic se neodstraní.
- **Anglická edice bez sekce „Česká jamka"** — rozhodnuto dřív, respektuji.
- **Bezbuildový provoz na GitHub Pages, relativní cesty, self-hostovaná písma.**

---

## 6 · Jedna otevřená kolize, kterou musíš rozhodnout ty

Původní zadání (`zadani.md`, část 5) říká doslova: **„Žádné bezpatkové písmo nikde v kurzu."**
Nové zadání redesignu žádá **„neutrální sans-serif pro navigaci a delší text"**.

To se navzájem vylučuje a je to rozhodnutí o charakteru celého webu, ne detail — proto se ptám,
místo abych volil sám.


---

# Část II · Co bylo provedeno

Implementováno 19. 8. 2026 v rozsahu **nutné (N1–N6) + doporučené (D1–D7)**.
Písmo zůstává patkové (Fraunces + Literata) podle rozhodnutí objednatele —
původní zadání bezpatkové písmo zakazuje a to rozhodnutí platí dál.

## N1 · Schémata reálných jamek — přepsaná

`vykresliJamku()` v `js/platy.js` je napsaná znovu. Nově kreslí:

- **fairway jako stuhu podél kvadratické Bézierovy křivky** — skutečný dogleg,
  ne rovný obdélník; šířka se mění od odpaliště ke greenu a okraj se jemně
  vlní (dřív se vlnil šumově a vypadal roztřepeně);
- **linii hry** čárkovaně po ose stuhy a **dopadovou zónu** tichou svorkou;
- **popisky bunkrů a hazardů** z dat, s vodicí linkou — šířka textu se
  **měří** (`getComputedTextLength`), ne odhaduje, takže popisky nevyjíždějí
  z plátu; kolize se řeší rozestupem po sloupcích vlevo a vpravo;
- **vlnky na vodě** místo ploché barevné skvrny;
- **bunkry až nad greenem**, takže greenside bunkr nezmizí pod ním; obrys
  greenu se pak dotáhne znovu;
- **levý žlab jen pro měřítko**, aby se popisky netiskly přes značky metrů;
- **`<title>` a `<desc>`** sestavené z dat karty — plát už není pro čtečku
  obrazovky prázdný obrázek.

Podélné zkrácení je nově omezené poměrem výška : šířka (max 1,5), takže
z pětisetmetrové jamky nevyjde nepoužitelná věž.

**Nová data v kartách:** `tvary.fairway` (`ohyb` v metrech, šířky, začátek),
`tvary.dopadovaZona`, `zkratka` u každého bunkru a hazardu (krátké jméno do
kresby — SHELL, COCKLE, STRATH u St Andrews, BLOWOUT u Sand Hills), plus
`naCoSeDivat` a `lekce` na úrovni karty.

*Jak to zlepšuje učení:* schéma teď ukazuje, **kudy se hraje a kde se
rozhoduje**. Předtím student viděl ovál greenu a 250 metrů prázdné trávy.

## N2 · Rám kapitoly

Každá z 21 sekčních stránek má nahoře **„Co se tady naučím"** (1–3 věty
z pohledu studenta) a dole **„Zapamatuj si"** (3–5 bodů). Obsah je psaný
česky i anglicky a žije ve slovníku lekce, ne v kódu.

*Jak to zlepšuje učení:* student ví do deseti sekund, co ho čeká, a po
dočtení ví, co si má odnést. To byla nejcitelnější díra celého webu.

## N3 · Karta jamky přeskládaná

Nové pořadí: **kdo a co → otázka jamky → obraz (schéma + „na co se dívat" +
fotografie) → rozbor „Tři prvky" → lekce k přenesení → prameny (sbalené)**.
Na širokém displeji sedí obraz vlevo a text vpravo, na mobilu se skládá pod
sebe ve stejném pořadí.

Při té příležitosti se našla **věcná chyba**: karty ukazovaly `delky[0]`, což
u Pebble Beach 18 znamenalo 315 m z roku 1919 (tehdy par 4) místo dnešních
497 m. Nové pravidlo bere záznam označený jako aktuální, jinak ten
s nejvyšším rokem; ostatní se ukazují jako „Další uváděné délky".
Stejná kontrola odhalila rozpor v `knihovna-jamek.md` u Karlštejna 15
(uvedená par 4 / 335 m proti kartě par 3 / 198 m) a u Zbraslavi 1
(prohozené jednotky) — obojí opraveno podle karet.

## N4 · Sazba na dvě šířky

`--plate-max` už neplatí pro celé `<body>` — stránka je široká jako
publikace (1080 px), ale **souvislý text drží 66 znaků** a obraz smí být
širší. Schémata jsou tím na desktopu čitelná, seznamy na rozcestníku se
nerozjíždějí přes celou obrazovku.

## N5 · Přístupnost

- `<h1>` na každé stránce (dřív měly sekční stránky jen `<h2>`), bez skoků
  v hierarchii — ověřeno strojově na všech 27 stránkách v obou jazycích;
- `<header>`, `<main>`, `<nav>`, `<footer>` a odkaz „Přeskočit na obsah";
- každý SVG plát má `<title>`/`<desc>` nebo je označený jako dekorativní;
- **pracovní pláty jdou ovládat klávesnicí** — šipky posouvají zaměřovač,
  Enter potvrdí, poloha se hlásí do `aria-live`. Do teď šly tři úkoly kurzu
  splnit jen myší nebo prstem;
- výsledek zkoušky po odevzdání **přebírá fokus** a je označený jako oblast;
- `alert()` při načítání výsledků nahrazen hlášením přímo na stránce;
- **kontrast doměřen na vykreslených stránkách** — pod normou zůstalo pět
  drobných textů (11–14 px, 3,89–4,40 : 1), všechny opravené. Jediné, co
  normu nesplňuje, je zneaktivněné tlačítko „Odevzdat", které je z požadavku
  výslovně vyjmuté;
- fotky mají rozměry (žádné poskočení sazby) a `loading="lazy"`.

## N6 · Orientace

Drobečková navigace (`Přehled lekcí › Lekce 2 › Úkoly`) a tichý **ukazatel
sedmi kroků** nahoře na každé sekční stránce; každý krok je odkaz. Sedm
krátkých názvů sekcí je v `nav.sekceNazvy` ve slovníku lekce a používají je
drobečky, ukazatel i navigace „Předchozí / Další".

## D1 · Slovníček a kontextová nápověda

Nová stránka `slovnicek/` — **38 pojmů**, abecedně, s filtrem a odkazem do
lekce, kde je pojem vysvětlený. Kromě pojmů z lekcí přibylo 17 slov, která
kurz do teď používal bez vysvětlení (fairway, carry, bailout, dopadová zóna,
blowout, template hole, punchbowl, redan a další).

V textu lekcí se **první výskyt** pojmu podtrhne tečkovaně a po klepnutí
(nebo Enterem) se pod ním rozbalí vysvětlení. Nejvýš devět pojmů na stránku —
učebnice, kde je podtržené každé druhé slovo, se nedá číst.

## D2 · Sbírka jamek

Nová stránka `jamky/` — všech deset rozebraných jamek v jednotném formátu,
s obsahem nahoře. Pořadí je výukové, ne abecední.

## D3 · Pokračovat, kde jsi skončil

Poslední navštívená sekce se pamatuje v `localStorage` a nabízí se na úvodní
stránce i na rozcestníku.

## D4 · Studijní mapa místo seznamu

Rozcestník už nevypisuje patnáct šedivých řádků „Připravuje se" — hotové
lekce dostaly prostor a zbytek shrne jedna věta. Přibyl blok „Kdykoli po
ruce" se slovníčkem a sbírkou jamek.

## D5 · „Tři prvky" v kartě

Na širokém displeji se rozpadly do řádků vedle schématu, takže se čtou
**se schématem před očima**, ne pod ním.

## N2b · „Vyzkoušej" i tam, kde se jen četlo

Pedagogický model kurzu je **Co se naučím → Princip → Podívej se → Rozebři
→ Vyzkoušej → Zapamatuj si**. Sekce s pracovními pláty a otevřenými otázkami
mají „Vyzkoušej" v podobě samotného úkolu; sekce s reálnými jamkami, českou
jamkou a slovníčkem ho neměly vůbec — student je jen přečetl a šel dál.
Devět takových sekcí dostalo krátký úkol s poznámkovým polem (ukládá se
lokálně, nikdo ho nehodnotí).

Zároveň se štítek `.principBox` přejmenoval z „Principy k zapamatování" na
prosté **„Princip"**, aby si nekonkuroval se sekcí „Zapamatuj si" na konci
stránky.

A konec lekce 3 přestal být slepý: tlačítko „Další" už není zneaktivněné,
vede do sbírky jamek.

## D6 · CSS

Duplicitní lokální styly rozcestníku sjednoceny; nové sdílené vzorce
(rám kapitoly, drobečky, kroky, slovníčkové bubliny, sbírka) žijí
v `assets/styl.css`, oddíl 16.

## D7 · Úvodní stránka

Dvě tlačítka už nevedou na tutéž adresu. Hlavní vede rovnou do lekce 1,
druhé na přehled; přibyl odstavec „Kde začít" a zkratky na slovníček
a sbírku.

---

## Co zůstalo neuděláno (volitelné)

`webp` + `srcset` u fotek · tisková podoba kapitoly · piktogramy ve
slovníčku · přesun `dev/` mimo produkci · příprava třetího jazyka.

## Kontrola po zásahu

- **27 stránek × 2 jazyky**: žádná chyba v konzoli, žádný nenačtený soubor,
  právě jeden `<h1>`, žádný skok v hierarchii nadpisů, žádný prázdný
  překladový klíč.
- **Šířky 320 / 375 / 768 / 1440 px**: sazba drží, kresba se přizpůsobuje,
  ukazatel kroků se pod 700 px zkrátí na čísla.
- **Zkouška ve všech třech lekcích**: tlačítko zůstane zneaktivněné, dokud
  není zodpovězeno všech šest; výsledek se uloží, převezme fokus a zapíše se
  do přehledu.
- **Klávesnice**: všechny tři pracovní pláty se dají ovládat bez myši.
