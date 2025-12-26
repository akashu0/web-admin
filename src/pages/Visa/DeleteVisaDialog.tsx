// app/features/visa/components/DeleteVisaDialog.tsx
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
import { visaService } from "../../services/visaService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Visa } from "@/types/visa";

interface DeleteVisaDialogProps {
    isOpen: boolean;
    onClose: () => void;
    visa: Visa | null;
    onSuccess: () => void;
}

export function DeleteVisaDialog({
    isOpen,
    onClose,
    visa,
    onSuccess,
}: DeleteVisaDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);


    const handleDelete = async () => {
        if (!visa) return;

        setIsDeleting(true);

        try {
            await visaService.deleteVisa(visa._id);
            toast.success("Visa deleted successfully");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error deleting visa:", error);
            toast.error("Failed to delete visa");
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
                        This action cannot be undone. This will permanently delete the visa
                        for{" "}
                        <span className="font-semibold text-gray-900">"{visa?.country}"</span>{" "}
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