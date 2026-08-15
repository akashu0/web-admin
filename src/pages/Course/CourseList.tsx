// pages/Course/CourseList.tsx
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, MoreHorizontal, Pencil, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceTable, type Column } from "@/components/common/ResourceTable";
import { useDebounce } from "@/hooks/use-debounce";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { courseService } from "@/services/courseService";
import type { Course } from "@/types/course";
import { AddCourseModal } from "./AddCourseModal";

const LIMIT = 10;

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

// Card fields live under `overview` — the Go API keeps the document's nesting
// (only the portal list flattens it). Reading them off the row is what left
// every column, image included, blank after the cutover.
const ov = (course: Course) => course.overview ?? ({} as Course["overview"]);

interface CourseFilters {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: 'draft' | 'published';
    stream?: string;
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

    const [filters, setFilters] = useState<CourseFilters>({
        status: 'published',
    });

    useEffect(() => {
        setFilters((prev) => ({ ...prev, search: search || undefined }));
    }, [search]);

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

    const setStream = useCallback((stream: string) => {
        setFilters((prev) => ({ ...prev, stream: stream || undefined }));
    }, []);

    const setStatus = useCallback((status: string) => {
        setFilters((prev) => ({ ...prev, status: status as CourseFilters["status"] }));
    }, []);

    const handleRefresh = () => {
        refreshList();
    };

    const columns: Column<Course>[] = useMemo(() => [
        {
            key: "course",
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
                        <div className="truncate font-medium">{ov(course).courseName || "—"}</div>
                        {course.slug && (
                            <div className="truncate text-xs text-muted-foreground">{course.slug}</div>
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

            <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
                <div className="relative min-w-[200px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select value={filters.status ?? "published"} onValueChange={setStatus}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.stream ?? "__all__"}
                    onValueChange={(value) => setStream(value === "__all__" ? "" : value)}
                >
                    <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="All Streams" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                        <SelectItem value="__all__">All Streams</SelectItem>
                        {STREAM_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <span className="ml-auto pr-1 text-xs text-muted-foreground">
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
