// ============================================================================
// AuthLayout — centered, responsive card wrapper for all auth pages.
// Desktop: centered card. Tablet: responsive width. Mobile: single column.
// ============================================================================

// Imports
import type { ReactNode } from "react";

// Interfaces
interface AuthLayoutProps {
  children: ReactNode;
  /** Wider card for multi-section forms (e.g. registration). */
  wide?: boolean;
}

// Component
export function AuthLayout({ children, wide = false }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div
          className={[
            "w-full",
            wide ? "max-w-2xl" : "max-w-md",
          ].join(" ")}
        >
          <div className="border border-border bg-card p-6 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
