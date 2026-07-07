// pages/Course/CourseList.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { courseService } from "@/services/courseService";
import type { Course } from "@/types/course";
import { CourseDataTable } from "./CourseDataTable";
import { createColumns } from "./columns";
import { AddCourseModal } from "./AddCourseModal";

const LIMIT = 10;

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

    const [filters, setFilters] = useState<CourseFilters>({
        status: 'published',
    });

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

    // Infinite scroll - this page is rendered inside MainLayout's <main>, but
    // that element only has a min-height (not a fixed height), so the browser
    // window is the actual scroll container.
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

    const setSearch = useCallback((search: string) => {
        setFilters((prev) => ({ ...prev, search: search || undefined }));
    }, []);

    const setSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
        setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    }, []);

    const setStream = useCallback((stream: string) => {
        setFilters((prev) => ({ ...prev, stream: stream || undefined }));
    }, []);

    const handleRefresh = () => {
        refreshList();
    };

    const columns = createColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
    });

    if (isLoading && !courses.length) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isFetching}
                        className="border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                        <RefreshCcw
                            className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </Button>
                    <Button
                        className="bg-gray-900 hover:bg-gray-800 cursor-pointer"
                        onClick={handleAddCourse}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Course
                    </Button>
                </div>
            </div>

            <CourseDataTable
                columns={columns}
                data={courses}
                total={total}
                hasMore={hasMore}
                isLoadingMore={isFetching}
                onSearchChange={setSearch}
                onSortChange={setSort}
                onStreamChange={setStream}
            />

            <AddCourseModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}
