// components/LearningCenterForm.tsx
import { useForm } from '@tanstack/react-form';
import type { CreateLearningCenterDto, ProgramDeliveryMode, } from '../../types/learningCenter';
import { DynamicFieldBuilder } from '@/components/common/DynamicFieldBuilder';
import { useEffect, useState } from 'react';
import { visaService } from '@/services/visaService';
import type { Visa } from '@/types/visa';
import { Loader2 } from 'lucide-react';

interface LearningCenterFormProps {
    onSubmit: (data: CreateLearningCenterDto) => Promise<void>;
    initialData?: Partial<CreateLearningCenterDto>;
    isSubmitting?: boolean;
}




// Study abroad countries with their currencies
const STUDY_ABROAD_COUNTRIES = [
    // 🌍 Africa
    { name: "Afghanistan", currency: "AFN" },
    { name: "Albania", currency: "ALL" },
    { name: "Algeria", currency: "DZD" },
    { name: "Angola", currency: "AOA" },
    { name: "Benin", currency: "XOF" },
    { name: "Botswana", currency: "BWP" },
    { name: "Burkina Faso", currency: "XOF" },
    { name: "Burundi", currency: "BIF" },
    { name: "Cameroon", currency: "XAF" },
    { name: "Cape Verde", currency: "CVE" },
    { name: "Central African Republic", currency: "XAF" },
    { name: "Chad", currency: "XAF" },
    { name: "Comoros", currency: "KMF" },
    { name: "Congo", currency: "XAF" },
    { name: "DR Congo", currency: "CDF" },
    { name: "Djibouti", currency: "DJF" },
    { name: "Egypt", currency: "EGP" },
    { name: "Equatorial Guinea", currency: "XAF" },
    { name: "Eritrea", currency: "ERN" },
    { name: "Ethiopia", currency: "ETB" },
    { name: "Gabon", currency: "XAF" },
    { name: "Gambia", currency: "GMD" },
    { name: "Ghana", currency: "GHS" },
    { name: "Guinea", currency: "GNF" },
    { name: "Kenya", currency: "KES" },
    { name: "Lesotho", currency: "LSL" },
    { name: "Liberia", currency: "LRD" },
    { name: "Libya", currency: "LYD" },
    { name: "Madagascar", currency: "MGA" },
    { name: "Malawi", currency: "MWK" },
    { name: "Mali", currency: "XOF" },
    { name: "Mauritania", currency: "MRU" },
    { name: "Mauritius", currency: "MUR" },
    { name: "Malta", currency: "EUR" },
    { name: "Morocco", currency: "MAD" },
    { name: "Mozambique", currency: "MZN" },
    { name: "Namibia", currency: "NAD" },
    { name: "Niger", currency: "XOF" },
    { name: "Nigeria", currency: "NGN" },
    { name: "Rwanda", currency: "RWF" },
    { name: "Senegal", currency: "XOF" },
    { name: "Sierra Leone", currency: "SLL" },
    { name: "Somalia", currency: "SOS" },
    { name: "South Africa", currency: "ZAR" },
    { name: "South Sudan", currency: "SSP" },
    { name: "Sudan", currency: "SDG" },
    { name: "Tanzania", currency: "TZS" },
    { name: "Togo", currency: "XOF" },
    { name: "Tunisia", currency: "TND" },
    { name: "Uganda", currency: "UGX" },
    { name: "Zambia", currency: "ZMW" },
    { name: "Zimbabwe", currency: "ZWL" },

    // 🌍 Europe
    { name: "Albania", currency: "ALL" },
    { name: "Austria", currency: "EUR" },
    { name: "Belgium", currency: "EUR" },
    { name: "Bosnia and Herzegovina", currency: "BAM" },
    { name: "Bulgaria", currency: "BGN" },
    { name: "Croatia", currency: "EUR" },
    { name: "Czech Republic", currency: "CZK" },
    { name: "Denmark", currency: "DKK" },
    { name: "Estonia", currency: "EUR" },
    { name: "Finland", currency: "EUR" },
    { name: "France", currency: "EUR" },
    { name: "Germany", currency: "EUR" },
    { name: "Greece", currency: "EUR" },
    { name: "Hungary", currency: "HUF" },
    { name: "Iceland", currency: "ISK" },
    { name: "Ireland", currency: "EUR" },
    { name: "Italy", currency: "EUR" },
    { name: "Latvia", currency: "EUR" },
    { name: "Lithuania", currency: "EUR" },
    { name: "Luxembourg", currency: "EUR" },
    { name: "Netherlands", currency: "EUR" },
    { name: "Norway", currency: "NOK" },
    { name: "Poland", currency: "PLN" },
    { name: "Portugal", currency: "EUR" },
    { name: "Romania", currency: "RON" },
    { name: "Slovakia", currency: "EUR" },
    { name: "Slovenia", currency: "EUR" },
    { name: "Spain", currency: "EUR" },
    { name: "Sweden", currency: "SEK" },
    { name: "Switzerland", currency: "CHF" },
    { name: "United Kingdom", currency: "GBP" },

    // 🌏 Asia
    { name: "India", currency: "INR" },
    { name: "China", currency: "CNY" },
    { name: "Japan", currency: "JPY" },
    { name: "South Korea", currency: "KRW" },
    { name: "Pakistan", currency: "PKR" },
    { name: "Bangladesh", currency: "BDT" },
    { name: "Sri Lanka", currency: "LKR" },
    { name: "Nepal", currency: "NPR" },
    { name: "Bhutan", currency: "BTN" },
    { name: "Myanmar", currency: "MMK" },
    { name: "Thailand", currency: "THB" },
    { name: "Vietnam", currency: "VND" },
    { name: "Malaysia", currency: "MYR" },
    { name: "Singapore", currency: "SGD" },
    { name: "Indonesia", currency: "IDR" },
    { name: "Philippines", currency: "PHP" },
    { name: "Cambodia", currency: "KHR" },
    { name: "Laos", currency: "LAK" },
    { name: "Mongolia", currency: "MNT" },
    { name: "Saudi Arabia", currency: "SAR" },
    { name: "United Arab Emirates", currency: "AED" },
    { name: "Qatar", currency: "QAR" },
    { name: "Kuwait", currency: "KWD" },
    { name: "Oman", currency: "OMR" },
    { name: "Israel", currency: "ILS" },
    { name: "Turkey", currency: "TRY" },

    // 🌎 Americas
    { name: "United States", currency: "USD" },
    { name: "Canada", currency: "CAD" },
    { name: "Mexico", currency: "MXN" },
    { name: "Brazil", currency: "BRL" },
    { name: "Argentina", currency: "ARS" },
    { name: "Chile", currency: "CLP" },
    { name: "Colombia", currency: "COP" },
    { name: "Peru", currency: "PEN" },
    { name: "Venezuela", currency: "VES" },

    // 🌏 Oceania
    { name: "Australia", currency: "AUD" },
    { name: "New Zealand", currency: "NZD" },
    { name: "Fiji", currency: "FJD" },
    { name: "Papua New Guinea", currency: "PGK" }
];

