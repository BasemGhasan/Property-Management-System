export interface StoredUser {
  id: number;
  fullName: string;
  email: string;
  role: "Admin" | "Owner" | "Resident";
  phone?: string;
}

export function saveAuth(token: string, user: StoredUser) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

/** Map backend role to the frontend dashboard route. */
export function dashboardRouteForRole(role: StoredUser["role"]): string {
  switch (role) {
    case "Admin":    return "/admin/dashboard";
    case "Owner":    return "/owner/dashboard";
    case "Resident": return "/resident/dashboard";
  }
}
