import { ConfirmationBurst } from './ConfirmationBurst';
import { CelebrationToast } from './CelebrationToast';
import { FloatingRankingButton } from './FloatingRankingButton';
import { ItemCard } from './ItemCard';
import { TieButton } from './TieButton';
import type { ComparisonFlow } from './useComparisonFlow';
import { useIdleVisibility } from './useIdleVisibility';

type ComparisonScreenProps = {
  flow: ComparisonFlow;
};

export function ComparisonScreen({ flow }: ComparisonScreenProps) {
  const rankingButtonVisible = useIdleVisibility(flow.isInteracting, flow.feedback?.id);

  if (!flow.leftItem || !flow.rightItem) {
    return (
      <main className="comparison-screen comparison-screen--empty">
        <p>Loading the next pair...</p>
      </main>
    );
  }

  return (
    <main className="comparison-screen">
      <header className="comparison-status" aria-label="Session progress">
        <span>{flow.comparisonCount} picks</span>
        <span>{flow.activeCount} active</span>
      </header>

      <section className="comparison-stage" aria-label="Choose one item">
        <ItemCard
          item={flow.leftItem}
          side="left"
          onChoose={flow.chooseLeft}
          onNotSeen={flow.markNotSeen}
          onInteractionChange={flow.setIsInteracting}
        />
        <TieButton onTie={flow.tie} />
        <ItemCard
          item={flow.rightItem}
          side="right"
          onChoose={flow.chooseRight}
          onNotSeen={flow.markNotSeen}
          onInteractionChange={flow.setIsInteracting}
        />
      </section>

      <ConfirmationBurst feedback={flow.feedback} />
      <CelebrationToast visible={flow.celebrationVisible} onClose={() => flow.setCelebrationVisible(false)} />
      <FloatingRankingButton visible={rankingButtonVisible} />
    </main>
  );
}
