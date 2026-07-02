// ============================================================================
// AssignResidentModal — assign an existing resident to a property + unit.
// ============================================================================

// Imports
import { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { PrimaryButton } from "../auth/buttons";

// Interfaces
export interface ResidentOption {
  id: number;
  fullName: string;
  email: string;
}

interface AssignResidentModalProps {
  open: boolean;
  residents: ResidentOption[];
  onClose: () => void;
  onAssign: (data: { residentId: string; unit: string }) => Promise<void>;
}

// Component
export function AssignResidentModal({ open, residents, onClose, onAssign }: AssignResidentModalProps) {
  const [residentId, setResidentId] = useState("");
  const [unit, setUnit] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (open) {
      setResidentId("");
      setUnit("");
    }
  }, [open]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentId) return;
    setAssigning(true);
    await onAssign({ residentId, unit });
    setAssigning(false);
    onClose();
  }, [residentId, unit, onAssign, onClose]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-popover shadow-lg focus:outline-none">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <Dialog.Title className="text-foreground">Assign Resident</Dialog.Title>
            <Dialog.Close asChild>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground">Resident *</label>
              <select
                required
                value={residentId}
                onChange={(e) => setResidentId(e.target.value)}
                className="rounded-xl border border-border bg-input px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">— Select resident —</option>
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>{r.fullName} ({r.email})</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground">Unit Number (optional)</label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. 12B"
                className="rounded-xl border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <PrimaryButton type="submit" loading={assigning} fullWidth={false} className="flex-1">
                Assign
              </PrimaryButton>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
