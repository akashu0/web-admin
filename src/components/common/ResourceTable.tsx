import type { ReactNode } from "react";
import {
  SortableHead,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type SortState,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/common/states";

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  /**
   * The field name the SERVER orders by when this header is clicked, which makes
   * the header sortable. Defaults to `key`; give it explicitly when the column
   * shows something the record does not store under that name (a course's name
   * lives at `overview.courseName`, and the server knows it as `course`).
   *
   * Omit — `sortable: false` — for an action column, or one counted from an
   * array, where there is nothing stored to order by.
   */
  sortField?: string;
  sortable?: boolean;
}

export function ResourceTable<T extends { _id?: string; id?: string }>({
  columns,
  rows,
  isLoading,
  onRowClick,
  sentinelRef,
  isFetchingNextPage,
  hasNextPage,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  sort,
  onSort,
}: {
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  sentinelRef?: React.Ref<HTMLDivElement>;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  /**
   * Pass both and every column becomes a sortable header. The order is the
   * server's — the list refetches from page 1 — so it is correct for the whole
   * table and not just for the rows already scrolled into view.
   */
  sort?: SortState;
  onSort?: (next: SortState) => void;
}) {
  const alignClass = (a?: string) =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((c) =>
                onSort && c.sortable !== false ? (
                  <SortableHead
                    key={c.key}
                    field={c.sortField ?? c.key}
                    sort={sort}
                    onSort={onSort}
                    className={alignClass(c.align)}
                  >
                    {c.header}
                  </SortableHead>
                ) : (
                  <TableHead key={c.key} className={alignClass(c.align)}>
                    {c.header}
                  </TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell colSpan={columns.length}>
                    <Skeleton className="h-7 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {rows.map((row, i) => (
              <TableRow
                key={row._id ?? row.id ?? i}
                className={onRowClick ? "cursor-pointer" : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((c) => (
                  <TableCell key={c.key} className={`${alignClass(c.align)} ${c.className ?? ""}`}>
                    {c.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && rows.length === 0 && (
        <div className="p-8">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      )}

      {sentinelRef && (
        <div ref={sentinelRef} className="flex items-center justify-center py-3 text-xs text-muted-foreground">
          {isFetchingNextPage && (
            <span className="flex items-center gap-2">
              <Spinner /> Loading more…
            </span>
          )}
          {!hasNextPage && !isLoading && rows.length > 0 && <span>You’ve reached the end</span>}
        </div>
      )}
    </div>
  );
}
