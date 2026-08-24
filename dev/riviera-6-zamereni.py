# -*- coding: utf-8 -*-
"""
Riviera Country Club, jamka 6 — jak vznikla geometrie karty (Krok 36, 23. 8. 2026).

Celý postup v jednom souboru, aby se dal zopakovat a zkontrolovat.

VSTUPY
  1) dev/riviera6_osm.json — bunkry, odpaliště a osa jamky z OpenStreetMap (ODbL),
     staženo přes openstreetmap.org/api/0.6/map, přepočtené do metrů od bodu
     P = 34.0405 N, -118.507667 E (střed greenu, poslal objednatel).
  2) letecký snímek Google Maps, který dodal objednatel — cesta jako argument.

MYŠLENKA
  Green šestky v OpenStreetMap chybí, bunkry tam jsou. Snímek je v pixelech.
  Obrázek se proto USADÍ NA ZAMĚŘENÁ DATA: ze snímku se vysegmentují písečné
  plochy, jejich těžiště se spárují se čtyřmi bunkry z OSM a proloží se
  podobnostní transformace (měřítko + otočení + posun). Teprve tou transformací
  dostane obrys greenu měřítko v metrech.

VÝSTUP
  Souřadnice v soustavě karty: počátek v zadním odpališti, y po přímé linii
  odpaliště–green, x kladně vpravo od ní.

Spuštění:  python3 dev/riviera-6-zamereni.py <cesta-k-snimku.jpg>
"""
import json, sys, math
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage import measure, morphology
from matplotlib.path import Path

FOTO = sys.argv[1] if len(sys.argv) > 1 else 'dev/riviera-6-snimek.jpg'
OSM = json.load(open('dev/riviera6_osm.json', encoding='utf-8'))

# --------------------------------------------------------------------------
def teziste(poly):
    """Těžiště plochy mnohoúhelníku (ne průměr vrcholů — ten by vážil hustotu bodů)."""
    p = np.asarray(poly, float)
    if not np.allclose(p[0], p[-1]):
        p = np.vstack([p, p[0]])
    x, y = p[:, 0], p[:, 1]
    kr = x[:-1] * y[1:] - x[1:] * y[:-1]
    A = kr.sum() / 2.0
    if abs(A) < 1e-9:
        return p[:-1].mean(axis=0)
    return np.array([((x[:-1] + x[1:]) * kr).sum() / (6 * A),
                     ((y[:-1] + y[1:]) * kr).sum() / (6 * A)])

def do_metru_slozene(px_xy, a, b):
    """Pixely (x doprava, y dolů) -> metry (x na východ, y na sever)."""
    z = np.asarray(px_xy, float)
    zz = a * (z[:, 0] - 1j * z[:, 1]) + b
    return np.column_stack([zz.real, zz.imag])

# --- 1. segmentace snímku -------------------------------------------------
img = Image.open(FOTO).convert('RGB')
pole = np.asarray(img, float)
R, G, B = pole[..., 0], pole[..., 1], pole[..., 2]
jas = pole.mean(axis=2)

# písek: světlý, málo barevný, do teplých tónů
pisek = (R > 150) & (np.abs(G - R) < 28) & ((R - B) > 4)
pisek = ndi.median_filter(pisek.astype(np.uint8), size=5).astype(bool)
pisek = morphology.remove_small_objects(pisek, 600)
pisek = ndi.binary_closing(pisek, morphology.disk(4))

# putovací plocha: posekaná plocha je nejen SVĚTLEJŠÍ, ale hlavně HLADŠÍ než
# okolní rough (ten má pruhy po sekačce a stíny). Bez podmínky na rozptyl
# prahování pobere i apron a green vyjde o polovinu větší, než je.
m1 = ndi.uniform_filter(jas, 7)
sd = np.sqrt(np.maximum(ndi.uniform_filter(jas ** 2, 7) - m1 ** 2, 0))
putt = (m1 > 127) & (sd < 9) & ((G - R) > 40)
putt = ndi.binary_opening(putt, morphology.disk(4))
putt = ndi.binary_closing(putt, morphology.disk(7))
znac, _ = ndi.label(putt)
maska = ndi.binary_fill_holes(znac == znac[1150, 450])   # bod uvnitř greenu

cont = max(measure.find_contours(maska.astype(float), 0.5), key=len)
cont = measure.approximate_polygon(cont, tolerance=2.5)
green_px = np.column_stack([cont[:, 1], cont[:, 0]])

# --- 2. spárování písku s bunkry z OSM a proložení transformace ------------
znac2, n2 = ndi.label(pisek)
blob = []
for i in range(1, n2 + 1):
    m = znac2 == i
    if m.sum() < 600:
        continue
    ys, xs = np.nonzero(m)
    c = max(measure.find_contours(m.astype(float), 0.5), key=len)
    blob.append({'plocha': int(m.sum()), 'stred': np.array([xs.mean(), ys.mean()]),
                 'sirka': int(np.ptp(xs)), 'vyska': int(np.ptp(ys)),
                 'obrys': np.column_stack([c[:, 1], c[:, 0]])})
blob.sort(key=lambda b: -b['plocha'])

# Čtyři největší plochy v okolí greenu odpovídají čtyřem bunkrům v OSM.
# Pátá (podlouhlá, 15 x 6 m severovýchodně) je po usazení cesta pro vozíky —
# segmentace podle barvy si asfalt a písek plete. Do párování nevstupuje.
PARY = [('b688', np.array([234.6, 892.5])),    # velký členitý
        ('b687', np.array([678.9, 974.5])),    # malý u okraje
        ('b686', np.array([645.0, 1330.1])),   # vpravo vzadu
        ('b683', np.array([541.0, 1180.6]))]   # ostrovní, uprostřed greenu

