// ============================================================================
// useRefreshAnimation — spins a refresh icon while work is in flight.
//
// Web counterpart of the React Native Animated rotation: a `spinning` flag the
// caller maps onto a CSS animation. A minimum duration keeps the spin from
// flickering when a cached result returns near-instantly.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from "react";

const MIN_SPIN_MS = 600;

export function useRefreshAnimation(onRefresh: () => void) {
  const [spinning, setSpinning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const trigger = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    onRefresh();
    timerRef.current = setTimeout(() => setSpinning(false), MIN_SPIN_MS);
  }, [spinning, onRefresh]);

  return { spinning, trigger };
}
