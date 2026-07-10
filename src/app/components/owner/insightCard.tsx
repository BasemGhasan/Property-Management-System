// ============================================================================
// InsightCard — AI trend read + suggestions for a single analytics chart,
// with a refresh control that bypasses the local cache.
// ============================================================================

// Imports
import { Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import { useRefreshAnimation } from "../../hooks/useRefreshAnimation";
import type { ChartInsightState } from "../../hooks/useChartInsight";

// Interfaces
interface InsightCardProps {
  state: ChartInsightState;
  /** Shown when there is no data to analyse. */
  emptyMessage?: string;
}

// Component
export function InsightCard({ state, emptyMessage = "No data to analyse yet." }: InsightCardProps) {
  const { insight, suggestions, loading, error, fromCache, refresh } = state;
  const { spinning, trigger } = useRefreshAnimation(refresh);

  return (
    <div className="flex flex-col gap-3 border border-border bg-card/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-primary" aria-hidden />
          <p className="font-data text-[10px] uppercase tracking-widest text-muted-foreground">
            AI Insight
          </p>
          {fromCache && !loading && (
            <span className="font-data text-[9px] uppercase tracking-widest text-muted-foreground/60">
              cached
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={trigger}
          disabled={loading || spinning}
          aria-label="Regenerate insight"
          className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw size={14} className={spinning || loading ? "animate-spin" : undefined} />
        </button>
      </div>

      {loading && !insight ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <div className="h-3 w-full animate-pulse bg-muted" />
          <div className="h-3 w-4/5 animate-pulse bg-muted" />
        </div>
      ) : insight ? (
        <p className="text-sm leading-relaxed text-secondary-foreground">{insight}</p>
      ) : !error ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : null}

      {suggestions.length > 0 && !loading && (
        <ul className="flex flex-col gap-1.5 border-t border-border pt-3">
          {suggestions.map((s) => (
            <li key={s} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <span aria-hidden className="text-primary">→</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="flex items-center gap-2 text-xs text-critical">
          <AlertTriangle size={12} aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
