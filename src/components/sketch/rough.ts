/**
 * Deterministic "hand-drawn" SVG path helpers. The same seed always gives the
 * same wobble, so server and client render identical markup.
 */

function rng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => Math.round(n * 10) / 10;

/** A box drawn as four marker strokes that overshoot at the corners. */
export function roughRect(x: number, y: number, w: number, h: number, seed = 1, jitter = 1.8): string {
  const r = rng(seed);
  const j = () => (r() - 0.5) * jitter * 2;
  const o = 3.5;
  const side = (x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2 + j();
    const my = (y1 + y2) / 2 + j();
    return `M${f(x1)} ${f(y1)} Q${f(mx)} ${f(my)} ${f(x2)} ${f(y2)}`;
  };
  return [
    side(x - o + j(), y + j(), x + w + o + j(), y + j()),
    side(x + w + j(), y - o + j(), x + w + j(), y + h + o + j()),
    side(x + w + o + j(), y + h + j(), x - o + j(), y + h + j()),
    side(x + j(), y + h + o + j(), x + j(), y - o + j()),
  ].join(' ');
}

/** A loop drawn in one stroke that runs slightly past its start, like a marker circle. */
export function roughCircle(cx: number, cy: number, radius: number, seed = 1, wobble = 0.035): string {
  const r = rng(seed);
  const start = r() * Math.PI * 2;
  const steps = 14;
  const sweep = Math.PI * 2 + 0.35;
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = start + (sweep * i) / steps;
    const rad = radius * (1 + (r() - 0.5) * wobble * 2);
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }
  // Catmull-Rom through the points, as cubic Béziers.
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/** A slightly bowed line. */
export function roughLine(x1: number, y1: number, x2: number, y2: number, seed = 1, bow = 5): string {
  const r = rng(seed);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const b = (r() - 0.5) * bow * 2;
  const mx = (x1 + x2) / 2 + (-dy / len) * b;
  const my = (y1 + y2) / 2 + (dx / len) * b;
  return `M${f(x1)} ${f(y1)} Q${f(mx)} ${f(my)} ${f(x2)} ${f(y2)}`;
}

/** An arrowhead whose tip is at (x, y), pointing along the direction from (fromX, fromY). */
export function arrowHead(x: number, y: number, fromX: number, fromY: number, size = 13): string {
  const a = Math.atan2(y - fromY, x - fromX);
  const spread = 0.5;
  const ax = x - Math.cos(a - spread) * size;
  const ay = y - Math.sin(a - spread) * size;
  const bx = x - Math.cos(a + spread) * size;
  const by = y - Math.sin(a + spread) * size;
  return `M${f(ax)} ${f(ay)} L${f(x)} ${f(y)} L${f(bx)} ${f(by)}`;
}

/** A cubic doodle arrow from one point to another, with its head. */
export function doodleArrow(
  from: [number, number],
  c1: [number, number],
  c2: [number, number],
  to: [number, number],
  size = 13,
): string {
  return `M${f(from[0])} ${f(from[1])} C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(to[0])} ${f(to[1])} ${arrowHead(to[0], to[1], c2[0], c2[1], size)}`;
}
