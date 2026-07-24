// ============================================================================
// TextAreaField — multi-line input styled to match InputField (Batch 1).
// Lives alongside the other form fields so it's reusable everywhere.
// ============================================================================

// Imports
import type { TextareaHTMLAttributes } from "react";
import { ValidationMessage } from "./messages";

// Interfaces
interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

// Component
export function TextAreaField({
  label,
  error,
  id,
  className = "",
  rows = 4,
  ...rest
}: TextAreaFieldProps) {
  const fieldId = id ?? rest.name;

  return (
    <div className="w-full">
      <label htmlFor={fieldId} className="mb-1.5 block text-sm text-secondary-foreground">
        {label}
      </label>

      <textarea
        id={fieldId}
        rows={rows}
        {...rest}
        className={[
          "w-full resize-y rounded-xl border bg-background/60 px-4 py-3 text-foreground placeholder:text-muted-foreground",
          "transition-colors focus:outline-none focus:ring-2",
          error
            ? "border-red-500/60 focus:ring-red-500/40"
            : "border-border focus:border-primary focus:ring-primary/40",
          className,
        ].join(" ")}
      />

      <ValidationMessage message={error} />
    </div>
  );
}
