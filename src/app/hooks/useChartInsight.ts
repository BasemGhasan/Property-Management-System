// ============================================================================
// useChartInsight — fetches an AI trend read for one chart, cached by content.
//
// The chart's data is hashed; the hash is both the cache key and the change
// detector. Re-renders with identical data never re-hit the API. A manual
// refresh bypasses the cache and overwrites it.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getFinancialInsight,
  type FinancialInsight,
  type InsightPoint,
  type SeriesKind,
} from "../services/insightService";
import { hashValue } from "../utils/hash";

const CACHE_PREFIX = "insight_";
/** Cached insights older than this are re-fetched. */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
  insight: string;
  suggestions: string[];
  savedAt: number;
}

function cacheKey(chartKey: string, dataHash: string): string {
  return `${CACHE_PREFIX}${chartKey}_${dataHash}`;
}

function readCache(key: string): FinancialInsight | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.savedAt > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return { insight: entry.insight, suggestions: entry.suggestions ?? [] };
  } catch {
    return null;
  }
}

function writeCache(key: string, value: FinancialInsight): void {
  try {
    const entry: CacheEntry = { ...value, savedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Quota exceeded or storage disabled — the insight still renders, just uncached.
  }
}

export interface ChartInsightState {
  insight: string | null;
  suggestions: string[];
  loading: boolean;
  error: string | null;
  /** True when the currently-shown insight came from localStorage. */
  fromCache: boolean;
  refresh: () => void;
}

interface Options {
  chartKey: string;
  chartLabel: string;
  points: InsightPoint[];
  kind: SeriesKind;
  /** Hold off until the underlying data has actually loaded. */
  enabled?: boolean;
}

export function useChartInsight({ chartKey, chartLabel, points, kind, enabled = true }: Options): ChartInsightState {
  const [insight, setInsight] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  // Hashes we have already auto-attempted. `points` is a fresh array every render,
  // so `load` changes identity constantly — without this the effect would refire
  // mid-flight and double-fetch. One auto-attempt per distinct dataset; failures
  // are recovered via the manual refresh button rather than an effect retry loop.
  const attemptedHashRef = useRef<string | null>(null);
  // Guards against a slow response for stale data overwriting a newer one.
  const requestIdRef = useRef(0);

  // `kind` participates in the hash so switching it invalidates any cached insight.
  const dataHash = hashValue({ kind, points });
  const hasData = points.length > 0;

  const load = useCallback(
    async (force: boolean) => {
      const key = cacheKey(chartKey, dataHash);
      attemptedHashRef.current = dataHash;

      if (!force) {
        const cached = readCache(key);
        if (cached) {
          setInsight(cached.insight);
          setSuggestions(cached.suggestions);
          setFromCache(true);
          setError(null);
          setLoading(false);
          return;
        }
      }

      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const result = await getFinancialInsight(chartKey, chartLabel, points, kind);
        if (requestId !== requestIdRef.current) return; // superseded

        writeCache(key, result);
        setInsight(result.insight);
        setSuggestions(result.suggestions);
        setFromCache(false);
      } catch (e) {
        if (requestId !== requestIdRef.current) return;
        // Leave any previously-rendered insight in place; surface the failure alongside it.
        setError(e instanceof Error ? e.message : "Could not generate an insight.");
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [chartKey, chartLabel, points, kind, dataHash]
  );

  useEffect(() => {
    if (!enabled || !hasData) return;
    if (attemptedHashRef.current === dataHash) return; // same data, already attempted
    void load(false);
  }, [enabled, hasData, dataHash, load]);

  const refresh = useCallback(() => {
    if (!enabled || !hasData) return;
    void load(true);
  }, [enabled, hasData, load]);

  return { insight, suggestions, loading, error, fromCache, refresh };
}
