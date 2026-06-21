// ============================================================================
// requestService — mock data layer for maintenance requests.
// Mirrors the Batch 1 authService pattern: async functions + simulated latency.
// Replace with real API calls when a backend is wired up.
// ============================================================================

// Imports
import type {
  MaintenanceRequest,
  ResidentNotification,
} from "../constants/resident";

// ============================================================================
// Helpers
// ============================================================================

/** Simulate network latency so loading states are visible. */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ============================================================================
// Mock data
// ============================================================================

const MOCK_REQUESTS: MaintenanceRequest[] = [
  {
    id: "REQ-1042",
    title: "Kitchen sink leaking under cabinet",
    description:
      "Water is pooling inside the cabinet beneath the kitchen sink. It seems to drip from the pipe joint and has started to damage the wood.",
    property: "Maple Court Residences — Unit 12B",
    category: "water-leakage",
    priority: "high",
    status: "in-progress",
    submittedAt: "2026-06-15",
    photos: [
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80",
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    ],
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
    description:
      "The air conditioner runs but only blows warm air. Temperature does not drop even after an hour.",
    property: "Maple Court Residences — Unit 12B",
    category: "air-conditioner",
    priority: "medium",
    status: "pending",
    submittedAt: "2026-06-14",
    photos: [
      "https://images.unsplash.com/photo-1631545806609-c2b999c5b1f0?w=800&q=80",
    ],
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
    description:
      "One of the wall outlets in the main bedroom produced a spark when plugging in a charger. Not using it for safety.",
    property: "Maple Court Residences — Unit 12B",
    category: "electrical",
    priority: "critical",
    status: "completed",
    submittedAt: "2026-06-02",
    photos: [
      "https://images.unsplash.com/photo-1558389186-438424b00a6b?w=800&q=80",
    ],
    timeline: [
      { label: "Request Submitted", date: "Jun 02, 2026", state: "done" },
      { label: "Owner Reviewed", date: "Jun 02, 2026", state: "done" },
      { label: "Work In Progress", date: "Jun 03, 2026", state: "done" },
      { label: "Completed", date: "Jun 05, 2026", state: "done" },
    ],
    completion: {
      notes:
        "Replaced the faulty outlet and inspected the surrounding wiring. Circuit tested and confirmed safe.",
      date: "Jun 05, 2026",
      photos: [
        "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80",
      ],
    },
  },
  {
    id: "REQ-1019",
    title: "Ants in the kitchen pantry",
    description: "Small ants appearing around the pantry shelves daily.",
    property: "Maple Court Residences — Unit 12B",
    category: "pest-control",
    priority: "low",
    status: "completed",
    submittedAt: "2026-05-28",
    photos: [],
    timeline: [
      { label: "Request Submitted", date: "May 28, 2026", state: "done" },
      { label: "Owner Reviewed", date: "May 28, 2026", state: "done" },
      { label: "Work In Progress", date: "May 29, 2026", state: "done" },
      { label: "Completed", date: "May 30, 2026", state: "done" },
    ],
    completion: {
      notes: "Applied pet-safe treatment to pantry and sealed entry gaps.",
      date: "May 30, 2026",
      photos: [],
    },
  },
  {
    id: "REQ-1007",
    title: "Slow internet in home office",
    description: "Connection drops several times a day, mostly afternoons.",
    property: "Maple Court Residences — Unit 12B",
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
];

const MOCK_NOTIFICATIONS: ResidentNotification[] = [
  {
    id: "n1",
    type: "reviewed",
    message: "Your request REQ-1042 (Kitchen sink leak) has been reviewed by the owner.",
    time: "2h ago",
  },
  {
    id: "n2",
    type: "status",
    message: "REQ-1042 status updated to In Progress.",
    time: "5h ago",
  },
  {
    id: "n3",
    type: "completed",
    message: "REQ-1025 (Outlet sparking) was marked completed.",
    time: "Yesterday",
  },
];

// ============================================================================
// Service functions
// ============================================================================

/** Fetch all requests for the current resident. */
export async function getRequests(): Promise<MaintenanceRequest[]> {
  await delay(500);
  return MOCK_REQUESTS;
}

/** Fetch a single request by id. */
export async function getRequestById(
  id: string
): Promise<MaintenanceRequest | undefined> {
  await delay(400);
  return MOCK_REQUESTS.find((r) => r.id === id);
}

/** Fetch recent notifications. */
export async function getNotifications(): Promise<ResidentNotification[]> {
  await delay(300);
  return MOCK_NOTIFICATIONS;
}

/** Submit a new maintenance request (mock). */
export async function submitRequest(
  _payload: Omit<MaintenanceRequest, "id" | "status" | "timeline" | "submittedAt">
): Promise<{ success: boolean; id: string }> {
  await delay(1200);
  return { success: true, id: `REQ-${Math.floor(1000 + Math.random() * 9000)}` };
}
