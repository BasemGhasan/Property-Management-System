// ============================================================================
// Badges — StatusBadge & PriorityBadge.
// Small pill labels driven by the color maps in constants/resident.
// ============================================================================

// Imports
import {
  STATUS_STYLES,
  PRIORITY_STYLES,
  type RequestStatus,
  type RequestPriority,
} from "../../constants/resident";

// ----------------------------------------------------------------------------
// StatusBadge
// ----------------------------------------------------------------------------
interface StatusBadgeProps {
  status: RequestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-data text-[11px] uppercase tracking-wide ${style.classes}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

// ----------------------------------------------------------------------------
// PriorityBadge
// ----------------------------------------------------------------------------
interface PriorityBadgeProps {
  priority: RequestPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const style = PRIORITY_STYLES[priority];
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-data text-[11px] uppercase tracking-wide ${style.classes}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
