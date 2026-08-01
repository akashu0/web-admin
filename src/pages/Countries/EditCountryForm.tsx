// pages/CountryEdit/EditCountryPage.tsx
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import type { ICountry } from '@/types/country';
import { countryService } from '@/services/countryService';
import { FormTabs } from './FormTabs';
import { BasicInfoTab } from './BasicInfoTab';
import { CostOfLivingTab } from './CostOfLivingTab';
import { ReferencesTab } from './ReferencesTab';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/common/PageHeader';
import { emptyCountryForm, type CountryFormValues } from './country-form-values';

export type TabType = 'basic' | 'costs' | 'references';

export function EditCountryForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const countryId = id as string;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [country, setCountry] = useState<ICountry | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('basic');
    const [bannerPreview, setBannerPreview] = useState<string>('');
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    const bannerInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<CountryFormValues>({ defaultValues: emptyCountryForm });

    useEffect(() => {
        fetchCountry();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countryId]);

    const fetchCountry = async () => {
        try {
            setIsLoading(true);
            const response = await countryService.getCountryById(countryId);
            const data: ICountry = response.data;
            setCountry(data);
            setBannerPreview(data.banner || '');
            // One reset instead of a setFieldValue per key: it also clears the
            // dirty state, so the form matches what was just loaded.
            form.reset({
                name: data.name ?? '',
                capital: data.capital ?? '',
                continent: data.continent ?? '',
                currency: data.currency ?? '',
                spokenLanguages: data.spokenLanguages ?? '',
                population: data.population ?? '',
                about: data.about ?? '',
                status: data.status ?? 'draft',
                slug: data.slug ?? '',
                costOfLiving: data.costOfLiving ?? [],
                visaProcessDocuments: data.visaProcessDocuments ?? '',
                topUniversities: data.topUniversities ?? [],
                topCourses: data.topCourses ?? [],
            });
        } catch (error) {
            console.error('Error fetching country:', error);
            toast.error('Failed to load country data');
        } finally {
            setIsLoading(false);
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

    const handleClose = () => {
        navigate('/countries'); // Navigate back to countries list
    };

    const handleSaveSection = async () => {
        try {
            setIsSubmitting(true);

            const values = form.getValues();

            switch (activeTab) {
                case 'basic': {
                    const basicData: Record<string, unknown> = {
                        name: values.name,
                        capital: values.capital,
                        continent: values.continent,
                        currency: values.currency,
                        spokenLanguages: values.spokenLanguages,
                        population: values.population,
                        about: values.about,
                        status: values.status,
                        slug: values.slug,
                    };

                    if (bannerFile) basicData.banner = bannerFile;

                    await countryService.updateCountryBasicInfo(countryId, basicData);
                    break;
                }

                case 'costs':
                    await countryService.updateCountryCostOfLiving(countryId, values.costOfLiving);
                    break;

                case 'references':
                    await countryService.updateCountryReferences(countryId, {
                        visaProcessDocuments: values.visaProcessDocuments,
                        topUniversities: values.topUniversities,
                        topCourses: values.topCourses,
                    });
                    break;
            }

            toast.success('Section saved successfully!');
            await fetchCountry(); // Refresh data
        } catch (error) {
            console.error('Error saving section:', error);
            toast.error('Failed to save section. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTabContent = () => {
        if (!country) return null;

        switch (activeTab) {
            case 'basic':
                return (
                    <BasicInfoTab
                        form={form}
                        bannerPreview={bannerPreview}
                        bannerInputRef={bannerInputRef}
                        onImageUpload={handleImageUpload}
                        onRemoveImage={handleRemoveImage}
                    />
                );
            case 'costs':
                return <CostOfLivingTab form={form} />;
            case 'references':
                return <ReferencesTab form={form} />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto size-8 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading country data...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Button variant="ghost" size="sm" onClick={handleClose} className="mb-3 -ml-2">
                <ArrowLeft className="mr-2 size-4" />
                Back to Countries
            </Button>

            <PageHeader
                title={`Edit Country — ${country?.name ?? ''}`}
                subtitle="Update country information and settings"
            />

            <Card className="overflow-hidden p-0">
                <FormTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <div className="p-6">{renderTabContent()}</div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-muted/40 px-6 py-4">
                    <div className="text-muted-foreground">
                        Save changes for <span className="font-medium capitalize">{activeTab}</span> section
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveSection} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {isSubmitting ? 'Saving...' : 'Save Section'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
