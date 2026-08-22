# -*- coding: utf-8 -*-
"""
HLEDÁNÍ JAMKY V DATECH OPENSTREETMAP — nástroj z Kroku 19/20.

K čemu to je: OSM u golfových prvků neuvádí čísla jamek (`ref` je prázdný),
takže se ke kartě jamky musí polygony přiřadit jinak. Tenhle skript hledá
green, ke kterému vede „žebřík" odpališť odpovídající oficiálním délkám
z karty.

DVĚ KRITÉRIA, OBĚ POVINNÁ:
 1. Shoda délek — ke greenu vede tolik odpališť, kolik karta uvádí, a jejich
    vzdálenosti sedí v toleranci (u Karlštejna 14 vyšly na 1–3 metry).
 2. Kolinearita — všechna ta odpaliště leží od greenu ve stejném směru
    (azimut se liší nejvýš o 12°). Bez téhle podmínky test NEFUNGUJE: mezi
    58 odpališti se skoro vždycky najdou čtyři v libovolných vzdálenostech.

    !!! POZOR (zjištěno v Kroku 21): kolinearita platí JEN U ROVNÝCH JAMEK.
    U doglegu odpaliště s greenem v přímce nejsou a test jamku vyřadí —
    přesně to se stalo Karlštejnu 15. Používej tenhle skript na par 3
    a rovné jamky; u doglegů je potřeba jiné kritérium.

A JEŠTĚ TŘETÍ, KTERÉ SKRIPT NEUMÍ: nezávislé ověření podle hazardů — leží
voda na té straně, kterou popisuje karta? Kolik je u greenu bunkrů? Tohle
se musí zkontrolovat ručně a je to to jediné, co odhalí chybu, když projdou
obě předchozí.

CO SE UKÁZALO PŘI TESTOVÁNÍ (viz poznamky.md, Krok 19 a 20):
 - Bez kolinearity vybere test u Karlštejna 14 ŠPATNÝ green (G0 se čtyřmi
   shodami s lepší odchylkou než správné G5).
 - S kolinearitou vyjde Karlštejn 14 správně a jako jediný se čtyřmi
   shodami.
 - Karlštejn 15, Riviera 6 ani Mid Ocean 5 tímhle sítem neprojdou —
   buď nemají jednoznačného vítěze, nebo neprojdou ověřením podle hazardů
   (u Mid Oceanu není v OSM zmapované Mangrove Lake, přes které se hraje).

ZÁVĚR: automaticky se jamka určit nedá. Skript slouží k VYLOUČENÍ
kandidátů, ne k rozhodnutí. Rozhodnout musí člověk, který hřiště zná —
nejrychleji tak, že pošle souřadnice středu greenu a zadního odpaliště.

Vstup: GeoJSON export z OpenStreetMap (viz zadani.md, doplněk, bod 8).
"""
import math
exec(open('/home/claude/gen/osm2.py').read().split("G=prvky('green')")[0])
G=prvky('green'); T=prvky('tee'); W=prvky('water_hazard')

def azimut(a,b):
    return math.degrees(math.atan2(b['cx']-a['cx'], b['cy']-a['cy'])) % 360

def rozdilUhlu(a,b):
    d=abs(a-b)%360
    return min(d,360-d)

def hledej(delky, tol=5.0, minShod=3, uhelTol=12.0):
    vysl=[]
    for gi,g in enumerate(G):
        ds=[(math.dist((t['cx'],t['cy']),(g['cx'],g['cy'])), ti) for ti,t in enumerate(T)]
        kand=[]
        for cil in delky:
            m=[(abs(d-cil), d, ti) for d,ti in ds if abs(d-cil)<=tol]
            m.sort()
            kand.append(m)
        # zkus každou kombinaci, kde odpaliště leží v jednom směru od greenu
        nej=None
        def rek(i, vybr):
            nonlocal nej
            if i==len(kand):
                if len(vybr)<minShod: return
                az=[azimut(g, T[x[2]]) for x in vybr]
                stred=az[0]
                if any(rozdilUhlu(a,stred)>uhelTol for a in az): return
                # musí být seřazená: delší vzdálenost = dál v témže směru
                sk=(len(vybr), -sum(x[0] for x in vybr)/len(vybr))
                if nej is None or sk>nej[0]: nej=(sk, list(vybr))
                return
            rek(i+1, vybr)                    # tuhle délku vynech
            for m in kand[i][:3]:
                rek(i+1, vybr+[m])
        rek(0, [])
        if nej:
            (n, negodch), vybr = nej
            vysl.append((n, -negodch, gi, vybr))
    vysl.sort(key=lambda v:(-v[0], v[1]))
    return vysl

for jmeno, delky in (('jamka 14 (KONTROLA, správně je G5)', [198,173,145,119]),
                     ('jamka 15', [315,290,264,223])):
    print('===', jmeno)
    for n, odch, gi, vybr in hledej(delky)[:5]:
        g=G[gi]
        az=[azimut(g,T[x[2]]) for x in vybr]
        print('  G%-2d  shod %d  odchylka %.1f m  azimuty %s  délky %s'
              % (gi, n, odch, ' '.join('%.0f'%a for a in az), ' '.join('%.0f'%x[1] for x in vybr)))
    print()
