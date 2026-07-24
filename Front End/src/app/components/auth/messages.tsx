// ============================================================================
// ValidationMessage — tiny field-level error shown beneath inputs.
// Form-level errors/successes use toast notifications (sonner) instead.
// ============================================================================

// Imports
import { AlertCircle } from "lucide-react";

// Interfaces
interface ValidationMessageProps {
  message?: string;
}

// Component
export function ValidationMessage({ message }: ValidationMessageProps) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-700">
      <AlertCircle size={14} />
      {message}
    </p>
  );
}
