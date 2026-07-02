// ============================================================================
// PropertyListPage — grid of all owned properties with search.
// ============================================================================

// Imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Building2, Users, Wrench, AlertTriangle, ArrowRight, Plus, X } from "lucide-react";
import { OwnerLayout } from "../../layouts/ownerLayout";
import { LoadingState } from "../../components/shared/loadingState";
import { PrimaryButton } from "../../components/auth/buttons";
import { getProperties } from "../../services/ownerService";
import { api } from "../../lib/apiClient";
import { OWNER_ROUTES } from "../../constants/owner";
import type { Property } from "../../constants/owner";

// PropertyCard — inline since it's specific to this page layout.
function PropertyCard({ property, onView }: { property: Property; onView: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card/40 p-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Building2 size={20} />
        </span>
        <div>
          <p className="text-foreground">{property.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{property.address}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-background/40 p-3 text-center">
        <div>
          <p className="flex items-center justify-center gap-1 text-foreground">
            <Users size={13} className="text-muted-foreground" /> {property.residents.length}
          </p>
          <p className="text-xs text-muted-foreground">Residents</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 text-orange-800">
            <Wrench size={13} className="text-muted-foreground" /> {property.stats.openRequests}
          </p>
          <p className="text-xs text-muted-foreground">Open</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 text-red-800">
            <AlertTriangle size={13} className="text-muted-foreground" /> {property.stats.criticalRequests}
          </p>
          <p className="text-xs text-muted-foreground">Critical</p>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={onView}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm text-secondary-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        View Details <ArrowRight size={15} />
      </button>
    </div>
  );
}

// Component
export default function PropertyListPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [unitCount, setUnitCount] = useState(1);
  const [saving, setSaving] = useState(false);

  const refreshProperties = useCallback(() =>
    getProperties().then(setProperties), []);

  const handleAdd = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;
    setSaving(true);
    await api.post("/api/properties", { name, address, unitCount });
    await refreshProperties();
    setShowModal(false);
    setName(""); setAddress(""); setUnitCount(1);
    setSaving(false);
  }, [name, address, unitCount, refreshProperties]);

  useEffect(() => {
    let active = true;
    getProperties().then((data) => {
      if (!active) return;
      setProperties(data);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);  // eslint-disable-line

  const filtered = useMemo(
    () => properties.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase())
    ),
    [properties, search]
  );

  return (
    <OwnerLayout title="Properties">
      <div className="flex flex-col gap-5">
        {/* Search + Add */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search properties..."
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
            <div className="w-full max-w-md rounded-2xl border border-border bg-popover p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-foreground">Add Property</h2>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd} className="flex flex-col gap-4">
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
                  <label className="text-sm text-muted-foreground">Number of Units</label>
                  <input type="number" min={1} value={unitCount} onChange={(e) => setUnitCount(Number(e.target.value))}
                    className="rounded-xl border border-border bg-input px-4 py-2.5 text-foreground focus:border-primary focus:outline-none" />
                </div>
                <div className="mt-2 flex gap-3">
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


        {loading ? (
          <LoadingState />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                onView={() => navigate(`${OWNER_ROUTES.propertyDetails}/${p.id}`)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-12 text-center text-muted-foreground">No properties found.</p>
            )}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
