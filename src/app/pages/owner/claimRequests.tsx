import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileText, Search, XCircle } from "lucide-react";
import { toast } from "sonner";
import { OwnerLayout } from "../../layouts/ownerLayout";
import { SelectField } from "../../components/auth/selectField";
import { PrimaryButton, SecondaryButton } from "../../components/auth/buttons";
import { InfoRow } from "../../components/shared/infoRow";
import { LoadingState } from "../../components/shared/loadingState";
import { Pagination } from "../../components/shared/pagination";
import { usePagination } from "../../hooks/usePagination";
import { getProperties } from "../../services/ownerService";
import {
  getMaintenanceClaims,
  updateMaintenanceClaimStatus,
} from "../../services/claimService";
import {
  CLAIM_STATUS_STYLES,
  type ClaimStatus,
  type MaintenanceClaim,
} from "../../constants/claims";

const statusOptions: { value: ClaimStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  const style = CLAIM_STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${style.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(amount);
}

export default function ClaimRequestsPage() {
  const [claims, setClaims] = useState<MaintenanceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [search, setSearch] = useState("");
  const [property, setProperty] = useState("");
  const [status, setStatus] = useState("");
  const [propertyOptions, setPropertyOptions] = useState<{ value: string; label: string }[]>([]);

  const loadData = useCallback(() =>
    Promise.all([getMaintenanceClaims(), getProperties()]).then(([claimData, properties]) => {
      setClaims(claimData);
      setPropertyOptions(properties.map((p) => ({ value: p.id, label: p.name })));
    }), []);

  useEffect(() => {
    let active = true;
    loadData().then(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadData]);

  const filtered = useMemo(() => {
    const needle = search.toLowerCase();
    return claims.filter((claim) => {
      const matchesSearch =
        !needle ||
        claim.id.toLowerCase().includes(needle) ||
        claim.residentName.toLowerCase().includes(needle) ||
        claim.maintenanceType.toLowerCase().includes(needle) ||
        claim.bankName.toLowerCase().includes(needle);

      return (
        matchesSearch &&
        (!property || claim.propertyId === property) &&
        (!status || claim.status === status)
      );
    });
  }, [claims, search, property, status]);

  const { page, setPage, pageSize, setPageSize, totalPages, pageItems, resetPage, total } = usePagination(filtered);

  const handleStatusChange = useCallback(async (claim: MaintenanceClaim, nextStatus: ClaimStatus) => {
    setUpdatingId(claim.id);
    try {
      await updateMaintenanceClaimStatus(claim.id, nextStatus);
      setClaims((current) =>
        current.map((item) =>
          item.id === claim.id
            ? { ...item, status: nextStatus, reviewedAt: new Date().toISOString().split("T")[0] }
            : item
        )
      );
      toast.success(`Claim ${nextStatus === "approved" ? "approved" : "rejected"}.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update claim.";
      toast.error(message);
    } finally {
      setUpdatingId("");
    }
  }, []);

  return (
    <OwnerLayout title="Claim Requests" onRefresh={loadData}>
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-border bg-card/40 p-4">
          <div className="relative mb-4">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              placeholder="Search by claim ID, resident, maintenance type or bank..."
              className="w-full rounded-xl border border-border bg-background/60 py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Property"
              name="claimPropertyFilter"
              placeholder="All properties"
              options={propertyOptions}
              value={property}
              onChange={(e) => { setProperty(e.target.value); resetPage(); }}
            />
            <SelectField
              label="Status"
              name="claimStatusFilter"
              placeholder="All statuses"
              options={statusOptions}
              value={status}
              onChange={(e) => { setStatus(e.target.value); resetPage(); }}
            />
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {pageItems.map((claim) => (
                <div key={claim.id} className="rounded-2xl border border-border bg-card/40 p-5">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-foreground">{claim.maintenanceType} Claim</h2>
                        <ClaimStatusBadge status={claim.status} />
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{claim.id} · Submitted {claim.submittedAt}</p>
                    </div>
                    <p className="text-xl text-foreground">{formatAmount(claim.amount)}</p>
                  </div>

                  <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
                    <InfoRow label="Resident">{claim.residentName}</InfoRow>
                    <InfoRow label="Property">{claim.propertyName}</InfoRow>
                    <InfoRow label="Date">{claim.serviceDate}</InfoRow>
                    <InfoRow label="Bank">{claim.bankName}</InfoRow>
                    <InfoRow label="Account Number">{claim.bankAccountNumber}</InfoRow>
                    <InfoRow label="Account Name">{claim.bankAccountHolderName}</InfoRow>
                    <InfoRow label="Reviewed">{claim.reviewedAt ?? "Not reviewed"}</InfoRow>
                    <InfoRow label="Receipt">
                      {claim.receiptUrl ? (
                        <a
                          href={claim.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <FileText size={14} />
                          View receipt
                        </a>
                      ) : (
                        "No receipt"
                      )}
                    </InfoRow>
                  </div>

                  {claim.comments && (
                    <div className="mt-4 rounded-xl border border-border bg-background/40 p-4">
                      <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Comments</p>
                      <p className="text-sm leading-relaxed text-secondary-foreground">{claim.comments}</p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <SecondaryButton
                      fullWidth={false}
                      disabled={claim.status !== "pending" || updatingId === claim.id}
                      loading={updatingId === claim.id}
                      onClick={() => void handleStatusChange(claim, "rejected")}
                    >
                      <XCircle size={18} />
                      Reject Claim
                    </SecondaryButton>
                    <PrimaryButton
                      fullWidth={false}
                      disabled={claim.status !== "pending" || updatingId === claim.id}
                      loading={updatingId === claim.id}
                      onClick={() => void handleStatusChange(claim, "approved")}
                    >
                      <CheckCircle2 size={18} />
                      Approve Claim
                    </PrimaryButton>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="rounded-2xl border border-border bg-card/40 p-12 text-center text-muted-foreground">
                No claim requests match your filters.
              </div>
            )}

            {filtered.length > 0 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            )}
          </>
        )}
      </div>
    </OwnerLayout>
  );
}
