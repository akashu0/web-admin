// pages/Course/CourseDataTable.tsx
import * as React from "react";
import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { PaginationMeta } from "@/types/course";

const STREAM_OPTIONS = [
    'Engineering & Technology',
    'Business & Management Studies',
    'Information Technology & Computing',
    'Accounting & Finance',
    'Education & Teaching',
    'Social Sciences & Humanities',
    'Medicine & Healthcare',
    'Nursing & Allied Health Sciences',
    'Artificial Intelligence & Data Science',
    'Cyber Security & Networking',
    'Software Engineering & Development',
    'Hospitality & Tourism Management',
    'Law & Legal Studies',
    'Architecture & Interior Design',
    'Aeronautical & Aviation Studies',
    'Banking & Financial Technology (FinTech)',
    'Public Health & Healthcare Management',
    'Pharmacy & Pharmaceutical Sciences',
] as const;

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pagination: PaginationMeta | null;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    onSearchChange: (search: string) => void;
    onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    onStreamChange: (stream: string) => void;
    isLoading?: boolean;
}

export function CourseDataTable<TData, TValue>({
    columns,
    data,
    pagination,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onSortChange,
    onStreamChange,
    isLoading = false,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [searchValue, setSearchValue] = React.useState("");
    const [streamValue, setStreamValue] = React.useState("");

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(searchValue);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchValue, onSearchChange]);

    // Handle sorting
    React.useEffect(() => {
        if (sorting.length > 0) {
            const { id, desc } = sorting[0];
            onSortChange(id, desc ? 'desc' : 'asc');
        }
    }, [sorting, onSortChange]);

    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        onSortingChange: setSorting,
        state: {
            sorting,
        },
        pageCount: pagination?.totalPages || 0,
    });

    const rows = table.getRowModel()?.rows || [];

    return (
        <div className="space-y-4">
            {/* Search + Filters Bar */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search courses..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="pl-10 border-gray-200 bg-white focus:border-gray-300"
                    />
                </div>
                <Select
                    value={streamValue || "__all__"}
                    onValueChange={(value) => {
                        const v = value === "__all__" ? "" : value;
                        setStreamValue(v);
                        onStreamChange(v);
                    }}
                >
                    <SelectTrigger className="w-[220px] bg-white border-gray-200">
                        <SelectValue placeholder="All Streams" />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-60">
                        <SelectItem value="__all__">All Streams</SelectItem>
                        {STREAM_OPTIONS.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={pagination?.limit?.toString() || "10"}
                    onValueChange={(value) => onPageSizeChange(Number(value))}
                >
                    <SelectTrigger className="w-[120px] bg-white border-gray-200">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="5">5 per page</SelectItem>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="20">20 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                        <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 bg-white">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-50">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-gray-700 font-semibold">
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
                                    className="h-24 text-center text-gray-500"
                                >
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : rows.length > 0 ? (
                            rows.map((row) => (
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
                                    className="h-24 text-center text-gray-500"
                                >
                                    No courses found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                        {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                        of {pagination.total} courses
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(1)}
                            disabled={pagination.page === 1 || isLoading}
                            className="border-gray-200 bg-white hover:bg-gray-50"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1 || isLoading}
                            className="border-gray-200 bg-white hover:bg-gray-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <span className="text-sm text-gray-600 px-2">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages || isLoading}
                            className="border-gray-200 bg-white hover:bg-gray-50"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.totalPages)}
                            disabled={pagination.page >= pagination.totalPages || isLoading}
                            className="border-gray-200 bg-white hover:bg-gray-50"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}