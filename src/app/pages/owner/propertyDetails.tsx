// ============================================================================
// PropertyDetailsPage — full detail view of a single property.
// Shows property info, resident list, and recent maintenance requests.
// ============================================================================

// Imports
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Mail, Phone, CheckCircle2, Wrench, AlertTriangle, Pencil, X, UserPlus, Trash2 } from "lucide-react";
import { OwnerLayout } from "../../layouts/ownerLayout";
import { StatusBadge, PriorityBadge } from "../../components/dashboard/badges";
import { SecondaryButton, PrimaryButton } from "../../components/auth/buttons";
import { LoadingState } from "../../components/shared/loadingState";
import { getPropertyById, getOwnerRequests } from "../../services/ownerService";
import { api } from "../../lib/apiClient";
import { OWNER_ROUTES } from "../../constants/owner";
import { categoryLabel } from "../../constants/resident";
import type { Property, OwnerRequest } from "../../constants/owner";

interface ResidentOption { id: number; fullName: string; email: string; }

// Small stat tile reused in the stats row.
function StatTile({ icon: Icon, label, value, color }: {
  icon: typeof Wrench; label: string; value: string | number; color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon size={18} />
      </span>
      <div>
        <p className="text-lg text-slate-100">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

// Component
export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [requests, setRequests] = useState<OwnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editUnits, setEditUnits] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [residents, setResidents] = useState<ResidentOption[]>([]);
  const [assignResidentId, setAssignResidentId] = useState("");
  const [assignUnit, setAssignUnit] = useState("");
  const [assigning, setAssigning] = useState(false);

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

  const openEdit = () => {
    if (!property) return;
    setEditName(property.name);
    setEditAddress(property.address);
    setEditUnits(1);
    setShowEdit(true);
  };

  const handleSaveEdit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await api.put(`/api/properties/${id}`, { name: editName, address: editAddress, unitCount: editUnits });
    await loadData();
    setShowEdit(false);
    setSaving(false);
  }, [id, editName, editAddress, editUnits, loadData]);

  const openAssign = useCallback(async () => {
    const data = await api.get<ResidentOption[]>("/api/users/residents");
    setResidents(data);
    setAssignResidentId("");
    setAssignUnit("");
    setShowAssign(true);
  }, []);

  const handleAssign = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignResidentId) return;
    setAssigning(true);
    await api.post(`/api/properties/${id}/residents`, { residentId: Number(assignResidentId), unitNumber: assignUnit || null });
    await loadData();
    setShowAssign(false);
    setAssigning(false);
  }, [id, assignResidentId, assignUnit, loadData]);

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
        <p className="py-12 text-center text-slate-500">Property not found.</p>
      ) : (
        <div className="flex flex-col gap-6">
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
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-slate-400">Number of Units</label>
                    <input type="number" min={1} value={editUnits} onChange={(e) => setEditUnits(Number(e.target.value))}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-100 focus:border-blue-500 focus:outline-none" />
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

          {/* Property header */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-slate-100">{property.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{property.address}</p>
              </div>
              <button onClick={openEdit} className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:border-blue-500/40 hover:text-blue-300">
                <Pencil size={13} /> Edit
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatTile icon={Wrench} label="Open Requests" value={property.stats.openRequests} color="bg-orange-500/15 text-orange-400" />
            <StatTile icon={CheckCircle2} label="Completed" value={property.stats.completedRequests} color="bg-green-500/15 text-green-400" />
            <StatTile icon={AlertTriangle} label="Critical" value={property.stats.criticalRequests} color="bg-red-500/15 text-red-400" />
          </div>

          {/* Assign Resident Modal */}
          {showAssign && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-slate-100">Assign Resident</h2>
                  <button onClick={() => setShowAssign(false)} className="text-slate-500 hover:text-slate-200"><X size={20} /></button>
                </div>
                <form onSubmit={handleAssign} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-slate-400">Resident *</label>
                    <select required value={assignResidentId} onChange={(e) => setAssignResidentId(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-100 focus:border-blue-500 focus:outline-none">
                      <option value="">— Select resident —</option>
                      {residents.map((r) => (
                        <option key={r.id} value={r.id}>{r.fullName} ({r.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-slate-400">Unit Number (optional)</label>
                    <input value={assignUnit} onChange={(e) => setAssignUnit(e.target.value)} placeholder="e.g. 12B"
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div className="mt-2 flex gap-3">
                    <button type="button" onClick={() => setShowAssign(false)}
                      className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
                    <PrimaryButton type="submit" loading={assigning} fullWidth={false} className="flex-1">Assign</PrimaryButton>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Residents */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-slate-200">Residents ({property.residents.length})</h3>
              <button onClick={openAssign} className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:border-blue-500/40 hover:text-blue-300">
                <UserPlus size={13} /> Assign Resident
              </button>
            </div>
            <div className="flex flex-col divide-y divide-slate-800">
              {property.residents.length === 0 && (
                <p className="py-4 text-sm text-slate-500">No residents assigned yet.</p>
              )}
              {property.residents.map((r) => (
                <div key={r.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-xs text-slate-300">
                      {r.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                    <div>
                      <p className="text-sm text-slate-200">{r.name}</p>
                      <p className="text-xs text-slate-500">{r.unit ? `Unit ${r.unit}` : "No unit assigned"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 pl-12 sm:pl-0">
                    <a href={`mailto:${r.email}`} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-300">
                      <Mail size={13} /> {r.email}
                    </a>
                    <button onClick={() => handleRemoveResident(r.id)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400">
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent requests */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40">
            <div className="border-b border-slate-800 px-5 py-4">
              <h3 className="text-slate-200">Maintenance Requests</h3>
            </div>
            {requests.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500">No requests for this property.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {requests.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => navigate(`${OWNER_ROUTES.requestManage}/${r.id}`)}
                      className="cursor-pointer transition-colors hover:bg-slate-800/50"
                    >
                      <td className="px-5 py-3 text-slate-400">{r.id}</td>
                      <td className="px-5 py-3 text-slate-200">{r.title}</td>
                      <td className="px-5 py-3 text-slate-400">{categoryLabel(r.category)}</td>
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
