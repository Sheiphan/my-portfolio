# /// script
# requires-python = ">=3.11"
# dependencies = ["numpy", "matplotlib"]
# ///
"""Compute the two background diagrams for the night sky and write them as SVG
path data to src/components/sketch/physicsData.ts.

1. A zoom-whirl timelike geodesic in Schwarzschild spacetime (G = c = M = 1).
   With u = 1/r, the orbit equation is  u'' + u = 1/L^2 + 3u^2.  A bound orbit
   has turning points u1 < u2 < u3 with u1 + u2 + u3 = 1/2 and
   1/L^2 = u1 u2 + u1 u3 + u2 u3.  Putting u2 just below u3 (periapsis just
   outside the unstable circular orbit) makes the particle whirl around the
   hole several times per radial period.  Proper time along the orbit is
   dtau/dphi = 1 / (L u^2).

2. The Roche potential of a circular binary in the co-rotating frame
   (G = a = M_total = omega = 1):
       Phi = -m1/r1 - m2/r2 - (x^2 + y^2) / 2,
   with the five Lagrange points and the critical (L1) equipotential.

Run:  uv run scripts/physics_doodles.py
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402

OUT = Path(__file__).resolve().parent.parent / "src/components/sketch/physicsData.ts"


def fmt(v: float) -> str:
    return f"{v:.1f}".rstrip("0").rstrip(".") if abs(v) >= 0.05 else "0"


def path_from(points: list[tuple[float, float]], close: bool = False) -> str:
    out = [f"M{fmt(points[0][0])} {fmt(points[0][1])}"]
    out += [f"L{fmt(x)} {fmt(y)}" for x, y in points[1:]]
    return " ".join(out) + (" Z" if close else "")


def thin(points: np.ndarray, min_step: float) -> list[tuple[float, float]]:
    kept = [tuple(points[0])]
    for p in points[1:]:
        if math.dist(p, kept[-1]) >= min_step:
            kept.append(tuple(p))
    if tuple(points[-1]) != kept[-1]:
        kept.append(tuple(points[-1]))
    return kept


# ---------------------------------------------------------------- 1. geodesic
def zoom_whirl():
    r_apo, r_peri = 16.0, 4.62
    u1, u2 = 1 / r_apo, 1 / r_peri
    u3 = 0.5 - u1 - u2
    assert u3 > u2, "periapsis must lie outside the unstable circular orbit"
    inv_L2 = u1 * u2 + u1 * u3 + u2 * u3
    L = 1 / math.sqrt(inv_L2)

    def rhs(state):
        u, du = state
        return np.array([du, inv_L2 - u + 3 * u * u])

    # RK4 in phi, starting at apoapsis.
    h = 0.0015
    state = np.array([u1, 0.0])
    phi, tau = 0.0, 0.0
    pts, taus = [], []
    apo_returns = 0
    prev_du = 0.0
    while apo_returns < 3:
        u = state[0]
        pts.append((math.cos(phi) / u, math.sin(phi) / u))
        taus.append(tau)
        k1 = rhs(state)
        k2 = rhs(state + h / 2 * k1)
        k3 = rhs(state + h / 2 * k2)
        k4 = rhs(state + h * k3)
        state = state + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
        tau += h / (L * u * u)
        phi += h
        # du/dphi goes from negative to positive at apoapsis (u minimum).
        if prev_du < 0 <= state[1]:
            apo_returns += 1
        prev_du = state[1]
    return np.array(pts), np.array(taus), L, (r_apo, r_peri), phi


# ------------------------------------------------------------------ 2. Roche
def roche(q: float = 0.35):
    m1, m2 = 1 / (1 + q), q / (1 + q)
    x1, x2 = -m2, m1

    def phi(x, y):
        r1 = np.hypot(x - x1, y)
        r2 = np.hypot(x - x2, y)
        return -m1 / r1 - m2 / r2 - 0.5 * (x * x + y * y)

    def dphidx(x):
        return m1 * (x - x1) / abs(x - x1) ** 3 + m2 * (x - x2) / abs(x - x2) ** 3 - x

    def bisect(a, b):
        fa = dphidx(a)
        for _ in range(200):
            m = 0.5 * (a + b)
            fm = dphidx(m)
            if (fm > 0) == (fa > 0):
                a, fa = m, fm
            else:
                b = m
        return 0.5 * (a + b)

    eps = 1e-6
    L1 = bisect(x1 + eps, x2 - eps)
    L2 = bisect(x2 + eps, 2.0)
    L3 = bisect(-2.0, x1 - eps)
    L4 = (x1 + 0.5, math.sqrt(3) / 2)
    L5 = (x1 + 0.5, -math.sqrt(3) / 2)
    lpts = {"L1": (L1, 0.0), "L2": (L2, 0.0), "L3": (L3, 0.0), "L4": L4, "L5": L5}
    levels = {k: float(phi(np.array(v[0]), np.array(v[1]))) for k, v in lpts.items()}

    xs = np.linspace(-1.75, 1.75, 900)
    ys = np.linspace(-1.35, 1.35, 700)
    X, Y = np.meshgrid(xs, ys)
    Z = phi(X, Y)

    c_L1 = levels["L1"]
    inner = [c_L1 - d for d in (0.12, 0.3, 0.6)]
    outer = [levels["L2"] - 0.006, levels["L3"] - 0.006]
    between = np.linspace(levels["L3"], levels["L4"], 4)[1:3].tolist()
    return dict(m=(m1, m2), x=(x1, x2), lpts=lpts, levels=levels,
                grid=(X, Y, Z), inner=inner, critical=c_L1, outer=outer, between=between)


def contour_paths(X, Y, Z, level, to_svg, min_step=2.4):
    """Closed contours only: the levels also cross the far, centrifugal part of the
    potential, which the grid edge would cut into stray arcs."""
    fig = plt.figure()
    cs = plt.contour(X, Y, Z, levels=[level])
    paths = []
    for seg in cs.allsegs[0]:
        if len(seg) < 8:
            continue
        pts = np.array([to_svg(x, y) for x, y in seg])
        if math.dist(pts[0], pts[-1]) > 2:
            continue
        paths.append(path_from(thin(pts, min_step), close=True))
    plt.close(fig)
    return paths


def main():
    # --- geodesic, in a 320 x 320 box centred on the hole
    pts, taus, L, (r_apo, r_peri), phi_end = zoom_whirl()
    size, pad = 320, 14
    scale = (size / 2 - pad) / r_apo
    cx = cy = size / 2

    def g(x, y):
        return (cx + x * scale, cy - y * scale)

    svg_pts = np.array([g(x, y) for x, y in pts])
    orbit = thin(svg_pts, 2.6)
    # Motion keys: arc-length fraction at evenly spaced proper times.
    seg = np.r_[0, np.cumsum(np.hypot(*np.diff(svg_pts, axis=0).T))]
    arc = seg / seg[-1]
    t_norm = (taus - taus[0]) / (taus[-1] - taus[0])
    n_keys = 120
    key_times = np.linspace(0, 1, n_keys)
    key_points = np.interp(key_times, t_norm, arc)
    whirl_turns = phi_end / (2 * math.pi) / 3

    # --- Roche, in a 360 x 280 box centred on the barycentre
    R = roche()
    rw, rh = 360, 280
    rscale = 150

    def rr(x, y):
        return (rw / 2 + x * rscale, rh / 2 - y * rscale)

    X, Y, Z = R["grid"]
    roche_out = {
        "inner": [p for lv in R["inner"] for p in contour_paths(X, Y, Z, lv, rr)],
        "critical": contour_paths(X, Y, Z, R["critical"], rr, 1.4),
        "outer": [p for lv in R["outer"] for p in contour_paths(X, Y, Z, lv, rr)],
        "between": [p for lv in R["between"] for p in contour_paths(X, Y, Z, lv, rr)],
        "stars": [
            {"x": rr(R["x"][0], 0)[0], "y": rh / 2, "r": 7.5},
            {"x": rr(R["x"][1], 0)[0], "y": rh / 2, "r": 5},
        ],
        "barycentre": {"x": rw / 2, "y": rh / 2},
        "lagrange": [{"name": k, "x": rr(*v)[0], "y": rr(*v)[1]} for k, v in R["lpts"].items()],
    }

    data = {
        "geodesic": {
            "size": size,
            "orbit": path_from(orbit),
            "horizon": 2 * scale,
            "photonSphere": 3 * scale,
            "isco": 6 * scale,
            "keyTimes": ";".join(f"{v:.4f}" for v in key_times),
            "keyPoints": ";".join(f"{v:.4f}" for v in key_points),
            "note": f"r_apo={r_apo}M r_peri={r_peri}M L={L:.4f}M ~{whirl_turns:.2f} turns per radial period",
        },
        "roche": {"width": rw, "height": rh, **roche_out, "q": 0.35},
    }

    header = (
        "// Generated by scripts/physics_doodles.py. Do not edit by hand.\n"
        f"// Geodesic: {data['geodesic']['note']}.\n"
        "// Roche: q = m2/m1 = 0.35, co-rotating frame, G = a = M = omega = 1.\n"
    )
    OUT.write_text(header + "export const PHYSICS = " + json.dumps(data, indent=2) + " as const;\n")
    print("wrote", OUT.relative_to(OUT.parents[3]))
    print(data["geodesic"]["note"])
    print({k: round(v, 4) for k, v in R["levels"].items()})
    print("roche paths:", {k: len(v) for k, v in roche_out.items() if isinstance(v, list)})


if __name__ == "__main__":
    main()
