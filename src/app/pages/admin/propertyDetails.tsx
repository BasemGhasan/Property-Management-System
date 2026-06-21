// ============================================================================
// AdminPropertyDetailsPage — full detail view of a single property for admin.
// Shows property info, assigned owner, residents list, and request summary.
// ============================================================================

// Imports
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Mail, Phone, Users, Wrench, CheckCircle2 } from "lucide-react";
import { AdminLayout } from "../../layouts/adminLayout";
import { SecondaryButton } from "../../components/auth/buttons";
import { LoadingState } from "../../components/shared/loadingState";
import { getAdminPropertyById } from "../../services/adminService";
import { MOCK_PROPERTIES } from "../../services/ownerService";
import { ADMIN_ROUTES } from "../../constants/admin";
import type { AdminProperty } from "../../constants/admin";
import type { Property } from "../../constants/owner";

// Component
export default function AdminPropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [adminProp, setAdminProp]   = useState<AdminProperty | null>(null);
  const [ownerProp, setOwnerProp]   = useState<Property | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    let active = true;
    getAdminPropertyById(id ?? "").then((ap) => {
      if (!active) return;
      setAdminProp(ap ?? null);
      // Match against owner service data to get the resident list
      const match = MOCK_PROPERTIES.find((p) => p.name === ap?.name) ?? null;
      setOwnerProp(match);
      setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  return (
    <AdminLayout title="Property Details">
      <SecondaryButton fullWidth={false} onClick={() => navigate(ADMIN_ROUTES.properties)} className="mb-5">
        <ArrowLeft size={16} /> Back to Properties
      </SecondaryButton>

      {loading ? (
        <LoadingState />
      ) : !adminProp ? (
        <p className="py-12 text-center text-slate-500">Property not found.</p>
      ) : (
        <div className="flex flex-col gap-6 max-w-3xl">
          {/* Property info */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-slate-100">{adminProp.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{adminProp.address}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${
                adminProp.active
                  ? "border-green-500/30 bg-green-500/10 text-green-300"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}>
                {adminProp.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users, label: "Residents", value: adminProp.residentCount, color: "bg-blue-500/15 text-blue-400" },
              { icon: Wrench, label: "Total Requests", value: adminProp.totalRequests, color: "bg-orange-500/15 text-orange-400" },
              { icon: CheckCircle2, label: "Owner", value: adminProp.ownerName, color: "bg-green-500/15 text-green-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800/40 p-4 text-center">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}><Icon size={18} /></span>
                <p className="text-sm text-slate-100">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Assigned owner */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
            <h3 className="mb-3 text-slate-200">Assigned Owner</h3>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-200">{adminProp.ownerName}</p>
              <a href={`mailto:${adminProp.ownerEmail}`} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-300">
                <Mail size={14} /> {adminProp.ownerEmail}
              </a>
            </div>
          </div>

          {/* Residents */}
          {ownerProp && ownerProp.residents.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
              <h3 className="mb-4 text-slate-200">Residents ({ownerProp.residents.length})</h3>
              <div className="flex flex-col divide-y divide-slate-800">
                {ownerProp.residents.map((r) => (
                  <div key={r.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs text-slate-300">
                        {r.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                      <div>
                        <p className="text-sm text-slate-200">{r.name}</p>
                        <p className="text-xs text-slate-500">Unit {r.unit}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 pl-11 sm:pl-0">
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
          )}
        </div>
      )}
    </AdminLayout>
  );
}