// All available currencies (ISO 4217)
const CURRENCIES = [
    // Major
    "USD", "EUR", "GBP", "JPY", "CNY", "CHF", "CAD", "AUD", "NZD",

    // Asia
    "INR", "PKR", "BDT", "LKR", "NPR", "BTN",
    "MMK", "THB", "VND", "MYR", "SGD", "IDR",
    "PHP", "KHR", "LAK", "MNT", "KRW", "HKD",
    "TWD", "JPY",

    // Middle East
    "AED", "SAR", "QAR", "KWD", "OMR", "BHD",
    "ILS", "TRY", "IRR", "IQD", "JOD", "LBP",
    "YER",

    // Europe (non-EUR)
    "SEK", "NOK", "DKK", "ISK", "PLN", "CZK",
    "HUF", "RON", "BGN", "ALL", "BAM", "MKD",
    "RSD", "UAH", "BYN", "MDL", "GEL", "AMD",
    "AZN", "RUB",

    // Africa
    "ZAR", "NGN", "EGP", "KES", "UGX", "TZS",
    "GHS", "ETB", "MAD", "DZD", "TND", "LYD",
    "SDG", "SSP", "ZMW", "ZWL", "MWK", "MUR",
    "NAD", "BWP", "XOF", "XAF", "CDF", "RWF",
    "BIF", "SLL", "SOS", "DJF", "KMF", "CVE",

    // Americas
    "MXN", "BRL", "ARS", "CLP", "COP", "PEN",
    "UYU", "PYG", "BOB", "VES", "CRC", "GTQ",
    "HNL", "NIO", "PAB", "DOP", "HTG", "JMD",
    "TTD", "BBD", "BSD", "XCD", "GYD", "SRD",

    // Oceania
    "FJD", "PGK", "SBD", "VUV", "WST", "TOP",

    // Special / shared
    "XPF", "XAF", "XOF", "XCD"
];

