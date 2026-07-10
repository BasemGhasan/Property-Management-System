// ============================================================================
// OwnerAnalyticsPage — income & deduction summary for the owner's portfolio.
// Charts only: monthly trend, per-property mix, per-unit mix, each paired with
// an AI-generated trend read and actionable suggestions.
// ============================================================================

// Imports
import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Info } from "lucide-react";
import { OwnerLayout } from "../../layouts/ownerLayout";
import { StatTile } from "../../components/shared/statTile";
import { LoadingState } from "../../components/shared/loadingState";
import { EmptyState } from "../../components/shared/emptyState";
import { InsightCard } from "../../components/owner/insightCard";
import { ChartContainer, type ChartConfig } from "../../components/ui/chart";
import { useFinancialData, TREND_MONTHS } from "../../hooks/useFinancialData";
import { useChartInsight } from "../../hooks/useChartInsight";
import type { InsightPoint } from "../../services/insightService";
import { formatCurrency, formatDelta } from "../../utils/formatters";

// How many units the per-unit chart renders before truncating.
const MAX_UNIT_BARS = 10;

const CHART_CONFIG: ChartConfig = {
  income: { label: "Income", color: "var(--chart-1)" },
  deductions: { label: "Deductions", color: "var(--chart-4)" },
  net: { label: "Net", color: "var(--chart-2)" },
};

// ── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipEntry {
  name?: string;
  dataKey?: string | number;
  value?: number;
  color?: string;
}

function MoneyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-border bg-card px-3 py-2 shadow-sm">
      <p className="mb-1 font-data text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={String(entry.dataKey)} className="flex items-center gap-2 text-xs text-foreground">
          <span className="inline-block h-2 w-2" style={{ backgroundColor: entry.color }} aria-hidden />
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="ml-auto tabular-nums">{formatCurrency(entry.value ?? 0)}</span>
        </p>
      ))}
    </div>
  );
}

const axisTick = { fontSize: 11 };
const money = (v: number) => formatCurrency(v);

// ── Chart section ────────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  insight: ReturnType<typeof useChartInsight>;
  emptyMessage?: string;
}

