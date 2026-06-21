// ============================================================================
// PropertyListPage — grid of all owned properties with search.
// ============================================================================

// Imports
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Building2, Users, Wrench, AlertTriangle, ArrowRight } from "lucide-react";
import { OwnerLayout } from "../../layouts/ownerLayout";
import { LoadingState } from "../../components/shared/loadingState";
import { getProperties } from "../../services/ownerService";
import { OWNER_ROUTES } from "../../constants/owner";
import type { Property } from "../../constants/owner";

// PropertyCard — inline since it's specific to this page layout.
function PropertyCard({ property, onView }: { property: Property; onView: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
          <Building2 size={20} />
        </span>
        <div>
          <p className="text-slate-100">{property.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">{property.address}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-center">
        <div>
          <p className="flex items-center justify-center gap-1 text-slate-200">
            <Users size={13} className="text-slate-500" /> {property.residents.length}
          </p>
          <p className="text-xs text-slate-500">Residents</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 text-orange-300">
            <Wrench size={13} className="text-slate-500" /> {property.stats.openRequests}
          </p>
          <p className="text-xs text-slate-500">Open</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 text-red-300">
            <AlertTriangle size={13} className="text-slate-500" /> {property.stats.criticalRequests}
          </p>
          <p className="text-xs text-slate-500">Critical</p>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={onView}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-2.5 text-sm text-slate-300 transition-colors hover:border-blue-500/40 hover:text-blue-300"
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

  useEffect(() => {
    let active = true;
    getProperties().then((data) => {
      if (!active) return;
      setProperties(data);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

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
        {/* Search */}
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 py-3 pl-11 pr-4 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

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
              <p className="col-span-full py-12 text-center text-slate-500">No properties found.</p>
            )}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
