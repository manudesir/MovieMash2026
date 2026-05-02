import { beforeEach, describe, expect, it } from 'vitest';
import type { ComparableItem } from '../../domain/item';
import { db, resetDatabase } from './db';
import {
  initializeRankingStates,
  listComparisonRecords,
  listRankingStates,
  markRankingItemNotSeen,
  persistOutcome,
} from './rankingRepository';

function item(id: string): ComparableItem {
  return {
    id,
    category: 'test',
    label: id,
    subtitle: id,
    imageSrc: `/posters/${id}.jpg`,
  };
}

function items(prefix: string, count: number) {
  return Array.from({ length: count }, (_value, index) => item(`${prefix}-${index}`));
}

describe('ranking repository catalog scopes', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('initializes each item once when catalogs share IDs', async () => {
    await initializeRankingStates([item('shared'), item('shared'), item('unique')]);

    const states = await listRankingStates();

    expect(states.map((state) => state.itemId).sort()).toEqual(['shared', 'unique']);
  });

  it('lists only the requested item IDs for a catalog scope', async () => {
    await initializeRankingStates([item('a'), item('b'), item('c')]);

    const scopedStates = await listRankingStates(['c', 'a']);

    expect(scopedStates.map((state) => state.itemId).sort()).toEqual(['a', 'c']);
  });

  it('returns scoped states after a scoped outcome', async () => {
    const scopedItems = items('scope', 11);
    const outsideItems = items('outside', 4);
    const scopedIds = scopedItems.map((scopedItem) => scopedItem.id);
    await initializeRankingStates([...scopedItems, ...outsideItems]);

    const result = await persistOutcome(
      { type: 'notSeen', itemId: scopedIds[0], otherId: scopedIds[1] },
      scopedIds,
    );

    expect(result.applied).toBe(true);
    expect(result.states.map((state) => state.itemId).sort()).toEqual([...scopedIds].sort());
    expect(result.states.find((state) => state.itemId === scopedIds[0])?.active).toBe(false);
    expect((await listRankingStates(outsideItems.map((outsideItem) => outsideItem.id))).every((state) => state.active)).toBe(
      true,
    );
  });

  it('uses the active item count from the current scope for not-seen blocking', async () => {
    const scopedItems = items('scope', 10);
    const outsideItems = items('outside', 5);
    const scopedIds = scopedItems.map((scopedItem) => scopedItem.id);
    await initializeRankingStates([...scopedItems, ...outsideItems]);

    const scopedResult = await markRankingItemNotSeen(scopedIds[0], scopedIds);
    const unchangedState = await db.rankingStates.get(scopedIds[0]);
    const globalResult = await markRankingItemNotSeen(scopedIds[0]);

    expect(scopedResult).toMatchObject({ applied: false, reason: 'minimumActiveItems' });
    expect(unchangedState?.active).toBe(true);
    expect(globalResult.applied).toBe(true);
  });

  it('records scoped decided outcomes with point changes', async () => {
    const scopedItems = items('scope', 11);
    const scopedIds = scopedItems.map((scopedItem) => scopedItem.id);
    await initializeRankingStates(scopedItems);

    const result = await persistOutcome({ type: 'winner', winnerId: scopedIds[0], loserId: scopedIds[1] }, scopedIds);
    const records = await listComparisonRecords();

    expect(result.applied).toBe(true);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      outcomeType: 'winner',
      winnerId: scopedIds[0],
      loserId: scopedIds[1],
    });
    expect(records[0].ratingChanges?.map((change) => change.itemId).sort()).toEqual([scopedIds[0], scopedIds[1]].sort());
  });
});
