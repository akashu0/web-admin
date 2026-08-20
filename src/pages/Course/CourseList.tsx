// pages/Course/CourseList.tsx
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, MoreHorizontal, Pencil, Plus, RefreshCcw, Search, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceTable, type Column } from "@/components/common/ResourceTable";
import { useDebounce } from "@/hooks/use-debounce";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { courseService, type CourseFacets } from "@/services/courseService";
import { useCountryNames } from "@/hooks/useCountryNames";
import { FilterSelect } from "@/components/common/FilterSelect";
import type { Course } from "@/types/course";
import { AddCourseModal } from "./AddCourseModal";

const LIMIT = 10;

// Duration is a scale, not a vocabulary: it is asked in months and the API
// resolves it against whichever of durationMonths/durationYears the record
// actually filled in. The raw facet mixes both units in one list, so it cannot
// be used here — these are the same steps the website offers.
const DURATION_OPTIONS = [
    { value: '6', label: '6 months' },
    { value: '9', label: '9 months' },
    { value: '12', label: '1 year' },
    { value: '24', label: '2 years' },
    { value: '36', label: '3 years' },
    { value: '48', label: '4 years' },
    { value: '60', label: '5 years' },
] as const;

// These four labels are a mapping, not stored values — the API translates each
// one onto a university type or a fee type. Keep them in step with
// scholarshipFilter() in eg-api's course_http.go.
const SCHOLARSHIP_OPTIONS = [
    'Public Universities',
    'Private Universities',
    'Tuition Fee Sponsored',
    'Fully Funded',
] as const;

// Card fields live under `overview` — the Go API keeps the document's nesting
// (only the portal list flattens it). Reading them off the row is what left
// every column, image included, blank after the cutover.
const ov = (course: Course) => course.overview ?? ({} as Course["overview"]);

interface CourseFilters {
    search?: string;
    status?: 'draft' | 'published' | 'all';
    stream?: string;
    country?: string;
    level?: string;
    studyMode?: string;
    awardedBy?: string;
    duration?: string;
    scholarship?: string;
}

