// ============================================================================
// RequestHistoryPage — searchable, filterable list of all requests.
// ============================================================================

// Imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, PlusCircle } from "lucide-react";
import { DashboardLayout } from "../../layouts/dashboardLayout";
import { RequestTable } from "../../components/dashboard/requestTable";
import { SelectField } from "../../components/auth/selectField";
import { PrimaryButton, SecondaryButton } from "../../components/auth/buttons";
import { LoadingState } from "../../components/shared/loadingState";
import { getRequests } from "../../services/requestService";
import {
  RESIDENT_ROUTES,
  ISSUE_CATEGORIES,
  PRIORITY_OPTIONS,
  type MaintenanceRequest,
} from "../../constants/resident";

// Constants
const PAGE_SIZE = 4;

const STATUS_FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

// Component
export default function RequestHistoryPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  // Load data
  useEffect(() => {
    let active = true;
    (async () => {
      const data = await getRequests();
      if (!active) return;
      setRequests(data);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Apply search + filters (memoised).
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !status || r.status === status;
      const matchPriority = !priority || r.priority === priority;
      const matchCategory = !category || r.category === category;
      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }, [requests, search, status, priority, category]);

  // Pagination slice.
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  // Reset to page 1 whenever filters change.
  const onFilterChange = useCallback(
    (setter: (v: string) => void) => (value: string) => {
      setter(value);
      setPage(1);
    },
    []
  );

  const openRequest = useCallback(
    (id: string) => navigate(`${RESIDENT_ROUTES.details}/${id}`),
    [navigate]
  );

  return (
    <DashboardLayout
      title="Request History"
      actions={
        <PrimaryButton fullWidth={false} onClick={() => navigate(RESIDENT_ROUTES.submit)}>
          <PlusCircle size={18} />
          New Request
        </PrimaryButton>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Search + filters */}
        <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title or request ID..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 py-3 pl-11 pr-4 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              label="Status"
              name="filterStatus"
              placeholder="All statuses"
              options={STATUS_FILTERS}
              value={status}
              onChange={(e) => onFilterChange(setStatus)(e.target.value)}
            />
            <SelectField
              label="Priority"
              name="filterPriority"
              placeholder="All priorities"
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={(e) => onFilterChange(setPriority)(e.target.value)}
            />
            <SelectField
              label="Category"
              name="filterCategory"
              placeholder="All categories"
              options={ISSUE_CATEGORIES}
              value={category}
              onChange={(e) => onFilterChange(setCategory)(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <LoadingState />
        ) : (
          <>
            <RequestTable requests={pageItems} onRowClick={openRequest} />

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Page {page} of {totalPages} · {filtered.length} results
                </p>
                <div className="flex gap-2">
                  <SecondaryButton
                    fullWidth={false}
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </SecondaryButton>
                  <SecondaryButton
                    fullWidth={false}
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </SecondaryButton>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
