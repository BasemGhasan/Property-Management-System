// ============================================================================
// adminService — mock data and CRUD functions for the Admin Module.
// Follows the same async/delay pattern as ownerService and requestService.
// ============================================================================

// Imports
import type { AdminUser, AdminProperty, IssueCategory, AdminActivity } from "../constants/admin";

// Helper
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ============================================================================
// Mock data
// ============================================================================

const MOCK_USERS: AdminUser[] = [
  { id: "USR-001", fullName: "Jane Doe",     email: "jane@example.com",    phone: "+1 555 014 2233", role: "resident", active: true,  joinedAt: "2026-01-10", propertyInfo: "Maple Court — Unit 12B" },
  { id: "USR-002", fullName: "Tom Baker",    email: "tom@example.com",     phone: "+1 555 099 3344", role: "resident", active: true,  joinedAt: "2026-01-15", propertyInfo: "Maple Court — Unit 9A" },
  { id: "USR-003", fullName: "Sarah Lin",    email: "sarah@example.com",   phone: "+1 555 077 5566", role: "resident", active: true,  joinedAt: "2026-02-03", propertyInfo: "Maple Court — Unit 3C" },
  { id: "USR-004", fullName: "Marcus Webb",  email: "marcus@example.com",  phone: "+1 555 021 8899", role: "resident", active: true,  joinedAt: "2026-02-20", propertyInfo: "Riverside Apts — Unit 7A" },
  { id: "USR-005", fullName: "Priya Patel",  email: "priya@example.com",   phone: "+1 555 033 4455", role: "resident", active: false, joinedAt: "2026-03-05", propertyInfo: "Riverside Apts — Unit 2B" },
  { id: "USR-006", fullName: "Diana Kim",    email: "diana@example.com",   phone: "+1 555 040 1122", role: "resident", active: true,  joinedAt: "2026-03-18", propertyInfo: "Oak Tower — Unit 14D" },
  { id: "USR-007", fullName: "Michael Chen", email: "michael@example.com", phone: "+1 555 300 4422", role: "owner",    active: true,  joinedAt: "2025-12-01", propertyInfo: "3 properties" },
];

const MOCK_PROPERTIES: AdminProperty[] = [
  { id: "PROP-001", name: "Maple Court Residences", address: "12 Maple Street, Springfield, IL 62701", ownerName: "Michael Chen", ownerEmail: "michael@example.com", residentCount: 3, active: true,  totalRequests: 15 },
  { id: "PROP-002", name: "Riverside Apartments",   address: "88 River Road, Springfield, IL 62702",   ownerName: "Michael Chen", ownerEmail: "michael@example.com", residentCount: 2, active: true,  totalRequests: 8  },
  { id: "PROP-003", name: "Oak Tower Condos",        address: "300 Oak Ave, Springfield, IL 62703",     ownerName: "Michael Chen", ownerEmail: "michael@example.com", residentCount: 1, active: false, totalRequests: 4  },
];

const MOCK_CATEGORIES: IssueCategory[] = [
  { id: "CAT-001", name: "Water Leakage",      slug: "water-leakage",    defaultPriority: "high",     active: true  },
  { id: "CAT-002", name: "Electrical Issue",   slug: "electrical",       defaultPriority: "critical", active: true  },
  { id: "CAT-003", name: "Air Conditioner",    slug: "air-conditioner",  defaultPriority: "medium",   active: true  },
  { id: "CAT-004", name: "Pest Control",       slug: "pest-control",     defaultPriority: "low",      active: true  },
  { id: "CAT-005", name: "Internet Issue",     slug: "internet",         defaultPriority: "low",      active: true  },
  { id: "CAT-006", name: "Security Issue",     slug: "security",         defaultPriority: "critical", active: true  },
  { id: "CAT-007", name: "Other",              slug: "other",            defaultPriority: "medium",   active: true  },
];

const MOCK_ACTIVITY: AdminActivity[] = [
  { id: "ACT-1", type: "request_submitted",  message: "New request REQ-1055 submitted by Diana Kim.",        time: "30 min ago" },
  { id: "ACT-2", type: "user_registered",    message: "New resident Diana Kim registered.",                   time: "2h ago" },
  { id: "ACT-3", type: "request_completed",  message: "Request REQ-1025 (Outlet sparking) marked completed.", time: "Yesterday" },
  { id: "ACT-4", type: "property_added",     message: "Property \"Oak Tower Condos\" added to the system.",  time: "2 days ago" },
  { id: "ACT-5", type: "user_registered",    message: "New property owner Michael Chen registered.",          time: "3 days ago" },
];

// ============================================================================
// Service functions
// ============================================================================

export async function getAdminUsers(): Promise<AdminUser[]> {
  await delay(400);
  return [...MOCK_USERS];
}

export async function getAdminUserById(id: string): Promise<AdminUser | undefined> {
  await delay(250);
  return MOCK_USERS.find((u) => u.id === id);
}

export async function toggleUserStatus(id: string): Promise<boolean> {
  await delay(500);
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) return false;
  user.active = !user.active;
  return true;
}

export async function getAdminProperties(): Promise<AdminProperty[]> {
  await delay(400);
  return [...MOCK_PROPERTIES];
}

export async function getAdminPropertyById(id: string): Promise<AdminProperty | undefined> {
  await delay(250);
  return MOCK_PROPERTIES.find((p) => p.id === id);
}

export async function togglePropertyStatus(id: string): Promise<boolean> {
  await delay(500);
  const prop = MOCK_PROPERTIES.find((p) => p.id === id);
  if (!prop) return false;
  prop.active = !prop.active;
  return true;
}

export async function getCategories(): Promise<IssueCategory[]> {
  await delay(350);
  return [...MOCK_CATEGORIES];
}

export async function saveCategory(cat: Omit<IssueCategory, "id">): Promise<IssueCategory> {
  await delay(600);
  const newCat: IssueCategory = { ...cat, id: `CAT-${String(MOCK_CATEGORIES.length + 1).padStart(3, "0")}` };
  MOCK_CATEGORIES.push(newCat);
  return newCat;
}

export async function updateCategory(id: string, patch: Partial<IssueCategory>): Promise<boolean> {
  await delay(500);
  const cat = MOCK_CATEGORIES.find((c) => c.id === id);
  if (!cat) return false;
  Object.assign(cat, patch);
  return true;
}

export async function getAdminActivity(): Promise<AdminActivity[]> {
  await delay(300);
  return MOCK_ACTIVITY;
}

/** Aggregated system counts derived from mock data (no analytics, just totals). */
export async function getSystemStats() {
  await delay(350);
  return {
    totalUsers:       MOCK_USERS.length,
    totalResidents:   MOCK_USERS.filter((u) => u.role === "resident").length,
    totalOwners:      MOCK_USERS.filter((u) => u.role === "owner").length,
    totalProperties:  MOCK_PROPERTIES.length,
    totalRequests:    6, // matches MOCK_OWNER_REQUESTS count
    openRequests:     3, // pending + in-progress from mock data
  };
}
