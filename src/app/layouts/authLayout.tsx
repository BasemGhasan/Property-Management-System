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
    <div className="min-h-screen w-full bg-slate-900 text-slate-100">
      {/* Subtle radial glow backdrop */}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />

        <div
          className={[
            "relative w-full",
            wide ? "max-w-2xl" : "max-w-md",
          ].join(" ")}
        >
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
