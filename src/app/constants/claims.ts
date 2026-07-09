export type ClaimStatus = "pending" | "approved" | "rejected";

export interface MaintenanceClaim {
  id: string;
  residentId: number;
  residentName: string;
  propertyId: string;
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
  status: ClaimStatus;
  submittedAt: string;
  reviewedAt?: string;
}

export interface CreateMaintenanceClaimPayload {
  propertyId: number;
  maintenanceType: string;
  serviceDate: string;
  amount: number;
  bankAccountNumber: string;
  bankName: string;
  bankAccountHolderName: string;
  comments?: string;
  receiptUrl?: string;
}

export const CLAIM_STATUS_STYLES: Record<ClaimStatus, { label: string; classes: string; dot: string }> = {
  pending: {
    label: "Pending",
    classes: "bg-background text-muted-foreground border-border",
    dot: "bg-neutral-dot",
  },
  approved: {
    label: "Approved",
    classes: "bg-success-soft text-success border-success/25",
    dot: "bg-success",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-critical-soft text-critical border-critical/25",
    dot: "bg-critical",
  },
};

export function claimStatusLabel(status: ClaimStatus): string {
  return CLAIM_STATUS_STYLES[status]?.label ?? status;
}
