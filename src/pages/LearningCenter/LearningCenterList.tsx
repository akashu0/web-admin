import { useEffect, useState } from "react";
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Search,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

import { DeleteCenterDialog } from "./DeleteCenterDialog";
import { useNavigate } from "react-router-dom";
import { learningCenterService } from "@/services/learningCenterService";

/* ================= TYPES ================= */

export interface EGLearningCenter {
    id: string;
    name: string;
    level: string;
    location: string;
    country: string;
    currency: string;
    createdAt: string;
    isActive?: boolean;
}

interface PaginationData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/* ================= COMPONENT ================= */

export default function LearningCenterList() {
    const navigate = useNavigate();
    const [centers, setCenters] = useState<EGLearningCenter[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
    });
    const [deletingCenter, setDeletingCenter] =
        useState<EGLearningCenter | null>(null);

    /* ================= FETCH ================= */

    useEffect(() => {
        fetchCenters();
    }, [pagination.page, pagination.limit]); // ✅ Refetch when page or limit changes

    const fetchCenters = async () => {
        try {
            setIsLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
            };
            const data = await learningCenterService.getAllLearningCenters(params);
            setCenters(data.data);
            setPagination(prev => ({
                ...prev,
                total: data.pagination.total,
                totalPages: data.pagination.totalPages,
                hasNextPage: data.pagination.hasNextPage,
                hasPrevPage: data.pagination.hasPrevPage,
            }));
        } catch (error) {
            console.error("Error fetching learning centers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditCenter = (center: EGLearningCenter) => {
        navigate(`/learning-centers/edit/${center.id}`);
    };

    /* ================= COLUMNS ================= */

    const columns: ColumnDef<EGLearningCenter>[] = [
        {
            id: "serialNo",
            header: "S.No",
            cell: ({ row }) => {
                const serialNo = (pagination.page - 1) * pagination.limit + row.index + 1;
                return <div className="font-medium">{serialNo}</div>;
            },
        },
        {
            accessorKey: "name",
            header: "Center Name",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("name")}</div>
            ),
        },
        {
            accessorKey: "level",
            header: "Level",
        },
        {
            accessorKey: "location",
            header: "Location",
        },
        {
            accessorKey: "country",
            header: "Country",
        },
        {
            accessorKey: "currency",
            header: "Currency",
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue<boolean>("isActive");
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status === true
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                            }`}
                    >
                        {status ? "Active" : "Inactive"}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const center = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCenter(center)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setDeletingCenter(center)}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    /* ================= TABLE ================= */

    const table = useReactTable({
        data: centers,
        columns,
        manualPagination: true,
        pageCount: pagination.totalPages,
        state: {
            sorting,
            columnFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    /* ================= PAGINATION HANDLERS ================= */

    const goToFirstPage = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const goToLastPage = () => {
        setPagination(prev => ({ ...prev, page: prev.totalPages }));
    };

    const goToPreviousPage = () => {
        setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }));
    };

    const goToNextPage = () => {
        setPagination(prev => ({
            ...prev,
            page: Math.min(prev.totalPages, prev.page + 1)
        }));
    };

    const changePageSize = (newLimit: number) => {
        setPagination(prev => ({
            ...prev,
            page: 1, // Reset to first page when changing page size
            limit: newLimit
        }));
    };

    /* ================= UI ================= */

    const handleAddCenter = () => {
        navigate("/learning-centers/new");
    };

    // Calculate display range
    const startIndex = (pagination.page - 1) * pagination.limit + 1;
    const endIndex = Math.min(pagination.page * pagination.limit, pagination.total);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            EG Learning Centers
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage all EG learning centers
                        </p>
                    </div>
                    <Button onClick={handleAddCenter}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Center
                    </Button>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search by center name..."
                        value={
                            (table.getColumn("name")?.getFilterValue() as string) ?? ""
                        }
                        onChange={(e) =>
                            table.getColumn("name")?.setFilterValue(e.target.value)
                        }
                        className="pl-9"
                    />
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-white shadow">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((group) => (
                                <TableRow key={group.id}>
                                    {group.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {flexRender(
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
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <Loader2 className="inline h-6 w-6 animate-spin text-purple-600" />
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
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
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No learning centers found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t px-6 py-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-700">
                                    Rows per page
                                </p>
                                <Select
                                    value={pagination.limit.toString()}
                                    onValueChange={(value) => changePageSize(Number(value))}
                                >
                                    <SelectTrigger className="h-8 w-[70px]">
                                        <SelectValue placeholder={pagination.limit.toString()} />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        {[10, 20, 30, 40, 50].map((pageSize) => (
                                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                                {pageSize}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="text-sm text-gray-700">
                                {pagination.total > 0 ? (
                                    <>
                                        Showing{" "}
                                        <span className="font-medium">{startIndex}</span> to{" "}
                                        <span className="font-medium">{endIndex}</span> of{" "}
                                        <span className="font-medium">{pagination.total}</span>{" "}
                                        results
                                    </>
                                ) : (
                                    "No results"
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToFirstPage}
                                disabled={!pagination.hasPrevPage}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPreviousPage}
                                disabled={!pagination.hasPrevPage}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-1">
                                <div className="text-sm font-medium">
                                    Page {pagination.page} of {pagination.totalPages || 1}
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToNextPage}
                                disabled={!pagination.hasNextPage}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToLastPage}
                                disabled={!pagination.hasNextPage}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete */}
            <DeleteCenterDialog
                isOpen={!!deletingCenter}
                center={deletingCenter}
                onClose={() => setDeletingCenter(null)}
                onSuccess={fetchCenters}
            />
        </div>
    );
}