// ============================================================================
// usePagination — page/page-size state + slicing for client-side tables.
// ============================================================================

// Imports
import { useMemo, useState } from "react";

// Constants
export const PAGE_SIZE_OPTIONS = [10, 50, 100] as const;

// Hook
export function usePagination<T>(items: T[], initialPageSize: (typeof PAGE_SIZE_OPTIONS)[number] = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState<number>(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page_ = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((page_ - 1) * pageSize, page_ * pageSize),
    [items, page_, pageSize]
  );

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  const resetPage = () => setPage(1);

  return {
    page: page_,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    pageItems,
    resetPage,
    total: items.length,
  };
}
