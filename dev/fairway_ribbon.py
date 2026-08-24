# -*- coding: utf-8 -*-
"""Sdilena pomucka: postavi fairwayovou stuhu (obrys.fairway) z rucne urcenych
centerline waypointu v soustave karty (metry, x vpravo, y po ose hry) a sirky
v kazdem bode. Pouziva Catmull-Rom spline pro hladkost, jako fairwayOsa() v
platy.js, ale pece vysledek primo do polygonu (obrys.fairway), ne parametricky.
"""
import numpy as np

def _catmull_rom(P, n_per_seg=24):
    P = np.asarray(P, float)
    pts = []
    ext = np.vstack([P[0] + (P[0]-P[1]), P, P[-1] + (P[-1]-P[-2])])
    for i in range(1, len(ext)-2):
        p0,p1,p2,p3 = ext[i-1], ext[i], ext[i+1], ext[i+2]
        for t in np.linspace(0, 1, n_per_seg, endpoint=False):
            t2, t3 = t*t, t*t*t
            pt = 0.5*((2*p1) + (-p0+p2)*t + (2*p0-5*p1+4*p2-p3)*t2 + (-p0+3*p1-3*p2+p3)*t3)
            pts.append(pt)
    pts.append(P[-1])
    return np.array(pts)

def fairway_ribbon(waypoints, widths, n_per_seg=24):
    """waypoints: [(x,y), ...] centerline (card metry). widths: sirka v KAZDEM
    waypointu (metry, celkova sirka, ne poloviny) — interpoluje se lineárně
    po delce oblouku mezi zadanymi body. Vraci polygon (list [x,y]) pro
    obrys.fairway[i].body."""
    P = np.asarray(waypoints, float)
    W = np.asarray(widths, float)
    center = _catmull_rom(P, n_per_seg)
    # kumulativni delka pro interpolaci sirky (po puvodnich waypointech)
    seglen = np.r_[0, np.cumsum(np.hypot(*np.diff(P, axis=0).T))]
    cl_len = np.r_[0, np.cumsum(np.hypot(*np.diff(center, axis=0).T))]
    w_at_center = np.interp(cl_len, cl_len[-1]*seglen/seglen[-1], W)

    tang = np.gradient(center, axis=0)
    norm = tang / np.hypot(tang[:,0], tang[:,1])[:,None]
    perp = np.column_stack([norm[:,1], -norm[:,0]])

    left  = center + perp * (w_at_center/2)[:,None]
    right = center - perp * (w_at_center/2)[:,None]
    poly = np.vstack([left, right[::-1]])
    return poly

if __name__ == '__main__':
    pass
