import type { ItemId } from '../../domain/item';
import type { FilmItem } from '../content/types';
import { useDismissDrag } from './useDismissDrag';

type ItemCardProps = {
  item: FilmItem;
  side: 'left' | 'right';
  onChoose: () => void;
  onNotSeen: (itemId: ItemId) => void;
  onInteractionChange: (active: boolean) => void;
};

export function ItemCard({
  item,
  side,
  onChoose,
  onNotSeen,
  onInteractionChange,
}: ItemCardProps) {
  const drag = useDismissDrag(() => onNotSeen(item.id), onInteractionChange);
  const cardClass = [
    'item-card',
    `item-card--${side}`,
    drag.isDragging ? 'item-card--dragging' : '',
    drag.isReturning ? 'item-card--returning' : '',
    drag.dismissReady ? 'item-card--dismiss-ready' : '',
  ]
    .filter(Boolean)
    .join(' ');

  function handleClick() {
    if (drag.shouldIgnoreClick()) {
      return;
    }

    onChoose();
  }

  return (
    <button
      type="button"
      className={cardClass}
      style={drag.style}
      onClick={handleClick}
      aria-label={`Choose ${item.label}`}
      {...drag.pointerHandlers}
    >
      <span className="item-card__poster-wrap">
        <img className="item-card__poster" src={item.imageSrc} alt="" draggable="false" />
      </span>
      <span className="item-card__text">
        <span className="item-card__title">{item.label}</span>
        <span className="item-card__year">{item.year}</span>
      </span>
    </button>
  );
}
