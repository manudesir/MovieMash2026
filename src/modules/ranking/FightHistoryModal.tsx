import type { ComparisonRecord } from '../persistence/db';
import type { FilmItem } from '../content/types';
import { filmItemById } from '../content/filmSource';

type FightHistoryModalProps = {
  item: FilmItem;
  records: ComparisonRecord[];
  onClose: () => void;
};

function pointsLabel(delta: number) {
  return `${delta >= 0 ? '+' : ''}${delta} pts`;
}

export function FightHistoryModal({ item, records, onClose }: FightHistoryModalProps) {
  const wins = records
    .filter((record) => record.outcomeType === 'winner' && record.winnerId === item.id)
    .map((record) => ({
      record,
      opponent: record.loserId,
      change: record.ratingChanges?.find((ratingChange) => ratingChange.itemId === item.id),
    }))
    .filter((win) => win.opponent && win.change)
    .sort((first, second) => second.record.createdAt - first.record.createdAt);

  return (
    <div className="fight-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="fight-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fight-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="fight-modal__header">
          <div>
            <p className="eyebrow">Won fights</p>
            <h2 id="fight-modal-title">{item.label}</h2>
          </div>
          <button type="button" className="fight-modal__close" onClick={onClose} aria-label="Close fight history">
            Close
          </button>
        </header>

        {wins.length === 0 ? (
          <p className="fight-modal__empty">No logged wins with point changes yet.</p>
        ) : (
          <ol className="fight-modal__list">
            {wins.map((win) => {
              const opponentTitle = win.opponent ? (filmItemById.get(win.opponent)?.label ?? win.opponent) : 'unknown item';
              const change = win.change;

              return (
                <li key={win.record.id} className="fight-modal__row">
                  <span>
                    {item.label} won against {opponentTitle}
                  </span>
                  <strong>{change ? pointsLabel(change.delta) : '0 pts'}</strong>
                  {change ? (
                    <small>
                      {change.beforeRating} to {change.afterRating}
                    </small>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
