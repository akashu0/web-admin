import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn("w-full border-collapse text-left text-sm", className)}
      {...props}
    />
  );
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("sticky top-0 z-10 bg-surface-low", className)}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-border/40", className)} {...props} />;
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("transition-colors hover:bg-surface-low", className)}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-2.5 align-middle", className)} {...props} />;
}

/**
 * Which column a list is ordered by. `undefined` is the list's own default,
 * which every endpoint answers with newest-first.
 *
 * `field` is a NAME the server resolves — never a database path. See
 * eg-api/internal/httpx/listpage.go for the whitelist on the other side.
 */
export type SortState = { field: string; dir: "asc" | "desc" } | undefined;

/**
 * The next state for a header click: unsorted → ascending → descending → back
 * to the list's default.
 *
 * Three states rather than two so there is a way back. A column that only
 * toggles asc/desc traps the list in an order the person never asked for, and
 * "newest first" is the order every one of these lists is designed around.
 */
export function nextSort(current: SortState, field: string): SortState {
  if (current?.field !== field) return { field, dir: "asc" };
  return current.dir === "asc" ? { field, dir: "desc" } : undefined;
}

/**
 * A column header you can click to sort by.
 *
 * A real <button> inside the <th>, so it is reachable by keyboard and announced
 * as pressable, with aria-sort on the cell itself — the attribute a screen
 * reader reads to say which column the table is ordered by.
 */
export function SortableHead({
  field,
  sort,
  onSort,
  className,
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & {
  field: string;
  sort: SortState;
  onSort: (next: SortState) => void;
}) {
  const active = sort?.field === field;
  const Icon = !active ? ChevronsUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      className={cn("p-0", className)}
      {...props}
    >
      <button
        type="button"
        onClick={() => onSort(nextSort(sort, field))}
        // inherit: the cell carries this table's header type — uppercase, bold,
        // muted — and a button resets all three.
        className={cn(
          "group flex w-full items-center gap-1 px-4 py-2.5 font-[inherit] uppercase tracking-[inherit]",
          "hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          className?.includes("text-right") && "justify-end",
          className?.includes("text-center") && "justify-center",
        )}
      >
        {children}
        <Icon
          className={cn(
            "size-3 shrink-0",
            // Unsorted columns show the affordance on hover only: eight arrows
            // in a header row reads as eight active sorts.
            active ? "opacity-100" : "opacity-0 group-hover:opacity-50",
          )}
          aria-hidden
        />
      </button>
    </TableHead>
  );
}
