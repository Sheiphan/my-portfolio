"use client";

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion, useSpring } from 'framer-motion';
import { arrowHead, roughCircle, roughLine, roughRect } from './rough';

const DISPATCH_EVENT = 'flock:dispatch';

/** Drawing is 520 x 600. The head is a big round face, as in the zine sketch. */
const HEAD = { cx: 250, cy: 150, r: 98 };
const EYES = [
  { cx: 214, cy: 140 },
  { cx: 286, cy: 140 },
];

/** A doodled three-finger hand whose fingertips touch (x, y). */
function hand(x: number, y: number, seed: number) {
  return [
    roughCircle(x, y - 15, 9, seed, 0.05),
    roughLine(x - 7, y - 9, x - 10, y, seed + 1, 1),
    roughLine(x, y - 7, x, y + 1, seed + 2, 1),
    roughLine(x + 7, y - 9, x + 10, y, seed + 3, 1),
  ].join(' ');
}

/**
 * The planner agent, after the zine sketch: a big round face whose arms reach
 * out to the Search and Code tools while a long line drops to Memory. Its eyes
 * follow the pointer, close into happy arcs when it grins at a
 * [data-mascot="grin"] action, it blinks, and clicking its head sends out more
 * tiny agents into the flock.
 */
export default function HeroAgent() {
  const svgRef = useRef<SVGSVGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const shakeRef = useRef<SVGGElement>(null);
  const reduceMotion = useReducedMotion();
  const [grin, setGrin] = useState(false);
  const px = useSpring(0, { stiffness: 220, damping: 20 });
  const py = useSpring(0, { stiffness: 220, damping: 20 });

  useEffect(() => {
    if (reduceMotion) return;
    let lastMove = 0;

    const lookAt = (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      const scale = r.width / 520;
      const cx = r.left + HEAD.cx * scale;
      const cy = r.top + EYES[0].cy * scale;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const d = Math.hypot(dx, dy) || 1;
      const reach = Math.min(7, d / 36);
      px.set((dx / d) * reach);
      py.set((dy / d) * reach * 0.8);
    };

    const onMove = (e: PointerEvent) => {
      lastMove = performance.now();
      lookAt(e.clientX, e.clientY);
    };
    // Between pointer moves, the planner keeps an eye on its nearest flying bird.
    let watching = false;
    const onWatch = (e: Event) => {
      const { x, y } = (e as CustomEvent<{ x: number | null; y: number | null }>).detail ?? { x: null, y: null };
      if (x === null || y === null) {
        watching = false;
        return;
      }
      if (performance.now() - lastMove < 1500) return; // the visitor's pointer comes first
      watching = true;
      lookAt(x, y);
    };

    // When nobody is moving the pointer, glance around now and then.
    const glance = window.setInterval(() => {
      if (watching || performance.now() - lastMove < 3000) return;
      const a = Math.random() * Math.PI * 2;
      const reach = Math.random() < 0.3 ? 0 : 4 + Math.random() * 3;
      px.set(Math.cos(a) * reach);
      py.set(Math.sin(a) * reach * 0.6);
    }, 2200);

    const isGrinTarget = (t: EventTarget | null) => !!(t as Element | null)?.closest?.('[data-mascot="grin"]');
    const onOver = (e: Event) => setGrin(isGrinTarget(e.target));
    const onFocusIn = (e: FocusEvent) => setGrin(isGrinTarget(e.target));
    const onFocusOut = () => setGrin(false);

    // The opening: birds crowd onto the head, it looks up, then shakes them off.
    let relief = 0;
    const onWake = (e: Event) => {
      const detail = (e as CustomEvent<{ phase: 'look' | 'shake'; duration?: number }>).detail;
      if (detail?.phase === 'look') {
        lastMove = performance.now() + 1200; // hold the upward glance
        px.set(0);
        py.set(-6);
      } else if (detail?.phase === 'shake') {
        e.preventDefault(); // we shake the head ourselves
        const duration = detail.duration ?? 560;
        shakeRef.current?.animate(
          [
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(-8deg)' },
            { transform: 'rotate(7deg)' },
            { transform: 'rotate(-5deg)' },
            { transform: 'rotate(3deg)' },
            { transform: 'rotate(0deg)' },
          ],
          { duration, easing: 'ease-in-out' },
        );
        window.clearTimeout(relief);
        relief = window.setTimeout(() => {
          setGrin(true);
          relief = window.setTimeout(() => setGrin(false), 700);
        }, duration);
      }
    };

    window.addEventListener('flock:wake', onWake);
    window.addEventListener('flock:watch', onWatch);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      window.clearInterval(glance);
      window.clearTimeout(relief);
      window.removeEventListener('flock:wake', onWake);
      window.removeEventListener('flock:watch', onWatch);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, [px, py, reduceMotion]);

  const dispatch = () => {
    const head = headRef.current;
    if (!head) return;
    const r = head.getBoundingClientRect();
    window.dispatchEvent(
      new CustomEvent(DISPATCH_EVENT, { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2 } }),
    );
    setGrin(true);
    window.setTimeout(() => setGrin(false), 900);
  };

  let i = 0;
  const stroke = (d: string, color = 'var(--color-ink)', width = 4.5) => (
    <path
      key={`s${i}`}
      d={d}
      pathLength={1}
      className="ink-stroke"
      fill="none"
      stroke={color}
      strokeWidth={width}
      style={{ '--i': i++ } as CSSProperties}
    />
  );
  const label = (x: number, y: number, text: string, order: number, anchor: 'start' | 'end' = 'start', rotate = 0) => (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={22}
      className="ink-label"
      fill="var(--color-ink)"
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
      style={{ '--i': order } as CSSProperties}
    >
      {text}
    </text>
  );

  // Draw order follows the sketch: antenna, head, face, the line to Memory,
  // the two arms, the three tools, then the margin note.
  const antenna = stroke(`${roughLine(250, 52, 249, 30, 4, 2)} ${roughCircle(249, 21, 9, 5)}`, 'var(--color-ink)', 4);
  const head = stroke(roughCircle(HEAD.cx, HEAD.cy, HEAD.r, 3, 0.03), 'var(--color-ink)', 5);
  const faceOrder = i++;
  const smile = stroke('M212 190 Q250 216 288 190', 'var(--color-ink)', 4.5);
  const toMemory = stroke(`M250 250 C256 330 238 430 242 514 ${arrowHead(242, 518, 243, 480, 15)}`, 'var(--color-ink)', 4);
  const leftArm = stroke('M200 236 C176 274 160 304 160 350', 'var(--color-teal)', 6.5);
  const leftHand = stroke(hand(160, 372, 40), 'var(--color-teal)', 4.5);
  const rightArm = stroke('M302 236 C330 272 346 318 346 372', 'var(--color-pink)', 6.5);
  const rightHand = stroke(hand(346, 394, 50), 'var(--color-pink)', 4.5);
  const searchBox = stroke(roughRect(50, 376, 152, 86, 11));
  const searchIcon = stroke(`${roughCircle(118, 414, 15, 12)} ${roughLine(129, 425, 142, 438, 13, 1)}`, 'var(--color-ink)', 3.5);
  const codeBox = stroke(roughRect(296, 398, 168, 86, 14));
  const codeIcon = stroke('M362 428 L348 441 L362 454 M398 428 L412 441 L398 454 M386 424 L374 458', 'var(--color-ink)', 3.5);
  const memoryBox = stroke(roughRect(132, 522, 170, 72, 15));
  // A database cylinder: the usual doodle for memory.
  const memoryIcon = stroke(
    'M196 544 a21 7 0 1 0 42 0 a21 7 0 1 0 -42 0 M196 544 V574 a21 7 0 0 0 42 0 V544 M196 559 a21 7 0 0 0 42 0',
    'var(--color-ink)',
    3.5,
  );
  const labelsOrder = i - 1;
  const noteArrow = stroke(`M384 104 C370 112 358 116 346 116 ${arrowHead(342, 117, 360, 116, 10)}`, 'var(--color-ink)', 3);
  const noteOrder = i - 1;
  // A cue for the clickable head, on the empty left side.
  const pokeArrow = stroke(`M126 66 C146 70 164 80 180 94 ${arrowHead(186, 100, 168, 84, 10)}`, 'var(--color-ink)', 3);
  const pokeOrder = i - 1;

  // The head is a button: centre and radius as a share of the 520 x 600 drawing.
  const button: CSSProperties = {
    left: `${((HEAD.cx - HEAD.r) / 520) * 100}%`,
    top: `${((HEAD.cy - HEAD.r) / 600) * 100}%`,
    width: `${((HEAD.r * 2) / 520) * 100}%`,
    height: `${((HEAD.r * 2) / 600) * 100}%`,
  };

  return (
    <figure className="hero-agent relative mx-auto w-full max-w-[640px] lg:-mr-6 xl:-mr-10">
      <svg
        ref={svgRef}
        viewBox="0 0 520 600"
        role="img"
        aria-label="Doodle: a planner agent reaches out to search and code tools with its arms and sends a line down to memory."
        className="draw-load block h-auto w-full overflow-visible"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ '--draw-stagger': '95ms', '--draw-dur': '520ms' } as CSSProperties}
      >
        <g ref={shakeRef} style={{ transformBox: 'view-box', transformOrigin: '250px 250px' }}>
        <g ref={headRef} data-flock-origin="">
          {head}
        </g>
        <g data-flock-glow="">{antenna}</g>

        {/* Eyes: dots that follow you, closing into happy arcs when it grins. */}
        <g className="agent-eyes ink-label" style={{ '--i': faceOrder } as CSSProperties}>
          {EYES.map((e, k) => (
            <motion.circle
              key={`eye${k}`}
              cx={e.cx}
              cy={e.cy}
              r={7.5}
              fill="var(--color-ink)"
              style={{ x: px, y: py, opacity: grin ? 0 : 1, transition: 'opacity 140ms' }}
            />
          ))}
        </g>
        <g style={{ opacity: grin ? 1 : 0, transition: 'opacity 140ms' }}>
          {EYES.map((e, k) => (
            <path
              key={`happy${k}`}
              d={`M${e.cx - 12} ${e.cy + 4} Q${e.cx} ${e.cy - 12} ${e.cx + 12} ${e.cy + 4}`}
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth={4.5}
            />
          ))}
        </g>

        <g style={{ opacity: grin ? 0 : 1, transition: 'opacity 140ms' }}>{smile}</g>
        <path
          d="M206 184 Q250 236 294 184 Q250 200 206 184 Z"
          fill="#fff"
          stroke="var(--color-ink)"
          strokeWidth={4.5}
          style={{ opacity: grin ? 1 : 0, transition: 'opacity 140ms' }}
        />
        </g>

        {toMemory}
        <g className="agent-arm" style={{ transformOrigin: '200px 236px' }}>
          {leftArm}
          {leftHand}
        </g>
        <g className="agent-arm" style={{ transformOrigin: '302px 236px', animationDelay: '3.1s' }}>
          {rightArm}
          {rightHand}
        </g>

        <g data-flock-roost="top" data-roost-count="2">{searchBox}</g>
        {searchIcon}
        <g data-flock-roost="top" data-roost-count="2">{codeBox}</g>
        {codeIcon}
        <g data-flock-roost="top" data-roost-count="2">{memoryBox}</g>
        {memoryIcon}

        {/* Handwritten labels at the corners, clear of the arms and lines. */}
        {label(48, 366, 'Search', labelsOrder, 'start', -3)}
        {label(466, 388, 'Code', labelsOrder, 'end', 3)}
        {label(132, 512, 'Memory', labelsOrder, 'start', -3)}

        <text x={392} y={78} fontSize={21} className="ink-label" fill="var(--color-ink)" transform="rotate(6 392 78)" style={{ '--i': noteOrder } as CSSProperties}>
          <tspan x={392}>the planner</tspan>
          <tspan x={392} dy={24}>agent!</tspan>
        </text>
        {noteArrow}
        <text x={22} y={58} fontSize={21} className="ink-label" fill="var(--color-ink)" transform="rotate(-6 22 58)" style={{ '--i': pokeOrder } as CSSProperties}>
          poke my head!
        </text>
        {pokeArrow}
      </svg>

      {/* The planner's head is a button: it sends out more agents. */}
      <button
        type="button"
        onClick={dispatch}
        className="agent-button"
        style={button}
        aria-label="Send out more tiny agents"
        title="Send out more agents"
      />
      <figcaption className="sr-only">A doodled planner agent routing work to tools with its two arms.</figcaption>
    </figure>
  );
}
