// ============================================================================
// PageHeader — logo + title + subtitle block shown atop each auth page.
// ============================================================================

// Imports
import { Building2 } from "lucide-react";

// Interfaces
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Whether to render the brand logo above the title. */
  showLogo?: boolean;
}

// Component
export function PageHeader({ title, subtitle, showLogo = true }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      {showLogo && (
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Building2 size={22} />
          </span>
          <span className="text-slate-100">PropCare</span>
        </div>
      )}

      <h1 className="text-slate-50">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
    </div>
  );
}
