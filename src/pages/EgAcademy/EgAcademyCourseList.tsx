import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, RefreshCcw, Pencil, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { PageHeader } from '@/components/common/PageHeader';
import { ResourceTable, type Column } from '@/components/common/ResourceTable';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
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
      // Without this the scroll sentinel refires the failed request forever.
      setHasMore(false);
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

  const handleEdit = (course: EgAcademyCourse) => {
    navigate(`/eg-academy/courses/${course.slug}`);
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

  const columns: Column<EgAcademyCourse>[] = useMemo(() => [
    {
      key: 'courseName',
      header: 'Course Name',
      render: (course) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{course.overview.courseName}</p>
          <p className="truncate text-xs text-muted-foreground">{course.slug}</p>
        </div>
      ),
    },
    {
      key: 'stream',
      header: 'Stream',
      render: (course) => (
        <span className="block max-w-[180px] truncate">{course.overview.stream || '—'}</span>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      render: (course) => <span>{course.overview.level || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (course) => (
        <Badge tone={course.status === 'published' ? 'green' : 'neutral'}>{course.status}</Badge>
      ),
    },
    {
      key: 'centers',
      header: 'Centers',
      render: (course) => (
        <span className="tabular-nums">{course.learningCenters?.length ?? 0}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (course) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/eg-academy/courses/view/${course.slug}`)}
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(course)} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(course._id)}
            title="Delete"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  return (
    <div>
      <PageHeader
        title="eG Academy Courses"
        subtitle="Academy catalog and learning centers"
        actions={
          <>
            <Button variant="outline" onClick={handleRefresh} disabled={isFetching}>
              <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </>
        }
      />

      {/* Filters */}
      <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, slug, or awarded by..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.stream ?? '__all__'}
          onValueChange={v => setStream(v === '__all__' ? '' : v)}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filter by stream" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
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
          <SelectContent>
            <SelectItem value="__all__">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
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

      <AddEgAcademyCourseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={refreshList}
      />
    </div>
  );
}
