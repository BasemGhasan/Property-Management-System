// ============================================================================
// filters.ts — shared filter/select option arrays used across all modules.
// Centralises the STATUS_OPTIONS, ROLE_OPTIONS, etc. that were duplicated
// inline inside multiple page components.
// ============================================================================

/** Status filter options used in request tables across all modules. */
export const REQUEST_STATUS_OPTIONS = [
  { value: "pending",     label: "Pending"     },
  { value: "in-progress", label: "In Progress" },
  { value: "completed",   label: "Completed"   },
  { value: "rejected",    label: "Rejected"    },
] as const;

/** Role filter options used in the admin User Management page. */
export const USER_ROLE_OPTIONS = [
  { value: "resident", label: "Resident"       },
  { value: "owner",    label: "Property Owner" },
] as const;
