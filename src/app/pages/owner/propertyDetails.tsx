// ============================================================================
// PropertyDetailsPage — full detail view of a single property.
// Shows property info, resident list, and recent maintenance requests.
// ============================================================================

// Imports
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Mail, Phone, CheckCircle2, Wrench, AlertTriangle } from "lucide-react";
import { OwnerLayout } from "../../layouts/ownerLayout";
import { StatusBadge, PriorityBadge } from "../../components/dashboard/badges";
import { SecondaryButton } from "../../components/auth/buttons";
import { LoadingState } from "../../components/shared/loadingState";
import { getPropertyById, getOwnerRequests } from "../../services/ownerService";
import { OWNER_ROUTES } from "../../constants/owner";
import { categoryLabel } from "../../constants/resident";
import type { Property, OwnerRequest } from "../../constants/owner";

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

  useEffect(() => {
    let active = true;
    Promise.all([getPropertyById(id ?? ""), getOwnerRequests()]).then(([p, r]) => {
      if (!active) return;
      setProperty(p ?? null);
      setRequests(r.filter((req) => req.propertyId === id));
      setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

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
          {/* Property header */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
            <h2 className="text-slate-100">{property.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{property.address}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatTile icon={Wrench} label="Open Requests" value={property.stats.openRequests} color="bg-orange-500/15 text-orange-400" />
            <StatTile icon={CheckCircle2} label="Completed" value={property.stats.completedRequests} color="bg-green-500/15 text-green-400" />
            <StatTile icon={AlertTriangle} label="Critical" value={property.stats.criticalRequests} color="bg-red-500/15 text-red-400" />
          </div>

          {/* Residents */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
            <h3 className="mb-4 text-slate-200">Residents ({property.residents.length})</h3>
            <div className="flex flex-col divide-y divide-slate-800">
              {property.residents.map((r) => (
                <div key={r.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-xs text-slate-300">
                      {r.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                    <div>
                      <p className="text-sm text-slate-200">{r.name}</p>
                      <p className="text-xs text-slate-500">Unit {r.unit}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 pl-12 sm:pl-0">
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
