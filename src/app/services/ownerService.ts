// ============================================================================
// ownerService — mock data and service functions for the Owner Module.
// Simplified: no contractor data, no analytics helpers, no complex queries.
// Follows the same async/delay pattern as authService and requestService.
// ============================================================================

// Imports
import type { Property, OwnerRequest } from "../constants/owner";

// Helpers
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ============================================================================
// Mock data
// ============================================================================

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "maple-court",
    name: "Maple Court Residences",
    address: "12 Maple Street, Springfield, IL 62701",
    residents: [
      { id: "r1", name: "Jane Doe", unit: "12B", email: "jane@example.com", phone: "+1 555 014 2233" },
      { id: "r2", name: "Tom Baker", unit: "9A", email: "tom@example.com", phone: "+1 555 099 3344" },
      { id: "r3", name: "Sarah Lin", unit: "3C", email: "sarah@example.com", phone: "+1 555 077 5566" },
    ],
    stats: { openRequests: 4, completedRequests: 11, criticalRequests: 1 },
  },
  {
    id: "riverside-apts",
    name: "Riverside Apartments",
    address: "88 River Road, Springfield, IL 62702",
    residents: [
      { id: "r4", name: "Marcus Webb", unit: "7A", email: "marcus@example.com", phone: "+1 555 021 8899" },
      { id: "r5", name: "Priya Patel", unit: "2B", email: "priya@example.com", phone: "+1 555 033 4455" },
    ],
    stats: { openRequests: 2, completedRequests: 6, criticalRequests: 0 },
  },
  {
    id: "oak-tower",
    name: "Oak Tower Condos",
    address: "300 Oak Ave, Springfield, IL 62703",
    residents: [
      { id: "r6", name: "Diana Kim", unit: "14D", email: "diana@example.com", phone: "+1 555 040 1122" },
    ],
    stats: { openRequests: 1, completedRequests: 3, criticalRequests: 0 },
  },
];

export const MOCK_OWNER_REQUESTS: OwnerRequest[] = [
  {
    id: "REQ-1042",
    title: "Kitchen sink leaking under cabinet",
    description: "Water is pooling inside the cabinet beneath the kitchen sink. It seems to drip from the pipe joint and has started to damage the wood.",
    propertyId: "maple-court",
    propertyName: "Maple Court Residences",
    residentName: "Jane Doe",
    category: "water-leakage",
    priority: "high",
    status: "in-progress",
    submittedAt: "2026-06-15",
    photos: ["https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80"],
    timeline: [
      { label: "Request Submitted", date: "Jun 15, 2026", state: "done" },
      { label: "Owner Reviewed", date: "Jun 16, 2026", state: "done" },
      { label: "Work In Progress", date: "Jun 17, 2026", state: "current" },
      { label: "Completed", state: "upcoming" },
    ],
  },
  {
    id: "REQ-1038",
    title: "AC not cooling in living room",
    description: "The air conditioner runs but only blows warm air. Temperature does not drop even after an hour.",
    propertyId: "maple-court",
    propertyName: "Maple Court Residences",
    residentName: "Tom Baker",
    category: "air-conditioner",
    priority: "medium",
    status: "pending",
    submittedAt: "2026-06-14",
    photos: [],
    timeline: [
      { label: "Request Submitted", date: "Jun 14, 2026", state: "current" },
      { label: "Owner Reviewed", state: "upcoming" },
      { label: "Work In Progress", state: "upcoming" },
      { label: "Completed", state: "upcoming" },
    ],
  },
  {
    id: "REQ-1025",
    title: "Bedroom power outlet sparking",
    description: "One of the wall outlets in the main bedroom produced a spark when plugging in a charger.",
    propertyId: "maple-court",
    propertyName: "Maple Court Residences",
    residentName: "Sarah Lin",
    category: "electrical",
    priority: "critical",
    status: "completed",
    submittedAt: "2026-06-02",
    photos: ["https://images.unsplash.com/photo-1558389186-438424b00a6b?w=800&q=80"],
    completionNotes: "Replaced the faulty outlet and inspected surrounding wiring. Circuit tested and confirmed safe.",
    timeline: [
      { label: "Request Submitted", date: "Jun 02, 2026", state: "done" },
      { label: "Owner Reviewed", date: "Jun 02, 2026", state: "done" },
      { label: "Work In Progress", date: "Jun 03, 2026", state: "done" },
      { label: "Completed", date: "Jun 05, 2026", state: "done" },
    ],
  },
  {
    id: "REQ-1019",
    title: "Ants in the kitchen pantry",
    description: "Small ants appearing around the pantry shelves daily.",
    propertyId: "riverside-apts",
    propertyName: "Riverside Apartments",
    residentName: "Marcus Webb",
    category: "pest-control",
    priority: "low",
    status: "completed",
    submittedAt: "2026-05-28",
    photos: [],
    completionNotes: "Applied pet-safe treatment to pantry and sealed entry gaps.",
    timeline: [
      { label: "Request Submitted", date: "May 28, 2026", state: "done" },
      { label: "Owner Reviewed", date: "May 28, 2026", state: "done" },
      { label: "Work In Progress", date: "May 29, 2026", state: "done" },
      { label: "Completed", date: "May 30, 2026", state: "done" },
    ],
  },
  {
    id: "REQ-1007",
    title: "Slow internet in home office",
    description: "Connection drops several times a day, mostly afternoons.",
    propertyId: "riverside-apts",
    propertyName: "Riverside Apartments",
    residentName: "Priya Patel",
    category: "internet",
    priority: "medium",
    status: "rejected",
    submittedAt: "2026-05-20",
    photos: [],
    timeline: [
      { label: "Request Submitted", date: "May 20, 2026", state: "done" },
      { label: "Owner Reviewed", date: "May 21, 2026", state: "done" },
      { label: "Rejected", date: "May 21, 2026", state: "done" },
    ],
  },
  {
    id: "REQ-1055",
    title: "Water stain on ceiling — Unit 14D",
    description: "Brown water stain spreading on living room ceiling, possibly a leak from the unit above.",
    propertyId: "oak-tower",
    propertyName: "Oak Tower Condos",
    residentName: "Diana Kim",
    category: "water-leakage",
    priority: "high",
    status: "pending",
    submittedAt: "2026-06-19",
    photos: [],
    timeline: [
      { label: "Request Submitted", date: "Jun 19, 2026", state: "current" },
      { label: "Owner Reviewed", state: "upcoming" },
      { label: "Work In Progress", state: "upcoming" },
      { label: "Completed", state: "upcoming" },
    ],
  },
];

// ============================================================================
// Service functions
// ============================================================================

export async function getProperties(): Promise<Property[]> {
  await delay(400);
  return MOCK_PROPERTIES;
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  await delay(300);
  return MOCK_PROPERTIES.find((p) => p.id === id);
}

export async function getOwnerRequests(): Promise<OwnerRequest[]> {
  await delay(450);
  return MOCK_OWNER_REQUESTS;
}

export async function getOwnerRequestById(id: string): Promise<OwnerRequest | undefined> {
  await delay(300);
  return MOCK_OWNER_REQUESTS.find((r) => r.id === id);
}

/** Update status/priority/notes on a request (mutates in-memory array). */
export async function updateOwnerRequest(
  id: string,
  patch: Partial<Pick<OwnerRequest, "status" | "priority" | "completionNotes">>
): Promise<boolean> {
  await delay(600);
  const req = MOCK_OWNER_REQUESTS.find((r) => r.id === id);
  if (!req) return false;
  Object.assign(req, patch);
  return true;
}
