// ============================================================================
// CheckboxField — styled checkbox + label (Remember Me, Terms, etc.).
// ============================================================================

// Imports
import { Check } from "lucide-react";
import type { ReactNode } from "react";

// Interfaces
interface CheckboxFieldProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}

// Component
export function CheckboxField({ id, checked, onChange, children }: CheckboxFieldProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-300">
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-600 bg-slate-900/60 transition-colors checked:border-blue-600 checked:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        <Check
          size={13}
          className="pointer-events-none relative hidden text-white peer-checked:block"
        />
      </span>
      <span className="select-none">{children}</span>
    </label>
  );
}
