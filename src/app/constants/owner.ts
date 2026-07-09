// ============================================================================
// owner.ts — types, routes, and navigation for the Property Owner Module.
// Simplified: no contractor references, no analytics, no complex data models.
// ============================================================================

// Imports
import {
  LayoutDashboard,
  Building2,
  Wrench,
  ReceiptText,
  BarChart2,
  User,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { RequestStatus, RequestPriority } from "./resident";

// ============================================================================
// Types
// ============================================================================

/** A resident assigned to a property. */
export interface Resident {
  id: string;
  name: string;
  unit: string;
  email: string;
  phone: string;
}

/** Aggregated stats for a single property. */
export interface PropertyStats {
  openRequests: number;
  completedRequests: number;
  criticalRequests: number;
}

/** A property owned by the current user. */
export interface Property {
  id: string;
  name: string;
  address: string;
  /** Total number of units the property has. Residents can't exceed this. */
  unitCount: number;
  residents: Resident[];
  stats: PropertyStats;
}

/** A maintenance request as seen by the owner (includes resident name). */
export interface OwnerRequest {
  id: string;
  title: string;
  description: string;
  propertyId: string;
  propertyName: string;
  residentName: string;
  category: string;
  priority: RequestPriority;
  status: RequestStatus;
  submittedAt: string;
  photos: string[];
  completionNotes?: string;
  timeline: Array<{
    label: string;
    date?: string;
    state: "done" | "current" | "upcoming";
  }>;
}

// ============================================================================
// Routes & Navigation
// ============================================================================

export const OWNER_ROUTES = {
  dashboard: "/owner/dashboard",
  properties: "/owner/properties",
  propertyDetails: "/owner/properties", // append /:id
  requests: "/owner/requests",
  requestManage: "/owner/requests", // append /:id
  claims: "/owner/claims",
  reports: "/owner/reports",
  profile: "/owner/profile",
  assistant: "/owner/assistant",
} as const;

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const OWNER_NAV: NavItem[] = [
  { label: "Dashboard",            to: OWNER_ROUTES.dashboard,  icon: LayoutDashboard },
  { label: "Properties",           to: OWNER_ROUTES.properties, icon: Building2 },
  { label: "Maintenance Requests", to: OWNER_ROUTES.requests,   icon: Wrench },
  { label: "Claim Requests",       to: OWNER_ROUTES.claims,     icon: ReceiptText },
  { label: "Reports",              to: OWNER_ROUTES.reports,    icon: BarChart2 },
  { label: "AI Assistant",         to: OWNER_ROUTES.assistant,  icon: Sparkles },
  { label: "Profile",              to: OWNER_ROUTES.profile,    icon: User },
];
