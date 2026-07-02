// components/CountryForm/CountryForm.tsx
import { useState, useRef } from 'react';
import { useForm } from '@tanstack/react-form';
import { countryService } from '@/services/countryService';
import { FormHeader } from './FormHeader';
import { FormActions } from './FormActions';
import { BasicInfoTab } from './BasicInfoTab';

interface CountryFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function CountryForm({ onClose, onSuccess }: CountryFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bannerPreview, setBannerPreview] = useState<string>('');
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    const bannerInputRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        defaultValues: {
            name: '',
            capital: '',
            continent: '',
            currency: '',
            spokenLanguages: '',
            population: '',
            about: '',
            status: 'draft' as 'draft' | 'published',
            slug: '',
        },
        onSubmit: async ({ value }) => {
            try {
                setIsSubmitting(true);

                const formData = new FormData();

                // text fields
                Object.entries(value).forEach(([key, val]) => {
                    if (val !== undefined && val !== null) {
                        formData.append(key, val as string);
                    }
                });



                // files
                if (bannerFile) formData.append('banner', bannerFile);
                await countryService.createCountry(formData);

                onSuccess();
                onClose();
            } catch (error) {
                console.error('Error creating country:', error);
                alert('Failed to create country. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    const handleImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        _type: 'banner'
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setBannerFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setBannerPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (_type: 'banner') => {
        setBannerPreview('');
        setBannerFile(null);
        if (bannerInputRef.current) {
            bannerInputRef.current.value = '';
        }
    };



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
                <FormHeader
                    title="Add New Country"
                    onClose={onClose}
                />

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="flex-1 overflow-y-auto"
                >
                    <div className="p-6">
                        <BasicInfoTab
                            form={form}
                            bannerPreview={bannerPreview}
                            bannerInputRef={bannerInputRef}
                            onImageUpload={handleImageUpload}
                            onRemoveImage={handleRemoveImage}
                        />
                    </div>

                    <FormActions
                        isSubmitting={isSubmitting}
                        isEditMode={false}
                        onClose={onClose}
                    />
                </form>
            </div>
        </div>
    );
}