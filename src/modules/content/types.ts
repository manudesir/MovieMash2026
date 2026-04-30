import type { ComparableItem } from '../../domain/item';

export type Film = {
  id: string;
  title: string;
  year: number;
  posterPath: string;
};

export type FilmItem = ComparableItem<'film'> & {
  year: number;
  posterPath: string;
};
