// ============================================================================
// Message components — ValidationMessage, ErrorMessage, SuccessMessage.
// Shared inline feedback elements used across all auth pages.
// ============================================================================

// Imports
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import type { ReactNode } from "react";

// ----------------------------------------------------------------------------
// ValidationMessage — tiny field-level error shown beneath inputs.
// ----------------------------------------------------------------------------
interface ValidationMessageProps {
  message?: string;
}

export function ValidationMessage({ message }: ValidationMessageProps) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-400">
      <AlertCircle size={14} />
      {message}
    </p>
  );
}

// ----------------------------------------------------------------------------
// ErrorMessage — banner for form-level / server errors.
// ----------------------------------------------------------------------------
interface BannerProps {
  children: ReactNode;
}

export function ErrorMessage({ children }: BannerProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      <XCircle size={18} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

// ----------------------------------------------------------------------------
// SuccessMessage — banner for confirmations.
// ----------------------------------------------------------------------------
export function SuccessMessage({ children }: BannerProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
      <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
