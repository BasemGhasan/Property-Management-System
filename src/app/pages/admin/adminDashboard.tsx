// ============================================================================
// AdminDashboard — high-level system overview for the admin.
// Stat cards + recent activity + quick navigation actions. No charts.
// ============================================================================

// Imports
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Users, Home, Building2, Wrench, Tag, UserCheck } from "lucide-react";
import { AdminLayout } from "../../layouts/adminLayout";
import { DashboardCard } from "../../components/dashboard/dashboardCard";
import { ActivityFeed } from "../../components/admin/activityFeed";
import { PrimaryButton, SecondaryButton } from "../../components/auth/buttons";
import { LoadingState } from "../../components/shared/loadingState";
import { getSystemStats, getAdminActivity } from "../../services/adminService";
import { ADMIN_ROUTES } from "../../constants/admin";
import type { AdminActivity } from "../../constants/admin";

// Component
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0, totalResidents: 0, totalOwners: 0,
    totalProperties: 0, totalRequests: 0, openRequests: 0,
  });
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getSystemStats(), getAdminActivity()]).then(([s, a]) => {
      if (!active) return;
      setStats(s);
      setActivity(a);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <LoadingState />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          <DashboardCard label="Total Users"      value={stats.totalUsers}       icon={Users}     accent="blue"   onClick={() => navigate(ADMIN_ROUTES.users)} />
          <DashboardCard label="Residents"         value={stats.totalResidents}   icon={Home}      accent="blue"   onClick={() => navigate(ADMIN_ROUTES.users)} />
          <DashboardCard label="Property Owners"   value={stats.totalOwners}      icon={UserCheck} accent="slate"  onClick={() => navigate(ADMIN_ROUTES.users)} />
          <DashboardCard label="Properties"        value={stats.totalProperties}  icon={Building2} accent="slate"  onClick={() => navigate(ADMIN_ROUTES.properties)} />
          <DashboardCard label="Total Requests"    value={stats.totalRequests}    icon={Wrench}    accent="orange" onClick={() => navigate(ADMIN_ROUTES.requests)} />
          <DashboardCard label="Open Requests"     value={stats.openRequests}     icon={Tag}       accent="green"  onClick={() => navigate(ADMIN_ROUTES.requests)} />
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <PrimaryButton fullWidth={false} onClick={() => navigate(ADMIN_ROUTES.users)}>
            <Users size={18} /> Manage Users
          </PrimaryButton>
          <SecondaryButton fullWidth={false} onClick={() => navigate(ADMIN_ROUTES.properties)}>
            <Building2 size={18} /> Manage Properties
          </SecondaryButton>
          <SecondaryButton fullWidth={false} onClick={() => navigate(ADMIN_ROUTES.categories)}>
            <Tag size={18} /> Manage Categories
          </SecondaryButton>
        </div>

        {/* Recent activity */}
        <div className="max-w-2xl">
          <ActivityFeed items={activity} />
        </div>
      </div>
    </AdminLayout>
  );
}
