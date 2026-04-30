import { useEffect, useState } from 'react';

export function useIdleVisibility(isInteracting: boolean, feedbackId?: number) {
  const [visible, setVisible] = useState(false);

  // Hide secondary navigation during active touch work, then restore it after idle time.
  useEffect(() => {
    const hideId = window.setTimeout(() => {
      setVisible(false);
    }, 0);

    if (isInteracting) {
      return () => {
        window.clearTimeout(hideId);
      };
    }

    const showId = window.setTimeout(() => {
      setVisible(true);
    }, 5000);

    return () => {
      window.clearTimeout(hideId);
      window.clearTimeout(showId);
    };
  }, [isInteracting, feedbackId]);

  return !isInteracting && visible;
}
