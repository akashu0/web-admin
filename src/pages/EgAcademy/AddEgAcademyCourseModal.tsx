import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { egAcademyCourseService } from '@/services/egAcademyCourseService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { EgAcademyOverview } from '@/types/egAcademyCourse';
import { EgAcademyOverviewSection } from './EgAcademyOverviewSection';

interface AddEgAcademyCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddEgAcademyCourseModal({
  open,
  onOpenChange,
  onSuccess,
}: AddEgAcademyCourseModalProps) {
  const navigate = useNavigate();

  const initialData: EgAcademyOverview = {
    courseName: '',
    headingDescription: '',
    slug: '',
    description: '',
    durationYears: '',
    durationMonths: '',
    studyMode: 'online',
    awardedBy: '',
    intakes: [],
    level: '',
    stream: '',
    courseImage: null,
  };

  const handleSave = async (data: EgAcademyOverview) => {
    try {
      const response = await egAcademyCourseService.createCourse(data);
      toast.success(response.message || 'Course created successfully');
      onOpenChange(false);
      onSuccess();
      // Navigate to the edit page for the new course
      const slug = response.course.overview?.slug;
      if (slug) {
        navigate(`/eg-academy/courses/${slug}`);
      }
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast.error(error.response?.data?.message || 'Failed to create course');
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-[85vw] xl:max-w-[75vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New eG Academy Course</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <EgAcademyOverviewSection
            data={initialData}
            onSave={handleSave}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
