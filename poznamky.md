# Poznámky — co jsem musel rozhodnout, co ověřit, co bys měl zkontrolovat

Průběžný soubor podle části 15 zadání. Kroky 1–7 hotové.

## Krok 37 — Fairway do zbylých osmi karet (23. 8. 2026)

Zadání: dokreslit fairway do schémat, které ji ještě neměly — u par 3 (Riviera 6,
Cypress Point 16, Karlštejn 14, TPC Sawgrass 17) se vynechává záměrně, architektonicky
ji nemají. Zbylo osm jamek typu par 4/5: Karlštejn 15, Ballybunion Old 11, Mid Ocean 5,
Pinehurst 2-5, Riviera 10, Sand Hills 1, St Andrews Old 7, St Andrews Old 14.

### Nová pomůcka: kalibrace satelitní fotky bez fotky od objednatele

Krok 36 ukázal, jak se z fotky objednatele udělá měřicí přístroj (spárování bodů,
podobnostní transformace). Tady jsem potřeboval totéž, ale bez fotky — objednatel žádnou
neposlal, jen řekl použít satelit. Řešení: Google Maps umí na URL s DMS souřadnicí
(`/maps/search/{lat},{lon}/@{střed},{zoom}z/data=!3m1!1e3`) vykreslit červený špendlík
přesně na zadaný bod. Ten se najde v pixelech (nejnižší červený pixel = špička), k němu
se přidá měřítko z posuvníku vpravo dole (`50 m` nebo `100 m` = tolik a tolik pixelů) —
a je hotová kalibrace pixel↔metr↔GPS, bez nutnosti mít žádnou nahranou fotku. Ověřuje se
stejně jako v Kroku 36: existující zaměřené prvky karty (green, bunkry) se touhle
kalibrací převedou zpátky na snímek a musí sednout na to, co je vidět.

Kde OSM `golf=fairway` v koridoru jamky je, použil jsem ho jako kotvu. Kde není (Pinehurst
2-5 skoro celá, Riviera 10 celá, poslední úsek Mid Ocean 5, Sand Hills 1 od půlky, St
Andrews 7 a 14 skoro celé — Old Course má fairway jen zlomkovitě zmapovanou), fairway jsem
domaloval podle viditelného posekaného pruhu na satelitu. Nová sdílená pomůcka
`dev/fairway_ribbon.py` z ručně určených bodů osy a šířky v každém bodě postaví stuhu
(Catmull-Rom spline, stejná technika jako `fairwayOsa()` v `platy.js`, ale rovnou do
pevného polygonu).

### Mid Ocean 5: karta mířila 380 metrů vedle

Tohle nebyla jen chybějící fairway. Karta už od Kroku 34 nesla poznámku, která si sama
odporovala se stavem pole `gps.tee`: text v `tvary.poznamka` popisoval, jak jsem tehdy
zjistil, že odpaliště zadané objednatelem leží na špatné straně greenu a linie odtud vůbec
nekříží Mangrove Lake — a že ze sedmnácti kandidátů jen tři na západní straně dávají smysl.
**Ale do `gps.tee` se ta oprava nikdy nezapsala.** Pole pořád ukazovalo na starou,
špatnou souřadnici u pobřeží Trott's Bay — 380 m od skutečného odpaliště.

Přišel jsem na to při hledání fairwaye: satelitní snímek na zadané `gps.tee` ukazoval
pobřežní domy, žádný trávník. Dohledal jsem v OSM přímo `golf=hole` s `ref=5` (way
1147116489) — jeho koncový bod u odpaliště leží 380 m severozápadně, přesně na jazyku
země obklopeném Mangrove Lake, se čtyřmi reálnými bunkry po stranách. S touhle opravou
vychází přímá vzdálenost 355 m proti oficiálním 396 m (−10,3 %) — mnohem věrohodnější
než dřívějších −22 %. Existující green, bunkry u greenu a obrys jezera v kartě zůstaly:
přepočítal jsem je do nového rámce (souřadnicová soustava tee→green) a vyšly přesně na
reálnou Mangrove Lake a reálný green z OSM — potvrzuje to, že tahle geometrie byla od
Kroku 34 postavená správně, jen se zapomnělo přepsat pole `gps.tee`. Fairway (reálný OSM
polygon + domalovaný úsek k greenu přes úžinu jezera) a čtyři odpalištní bunkry jsem
přidal nově. Vykreslená karta teď konečně ukazuje to, co ji dělá slavnou: odpal musí
přenést roh jezera, jinak se ke greenu nedostaneš.

**Poučení, který si beru z tohohle kroku:** poznámka v `tvary.poznamka`, která popisuje
opravu, není totéž jako oprava samotná. Pokud text říká „mělo by to být jinak" a pole
pořád obsahuje to staré, karta lže dvakrát — jednou v datech, podruhé v komentáři, který
tvrdí, že o tom ví.

### Ballybunion Old 11 — vedlejší zjištění při stavbě fairwaye

Fairway z pěti roztroušených OSM kousků vyšla podél útesu prakticky rovná, bez zákruty.
To mění dřívější hypotézu (karta, otevřená otázka): rozdíl 432 m oficiálně vs. 345 m
vzdušnou čarou nejspíš nevysvětluje dogleg (rovná fairway žádný nemá), spíš to podporuje
druhou variantu už v kartě — že skutečná hraná délka je blíž 411 m (449 yardů) než
udávaných 432 m. Bunkry na týhle jamce nejsou žádné — brání ji duny, útes a rough, což
satelit potvrzuje.

### Zbylých šest jamek — bez podobného nálezu

Karlštejn 15 (dogleg kolem rybníka Voškov), Pinehurst 2-5, Riviera 10, Sand Hills 1,
St Andrews Old 7 a St Andrews Old 14 měly `gps.tee`/`gps.green` v pořádku — kontrola
vzdálenosti proti oficiální délce vyšla u všech v rozmezí −5 až −16 %, což je normální
pro dogleg (přímá vzdálenost kratší než hraná). Přidána byla jen fairway, u St Andrews
14 navíc záměrně tak, aby Hell Bunker a shluk Beardies (existující OSM bunkry) ležely
uvnitř pásu fairwaye, ne mimo — jsou to fairwayové bunkry, tak to na Old Course je.

### Co u téhle dávky zaměřené NENÍ

Šířka fairwaye v úsecích domalovaných ze satelitu (ne z OSM) je vždy odhad z toho, co je
vidět, ne měření — přiznáno v `obrys.zdroj` u každé takové karty zvlášť. Regresní
kontrola (`dev/sweep.js`) proběhla přes všech 60 stránek bez chyby po celé dávce.

## Krok 36 — Riviera 6: fotka od objednatele jako měřicí přístroj (23. 8. 2026)

Poslední nepřevedená reálná jamka. Karta stála na jedné větě — *green má
uprostřed bunkr* — a přesně ten bunkr jsem v Kroku 28 prohlásil za nezakreslený
v OSM. **Byl jsem vedle.** Bunkr v datech je (způsob 1252667683) a je zakreslený
docela pečlivě. Hledal jsem ho kolem souřadnice areálu, která je od greenu
šestky skoro kilometr daleko — stejná chyba jako u Mangrove Lake v Kroku 20.
Lekce se opakuje potřetí: **když v OSM „nic není", ověř nejdřív, jestli se dívám
na správné místo.**

### Co jamku určilo

Objednatel poslal souřadnici středu greenu (34°02′25,8″N 118°30′27,6″W).
Na tom bodě v OSM končí osa `golf=hole` s `ref=6`; druhý konec leží v ploše
odpaliště 179 m daleko, proti oficiálním 182 m (−1,6 %). U par 3 se přímá
a hraná vzdálenost rovnají, takže tahle shoda je silný důkaz. Kontrola navíc:
sousední osa `ref=7` měří 376 m proti oficiálním 408 yardům (373 m), tedy
+0,8 % — číslování v datech sedí a nemíchám si jamky.

### Green v OSM není. Fotka ano.

Riviera má v OSM jen 45 bunkerů a green šestky v datech chybí úplně. Objednatel
proto poslal letecký snímek. Ten je ale v pixelech a karta potřebuje metry.

Postup, který to vyřešil, a který stojí za zapamatování: **obrázek se usadí na
zaměřená data, ne naopak.** Ze snímku se vysegmentovaly písečné plochy, jejich
těžiště se spárovala se čtyřmi bunkry z OSM a proložila se podobnostní
transformace (měřítko + otočení + posun). Vyšlo 14,1 pixelu na metr a natočení
0,1° — snímek je prakticky sever nahoru. Zbytkové odchylky těžišť jsou
0,03 až 0,20 m na rozpětí 35 m. Teprve tou
transformací dostal obrys greenu měřítko.

Nezávislá kontrola: střed takto změřeného greenu vyšel **3 m** od bodu, který
poslal objednatel. To do výpočtu nevstupovalo.

Transformaci jsem počítal dvakrát. Napoprvé jsem těžiště písečných ploch bral
z dvacetibodových obrysů odečtených paprsky ze středu — u laločnatého bunkru
takový obrys vnitřní zálivy přeskočí a těžiště se posune. Odchylky vyšly 0,6
až 1,0 m a natočení nesmyslných 4°. Napodruhé jsem na obou stranách použil
TĚŽIŠTĚ PLOCHY skutečného obrysu — odchylky spadly na 0,03 až 0,20 m
a natočení na nulu. Ponaučení: obrys a jeho těžiště se musí počítat stejným
způsobem na obou stranách párování, jinak se chyba metody vydává za natočení
snímku.

### Co jsem po cestě zahodil

- **Dva dřívější kandidáty na green** (Krok 28) jsem ověřoval podle bunkerů
  v okolí a ani jeden neodpovídal. Byla to slepá cesta — ne proto, že by data
  lhala, ale protože jsem hledal green podle bunkerů na hřišti, kde je
  zakreslená sotva třetina bunkerů.
- **Pátou písečnou plochu** ze snímku, protáhlou 15 × 6 m severovýchodně od
  greenu. Po usazení do metrů padla přesně na cestu pro vozíky. Není to bunkr,
  je to asfalt — segmentace podle barvy si je plete.
- **První obrys greenu**, který vyšel 46 × 37 m a 1070 m². Prahování na barvu
  pobralo i apron a předgreen. Rozhodla teprve *hladkost*: posekaná putovací
  plocha má v okně 7 × 7 pixelů skoro nulový rozptyl jasu, rough má pruhy po
  sekačce a stíny. S podmínkou na rozptyl vyšlo 780 m² (a nakreslený
  obrys po vyhlazení a zjednodušení uzavírá 720 m² — o tolik se liší hrubá
  maska od hladké čáry, a je poctivé napsat obě čísla).

### Co zaměření rozhodlo v obsahu karty

| sporná věc | jak to bylo | jak to je |
|---|---|---|
| počet bunkerů | Fried Egg tři, PGA Tour čtyři | **čtyři** |
| rozměry greenu | „zdroj si protiřečí" | ≈ 31 × 33 m, **720 m²** |
| ostrovní bunkr | „malý", „pot bunker" | **4,2 × 4,6 m**, 13,6 m² = **1,9 %** greenu |
| poloha bunkru | Golf Digest: mimo geometrický střed | těžiště **2,0 m** od těžiště greenu, doprava |
| GPS | úroveň areálu | odpaliště i green zvlášť |

Golf Digest tvrdil, že bunkr neleží v geometrickém středu. Zaměření mu dává
za pravdu jen napůl: těžiště bunkru je 2,0 m od těžiště greenu, posunuté
doprava. Na ploše 31 × 33 m je to prakticky střed. Nechávám v kartě obojí —
zdroj i změřené číslo, ať je vidět, kde se rozcházejí.

### Změna v kreslítku

Vlajka se dosud kreslila do středu greenu. Tady tam je bunkr — a praporek
v bunkru je kresebná nepravda. `platy.js` proto umí `obrys.green.jamkoviste`
a karta říká, kam se vlajka kreslí; vybral jsem bod s největším odstupem od
bunkru i od okraje (8,5 m, zadní levý kout). Je to konvence, ne zaměření,
a karta to v `tvary.poznamka` přiznává.

### Co u téhle jamky zaměřené NENÍ

Dvě patra greenu a spád zezadu dopředu (půdorys výšku neukáže), fairway
(par 3 ji nemá), rough, stromy, poloha jamkoviště a přiřazení tabulkových
délek k odpalištím — v OSM jsou dvě plochy, ne tři značky. Přední plocha je
36 m dlouhá a pokryje obě kratší délky.

## Krok 35 — Pobřežní čára a posledních pět jamek (23. 8. 2026)

**Patnáct karet z dvaceti je kresleno ze zaměřených obrysů.** Zbytek už
převést nejde a je to zdůvodněné.

### Nová funkce kreslítka: `pobrezniCara()`

Oceán není v OSM plocha, ale otevřená linie `natural=coastline`. Kreslítko
umělo jen uzavřené polygony, takže tři jamky u moře čekaly. Nová funkce
moře dopočítá tím, že od čáry odskočí kolmo na vodní stranu tak daleko, že
to přeteče plát. **Nic se nevymýšlí, jen se doplní strana.**

**Dvě pasti, obě odhalené až pohledem na výsledek:**

1. **Která strana je moře, se nedá odvodit z konvence naslepo.** OSM sice
   klade pevninu vlevo a vodu vpravo od směru zákresu, jenže mezi zákresem
   a plátem stojí dvě obrácení: soustava jamky má y nahoru a viewBox dolů,
   a vyříznutý úsek čáry může běžet opačným směrem než původní způsob.
   U Cypress Pointu vyšlo `vodaVpravo: false`, u Pebble Beach a Ballybunionu
   `true`. Strana je proto pole na kartě a **ověřuje se okem**: moře nesmí
   ležet tam, kde stojí odpaliště nebo green.
2. **Konce čáry se musí protáhnout daleko za plát.** Bez toho vede spojnice
   mezi prvním bodem čáry a posledním bodem odsazené kopie napříč plánem
   a moře se zužuje do klínu. U Pebble Beach to bylo vidět na první pohled.

Ještě jedna věc: **zředění čáry ničí zátoky.** U Cypress Pointu 34 bodů
zátoku úplně smazalo a plán tvrdil, že se hraje po souši. Se 78 body se
objevila. U pobřeží se šetřit nesmí.

### Cypress Point 16

Green na 5 metrů, 217 m proti oficiálním 211 (+2,8 %). Teprve se správnou
stranou moře plán ukázal, co ta jamka je: **green na výběžku a rána nesoucí
přes zátoku.** Tím se zároveň uzavírá poznámka z Kroku 11 — Nominatim
Cypress Point pod jménem nenajde dodnes, ale jamka je určená přímo.

### Pebble Beach 18 — nejpřesnější zásah a nález v datech

**Green v OSM leží NULA metrů** od bodu ze satelitní mapy.

A data ukázala něco, co kresba dosud neuměla: **přímá linie z odpaliště na
green vede přes moře.** Osmnáctka se stáčí doleva kolem zátoky, takže
fairway leží až 90 metrů vpravo od spojnice, kdežto odpaliště i green jsou
u vody. Pobřežní čára běží přesně mezi spojnicí a fairwayí. Je to poprvé
doložené, ne jen popsané.

### Ballybunion Old 11 — nula bunkrů je nález, ne mezera

Green na 4 metry, žebřík 357 / 343 / 314 m. **V datech není ani jeden
bunkr** — a je to tak správně: jedenáctka se hájí dunami, srázem k moři
a roughem. Plán ukazuje odpaliště, green a Atlantik.

Odchylka délky zůstává −20 %, největší ze všech. Buď se jamka po dunách
zatáčí víc, než se zdá, nebo je oficiální délka 432 m nadsazená (jiné
prameny uvádějí 449 yardů = 411 m, což by odchylku srazilo na −16 %).
Karta to nerozhoduje.

### St Andrews Old 14 — Beardies a Hell na svých místech

Green má **57 bodů a přes osmdesát metrů napříč** — sdílený dvojgreen se
čtyřkou. Dva slavné útvary vyšly:

- **Beardies jsou v datech ČTYŘI samostatné bunkry** mezi 153. a 186. metrem
  přímé vzdálenosti, po přepočtu na hranou délku 179 až 217 m. Průvodce The
  Open je klade na 240 až 285 yardů a Fried Egg je popisuje jako „čtyři
  ponořené a divně tvarované díry". Počet i rozestupy sedí.
- **Hell Bunker leží 106 metrů před greenem**; průvodce uvádí 108 yardů,
  tedy 99 m. Odchylka sedm metrů u útvaru přes dvacet metrů širokého.

### Slapy 14 — potvrzeno, ale nepřevedeno

Souřadnice trefily green na 3 metry a naměřený rozměr je **18 × 29 metrů
proti 18 × 31 z birdie booku** — shoda na dva metry a poprvé, co se rozměr
greenu z klubového pramene potvrdil nezávislým zaměřením. V OSM jsou u něj
i dva bunkry, jeden vlevo a jeden vpravo, přesně jak birdie book uvádí.

**Na obrysy se karta přesto nepřevádí:** Slapy nemají v OSM jediné
odpaliště, takže se nedá určit osa jamky a plán by neměl podle čeho být
orientovaný.

### Bilance

| stav | karet | které |
|---|---|---|
| kresleno ze zaměřených obrysů | **15** | Karlštejn 14 a 15, Sand Hills 1, Zbraslav 1, Woking 4, Sawgrass 17, Riviera 10, St Andrews 7 a 14, Augusta 13, Pinehurst 5, Mid Ocean 5, Cypress Point 16, Pebble Beach 18, Ballybunion 11 |
| zaměřeno + letecký snímek | **1** | Riviera 6 (Krok 36) |
| odečteno z klubového plánku | **3** | Albatross 15 (obrysy odmítnuty, viz Krok 31), Ostravice 16, Slapy 14 |
| v OSM není nic | **1** | Dobrouč 3 |

## Krok 34 — Mid Ocean 5 a druhá oprava zadaného odpaliště (23. 8. 2026)

**Jedenáct karet ze zaměřených obrysů.** Mid Ocean 5 je mezi nimi ta, kde
data opravila zadání.

### Green sedí, odpaliště bylo z opačné strany jezera

Objednatel trefil green na 5 metrů. Odpaliště ale zadal na VÝCHODNÍ straně
a linie odtud Mangrove Lake vůbec neprotíná — a přitom celá karta stojí na
tom, že se přes jezero odpaluje.

Prověřil jsem **všech sedmnáct odpališť** ve vzdálenosti 230 až 430 m od
greenu a spustil na ně test, jestli úsečka odpaliště–green protíná polygon
jezera. **Prošla jen tři, všechna na západní straně** (azimut 279 až 293°).

Ta tři navíc sedí na oficiální délky mnohem líp:

| sada | přímé vzdálenosti | proti oficiálním 396 / 368 / 299 m |
|---|---|---|
| západní (přes jezero) | 364 / 328 / 301 m | −8 % / −11 % / +1 % |
| východní (zadaná) | 310 / 288 / 257 m | −22 % / −22 % / −14 % |

**Dvě nezávislá kritéria se shodla**, takže jsem zadané odpaliště nahradil
západní sadou a napsal do karty proč. Je to stejný případ jako St Andrews 14
v Kroku 29 — jen tam jsem musel poprosit o nové souřadnice, kdežto tady měl
test jezera dost síly rozhodnout sám.

### Jezero se muselo oříznout

