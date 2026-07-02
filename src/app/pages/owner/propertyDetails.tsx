// ============================================================================
// PropertyDetailsPage — full detail view of a single property.
// Shows property info, resident list, and recent maintenance requests.
// ============================================================================

// Imports
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CheckCircle2, Wrench, AlertTriangle, Pencil } from "lucide-react";
import { OwnerLayout } from "../../layouts/ownerLayout";
import { StatusBadge, PriorityBadge } from "../../components/dashboard/badges";
import { SecondaryButton, PrimaryButton } from "../../components/auth/buttons";
import { LoadingState } from "../../components/shared/loadingState";
import { StatTile } from "../../components/shared/statTile";
import { EditPropertyModal } from "../../components/owner/editPropertyModal";
import { AssignResidentModal, type ResidentOption } from "../../components/owner/assignResidentModal";
import { PropertyResidentsList } from "../../components/owner/propertyResidentsList";
import { getPropertyById, getOwnerRequests } from "../../services/ownerService";
import { api } from "../../lib/apiClient";
import { OWNER_ROUTES } from "../../constants/owner";
import { categoryLabel } from "../../constants/resident";
import type { Property, OwnerRequest } from "../../constants/owner";

// Component
export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [requests, setRequests] = useState<OwnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [residents, setResidents] = useState<ResidentOption[]>([]);

  const loadData = useCallback(() =>
    Promise.all([getPropertyById(id ?? ""), getOwnerRequests()]).then(([p, r]) => {
      setProperty(p ?? null);
      setRequests(r.filter((req) => req.propertyId === id));
    }), [id]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadData().then(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadData]);

  const handleSaveEdit = useCallback(async (data: { name: string; address: string; unitCount: number }) => {
    await api.put(`/api/properties/${id}`, data);
    await loadData();
  }, [id, loadData]);

  const openAssign = useCallback(async () => {
    const data = await api.get<ResidentOption[]>("/api/users/residents");
    setResidents(data);
    setShowAssign(true);
  }, []);

  const handleAssign = useCallback(async (data: { residentId: string; unit: string }) => {
    await api.post(`/api/properties/${id}/residents`, { residentId: Number(data.residentId), unitNumber: data.unit || null });
    await loadData();
  }, [id, loadData]);

  const handleRemoveResident = useCallback(async (residentId: string) => {
    await api.delete(`/api/properties/${id}/residents/${residentId}`);
    await loadData();
  }, [id, loadData]);

  return (
    <OwnerLayout title="Property Details">
      <SecondaryButton fullWidth={false} onClick={() => navigate(OWNER_ROUTES.properties)} className="mb-5">
        <ArrowLeft size={16} /> Back to Properties
      </SecondaryButton>

      {loading ? (
        <LoadingState />
      ) : !property ? (
        <p className="py-12 text-center text-muted-foreground">Property not found.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <EditPropertyModal open={showEdit} property={property} onClose={() => setShowEdit(false)} onSave={handleSaveEdit} />
          <AssignResidentModal open={showAssign} residents={residents} onClose={() => setShowAssign(false)} onAssign={handleAssign} />

          {/* Property header */}
          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-foreground">{property.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{property.address}</p>
              </div>
              <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary">
                <Pencil size={13} /> Edit
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatTile label="Open Requests" value={property.stats.openRequests} color="text-warning" />
            <StatTile label="Completed" value={property.stats.completedRequests} color="text-success" />
            <StatTile label="Critical" value={property.stats.criticalRequests} color="text-critical" />
          </div>

          <PropertyResidentsList residents={property.residents} onAssign={openAssign} onRemove={handleRemoveResident} />

          {/* Recent requests */}
          <div className="rounded-2xl border border-border bg-card/40">
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-foreground">Maintenance Requests</h3>
            </div>
            {requests.length === 0 ? (
              <p className="px-5 py-8 text-sm text-muted-foreground">No requests for this property.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requests.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => navigate(`${OWNER_ROUTES.requestManage}/${r.id}`)}
                      className="cursor-pointer transition-colors hover:bg-accent"
                    >
                      <td className="px-5 py-3 text-muted-foreground">{r.id}</td>
                      <td className="px-5 py-3 text-foreground">{r.title}</td>
                      <td className="px-5 py-3 text-muted-foreground">{categoryLabel(r.category)}</td>
                      <td className="px-5 py-3"><PriorityBadge priority={r.priority} /></td>
                      <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
