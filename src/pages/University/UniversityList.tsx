import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCcw, Loader2, FileQuestion, MoreHorizontal, Pencil, Trash2, Eye, ChevronDown, Check, CheckCircle2, FileEdit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import type { University, UniversityQueryParams } from "@/types/university";
import { universityService } from "@/services/universityService";
import { UniversityDataTable } from "./UniversityDataTable";
import { AddUniversityModal } from "./AddUniversityModal";
import { ViewUniversityModal } from "./ViewUniversityModal";

const LIMIT = 10;

type UniversityFilters = Omit<UniversityQueryParams, 'page' | 'limit'>;

export function UniversityList() {
    const navigate = useNavigate();

    const [universities, setUniversities] = useState<University[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
    const [error, setError] = useState<boolean>(false);

    // Bulk-action selection: ids lifted from the data table + a signal we bump
    // to clear the table's row selection after a successful bulk update.
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectionResetSignal, setSelectionResetSignal] = useState(0);

    const [filters, setFilters] = useState<UniversityFilters>({
        status: "all",
    });

    // Text-filter inputs are kept local and pushed into `filters` on a short
    // debounce, so typing doesn't fire a request on every keystroke.
    const [countryInput, setCountryInput] = useState("");
    const [cityInput, setCityInput] = useState("");
    const [locationInput, setLocationInput] = useState("");

    useEffect(() => {
        const t = setTimeout(() => {
            setFilters((prev) => ({
                ...prev,
                country: countryInput.trim() || undefined,
                city: cityInput.trim() || undefined,
                location: locationInput.trim() || undefined,
            }));
        }, 400);
        return () => clearTimeout(t);
    }, [countryInput, cityInput, locationInput]);

    const hasActiveFilters = Boolean(
        (filters.status && filters.status !== "all") ||
        filters.country ||
        filters.city ||
        filters.location ||
        filters.universityType ||
        filters.search
    );

    const setStatusFilter = useCallback((value: string) => {
        setFilters((prev) => ({
            ...prev,
            status: value as UniversityFilters["status"],
        }));
    }, []);

    const setTypeFilter = useCallback((value: string) => {
        setFilters((prev) => ({
            ...prev,
            universityType:
                value === "all" ? undefined : (value as "Public" | "Private"),
        }));
    }, []);

    const clearFilters = useCallback(() => {
        setCountryInput("");
        setCityInput("");
        setLocationInput("");
        setFilters((prev) => ({
            status: "all",
            search: prev.search,
            sortBy: prev.sortBy,
            sortOrder: prev.sortOrder,
        }));
    }, []);

    // Distinguishes a filter-driven reset (replace list) from a scroll-driven
    // next-page fetch (append to list).
    const isReset = useRef(true);

    // Not memoized: needs the latest `isFetching`/`filters` on every invocation.
    const fetchUniversities = async (pageNum: number, append: boolean) => {
        if (isFetching) return;
        try {
            setIsFetching(true);
            setError(false);
            const response = await universityService.getAllUniversities({
                ...filters,
                limit: LIMIT,
                page: pageNum,
            });

            const universitiesData = response.data || [];
            const meta = response.pagination;

            setUniversities((prev) => (append ? [...prev, ...universitiesData] : universitiesData));
            setTotal(meta?.total ?? 0);
            setHasMore(
                typeof meta?.hasNextPage === "boolean"
                    ? meta.hasNextPage
                    : pageNum * LIMIT < (meta?.total ?? 0)
            );
        } catch (error) {
            console.error("Error fetching universities:", error);
            setError(true);
            if (!append) setUniversities([]);
            toast.error("Failed to fetch universities");
        } finally {
            setIsLoading(false);
            setIsFetching(false);
        }
    };

    // Reset list when filters change
    useEffect(() => {
        isReset.current = true;
        setPage(1);
    }, [filters]);

    // Fetch on page change (including reset -> page 1)
    useEffect(() => {
        const append = !isReset.current;
        isReset.current = false;
        fetchUniversities(page, append);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filters]);

    // Infinite scroll - this page renders inside MainLayout's <main>, which only
    // has a min-height (not a fixed height), so the window is the real scroller.
    const handleScroll = useCallback(() => {
        if (isFetching || !hasMore) return;
        if (window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 400) {
            setPage((prev) => prev + 1);
        }
    }, [isFetching, hasMore]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    // Re-fetches the current view from page 1, replacing the list. Used after
    // CRUD actions and manual refresh, where neither `page` nor `filters` change.
    const refreshList = () => {
        if (page === 1) {
            fetchUniversities(1, false);
        } else {
            isReset.current = true;
            setPage(1);
        }
    };

    const handleEdit = (university: University) => {
        // Navigate to edit page using slug
        navigate(`/universities/edit/${university.slug}`);
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
            refreshList();
        } catch (error) {
            console.error("Error deleting university:", error);
            toast.error("Failed to delete university");
        }
    };

    // Change status for one or many universities. Routed through the bulk
    // endpoint (updateMany, no doc validation), so it never fails on unrelated
    // required fields being empty — status is independent of the rest of the
    // record and only controls website visibility.
    const handleStatusChange = async (
        ids: string[],
        status: "published" | "draft"
    ) => {
        if (!ids.length) return;
        try {
            await universityService.bulkUpdateStatus(ids, status);
            const noun = ids.length === 1 ? "University" : `${ids.length} universities`;
            toast.success(
                status === "published"
                    ? `${noun} published`
                    : `${noun} moved to draft`
            );
            setSelectedIds([]);
            setSelectionResetSignal((s) => s + 1);
            refreshList();
        } catch (error) {
            console.error("Error updating university status:", error);
            const message = (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message;
            toast.error(message || "Failed to update status");
        }
    };

    const handleSelectionChange = useCallback((ids: string[]) => {
        setSelectedIds(ids);
    }, []);

    const handleRefresh = () => {
        refreshList();
    };

    const handleAddUniversity = () => {
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        refreshList();
    };

    const setSearch = useCallback((search: string) => {
        setFilters((prev) => ({ ...prev, search: search || undefined }));
    }, []);

    const setSort = useCallback((sortBy: string, sortOrder: "asc" | "desc") => {
        setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    }, []);

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
            accessorKey: "logo",
            header: "Logo",
            cell: ({ row }) => {
                const logoUrl = row.getValue("logo") as string;
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
                    <div
                        className="font-medium text-gray-900 truncate max-w-[140px]"
                        title={row.getValue("name")}
                    >
                        {row.getValue("name")}
                    </div>

                    <div
                        className="text-sm text-gray-500 truncate max-w-[100px]"
                        title={row.original.fullName}
                    >
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
                    <div className="font-medium text-gray-900 truncate max-w-[150px]">
                        {row.original.city}
                    </div>
                    <div className="text-gray-500 truncate max-w-[150px]">
                        {row.original.country}
                    </div>
                </div>
            ),
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
                const university = row.original;
                return (
                    <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button type="button" className="focus:outline-none">
                                    <Badge
                                        variant={status === "published" ? "default" : "secondary"}
                                        className={
                                            "cursor-pointer gap-1 " +
                                            (status === "published"
                                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200")
                                        }
                                    >
                                        {status === "published" ? "Published" : "Draft"}
                                        <ChevronDown className="h-3 w-3" />
                                    </Badge>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                    disabled={status === "published"}
                                    onSelect={() => handleStatusChange([university._id], "published")}
                                >
                                    <Check
                                        className={
                                            "mr-2 h-4 w-4 " +
                                            (status === "published" ? "opacity-100" : "opacity-0")
                                        }
                                    />
                                    Published
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    disabled={status === "draft"}
                                    onSelect={() => handleStatusChange([university._id], "draft")}
                                >
                                    <Check
                                        className={
                                            "mr-2 h-4 w-4 " +
                                            (status === "draft" ? "opacity-100" : "opacity-0")
                                        }
                                    />
                                    Draft
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
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
    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
            </div>
        );
    }

    // Error or No universities found state. When filters/search are active we
    // keep the normal layout (so the filter bar stays reachable and the table
    // shows an inline "No results") instead of this full-page empty screen.
    if (error || (!universities.length && !isFetching && !hasActiveFilters)) {
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
                            disabled={isFetching}
                        >
                            <RefreshCcw
                                className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
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
                            <Button onClick={handleRefresh} disabled={isFetching}>
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
                        disabled={isFetching}
                    >
                        <RefreshCcw
                            className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </Button>

                    <Button onClick={handleAddUniversity}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add University
                    </Button>
                </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap items-end gap-3 rounded-md border bg-white p-4">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">Status</label>
                    <Select value={filters.status ?? "all"} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">Type</label>
                    <Select
                        value={filters.universityType ?? "all"}
                        onValueChange={setTypeFilter}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="Public">Public</SelectItem>
                            <SelectItem value="Private">Private</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">Country</label>
                    <Input
                        value={countryInput}
                        onChange={(e) => setCountryInput(e.target.value)}
                        placeholder="e.g. United Kingdom"
                        className="w-[170px]"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">City</label>
                    <Input
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        placeholder="e.g. London"
                        className="w-[150px]"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">Location</label>
                    <Input
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        placeholder="e.g. Downtown"
                        className="w-[150px]"
                    />
                </div>

                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-600">
                        <X className="mr-1 h-4 w-4" />
                        Clear filters
                    </Button>
                )}
            </div>

            {/* Bulk action toolbar - only visible when rows are selected */}
            {selectedIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 rounded-md border bg-gray-50 px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">
                        {selectedIds.length} selected
                    </span>
                    <div className="ml-auto flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 border-green-200 hover:bg-green-50"
                            onClick={() => handleStatusChange(selectedIds, "published")}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Publish Selected
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-yellow-700 border-yellow-200 hover:bg-yellow-50"
                            onClick={() => handleStatusChange(selectedIds, "draft")}
                        >
                            <FileEdit className="mr-2 h-4 w-4" />
                            Move to Draft
                        </Button>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <UniversityDataTable
                columns={columns}
                data={universities}
                total={total}
                hasMore={hasMore}
                isLoadingMore={isFetching}
                onSearchChange={setSearch}
                onSortChange={setSort}
                onSelectionChange={handleSelectionChange}
                resetSelectionSignal={selectionResetSignal}
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
