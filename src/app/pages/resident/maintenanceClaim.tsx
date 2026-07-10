import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  CheckCircle2,
  FileImage,
  FileText,
  History,
  Loader2,
  ReceiptText,
  Send,
  UploadCloud,
  X,
} from "lucide-react";
import { DashboardLayout } from "../../layouts/dashboardLayout";
import { InputField } from "../../components/auth/inputField";
import { SelectField } from "../../components/auth/selectField";
import { TextAreaField } from "../../components/auth/textAreaField";
import { PrimaryButton, SecondaryButton } from "../../components/auth/buttons";
import { InfoRow } from "../../components/shared/infoRow";
import { LoadingState } from "../../components/shared/loadingState";
import { api } from "../../lib/apiClient";
import { RESIDENT_ROUTES } from "../../constants/resident";
import { CLAIM_STATUS_STYLES, type ClaimStatus, type MaintenanceClaim } from "../../constants/claims";
import { isRequired } from "../../services/validators";
import {
  getMaintenanceClaims,
  scanClaimInvoice,
  submitMaintenanceClaim,
} from "../../services/claimService";

interface PropertyOption {
  id: number;
  name: string;
}

interface FormErrors {
  property?: string;
  maintenanceType?: string;
  serviceDate?: string;
  amount?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankAccountHolderName?: string;
}

type ClaimTab = "submit" | "history";

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

