import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, FileText, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { egAcademyCourseService } from '@/services/egAcademyCourseService';
import type { EgAcademyCourse, EgAcademyOverview } from '@/types/egAcademyCourse';
import { EgAcademyOverviewSection } from './EgAcademyOverviewSection';
import { EgAcademyLearningCentersSection } from './EgAcademyLearningCentersSection';
import { useUnsavedContext, useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { UnsavedBar } from '@/components/common/UnsavedBar';

type ActiveTab = 'overview' | 'learningCenters';

interface SidebarItem {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  { id: 'overview', label: 'Course Overview', icon: <FileText className="h-4 w-4" /> },
  { id: 'learningCenters', label: 'Learning Centers', icon: <MapPin className="h-4 w-4" /> },
];

export default function EditEgAcademyCourse() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState<EgAcademyCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isPublishing, setIsPublishing] = useState(false);
  // Keyed onto the sections so a refetch re-seeds their forms from the server
  // rather than leaving them showing what was typed — the same counter
  // EditCourse and EditUniversity use.
  const [version, setVersion] = useState(0);
  const { requestLeave } = useUnsavedContext();
  const { dirty } = useUnsavedChanges();

  useEffect(() => {
    if (!slug) {
      toast.error('Course slug is required');
      navigate('/eg-academy/courses');
      return;
    }
    fetchCourseData();
  }, [slug, navigate]);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      const data = await egAcademyCourseService.getCourseBySlug(slug!);
      setCourseData(data);
      setVersion(v => v + 1);
    } catch (error: any) {
      console.error('Error fetching course:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch course');
      navigate('/eg-academy/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const newStatus = courseData?.status === 'published' ? 'draft' : 'published';
      await egAcademyCourseService.updateStatus(slug!, newStatus);
      setCourseData(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(
        `Course ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`
      );
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleOverviewSave = async (data: EgAcademyOverview) => {
    try {
      const updated = await egAcademyCourseService.updateOverview(slug!, data);
      toast.success('Course overview updated successfully');
      // The API renames the slug when the course name changes.
      const newSlug = updated.slug;
      if (newSlug && newSlug !== slug) {
        navigate(`/eg-academy/courses/${newSlug}`, { replace: true });
      } else {
        await fetchCourseData();
      }
    } catch (error: any) {
      console.error('Error updating overview:', error);
      toast.error(error.response?.data?.message || 'Failed to update overview');
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Course not found</p>
      </div>
    );
  }

  return (
    <div className="-m-4 flex h-[calc(100dvh-3.5rem)] bg-canvas lg:-m-5">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border overflow-y-auto shrink-0">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Edit Course</h2>
          <p
            className="text-sm text-muted-foreground mt-1 truncate"
            title={courseData.overview.courseName}
          >
            {courseData.overview.courseName}
          </p>
        </div>

        <nav className={cn('p-4 space-y-1 transition-opacity', dirty && 'opacity-60')}>
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => requestLeave(() => setActiveTab(item.id))}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Update course information and publish when ready
              </p>
            </div>

            <Button
              onClick={() => requestLeave(handlePublish)}
              disabled={isPublishing}
              className={cn(
                'gap-2',
                courseData.status === 'published'
                  ? 'bg-muted-foreground hover:bg-primary'
                  : 'bg-primary hover:bg-primary/90'
              )}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {courseData.status === 'published' ? 'Unpublish' : 'Publish Course'}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-5xl mx-auto space-y-4">
          <UnsavedBar />
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            {activeTab === 'overview' && (
              <EgAcademyOverviewSection
                key={version}
                data={courseData.overview}
                onSave={handleOverviewSave}
                onNext={() => setActiveTab('learningCenters')}
              />
            )}

            {activeTab === 'learningCenters' && (
              <EgAcademyLearningCentersSection
                key={version}
                slug={slug!}
                learningCenters={courseData.learningCenters || []}
                onRefresh={fetchCourseData}
              />
            )}
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
