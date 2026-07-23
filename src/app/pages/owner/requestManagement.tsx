// ============================================================================
// RequestManagementPage — owner reviews and updates a single request.
// Simplified: update status + priority + completion notes. No contractors.
// ============================================================================

// Imports
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { OwnerLayout } from "../../layouts/ownerLayout";
import { StatusBadge, PriorityBadge } from "../../components/dashboard/badges";
import { RequestTimeline } from "../../components/dashboard/requestTimeline";
import { SelectField } from "../../components/auth/selectField";
import { TextAreaField } from "../../components/auth/textAreaField";
import { PrimaryButton, SecondaryButton } from "../../components/auth/buttons";
import { LoadingState } from "../../components/shared/loadingState";
import { InfoRow } from "../../components/shared/infoRow";
import { getOwnerRequestById, updateOwnerRequest } from "../../services/ownerService";
import { OWNER_ROUTES } from "../../constants/owner";
import { PRIORITY_OPTIONS, categoryLabel } from "../../constants/resident";
import { REQUEST_STATUS_OPTIONS } from "../../constants/filters";
import { getThumbnailUrl, fetchOrGenerateThumbnail } from "../../lib/thumbnail";
import type { OwnerRequest } from "../../constants/owner";
import type { RequestStatus, RequestPriority } from "../../constants/resident";

// Falls back full-size original -> Lambda-generated thumbnail -> on-demand API Gateway
// generation -> original again, so a broken/missing thumbnail never blocks the photo.
async function handleThumbnailError(e: React.SyntheticEvent<HTMLImageElement>, original: string) {
  const img = e.currentTarget;
  if (!img.dataset.thumbStage) {
    img.dataset.thumbStage = "api";
    const generated = await fetchOrGenerateThumbnail(original);
    if (generated) {
      img.src = generated;
      return;
    }
  }
  img.dataset.thumbStage = "original";
  img.src = original;
}

// Component
export default function RequestManagementPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState<OwnerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<RequestStatus>("pending");
  const [priority, setPriority] = useState<RequestPriority>("medium");
  const [completionNotes, setCompletionNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(() =>
    getOwnerRequestById(id ?? "").then((req) => {
      if (!req) return;
      setRequest(req);
      setStatus(req.status);
      setPriority(req.priority);
      setCompletionNotes(req.completionNotes ?? "");
    }), [id]);

  useEffect(() => {
    let active = true;
    loadData().then(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadData]);

  const handleSave = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    const ok = await updateOwnerRequest(id, { status, priority, completionNotes });
    if (ok) {
      const fresh = await getOwnerRequestById(id);
      if (fresh) {
        setRequest(fresh);
        setStatus(fresh.status);
        setPriority(fresh.priority);
        setCompletionNotes(fresh.completionNotes ?? "");
      }
      setSaving(false);
      toast.success("Request updated successfully.");
    } else {
      setSaving(false);
      toast.error("Failed to update the request. Please try again.");
    }
  }, [id, status, priority, completionNotes]);

  if (loading) {
    return (
      <OwnerLayout title="Request Management">
        <LoadingState />
      </OwnerLayout>
    );
  }

  if (!request) {
    return (
      <OwnerLayout title="Request Management">
        <p className="py-12 text-center text-muted-foreground">Request not found.</p>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Request Management" onRefresh={loadData}>
      <SecondaryButton fullWidth={false} onClick={() => navigate(OWNER_ROUTES.requests)} className="mb-5">
        <ArrowLeft size={16} /> Back to Requests
      </SecondaryButton>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — details + controls */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Header */}
          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-foreground">{request.title}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{request.id}</p>
              </div>
              <div className="flex gap-2">
                <PriorityBadge priority={priority} />
                <StatusBadge status={status} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
              <InfoRow label="Property">{request.propertyName}</InfoRow>
              <InfoRow label="Resident">{request.residentName}</InfoRow>
              <InfoRow label="Category">{categoryLabel(request.category)}</InfoRow>
              <InfoRow label="Submitted">{request.submittedAt}</InfoRow>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <h3 className="mb-2 text-foreground">Description</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{request.description}</p>
          </div>

          {/* Photos */}
          {request.photos.length > 0 && (
            <div className="rounded-2xl border border-border bg-card/40 p-5">
              <h3 className="mb-3 text-foreground">Photos</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {request.photos.map((src, i) => (
                  <div key={i} className="aspect-video overflow-hidden rounded-xl border border-border">
                    <img
                      src={getThumbnailUrl(src) ?? src}
                      alt={`Photo ${i + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => handleThumbnailError(e, src)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owner controls */}
          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <h3 className="mb-4 text-foreground">Update Request</h3>
            <div className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  label="Status"
                  name="status"
                  options={REQUEST_STATUS_OPTIONS as { value: string; label: string }[]}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RequestStatus)}
                />
                <SelectField
                  label="Priority"
                  name="priority"
                  options={PRIORITY_OPTIONS}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as RequestPriority)}
                />
              </div>

              <TextAreaField
                label="Completion Notes"
                name="completionNotes"
                placeholder="Add notes once the issue is resolved..."
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
              />

              <PrimaryButton fullWidth={false} loading={saving} onClick={handleSave}>
                {!saving && <Save size={18} />}
                Save Changes
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* Right — timeline */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <h3 className="mb-5 text-foreground">Request Timeline</h3>
            <RequestTimeline steps={request.timeline} />
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