Mangrove Lake má 9,6 hektaru a v soustavě jamky sahá od −75 do 417 metrů
napříč. Bez ořezu by plán jamky zmizel v jezeře. Ořízl jsem ho obdélníkem
(x od −105 do 115 m, y od −45 do 420 m) Sutherlandovým–Hodgmanovým
algoritmem, což tvar nemění, jen ustřihne, co je mimo plán. Je to zapsané
v `obrys.zdroj`.

**A znovu past s relacemi:** jezero je členem multipolygonové relace a samo
značku `natural=water` nenese, takže filtr podle značek ho nenajde. Musel
jsem ho vzít podle ID způsobu. Je to potřetí, co mě relace zdržely
(Mangrove Lake v Kroku 20, ostrov Sawgrass v Kroku 32, tady znovu).

### Co v OSM chybí

Fairway. V koridoru jsou tři polygony `golf=fairway`, ale ani jeden nejde
spolehlivě přiřadit téhle jamce — jeden leží za greenem, druhý zasahuje
k odpališti sousední jamky. **Radši žádná fairway než cizí.**

### Stav prohlížeče

St Andrews 14 a Slapy 14 se v tomhle kroku převést nepodařilo: karta
prohlížeče se po dotazu na St Andrews zasekla a další dotazy už neprošly.
St Andrews je hustě zastavěné město a i malý výřez tam má megabajty. Karta
zavřená, pokračuje se příště s ještě menším výřezem.

## Krok 33 — Augusta 13 a Pinehurst 5 (23. 8. 2026)

Sbírka má **deset karet ze zaměřených obrysů**.

### Augusta National 13 — a chyba v mém filtru

Green na 3 metry, přímá vzdálenost 410 m proti oficiálním 498 (−17,7 %),
což u výrazného doglegu doleva sedí. V datech je i **polygon fairwaye**,
který se vyklání doprava od přímé linie — u doglegu doleva správně.

**Rae's Creek se musel hledat dvakrát.** Napoprvé vypadl, protože jsem
prvky filtroval podle **těžiště**: potok je v OSM dlouhý přes dva kilometry,
těžiště leží stovky metrů od jamky, a filtr ho vyhodil. Voda u jamky je
navíc zapsaná zvlášť jako vodní **plocha** (301 bodů), která lemuje celou
pravou stranu a před greenem se stáčí napříč. Tu kreslím; osu potoka ne,
protože linie nemá šířku.

> **Poučení: prvky se nesmějí filtrovat podle těžiště, ale podle toho,
> jestli NĚKTERÝ JEJICH BOD leží v koridoru.** U dlouhých liniových prvků
> je těžiště bezcenné. Od téhle jamky používám bodový test.

### Pinehurst No. 2, jamka 5 — první karta bez zaměřeného odpaliště

Green na 3 metry, 489 m proti oficiálním 538 (−9,1 %). Dvanáct bunkerů,
z toho pět vlevo podél celé jamky a sedm kolem greenu.

**Odpaliště v datech není.** V celém výřezu jsou jen dvě plochy `golf=tee`
a ani jedna k pětce nepatří — jedna leží 213 m stranou, druhá **91 metrů ZA
greenem**, což je odpaliště šestky. Pinehurst má v OSM 62 greenů, ale jen
42 odpališť pro devět hřišť.

Na plánu je proto odpaliště jen značka na správném **místě** (ze souřadnice
od objednatele), ne zaměřený obrys. Je to jediný prvek téhle karty, který
zaměřený není, a karta to říká.

> **Poučení: „karta ze zaměřených obrysů" není binární stav.** U Pinehurstu
> je zaměřený green a všechny bunkry, ale ne odpaliště; u Sand Hills chybí
> fairway; u Sawgrass je bunkr zakreslený nepřesně. Každá karta musí
> vyjmenovat, co v ní zaměřené NENÍ — jinak z „ze zaměřených obrysů" vznikne
> dojem úplnosti, který data nenesou.

## Krok 32 — Převod, druhá dávka: Sawgrass, Riviera, St Andrews (23. 8. 2026)

Tři další karty ze zaměřených obrysů. Sbírka jich má **osm**.

### TPC Sawgrass 17 — a past, která by ostrov schovala

Green na 6 metrů, přímá vzdálenost 131 m proti oficiálním 129 (+1,5 %).
U par 3 se přímá a hraná vzdálenost rovnají, takže tahle shoda je
nejsilnější druh důkazu — dogleg by ji schovat nemohl.

**Jezero kolem ostrovního greenu ale v datech „nebylo".** Dotaz na
`natural=water` vrátil tři plochy, žádnou u greenu. Příčina: jezero je
v OSM zapsané jako **RELACE** (multipolygon 17360491), ne jako obyčejný
způsob. Můj parser četl jen `<way>` a relace přeskakoval.

> **Poučení: velké vodní plochy bývají multipolygonové relace. Kdo čte jen
> způsoby, dojde k závěru, že voda v datech není** — a to je přesně chyba,
> kterou jsem udělal u Mangrove Lake v Kroku 20 (tam z jiného důvodu) a málem
> zopakoval tady. Relace se čtou tak, že se z nich vyberou členové s rolí
> `outer` a jejich body se spojí.

Obrys jezera navíc obtáčí ostrov jedním souvislým polygonem, takže se
ostrůvek kolem greenu vykreslí správně jako díra ve vodě.

**Co v datech překvapilo:** bunkr u greenu je zakreslený jako útvar široký
sotva dva metry. Skutečný bunkr sedmnáctky je větší. Kreslím, co je
zaměřené, a výhradu píšu do karty.

### Riviera 10 — data potvrdila asymetrii

Green na 3 metry, 271 m proti oficiálním 288 (−5,9 %). Obrys greenu má
sotva **21 metrů napříč — nejmenší green v celé sbírce**, což karta tvrdila
a teď je to změřené.

**Osm bunkerů, a SEDM Z NICH LEŽÍ VLEVO.** Jediný vpravo je až u greenu. To
je přesně ta asymetrie, o které karta mluví: odvážná pravá strana není
trestaná pískem, ale úhlem.

Vypustil jsem čtyři pískové plochy do 120. metru — na krátké par 4 nejsou
v dopadové zóně nikoho a patří nejspíš sousedním jamkám.

### St Andrews Old 7 — nejtěsnější shoda a nezávislé potvrzení

**Green v OSM leží JEDEN METR** od bodu ze satelitní mapy. Nejtěsnější shoda
ze všech osmi převedených jamek.

Dvě věci data potvrdila:

1. **Obrys greenu má padesát bodů a měří přes sto metrů napříč** — je to
   sdílený dvojgreen sedmé a jedenácté jamky, přesně jak karta popisuje.
   Žádná jiná jamka ve sbírce nemá green ani zdaleka takový.
2. **Shell Bunker vychází 284 metrů od odpaliště.** Oficiální průvodce The
   Open ho klade na 310 yardů, tedy 283 metrů. **Shoda na jeden metr mezi
   dvěma nezávislými prameny** — jedním textovým, druhým zaměřeným.

Vypustil jsem tři pískové plochy a jeden polygon fairwaye kolem 50. metru:
na Old Course běží jamky vedle sebe a tyhle prvky patří sousední dráze.

## Krok 31 — Převod na zaměřené obrysy, první dávka (23. 8. 2026)

Objednatel dodal souřadnice, takže začal hromadný převod. **Hotové jsou
Zbraslav 1 a Woking 4**; u Albatrossu 15 jsem se po prověření rozhodl
zaměřené obrysy NEPOUŽÍT. Sbírka má teď **pět karet ze skutečných obrysů**
(Karlštejn 14 a 15, Sand Hills 1, Zbraslav 1, Woking 4).

### Zbraslav 1 — nejbohatší data zatím

Green na 3 metry, **šest odpališť**, **fairway**, **vodní plocha** a šest
bunkerů. Žebřík dává 513 / 472 / 424 / 396 / 369 / 341 m přímé vzdálenosti
proti oficiálním 520 / 489 / 450 / 450 / 421 / 303 / 250 m z klubového
diagramu — u zadního odpaliště rozdíl 1 %, u dalších 3 až 6 %.

**Dva rozpory jsou v kartě napsané, ne zameteny:**
1. Oficiální popis jamky na webu klubu tvrdí, že jamka **nemá fairwayové
   bunkry** — v OSM jsou v koridoru **čtyři**. Buď je klubový text
   zjednodušený, nebo OSM zachycuje podobu před přestavbou.
2. Klubový diagram klade jeden greenside bunkr vlevo a druhý mírně vpravo;
   v OSM leží oba vlevo. Rozměry greenu 43 × 30 m ale s obrysem sedí.

### Woking 4 — data potvrdila, co karta tvrdí

Green na 2 metry, přímá vzdálenost 314 m proti oficiálním 322 (−2,5 %).

**Nejsilnější potvrzení přišlo z tvaru fairwaye:** polygon `golf=fairway` má
kolem 220. metru **vykousnutou díru** a v ní leží dva malé bunkry (222 a 229
metrů od odpaliště). Přesně ta dvojice, kterou tam v roce 1901 dali Low
a Paton — a v datech je vidět, že fairway je **obtéká z obou stran**, tedy
že jamku nezužují, ale rozdvojují. Do téhle chvíle byly jejich polohy na
kartě odhad.

Železnice, která tvoří out of bounds vpravo, nakreslená není: v OSM je to
otevřená linie (`railway=rail`), ne plocha, a kreslítko pro linii tvar nemá.
Podle dat běží 45 až 60 metrů vpravo od osy.

### Albatross 15 — zaměřené obrysy ODMÍTNUTY

Souřadnice trefily green na 1 metr a v OSM je i šest odpališť a dvě vodní
plochy. **Jenže ze dvou středových bunkerů, na kterých celá jamka stojí, je
v koridoru zaměřený jen jeden.** Převod by kartu připravil o polovinu její
pointy. Zůstává geometrie odměřená z klubového plánku, kde jsou oba (200
a 262 m) a kde měřítko prošlo nezávislou kontrolou.

> **Poučení: zaměřené obrysy nejsou automaticky lepší, když jsou neúplné.**
> Rozhoduje, jestli je v datech to, na čem karta stojí — ne to, odkud data
> pocházejí.

### Co brzdí tři jamky u moře

Cypress Point 16, Pebble Beach 18 a Ballybunion 11 mají jako hlavní hazard
oceán. **Ten v OSM není vodní plocha, ale `natural=coastline` — otevřená
linie**, u které je podle konvence pevnina vlevo a voda vpravo od směru
zákresu. Kreslítko umí jen uzavřené polygony, takže pro ně bude potřeba
doplnit podporu otevřené pobřežní čáry. Do té doby se tyhle tři převádět
nedají.

### Recept na dotaz do OSM, který funguje

1. Skript pouštět **ze stránky openstreetmap.org** a volat relativní
   `/api/0.6/map?bbox=…`.
2. **Žádný `return` na nejvyšší úrovni** — výsledek do proměnné, ta jako
   poslední výraz.
3. Bbox = obálka odpaliště a greenu **plus 0,0022 až 0,0026°**. Víc kartu
   prohlížeče položí.
4. Parsovat **regulárními výrazy nad textem**, ne DOMParserem.
5. Polygony **zředit na 8 až 26 bodů** a vracet jako řetězec „x,y,x,y" —
   jinak výsledek nástroje přeteče limit.

## Krok 30 — Sand Hills 1 ze zaměřených dat (23. 8. 2026)

**Třetí karta kurzu kreslená ze skutečných obrysů** a první zahraniční.
`sand-hills-1.json` má `tvary.obrys` s polygony greenu, tří odpališť a deseti
pískových ploch z OpenStreetMap (ODbL).

### Identifikace prošla na první pokus

Poprvé nebylo potřeba nic dohadovat — souřadnice od objednatele trefily
skutečné prvky:

- **green v OSM leží 3 metry** od zadaného bodu,
- **odpaliště 4 metry**,
- na odpaliště navazuje souvislá řada tří ploch, 478 / 457 / 407 m ke greenu,
- přímá vzdálenost 479 m proti oficiálním 502 m je **−4,6 %**, přesně tolik,
  kolik u mírně zahnuté jamky přidá hra po ose fairwaye,
- Sand Hills je uprostřed prérie a žádné jiné hřiště v okolí není.

Pro srovnání: u Karlštejna 14 i 15 stála identifikace na dvou až třech
nepřímých kritériích a stejně mě dvakrát svedla. **Dvě souřadnice od člověka,
který se podívá na satelit, jsou silnější než jakýkoli automat.**

### Co se muselo rozhodnout

V koridoru leželo **čtrnáct** pískových ploch, ale čtyři z nich přímo
u odpaliště (v soustavě jamky mezi −5 a +13 metrem). Na Sand Hills jsou
bunkry přírodní výfuky a je jich všude plno; tyhle nejsou ve hře a na plánu
by mátly. Použil jsem pravidlo **„od 25. metru dál a do 75 metrů od osy"**
a zapsal ho do `tvary.poznamka`, aby se dalo přezkoumat.

### Co na plánu není

Fairway — OSM pro tenhle koridor žádný polygon `golf=fairway` nemá. Plán
proto ukazuje odpaliště, písek a green v prázdném roughu. **U Sand Hills to
paradoxně sedí:** je to minimalistické prérijní hřiště, kde hranice fairwaye
a roughu skoro splývá. Ale je to omezení dat, ne záměr, a karta to říká.

### Stav prohlížeče a co z toho plyne

Během kroku se karta prohlížeče opakovaně zasekla a jednou vrátila
`Failed to fetch`. Zabralo tohle:

1. **Skript pouštět ze stránky openstreetmap.org** a volat relativní
   `/api/0.6/map?bbox=…` — ze stránky cizího původu (example.com) fetch
   občas selže.
2. **Nepoužívat `return` na nejvyšší úrovni** — vyhodnocovač vrátí
   `undefined`. Výsledek se musí uložit do proměnné a ta být posledním
   výrazem.
3. **Výřez držet malý.** Dotaz kolem odpaliště St Andrews (±120 m) měl
   281 kB a proběhl okamžitě; dotaz přes celou jamku (±700 m) v témže městě
   kartu položil.

## Krok 29 — Objednatel dodal souřadnice patnácti jamek (23. 8. 2026)

Objednatel vyplnil pracovní list: čtrnáct jamek s dvojicí souřadnic
(green + zadní odpaliště) a Slapy 14 jen s greenem, protože tam OSM
odpaliště nemá. Souřadnice jsou uložené v `dev/souradnice-jamek.json`
a zapsané do pole `gps` jednotlivých karet.

### Kontrola, která proběhla PŘED zápisem

U každé jamky se spočítala přímá vzdálenost odpaliště–green a porovnala
s oficiální délkou. **U doglegu je přímá vzdálenost kratší než hraná**,
takže záporná odchylka je očekávaná — a její velikost říká, jak zahnutá
jamka je.

| jamka | oficiálně | přímo | odchylka |
|---|---|---|---|
| TPC Sawgrass 17 (par 3) | 129 m | 130 m | **+1 %** |
| Cypress Point 16 (par 3) | 211 m | 217 m | **+3 %** |
| Woking 4 | 322 m | 314 m | −3 % |
| Albatross 15 | 412 m | 396 m | −4 % |
| Sand Hills 1 | 502 m | 479 m | −5 % |
| St Andrews Old 7 | 339 m | 319 m | −6 % |
| Riviera 10 | 288 m | 271 m | −6 % |
| Pebble Beach 18 | 495 m | 455 m | −8 % |
| Pinehurst No. 2 jamka 5 | 538 m | 488 m | −9 % |
| Zbraslav 1 | 520 m | 433 m | −17 % |
| Augusta National 13 | 498 m | 410 m | −18 % |
| Ballybunion Old 11 | 432 m | 345 m | **−20 %** |
| Mid Ocean 5 | 396 m | 309 m | **−22 %** |
| St Andrews Old 14 | 561 m | 408 m | **−27 %** |

**Obě par 3 vyšly na procento přesně** — a to je nejsilnější důkaz, že
objednatel klikal správně, protože u par 3 se přímá a hraná vzdálenost
rovnají a žádný dogleg odchylku nevysvětlí.

### Jedna jamka neprošla: St Andrews Old 14

Ověření v OSM ukázalo, že **green sedí** (v OSM leží green 12 metrů od
zadaného bodu), ale **odpaliště je 415 m od něj**, zatímco čtrnáctka měří
561 m. Nejbližší odpaliště k tomu zadanému je v OSM 1 metr daleko, takže
objednatel klikl na skutečné odpaliště — jen na jiné.

**Vysvětlení: Old Course má dvojgreeny.** Čtyřka a čtrnáctka sdílejí jeden
green. Zadané odpaliště je téměř jistě odpaliště **čtyřky** (480 yardů =
439 m, což ke 415 m přímé vzdálenosti sedí). Souřadnice odpaliště se proto
do karty nezapsala; green ano.

> **Poučení: u hřiště se sdílenými greeny nestačí ukázat na green — je
> potřeba ukázat na odpaliště té správné jamky.** Nenapadlo mě na to
> objednatele předem upozornit, přestože Old Course sdílí sedm greenů
> a obě jamky z něj jsou ve sbírce.

### Dvě jamky na hraně

**Ballybunion Old 11** (−20 %) a **Mid Ocean 5** (−22 %) jsou obě jamky,
kde velký dogleg takovou odchylku vysvětlit může — Ballybunion vede podél
útesů, Mid Ocean je Cape s diagonálním odpalem přes jezero. Nezamítám je,
ale ani nepotvrzuji: rozhodne až žebřík odpališť z OSM při kreslení karty.
V kartách je to napsané.

### Stav prohlížeče

Během ověřování se karta prohlížeče opakovaně zasekla i na malých výřezech.
St Andrews je hustě zastavěné město, takže i výřez 300 × 300 metrů má
megabajty dat. Platí pravidlo z Kroku 24, jen ještě přísněji: **u hustých
lokalit jeden dotaz na jednu kartu a kartu pak zavřít.**

## Krok 28 — Pebble Beach a Riviera: co šlo a co ne (23. 8. 2026)

Poslední pokus o cestu 2 (odměření oficiálního diagramu) u dvou karet, které
měly ze skupiny C největší naději.

### Pebble Beach 18 — částečný zisk

Resort zveřejňuje **oficiální scorecard v PDF**
(`pebblebeach.com/content/uploads/PebbleBeach-Scorecard.pdf`). Odtud je teď
v kartě **pět odpališť** — Gold 541, Blue 531, White 531, Green 454, Red 454
yardů — a stroke index 5. Dosud karta znala jen tři historické délky
(1919, 1922 a turnajovou z US Open).

Turnajových 543 yardů z US Open zůstává jako samostatný záznam. **Není to
rozpor** s resortními 541 — je to jiné rozestavení odpališť.

**Geometrie se nezměnila:** scorecard dává délky, ne vzdálenosti k bunkrům
ani rozměry greenu.

### ProVisualizer — zastaveno vědomě

Databáze `provisualizer.com` má u Pebble Beach přesně to, co bych
potřeboval: měřené vzdálenosti k hazardům po jamkách. Jenže **yardage charts
jsou přístupné až po zaškrtnutí souhlasu s podmínkami užití.** Souhlas
s podmínkami za objednatele odklikávat nebudu — to je jeho rozhodnutí, ne
moje.

Nezávisle na tom by to stejně byl slabý pramen: web sám v podmínkách
upozorňuje, že jeho satelitní podklady bývají „i rok nebo více staré" a že
je nutné je před použitím ověřit. Karta opřená o takový zdroj by musela
nést stejnou výhradu.

