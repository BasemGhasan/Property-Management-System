// ============================================================================
// EmptyState — consistent empty/no-results placeholder used in tables
// and lists throughout all three modules.
// ============================================================================

// Imports
import { SearchX } from "lucide-react";

// Interfaces
interface EmptyStateProps {
  message?: string;
}

// Component
export function EmptyState({ message = "No results found." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <SearchX size={32} className="opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
