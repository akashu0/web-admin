import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    RefreshCcw,
    ChevronDown,
    CheckCircle2,
    FileEdit,
    Search,
    X,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceTable, type Column } from "@/components/common/ResourceTable";
import { FilterSelect } from "@/components/common/FilterSelect";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useDebounce } from "@/hooks/use-debounce";
import { apiErrorMessage } from "@/services/api";
import { vacancyService } from "@/services/vacancyService";
import { PUBLISH_STATUSES } from "@/types/vacancy";
import type {
    Vacancy,
    VacancyFacets,
    VacancyPublishStatus,
    VacancyQueryParams,
} from "@/types/vacancy";

const LIMIT = 10;

type JobFilters = Omit<VacancyQueryParams, "page" | "limit">;

/**
 * The job publishing queue.
 *
 * Jobs are written in the CRM against an employer; this screen decides whether
 * they go live for agents and part-timers. It cannot EDIT one — the CRM owns the
 * content, and two editors would let the same job say different things in two
 * places.
 *
 * The employer is confidential and is not in the payload at all (see
 * services/vacancyService and types/vacancy), so there is no company column here
 * and no way to add one.
 */
export function JobList() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState<Vacancy[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);

    // Keyed by the public reference, so a selection survives a scroll append.
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [filters, setFilters] = useState<JobFilters>({});
    const [searchInput, setSearchInput] = useState("");
    const search = useDebounce(searchInput, 400);

    // Facets come from PUBLISHED rows only, so a country whose single job is
    // still a draft is not offered as a filter that returns nothing.
    const [facets, setFacets] = useState<VacancyFacets>({});

    useEffect(() => {
        setFilters((prev) => ({ ...prev, search: search.trim() || undefined }));
    }, [search]);

    useEffect(() => {
        let stale = false;
        vacancyService
            .facets()
            .then((next) => {
                if (!stale) setFacets(next);
            })
            .catch(() => undefined);
        return () => {
            stale = true;
        };
    }, []);

    const hasActiveFilters = Boolean(
        filters.status || filters.country || filters.jobType || filters.search,
    );

    const setFilter = useCallback(
        (key: keyof JobFilters, value: string | undefined) =>
            setFilters((prev) => ({ ...prev, [key]: value as never })),
        [],
    );

    const clearFilters = useCallback(() => {
        setSearchInput("");
        setFilters({});
    }, []);

    // Distinguishes a filter-driven reset (replace) from a scroll-driven next
    // page (append).
    const isReset = useRef(true);

    const fetchJobs = async (pageNum: number, append: boolean) => {
        if (isFetching) return;
        try {
            setIsFetching(true);
            const response = await vacancyService.list({
                ...filters,
                limit: LIMIT,
                page: pageNum,
            });
            const rows = response.data || [];
            const meta = response.pagination;

            setJobs((prev) => (append ? [...prev, ...rows] : rows));
            setTotal(meta?.total ?? 0);
            setHasMore(
                typeof meta?.hasNextPage === "boolean"
                    ? meta.hasNextPage
                    : pageNum * LIMIT < (meta?.total ?? 0),
            );
        } catch (error) {
            console.error("Error fetching jobs:", error);
            if (!append) setJobs([]);
            // Without this the sentinel refires the failed request forever and
            // stacks a toast each time — see CourseList.
            setHasMore(false);
            toast.error(apiErrorMessage(error, "Failed to fetch jobs"));
        } finally {
            setIsLoading(false);
            setIsFetching(false);
        }
    };

    useEffect(() => {
        isReset.current = true;
        setPage(1);
    }, [filters]);

    useEffect(() => {
        const append = !isReset.current;
        isReset.current = false;
        fetchJobs(page, append);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filters]);

    const sentinelRef = useInfiniteScroll(() => setPage((prev) => prev + 1), {
        hasMore,
        loading: isFetching,
    });

    const refreshList = () => {
        if (page === 1) {
            fetchJobs(1, false);
        } else {
            isReset.current = true;
            setPage(1);
        }
    };

    /**
     * Publish or unpublish. One endpoint for a single row and a selection alike:
     * an updateMany on the server, so the flip never trips validation on a field
     * the publisher was not editing.
     */
    const handleStatusChange = async (ids: string[], status: VacancyPublishStatus) => {
        if (!ids.length) return;
        try {
            await vacancyService.bulkUpdateStatus(ids, status);
            const noun = ids.length === 1 ? "Job" : `${ids.length} jobs`;
            toast.success(status === "published" ? `${noun} published` : `${noun} moved to draft`);
            setSelectedIds([]);
            refreshList();
        } catch (error) {
            console.error("Error updating job status:", error);
            toast.error(apiErrorMessage(error, "Failed to update status"));
        }
    };

    const toggleRow = useCallback((id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    }, []);

    const allShownSelected = jobs.length > 0 && jobs.every((j) => selectedIds.includes(j.vacancyId));

    /** "AED 3,000 – 4,500 per month", or the exact figure, or nothing. */
    const payLabel = (j: Vacancy): string => {
        const p = j.pay;
        if (!p) return "—";
        const amount =
            p.showBy === "exact"
                ? p.exactAmount
                : [p.minAmount, p.maxAmount].filter(Boolean).join(" – ");
        if (!amount) return "—";
        return [p.currency, amount, p.rate].filter(Boolean).join(" ");
    };

    const columns: Column<Vacancy>[] = useMemo(
        () => [
            {
                key: "select",
                sortable: false,
                header: (
                    <Checkbox
                        checked={allShownSelected}
                        onCheckedChange={() =>
                            setSelectedIds(allShownSelected ? [] : jobs.map((j) => j.vacancyId))
                        }
                        aria-label="Select all shown"
                    />
                ),
                className: "w-10",
                render: (j) => (
                    <Checkbox
                        checked={selectedIds.includes(j.vacancyId)}
                        onCheckedChange={() => toggleRow(j.vacancyId)}
                        aria-label={`Select ${j.title}`}
                    />
                ),
            },
            {
                key: "title",
                header: "JOB",
                render: (j) => (
                    <div className="min-w-0">
                        <p className="truncate font-medium">{j.title}</p>
                        <p className="text-xs text-muted-foreground">{j.vacancyId}</p>
                    </div>
                ),
            },
            {
                key: "jobType",
                header: "TYPE",
                render: (j) => j.jobType || "—",
            },
            {
                key: "country",
                header: "LOCATION",
                render: (j) => [j.city, j.country].filter(Boolean).join(", ") || "—",
            },
            {
                key: "pay",
                header: "PAY",
                sortable: false,
                render: payLabel,
            },
            {
                key: "requiredCount",
                header: "NEEDED",
                align: "right",
                render: (j) => j.requiredCount || "—",
            },
            {
                key: "publishStatus",
                header: "STATUS",
                render: (j) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button type="button" aria-label={`Change status of ${j.title}`}>
                                <Badge
                                    tone={j.publishStatus === "published" ? "green" : "neutral"}
                                    className="gap-1"
                                >
                                    {j.publishStatus === "published" ? "Published" : "Draft"}
                                    <ChevronDown className="h-3 w-3" />
                                </Badge>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem
                                disabled={j.publishStatus === "published"}
                                onSelect={() => handleStatusChange([j.vacancyId], "published")}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Publish
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={j.publishStatus === "draft"}
                                onSelect={() => handleStatusChange([j.vacancyId], "draft")}
                            >
                                <FileEdit className="mr-2 h-4 w-4" />
                                Move to draft
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
            {
                key: "actions",
                header: "",
                sortable: false,
                align: "right",
                render: (j) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/jobs/view/${j.vacancyId}`)}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        Review
                    </Button>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [jobs, selectedIds, allShownSelected],
    );

    return (
        <div>
            <PageHeader
                title="Jobs"
                subtitle="Openings raised in the CRM. Publish one to show it to agents and part-timers."
                actions={
                    <Button variant="outline" onClick={refreshList} disabled={isFetching}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                }
            />

            <Card className="mb-4 flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search title, city or reference…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
                <FilterSelect
                    label="Status"
                    value={filters.status}
                    onChange={(v) => setFilter("status", v)}
                    options={PUBLISH_STATUSES}
                    allLabel="All Statuses"
                />
                <FilterSelect
                    label="Country"
                    value={filters.country}
                    onChange={(v) => setFilter("country", v)}
                    options={facets.country ?? []}
                    allLabel="All Countries"
                />
                <FilterSelect
                    label="Type"
                    value={filters.jobType}
                    onChange={(v) => setFilter("jobType", v)}
                    options={facets.jobType ?? []}
                    allLabel="All Types"
                />
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="mr-1 h-4 w-4" />
                        Clear
                    </Button>
                )}
                <span className="ml-auto text-sm text-muted-foreground">
                    {jobs.length} of {total}
                </span>
            </Card>

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
                    rows={jobs}
                    sort={
                        filters.sort ? { field: filters.sort, dir: filters.dir ?? "asc" } : undefined
                    }
                    // The sort lives in `filters` so the reset effect takes the list
                    // back to page one — a new order paged from page 4 is rows from
                    // the middle of a list nobody saw.
                    onSort={(next) =>
                        setFilters((f) => ({ ...f, sort: next?.field, dir: next?.dir }))
                    }
                    isLoading={isLoading}
                    sentinelRef={sentinelRef}
                    isFetchingNextPage={isFetching && jobs.length > 0}
                    hasNextPage={hasMore}
                    onRowClick={(j) => navigate(`/jobs/view/${j.vacancyId}`)}
                    emptyTitle="No jobs yet"
                    emptyDescription="Jobs are drafted on a company record in the CRM. They appear here for publishing."
                />
            </Card>
        </div>
    );
}
