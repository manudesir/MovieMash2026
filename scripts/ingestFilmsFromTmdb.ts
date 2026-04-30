import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import { frozenFilms } from '../src/data/films';

type TmdbMovie = {
  id: number;
  title: string;
  releaseYear: number;
  posterUrl: string;
};

type TmdbApiMovie = {
  id: number;
  title?: string;
  release_date?: string;
  poster_path?: string;
};

type TmdbSearchResponse = {
  results?: TmdbApiMovie[];
};

type FrozenFilmOutput = {
  id: string;
  title: string;
  year: number;
  posterPath: string;
};

type ValidationRecord = {
  id: string;
  seedTitle: string;
  seedYear: number;
  tmdbTitle: string;
  tmdbDisplayYear: number;
  frozenTitle: string;
  frozenYear: number;
  exactTitleChanged: boolean;
  normalizedTitleChanged: boolean;
  yearChanged: boolean;
  posterPath: string;
};

const apiKey = process.env.TMDB_API_KEY;
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const posterDir = join(rootDir, 'public', 'posters');
const reportDir = join(rootDir, 'scripts', 'reports');
const outputPath = join(rootDir, 'src', 'data', 'films.ts');
const validationPath = join(reportDir, 'tmdb-validation.json');
const userAgent = 'MovieMash2026 dev ingestion (https://www.themoviedb.org/)';
const webRequestDelayMs = 1200;

let lastWebRequestAt = 0;

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForWebQuota() {
  const elapsed = Date.now() - lastWebRequestAt;

  if (elapsed < webRequestDelayMs) {
    await sleep(webRequestDelayMs - elapsed);
  }

  lastWebRequestAt = Date.now();
}

async function fetchWithRetry(url: string, init: RequestInit, context: string) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(url, init);

    if (response.status !== 429 && response.status < 500) {
      return response;
    }

    const retryAfter = Number(response.headers.get('retry-after'));
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2500 * attempt;
    console.warn(`${context} returned ${response.status}; retrying in ${waitMs}ms`);
    await sleep(waitMs);
  }

  return fetch(url, init);
}

function releaseYearFromDate(value?: string) {
  const yearText = value?.match(/\b(19|20)\d{2}\b/)?.[0];
  return yearText ? Number(yearText) : 0;
}

function normalizeTitle(value: string) {
  return value
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replaceAll('&', 'and')
    .replaceAll(/[^a-z0-9]+/g, ' ')
    .trim();
}

function posterUrlFromPath(posterPath: string) {
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
}

function posterUrlFromSearchImage(src?: string) {
  if (!src) {
    return undefined;
  }

  const url = new URL(src);
  const filename = url.pathname.split('/').at(-1);

  if (!filename) {
    return undefined;
  }

  return `https://image.tmdb.org/t/p/w500/${filename}`;
}

function assertApiMovie(movie: TmdbApiMovie): movie is TmdbApiMovie & { title: string; poster_path: string } {
  return Boolean(movie.title && movie.poster_path && releaseYearFromDate(movie.release_date) >= 1980);
}

function bestMatch(seedTitle: string, seedYear: number, movies: TmdbMovie[]) {
  const normalizedSeedTitle = normalizeTitle(seedTitle);
  const exactTitleMatches = movies.filter((movie) => normalizeTitle(movie.title) === normalizedSeedTitle);
  const exactTitleAndYear = exactTitleMatches.find((movie) => movie.releaseYear === seedYear);

  if (exactTitleAndYear) {
    return exactTitleAndYear;
  }

  const nearYearMatch = exactTitleMatches.find((movie) => Math.abs(movie.releaseYear - seedYear) <= 1);

  if (nearYearMatch) {
    return nearYearMatch;
  }

  return movies.find((movie) => movie.releaseYear === seedYear) ?? movies[0];
}

async function searchMovieWithApi(title: string, year: number) {
  if (!apiKey) {
    return undefined;
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    query: title,
    include_adult: 'false',
    year: String(year),
  });
  const response = await fetchWithRetry(`https://api.themoviedb.org/3/search/movie?${params.toString()}`, {
    headers: { 'User-Agent': userAgent },
  }, `TMDb API search for ${title}`);

  if (!response.ok) {
    throw new Error(`TMDb API search failed for ${title}: ${response.status}`);
  }

  const body = (await response.json()) as TmdbSearchResponse;
  const movies =
    body.results?.filter(assertApiMovie).map((movie) => ({
      id: movie.id,
      title: movie.title,
      releaseYear: releaseYearFromDate(movie.release_date),
      posterUrl: posterUrlFromPath(movie.poster_path),
    })) ?? [];

  return bestMatch(title, year, movies);
}

