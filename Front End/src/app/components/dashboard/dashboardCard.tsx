// ============================================================================
// DashboardCard — flat stat tile: kicker label + serif value. No icon chip.
// ============================================================================

// Imports
import type { LucideIcon } from "lucide-react";

// Interfaces
interface DashboardCardProps {
  label: string;
  value: number;
  /** Unused visually (kept so call sites don't need to change); icon chips were dropped from this design. */
  icon?: LucideIcon;
  /** Accent theme controlling the value color. */
  accent: "blue" | "orange" | "green" | "slate";
  onClick?: () => void;
}

// Accent → value text color.
const ACCENTS: Record<DashboardCardProps["accent"], string> = {
  blue: "text-primary",
  orange: "text-warning",
  green: "text-success",
  slate: "text-foreground",
};

// Component
export function DashboardCard({ label, value, accent, onClick }: DashboardCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-start gap-2 border border-border bg-card px-5 py-4 text-left transition-colors hover:border-foreground/30"
    >
      <p className="font-data text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`font-display text-3xl leading-none tabular-nums ${ACCENTS[accent]}`}>{value}</p>
    </button>
  );
}