export default function MaintenanceClaimPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ClaimTab>("submit");
  const [propertyOptions, setPropertyOptions] = useState<PropertyOption[]>([]);
  const [claims, setClaims] = useState<MaintenanceClaim[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [propertyId, setPropertyId] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [amount, setAmount] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountHolderName, setBankAccountHolderName] = useState("");
  const [comments, setComments] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [receiptPreview, setReceiptPreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    api.get<PropertyOption[]>("/api/properties").then((props) => {
      setPropertyOptions(props);
      if (props.length === 1) setPropertyId(String(props[0].id));
    });
  }, []);

  const loadClaims = useCallback(() =>
    getMaintenanceClaims().then((claimData) => setClaims(claimData)), []);

  useEffect(() => {
    let active = true;
    loadClaims()
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Failed to load claim history.";
        toast.error(message);
      })
      .finally(() => {
        if (active) setClaimsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadClaims]);

  const validate = useCallback((): FormErrors => {
    const next: FormErrors = {};
    if (!isRequired(propertyId)) next.property = "Select the property for this claim.";
    if (!isRequired(maintenanceType)) next.maintenanceType = "Enter the maintenance type.";
    if (!isRequired(serviceDate)) next.serviceDate = "Enter the receipt or service date.";
    if (!isRequired(amount) || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      next.amount = "Enter a valid claim amount.";
    }
    if (!isRequired(bankAccountNumber)) next.bankAccountNumber = "Enter the bank account number.";
    if (!isRequired(bankName)) next.bankName = "Enter the bank name.";
    if (!isRequired(bankAccountHolderName)) next.bankAccountHolderName = "Enter the account holder name.";
    return next;
  }, [propertyId, maintenanceType, serviceDate, amount, bankAccountNumber, bankName, bankAccountHolderName]);

  const scanReceipt = useCallback(async (file: File) => {
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast.error("Please upload a PNG or JPG receipt.");
      return;
    }

    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview(URL.createObjectURL(file));
    setReceiptName(file.name);
    setScanning(true);
    setSuccess(false);

    try {
      const result = await scanClaimInvoice(file);
      setReceiptUrl(result.fileUrl);
      setMaintenanceType(result.maintenanceType ?? "");
      setServiceDate(result.date ?? "");
      setAmount(result.amount != null ? String(result.amount) : "");
      toast.success("Receipt scanned. Please review the extracted details.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to scan receipt.";
      toast.error(message);
    } finally {
      setScanning(false);
    }
  }, [receiptPreview]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      await submitMaintenanceClaim({
        propertyId: Number(propertyId),
        maintenanceType,
        serviceDate,
        amount: Number(amount),
        bankAccountNumber,
        bankName,
        bankAccountHolderName,
        comments: comments.trim() || undefined,
        receiptUrl: receiptUrl || undefined,
      });

      setSuccess(true);
      toast.success("Maintenance claim submitted to the property owner.");
      await loadClaims();
      setActiveTab("history");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit claim.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [
    validate,
    propertyId,
    maintenanceType,
    serviceDate,
    amount,
    bankAccountNumber,
    bankName,
    bankAccountHolderName,
    comments,
    receiptUrl,
    loadClaims,
  ]);

  return (
    <DashboardLayout title="Maintenance Claim">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 inline-flex rounded-2xl border border-border bg-card/40 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("submit")}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors",
              activeTab === "submit"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            ].join(" ")}
          >
            <ReceiptText size={16} />
            Submit Claim
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors",
              activeTab === "history"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            ].join(" ")}
          >
            <History size={16} />
            Claim History
          </button>
        </div>

        {activeTab === "submit" ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 rounded-2xl border border-border bg-card/40 p-5 sm:p-7"
            noValidate
          >
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-background/40 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-input text-primary">
                <ReceiptText size={22} />
              </span>
              <div>
                <h2 className="text-foreground">Submit a Maintenance Claim</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Upload a receipt to auto-fill the claim details, then review the fields before sending it to the property owner.
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-secondary-foreground">Receipt Image</label>
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) void scanReceipt(file);
                }}
                className={[
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors",
                  dragging ? "border-primary bg-primary/10" : "border-border bg-background/40 hover:border-primary/40",
                ].join(" ")}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-input text-primary">
                  {scanning ? <Loader2 className="animate-spin" size={22} /> : <UploadCloud size={22} />}
                </span>
                <p className="text-sm text-secondary-foreground">
                  {scanning ? "Scanning receipt..." : "Drag & drop a receipt, or "}
                  {!scanning && <span className="text-primary">browse</span>}
                </p>
                <p className="text-xs text-muted-foreground">PNG or JPG up to 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  disabled={scanning || submitting}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void scanReceipt(file);
                  }}
                />
              </div>

              {receiptPreview && (
                <div className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-background/40 p-3">
                  <div className="h-20 w-24 overflow-hidden rounded-xl border border-border bg-popover">
                    <img src={receiptPreview} alt="Receipt preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm text-secondary-foreground">
                      <FileImage size={15} /> {receiptName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {receiptUrl ? "Uploaded and ready for claim submission." : "Receipt selected."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Property"
                name="property"
                placeholder="Select property"
                options={propertyOptions.map((p) => ({ value: String(p.id), label: p.name }))}
                value={propertyId}
                error={errors.property}
                onChange={(e) => setPropertyId(e.target.value)}
              />
              <InputField
                label="Maintenance Type"
                name="maintenanceType"
                placeholder="e.g. Plumbing"
                value={maintenanceType}
                error={errors.maintenanceType}
                onChange={(e) => setMaintenanceType(e.target.value)}
              />
              <InputField
                label="Date"
                name="serviceDate"
                placeholder="YYYY-MM-DD"
                value={serviceDate}
                error={errors.serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
              />
              <InputField
                label="Amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                error={errors.amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Bank Account Number"
                name="bankAccountNumber"
                value={bankAccountNumber}
                error={errors.bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
              />
              <InputField
                label="Bank Name"
                name="bankName"
                value={bankName}
                error={errors.bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>

            <InputField
              label="Name Under Bank Account"
              name="bankAccountHolderName"
              value={bankAccountHolderName}
              error={errors.bankAccountHolderName}
              onChange={(e) => setBankAccountHolderName(e.target.value)}
            />

            <TextAreaField
              label="Comments"
              name="comments"
              placeholder="Optional notes for the property owner..."
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />

            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <PrimaryButton type="submit" fullWidth={false} loading={submitting} className="sm:flex-1">
                {!submitting && (success ? <CheckCircle2 size={18} /> : <Send size={18} />)}
                Submit Claim
              </PrimaryButton>
              <SecondaryButton
                type="button"
                fullWidth={false}
                disabled={submitting}
                onClick={() => navigate(RESIDENT_ROUTES.dashboard)}
              >
                <X size={18} />
                Cancel
              </SecondaryButton>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            {claimsLoading ? (
              <LoadingState />
            ) : claims.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card/40 p-12 text-center text-muted-foreground">
                No maintenance claims submitted yet.
              </div>
            ) : (
              claims.map((claim) => (
                <div key={claim.id} className="rounded-2xl border border-border bg-card/40 p-5 sm:p-6">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-foreground">{claim.maintenanceType} Claim</h2>
                        <ClaimStatusBadge status={claim.status} />
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {claim.id} · Submitted {claim.submittedAt}
                      </p>
                    </div>
                    <p className="text-xl text-foreground">{formatAmount(claim.amount)}</p>
                  </div>

                  <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
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
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
