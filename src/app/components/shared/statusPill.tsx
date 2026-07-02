// ============================================================================
// StatusPill — active/inactive pill used in admin User and Property tables.
// Replaces two identical locally-defined StatusPill components.
// ============================================================================

// Interfaces
interface StatusPillProps {
  active: boolean;
  /** Override labels. Defaults to Active / Inactive. */
  labels?: [string, string];
}

// Component
export function StatusPill({ active, labels = ["Active", "Inactive"] }: StatusPillProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-data text-[11px] uppercase tracking-wide ${
      active
        ? "border-success/25 bg-success-soft text-success"
        : "border-critical/25 bg-critical-soft text-critical"
    }`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-success" : "bg-critical"}`} />
      {active ? labels[0] : labels[1]}
    </span>
  );
}
