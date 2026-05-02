import { frozenFilms } from './films';
import type { Film } from '../modules/content/types';

const defaultComedyFilmIds = [
  'back-to-the-future',
  'breakfast-club',
  'ferris-bueller',
  'princess-bride',
  'when-harry-met-sally',
  'groundhog-day',
  'toy-story',
  'fargo',
  'truman-show',
  'amelie',
  'incredibles',
  'ratatouille',
  'up',
  'bridesmaids',
  'grand-budapest-hotel',
  'inside-out',
  'spider-verse',
  'knives-out',
  'soul',
  'everything-everywhere',
  'barbie',
  'big-lebowski',
  'shaun-of-the-dead',
  'a-bug-s-life',
  'toy-story-2',
  'monsters-inc',
  'cars',
  'toy-story-3',
  'cars-2',
  'monsters-university',
  'finding-dory',
  'cars-3',
  'coco',
  'incredibles-2',
  'toy-story-4',
  'onward',
  'luca',
  'turning-red',
  'inside-out-2',
  'the-great-mouse-detective',
  'oliver-and-company',
  'aladdin',
  'hercules',
  'mulan',
  'the-emperor-s-new-groove',
  'lilo-and-stitch',
  'home-on-the-range',
  'chicken-little',
  'meet-the-robinsons',
  'bolt',
  'tangled',
  'winnie-the-pooh',
  'wreck-it-ralph',
  'frozen',
] as const;

const additionalComedyFilms: Film[] = [
  {
    id: 'some-like-it-hot',
    title: 'Some Like It Hot',
    year: 1959,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'dr-strangelove',
    title: 'Dr. Strangelove',
    year: 1964,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'monty-python-holy-grail',
    title: 'Monty Python and the Holy Grail',
    year: 1975,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'life-of-brian',
    title: 'Life of Brian',
    year: 1979,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'airplane',
    title: 'Airplane!',
    year: 1980,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'this-is-spinal-tap',
    title: 'This Is Spinal Tap',
    year: 1984,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'ghostbusters',
    title: 'Ghostbusters',
    year: 1984,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'coming-to-america',
    title: 'Coming to America',
    year: 1988,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'dumb-and-dumber',
    title: 'Dumb and Dumber',
    year: 1994,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'the-mask',
    title: 'The Mask',
    year: 1994,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'clueless',
    title: 'Clueless',
    year: 1995,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'theres-something-about-mary',
    title: "There's Something About Mary",
    year: 1998,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'office-space',
    title: 'Office Space',
    year: 1999,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'anchorman',
    title: 'Anchorman: The Legend of Ron Burgundy',
    year: 2004,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'mean-girls',
    title: 'Mean Girls',
    year: 2004,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'borat',
    title: 'Borat',
    year: 2006,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'hot-fuzz',
    title: 'Hot Fuzz',
    year: 2007,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'superbad',
    title: 'Superbad',
    year: 2007,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'the-hangover',
    title: 'The Hangover',
    year: 2009,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'four-lions',
    title: 'Four Lions',
    year: 2010,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'what-we-do-in-the-shadows',
    title: 'What We Do in the Shadows',
    year: 2014,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'booksmart',
    title: 'Booksmart',
    year: 2019,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'palm-springs',
    title: 'Palm Springs',
    year: 2020,
    posterPath: 'posters/comedy-movie.svg',
  },
  {
    id: 'bottoms',
    title: 'Bottoms',
    year: 2023,
    posterPath: 'posters/comedy-movie.svg',
  },
];

function getDefaultComedyFilm(id: (typeof defaultComedyFilmIds)[number]) {
  const film = frozenFilms.find((candidate) => candidate.id === id);

  if (!film) {
    throw new Error(`Missing comedy film in the default catalog: ${id}`);
  }

  return film;
}

export const comedyFilms: Film[] = [...defaultComedyFilmIds.map(getDefaultComedyFilm), ...additionalComedyFilms];