export const LearningCenterForm: React.FC<LearningCenterFormProps> = ({
    onSubmit,
    initialData,
    isSubmitting
}) => {
    const isEditMode = Boolean(initialData);

    const [countrySearch, setCountrySearch] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [visas, setVisas] = useState<Visa[]>([]);
    const [isLoadingVisas, setIsLoadingVisas] = useState(true);

    const form = useForm({
        defaultValues: {
            name: initialData?.name || '',
            location: initialData?.location || '',
            country: initialData?.country || '',
            currency: initialData?.currency || '',
            programs: initialData?.programs || [],
            isActive: initialData?.isActive ?? true,
            visa: initialData?.visa || '',
        } as unknown as CreateLearningCenterDto,
        onSubmit: async ({ value }) => {
            try {
                await onSubmit(value);
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
            const response = await visaService.getAllVisas({ status: 'active' });
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

                        {/* Country Field - Dropdown */}
                        <form.Field name="country">
                            {(field) => (
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Country *
                                    </label>

                                    {/* Search Input */}
                                    <input
                                        type="text"
                                        placeholder="Search country..."
                                        value={countrySearch}
                                        onChange={(e) => {
                                            setCountrySearch(e.target.value);
                                            setIsDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-1 focus:ring-2 focus:ring-gray-900"
                                    />

                                    {/* Dropdown List */}
                                    {isDropdownOpen && (
                                        <div className="absolute z-10 w-full max-h-48 overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg">
                                            {filteredCountries.map((country) => (
                                                <div
                                                    key={country.name}
                                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                                    onClick={() => {
                                                        field.handleChange(country.name);
                                                        form.setFieldValue("currency", country.currency);
                                                        setCountrySearch(country.name);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                >
                                                    {country.name}
                                                </div>
                                            ))}

                                            {filteredCountries.length === 0 && (
                                                <div className="px-4 py-2 text-gray-500">
                                                    No country found
                                                </div>
                                            )}
                                        </div>
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

                        {/* ✅ Visa Selection Field - Shows ALL visas */}
                        <form.Field name="visa">
                            {(field) => (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Visa Process (Optional)
                                    </label>

                                    {isLoadingVisas ? (
                                        <div className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                            <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-600">Loading visas...</span>
                                        </div>
                                    ) : (
                                        <select
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900"
                                        >
                                            <option value="">Select visa process (optional)</option>
                                            {visas.map((visa) => (
                                                <option key={visa._id} value={visa._id}>
                                                    {visa.country} - {visa.visaFee} {visa.currency} ({visa.visaProcessingTime} {visa.visaProcessingTimeUnit})
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {visas.length === 0 && !isLoadingVisas && (
                                        <p className="text-sm text-amber-600 mt-1">
                                            ⚠️ No visa processes available. You may need to create one first.
                                        </p>
                                    )}

                                    <p className="text-sm text-gray-500 mt-1">
                                        Choose a visa process that applies to this learning center
                                    </p>
                                </div>
                            )}
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