// ============================================================================
// CategoryFormModal — Add / Edit an issue category.
// Reuses InputField, SelectField, PrimaryButton, SecondaryButton from Batch 1.
// ============================================================================

// Imports
import { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { InputField } from "../auth/inputField";
import { SelectField } from "../auth/selectField";
import { PrimaryButton, SecondaryButton } from "../auth/buttons";
import type { IssueCategory } from "../../constants/admin";

// Interfaces
interface CategoryFormModalProps {
  open: boolean;
  /** Pass an existing category to edit; null = add new. */
  category: IssueCategory | null;
  onClose: () => void;
  onSave: (data: Omit<IssueCategory, "id">) => Promise<void>;
}

const PRIORITY_OPTIONS = [
  { value: "low",      label: "Low"      },
  { value: "medium",   label: "Medium"   },
  { value: "high",     label: "High"     },
  { value: "critical", label: "Critical" },
];

// Component
export function CategoryFormModal({ open, category, onClose, onSave }: CategoryFormModalProps) {
  const isEdit = !!category;

  const [name, setName]         = useState("");
  const [slug, setSlug]         = useState("");
  const [priority, setPriority] = useState("medium");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving]     = useState(false);

  // Populate fields when editing
  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setPriority(category.defaultPriority);
    } else {
      setName(""); setSlug(""); setPriority("medium");
    }
    setNameError("");
  }, [category, open]);

  // Auto-derive slug from name
  const handleNameChange = useCallback((value: string) => {
    setName(value);
    if (!isEdit) setSlug(value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  }, [isEdit]);

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setNameError("Category name is required."); return; }
    setSaving(true);
    await onSave({ name: name.trim(), slug, defaultPriority: priority as IssueCategory["defaultPriority"], active: true });
    setSaving(false);
    onClose();
  }, [name, slug, priority, onSave, onClose]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/60 focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <Dialog.Title className="text-slate-100">
              {isEdit ? "Edit Category" : "Add Category"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="flex flex-col gap-5 px-6 py-5" noValidate>
            <InputField
              label="Category Name"
              name="catName"
              placeholder="e.g. Water Leakage"
              value={name}
              error={nameError}
              onChange={(e) => handleNameChange(e.target.value)}
            />

            <InputField
              label="Slug (auto-generated)"
              name="catSlug"
              placeholder="water-leakage"
              value={slug}
              readOnly={!isEdit}
              disabled={!isEdit}
              onChange={(e) => setSlug(e.target.value)}
            />

            <SelectField
              label="Default Priority"
              name="catPriority"
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            />

            <div className="flex gap-3">
              <PrimaryButton type="submit" fullWidth={false} loading={saving} className="flex-1">
                {isEdit ? "Save Changes" : "Add Category"}
              </PrimaryButton>
              <SecondaryButton type="button" fullWidth={false} onClick={onClose}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
