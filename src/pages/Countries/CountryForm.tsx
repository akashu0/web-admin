// components/CountryForm/CountryForm.tsx
import { useState, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useGuardedDialog, useSectionGuard } from '@/hooks/use-unsaved-changes';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { countryService } from '@/services/countryService';
import { FormActions } from './FormActions';
import { BasicInfoTab } from './BasicInfoTab';
import { emptyCountryForm, type CountryFormValues } from './country-form-values';

interface CountryFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function CountryForm({ onClose, onSuccess }: CountryFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bannerPreview, setBannerPreview] = useState<string>('');
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    const bannerInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<CountryFormValues>({ defaultValues: emptyCountryForm });

    const values = useWatch({ control: form.control });
    useSectionGuard({
        id: 'country.new',
        label: 'New country',
        value: { values, bannerFile },
        onSave: () => form.handleSubmit(onSubmit)(),
        onRestore: () => {
            form.reset(emptyCountryForm);
            handleRemoveImage();
        },
    });

    const guardedClose = useGuardedDialog((open) => { if (!open) onClose(); });

    const onSubmit = async (value: CountryFormValues) => {
        try {
            setIsSubmitting(true);

            const formData = new FormData();

            // Only the basic-info fields exist on create; the array sections are
            // edited afterwards through their own PATCH endpoints.
            (
                [
                    'name',
                    'capital',
                    'continent',
                    'currency',
                    'spokenLanguages',
                    'population',
                    'about',
                    'status',
                    'slug',
                ] as const
            ).forEach((key) => {
                const val = value[key];
                if (val !== undefined && val !== null) formData.append(key, String(val));
            });

            if (bannerFile) formData.append('banner', bannerFile);
            await countryService.createCountry(formData);

            toast.success('Country created');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating country:', error);
            toast.error('Failed to create country. Please try again.');
            // Rethrown so the guard cannot close the dialog over a failed create.
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setBannerFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setBannerPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setBannerPreview('');
        setBannerFile(null);
        if (bannerInputRef.current) {
            bannerInputRef.current.value = '';
        }
    };

    return (
        <Dialog open onOpenChange={guardedClose}>
            <DialogContent className="max-h-[95vh] gap-0 overflow-hidden p-0 sm:max-w-4xl">
                <DialogHeader className="border-b border-border px-6 py-4">
                    <DialogTitle className="text-h2">Add New Country</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-h-[80vh] flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto p-6">
                        <BasicInfoTab
                            form={form}
                            bannerPreview={bannerPreview}
                            bannerInputRef={bannerInputRef}
                            onImageUpload={handleImageUpload}
                            onRemoveImage={handleRemoveImage}
                        />
                    </div>

                    <FormActions isSubmitting={isSubmitting} isEditMode={false} onClose={onClose} />
                </form>
            </DialogContent>
        </Dialog>
    );
}
