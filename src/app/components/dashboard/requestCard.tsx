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
      className="flex w-full flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-800/40 p-5 text-left transition-colors hover:border-slate-600 hover:bg-slate-800/70"
    >
      {/* Title + status */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-slate-100">{request.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{categoryLabel(request.category)}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
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
        <span className="text-xs text-slate-500">{request.id}</span>
      </div>
    </button>
  );
}
