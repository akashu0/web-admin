import { useState, useEffect, useRef, useCallback } from 'react';
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
import type { EgAcademyCourse, EgAcademyQueryParams } from '@/types/egAcademyCourse';
import { AddEgAcademyCourseModal } from './AddEgAcademyCourseModal';

const LIMIT = 10;

type EgAcademyFilters = Omit<EgAcademyQueryParams, 'page' | 'limit'>;

export function EgAcademyCourseList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<EgAcademyCourse[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const [filters, setFilters] = useState<EgAcademyFilters>({});

  // Distinguishes a filter-driven reset (replace list) from a scroll-driven
  // next-page fetch (append to list).
  const isReset = useRef(true);

  // Not memoized: needs the latest `isFetching`/`filters` on every invocation.
  const fetchCourses = async (pageNum: number, append: boolean) => {
    if (isFetching) return;
    try {
      setIsFetching(true);
      const response = await egAcademyCourseService.getAllCourses({
        ...filters,
        limit: LIMIT,
        page: pageNum,
      });

      const coursesData = response.data || [];
      const meta = response.pagination;

      setCourses((prev) => (append ? [...prev, ...coursesData] : coursesData));
      setTotal(meta?.total ?? 0);
      setHasMore(
        typeof meta?.hasNextPage === 'boolean'
          ? meta.hasNextPage
          : pageNum * LIMIT < (meta?.total ?? 0)
      );
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput || undefined }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Infinite scroll - this page renders inside MainLayout's <main>, which only
  // has a min-height (not a fixed height), so the window is the real scroller.
  const handleScroll = useCallback(() => {
    if (isFetching || !hasMore) return;
    if (window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 400) {
      setPage((prev) => prev + 1);
    }
  }, [isFetching, hasMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      refreshList();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.dismiss(loadingToastId);
      toast.error('Failed to delete course');
    }
  };

  const setStream = (stream: string) => {
    setFilters(prev => ({ ...prev, stream: stream || undefined }));
  };

  const handleRefresh = () => {
    refreshList();
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
            onClick={handleRefresh}
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
          value={filters.stream ?? '__all__'}
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
          value={filters.status ?? '__all__'}
          onValueChange={v =>
            setFilters(prev => ({ ...prev, status: v === '__all__' ? undefined : (v as 'draft' | 'published') }))
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

      {/* Results summary */}
      <p className="text-sm text-gray-600">
        Showing {courses.length} of {total} courses
      </p>

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
                  {isFetching ? 'Loading...' : 'No courses found'}
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

      {/* Infinite scroll status */}
      {courses.length > 0 && isFetching && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading more courses...
        </div>
      )}
      {courses.length > 0 && !hasMore && !isFetching && (
        <div className="py-4 text-center text-sm text-gray-400">
          All {total} courses loaded
        </div>
      )}

      <AddEgAcademyCourseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={refreshList}
      />
    </div>
  );
}
