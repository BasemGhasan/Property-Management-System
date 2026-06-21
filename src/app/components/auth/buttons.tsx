// ============================================================================
// Buttons — PrimaryButton & SecondaryButton.
// Consistent button styles shared across the auth module.
// ============================================================================

// Imports
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoadingSpinner } from "./loadingSpinner";

// Interfaces
interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Shows a spinner and disables the button while true. */
  loading?: boolean;
  fullWidth?: boolean;
}

// ----------------------------------------------------------------------------
// PrimaryButton — solid blue call-to-action.
// ----------------------------------------------------------------------------
export function PrimaryButton({
  children,
  loading = false,
  fullWidth = true,
  disabled,
  className = "",
  ...rest
}: BaseButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white",
        "transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
}

// ----------------------------------------------------------------------------
// SecondaryButton — outlined / subtle alternative action.
// ----------------------------------------------------------------------------
export function SecondaryButton({
  children,
  loading = false,
  fullWidth = true,
  disabled,
  className = "",
  ...rest
}: BaseButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-5 py-3 text-slate-200",
        "transition-colors hover:bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-slate-500/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
}
