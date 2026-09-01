import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Percent,
    RefreshCcw,
    MoreHorizontal,
    Pencil,
    Trash2,
    ExternalLink,
    ChevronDown,
    Check,
    CheckCircle2,
    FileEdit,
    Search,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { apiErrorMessage } from "@/services/api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceTable, type Column } from "@/components/common/ResourceTable";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useDebounce } from "@/hooks/use-debounce";
import { FilterSelect } from "@/components/common/FilterSelect";
import type { University, UniversityFacets, UniversityQueryParams } from "@/types/university";
import { universityService } from "@/services/universityService";
import { WEBSITE_URL, openUniversityPage } from "@/lib/website";
import { AddUniversityModal } from "./AddUniversityModal";

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
    const [error, setError] = useState<string | null>(null);

    // Bulk-action selection, keyed by _id so it survives infinite-scroll appends.
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [filters, setFilters] = useState<UniversityFilters>({
        status: "all",
    });

    // Search stays free text; everything else is a Select now, because the API
    // filters by exact equality — a typed "london" never matched the stored
    // "London", and Country/City weren't even in the filter allowlist.
    const [searchInput, setSearchInput] = useState("");
    const search = useDebounce(searchInput, 400);

    // The values universities actually carry, narrowed to the chosen country so
    // the City list is that country's cities.
    const [facets, setFacets] = useState<UniversityFacets>({
        countries: [], continents: [], cities: [], universityTypes: [], streams: [],
    });

    useEffect(() => {
        setFilters((prev) => ({
            ...prev,
            search: search.trim() || undefined,
        }));
    }, [search]);

    useEffect(() => {
        let stale = false;
        universityService
            .getFacets(filters.country, filters.status)
            .then((next) => {
                if (stale) return;
                setFacets(next);
                // A city that the newly-chosen country has none of would filter
                // to an empty list with no explanation.
                setFilters((prev) => ({
                    ...prev,
                    city: prev.city && next.cities.includes(prev.city) ? prev.city : undefined,
                }));
            })
            .catch(() => undefined);
        return () => {
            stale = true;
        };
    }, [filters.country, filters.status]);

    const hasActiveFilters = Boolean(
        (filters.status && filters.status !== "all") ||
        filters.country ||
        filters.city ||
        filters.continent ||
        filters.streams ||
        filters.universityType ||
        filters.search
    );

    const setFilter = useCallback(
        (key: keyof UniversityFilters, value: string | undefined) =>
            setFilters((prev) => ({ ...prev, [key]: value })),
        []
    );

    const clearFilters = useCallback(() => {
        setSearchInput("");
        setFilters({ status: "all" });
    }, []);

    // Distinguishes a filter-driven reset (replace list) from a scroll-driven
    // next-page fetch (append to list).
    const isReset = useRef(true);

    // Not memoized: needs the latest `isFetching`/`filters` on every invocation.
    const fetchUniversities = async (pageNum: number, append: boolean) => {
        if (isFetching) return;
        try {
            setIsFetching(true);
            setError(null);
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
            setError(apiErrorMessage(error, "Failed to fetch universities"));
            if (!append) setUniversities([]);
            // See CourseList: without this the sentinel refires the failed
            // request forever and stacks a toast each time.
            setHasMore(false);
            toast.error(apiErrorMessage(error, "Failed to fetch universities"));
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

    // Infinite scroll. The scroll container is AppLayout's <main>, not the
    // window, so the sentinel is observed against that root by the shared hook.
    const sentinelRef = useInfiniteScroll(() => setPage((prev) => prev + 1), {
        hasMore,
        loading: isFetching,
    });

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

    // "View" is the eG website, not a copy of it here. The person entering this
    // data is checking how it comes out on the site, which an admin rendering of
    // the same record can only approximate — and a draft opens through a signed
    // preview link so it can be checked before anyone else can see it.
    const handleView = (university: University) => {
        openUniversityPage(university);
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
            toast.error(apiErrorMessage(error, "Failed to delete university"));
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
            refreshList();
        } catch (error) {
            console.error("Error updating university status:", error);
            toast.error(apiErrorMessage(error, "Failed to update status"));
        }
    };

    const toggleRow = useCallback((id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
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

    const allSelected =
        universities.length > 0 && selectedIds.length === universities.length;

    const columns: Column<University>[] = useMemo(() => [
        {
            key: "select",
            sortable: false,
            header: (
                <Checkbox
                    checked={allSelected}
                    onCheckedChange={(value) =>
                        setSelectedIds(value ? universities.map((u) => u._id) : [])
                    }
                    aria-label="Select all"
                />
            ),
            render: (university) => (
                <Checkbox
                    checked={selectedIds.includes(university._id)}
                    onCheckedChange={() => toggleRow(university._id)}
                    aria-label="Select row"
                    onClick={(e) => e.stopPropagation()}
                />
            ),
        },
        {
            key: "logo",
            sortable: false,
            header: "Logo",
            // A record with no logo usually still has a banner — showing that
            // beats a letter circle, and only a record with neither falls back.
            render: (university) => {
                const thumb = university.logo || university.banner;
                return (
                    <div className="flex items-center justify-center">
                        {thumb ? (
                            <img
                                src={thumb}
                                alt={university.name}
                                className="h-10 w-10 rounded-full border border-border object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                {university.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            key: "name",
            header: "University Name",
            render: (university) => (
                <div className="max-w-xs">
                    <div className="max-w-[140px] truncate font-medium" title={university.name}>
                        {university.name}
                    </div>
                    <div
                        className="max-w-[100px] truncate text-xs text-muted-foreground"
                        title={university.fullName}
                    >
                        {university.fullName}
                    </div>
                </div>
            ),
        },
        {
            key: "location",
            header: "Location",
            render: (university) => (
                <div>
                    <div className="max-w-[150px] truncate font-medium">{university.city}</div>
                    <div className="max-w-[150px] truncate text-xs text-muted-foreground">
                        {university.country}
                    </div>
                </div>
            ),
        },
        {
            key: "founded",
            header: "Founded",
            render: (university) => <span className="tabular-nums">{university.founded || "—"}</span>,
        },
        {
            key: "status",
            header: "Status",
            render: (university) => {
                const status = university.status;
                return (
                    <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button type="button" className="focus:outline-none">
                                    <Badge
                                        tone={status === "published" ? "green" : "neutral"}
                                        className="gap-1"
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
            key: "actions",
            sortable: false,
            header: "Actions",
            align: "right",
            render: (university) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {WEBSITE_URL && (
                                <DropdownMenuItem onSelect={() => handleView(university)}>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    {university.status === "draft"
                                        ? "Preview draft on site"
                                        : "View on website"}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onSelect={() => handleEdit(university)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => handleDelete(university.slug)}
                                className="text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [allSelected, selectedIds, universities, toggleRow]);

    return (
        <div>
            <PageHeader
                title="Universities"
                subtitle="Manage university listings and information"
                actions={
                    <>
                        {/* Commission is edited on each university's own tab;
                            this is the cross-university table. */}
                        <Button variant="outline" onClick={() => navigate("/universities/commission")}>
                            <Percent className="mr-2 h-4 w-4" />
                            All commissions
                        </Button>
                        <Button variant="outline" onClick={handleRefresh} disabled={isFetching}>
                            <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                        <Button onClick={handleAddUniversity}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add University
                        </Button>
                    </>
                }
            />

            {/* Filter bar */}
            <Card className="mb-4 flex flex-wrap items-end gap-3 p-3">
                <div className="relative min-w-[200px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search name, city, country, address..."
                        className="pl-9"
                    />
                </div>

                <FilterSelect
                    label="Status"
                    value={filters.status}
                    onChange={(v) => setFilter("status", v ?? "all")}
                    options={[
                        { value: "all", label: "All Status" },
                        { value: "published", label: "Published" },
                        { value: "draft", label: "Draft" },
                    ]}
                    allLabel="All Status"
                    className="w-[150px]"
                />
                <FilterSelect
                    label="Type"
                    value={filters.universityType}
                    onChange={(v) => setFilter("universityType", v)}
                    options={facets.universityTypes}
                    allLabel="All Types"
                    className="w-[140px]"
                />
                <FilterSelect
                    label="Country"
                    value={filters.country}
                    onChange={(v) => setFilter("country", v)}
                    options={facets.countries}
                    allLabel="All Countries"
                />
                <FilterSelect
                    label="City"
                    value={filters.city}
                    onChange={(v) => setFilter("city", v)}
                    options={facets.cities}
                    allLabel="All Cities"
                    className="w-[160px]"
                />
                <FilterSelect
                    label="Continent"
                    value={filters.continent}
                    onChange={(v) => setFilter("continent", v)}
                    options={facets.continents}
                    allLabel="All Continents"
                    className="w-[150px]"
                />
                <FilterSelect
                    label="Stream"
                    value={filters.streams}
                    onChange={(v) => setFilter("streams", v)}
                    options={facets.streams}
                    allLabel="All Streams"
                    className="w-[210px]"
                />

                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="mr-1 h-4 w-4" />
                        Clear filters
                    </Button>
                )}

                <span className="ml-auto pr-1 text-xs text-muted-foreground">
                    {universities.length} of {total}
                </span>
            </Card>

            {/* Bulk action toolbar - only visible when rows are selected */}
            {selectedIds.length > 0 && (
                <Card className="mb-4 flex flex-wrap items-center gap-3 bg-accent/40 px-4 py-3">
                    <span className="font-medium">{selectedIds.length} selected</span>
                    <div className="ml-auto flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(selectedIds, "published")}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Publish Selected
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(selectedIds, "draft")}
                        >
                            <FileEdit className="mr-2 h-4 w-4" />
                            Move to Draft
                        </Button>
                    </div>
                </Card>
            )}

            <Card className="overflow-hidden">
                <ResourceTable
                    columns={columns}
                    rows={universities}
                    sort={filters.sort ? { field: filters.sort, dir: filters.dir ?? "asc" } : undefined}
                    // The sort lives in `filters` so the existing reset effect
                    // takes the list back to page one — a new order paged from
                    // page 4 is rows from the middle of a list nobody saw.
                    onSort={(next) => setFilters((f) => ({ ...f, sort: next?.field, dir: next?.dir }))}
                    isLoading={isLoading}
                    sentinelRef={sentinelRef}
                    isFetchingNextPage={isFetching && universities.length > 0}
                    hasNextPage={hasMore}
                    emptyTitle={error ? "Failed to load universities" : "No universities found"}
                    emptyDescription={
                        error
                            ? `${error} — try refreshing.`
                            : hasActiveFilters
                                ? "Try adjusting your search or filters."
                                : "Get started by adding your first university."
                    }
                />
            </Card>

            {/* Add Modal */}
            <AddUniversityModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}
