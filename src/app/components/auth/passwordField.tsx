// ============================================================================
// PasswordField — password input with show/hide toggle and optional
// strength indicator.
// ============================================================================

// Imports
import { useCallback, useState, type InputHTMLAttributes } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { ValidationMessage } from "./messages";
import { usePasswordStrength } from "../../hooks/usePasswordStrength";

// Interfaces
interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Current value, required to render the strength meter. */
  value: string;
  /** Show the strength indicator beneath the field. */
  showStrength?: boolean;
}

// Component
export function PasswordField({
  label,
  error,
  value,
  showStrength = false,
  id,
  className = "",
  ...rest
}: PasswordFieldProps) {
  // Local visibility state for the show/hide toggle.
  const [visible, setVisible] = useState(false);
  const strength = usePasswordStrength(value);
  const inputId = id ?? rest.name;

  const toggleVisible = useCallback(() => setVisible((v) => !v), []);

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block text-sm text-slate-300">
        {label}
      </label>

      <div className="relative">
        {/* Leading lock icon */}
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
          <Lock size={18} />
        </span>

        <input
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          {...rest}
          className={[
            "w-full rounded-xl border bg-slate-900/60 py-3 pl-11 pr-11 text-slate-100 placeholder:text-slate-500",
            "transition-colors focus:outline-none focus:ring-2",
            error
              ? "border-red-500/60 focus:ring-red-500/40"
              : "border-slate-700 focus:border-blue-500 focus:ring-blue-500/40",
            className,
          ].join(" ")}
        />

        {/* Show / hide toggle */}
        <button
          type="button"
          onClick={toggleVisible}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Strength meter */}
      {showStrength && value.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((bar) => (
              <span
                key={bar}
                className={[
                  "h-1.5 flex-1 rounded-full transition-colors",
                  bar <= strength.score ? strength.color : "bg-slate-700",
                ].join(" ")}
              />
            ))}
          </div>
          {strength.label && (
            <p className="mt-1 text-xs text-slate-400">
              Password strength:{" "}
              <span className="text-slate-200">{strength.label}</span>
            </p>
          )}
        </div>
      )}

      <ValidationMessage message={error} />
    </div>
  );
}
