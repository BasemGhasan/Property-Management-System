// ============================================================================
// FormSection — reusable card wrapper used on all profile and form pages.
// Replaces the three locally-defined Section components in the profile pages.
// ============================================================================

// Imports
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

// Interfaces
interface FormSectionProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  /** Tailwind text+bg class for the icon accent. Defaults to blue. */
  accentColor?: string;
}

// Component
export function FormSection({
  title,
  icon: Icon,
  children,
  accentColor = "text-primary",
}: FormSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5 sm:p-6">
      <h3 className="mb-5 flex items-center gap-2 text-foreground">
        <Icon size={18} className={accentColor} />
        {title}
      </h3>
      {children}
    </div>
  );
}
