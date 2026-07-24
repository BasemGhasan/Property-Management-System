// ============================================================================
// EditPropertyModal — edit a property's name, address, and unit count.
// ============================================================================

// Imports
import { useCallback, useEffect, useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { toast } from "sonner";
import { X } from "lucide-react";
import { PrimaryButton } from "../auth/buttons";
import type { PropertyUnit } from "../../constants/owner";

// Interfaces
/** Minimal shape needed to populate the edit form — satisfied by both owner Property and admin AdminProperty. */
export interface EditablePropertySummary {
  name: string;
  address: string;
  unitCount?: number;
  description: string;
  units: PropertyUnit[];
}

interface EditPropertyModalProps {
  readonly open: boolean;
  readonly property: EditablePropertySummary | null;
  /** Units can't be reduced below this (e.g. number of assigned residents). Defaults to 1. */
  readonly minUnits?: number;
  readonly onClose: () => void;
  readonly onSave: (data: {
    name: string;
    address: string;
    unitCount: number;
    description: string;
    units: Partial<PropertyUnit>[];
  }) => Promise<void>;
}

// Component
export function EditPropertyModal({ open, property, minUnits: minUnitsProp = 1, onClose, onSave }: EditPropertyModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [unitCount, setUnitCount] = useState(1);
  const [description, setDescription] = useState("");
  const [units, setUnits] = useState<Partial<PropertyUnit>[]>([]);
  const [saving, setSaving] = useState(false);

  const buildUnits = useCallback((count: number, sourceUnits: Partial<PropertyUnit>[] = []) => {
    const normalizedCount = Math.max(1, count);

    return Array.from({ length: normalizedCount }, (_, index) => {
      const existingUnit = sourceUnits[index];
      if (existingUnit) {
        return {
          unitIdentifier: existingUnit.unitIdentifier ?? `Unit ${index + 1}`,
          bedrooms: existingUnit.bedrooms ?? 1,
          bathrooms: existingUnit.bathrooms ?? 1,
          monthlyRent: existingUnit.monthlyRent ?? 0,
        };
      }

      return {
        unitIdentifier: `Unit ${index + 1}`,
        bedrooms: 1,
        bathrooms: 1,
        monthlyRent: 0,
      };
    });
  }, []);

  useEffect(() => {
    if (!open || !property) {
      setName("");
      setAddress("");
      setUnitCount(1);
      setDescription("");
      setUnits(buildUnits(1));
      return;
    }

    const nextUnitCount = Math.max(property.unitCount ?? property.units?.length ?? 1, minUnitsProp);
    setName(property.name);
    setAddress(property.address);
    setUnitCount(nextUnitCount);
    setDescription(property.description ?? "");
    setUnits(buildUnits(nextUnitCount, property.units ?? []));
  }, [buildUnits, open, property, minUnitsProp]);

  const minUnits = minUnitsProp;

  const handleUnitCountChange = useCallback((nextCount: number) => {
    const normalizedCount = Math.max(minUnits, nextCount || 1);
    setUnitCount(normalizedCount);
    setUnits((prevUnits) => buildUnits(normalizedCount, prevUnits));
  }, [buildUnits, minUnits]);

  const handleSubmit = useCallback(async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const invalidUnits = units.filter(u => !u.unitIdentifier || !u.monthlyRent || u.monthlyRent <= 0);
    if (invalidUnits.length > 0) {
      toast.error("Please fill out all required details (Rent > 0, valid Identifier) for every unit.");
      return;
    }
    setSaving(true);
    try {
      await onSave({ name, address, unitCount, description, units });
      toast.success("Property updated successfully.");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update property.");
    } finally {
      setSaving(false);
    }
  }, [name, address, unitCount, description, units, onSave, onClose]);

  const updateUnit = (index: number, field: keyof PropertyUnit, value: any) => {
    const newUnits = [...units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setUnits(newUnits);
  };

  const totalRent = useMemo(() => units.reduce((sum, u) => sum + (Number(u.monthlyRent) || 0), 0), [units]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-popover shadow-lg focus:outline-none max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
            <Dialog.Title className="text-foreground">Edit Property</Dialog.Title>
            <Dialog.Close asChild>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <Tabs.Root defaultValue="basic" className="flex flex-col flex-1 overflow-hidden">
              <Tabs.List className="px-6 pt-4 flex gap-4 border-b border-border shrink-0">
                <Tabs.Trigger value="basic" className="pb-2 text-sm text-muted-foreground hover:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">
                  Basic Info & Specs
                </Tabs.Trigger>
                <Tabs.Trigger value="units" className="pb-2 text-sm text-muted-foreground hover:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">
                  Unit Configuration
                </Tabs.Trigger>
              </Tabs.List>

              <div className="overflow-y-auto px-6 py-5 flex-1">
                <Tabs.Content value="basic" className="flex flex-col gap-4">
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
                    <label className="text-sm text-muted-foreground">Total Units *</label>
                    <input
                      type="number"
                      min={minUnits}
                      required
                      value={unitCount}
                      onChange={(e) => handleUnitCountChange(Number(e.target.value))}
                      className="rounded-xl border border-border bg-input px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {minUnits > 1 ? `Can't go below ${minUnits} — residents are assigned.` : "This defines the exact number of unit configurations required."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-muted-foreground">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={1000}
                      rows={3}
                      className="rounded-xl border border-border bg-input px-4 py-2.5 text-foreground focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                </Tabs.Content>

                <Tabs.Content value="units" className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-foreground">Configured Units ({units.length})</h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {units.map((unit, idx) => (
                      <div key={`${unit.unitIdentifier ?? "unit"}-${idx}`} className="flex gap-3 items-start bg-card/50 p-3 rounded-xl border border-border relative group">
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Identifier *</label>
                            <input
                              required
                              value={unit.unitIdentifier || ""}
                              onChange={(e) => updateUnit(idx, "unitIdentifier", e.target.value)}
                              placeholder="e.g. Apt 101"
                              className="w-full rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Beds *</label>
                            <input
                              type="number"
                              min={0}
                              required
                              value={unit.bedrooms ?? 0}
                              onChange={(e) => updateUnit(idx, "bedrooms", Number(e.target.value))}
                              className="w-full rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Baths *</label>
                            <input
                              type="number"
                              min={0}
                              required
                              value={unit.bathrooms ?? 0}
                              onChange={(e) => updateUnit(idx, "bathrooms", Number(e.target.value))}
                              className="w-full rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Rent ($) *</label>
                            <input
                              type="number"
                              min={0.01}
                              step={0.01}
                              required
                              value={unit.monthlyRent || ""}
                              onChange={(e) => updateUnit(idx, "monthlyRent", Number(e.target.value))}
                              className="w-full rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">Total Expected Property Rent:</span>
                    <span className="text-lg font-bold text-primary">${totalRent.toLocaleString()}</span>
                  </div>
                </Tabs.Content>
              </div>
            </Tabs.Root>

            <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0 bg-popover">
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
