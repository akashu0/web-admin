// pages/Course/CourseList.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { courseService } from "@/services/courseService";
import type { Course, PaginationMeta, CourseQueryParams } from "@/types/course";
import { CourseDataTable } from "./CourseDataTable";
import { createColumns } from "./columns";
import { AddCourseModal } from "./AddCourseModal";

export function CourseList() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [queryParams, setQueryParams] = useState<CourseQueryParams>({
        page: 1,
        limit: 10,
        status: 'published'
    });

    const fetchCourses = useCallback(async () => {
        try {
            setIsFetching(true);
            const response = await courseService.getAllCourses(queryParams);

            const coursesData = response.data || [];

            const meta: PaginationMeta = {
                page: response.pagination.page,
                limit: response.pagination.limit,
                total: response.pagination.total,
                totalPages: response.pagination.totalPages,
                pages: response.pagination.pages,
                hasNextPage: response.pagination.hasNextPage,
                hasPrevPage: response.pagination.hasPrevPage,
            };

            setCourses(coursesData);
            setPagination(meta);
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error("Failed to fetch courses");
        } finally {
            setIsLoading(false);
            setIsFetching(false);
        }
    }, [queryParams]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

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
                fetchCourses();
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
        fetchCourses();
    };

    const goToPage = useCallback((page: number) => {
        setQueryParams((prev) => ({ ...prev, page }));
    }, []);

    const setPageSize = useCallback((limit: number) => {
        setQueryParams((prev) => ({ ...prev, limit, page: 1 }));
    }, []);

    const setSearch = useCallback((search: string) => {
        setQueryParams((prev) => ({ ...prev, search, page: 1 }));
    }, []);

    const setSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
        setQueryParams((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
    }, []);

    const handleRefresh = () => {
        fetchCourses();
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
                pagination={pagination}
                onPageChange={goToPage}
                onPageSizeChange={setPageSize}
                onSearchChange={setSearch}
                onSortChange={setSort}
                isLoading={isFetching}
            />

            <AddCourseModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}