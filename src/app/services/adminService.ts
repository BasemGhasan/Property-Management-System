import { api } from "../lib/apiClient";
import type { AdminUser, AdminProperty, IssueCategory, AdminActivity } from "../constants/admin";

// ── Backend shapes ───────────────────────────────────────────────────────────

interface ApiUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

interface ApiProperty {
  id: number;
  ownerId: number;
  ownerName: string;
  name: string;
  address: string;
  unitCount: number;
  isActive: boolean;
  createdAt: string;
  totalRequests: number;
  openRequests: number;
  description: string;
  units: {
    id: number;
    unitIdentifier: string;
    bedrooms: number;
    bathrooms: number;
    monthlyRent: number;
  }[];
  totalMonthlyRent: number;
  residents: { residentId: number; residentName: string }[];
}

interface ApiCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

// ── Mapping helpers ──────────────────────────────────────────────────────────

function toAdminUser(u: ApiUser): AdminUser {
  return {
    id: String(u.id),
    fullName: u.fullName,
    email: u.email,
    phone: u.phone ?? "",
    role: u.role.toLowerCase() as "resident" | "owner",
    active: u.isActive,
    joinedAt: u.createdAt.split("T")[0],
    propertyInfo: "",
  };
}

function toAdminProperty(p: ApiProperty): AdminProperty {
  if (p.units === undefined || p.totalMonthlyRent === undefined) {
    console.warn(
      `[adminService] Property ${p.id} response is missing unit/rent fields (units ${p.units === undefined ? "missing" : "present"}, totalMonthlyRent ${p.totalMonthlyRent === undefined ? "missing" : "present"}). ` +
      "The API likely doesn't have the unit-rent feature deployed — rent will show as $0. Check that the backend is running the latest build."
    );
  }
  return {
    id: String(p.id),
    name: p.name,
    address: p.address,
    ownerName: p.ownerName,
    ownerEmail: "",
    residentCount: p.residents?.length ?? 0,
    active: p.isActive,
    totalRequests: p.totalRequests,
    description: p.description ?? "",
    units: (p.units ?? []).map(u => ({
      id: String(u.id),
      unitIdentifier: u.unitIdentifier,
      bedrooms: u.bedrooms,
      bathrooms: u.bathrooms,
      monthlyRent: u.monthlyRent,
    })),
    totalMonthlyRent: p.totalMonthlyRent ?? 0,
  };
}

function toCategory(c: ApiCategory): IssueCategory {
  return {
    id: String(c.id),
    name: c.name,
    slug: c.name.toLowerCase().replace(/\s+/g, "-"),
    defaultPriority: "medium",
    active: c.isActive,
  };
}

// ── Service functions ────────────────────────────────────────────────────────

export async function getAdminUsers(): Promise<AdminUser[]> {
  const data = await api.get<ApiUser[]>("/api/users");
  return data.map(toAdminUser);
}

export async function getAdminUserById(id: string): Promise<AdminUser | undefined> {
  try {
    const data = await api.get<ApiUser>(`/api/users/${id}`);
    return toAdminUser(data);
  } catch {
    return undefined;
  }
}

export async function toggleUserStatus(id: string): Promise<boolean> {
  try {
    await api.put(`/api/users/${id}/toggle-active`, {});
    return true;
  } catch {
    return false;
  }
}

export async function getAdminProperties(): Promise<AdminProperty[]> {
  const data = await api.get<ApiProperty[]>("/api/properties");
  return data.map(toAdminProperty);
}

export async function getAdminPropertyById(id: string): Promise<AdminProperty | undefined> {
  try {
    const data = await api.get<ApiProperty>(`/api/properties/${id}`);
    return toAdminProperty(data);
  } catch {
    return undefined;
  }
}

export async function togglePropertyStatus(id: string): Promise<boolean> {
  try {
    await api.delete(`/api/properties/${id}`);
    return true;
  } catch {
    return false;
  }
}

export async function getCategories(): Promise<IssueCategory[]> {
  const data = await api.get<ApiCategory[]>("/api/categories");
  return data.map(toCategory);
}

export async function saveCategory(cat: Omit<IssueCategory, "id">): Promise<IssueCategory> {
  const data = await api.post<ApiCategory>("/api/categories", {
    name: cat.name,
    description: null,
  });
  return toCategory(data);
}

export async function updateCategory(id: string, patch: Partial<IssueCategory>): Promise<boolean> {
  try {
    await api.put(`/api/categories/${id}`, {
      name: patch.name ?? null,
      description: null,
      isActive: patch.active ?? null,
    });
    return true;
  } catch {
    return false;
  }
}

export async function getAdminActivity(): Promise<AdminActivity[]> {
  // Will be driven by CloudWatch/SNS events in Task #2 — return empty for now.
  return [];
}

export async function getSystemStats() {
  const [users, properties] = await Promise.all([
    api.get<ApiUser[]>("/api/users"),
    api.get<ApiProperty[]>("/api/properties"),
  ]);

  const residents = users.filter((u) => u.role === "Resident");
  const owners    = users.filter((u) => u.role === "Owner");

  return {
    totalUsers:      users.length,
    totalResidents:  residents.length,
    totalOwners:     owners.length,
    totalProperties: properties.length,
    totalRequests:   properties.reduce((s, p) => s + p.totalRequests, 0),
    openRequests:    properties.reduce((s, p) => s + p.openRequests, 0),
  };
}
