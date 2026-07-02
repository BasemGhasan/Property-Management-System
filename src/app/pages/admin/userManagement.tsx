// ============================================================================
// UserManagementPage — searchable, filterable table of all platform users.
// Actions: View details, Activate / Deactivate via UserDetailsModal.
// ============================================================================

// Imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Eye, UserCheck, UserX } from "lucide-react";
import { AdminLayout } from "../../layouts/adminLayout";
import { SelectField } from "../../components/auth/selectField";
import { UserDetailsModal } from "../../components/admin/userDetailsModal";
import { LoadingState } from "../../components/shared/loadingState";
import { StatusPill } from "../../components/shared/statusPill";
import { getAdminUsers, toggleUserStatus } from "../../services/adminService";
import { USER_ROLE_OPTIONS } from "../../constants/filters";
import type { AdminUser } from "../../constants/admin";

// Role pill
function RolePill({ role }: { role: AdminUser["role"] }) {
  return (
    <span className={`inline-flex items-center border px-2 py-0.5 font-data text-[11px] uppercase tracking-wide ${
      role === "owner"
        ? "border-plum/25 bg-plum-soft text-plum"
        : "border-border bg-background text-muted-foreground"
    }`}>
      {role === "owner" ? "Property Owner" : "Resident"}
    </span>
  );
}

// Component
export default function UserManagementPage() {
  const [users, setUsers]           = useState<AdminUser[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selected, setSelected]     = useState<AdminUser | null>(null);
  const [modalOpen, setModalOpen]   = useState(false);

  useEffect(() => {
    let active = true;
    getAdminUsers().then((data) => { if (!active) return; setUsers(data); setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase());
      return matchSearch && (!roleFilter || u.role === roleFilter);
    });
  }, [users, search, roleFilter]);

  const openModal = useCallback((user: AdminUser) => { setSelected(user); setModalOpen(true); }, []);

  const handleToggle = useCallback(async (id: string) => {
    await toggleUserStatus(id);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, active: !u.active } : u));
  }, []);

  return (
    <AdminLayout title="User Management">
      <div className="flex flex-col gap-5">
        {/* Filters */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card/40 p-4 sm:flex-row sm:items-end">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or ID..."
              className="w-full rounded-xl border border-border bg-background/60 py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="sm:w-52">
            <SelectField
              label="Role"
              name="roleFilter"
              placeholder="All roles"
              options={USER_ROLE_OPTIONS as { value: string; label: string }[]}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            {/* Desktop */}
            <div className="hidden md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">User ID</th>
                    <th className="px-5 py-3">Full Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((u) => (
                    <tr key={u.id} className="bg-background/20 transition-colors hover:bg-accent">
                      <td className="px-5 py-3 text-muted-foreground text-xs">{u.id}</td>
                      <td className="px-5 py-3 text-foreground">{u.fullName}</td>
                      <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3"><RolePill role={u.role} /></td>
                      <td className="px-5 py-3"><StatusPill active={u.active} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal(u)}
                            title="View details"
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleToggle(u.id)}
                            title={u.active ? "Deactivate" : "Activate"}
                            className={`rounded-lg p-1.5 transition-colors ${
                              u.active
                                ? "text-muted-foreground hover:bg-red-100 hover:text-red-700"
                                : "text-muted-foreground hover:bg-green-100 hover:text-green-700"
                            }`}
                          >
                            {u.active ? <UserX size={16} /> : <UserCheck size={16} />}
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
              {filtered.map((u) => (
                <div key={u.id} className="flex items-start justify-between gap-3 px-4 py-4">
                  <div>
                    <p className="text-sm text-foreground">{u.fullName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{u.email}</p>
                    <div className="mt-2 flex gap-2">
                      <RolePill role={u.role} />
                      <StatusPill active={u.active} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(u)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"><Eye size={16} /></button>
                    <button onClick={() => handleToggle(u.id)} className={`rounded-lg p-1.5 ${u.active ? "text-red-700" : "text-green-700"}`}>
                      {u.active ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="p-12 text-center text-muted-foreground">No users match your filters.</p>
            )}
          </div>
        )}
      </div>

      <UserDetailsModal
        user={selected}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onToggleStatus={handleToggle}
      />
    </AdminLayout>
  );
}
