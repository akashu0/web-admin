// components/CountryForm/FormActions.tsx
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
    isSubmitting: boolean;
    isEditMode: boolean;
    onClose: () => void;
}

export function FormActions({ isSubmitting, isEditMode, onClose }: FormActionsProps) {
    return (
        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isSubmitting
                    ? isEditMode
                        ? 'Updating...'
                        : 'Creating...'
                    : isEditMode
                        ? 'Update Country'
                        : 'Create Country'}
            </Button>
        </div>
    );
}
