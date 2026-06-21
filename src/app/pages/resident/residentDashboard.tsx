// ============================================================================
// ResidentDashboard — overview of requests, recent activity & quick actions.
// ============================================================================

// Imports
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Layers, Clock, Loader, CheckCircle2, PlusCircle, History } from "lucide-react";
import { DashboardLayout } from "../../layouts/dashboardLayout";
import { DashboardCard } from "../../components/dashboard/dashboardCard";
import { RequestCard } from "../../components/dashboard/requestCard";
import { NotificationWidget } from "../../components/dashboard/notificationWidget";
import { PrimaryButton, SecondaryButton } from "../../components/auth/buttons";
import { LoadingState } from "../../components/shared/loadingState";
import { getRequests, getNotifications } from "../../services/requestService";
import {
  RESIDENT_ROUTES,
  type MaintenanceRequest,
  type ResidentNotification,
} from "../../constants/resident";

// Component
export default function ResidentDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [notifications, setNotifications] = useState<ResidentNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      const [reqs, notes] = await Promise.all([getRequests(), getNotifications()]);
      if (!active) return;
      setRequests(reqs);
      setNotifications(notes);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Derived counts for the stat cards.
  const stats = useMemo(() => {
    const byStatus = (s: MaintenanceRequest["status"]) =>
      requests.filter((r) => r.status === s).length;
    return {
      active: requests.filter((r) => r.status !== "completed" && r.status !== "rejected").length,
      pending: byStatus("pending"),
      inProgress: byStatus("in-progress"),
      completed: byStatus("completed"),
    };
  }, [requests]);

  // Five most recent requests.
  const recent = useMemo(() => requests.slice(0, 4), [requests]);

  // Navigation helper to a request's detail page.
  const openRequest = useCallback(
    (id: string) => navigate(`${RESIDENT_ROUTES.details}/${id}`),
    [navigate]
  );

  return (
    <DashboardLayout title="Dashboard">
      {loading ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard label="Active Requests" value={stats.active} icon={Layers} accent="blue" onClick={() => navigate(RESIDENT_ROUTES.history)} />
            <DashboardCard label="Pending" value={stats.pending} icon={Clock} accent="orange" onClick={() => navigate(RESIDENT_ROUTES.history)} />
            <DashboardCard label="In Progress" value={stats.inProgress} icon={Loader} accent="blue" onClick={() => navigate(RESIDENT_ROUTES.history)} />
            <DashboardCard label="Completed" value={stats.completed} icon={CheckCircle2} accent="green" onClick={() => navigate(RESIDENT_ROUTES.history)} />
          </div>

          {/* Quick actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <PrimaryButton fullWidth={false} onClick={() => navigate(RESIDENT_ROUTES.submit)}>
              <PlusCircle size={18} />
              Create New Request
            </PrimaryButton>
            <SecondaryButton fullWidth={false} onClick={() => navigate(RESIDENT_ROUTES.history)}>
              <History size={18} />
              View Request History
            </SecondaryButton>
          </div>

          {/* Two-column: recent requests + notifications */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent requests */}
            <div className="lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-slate-200">Recent Requests</h2>
                <button
                  onClick={() => navigate(RESIDENT_ROUTES.history)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {recent.map((r) => (
                  <RequestCard key={r.id} request={r} onClick={() => openRequest(r.id)} />
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="lg:col-span-1">
              <NotificationWidget notifications={notifications} />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
