import type { ComparableItem, RankingItemState } from '../../domain/item';
import type { ComparisonOutcome, DecidedOutcome } from '../../domain/outcome';
import { createInitialRankingState, updateRatings } from '../rankingEngine/rating';
import { db, type ComparisonRecord, type RatingChangeRecord } from './db';

const MINIMUM_ACTIVE_ITEMS = 10;

export type PersistOutcomeResult =
  | {
      applied: true;
      states: RankingItemState[];
    }
  | {
      applied: false;
      reason: 'minimumActiveItems' | 'missingState';
      states: RankingItemState[];
    };

function createRecord(
  outcome: ComparisonOutcome,
  now: number,
  ratingChanges?: RatingChangeRecord[],
): ComparisonRecord {
  const id = globalThis.crypto?.randomUUID?.() ?? `${now}-${Math.random().toString(16).slice(2)}`;

  switch (outcome.type) {
    case 'winner':
      return {
        id,
        outcomeType: outcome.type,
        winnerId: outcome.winnerId,
        loserId: outcome.loserId,
        ratingChanges,
        createdAt: now,
      };
    case 'tie':
      return {
        id,
        outcomeType: outcome.type,
        leftId: outcome.leftId,
        rightId: outcome.rightId,
        ratingChanges,
        createdAt: now,
      };
    case 'notSeen':
      return {
        id,
        outcomeType: outcome.type,
        notSeenId: outcome.itemId,
        leftId: outcome.itemId,
        rightId: outcome.otherId,
        createdAt: now,
      };
    default:
      return outcome satisfies never;
  }
}

function idsForOutcome(outcome: ComparisonOutcome) {
  switch (outcome.type) {
    case 'winner':
      return [outcome.winnerId, outcome.loserId];
    case 'tie':
      return [outcome.leftId, outcome.rightId];
    case 'notSeen':
      return [outcome.itemId, outcome.otherId];
    default:
      return outcome satisfies never;
  }
}

function applyDecidedOutcome(
  statesById: Map<string, RankingItemState>,
  outcome: DecidedOutcome,
  now: number,
) {
  const leftId = outcome.type === 'tie' ? outcome.leftId : outcome.winnerId;
  const rightId = outcome.type === 'tie' ? outcome.rightId : outcome.loserId;
  const leftState = statesById.get(leftId);
  const rightState = statesById.get(rightId);

  if (!leftState || !rightState) {
    return undefined;
  }

  return updateRatings(leftState, rightState, outcome, now);
}

function ratingChangesForUpdate(
  leftBefore: RankingItemState,
  rightBefore: RankingItemState,
  leftAfter: RankingItemState,
  rightAfter: RankingItemState,
): RatingChangeRecord[] {
  return [
    {
      itemId: leftBefore.itemId,
      beforeRating: leftBefore.rating,
      afterRating: leftAfter.rating,
      delta: leftAfter.rating - leftBefore.rating,
    },
    {
      itemId: rightBefore.itemId,
      beforeRating: rightBefore.rating,
      afterRating: rightAfter.rating,
      delta: rightAfter.rating - rightBefore.rating,
    },
  ];
}

export async function initializeRankingStates(items: ComparableItem[]) {
  const now = Date.now();
  const existingStates = await db.rankingStates.toArray();
  const existingIds = new Set(existingStates.map((state) => state.itemId));
  const missingStates = items
    .filter((item) => !existingIds.has(item.id))
    .map((item) => createInitialRankingState(item.id, now));

  if (missingStates.length > 0) {
    await db.rankingStates.bulkPut(missingStates);
  }
}

export function listRankingStates() {
  return db.rankingStates.toArray();
}

export function listComparisonRecords() {
  return db.comparisons.toArray();
}

export async function getMetaBoolean(key: string) {
  const record = await db.meta.get(key);
  return record?.value === true;
}

export async function setMetaBoolean(key: string, value: boolean) {
  await db.meta.put({ key, value });
}

export async function persistOutcome(outcome: ComparisonOutcome): Promise<PersistOutcomeResult> {
  return db.transaction('rw', db.rankingStates, db.comparisons, async () => {
    const now = Date.now();
    const states = await db.rankingStates.toArray();
    const statesById = new Map(states.map((state) => [state.itemId, state]));
    const outcomeIds = idsForOutcome(outcome);

    if (outcomeIds.some((id) => !statesById.has(id))) {
      return { applied: false, reason: 'missingState', states };
    }

    if (outcome.type === 'notSeen') {
      const activeCount = states.filter((state) => state.active).length;

      if (activeCount <= MINIMUM_ACTIVE_ITEMS) {
        return { applied: false, reason: 'minimumActiveItems', states };
      }

      const itemState = statesById.get(outcome.itemId);

      if (!itemState) {
        return { applied: false, reason: 'missingState', states };
      }

      await db.rankingStates.put({
        ...itemState,
        active: false,
        notSeen: true,
        updatedAt: now,
      });
      await db.comparisons.put(createRecord(outcome, now));
      return { applied: true, states: await db.rankingStates.toArray() };
    }

    const beforeStates = idsForOutcome(outcome).map((itemId) => statesById.get(itemId));
    const updated = applyDecidedOutcome(statesById, outcome, now);

    if (!updated || !beforeStates[0] || !beforeStates[1]) {
      return { applied: false, reason: 'missingState', states };
    }

    await db.rankingStates.bulkPut([updated.left, updated.right]);
    await db.comparisons.put(
      createRecord(
        outcome,
        now,
        ratingChangesForUpdate(beforeStates[0], beforeStates[1], updated.left, updated.right),
      ),
    );
    return { applied: true, states: await db.rankingStates.toArray() };
  });
}

export { MINIMUM_ACTIVE_ITEMS };
