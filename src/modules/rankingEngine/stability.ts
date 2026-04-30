import type { RankingItemState, StabilityTier } from '../../domain/item';

export function getStabilityTier(state: RankingItemState): StabilityTier {
  if (state.appearances < 3) {
    return 'new';
  }

  if (state.appearances < 10) {
    return 'settling';
  }

  return 'stable';
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
