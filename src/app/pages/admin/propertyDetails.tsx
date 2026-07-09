// ============================================================================
// AdminPropertyDetailsPage — full detail view of a single property for admin.
// Shows property info, assigned owner, residents list, and request summary.
// ============================================================================

// Imports
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Mail, Phone, Users, Wrench, CheckCircle2, Pencil, Trash2, Bed, Bath } from "lucide-react";
import { AdminLayout } from "../../layouts/adminLayout";
import { SecondaryButton } from "../../components/auth/buttons";
import { LoadingState } from "../../components/shared/loadingState";
import { EditPropertyModal } from "../../components/owner/editPropertyModal";
import { getAdminPropertyById, getAdminUsers } from "../../services/adminService";
import { getPropertyById } from "../../services/ownerService";
import { api } from "../../lib/apiClient";
import { ADMIN_ROUTES } from "../../constants/admin";
import type { AdminProperty, AdminUser } from "../../constants/admin";
import type { Property, PropertyUnit } from "../../constants/owner";

// Component
export default function AdminPropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [adminProp, setAdminProp]   = useState<AdminProperty | null>(null);
  const [ownerProp, setOwnerProp]   = useState<Property | null>(null);
  const [owners, setOwners]         = useState<AdminUser[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showEdit, setShowEdit]     = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [reassignOwnerId, setReassignOwnerId] = useState("");
  const [reassigning, setReassigning] = useState(false);
  const [deleting, setDeleting]     = useState(false);

  const loadData = useCallback(() =>
    Promise.all([
      getAdminPropertyById(id ?? ""),
      getPropertyById(id ?? ""),
      getAdminUsers().then((u) => setOwners(u.filter((x) => x.role === "owner"))),
    ]).then(([ap, op]) => { setAdminProp(ap ?? null); setOwnerProp(op ?? null); }), [id]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadData().then(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadData]);

  const handleSaveEdit = useCallback(async (data: {
    name: string;
    address: string;
    unitCount: number;
    description: string;
    units: Partial<PropertyUnit>[];
  }) => {
    await api.put(`/api/properties/${id}`, data);
    await loadData();
  }, [id, loadData]);

  const openReassign = () => {
    if (!adminProp) return;
    const matchedOwner = owners.find((o) => o.fullName === adminProp.ownerName);
    setReassignOwnerId(matchedOwner?.id ?? "");
  };

  const handleReassignOwner = useCallback(async () => {
    if (!reassignOwnerId) return;
    setReassigning(true);
    try {
      await api.put(`/api/properties/${id}`, { ownerId: Number(reassignOwnerId) });
      await loadData();
      toast.success("Owner reassigned successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reassign owner.");
    } finally {
      setReassigning(false);
    }
  }, [id, reassignOwnerId, loadData]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/properties/${id}`);
      toast.success("Property deleted.");
      navigate(ADMIN_ROUTES.properties);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete property.");
      setDeleting(false);
    }
  }, [id, navigate]);

  return (
    <AdminLayout title="Property Details" onRefresh={loadData}>
      <SecondaryButton fullWidth={false} onClick={() => navigate(ADMIN_ROUTES.properties)} className="mb-5">
        <ArrowLeft size={16} /> Back to Properties
      </SecondaryButton>

      {/* Edit Modal */}
      {adminProp && (
        <EditPropertyModal
          open={showEdit}
          property={adminProp}
          minUnits={adminProp.residentCount}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete Confirm Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-popover p-6">
            <h2 className="mb-2 text-foreground">Delete Property?</h2>
            <p className="mb-6 text-sm text-muted-foreground">This will deactivate <span className="text-foreground">{adminProp?.name}</span> and cannot be undone from the UI.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmDelete(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm text-white hover:bg-red-700 disabled:opacity-60">
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : !adminProp ? (
        <p className="py-12 text-center text-muted-foreground">Property not found.</p>
      ) : (
        <div className="flex flex-col gap-6 max-w-3xl">
          {/* Property info */}
          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-foreground text-2xl font-semibold mb-1">{adminProp.name}</h2>
                <p className="text-sm text-muted-foreground">{adminProp.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs ${
                  adminProp.active
                    ? "border-green-200 bg-green-100 text-green-800"
                    : "border-red-200 bg-red-100 text-red-800"
                }`}>
                  {adminProp.active ? "Active" : "Inactive"}
                </span>
                <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => setShowConfirmDelete(true)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-red-200 hover:text-red-700">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
              <div className="flex flex-col bg-primary/5 rounded-xl p-4 border border-primary/20">
                <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Property Rent</span>
                <span className="text-2xl font-bold text-primary">${adminProp.totalMonthlyRent?.toLocaleString() ?? 0}</span>
                <span className="text-xs text-muted-foreground mt-1">Sum of {adminProp.units?.length || 0} units</span>
              </div>
              <div className="flex flex-col md:col-span-2 justify-center">
                <div className="flex flex-col gap-3">
                  {adminProp.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {adminProp.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Units */}
          {adminProp.units && adminProp.units.length > 0 && (
            <div className="rounded-2xl border border-border bg-card/40">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-foreground">Property Units</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
                {adminProp.units.map(unit => (
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

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users, label: "Residents", value: adminProp.residentCount, color: "bg-primary/15 text-primary" },
              { icon: Wrench, label: "Total Requests", value: adminProp.totalRequests, color: "bg-orange-100 text-orange-700" },
              { icon: CheckCircle2, label: "Owner", value: adminProp.ownerName, color: "bg-green-100 text-green-700" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card/40 p-4 text-center">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}><Icon size={18} /></span>
                <p className="text-sm text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Assigned owner */}
          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <h3 className="mb-3 text-foreground">Assigned Owner</h3>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-foreground">{adminProp.ownerName}</p>
              <a href={`mailto:${adminProp.ownerEmail}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                <Mail size={14} /> {adminProp.ownerEmail}
              </a>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
              <select
                value={reassignOwnerId}
                onFocus={openReassign}
                onChange={(e) => setReassignOwnerId(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-input px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">— Reassign to owner —</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>{o.fullName}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleReassignOwner}
                disabled={!reassignOwnerId || reassigning}
                className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary disabled:opacity-50"
              >
                {reassigning ? "Reassigning…" : "Reassign"}
              </button>
            </div>
          </div>

          {/* Residents */}
          {ownerProp && ownerProp.residents.length > 0 && (
            <div className="rounded-2xl border border-border bg-card/40 p-5">
              <h3 className="mb-4 text-foreground">Residents ({ownerProp.residents.length})</h3>
              <div className="flex flex-col divide-y divide-border">
                {ownerProp.residents.map((r) => (
                  <div key={r.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs text-secondary-foreground">
                        {r.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                      <div>
                        <p className="text-sm text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground">Unit {r.unit}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 pl-11 sm:pl-0">
                      <a href={`mailto:${r.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
                        <Mail size={13} /> {r.email}
                      </a>
                      <a href={`tel:${r.phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
                        <Phone size={13} /> {r.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
