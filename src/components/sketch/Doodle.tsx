import type { CSSProperties, ReactNode } from 'react';
import { arrowHead, doodleArrow, roughCircle, roughLine, roughRect } from './rough';
import type { DoodleKind } from './doodles';

const DESCRIPTIONS: Record<DoodleKind, string> = {
  agents: 'Doodle: a planner agent routes work to search, code and memory tools, which combine into an answer.',
  research: 'Doodle: a research question branches out to web, paper and document sources that converge into a report.',
  rag: 'Doodle: documents are indexed, retrieved and passed to an LLM, which can re-query before it answers.',
  finetune: 'Doodle, illustrative: training loss falling across fine-tuning, preference alignment and quantization.',
  loop: 'Doodle: an agent loop that perceives the screen, plans, and acts, then repeats.',
};

const INK = 'var(--color-ink)';
const TEAL = 'var(--color-teal)';
const PINK = 'var(--color-pink)';

function pen() {
  let i = 0;
  const stroke = (d: string, color = INK, width = 3.5) => (
    <path
      key={`p${i}`}
      d={d}
      pathLength={1}
      className="ink-stroke"
      fill="none"
      stroke={color}
      strokeWidth={width}
      style={{ '--i': i++ } as CSSProperties}
    />
  );
  const highlight = (x: number, y: number, w: number, h: number) => (
    <g key={`h${i}`} transform={`rotate(-2 ${x + w / 2} ${y + h / 2})`}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="var(--color-yellow)"
        className="svg-highlight"
        style={{ mixBlendMode: 'multiply', '--i': i++ } as CSSProperties}
      />
    </g>
  );
  const at = () => i;
  return { stroke, highlight, at };
}

function Label({ x, y, children, order, size = 19, anchor = 'middle' }: {
  x: number; y: number; children: ReactNode; order: number; size?: number; anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} className="ink-label" fill={INK} style={{ '--i': order } as CSSProperties}>
      {children}
    </text>
  );
}

