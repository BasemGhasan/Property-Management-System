// ============================================================================
// financials.ts — pure aggregation of rent income and maintenance-claim
// deductions for the owner's Analytics tab. No React, no I/O.
//
// Income is occupancy-derived: a unit contributes its MonthlyRent to a month
// only if a resident was assigned to it on or before the end of that month.
// The schema records move-ins (PropertyResident.AssignedAt) but not move-outs,
// so a unit is treated as occupied from its assignment date onward.
//
// Deductions are real: approved maintenance claims, bucketed by the month they
// were reviewed (falling back to submission date for older rows).
// ============================================================================

import type { Property } from "../constants/owner";
import type { MaintenanceClaim } from "../constants/claims";

/** How many months of history the trend charts show, including the current month. */
export const TREND_MONTHS = 6;

export interface MonthPoint {
  /** Sortable key, e.g. "2026-07". */
  key: string;
  /** Short display label, e.g. "Jul". */
  label: string;
  income: number;
  deductions: number;
  net: number;
}

export interface PropertyRow {
  id: string;
  name: string;
  unitCount: number;
  occupiedUnits: number;
  occupancyRate: number;
  monthlyIncome: number;
  deductions: number;
  net: number;
}

export interface UnitRow {
  id: string;
  propertyId: string;
  propertyName: string;
  unitIdentifier: string;
  monthlyRent: number;
  occupied: boolean;
  residentName: string | null;
  deductions: number;
  net: number;
}

export interface FinancialTotals {
  /** Rent roll from currently-occupied units, per month. */
  monthlyIncome: number;
  /** Approved claim value across the trend window. */
  approvedDeductions: number;
  /** monthlyIncome minus the current month's approved deductions. */
  netIncome: number;
  /** Claims still awaiting owner review — future deduction exposure. */
  pendingClaims: number;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  /** Month-over-month change in net, as a ratio. Undefined with <2 usable months. */
  netTrend: number | undefined;
}

export interface AggregateResult {
  months: MonthPoint[];
  propertyRows: PropertyRow[];
  unitRows: UnitRow[];
  totals: FinancialTotals;
  /** True when at least one approved claim couldn't be traced to a specific unit. */
  hasUnattributedClaims: boolean;
}

// ── Date helpers (UTC throughout, so month bucketing never drifts by timezone) ──

/** Parses "YYYY-MM-DD" or a full ISO timestamp into a UTC Date. Returns null when unusable. */
function parseUtc(value: string | undefined): Date | null {
  if (!value) return null;
  const iso = value.length === 10 ? `${value}T00:00:00Z` : value;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Last millisecond of the month `offset` months before `from`. */
function endOfMonth(from: Date, offset: number): Date {
  return new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() - offset + 1, 0, 23, 59, 59, 999));
}

/** First millisecond of the month `offset` months before `from`. */
function startOfMonth(from: Date, offset: number): Date {
  return new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() - offset, 1, 0, 0, 0, 0));
}

/** The trailing TREND_MONTHS month boundaries, oldest first. */
function buildMonthWindow(now: Date) {
  return Array.from({ length: TREND_MONTHS }, (_, i) => {
    const offset = TREND_MONTHS - 1 - i;
    const end = endOfMonth(now, offset);
    return {
      key: monthKey(end),
      label: end.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      end,
    };
  });
}

/** The date an approved claim should be charged against. */
function claimDate(claim: MaintenanceClaim): Date | null {
  return parseUtc(claim.reviewedAt) ?? parseUtc(claim.submittedAt);
}

// ── Unit identity ────────────────────────────────────────────────────────────

/**
 * Reconciles the two ways a unit gets named in this system.
 *
 * `PropertyUnit.UnitIdentifier` is authored in the unit editor and tends to read
 * "Unit 1" / "A". `PropertyResident.UnitNumber` is free text typed into the
 * assign-resident modal and tends to read "1" / "a". Nothing constrains them to
 * agree, so an exact string compare matches almost nothing. Normalising both
 * sides to a bare token lets "Unit 1", "unit 1", "#1" and "01" all resolve to "1".
 *
 * Returns "" for a unit that carries no usable identity; callers must treat that
 * as "no unit" rather than as a joinable key.
 */
