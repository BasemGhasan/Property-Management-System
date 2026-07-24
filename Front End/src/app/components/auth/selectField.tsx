// ============================================================================
// SelectField — labelled native select styled to match InputField.
// ============================================================================

// Imports
import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import { ValidationMessage } from "./messages";

// Interfaces
interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  placeholder?: string;
  error?: string;
}

// Component
export function SelectField({
  label,
  options,
  placeholder = "Select an option",
  error,
  id,
  className = "",
  ...rest
}: SelectFieldProps) {
  const selectId = id ?? rest.name;

  return (
    <div className="w-full">
      <label htmlFor={selectId} className="mb-1.5 block text-sm text-secondary-foreground">
        {label}
      </label>

      <div className="relative">
        <select
          id={selectId}
          {...rest}
          className={[
            "w-full appearance-none rounded-xl border bg-background/60 px-4 py-3 text-foreground",
            "transition-colors focus:outline-none focus:ring-2",
            error
              ? "border-red-500/60 focus:ring-red-500/40"
              : "border-border focus:border-primary focus:ring-primary/40",
            className,
          ].join(" ")}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-card">
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
      </div>

      <ValidationMessage message={error} />
    </div>
  );
}
