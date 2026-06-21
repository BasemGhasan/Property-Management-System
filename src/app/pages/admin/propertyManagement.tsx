// ============================================================================
// PropertyManagementPage — admin view of all properties with activate /
// deactivate actions and an inline detail panel on row click.
// ============================================================================

// Imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminLayout } from "../../layouts/adminLayout";
import { LoadingState } from "../../components/shared/loadingState";
import { StatusPill } from "../../components/shared/statusPill";
import { getAdminProperties, togglePropertyStatus } from "../../services/adminService";
import { ADMIN_ROUTES } from "../../constants/admin";
import type { AdminProperty } from "../../constants/admin";

// Component
export default function PropertyManagementPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");

  useEffect(() => {
    let active = true;
    getAdminProperties().then((data) => { if (!active) return; setProperties(data); setLoading(false); });
    return () => { active = false; };
  }, []);

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
        {/* Search */}
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by property name, owner or ID..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 py-3 pl-11 pr-4 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

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
