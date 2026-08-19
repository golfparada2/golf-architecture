# Poznámky — co jsem musel rozhodnout, co ověřit, co bys měl zkontrolovat

Průběžný soubor podle části 15 zadání. Kroky 1–6 hotové.

## Krok 6 — Rozcestník a přehled výsledků (`index.html`,
`data/preklady/rozcestnik.json`)

### Co vzniklo
- **`data/preklady/rozcestnik.json`** — vlastní dvojjazyčný slovník
  rozcestníku (oddělený od lekcí, jak avizovala poznámka v Kroku 1): úvodní
  text, krátký popisek ke každé z lekcí 1–3 (vlastní, ne přetažený z
  `lekce-0N.json` — rozcestník nemusí kvůli třem řádkům textu stahovat tři
  další slovníky navíc), stavové hlášky a texty kolem stažení/načtení
  výsledků.
- **`index.html` přepojen na `js/jazyk.js` a `js/vysledky.js`.** Kostra
  z Kroku 1 měla jazyk i export/import napsané natvrdo přímo ve stránce
  (záměrně, jak tam bylo okomentované) — teď to jede přes stejné sdílené
  moduly jako lekce 1–3.
- **Seznam lekcí (`#lessons`).** Řádky 1–3 jsou odkazy na `lekce/0N/
  index.html`, s krátkým popisem a stavem výsledků (`Zatím nezahájeno`,
  nebo `Pokus 1 · NN % · <pásmo>` + počet pokusů, když jich je víc).
  Řádky 4–18 jsou vygenerované, needoužní placeholdery „Připravuje se" —
  bez odkazu, ztlumené (`opacity`), aby bylo jasné, kolik lekcí kurz
  celkem bude mít a že jde o systematický postup, ne o neúplný web.
- **Souhrnný panel pod tlačítky výsledků.** Ukazuje, u kolika ze tří
  hotových lekcí je zaznamenaný první pokus a jejich průměrné procento —
  ale výslovně píše, že plný rozbor podle témat (zadání, část 10,
  „Závěrečné vyhodnocení") se odemkne až po deváté lekci. Nechtěl jsem
  předstírat rozbor, který zadání definuje jinak a pro jiný okamžik kurzu.

### Rozhodnutí, která nebyla v zadání explicitně
- **Krátké popisky lekcí na rozcestníku jsou nový text**, ne kopie
  `meta.lede` z jednotlivých lekcí (ty jsou na to moc dlouhé — psané pro
  úvod plátu, ne pro řádek v seznamu). Jedna věta principu + jedna věta
  obsahu za každou lekci.
- **Čeština potřebuje jiné tvary čísla pokusů než angličtina** (1 pokus /
  2–4 pokusy / 5+ pokusů) — přidal jsem do slovníku zvlášť klíče
  `stavPocetPokusu2_4` a `stavPocetPokusu5plus`, aby se to nehackovalo
  přes `.replace()` na už existujícím řetězci (první verze to dělala
  špatně — viz níž).
- **Souhrnná věta počítá jmenovatel jako pevné „3"**, ne jako proměnnou —
  „ze 3 lekcí" je gramaticky správně bez ohledu na to, kolik z nich má
  záznam, zatímco číslovkovat samotné „3" jako `{n}` by dřív nebo později
  (až přibudou další lekce) vyžadovalo znovu řešit skloňování. Až přibude
  lekce 4+, stačí v `index.html` zvýšit `CELKEM_LEKCI` a v `rozcestnik.
  json` upravit tenhle jeden řetězec.

### Chyby odhalené a opravené při psaní/ověřování
- **Vlastní chyba v první verzi:** počet pokusů nad rámec prvního jsem
  chtěl slovně skloňovat přes `jazyk.t('stavPocetPokusuJeden').
  replace('1', String(pokusy.length))` — u `pokusy.length === 2` by to
  dalo „2 pokus celkem" (špatný pád). Přepsáno na dva čisté klíče
  ve slovníku (`2_4` / `5plus`) bez řetězcové gymnastiky.
- **Titulek a popisek řádku lekce splývaly do jedné věty bez mezery**
  (`Proč jamka vypadá, jak vypadáTrestající, strategická…`) — `.t` a `.p`
  byly `<span>`, tedy inline, takže na sobě jely bez zalomení. Opraveno
  přidáním `display:block` oběma třídám.

### Ověřeno (Playwright, `/opt/pw-browsers/chromium`)
- Konzole čistá na 320/375/768 px, oba jazyky.
- Kompletní běh: vyplnění zkoušky v Lekci 1 → návrat na rozcestník → řádek
  Lekce 1 správně ukazuje `Pokus 1 · 5 % · Zopakuj` (odpovídá pásmu podle
  `pasmo()` z `js/vysledky.js`), souhrnný panel se aktualizuje.
- Stažení výsledků → vymazání `localStorage` → načtení staženého souboru
  zpět obnoví přesně stejný stav rozcestníku (ověřeno na dvou nasazených
  lekcích, 83 % a 92 %, průměr správně 88 %).
- Řádky 4–18 nejsou klikací (`<div>`, ne `<a>`) a nemají vlastní stav —
  jen číslo a „Připravuje se"/„Coming soon".

### Co bys měl vizuálně zkontrolovat
- `index.html` přes lokální server, obě jazykové verze, zvlášť na užší
  obrazovce (320 px) — řádek lekce se stavem výsledků vpravo se tam
  zalamuje na dva řádky, je to čitelné, ale stojí za pohled.
- Krátké popisky lekcí 1–3 — jsou to moje vlastní věty, ne přímý citát ze
  zadání, tak zkontroluj, že sedí tomu, jak bys lekce sám představil.

## Krok 5 — Lekce 2 a 3 (`lekce/02/index.html`, `lekce/03/index.html`,
`js/spolecne.js`, `data/preklady/lekce-02.json`, `data/preklady/lekce-03.json`)

