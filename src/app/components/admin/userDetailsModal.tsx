// ============================================================================
// UserDetailsModal — Radix Dialog showing full user info with
// activate/deactivate action. Reuses existing PrimaryButton & SecondaryButton.
// ============================================================================

// Imports
import * as Dialog from "@radix-ui/react-dialog";
import { X, Mail, Phone, Calendar, Home, UserCheck, UserX } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../auth/buttons";
import type { AdminUser } from "../../constants/admin";

// Interfaces
interface UserDetailsModalProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onToggleStatus: (id: string) => void;
}

// Small labelled row used inside the modal
function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-slate-500" />
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm text-slate-200">{value}</p>
      </div>
    </div>
  );
}

// Component
export function UserDetailsModal({ user, open, onClose, onToggleStatus }: UserDetailsModalProps) {
  if (!user) return null;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/60 focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <div>
              <Dialog.Title className="text-slate-100">{user.fullName}</Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-slate-500">
                {user.id} · {user.role === "resident" ? "Resident" : "Property Owner"}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-5 px-6 py-5">
            {/* Status badge */}
            <span className={`self-start rounded-full border px-3 py-1 text-xs ${
              user.active
                ? "border-green-500/30 bg-green-500/10 text-green-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}>
              {user.active ? "Active" : "Deactivated"}
            </span>

            {/* Info rows */}
            <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
              <InfoRow icon={Mail}     label="Email"         value={user.email} />
              <InfoRow icon={Phone}    label="Phone"         value={user.phone} />
              <InfoRow icon={Home}     label="Property Info" value={user.propertyInfo} />
              <InfoRow icon={Calendar} label="Joined"        value={user.joinedAt} />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <PrimaryButton
                type="button"
                fullWidth={false}
                className="flex-1"
                onClick={() => { onToggleStatus(user.id); onClose(); }}
              >
                {user.active ? <UserX size={16} /> : <UserCheck size={16} />}
                {user.active ? "Deactivate" : "Activate"}
              </PrimaryButton>
              <SecondaryButton type="button" fullWidth={false} onClick={onClose}>
                Close
              </SecondaryButton>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
