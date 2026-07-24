// ============================================================================
// auth.ts — roles, route paths, and shared constants for Auth & Onboarding.
// Contractor role has been removed; the platform supports Resident, Property
// Owner, and Admin only.
// ============================================================================

// Imports
import { Home, Building2, type LucideIcon } from "lucide-react";

// ============================================================================
// Interfaces & Types
// ============================================================================

/** Supported account types on the platform. */
export type UserRole = "resident" | "owner";

/** Definition used to render the role selection cards. */
export interface RoleDefinition {
  id: UserRole;
  title: string;
  description: string;
  icon: LucideIcon;
}

// ============================================================================
// Constants
// ============================================================================

/** Selectable account types shown on the Role Selection page. */
export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: "resident",
    title: "Resident",
    description: "Submit maintenance requests and track issues in real time.",
    icon: Home,
  },
  {
    id: "owner",
    title: "Property Owner",
    description: "Manage properties, residents, and maintenance requests.",
    icon: Building2,
  },
];

/** Centralised route paths shared across the auth module. */
export const ROUTES = {
  login: "/login",
  roleSelection: "/register",
  registerResident: "/register/resident",
  registerOwner: "/register/owner",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
} as const;
