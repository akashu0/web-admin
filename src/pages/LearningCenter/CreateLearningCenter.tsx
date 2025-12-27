// pages/LearningCenter/CreateLearningCenter.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { CreateLearningCenterDto, LearningCenter } from "@/types/learningCenter";
import { learningCenterService } from "@/services/learningCenterService";
import { LearningCenterForm } from "./LearningCenterForm";

const CreateLearningCenter = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [initialData, setInitialData] = useState<LearningCenter | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const isEditMode = Boolean(id);

    // Fetch learning center data if in edit mode
    useEffect(() => {
        if (id) {
            fetchLearningCenter(id);
        }
    }, [id]);

    const fetchLearningCenter = async (centerId: string) => {
        setIsFetching(true);
        try {
            const center = await learningCenterService.getLearningCenterById(centerId);
            setInitialData(center);
        } catch (err) {
            console.error("Failed to fetch learning center:", err);
            toast.error("Failed to load learning center", {
                description: err instanceof Error ? err.message : "Please try again later.",
                duration: 5000,
            });
            // Navigate back if center not found
            setTimeout(() => {
                navigate('/learning-centers');
            }, 2000);
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (center: CreateLearningCenterDto): Promise<void> => {
        setIsLoading(true);

        try {
            if (isEditMode && id) {
                // Update existing learning center
                const updatedCenter = await learningCenterService.updateLearningCenter(id, center);

                toast.success("Learning center updated successfully!", {
                    description: `${updatedCenter.name} has been updated.`,
                    duration: 4000,
                });
            } else {
                // Create new learning center
                const createdCenter = await learningCenterService.createLearningCenter(center);

                toast.success("Learning center created successfully!", {
                    description: `${createdCenter.name} has been added to the system.`,
                    duration: 4000,
                });
            }

            // Navigate to learning centers list after 1 second
            setTimeout(() => {
                navigate('/learning-centers');
            }, 1000);

        } catch (err) {
            console.error(`Failed to ${isEditMode ? 'update' : 'create'} learning center:`, err);

            toast.error(`Failed to ${isEditMode ? 'update' : 'create'} learning center`, {
                description: err instanceof Error ? err.message : "Please try again later.",
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <LearningCenterForm
                    onSubmit={handleSubmit}
                    initialData={initialData || undefined}
                    isSubmitting={isLoading}
                />
            </div>
        </div>
    );
};

export default CreateLearningCenter;