// ============================================================================
// LoadingState — centered spinner used as the loading placeholder on every
// page. Replaces the repeated inline loading div pattern.
// ============================================================================

// Imports
import { LoadingSpinner } from "../auth/loadingSpinner";

// Component
export function LoadingState() {
  return (
    <div className="flex justify-center py-24 text-slate-500">
      <LoadingSpinner size={28} />
    </div>
  );
}
