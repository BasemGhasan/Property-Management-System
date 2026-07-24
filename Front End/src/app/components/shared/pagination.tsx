// ============================================================================
// Pagination — page-size selector (10/50/100) + prev/next navigation.
// Used beneath every paginated table in the app.
// ============================================================================

// Imports
import { SecondaryButton } from "../auth/buttons";
import { PAGE_SIZE_OPTIONS } from "../../hooks/usePagination";

// Interfaces
interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

// Component
export function Pagination({ page, totalPages, pageSize, total, onPageChange, onPageSizeChange }: PaginationProps) {
  return (
    <div className="flex flex-col gap-3 border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <label htmlFor="pageSize">Rows per page</label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border border-border bg-input px-2 py-1 text-foreground focus:border-primary focus:outline-none"
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span className="font-data text-xs">
          Page {page} of {totalPages} · {total} result{total === 1 ? "" : "s"}
        </span>
      </div>
      <div className="flex gap-2">
        <SecondaryButton fullWidth={false} disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </SecondaryButton>
        <SecondaryButton fullWidth={false} disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </SecondaryButton>
      </div>
    </div>
  );
}
