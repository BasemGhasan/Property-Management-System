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
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
      active
        ? "border-green-500/30 bg-green-500/10 text-green-300"
        : "border-red-500/30 bg-red-500/10 text-red-300"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green-400" : "bg-red-400"}`} />
      {active ? labels[0] : labels[1]}
    </span>
  );
}
