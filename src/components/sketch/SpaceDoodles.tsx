import type { CSSProperties, ReactNode } from 'react';
import Drift from './Drift';
import { PHYSICS } from './physicsData';

const INK = 'var(--color-ink)';
const TEAL = 'var(--color-teal)';
const PINK = 'var(--color-pink)';
const YELLOW = 'var(--color-yellow)';

function Ink({ d, i, color = INK, width = 1.5, dur }: { d: string; i: number; color?: string; width?: number; dur?: string }) {
  return (
    <path
      d={d}
      pathLength={1}
      className="ink-stroke"
      fill="none"
      stroke={color}
      strokeWidth={width}
      style={{ '--i': i, ...(dur ? { '--draw-dur': dur } : {}) } as CSSProperties}
    />
  );
}

function Label({ x, y, children, size = 11, anchor = 'start' }: { x: number; y: number; children: ReactNode; size?: number; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} fontSize={size} textAnchor={anchor} fill={INK} className="ink-label space-label">
      {children}
    </text>
  );
}

/**
 * A zoom-whirl orbit in Schwarzschild spacetime, to scale: horizon at 2M,
 * photon sphere at 3M, ISCO at 6M. The dot moves at a constant rate of proper
 * time, so it races through the whirls near periapsis.
 */
function Geodesic() {
  const g = PHYSICS.geodesic;
  const c = g.size / 2;
  return (
    <svg viewBox={`0 0 ${g.size} ${g.size}`} className="h-auto w-full overflow-visible" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <radialGradient id="geo-glow">
          <stop offset="55%" stopColor="rgb(255 226 140 / 0)" />
          <stop offset="72%" stopColor="rgb(255 226 140 / 0.16)" />
          <stop offset="100%" stopColor="rgb(255 226 140 / 0)" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={g.photonSphere * 1.6} fill="url(#geo-glow)" />
      <circle cx={c} cy={c} r={g.isco} fill="none" stroke={INK} strokeWidth={1} strokeDasharray="1 4" />
      <circle cx={c} cy={c} r={g.photonSphere} fill="none" stroke={YELLOW} strokeWidth={1.1} strokeDasharray="4 4" />
      <circle cx={c} cy={c} r={g.horizon} fill="#000" stroke={INK} strokeWidth={1.4} />
      <Ink d={g.orbit} i={0} color={TEAL} width={1.4} dur="7s" />
      {/* A paper-style key for the three radii. */}
      <g transform={`translate(6 ${g.size - 44})`}>
        <circle cx={7} cy={0} r={4} fill="#000" stroke={INK} strokeWidth={1.2} />
        <Label x={18} y={4} size={10}>horizon, 2M</Label>
        <path d="M1 15 L13 15" stroke={YELLOW} strokeWidth={1.1} strokeDasharray="4 3" />
        <Label x={18} y={19} size={10}>photon sphere, 3M</Label>
        <path d="M1 30 L13 30" stroke={INK} strokeWidth={1} strokeDasharray="1 3" />
        <Label x={18} y={34} size={10}>ISCO, 6M</Label>
      </g>
      <circle r={3} fill={YELLOW} className="geo-dot">
        <animateMotion
          dur="26s"
          repeatCount="indefinite"
          calcMode="linear"
          keyTimes={g.keyTimes}
          keyPoints={g.keyPoints}
          path={g.orbit}
        />
        <animate attributeName="opacity" dur="26s" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.03;0.97;1" />
      </circle>
    </svg>
  );
}

/**
 * Equipotentials of the Roche potential for a q = 0.35 binary in the
 * co-rotating frame: the critical figure-eight through L1, the L2 dumbbell,
 * the tadpoles around L4 and L5, and all five Lagrange points. The frame
 * turns slowly about the barycentre, as the binary does.
 */
function Roche() {
  const r = PHYSICS.roche;
  const sub = (name: string) => (
    <>
      L<tspan baselineShift="sub" fontSize="7">{name.slice(1)}</tspan>
    </>
  );
  return (
    <svg viewBox={`0 0 ${r.width} ${r.height}`} className="h-auto w-full overflow-visible" strokeLinecap="round" strokeLinejoin="round">
      <g className="roche-frame">
        {r.between.map((d, n) => (
          <Ink key={`b${n}`} d={d} i={1 + n} color={PINK} width={1.1} dur="1.6s" />
        ))}
        {r.outer.map((d, n) => (
          <Ink key={`o${n}`} d={d} i={1 + n} width={1} dur="1.6s" />
        ))}
        {r.inner.map((d, n) => (
          <Ink key={`i${n}`} d={d} i={3 + n} width={1} dur="1.2s" />
        ))}
        {r.critical.map((d, n) => (
          <Ink key={`c${n}`} d={d} i={0} color={TEAL} width={2} dur="2.4s" />
        ))}
        {r.stars.map((s, n) => (
          <circle key={`s${n}`} cx={s.x} cy={s.y} r={s.r} fill={n === 0 ? YELLOW : INK} className="roche-star" />
        ))}
        <path
          d={`M${r.barycentre.x - 3} ${r.barycentre.y - 3} L${r.barycentre.x + 3} ${r.barycentre.y + 3} M${r.barycentre.x + 3} ${r.barycentre.y - 3} L${r.barycentre.x - 3} ${r.barycentre.y + 3}`}
          stroke={INK}
          strokeWidth={1}
        />
        {r.lagrange.map((p) => (
          <g key={p.name} className="roche-upright">
            <path d={`M${p.x - 4} ${p.y} L${p.x + 4} ${p.y} M${p.x} ${p.y - 4} L${p.x} ${p.y + 4}`} stroke={YELLOW} strokeWidth={1.3} />
            <Label x={p.x + 5} y={p.y - 5}>{sub(p.name)}</Label>
          </g>
        ))}
      </g>
    </svg>
  );
}

/**
 * Two far-off diagrams for the night sky, in the side margins only: a
 * relativistic orbit on the left and a binary's Roche lobes on the right.
 * Dark mode and wide screens only, faded, behind everything.
 */
export default function SpaceDoodles() {
  return (
    <div className="space-doodles draw-load" aria-hidden="true">
      <Drift distance={140} className="space-left">
        <Geodesic />
      </Drift>
      <Drift distance={260} className="space-right">
        <Roche />
      </Drift>
    </div>
  );
}
