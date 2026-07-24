// ============================================================================
// OwnerReportsPage — simple maintenance summary for property owners.
// No charts or complex visualisations — stat cards + summary table only.
// ============================================================================

// Imports
import { useCallback, useEffect, useMemo, useState } from "react";
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

  const loadData = useCallback(() =>
    Promise.all([getOwnerRequests(), getProperties()]).then(([r, p]) => {
      setRequests(r);
      setProperties(p);
    }), []);

  useEffect(() => {
    let active = true;
    loadData().then(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadData]);

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
    <OwnerLayout title="Reports" onRefresh={loadData}>
      <div className="flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DashboardCard label="Total Requests" value={totals.all}       icon={Layers}       accent="blue"   />
          <DashboardCard label="Open"            value={totals.open}      icon={Clock}        accent="orange" />
          <DashboardCard label="Completed"       value={totals.completed} icon={CheckCircle2} accent="green"  />
          <DashboardCard label="Rejected"        value={totals.rejected}  icon={XCircle}      accent="slate"  />
        </div>

        {/* Per-property breakdown */}
        <div className="rounded-2xl border border-border bg-card/40">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-foreground">Requests by Property</h2>
          </div>
          {propertyBreakdown.length === 0 ? (
            <EmptyState message="No properties found." />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">Property</th>
                      <th className="px-5 py-3 text-center">Total</th>
                      <th className="px-5 py-3 text-center">Open</th>
                      <th className="px-5 py-3 text-center">Completed</th>
                      <th className="px-5 py-3 text-center">Rejected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {propertyBreakdown.map((row) => (
                      <tr key={row.id} className="bg-background/20">
                        <td className="px-5 py-3 text-foreground">{row.name}</td>
                        <td className="px-5 py-3 text-center text-secondary-foreground">{row.total}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={row.open > 0 ? "text-orange-800" : "text-muted-foreground"}>
                            {row.open}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={row.completed > 0 ? "text-green-800" : "text-muted-foreground"}>
                            {row.completed}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={row.rejected > 0 ? "text-red-800" : "text-muted-foreground"}>
                            {row.rejected}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="flex flex-col divide-y divide-border md:hidden">
                {propertyBreakdown.map((row) => (
                  <div key={row.id} className="flex flex-col gap-3 px-5 py-4">
                    <p className="text-sm text-foreground">{row.name}</p>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground">Total</span>
                        <span className="text-secondary-foreground">{row.total}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground">Open</span>
                        <span className={row.open > 0 ? "text-orange-800" : "text-muted-foreground"}>{row.open}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground">Done</span>
                        <span className={row.completed > 0 ? "text-green-800" : "text-muted-foreground"}>{row.completed}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground">Rejected</span>
                        <span className={row.rejected > 0 ? "text-red-800" : "text-muted-foreground"}>{row.rejected}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent completed requests */}
        <div className="rounded-2xl border border-border bg-card/40">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-foreground">Recently Completed</h2>
          </div>
          {recentCompleted.length === 0 ? (
            <EmptyState message="No completed requests yet." />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">ID</th>
                      <th className="px-5 py-3">Title</th>
                      <th className="px-5 py-3">Property</th>
                      <th className="px-5 py-3">Resident</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentCompleted.map((r) => (
                      <tr key={r.id} className="bg-background/20">
                        <td className="px-5 py-3 text-xs text-muted-foreground">{r.id}</td>
                        <td className="px-5 py-3 text-foreground">{r.title}</td>
                        <td className="px-5 py-3 text-muted-foreground">{r.propertyName}</td>
                        <td className="px-5 py-3 text-muted-foreground">{r.residentName}</td>
                        <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="flex flex-col divide-y divide-border md:hidden">
                {recentCompleted.map((r) => (
                  <div key={r.id} className="flex flex-col gap-2 px-5 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-foreground">{r.title}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">{r.residentName} · {r.propertyName}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </OwnerLayout>
  );
}
