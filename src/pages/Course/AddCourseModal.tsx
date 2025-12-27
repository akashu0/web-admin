
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { courseService } from "@/services/courseService";
import { toast } from "sonner";
import type { CourseOverview } from "@/types/course";
import { CourseOverviewSection } from "./CourseOverviewSection";

interface AddCourseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function AddCourseModal({
    open,
    onOpenChange,
    onSuccess,
}: AddCourseModalProps) {

    const initialData: CourseOverview = {
        courseName: "",
        headingDescription: "",
        slug: "",
        description: "",
        durationYears: 0,
        durationMonths: 0,
        studyMode: "online",
        studyModeType: "regular",
        awardedBy: "",
        nextIntake: "",
        level: "undergraduate",
        courseImage: null,
        dynamicFields: [],
    };

    const handleSave = async (data: CourseOverview) => {
        try {

            const response = await courseService.createCourseOverview(data);

            toast.success(response.message || "Course created successfully");

            onOpenChange(false);
            onSuccess();

        } catch (error: any) {
            console.error("Error creating course:", error);
            toast.error(error.response?.data?.message || "Failed to create course");
            throw error;
        }
    };

    const handleNext = () => {
        // Close modal after save
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] lg:max-w-[85vw] xl:max-w-[75vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Course</DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    <CourseOverviewSection
                        data={initialData}
                        onSave={handleSave}
                        onNext={handleNext}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}