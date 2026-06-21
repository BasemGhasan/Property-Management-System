// ============================================================================
// OwnerReportsPage — simple maintenance summary for property owners.
// No charts or complex visualisations — stat cards + summary table only.
// ============================================================================

// Imports
import { useEffect, useMemo, useState } from "react";
import { Layers, Clock, CheckCircle2, XCircle } from "lucide-react";
import { OwnerLayout } from "../../layouts/ownerLayout";
import { DashboardCard } from "../../components/dashboard/dashboardCard";
import { StatusBadge } from "../../components/dashboard/badges";
import { LoadingState } from "../../components/shared/loadingState";
import { EmptyState } from "../../components/shared/emptyState";
import { getOwnerRequests, getProperties } from "../../services/ownerService";
import type { OwnerRequest, Property } from "../../constants/owner";

// Component
export default function OwnerReportsPage() {
  const [requests, setRequests] = useState<OwnerRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getOwnerRequests(), getProperties()]).then(([r, p]) => {
      if (!active) return;
      setRequests(r);
      setProperties(p);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  // Overall counts
  const totals = useMemo(() => ({
    all:       requests.length,
    open:      requests.filter((r) => r.status === "pending" || r.status === "in-progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
    rejected:  requests.filter((r) => r.status === "rejected").length,
  }), [requests]);

  // Per-property breakdown
  const propertyBreakdown = useMemo(() =>
    properties.map((p) => {
      const mine = requests.filter((r) => r.propertyId === p.id);
      return {
        id: p.id,
        name: p.name,
        total:     mine.length,
        open:      mine.filter((r) => r.status === "pending" || r.status === "in-progress").length,
        completed: mine.filter((r) => r.status === "completed").length,
        rejected:  mine.filter((r) => r.status === "rejected").length,
      };
    }),
  [requests, properties]);

  // Most recent 5 completed requests
  const recentCompleted = useMemo(() =>
    requests.filter((r) => r.status === "completed").slice(0, 5),
  [requests]);

  if (loading) return <OwnerLayout title="Reports"><LoadingState /></OwnerLayout>;

  return (
    <OwnerLayout title="Reports">
      <div className="flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DashboardCard label="Total Requests" value={totals.all}       icon={Layers}       accent="blue"   />
          <DashboardCard label="Open"            value={totals.open}      icon={Clock}        accent="orange" />
          <DashboardCard label="Completed"       value={totals.completed} icon={CheckCircle2} accent="green"  />
          <DashboardCard label="Rejected"        value={totals.rejected}  icon={XCircle}      accent="slate"  />
        </div>

        {/* Per-property breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-slate-800/40">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-slate-200">Requests by Property</h2>
          </div>
          {propertyBreakdown.length === 0 ? (
            <EmptyState message="No properties found." />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3">Property</th>
                  <th className="px-5 py-3 text-center">Total</th>
                  <th className="px-5 py-3 text-center">Open</th>
                  <th className="px-5 py-3 text-center">Completed</th>
                  <th className="px-5 py-3 text-center">Rejected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {propertyBreakdown.map((row) => (
                  <tr key={row.id} className="bg-slate-900/20">
                    <td className="px-5 py-3 text-slate-200">{row.name}</td>
                    <td className="px-5 py-3 text-center text-slate-300">{row.total}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={row.open > 0 ? "text-orange-300" : "text-slate-500"}>
                        {row.open}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={row.completed > 0 ? "text-green-300" : "text-slate-500"}>
                        {row.completed}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={row.rejected > 0 ? "text-red-300" : "text-slate-500"}>
                        {row.rejected}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent completed requests */}
        <div className="rounded-2xl border border-slate-800 bg-slate-800/40">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-slate-200">Recently Completed</h2>
          </div>
          {recentCompleted.length === 0 ? (
            <EmptyState message="No completed requests yet." />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Property</th>
                  <th className="px-5 py-3">Resident</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentCompleted.map((r) => (
                  <tr key={r.id} className="bg-slate-900/20">
                    <td className="px-5 py-3 text-xs text-slate-500">{r.id}</td>
                    <td className="px-5 py-3 text-slate-200">{r.title}</td>
                    <td className="px-5 py-3 text-slate-400">{r.propertyName}</td>
                    <td className="px-5 py-3 text-slate-400">{r.residentName}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </OwnerLayout>
  );
}
