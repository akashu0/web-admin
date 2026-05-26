import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, RefreshCcw, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { egAcademyCourseService } from '@/services/egAcademyCourseService';
import { STREAM_OPTIONS } from '@/types/egAcademyCourse';
import type { EgAcademyCourse, EgAcademyPaginationMeta, EgAcademyQueryParams } from '@/types/egAcademyCourse';
import { AddEgAcademyCourseModal } from './AddEgAcademyCourseModal';

export function EgAcademyCourseList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<EgAcademyCourse[]>([]);
  const [pagination, setPagination] = useState<EgAcademyPaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const [queryParams, setQueryParams] = useState<EgAcademyQueryParams>({
    page: 1,
    limit: 10,
  });

  const fetchCourses = useCallback(async () => {
    try {
      setIsFetching(true);
      const response = await egAcademyCourseService.getAllCourses(queryParams);
      setCourses(response.data || []);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setQueryParams(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleEdit = (course: EgAcademyCourse) => {
    navigate(`/eg-academy/courses/${course.overview.slug}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    const loadingToastId = toast.loading('Deleting course...');
    try {
      await egAcademyCourseService.deleteCourse(id);
      toast.dismiss(loadingToastId);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.dismiss(loadingToastId);
      toast.error('Failed to delete course');
    }
  };

  const setStream = (stream: string) => {
    setQueryParams(prev => ({ ...prev, stream: stream || undefined, page: 1 }));
  };

  const goToPage = (page: number) => {
    setQueryParams(prev => ({ ...prev, page }));
  };

  if (isLoading && !courses.length) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">eG Academy Courses</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchCourses}
            disabled={isFetching}
            className="border-gray-200 bg-white hover:bg-gray-50"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            className="bg-gray-900 hover:bg-gray-800"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search by name, slug, or awarded by..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={queryParams.stream ?? '__all__'}
          onValueChange={v => setStream(v === '__all__' ? '' : v)}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filter by stream" />
          </SelectTrigger>
          <SelectContent className="bg-white max-h-60">
            <SelectItem value="__all__">All Streams</SelectItem>
            {STREAM_OPTIONS.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={queryParams.status ?? '__all__'}
          onValueChange={v =>
            setQueryParams(prev => ({ ...prev, status: v === '__all__' ? undefined : (v as 'draft' | 'published'), page: 1 }))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="__all__">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Course Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Stream</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Level</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Centers</th>
              <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  No courses found
                </td>
              </tr>
            ) : (
              courses.map(course => (
                <tr key={course._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{course.overview.courseName}</p>
                      <p className="text-xs text-gray-500">{course.overview.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-[180px] truncate">
                    {course.overview.stream || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {course.overview.level || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        course.status === 'published'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }
                    >
                      {course.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {course.learningCenters?.length ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(course)}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(course._id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} courses
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={!pagination.hasPrevPage || isFetching}
            >
              Previous
            </Button>
            <span className="text-sm px-3 py-1.5 text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={!pagination.hasNextPage || isFetching}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AddEgAcademyCourseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={fetchCourses}
      />
    </div>
  );
}
