// ============================================================================
// RequestTable — responsive request list. Renders a table on desktop and
// stacked cards on mobile. Rows are clickable to open details.
// ============================================================================

// Imports
import { StatusBadge, PriorityBadge } from "./badges";
import { RequestCard } from "./requestCard";
import { categoryLabel, type MaintenanceRequest } from "../../constants/resident";

// Interfaces
interface RequestTableProps {
  requests: MaintenanceRequest[];
  onRowClick: (id: string) => void;
}

// Component
export function RequestTable({ requests, onRowClick }: RequestTableProps) {
  // Empty state
  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-12 text-center text-slate-500">
        No requests match your filters.
      </div>
    );
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-800 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3">Request ID</th>
              <th className="px-5 py-3">Property</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Priority</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {requests.map((r) => (
              <tr
                key={r.id}
                onClick={() => onRowClick(r.id)}
                className="cursor-pointer bg-slate-900/20 transition-colors hover:bg-slate-800/50"
              >
                <td className="px-5 py-4 text-slate-300">{r.id}</td>
                <td className="px-5 py-4 text-slate-400">{r.property}</td>
                <td className="px-5 py-4 text-slate-400">{categoryLabel(r.category)}</td>
                <td className="px-5 py-4">
                  <PriorityBadge priority={r.priority} />
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 py-4 text-slate-400">{r.submittedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {requests.map((r) => (
          <RequestCard key={r.id} request={r} onClick={() => onRowClick(r.id)} />
        ))}
      </div>
    </>
  );
}
