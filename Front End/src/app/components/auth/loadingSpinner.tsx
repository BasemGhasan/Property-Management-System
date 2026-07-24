// ============================================================================
// LoadingSpinner — small inline spinner used inside buttons and pages.
// ============================================================================

// Imports
import { Loader2 } from "lucide-react";

// Interfaces
interface LoadingSpinnerProps {
  /** Pixel size of the spinner icon. */
  size?: number;
  className?: string;
}

// Component
export function LoadingSpinner({ size = 18, className = "" }: LoadingSpinnerProps) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />;
}
