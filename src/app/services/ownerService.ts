import { api } from "../lib/apiClient";
import type { Property, OwnerRequest } from "../constants/owner";
import type { RequestStatus, RequestPriority } from "../constants/resident";

// ── Backend shapes ───────────────────────────────────────────────────────────

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
  residents: {
    id: number;
    residentId: number;
    residentName: string;
    residentEmail: string;
    unitNumber?: string;
  }[];
}

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
  evidence: { id: number; fileUrl: string }[];
}

// ── Mapping helpers ──────────────────────────────────────────────────────────

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

function toProperty(p: ApiProperty): Property {
  return {
    id: String(p.id),
    name: p.name,
    address: p.address,
    unitCount: p.unitCount,
    description: p.description ?? "",
    units: (p.units ?? []).map(u => ({
      id: String(u.id),
      unitIdentifier: u.unitIdentifier,
      bedrooms: u.bedrooms,
      bathrooms: u.bathrooms,
      monthlyRent: u.monthlyRent,
    })),
    totalMonthlyRent: p.totalMonthlyRent ?? 0,
    residents: (p.residents ?? []).map((r) => ({
      id: String(r.residentId),
      name: r.residentName,
      unit: r.unitNumber ?? "",
      email: r.residentEmail,
      phone: "",
    })),
    stats: {
      openRequests: p.openRequests,
      completedRequests: p.totalRequests - p.openRequests,
      criticalRequests: 0,
    },
  };
}

function toOwnerRequest(r: ApiRequest): OwnerRequest {
  const status = mapStatus(r.status);
  const updatedFmt = new Date(r.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const createdFmt = new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const timeline: OwnerRequest["timeline"] =
    status === "completed"
      ? [
          { label: "Request Submitted", date: createdFmt, state: "done" },
          { label: "Owner Reviewed", state: "done" },
          { label: "Work In Progress", state: "done" },
          { label: "Completed", date: updatedFmt, state: "done" },
        ]
      : status === "in-progress"
      ? [
          { label: "Request Submitted", date: createdFmt, state: "done" },
          { label: "Owner Reviewed", state: "done" },
          { label: "Work In Progress", date: updatedFmt, state: "current" },
          { label: "Completed", state: "upcoming" },
        ]
      : status === "rejected"
      ? [
          { label: "Request Submitted", date: createdFmt, state: "done" },
          { label: "Owner Reviewed", date: updatedFmt, state: "done" },
          { label: "Rejected", date: updatedFmt, state: "done" },
        ]
      : [
          { label: "Request Submitted", date: createdFmt, state: "current" },
          { label: "Owner Reviewed", state: "upcoming" },
          { label: "Work In Progress", state: "upcoming" },
          { label: "Completed", state: "upcoming" },
        ];

  return {
    id: `REQ-${r.id}`,
    title: r.title,
    description: r.description ?? "",
    propertyId: String(r.propertyId),
    propertyName: r.propertyName,
    residentName: r.residentName,
    category: r.categoryName.toLowerCase().replace(/\s+/g, "-"),
    priority: mapPriority(r.priority),
    status,
    submittedAt: r.createdAt.split("T")[0],
    photos: r.evidence.map((e) => e.fileUrl),
    completionNotes: r.ownerNotes,
    timeline,
  };
}

// ── Service functions ────────────────────────────────────────────────────────

export async function getProperties(): Promise<Property[]> {
  const data = await api.get<ApiProperty[]>("/api/properties");
  return data.map(toProperty);
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  try {
    const data = await api.get<ApiProperty>(`/api/properties/${id}`);
    return toProperty(data);
  } catch {
    return undefined;
  }
}

export async function getOwnerRequests(): Promise<OwnerRequest[]> {
  const data = await api.get<ApiRequest[]>("/api/requests");
  return data.map(toOwnerRequest);
}

export async function getOwnerRequestById(id: string): Promise<OwnerRequest | undefined> {
  const numericId = id.replace("REQ-", "");
  try {
    const data = await api.get<ApiRequest>(`/api/requests/${numericId}`);
    return toOwnerRequest(data);
  } catch {
    return undefined;
  }
}

function mapStatusToApi(status: RequestStatus): string {
  switch (status) {
    case "in-progress": return "InProgress";
    case "completed":   return "Resolved";
    case "rejected":    return "Rejected";
    default:            return "Pending";
  }
}

export async function updateOwnerRequest(
  id: string,
  patch: Partial<Pick<OwnerRequest, "status" | "priority" | "completionNotes">>
): Promise<boolean> {
  const numericId = id.replace("REQ-", "");
  try {
    await api.put(`/api/requests/${numericId}/status`, {
      status: patch.status ? mapStatusToApi(patch.status) : undefined,
      ownerNotes: patch.completionNotes ?? null,
    });
    return true;
  } catch {
    return false;
  }
}