### Co vzniklo
- **`js/spolecne.js`** — sdílený modul se třemi vzorci, které by se jinak
  potřetí kopírovaly: `kartaJamky()` (karta reálné jamky), `vytvorPutt()`
  (N otevřených otázek s ukládáním do `localStorage`, parametrizované klíči
  slovníku i úložiště, takže poslouží jak sekci „Putt", tak lekci 2 pro
  terénní úkol) a `renderSlovnicek()`. Vytažené z `lekce/01/index.html` až
  teď, v kroku 5 — **lekce 1 zůstává nedotčená**, jak byla schválená a
  dodaná; refaktoring dodaného kódu bez důvodu by riskoval regresi něčeho,
  co už prošlo revizí. Lekce 2 a výš tenhle modul používají od začátku.
- **Sdílené CSS (`assets/styl.css`, nová sekce 14).** Styly, které měla
  lekce 1 lokálně (`.zpet`, `.listMark`, `.toggle`, `.karta*`, `.legenda`,
  `.puttQ`/`.puttSaved`, `.pojmy`/`.pojem`) jsem zkopíroval do sdíleného
  souboru, aby je nemusela lekce 2/3 mít znovu vlepené v `<style>`. Přidáno
  čistě přídavně — lokální kopie v `lekce/01/index.html` jsem nechal být,
  takže žádné riziko regrese, jen neškodná duplicita pravidel.
- **`data/preklady/lekce-02.json` — Čtení pozemku.** Tee shot: pět
  přepínatelných vrstev nad stejným obrysem pozemku (vrstevnice, odtok,
  slunce/stín, vítr, podloží — poslední jako řez, ne půdorys). Fairway:
  Sand Hills + Ballybunion. Česká jamka: Dobrouč (terén řízený potokem).
  Approach 1 „Nesmí": tři klikací zóny na tom samém obrysu, geograficky
  odpovídající vrstvám z tee shotu. Approach 2: terénní úkol s volitelnou
  fotkou (jen dočasný náhled přes `URL.createObjectURL`, nikdy se nikam
  neukládá ani neodesílá — výslovně napsáno i studentovi). 6 otázek
  zkoušky = 100 bodů (20+15+15+20+15+15).