### Riviera 10 a 6 — geometrie ne, ale pramen ano

Riviera je soukromý klub a plánek jamky nezveřejňuje. Oficiální
hole-by-hole průvodce **The Genesis Invitational** potvrzuje jen délky
(jamka 10 par 4 / 315 yardů, jamka 6 par 3 / 199 yardů) — polohy bunkrů ani
rozměry greenu neuvádí.

**U šestky je to přesto zisk.** Karta stojí na bunkru uvnitř greenu a
v Kroku 15 jsem k ní musel napsat, že Thomase k téhle jamce necituje žádný
dostupný pramen. Teď má turnajový web klubu doslova „island bunker
positioned perfectly in the center [of] the two-tiered putting surface".
Potvrdil se popis, ne čísla — geometrie zůstává schematická.

U desítky jsem do pramenů zapsal výslovně, že se ověřovalo a nic se nenašlo,
aby to příště nikdo nezkoušel znovu.

### Kde tím skupina C končí

| karta | co dál |
|---|---|
| Zbraslav 1, Albatross 15, Ostravice 16, Slapy 14 | hotovo z klubového plánku |
| Pebble Beach 18 | délky doplněny, geometrie bez pramene |
| Riviera 6, Riviera 10 | pramen potvrzuje popis, čísla neexistují |
| Augusta 13, Sawgrass 17, St Andrews 7 a 14 | diagram se nezveřejňuje nebo neobsahuje vzdálenosti |
| Cypress Point 16, Sand Hills 1, Woking 4, Ballybunion 11, Mid Ocean 5, Dobrouč 3 | soukromé kluby bez publikovaného plánku |

**Cesta 2 je vyčerpaná.** Dál se skupina C posune jedině dvěma souřadnicemi
na jamku ze satelitní mapy — tedy cestou, která z karty rovnou udělá
skupinu A.

> **Poučení: než začneš pramen používat, přečti si jeho vlastní výhrady.**
> ProVisualizer sám říká, že jeho data můžou být rok stará a je nutné je
> ověřit. To z něj nedělá špatný web, ale dělá to z něj špatný pramen pro
> kartu, která tvrdí, že kreslí podle zaměření.

## Krok 27 — Strojová kontrola konzistence našla systematickou chybu (23. 8. 2026)

Pokračování Kroku 26. Lov na další oficiální diagramy vynesl málo, zato
**kontrola, kterou jsem mohl udělat kdykoli za poslední týden, našla vadu
v pěti kartách najednou.**

### Lov na diagramy — hubený

- **Augusta 13:** masters.com per-hole diagram nezveřejňuje, jen flyover.
  Tahle karta se cestou 2 zpřesnit nedá.
- **Sawgrass 17:** oficiální článek PGA Tour dává jen turnajová čísla
  (délky kol 146 / 128 / 146 / 130 yardů, průměry skóre, počty míčů do vody),
  žádné rozměry greenu ani ostrova.
- **St Andrews 7 a 14:** oficiální průvodce The Open uvádí u sedmičky
  Shell Bunker „přibližně 310 yardů od tee" — jenže **karta ho tam už měla**,
  i se stejnou citací. Rešerše kartu jen potvrdila. U čtrnáctky průvodce
  vzdálenosti k bunkrům neuvádí vůbec.

### Kontrola, která zabrala

Napadlo mě ověřit něco, co nepotřebuje žádný vnější pramen: **souhlasí
délka jamky nakreslené na plánu s délkou, kterou tatáž karta uvádí?**

Nejde jen o přímou vzdálenost — u doglegu je hraná délka delší, takže se
musí počítat **délka oblouku osy fairwaye** (kvadratická Bézierova křivka
z `fairway.ohyb`). Po přepočtu vyšlo:

| karta | oficiálně | nakresleno | rozdíl |
|---|---|---|---|
| Ballybunion Old 11 | 432 m | 381 m | **−12 %** |
| Pinehurst No. 2 jamka 5 | 538 m | 480 m | **−11 %** |
| Sand Hills 1 | 502 m | 460 m | **−8 %** |
| Riviera 10 | 288 m | 270 m | **−6 %** |
| TPC Sawgrass 17 | 129 m | 121 m | **−6 %** |

U Sawgrass je to **par 3**, kde dogleg rozdíl vysvětlit nemůže.

**Proč to vadí:** plán, který jamku zkracuje o desetinu, zkracuje se stejným
činitelem i všechny vzdálenosti, které z něj student odečte — polohu bunkrů
i dopadovou zónu. Karta pak sama sobě protiřečí: v hlavičce tvrdí 538 metrů
a v kresbě jich má 480.

**Oprava:** všechny podélné souřadnice (green, bunkry, hazardy, dopadová
zóna, `fairway.zacatek`) přenásobené činitelem tak, aby oblouk odpovídal
oficiální délce; boční polohy beze změny. Činitele 1,066 až 1,135. Každá
z pěti karet to má napsané v `tvary.poznamka`. **Po opravě nemá odchylku nad
5 % ani jedna z osmnácti parametrických karet.**

### A při tom se našla chyba v kreslítku

Kontrola popisků odhalila, že u Sawgrass 17 leží značka měřítka „200 m"
**mimo plátno**. Příčina byla v `js/platy.js`:

```
pocet: Math.max(2, Math.floor(nejdelsi / 100)), krokM: 100
```

`Math.max(2, …)` vynutil u krátké jamky druhou stometrovou značku — tedy
značku ZA greenem. Na jamce dlouhé 129 m to byla značka „200 m". Krok
měřítka se teď volí podle délky jamky (100 m nad 260 m, jinak 50 m, pod
120 m 25 m) a počet značek se z něj počítá, takže značka nikdy neleží dál,
než kam sahá jamka. Opravilo to i Karlštejn 14 (198 m), kde značka „200 m"
těsně přesahovala.

> **Poučení: nejlevnější kontrola není hledání nových pramenů, ale otázka,
> jestli si karta neprotiřečí sama se sebou.** Za sedmadvacet kroků jsem ji
> nikdy neudělal — a našla pět vadných karet a jednu chybu v kreslítku
> během několika minut. Stejného druhu byl i nález u Zbraslavi (green o 90 m
> vedle) a rozpor `tvary` × `poznamka` u Karlštejna 15 v Kroku 22.

**Ověřeno po opravě:** sbírka i lekce 7 bez chyb v konzoli, nula popisků
mimo plátno, a čísla cvičení v lekcích 5 a 6 se nezměnila (4,45 / 4,62 /
4,84 / 5,09 a 100 / 80 / 33 %).

## Krok 26 — Jak zpřesnit skupinu C (23. 8. 2026)

Objednatel se zeptal, jestli u patnácti schematických karet dokážu udělat
co nejpřesnější půdorys. Zkusil jsem dvě cesty; **jedna nefunguje a druhá ano.**

### Cesta 1 — dourčit jamku v OSM bez souřadnic od objednatele: NEFUNGUJE

Nápad byl hledat POJMENOVANÉ prvky. Nominatim je umí najít jménem a je
maličký, takže je to levné. Výsledek dotazů:

| dotaz | nalezeno |
|---|---|
| Mangrove Lake Bermuda | **ANO** — way 166121000, 9,6 ha |
| Rae's Creek Augusta | **ANO** — way 26250864 |
| Hell Bunker · Road Hole Bunker · Swilcan Burn · Church Pews | ne |

Slavné bunkry pojmenované nejsou. Vodní toky a jezera ano.

**Zkouška na Mid Ocean 5 ale ukázala, proč to stejně nestačí.** Kolem
Mangrove Lake leží greeny na OBOU stranách a obě linie odpaliště–green vodu
protínají, takže kritérium „hraje se přes jezero" jamku nerozliší. Nejlepší
kandidát (green way 1147093241, odpaliště 304 / 330 / 366 m) sedí na dvě ze
tří oficiálních délek, jenže zadní odpaliště 396 m v OSM není a druhé
nezávislé kritérium chybí. **Zastavil jsem to** — je to přesně situace, kdy
mě v Krocích 18 a 22 shoda čísel svedla ke špatnému závěru.

### Cesta 2 — odměřit oficiální klubový diagram: FUNGUJE

Metoda z Kroku 24 (Albatross 15) je opakovatelná a OSM vůbec nepotřebuje.
Použil jsem ji na **Zbraslav 1** a opravila tři chyby najednou:

1. **Green ležel na plánu ve 430 metrech, ačkoli jamka měří 520** — kresba
   zkracovala jamku o 90 metrů, tedy o 17 %.
2. **Karta měla jeden greenside bunkr, diagram ukazuje dva** (menší kulatý
   u levého konce greenu, velký členitý před greenem).
3. **Karta znala jediné odpaliště, diagram jich tiskne sedm**
   (520 / 489 / 450 / 450 / 421 / 303 / 250 m).

Navíc odsud pochází kóta 295 m z černého odpaliště k referenční čáře napříč
fairwayí, podle které je teď nastavená dopadová zóna, a potvrzení rozměrů
greenu 43 × 30 m.

**Čeho se metoda nedotkne:** boční polohy hazardů. Diagram Zbraslavi je
letecký snímek bez měřítka po stranách — na rozdíl od Albatrossu, kde
měřítko daly kótované vzdálenosti k bunkrům. Trestná oblast s červenými
kolíky vpravo a out of bounds vlevo se proto NEKRESLÍ, jen popisují: z čáry
kolíků se nedá určit šířka plochy.

### Co z toho plyne pro zbytek skupiny C

Cesta 2 je pomalá, ruční a jamku po jamce — ale funguje a nic k ní není
potřeba. Použitelná je všude, kde klub nebo turnaj zveřejňuje diagram
s vytištěnými čísly. Nadějní kandidáti: Augusta 13 (masters.com), TPC
Sawgrass 17, Pebble Beach 18, St Andrews 7 a 14 (Links Trust). Naopak
u soukromých klubů (Cypress Point, Sand Hills, Woking, Ballybunion) se
diagram nejspíš nenajde.

> **Poučení: „zpřesnit" neznamená jen „dohledat souřadnice". U karty, která
> stojí na cizím plánku, bývá největší zisk v tom PŘEČÍST TEN PLÁNEK
> POŘÁDNĚ — u Zbraslavi ležel green o 90 metrů vedle a nikdo si toho čtyři
> kroky nevšiml.**

## Krok 25 — Audit doloženosti všech dvaceti karet (23. 8. 2026)

Objednatel se zeptal, jestli jsou už všechny jamky „pořádně zaměřené".
Projel jsem proto strojově všech dvacet karet a roztřídil je podle toho, o co
se jejich geometrie skutečně opírá. **Odpověď je ne — zaměřené jsou dvě.**

| úroveň | karet | které |
|---|---|---|
| **A — ze skutečných zaměřených obrysů** (polygony z OSM) | 2 | Karlštejn 14, Karlštejn 15 |
| **B — odečtené z oficiálního klubového plánku** | 3 | Albatross 15, Ostravice 16, Slapy 14 |
| **C — schematické** (vysvětlují princip, neměří se z nich) | 15 | zbytek |

**Uvnitř skupiny B je Albatross 15 nejsilnější** — jako u jediné karty se
podařilo měřítko nezávisle zkontrolovat (green vyšel 411 m proti oficiálním
412). Ostravice a Slapy mají čísla odečtená z plánku, ale bez takové kontroly.

**Skupina C není totéž co „vymyšlené".** U několika karet oficiální diagram
existuje a opravil konkrétní věci (Zbraslav 1, Pebble Beach 18 v Kroku 12),
ale geometrie na plátu zůstala schematická. Každá z těch patnácti karet to
říká v první větě `tvary.poznamka` slovy „schematické, ne přesný půdorys".
**Ověřeno strojově: žádná z dvaceti karet není bez téhle poznámky.**

### Dvě nesrovnalosti, které audit našel

1. **`karlstejn-14` má GPS na úrovni areálu, přestože je kreslená ze
   zaměřených obrysů.** Karta má polygony z OSM, ale pole `gps` zůstalo od
   Kroku 11 na souřadnicích resortu (49.92193 / 14.17166), zatímco sesterská
   `karlstejn-15` má od Kroku 22 souřadnice jednotlivé jamky. **Doplnit** —
   znamená to znovu najít v OSM green G5 a západní řadu odpališť.
2. **„Ověřená GPS" u šestnácti karet znamená úroveň hřiště, ne jamky.**
   Souřadnice jamky má zatím jediná karta (Karlštejn 15). Formulace v poli
   `presnost` to u každé karty říká, ale při zběžném pohledu na seznam to
   splývá — proto sem.

> **Poučení: „doloženo" má u téhle sbírky nejmíň tři různé úrovně a je
> potřeba je pojmenovat, jinak z toho v souhrnu vznikne dojem, že je
> zaměřené všechno.**

## Krok 24 — Proč přestal fungovat prohlížeč (23. 8. 2026)

### Příznaky

Uprostřed Kroku 23 přestaly fungovat `javascript_tool` i snímkování obrazovky.
`javascript_tool` hlásil `CDP sendCommand "Runtime.evaluate" timed out after
45000ms on tab … The renderer may be frozen or unresponsive`, snímkování
`Failed to deserialize params.clip.scale`. Vypadalo to na rozbité rozšíření.

### Příčina — moje vlastní

**Nebylo rozbité rozšíření, ale karta prohlížeče, kterou jsem zavařil sám.**
Při průzkumu pokrytí patnácti hřišť jsem pustil `Promise.all` nad sedmi
souběžnými dotazy na `openstreetmap.org/api/0.6/map` a každou odpověď hnal
přes `DOMParser` do plného DOM.

Změřeno až potom: **jeden takový výřez má 4 až 8 MB XML** (Albatross 3,9 MB,
Woking 8,2 MB). Sedm najednou je 30–50 MB textu a k tomu DOM strom několikrát
větší. Renderer to položilo a od té chvíle už karta neodpověděla na nic —
včetně snímkování, protože to jde přes tentýž renderer.

### Oprava

Zavřít zaseknuté karty (`tabs_close_mcp`), vytvořit novou
(`tabs_context_mcp` s `createIfEmpty: true`; pozor, po zavření poslední karty
zanikne i skupina a `tabs_create_mcp` pak hlásí chybu) a ověřit triviálním
skriptem. Rozšíření bylo celou dobu v pořádku.

> **Poučení — pravidla pro práci s OSM z prohlížeče:**
> 1. **Nikdy `Promise.all` nad více staženími mapy.** Jeden dotaz po druhém,
>    s krátkou pauzou.
> 2. **Nepoužívej `DOMParser`, když stačí spočítat.** Regulární výraz nad
>    textem odpovědi spotřebuje zlomek paměti — počty prvků se dají získat
>    přes `matchAll(/<tag k="golf" v="([a-z_]+)"/g)`.
> 3. **Když je potřeba geometrie, drž výřez malý** (0,004–0,008°) a zpracuj
>    jedno hřiště na jednu kartu.
> 4. **Po těžké práci kartu zavři.** Zaseknutá karta shodí i snímkování.

### Co se díky opravě hned doplnilo

**Souřadnice areálů přes Nominatim** (funguje z prohlížeče, z kontejneru je
zakázaný v `robots.txt`): Woking 51.30493 / −0.59823 · Albatross 49.99505 /
14.19337 · Old Course St Andrews 56.35191 / −2.81621. Cypress Point Nominatim
nenajde ani teď.

**Tím se opravila i stará karta:** `st-andrews-old-7` měla GPS označenou jako
NEOVĚŘENOU od Kroku 11. Teď ověřená je.

**A potvrdilo se, jak nebezpečné je hádat:** moje odhady, které jsem do
skriptu zkusil dát, byly u Wokingu **1,2 km** a u Albatrossu **2,3 km** vedle.
Kdybych je použil jako bbox, vyšlo by „hřiště není zmapované". Je to přesně
ta chyba z Kroku 17, jen o jednu úroveň dřív.

**Zmapování obou nových hřišť** (dřív neprověřené): Woking 22 greenů, 42
odpališť, 49 bunkerů · Albatross 21 greenů, 89 odpališť, 55 bunkerů. Obě jsou
tedy převeditelná, jakmile objednatel určí green.

### Odměření klubového plánku Albatrossu 15

Tohle v Kroku 23 selhalo kvůli témuž zaseknutí. Teď hotovo — a je to nejlepší
doklad, jaký zatím která česká karta má kromě Karlštejna.

Postup: obrázek `albatross.cz/images/jamky/jamka15.png` (500 × 800) načten do
`<canvas>` (stejný původ, takže `getImageData` projde), pixely klasifikované
na písek a vodu, souvislé oblasti nalezené průchodem do šířky.

**Měřítko dal plánek sám:** jsou na něm kótované dvě vzdálenosti ke středovým
bunkrům, 200 m a 262 m z černého odpaliště. Z nich vyšlo 2,32 px/m.
**KONTROLA:** při tomhle měřítku leží střed greenu 411 m od odpaliště proti
oficiálním 412 m. Měřítko tedy sedí a vzdálenosti podél jamky jsou doložené.

Odsud pocházejí nové polohy: bližší středový bunkr 200–218 m, vzdálenější
236–258 m, bunkr vpravo před greenem 371–398 m, vlevo 396–412 m, dlouhý
bunkr za greenem kolem 447 m.

