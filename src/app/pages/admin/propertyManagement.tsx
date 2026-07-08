// ============================================================================
// PropertyManagementPage — admin view of all properties with activate /
// deactivate actions and an inline detail panel on row click.
// ============================================================================

// Imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Eye, ToggleLeft, ToggleRight, Plus, X, Trash2 } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { toast } from "sonner";
import { AdminLayout } from "../../layouts/adminLayout";
import { LoadingState } from "../../components/shared/loadingState";
import { StatusPill } from "../../components/shared/statusPill";
import { PrimaryButton } from "../../components/auth/buttons";
import { Pagination } from "../../components/shared/pagination";
import { usePagination } from "../../hooks/usePagination";
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
  const [ownerId, setOwnerId]       = useState<string>("");
  const [description, setDescription] = useState("");
  const [amenities, setAmenities]   = useState<string[]>([]);
  const [units, setUnits]           = useState<any[]>([{ unitIdentifier: "Unit 1", bedrooms: 1, bathrooms: 1, monthlyRent: 0 }]);
  const [saving, setSaving]         = useState(false);

  const COMMON_AMENITIES = ["Gym", "Pool", "24/7 Security", "Parking", "Balcony", "Elevator"];

  const refreshProperties = useCallback(() =>
    getAdminProperties().then(setProperties), []);

  const loadData = useCallback(() =>
    Promise.all([getAdminProperties(), getAdminUsers()])
      .then(([props, users]) => {
        setProperties(props);
        setOwners(users.filter((u) => u.role === "owner"));
      }), []);

  useEffect(() => {
    let active = true;
    loadData().then(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadData]);

  const handleAdd = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;
    if (units.length === 0) {
      toast.error("You must add at least one unit.");
      return;
    }
    setSaving(true);
    await api.post("/api/properties", {
      name,
      address,
      description,
      amenities,
      units,
      ...(ownerId ? { ownerId: Number(ownerId) } : {}),
    });
    await refreshProperties();
    setShowModal(false);
    setName(""); setAddress(""); setDescription(""); setAmenities([]); setOwnerId("");
    setUnits([{ unitIdentifier: "Unit 1", bedrooms: 1, bathrooms: 1, monthlyRent: 0 }]);
    setSaving(false);
  }, [name, address, description, amenities, units, ownerId, refreshProperties]);

  const addUnit = () => setUnits([...units, { unitIdentifier: `Unit ${units.length + 1}`, bedrooms: 1, bathrooms: 1, monthlyRent: 0 }]);
  const removeUnit = (index: number) => setUnits(units.filter((_, i) => i !== index));
  const updateUnit = (index: number, field: string, value: any) => {
    const newUnits = [...units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setUnits(newUnits);
  };
  const toggleAmenity = (amenity: string) => setAmenities(prev => prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]);
  const totalRent = useMemo(() => units.reduce((sum, u) => sum + (Number(u.monthlyRent) || 0), 0), [units]);

  const filtered = useMemo(() => {
    return properties.filter((p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [properties, search]);

  const { page, setPage, pageSize, setPageSize, totalPages, pageItems, resetPage, total } = usePagination(filtered);

  const handleToggle = useCallback(async (id: string) => {
    await togglePropertyStatus(id);
    setProperties((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p));
  }, []);

  return (
    <AdminLayout title="Property Management" onRefresh={loadData}>
      <div className="flex flex-col gap-5">
        {/* Search + Add */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              placeholder="Search by property name, owner or ID..."
              className="w-full rounded-xl border border-border bg-background/60 py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <PrimaryButton type="button" fullWidth={false} onClick={() => setShowModal(true)}>
            <Plus size={17} /> Add Property
          </PrimaryButton>
        </div>

        {/* Add Property Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-border bg-popover shadow-lg flex flex-col max-h-[90vh]">
              <div className="mb-2 flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
                <h2 className="text-foreground">Add Property</h2>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"><X size={20} /></button>
              </div>

              <form onSubmit={handleAdd} className="flex flex-col flex-1 overflow-hidden">
                <Tabs.Root defaultValue="basic" className="flex flex-col flex-1 overflow-hidden">
                  <Tabs.List className="px-6 pt-2 flex gap-4 border-b border-border shrink-0">
                    <Tabs.Trigger value="basic" className="pb-2 text-sm text-muted-foreground hover:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">
                      Basic Info & Specs
                    </Tabs.Trigger>
                    <Tabs.Trigger value="units" className="pb-2 text-sm text-muted-foreground hover:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">
                      Unit Configuration
                    </Tabs.Trigger>
                  </Tabs.List>

                  <div className="overflow-y-auto px-6 py-5 flex-1">
                    <Tabs.Content value="basic" className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-muted-foreground">Property Name *</label>
                        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maple Court Residences"
                          className="rounded-xl border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-muted-foreground">Address *</label>
                        <input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 12 Maple Street, Springfield"
                          className="rounded-xl border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-muted-foreground">Assign Owner</label>
                        <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}
                          className="rounded-xl border border-border bg-input px-4 py-2.5 text-foreground focus:border-primary focus:outline-none">
                          <option value="">— Self (Admin) —</option>
                          {owners.map((o) => (
                            <option key={o.id} value={o.id}>{o.fullName}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-muted-foreground">Description</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          maxLength={1000}
                          rows={3}
                          className="rounded-xl border border-border bg-input px-4 py-2.5 text-foreground focus:border-primary focus:outline-none resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-muted-foreground">Amenities</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {COMMON_AMENITIES.map((amenity) => (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => toggleAmenity(amenity)}
                              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                amenities.includes(amenity)
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground"
                              }`}
                            >
                              {amenity}
                            </button>
                          ))}
                        </div>
                      </div>
                    </Tabs.Content>

                    <Tabs.Content value="units" className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-foreground">Configured Units ({units.length})</h3>
                        <button type="button" onClick={addUnit} className="text-xs flex items-center gap-1 text-primary hover:text-primary/80">
                          <Plus size={14} /> Add a Unit
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        {units.map((unit, idx) => (
                          <div key={idx} className="flex gap-3 items-start bg-card/50 p-3 rounded-xl border border-border relative group">
                            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Identifier</label>
                                <input
                                  required
                                  value={unit.unitIdentifier || ""}
                                  onChange={(e) => updateUnit(idx, "unitIdentifier", e.target.value)}
                                  placeholder="e.g. Apt 101"
                                  className="w-full rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Beds</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={unit.bedrooms ?? 0}
                                  onChange={(e) => updateUnit(idx, "bedrooms", Number(e.target.value))}
                                  className="w-full rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Baths</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={unit.bathrooms ?? 0}
                                  onChange={(e) => updateUnit(idx, "bathrooms", Number(e.target.value))}
                                  className="w-full rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Rent ($)</label>
                                <input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  required
                                  value={unit.monthlyRent ?? 0}
                                  onChange={(e) => updateUnit(idx, "monthlyRent", Number(e.target.value))}
                                  className="w-full rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                                />
                              </div>
                            </div>
                            {units.length > 1 && (
                              <button type="button" onClick={() => removeUnit(idx)} className="mt-5 text-muted-foreground hover:text-critical p-1">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground">Total Expected Property Rent:</span>
                        <span className="text-lg font-bold text-primary">${totalRent.toLocaleString()}</span>
                      </div>
                    </Tabs.Content>
                  </div>
                </Tabs.Root>

                <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0 bg-popover">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
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
          <>
          <div className="overflow-hidden rounded-2xl border border-border">
            {/* Desktop */}
            <div className="hidden md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
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
                <tbody className="divide-y divide-border">
                  {pageItems.map((p) => (
                    <tr key={p.id} className="bg-background/20 transition-colors hover:bg-accent">
                      <td className="px-5 py-3 text-xs text-muted-foreground">{p.id}</td>
                      <td className="px-5 py-3 text-foreground">{p.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{p.ownerName}</td>
                      <td className="px-5 py-3 text-muted-foreground">{p.residentCount}</td>
                      <td className="px-5 py-3 text-muted-foreground">{p.totalRequests}</td>
                      <td className="px-5 py-3"><StatusPill active={p.active} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`${ADMIN_ROUTES.properties}/${p.id}`)}
                            title="View details"
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleToggle(p.id)}
                            title={p.active ? "Deactivate" : "Activate"}
                            className={`rounded-lg p-1.5 transition-colors ${
                              p.active
                                ? "text-muted-foreground hover:bg-red-100 hover:text-red-700"
                                : "text-muted-foreground hover:bg-green-100 hover:text-green-700"
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
            <div className="flex flex-col divide-y divide-border md:hidden">
              {pageItems.map((p) => (
                <div key={p.id} className="flex items-start justify-between gap-3 px-4 py-4">
                  <div>
                    <p className="text-sm text-foreground">{p.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.ownerName} · {p.residentCount} residents</p>
                    <div className="mt-2"><StatusPill active={p.active} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`${ADMIN_ROUTES.properties}/${p.id}`)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"><Eye size={16} /></button>
                    <button onClick={() => handleToggle(p.id)} className={`rounded-lg p-1.5 ${p.active ? "text-red-700" : "text-green-700"}`}>
                      {p.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="p-12 text-center text-muted-foreground">No properties found.</p>
            )}
          </div>

          {filtered.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