zdroj, cil = [], []
for klic, hint in PARY:
    b = min(blob, key=lambda q: np.hypot(*(q['stred'] - hint)))
    zdroj.append(teziste(np.column_stack([b['obrys'][:, 0], -b['obrys'][:, 1]])))
    cil.append(teziste(OSM[klic]))
zs = np.array(zdroj)[:, 0] + 1j * np.array(zdroj)[:, 1]
zd = np.array(cil)[:, 0] + 1j * np.array(cil)[:, 1]
a = ((zs - zs.mean()).conj() * (zd - zd.mean())).sum() / (abs(zs - zs.mean()) ** 2).sum()
b = zd.mean() - a * zs.mean()
odch = np.abs(a * zs + b - zd)
print('měřítko %.2f px/m, natočení %+.2f°, zbytkové odchylky %s m'
      % (1 / abs(a), math.degrees(math.atan2(a.imag, a.real)),
         np.round(odch, 2).tolist()))
assert odch.max() < 1.5, 'transformace nesedí — nepokračuj a zkontroluj párování'

# --- 3. obrys greenu do metrů, vyhlazení, rovnoměrné převzorkování ---------
g = do_metru_slozene(green_px, a, b)
if np.allclose(g[0], g[-1]):
    g = g[:-1]
k = 9
g = np.array([g[np.arange(i - k // 2, i + k // 2 + 1) % len(g)].mean(axis=0) for i in range(len(g))])
uz = np.vstack([g, g[0]])
s = np.r_[0, np.cumsum(np.hypot(*np.diff(uz, axis=0).T))]
u = np.linspace(0, s[-1], 41)[:-1]
g = np.column_stack([np.interp(u, s, uz[:, 0]), np.interp(u, s, uz[:, 1])])

# --- 4. soustava karty ----------------------------------------------------
odp = teziste(OSM['tee6'])
osa = teziste(g) - odp
L = np.hypot(*osa)
smer = osa / L
vpravo = np.array([smer[1], -smer[0]])
print('zadní odpaliště -> střed greenu: %.1f m (oficiálně 182 m / 199 yd)' % L)

def do_karty(poly):
    p = np.asarray(poly, float) - odp
    return np.column_stack([p @ vpravo, p @ smer])

def zlomy(poly):
    v = np.roll(poly, -1, axis=0) - poly
    uh = np.degrees(np.arctan2(v[:, 1], v[:, 0]))
    return (np.diff(np.r_[uh, uh[0]]) + 180) % 360 - 180

# ostré zpětné zlomy na 2,6 m dlouhých úsecích jsou šum segmentace, ne tvar
gk = [list(q) for q in do_karty(g)]
while len(gk) > 12:
    t = zlomy(np.array(gk))
    i = int(np.argmax(np.abs(t)))
    if abs(t[i]) <= 80:
        break
    gk.pop((i + 1) % len(gk))
gk = np.array(gk)
print('green: %d bodů, %.1f x %.1f m, obvod %.1f m, plocha %.0f m²'
      % (len(gk), np.ptp(gk[:, 0]), np.ptp(gk[:, 1]),
         np.hypot(*(np.roll(gk, -1, axis=0) - gk).T).sum(),
         maska.sum() * abs(a) ** 2))

# --- 5. kam se kreslí praporek -------------------------------------------
# Střed greenu je bunkr. Vlajka jde do bodu s největším odstupem od bunkru
# i od okraje. Je to kresebná konvence, ne zaměřená poloha jamkoviště.
ostrov = do_karty(OSM['b683'])
cg, ci = Path(gk), Path(ostrov)
def odstup(bod, poly):
    p, q = poly, np.roll(poly, -1, axis=0)
    pq = q - p
    t = np.clip(((bod - p) * pq).sum(1) / np.maximum((pq * pq).sum(1), 1e-9), 0, 1)
    return np.hypot(*(p + t[:, None] * pq - bod).T).min()
nej, kam = -1, None
for x in np.arange(gk[:, 0].min(), gk[:, 0].max(), 0.25):
    for y in np.arange(gk[:, 1].min(), gk[:, 1].max(), 0.25):
        bod = np.array([x, y])
        if not cg.contains_point(bod) or ci.contains_point(bod):
            continue
        c = min(odstup(bod, gk), odstup(bod, ostrov))
        if c > nej:
            nej, kam = c, bod
print('praporek do (%.1f, %.1f), odstup od bunkru i okraje %.1f m' % (kam[0], kam[1], nej))

# --- 6. výstup ------------------------------------------------------------
def zaokr(poly):
    return [[round(float(x), 1), round(float(y), 1)] for x, y in poly]
vysledek = {
    'green': zaokr(gk),
    'jamkoviste': [round(float(kam[0]), 1), round(float(kam[1]), 1)],
    'odpaliste': [zaokr(do_karty(OSM['tee6'][:-1])), zaokr(do_karty(OSM['tee_predni']))],
    'bunkry': {k: zaokr(do_karty(OSM[k][:-1] if np.allclose(OSM[k][0], OSM[k][-1]) else OSM[k]))
               for k in ('b688', 'b687', 'b686', 'b683')},
    'delka_prima_m': round(float(L), 1),
}
json.dump(vysledek, open('dev/riviera-6-vysledek.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print('zapsáno dev/riviera-6-vysledek.json')
