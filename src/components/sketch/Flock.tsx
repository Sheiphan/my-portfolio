"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * A murmuration of tiny ink agents that lives on the paper behind the page.
 *
 * - Perching on the name: birds dispatched from the planner agent
 *   ([data-flock-origin]) swoop once around every [data-flock-text] word as a
 *   flock, then settle on the top contour of its letters. The ink name itself
 *   always stays solid. Perched birds take off when the pointer comes close or
 *   a click lands nearby, circle, and come back. They fly off when the name
 *   scrolls away and return when it comes back.
 * - Ambient: a sparse flock (boids) roams the viewport, curious about the
 *   pointer at a distance and shy up close.
 * - Clicks draw a marker burst and scatter nearby birds.
 * - Perching: hovering a [data-perch] element lands a few birds on its top edge.
 *
 * Nothing runs under prefers-reduced-motion.
 */

type Mode =
  // Name perchers
  | 'hidden' // off screen, waiting
  | 'launch' // held inside the planner's head until its release time
  | 'crowd' // milling in a loose swarm over the planner's head, waiting to be shaken off
  | 'loop' // swooping around the name with the flock
  | 'land' // gliding down onto its perch
  | 'sit' // perched on the top of a letter
  | 'fly' // startled: circling above its perch
  | 'leave' // flying off because the name scrolled away
  // Ambient flock
  | 'ambient'
  | 'perch' // landed on the top edge of a hovered clickable
  | 'away'; // waiting off screen while something is hovered

interface Bird {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mode: Mode;
  /** Perch (or [data-perch]) target in document coordinates. */
  tx: number;
  ty: number;
  /** ms timestamp when a launching bird leaves the planner. */
  launchAt: number;
  /** How long this bird's swoop around the name lasts (ms). */
  loopDur: number;
  /** Angle where this bird's swoop starts and how far it sweeps. */
  loopFrom: number;
  /** Where the swoop starts (document coords): a seat on the planner's head, or its centre. */
  hx: number;
  hy: number;
  /** When a swarming bird comes out of the planner's head. */
  appearAt: number;
  /** How far out this bird mills in the swarm over the head (0..1). */
  rr: number;
  /** Small offset inside the flock so the swoop reads as a ribbon. */
  ox: number;
  oy: number;
  /** When a startled bird heads back to its perch. */
  until: number;
  /** Orbit angle and direction while startled. */
  orbit: number;
  spin: number;
  /** 0 = flying wings, 1 = folded wings. */
  fold: number;
  /** Perched on the planner figure ([data-flock-roost]) rather than on the name. */
  roost: boolean;
  /** Extra birds sent out by the planner fly off and leave the page after this time (0 = never). */
  retireAt: number;
  /** Until this time (ms) the bird ignores the content-area keep-out, e.g. birds just sent out of the planner. */
  freeUntil: number;
  /** Which side group an ambient bird belongs to (0 = left strip, 1 = right strip); -1 = none. */
  group: number;
  /** A calm little hop (smaller circle) rather than a startled take-off. */
  hop: boolean;
  phase: number;
  angle: number;
  /** 0 = timid (turns away from text early), 1 = bold (drifts further into the padding before turning). */
  nerve: number;
  /** Which way this bird curves as it turns away from text (-1 or 1). */
  side: number;
}

/** A keep-out rectangle in viewport coordinates. */
type Rect = { left: number; right: number; top: number; bottom: number };

interface Ripple {
  x: number; // document coords
  y: number;
  t0: number;
}

interface Loop {
  cx: number; // document coords
  cy: number;
  rx: number;
  ry: number;
  /** Angular speed in rad/ms (the swoop runs clockwise over the top, right to left). */
  w: number;
}

/** Clickable things that ambient birds land on while hovered. */
const HOVER_PERCH = 'a, button, [role="button"], [data-perch]';
/** Half the wing span of a perched bird. */
const PERCH_SPAN = 5.5;
/** Drawn size of every bird (1 = the original tiny doodle). */
const BIRD = 3;
/** Ambient birds fade out completely this close (px) to the page's content blocks... */
const TEXT_PAD = 16;
/** ...and start fading out this far away (px), so they live in the side margins and gaps. */
const TEXT_FADE = 64;
/** Ambient birds are drawn a little bigger than the ones on the name, so they read as birds. */
const AMBIENT_SCALE = 1.3;
/** Half the wing span of a perched bird as drawn on the page, used to place perches. */
const PERCH_REACH = PERCH_SPAN * BIRD;
/**
 * Opening, in ms after launch: a loose swarm pours out of the planner's head and mills over
 * it, the planner looks up and shakes them off, and they swoop round the name and settle on it.
 */
const CROWD_IN = 600;
const LOOK_AT = 650;
const SHAKE_AT = 1000;
const SHAKE_MS = 560;
const TAKEOFF_AT = 1060;
/** Pointer distance that startles a perched bird. */
const STARTLE = 80;

