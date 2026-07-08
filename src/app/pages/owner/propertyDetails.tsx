// ============================================================================
// PropertyDetailsPage — full detail view of a single property.
// Shows property info, resident list, and recent maintenance requests.
// ============================================================================

// Imports
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, CheckCircle2, Wrench, AlertTriangle, Pencil, Trash2, Bed, Bath } from "lucide-react";
import { OwnerLayout } from "../../layouts/ownerLayout";
import { StatusBadge, PriorityBadge } from "../../components/dashboard/badges";
import { SecondaryButton, PrimaryButton } from "../../components/auth/buttons";
import { LoadingState } from "../../components/shared/loadingState";
import { StatTile } from "../../components/shared/statTile";
import { Pagination } from "../../components/shared/pagination";
import { usePagination } from "../../hooks/usePagination";
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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [residents, setResidents] = useState<ResidentOption[]>([]);

  const { page, setPage, pageSize, setPageSize, totalPages, pageItems, total } = usePagination(requests);

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
    toast.success("Resident assigned successfully.");
  }, [id, loadData]);

  const handleRemoveResident = useCallback(async (residentId: string) => {
    await api.delete(`/api/properties/${id}/residents/${residentId}`);
    await loadData();
  }, [id, loadData]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/properties/${id}`);
      toast.success("Property deleted.");
      navigate(OWNER_ROUTES.properties);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete property.");
      setDeleting(false);
    }
  }, [id, navigate]);

  return (
    <OwnerLayout title="Property Details" onRefresh={loadData}>
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
          <AssignResidentModal
            open={showAssign}
            residents={residents}
            unitCount={property.unitCount}
            occupiedUnits={property.residents.map((r) => r.unit).filter(Boolean)}
            onClose={() => setShowAssign(false)}
            onAssign={handleAssign}
          />

          {/* Property header */}
          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-foreground text-2xl font-semibold mb-1">{property.name}</h2>
                <p className="text-sm text-muted-foreground">{property.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => setShowConfirmDelete(true)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-critical/40 hover:text-critical">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
              <div className="flex flex-col bg-primary/5 rounded-xl p-4 border border-primary/20">
                <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Property Rent</span>
                <span className="text-2xl font-bold text-primary">${property.totalMonthlyRent?.toLocaleString() ?? 0}</span>
                <span className="text-xs text-muted-foreground mt-1">Sum of {property.units?.length || 0} units</span>
              </div>
              <div className="flex flex-col md:col-span-2 justify-center">
                <div className="flex flex-col gap-3">
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map(a => (
                        <span key={a} className="rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                  {property.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {property.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Units */}
          {property.units && property.units.length > 0 && (
            <div className="rounded-2xl border border-border bg-card/40">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-foreground">Property Units</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                {property.units.map(unit => (
                  <div key={unit.id} className="rounded-xl border border-border bg-background p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-foreground">{unit.unitIdentifier}</span>
                      <span className="text-primary font-semibold">${unit.monthlyRent?.toLocaleString() ?? 0}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Bed size={14} /> {unit.bedrooms}</span>
                      <span className="flex items-center gap-1.5"><Bath size={14} /> {unit.bathrooms}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delete confirmation */}
          <Dialog.Root open={showConfirmDelete} onOpenChange={(o) => !o && setShowConfirmDelete(false)}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
              <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-popover p-6 shadow-lg focus:outline-none">
                <Dialog.Title className="mb-2 text-foreground">Delete Property?</Dialog.Title>
                <Dialog.Description className="mb-6 text-sm text-muted-foreground">
                  This removes <span className="text-foreground">{property.name}</span> from your properties
                  {property.residents.length > 0
                    ? ` and its ${property.residents.length} assigned resident${property.residents.length === 1 ? "" : "s"} will lose access to it. `
                    : ". "}
                  This can't be undone from the UI.
                </Dialog.Description>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 rounded-xl bg-critical py-2.5 text-sm text-white hover:bg-critical/90 disabled:opacity-60"
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatTile label="Open Requests" value={property.stats.openRequests} color="text-warning" />
            <StatTile label="Completed" value={property.stats.completedRequests} color="text-success" />
            <StatTile label="Critical" value={property.stats.criticalRequests} color="text-critical" />
          </div>

          <PropertyResidentsList residents={property.residents} unitCount={property.unitCount} onAssign={openAssign} onRemove={handleRemoveResident} />

          {/* Recent requests */}
          <div className="rounded-2xl border border-border bg-card/40">
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-foreground">Maintenance Requests</h3>
            </div>
            {requests.length === 0 ? (
              <p className="px-5 py-8 text-sm text-muted-foreground">No requests for this property.</p>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
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
                      {pageItems.map((r) => (
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
                </div>

                {/* Mobile cards */}
                <div className="flex flex-col divide-y divide-border md:hidden">
                  {pageItems.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => navigate(`${OWNER_ROUTES.requestManage}/${r.id}`)}
                      className="flex flex-col gap-2 px-5 py-4 text-left hover:bg-accent"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-foreground">{r.title}</p>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="flex items-center gap-3">
                        <PriorityBadge priority={r.priority} />
                        <span className="text-xs text-muted-foreground">{categoryLabel(r.category)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {requests.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>
      )}
    </OwnerLayout>
  );
}
