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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${style.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${style.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
