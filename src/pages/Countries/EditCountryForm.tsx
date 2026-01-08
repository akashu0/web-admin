// pages/CountryEdit/EditCountryPage.tsx
import { useState, useRef, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { useParams, useNavigate } from 'react-router-dom';
import type { ICountry } from '@/types/country';
import { countryService } from '@/services/countryService';
import { FormTabs } from './FormTabs';
import { BasicInfoTab } from './BasicInfoTab';
import { IntakePeriodsTab } from './IntakePeriodsTab';
import { ScholarshipsTab } from './ScholarshipsTab';
import { CostOfLivingTab } from './CostOfLivingTab';
import { ExamsTab } from './ExamsTab';
import { WorkOpportunitiesTab } from './WorkOpportunitiesTab';
import { ReferencesTab } from './ReferencesTab';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export type TabType = 'basic' | 'intakes' | 'scholarships' | 'costs' | 'exams' | 'work' | 'references';

export function EditCountryForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const countryId = id as string;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [country, setCountry] = useState<ICountry | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('basic');
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [bannerPreview, setBannerPreview] = useState<string>('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCountry();
    }, [countryId]);

    const fetchCountry = async () => {
        try {
            setIsLoading(true);
            const response = await countryService.getCountryById(countryId);
            setCountry(response.data);
            setLogoPreview(response.data.logo || '');
            setBannerPreview(response.data.banner || '');
        } catch (error) {
            console.error('Error fetching country:', error);
            toast.error('Failed to load country data');
        } finally {
            setIsLoading(false);
        }
    };

    const form = useForm({
        defaultValues: {
            name: country?.name || '',
            code: country?.code || '',
            capital: country?.capital || '',
            continent: country?.continent || '',
            currency: country?.currency || '',
            spokenLanguages: country?.spokenLanguages || '',
            population: country?.population || '',
            about: country?.about || '',
            status: country?.status || 'draft',
            slug: country?.slug || '',
            intakePeriods: country?.intakePeriods || [],
            scholarships: country?.scholarships || [],
            costOfLiving: country?.costOfLiving || [],
            examsEligibility: country?.examsEligibility || [],
            workOpportunities: country?.workOpportunities || [],
            visaProcessDocuments: country?.visaProcessDocuments || '',
            topUniversities: country?.topUniversities || [],
            topCourses: country?.topCourses || [],
        },
    });

    // Update form when country data loads
    useEffect(() => {
        if (country) {
            form.setFieldValue('name', country.name);
            form.setFieldValue('code', country.code);
            form.setFieldValue('capital', country.capital);
            form.setFieldValue('continent', country.continent);
            form.setFieldValue('currency', country.currency);
            form.setFieldValue('spokenLanguages', country.spokenLanguages);
            form.setFieldValue('population', country.population);
            form.setFieldValue('about', country.about);
            form.setFieldValue('status', country.status);
            form.setFieldValue('slug', country.slug);
            form.setFieldValue('intakePeriods', country.intakePeriods);
            form.setFieldValue('scholarships', country.scholarships);
            form.setFieldValue('costOfLiving', country.costOfLiving);
            form.setFieldValue('examsEligibility', country.examsEligibility);
            form.setFieldValue('workOpportunities', country.workOpportunities);
            form.setFieldValue('visaProcessDocuments', country.visaProcessDocuments);
            form.setFieldValue('topUniversities', country.topUniversities);
            form.setFieldValue('topCourses', country.topCourses);
        }
    }, [country]);

    const handleImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'logo' | 'banner'
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === 'logo') {
            setLogoFile(file);
        } else {
            setBannerFile(file);
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === 'logo') {
                setLogoPreview(reader.result as string);
            } else {
                setBannerPreview(reader.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (type: 'logo' | 'banner') => {
        if (type === 'logo') {
            setLogoPreview('');
            setLogoFile(null);
            if (logoInputRef.current) {
                logoInputRef.current.value = '';
            }
        } else {
            setBannerPreview('');
            setBannerFile(null);
            if (bannerInputRef.current) {
                bannerInputRef.current.value = '';
            }
        }
    };

    const handleClose = () => {
        navigate('/countries'); // Navigate back to countries list
    };

    const handleSaveSection = async () => {
        try {
            setIsSubmitting(true);

            const values = form.state.values;

            switch (activeTab) {
                case 'basic':
                    const basicData: any = {
                        name: values.name,
                        code: values.code,
                        capital: values.capital,
                        continent: values.continent,
                        currency: values.currency,
                        spokenLanguages: values.spokenLanguages,
                        population: values.population,
                        about: values.about,
                        status: values.status,
                        slug: values.slug,
                    };

                    if (logoFile) basicData.logo = logoFile;
                    if (bannerFile) basicData.banner = bannerFile;

                    await countryService.updateCountryBasicInfo(countryId, basicData);
                    break;

                case 'intakes':
                    await countryService.updateCountryIntakePeriods(countryId, values.intakePeriods);
                    break;

                case 'scholarships':
                    await countryService.updateCountryScholarships(countryId, values.scholarships);
                    break;

                case 'costs':
                    await countryService.updateCountryCostOfLiving(countryId, values.costOfLiving);
                    break;

                case 'exams':
                    await countryService.updateCountryExams(countryId, values.examsEligibility);
                    break;

                case 'work':
                    await countryService.updateCountryWorkOpportunities(countryId, values.workOpportunities);
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
                        logoPreview={logoPreview}
                        bannerPreview={bannerPreview}
                        logoInputRef={logoInputRef}
                        bannerInputRef={bannerInputRef}
                        onImageUpload={handleImageUpload}
                        onRemoveImage={handleRemoveImage}
                    />
                );
            case 'intakes':
                return <IntakePeriodsTab form={form} />;
            case 'scholarships':
                return <ScholarshipsTab form={form} />;
            case 'costs':
                return <CostOfLivingTab form={form} />;
            case 'exams':
                return <ExamsTab form={form} />;
            case 'work':
                return <WorkOpportunitiesTab form={form} />;
            case 'references':
                return <ReferencesTab form={form} />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white rounded-lg p-8 shadow-lg">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading country data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-6">
                    <button
                        onClick={handleClose}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Countries</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Edit Country - {country?.name}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Update country information and settings
                    </p>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-lg shadow-sm">
                    <FormTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    <div className="p-6">
                        {renderTabContent()}
                    </div>

                    {/* Action Buttons */}
                    <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between items-center rounded-b-lg">
                        <div className="text-sm text-gray-600">
                            Save changes for <span className="font-medium capitalize">{activeTab}</span> section
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="px-6 py-2 border border-gray-300 cursor-pointer rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveSection}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-gray-900 text-white cursor-pointer rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting && (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                )}
                                {isSubmitting ? 'Saving...' : 'Save Section'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}