// components/CountryForm/FormActions.tsx
interface FormActionsProps {
    isSubmitting: boolean;
    isEditMode: boolean;
    onClose: () => void;
}

export function FormActions({ isSubmitting, isEditMode, onClose }: FormActionsProps) {
    return (
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
            <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isSubmitting
                    ? isEditMode
                        ? 'Updating...'
                        : 'Creating...'
                    : isEditMode
                        ? 'Update Country'
                        : 'Create Country'}
            </button>
        </div>
    );
}