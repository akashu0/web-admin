// components/LearningCenterForm.tsx
import { useForm } from '@tanstack/react-form';
import type { CreateLearningCenterDto, ProgramDeliveryMode, DocumentRequired } from '../../types/learningCenter';
import { DynamicFieldBuilder } from '@/components/common/DynamicFieldBuilder';
import { useEffect, useState } from 'react';
import { visaService } from '@/services/visaService';
import type { Visa } from '@/types/visa';
import { Loader2, Trash2, Plus, Search } from 'lucide-react';
import { STUDY_ABROAD_COUNTRIES, CURRENCIES } from '@/lib/countryList';

interface LearningCenterFormProps {
    onSubmit: (data: CreateLearningCenterDto) => Promise<void>;
    initialData?: Partial<CreateLearningCenterDto>;
    isSubmitting?: boolean;
}

export const LearningCenterForm: React.FC<LearningCenterFormProps> = ({
    onSubmit,
    initialData,
    isSubmitting
}) => {
    const isEditMode = Boolean(initialData);

    const [countrySearch, setCountrySearch] = useState<string>("");
 const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
    const [visas, setVisas] = useState<Visa[]>([]);4
    const [visaDropdownOpen, setVisaDropdownOpen] = useState(false);
    const [isLoadingVisas, setIsLoadingVisas] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const form = useForm({
        defaultValues: {
            name: initialData?.name || '',
            level: initialData?.level || '',
            location: initialData?.location || '',
            country: initialData?.country || '',
            currency: initialData?.currency || '',
            programs: initialData?.programs || [],
            isActive: initialData?.isActive ?? true,
            visa: initialData?.visa || '',
            documentRequired: initialData?.documentRequired || [],
        } as unknown as CreateLearningCenterDto,
        onSubmit: async ({ value }) => {
            try {
                // ✅ Handle visa field - remove if empty
                const submitData: any = { ...value };

                if (!submitData.visa || submitData.visa.trim() === '') {
                    delete submitData.visa; // Remove visa field if empty
                }

                await onSubmit(submitData);
            } finally {
                // Handle completion
            }
        },
    });

    // ✅ Fetch all visas on mount
    useEffect(() => {
        fetchVisas();
    }, []);

    const fetchVisas = async () => {
        try {
            setIsLoadingVisas(true);
            const response = await visaService.getAllVisasDropdown();
            const visaData = Array.isArray(response) ? response : (response as any)?.data || [];
            setVisas(visaData);
        } catch (error) {
            console.error('Error fetching visas:', error);
            setVisas([]);
        } finally {
            setIsLoadingVisas(false);
        }
    };

    const filteredCountries = STUDY_ABROAD_COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase())
    );

    // Filter visas based on search input
const filteredVisas = visas.filter((v) =>
    v.country.toLowerCase().includes(searchTerm.toLowerCase())
);

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isEditMode ? 'Edit Learning Center' : 'Create Learning Center'}
            </h2>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="space-y-6"
            >
                {/* Basic Information Section */}
                <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name Field */}
                        <form.Field name="name">
                            {(field) => (
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Learning Center Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        placeholder="Enter learning center name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900"
                                        required
                                    />
                                </div>
                            )}
                        </form.Field>

                        {/* ✅ Level Field */}
                        <form.Field name="level">
                            {(field) => (
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Level *
                                    </label>
                                    <input
                                        type="text"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        placeholder="e.g., Undergraduate, Graduate, Diploma"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900"
                                        required
                                    />
                                </div>
                            )}
                        </form.Field>

                        {/* Location Field */}
                        <form.Field name="location">
                            {(field) => (
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        placeholder="Enter location"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900"
                                        required
                                    />
                                </div>
                            )}
                        </form.Field>

                        {/* Country Field */}
<form.Field name="country">
    {(field) => (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-900 mb-2">
                Country *
            </label>

            {/* Display + Search Input */}
            <input
                type="text"
                placeholder="Search or select country..."
                value={countrySearch || field.state.value}   // ← Key Fix
                onChange={(e) => {
                    setCountrySearch(e.target.value);
                    setCountryDropdownOpen(true);
                }}
                onFocus={() => setCountryDropdownOpen(true)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white"
            />

            {/* Dropdown */}
            {countryDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 max-h-60 overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg">
                    {filteredCountries.length > 0 ? (
                        filteredCountries.map((country) => (
                            <div
                                key={country.name}
                                className="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                                onClick={() => {
                                    field.handleChange(country.name);
                                    form.setFieldValue("currency", country.currency);
                                    setCountrySearch(country.name);        // ← Important
                                    setCountryDropdownOpen(false);
                                }}
                            >
                                {country.name}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-6 text-center text-gray-500">
                            No country found
                        </div>
                    )}
                </div>
            )}

            {/* Click outside to close */}
            {countryDropdownOpen && (
                <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setCountryDropdownOpen(false)}
                />
            )}
        </div>
    )}
