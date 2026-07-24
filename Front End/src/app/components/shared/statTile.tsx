// ============================================================================
// StatTile — small icon + value + label tile used in detail-page stat rows.
// ============================================================================

// Interfaces
interface StatTileProps {
  icon?: React.ComponentType<{ size?: number }>;
  label: string;
  value: string | number;
  /** Tailwind text-color class for the value. Defaults to the foreground ink. */
  color?: string;
}

// Component
export function StatTile({ label, value, color = "text-foreground" }: StatTileProps) {
  return (
    <div className="flex flex-col gap-2 border border-border bg-card p-4">
      <p className="font-data text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`font-display text-2xl leading-none tabular-nums ${color}`}>{value}</p>
    </div>
  );
}
