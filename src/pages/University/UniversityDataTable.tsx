import { useEffect, useState } from "react";
import {
    type ColumnDef,
    type RowSelectionState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { University } from "@/types/university";

interface UniversityDataTableProps {
    columns: ColumnDef<University>[];
    data: University[];
    total: number;
    hasMore: boolean;
    isLoadingMore?: boolean;
    onSearchChange: (search: string) => void;
    onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
    // Lifts the currently selected university _ids to the parent for bulk actions.
    onSelectionChange?: (ids: string[]) => void;
    // Bumping this signal from the parent clears the current row selection
    // (e.g. right after a bulk status change succeeds).
    resetSelectionSignal?: number;
}

export function UniversityDataTable({
    columns,
    data,
    total,
    hasMore,
    isLoadingMore = false,
    onSearchChange,
    onSelectionChange,
    resetSelectionSignal,
}: UniversityDataTableProps) {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    // 1. Keep Table logic minimal
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
        // Key selection by _id so it stays stable as infinite-scroll appends rows.
        getRowId: (row) => row._id,
        onRowSelectionChange: setRowSelection,
        state: { rowSelection },
    });

    // Report selected ids upward whenever the selection changes.
    useEffect(() => {
        const ids = Object.keys(rowSelection).filter((id) => rowSelection[id]);
        onSelectionChange?.(ids);
    }, [rowSelection, onSelectionChange]);

    // Clear selection when the parent bumps the reset signal.
    useEffect(() => {
        if (resetSelectionSignal !== undefined) setRowSelection({});
    }, [resetSelectionSignal]);

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search universities..."
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <p className="text-sm text-gray-500 shrink-0">
                    Showing {data.length} of {total}
                </p>
            </div>

            {/* Table Core */}
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow><TableCell colSpan={columns.length} className="h-32 text-center">{isLoadingMore ? "Loading..." : "No results."}</TableCell></TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Infinite scroll status */}
            {data.length > 0 && isLoadingMore && (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more universities...
                </div>
            )}
            {data.length > 0 && !hasMore && !isLoadingMore && (
                <div className="py-4 text-center text-sm text-gray-400">
                    All {total} universities loaded
                </div>
            )}
        </div>
    );
}
