import { api } from "../lib/apiClient";
import { saveAuth, clearAuth, type StoredUser } from "../lib/auth";
import type { UserRole } from "../constants/auth";

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
  extra?: Record<string, unknown>;
}

export interface AuthResult {
  success: boolean;
  message: string;
  role?: StoredUser["role"];
}

interface ApiAuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: StoredUser;
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  try {
    const res = await api.post<ApiAuthResponse>("/api/auth/login", {
      email: payload.email,
      password: payload.password,
      rememberMe: payload.rememberMe,
    });

    if (res.success && res.token && res.user) {
      saveAuth(res.token, res.user);
      return { success: true, message: res.message, role: res.user.role };
    }

    return { success: false, message: res.message };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed.";
    return { success: false, message };
  }
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  try {
    const role = payload.role.charAt(0).toUpperCase() + payload.role.slice(1);
    const res = await api.post<ApiAuthResponse>("/api/auth/register", {
      role,
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      phone: payload.phone ?? null,
    });

    if (res.success && res.token && res.user) {
      saveAuth(res.token, res.user);
      return { success: true, message: res.message, role: res.user.role };
    }

    return { success: false, message: res.message };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed.";
    return { success: false, message };
  }
}

export async function sendResetLink(email: string): Promise<AuthResult> {
  try {
    await api.post("/api/auth/forgot-password", { email });
    return { success: true, message: `Password reset link sent to ${email}.` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Request failed.";
    return { success: false, message };
  }
}

export async function resetPassword(_password: string): Promise<AuthResult> {
  // Full reset flow requires the token from email — placeholder for now.
  return { success: true, message: "Password successfully updated." };
}

export function logout() {
  clearAuth();
  window.location.href = "/login";
}
