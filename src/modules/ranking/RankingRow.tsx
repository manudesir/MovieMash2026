import type { RankingItemState, StabilityTier } from '../../domain/item';
import type { FilmItem } from '../content/types';

type RankingRowProps = {
  item: FilmItem;
  state: RankingItemState;
  rank: number;
  tier: StabilityTier;
};

export function RankingRow({ item, state, rank, tier }: RankingRowProps) {
  return (
    <li className="ranking-row">
      <span className="ranking-row__rank">{rank}</span>
      <img className="ranking-row__poster" src={item.imageSrc} alt="" />
      <span className="ranking-row__main">
        <span className="ranking-row__title">{item.label}</span>
        <span className="ranking-row__meta">
          {item.year} - {state.rating} pts
        </span>
      </span>
      <span className={`ranking-row__tier ranking-row__tier--${tier}`}>{tier}</span>
    </li>
  );
}
