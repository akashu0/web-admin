import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { learningCenterService } from "@/services/learningCenterService";
import type { EGLearningCenter } from "./LearningCenterList";

interface DeleteCenterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    center: EGLearningCenter | null;
    onSuccess: () => void;
}

export function DeleteCenterDialog({
    isOpen,
    onClose,
    center,
    onSuccess,
}: DeleteCenterDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);


    const handleDelete = async () => {
        if (!center) return;

        setIsDeleting(true);



        try {
            await learningCenterService.deleteLearningCenter(center.id);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error deleting center:", error);
            // Handle error (you can add toast notification here)
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        center{" "}
                        <span className="font-semibold text-gray-900">
                            "{center?.name}"
                        </span>{" "}
                        and remove all associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}