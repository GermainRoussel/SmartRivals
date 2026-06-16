/**
 * Spot-the-difference scenes generated as inline SVG (data URIs).
 *
 * The v1 bank used identical left/right photo URLs — so there was no actual
 * difference to find. Here each scene is drawn twice with exactly one change,
 * and we know the changed element's centre (in %), so the hotspot target is real.
 */

function dataUri(inner: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'>${inner}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function balloon(x: number, y: number, fill: string): string {
  return `<g>
    <path d='M${x} ${y + 34} Q ${x + 10} ${y + 70} ${x} ${y + 100}' stroke='#94a3b8' stroke-width='1.5' fill='none'/>
    <ellipse cx='${x}' cy='${y}' rx='28' ry='34' fill='${fill}'/>
    <ellipse cx='${x - 8}' cy='${y - 12}' rx='6' ry='9' fill='rgba(255,255,255,0.45)'/>
    <polygon points='${x - 5},${y + 32} ${x + 5},${y + 32} ${x},${y + 40}' fill='${fill}'/>
  </g>`;
}

function star(cx: number, cy: number, r: number, fill = "#fde047"): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    pts.push(`${(cx + rad * Math.cos(ang)).toFixed(1)},${(cy + rad * Math.sin(ang)).toFixed(1)}`);
  }
  return `<polygon points='${pts.join(" ")}' fill='${fill}'/>`;
}

// --- Scene 1: balloons — the 3rd balloon changes colour --------------
const balloons = (third: string) => `
  <rect width='400' height='300' fill='#eff6ff'/>
  <rect y='250' width='400' height='50' fill='#bbf7d0'/>
  ${balloon(70, 95, "#ef4444")}
  ${balloon(160, 95, "#3b82f6")}
  ${balloon(250, 95, third)}
  ${balloon(340, 95, "#f59e0b")}
`;

// --- Scene 2: night sky — one star disappears ------------------------
const night = (extraStar: boolean) => `
  <rect width='400' height='300' fill='#1e293b'/>
  <circle cx='325' cy='70' r='38' fill='#fde68a'/>
  <circle cx='310' cy='62' r='34' fill='#1e293b'/>
  ${star(80, 85, 16)}
  ${star(185, 140, 14)}
  ${star(120, 210, 15)}
  ${extraStar ? star(255, 185, 16) : ""}
`;

export interface DifferenceScene {
  left: string;
  right: string;
  target: { x: number; y: number; tolerance: number };
}

export const DIFFERENCE_SCENES: DifferenceScene[] = [
  {
    left: dataUri(balloons("#22c55e")), // green
    right: dataUri(balloons("#a855f7")), // purple
    target: { x: 63, y: 32, tolerance: 14 }, // 3rd balloon centre
  },
  {
    left: dataUri(night(true)),
    right: dataUri(night(false)), // the 4th star is gone
    target: { x: 64, y: 62, tolerance: 14 }, // where the star was
  },
];
