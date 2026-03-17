import { LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { SingleSelect } from '@~/components/ui/select';
import type { iOptionType } from '@~/components/ui/select';
import { cn } from '@~/lib/utils';

const PAGE_SIZE_OPTIONS: iOptionType[] = [
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '50', value: '50' },
  { label: '100', value: '100' },
];

interface iPaginationControlsProps {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items */
  total: number;
  /** Whether a request is in progress */
  isLoading?: boolean;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Optional callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
  /** Whether to show page size selector */
  showPageSizeSelector?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Pagination controls for tables and grid views.
 * Provides first/previous/next/last buttons and optional page size selector.
 */
export function PaginationControls({
  page,
  pageSize,
  total,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  className,
}: iPaginationControlsProps) {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  const handlePageSizeChange = (value: string | null) => {
    if (value && onPageSizeChange) {
      onPageSizeChange(Number(value));
    }
  };

  if (total === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-4', className)}>
      {/* Item count */}
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{total}</span> items
      </p>

      <div className="flex items-center gap-4">
        {/* Page size selector */}
        {showPageSizeSelector && onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <SingleSelect
              options={PAGE_SIZE_OPTIONS}
              value={String(pageSize)}
              onValueChange={handlePageSizeChange}
              className="w-20"
              isDisabled={isLoading}
            />
          </div>
        ) : null}

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={!canGoPrevious || isLoading}
            aria-label="Go to first page"
            className="size-8"
          >
            <LuChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoPrevious || isLoading}
            aria-label="Go to previous page"
            className="size-8"
          >
            <LuChevronLeft className="size-4" />
          </Button>

          <span className="min-w-[100px] text-center text-sm">
            Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext || isLoading}
            aria-label="Go to next page"
            className="size-8"
          >
            <LuChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext || isLoading}
            aria-label="Go to last page"
            className="size-8"
          >
            <LuChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface iLoadMoreButtonProps {
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Whether a request is in progress */
  isLoading?: boolean;
  /** Callback when load more is clicked */
  onLoadMore: () => void;
  /** Optional class name */
  className?: string;
}

/**
 * Load More button for infinite scroll patterns.
 * Use this for non-tabular data like cards and lists.
 */
export function LoadMoreButton({ hasMore, isLoading = false, onLoadMore, className }: iLoadMoreButtonProps) {
  if (!hasMore) {
    return null;
  }

  return (
    <div className={cn('flex justify-center py-4', className)}>
      <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
        {isLoading ? 'Loading…' : 'Load More'}
      </Button>
    </div>
  );
}
