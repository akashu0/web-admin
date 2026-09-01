
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
import { useGuardedDialog } from "@/hooks/use-unsaved-changes";

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
        // Text, not numbers: the model stores duration as a string, and a
        // number here is rejected by POST /courses as invalid_body.
        durationYears: "",
        durationMonths: "",
        studyMode: "online",
        awardedBy: "",
        intakes: [],
        level: "",
        courseImage: null,
        dynamicFields: [],
    };

    const handleSave = async (data: CourseOverview) => {
        try {

            await courseService.createCourseOverview(data);

            toast.success("Course created successfully");

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

    // Clicking the backdrop or pressing Escape used to throw away a filled-in
    // form without a word.
    const guardedOpenChange = useGuardedDialog(onOpenChange);

    return (
        <Dialog open={open} onOpenChange={guardedOpenChange}>
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