export function normalizeUnit(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/^(unit|apt|apartment|room|no\.?|#)\s*/, "")
    .replace(/^0+(?=\d)/, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Aggregation ──────────────────────────────────────────────────────────────

export function aggregateFinancials(
  properties: Property[],
  claims: MaintenanceClaim[],
  now: Date
): AggregateResult {
  const window = buildMonthWindow(now);
  // Floor is the first instant of the oldest month in the window, not its end.
  const windowStart = startOfMonth(now, TREND_MONTHS - 1);
  const approved = claims.filter((c) => c.status === "approved");

  // (propertyId, residentId) → normalized unit token. Keyed on both so a resident
  // assigned to two properties never bleeds across them.
  const residentUnit = new Map<string, string>();
  // propertyId → the normalized tokens that correspond to a real configured unit.
  const validUnits = new Map<string, Set<string>>();

  for (const p of properties) {
    validUnits.set(p.id, new Set(p.units.map((u) => normalizeUnit(u.unitIdentifier)).filter(Boolean)));
    for (const r of p.residents) {
      residentUnit.set(`${p.id}:${r.id}`, normalizeUnit(r.unit));
    }
  }

  /** Was this unit occupied at the given instant? */
  const occupiedAt = (p: Property, unitIdentifier: string, at: Date): boolean => {
    const unitKey = normalizeUnit(unitIdentifier);
    if (!unitKey) return false;
    return p.residents.some((r) => {
      if (normalizeUnit(r.unit) !== unitKey) return false;
      const assigned = parseUtc(r.assignedAt);
      return assigned !== null && assigned.getTime() <= at.getTime();
    });
  };

  // ── Monthly trend ──
  const deductionsByMonth = new Map<string, number>();
  for (const c of approved) {
    const d = claimDate(c);
    if (!d) continue;
    const key = monthKey(d);
    deductionsByMonth.set(key, (deductionsByMonth.get(key) ?? 0) + c.amount);
  }

  const months: MonthPoint[] = window.map(({ key, label, end }) => {
    let income = 0;
    for (const p of properties) {
      for (const u of p.units) {
        if (occupiedAt(p, u.unitIdentifier, end)) income += u.monthlyRent;
      }
    }
    const deductions = deductionsByMonth.get(key) ?? 0;
    return { key, label, income, deductions, net: income - deductions };
  });

  // ── Claims inside the trend window, for per-property / per-unit attribution ──
  const windowedApproved = approved.filter((c) => {
    const d = claimDate(c);
    return d !== null && d.getTime() >= windowStart.getTime();
  });

  const deductionsByProperty = new Map<string, number>();
  const deductionsByUnit = new Map<string, number>();
  let hasUnattributedClaims = false;

  for (const c of windowedApproved) {
    deductionsByProperty.set(c.propertyId, (deductionsByProperty.get(c.propertyId) ?? 0) + c.amount);

    const unit = residentUnit.get(`${c.propertyId}:${c.residentId}`);
    // Only attribute to a unit that actually exists on the property. A claimant who
    // has since been unassigned, was never given a unit number, or whose unit number
    // names no configured unit rolls up to the property total instead.
    if (unit && validUnits.get(c.propertyId)?.has(unit)) {
      const k = `${c.propertyId}:${unit}`;
      deductionsByUnit.set(k, (deductionsByUnit.get(k) ?? 0) + c.amount);
    } else {
      hasUnattributedClaims = true;
    }
  }

  // ── Per-property rows (income = current occupied rent roll) ──
  const propertyRows: PropertyRow[] = properties.map((p) => {
    const occupied = p.units.filter((u) => occupiedAt(p, u.unitIdentifier, now));
    const monthlyIncome = occupied.reduce((sum, u) => sum + u.monthlyRent, 0);
    const deductions = deductionsByProperty.get(p.id) ?? 0;
    return {
      id: p.id,
      name: p.name,
      unitCount: p.units.length,
      occupiedUnits: occupied.length,
      occupancyRate: p.units.length > 0 ? occupied.length / p.units.length : 0,
      monthlyIncome,
      deductions,
      net: monthlyIncome - deductions,
    };
  });

  // ── Per-unit rows ──
  const unitRows: UnitRow[] = properties.flatMap((p) =>
    p.units.map((u) => {
      const unitKey = normalizeUnit(u.unitIdentifier);
      const occupied = occupiedAt(p, u.unitIdentifier, now);
      const resident = p.residents.find((r) => normalizeUnit(r.unit) === unitKey);
      const deductions = deductionsByUnit.get(`${p.id}:${unitKey}`) ?? 0;
      const income = occupied ? u.monthlyRent : 0;
      return {
        id: u.id,
        propertyId: p.id,
        propertyName: p.name,
        unitIdentifier: u.unitIdentifier,
        monthlyRent: u.monthlyRent,
        occupied,
        residentName: occupied ? (resident?.name ?? null) : null,
        deductions,
        net: income - deductions,
      };
    })
  );

  // ── Totals ──
  const totalUnits = unitRows.length;
  const occupiedUnits = unitRows.filter((u) => u.occupied).length;
  const monthlyIncome = propertyRows.reduce((s, r) => s + r.monthlyIncome, 0);
  const currentMonth = months[months.length - 1];
  const previousMonth = months.length >= 2 ? months[months.length - 2] : undefined;

  const netTrend =
    previousMonth && previousMonth.net !== 0
      ? (currentMonth.net - previousMonth.net) / Math.abs(previousMonth.net)
      : undefined;

  const totals: FinancialTotals = {
    monthlyIncome,
    approvedDeductions: windowedApproved.reduce((s, c) => s + c.amount, 0),
    netIncome: monthlyIncome - currentMonth.deductions,
    pendingClaims: claims.filter((c) => c.status === "pending").reduce((s, c) => s + c.amount, 0),
    totalUnits,
    occupiedUnits,
    occupancyRate: totalUnits > 0 ? occupiedUnits / totalUnits : 0,
    netTrend,
  };

  return { months, propertyRows, unitRows, totals, hasUnattributedClaims };
}
