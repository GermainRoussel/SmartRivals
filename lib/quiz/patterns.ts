/**
 * Logic-pattern (IQ-test) puzzles generated as inline SVG (data URIs).
 *
 * The v1 bank used placehold.co images with no real logic. Here the grid is a
 * genuine sequence with the last cell missing, and the options are real
 * candidate tiles — one of which actually continues the rule.
 */

function uri(inner: string, w: number, h: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'>${inner}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Dot layouts within a 100×100 tile.
const DOT_LAYOUTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[35, 50], [65, 50]],
  3: [[50, 32], [35, 64], [65, 64]],
  4: [[35, 35], [65, 35], [35, 65], [65, 65]],
  5: [[35, 35], [65, 35], [50, 50], [35, 65], [65, 65]],
  6: [[34, 30], [66, 30], [34, 50], [66, 50], [34, 70], [66, 70]],
};

function dots(n: number): string {
  return (DOT_LAYOUTS[n] ?? [])
    .map(([x, y]) => `<circle cx='${x}' cy='${y}' r='9' fill='#3b82f6'/>`)
    .join("");
}

function arrow(deg: number): string {
  return `<g transform='rotate(${deg} 50 50)'>
    <polygon points='50,18 36,42 46,42 46,80 54,80 54,42 64,42' fill='#334155'/>
  </g>`;
}

const QUESTION_TILE = `<text x='50' y='66' font-size='54' font-weight='bold' text-anchor='middle' fill='#cbd5e1' font-family='system-ui, sans-serif'>?</text>`;

function tile(content: string, x: number): string {
  return `<g transform='translate(${x} 5)'>
    <rect width='100' height='100' rx='14' fill='white' stroke='#e2e8f0' stroke-width='2'/>
    ${content}
  </g>`;
}

/** A horizontal sequence of 4 tiles (last is the "?"). */
function sequence(tiles: string[]): string {
  const inner = tiles.map((t, i) => tile(t, i * 110)).join("");
  return uri(inner, 430, 110);
}

function option(content: string): string {
  return uri(`<rect width='100' height='100' rx='14' fill='white'/>${content}`, 100, 100);
}

export interface PatternPuzzle {
  grid: string;
  options: { id: string; imageUrl: string }[];
  correctId: string;
}

export const PATTERN_PUZZLES: PatternPuzzle[] = [
  // Counting: 1, 2, 3, ? → 4
  {
    grid: sequence([dots(1), dots(2), dots(3), QUESTION_TILE]),
    options: [
      { id: "A", imageUrl: option(dots(2)) },
      { id: "B", imageUrl: option(dots(4)) },
      { id: "C", imageUrl: option(dots(5)) },
      { id: "D", imageUrl: option(dots(6)) },
    ],
    correctId: "B",
  },
  // Rotation: up, right, down, ? → left (continuing clockwise)
  {
    grid: sequence([arrow(0), arrow(90), arrow(180), QUESTION_TILE]),
    options: [
      { id: "A", imageUrl: option(arrow(90)) },
      { id: "B", imageUrl: option(arrow(270)) },
      { id: "C", imageUrl: option(arrow(0)) },
      { id: "D", imageUrl: option(arrow(180)) },
    ],
    correctId: "B",
  },
];
