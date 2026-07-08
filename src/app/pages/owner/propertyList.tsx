// ============================================================================
// PropertyListPage — grid of all owned properties with search.
// ============================================================================

// Imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Building2, Users, Wrench, AlertTriangle, ArrowRight, Plus, X } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { toast } from "sonner";
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
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [units, setUnits] = useState<any[]>([{ unitIdentifier: "Unit 1", bedrooms: 1, bathrooms: 1, monthlyRent: 0 }]);
  const [saving, setSaving] = useState(false);

  const COMMON_AMENITIES = ["Gym", "Pool", "24/7 Security", "Parking", "Balcony", "Elevator"];

  const refreshProperties = useCallback(() =>
    getProperties().then(setProperties), []);

  useEffect(() => {
    setUnits((prevUnits) => {
      if (unitCount === prevUnits.length) return prevUnits;
      if (unitCount > prevUnits.length) {
        const diff = unitCount - prevUnits.length;
        const newUnits = Array.from({ length: diff }, (_, i) => ({
          unitIdentifier: `Unit ${prevUnits.length + i + 1}`,
          bedrooms: 1,
          bathrooms: 1,
          monthlyRent: 0,
        }));
        return [...prevUnits, ...newUnits];
      }
      return prevUnits.slice(0, unitCount);
    });
  }, [unitCount]);

  const handleAdd = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    // Validate units
    const invalidUnits = units.filter(u => !u.unitIdentifier || !u.monthlyRent || u.monthlyRent <= 0);
    if (invalidUnits.length > 0) {
      toast.error("Please fill out all required details (Rent > 0, valid Identifier) for every unit.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/properties", { name, address, unitCount, description, amenities, units });
      await refreshProperties();
      setShowModal(false);
      setName(""); setAddress(""); setUnitCount(1); setDescription(""); setAmenities([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create property.");
    } finally {
      setSaving(false);
    }
  }, [name, address, unitCount, description, amenities, units, refreshProperties]);

  const updateUnit = (index: number, field: string, value: any) => {
    const newUnits = [...units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setUnits(newUnits);
  };
  const toggleAmenity = (amenity: string) => setAmenities(prev => prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]);
  const totalRent = useMemo(() => units.reduce((sum, u) => sum + (Number(u.monthlyRent) || 0), 0), [units]);

  useEffect(() => {
    let active = true;
    refreshProperties().then(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshProperties]);

  const filtered = useMemo(
    () => properties.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase())
    ),
    [properties, search]
  );

  return (
    <OwnerLayout title="Properties" onRefresh={refreshProperties}>
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
                        <label className="text-sm text-muted-foreground">Total Units *</label>
                        <input type="number" min={1} required value={unitCount} onChange={(e) => setUnitCount(Number(e.target.value))}
                          className="rounded-xl border border-border bg-input px-4 py-2.5 text-foreground focus:border-primary focus:outline-none" />
                        <p className="text-xs text-muted-foreground mt-1">This defines the exact number of unit configurations required in the next tab.</p>
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
                      </div>

                      <div className="flex flex-col gap-3">
                        {units.map((unit, idx) => (
                          <div key={idx} className="flex gap-3 items-start bg-card/50 p-3 rounded-xl border border-border relative group">
                            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Identifier *</label>
                                <input
                                  required
                                  value={unit.unitIdentifier || ""}
                                  onChange={(e) => updateUnit(idx, "unitIdentifier", e.target.value)}
                                  placeholder="e.g. Apt 101"
                                  className="w-full rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Beds *</label>
                                <input
                                  type="number"
                                  min={0}
                                  required
                                  value={unit.bedrooms ?? 0}
                                  onChange={(e) => updateUnit(idx, "bedrooms", Number(e.target.value))}
                                  className="w-full rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Baths *</label>
                                <input
                                  type="number"
                                  min={0}
                                  required
                                  value={unit.bathrooms ?? 0}
                                  onChange={(e) => updateUnit(idx, "bathrooms", Number(e.target.value))}
                                  className="w-full rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Rent ($) *</label>
                                <input
                                  type="number"
                                  min={0.01}
                                  step={0.01}
                                  required
                                  value={unit.monthlyRent || ""}
                                  onChange={(e) => updateUnit(idx, "monthlyRent", Number(e.target.value))}
                                  className="w-full rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                                />
                              </div>
                            </div>
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
