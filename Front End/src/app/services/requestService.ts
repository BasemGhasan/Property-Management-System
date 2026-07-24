import { api } from "../lib/apiClient";
import { getNotifications as getAppNotifications, formatTimeAgo } from "./notificationService";
import type {
  MaintenanceRequest,
  ResidentNotification,
  RequestStatus,
  RequestPriority,
  TimelineStep,
} from "../constants/resident";

// ── Backend response shape ──────────────────────────────────────────────────

interface ApiRequest {
  id: number;
  residentId: number;
  residentName: string;
  propertyId: number;
  propertyName: string;
  categoryId: number;
  categoryName: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  ownerNotes?: string;
  createdAt: string;
  updatedAt: string;
  evidence: { id: number; fileUrl: string; fileName?: string }[];
}

// ── Mapping helpers ─────────────────────────────────────────────────────────

function mapStatus(s: string): RequestStatus {
  switch (s) {
    case "InProgress": return "in-progress";
    case "Resolved":   return "completed";
    case "Rejected":   return "rejected";
    default:           return "pending";
  }
}

function mapPriority(p: string): RequestPriority {
  switch (p) {
    case "Urgent": return "critical";
    case "High":   return "high";
    case "Low":    return "low";
    default:       return "medium";
  }
}

function buildTimeline(status: RequestStatus, createdAt: string, updatedAt: string): TimelineStep[] {
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const steps: TimelineStep[] = [
    { label: "Request Submitted", date: fmt(createdAt), state: "done" },
    { label: "Owner Reviewed", state: "upcoming" },
    { label: "Work In Progress", state: "upcoming" },
    { label: "Completed", state: "upcoming" },
  ];

  if (status === "in-progress") {
    steps[1] = { ...steps[1], date: fmt(updatedAt), state: "done" };
    steps[2] = { ...steps[2], date: fmt(updatedAt), state: "current" };
  } else if (status === "completed") {
    steps[1] = { ...steps[1], state: "done" };
    steps[2] = { ...steps[2], state: "done" };
    steps[3] = { ...steps[3], date: fmt(updatedAt), state: "done" };
  } else if (status === "rejected") {
    steps[1] = { ...steps[1], date: fmt(updatedAt), state: "done" };
    steps[2] = { label: "Rejected", date: fmt(updatedAt), state: "done" };
    steps.pop();
  } else {
    steps[0] = { ...steps[0], state: "current" };
  }

  return steps;
}

function toFrontend(r: ApiRequest): MaintenanceRequest {
  const status = mapStatus(r.status);
  const priority = mapPriority(r.priority);

  return {
    id: `REQ-${r.id}`,
    title: r.title,
    description: r.description ?? "",
    property: r.propertyName,
    category: r.categoryName.toLowerCase().replace(/\s+/g, "-"),
    priority,
    status,
    submittedAt: r.createdAt.split("T")[0],
    photos: r.evidence.map((e) => e.fileUrl),
    timeline: buildTimeline(status, r.createdAt, r.updatedAt),
    ...(status === "completed" && r.ownerNotes
      ? {
          completion: {
            notes: r.ownerNotes,
            date: new Date(r.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            photos: [],
          },
        }
      : {}),
  };
}

// ── Service functions ────────────────────────────────────────────────────────

export async function getRequests(): Promise<MaintenanceRequest[]> {
  const data = await api.get<ApiRequest[]>("/api/requests");
  return data.map(toFrontend);
}

export async function getRequestById(id: string): Promise<MaintenanceRequest | undefined> {
  const numericId = id.replace("REQ-", "");
  try {
    const data = await api.get<ApiRequest>(`/api/requests/${numericId}`);
    return toFrontend(data);
  } catch {
    return undefined;
  }
}

function mapNotificationType(type: string): ResidentNotification["type"] {
  switch (type) {
    case "Reviewed":  return "reviewed";
    case "Completed": return "completed";
    default:          return "status";
  }
}

export async function getNotifications(): Promise<ResidentNotification[]> {
  const notifications = await getAppNotifications();
  return notifications.map((n) => ({
    id: String(n.id),
    type: mapNotificationType(n.type),
    message: n.message,
    time: formatTimeAgo(n.createdAt),
  }));
}

export async function submitRequest(
  payload: Omit<MaintenanceRequest, "id" | "status" | "timeline" | "submittedAt">
): Promise<{ success: boolean; id: string }> {
  // Caller must pass propertyId and categoryId via extra fields
  const result = await api.post<{ id: number }>("/api/requests", payload);
  return { success: true, id: `REQ-${result.id}` };
}
