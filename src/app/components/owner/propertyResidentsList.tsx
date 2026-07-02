// ============================================================================
// PropertyResidentsList — residents assigned to a property, with remove
// action. Used on the owner Property Details page.
// ============================================================================

// Imports
import { Mail, Trash2, UserPlus } from "lucide-react";
import type { Resident } from "../../constants/owner";

// Interfaces
interface PropertyResidentsListProps {
  residents: Resident[];
  onAssign: () => void;
  onRemove: (residentId: string) => void;
}

// Component
export function PropertyResidentsList({ residents, onAssign, onRemove }: PropertyResidentsListProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-foreground">Residents ({residents.length})</h3>
        <button
          onClick={onAssign}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary"
        >
          <UserPlus size={13} /> Assign Resident
        </button>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {residents.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground">No residents assigned yet.</p>
        )}
        {residents.map((r) => (
          <div key={r.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs text-secondary-foreground">
                {r.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <div>
                <p className="text-sm text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.unit ? `Unit ${r.unit}` : "No unit assigned"}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 pl-12 sm:pl-0">
              <a href={`mailto:${r.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
                <Mail size={13} /> {r.email}
              </a>
              <button onClick={() => onRemove(r.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-700">
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
