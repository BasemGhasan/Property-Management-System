// ============================================================================
// admin.ts — types, routes, navigation, and shared constants for the Admin
// Module (Batch 4). Follows the same conventions as owner.ts / resident.ts.
// ============================================================================

// Imports
import {
  LayoutDashboard,
  Users,
  Building2,
  Tag,
  Wrench,
  User,
  type LucideIcon,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

/** A platform user as seen by the admin. */
export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  /** "resident" | "owner" */
  role: "resident" | "owner";
  /** Whether the account is active. */
  active: boolean;
  joinedAt: string;
  /** For residents: which property. For owners: how many properties. */
  propertyInfo: string;
}

/** A property record as seen by the admin. */
export interface AdminProperty {
  id: string;
  name: string;
  address: string;
  ownerName: string;
  ownerEmail: string;
  residentCount: number;
  active: boolean;
  totalRequests: number;
}

/** An issue category managed by the admin. */
export interface IssueCategory {
  id: string;
  name: string;
  defaultPriority: "low" | "medium" | "high" | "critical";
  active: boolean;
  /** Slug used in request records (e.g. "water-leakage"). */
  slug: string;
}

/** A recent activity entry on the admin dashboard. */
export interface AdminActivity {
  id: string;
  type: "user_registered" | "property_added" | "request_submitted" | "request_completed";
  message: string;
  time: string;
}

// ============================================================================
// Routes
// ============================================================================

export const ADMIN_ROUTES = {
  dashboard: "/admin/dashboard",
  users: "/admin/users",
  properties: "/admin/properties",
  categories: "/admin/categories",
  requests: "/admin/requests",
  profile: "/admin/profile",
} as const;

// ============================================================================
// Navigation
// ============================================================================

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard",             to: ADMIN_ROUTES.dashboard,   icon: LayoutDashboard },
  { label: "Users",                 to: ADMIN_ROUTES.users,        icon: Users },
  { label: "Properties",            to: ADMIN_ROUTES.properties,   icon: Building2 },
  { label: "Issue Categories",      to: ADMIN_ROUTES.categories,   icon: Tag },
  { label: "Maintenance Requests",  to: ADMIN_ROUTES.requests,     icon: Wrench },
  { label: "Profile",               to: ADMIN_ROUTES.profile,      icon: User },
];
