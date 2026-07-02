// ============================================================================
// EditPropertyModal — edit a property's name, address, and unit count.
// ============================================================================

// Imports
import { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { PrimaryButton } from "../auth/buttons";
import type { Property } from "../../constants/owner";

// Interfaces
interface EditPropertyModalProps {
  open: boolean;
  property: Property | null;
  onClose: () => void;
  onSave: (data: { name: string; address: string; unitCount: number }) => Promise<void>;
}

// Component
export function EditPropertyModal({ open, property, onClose, onSave }: EditPropertyModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [units, setUnits] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (property) {
      setName(property.name);
      setAddress(property.address);
      setUnits(1);
    }
  }, [property, open]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ name, address, unitCount: units });
    setSaving(false);
    onClose();
  }, [name, address, units, onSave, onClose]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-popover shadow-lg focus:outline-none">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <Dialog.Title className="text-foreground">Edit Property</Dialog.Title>
            <Dialog.Close asChild>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground">Property Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-border bg-input px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground">Address *</label>
              <input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-xl border border-border bg-input px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground">Number of Units</label>
              <input
                type="number"
                min={1}
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="rounded-xl border border-border bg-input px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
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
              <PrimaryButton type="submit" loading={saving} fullWidth={false} className="flex-1">
                Save Changes
              </PrimaryButton>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
