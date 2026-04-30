import { frozenFilms } from '../../data/films';
import type { FilmItem } from './types';

const basePath = import.meta.env.BASE_URL;

export const filmItems: FilmItem[] = frozenFilms.map((film) => ({
  id: film.id,
  category: 'film',
  label: film.title,
  subtitle: String(film.year),
  imageSrc: `${basePath}${film.posterPath}`,
  posterPath: film.posterPath,
  year: film.year,
}));

export const filmItemById = new Map(filmItems.map((item) => [item.id, item]));

export const offlineFilmAssetUrls = filmItems.map((item) => item.imageSrc);
