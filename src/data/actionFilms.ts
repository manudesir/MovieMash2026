import { frozenFilms } from './films';
import type { Film } from '../modules/content/types';

const defaultActionFilmIds = [
  'raiders-of-the-lost-ark',
  'terminator',
  'aliens',
  'die-hard',
  'terminator-2',
  'saving-private-ryan',
  'matrix',
  'gladiator',
  'lord-of-the-rings-two-towers',
  'oldboy',
  'batman-begins',
  'dark-knight',
  'inception',
  'snowpiercer',
  'mad-max-fury-road',
  'dune-2021',
  'top-gun-maverick',
  'dune-part-two',
  'heat',
  'crouching-tiger-hidden-dragon',
  'children-of-men',
  'raid',
] as const;

const additionalActionFilms: Film[] = [
  {
    id: 'predator',
    title: 'Predator',
    year: 1987,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'police-story',
    title: 'Police Story',
    year: 1985,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'robocop',
    title: 'RoboCop',
    year: 1987,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'lethal-weapon',
    title: 'Lethal Weapon',
    year: 1987,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'the-killer',
    title: 'The Killer',
    year: 1989,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'hard-boiled',
    title: 'Hard Boiled',
    year: 1992,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'total-recall',
    title: 'Total Recall',
    year: 1990,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'point-break',
    title: 'Point Break',
    year: 1991,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'speed',
    title: 'Speed',
    year: 1994,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'true-lies',
    title: 'True Lies',
    year: 1994,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'the-rock',
    title: 'The Rock',
    year: 1996,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'face-off',
    title: 'Face/Off',
    year: 1997,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'blade',
    title: 'Blade',
    year: 1998,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'casino-royale',
    title: 'Casino Royale',
    year: 2006,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'district-b13',
    title: 'District B13',
    year: 2004,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'john-wick',
    title: 'John Wick',
    year: 2014,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'the-raid-2',
    title: 'The Raid 2',
    year: 2014,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'mission-impossible-fallout',
    title: 'Mission: Impossible – Fallout',
    year: 2018,
    posterPath: 'posters/action-movie.svg',
  },
  {
    id: 'john-wick-chapter-4',
    title: 'John Wick: Chapter 4',
    year: 2023,
    posterPath: 'posters/action-movie.svg',
  },
];

function getDefaultActionFilm(id: (typeof defaultActionFilmIds)[number]) {
  const film = frozenFilms.find((candidate) => candidate.id === id);

  if (!film) {
    throw new Error(`Missing action film in the default catalog: ${id}`);
  }

  return film;
}

export const actionFilms: Film[] = [...defaultActionFilmIds.map(getDefaultActionFilm), ...additionalActionFilms];
