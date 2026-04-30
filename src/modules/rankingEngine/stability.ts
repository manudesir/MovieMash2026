import type { RankingItemState, StabilityTier } from '../../domain/item';
import { DEFAULT_RATING } from './rating';

const NEW_APPEARANCE_LIMIT = 3;
const STABLE_APPEARANCE_LIMIT = 8;
const EARLY_STABLE_APPEARANCE_LIMIT = 5;
const DECISIVE_RATING_MOVE = 70;
const DECISIVE_RECORD_GAP = 3;

export function getStabilityTier(state: RankingItemState): StabilityTier {
  if (state.appearances < NEW_APPEARANCE_LIMIT) {
    return 'new';
  }

  if (state.appearances >= STABLE_APPEARANCE_LIMIT) {
    return 'stable';
  }

  const ratingMove = Math.abs(state.rating - DEFAULT_RATING);
  const recordGap = Math.abs(state.wins - state.losses);

  if (
    state.appearances >= EARLY_STABLE_APPEARANCE_LIMIT &&
    (ratingMove >= DECISIVE_RATING_MOVE || recordGap >= DECISIVE_RECORD_GAP)
  ) {
    return 'stable';
  }

  return 'settling';
}

export function getOrderedRanking(states: RankingItemState[]) {
  return [...states]
    .filter((state) => state.active)
    .sort((first, second) => second.rating - first.rating || first.itemId.localeCompare(second.itemId));
}

export function hasReachedCelebrationThreshold(states: RankingItemState[]) {
  const activeStates = states.filter((state) => state.active);
  const comparedStates = activeStates.filter((state) => state.appearances > 0);
  const settlingStates = activeStates.filter((state) => state.appearances >= 3);
  const totalAppearances = activeStates.reduce((total, state) => total + state.appearances, 0);

  if (activeStates.length < 10) {
    return false;
  }

  return (
    totalAppearances >= 70 &&
    comparedStates.length / activeStates.length >= 0.35 &&
    settlingStates.length >= 12
  );
}
