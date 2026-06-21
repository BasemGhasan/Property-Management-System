// ============================================================================
// DashboardCard — stat tile showing a count with an icon and accent color.
// ============================================================================

// Imports
import type { LucideIcon } from "lucide-react";

// Interfaces
interface DashboardCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Accent theme controlling icon + value color. */
  accent: "blue" | "orange" | "green" | "slate";
  onClick?: () => void;
}

// Accent → Tailwind class map.
const ACCENTS: Record<DashboardCardProps["accent"], { icon: string; ring: string }> = {
  blue: { icon: "bg-blue-500/15 text-blue-400", ring: "hover:border-blue-500/40" },
  orange: { icon: "bg-orange-500/15 text-orange-400", ring: "hover:border-orange-500/40" },
  green: { icon: "bg-green-500/15 text-green-400", ring: "hover:border-green-500/40" },
  slate: { icon: "bg-slate-500/15 text-slate-300", ring: "hover:border-slate-500/40" },
};

// Component
export function DashboardCard({ label, value, icon: Icon, accent, onClick }: DashboardCardProps) {
  const theme = ACCENTS[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-800/40 p-5 text-left transition-colors ${theme.ring}`}
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${theme.icon}`}>
        <Icon size={22} />
      </span>
      <div>
        <p className="text-2xl text-slate-100">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </button>
  );
}