export default function Flock() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const launchRef = useRef<(() => void) | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let dpr = Math.min(2, window.devicePixelRatio || 1);
    const small = () => W < 640;

    const resizeCanvas = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
    };
    resizeCanvas();

    const pointer = { x: -9999, y: -9999, active: false, lastMove: 0 };
    const ripples: Ripple[] = [];
    // The middle column of the page, top to bottom: the ambient flock stays out of it and
    // hovers in the strips to its left and right (viewport coordinates, refreshed often).
    let avoid: Rect[] = [];
    let avoidAt = 0;
    const narrow = () => W < 900;
    const bandEdges = () => {
      const inset = narrow() ? 0.05 : 0.165;
      return { l: W * inset, r: W * (1 - inset) };
    };
    /** Where each resting group hovers: over its side strip, or on a phone, either side of the middle. */
    const groupHomeX = (g: number) => {
      if (narrow()) return g === 0 ? W * 0.28 : W * 0.72;
      const { l, r } = bandEdges();
      return g === 0 ? l / 2 : (r + W) / 2;
    };
    const refreshAvoid = () => {
      // No side strips on a phone: there the flock drifts over the page, faint, and never lands on it.
      if (narrow()) {
        avoid = [];
        return;
      }
      const { l, r } = bandEdges();
      avoid = [{ left: l, right: r, top: -1e6, bottom: 1e6 }];
    };
    /** Distance from a point to a text block (0 inside) and the direction pointing away from it. */
    const awayFrom = (r: Rect, x: number, y: number) => {
      const dx = Math.max(r.left - x, 0, x - r.right);
      const dy = Math.max(r.top - y, 0, y - r.bottom);
      if (dx > 0 || dy > 0) {
        const d = Math.hypot(dx, dy);
        return { d, nx: (x < r.left ? -1 : x > r.right ? 1 : 0) * (dx / d), ny: (y < r.top ? -1 : y > r.bottom ? 1 : 0) * (dy / d) };
      }
      // Inside the block: leave by the nearest edge.
      const dl = x - r.left, dr = r.right - x, dt = y - r.top, db = r.bottom - y;
      const m = Math.min(dl, dr, dt, db);
      return { d: 0, nx: m === dl ? -1 : m === dr ? 1 : 0, ny: m === dt ? -1 : m === db ? 1 : 0 };
    };
    /** How strongly the keep-out applies to a bird: 0 while it is newly sent out, easing to 1 over 4s after. */
    const avoidStrength = (b: Bird, t: number) => Math.max(0, Math.min(1, (t - b.freeUntil) / 4000));
    /** 0 right beside text (invisible) up to 1 well clear of it (fully drawn). */
    const textClearance = (x: number, y: number) => {
      if (narrow()) return 0.6;
      let k = 1;
      for (const r of avoid) {
        if (x < r.left - TEXT_FADE || x > r.right + TEXT_FADE || y < r.top - TEXT_FADE || y > r.bottom + TEXT_FADE) continue;
        const { d } = awayFrom(r, x, y);
        k = Math.min(k, Math.max(0, Math.min(1, (d - TEXT_PAD) / (TEXT_FADE - TEXT_PAD))));
      }
      return k;
    };
    const birds: Bird[] = [];
    let formation: Bird[] = [];
    type Box = { left: number; top: number; right: number; bottom: number };
    const emptyBox = (): Box => ({ left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
    // Document-coordinate boxes of the name and of the planner figure's roosts.
    let nameBox = emptyBox();
    /** Glowing beacons ([data-flock-glow], e.g. the planner's antenna), document coords. */
    let beacons: { x: number; y: number; r: number }[] = [];
    let beaconFrom = 0;
    const sampleBeacons = () => {
      const sy = window.scrollY;
      // Fade in once the doodle has drawn itself (only when the beacons are new).
      if (!beacons.length) beaconFrom = performance.now() + 900;
      beacons = Array.from(document.querySelectorAll('[data-flock-glow]'))
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0)
        // The glow sits on the round tip at the top of the element (or its centre if it is a dot).
        .map((r) => ({ x: r.left + r.width / 2, y: Math.min(r.top + r.width / 2, r.top + r.height / 2) + sy, r: Math.max(4, r.width / 2) }));
    };
    const roostBox = emptyBox();
    /** Whether the name (0) and the figure (1) are on screen. */
    const groupVisible = [false, false];
    let nextHopAt = 0;
    let nextFlutterAt = 0;
    /** Sitting birds that will take off because a neighbour just did. */
    const startles: { b: Bird; at: number }[] = [];
    /** The swarm over the planner's head (document coords). */
    let swarm = { cx: 0, cy: 0, rx: 1, ry: 1 };
    /** The planner's head centre (document coords), for `flock:watch`. */
    let headC: { x: number; y: number } | null = null;
    let watchAt = 0;
    let watching = false;
    let loop: Loop = { cx: 0, cy: 0, rx: 1, ry: 1, w: 0.005 };
    let lastScrollY = window.scrollY;
    let scrollWind = 0;
    let raf = 0;
    let running = true;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    // ---------- Theme: bird ink and an optional soft glow, from CSS custom properties ----------
    const theme = { ink: '17, 17, 17', alpha: 0.7, glow: 'rgba(255, 230, 0, 0)', blur: 0, beacon: '255, 214, 0' };
    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      const v = (name: string) => cs.getPropertyValue(name).trim().replace(/^["']|["']$/g, '');
      const num = (name: string, fallback: number) => {
        const n = parseFloat(v(name));
        return Number.isFinite(n) ? n : fallback;
      };
      theme.ink = v('--flock-ink') || '17, 17, 17';
      theme.alpha = Math.max(0, Math.min(1, num('--flock-alpha', 0.7)));
      theme.glow = v('--flock-glow') || 'rgba(255, 230, 0, 0)';
      theme.blur = Math.max(0, num('--flock-glow-blur', 0));
      theme.beacon = v('--flock-beacon') || '255, 214, 0';
    };
    readTheme();
    const glowOn = () => {
      if (theme.blur <= 0) return;
      ctx.shadowColor = theme.glow;
      ctx.shadowBlur = theme.blur * dpr;
    };
    const glowOff = () => {
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    };

    const blank = (): Bird => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      mode: 'hidden',
      tx: 0,
      ty: 0,
      launchAt: 0,
      loopDur: 0,
      loopFrom: 0,
      hx: 0,
      hy: 0,
      appearAt: 0,
      rr: 1,
      ox: 0,
      oy: 0,
      until: 0,
      orbit: 0,
      spin: 1,
      fold: 0,
      roost: false,
      retireAt: 0,
      freeUntil: 0,
      group: -1,
      hop: false,
      phase: rand(0, Math.PI * 2),
      angle: 0,
      nerve: rand(0, 1),
      side: Math.random() < 0.5 ? -1 : 1,
    });

    // ---------- Ambient flock ----------
    // A small, calm background flock: it should never pull focus from the content.
    // Only a handful roam on their own; clicking the planner's face sends out more for a while.
    const groupSize = () => (small() ? 2 : 3);
    const ambientCount = () => 2 * groupSize();
    const makeAmbient = (): Bird => {
      const b = blank();
      b.x = rand(0, W);
      b.y = rand(0, H);
      b.vx = rand(-1, 1);
      b.vy = rand(-1, 1);
      b.mode = 'ambient';
      return b;
    };
    // The resting flock always moves in groups: one over the left strip, one over the right.
    {
      for (let g = 0; g < 2; g++) {
        const cx = groupHomeX(g);
        const cy = rand(H * 0.2, H * 0.8);
        for (let i = 0; i < groupSize(); i++) {
          const b = makeAmbient();
          b.group = g;
          b.x = cx + rand(-30, 30);
          b.y = cy + rand(-30, 30);
          birds.push(b);
        }
      }
    }

    // ---------- Perches: the top contour of the name ----------
    const origin = () => {
      const el = document.querySelector('[data-flock-origin]');
      if (!el) return { x: W * 0.75, y: H * 0.35 };
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };

    interface Mask {
      data: Uint8ClampedArray;
      w: number;
      h: number;
      /** Document coordinates of pixel (0, 0). */
      ox: number;
      oy: number;
      /** Font size in px. */
      fs: number;
    }

    const samplePerches = (): [number, number][] => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('[data-flock-text]'));
      if (!els.length) return [];
      const off = document.createElement('canvas');
      const octx = off.getContext('2d', { willReadFrequently: true });
      if (!octx) return [];
      const masks: Mask[] = [];
      const box = emptyBox();
      for (const el of els) {
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        const cs = getComputedStyle(el);
        const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const w = Math.ceil(rect.width) + 16;
        const h = Math.ceil(rect.height) + 16;
        off.width = w;
        off.height = h;
        octx.clearRect(0, 0, w, h);
        octx.font = font;
        octx.textBaseline = 'alphabetic';
        octx.fillStyle = '#000';
        const text = el.textContent ?? '';
        const m = octx.measureText(text);
        const asc = m.fontBoundingBoxAscent;
        const desc = m.fontBoundingBoxDescent;
        // An inline box is exactly the font's content area; a block or inline-block is the line box.
        const lh = cs.display === 'inline' ? rect.height : cs.lineHeight === 'normal' ? asc + desc : parseFloat(cs.lineHeight);
        const baseline = (lh - (asc + desc)) / 2 + asc;
        octx.fillText(text, 8, 8 + baseline);
        masks.push({
          data: octx.getImageData(0, 0, w, h).data,
          w,
          h,
          ox: rect.left - 8,
          oy: rect.top - 8 + window.scrollY,
          fs: parseFloat(cs.fontSize) || 48,
        });
        box.top = Math.min(box.top, rect.top + window.scrollY);
        box.bottom = Math.max(box.bottom, rect.bottom + window.scrollY);
        box.left = Math.min(box.left, rect.left);
        box.right = Math.max(box.right, rect.right);
      }
      if (!masks.length) return [];
      nameBox = box;

      const inked = (m: Mask, x: number, y: number) =>
        x >= 0 && y >= 0 && x < m.w && y < m.h && m.data[(y * m.w + x) * 4 + 3] > 140;
      // Would a perched bird at (X, Y) (document coords) touch any letter?
      const touches = (X: number, Y: number) => {
        for (const m of masks) {
          const x0 = Math.floor(X - PERCH_REACH - 1 - m.ox);
          const x1 = Math.ceil(X + PERCH_REACH + 1 - m.ox);
          const y0 = Math.floor(Y - 8 - m.oy);
          const y1 = Math.ceil(Y + 1.5 - m.oy);
          if (x1 < 0 || y1 < 0 || x0 >= m.w || y0 >= m.h) continue;
          for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inked(m, x, y)) return true;
        }
        return false;
      };

      // Birds sit at least a full wingspan apart, so neighbours never overlap.
      const step = Math.ceil(PERCH_REACH * 2 + (small() ? 4 : 3));
      const out: [number, number][] = [];
      for (const m of masks) {
        // Topmost inked row of every column.
        const tops = new Int32Array(m.w).fill(-1);
        for (let x = 0; x < m.w; x++) {
          for (let y = 0; y < m.h; y++) {
            if (m.data[(y * m.w + x) * 4 + 3] > 140) {
              tops[x] = y;
              break;
            }
          }
        }
        // Birds sit along the cap line, not down in the pockets between letters.
        let capTop = Infinity;
        for (let x = 0; x < m.w; x++) if (tops[x] >= 0) capTop = Math.min(capTop, tops[x]);
        const pocket = m.fs * 0.25;
        // Walk the contour left to right; a bird sits wherever the top is level enough,
        // at least one step from the previous bird.
        const reach = Math.ceil(PERCH_REACH + 1);
        let lastX = -Infinity;
        for (let x = 8; x < m.w - 8; x++) {
          if (tops[x] < 0 || x - lastX < step) continue;
          // The bird's wings span a few columns: sit above the highest ink under them.
          let mt = tops[x];
          for (let k = x - reach; k <= x + reach; k++) {
            if (k >= 0 && k < m.w && tops[k] >= 0) mt = Math.min(mt, tops[k]);
          }
          // Skip steep slopes and dips between taller strokes; the bird would float in mid-air.
          if (tops[x] - mt > 5 || mt - capTop > pocket) continue;
          const X = x + m.ox;
          const Y = mt - 3 + m.oy;
          if (touches(X, Y)) continue;
          if (out.some(([px, py]) => Math.hypot(px - X, py - Y) < PERCH_REACH * 2 + 1)) continue;
          out.push([X, Y]);
          lastX = x;
        }
      }
      // Keep the count light: evenly thin past the cap.
      const cap = small() ? 40 : 80;
      if (out.length <= cap) return out;
      const thinned: [number, number][] = [];
      for (let i = 0; i < cap; i++) thinned.push(out[Math.floor((i * out.length) / cap)]);
      return thinned;
    };

    const enterFromSide = (b: Bird) => {
      b.x = Math.random() < 0.5 ? rand(-40, 0) : rand(W, W + 40);
      b.y = rand(0, H * 0.6);
      b.vx = 0;
      b.vy = 0;
      b.fold = 0;
      b.mode = 'land';
    };

    // Cue the planner: it looks up at the birds on its head, then shakes them off. HeroAgent can
    // animate both by listening for `flock:wake` (detail.phase 'look' | 'shake'); calling
    // preventDefault() on the 'shake' event tells the flock it handled the shake itself.
    // Otherwise the whole figure gets a small fallback shake.
    let wakeTimers: number[] = [];
    const wake = () => {
      wakeTimers.forEach((id) => window.clearTimeout(id));
      const cue = (phase: 'look' | 'shake') =>
        window.dispatchEvent(new CustomEvent('flock:wake', { detail: { phase, duration: SHAKE_MS }, cancelable: true }));
      wakeTimers = [
        window.setTimeout(() => cue('look'), LOOK_AT),
        window.setTimeout(() => {
          if (!cue('shake')) return;
          const fig = document.querySelector('[data-flock-origin]')?.closest('svg');
          fig?.animate?.(
            [
              { transform: 'translateX(0) rotate(0deg)' },
              { transform: 'translateX(-5px) rotate(-1.2deg)' },
              { transform: 'translateX(5px) rotate(1.2deg)' },
              { transform: 'translateX(-4px) rotate(-0.8deg)' },
              { transform: 'translateX(3px) rotate(0.5deg)' },
              { transform: 'translateX(0) rotate(0deg)' },
            ],
            { duration: SHAKE_MS, easing: 'ease-in-out' },
          );
        }, SHAKE_AT),
      ];
    };

    // The swarm mills in a flat cloud over the crown of the head (around the antenna),
    // staying clear of the face.
    const setSwarm = (r: DOMRect) => {
      const sy = window.scrollY;
      swarm = { cx: r.left + r.width / 2, cy: r.top + sy - r.height * 0.02, rx: r.width * 0.62, ry: r.height * 0.26 };
      headC = { x: r.left + r.width / 2, y: r.top + r.height / 2 + sy };
    };

    const buildFormation = (fromPlanner: boolean) => {
      sampleBeacons();
      nameBox = emptyBox();
      const named = samplePerches();
      // No roosts on the planner's tools: birds there were a distraction.
      const roosts: [number, number][] = [];
      const perches = named.concat(roosts);
      const o = origin();
      const now = performance.now();
      const sy = window.scrollY;
      const next: Bird[] = [];
      if (!perches.length) {
        formation = next;
        return;
      }

      // The swoop: an ellipse around the whole name, entered from the planner.
      const lb = nameBox;
      const cx = (lb.left + lb.right) / 2;
      const cy = (lb.top + lb.bottom) / 2;
      const rx = Math.max(60, Math.min((lb.right - lb.left) / 2 + 44, W / 2 - 14));
      const ry = (lb.bottom - lb.top) / 2 + 34;
      const th0 = Math.atan2((o.y + sy - cy) / ry, (o.x - cx) / rx);
      // Each bird peels off when the flock passes over its perch on the top of the ellipse.
      const sweeps = perches.map(([px]) => {
        let end = -Math.acos(Math.max(-1, Math.min(1, (px - cx) / rx)));
        while (th0 - end < 5.4) end -= Math.PI * 2;
        return th0 - end;
      });
      const maxSweep = Math.max(...sweeps);
      const minSweep = Math.min(...sweeps);
      const w = Math.max((Math.PI * 2) / 1250, maxSweep / 1600);
      loop = { cx, cy, rx, ry, w };
      // Release the longest sweeps first so the whole flock lands at about the same time.
      const spread = Math.max(250, Math.min(450, (maxSweep - minSweep) / w));
      const headEl = document.querySelector('[data-flock-origin]');
      if (headEl) setSwarm(headEl.getBoundingClientRect());
      else headC = null;
      const swarming = fromPlanner && !!headEl;
      const order = perches.map((_, i) => i).sort((a, b) => sweeps[b] - sweeps[a]);
      const slot = new Array<number>(perches.length);
      order.forEach((idx, k) => (slot[idx] = perches.length > 1 ? k / (perches.length - 1) : 0));

      for (let i = 0; i < perches.length; i++) {
        const [tx, ty] = perches[i];
        const existing = formation[i];
        const b = existing ?? blank();
        b.tx = tx;
        b.ty = ty;
        b.roost = i >= named.length;
        if (fromPlanner) {
          b.fold = 0;
          b.loopFrom = th0;
          b.loopDur = sweeps[i] / w;
          b.ox = rand(-20, 20);
          b.oy = rand(-14, 14);
          if (swarming) {
            // Pour out of the planner's head and mill over it until it shakes them off.
            b.x = o.x + rand(-8, 8);
            b.y = o.y + rand(-8, 8);
            b.vx = rand(-1.5, 1.5);
            b.vy = -rand(1, 3);
            b.mode = 'crowd';
            b.orbit = rand(0, Math.PI * 2);
            b.spin = (Math.random() < 0.5 ? -1 : 1) * rand(0.0022, 0.0055);
            b.rr = Math.sqrt(Math.random()) * 0.85 + 0.15;
            b.appearAt = now + rand(0, CROWD_IN);
            b.launchAt = now + TAKEOFF_AT + slot[i] * spread + rand(0, 60);
          } else {
            // No planner on this page: pour straight out of the fallback origin.
            b.hx = o.x;
            b.hy = o.y + sy;
            b.x = o.x + rand(-6, 6);
            b.y = o.y + rand(-6, 6);
            b.vx = rand(-3, 3);
            b.vy = rand(-4, 1);
            b.mode = 'launch';
            b.launchAt = now + 150 + slot[i] * spread + rand(0, 40);
          }
        } else if (!existing) {
          if (groupVisible[b.roost ? 1 : 0]) enterFromSide(b);
        } else if (b.mode === 'sit') {
          b.mode = 'land';
        }
        next.push(b);
      }
      formation = next;
      if (fromPlanner) {
        nextHopAt = now + rand(4500, 6500);
        if (swarming) wake();
      }
    };

    const takeOff = (b: Bird, t: number, fromX: number, fromY: number, hop = false, spread = true) => {
      // Alarm spreads: when a bird is startled off its perch, close neighbours follow a beat later.
      if (!hop && spread && b.mode === 'sit') {
        for (const o of formation) {
          if (o === b || o.mode !== 'sit') continue;
          if (Math.hypot(o.x - b.x, o.y - b.y) < PERCH_REACH * 6) startles.push({ b: o, at: t + rand(90, 280) });
        }
      }
      const dx = b.x - fromX;
      const dy = b.y - fromY;
      const d = Math.hypot(dx, dy) || 1;
      b.mode = 'fly';
      b.hop = hop;
      const kick = hop ? 0.35 : 1;
      b.vx += ((dx / d) * rand(2, 3.5) + rand(-1, 1)) * kick;
      b.vy += -rand(3, 5) * kick;
      b.until = t + (hop ? rand(900, 1600) : rand(1000, 1800));
      b.orbit = Math.atan2(b.y - (b.ty - window.scrollY - 46), b.x - b.tx);
      b.spin = Math.random() < 0.5 ? -1 : 1;
    };

    // ---------- Pointer, clicks, perching, scroll ----------
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = e.pointerType === 'mouse' || e.pointerType === 'pen';
      pointer.lastMove = performance.now();
    };
    const onLeaveWindow = () => {
      pointer.active = false;
      pointer.x = pointer.y = -9999;
    };
    const onDown = (e: PointerEvent) => {
      const now = performance.now();
      ripples.push({ x: e.clientX, y: e.clientY + window.scrollY, t0: now });
      for (const b of birds.concat(formation)) {
        if (b.mode === 'hidden' || b.mode === 'leave' || b.mode === 'launch') continue;
        const dx = b.x - e.clientX;
        const dy = b.y - e.clientY;
        const d = Math.hypot(dx, dy);
        if (d < 190 && d > 0.01) {
          if (b.mode === 'sit' || b.mode === 'land' || b.mode === 'fly') {
            takeOff(b, now, e.clientX, e.clientY);
            continue;
          }
          const k = (1 - d / 190) * 11;
          b.vx += (dx / d) * k;
          b.vy += (dy / d) * k;
          if (b.mode === 'perch' || b.mode === 'away') {
            b.mode = 'ambient';
            b.freeUntil = performance.now() + 7000;
          }
        }
      }
    };

    let perchEl: Element | null = null;
    /** The hovered clickable: centre, top edge (document coords) and size. */
    const hover = { cx: 0, cy: 0, top: 0, w: 0, h: 0 };
    const releasePerch = () => {
      for (const b of birds) {
        if (b.mode === 'perch') {
          b.mode = 'ambient';
          b.freeUntil = performance.now() + 7000;
          b.vy -= rand(1.5, 3);
          b.vx += rand(-1.5, 1.5);
        } else if (b.mode === 'away') {
          // Drift back in from the edge they left by.
          b.mode = 'ambient';
          b.freeUntil = performance.now() + 7000;
          b.x = Math.max(-20, Math.min(W + 20, b.x));
          b.vx = b.x < W / 2 ? rand(0.8, 1.6) : -rand(0.8, 1.6);
        }
      }
      perchEl = null;
    };
    // Hovering anything clickable in the page (not the sticky header, which hides the canvas)
    // gathers a few ambient birds onto its top edge.
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      let el = (e.target as Element | null)?.closest?.(HOVER_PERCH) ?? null;
      if (el && (el.closest('header') || !el.closest('main, footer'))) el = null;
      // The planner figure has its own roosting birds; leave its head button to them.
      if (el?.closest('figure')?.querySelector('[data-flock-roost]')) el = null;
      if (el === perchEl) return;
      releasePerch();
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 4) return;
      perchEl = el;
      const cx = r.left + r.width / 2;
      const cy = r.top;
      hover.cx = cx;
      hover.cy = r.top + r.height / 2 + window.scrollY;
      hover.top = r.top + window.scrollY;
      hover.w = r.width;
      hover.h = r.height;
      // The whole background flock answers: the nearest birds land on the top edge (spaced so
      // their wings never overlap) and the rest leave the screen, so nothing else moves while
      // the visitor is about to click.
      const free = birds.filter((b) => b.mode === 'ambient');
      free.sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy));
      const edge = Math.min(free.length, Math.max(1, Math.min(14, Math.floor(r.width / (PERCH_REACH * 2 + 5)))));
      // Cruise speed so every bird arrives in roughly 0.6-0.9 s (capped so nothing streaks).
      const cruise = (b: Bird, x: number, y: number) =>
        Math.max(3, Math.min(16, Math.hypot(x - b.x, y - window.scrollY - b.y) / rand(28, 36)));
      for (let i = 0; i < free.length; i++) {
        const b = free[i];
        if (i < edge) {
          b.mode = 'perch';
          b.tx = r.left + ((i + 0.5) / edge) * r.width + rand(-2, 2);
          b.ty = r.top + window.scrollY - 4;
          b.loopDur = cruise(b, b.tx, b.ty);
        } else {
          b.mode = 'away';
          b.loopDur = rand(6, 9);
        }
      }
    };

    // The planner agent sends out more agents when clicked.
    const onDispatch = (e: Event) => {
      const { x, y } = (e as CustomEvent<{ x: number; y: number }>).detail;
      for (let k = 0; k < 14; k++) {
        const a = rand(0, Math.PI * 2);
        const sp = rand(3, 7);
        const nb = makeAmbient();
        nb.x = x;
        nb.y = y;
        nb.vx = Math.cos(a) * sp;
        nb.vy = Math.sin(a) * sp;
        nb.retireAt = performance.now() + rand(18000, 30000);
        // Let the new birds spill out over the page for a while before they settle into the margins.
        nb.freeUntil = performance.now() + 8000;
        birds.push(nb);
      }
      // Keep the page calm: retire the oldest extra agents past the cap.
      const cap = ambientCount() + 42;
      while (birds.length > cap) {
        const idx = birds.findIndex((o) => o.mode === 'ambient' && o.group < 0);
        if (idx < 0) break;
        birds.splice(idx, 1);
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      scrollWind += (y - lastScrollY) * 0.035;
      lastScrollY = y;
    };

    let resizeTimer = 0;
    const onResize = () => {
      resizeCanvas();
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => buildFormation(false), 180);
    };

    const onVisibility = () => {
      // Paused while the tab is hidden, and while the visitor has chosen to hide the birds.
      running = !document.hidden && document.documentElement.dataset.flock !== 'off';
      cancelAnimationFrame(raf);
      if (running) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    // ---------- Simulation ----------
    const updateAmbient = (b: Bird, t: number) => {
      // Boids: separation, alignment, cohesion with nearby ambient birds.
      let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, n = 0;
      for (const o of birds) {
        if (o === b || o.mode !== 'ambient') continue;
        const dx = o.x - b.x;
        const dy = o.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 90 * 90) {
          n++;
          ax += o.vx;
          ay += o.vy;
          cx += o.x;
          cy += o.y;
          if (d2 < 36 * 36) {
            sx -= dx;
            sy -= dy;
          }
        }
      }
      if (n) {
        b.vx += (ax / n - b.vx) * 0.04 + (cx / n - b.x) * 0.0009;
        b.vy += (ay / n - b.vy) * 0.04 + (cy / n - b.y) * 0.0009;
      }
      b.vx += sx * 0.03;
      b.vy += sy * 0.03;

      // Group birds stick together with their group-mates, whatever the distance, and share a
      // home strip that slowly wanders up and down the page.
      if (b.group >= 0) {
        let gx = 0, gy = 0, gvx = 0, gvy = 0, gn = 0;
        for (const o of birds) {
          if (o === b || o.group !== b.group || o.mode !== 'ambient') continue;
          gx += o.x;
          gy += o.y;
          gvx += o.vx;
          gvy += o.vy;
          gn++;
        }
        if (gn) {
          b.vx += (gx / gn - b.x) * 0.004 + (gvx / gn - b.vx) * 0.05;
          b.vy += (gy / gn - b.y) * 0.004 + (gvy / gn - b.vy) * 0.05;
        }
        const homeX = groupHomeX(b.group);
        const homeY = H * (0.5 + 0.32 * Math.sin(t * 0.00018 + b.group * 2.4));
        b.vx += (homeX - b.x) * 0.0007;
        b.vy += (homeY - b.y) * 0.0006;
      }

      // Pointer: shy up close, curious from afar.
      if (pointer.active) {
        const dx = b.x - pointer.x;
        const dy = b.y - pointer.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 120) {
          const k = (1 - d / 120) * 0.9;
          b.vx += (dx / d) * k;
          b.vy += (dy / d) * k;
        } else if (d < 420 && t - pointer.lastMove < 2500) {
          b.vx -= (dx / d) * 0.035;
          b.vy -= (dy / d) * 0.035;
        }
      }

      // A slow wander so the flock never settles.
      b.phase += 0.012;
      b.vx += Math.cos(b.phase + b.y * 0.004) * 0.016;
      b.vy += Math.sin(b.phase * 0.8 + b.x * 0.003) * 0.016 - scrollWind * 0.02;

      // Keep out of text the visitor might be reading. Birds fade out as they near a text block
      // (see textClearance) and may drift a little way into its padding, but an invisible, springy
      // wall eases them back out: the deeper they go the harder it pushes, with no snapping.
      // Each bird has its own nerve and turning side, so they don't all react the same way.
      const wary = avoidStrength(b, t);
      for (const r of avoid) {
        if (wary <= 0) break;
        if (b.x < r.left - TEXT_FADE || b.x > r.right + TEXT_FADE || b.y < r.top - TEXT_FADE || b.y > r.bottom + TEXT_FADE) continue;
        const { d, nx, ny } = awayFrom(r, b.x, b.y);
        if (d >= TEXT_FADE) continue;
        // 0 at the edge of the padding, 1 on the text itself.
        const depth = 1 - d / TEXT_FADE;
        // Timid birds are pushed harder (and earlier); bold ones wander deeper before turning.
        const push = (0.012 + depth * depth * 0.6) * (1.35 - 0.7 * b.nerve) * wary;
        b.vx += nx * push;
        b.vy += ny * push;
        // Curve away along the edge rather than bouncing straight back.
        const curve = depth * 0.07 * b.side * wary;
        b.vx += -ny * curve;
        b.vy += nx * curve;
        // Heading in loses a little speed, so they hesitate and turn instead of bouncing.
        const into = b.vx * nx + b.vy * ny;
        if (into < 0) {
          b.vx -= nx * into * depth * 0.08;
          b.vy -= ny * into * depth * 0.08;
        }
      }

      // Keep to the viewport with a soft margin.
      const m = 40;
      if (b.x < m) b.vx += 0.12;
      if (b.x > W - m) b.vx -= 0.12;
      if (b.y < m + 70) b.vy += 0.12;
      if (b.y > H - m) b.vy -= 0.12;

      const sp = Math.hypot(b.vx, b.vy);
      const max = 1.0, min = 0.35;
      if (sp > max) {
        b.vx = (b.vx / sp) * max;
        b.vy = (b.vy / sp) * max;
      } else if (sp < min) {
        b.vx = (b.vx / (sp || 1)) * min;
        b.vy = (b.vy / (sp || 1)) * min;
      }
      b.x += b.vx;
      b.y += b.vy;
    };

    const updateTargeted = (b: Bird, tx: number, ty: number, stiffness: number, damping: number, shy: boolean) => {
      b.vx += (tx - b.x) * stiffness;
      b.vy += (ty - b.y) * stiffness;
      if (shy && pointer.active) {
        const dx = b.x - pointer.x;
        const dy = b.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 85 * 85) {
          const d = Math.sqrt(d2) || 1;
          const k = (1 - d / 85) * 3.2;
          b.vx += (dx / d) * k;
          b.vy += (dy / d) * k;
        }
      }
      b.vx *= damping;
      b.vy *= damping;
      b.x += b.vx;
      b.y += b.vy;
    };

    const nearPointer = (x: number, y: number, r: number) =>
      pointer.active && Math.abs(pointer.x - x) < r && Math.abs(pointer.y - y) < r && Math.hypot(pointer.x - x, pointer.y - y) < r;

    const updatePercher = (b: Bird, t: number, sy: number) => {
      const px = b.tx;
      const py = b.ty - sy; // perch in viewport coords
      switch (b.mode) {
        case 'crowd': {
          if (t < b.appearAt) return;
          if (t >= b.launchAt) {
            // Shaken off: a startled flap upward, then into the swoop from right here.
            b.mode = 'loop';
            b.hx = b.x;
            b.hy = b.y + sy;
            b.vx += rand(-2.5, 2.5);
            b.vy -= rand(3, 5);
            break;
          }
          // Each bird drifts round its own loose orbit, so the swarm churns without a pattern.
          const th = b.orbit + b.spin * (t - b.appearAt);
          const gx = swarm.cx + Math.cos(th) * swarm.rx * b.rr;
          const gy = swarm.cy - sy + Math.sin(th) * swarm.ry * b.rr + Math.sin(t * 0.004 + b.phase) * 5;
          updateTargeted(b, gx, gy, 0.035, 0.88, false);
          b.fold *= 0.8;
          return;
        }
        case 'loop': {
          const age = t - b.launchAt;
          if (age >= b.loopDur) {
            b.mode = 'land';
            break;
          }
          // Follow the flock around the ellipse; ease in from where the bird took off.
          const th = b.loopFrom - loop.w * age;
          const ex = loop.cx + Math.cos(th) * loop.rx + b.ox;
          const ey = loop.cy + Math.sin(th) * loop.ry + b.oy - sy;
          const k = Math.min(1, age / 380);
          const e = k * k * (3 - 2 * k);
          const gx = b.hx + (ex - b.hx) * e;
          const gy = b.hy - sy + (ey - (b.hy - sy)) * e;
          updateTargeted(b, gx, gy, 0.12, 0.76, false);
          break;
        }
        case 'land': {
          updateTargeted(b, px, py, 0.04, 0.72, true);
          const d = Math.hypot(px - b.x, py - b.y);
          if (d < 0.8 && Math.hypot(b.vx, b.vy) < 0.3) {
            b.mode = 'sit';
            b.vx = b.vy = 0;
          }
          break;
        }
        case 'sit': {
          b.phase += 0.045;
          b.x = px;
          // Bob upward only, so the bird never dips into the letter.
          b.y = py - (0.5 + 0.5 * Math.sin(b.phase)) * 0.8;
          if (nearPointer(b.x, b.y, STARTLE)) takeOff(b, t, pointer.x, pointer.y);
          break;
        }
        case 'fly': {
          // Circle a little above the perch, then come back once the pointer has moved on.
          const s = b.hop ? 0.7 : 1;
          b.orbit += 0.07 * b.spin;
          const ox = px + Math.cos(b.orbit) * 34 * s;
          const oy = py - 46 * s + Math.sin(b.orbit) * 16 * s;
          updateTargeted(b, ox, oy, 0.012, 0.93, true);
          if (t > b.until) {
            if (nearPointer(px, py, STARTLE + 10)) b.until = t + 350;
            else b.mode = 'land';
          }
          break;
        }
        default:
          break;
      }
      b.fold += ((b.mode === 'sit' ? 1 : 0) - b.fold) * 0.2;
    };

    const tick = (t: number) => {
      if (!running) return;
      const sy = window.scrollY;
      scrollWind *= 0.9;
      if (t - avoidAt > 350) {
        refreshAvoid();
        avoidAt = t;
      }

      // Are the name and the planner figure on screen?
      for (let g = 0; g < 2; g++) {
        const box = g ? roostBox : nameBox;
        const visible = formation.length > 0 && box.bottom - sy > -40 && box.top - sy < H + 40;
        if (visible === groupVisible[g]) continue;
        groupVisible[g] = visible;
        // Perches are anchored to the page, so perched birds simply scroll away and back with
        // the name. The gathering flight only happens when the page loads. A bird that is still
        // waiting off screen (the page opened scrolled down) is put on its perch, not flown in.
        if (!visible) continue;
        for (const b of formation) {
          if (b.roost !== (g === 1)) continue;
          if (b.mode === 'hidden' || b.mode === 'leave') {
            b.x = b.tx;
            b.y = b.ty - sy;
            b.vx = b.vy = 0;
            b.fold = 1;
            b.mode = 'sit';
          }
        }
      }

      for (let i = startles.length - 1; i >= 0; i--) {
        const s0 = startles[i];
        if (t < s0.at) continue;
        startles.splice(i, 1);
        if (s0.b.mode === 'sit') takeOff(s0.b, t, s0.b.x + rand(-6, 6), s0.b.y + 12, false, false);
      }

      // Now and then a bird sitting on the planner's tools stretches its wings.
      if (t > nextFlutterAt) {
        nextFlutterAt = t + rand(1200, 2600);
        const sitting = formation.filter((b) => b.roost && b.mode === 'sit' && t >= b.until);
        const b = sitting[Math.floor(Math.random() * sitting.length)];
        if (b) b.until = t + rand(450, 850);
      }

      // Now and then one or two birds on the planner hop off and resettle.
      if (nextHopAt && t > nextHopAt) {
        nextHopAt = t + rand(2500, 5000);
        const sitting = formation.filter((b) => b.roost && b.mode === 'sit');
        for (let k = Math.min(sitting.length, Math.random() < 0.5 ? 1 : 2); k > 0; k--) {
          const b = sitting.splice(Math.floor(Math.random() * sitting.length), 1)[0];
          takeOff(b, t, b.x + rand(-10, 10), b.y + 10, true);
        }
      }

      // Let the planner watch birds flying close to it (HeroAgent can follow `flock:watch`
      // with its eyes; x/y are viewport coords, or null when nothing is flying nearby).
      if (headC && t - watchAt > 150) {
        watchAt = t;
        const hx = headC.x;
        const hy = headC.y - sy;
        let best: Bird | null = null;
        let bestD = 320;
        for (const b of formation) {
          if (b.mode !== 'fly' && b.mode !== 'crowd') continue;
          if (b.mode === 'crowd' && t < b.appearAt) continue;
          const d = Math.hypot(b.x - hx, b.y - hy);
          if (d < bestD) {
            bestD = d;
            best = b;
          }
        }
        if (best || watching) {
          watching = !!best;
          window.dispatchEvent(
            new CustomEvent('flock:watch', { detail: best ? { x: best.x, y: best.y } : { x: null, y: null } }),
          );
        }
      }

      for (const b of formation) {
        if (b.mode === 'hidden') continue;
        if (b.mode === 'launch') {
          if (t < b.launchAt) {
            b.x = b.hx;
            b.y = b.hy - sy;
            continue;
          }
          b.mode = 'loop';
        }
        if (b.mode === 'leave') {
          b.vy -= 0.08;
          b.vx *= 0.99;
          b.x += b.vx;
          b.y += b.vy;
          if (b.y < -30 || b.x < -30 || b.x > W + 30) b.mode = 'hidden';
        } else {
          updatePercher(b, t, sy);
        }
        const sp = Math.hypot(b.vx, b.vy);
        if (sp > 0.4) {
          const target = Math.atan2(b.vy, b.vx);
          b.angle += Math.atan2(Math.sin(target - b.angle), Math.cos(target - b.angle)) * 0.3;
        }
      }

      for (let i = birds.length - 1; i >= 0; i--) {
        const b = birds[i];
        if (!b.retireAt || t < b.retireAt) continue;
        // An extra agent's shift is over: it flies off the page, then is gone.
        if (b.mode === 'ambient') {
          b.mode = 'away';
          b.loopDur = rand(3, 5);
        } else if (b.mode === 'away' && (b.x < -25 || b.x > W + 25)) {
          birds.splice(i, 1);
        }
      }

      for (const b of birds) {
        if (b.mode === 'away') {
          // Leave by the nearest side and wait just off screen.
          const gx = b.x < W / 2 ? -30 : W + 30;
          b.vx += (Math.sign(gx - b.x) * b.loopDur - b.vx) * 0.08;
          b.vy += (-0.3 - b.vy) * 0.08;
          if (b.x < -25 || b.x > W + 25) {
            b.vx = 0;
            b.vy = 0;
          } else {
            b.x += b.vx;
            b.y += b.vy;
          }
          b.angle = b.vx >= 0 ? 0 : Math.PI;
        } else if (b.mode === 'perch') {
          // Arrive: cruise toward the edge, ease in, then sit still (birds on a clickable stay put).
          const tx = b.tx;
          const ty = b.ty - sy;
          const dx = tx - b.x;
          const dy = ty - b.y;
          let dvx = dx * 0.11;
          let dvy = dy * 0.11;
          const ds = Math.hypot(dvx, dvy);
          if (ds > b.loopDur) {
            dvx = (dvx / ds) * b.loopDur;
            dvy = (dvy / ds) * b.loopDur;
          }
          b.vx += (dvx - b.vx) * 0.25;
          b.vy += (dvy - b.vy) * 0.25;
          b.x += b.vx;
          b.y += b.vy;
          const settled = Math.abs(dx) < 2 && Math.abs(dy) < 2;
          b.fold += ((settled ? 1 : 0) - b.fold) * 0.2;
          const sp = Math.hypot(b.vx, b.vy);
          const target = sp > 0.5 ? Math.atan2(b.vy, b.vx) : Math.sin(b.phase * 0.3) > 0 ? 0 : Math.PI;
          b.angle += Math.atan2(Math.sin(target - b.angle), Math.cos(target - b.angle)) * 0.2;
        } else {
          b.fold *= 0.8;
          updateAmbient(b, t);
          const target = Math.atan2(b.vy, b.vx);
          b.angle += Math.atan2(Math.sin(target - b.angle), Math.cos(target - b.angle)) * 0.3;
        }
      }

      // ---------- Draw ----------
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Beacons: a soft pulsing glow behind the planner's antenna tip.
      for (const g of beacons) {
        const y = g.y - sy;
        if (y < -60 || y > H + 60) continue;
        const fade = Math.max(0, Math.min(1, (t - beaconFrom) / 700));
        if (!fade) continue;
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.0029);
        const rad = g.r * (2.4 + pulse * 1.1);
        const grad = ctx.createRadialGradient(g.x, y, g.r * 0.3, g.x, y, rad);
        grad.addColorStop(0, `rgba(${theme.beacon}, ${(0.55 + pulse * 0.35) * fade})`);
        grad.addColorStop(0.45, `rgba(${theme.beacon}, ${(0.22 + pulse * 0.2) * fade})`);
        grad.addColorStop(1, `rgba(${theme.beacon}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(g.x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flap and glide, like real gulls: bursts of full wingbeats, then a few beats held level.
      const wingbeat = (b: Bird, rate: number) => {
        const env = 0.5 + 0.5 * Math.sin(t * 0.0011 + b.phase * 5);
        return Math.sin(t * rate + b.phase * 3) * env + (1 - env) * 0.35;
      };
      // Wing shape for a bird with fold f (0 = flying, 1 = folded): lift base and stroke depth.
      const wings = (f: number): [number, number, number] => [7 + (PERCH_SPAN - 7) * f, 2.6 + (2.4 - 2.6) * f, 4.6 * (1 - f)];

      // A little doodled gull: two quadratic curves meeting at the body.
      const gull = (b: Bird, flap: number, span: number, liftBase: number, amp = 2.2) => {
        // Doodled from afar, a bird stays level and only tilts as it climbs or dives.
        const tilt = Math.max(-0.45, Math.min(0.45, b.vy * 0.18)) * (b.vx >= 0 ? 1 : -1);
        const ax = Math.cos(tilt);
        const ay = Math.sin(tilt);
        span *= BIRD;
        const lift = (liftBase + flap * amp) * BIRD;
        ctx.moveTo(b.x - ax * span, b.y - ay * span - lift * 0.3);
        ctx.quadraticCurveTo(b.x - ax * span * 0.5, b.y - ay * span * 0.5 - lift, b.x, b.y);
        ctx.quadraticCurveTo(b.x + ax * span * 0.5, b.y + ay * span * 0.5 - lift, b.x + ax * span, b.y + ay * span - lift * 0.3);
      };

      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Name perchers: same gulls, wings folding as they settle.
      glowOn();
      ctx.strokeStyle = `rgba(${theme.ink}, ${Math.min(1, theme.alpha + 0.05)})`;
      ctx.beginPath();
      for (const b of formation) {
        if (b.mode === 'hidden' || b.mode === 'launch' || b.mode === 'crowd') continue;
        if (b.y < -10 || b.y > H + 10) continue;
        let f = b.fold;
        let flap = wingbeat(b, 0.016);
        // Birds sitting on the planner's tools now and then stretch and flutter their wings.
        if (b.mode === 'sit' && b.roost && t < b.until) {
          f = 0.35;
          flap = Math.sin(t * 0.045 + b.phase);
        }
        const [span, lift, amp] = wings(f);
        gull(b, flap, span, lift, amp);
      }
      ctx.stroke();
      glowOff();

      // The swarm over the planner's head: smaller and fainter, a texture more than a crowd.
      ctx.strokeStyle = `rgba(${theme.ink}, ${theme.alpha * 0.55})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (const b of formation) {
        if (b.mode !== 'crowd' || t < b.appearAt) continue;
        gull(b, Math.sin(t * 0.02 + b.phase * 3), 5, 2, 3.4);
      }
      ctx.stroke();
      ctx.lineWidth = 2;
      glowOn();

      // Ambient birds: little doodled gulls, wings flapping.
      // Pass 0: birds landed on a hovered element, in full ink and glow (the foreground).
      // Pass 1: the background flock, half ink.
      // Pass 1 birds fade out as they near text, so each is stroked with its own alpha.
      for (const pass of [0, 1]) {
        if (pass === 0) {
          ctx.strokeStyle = `rgba(${theme.ink}, ${theme.alpha})`;
          ctx.beginPath();
        }
        for (const b of birds) {
          if (b.mode === 'away' && (b.x < -12 || b.x > W + 12)) continue;
          const landed = b.mode === 'perch';
          if (landed !== (pass === 0)) continue;
          const [span, lift, amp] = wings(b.fold);
          if (landed) {
            gull(b, wingbeat(b, 0.009), span, lift, amp);
          } else {
            const k = 1 - avoidStrength(b, t) * (1 - textClearance(b.x, b.y));
            if (k <= 0.02) continue;
            ctx.strokeStyle = `rgba(${theme.ink}, ${theme.alpha * (theme.blur > 0 ? 0.85 : 0.75) * k})`;
            ctx.beginPath();
            gull(b, wingbeat(b, 0.009), span * AMBIENT_SCALE, lift * AMBIENT_SCALE, amp);
            ctx.stroke();
          }
        }
        if (pass === 0) ctx.stroke();
      }
      glowOff();

      // Click bursts: a quick marker ring and spark dashes.
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = (t - r.t0) / 520;
        if (age >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        const ease = 1 - Math.pow(1 - age, 3);
        const x = r.x;
        const y = r.y - sy;
        ctx.strokeStyle = `rgba(${theme.ink}, ${0.85 * (1 - age)})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        const rad = 8 + ease * 30;
        ctx.ellipse(x, y, rad, rad * 0.92, 0.4, 0, Math.PI * 2 * Math.min(1, age * 2.2));
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 111, 181, ${1 - age})`;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * Math.PI * 2 + 0.3;
          const r1 = 14 + ease * 30;
          const r2 = r1 + 9 * (1 - age);
          ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
          ctx.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2);
        }
        ctx.stroke();
      }

      raf = requestAnimationFrame(tick);
    };

    // ---------- Start ----------
    let ready = false;
    const launch = () => {
      if (!ready) return;
      formation = [];
      groupVisible[0] = groupVisible[1] = false;
      buildFormation(true);
    };
    launchRef.current = launch;
    const start = () => {
      ready = true;
      readTheme();
      launch();
      onVisibility();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeaveWindow);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('flock:dispatch', onDispatch);
    window.addEventListener('flock:theme', readTheme);
    window.addEventListener('flock:toggle', onVisibility);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    const onReduce = () => {
      if (reduce.matches) {
        running = false;
        cancelAnimationFrame(raf);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    reduce.addEventListener('change', onReduce);

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) start();
    });

    return () => {
      cancelled = true;
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      wakeTimers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('flock:dispatch', onDispatch);
      window.removeEventListener('flock:theme', readTheme);
      window.removeEventListener('flock:toggle', onVisibility);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      reduce.removeEventListener('change', onReduce);
      launchRef.current = null;
    };
  }, []);

  // A new page may have its own name to perch on (or none): rescan after it renders.
  useEffect(() => {
    const id = requestAnimationFrame(() => launchRef.current?.());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return <canvas ref={canvasRef} className="flock-canvas" aria-hidden="true" />;
}
