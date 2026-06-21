// ============================================================================
// RequestDetailsPage — full detail view of a single maintenance request.
// ============================================================================

// Imports
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CheckCircle2, ImageOff } from "lucide-react";
import { DashboardLayout } from "../../layouts/dashboardLayout";
import { StatusBadge, PriorityBadge } from "../../components/dashboard/badges";
import { RequestTimeline } from "../../components/dashboard/requestTimeline";
import { SecondaryButton } from "../../components/auth/buttons";
import { LoadingState } from "../../components/shared/loadingState";
import { InfoRow } from "../../components/shared/infoRow";
import { getRequestById } from "../../services/requestService";
import {
  RESIDENT_ROUTES,
  categoryLabel,
  type MaintenanceRequest,
} from "../../constants/resident";

// Photo grid helper.
function PhotoGallery({ photos }: { photos: string[] }) {
  if (photos.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-500">
        <ImageOff size={16} /> No photos attached.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((src, i) => (
        <div key={i} className="aspect-video overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
          <img src={src} alt={`Attachment ${i + 1}`} className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
}

// Component
export default function RequestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  // Load the request by id from the route param.
  useEffect(() => {
    let active = true;
    (async () => {
      const data = await getRequestById(id ?? "");
      if (!active) return;
      setRequest(data ?? null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <DashboardLayout title="Request Details">
      {/* Back link */}
      <SecondaryButton
        fullWidth={false}
        onClick={() => navigate(RESIDENT_ROUTES.history)}
        className="mb-5"
      >
        <ArrowLeft size={16} />
        Back to history
      </SecondaryButton>

      {loading ? (
        <LoadingState />
      ) : !request ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-12 text-center text-slate-500">
          Request not found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column: info, description, photos, completion */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Header */}
            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-slate-100">{request.title}</h2>
                  <p className="mt-0.5 text-sm text-slate-500">{request.id}</p>
                </div>
                <div className="flex gap-2">
                  <PriorityBadge priority={request.priority} />
                  <StatusBadge status={request.status} />
                </div>
              </div>

              {/* Request information grid */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 sm:grid-cols-3">
                <InfoRow label="Property">{request.property}</InfoRow>
                <InfoRow label="Category">{categoryLabel(request.category)}</InfoRow>
                <InfoRow label="Date Submitted">{request.submittedAt}</InfoRow>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5 sm:p-6">
              <h3 className="mb-2 text-slate-200">Issue Description</h3>
              <p className="text-sm leading-relaxed text-slate-400">{request.description}</p>
            </div>

            {/* Photos */}
            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5 sm:p-6">
              <h3 className="mb-3 text-slate-200">Uploaded Photos</h3>
              <PhotoGallery photos={request.photos} />
            </div>

            {/* Completion section — completed only */}
            {request.status === "completed" && request.completion && (
              <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-5 sm:p-6">
                <h3 className="mb-3 flex items-center gap-2 text-green-300">
                  <CheckCircle2 size={18} />
                  Completion Details
                </h3>
                <div className="mb-4 grid gap-4 sm:grid-cols-2">
                  <InfoRow label="Completed On">{request.completion.date}</InfoRow>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-300">
                  {request.completion.notes}
                </p>
                <PhotoGallery photos={request.completion.photos} />
              </div>
            )}
          </div>

          {/* Right column: timeline */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5 sm:p-6">
              <h3 className="mb-5 text-slate-200">Request Timeline</h3>
              <RequestTimeline steps={request.timeline} />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
