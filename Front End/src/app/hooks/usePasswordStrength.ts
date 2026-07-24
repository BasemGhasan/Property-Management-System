// ============================================================================
// usePasswordStrength — derives a strength score + label from a password.
// ============================================================================

// Imports
import { useMemo } from "react";

// Interfaces
export interface PasswordStrength {
  /** Score from 0 (empty) to 4 (very strong). */
  score: number;
  /** Human readable label for the current score. */
  label: string;
  /** Tailwind color class used for the strength meter fill. */
  color: string;
}

// Hook definition
/**
 * Evaluate password strength based on length and character variety.
 * Memoised so it only recomputes when the password changes.
 */
export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => {
    if (!password) {
      return { score: 0, label: "", color: "bg-slate-700" };
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Map the raw score to a friendly label + accent color.
    switch (score) {
      case 0:
      case 1:
        return { score: 1, label: "Weak", color: "bg-red-500" };
      case 2:
        return { score: 2, label: "Fair", color: "bg-orange-500" };
      case 3:
        return { score: 3, label: "Good", color: "bg-blue-500" };
      default:
        return { score: 4, label: "Strong", color: "bg-green-500" };
    }
  }, [password]);
}
