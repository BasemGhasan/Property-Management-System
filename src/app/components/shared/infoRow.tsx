// ============================================================================
// InfoRow — labelled key/value row used in detail pages and modals.
// Replaces duplicate inline definitions in requestDetails, requestManagement,
// adminPropertyDetails, and the admin user modal.
// ============================================================================

// Imports
import type { ReactNode } from "react";

// Interfaces
interface InfoRowProps {
  label: string;
  children: ReactNode;
}

// Component
export function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm text-slate-200">{children}</span>
    </div>
  );
}
