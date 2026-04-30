import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import type { ItemId, RankingItemState } from '../../domain/item';
import type { ComparisonOutcome } from '../../domain/outcome';
import { filmItemById } from '../content/filmSource';
import type { FilmItem } from '../content/types';
import { buildMatchupQueue, type Matchup } from '../pairing/selectMatchup';
import {
  MINIMUM_ACTIVE_ITEMS,
  getMetaBoolean,
  listComparisonRecords,
  listRankingStates,
  persistOutcome,
  setMetaBoolean,
} from '../persistence/rankingRepository';
import { hasReachedCelebrationThreshold } from '../rankingEngine/stability';

type FeedbackKind = 'picked' | 'tie' | 'notSeen' | 'blocked';

export type FlowFeedback = {
  id: number;
  kind: FeedbackKind;
  label: string;
};

const CELEBRATION_META_KEY = 'celebrationShown';

function otherItemId(matchup: Matchup, itemId: ItemId) {
  return matchup.leftId === itemId ? matchup.rightId : matchup.leftId;
}

function getItem(itemId: ItemId) {
  return filmItemById.get(itemId);
}

function titleForLog(itemId: ItemId) {
  return getItem(itemId)?.label ?? itemId;
}

function outcomeLogMessage(outcome: ComparisonOutcome) {
  switch (outcome.type) {
    case 'winner':
      return `${titleForLog(outcome.winnerId)} wins against ${titleForLog(outcome.loserId)}`;
    case 'tie':
      return `Tie between ${titleForLog(outcome.leftId)} and ${titleForLog(outcome.rightId)}`;
    case 'notSeen':
      return `${titleForLog(outcome.itemId)} not seen`;
    default:
      return outcome satisfies never;
  }
}

export function useComparisonFlow() {
  const states = useLiveQuery(listRankingStates, [], []);
  const comparisons = useLiveQuery(listComparisonRecords, [], []);
  const [queue, setQueue] = useState<Matchup[]>([]);
  const [feedback, setFeedback] = useState<FlowFeedback | undefined>();
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const activeStates = states.filter((state) => state.active);
  const currentMatchup = queue[0];
  const leftItem = currentMatchup ? getItem(currentMatchup.leftId) : undefined;
  const rightItem = currentMatchup ? getItem(currentMatchup.rightId) : undefined;
  const canMarkNotSeen = activeStates.length > MINIMUM_ACTIVE_ITEMS;

  // Keep the speculative queue fresh when IndexedDB changes after each action.
  useEffect(() => {
    const nextActiveStates = states.filter((state) => state.active);
    const nextQueue = nextActiveStates.length < 2 ? [] : buildMatchupQueue(nextActiveStates);
    const timeoutId = window.setTimeout(() => {
      setQueue(nextQueue);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [states]);

  async function maybeShowCelebration(nextStates: RankingItemState[]) {
    if (!hasReachedCelebrationThreshold(nextStates)) {
      return;
    }

    const alreadyShown = await getMetaBoolean(CELEBRATION_META_KEY);

    if (!alreadyShown) {
      await setMetaBoolean(CELEBRATION_META_KEY, true);
      setCelebrationVisible(true);
    }
  }

  function showFeedback(kind: FeedbackKind, label: string) {
    setFeedback({ id: Date.now(), kind, label });
  }

  async function commitOutcome(outcome: ComparisonOutcome, kind: FeedbackKind, label: string) {
    setQueue((currentQueue) => currentQueue.slice(1));
    showFeedback(kind, label);
    const result = await persistOutcome(outcome);
    console.log(
      result.applied ? outcomeLogMessage(outcome) : `${outcomeLogMessage(outcome)} blocked: ${result.reason}`,
    );

    if (result.applied) {
      await maybeShowCelebration(result.states);
      return;
    }

    if (result.reason === 'minimumActiveItems') {
      showFeedback('blocked', 'Last 10 stay');
    }
  }

  function chooseLeft() {
    if (!currentMatchup) {
      return;
    }

    void commitOutcome(
      { type: 'winner', winnerId: currentMatchup.leftId, loserId: currentMatchup.rightId },
      'picked',
      'Picked',
    );
  }

  function chooseRight() {
    if (!currentMatchup) {
      return;
    }

    void commitOutcome(
      { type: 'winner', winnerId: currentMatchup.rightId, loserId: currentMatchup.leftId },
      'picked',
      'Picked',
    );
  }

  function tie() {
    if (!currentMatchup) {
      return;
    }

    void commitOutcome(
      { type: 'tie', leftId: currentMatchup.leftId, rightId: currentMatchup.rightId },
      'tie',
      'Tie',
    );
  }

  function markNotSeen(itemId: ItemId) {
    if (!currentMatchup) {
      return;
    }

    if (!canMarkNotSeen) {
      showFeedback('blocked', 'Last 10 stay');
      return;
    }

    void commitOutcome(
      { type: 'notSeen', itemId, otherId: otherItemId(currentMatchup, itemId) },
      'notSeen',
      'Gone',
    );
  }

  return {
    leftItem: leftItem as FilmItem | undefined,
    rightItem: rightItem as FilmItem | undefined,
    activeCount: activeStates.length,
    comparisonCount: comparisons.length,
    feedback,
    celebrationVisible,
    isInteracting,
    canMarkNotSeen,
    chooseLeft,
    chooseRight,
    tie,
    markNotSeen,
    setCelebrationVisible,
    setIsInteracting,
  };
}
