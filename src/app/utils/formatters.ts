// ============================================================================
// formatters.ts — pure utility functions shared across the application.
// No dependencies on React or app-specific modules.
// ============================================================================

/** Format an ISO date string into a short readable label, e.g. "Jun 15, 2026". */
export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Capitalise the first letter of every word in a string. */
export function titleCase(str: string): string {
  return str
    .split(/[\s-_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Convert a slug like "water-leakage" into "Water Leakage". */
export function slugToLabel(slug: string): string {
  return titleCase(slug.replace(/-/g, " "));
}

/** Format a number as whole-dollar currency, e.g. 4250 → "$4,250". */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format a signed percentage delta, e.g. 0.124 → "+12.4%". Returns "—" when undefined. */
export function formatDelta(ratio: number | undefined): string {
  if (ratio === undefined || !Number.isFinite(ratio)) return "—";
  const pct = ratio * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

/** Return user initials from a full name, e.g. "Jane Doe" → "JD". */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
