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
      <div className="rounded-2xl border border-border bg-card/40 p-12 text-center text-muted-foreground">
        No requests match your filters.
      </div>
    );
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Request ID</th>
              <th className="px-5 py-3">Property</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Priority</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requests.map((r) => (
              <tr
                key={r.id}
                onClick={() => onRowClick(r.id)}
                className="cursor-pointer bg-background/20 transition-colors hover:bg-accent"
              >
                <td className="px-5 py-4 text-secondary-foreground">{r.id}</td>
                <td className="px-5 py-4 text-muted-foreground">{r.property}</td>
                <td className="px-5 py-4 text-muted-foreground">{categoryLabel(r.category)}</td>
                <td className="px-5 py-4">
                  <PriorityBadge priority={r.priority} />
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 py-4 text-muted-foreground">{r.submittedAt}</td>
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
