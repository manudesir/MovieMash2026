import type { FilmItem } from '../content/types';

type PreviewItemCardProps = {
  item: FilmItem;
};

export function PreviewItemCard({ item }: PreviewItemCardProps) {
  return (
    <article className="preview-item-card" aria-hidden="true">
      <span className="item-card__poster-wrap">
        <img className="item-card__poster" src={item.imageSrc} alt="" draggable="false" />
      </span>
      <span className="item-card__text">
        <span className="item-card__title">{item.label}</span>
        <span className="item-card__year">{item.year}</span>
      </span>
    </article>
  );
}
