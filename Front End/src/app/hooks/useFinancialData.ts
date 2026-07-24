// ============================================================================
// useFinancialData — loads the owner's properties and claims, then runs them
// through the pure aggregator in utils/financials.ts.
// ============================================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import { getProperties } from "../services/ownerService";
import { getMaintenanceClaims } from "../services/claimService";
import { aggregateFinancials, type AggregateResult } from "../utils/financials";
import type { Property } from "../constants/owner";
import type { MaintenanceClaim } from "../constants/claims";

export { TREND_MONTHS } from "../utils/financials";
export type { MonthPoint, PropertyRow, UnitRow, FinancialTotals } from "../utils/financials";

export type FinancialData = AggregateResult & {
  loading: boolean;
  error: string | null;
  properties: Property[];
  claims: MaintenanceClaim[];
  reload: () => Promise<void>;
};

export function useFinancialData(): FinancialData {
  const [properties, setProperties] = useState<Property[]>([]);
  const [claims, setClaims] = useState<MaintenanceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([getProperties(), getMaintenanceClaims()]);
      setProperties(p);
      setClaims(c);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load financial data.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    reload().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [reload]);

  const derived = useMemo(
    // `now` is captured per data-load rather than per render; month boundaries move
    // far more slowly than a dashboard session.
    () => aggregateFinancials(properties, claims, new Date()),
    [properties, claims]
  );

  return { loading, error, properties, claims, reload, ...derived };
}