function ChartSection({ title, subtitle, children, insight, emptyMessage }: SectionProps) {
  return (
    <section className="flex flex-col gap-4 border border-border bg-card/40 p-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </header>
      {children}
      <InsightCard state={insight} emptyMessage={emptyMessage} />
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OwnerAnalyticsPage() {
  const {
    loading,
    error,
    months,
    propertyRows,
    unitRows,
    totals,
    hasUnattributedClaims,
    reload,
  } = useFinancialData();

  const ready = !loading && totals.totalUnits > 0;

  // Per-unit chart: worst net first, so problem units surface immediately.
  const rankedUnits = useMemo(
    () => [...unitRows].sort((a, b) => a.net - b.net).slice(0, MAX_UNIT_BARS),
    [unitRows]
  );

  const unitChartData = useMemo(
    () =>
      rankedUnits.map((u) => ({
        label: `${u.propertyName} · ${u.unitIdentifier}`,
        income: u.occupied ? u.monthlyRent : 0,
        deductions: u.deductions,
        net: u.net,
      })),
    [rankedUnits]
  );

  const propertyChartData = useMemo(
    () =>
      propertyRows.map((p) => ({
        label: p.name,
        income: p.monthlyIncome,
        deductions: p.deductions,
        net: p.net,
      })),
    [propertyRows]
  );

  // ── Insight payloads ──
  const trendPoints: InsightPoint[] = useMemo(
    () => months.map((m) => ({ label: m.label, income: m.income, deductions: m.deductions, net: m.net })),
    [months]
  );

  const propertyPoints: InsightPoint[] = useMemo(
    () =>
      propertyRows.map((p) => ({
        label: p.name,
        income: p.monthlyIncome,
        deductions: p.deductions,
        net: p.net,
        note: `${p.occupiedUnits}/${p.unitCount} units occupied`,
      })),
    [propertyRows]
  );

  const unitPoints: InsightPoint[] = useMemo(
    () =>
      rankedUnits.map((u) => ({
        label: `${u.propertyName} ${u.unitIdentifier}`,
        income: u.occupied ? u.monthlyRent : 0,
        deductions: u.deductions,
        net: u.net,
        note: u.occupied ? undefined : "vacant",
      })),
    [rankedUnits]
  );

  const trendInsight = useChartInsight({
    chartKey: "net-trend",
    chartLabel: `Net income trend over the last ${TREND_MONTHS} months`,
    points: trendPoints,
    kind: "TimeSeries",
    enabled: ready,
  });

  const propertyInsight = useChartInsight({
    chartKey: "property-mix",
    chartLabel: "Monthly income and maintenance deductions by property",
    points: propertyPoints,
    kind: "Category",
    enabled: ready,
  });

  const unitInsight = useChartInsight({
    chartKey: "unit-mix",
    chartLabel: "Monthly rent and maintenance deductions by unit (lowest net first)",
    points: unitPoints,
    kind: "Category",
    enabled: ready,
  });

  // Neutral when there is no prior month to compare against.
  let netTrendClass = "text-muted-foreground";
  if (totals.netTrend !== undefined) {
    netTrendClass = totals.netTrend < 0 ? "text-critical" : "text-success";
  }

  // ── Render ──
  if (loading) {
    return (
      <OwnerLayout title="Analytics">
        <LoadingState />
      </OwnerLayout>
    );
  }

  if (error) {
    return (
      <OwnerLayout title="Analytics" onRefresh={reload}>
        <EmptyState message={error} />
      </OwnerLayout>
    );
  }

  if (totals.totalUnits === 0) {
    return (
      <OwnerLayout title="Analytics" onRefresh={reload}>
        <EmptyState message="Add a property with configured units to see income analytics." />
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Analytics" onRefresh={reload}>
      <div className="flex flex-col gap-6">
        {/* Headline figures */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Monthly Income" value={formatCurrency(totals.monthlyIncome)} color="text-primary" />
          <StatTile
            label={`Deductions (${TREND_MONTHS}mo)`}
            value={formatCurrency(totals.approvedDeductions)}
            color="text-critical"
          />
          <StatTile
            label="Net Income"
            value={formatCurrency(totals.netIncome)}
            color={totals.netIncome >= 0 ? "text-success" : "text-critical"}
          />
          <StatTile
            label="Occupancy"
            value={`${totals.occupiedUnits}/${totals.totalUnits}`}
            color="text-foreground"
          />
        </div>

        {/* Secondary context */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-border bg-card/40 px-5 py-3 text-xs text-muted-foreground">
          <span>
            Net month-over-month:{" "}
            <span className={netTrendClass}>{formatDelta(totals.netTrend)}</span>
          </span>
          <span>
            Pending claims awaiting your review:{" "}
            <span className="text-warning">{formatCurrency(totals.pendingClaims)}</span>
          </span>
        </div>

        {/* Data-provenance notice — the schema records move-ins but not move-outs. */}
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Info size={13} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            Deductions are actual approved maintenance claims, dated by review. Income is reconstructed from each
            unit&apos;s current rent and the date its tenant was assigned — the system records move-ins but not
            move-outs, so a unit counts as occupied from assignment onward.
            {hasUnattributedClaims && " Some approved claims could not be traced to a specific unit and appear only in property and portfolio totals."}
          </span>
        </p>

        {/* 1 — Monthly trend */}
        <ChartSection
          title="Income vs Deductions"
          subtitle={`Net position across the last ${TREND_MONTHS} months.`}
          insight={trendInsight}
        >
          <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[300px] w-full">
            <ComposedChart data={months} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
              <YAxis tickFormatter={money} tickLine={false} axisLine={false} tick={axisTick} width={70} />
              <Tooltip content={<MoneyTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="deductions" name="Deductions" fill="var(--color-deductions)" barSize={22} />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="var(--color-income)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="net"
                name="Net"
                stroke="var(--color-net)"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
              />
            </ComposedChart>
          </ChartContainer>
        </ChartSection>

        {/* 2 — Per-property */}
        <ChartSection
          title="By Property"
          subtitle="Current monthly rent roll against maintenance deductions charged over the window."
          insight={propertyInsight}
          emptyMessage="No properties to analyse."
        >
          <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[300px] w-full">
            <ComposedChart data={propertyChartData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
              <YAxis tickFormatter={money} tickLine={false} axisLine={false} tick={axisTick} width={70} />
              <Tooltip content={<MoneyTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="income" name="Income" fill="var(--color-income)" barSize={22} />
              <Bar dataKey="deductions" name="Deductions" fill="var(--color-deductions)" barSize={22} />
            </ComposedChart>
          </ChartContainer>
        </ChartSection>

        {/* 3 — Per-unit */}
        <ChartSection
          title="By Unit"
          subtitle={
            unitRows.length > MAX_UNIT_BARS
              ? `Lowest ${MAX_UNIT_BARS} units by net position, of ${unitRows.length} total.`
              : "Rent against deductions, lowest net first. Vacant units show zero income."
          }
          insight={unitInsight}
          emptyMessage="No units configured."
        >
          <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[340px] w-full">
            <ComposedChart
              data={unitChartData}
              layout="vertical"
              margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={money} tickLine={false} axisLine={false} tick={axisTick} />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={axisTick}
                width={150}
              />
              <Tooltip content={<MoneyTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="income" name="Income" fill="var(--color-income)" barSize={10} />
              <Bar dataKey="deductions" name="Deductions" fill="var(--color-deductions)" barSize={10} />
            </ComposedChart>
          </ChartContainer>
        </ChartSection>
      </div>
    </OwnerLayout>
  );
}
