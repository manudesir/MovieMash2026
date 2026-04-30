import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { frozenFilms } from '../src/data/films';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const posterDir = join(rootDir, 'public', 'posters');

const palettes = [
  ['#17211b', '#1f7a4c', '#e0b846'],
  ['#223047', '#e85d47', '#f4f8f1'],
  ['#102820', '#315d9c', '#dff3df'],
  ['#2b2d42', '#e0b846', '#ffffff'],
  ['#1f2933', '#bfe8c4', '#e85d47'],
];

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function titleLines(title: string) {
  const lines: string[] = [];
  let current = '';

  for (const word of title.split(' ')) {
    const next = current.length === 0 ? word : `${current} ${word}`;

    if (next.length > 18 && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines.slice(0, 4);
}

function posterSvg(title: string, year: number, index: number) {
  const [ink, accent, paper] = palettes[index % palettes.length];
  const lines = titleLines(title);
  const lineHeight = 42;
  const startY = 315 - ((lines.length - 1) * lineHeight) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" role="img" aria-label="${escapeXml(title)} poster">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${ink}"/>
      <stop offset="0.56" stop-color="${accent}"/>
      <stop offset="1" stop-color="${paper}"/>
    </linearGradient>
    <pattern id="grain" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M0 10H20M10 0V20" stroke="rgba(255,255,255,0.13)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="400" height="600" fill="url(#bg)"/>
  <rect width="400" height="600" fill="url(#grain)" opacity="0.55"/>
  <rect x="26" y="26" width="348" height="548" rx="16" fill="none" stroke="rgba(255,255,255,0.58)" stroke-width="3"/>
  <circle cx="326" cy="86" r="34" fill="rgba(255,255,255,0.18)"/>
  <path d="M56 116C120 70 180 66 246 108C184 126 121 148 56 116Z" fill="rgba(255,255,255,0.20)"/>
  <g fill="#fff" font-family="Georgia, 'Times New Roman', serif" font-weight="700" text-anchor="middle">
${lines
  .map((line, lineIndex) => `    <text x="200" y="${startY + lineIndex * lineHeight}" font-size="34">${escapeXml(line)}</text>`)
  .join('\n')}
  </g>
  <text x="200" y="512" fill="#fff" font-family="Trebuchet MS, Verdana, sans-serif" font-size="28" font-weight="800" text-anchor="middle">${year}</text>
  <text x="200" y="548" fill="rgba(255,255,255,0.78)" font-family="Trebuchet MS, Verdana, sans-serif" font-size="15" text-anchor="middle">MOVIEMASH LOCAL POSTER</text>
</svg>
`;
}

await mkdir(posterDir, { recursive: true });

await Promise.all(
  frozenFilms.map((film, index) => {
    const target = join(rootDir, 'public', film.posterPath);
    return writeFile(target, posterSvg(film.title, film.year, index), 'utf8');
  }),
);

console.log(`Generated ${frozenFilms.length} local poster assets in ${posterDir}`);
