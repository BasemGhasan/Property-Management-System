// ============================================================================
// PropertyManagementPage — admin view of all properties with activate /
// deactivate actions and an inline detail panel on row click.
// ============================================================================

// Imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Eye, ToggleLeft, ToggleRight, Plus, X } from "lucide-react";
import { AdminLayout } from "../../layouts/adminLayout";
import { LoadingState } from "../../components/shared/loadingState";
import { StatusPill } from "../../components/shared/statusPill";
import { PrimaryButton } from "../../components/auth/buttons";
import { getAdminProperties, togglePropertyStatus, getAdminUsers } from "../../services/adminService";
import { api } from "../../lib/apiClient";
import { ADMIN_ROUTES } from "../../constants/admin";
import type { AdminProperty, AdminUser } from "../../constants/admin";

// Component
export default function PropertyManagementPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [owners, setOwners]         = useState<AdminUser[]>([]);
  const [name, setName]             = useState("");
  const [address, setAddress]       = useState("");
  const [unitCount, setUnitCount]   = useState(1);
  const [ownerId, setOwnerId]       = useState<string>("");
  const [saving, setSaving]         = useState(false);

  const refreshProperties = useCallback(() =>
    getAdminProperties().then(setProperties), []);

  useEffect(() => {
    let active = true;
    Promise.all([getAdminProperties(), getAdminUsers()])
      .then(([props, users]) => {
        if (!active) return;
        setProperties(props);
        setOwners(users.filter((u) => u.role === "owner"));
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleAdd = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;
    setSaving(true);
    await api.post("/api/properties", {
      name,
      address,
      unitCount,
      ...(ownerId ? { ownerId: Number(ownerId) } : {}),
    });
    await refreshProperties();
    setShowModal(false);
    setName(""); setAddress(""); setUnitCount(1); setOwnerId("");
    setSaving(false);
  }, [name, address, unitCount, ownerId, refreshProperties]);

  const filtered = useMemo(() => {
    return properties.filter((p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [properties, search]);

  const handleToggle = useCallback(async (id: string) => {
    await togglePropertyStatus(id);
    setProperties((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p));
  }, []);

  return (
    <AdminLayout title="Property Management">
      <div className="flex flex-col gap-5">
        {/* Search + Add */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by property name, owner or ID..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 py-3 pl-11 pr-4 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          <PrimaryButton type="button" fullWidth={false} onClick={() => setShowModal(true)}>
            <Plus size={17} /> Add Property
          </PrimaryButton>
        </div>

        {/* Add Property Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-slate-100">Add Property</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-200"><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-slate-400">Property Name *</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maple Court Residences"
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-slate-400">Address *</label>
                  <input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 12 Maple Street, Springfield"
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-slate-400">Units</label>
                    <input type="number" min={1} value={unitCount} onChange={(e) => setUnitCount(Number(e.target.value))}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-100 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-slate-400">Assign Owner</label>
                    <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-100 focus:border-blue-500 focus:outline-none">
                      <option value="">— Self (Admin) —</option>
                      {owners.map((o) => (
                        <option key={o.id} value={o.id}>{o.fullName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-2 flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
                  <PrimaryButton type="submit" loading={saving} fullWidth={false} className="flex-1">
                    Create Property
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* Table */}
        {loading ? (
          <LoadingState />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            {/* Desktop */}
            <div className="hidden md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Property ID</th>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Owner</th>
                    <th className="px-5 py-3">Residents</th>
                    <th className="px-5 py-3">Requests</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.map((p) => (
                    <tr key={p.id} className="bg-slate-900/20 transition-colors hover:bg-slate-800/40">
                      <td className="px-5 py-3 text-xs text-slate-500">{p.id}</td>
                      <td className="px-5 py-3 text-slate-200">{p.name}</td>
                      <td className="px-5 py-3 text-slate-400">{p.ownerName}</td>
                      <td className="px-5 py-3 text-slate-400">{p.residentCount}</td>
                      <td className="px-5 py-3 text-slate-400">{p.totalRequests}</td>
                      <td className="px-5 py-3"><StatusPill active={p.active} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`${ADMIN_ROUTES.properties}/${p.id}`)}
                            title="View details"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleToggle(p.id)}
                            title={p.active ? "Deactivate" : "Activate"}
                            className={`rounded-lg p-1.5 transition-colors ${
                              p.active
                                ? "text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                                : "text-slate-400 hover:bg-green-500/10 hover:text-green-400"
                            }`}
                          >
                            {p.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col divide-y divide-slate-800 md:hidden">
              {filtered.map((p) => (
                <div key={p.id} className="flex items-start justify-between gap-3 px-4 py-4">
                  <div>
                    <p className="text-sm text-slate-200">{p.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{p.ownerName} · {p.residentCount} residents</p>
                    <div className="mt-2"><StatusPill active={p.active} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`${ADMIN_ROUTES.properties}/${p.id}`)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200"><Eye size={16} /></button>
                    <button onClick={() => handleToggle(p.id)} className={`rounded-lg p-1.5 ${p.active ? "text-red-400" : "text-green-400"}`}>
                      {p.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="p-12 text-center text-slate-500">No properties found.</p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
