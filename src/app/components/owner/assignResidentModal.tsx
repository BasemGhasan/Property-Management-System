// ============================================================================
// AssignResidentModal — assign an existing resident to a property + unit.
// ============================================================================

// Imports
import { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { X } from "lucide-react";
import { PrimaryButton } from "../auth/buttons";
import { ValidationMessage } from "../auth/messages";

// Interfaces
export interface ResidentOption {
  id: number;
  fullName: string;
  email: string;
}

interface AssignResidentModalProps {
  open: boolean;
  residents: ResidentOption[];
  /** Total units on the property; the unit field is constrained to 1..unitCount. */
  unitCount: number;
  /** Unit numbers already assigned to another resident on this property. */
  occupiedUnits: string[];
  onClose: () => void;
  onAssign: (data: { residentId: string; unit: string }) => Promise<void>;
}

// Component
export function AssignResidentModal({ open, residents, unitCount, occupiedUnits, onClose, onAssign }: AssignResidentModalProps) {
  const [residentId, setResidentId] = useState("");
  const [unit, setUnit] = useState("");
  const [unitError, setUnitError] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (open) {
      setResidentId("");
      setUnit("");
      setUnitError("");
    }
  }, [open]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentId) return;

    if (unit) {
      const parsed = Number(unit);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > unitCount) {
        setUnitError(`Enter a unit between 1 and ${unitCount}.`);
        return;
      }
      if (occupiedUnits.includes(unit)) {
        setUnitError(`Unit ${unit} is already occupied.`);
        return;
      }
    }
    setUnitError("");

    setAssigning(true);
    try {
      await onAssign({ residentId, unit });
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign resident.");
    } finally {
      setAssigning(false);
    }
  }, [residentId, unit, unitCount, occupiedUnits, onAssign, onClose]);

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
              <label className="text-sm text-muted-foreground">
                Unit Number (optional) — 1 to {unitCount}
              </label>
              <input
                type="number"
                min={1}
                max={unitCount}
                value={unit}
                onChange={(e) => { setUnit(e.target.value); setUnitError(""); }}
                placeholder={`e.g. 1`}
                className="rounded-xl border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <ValidationMessage message={unitError} />
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