function drawing(kind: DoodleKind, seed: number) {
  const { stroke, highlight, at } = pen();
  const s = (n: number) => seed * 31 + n;
  switch (kind) {
    case 'agents': {
      return (
        <>
          {stroke(roughRect(170, 22, 140, 50, s(1)))}
          <Label x={240} y={54} order={at() - 1}>Planner</Label>
          {stroke(doodleArrow([214, 74], [190, 110], [92, 118], [80, 146], 11), TEAL)}
          {stroke(doodleArrow([240, 76], [242, 104], [238, 124], [240, 146], 11))}
          {stroke(doodleArrow([266, 74], [290, 110], [388, 118], [400, 146], 11), PINK)}
          {stroke(roughRect(22, 152, 116, 46, s(2)))}
          {stroke(roughRect(182, 152, 116, 46, s(3)))}
          {stroke(roughRect(342, 152, 116, 46, s(4)))}
          <Label x={80} y={181} order={at() - 3}>Search</Label>
          <Label x={240} y={181} order={at() - 2}>Code</Label>
          <Label x={400} y={181} order={at() - 1}>Memory</Label>
          {stroke(doodleArrow([80, 202], [84, 240], [200, 236], [228, 258], 10), INK, 2.75)}
          {stroke(doodleArrow([400, 202], [396, 240], [280, 236], [252, 258], 10), INK, 2.75)}
          {highlight(178, 266, 124, 26)}
          {stroke(roughRect(182, 258, 116, 40, s(5)))}
          <Label x={240} y={285} order={at() - 1}>Answer</Label>
        </>
      );
    }
    case 'research': {
      return (
        <>
          {stroke(roughRect(10, 128, 108, 48, s(1)))}
          <Label x={64} y={159} order={at() - 1}>Question</Label>
          {stroke(doodleArrow([118, 140], [150, 120], [150, 64], [184, 60], 10), TEAL)}
          {stroke(doodleArrow([118, 152], [140, 152], [160, 154], [184, 154], 10))}
          {stroke(doodleArrow([118, 164], [150, 184], [150, 244], [184, 248], 10), PINK)}
          {stroke(roughRect(190, 36, 100, 44, s(2)))}
          {stroke(roughRect(190, 132, 100, 44, s(3)))}
          {stroke(roughRect(190, 226, 100, 44, s(4)))}
          <Label x={240} y={64} order={at() - 3}>Web</Label>
          <Label x={240} y={160} order={at() - 2}>Papers</Label>
          <Label x={240} y={254} order={at() - 1}>Docs</Label>
          {stroke(doodleArrow([290, 58], [330, 60], [330, 140], [358, 146], 10), INK, 2.75)}
          {stroke(doodleArrow([290, 154], [314, 154], [336, 154], [358, 154], 10), INK, 2.75)}
          {stroke(doodleArrow([290, 248], [330, 246], [330, 168], [358, 162], 10), INK, 2.75)}
          {highlight(360, 138, 112, 30)}
          {stroke(roughRect(364, 128, 108, 50, s(5)))}
          <Label x={418} y={160} order={at() - 1}>Report</Label>
        </>
      );
    }
    case 'rag': {
      return (
        <>
          {stroke(`${roughRect(18, 96, 56, 64, s(1))} ${roughLine(26, 96, 26, 88, s(2), 1)} ${roughLine(26, 88, 82, 88, s(3), 1)} ${roughLine(82, 88, 82, 150, s(4), 1)}`)}
          <Label x={48} y={186} order={at() - 1}>Docs</Label>
          {stroke(`${roughLine(78, 128, 114, 128, s(5), 2)} ${arrowHead(118, 128, 100, 128, 10)}`, TEAL)}
          {stroke(`${roughRect(122, 98, 76, 60, s(6))} ${roughLine(122, 118, 198, 118, s(7), 1)} ${roughLine(122, 138, 198, 138, s(8), 1)} ${roughLine(148, 98, 148, 158, s(9), 1)} ${roughLine(173, 98, 173, 158, s(10), 1)}`)}
          <Label x={160} y={186} order={at() - 1}>Index</Label>
          {stroke(`${roughLine(202, 128, 234, 128, s(11), 2)} ${arrowHead(238, 128, 220, 128, 10)}`, TEAL)}
          {stroke(`${roughCircle(266, 122, 24, s(12))} ${roughLine(283, 140, 298, 156, s(13), 1)}`)}
          <Label x={268} y={186} order={at() - 1}>Retrieve</Label>
          {stroke(`${roughLine(300, 128, 326, 128, s(14), 2)} ${arrowHead(330, 128, 312, 128, 10)}`, TEAL)}
          {stroke(roughRect(334, 98, 70, 60, s(15)))}
          <Label x={369} y={134} order={at() - 1}>LLM</Label>
          {stroke(doodleArrow([346, 96], [326, 40], [268, 40], [266, 90], 10), PINK)}
          <Label x={300} y={32} order={at() - 1} size={17}>re-query</Label>
          {stroke(`${roughLine(369, 162, 369, 226, s(16), 2)} ${arrowHead(369, 230, 369, 210, 10)}`)}
          {highlight(312, 240, 120, 28)}
          {stroke(roughRect(310, 232, 120, 46, s(17)))}
          <Label x={370} y={262} order={at() - 1}>Answer</Label>
        </>
      );
    }
    case 'finetune': {
      return (
        <>
          {stroke(`${roughLine(60, 28, 62, 250, s(1), 2)} ${roughLine(60, 250, 462, 248, s(2), 2)}`)}
          <Label x={66} y={22} order={at() - 1} anchor="start">loss</Label>
          {stroke(`${roughLine(200, 40, 201, 248, s(3), 2)} ${roughLine(340, 40, 339, 248, s(4), 2)}`, TEAL, 2)}
          {stroke('M72 58 C110 64 142 140 190 166 S300 208 448 224', PINK, 4.5)}
          {highlight(394, 262, 82, 26)}
          <Label x={130} y={280} order={at() - 1}>Fine-tune</Label>
          <Label x={270} y={280} order={at() - 1}>Preference</Label>
          <Label x={434} y={280} order={at() - 1}>Quantize</Label>
          <Label x={462} y={22} order={at() - 1} anchor="end" size={15}>(illustrative)</Label>
        </>
      );
    }
    case 'loop': {
      return (
        <>
          {stroke(roughCircle(240, 152, 98, s(1), 0.02), TEAL, 3)}
          {stroke(`${arrowHead(326.6, 103, 318, 92, 12)} ${arrowHead(240, 250, 252, 250, 12)} ${arrowHead(153.4, 103, 150, 116, 12)}`, TEAL, 3)}
          {stroke(roughRect(188, 34, 104, 42, s(2)))}
          {stroke(roughRect(282, 184, 104, 42, s(3)))}
          {highlight(96, 192, 112, 28)}
          {stroke(roughRect(96, 184, 104, 42, s(4)))}
          <Label x={240} y={62} order={at() - 4}>Perceive</Label>
          <Label x={334} y={212} order={at() - 3}>Plan</Label>
          <Label x={148} y={212} order={at() - 1}>Act</Label>
          {stroke(`M218 140 L232 152 L218 164 ${roughLine(238, 166, 262, 166, s(5), 1)}`)}
        </>
      );
    }
  }
}

interface DoodleProps {
  kind: DoodleKind;
  className?: string;
  /** Draw on page load (above the fold) instead of waiting for a DrawOnView parent. */
  onLoad?: boolean;
  delay?: number;
  seed?: number;
}

/** A hand-drawn technical diagram. Labels are set text; only the lines are drawn by the marker. */
export default function Doodle({ kind, className = '', onLoad = false, delay = 0, seed = 1 }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 480 300"
      role="img"
      aria-label={DESCRIPTIONS[kind]}
      className={`block h-auto w-full overflow-visible ${onLoad ? 'draw-load' : ''} ${className}`}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ '--draw-delay': `${delay}ms`, '--draw-stagger': '95ms', '--draw-dur': '460ms' } as CSSProperties}
    >
      {drawing(kind, seed)}
    </svg>
  );
}
