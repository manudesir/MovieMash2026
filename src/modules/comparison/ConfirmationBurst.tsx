import type { FlowFeedback } from './useComparisonFlow';

type ConfirmationBurstProps = {
  feedback?: FlowFeedback;
};

export function ConfirmationBurst({ feedback }: ConfirmationBurstProps) {
  if (!feedback) {
    return null;
  }

  return (
    <div key={feedback.id} className={`confirmation-burst confirmation-burst--${feedback.kind}`} aria-live="polite">
      {feedback.label}
    </div>
  );
}
