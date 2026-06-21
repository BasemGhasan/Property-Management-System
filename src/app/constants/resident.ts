// ============================================================================
// resident.ts — shared constants, types and mock data for the Resident Module.
// Extends the Batch 1 conventions (typed constants, camelCase, comments).
// ============================================================================

// Imports
import {
  LayoutDashboard,
  PlusCircle,
  History,
  User,
  Droplets,
  Zap,
  Wind,
  Bug,
  Wifi,
  Shield,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

/** Lifecycle status of a maintenance request. */
export type RequestStatus = "pending" | "in-progress" | "completed" | "rejected";

/** Severity of a reported issue. */
export type RequestPriority = "low" | "medium" | "high" | "critical";

/** A single step in a request's progress timeline. */
export interface TimelineStep {
  label: string;
  date?: string;
  /** done = past, current = active step, upcoming = not reached yet. */
  state: "done" | "current" | "upcoming";
}

/** Completion details, only present on completed requests. */
export interface CompletionInfo {
  notes: string;
  date: string;
  photos: string[];
}

/** A maintenance request record. */
export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  property: string;
  category: string;
  priority: RequestPriority;
  status: RequestStatus;
  submittedAt: string;
  photos: string[];
  timeline: TimelineStep[];
  completion?: CompletionInfo;
}

/** A dashboard notification item. */
export interface ResidentNotification {
  id: string;
  /** "reviewed" = owner reviewed the request, "status" = status changed, "completed" = resolved */
  type: "reviewed" | "status" | "completed";
  message: string;
  time: string;
}

// ============================================================================
// Navigation
// ============================================================================

/** Resident dashboard routes. */
export const RESIDENT_ROUTES = {
  dashboard: "/resident/dashboard",
  submit: "/resident/submit",
  history: "/resident/history",
  details: "/resident/request", // append `/:id`
  profile: "/resident/profile",
} as const;

/** Sidebar navigation items for the resident shell. */
export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const RESIDENT_NAV: NavItem[] = [
  { label: "Dashboard", to: RESIDENT_ROUTES.dashboard, icon: LayoutDashboard },
  { label: "Submit Request", to: RESIDENT_ROUTES.submit, icon: PlusCircle },
  { label: "Request History", to: RESIDENT_ROUTES.history, icon: History },
  { label: "Profile", to: RESIDENT_ROUTES.profile, icon: User },
];

// ============================================================================
// Form options
// ============================================================================

/** Issue categories with matching icons. */
export const ISSUE_CATEGORIES: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "water-leakage", label: "Water Leakage", icon: Droplets },
  { value: "electrical", label: "Electrical Issue", icon: Zap },
  { value: "air-conditioner", label: "Air Conditioner", icon: Wind },
  { value: "pest-control", label: "Pest Control", icon: Bug },
  { value: "internet", label: "Internet Issue", icon: Wifi },
  { value: "security", label: "Security Issue", icon: Shield },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

/** Priority select options. */
export const PRIORITY_OPTIONS: { value: RequestPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

/** Properties the demo resident has access to. */
export const RESIDENT_PROPERTIES: { value: string; label: string }[] = [
  { value: "maple-court-12b", label: "Maple Court Residences — Unit 12B" },
  { value: "riverside-7a", label: "Riverside Apartments — Unit 7A" },
];

// ============================================================================
// Badge color maps (Tailwind classes) — single source of truth.
// ============================================================================

export const STATUS_STYLES: Record<
  RequestStatus,
  { label: string; classes: string; dot: string }
> = {
  pending: {
    label: "Pending",
    classes: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    dot: "bg-orange-400",
  },
  "in-progress": {
    label: "In Progress",
    classes: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    dot: "bg-blue-400",
  },
  completed: {
    label: "Completed",
    classes: "bg-green-500/15 text-green-300 border-green-500/30",
    dot: "bg-green-400",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-red-500/15 text-red-300 border-red-500/30",
    dot: "bg-red-400",
  },
};

export const PRIORITY_STYLES: Record<
  RequestPriority,
  { label: string; classes: string; dot: string }
> = {
  low: {
    label: "Low",
    classes: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    dot: "bg-slate-400",
  },
  medium: {
    label: "Medium",
    classes: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    dot: "bg-blue-400",
  },
  high: {
    label: "High",
    classes: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    dot: "bg-orange-400",
  },
  critical: {
    label: "Critical",
    classes: "bg-red-500/15 text-red-300 border-red-500/30",
    dot: "bg-red-400",
  },
};

/** Helper to find a category label from its value. */
export const categoryLabel = (value: string): string =>
  ISSUE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
