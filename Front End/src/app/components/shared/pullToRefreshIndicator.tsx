// ============================================================================
// PullToRefreshIndicator — visual spinner/arrow shown while a pull-to-refresh
// gesture is in progress. Height tracks pull distance so it grows in place.
// ============================================================================

// Imports
import { Loader2, ArrowDown } from "lucide-react";

// Interfaces
interface PullToRefreshIndicatorProps {
  pullDistance: number;
  refreshing: boolean;
  threshold: number;
}

// Component
export function PullToRefreshIndicator({ pullDistance, refreshing, threshold }: PullToRefreshIndicatorProps) {
  if (pullDistance === 0 && !refreshing) return null;
  const ready = pullDistance >= threshold;

  return (
    <div
      className="flex items-center justify-center overflow-hidden text-muted-foreground"
      style={{ height: refreshing ? threshold : pullDistance }}
    >
      {refreshing ? (
        <Loader2 size={20} className="animate-spin text-primary" />
      ) : (
        <ArrowDown
          size={18}
          className={`transition-transform ${ready ? "rotate-180 text-primary" : "text-muted-foreground"}`}
        />
      )}
    </div>
  );
}
