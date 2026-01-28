import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
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
    isLoading = false,
}: UniversityDataTableProps) {
    // 1. Keep Table logic minimal
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: pagination?.totalPages ?? 0,
    });

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

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rows:</span>
                    <Select
                        value={String(pagination?.limit ?? 20)}
                        onValueChange={(v) => onPageSizeChange(Number(v))}
                    >
                        <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {[10, 20, 50].map(size => (
                                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
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
                        {isLoading ? (
                            <TableRow><TableCell colSpan={columns.length} className="h-32 text-center">Loading...</TableCell></TableRow>
                        ) : data.length === 0 ? (
                            <TableRow><TableCell colSpan={columns.length} className="h-32 text-center">No results.</TableCell></TableRow>
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

            {/* Simplified Pagination Controls */}
            {pagination && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-gray-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page <= 1 || isLoading}
                            onClick={() => onPageChange(pagination.page - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page >= pagination.totalPages || isLoading}
                            onClick={() => onPageChange(pagination.page + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}