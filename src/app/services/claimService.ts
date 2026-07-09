import { api } from "../lib/apiClient";
import type {
  ClaimStatus,
  CreateMaintenanceClaimPayload,
  MaintenanceClaim,
} from "../constants/claims";

interface ApiClaim {
  id: number;
  residentId: number;
  residentName: string;
  propertyId: number;
  propertyName: string;
  maintenanceType: string;
  serviceDate: string;
  amount: number;
  bankAccountNumber: string;
  bankName: string;
  bankAccountHolderName: string;
  comments?: string;
  receiptUrl?: string;
  receiptFileName?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
}

export interface ScanInvoiceResult {
  fileUrl: string;
  maintenanceType: string;
  date: string;
  amount: number;
}

function mapStatus(status: string): ClaimStatus {
  switch (status) {
    case "Approved": return "approved";
    case "Rejected": return "rejected";
    default: return "pending";
  }
}

function mapStatusToApi(status: ClaimStatus): string {
  switch (status) {
    case "approved": return "Approved";
    case "rejected": return "Rejected";
    default: return "Pending";
  }
}

function toClaim(claim: ApiClaim): MaintenanceClaim {
  return {
    id: `CLM-${claim.id}`,
    residentId: claim.residentId,
    residentName: claim.residentName,
    propertyId: String(claim.propertyId),
    propertyName: claim.propertyName,
    maintenanceType: claim.maintenanceType,
    serviceDate: claim.serviceDate,
    amount: claim.amount,
    bankAccountNumber: claim.bankAccountNumber,
    bankName: claim.bankName,
    bankAccountHolderName: claim.bankAccountHolderName,
    comments: claim.comments,
    receiptUrl: claim.receiptUrl,
    receiptFileName: claim.receiptFileName,
    status: mapStatus(claim.status),
    submittedAt: claim.createdAt.split("T")[0],
    reviewedAt: claim.reviewedAt?.split("T")[0],
  };
}

export async function scanClaimInvoice(file: File): Promise<ScanInvoiceResult> {
  return api.upload<ScanInvoiceResult>("/api/maintenance/scan-invoice", file);
}

export async function submitMaintenanceClaim(
  payload: CreateMaintenanceClaimPayload
): Promise<MaintenanceClaim> {
  const claim = await api.post<ApiClaim>("/api/claims", payload);
  return toClaim(claim);
}

export async function getMaintenanceClaims(): Promise<MaintenanceClaim[]> {
  const claims = await api.get<ApiClaim[]>("/api/claims");
  return claims.map(toClaim);
}

export async function updateMaintenanceClaimStatus(
  id: string,
  status: ClaimStatus
): Promise<void> {
  const numericId = id.replace("CLM-", "");
  await api.put(`/api/claims/${numericId}/status`, {
    status: mapStatusToApi(status),
  });
}
