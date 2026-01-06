import { useState, useEffect, useTransition, useMemo } from "react";
import { Plus, RefreshCcw, Loader2, FileQuestion, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import type { University, PaginationMeta, UniversityQueryParams } from "@/types/university";
import { universityService } from "@/services/universityService";
import { UniversityDataTable } from "./UniversityDataTable";
import { AddUniversityModal } from "./AddUniversityModal";
import { ViewUniversityModal } from "./ViewUniversityModal";

export function UniversityList() {
    const [isPending, startTransition] = useTransition();

    const [universities, setUniversities] = useState<University[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
    const [error, setError] = useState<boolean>(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [queryParams, setQueryParams] = useState<UniversityQueryParams>({
        page: 1,
        limit: 10,
        status: "all",
    });

    const fetchUniversities = async () => {
        startTransition(async () => {
            try {
                setError(false);
                const response = await universityService.getAllUniversities(queryParams);

                setUniversities(response.data);

                const meta: PaginationMeta = {
                    page: response.pagination.page,
                    limit: response.pagination.limit,
                    total: response.pagination.total,
                    totalPages: response.pagination.totalPages,
                    currentPage: response.pagination.page,
                    itemsPerPage: response.pagination.limit,
                    totalItems: response.pagination.total,
                    hasNextPage: response.pagination.hasNextPage,
                    hasPrevPage: response.pagination.hasPrevPage,
                };

                setPagination(meta);
            } catch (error) {
                console.error("Error fetching universities:", error);
                setError(true);
                setUniversities([]);
                setPagination(null);
                toast.error("Failed to fetch universities");
            } finally {
                setIsInitialLoad(false);
            }
        });
    };

    useEffect(() => {
        fetchUniversities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams.page, queryParams.limit, queryParams.status, queryParams.search, queryParams.sortBy, queryParams.sortOrder]);

    const handleEdit = (university: University) => {
        window.location.href = `/universities/edit/${university.slug}`;
    };

    const handleView = (university: University) => {
        setSelectedUniversity(university);
        setIsViewModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this university?")) {
            return;
        }

        try {
            await universityService.deleteUniversity(id);
            toast.success("University deleted successfully");
            fetchUniversities();
        } catch (error) {
            console.error("Error deleting university:", error);
            toast.error("Failed to delete university");
        }
    };

    const handleRefresh = () => {
        fetchUniversities();
    };

    const handleAddUniversity = () => {
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        fetchUniversities();
    };

    const updateQueryParams = (updates: Partial<UniversityQueryParams>) => {
        setQueryParams((prev) => ({
            ...prev,
            ...updates,
            page: updates.page ?? (updates.search || updates.sortBy ? 1 : prev.page),
        }));
    };

    const goToPage = (page: number) => updateQueryParams({ page });
    const setPageSize = (limit: number) => updateQueryParams({ limit, page: 1 });
    const setSearch = (search: string) => updateQueryParams({ search, page: 1 });
    const setSort = (sortBy: string, sortOrder: "asc" | "desc") =>
        updateQueryParams({ sortBy, sortOrder, page: 1 });

    // Use useMemo to prevent columns from being recreated on every render
    const columns: ColumnDef<University>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    onClick={(e) => e.stopPropagation()}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "logoUrl",
            header: "Logo",
            cell: ({ row }) => {
                const logoUrl = row.getValue("logoUrl") as string;
                return (
                    <div className="flex items-center justify-center">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={row.original.name}
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-medium">
                                {row.original.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "name",
            header: "University Name",
            cell: ({ row }) => (
                <div className="max-w-xs">
                    <div className="font-medium text-gray-900">{row.getValue("name")}</div>
                    <div className="text-sm text-gray-500 truncate">
                        {row.original.fullName}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900">{row.original.city}</div>
                    <div className="text-gray-500">{row.original.country}</div>
                </div>
            ),
        },
        {
            accessorKey: "rank",
            header: "Ranking",
            cell: ({ row }) => {
                const rank = row.getValue("rank") as string;
                return rank ? (
                    <Badge variant="secondary" className="font-mono">
                        #{rank}
                    </Badge>
                ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                );
            },
        },
        {
            accessorKey: "totalStudents",
            header: "Students",
            cell: ({ row }) => {
                const total = row.getValue("totalStudents") as string;
                const international = row.original.internationalStudents;
                return (
                    <div className="text-sm">
                        <div className="font-medium text-gray-900">{total || "N/A"}</div>
                        {international && (
                            <div className="text-gray-500 text-xs">
                                {international} international
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "founded",
            header: "Founded",
            cell: ({ row }) => {
                const founded = row.getValue("founded") as string;
                return (
                    <div className="text-sm text-gray-900">{founded || "N/A"}</div>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <Badge
                        variant={status === "published" ? "default" : "secondary"}
                        className={
                            status === "published"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        }
                    >
                        {status === "published" ? "Published" : "Draft"}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const university = row.original;

                return (
                    <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onSelect={() => handleView(university)}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onSelect={() => handleEdit(university)}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onSelect={() => handleDelete(university.slug)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ], []);

    // Initial loading state
    if (isInitialLoad && isPending) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
            </div>
        );
    }

    // Error or No universities found state
    if (error || (!universities.length && !isPending)) {
        return (
            <div className="space-y-8 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Universities</h1>
                        <p className="text-gray-600 mt-1">
                            Manage university listings and information
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={isPending}
                        >
                            <RefreshCcw
                                className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`}
                            />
                            Refresh
                        </Button>

                        <Button onClick={handleAddUniversity}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add University
                        </Button>
                    </div>
                </div>

                {/* Empty State */}
                <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <FileQuestion className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {error ? "Failed to Load Universities" : "No Universities Found"}
                    </h3>
                    <p className="text-gray-600 mb-6 text-center max-w-md">
                        {error
                            ? "There was an error loading universities. Please try refreshing the page."
                            : "Get started by adding your first university to the system."}
                    </p>
                    <div className="flex gap-3">
                        {error ? (
                            <Button onClick={handleRefresh} disabled={isPending}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                        ) : (
                            <Button onClick={handleAddUniversity}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First University
                            </Button>
                        )}
                    </div>
                </div>

                {/* Add Modal */}
                <AddUniversityModal
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    onSuccess={handleModalSuccess}
                />

                <ViewUniversityModal
                    open={isViewModalOpen}
                    onOpenChange={setIsViewModalOpen}
                    university={selectedUniversity}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Universities</h1>
                    <p className="text-gray-600 mt-1">
                        Manage university listings and information
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isPending}
                    >
                        <RefreshCcw
                            className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </Button>

                    <Button onClick={handleAddUniversity}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add University
                    </Button>
                </div>
            </div>

            {/* Data Table */}
            <UniversityDataTable
                columns={columns}
                data={universities}
                pagination={pagination}
                onPageChange={goToPage}
                onPageSizeChange={setPageSize}
                onSearchChange={setSearch}
                onSortChange={setSort}
                isLoading={isPending}
            />

            {/* Add Modal */}
            <AddUniversityModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSuccess={handleModalSuccess}
            />

            {/* View Modal */}
            <ViewUniversityModal
                university={selectedUniversity}
                open={isViewModalOpen}
                onOpenChange={setIsViewModalOpen}
            />
        </div>
    );
}