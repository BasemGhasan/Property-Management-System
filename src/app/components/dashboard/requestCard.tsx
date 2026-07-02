// ============================================================================
// RequestCard — compact card summarizing one maintenance request.
// ============================================================================

// Imports
import { Building2, Calendar } from "lucide-react";
import { StatusBadge, PriorityBadge } from "./badges";
import { categoryLabel, type MaintenanceRequest } from "../../constants/resident";

// Interfaces
interface RequestCardProps {
  request: MaintenanceRequest;
  onClick?: () => void;
}

// Component
export function RequestCard({ request, onClick }: RequestCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-card/40 p-5 text-left transition-colors hover:border-primary/40 hover:bg-input/70"
    >
      {/* Title + status */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-foreground">{request.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{categoryLabel(request.category)}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Building2 size={14} />
          {request.property}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={14} />
          {request.submittedAt}
        </span>
      </div>

      {/* Footer: priority + id */}
      <div className="flex items-center justify-between">
        <PriorityBadge priority={request.priority} />
        <span className="text-xs text-muted-foreground">{request.id}</span>
      </div>
    </button>
  );
}