</form.Field>

                        {/* Currency Field - Dropdown */}
                        <form.Field name="currency">
                            {(field) => (
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Currency *
                                    </label>
                                    <select
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900"
                                        required
                                    >
                                        <option value="">Select currency</option>
                                        {CURRENCIES.map((currency) => (
                                            <option key={currency} value={currency}>
                                                {currency}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </form.Field>

  {/* ✅ Fixed Visa Selection Field */}
<form.Field name="visa">
    {(field) => {
        const selectedVisa = visas.find(v => v._id === field.state.value);

        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                    Visa Process (Optional)
                </label>

                {isLoadingVisas ? (
                    <div className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Loading visas...</span>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Selected Value Display */}
                        <div
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white cursor-pointer flex items-center justify-between hover:border-gray-400"
                            onClick={() => setVisaDropdownOpen(!visaDropdownOpen)}
                        >
                            <span className={field.state.value ? "text-gray-900" : "text-gray-500"}>
                                {selectedVisa 
                                    ? `${selectedVisa.country} `
                                    : "-- Select Visa Process --"
                                }
                            </span>
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>

                        {/* Visa Dropdown */}
                        {visaDropdownOpen && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                                {/* Search Box */}
                                <div className="p-3 border-b bg-gray-50">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by country..."
                                            className="w-full pl-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Results */}
                                <div className="max-h-64 overflow-y-auto">
                                    {filteredVisas.length > 0 ? (
                                        filteredVisas.map((visa) => (
                                            <div
                                                key={visa._id}
                                                className={`px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-none ${
                                                    field.state.value === visa._id ? 'bg-blue-100' : ''
                                                }`}
                                                onClick={() => {
                                                    field.handleChange(visa._id);
                                                    setSearchTerm('');
                                                    setVisaDropdownOpen(false);
                                                }}
                                            >
                                                <div className="font-medium text-gray-900">{visa.country}</div>
                                                <div className="text-sm text-gray-600">
                                                    {visa.visaFee} {visa.currency} • {visa.visaProcessingTime} {visa.visaProcessingTimeUnit}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-6 py-8 text-center text-gray-500">
                                            No matching visa found
                                        </div>
                                    )}
                                </div>

                                {/* Clear Button */}
                                {field.state.value && (
                                    <div className="p-2 border-t bg-gray-50">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                field.handleChange('');
                                                setSearchTerm('');
                                                setVisaDropdownOpen(false);
                                            }}
                                            className="text-sm text-red-600 hover:text-red-700 w-full py-1"
                                        >
                                            Clear Selection
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Click outside handler */}
                {visaDropdownOpen && (
                    <div 
                        className="fixed inset-0 z-10 bg-transparent"
                        onClick={() => setVisaDropdownOpen(false)}
                    />
                )}

                <p className="text-xs text-gray-500 px-1">
                    {field.state.value ? '✓ Visa selected' : 'Type to search visa by country'}
                </p>
            </div>
        );
    }}
</form.Field>
                    </div>

                    {/* IsActive Field */}
                    <form.Field name="isActive">
                        {(field) => (
                            <div className="mt-4 flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.checked)}
                                    className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                                />
                                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                    Active
                                </label>
                            </div>
                        )}
                    </form.Field>
                </div>

                {/* ✅ Documents Required Section */}
                <form.Field name="documentRequired" mode="array">
                    {(field) => (
                        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-900">Documents Required</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newDocument: DocumentRequired = {
                                            id: crypto.randomUUID(),
                                            documentName: '',
                                            description: '',
                                            isMandatory: false,
                                        };
                                        field.pushValue(newDocument);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Document
                                </button>
                            </div>

                            <div className="space-y-4">
                                {field.state.value.map((_, docIndex: number) => (
                                    <div key={docIndex} className="border border-gray-400 rounded-lg p-4 bg-white">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-md font-semibold text-gray-900">Document {docIndex + 1}</h4>
                                            <button
                                                type="button"
                                                onClick={() => field.removeValue(docIndex)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {/* Document Name */}
                                            <form.Field name={`documentRequired[${docIndex}].documentName`}>
                                                {(fieldItem) => (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                                            Document Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={fieldItem.state.value}
                                                            onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                            placeholder="e.g., Passport, Birth Certificate"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                            required
                                                        />
                                                    </div>
                                                )}
                                            </form.Field>

                                            {/* Description */}
                                            <form.Field name={`documentRequired[${docIndex}].description`}>
                                                {(fieldItem) => (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                                            Description
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={fieldItem.state.value}
                                                            onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                            placeholder="Brief description"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                        />
                                                    </div>
                                                )}
                                            </form.Field>
                                        </div>

                                        {/* Is Mandatory Checkbox */}
                                        <form.Field name={`documentRequired[${docIndex}].isMandatory`}>
                                            {(fieldItem) => (
                                                <div className="flex items-center mt-3">
                                                    <input
                                                        type="checkbox"
                                                        id={`doc-mandatory-${docIndex}`}
                                                        checked={fieldItem.state.value}
                                                        onChange={(e) => fieldItem.handleChange(e.target.checked)}
                                                        className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor={`doc-mandatory-${docIndex}`} className="ml-2 block text-sm text-gray-900">
                                                        Mandatory Document
                                                    </label>
                                                </div>
                                            )}
                                        </form.Field>

                                        {/* Hidden ID field */}
                                        <form.Field name={`documentRequired[${docIndex}].id`}>
                                            {(fieldItem) => (
                                                <input type="hidden" value={fieldItem.state.value} />
                                            )}
                                        </form.Field>
                                    </div>
                                ))}

                                {field.state.value.length === 0 && (
                                    <p className="text-gray-600 text-center py-8">
                                        No documents added yet. Click "Add Document" to get started.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </form.Field>

                {/* Programs Section */}
                <form.Field name="programs" mode="array">
                    {(field) => (
                        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-900">Programs</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newProgram: ProgramDeliveryMode = {
                                            modeType: 'Regular',
                                            durationYears: '',
                                            durationMonths: '',
                                            mode: '',
                                            support: '',
                                            feeStructure: {
                                                programTuitionFee: '',
                                                studentVisaFee: '',
                                                accommodation: '',
                                                airportTransfer: '',
                                                tax: '',
                                                applicationFee: '',
                                                dynamicFields: [],
                                            },
                                            isActive: true,
                                        };
                                        field.pushValue(newProgram);
                                    }}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    + Add Program
                                </button>
                            </div>

                            <div className="space-y-6">
                                {field.state.value.map((_, programIndex: number) => (
                                    <div key={programIndex} className="border border-gray-400 rounded-lg p-6 bg-white">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-lg font-semibold text-gray-900">Program {programIndex + 1}</h4>
                                            <button
                                                type="button"
                                                onClick={() => field.removeValue(programIndex)}
                                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Mode Type */}
                                            <form.Field name={`programs[${programIndex}].modeType`}>
                                                {(fieldItem) => (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                                            Mode Type *
                                                        </label>
                                                        <select
                                                            value={fieldItem.state.value}
                                                            onChange={(e) => fieldItem.handleChange(e.target.value as "Express" | "Regular" | "Fast Track")}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                            required
                                                        >
                                                            <option value="Regular">Regular</option>
                                                            <option value="Express">Express</option>
                                                            <option value="Fast Track">Fast Track</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </form.Field>

                                            {/* Duration Fields */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <form.Field name={`programs[${programIndex}].durationYears`}>
                                                    {(fieldItem) => (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                Duration (Years)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={fieldItem.state.value}
                                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                                placeholder="e.g., 0"
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                            />
                                                        </div>
                                                    )}
                                                </form.Field>

                                                <form.Field name={`programs[${programIndex}].durationMonths`}>
                                                    {(fieldItem) => (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                Duration (Months)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={fieldItem.state.value}
                                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                                placeholder="e.g., 0"
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                            />
                                                        </div>
                                                    )}
                                                </form.Field>
                                            </div>

                                            {/* Study Hours, Mode, Support */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <form.Field name={`programs[${programIndex}].mode`}>
                                                    {(fieldItem) => (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                Mode *
                                                            </label>
                                                            <select
                                                                value={fieldItem.state.value}
                                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                                required
                                                            >
                                                                <option value="">Select mode</option>
                                                                <option value="Online">Online</option>
                                                                <option value="OnCampus">On Campus</option>
                                                                <option value="Hybrid">Hybrid</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                </form.Field>

                                                <form.Field name={`programs[${programIndex}].support`}>
                                                    {(fieldItem) => (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                Support *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={fieldItem.state.value}
                                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                                placeholder="e.g., 24/7 Tutor Support"
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                            />
                                                        </div>
                                                    )}
                                                </form.Field>
                                            </div>

                                            {/* Program Active Status */}
                                            <form.Field name={`programs[${programIndex}].isActive`}>
                                                {(fieldItem) => (
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id={`program-active-${programIndex}`}
                                                            checked={fieldItem.state.value}
                                                            onChange={(e) => fieldItem.handleChange(e.target.checked)}
                                                            className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                                                        />
                                                        <label htmlFor={`program-active-${programIndex}`} className="ml-2 block text-sm text-gray-900">
                                                            Program Active
                                                        </label>
                                                    </div>
                                                )}
                                            </form.Field>

                                            {/* Fee Structure Section */}
                                            <div className="mt-6 border border-gray-300 rounded-lg p-4 bg-gray-50">
                                                <h5 className="text-md font-semibold text-gray-900 mb-4">Fee Structure</h5>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {/* Program Tuition Fee */}
                                                    <form.Field name={`programs[${programIndex}].feeStructure.programTuitionFee`}>
                                                        {(fieldItem) => (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                    Annual Tuition Fee *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={fieldItem.state.value}
                                                                    onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                                    placeholder="e.g., 0"
                                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                                    required
                                                                />
                                                            </div>
                                                        )}
                                                    </form.Field>

                                                    {/* Student Visa Fee */}
                                                    <form.Field name={`programs[${programIndex}].feeStructure.studentVisaFee`}>
                                                        {(fieldItem) => (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                    Student Visa Fee
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={fieldItem.state.value}
                                                                    onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                                    placeholder="e.g., 0"
                                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                                />
                                                            </div>
                                                        )}
                                                    </form.Field>

                                                    {/* Accommodation */}
                                                    <form.Field name={`programs[${programIndex}].feeStructure.accommodation`}>
                                                        {(fieldItem) => (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                    Accommodation
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={fieldItem.state.value}
                                                                    onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                                    placeholder="e.g., 0"
                                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                                />
                                                            </div>
                                                        )}
                                                    </form.Field>

                                                    {/* Airport Transfer */}
                                                    <form.Field name={`programs[${programIndex}].feeStructure.airportTransfer`}>
                                                        {(fieldItem) => (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                    Airport Transfer
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={fieldItem.state.value}
                                                                    onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                                    placeholder="e.g., 0"
                                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                                />
                                                            </div>
                                                        )}
                                                    </form.Field>

                                                    {/* Tax */}
                                                    <form.Field name={`programs[${programIndex}].feeStructure.tax`}>
                                                        {(fieldItem) => (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                    Tax
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={fieldItem.state.value}
                                                                    onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                                    placeholder="e.g., 0%"
                                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                                />
                                                            </div>
                                                        )}
                                                    </form.Field>

                                                    {/* Application Fee */}
                                                    <form.Field name={`programs[${programIndex}].feeStructure.applicationFee`}>
                                                        {(fieldItem) => (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                    Application Fee
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={fieldItem.state.value}
                                                                    onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                                    placeholder="e.g., 100 or Free"
                                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                                />
                                                            </div>
                                                        )}
                                                    </form.Field>
                                                </div>

                                                {/* Dynamic Fields */}
                                                <form.Field name={`programs[${programIndex}].feeStructure.dynamicFields`}>
                                                    {(dynamicFieldsField) => (
                                                        <DynamicFieldBuilder
                                                            fields={dynamicFieldsField.state.value || []}
                                                            onChange={(updatedFields) => {
                                                                dynamicFieldsField.handleChange(updatedFields);
                                                            }}
                                                        />
                                                    )}
                                                </form.Field>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {field.state.value.length === 0 && (
                                    <p className="text-gray-600 text-center py-8">
                                        No programs added yet. Click "Add Program" to get started.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </form.Field>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-300">
                    <button
                        type="button"
                        onClick={() => form.reset()}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update' : 'Create')}
                    </button>
                </div>
            </form>
        </div>
    );
};