// ============================================================================
// usePullToRefresh — detects a pull-down gesture at the top of the page and
// invokes a refresh callback. Used by PortalLayout so every admin/owner/
// resident page gets pull-to-refresh just by passing an `onRefresh` prop.
//
// Uses Pointer Events (not Touch Events) so the gesture works with mouse
// drags too — plain mouse drags never fire touchstart/touchmove, so a
// touch-only implementation does nothing when tested in a resized desktop
// browser window without device/touch emulation.
// ============================================================================

// Imports
import { useEffect, useRef, useState } from "react";

// Constants
const THRESHOLD = 70;
const MAX_PULL = 110;
const RESISTANCE = 0.5;
const DEAD_ZONE = 12; // ignore small drags so ordinary clicks/selections aren't hijacked

// Hook
export function usePullToRefresh(onRefresh?: () => Promise<unknown> | unknown) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const distanceRef = useRef(0);

  useEffect(() => {
    if (!onRefresh) return;

    const onPointerDown = (e: PointerEvent) => {
      if (refreshing || e.button > 0 || window.scrollY > 0) return;
      startY.current = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (startY.current === null || refreshing) return;
      const delta = e.clientY - startY.current;
      if (delta <= 0 || window.scrollY > 0) {
        startY.current = null;
        distanceRef.current = 0;
        setPullDistance(0);
        return;
      }
      if (delta < DEAD_ZONE) return;
      const distance = Math.min((delta - DEAD_ZONE) * RESISTANCE, MAX_PULL);
      distanceRef.current = distance;
      setPullDistance(distance);
      if (e.cancelable) e.preventDefault();
    };

    const onPointerEnd = async () => {
      if (startY.current === null) return;
      startY.current = null;
      if (distanceRef.current >= THRESHOLD) {
        setRefreshing(true);
        setPullDistance(THRESHOLD);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
          setPullDistance(0);
          distanceRef.current = 0;
        }
      } else {
        setPullDistance(0);
        distanceRef.current = 0;
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove, { passive: false });
    document.addEventListener("pointerup", onPointerEnd);
    document.addEventListener("pointercancel", onPointerEnd);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerEnd);
      document.removeEventListener("pointercancel", onPointerEnd);
    };
  }, [onRefresh, refreshing]);

  return { pullDistance, refreshing, threshold: THRESHOLD };
}
