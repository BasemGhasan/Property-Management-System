// ============================================================================
// RequestMonitoringPage — admin read-only view of all maintenance requests.
// Reuses MOCK_OWNER_REQUESTS from ownerService; admin cannot edit requests.
// ============================================================================

// Imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Eye } from "lucide-react";
import { AdminLayout } from "../../layouts/adminLayout";
import { SelectField } from "../../components/auth/selectField";
import { StatusBadge, PriorityBadge } from "../../components/dashboard/badges";
import { SecondaryButton } from "../../components/auth/buttons";
import { LoadingState } from "../../components/shared/loadingState";
import { getOwnerRequests } from "../../services/ownerService";
import { ISSUE_CATEGORIES, PRIORITY_OPTIONS, categoryLabel } from "../../constants/resident";
import { REQUEST_STATUS_OPTIONS } from "../../constants/filters";
import type { OwnerRequest } from "../../constants/owner";

// Read-only request detail panel shown beneath the table on row click
function RequestDetailPanel({ request, onClose }: { request: OwnerRequest; onClose: () => void }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-slate-100">{request.title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{request.id} · {request.propertyName} · {request.residentName}</p>
        </div>
        <div className="flex gap-2">
          <PriorityBadge priority={request.priority} />
          <StatusBadge status={request.status} />
        </div>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-slate-400">{request.description}</p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Submitted: {request.submittedAt}</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">Close ×</button>
      </div>
    </div>
  );
}

// Component
export default function RequestMonitoringPage() {
  const [requests, setRequests]     = useState<OwnerRequest[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [status, setStatus]         = useState("");
  const [priority, setPriority]     = useState("");
  const [category, setCategory]     = useState("");
  const [page, setPage]             = useState(1);
  const [detail, setDetail]         = useState<OwnerRequest | null>(null);

  const PAGE_SIZE = 6;

  useEffect(() => {
    let active = true;
    getOwnerRequests().then((data) => { if (!active) return; setRequests(data); setLoading(false); });
    return () => { active = false; };
  }, []);

  const resetPage = useCallback(() => setPage(1), []);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.residentName.toLowerCase().includes(search.toLowerCase());
      return (
        matchSearch &&
        (!status   || r.status   === status) &&
        (!priority || r.priority === priority) &&
        (!category || r.category === category)
      );
    });
  }, [requests, search, status, priority, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  return (
    <AdminLayout title="Maintenance Requests">
      <div className="flex flex-col gap-5">
        {/* Filters */}
        <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
          <div className="relative mb-4">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              placeholder="Search by ID, title or resident..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 py-3 pl-11 pr-4 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField label="Status"   name="statusFilter"   placeholder="All statuses"   options={REQUEST_STATUS_OPTIONS as { value: string; label: string }[]}   value={status}   onChange={(e) => { setStatus(e.target.value);   resetPage(); }} />
            <SelectField label="Priority" name="priorityFilter" placeholder="All priorities" options={PRIORITY_OPTIONS} value={priority} onChange={(e) => { setPriority(e.target.value); resetPage(); }} />
            <SelectField label="Category" name="categoryFilter" placeholder="All categories" options={ISSUE_CATEGORIES} value={category} onChange={(e) => { setCategory(e.target.value); resetPage(); }} />
          </div>
        </div>

        {/* Detail panel */}
        {detail && <RequestDetailPanel request={detail} onClose={() => setDetail(null)} />}

        {/* Table */}
        {loading ? (
          <LoadingState />
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              {/* Desktop */}
              <div className="hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      {["ID", "Property", "Resident", "Category", "Priority", "Status", "Date", ""].map((h, i) => (
                        <th key={i} className="px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {pageItems.map((r) => (
                      <tr key={r.id} className={`bg-slate-900/20 transition-colors hover:bg-slate-800/40 ${detail?.id === r.id ? "ring-1 ring-inset ring-violet-500/30" : ""}`}>
                        <td className="px-5 py-3 text-xs text-slate-500">{r.id}</td>
                        <td className="px-5 py-3 text-slate-400">{r.propertyName}</td>
                        <td className="px-5 py-3 text-slate-400">{r.residentName}</td>
                        <td className="px-5 py-3 text-slate-400">{categoryLabel(r.category)}</td>
                        <td className="px-5 py-3"><PriorityBadge priority={r.priority} /></td>
                        <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-5 py-3 text-slate-400">{r.submittedAt}</td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => setDetail(detail?.id === r.id ? null : r)}
                            title="View details"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="flex flex-col divide-y divide-slate-800 md:hidden">
                {pageItems.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setDetail(detail?.id === r.id ? null : r)}
                    className="flex flex-col gap-2 px-4 py-4 text-left hover:bg-slate-800/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-slate-200">{r.title}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-slate-500">{r.residentName} · {r.propertyName}</p>
                    <div className="flex gap-2"><PriorityBadge priority={r.priority} /></div>
                  </button>
                ))}
              </div>

              {filtered.length === 0 && (
                <p className="p-12 text-center text-slate-500">No requests match your filters.</p>
              )}
            </div>

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Page {page} of {totalPages} · {filtered.length} results</p>
                <div className="flex gap-2">
                  <SecondaryButton fullWidth={false} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</SecondaryButton>
                  <SecondaryButton fullWidth={false} disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</SecondaryButton>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