**A hlavně nález, který text klubu neuvádí:** na plánku je **vodní plocha po
levé straně mezi 320. a 374. metrem**. Oficiální popis jamky o ní mlčí.
Nejspíš právě ona dělá levou („kratší") cestu tak úzkou, jak klub píše.
Karta ji teď kreslí a ten rozpor přiznává.

**Jedno místo, kde jsem měření nepoužil:** boční polohu obou středových
bunkrů. Plánek nezobrazuje odpaliště, takže osu fairwaye nedovoluje určit
přesně, a při doslovném přenesení vycházely bunkry na pravý okraj stuhy —
zatímco klub výslovně píše, že velkorysá je pravá strana. Kreslím je proto
kousek vlevo od osy a v `tvary.poznamka` je to napsané.

**Chyba, kterou to odhalilo:** poprvé jsem dal `fairway.ohyb` zápornou
hodnotu, protože klub píše „dogleg doleva". Bunkry pak vypadly mimo fairway.
**U doglegu DOLEVA se stuha vyklání DOPRAVA od přímé linie odpaliště–green**,
protože hráč hraje ven doprava a teprve pak se stáčí doleva na green — přesně
ta geometrie, kterou jsem rozebral u Karlštejna 15 v Kroku 22. Znaménko
`ohyb` tedy NENÍ směr doglegu, ale strana, na kterou se vyklání stuha.

## Krok 23 — Lekce 7: Kam hazard patří (22. 8. 2026)

Sedmá lekce ze sedmnácti, postavená stejným vzorem jako 4–6, plus **tři nové
karty jamek** (sbírka 17 → 20) a **pět nových pojmů** ve slovníčku (57 → 62).

### Co lekce učí a proč zrovna tohle

**Lekce 1 už interaktivní plát „Kam patří bunkr" má** — student v ní klepnutím
umístí bunkr, pustí sto hráčů a dostane verdikt trest / strategie / dekorace.
Lekce 7 to tedy nesmí opakovat. Zjistil jsem to až při psaní, a zachránilo to
lekci před tím, aby byla jen delší verzí něčeho hotového.

Lekce 1 řeší **jak daleko od odpaliště**. Lekce 7 bere zbylé dva rozměry:

1. **Kam napříč fairwayí** (sekce 1) — a to je věc, kterou lekce 1 vůbec
   neřeší.
2. **Ke které ráně v pořadí** (sekce 4) — hazard nepatří jamce, ale konkrétní
   ráně, a u každého hráče jiné.

### Sekce 1 — plát „Stejný písek, jiná otázka"

Tři varianty jedné jamky se **stejným množstvím písku ve stejných
vzdálenostech**; mění se jen poloha napříč. Čísla se **nesimulují, počítají
se analyticky** z rozptylu odpalu (dvourozměrné normální rozdělení,
`sigLong` × `sigLat`): podíl je součin dvou pravděpodobností, průměrná
odchylka chycené rány je střední hodnota useknutého normálního rozdělení.

Výsledek, kvůli kterému plát existuje:

| varianta | do písku (HCP 0 … 24) | průměrná odchylka chycené rány |
|---|---|---|
| u okrajů | 19,8 / 23,2 / 16,0 / 6,9 % | **18,7 m od osy** |
| uprostřed | 31,0 / 28,9 / 18,1 / 7,5 % | **7,9 m od osy** |
| za dopadem | 0,00 % u všech | — |

**Stejný písek, ale u kraje chytá rány skoro dvacet metrů od osy, uprostřed
rány osm metrů od osy.** To je celá lekce ve dvou číslech: bunkr u kraje
trestá nepovedené rány, bunkr uprostřed se ptá povedených.

### Sekce 4 — simulace, která vyšla jinak, než jsem čekal

Par 5 s příčným bunkrem 99 m před greenem (jediné doložené číslo z karty
St Andrews 14 — Hell Bunker leží 108 yardů před greenem). Dvě strategie:
hráč hazard bere na sebe, nebo před něj pokaždé položí. 1500 kol na
kombinaci, semínko `rng(7700 + i*10)`.

**Co vyšlo dobře:** komu hazard patří. HCP 0 do něj dopadne v **50 %** kol a
vždycky **druhou** ranou. HCP 9 ho potká ve **2 %** — jeho druhá rána končí
před ním a třetí ho přeletí. HCP 18 a 24 ho řeší až **třetí** ranou, hráč 24
v **29 %** kol. Jeden hazard, čtyři různé role. Přesně to, co má lekce učit.

**Co nevyšlo:** rozdíl mezi „přeletět" a „položit" je 0,02–0,03 rány, tedy
**pod hranicí šumu**, kterou si karta sama stanovila na 0,05. Příčina je v
modelu: `LEZENI.bunkr` dává fairwayovému bunkru jen horší rozptyl (1,6×) a
kratší dosah (0,75×), ne ztracenou ránu. Z bunkru 85 m od greenu se pořád
dohraje na green.

**Neopravoval jsem to.** `LEZENI` pochází ze zadání (část 8) a je sdílené se
všemi ostatními lekcemi — přepsat ho kvůli jedné lekci by tiše změnilo čísla
v lekcích 4, 5 i 6. Místo toho **závěr sekce říká nahlas, že se model a
skutečnost rozcházejí, a proč**: skutečný Hell Bunker má stěnu, ze které se
hraje do strany, a to model neumí. Z výsledku se tedy smí číst „komu hazard
patří", ale ne „layup je zbytečný".

> **Poučení: když simulace vyjde jinak, než měla, je to buď nález, nebo vada
> modelu — a rozdíl mezi tím se musí napsat do textu, ne zamést pod koberec.**
> Tady je to obojí: nález (komu hazard patří) i vada (cena za bunkr).

### Tři nové karty

**Woking 4 (Anglie).** Místo, kde středový bunkr vznikl — John Low a Stuart
Paton, 1901. Klub sám na své stránce o architektuře mluví o „(v té době
kontroverzním) zavedení středových fairwayových bunkerů na 4. jamce", takže
klíčový fakt má primární pramen. **Co karta netvrdí:** kdo navrhl původní
hřiště a v kterém roce klub vznikl — ani jedno se mi ověřit nepodařilo.
Délka je 352 yardů podle National Club Golfer proti 350 podle Golf Club
Atlas; karta rozdíl přiznává a POZOR — stránka National Club Golfer v době
psaní vracela 404, takže její obsah ověřený není, jen titulek z vyhledávání.

**St Andrews Old 14 („Long").** Vybraná kvůli dvěma doloženým vzdálenostem:
Beardies začínají 240 a končí 285 yardů od odpaliště, Hell Bunker leží 108
yardů před greenem. To jsou přesně ta čísla, na kterých stojí sekce 4. Je to
druhá jamka z Old Course ve sbírce (vedle sedmičky) — vědomě, protože žádná
jiná jamka nemá rozmístění hazardů tak dobře zdokumentované.

**Albatross 15 (Česko).** Keith Preston, 2009. Klub publikuje popis, ve kterém
doslova stojí: **„2 bunkery uprostřed dělí fervej na levou a pravou část."**
To je Wokingův princip o 108 let později na českém hřišti — a je to páteř
sekce 3. Délky 412 / 390 / 364 / 327 / 296 m a S.I. 11 jsou z klubu.

### Co se nepovedlo a je to otevřené

1. **Plánek Albatrossu jsem neodečetl.** Klub grafiku jamky zveřejňuje
   (`albatross.cz/images/jamky/jamka15.png`), ale prohlížeč, kterým obrázky
   prohlížím, v době psaní přestal reagovat — snímkování obrazovky i
   `javascript_tool` opakovaně vypršely. Polohy bunkrů na kartě jsou proto
   odhad podle textu, ne měření. **Je to první věc, kterou u téhle karty
   doplnit.**
2. **GPS všech tří nových karet je NEURČENÁ.** Nominatim je z prostředí
   zakázaný v `robots.txt`, Wikipedie je „cache-only", a prohlížeč nefungoval.
   Karty to říkají výslovně místo toho, aby si souřadnice vymyslely.
3. **Albatross v OpenStreetMap jsem neprověřil** — ze stejného důvodu. Kdyby
   zmapovaný byl, mohla by být třetí kartou kreslenou ze skutečných obrysů.

### Pasti, které to odhalilo

- **Nová lekce potřebuje z předchozího slovníku zkopírovat celý sdílený
  boilerplate**, ne jen sekce: `nav.dalsi/predchozi/krok/dalsiLekce/
  konecKurzu/klavesniNapoveda`, `toc.zacit/pokracovat`, `temata.*`,
  `zkouska.pasmo.*` a `zkouska.souhrn.*`. Bez nich spadne KAŽDÁ stránka
  lekce na `Cannot read properties of undefined (reading 'replace')` —
  chyba se přitom neprojeví na `index.html`, takže se dá snadno přehlédnout.
- **`zkouska.pasmo` je ale text VLASTNÍ lekci.** Zkopírovaný z lekce 6
  gratuloval studentovi ke green komplexům a posílal ho na lekci 7. Zjistilo
  se to až proklikáním celé zkoušky Playwrightem — statická kontrola klíčů
  by to nenašla, protože klíč existoval a nebyl prázdný.
- **Zkouškové otázky se musí klikat s čerstvým lokátorem** — po každé volbě
  se `#zQuiz` překreslí a dřív získané `elementHandle` přestanou být v DOM.
- **Popisek u prvku, kolem kterého se tlačí tečky simulace, se nekreslí.**
  U příčného bunkru v sekci 4 se „99 M PŘED GREENEM" překrývalo s dopady;
  odstranil jsem popisek, ne tečky (pravidlo z Kroku 9 — zkracuj nebo ruš
  text, prvky neposouvej).
- **Dva pásy písku 1 m od osy vypadají jako jeden bunkr.** Posunul jsem je na
  3 m, aby mezi nimi byla vidět tráva; čísla se tím posunula z 5,9 na 7,9 m
  odchylky, verdikt zůstal stejný.

### Ověřeno před dodáním

Playwright přes lokální server: **všech 8 stránek lekce 7 česky i anglicky —
nula chyb v konzoli, nula nevyplněných překladových klíčů.** Proklikány
všechny tři varianty plátu v sekci 1 i všichni čtyři hráči v sekci 4. Celá
zkouška vyplněná správnými odpověďmi dává 100/100 a hlásí správné pásmo.
Rozcestník, sbírka (20 karet), slovníček a zkouška lekce 6 bez chyb.

**Regrese ověřena:** lekce 6 sekce 1 dává pořád 100 / 80 / 33 % a praporek 2
pro HCP 0 pořád 36 %; lekce 5 při nulové odvaze pořád 4,45 / 4,62 / 4,84 /
5,09. Nic z toho se nezměnilo.

## Krok 22 — Karlštejn 15 ze zaměřených dat (22. 8. 2026)

**Druhá karta kurzu kreslená ze skutečných obrysů.** `karlstejn-15.json` má
`tvary.obrys` s polygony greenu, čtyř odpališť, rybníka Voškov a sedmi
bunkerů z OpenStreetMap (ODbL).

### Co to odemklo

Jedna věta od objednatele: *„voškov je severně od greenu 15ky, ale odpaliště
jsou těsně nad voškovem, je to ostrý dogleg."* V Kroku 21 jsem hledal rybník
**vedle** koridoru a žádný nenašel. Ve skutečnosti leží rybník **přímo mezi
odpalištěm a greenem** a odpaliště stojí na jeho severním břehu — nejbližší
13 metrů od vody.

### Jak se to ověřilo (tři nezávislá kritéria)

1. **Poloha odpališť** — řada čtyř ploch na severním břehu Voškova, přesně
   jak to popsal objednatel.
2. **Délky** — přímé vzdálenosti odpaliště–green z OSM jsou 260 / 241 / 223 /
   202 m proti oficiálním 315 / 290 / 264 / 223 m. Rozdíl 55 / 49 / 41 / 21 m
   je právě to, co u doglegu přidává hra kolem ohybu — a **monotónně klesá
   směrem k předním odpalištím**, která leží blíž ohybu. Tenhle klesající
   trend by u náhodně vybrané řady odpališť nevyšel; je to samostatný důkaz.
3. **Klubový diagram** (`grafika-15.jpg`), prohlédnutý přímo — stejné pořadí
   odpališť (přední jsou vpravo vpředu), stejný diagonální tvar rybníka,
   stejné rozmístění bunkerů. Diagram nakonec rozhodl i o tom, které bunkery
   jamce patří: dva na vnější straně ohybu (v OSM 96 m vpravo od osy) na něm
   jsou, kdežto shluk dál vpravo (138–169 m) už patří sousední jamce.

### Rozpor „vlevo nebo vpravo", který mě dvakrát zdržel

Rybník je **obojí** a záleží, proti čemu se měří:

- Proti **přímé linii odpaliště–green**, tedy tak, jak se kreslí plán, leží
  Voškov **vpravo** (a přímá linie ho protíná).
- Proti **skutečné dráze hry**, která jde od odpaliště na západ kolem rybníka
  a pak se ostře stáčí doleva, leží Voškov **vlevo**.

Hráč vnímá druhé, plán ukazuje první. Obě tvrzení byla po celou dobu pravdivá
a já je proti sobě stavěl jako protiklad.

> **Poučení: než z rozporu „vlevo/vpravo" usoudíš, že jedna strana lže, ptej
> se, PROTI ČEMU každá strana měří.** U doglegu se přímá linie a dráha hry
> rozcházejí o desítky stupňů, takže si protiřečí, i když se oba popisy
> shodují se skutečností.

### Chyba v kartě, kterou to opravilo

Parametrická verze měla rybník na **opačné** straně, než ve skutečnosti leží —
a **vlastní poznámka téže karty přitom správně uváděla**, že podle klubového
diagramu je rybník po pravé straně fairwaye. Karta si tedy protiřečila
sama se sebou a nikdo si toho patnáct kroků nevšiml, protože se kontroloval
text proti pramenům, ne text proti číslům v témže souboru.

> **Poučení: rozpor mezi `tvary` a `poznamka` v jednom souboru je stejná
> chyba jako rozpor s pramenem — a nikdo ho nenajde, dokud se na to
> nepodíváme schválně.**

### Co se změnilo mimo kartu

- **`js/platy.js`** — `primaLinie` fungovala jen tehdy, když karta měla
  parametrický `tvary.green`. U karet kreslených z obrysů `tvary.green`
  neexistuje, takže se přímá linie nekreslila. Podmínka teď bere cíl
  i z `obrys.green`.
- **`data/preklady/lekce-04.json`** — sekce „česká jamka" mluvila o **dvou**
  bunkrech v zákrutě (jsou tři) a o bezpečné hře **vlevo** (bezpečně se hraje
  vpravo, jak říká i otázka na kartě). Obojí opraveno v češtině i angličtině.
- **`naCoSeDivat`** na kartě říkalo „sleduj stuhu fairwaye" — ta na plánu
  není. Přepsáno.

### Co v datech chybí a není nakresleno

1. **Fairway** — OSM pro tenhle koridor žádný polygon `golf=fairway` nemá.
   Plán ukazuje odpaliště, vodu, bunkery a green; mezi nimi je prázdný rough.
   Obkreslit fairway z klubového diagramu **nesmím** (zadání zakazuje
   obkreslovat cizí plánek), takže tam prostě není.
2. **Převýšení** — green je na kopci, ale změřená výška k dispozici není,
   takže karta nemá výškový profil.

**Je to rozhodnutí k přezkoumání:** plán bez fairwaye je chudší na pohled,
zato v něm není nic vymyšleného. Předchozí kresba měla fairway, ale rybník
špatně. Vyměnil jsem hezčí za pravdivější.

## Krok 21 — Karlštejn 15: neúspěšný pokus (22. 8. 2026)

> **PŘEKONÁNO KROKEM 22** — jamka se nakonec převést dala. Závěr „rybník
> v OSM není" byl špatný: hledal jsem vodu **vedle** koridoru, zatímco
> Voškov leží **přímo v něm**. Tenhle zápis zůstává kvůli poučení, které
> platí dál.

Objednatel potvrdil přiřazení greenů (15 = G15, 16 = G0, 17 = G3).

### Chyba v testu z Kroku 20, kterou to odhalilo (platí dál)

Podmínka kolinearity odpališť — bez které test vybírá špatné greeny —
**platí jen pro rovné jamky**. Patnáctka je dogleg, takže odpaliště
s greenem v přímce nejsou a test ji vyřadil. U par 3 (Karlštejn 14)
fungoval správně, a proto mě to nenapadlo.

**Poučení: test z `dev/osm-hledac-jamek.py` se smí použít jen na jamky,
u kterých se dá čekat rovná osa — typicky par 3.** U doglegů je potřeba
jiné kritérium.

### Proč jsem tehdy usoudil, že to nejde

Prověřil jsem obdélník 49.9225–49.9265 / 14.1700–14.1780 a našel jen dvě
pořádné vodní plochy — Poučník (7 874 m²) a Voškov (4 875 m²) — obě severně
od greenu patnáctky. Z toho jsem uzavřel, že rybník téhle jamky zmapovaný
není. **Chyba byla v tom, co jsem považoval za „u jamky":** hledal jsem
rybník lemující koridor, ne rybník ležící napříč ním.

> **Poučení: než prohlásíš prvek za chybějící, ověř, jestli ho nemáš přímo
> před sebou v jiné roli, než jakou jsi čekal.**

## Krok 20 — Pokus převést zbylé jamky automaticky: neprošlo (22. 8. 2026)

Objednatel řekl „udělej jen ty jamky, které najdeš v OSM". Zkusil jsem
najít metodu, která jamku určí bez lidské pomoci. **Nenašel jsem ji** —
a tohle je záznam, co všechno bylo vyzkoušeno, ať to nikdo nedělá znovu.

### Metoda, kterou jsem postavil

Hledat green, ke kterému vede „žebřík" odpališť odpovídající oficiálním
délkám z karty. Nástroj je v `dev/osm-hledac-jamek.py`.

**Sama shoda délek nestačí.** U kontrolní jamky (Karlštejn 14, o které
díky objednateli víme, že je to green G5) vybere test jako nejlepší
**G0** s odchylkou 0,7 m — zatímco správné G5 má 1,3 m. Mezi 58 odpališti
se ke kterémukoli greenu najdou čtyři v libovolných vzdálenostech.

**S podmínkou kolinearity** (všechna odpaliště musí ležet od greenu
v jednom směru, azimut do 12°) kontrola projde správně: G5 je jediný se
čtyřmi shodami (azimuty 85–87°), ostatní spadnou na tři. Test tedy funguje
jako síto.

### Jak dopadly jednotlivé jamky

- **Karlštejn 15** — nemá jednoznačného vítěze: nejlepší kandidát má jen
  tři shody ze čtyř, a je to jiný green (G17), než který určil objednatel.
  **Zůstává parametrická.**
- **Riviera 6** — s tolerancí 5 m nenajde nic, s 9 m jednoho kandidáta
  (182/156/124 proti oficiálním 182/160/132). Ověření selhalo: karta stojí
  na bunkru **uvnitř** greenu, a v OSM na celé Rivieře **žádný green bunkr
  uvnitř nemá** — mapaři ho nakreslili vedle. **Zůstává parametrická.**
- **Mid Ocean 5** — jediný kandidát, hezký žebřík (391/366/294 proti
  396/368/299), kolineární, délka jamky vyšla 392 m proti 396 m z karty,
  a i bunkry seděly (dvojice vpravo od greenu). Ale ověření podle vody
  selhalo: karta stojí na tom, že se hraje přes **Mangrove Lake**, a to
  v OSM v okruhu 900 metrů **není** — jediné vodní plochy jsou Trott's
  Pond (2,84 ha, ale 900 m daleko) a bezejmenný rybníček 0,5 ha.
  **OPRAVA (Krok 26, 23. 8. 2026): tenhle závěr byl ŠPATNĚ.** Mangrove Lake
  v OpenStreetMap je — způsob `way 166121000`, 9,6 ha, souřadnice
  32.32563 / −64.70841. Nenašel jsem ho proto, že jsem hledal v okruhu
  900 metrů kolem souřadnice hřiště z karty, a ta je od jezera **1,5 km**.
  Byla to tedy stejná chyba jako v Kroku 17: hledání ukotvené na
  nepřesném údaji. Najít ho šlo jednou otázkou na Nominatim.
  **Poučení: než prohlásíš pojmenovaný prvek za nezmapovaný, zeptej se na
  něj Nominatimu jménem — ne bboxem kolem něčeho jiného.**
  Bez jistoty, že ta voda je ta správná, jsem převod neudělal.
  **Zůstává parametrická.**
- **Pinehurst 5, Augusta 13, Pebble Beach 18, TPC Sawgrass 17** — karta
  u nich sice uvádí víc délek, ale jsou to délky z RŮZNÝCH DOB (Augusta
  498 m dnes, 466 m od roku 2002, 440 m ve 30. letech), ne současná
  odpaliště. Žebřík z nich sestavit nelze.
- **Ostravice 16, Dobrouč 3** — hřiště v OSM nejsou vůbec.
- **Slapy 14** — hřiště je zmapované, ale **bez jediného odpaliště**.

### Závěr, který z toho plyne

Jediná jamka kurzu, u které je identifikace jistá, zůstává **Karlštejn 14** —
a byla jistá jen proto, že ji určil člověk, který hřiště zná, a navíc
pojmenoval rybník, což odhalilo, že jsem si vybral špatnou řadu odpališť.

**Automat na to nestačí a hádat se nesmí.** Špatně přiřazený polygon by
kartu tiše proměnil ve lež — a to je horší než dnešní zjednodušení, které
karta poctivě přiznává.

**Nejlevnější cesta, jak to odemknout:** ke každé jamce dvě souřadnice —
střed greenu a zadní odpaliště, odečtené ze satelitní mapy. Určí jamku
jednoznačně a zaberou minutu. Zbytek je pak strojová práce.

## Krok 19 — Průzkum pokrytí v OSM a proč hromadný převod nejde (22. 8. 2026)

Objednatel řekl „předělej ty jamky". Zkusil jsem to a **zastavil jsem se
po jedné**. Tady je proč, ať to příště nikdo nezkouší znovu naslepo.

### Pokrytí OpenStreetMap u hřišť, na která máme karty

Měřeno v okruhu zhruba 500 m od ověřených souřadnic klubu, počty prvků:

| hřiště | green | tee | bunkr | fairway | voda | rough |
|---|---|---|---|---|---|---|
| TPC Sawgrass | 38 | 46 | 95 | 14 | 24 | 15 |
| Prague City Zbraslav | 15 | 69 | 64 | 15 | 6 | 8 |
| Karlštejn | 12 | 54 | 75 | 11 | 4 | 0 |
| Pinehurst No. 2 | 30 | 16 | 109 | 11 | 7 | 2 |
| Mid Ocean | 14 | 40 | 77 | 18 | 1 | 0 |
| Riviera | 19 | 45 | 51 | 6 | 12 | 0 |
| Augusta National | 27 | 31 | 44 | 2 | 4 | 13 |
| Pebble Beach | 26 | 14 | 47 | 7 | 1 | 3 |
| Sand Hills | 9 | 25 | 55 | 4 | 0 | 78 |
| Ballybunion | 13 | 36 | 29 | 16 | 0 | 0 |
| Golf Park Slapy | 12 | **0** | 24 | 12 | 3 | 2 |
| **Ostravice** | **0** | **0** | **0** | **0** | 1 | 0 |
| **Golf Dobrouč** | **0** | **0** | **0** | **0** | 2 | 0 |

Ostravice a Dobrouč nejsou zmapované vůbec, Slapy nemají odpaliště.
U zbytku jsou data bohatá — problém je jinde.

### Skutečná překážka: OSM neví, která jamka je která

Prvky nemají `ref` ani jméno. Zkoušel jsem tři automatické podpisy a ani
jeden nestačil:

1. **Shoda délek odpališť.** U Karlštejna 14 vyšla nádherně — a vedla mě
   ke špatné řadě odpališť (viz Krok 18). Kolem jednoho greenu bývají dvě
   řady a obě dají „žebřík".
2. **Bunkr uvnitř greenu** (Riviera 6, jednoznačný architektonický podpis).
   Prošel jsem všech 19 greenů Riviery — **ani jeden neobsahuje bunkr**.
   Mapaři ho nakreslili vedle, ne dovnitř.
3. **Ostrovní green** (TPC Sawgrass 17). Greenů obklopených vodou z více
   než 84 % je tam **čtyři**, s plochami 199, 477, 477 a 506 m². Skutečná
   sedmnáctka má 363 m². Žádný jednoznačně nevyhrává.

Karlštejn 15 se nepodařilo ověřit ani s pomocí objednatelova přiřazení
greenu: odpaliště v okolí netvoří žebřík odpovídající oficiálním délkám
223 / 264 / 290 / 315 m. Karta proto zůstává parametrická.

### Co z toho plyne pro další postup

**Převádět se dá jen jamka, u které je identifikace jistá** — a tou je
zatím jen ta, kde ji potvrdil člověk, co hřiště zná (Karlštejn 14).
Automaticky to nejde a hádat se nesmí: špatně přiřazený polygon by kartu
tiše proměnil ve lež, což je horší než dnešní přiznané zjednodušení.

Tři schůdné cesty, kdyby se v tom pokračovalo:

- **Doplnit `ref` do OpenStreetMap.** Kdo hřiště zná, může jamkám v OSM
  dopsat čísla. Je to práce pro komunitu, ale pak by šel převod udělat
  automaticky pro celé hřiště naráz — a prospělo by to i ostatním.
- **Identifikace po jedné jamce člověkem**, jako u Karlštejna 14.
  Realistické u českých hřišť, ne u Augusty.
- **Vizuální spárování s klubovou mapou** — pracné a u každé jamky
  znovu.

Do té doby platí: **parametrická kresba není provizorium, je to poctivé
zjednodušení**, které karta přiznává. Skutečné obrysy jsou lepší tam, kde
se dají ověřit — a nikde jinde.

## Krok 18 — Karlštejn 14 ze zaměřených dat, a chyba, kterou odhalil objednatel (22. 8. 2026)

**První karta kurzu kreslená ze skutečných obrysů.** `karlstejn-14.json` má
nově `tvary.obrys` s polygony greenu, čtyř odpališť, tří bunkrů a rybníka
Poučník z OpenStreetMap (ODbL). Parametrická data v kartě zůstala, ale
kreslítko je odteď u téhle jamky ignoruje.

### Dvě věci, které to odemklo

**Data si stahuju sám.** Overpass je z prostředí zakázaný, ale
`openstreetmap.org/api/0.6/map?bbox=…` funguje a jde zavolat z prohlížeče
objednatele. Vrací XML se všemi prvky ve výřezu; uzly se rozřeší podle
`nd ref` a přepočtou do metrů. **Od Kroku 18 se po objednateli nemusí chtít
žádné exporty** — stačí vědět, které hřiště.

**Rozšířený dotaz už nebyl potřeba.** Rybníky Poučník i Voškov jsou
otagované `natural=water` **i** `golf=water_hazard`, takže je původní dotaz
`nwr[golf]` zachytil. Chyba nebyla v tagu.

### Chyba, kterou jsem udělal, a jak se našla

Kolem greenu 14 jsou **dvě řady odpališť** — jedna východně, druhá západně.
Obě jsou zhruba v jedné přímce s greenem. Vybral jsem tu východní, protože
její vzdálenosti (119,6 / 146,4 / 174,5 / 201,5 m) seděly na **všechny čtyři**
oficiální hodnoty (119 / 145 / 173 / 198). Jenže z té strany vycházel rybník
**vlevo** a osmdesát metrů od linie, což odporovalo klubové grafice.

Došel jsem až k hypotéze, že je klubové schéma zrcadlené — a byl bych
opravil kartu, která byla celou dobu správně. Zachránila to jedna věta od
objednatele: *„rybník na té jamce se jmenuje Poučník."*

Západní řada odpališť dává vzdálenosti 101 / 119 / 144 / 172 m — tři z nich
sedí na oficiální hodnoty na **jeden metr** (119, 145, 173), čtvrtá je navíc
(krátké odpaliště 101 m) a mistrovské odpaliště 198 m v OSM zmapované není.
A hlavně: z téhle strany leží **Poučník po celé pravé straně jamky**, přesně
jak to kreslí klub. Zbylo tedy jediné konzistentní řešení a karta byla
správně.

**Poučení, které si beru dál:** shoda čtyř čísel vypadá průkazně, ale je to
jen jedno kritérium. Když druhé kritérium (na které straně leží hazard)
odporuje, nesmí se prohlásit za vítěze to první — musí se hledat řešení,
kde sedí obojí. A na hřišti, které někdo zná, je jedna jeho věta rychlejší
než hodina geometrie.

### Co karta přiznává

`tvary.poznamka` říká, že plán začíná u odpaliště 173 m, protože mistrovské
198 m v OSM není — plán je tedy o pětadvacet metrů kratší než délka, kterou
karta uvádí jako aktuální. Dál přiznává, že šest pin pozic a terasy greenu
jsou výškový rozdíl, který půdorys nezobrazí, a že rough kolem jamky
v OSM zmapovaný není.

### Co zbývá u dat

Fairway ani rough u téhle jamky v OSM nejsou (u par 3 fairway ani být
nemusí). U delších jamek bude potřeba rozhodnout, jestli okolí dokreslovat
z `golf=rough`, nebo nechat prázdný papír jako staré perokresby. Mapování
dalších devíti jamek Karlštejna od objednatele je v
`dev/osm-jamky-karlstejn.json`.

## Krok 17 — Skutečné obrysy z OpenStreetMap: pilot (22. 8. 2026)

Bod 8 doplňku zadání (polygony místo parametrů) se rozjel. Tenhle krok je
zatím **pilot, ne dodávka do obsahu** — žádná karta jamky se nezměnila.

### Co se povedlo

**Export z OSM funguje.** Dotaz přes relaci hřiště (`rel(4046214);
map_to_area->.a;(nwr[golf](area.a););out geom;`) vrátil pro Karlštejn
**267 prvků**: 126 bunkrů, 58 odpališť, 20 greenů, 14 fairwayí, 2 vodní
hazardy, 37 cest. Přepočet zeměpisných souřadnic do metrů a otočení do
soustavy jamky (počátek v zadním odpališti, x kladně vpravo, y podél osy
hry) je v `dev/`.

**Přiřazení jamek udělal objednatel** — OSM u prvků nemá čísla jamek
(`ref` je prázdný u všech 267) a geometrické testy daly vždycky víc
kandidátů. Mapování je v `dev/osm-jamky-karlstejn.json`: deset jamek,
z toho obě, ke kterým máme karty.

**Ověření, které tomu dalo váhu.** U jamky 14 vycházejí vzdálenosti
odpališť od greenu v OSM **119 / 144 / 172 / 201 m** proti oficiálním
klubovým **119 / 145 / 173 / 198 m**. Rozdíl do tří metrů, což je přesně
to, co se čeká mezi měřením ke středu greenu a vzdáleností mezi těžišti
polygonů. U jamky 15 sedí 223 a 264 m proti klubovým 223 a 264 m.
**Nezávisle se tím zároveň potvrdila karta jamky 14** — klubová grafika
`grafika-14.jpg` udává par 3, HCP 6/5, délky 198/173/145/119 a green
19 × 35 m se šesti pin pozicemi, tedy přesně to, co karta tvrdí od Kroku 10.

**Kreslítko umí polygony.** `vykresliJamku()` má novou větev: když karta
nese `tvary.obrys` (green, odpaliště, fairway, bunkry, voda jako pole bodů
v metrech), kreslí se z nich; když ne, jede se po staré parametrické cestě.
Obojí prochází `hladkaCesta()`, protože body z OSM jsou vzorky obrysu, ne
rohy. Ukázka je v `dev/osm-test.html` — vedle sebe tatáž jamka ze
skutečných dat a ze současných parametrů.

### Proč se to zatím nedodává do karet

**Rybníky v datech nejsou.** Dotaz `nwr[golf]` je nezachytil, protože se
vodní plochy obvykle značí `natural=water`, ne `golf=water_hazard` — proto
vyšly jen dva na celý areál a ani jeden z nich nepatří k jamce 14 nebo 15.
U jamky 14 je přitom rybník po celé pravé straně **to jediné, o čem ta
jamka je**. Karta ze skutečných dat bez něj by byla horší než dnešní
přiznaně zjednodušená.

Rozšířený dotaz pro příští export:

    [out:json][timeout:120];
    rel(4046214);map_to_area->.a;
    (
      nwr[golf](area.a);
      nwr[natural=water](area.a);
      nwr[waterway](area.a);
    );
    out geom;

**Druhá věc, která bude chtít rozmyslet:** par 3 nemá v OSM fairway (a
správně — žádnou nemá ani ve skutečnosti), takže plát ze samotných dat je
z velké části prázdný. Bude potřeba rozhodnout, jestli okolí greenu
dokreslovat z `golf=rough`, nebo nechat prázdný papír, jak to dělají staré
perokresby.

### Past, kterou tenhle krok odhalil jinde

Výřez pro první export jsem nadiktoval ze souřadnic ve vlastní kartě —
a ty byly označené jako „přibližné". Minul hřiště o 1,8 km a export vrátil
jediný prvek. Vedlo to k auditu souřadnic všech patnácti karet (viz dodatek
u Kroku 16), kde šest českých bylo posunutých o 0,5 až 3 km.
**Údaj označený jako přibližný se nesmí použít jako vstup pro něco, co má
být přesné.**

## Krok 16 — Nové zadání ke schématům reálných jamek (22. 8. 2026)

Objednatel poslal odkaz na samostatnou konverzaci, kde se zadání ke
schématům dohodlo. Plné znění je od teď v `zadani.md` jako „Doplněk
zadání — jak dělat schémata reálných jamek"; tady je, co z toho šlo udělat
hned, co ne a proč.

### Co jsem ověřil jako první

**Reálná data z OSM ani ČÚZK z téhle session nesehnu.** Overpass API je
přes `WebFetch` zakázané v `robots.txt` a stahovat obsah jinou cestou
(curl, python) pravidla prostředí nedovolují. Stejný závěr měla i ta druhá
konverzace. Bod 8 zadání (polygony místo parametrů) tedy zůstává otevřený
a data musí vyexportovat objednatel — návod je v `zadani.md`.

**Adaptér z bodu 8 se ukázal jako zbytečný.** Ta druhá konverzace ho
psala naslepo, bez `js/platy.js`, a proto v něm hádala, co znamená
`fairwayOsa()`, jestli `tvar()` bere poloosy nebo celé rozměry a kterým
směrem míří normála. V našem kódu ale `fairwayOsa()` **už polygony vrací** —
`geo.levy` a `geo.pravy` jsou pole bodů v metrech, ze kterých se stuha
kreslí. Adaptér parametry → polygony tedy v repozitáři existuje od Kroku 9,
jen se tak nejmenuje. Psát druhý by znamenalo zavést druhé místo, kde se
z týchž parametrů počítá tvar — a ta dvě místa by se dřív nebo později
rozešla.

### Co je hotové

- **Navržené tvary jsou hladké (body 2 a 3).** `blob()` a `blobPts()` mají
  teď jednu společnou definici rozvlnění (`vlnaObrysu()`), ze které vypadl
  nejvyšší harmonický člen (sin 7t) — ten dělal z navrženého tvaru chvějící
  se skvrnu — a amplituda se globálně tlumí koeficientem `TLUMENI = 0.55`.
  Obrys navíc prochází novou funkcí `hladkaCesta()`: Catmull–Romova křivka
  převedená na kubické Béziery. **Křivka prochází přesně zadanými body**,
  takže normály z `blobPts()` na ní pořád sedí a `radial()` se nerozjede.
  Tlumení je záměrně na jednom místě v kódu, ne přepsané v sedmnácti
  kartách — jinak by se to rozešlo při první nové kartě.
- **Rough má texturu, fairway je světlý koridor (bod 4).** Nová funkce
  `trsy()` rozsévá krátké obloučky trávy. Kreslí se NA PODKLAD, ještě před
  fairwayí, která je překryje — ořezávat je „všude kromě fairwaye" by
  chtělo masku a zbytečnou složitost. Podkladový rough zesílen z krytí 0,2
  na 0,42 a fairway je nově plně krytá.
- **Okraj fairwaye je organický, ale plynulý (bod 3).** Obrys stuhy vede
  přes `hladkaCesta()` místo lomené čáry.
- **Výškový profil (částečně bod 7).** Nová funkce `profilTerenu()` kreslí
  pod plánem proužek s převýšením — přesně to, co mají klubové plánky.
  Zapíná se polem `tvary.profil = {celkemM, zdroj}` a **kreslí se jen tam,
  kde je převýšení doložené**. Zatím ho má jediná karta: Ostravice 16
  (−27 m z klubového plánku). Šrafy sklonu a vrstevnice nekreslím vůbec —
  bez naměřených výšek by to byl vymyšlený terén.
- **Bod 6 (jedna geometrie pro všechny vrstvy) v našem kódu už platil.**
  `vykresliJamku()` spočítá `d` jednou a výplň, šrafura i obrys z něj
  čerpají. Zkontrolováno, ne domněnka.
- **Bod 5 (barva) taky platil** — paleta `--turf` / `--turf-d` / `--sand` /
  `--water` je akvarelový nádech přes perokresbu od redesignu.

### Co jsem vědomě neudělal

- **Perspektiva.** Vypadá dobře, ale mění boční měřítko podle vzdálenosti,
  a karty jamek tisknou po straně měřítko v metrech. Učebnice, která
  poctivě přiznává podélné zkrácení, si nemůže dovolit tiše zkreslit
  i šířku. Zapsáno do `zadani.md` jako bod 10 s označením, že je to moje
  rozhodnutí, ne zadání.
- **Šrafy sklonu a vrstevnice.** Viz výše — chybí data.
- **Polygony z OSM.** Viz výše — nedostupné.

### Past, kterou stálo za to ohlídat

Zadání výslovně varuje, že u interaktivních plátů lekcí 4, 5 a 6 čerpají
kresba i simulace ze stejných čísel, takže se smí měnit **jen vykreslení,
ne geometrie**. Změna `blob()` mění tvar kresby, ne testovací funkce
(`resolveLie`, `voda`, `naGreenu`), které pracují s analytickými elipsami.
Tlumení amplitudy navíc přiblížilo nakreslený tvar té analytické elipse,
takže se shoda kresby a fyziky **zlepšila**.

Ověřeno měřením, ne úvahou: po změně dávají všechna cvičení **totožná
čísla** jako před ní — lekce 5 optimum HCP 0 na 83 % odvahy s průměrem
4,19 rány, lekce 6 plocha greenu 100 % / 80 % / 33 % a praporek 2 pro
HCP 0 na 36 %. Celý web (52 stránek, lekce 1–6 plus rozcestník, sbírka
a slovníček) projet Playwrightem: nula chyb v konzoli.


### Dodatek — první pokus o data z OSM a audit souřadnic (22. 8. 2026 večer)

Objednatel vyexportoval z overpass-turbo první dávku dat pro Karlštejn.
Vrátila **jedinou** položku, a to `golf=cartpath`. Příčinu jsem našel hned:
**výřez, který jsem mu nadiktoval, hřiště minul.** Souřadnice jsem vzal
z vlastní karty jamky — jenže tam byly od začátku označené jako „přibližné,
úroveň areálu", což byl v praxi můj odhad. Golf Resort Karlštejn leží podle
OpenStreetMap na 49.92193, 14.17166 (relace 4046214, poštovní adresa Běleč
u Litně), tedy asi 1,8 km jihozápadně od místa, které karta uváděla.

**Poučení, které stálo za tu ostudu:** údaj označený jako „přibližný" se nesmí
použít jako vstup pro cokoli, co má být přesné. Buď se ověří, nebo se
nepoužije.

Rovnou jsem proto proauditoval souřadnice **všech patnácti karet** proti
OpenStreetMap (Nominatim). Výsledek:

- **Šest českých karet bylo posunutých o 0,5 až 3 km** — Slapy o 3,0 km,
  Zbraslav o 3,1 km, Ostravice o 2,6 km, oba Karlštejny o 1,8 km, Dobrouč
  o 0,5 km. Opraveno.
- **Devět zahraničních karet** bylo blíž (0,1–2,2 km; nejhorší Mid Ocean),
  ale i tak opraveno.
- **Dvě karty se ověřit nepodařilo:** St Andrews Old 7 a Cypress Point 16 —
  Nominatim ani jeden klub pod jménem nenajde (u Cypress Pointu vrací
  shodou jmen ulici v Georgii, u Old Course obchod se suvenýry). Jejich
  souřadnice zůstávají odhadem a karta to teď **výslovně přiznává** místo
  mírného „přibližné".

Pole `gps.presnost` u ověřených karet nově říká, že je ověřeno proti
OpenStreetMap. Je to drobnost, ale je to přesně ten druh drobnosti, na které
stojí důvěryhodnost celé učebnice.

**Co z toho plyne pro data ke schématům:** správný dotaz nemá stát na
hádaném výřezu, ale na samotné relaci hřiště:
`[out:json][timeout:90];rel(4046214);map_to_area->.a;(nwr[golf](area.a););out geom;`
Podle vykreslení OSM to navíc vypadá, že Karlštejn má zmapované **bunkry
a vodní plochy, ale ne fairwaye a greeny** — takže reálný zisk bude přesná
poloha hazardů, ne kompletní obrysy. Potvrdí to až export.

## Krok 15 — Lekce 6: Green komplexy + sjednocení konců řádků (22. 8. 2026)

Zadání uživatele: „pokračuj další lekcí, sjednoť konce řádků." Dvě věci
v jedné dávce.

### Sjednocení konců řádků (a co se přitom ukázalo)

Pracovní strom v uživatelově složce měl u 42 textových souborů CRLF,
zatímco `HEAD` má LF. Převedl jsem je přes `device_bash`
(`tr -d '\r' < f > /tmp/x && cat /tmp/x > f` — `sed -i` v mountu selže,
protože přejmenovává přes unlink) a přidal `.gitattributes`
s `* text=auto eol=lf` plus výslovným `binary` u obrázků a písem, aby se
to nevrátilo.

**Nález, který stojí za zapamatování:** `git status` v té složce hlásil
jako změněné i binární soubory (woff2 fonty, jpg fotky). Vypadalo to jako
poškozená binárka, ale `md5sum` proti `git show HEAD:soubor` ukázal, že
obsah je bit po bitu stejný. Příčina je **zapomenutý `.git/index.lock`**:
git nemůže zapsat obnovený index, takže stat cache zůstává neplatná a
všechno se tváří jako změněné. Po převodu hlásí `git diff --stat HEAD`
„109 files changed, 0 insertions(+), 0 deletions(-)“ — tedy nula
skutečných změn. Zámek musí smazat uživatel; cloudová session v mountu
mazat nesmí.

### Nové karty jamek (sbírka 14 → 17)

- **`pinehurst-2-5.json`** — green, který míč odmítá. Klíčové číslo celé
  lekce pochází z Golf Club Atlas a je to jediný nalezený pramen s rozpadem
  plochy greenu podle spádu: 184 m² pod 3 % (pinovatelných), 83 m² mezi
  3 a 4 %, ale **272 m² nad 4 %**, kde se míč neudrží. Z ~540 m² je tedy
  použitelná zhruba třetina.
  **Nález, který jsem málem přehlédl:** vypouklé („turtleback“) greeny se
  automaticky připisují Rossovi, ale architekt Richard Mandell doložil, že
  dnešní přehnaná vypouklost vznikla nejspíš až na přelomu 60. a 70. let,
  kdy byly okraje greenů sraženy buldozerem. Karta i lekce to říkají takhle:
  kontury NA greenu jsou Rossovy, prudké spády KOLEM nich přibyly po něm.
  Zajímavé je, že Coore & Crenshaw při restauraci 2010–11 greeny samy
  nepřestavěli — měnilo se jen okolí.
- **`riviera-6.json`** — bunkr uvnitř greenu. Kreslicí kód to zvládá bez
  úprav, protože `js/platy.js` kreslí bunkry AŽ NAD greenem (past z Kroku 9,
  která se tady vyplatila). Nejsilnější doklad je statistika: jamka hraje
  2,842, tedy **pod par**, a je teprve 13. nejtěžší z osmnácti — ale 61 birdie
  a 21 bogey ze 240 kol. Architektonický záměr je vidět v rozptylu, ne
  v průměru; lekce to takhle formuluje.
  **Past, do které jsem skoro spadl:** při čtení Golf Club Atlas se mi jako
  „Thomasův citát" nabízela věta „Only an extremely confident and secure
  designer would dare to build such a hole." To je skoro jistě text autora
  recenze, ne architekta — Thomas by o sobě sotva napsal, že jen extrémně
  sebejistý architekt by takovou jamku postavil. Karta proto výslovně říká,
  že **žádný dostupný pramen Thomase k téhle jamce necituje**.
- **`slapy-14.json`** — česká jamka. Rešerše prošla weby zhruba dvaceti
  českých klubů a hledala ne slávu jamky, ale **klub, který zveřejňuje
  plánek se schématem greenu**. Takových je málo: Slapy (celý birdie book
  jako obrázkové stránky), Albatross, Karlštejn, Čertovo břemeno, Greensgate,
  Ypsilon. Vyhrály Slapy, protože klub o jamce 14 sám píše, že „každá ze
  šesti pin pozicí má svou terasu" — a birdie book to potvrzuje green
  18 × 31 m se šesti očíslovanými praporky. Stránka birdie booku odpovídá
  číslu jamky + 5 (jamka 14 = strana 19), ověřeno srovnáním sousedních
  stránek.

Žádná ze tří jamek nemá volně licencovanou fotografii — Pinehurst ani
Riviera na Commons jamku jednoznačně určenou nemají a u Slap žádná fotka
není. Karty proto fotku nemají.

### Co obsahuje lekce 6

**Sekce 1 — „Velký green, malý cíl".** Tentýž obrys greenu (elipsa
15 × 11 m, ~516 m²) se třemi různými výškovými funkcemi. Použitelná plocha
se **nezadává, počítá se**: plán se navzorkuje po půl metru, v každém
vzorku se numericky spočítá spád a sečte se plocha vzorků pod 3 %.
Výsledky: mírný spád 100 %, dvě patra 80 %, vypouklý green **33 %** — což
je skoro přesně to, co uvádí Golf Club Atlas o pátém greenu Pinehurstu.
Tmavší plocha na obrázku je přesně ta spočítaná, šipky ukazují spádnici.

**Sekce 2** — Pinehurst 5 (odmítá), Sand Hills 1 (sbírá, jediná recyklovaná
karta — a sedí, protože její green leží v přirozené prohlubni), Riviera 6
(dělí).

**Sekce 3** — Slapy 14.

**Sekce 4 — „Kam se míč skutálí".** Par 3 se skutečným green komplexem:
vypouklý green, sběrná prohlubeň vlevo, bunkr vpravo. Čtyři polohy praporku
× čtyři hráči × 1500 ran = 24 000 simulovaných ran při načtení stránky.
Rozptyl rány je z `js/simulace.js`, **doběh po dopadu je nový model**
postavený pro tuhle lekci (viz pasti níž).

Výsledek, kvůli kterému cvičení existuje: mezi nejlehčím a nejtěžším
praporkem ztratí HCP 0 asi 21 procentních bodů zásahů greenu (36 % → 15 %),
zatímco HCP 24 jen asi 5 (20 % → 15 %). **Poloha praporku dělá s jamkou
víc u přesného hráče než u nepřesného** — protože jeho rány letí těsně
kolem cíle, takže o jejich osudu rozhoduje právě to, co u praporku leží.
To je nečekané a je to hlavní pointa sekce.

**Sekce 5–7** — tři otevřené otázky, sedm pojmů (slovníček 50 → 57), šest
otázek za 100 bodů (proklikáno, správné odpovědi dávají 100/100).

### Rozhodnutí a pasti z tohohle kroku

- **Model doběhu míče je nový a musí se přiznat.** `js/simulace.js` umí
  rozptyl rány, ne doběh po dopadu. Napsal jsem proto jednoduchý model:
  míč má po dopadu zásobu doběhu v metrech, každý půlmetr ho stojí půl
  metru zásoby a svah mu ji přidává úměrně své prudkosti. Nad kritickým
  spádem (5,5 %) se zásoba neztrácí a míč se valí dál — to je ta hranice,
  za kterou se na rychlém greenu míč neudrží. Poznámka pod cvičením to
  říká výslovně: **není to fyzika, je to zjednodušení.**
- **Bez náhody v doběhu vznikne prstenec.** První verze měla pevnou zásobu
  doběhu, a všechny míče, které opustily green, dojely přesně do stejné
  vzdálenosti — na plánu z nich byl nepřirozený kruh teček kolem greenu.
  Řešení: zásobu losovat pro každou ránu (0,55–1,55 násobek), přidat malý
  úhlový šum do směru valení a mimo green zvýšit tření (1,7×, delší tráva).
  Teprve pak vypadá rozptyl teček jako rozptyl.
- **Kreslicí geometrie a fyzika musí vycházet z JEDNÉ výškové funkce.**
  V sekci 4 se z `vyska(x, y)` počítá jak spád pro valení, tak šipky
  spádnice v kresbě. Kdyby se rozešly, student by viděl míč odjíždět do
  kopce.
- **Parabola je na vypouklý green špatná funkce.** První pokus měl
  `h = -C·u²`, jenže parabola má prudký spád hned od středu a pinovatelných
  vyšlo pár procent. Čtvrtá mocnina (`-C·u⁴`) dá uprostřed plošinku a spád
  rostoucí až k okraji — to je to, co „turtleback" ve skutečnosti je.
- **Popisky ve zkouškových miniaturách se nevejdou.** viewBox miniatury je
  120 jednotek široký a `.lab.sm` je na něj velké písmo: „MÍČ V BUNKRU"
  přeteklo přes oba okraje. Do miniatur patří nanejvýš jedno krátké slovo.
- **U karet jamek pokračuje pravidlo z Kroku 14: zkratky co nejkratší.**
  U Pinehurstu se „SBĚRNÁ PLOCHA" tlačila s „GREEN" a „FAIRWAY BUNKR"
  s „DOPADOVÁ ZÓNA" — vyřešeno zkrácením a vypnutím jednoho popisku
  (`zkratka: null`), ne posouváním prvků.
- **Hluboký green potřebuje `tvary.zkraceni`.** Slapy 14 má green 18 × 31 m,
  ale při výchozím zkrácení 0,55 vyšel skoro kulatý — tedy v přímém rozporu
  s textem karty. Nastaveno 0,75 / maxPomer 1,7 (stejný postup jako
  u Karlštejna 14 v Kroku 10).

### Ověřeno před dodáním

Playwright přes lokální server: všech osm stránek lekce 6 plus rozcestník,
sbírka jamek a slovníček, česky i anglicky — nula chyb v konzoli. Proklikané
všechny tři povrchy v sekci 1 (100 % / 80 % / 33 %), všechny čtyři praporky
a všichni čtyři hráči v sekci 4, celá zkouška se správnými odpověďmi
(100/100, uloženo do `routing.vysledky`). Datum v `data/verze.json` podle
`date -u`.

## Krok 14 — Lekce 5: Riziko a odměna, kalibrace pokušení (22. 8. 2026)

Uživatel řekl „pokračuj lekcí 5–9" a na doplňující otázku zvolil dvě věci:
lekce dodávat **po jedné s review** a u každé **rozšířit sbírku o nové
reálné jamky**, ne jen recyklovat těch deset stávajících. Tenhle krok je
tedy lekce 5 plus tři nové karty jamek.

### Nové karty jamek (sbírka 11 → 14)

- **`augusta-national-13.json` (Azalea, par 5)** — případ, kdy klub sázku
  po devadesáti letech *překalibroval*. Doložená čísla: 545 yd / 498 m od
  Masters 2023 (dřív 510 yd / 466 m), přidáno 35 yardů na pozemku
  odkoupeném od Augusta Country Club v roce 2017. Čtyři bunkry výhradně
  ZA greenem (tři nezávislé prameny), žádný fairwayový bunkr, přítok
  Rae's Creek po celé levé straně a napříč před greenem.
  **Nejdůležitější nález a zároveň nejzajímavější pointa lekce:**
  prodloužení průměrné skóre NEZVEDLO — 2022 (kratší verze) 4,85, 2023
  (delší verze) 4,74. Změnila se struktura rozhodování: průměrný odpal
  vyskočil ze zhruba 270 na téměř 300 yardů a jamka byla poprvé od roku
  2013 nejtěžším ze čtyř par 5 v Augustě. Karta i lekce to říkají takhle
  a netvrdí, že je jamka „těžší".
  Vědomě NEPOUŽITO, i když se to nabízelo: titulek Golf Digestu „13. jamka
  hraje nejtěžší za 50 let" (2025) stojí jen na průměru z prvního kola
  (5,03); za celý týden vyšlo 4,83, tedy daleko od rekordu 5,04 z roku
  1976. Nepoužit ani údaj o Nicklausově prohlubni z roku 1983 (jediný
  zdroj) a přesná stránka Jonesova citátu v *Golf Is My Game* (vydání se
  v pramenech uvádí jednou 1959, jednou 1960).
- **`mid-ocean-5.json` (The Cape, par 4)** — archetyp odstupňované sázky.
  Klíčový mechanismus i doslovná formulace pochází z Golf Club Atlas:
  čím blíž k vodě odpal skončí, tím rovnější postoj a lepší úhel.
  Macdonaldova původní definice Cape hole (Golf Illustrated, srpen 1914)
  mluví o GREENU obklopeném vodou ze tří stran, ne o odpalu — karta to
  uvádí přesně takhle, protože moderní „Capes" (Pebble 18, Sawgrass 18)
  tuhle podmínku nesplňují.
  **Co se nepodařilo dohledat a co karta proto netvrdí:** žádný veřejný
  pramen neuvádí carry v yardech pro jednotlivé linie odpalu ani zbývající
  vzdálenost na green podle míry ukrojení. Klub yardage book online nemá.
  Rovněž nenalezeny rozměry greenu a přesný počet bunkrů (doložená je jen
  „dvojice bunkrů" pod svahem vpravo od greenu). Rozpory ponechané
  přiznané: délka 433 vs. 435 yardů, převýšení 90 stop vs. pokles 50 stop,
  rok otevření 1921 / 1923 / 1924, Babe Ruth 1937 vs. 1938.
- **`ostravice-16.json` (par 5, HCP 14)** — česká jamka. Poučení z Kroku 10
  („u českých jamek rovnou hledej birdie book, ne scorecard agregátor")
  se tentokrát uplatnilo předem: rešerše šesti kandidátů (Ostravice 16,
  Albatross 6/15/17, Greensgate 3, Mstětice 10) vybírala kromě čistoty
  principu i podle toho, jestli klub zveřejňuje **skutečný plánek jamky**.
  Ostravice ano — `https://www.ostravice-golf.cz/images/hriste/mapy/jamka-16.jpg`.
  Plánek jsem si otevřel v prohlížeči a schéma kreslil podle něj: tvar
  fairwaye, bunkr vpravo v zóně druhé rány, malé bunkry vlevo v dopadové
  zóně, potok napříč předpolím, rybníček vpravo od greenu, green 23 × 30 m
  a výškový profil −27 m.
  **Co jsem z plánku vědomě NEinterpretoval:** obsahuje dvě různé řady
  čísel — barevné bloky (jednoznačně vzdálenost od každého z pěti odpališť
  k příčné linii) a bílé kolonky s čísly 18, 96, 108, 135, 146 a 225.
  U bílých kolonek jsem nedokázal spolehlivě určit, co měří (na
  vzdálenost k greenu nesedí: 522 − 353 = 169, ale nejbližší kolonka
  ukazuje 146), a proto z nich karta neuvádí ani jedno číslo. Radši
  prázdné místo než vymyšlený údaj.

Žádná ze tří jamek nemá volně licencovanou fotografii — u Augusty kvůli
striktnímu režimu klubu (veškerý obrazový materiál je komerčně
licencovaný), u Mid Oceanu kvůli soukromému režimu klubu, u Ostravice se
prostě žádná nenašla. Karty proto fotku nemají a text to nepředstírá.
**Otevřená možnost:** požádat Ostravici e-mailem o svolení k použití
jedné fotky jamky 16 — u českých klubů to má smysl zkusit, stejně jako
u Karlštejna (Krok 11).

### Co obsahuje lekce 5

Stejný sedmisekční vzor jako 1–4.

**Sekce 1 — „Tři čísla, která rozhodují o sázce".** Vlastní ilustrativní
plát s přepínačem tří variant a spočítanou „sázkovou kartou" (cena prohry
/ odměna / šance → čistý zisk). Zásadní rozhodnutí o designu plátu, ke
kterému jsem se dopracoval až po dvou přepsáních: **ve všech třech
variantách je stejná fairway, stejný green a stejné dvě linie — mění se
JEN rybník.** První verze měnila i polohu odvážného cíle, takže se
současně hýbalo odměnou i rizikem a nešlo poznat, co za co může. Odměna
je teď ve všech třech stejná (0,45 rány) a liší se jen šance a cena
prohry. Verdikt pod tabulkou se počítá z čísel (práh ±0,12 rány), ne
píše ručně, takže text nemůže tvrdit něco jiného než aritmetika nad ním.

**Sekce 2** — tři nové/staré karty: Augusta 13 (překalibrovaná sázka),
Mid Ocean 5 (odstupňovaná sázka), TPC Sawgrass 17 (sázka, která žádnou
gradaci nenabízí — jediná recyklovaná karta, a schválně: je to
protipříklad).

**Sekce 3** — Ostravice 16, s pointou „i bezpečná cesta musí něco stát"
(bunkr v layup zóně).

**Sekce 4 — „Kolik vody přeletíš?"** Skutečná simulace přes
`js/simulace.js`: jamka typu Cape, sedm poloh posuvníku (0–100 % odvahy),
čtyři hráči (HCP 0/9/18/24), **1500 kol na každou kombinaci** = 42 000
odehraných jamek při načtení stránky (~150 ms). Výstup: plán s mrakem
120 skutečných dopadů odpalu (červeně ty ve vodě), tabulka čtyř hráčů,
**kalibrační křivka** (průměr ran proti míře odvahy, kolečko na optimu)
a seznam optim.

Výsledek, kvůli kterému celé cvičení existuje — optimum se posouvá
monotónně s rozptylem hráče: HCP 0 → 83 % odvahy, HCP 9 → 50 %,
HCP 18 → 17 %, HCP 24 → 17 %. Jedna jamka, čtyři různé správné odpovědi.

**Sekce 5–7** — tři otevřené otázky, sedm pojmů, šest otázek u zkoušky
(dvě obrázkové, 100 bodů; ověřeno proklikáním, správné odpovědi dávají
100/100 a ukládají se do přehledu).

### Rozhodnutí a pasti z tohohle kroku

- **Náhoda v simulaci je nasazená semínkem** (`rng(9000 + i*10 + hcp)`
  z `platy.js`), ne `Math.random`. Lekce 4 používá `Math.random` a čísla
  se tam mění mezi návštěvami. Tady je to jinak schválně: student si má
  moct čísla s někým porovnat a učebnice o nich může mluvit. V textu
  sekce je to přiznané.
- **Šum modelu se musí přiznat.** Mezi 0 % a 17 % odvahy vychází HCP 24
  rozdíl 0,01 rány — to je šum, ne zjištění. Poznámka pod cvičením proto
  říká, že rozdíly pod ~0,05 rány se nemají číst jako výsledek. Bez toho
  by tabulka tvrdila přesnost, kterou model nemá.
- **Geometrii testu ležení a geometrii kresby drž v JEDNĚCH číslech.**
  Jezero v sekci 4 je natočená elipsa popsaná středem, jednotkovým směrem
  dlouhé osy a dvěma poloosami; táž definice slouží pro `voda()` (a tedy
  simulaci) i pro `blob()` v kresbě. Kdyby se rozešly, student by viděl
  červenou tečku mimo nakreslenou vodu.
- **Natočený tvar snese jen STEJNÉ měřítko obou os.** V sekci 4 je proto
  `S = 1,25` pro x i y (žádné podélné zkrácení). V sekci 1, kde je jamka
  bez natočených tvarů, zkrácení je (3,2 : 1,35), jinak by z 300metrové
  jamky zbyl nečitelný proužek.
- **Fairway kresli jako koridor, ne jako obdélník.** První verze sekce 4
  měla hratelnou plochu definovanou obdélníkem (`y ∈ ⟨30,290⟩`,
  `x ∈ ⟨−105,42⟩`) — bylo to jednoduché, ale plán vypadal jako zelená
  bedna s kaluží, ne jako jamka. Druhá verze měla mnohoúhelník, který
  vyšel po vyhlazení jako ovál kolem jezera (fairway i tam, kde se
  nehraje). Teprve třetí verze kopíruje levým okrajem pravý břeh jezera:
  koridor vede zprava kolem vody a nad jejím cípem se otáčí ke greenu.
  Mnohoúhelník je zároveň testem ležení (paprskový test), takže kresba
  a fyzika pořád sedí.
- **Popisky u karet jamek: čím kratší, tím líp.** U Ostravice se
  „BUNKRY V DOPADOVÉ ZÓNĚ" přetlačovalo s automatickým popiskem
  „DOPADOVÁ ZÓNA" a u Augusty „ČTYŘI BUNKRY ZA GREENEM" s „POTOK PŘED
  GREENEM". Řešení bylo zkrátit (`4 BUNKRY VZADU`, `POTOK`,
  `BUNKRY VLEVO`), ne posouvat prvky.
- **Dogleg: `ohyb` posouvá stuhu daleko od hazardu.** U Augusty i
  Mid Oceanu vyšla první verze tak, že mezi fairwayí a vodou zela
  třicetimetrová mezera, ačkoli obě jamky vodu lemují. `ohyb` je boční
  posun ŘÍDICÍHO bodu Bézierovy křivky, takže se stuha vyklene zhruba na
  polovinu té hodnoty — se zmenšením na 46 a posunem hazardu o 10 m
  k ose to sedlo. Pravidlo pro příští karty: po nakreslení se vždycky
  podívej, jestli hazard leží tam, kde ho prameny popisují *vůči
  fairwayi*, ne jen na správné straně jamky.
- **Opravená stará chyba mimo lekci:** `prehled/index.html` počítal souhrn
  výsledků natvrdo z lekcí 1–3 (`p.lekce >= 1 && p.lekce <= 3`) a text
  v rozcestníku říkal „ze 3 lekcí". Po lekci 4 to už neplatilo a nikdo si
  toho nevšiml. Teď se bere `CELKEM_LEKCI_HOTOVO` a v textu je `{celkem}`.

### Ověřeno před dodáním

Playwright přes lokální server: všech osm stránek lekce 5 plus rozcestník,
sbírka jamek a slovníček, v češtině i angličtině — nula chyb v konzoli.
Proklikané všechny tři varianty plátu v sekci 1 (verdikt se mění správně:
+0,32 / −0,01 / −0,65 rány), všech sedm poloh posuvníku a všichni čtyři
hráči v sekci 4, celá zkouška se správnými odpověďmi (100/100, uloženo do
`routing.vysledky`). Datum v `data/verze.json` podle `date -u`, ne podle
odhadu (past z Kroku 12).

## Krok 13 — Lekce 4: Jak šířka vytváří úhel (21. 8. 2026)

Zadání uživatele: „udělej lekce 4-9, táhni autem obsahu, co mají lekce
pokrývat, jak jsi navrhoval." Rozhodl jsem se to nedělat najednou — po
prostudování lekce 1 (bespoke SVG pláty) a lekce 2/3 (sdílené moduly
`spolecne.js`/`simulace.js`) je zřejmé, že každá lekce potřebuje vlastní
rukou kreslenou grafiku a vlastní interaktivní cvičení srovnatelné
hloubky, ne jen přeskládaný text. Šest lekcí najednou by buď přesáhlo
rozumný rozsah jedné dodávky, nebo by vyšlo uspěchaně. Místo toho:

1. Navrhl jsem obsahovou osu lekcí 4–9 (viz níže) a
2. postavil lekci 4 celou, se stejnou kontrolou kvality jako lekce 1–3
   (cíle, zapamatuj si, cvičení, zkouška, slovníček, aktualizace
   rozcestníku a centrálního slovníčku).

Lekce 5–9 budou následovat jako samostatné dodávky ve stejném duchu.

### Obsahová osa lekcí 4–9

- **4 — Jak šířka vytváří úhel.** Diagonální hazardy, bezpečná vs.
  odvážná strana fairwaye, úhel náběhu na green. Přímé pokračování
  filozofie jamky z lekce 1 („strategická jamka" tam byla jen nálepka,
  tady se vysvětluje mechanismus).
- **5 — Riziko a odměna: kalibrace pokušení.** Kdy je hazard správně
  „drahý" a kdy je to jen loterie — velikost sázky vůči velikosti odměny.
- **6 — Green komplexy.** Kam se míč skutečně skutálí, ne kde je
  vlajka — spády, false front, terasy, run-off zóny.
- **7 — Umístění hazardů.** Teorie carry/cross/framing hazardů —
  vizuální zastrašení vs. skutečná obtížnost.
- **8 — Vzorové jamky (template holes).** Redan, Cape, Biarritz,
  Punchbowl a další recepty, které cestují po světě už přes sto let.
- **9 — Vyvážení kola.** Distribuce parů, délek a směrů na osmnácti
  jamkách — přirozeně navazuje na routing z lekce 3 a je to logický
  bod pro průběžné hodnocení podle témat (zadání to už předjímalo:
  „souhrnPoznamka" v rozcestníku slibuje rozbor po deváté lekci).

### Co lekce 4 obsahuje

Sekce 1 (plát): ilustrativní schéma jamky s přepínačem bezpečná/odvážná
strana — stejná geometrie (fairway, bunkr v zákrutě, bunkr před greenem)
jako v sekci 4, jen bez simulace. Sekce 2: karty Riviera 10, St Andrews
Old 7, Ballybunion Old 11 (existující data, beze změny). Sekce 3:
Karlštejn 15 — bunkry v zákrutě z Kroku 12 sem sedí přesně, protože
trestají jen odvážnou linii. Sekce 4: skutečná simulace přes
`js/simulace.js` (`odehrajKolo`) pro HCP 0 a HCP 24 z obou stran
fairwaye, sto kol na stranu, spočítané jednou při načtení stránky (ať
přepínání nemění čísla pod rukama) — tabulka výsledků plus textový
verdikt, komu se riziko vyplatilo. Sekce 5–7: reflexe, sedm nových
pojmů, šest otázek u zkoušky (dvě obrázkové).

Doplňkově aktualizováno: `js/sekce-nav.js`
(`CELKEM_LEKCI_HOTOVO` 3 → 4), `data/preklady/rozcestnik.json` (nová
položka lekce 4, „Lekce 1–4 z 18", počet pojmů 38 → 43),
`data/preklady/slovnik-pojmu.json` (5 nových pojmů — Cape hole,
Diagonální hazard, Half-par hole, Line of charm, Úhel náběhu — a
doplněné `kde: [4]` u tří znovupoužitých pojmů: Riziko a odměna,
Koridor, Approach), `data/verze.json`.

**Zjednodušení, které stojí za přiznání:** hole geometrie v sekci 1 a 4
(fairway, poloha bunkrů, tvar greenu) je vymyšlená pro účel cvičení, ne
převzatá z konkrétní reálné jamky — na rozdíl od karet ve sbírce
(`data/jamky/*.json`), kde je každý údaj dohledaný a citovaný. Tady jde
o ilustraci principu, ne o popis existujícího místa, a text to nikde
netvrdí jinak.

## Krok 12 — Schémata reálných jamek podle birdie booků/yardage booků (21. 8. 2026)

Zadání: „zkus najít birdie karty/strokesaver těch hřišť a v nich najdi tu danou
jamku a zkus ji co nejvěrněji přenést do schématu" — pro všech 10 jamek
v obecné sbírce (mimo karlstejn-14, tu už birdie book měla z minula).

### Metoda a limity, které stojí za přiznání

Deset paralelních rešerší (jedna na jamku) hledalo skutečné yardage-book/
birdie-book/strokesaver stránky nebo aspoň dimenzované plánky, ne jen
prózu. Výsledek byl nerovnoměrný a je důležité říct proč:

- **Karlštejn 15 a Zbraslav 1** mají veřejně dostupný, skutečný oficiální
  diagram hřiště s měřítkem (obrázek, ne PDF s textem) — u obou jsem ho
  otevřel přímo v prohlížeči a přečetl z něj tvar jamky. Tohle jsou
  jediné dvě jamky, kde se schéma dá říct, že vychází z primárního
  obrazového zdroje, ne z odhadu podle prózy.
- **TPC Sawgrass 17, Pebble Beach 18, Riviera 10** mají skutečné
  yardage-booky (StrackaLine), ale hostované na obrázkových CDN, které
  tohle prostředí nedokáže načíst (buď blokováno proxy, nebo nástroj na
  čtení webu neumí obrázek, jen text kolem něj). Použita tedy nejlepší
  dostupná TEXTOVÁ data — často z komerčních „yardage mapping" webů
  (openyardage.com, AllGolfHoles.com), které tvrdí, že měří z LiDAR/OSM
  dat, ale metodiku nezveřejňují do detailu. Označeno jako střední
  důvěryhodnost, ne jistota.
- **Cypress Point 16 a Sand Hills 1** jsou extrémně soukromé kluby —
  žádný birdie book veřejně neexistuje. Nejlepší zdroj byl u Cypress
  Pointu samotný Alister MacKenzie, který jamku popsal vlastními slovy
  (přímý citát, primární zdroj, i když ne obrázek).
- **St Andrews 7 a Ballybunion 11** mají spoustu psané architektonické
  literatury (Fried Egg, LINKS Magazine, Golf Club Atlas), ale žádnou
  čitelnou plánovou kresbu.
- **Dobrouč 3** nemá vůbec žádný birdie book ani mapu — jediný primární
  zdroj je citát architekta Jakuba Červenky z vlastní stránky klubu.

### Věcné opravy (ne jen kosmetika)

- **Karlštejn 15 — bunkery úplně přeskupeny.** Dosavadní karta tvrdila
  „tři bunkery vpravo, jeden vlevo" — ale to byla MOJE parafráze textu na
  webu klubu, ne to, co web skutečně říká (ten mluví jen o „bunkerech po
  obou stranách", bez počtu) natož to, co ukazuje obrázek. Skutečný
  diagram (karlstejn-golf.cz/wp-content/uploads/2021/01/grafika-15.jpg)
  ukazuje shluk bunkerů na LEVÉ straně fairwaye v ohybu doglegu (ne u
  greenu) a jen dva menší bunkery těsně u greenu. Přepsáno geometrie
  i prózový „třetí prvek" karty (dřív tvrdil asymetrickou obranu greenu
  podle neexistujícího poměru 3:1 — teď mluví o tom, co je doopravdy
  vidět: bunkery zálohující jezero na agresivní lince).
- **Pebble Beach 18 — green byl otočený špatně.** Kreslil se širší než
  hluboký (rx14/ry11), ale openyardage.com (a logika par 5 podél pobřeží)
  říká opak — hlubší než široký. Otočeno na rx10.5/ry12. Navíc: prameny
  už dřív slibovaly „dvě fairwayové bunkry vpravo od dráhy letu", ale
  v `tvary.bunkry` nikdy nebyly nakreslené — jen ta u greenu. Doplněny.
- **Zbraslav 1 — dogleg byl na špatném konci jamky.** Oficiální diagram
  klubu (pcg.cz/wp-content/uploads/2024/03/1.jpg, prohlédnutý přímo)
  ukazuje ohyb doprava těsně před greenem, ne hned za odpalištěm. Zároveň
  jsem si při tom všiml, že jsem špatně chápal parametr `zacatek` —
  není to „kde začíná ohyb", ale „kde začíná kreslit se celá stuha
  fairwaye". Kdybych ho nechal na 330, prvních 330 m jamky by na obrázku
  chybělo. Opraveno zpátky na 25 (jako u všech ostatních karet); `ohyb`
  zůstal kladný (doprava). Zaznamenáno jako limit kreslicí funkce:
  `fairwayOsa()` staví celou jamku jako JEDNU kvadratickou Bézierovu
  křivku s řídicím bodem vždy uprostřed jamky, takže nedokáže rozlišit
  „ohyb hned za odpalištěm" od „ohyb těsně před greenem" — jen jak moc
  se jamka celkově prohýbá. Pro budoucí jamky s ohybem soustředěným na
  jednom konci by to chtělo buď dvousegmentovou křivku, nebo aspoň
  poznámku u karty, že se jedná o zjednodušení. Green zároveň zvětšen
  z rx12/ry9 na rx21.5/ry15 podle rozměrů 43 × 30 m na diagramu.
- **Cypress Point 16 — doplněn čelní bunker.** MacKenzieho vlastní popis
  a Golf Club Atlas shodně mluví o zeleni tvaru „bumerang", která se
  ovíjí kolem bunkru v čele — ten na kartě chyběl (byly jen boční
  bunkery). Doplněn, boční ponechány (zdroje je nevyvracejí).

### Kde jsem nic neměnil (a proč)

TPC Sawgrass 17, Riviera 10, Sand Hills 1, St Andrews 7 a Ballybunion 11
zůstaly geometricky beze změny — rešerše buď potvrdila, že současné
schéma už odpovídá nejlepším dostupným datům (Sand Hills, Ballybunion —
tam už předchozí kroky použily přesně tyhle zdroje), nebo našla jen
prózové popisy, které nešly přeložit do konkrétnější geometrie, aniž by
šlo o vymýšlení (TPC 17, Riviera, St Andrews). U všech pěti jsem aspoň
doplnil prameny o nově ověřené citace a do `poznamka` přidal, co přesně
bylo ověřeno a co zůstává nejisté — hlavně u St Andrews 7, kde se zdroje
rozcházejí ve vzdálenosti Shell Bunkeru od odpaliště (240 vs. 310 yardů)
a kde jsem si ověřil, že Shell Bunker ohrožuje hlavně odpal, ne dojezd na
green (jinak by to mohlo vypadat jako rozpor s kartou, která ho kreslí
zřetelně před greenem).

### Ověřeno vizuálně

Než jsem cokoli poslal dál, spustil jsem web lokálně (`python -m
http.server` + Playwright/Chromium z `/opt/pw-browsers`) a prohlédl si
vykreslené karty všech čtyř geometricky měněných jamek (Karlštejn 15,
Zbraslav 1, Pebble Beach 18, Cypress Point 16) — tímhle se odhalila
a opravila i chyba s `zacatek` u Zbraslavi (bez vizuální kontroly by
fairway na obrázku prostě chyběla).


## Redesign 8/2026 — z webu učebnice

Zadání: „proměň stávající web v mimořádně srozumitelnou, vizuálně
kultivovanou a pedagogicky silnou digitální učebnici“. Audit stavu před
zásahem je v `AUDIT.md`; tady je jen to, co jsem musel rozhodnout, co se
nepovedlo ověřit a kde vidím slabá místa.

### Rozhodnutí, která padla s objednatelem

- **Patkové písmo zůstává.** Nové zadání žádalo „neutrální sans-serif pro
  navigaci a delší text“, původní zadání (`zadani.md`, část 5) bezpatkové
  písmo výslovně zakazuje. Uživatel rozhodl pro patkové — Fraunces
  a Literata zůstávají všude, včetně navigace a tlačítek.
- **Rozsah**: nutné (N1–N6) i doporučené (D1–D7) změny z auditu.

### Co se změnilo v kódu

**`js/platy.js` — přepsané `vykresliJamku()`.** Původní verze kreslila jen
podklad, hazardy, bunkry, green a odpaliště. Nekreslila fairway, linii hry
ani popisky, přestože `tvary.bunkry[].label` byly v datech od začátku.
Nová verze kreslí fairway jako stuhu podél kvadratické Bézierovy křivky
(skutečný dogleg), linii hry po ose stuhy, dopadovou zónu, popisky
s vodicí linkou, vlnky na vodě — a bunkry až NAD greenem, aby greenside
bunkr nezmizel pod ním (past, kterou tenhle soubor popisuje od kroku 4).

**Nová data v kartách jamek.** `tvary.fairway` (`ohyb` v metrech,
`sirkaTee`, `sirkaGreen`, `zacatek`, `seed`), `tvary.dopadovaZona`
(`od`, `do`), `zkratka` u bunkrů a hazardů (krátké jméno do kresby, dlouhý
`label` zůstává a používá se pro `<desc>` pro čtečky), `naCoSeDivat`
a `lekce` u karty, `foto.sirka`/`foto.vyska`.

**`js/ucebnice.js` (nový).** Rám kapitoly, drobečky, ukazatel kroků,
„pokračuj kde jsi skončil“, kontextová nápověda ke slovníčku a ovládání
pracovního plátu klávesnicí.

**Nové stránky.** `slovnicek/` a `jamky/`.

### Co jsem NEMOHL ověřit / kde jsem si dovolil odhad

1. **Hodnoty `fairway.ohyb`** jsou zvolené heuristicky podle charakteru
   jamky popsaného v pramenech, ne podle zaměření. Je to schéma, ne
   půdorys — přiznává to `tvary.poznamka` u každé karty i text pod
   kresbou. Pokud se někdy podaří získat přesnější podklad, mění se jedno
   číslo v JSONu, ne kód.
2. **`naCoSeDivat` a `lekce`** jsou moje formulace odvozené z už ověřených
   `prvky` a `otazka` téže karty. Netvrdí žádný nový fakt o jamce; kdyby
   ti přesto některá věta zněla jako tvrzení navíc, škrtni ji — nic se
   nerozbije.
3. **Krátké názvy bunkrů (`zkratka`)** jsou u St Andrews historické
   (SHELL, COCKLE, STRATH) a u Sand Hills odborné (BLOWOUT). Jinde jsou
   popisné podle polohy (BUNKR VLEVO, FAIRWAY BUNKR) — žádné jméno jsem
   si nevymyslel.
4. **Chybná délka u Pebble Beach 18.** Karta ukazovala `delky[0]`, což je
   315 m z roku 1919 (tehdy par 4), ne dnešních 497 m. Opraveno:
   `kartaJamky()` bere poslední záznam a starší ukazuje jako poznámku
   „Dřívější délky“. Stálo by za to projít i `knihovna-jamek.md`, jestli
   tam stejná chyba není.

### Oprava po zpětné vazbě: Karlštejn 15 byla úplně jiná jamka

Uživatel při kontrole živého webu napsal, že 15. jamka na Karlštejně takhle
nevypadá — green je až za vodou. Měl pravdu a šlo o víc než o tvar.

**Co se stalo.** Karta `karlstejn-15.json` popisovala **par 3 s vodou po celé
pravé straně**. Skutečná klubová jamka 15 je **par 4, dogleg doleva
s rybníkem v ohybu, green na kopci, tři bunkery zprava a jeden zleva**.
Popsaná jamka existuje — je to klubová **14**. Do karty se dostala přes
GolfPass, jehož „1-18 Course" má číslování **posunuté o jednu jamku**.

**Jak to prošlo.** Karta si to sama přiznávala v poznámce („geometrie
vychází z přímého popisu hráče, který jamku hrál") — což není ověřitelný
pramen a mělo to být varování, ne vysvětlení. Zadání (část 13) říká
„preferuj primární zdroje" a „všechna fakta ověř na webu"; tady se místo
klubového webu použil agregátor.

**A ještě horší část.** Při redesignu jsem našel rozpor mezi
`knihovna-jamek.md` (par 4, 335 m) a JSON kartou (par 3, 198 m) — a
„srovnal" jsem markdown podle karty. Přehled měl přitom pravdu: citoval
doslovný popis z klubového webu. Vzal jsem JSON jako zdroj pravdy, protože
to tak README říká, a neověřil jsem to proti primárnímu prameni. **Když se
dva vlastní záznamy rozcházejí, správný krok je jít ke zdroji, ne
prohlásit jeden z nich za vítěze.**

**Jak je to teď ověřené.** Tři nezávislé zdroje se shodují: klubová mapa
hřiště (par 4, dogleg doleva, popis bunkerů), golftraxx scorecard
(344 yd / 315 m) a offcourse.co (315 m). Poznámka o číslování GolfPassu je
teď v kartě, v `knihovna-jamek.md` i tady.

**Co jsem NEPŘEVZAL.** Původní přehled uváděl u třetího prvku, že „vítr
mění, která volba je správná (klub sám radí konzervativní hru při
protivětru)". Tuhle větu se mi v aktuálním textu klubového webu ověřit
nepodařilo, tak jsem ji vypustil a nahradil ověřeným prvkem (tři bunkery
zprava, jeden zleva). Jestli ji někde najdeš, klidně ji vrať.

**Nové v kreslicí knihovně kvůli téhle jamce.** `tvary.primaLinie: true`
dokreslí přímou linii z odpaliště na green (u doglegu s hazardem v ohybu
je to ta odvážná cesta) — bez ní byla na plánu vidět jen bezpečná trasa
a nebylo co porovnávat. A `zkratka: null` u prvku popisek v kresbě vypne;
používá se u shluků, kde tři bunkery vedle sebe nepotřebují tři popisky
(pojmenuje se prostřední, dlouhý `label` pro čtečku si nechá každý).

### Druhá oprava Karlštejna: birdie book rozhodl

Objednatel poslal **birdie book (strokesaver) hřiště pro jamku 14** — a tím
se celý spor uzavřel. Původní karta popisovala geometricky **jamku 14**
(par 3, rybník po pravé straně), jen ji vedla pod číslem 15. Jeho původní
připomínka („green je až za vodou") mířila na skutečnou chybu v kresbě:
náš rybník měl `ry=100` a **přesahoval green o šedesát metrů**, zatímco na
kartě končí ~25 m PŘED předním okrajem greenu.

Nový soubor `karlstejn-14.json` je postavený přímo z té karty a je to
**nejlépe podložená karta v celém projektu**:

- par 3, HCP 6/5, délky 198 / 173 / 145 / 119 m
- 198 m je na střed greenu, **180 m na přední okraj**
- green **19 × 35 m** — skoro dvakrát hlubší, než širší
- rybník po celé pravé straně, končí před greenem
- čtyři bunkery: vpředu vlevo, vlevo, vpředu vpravo, vzadu vpravo
- dropping zone vlevo, 73 m od greenu

`karlstejn-15.json` (par 4, dogleg doleva) **zůstává** — je ověřená
klubovým webem a dvěma scorecardy a žije dál ve sbírce jamek. Česká jamka
v lekci 1 je teď **14**, protože o ní je celá ta debata a má primární
podklad.

**Nové v kreslicí knihovně.** Karta smí doladit podélné zkrácení sama:
`tvary.zkraceni` a `tvary.maxPomer`. Použij to jen tam, kde je hloubka
greenu součástí výkladu — při běžném zkrácení 0,55 vyšel green 19 × 35 m
skoro kulatý, což si protiřečilo s textem karty. Se `zkraceni: 0.85`
a `maxPomer: 1.9` je hloubka vidět. Měřítko po straně zkrácení přiznává
v obou případech.

**Ponaučení do dalších karet:** u české jamky si vyžádej birdie book nebo
strokesaver dřív, než začneš kreslit. Je to primární pramen, který
agregátory nemají, a rozdíl v kvalitě podkladu je propastný.

### Datum poslední aktualizace v patičce

`data/verze.json` drží jeden ISO timestamp, `js/ucebnice.js` ho vykreslí do
patičky každé stránky. Instaluje se samo z `nactiUI()`, aby se to nemuselo
dopisovat do 27 souborů; jazyk se hlídá `MutationObserver`em na atributu
`lang` kořenového elementu, který přepíná `jazyk.js`. **Údaj je ruční** —
statický web nemá build krok, který by ho doplnil. Při každé změně obsahu
ho přepiš.

### Fotky a licence — otevřená otázka (doplněno 20. 8. 2026)

Objednatel požádal o „hezčí fotky reálných jamek bez ohledu na licence".
Neudělal jsem to a je potřeba to rozhodnout vědomě: repozitář i web jsou
veřejné, projekt běží pod jménem objednatele a zadání (část 13) vkládání
snímků bez jasné licence výslovně zakazuje. Vložit chráněné fotografie by
znamenalo porušení autorského práva, ne stylistickou volbu.

Udělal jsem druhé kolo rešerše (Commons, Flickr CC, weby klubů) pro
všechny jamky bez ověřené fotky. Výsledek:

- **Riviera 10** — kandidát „Riviera Country Club, Golf Course in Pacific
  Palisades, California (168828797).jpg" z prvního kola **jsem nenasadil**.
  Popisek souboru na Flickru neříká, která jamka je na fotce (autor
  Dan Perry má z návštěvy klubu desítky podobně pojmenovaných fotek, jen
  některé mají číslo jamky v popisku — tahle ne). Nahradit současnou,
  poctivě označenou fotku 9. jamky za fotku, o které nevím jistě, že je
  z 10. jamky, by bylo přesně to vymýšlení faktů, které zadání zakazuje.
  **Necháno beze změny.**
- **Cypress Point 16** — nalezen slibný kandidát: Commons soubor
  „View From Clubhouse to 16 - Flickr - schnaars.jpg". Anglická Wikipedie
  ho ve článku o klubu používá s popiskem „View of 16th green from
  clubhouse in 2004" — tohle je nezávislé ověření, které jsem u Riviery
  neměl. Soubor byl na Commons naimportován přes Flickr2Commons bota, což
  se dělá jen u fotek, které měly na Flickru v době importu volnou CC
  licenci (BY nebo BY-SA) — takže licence tam bezpečně je, ale její přesné
  znění (BY vs. BY-SA, verze) jsem si nemohl ověřit: prostředí, ve kterém
  pracuju, má k `commons.wikimedia.org` jen omezený, keší přístup a
  stránku souboru nenačte. **Čeká na tebe** — stačí otevřít
  <https://commons.wikimedia.org/wiki/File:View_From_Clubhouse_to_16_-_Flickr_-_schnaars.jpg>
  a napsat mi přesný text licence, který tam vidíš pod „Licensing" —
  pak to rovnou zapracuju se správnou atribucí.
- **Karlštejn, Dobrouč, Zbraslav, Sand Hills** — druhé kolo rešerše potvrdilo
  první: na Commons pro tyhle kluby neexistuje kategorie, na Flickru nic
  pod CC licencí. Sand Hills a Cypress Point jsou extrémně soukromé kluby,
  u nich se to nedá čekat. U českých hřišť (Karlštejn, Dobrouč, Zbraslav)
  mají kluby vlastní galerie na webu, ale bez licenčního ujednání — to je
  přesně ten případ, kdy jeden e‑mail s žádostí o svolení má slušnou šanci
  na úspěch.

Reálné cesty, co dál: (a) ověřit licenci u Cypress Point kandidáta (výše),
(b) napsat českým klubům o svolení k použití jejich vlastních fotek —
u Karlštejna mám i kontakt (recepce@karlstejn-golf.cz) z rešerše jejich
webu, (c) místo vkládání fotky u zbylých jamek odkazovat na oficiální
galerie klubů. Generickou „hezkou golfovou fotku" z fotobanky pod kartu
konkrétní jamky dávat nelze — zadání zakazuje i vymýšlení lokací, a snímek
cizí jamky pod kartou konkrétní jamky je přesně to.

### Doplněno po zpětné vazbě: štítky filozofie u reálných jamek

Druhá připomínka: z karet v lekci 1 nebylo poznat, která jamka je
trestající, která heroická a která strategická — lekce to říkala jen
v perexu a v „Zapamatuj si", ne u samotné jamky. Karta teď má nahoře
štítek s filozofií a jednou větou proč (`fairway.filozofie` ve slovníku
lekce, `opts.stitek` v `kartaJamky()`). Všechny tři štítky mají **stejnou
barvu** — rozlišuje je slovo, ne odstín; barevné karty zadání v části 17
výslovně vylučuje.

### Slabá místa, o kterých vím

- **Obrázkové otázky ve zkoušce nejsou přístupné bez zraku.** Miniatury
  jsou teď `aria-hidden` a tlačítko má jméno („Jamka A“), takže čtečka
  aspoň nehlásí bezejmenný obrázek. Ale principiálně: otázka „která z těch
  tří jamek je strategická?“ se bez vidění obrázku zodpovědět nedá. Zadání
  přitom obrázkové otázky vyžaduje (nejméně dvě v každé lekci). Řešením by
  byla textová varianta téže otázky, ne popisek obrázku — to je ale
  rozhodnutí o obsahu zkoušky, ne o značkování.
- **Kontextová nápověda hledá tvary slov seznamem, ne morfologicky.**
  U češtiny to znamená, že některý pád pojmu nemusí být zachycen. Rozšíření
  je otázka doplnění `hledat` v `data/preklady/slovnik-pojmu.json`.
- **`dev/` zůstává na produkci.** Neodkazované, ale veřejné. Odstranění
  bylo v auditu jako volitelné a neprovedl jsem ho, aby zůstal náhled
  kreslicí knihovny po ruce.
- **Fotky jsou pořád JPEG bez `srcset`.** Rozměry mají (žádné poskočení
  sazby), ale úspora ~60 % dat převodem do webp čeká.
- **Sekce „Zapamatuj si“ existuje na všech 21 stránkách**, ale u sekcí
  „Slovníček“ a „K zamyšlení“ jsou její body spíš organizační než odborné.
  Až přibudou lekce 4–18, stojí za úvahu, jestli tam patří vůbec.

## Krok 7 — Úpravy po nasazení: víc stránek, úvodní stránka, nová písma,
fotky, opravy schémat jamek

Tenhle krok nebyl v původním postupu (část 14) — vznikl z dávky zpětné
vazby po prvním nasazení na GitHub Pages. Osm požadavků, shrnuto: (1) víc
skutečných HTML stránek místo SPA, (2) hezčí úvodní stránka kurzu s
fotkou, (3) čitelnější písmo s pořádnou českou diakritikou, (4) rozdělit
každou lekci na víc stránek, (5) fotka u každé reálné jamky, (6) opravit
schéma Karlštejn #15 (neodpovídalo realitě), (7) přiblížit schémata
reálných jamek realitě obecně, (8) nasadit rovnou na GitHub.

### Co vzniklo

**Písma.** Playfair Display + EB Garamond nahrazeny za Fraunces (nadpisy)
a Literata (běžný text) — obě s plnou podporou Latin Extended-A (české
znaky), self-hosted přes `@fontsource` balíčky z npm (přímý přístup na
`fonts.googleapis.com` je z tohohle prostředí blokovaný, ale
`registry.npmjs.org` ne). Skutečný důvod výměny nebyl jen vkus: **našel
jsem a opravil reálnou chybu** v původním nasazení — `@font-face` pravidla
kombinovala `latin` a `latin-ext` řezy v jednom `src:` seznamu bez
`unicode-range`, takže prohlížeč vždy načetl jen první soubor a českou
diakritiku (č, ř, š, ě, ď, ť, ň, ů…) tiše nahradil systémovým fontem. Nové
`@font-face` sekce v `styl.css` mají pro každý řez dvě samostatná pravidla
s vlastním `unicode-range`, přesně podle konvence, kterou generuje sám
Fontsource/Google Fonts.

**Vícestránkové lekce.** Každá lekce (01–03) byla jedna dlouhá stránka,
teď je to sedm samostatných HTML stránek (`1-tee-shot.html` …
`7-zkouska.html`) plus `index.html` jako mini-rozcestník lekce se seznamem
sekcí. Nová sdílená navigace mezi sekcemi žije v `js/sekce-nav.js`
(`sekceLekce()`, `vykresliNavSekci()`) — vykresluje dole na každé stránce
lištu „← Předchozí / Další →" se jmény sousedních sekcí, na poslední
sekci nabídne odkaz na další lekci. Nové CSS třídy pro tohle (`.krokLabel`,
`.sekceNav`, `.navBtn`, `.tocList`, `.tocItem`) přibyly v `styl.css`.
Vedlejší efekt: lekce 1 (do teď jediná, co nepoužívala `js/spolecne.js` —
schválně, jak byla původně dodaná) teď taky běží přes sdílené vzorce
(`kartaJamky`, `vytvorPutt`, `renderSlovnicek`), protože se stejně
přepisovala celá — všechny tři lekce jsou teď stavěné stejně.

**Úvodní stránka a rozcestník.** Kořenová `index.html` byla dřív funkční
rozcestník (seznam lekcí + výsledky) — tenhle obsah se přestěhoval na
`prehled/index.html` beze změny funkce (jen upravené relativní cesty o
úroveň hlouběji). Kořenová `index.html` je teď nová marketingová/úvodní
stránka: velká fotka (`.hero`), úvodní text o kurzu (`.academyIntro`),
čtyři body „co tě čeká" (`.academyPoints`) a tlačítko na otevření kurzu
(`.ctaRow`/`a.cta`), vedoucí na `prehled/index.html`. Text v novém
`data/preklady/uvod.json`.

**Fotky.** Sedm z deseti karet reálných jamek dostalo skutečnou fotku
(dřív jen schématický nákres). Zdroj: Wikimedia Commons, jen snímky s
jasnou volnou licencí (CC BY, CC BY-SA, nebo public domain) — každá fotka
má v `data/jamky/<id>.json` klíč `foto` s autorem, licencí a odkazem na
zdroj, který se zobrazuje jako popisek pod fotkou (`kartaJamky()` v
`js/spolecne.js`, nová CSS třída `.kartaFoto`). Fotky jsou uložené v
`assets/foto/`.

Konkrétně:
- **TPC Sawgrass #17, Pebble Beach #18, St Andrews #7 „High"** — fotky
  přímo dané jamky, jasně popsané jako takové v metadatech na Commons.
- **Riviera #10, Ballybunion Old #11** — pro tyhle dvě konkrétní jamky se
  nepodařilo najít volně licencovaný snímek. Použil jsem fotku sousední
  jamky (Riviera #9 u klubovny, Ballybunion #10) se stejným charakterem
  terénu a poctivě to přiznal v `foto.poznamka` i v popisku pod fotkou —
  radši přiznaná náhrada než tvářit se, že je to přesně ta jamka.
- **Karlštejn #15** — žádná fotka konkrétně z 15. jamky na Commons není,
  použil jsem letecký pohled na celý areál (opět přiznáno v poznámce).
- **Cypress Point #16, Sand Hills #1, Golf Zbraslav #1, Golf Dobrouč #3**
  — u těchhle čtyř karet žádnou volně licencovanou fotku nemám. Cypress
  Point a Sand Hills jsou extrémně soukromé kluby bez veřejné fotodokumentace
  na Commons; Zbraslav a Dobrouč jsou malá česká hřiště, která na Commons
  vůbec nejsou. Nechal jsem karty bez `foto` klíče — `kartaJamky()` fotoblok
  v tom případě jednoduše vynechá, žádná chybová hláška ani prázdné místo.

**Technická poznámka k získávání fotek**: sandbox, ve kterém běžím, nemá
přímý síťový přístup na `upload.wikimedia.org` ani na `commons.wikimedia.org`
(blokováno proxy). Fotky jsem získal přes prohlížeč (Claude in Chrome) —
navigace na `Special:FilePath/File:...` (přímé zobrazení souboru), pak
screenshot a oříznutí přes Python/Pillow (odstranění černého orámování
prohlížeče kolem obrázku). Každou licenci jsem před stažením ověřil ručně
na stránce souboru na Commons.

**Opravy schémat reálných jamek.** Zbylých sedm karet (kromě už dřív
opravených Karlštejn #15 a Ballybunion #11) prošlo revizí přes paralelní
subagenty s vlastním výzkumem + moje vizuální QA (grid všech deseti karet
vykreslený a vyfocený přes Playwright):
- **Cypress Point #16** — vodní hazard byl nejdřív příliš dominantní
  (blokoval celou šířku karty), i po první opravě subagentem pořád moc
  velký. Zmenšil a posunul jsem ho ručně, ať zůstane volný pruh vlevo pro
  bezpečnější „chicken run" trasu, kterou MacKenzie sám popisoval.
- **Pebble Beach #18** — stejný problém a stejná oprava (zátoka Stillwater
  Cove zúžená a posunutá, ať nezabírá celou šířku).
- **St Andrews Old #7** — subagent přidal chybějící „Shell Bunker" a
  přejmenoval/přemístil dva greenside bunkry na „Cockle" a „Strath", ale
  jejich střed vyšel geometricky UVNITŘ greenu — protože `vykresliJamku()`
  kreslí green jako poslední (nahoře), byly bunkry úplně schované. Opravil
  jsem to přesunutím obou těsně mimo hranici greenu.
- **Riviera #10** — fairway bunkr přesunutý ze středu doleva, přidaný
  třetí greenside bunkr vpravo vzadu.
- **Sand Hills #1** — přidané dva chybějící greenside bunkry, zmenšené
  předimenzované fairway bunkry, užší a hlubší green.
- **Zbraslav #1** — dva fiktivní boční bunkry nahrazené jedním velkým
  předním bunkrem podle popisu na webu klubu; opravena i chyba v datech
  (yardáž `520` byla omylem zapsaná jako metry — GolfPass uvádí 569 yd ≈
  520 m).

Všechny karty ověřené jako platný JSON a vizuálně zkontrolované přes
Playwright (grid screenshot + zoom na sporné případy).

### Ověřeno
- Všech 26 HTML stránek (úvodní, `prehled/`, 3× 8 stránek lekcí) prošlo
  bez chyby v konzoli i bez selhaného síťového požadavku — automatizovaný
  průchod přes Playwright s lokálním serverem.
- Kliknutí skrz navigaci funguje: úvodní stránka → tlačítko „Otevřít kurz"
  → `prehled/index.html` → lekce → jednotlivé sekce → zpět.
- Všechny nové/upravené JSON soubory (`data/jamky/*.json`,
  `data/preklady/*.json`) ověřené jako platný JSON.
- Fotky se zobrazují a mají fungující odkazy na licenci i zdroj na
  Wikimedia Commons.

### Otevřené resty
- Fotky chybí u čtyř z deseti karet reálných jamek (viz výše) — bez volně
  licencovaného zdroje jsem je nechtěl nahradit fotkou odjinud nebo
  fotkou, která by mohla porušovat autorská práva.
- `LICENSE`/copyright holder — pořád nevyřešeno, viz otevřené otázky na
  konci souboru.

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
