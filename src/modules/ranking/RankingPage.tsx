import { ArrowLeft } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { filmItemById } from '../content/filmSource';
import { listRankingStates } from '../persistence/rankingRepository';
import { getOrderedRanking, getStabilityTier } from '../rankingEngine/stability';
import { RankingRow } from './RankingRow';

export function RankingPage() {
  const states = useLiveQuery(listRankingStates, [], []);
  const rankedStates = getOrderedRanking(states);

  return (
    <main className="ranking-page">
      <header className="ranking-page__header">
        <Link to="/" className="ranking-page__back" aria-label="Back to comparisons" title="Back to comparisons">
          <ArrowLeft aria-hidden="true" size={23} />
        </Link>
        <div>
          <p className="eyebrow">Your current taste map</p>
          <h1>Your ranking</h1>
        </div>
      </header>

      <ol className="ranking-list" aria-label="Ordered ranking">
        {rankedStates.map((state, index) => {
          const item = filmItemById.get(state.itemId);

          if (!item) {
            return null;
          }

          return (
            <RankingRow
              key={state.itemId}
              item={item}
              state={state}
              rank={index + 1}
              tier={getStabilityTier(state)}
            />
          );
        })}
      </ol>
    </main>
  );
}
