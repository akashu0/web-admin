import { useState, useEffect } from "react";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    getFilteredRowModel,
    type ColumnFiltersState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { University, PaginationMeta } from "@/types/university";

interface UniversityDataTableProps {
    columns: ColumnDef<University>[];
    data: University[];
    pagination: PaginationMeta | null;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onSearchChange: (search: string) => void;
    onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
    isLoading?: boolean;
}

export function UniversityDataTable({
    columns,
    data,
    pagination,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onSortChange,
    isLoading = false,
}: UniversityDataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [searchValue, setSearchValue] = useState("");

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
        manualPagination: true,
        manualSorting: true,
        pageCount: pagination?.totalPages ?? 0,
    });

    // Handle sorting changes
    useEffect(() => {
        if (sorting.length > 0 && onSortChange) {
            const { id, desc } = sorting[0];
            onSortChange(id, desc ? "desc" : "asc");
        }
    }, [sorting, onSortChange]);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(searchValue);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchValue, onSearchChange]);

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search universities..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rows per page:</span>
                    <Select
                        value={String(pagination?.limit ?? 10)}
                        onValueChange={(value) => onPageSizeChange(Number(value))}
                    >
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-gray-50">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="font-semibold">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-64 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                        <p className="text-sm text-gray-500">Loading universities...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-gray-50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-64 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <p className="text-lg font-semibold text-gray-900">
                                            No universities found
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Try adjusting your search or filters
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing{" "}
                        <span className="font-medium">
                            {((pagination.page - 1) * pagination.limit) + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{" "}
                        of <span className="font-medium">{pagination.total}</span> results
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={!pagination.hasPrevPage || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                let pageNum: number;

                                if (pagination.totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (pagination.page <= 3) {
                                    pageNum = i + 1;
                                } else if (pagination.page >= pagination.totalPages - 2) {
                                    pageNum = pagination.totalPages - 4 + i;
                                } else {
                                    pageNum = pagination.page - 2 + i;
                                }

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={pagination.page === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onPageChange(pageNum)}
                                        disabled={isLoading}
                                        className="w-10"
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={!pagination.hasNextPage || isLoading}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Selection Info */}
            {Object.keys(rowSelection).length > 0 && (
                <div className="text-sm text-gray-600">
                    {Object.keys(rowSelection).length} of {data.length} row(s) selected
                </div>
            )}
        </div>
    );
}