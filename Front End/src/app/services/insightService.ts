import { api } from "../lib/apiClient";

export interface InsightPoint {
  label: string;
  income?: number;
  deductions?: number;
  net?: number;
  note?: string;
}

/**
 * Whether the chart's points are ordered in time. Categorical charts (by property,
 * by unit) must not be described with trend language, so the backend shapes the
 * prompt differently for each.
 */
export type SeriesKind = "TimeSeries" | "Category";

export interface FinancialInsight {
  insight: string;
  suggestions: string[];
}

interface ApiInsight {
  insight: string;
  suggestions?: string[] | null;
}

/** Asks the backend to generate a trend read + suggestions for one chart's series. */
export async function getFinancialInsight(
  chartKey: string,
  chartLabel: string,
  points: InsightPoint[],
  kind: SeriesKind
): Promise<FinancialInsight> {
  const result = await api.post<ApiInsight>("/api/insights/financial", {
    chartKey,
    chartLabel,
    kind,
    points,
    currency: "$",
  });

  return {
    insight: result.insight,
    suggestions: result.suggestions ?? [],
  };
}
