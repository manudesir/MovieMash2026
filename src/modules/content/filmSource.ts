import { actionFilms } from '../../data/actionFilms';
import { frozenFilms } from '../../data/films';
import type { Film, FilmItem } from './types';

const basePath = import.meta.env.BASE_URL;

export type FilmCatalog = {
  id: 'default' | 'action';
  title: string;
  eyebrow: string;
  comparisonPath: string;
  rankingPath: string;
  films: Film[];
};

function toFilmItems(films: Film[]): FilmItem[] {
  return films.map((film) => ({
    id: film.id,
    category: 'film',
    label: film.title,
    subtitle: String(film.year),
    imageSrc: `${basePath}${film.posterPath}`,
    posterPath: film.posterPath,
    year: film.year,
  }));
}

export const defaultFilmCatalog: FilmCatalog = {
  id: 'default',
  title: 'Default movies',
  eyebrow: 'Full catalog',
  comparisonPath: '/',
  rankingPath: '/ranking',
  films: frozenFilms,
};

export const actionFilmCatalog: FilmCatalog = {
  id: 'action',
  title: 'Pure action movies',
  eyebrow: 'Action cut',
  comparisonPath: '/action',
  rankingPath: '/action/ranking',
  films: actionFilms,
};

export const filmCatalogs = [defaultFilmCatalog, actionFilmCatalog] as const;

export const filmItems = toFilmItems(frozenFilms);
export const actionFilmItems = toFilmItems(actionFilms);
export const allFilmItems = toFilmItems([...frozenFilms, ...actionFilms]);

export const filmItemsByCatalogId = {
  default: filmItems,
  action: actionFilmItems,
} satisfies Record<FilmCatalog['id'], FilmItem[]>;

export const filmItemById = new Map(allFilmItems.map((item) => [item.id, item]));
export const offlineFilmAssetUrls = allFilmItems.map((item) => item.imageSrc);
