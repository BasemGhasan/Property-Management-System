// ============================================================================
// OwnerDashboard — overview of all properties and maintenance activity.
// Simplified: stat cards + recent requests table only. No charts.
// ============================================================================

// Imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2, Users, Wrench, AlertTriangle, CheckCircle2, List,
} from "lucide-react";
import { OwnerLayout } from "../../layouts/ownerLayout";
import { DashboardCard } from "../../components/dashboard/dashboardCard";
import { StatusBadge, PriorityBadge } from "../../components/dashboard/badges";
import { PrimaryButton, SecondaryButton } from "../../components/auth/buttons";
import { LoadingState } from "../../components/shared/loadingState";
import { getProperties, getOwnerRequests } from "../../services/ownerService";
import { OWNER_ROUTES } from "../../constants/owner";
import { categoryLabel } from "../../constants/resident";
import type { Property, OwnerRequest } from "../../constants/owner";

// Component
export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<OwnerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() =>
    Promise.all([getProperties(), getOwnerRequests()]).then(([p, r]) => {
      setProperties(p);
      setRequests(r);
    }), []);

  useEffect(() => {
    let active = true;
    loadData().then(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadData]);

  const stats = useMemo(() => ({
    totalProperties: properties.length,
    totalResidents: properties.reduce((s, p) => s + p.residents.length, 0),
    openRequests: requests.filter((r) => r.status === "pending" || r.status === "in-progress").length,
    criticalRequests: requests.filter((r) => r.priority === "critical").length,
    completedRequests: requests.filter((r) => r.status === "completed").length,
  }), [properties, requests]);

  // Five most recent requests
  const recent = useMemo(() => requests.slice(0, 5), [requests]);

  if (loading) {
    return (
      <OwnerLayout title="Dashboard">
        <LoadingState />
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Dashboard" onRefresh={loadData}>
      <div className="flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <DashboardCard label="Properties" value={stats.totalProperties} icon={Building2} accent="blue" onClick={() => navigate(OWNER_ROUTES.properties)} />
          <DashboardCard label="Residents" value={stats.totalResidents} icon={Users} accent="slate" />
          <DashboardCard label="Open Requests" value={stats.openRequests} icon={Wrench} accent="orange" onClick={() => navigate(OWNER_ROUTES.requests)} />
          <DashboardCard label="Critical" value={stats.criticalRequests} icon={AlertTriangle} accent="slate" onClick={() => navigate(OWNER_ROUTES.requests)} />
          <DashboardCard label="Completed" value={stats.completedRequests} icon={CheckCircle2} accent="green" />
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <PrimaryButton fullWidth={false} onClick={() => navigate(OWNER_ROUTES.requests)}>
            <List size={18} /> View All Requests
          </PrimaryButton>
          <SecondaryButton fullWidth={false} onClick={() => navigate(OWNER_ROUTES.properties)}>
            <Building2 size={18} /> View Properties
          </SecondaryButton>
        </div>

        {/* Recent requests — simple table */}
        <div className="rounded-2xl border border-border bg-card/40">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-foreground">Recent Requests</h2>
            <button onClick={() => navigate(OWNER_ROUTES.requests)} className="text-sm text-primary hover:text-primary/80">
              View all
            </button>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Property</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`${OWNER_ROUTES.requestManage}/${r.id}`)}
                    className="cursor-pointer transition-colors hover:bg-accent"
                  >
                    <td className="px-5 py-3 text-muted-foreground">{r.id}</td>
                    <td className="px-5 py-3 text-foreground">{r.title}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.propertyName}</td>
                    <td className="px-5 py-3"><PriorityBadge priority={r.priority} /></td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="flex flex-col divide-y divide-border md:hidden">
            {recent.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`${OWNER_ROUTES.requestManage}/${r.id}`)}
                className="flex flex-col gap-2 px-5 py-4 text-left hover:bg-accent"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground">{r.title}</p>
                  <StatusBadge status={r.status} />
                </div>
                <div className="flex items-center gap-3">
                  <PriorityBadge priority={r.priority} />
                  <span className="text-xs text-muted-foreground">{r.propertyName}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
