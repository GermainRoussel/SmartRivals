/**
 * Point & Click (hotspot) scenes drawn as inline SVG (data URIs).
 *
 * The v1/early bank pointed hotspots at remote Wikimedia images with hardcoded
 * coordinates — if the image failed to load or changed, the target became
 * meaningless and the question was unsolvable. Here each scene is drawn locally
 * and we know the target element's centre (in %), so the hotspot is always real
 * and never depends on the network. Same approach as differences.ts / patterns.ts.
 *
 * Coordinates: the SVG viewBox is 400×300; a target at pixel (px, py) maps to
 * x = px / 400 * 100, y = py / 300 * 100 (percent), matching the validation in
 * lib/quiz/validation.ts (euclidean distance in percent units <= tolerance).
 */

function dataUri(inner: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'>${inner}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// --- Scene: cartoon face — click the nose ----------------------------
const face = `
  <rect width='400' height='300' fill='#eff6ff'/>
  <circle cx='200' cy='150' r='116' fill='#fcd34d' stroke='#f59e0b' stroke-width='4'/>
  <rect x='138' y='90' width='38' height='7' rx='3' fill='#92400e'/>
  <rect x='224' y='90' width='38' height='7' rx='3' fill='#92400e'/>
  <circle cx='157' cy='120' r='16' fill='#1e293b'/>
  <circle cx='243' cy='120' r='16' fill='#1e293b'/>
  <circle cx='162' cy='115' r='5' fill='#ffffff'/>
  <circle cx='248' cy='115' r='5' fill='#ffffff'/>
  <polygon points='200,138 182,178 218,178' fill='#f59e0b'/>
  <path d='M150 206 Q200 246 250 206' stroke='#1e293b' stroke-width='7' fill='none' stroke-linecap='round'/>
`;

// --- Scene: solar system — click Saturn (the ringed planet) ----------
const solar = `
  <rect width='400' height='300' fill='#0b1020'/>
  <circle cx='48' cy='44' r='2' fill='#ffffff'/>
  <circle cx='130' cy='70' r='1.6' fill='#ffffff'/>
  <circle cx='355' cy='52' r='2' fill='#ffffff'/>
  <circle cx='300' cy='255' r='1.6' fill='#ffffff'/>
  <circle cx='95' cy='235' r='1.8' fill='#ffffff'/>
  <circle cx='240' cy='40' r='1.5' fill='#ffffff'/>
  <circle cx='30' cy='150' r='46' fill='#fbbf24'/>
  <circle cx='128' cy='150' r='11' fill='#9ca3af'/>
  <circle cx='198' cy='150' r='18' fill='#3b82f6'/>
  <g transform='rotate(-18 300 150)'>
    <ellipse cx='300' cy='150' rx='54' ry='15' fill='none' stroke='#e9d8a6' stroke-width='6'/>
    <circle cx='300' cy='150' r='25' fill='#d4a373'/>
  </g>
  <circle cx='372' cy='150' r='9' fill='#ef4444'/>
`;

// --- Scene: clock — click the number 12 ------------------------------
function clockTicks(): string {
  let s = "";
  for (let i = 0; i < 12; i++) {
    const ang = (Math.PI / 6) * i - Math.PI / 2;
    const x1 = 200 + 106 * Math.cos(ang);
    const y1 = 150 + 106 * Math.sin(ang);
    const x2 = 200 + 116 * Math.cos(ang);
    const y2 = 150 + 116 * Math.sin(ang);
    s += `<line x1='${x1.toFixed(1)}' y1='${y1.toFixed(1)}' x2='${x2.toFixed(1)}' y2='${y2.toFixed(1)}' stroke='#94a3b8' stroke-width='3'/>`;
  }
  return s;
}

const clock = `
  <rect width='400' height='300' fill='#f1f5f9'/>
  <circle cx='200' cy='150' r='124' fill='#ffffff' stroke='#1e293b' stroke-width='8'/>
  ${clockTicks()}
  <text x='200' y='62' text-anchor='middle' font-family='Arial, sans-serif' font-size='30' font-weight='bold' fill='#1e293b'>12</text>
  <text x='318' y='162' text-anchor='middle' font-family='Arial, sans-serif' font-size='30' font-weight='bold' fill='#1e293b'>3</text>
  <text x='200' y='258' text-anchor='middle' font-family='Arial, sans-serif' font-size='30' font-weight='bold' fill='#1e293b'>6</text>
  <text x='82' y='162' text-anchor='middle' font-family='Arial, sans-serif' font-size='30' font-weight='bold' fill='#1e293b'>9</text>
  <line x1='200' y1='150' x2='200' y2='86' stroke='#1e293b' stroke-width='8' stroke-linecap='round'/>
  <line x1='200' y1='150' x2='268' y2='150' stroke='#ef4444' stroke-width='5' stroke-linecap='round'/>
  <circle cx='200' cy='150' r='8' fill='#1e293b'/>
`;

export interface HotspotScene {
  image: string; // data URI, drawn locally (no network)
  target: { x: number; y: number; tolerance: number }; // centre in percent
}

export const HOTSPOT_SCENES: Record<"face" | "saturn" | "clock", HotspotScene> = {
  // Nose centre ≈ (200, 165)px → (50%, 55%). Eyes sit at 40% y, well outside.
  face: { image: dataUri(face), target: { x: 50, y: 55, tolerance: 11 } },
  // Saturn centre (300, 150)px → (75%, 50%). Nearest planet (Mars) is 17% away.
  saturn: { image: dataUri(solar), target: { x: 75, y: 50, tolerance: 12 } },
  // "12" numeral ≈ (200, 52)px → (50%, 17%). Far from the 3/6/9 numerals.
  clock: { image: dataUri(clock), target: { x: 50, y: 17, tolerance: 11 } },
};
