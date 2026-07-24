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
import { PrimaryButton } from "../../components/auth/buttons";
import { LoadingState } from "../../components/shared/loadingState";
import { Pagination } from "../../components/shared/pagination";
import { usePagination } from "../../hooks/usePagination";
import { getRequests } from "../../services/requestService";
import {
  RESIDENT_ROUTES,
  ISSUE_CATEGORIES,
  PRIORITY_OPTIONS,
  type MaintenanceRequest,
} from "../../constants/resident";

// Constants
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

  // Load data
  const loadData = useCallback(() => getRequests().then(setRequests), []);

  useEffect(() => {
    let active = true;
    loadData().then(() => { if (active) setLoading(false); });
    return () => {
      active = false;
    };
  }, [loadData]);

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
  const { page, setPage, pageSize, setPageSize, totalPages, pageItems, resetPage, total } = usePagination(filtered);

  // Reset to page 1 whenever filters change.
  const onFilterChange = useCallback(
    (setter: (v: string) => void) => (value: string) => {
      setter(value);
      resetPage();
    },
    [resetPage]
  );

  const openRequest = useCallback(
    (id: string) => navigate(`${RESIDENT_ROUTES.details}/${id}`),
    [navigate]
  );

  return (
    <DashboardLayout
      title="Request History"
      onRefresh={loadData}
      actions={
        <PrimaryButton fullWidth={false} onClick={() => navigate(RESIDENT_ROUTES.submit)}>
          <PlusCircle size={18} />
          New Request
        </PrimaryButton>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Search + filters */}
        <div className="rounded-2xl border border-border bg-card/40 p-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              placeholder="Search by title or request ID..."
              className="w-full rounded-xl border border-border bg-background/60 py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
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
            {filtered.length > 0 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