export function CourseList() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const search = useDebounce(searchInput, 500);

    // All, not published: a course the editor has just created is a DRAFT (the
    // API defaults every new record to one), and defaulting to published hid it
    // from the list it lands on — so nobody could reach its University tab.
    const [filters, setFilters] = useState<CourseFilters>({
        status: 'all',
    });

    // The values that actually occur, narrowed to the chosen country. Options
    // come from here rather than from an enum: most records say "undergraduate"
    // and "offline", neither of which any enum in this repo contains, so a
    // hardcoded list would offer choices that return nothing.
    const [facets, setFacets] = useState<CourseFacets>({
        levels: [], studyModes: [], streams: [], awardedBy: [], durations: [],
    });
    const countries = useCountryNames();

    useEffect(() => {
        setFilters((prev) => ({ ...prev, search: search || undefined }));
    }, [search]);

    useEffect(() => {
        let stale = false;
        courseService
            .getFacets(filters.country)
            .then((next) => {
                if (stale) return;
                setFacets(next);
                // A sub-filter that the new country does not offer would return
                // an empty list forever, with no clue why. Drop it.
                setFilters((prev) => ({
                    ...prev,
                    level: prev.level && next.levels.includes(prev.level) ? prev.level : undefined,
                    studyMode: prev.studyMode && next.studyModes.includes(prev.studyMode) ? prev.studyMode : undefined,
                    stream: prev.stream && next.streams.includes(prev.stream) ? prev.stream : undefined,
                    awardedBy: prev.awardedBy && next.awardedBy.includes(prev.awardedBy) ? prev.awardedBy : undefined,
                }));
            })
            .catch(() => undefined);
        return () => {
            stale = true;
        };
    }, [filters.country]);

    // Distinguishes a filter-driven reset (replace list) from a scroll-driven
    // next-page fetch (append to list).
    const isReset = useRef(true);

    // Not memoized on purpose: it needs to read the latest `isFetching`/`filters`
    // on every call (guard against overlapping requests), which a useCallback
    // closure would otherwise capture stale values for.
    const fetchCourses = async (pageNum: number, append: boolean) => {
        if (isFetching) return;
        try {
            setIsFetching(true);
            const response = await courseService.getAllCourses({
                ...filters,
                limit: LIMIT,
                page: pageNum,
            });

            const coursesData = response.data || [];
            const meta = response.pagination;

            setCourses((prev) => (append ? [...prev, ...coursesData] : coursesData));
            setTotal(meta?.total ?? 0);
            setHasMore(
                typeof meta?.hasNextPage === "boolean"
                    ? meta.hasNextPage
                    : pageNum * LIMIT < (meta?.total ?? 0)
            );
        } catch (error) {
            console.error("Error fetching courses:", error);
            // Stop the scroll sentinel: it is sitting in an empty viewport, and
            // a `hasMore` left at true means it refires this failed request on
            // every intersection — one error toast per frame.
            setHasMore(false);
            toast.error("Failed to fetch courses");
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
        fetchCourses(page, append);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filters]);

    // Infinite scroll against AppLayout's <main>, which is the scroll container.
    const sentinelRef = useInfiniteScroll(() => setPage((prev) => prev + 1), {
        hasMore,
        loading: isFetching,
    });

    // Re-fetches the current view from page 1, replacing the list. Used after
    // CRUD actions and manual refresh, where neither `page` nor `filters` change.
    const refreshList = () => {
        if (page === 1) {
            fetchCourses(1, false);
        } else {
            isReset.current = true;
            setPage(1);
        }
    };

    const handleEdit = (course: Course) => {
        navigate(`/courses/${course.slug}`);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this course?")) {
            const loadingToastId = toast.loading("Deleting course...");
            try {
                await courseService.deleteCourse(id);
                toast.dismiss(loadingToastId);
                toast.success("Course deleted successfully");
                refreshList();
            } catch (error) {
                console.error("Error deleting course:", error);
                toast.dismiss(loadingToastId);
                toast.error("Failed to delete course");
            }
        }
    };

    const handleAddCourse = () => {
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        refreshList();
    };

    const setFilter = useCallback(
        (key: keyof CourseFilters, value: string | undefined) =>
            setFilters((prev) => ({ ...prev, [key]: value })),
        []
    );

    const clearFilters = useCallback(() => {
        setSearchInput("");
        setFilters({ status: 'all' });
    }, []);

    // `status` always has a value, so it is not what makes the bar "active".
    const hasActiveFilters = Boolean(
        searchInput || filters.country || filters.level || filters.studyMode ||
        filters.stream || filters.awardedBy || filters.duration || filters.scholarship ||
        filters.status !== 'all'
    );

    const handleRefresh = () => {
        refreshList();
    };

    const columns: Column<Course>[] = useMemo(() => [
        {
            key: "course",
            // The table lays out automatically, so without a width bound the
            // longest course name widens this column until the whole table
            // scrolls sideways — `truncate` alone has nothing to clamp against.
            className: "max-w-[320px]",
            header: "Course",
            render: (course) => (
                <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border">
                        <img
                            src={(ov(course).courseImage as string) || "/placeholder-course.jpg"}
                            alt={ov(course).courseName || "Course"}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="truncate font-medium" title={ov(course).courseName}>
                            {ov(course).courseName || "—"}
                        </div>
                        {course.slug && (
                            <div className="truncate text-xs text-muted-foreground" title={course.slug}>
                                {course.slug}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: "awardedBy",
            header: "Awarded By",
            render: (course) => <span className="capitalize">{ov(course).awardedBy || "—"}</span>,
        },
        {
            key: "level",
            header: "Level",
            render: (course) => <span className="capitalize">{ov(course).level || "—"}</span>,
        },
        {
            key: "studyMode",
            header: "Study Mode",
            render: (course) => <span className="capitalize">{ov(course).studyMode || "—"}</span>,
        },
        {
            key: "status",
            header: "Status",
            render: (course) => {
                const status = course.status || "draft";
                return (
                    <Badge tone={status === "published" ? "green" : "neutral"}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                );
            },
        },
        {
            key: "actions",
            header: "",
            align: "right",
            render: (course) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/courses/view/${course.slug}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(course)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleDelete(course._id)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], []);

    return (
        <div>
            <PageHeader
                title="Courses"
                subtitle="Course catalog published to the website"
                actions={
                    <>
                        <Button variant="outline" onClick={handleRefresh} disabled={isFetching}>
                            <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                        <Button onClick={handleAddCourse}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Course
                        </Button>
                    </>
                }
            />

            <Card className="mb-4 flex flex-wrap items-end gap-3 p-3">
                <div className="relative min-w-[200px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <FilterSelect
                    label="Status"
                    value={filters.status}
                    onChange={(v) => setFilter("status", v ?? "all")}
                    options={[
                        { value: "all", label: "All" },
                        { value: "published", label: "Published" },
                        { value: "draft", label: "Draft" },
                    ]}
                    allLabel="All"
                    className="w-[130px]"
                />
                <FilterSelect
                    label="Country"
                    value={filters.country}
                    onChange={(v) => setFilter("country", v)}
                    options={countries}
                    allLabel="All Countries"
                />
                <FilterSelect
                    label="Level"
                    value={filters.level}
                    onChange={(v) => setFilter("level", v)}
                    options={facets.levels}
                    allLabel="All Levels"
                    className="w-[180px]"
                />
                <FilterSelect
                    label="Study Mode"
                    value={filters.studyMode}
                    onChange={(v) => setFilter("studyMode", v)}
                    options={facets.studyModes}
                    allLabel="All Modes"
                    className="w-[140px]"
                />
                <FilterSelect
                    label="Stream"
                    value={filters.stream}
                    onChange={(v) => setFilter("stream", v)}
                    options={facets.streams}
                    allLabel="All Streams"
                    className="w-[210px]"
                />
                <FilterSelect
                    label="Awarded By"
                    value={filters.awardedBy}
                    onChange={(v) => setFilter("awardedBy", v)}
                    options={facets.awardedBy}
                    allLabel="All Awarding Bodies"
                    className="w-[210px]"
                />
                <FilterSelect
                    label="Duration"
                    value={filters.duration}
                    onChange={(v) => setFilter("duration", v)}
                    options={DURATION_OPTIONS}
                    allLabel="Any Duration"
                    className="w-[140px]"
                />
                <FilterSelect
                    label="Scholarship"
                    value={filters.scholarship}
                    onChange={(v) => setFilter("scholarship", v)}
                    options={SCHOLARSHIP_OPTIONS}
                    allLabel="Any"
                    className="w-[190px]"
                />

                {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                        <X className="mr-1 size-4" />
                        Clear filters
                    </Button>
                )}

                <span className="ml-auto pb-2 pr-1 text-xs text-muted-foreground">
                    {courses.length} of {total}
                </span>
            </Card>

            <Card className="overflow-hidden">
                <ResourceTable
                    columns={columns}
                    rows={courses}
                    isLoading={isLoading}
                    sentinelRef={sentinelRef}
                    isFetchingNextPage={isFetching && courses.length > 0}
                    hasNextPage={hasMore}
                    emptyTitle="No courses found"
                    emptyDescription="Try adjusting your search or filters."
                />
            </Card>

            <AddCourseModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}