async function searchMovieFromWeb(title: string, year: number) {
  const params = new URLSearchParams({
    query: title,
    language: 'en-US',
  });
  await waitForWebQuota();
  const response = await fetchWithRetry(`https://www.themoviedb.org/search/movie?${params.toString()}`, {
    headers: {
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': userAgent,
    },
  }, `TMDb web search for ${title}`);

  if (!response.ok) {
    throw new Error(`TMDb web search failed for ${title}: ${response.status}`);
  }

  const $ = load(await response.text());
  const movies: TmdbMovie[] = [];

  $('[class*="comp:media-card"]').each((_, element) => {
    const card = $(element);
    const href = card.find('a[data-media-type="movie"]').first().attr('href') ?? '';
    const id = Number(href.match(/\/movie\/(\d+)/)?.[1]);
    const foundTitle = card.find('h2 span').first().text().trim();
    const releaseYear = releaseYearFromDate(card.find('.release_date').first().text());
    const posterUrl = posterUrlFromSearchImage(card.find('img.poster').first().attr('src'));

    if (id && foundTitle && releaseYear >= 1980 && posterUrl) {
      movies.push({ id, title: foundTitle, releaseYear, posterUrl });
    }
  });

  const movie = bestMatch(title, year, movies);

  if (!movie) {
    throw new Error(`No usable TMDb web match for ${title} (${year})`);
  }

  return movie;
}

async function searchMovie(title: string, year: number) {
  const apiMovie = await searchMovieWithApi(title, year);

  if (apiMovie) {
    return apiMovie;
  }

  return searchMovieFromWeb(title, year);
}

async function downloadPoster(movie: TmdbMovie, posterPath: string) {
  const response = await fetchWithRetry(movie.posterUrl, {
    headers: { 'User-Agent': userAgent },
  }, `Poster download for ${movie.title}`);

  if (!response.ok) {
    throw new Error(`Poster download failed for ${movie.title}: ${response.status}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  await writeFile(join(rootDir, 'public', posterPath), bytes);
}

function outputSource(films: FrozenFilmOutput[]) {
  return `import type { Film } from '../modules/content/types';

export const frozenFilms: Film[] = ${JSON.stringify(films, null, 2)};
`;
}

await mkdir(posterDir, { recursive: true });
await mkdir(reportDir, { recursive: true });

const outputFilms: FrozenFilmOutput[] = [];
const validationRecords: ValidationRecord[] = [];

for (const seed of frozenFilms) {
  const movie = await searchMovie(seed.title, seed.year);
  const posterPath = seed.posterPath.replace(/\.(svg|jpg|jpeg|png|webp)$/i, '.jpg');
  const frozenTitle = movie.title;
  const frozenYear = normalizeTitle(seed.title) === normalizeTitle(movie.title) ? seed.year : movie.releaseYear;
  await downloadPoster(movie, posterPath);

  outputFilms.push({
    id: seed.id,
    title: frozenTitle,
    year: frozenYear,
    posterPath,
  });
  validationRecords.push({
    id: seed.id,
    seedTitle: seed.title,
    seedYear: seed.year,
    tmdbTitle: movie.title,
    tmdbDisplayYear: movie.releaseYear,
    frozenTitle,
    frozenYear,
    exactTitleChanged: seed.title !== movie.title,
    normalizedTitleChanged: normalizeTitle(seed.title) !== normalizeTitle(movie.title),
    yearChanged: seed.year !== frozenYear,
    posterPath,
  });

  console.log(`${seed.id}: ${frozenTitle} (${frozenYear})`);
}

await writeFile(outputPath, outputSource(outputFilms), 'utf8');
await writeFile(validationPath, `${JSON.stringify(validationRecords, null, 2)}\n`, 'utf8');
console.log(`Frozen ${outputFilms.length} films into ${outputPath}`);
console.log(`Wrote validation report to ${validationPath}`);
