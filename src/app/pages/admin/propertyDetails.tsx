// ============================================================================
// AdminPropertyDetailsPage — full detail view of a single property for admin.
// Shows property info, assigned owner, residents list, and request summary.
// ============================================================================

// Imports
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Mail, Phone, Users, Wrench, CheckCircle2, Pencil, Trash2, X } from "lucide-react";
import { AdminLayout } from "../../layouts/adminLayout";
import { SecondaryButton, PrimaryButton } from "../../components/auth/buttons";
import { LoadingState } from "../../components/shared/loadingState";
import { getAdminPropertyById, getAdminUsers } from "../../services/adminService";
import { getPropertyById } from "../../services/ownerService";
import { api } from "../../lib/apiClient";
import { ADMIN_ROUTES } from "../../constants/admin";
import type { AdminProperty, AdminUser } from "../../constants/admin";
import type { Property } from "../../constants/owner";

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
  const [editName, setEditName]     = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editUnits, setEditUnits]   = useState(1);
  const [editOwnerId, setEditOwnerId] = useState("");
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);

  const loadData = useCallback(() =>
    Promise.all([getAdminPropertyById(id ?? ""), getPropertyById(id ?? "")])
      .then(([ap, op]) => { setAdminProp(ap ?? null); setOwnerProp(op ?? null); }), [id]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([loadData(), getAdminUsers().then((u) => setOwners(u.filter((x) => x.role === "owner")))])
      .then(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadData]);

  const openEdit = () => {
    if (!adminProp) return;
    setEditName(adminProp.name);
    setEditAddress(adminProp.address);
    setEditUnits(1);
    const matchedOwner = owners.find((o) => o.fullName === adminProp.ownerName);
    setEditOwnerId(matchedOwner?.id ?? "");
    setShowEdit(true);
  };

  const handleSaveEdit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await api.put(`/api/properties/${id}`, {
      name: editName,
      address: editAddress,
      unitCount: editUnits,
      ...(editOwnerId ? { ownerId: Number(editOwnerId) } : {}),
    });
    await loadData();
    setShowEdit(false);
    setSaving(false);
  }, [id, editName, editAddress, editUnits, editOwnerId, loadData]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    await api.delete(`/api/properties/${id}`);
    navigate(ADMIN_ROUTES.properties);
  }, [id, navigate]);

  return (
    <AdminLayout title="Property Details">
      <SecondaryButton fullWidth={false} onClick={() => navigate(ADMIN_ROUTES.properties)} className="mb-5">
        <ArrowLeft size={16} /> Back to Properties
      </SecondaryButton>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-slate-100">Edit Property</h2>
              <button onClick={() => setShowEdit(false)} className="text-slate-500 hover:text-slate-200"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-slate-400">Property Name *</label>
                <input required value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-100 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-slate-400">Address *</label>
                <input required value={editAddress} onChange={(e) => setEditAddress(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-100 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-slate-400">Number of Units</label>
                  <input type="number" min={1} value={editUnits} onChange={(e) => setEditUnits(Number(e.target.value))}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-100 focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-slate-400">Assigned Owner</label>
                  <select value={editOwnerId} onChange={(e) => setEditOwnerId(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-100 focus:border-blue-500 focus:outline-none">
                    <option value="">— Keep current —</option>
                    {owners.map((o) => (
                      <option key={o.id} value={o.id}>{o.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-2 flex gap-3">
                <button type="button" onClick={() => setShowEdit(false)}
                  className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
                <PrimaryButton type="submit" loading={saving} fullWidth={false} className="flex-1">Save Changes</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-2 text-slate-100">Delete Property?</h2>
            <p className="mb-6 text-sm text-slate-400">This will deactivate <span className="text-slate-200">{adminProp?.name}</span> and cannot be undone from the UI.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmDelete(false)}
                className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
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
        <p className="py-12 text-center text-slate-500">Property not found.</p>
      ) : (
        <div className="flex flex-col gap-6 max-w-3xl">
          {/* Property info */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-slate-100">{adminProp.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{adminProp.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs ${
                  adminProp.active
                    ? "border-green-500/30 bg-green-500/10 text-green-300"
                    : "border-red-500/30 bg-red-500/10 text-red-300"
                }`}>
                  {adminProp.active ? "Active" : "Inactive"}
                </span>
                <button onClick={openEdit} className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:border-blue-500/40 hover:text-blue-300">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => setShowConfirmDelete(true)} className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-400">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users, label: "Residents", value: adminProp.residentCount, color: "bg-blue-500/15 text-blue-400" },
              { icon: Wrench, label: "Total Requests", value: adminProp.totalRequests, color: "bg-orange-500/15 text-orange-400" },
              { icon: CheckCircle2, label: "Owner", value: adminProp.ownerName, color: "bg-green-500/15 text-green-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800/40 p-4 text-center">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}><Icon size={18} /></span>
                <p className="text-sm text-slate-100">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Assigned owner */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
            <h3 className="mb-3 text-slate-200">Assigned Owner</h3>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-200">{adminProp.ownerName}</p>
              <a href={`mailto:${adminProp.ownerEmail}`} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-300">
                <Mail size={14} /> {adminProp.ownerEmail}
              </a>
            </div>
          </div>

          {/* Residents */}
          {ownerProp && ownerProp.residents.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
              <h3 className="mb-4 text-slate-200">Residents ({ownerProp.residents.length})</h3>
              <div className="flex flex-col divide-y divide-slate-800">
                {ownerProp.residents.map((r) => (
                  <div key={r.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs text-slate-300">
                        {r.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                      <div>
                        <p className="text-sm text-slate-200">{r.name}</p>
                        <p className="text-xs text-slate-500">Unit {r.unit}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 pl-11 sm:pl-0">
                      <a href={`mailto:${r.email}`} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-300">
                        <Mail size={13} /> {r.email}
                      </a>
                      <a href={`tel:${r.phone}`} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-300">
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