- **`data/preklady/lekce-03.json` — Routing.** Tee shot: šest pevných
  ilustrativních míst pro greeny, přepínač „jen body" / „spojené jamky".
  Šest pravidel, která se skládají zároveň (krátké přechody, střídání
  směrů, večerní jamky ne proti slunci, nekřížit koridory, rovnováha parů,
  dramaturgie kola). Fairway: St Andrews (Old, #7) + Cypress Point (#16).
  Česká jamka: Zbraslav (celé hřiště, ne jamka — viz níž). Approach 1
  „Šest jamek": interaktivní stavba routingu, popsáno níž zvlášť. 6 otázek
  zkoušky = 100 bodů (20+15+15+20+15+15).
- **`lekce/02/index.html`** a **`lekce/03/index.html`** — sestavené podle
  stejné kostry jako lekce 1 (Tee shot → Fairway → Česká jamka → Approach
  → Putt → Slovníček → Zkouška), s `jazyk.on()` překreslujícím vždy celý
  plát, nikdy jen text.

### Rozhodnutí, která nebyla v zadání explicitně
- **Zbraslav jako „celé hřiště, ne jamka".** Karta `zbraslav-1.json` je
  datově navázaná na jamku #1 (schéma karty to vyžaduje), ale její
  `otazka`/`prvky` z kroku 3 už vyprávěly příběh přesunu klubovny o víc
  než 2 km a přepracování celého routingu — přesně to, co lekce 3 podle
  zadání potřebuje. Nešahal jsem do dat, jen jsem to v `ceskaJamka.lede`
  (lekce-03.json) explicitně orámoval jako „co uděláš s routingem osmnácti
  jamek, když se klubovna přesune jinam" — student tak kartu čte jako
  příklad na úrovni celého hřiště, i když technicky zobrazuje jednu jamku.
- **Geografická provázanost pláty ↔ úkol.** V obou lekcích stojí studijní
  plát (tee shot) a pracovní plát (approach 1) na stejném obrysu pozemku
  (`POZEMEK`/`kresliZaklad`) se stejnou polohou klubovny/potoka — takže
  „Nesmí" v lekci 2 doslova ukazuje na místa, která student viděl ve
  vrstvách, a „Šest jamek" v lekci 3 staví na tomtéž pozemku, který viděl
  v tee shotu. Souřadnice jsou čistě ilustrativní, ne reálná jamka.
- **Kompasové názvy směrů (`smery` v obou slovnících) jsem musel doplnit
  sám.** Zadání ani žádný prototyp neobsahuje hotové osmisměrné názvy
  (sever/jih/východ/západ + kombinace) pro varovné hlášky u opakujícího se
  směru v „Šest jamek" — doplnil jsem `smery: {S,J,V,Z,SV,SZ,JV,JZ}` do
  `lekce-03.json` (cs i en) stejným způsobem, jako se doplnily dřívější
  chybějící klíče (např. `approach2.jednotka` v lekci 1).
- **Měřítko „Šest jamek" (`SCALE = 1,7 m/jednotka`) je odhad, ne přesný
  přepočet.** Zadání popisuje pozemek jako „zhruba 60 hektarů" — při
  viewBoxu 400×520 vychází při této konstantě plocha cca 680×884 m ≈
  60,1 ha, což sedí. Je to ale kalibrace na kulaté číslo, ne odvozené z
  jiného pravidla; pokud bys chtěl přesnější/jiný tvar pozemku, měřítko se
  dá přepočítat na jednom místě.
- **„Šest jamek" — zjednodušení: bez kontroly minimálního rozestupu
  koridorů.** Pravidlo „60–70 m rozestup" z tee shotu se v interaktivním
  nástroji samostatně nekontroluje — pokrývají ho dohromady kontrola
  křížení (přímý zásah) a kontrola opakujícího se směru (nepřímé riziko
  stejným směrem vedle sebe). Obě kontroly jsou konkrétní a snadno
  ověřitelné (viz zadání), samostatná vzdálenostní metrika by přidala
  třetí číslo bez jasně odlišného pedagogického přínosu — pokud ji chceš
  přidat později, výpočet segmentů (`a1Metriky()`) už na to je připravený.
- **Kontrola opakujícího se směru hlásí jen první nalezený běh ≥3 stejných
  směrů po sobě** (ne všechny běhy najednou) — odpovídá to jedinému
  konkrétnímu příkladu ze zadání („Jamky 3, 4 a 5 vedou všechny na
  západ...") a nezahltí studenta víc než jedním upozorněním najednou.
  Kontrola křížení stejně tak hlásí první nalezenou dvojici koridorů.

### Chyby odhalené a opravené při psaní/ověřování
- **`data/preklady/lekce-02.json` i `lekce-03.json` — chybné uvozovky.**
  Šest (resp. šest) výskytů vzoru „text" — otevírací uvozovka „ správně,
  ale zavírací byla rovná `"` místo `“` — rozbíjelo to JSON syntaxi
  (`Expecting ',' delimiter`). Opraveno hromadně přes `re.sub(r'„([^"„“]*)"',
  r'„\1“', text)` v obou souborech; zkontrolováno, že žádný text uvnitř
  neobsahuje osamocenou zavírací uvozovku, která by regex zmátla.
- **Stejný překlep jako v kroku 4 se zopakoval:** `zkouska.q5.a/b/c/d`
  (otázka typu „vice") jsem v obou nových slovnících napsal jako vnořené
  objekty `{text, ok}` místo prostých řetězců — nekonzistentní s lekcí 1,
  kde `ok` žije jen v JS poli `zkouskaOtazky`, ne ve slovníku. Opraveno
  skriptem, který `q5.a/b/c/d` zploští na `.text`.
- **`lekce/02/index.html` — mrtvý/rozbitý kód v `kresliPodlozi()`.**
  Zbytek pokusu o `clipPath`, který znovu-připojoval už vykreslený
  `<rect>` do nikde nereferencovaného `clipPath` — beze smyslu a bez
  účinku. Odstraněno.
- **`lekce/02/index.html` — třetí sloupec řezu podložím přesahoval
  viewBox** (400 jednotek širokým, sloupec na `x=320` + šířka `90` = 410).
  Přepočítáno na `x = 55/178/301`.
- **Vlastní chyba v testovacím Playwright skriptu, ne v kódu stránky:**
  `page.mouse.click(x, y)` bere souřadnice vůči viditelnému oknu, ne vůči
  celé stránce — když jsem klikal na `#p2` v lekci 3 podle
  `boundingBox()` bez scrollu, klikal jsem mimo obrazovku a nástroj „Šest
  jamek" vypadal, že vůbec nereaguje na klik. Oprava testu (scroll do
  view + `elementHandle.click({position})`) potvrdila, že stránka
  klikání zpracovává správně.

### Ověřeno (Playwright, `/opt/pw-browsers/chromium`)
- Konzole čistá (žádné `pageerror`/`console.error`) na 320/375/768 px, oba
  jazyky, obě lekce.
- Lekce 1 se po přesunu sdílených stylů do `assets/styl.css` dál načítá
  bez chyby (kontrola regrese).
- „Šest jamek" (lekce 3): umístění 6 bodů v pořadí funguje, klik na
  existující bod smaže jeho i všechny pozdější, tlačítko „Začít znovu"
  vynuluje. Metriky ověřeny na třech scénářích — čistý routing (žádné
  varování), routing se 3 koridory stejným směrem (správně nahlásil
  „Jamky 2, 3, 4… (sever)"), routing s křížením (správně nahlásil
  „Koridory jamek 2 a 5 se kříží").
- Zkouška lekce 3: kompletní běh se všemi správnými odpověďmi (obrázkové i
  textové otázky) dá 100 % / 100 bodů, součet bodů za otázky sedí
  (20+15+15+20+15+15).
- Karty reálných jamek (Sand Hills, Ballybunion, Dobrouč, St Andrews,
  Cypress Point, Zbraslav) kreslí barevně (ne černě) přes sdílený
  `kartaJamky()` z `js/spolecne.js`.

### Co bys měl vizuálně zkontrolovat
- `lekce/02/index.html` a `lekce/03/index.html` přes lokální server, obě
  jazykové verze.
- Lekce 2 — přepínání pěti vrstev tee shotu a hledání tří zón v „Nesmí".
- Lekce 3 — postav si vlastní routing v „Šest jamek" a zkontroluj, že
  se ti hlášky (opakující se směr / křížení) zdají srozumitelné i bez
  mého vysvětlení tady.
- Měřítko 60 ha (`SCALE` v `lekce/03/index.html`) — je to odhad, potvrď
  nebo uprav, pokud máš přesnější představu o rozměrech pozemku.

## Krok 4 — Lekce 1 celá (`lekce/01/index.html`, `js/simulace.js`,
`js/jazyk.js`, `js/vysledky.js`, `js/zkouska.js`, `data/preklady/lekce-01.json`)

### Co vzniklo
- **`js/jazyk.js`** — řadič jazyka: `?lang=` > `localStorage` >
  `navigator.language`, `data-t` binding přes `innerHTML`, `on()` pro
  registraci překreslovacích funkcí (volají se při KAŽDÉ změně jazyka i
  jednou hned na startu — takže žádný plát v lekci 1 nikdy nepřepisuje
  jen text, vždy se překreslí celý).
- **`js/simulace.js`** — statistický (Box–Muller) model rány podle zadání,
  část 8: čtyři hráči podle HCP, boční/podélná chyba, ležení
  (fairway/rough/bunkr), `odehrajJamku`/`odehrajKolo` jako obecný
  Monte-Carlo simulátor jedné jamky, `putty()`, `normCdf()`.
- **`js/vysledky.js`** — ukládání pokusů do `localStorage['routing.vysledky']`
  (pole, nikdy se nepřepisuje, jen přidává), `pasmo()`, export/import JSON.
- **`js/zkouska.js`** — obecný engine zkoušky pro všech 18 lekcí (typy
  `jedna`/`vice`/`obrazek`, odhalení až po odevzdání, `if(trida)
  classList.add(trida)` všude podle pasti ze zadání, část 17).
- **`data/preklady/lekce-01.json`** — kompletní dvojjazyčný slovník lekce 1;
  6 otázek zkoušky dává přesně 100 bodů (20+15+15+20+15+15), 2 obrázkové,
  3 jedna, 1 více — podle limitů ze zadání, část 10.
- **`lekce/01/index.html`** — sestavovací stránka: Tee shot (dvě studie),
  Fairway (3 reálné jamky + 1 česká), Approach (dva pracovní pláty), Putt
  (3 otevřené otázky), Slovníček, Zkouška.

### Rozhodnutí, která nebyla v zadání explicitně
- **`bocniChyba()` mezi HCP 9/18** — zadání dává jen krajní body (6 % u
  HCP 0, 12 % u HCP 24). Lineární interpolace mezi nimi.
- **„raft" → „rough"** — zadání používá slovo „raft" u ležení, což se v
  žádném prototypu ani jinde nevyskytuje; podle kontextu (multiplikátory
  rozptylu/dosahu vedle fairway a bunkru) jde téměř jistě o překlep/OCR
  chybu za „rough" (vyšší tráva) — potvrzeno srovnáním s
  `cviceni-bunkr-perokresba.html`, který přesně tuhle mezikategorii
  (`rough`) používá stejným způsobem.
- **`js/platy.js` — karty jamek v metrech.** Za chodu jsem zjistil, že
  kdybych `tvary` z `data/jamky/*.json` kreslil přímo v metrech jako
  jednotky viewBoxu, sdílené `.lab`/`.lab.sm` popisky (kalibrované na
  abstraktní ~400jednotkový viewBox ostatních plátů) by vyšly buď obrovské,
  nebo neviditelné. Přidal jsem `rozsahJamky()`/`meritkoJamky()` — převod
  metrů na sdílenou škálu (fit-to-width, `cilovaSirka=300`) — a využil tu
  samou příležitost ke splnění dřív odloženého pravidla 5 (podélné
  zkrácení): `meritkoY = meritkoX × 0.55`, s `meritkoPoStrane()` jako
  explicitním přiznáním zkrácení (měřítko po straně, popsané v metrech).
  `vykresliJamku()` je pak ta „jedna funkce kreslí libovolnou jamku"
  slíbená v zadání, část 5.
- **„Kde je rovnováha" (approach2) je nová úloha**, není v žádném
  prototypu — navržena podle popisu v zadání („posuvník, jak těsně kolem
  hazardu, proti sobě dvě křivky: zisk vs. riziko, student hledá
  průsečík"). Model: referenční hráč HCP 18, `D0` = počáteční vzdálenost
  přiblížení, jezdec 0–100 % „těsnosti" lineárně mění bezpečnou marži
  (klesající) i zkrácení přístupu (rostoucí). Zisk = úspora ran díky
  kratší ráně (`puttyPlynule()`), riziko = pravděpodobnost zásahu hazardu
  (`normCdf()`) × 1 trestná rána.
  - **Konstanty vyladěné numericky, ne odhadem.** První verze (D0=140 m,
    marže 24→2 m, zkrácení 0–30 m) měla dvě chyby: (1) `putty()` má jen
    5 schodů po 2/5/10/20 m a celý rozsah vzdáleností tu padal do
    jediného schodu — jezdec vizuálně nic neměnil; (2) i po opravě (1)
    riziko převyšovalo zisk už od 0 % — průsečík, o který v úloze jde,
    by nikdy nenastal. Řešení: (a) přidal jsem `puttyPlynule()` do
    `simulace.js` — plynulá interpolace mezi středy schodů `putty()`,
    použitelná i jinými budoucími lekcemi s posuvníkem; (b) numericky
    (`node` skript, ne odhadem) jsem hledal `D0`/marži/zkrácení, u kterých
    se křivky protnou v rozumném místě (kolem 55–65 % těsnosti) —
    výsledek: D0=150 m, marže 40→3 m, zkrácení 0–50 m.
- **Konstanty pro „Trest úměrný chybě" (teeShot2)** — prahy 8 m (konec
  fairwaye) a 14 m (konec přechodové trávy u jamky B) a přírůstky ran
  (+0,4 rough, +0,9 bunkr) jsou ilustrativní, ne odvozené ze
  `simulace.js` — teeShot2 ukazuje princip (skokový vs. postupný trest),
  ne simulaci konkrétní jamky.
- **`architekt.uvadeny` v `data/jamky/*.json` musel být dodatečně
  přeložen.** Ve všech 10 kartách šlo o čistě český text (např. „Pete Dye
  (spoluautorka Alice Dye)", „Les Furber a Jim Eremko") — v Kroku 3 jsem
  ho nechal jako holý řetězec, protože jsem si neuvědomil, že se bude
  zobrazovat i v anglické verzi stránky. Opraveno na `{cs, en}` jako
  ostatní textová pole; `jistota`/`poznamka` zůstávají jak byly (jistota
  se studentovi nezobrazuje, jen `poznamka` — a ta `{cs,en}` už byla).

### Chyby odhalené a opravené při ověřování (Playwright)
- **Pořadí kreslení u teeShot1** — bunkr/diagonální hazard u strategické a
  heroické filozofie ležel POD fairwayí (kreslil se před ní), takže ho
  fairway úplně překryl. Oprava: hazard se kreslí AŽ PO fairwayi (stejné
  pořadí jako v `miniHole()` z `test-lekce-01.html`, které jsem měl
  použít jako vzor rovnou).
- **`odehrajJamku()` vracelo špatný „dopad" pro cvičení s bunkrem.**
  Obecná simulace v `simulace.js` přepisuje `x`/`y` při každé další ráně
  (dokud míč nedojde na green) a `dopad` vracelo KONEČNOU polohu, ne
  místo dopadu ODPALOVÉ rány — cvičení „Kam patří bunkr" ale potřebuje
  vidět rozptyl drivů, ne kde hra skončila. Přidal jsem `dopadOdpalu`
  (zachycené hned po výpočtu tee shotu, před smyčkou přihrávek) a
  `odehrajKolo()` teď plní `dopady` z něj. Netýká se to bodů/procent
  (ty vždy počítaly správně), jen vizualizace teček/křížků na plátu.
- **`a1Base` (výchozí hodnota bez bunkru) bylo `null`, pokud student
  položil bunkr ještě PŘED prvním „Odehrát".** Prototyp počítal základní
  hodnotu vždy při načtení stránky, moje první verze jen když `bunkers`
  byly prázdné v okamžiku kliknutí na Odehrát. Opraveno — počítá se
  jednou při načtení, nezávisle na tom, co student zrovna položil.
- **Karty jamek a obrázkové otázky zkoušky kreslily do SVG, které ještě
  nebylo připojené k dokumentu** — `V()`/`getComputedStyle()` na
  odpojeném uzlu vrací prázdné hodnoty vlastních CSS proměnných, takže
  všechny tvary vyšly černé místo barevné palety. Oprava na obou místech:
  připojit element do živého stromu (karta do kontejneru, otázka do
  `el.quiz`) DŘÍV, než do něj cokoli kreslíš. Tohle je obecná past pro
  jakoukoli budoucí lekci, která kreslí do dynamicky vytvořeného SVG —
  zapsáno sem, ať se neopakuje.
- Prahová hodnota „vyrovnáno" u „Kde je rovnováha" byla nastavená moc
  volně (0,03 rány) a hlásila průsečík i tam, kde jedna křivka zjevně
  vedla — zúženo na 0,01.

### Ověřeno (Playwright, `/opt/pw-browsers/chromium`)
- Konzole čistá (žádné `pageerror`/`console.error`) na 320/375/768 px, oba
  jazyky.
- Kompletní běh zkoušky (6 otázek, `Odevzdat`) uloží pokus a spočítá
  správně 100 % při všech správných odpovědích.
- Přepnutí jazyka za běhu překreslí všechny pláty (tvary i popisky), ne
  jen text.
- Poznámky u „Putt" přežijí reload stránky (localStorage).
- Posuvník „Kde je rovnováha" má reálný průsečík křivek kolem 55–65 %
  těsnosti a tři odlišné výroky (převažuje zisk / vyrovnáno / převažuje
  riziko) se skutečně střídají podle polohy jezdce.

### Co bys měl vizuálně zkontrolovat
- `lekce/01/index.html` přes lokální server, obě jazykové verze.
- Cvičení „Kam patří bunkr" — polož bunkr na různá místa a zkontroluj, že
  se verdikt (trest/strategie/dekorace/oba) mění smysluplně.
- Zkouška — jedno kolo se špatnými odpověďmi, zkontrolovat vysvětlení a
  tlačítko „Zkusit znovu".

## Krok 3 — karty jamek (`data/jamky/*.json`, `knihovna-jamek.md`)

### Metoda
Fakta jsem sbíral přes čtyři paralelní rešerše (mezinárodní jamky lekce 1,
česká jamka lekce 1, jamky lekce 2, jamky lekce 3), každá s pokynem
preferovat primární zdroje, uvádět rok u každé délky a přiznat nejistotu
místo domýšlení. Zdroje jsou u každé karty v poli `prameny` a v
`knihovna-jamek.md`. Sporné nebo nedohledané údaje jsou označené přímo v
JSON (`poznamka` u `delky`/`architekt`, nebo `null` u délky, když se
nenašla vůbec — viz Dobrouč 3).

### Rozšíření schématu oproti příkladu v zadání, část 12
- **`delky[]` má teď `m` i `yd` zároveň**, ne jen `yardy` jako v ukázce ze
  zadání — část 6 výslovně žádá „v kartách jamek uváděj oboje", což
  ukázkové schéma nesplňovalo doslova. Kde chybí ověřený rok měření,
  pole `rok` je `null` a důvod je v `poznamka` u téhož záznamu.
- **`architekt.poznamka` a `gps.presnost` jsou teď bilingvní objekty**
  (`{cs,en}`), ne prostý řetězec jako v ukázce — celý kurz je dvojjazyčný,
  takže i tahle vysvětlující pole potřebují obě verze.
- **`tvary.green`/`bunkry[]`/`hazardy[]` mají místo volných „tvarových
  dat" přímo parametry pro `blob()` z `js/platy.js`** (`x,y,rx,ry,rot,seed,
  amp`), v metrech od odpaliště (x = boční odchylka, y = vzdálenost po ose
  hry). Je to přímo spotřebovatelné kreslicí knihovnou beze změny — ověřeno
  v `dev/jamky-preview.html` (viz níže). Souřadnice jsou **schematické,
  ne přesný půdorys** — to je záměr, ne nedostatek: zadání zakazuje
  satelitní snímky v repozitáři (část 13), takže tvary vycházejí z
  ověřeného slovního popisu dispozice (kde je bunkr vzhledem ke greenu,
  na které straně je voda), ne z trasování mapy.
- **`verze: 1`** na každé kartě — stejná praxe jako u `routing.vysledky`
  (část 10 zadání), pro budoucí migraci formátu.
- **`sdilena_jamka`** — nové pole jen u St Andrews 7 (viz níže), jinde
  se nepoužívá.

### Rozhodnutí, která jsem udělal sám
- **St Andrews 7/11 je jedna karta, ne dvě.** Fyzicky jde o jeden green o
  dvou praporcích — modelovat ho jako dvě nezávislé karty by tuhle
  podstatu skryl. Karta má `jamka: 7` a pole `sdilena_jamka` s údaji o
  jamce 11. Díky tomu vyšel celkový počet karet přesně na deset, i když
  fakticky pokrývají jedenáct čísel jamek.
- **Golf Resort Karlštejn jsem použil pro lekci 1** (jamka 15, skutečná
  volba bezpečno/agresivně) na základě doslovného citátu z klubového
  hole-guide — jediný kandidát ze seznamu v zadání, u kterého se podařilo
  najít konkrétní, ověřitelný popis dispozice hazardů, ne jen scorecard.
  Podrobnosti o tom, proč ostatní kandidáti (Albatross, Ypsilon, Kaskáda,
  Golf Park Plzeň, Mariánské Lázně, Konopiště) nevyšli, jsou v
  `knihovna-jamek.md` u zdrojů a v rešerši samotné — hlavně chybí veřejně
  dostupný hole-by-hole popis hazardů, ne že by kandidáti byli špatní.
- **Prosper Golf Resort Čeladná jsem NEPOUŽIL**, i když je v zadání mezi
  kandidáty — ověřený popis jamky 15 (ostrovní green s vodopádem) ukázal,
  že jde o čistě heroickou jamku bez zmíněné bezpečné objížďky, takže
  nesplňuje požadavek „obě cesty dávají smysl". Klidně by ale mohla
  posloužit jinde jako protipříklad heroické kategorie.
- **Ballybunion Old (ne Royal County Down)** pro lekci 2 — obě jsou silný
  kandidát na „práci s dunami", ale k jamce 11 Ballybunionu se našel
  konkrétnější doložený popis (terén nahrazuje bunkr úplně), zatímco u
  Royal County Down zůstalo jen obecné konstatování o slepých ranách.
- **Prague City Golf Zbraslav pro lekci 3** — nejlíp zdokumentovaný
  případ, kdy poloha klubovny (ne tvar pozemku) vynutila přepracování
  celého routingu; přímý citát architekta Jakuba Červenky se ale nepodařilo
  dohledat (rozhovor na golfcourses.cz blokovaný přes robots.txt) —
  karta to přiznává otevřeně místo parafráze bez zdroje.

### Co zůstává neověřené a mělo by se dořešit před tiskem/publikací
- **Golf Dobrouč, jamka 3:** přesná délka (m/yd) nedohledána nikde
  veřejně — `delky[0].m`/`.yd` jsou `null`. Doporučuju ověřit přímo u
  klubu, než půjde karta do finální lekce.
- **GPS u všech deseti karet je na úrovni areálu**, ne přesná poloha
  konkrétního odpaliště/greenu — přesnější souřadnice se nepodařilo najít
  ve veřejných, citovatelných pramenech u žádné z deseti jamek. Pole
  `gps.presnost` to u každé karty říká výslovně.
- **Zbraslav 1:** tvar hazardů v `tvary` je čistě ilustrativní podle
  obecného charakteru hřiště (linksový styl, pot bunkery) — ne ověřené
  rozestavění téhle konkrétní jamky, protože se nedohledalo. Řečeno přímo
  v poli `tvary.poznamka` i v `knihovna-jamek.md`.
- **Pebble Beach 18 a Cypress Point 16:** přesná dnešní yardáž kolísá mezi
  prameny o jednotky až desítky yardů — uvedeny obě/všechny nalezené
  hodnoty s tím, která převažuje.

### Ověřeno
- Všech 10 souborů je validní JSON (`python3 -m json.tool` na každém).
- Automatická kontrola (`node` skript) potvrdila, že všechny povinné klíče
  existují, `tvary.green`/`bunkry`/`hazardy` mají kompletní číselné
  parametry pro `blob()`, `otazka` má obě jazykové verze a každá karta má
  aspoň 2 prvky a aspoň 2 zdroje.
- `dev/jamky-preview.html` (další dev-only stránka, stejná poznámka jako u
  `platy-ukazka.html` v kroku 2) vykreslí všech deset karet vedle sebe
  přímo z JSON přes `js/platy.js` beze změny kódu knihovny — vizuální
  průkaz, že datový formát je opravdu okamžitě použitelný, ne jen teoreticky
  správný.

## Krok 2 — `js/platy.js`

### Co je uvnitř
Sjednocené funkce ze všech tří prototypů, které je obsahovaly (redan,
cvičení s bunkrem, zkouška): `E`, `V`, `rng`, `blob`, `blobPts`, `radial`,
`hatch`, `stipple` — to je přesně seznam z části 5 zadání plus `E`/`V`/`rng`,
bez kterých se ty ostatní nedají zavolat. Každá funkce má JSDoc komentář —
co dělá, co znamenají parametry, na co navazuje.

### Rozhodnutí, která jsem udělal sám
- **Automatická hustota podle pravidla 1.** `hatch()`, `radial()` a
  `stipple()` teď samy čtou `--hatch-density` z elementu, do kterého kreslí,
  a jeho hodnotou násobí krytí (opacity). V `assets/styl.css` je `1` na
  `:root` a `.33` na `.plate-work`. Prakticky to znamená: pracovní plát
  označíš `<svg class="plate-work">` a šrafura i tečkování jsou samy o
  třetině tišší, aniž by kdokoli musel v každé lekci ručně přepisovat
  konstanty krytí. V prototypech tohle řešené nebylo (každý soubor má
  hustotu zapsanou natvrdo do volání) — je to jediné místo, kde jsem oproti
  prototypům přidal chování, ne jen přepsal existující kód. Zdůvodnění: bez
  toho hrozí přesně to, čemu se zadání snaží vyhnout — že si každá lekce
  hustotu vyladí trochu jinak a princip se rozpadne. Pokud to nechceš
  automatické, dá se to v `platy.js` snadno vypnout (smazat tři řádky s
  `density`).
- **Tři funkce navíc, mimo výslovný seznam z části 5:**
  - `clipPath(defs, id, d)` — ve všech prototypech se opakoval stejný
    dvouřádkový vzorec (`E(defs,'clipPath',...)` + `E(clip,'path',...)`);
    bez pojmenování by se to jen dál kopírovalo.
  - `pin(parent, x, y, opts)` — praporek na jamce (kolík + vlaječka), ve
    třech prototypech identicky zkopírovaný se stejnými čísly. Kandidát na
    přesné zopakování chyby, kdyby se to psalo počtvrté ručně.
  - `filledShape()` a `bboxOf()` — shrnují trojici „výplň → šrafura uvnitř
    tvaru → obrys", která se v prototypech dělá pořád stejně ve třech
    krocích ručně. Nepovinné: kdo chce vrstvy poskládat jinak (např. green
    na Redanu má mezi výplní a obrysem navíc `radial()` na obvodu), sáhne
    rovnou po `clipPath()` + `hatch()` + `E()`.
  Žádná z těchto tří neobsahuje novou vizuální logiku — jen pojmenovává
  vzorec, který se v prototypech už opakoval. Pokud je nechceš, klidně je
  smaž; zbytek knihovny na nich nezávisí.
- **Souřadnicové mapování (`px`/`py` s podélným zkrácením, pravidlo 5) jsem
  zatím NEPŘIDAL.** V `cviceni-bunkr-perokresba.html` a
  `golf-prototyp-v2.html` je to ad hoc dvojice funkcí uzavřená nad
  konkrétními čísly hřiště. Chci ten API navrhnout až proti skutečné první
  jamce v lekci 1 (krok 4), ne odhadem teď — jinak riskuju špatný tvar
  rozhraní, který budu v lekci 1 stejně předělávat.

### Ukázka na dvou tvarech
`dev/platy-ukazka.html` — **není součástí struktury z části 4**, je to
jen průkaz pro tenhle krok. Ukazuje:
1. Green (`filledShape` + `radial` po obvodu) a bunkr (`stipple` + `radial`)
   vedle sebe.
2. Stejný bunkr dvakrát — jednou jako studijní plát (hustota 1), jednou jako
   pracovní (`class="plate-work"`, hustota .33) — vidět je to na první
   pohled, šrafura i tečkování jsou vpravo znatelně tišší.
3. Ověření semínka: tlačítko „Překreslit stejné" dá byte-identické SVG
   (ověřeno automaticky — `svg1 === svg2`), tlačítko „Nové semínko" dá jiný
   tvar se stejným stylem kresby.

Klidně tuhle stránku smaž po schválení kroku 2, nebo ji nech v `dev/` jako
interní pomůcku pro další lekce — na `index.html` ani nikam jinam se z ní
neodkazuje, takže nezasahuje do zadané struktury.

### Ověřeno
- `dev/platy-ukazka.html` běží čistě přes `python3 -m http.server` — žádná
  konzolová chyba kromě `favicon.ico` (stránka není v seznamu kurzu, takže
  jsem ji favicon-em nezatěžoval).
- `js/platy.js` je čistý ES modul bez závislostí, importuje se relativní
  cestou (`../js/platy.js` z `dev/`, bude `../../js/platy.js` z
  `lekce/NN/`).
- Barvy nejsou v `platy.js` nikde napsané natvrdo — všechno jde přes `V()`.

## Krok 1 — kostra repozitáře

### Rozhodnutí odsouhlasená předem (přes zpětnou vazbu)
- **EN verze bez české sekce.** Anglická verze lekcí nebude obsahovat českou
  jamku/hřiště, zůstanou jen mezinárodní příklady. Týká se struktury Fairway
  sekce v lekcích 1–3 — dopad to bude mít až při psaní lekcí, ne v kostře.

### Rozhodnutí, která jsem udělal sám a je dobré je potvrdit
- **Zdroj fontových souborů.** Zadání žádá stažení Playfair Display a EB
  Garamond jako self-hosted woff2. Přímé stažení z `fonts.googleapis.com`
  / `fonts.gstatic.com` není v tomto prostředí síťově dostupné (blokovaná
  doména). Použil jsem npm balíčky `@fontsource/playfair-display` a
  `@fontsource/eb-garamond` — jde o stejné soubory, jaké distribuuje Google
  Fonts (stejný zdrojový font, stejná SIL OFL licence), jen přebalené pro
  self-hosting; je to bezpečný a běžně používaný zdroj. Zkontroluj prosím
  vizuálně, že řezy sedí (viz níže).
- **Vybrané řezy.** Playfair Display 900 normální a 700 kurzíva (nadpisy
  plátů a jejich podtitul v `<em>`, podle vzoru z `redan-plat-dvojjazycne.
  html`). EB Garamond 400 a 500 normální + 400 kurzíva. Všechno latin +
  latin-ext, woff2. Zadání v části 5 zmiňuje výslovně jen váhu 900 u
  Playfair Display — 700 kurzívu jsem přidal, protože ji používá referenční
  plát pro podtitul nadpisu a bez ní by `h1 em` spadl na systémový font.
  Pokud podtitul nadpisu nakonec nikde nepoužiješ, řez se dá v kroku
  revize (část 14, bod 7) vyhodit.
- **Velikost fontů.** Deset souborů, dohromady ~330 kB — v pořádku pro
  statický vzdělávací web, ale stojí za zmínku při revizi.
- **Licence (`LICENSE`).** Zadání žádá vyřešit licenci kódu i obsahu, ale
  neurčuje jakou. Navrhl jsem MIT pro kód a CC BY-NC-SA 4.0 pro obsah lekcí
  (texty, karty jamek, otázky) — běžná kombinace pro vzdělávací open-source
  projekty, která dovolí škole obsah sdílet a upravovat, ale ne prodávat.
  **Tohle je rozhodnutí objednatele, ne moje** — potvrď, nebo řekni, jakou
  licenci chceš místo toho.
- **Copyright holder v LICENSE.** Nechal jsem placeholder `[doplní
  objednatel]` — nevím, jestli má být uvedena fyzická osoba, škola, nebo
  klub.

### Co jsem zatím vynechal záměrně (přijde v dalších krocích)
- `js/platy.js`, `js/simulace.js`, `js/zkouska.js`, `js/jazyk.js`,
  `js/vysledky.js` — prázdné složky s `.gitkeep`. Přichází v kroku 2 a dál.
  `index.html` proto zatím **nepoužívá** externí JS moduly a slovník má
  natvrdo v sobě — až přibude `jazyk.js`, přesune se do
  `data/preklady/rozcestnik.json` a `index.html` se přepojí. Zmiňuji to
  explicitně, protože zadání jinak zakazuje natvrdo vložené řetězce — tady
  je to dočasný stav kostry, ne finální řešení.
- Skutečný seznam lekcí na rozcestníku — nemá zatím co zobrazovat, dokud
  neexistují karty jamek a lekce (viz postup, část 14, kroky 3–6).
- `data/jamky/*.json`, `data/preklady/*.json`, `lekce/01–03/index.html` —
  jen kostry složek.

### Ověřeno
- Struktura složek odpovídá zadání, část 4, přesně.
- Všechny cesty v `index.html` a `assets/styl.css` jsou relativní (žádné
  vedoucí lomítko) — připraveno na běh v podadresáři GitHub Pages.
- `.nojekyll` je v kořeni.
- Rozcestník funguje jako čistý ES modul (`<script type="module">`), takže
  vyžaduje lokální server (`python3 -m http.server`), ne otevření přes
  `file://` — zmíněno v README.
- Přepínač jazyka na rozcestníku odráží volbu v `localStorage` i v adrese
  (`?lang=`), přednost má uložená volba, výchozí podle `navigator.language`
  — stejná technika jako v `redan-plat-dvojjazycne.html`.
- Stažení/načtení výsledků jako JSON funguje už teď (i když zdroj dat —
  `localStorage.routing.vysledky` — bude zatím vždy prázdné pole, dokud
  nevznikne `js/vysledky.js` a první zkouška).

### Co bys měl vizuálně zkontrolovat
- Otevři `index.html` přes lokální server a zkontroluj, že se načítají
  fonty (ne systémový fallback) — nejsnáz podle tvaru `1` v `Routing`
  (Playfair Display 900 má charakteristické patky).
- Vyzkoušej přepínač jazyka a tlačítko „Stáhnout výsledky" (mělo by
  stáhnout `routing-vysledky.json` s `{"verze":1,"vysledky":[]}`).
- Ověř na šířkách 320/375/768 px — v kostře jde hlavně o to, že se nic
  neláme vodorovně a dotykové cíle (přepínač jazyka, tlačítka) mají aspoň
  32 px na výšku.

## Otevřené otázky pro objednatele
1. Potvrdit licenci (viz výše).
2. Jméno/organizace do `LICENSE` a `README`.
3. Krok 2 (`js/platy.js`) bude vytažen z `redan-plat-dvojjazycne.html` a
   `cviceni-bunkr-perokresba.html` — obě prototypové knihovny kreslicích
   funkcí (`blob`, `blobPts`, `radial`, `hatch`, `stipple`) jsou téměř
   identické, jen s drobnými rozdíly v defaultních parametrech (např. počet
   bodů `n` u `blob`). Sjednotím je do jedné zdokumentované verze — pokud
   preferuješ jinak, dej vědět předtím, než začnu.
