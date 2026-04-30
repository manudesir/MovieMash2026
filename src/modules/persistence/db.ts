import { Dexie, type Table } from 'dexie';
import type { RankingItemState } from '../../domain/item';
import type { OutcomeKind } from '../../domain/outcome';

export type ComparisonRecord = {
  id: string;
  outcomeType: OutcomeKind;
  leftId?: string;
  rightId?: string;
  winnerId?: string;
  loserId?: string;
  notSeenId?: string;
  ratingChanges?: RatingChangeRecord[];
  createdAt: number;
};

export type RatingChangeRecord = {
  itemId: string;
  beforeRating: number;
  afterRating: number;
  delta: number;
};

export type MetaRecord = {
  key: string;
  value: boolean | number | string;
};

class MovieMashDatabase extends Dexie {
  rankingStates!: Table<RankingItemState, string>;
  comparisons!: Table<ComparisonRecord, string>;
  meta!: Table<MetaRecord, string>;

  constructor() {
    super('movie-mash-v1');

    this.version(1).stores({
      rankingStates: 'itemId, active, appearances, rating',
      comparisons: 'id, outcomeType, createdAt',
      meta: 'key',
    });
  }
}

export const db = new MovieMashDatabase();

export async function resetDatabase() {
  await db.transaction('rw', db.rankingStates, db.comparisons, db.meta, async () => {
    await db.rankingStates.clear();
    await db.comparisons.clear();
    await db.meta.clear();
  });
}
