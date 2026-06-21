// ============================================================================
// InputField — labelled text input with optional leading icon + validation.
// ============================================================================

// Imports
import type { InputHTMLAttributes, ReactNode } from "react";
import { ValidationMessage } from "./messages";

// Interfaces
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Field-level validation error message. */
  error?: string;
  /** Optional leading icon (e.g. a lucide icon element). */
  icon?: ReactNode;
}

// Component
export function InputField({
  label,
  error,
  icon,
  id,
  className = "",
  ...rest
}: InputFieldProps) {
  const inputId = id ?? rest.name;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block text-sm text-slate-300">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          {...rest}
          className={[
            "w-full rounded-xl border bg-slate-900/60 py-3 text-slate-100 placeholder:text-slate-500",
            "transition-colors focus:outline-none focus:ring-2",
            icon ? "pl-11 pr-4" : "px-4",
            error
              ? "border-red-500/60 focus:ring-red-500/40"
              : "border-slate-700 focus:border-blue-500 focus:ring-blue-500/40",
            className,
          ].join(" ")}
        />
      </div>

      <ValidationMessage message={error} />
    </div>
  );
}
