// ============================================================================
// authService — mock authentication layer
// ----------------------------------------------------------------------------
// These functions simulate network requests. Replace the bodies with real API
// calls (e.g. Supabase / REST) when wiring up a backend. Each returns a Promise
// so the UI can show realistic loading states.
// ============================================================================

import type { UserRole } from "../constants/auth";

// ============================================================================
// Interfaces
// ============================================================================

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterPayload {
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  /** Role-specific extra fields (property names, profession, etc.). */
  extra?: Record<string, unknown>;
}

export interface AuthResult {
  success: boolean;
  message: string;
}

// ============================================================================
// Helpers
// ============================================================================

/** Simulate latency so loading spinners are visible during demos. */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// Service functions (mock implementations)
// ============================================================================

/** Attempt to sign a user in. Demo rule: any valid email + 6+ char password. */
export async function login(payload: LoginPayload): Promise<AuthResult> {
  await delay(1200);

  // Demo-only failure example to exercise error states.
  if (payload.password === "wrongpass") {
    return { success: false, message: "Invalid email or password." };
  }

  return { success: true, message: "Signed in successfully." };
}

/** Register a new account of the given role. */
export async function register(payload: RegisterPayload): Promise<AuthResult> {
  await delay(1400);
  return {
    success: true,
    message: `${payload.fullName}, your account has been created.`,
  };
}

/** Request a password reset email. */
export async function sendResetLink(email: string): Promise<AuthResult> {
  await delay(1200);
  return {
    success: true,
    message: `Password reset link sent to ${email}.`,
  };
}

/** Persist a brand new password from the reset flow. */
export async function resetPassword(_password: string): Promise<AuthResult> {
  await delay(1200);
  return { success: true, message: "Password successfully updated." };
}
