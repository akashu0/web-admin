// components/LearningCenterForm.tsx
import { useForm } from '@tanstack/react-form';
import type { CreateLearningCenterDto, ProgramDeliveryMode, DynamicField } from '../../types/learningCenter';

interface LearningCenterFormProps {
    onSubmit: (data: CreateLearningCenterDto) => Promise<void>;
    initialData?: Partial<CreateLearningCenterDto>;
    isSubmitting?: boolean;
}

// Study abroad countries with their currencies
const STUDY_ABROAD_COUNTRIES = [
    { name: 'United Kingdom', currency: 'GBP' },
    { name: 'United States', currency: 'USD' },
    { name: 'Canada', currency: 'CAD' },
    { name: 'Australia', currency: 'AUD' },
    { name: 'Germany', currency: 'EUR' },
    { name: 'France', currency: 'EUR' },
    { name: 'Ireland', currency: 'EUR' },
    { name: 'Netherlands', currency: 'EUR' },
    { name: 'Switzerland', currency: 'CHF' },
    { name: 'Sweden', currency: 'SEK' },
    { name: 'Denmark', currency: 'DKK' },
    { name: 'Norway', currency: 'NOK' },
    { name: 'New Zealand', currency: 'NZD' },
    { name: 'Singapore', currency: 'SGD' },
    { name: 'Japan', currency: 'JPY' },
    { name: 'South Korea', currency: 'KRW' },
    { name: 'Spain', currency: 'EUR' },
    { name: 'Italy', currency: 'EUR' },
];

// All available currencies
const CURRENCIES = [
    'USD', 'GBP', 'EUR', 'CAD', 'AUD', 'NZD', 'SGD', 'JPY', 'KRW',
    'CHF', 'SEK', 'DKK', 'NOK', 'INR', 'CNY', 'HKD'
];

export const LearningCenterForm: React.FC<LearningCenterFormProps> = ({
    onSubmit,
    initialData,
    isSubmitting
}) => {
    const isEditMode = Boolean(initialData);



    const form = useForm({
        defaultValues: {
            name: initialData?.name || '',
            location: initialData?.location || '',
            country: initialData?.country || '',
            currency: initialData?.currency || '',
            programs: initialData?.programs || [],
            isActive: initialData?.isActive ?? true,
        } as unknown as CreateLearningCenterDto,
        onSubmit: async ({ value }) => {
            try {
                await onSubmit(value);
            } finally {

            }
        },
    });

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

                        {/* Code Field */}
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Country
                                    </label>
                                    <select
                                        value={field.state.value}
                                        onChange={(e) => {
                                            field.handleChange(e.target.value);
                                            // Auto-populate currency based on country
                                            const selectedCountry = STUDY_ABROAD_COUNTRIES.find(
                                                c => c.name === e.target.value
                                            );
                                            if (selectedCountry) {
                                                form.setFieldValue('currency', selectedCountry.currency);
                                            }
                                        }}
                                        onBlur={field.handleBlur}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900"
                                    >
                                        <option value="">Select country</option>
                                        {STUDY_ABROAD_COUNTRIES.map((country) => (
                                            <option key={country.name} value={country.name}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
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
                                            studyHours: '',
                                            mode: '',
                                            support: '',
                                            feeStructure: {
                                                programTuitionFee: '',
                                                studentVisaFee: '',
                                                accommodation: '',
                                                airportTransfer: '',
                                                vat: '',
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
                                                <form.Field name={`programs[${programIndex}].studyHours`}>
                                                    {(fieldItem) => (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                Study Hours *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={fieldItem.state.value}
                                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                                placeholder="e.g., 20hrs/week"
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                                required
                                                            />
                                                        </div>
                                                    )}
                                                </form.Field>

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
                                                                <option value="Onsite">Onsite</option>
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
                                                                    Program Tuition Fee
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

                                                    {/* VAT */}
                                                    <form.Field name={`programs[${programIndex}].feeStructure.vat`}>
                                                        {(fieldItem) => (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                                    VAT
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
                                                <form.Field name={`programs[${programIndex}].feeStructure.dynamicFields`} mode="array">
                                                    {(dynamicFieldsArray) => (
                                                        <div className="mt-6">
                                                            <div className="flex justify-between items-center mb-4">
                                                                <h6 className="text-sm font-semibold text-gray-900">Dynamic Fields</h6>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newField: DynamicField = {
                                                                            key: '',
                                                                            value: '',
                                                                            type: 'string',
                                                                        };
                                                                        dynamicFieldsArray.pushValue(newField);
                                                                    }}
                                                                    className="px-3 py-1 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors"
                                                                >
                                                                    + Add Field
                                                                </button>
                                                            </div>

                                                            <div className="space-y-3">
                                                                {dynamicFieldsArray.state.value.map((_, dynamicIndex) => (
                                                                    <div key={dynamicIndex} className="flex gap-3 items-start bg-white p-3 rounded-lg border border-gray-300">
                                                                        {/* Field Key */}
                                                                        <form.Field name={`programs[${programIndex}].feeStructure.dynamicFields[${dynamicIndex}].key`}>
                                                                            {(keyField) => (
                                                                                <div className="flex-1">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={keyField.state.value}
                                                                                        onChange={(e) => keyField.handleChange(e.target.value)}
                                                                                        placeholder="Field name"
                                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </form.Field>

                                                                        {/* Field Type */}
                                                                        <form.Field name={`programs[${programIndex}].feeStructure.dynamicFields[${dynamicIndex}].type`}>
                                                                            {(typeField) => (
                                                                                <div className="w-32">
                                                                                    <select
                                                                                        value={typeField.state.value}
                                                                                        onChange={(e) => typeField.handleChange(e.target.value as "string" | "number" | "boolean")}
                                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                                                    >
                                                                                        <option value="string">String</option>
                                                                                        <option value="number">Number</option>
                                                                                        <option value="boolean">Boolean</option>
                                                                                    </select>
                                                                                </div>
                                                                            )}
                                                                        </form.Field>

                                                                        {/* Field Value */}
                                                                        <form.Field name={`programs[${programIndex}].feeStructure.dynamicFields[${dynamicIndex}]`}>
                                                                            {(dynamicFieldItem) => {
                                                                                const currentType = dynamicFieldItem.state.value.type;
                                                                                const currentValue = dynamicFieldItem.state.value.value;

                                                                                if (currentType === 'boolean') {
                                                                                    return (
                                                                                        <div className="flex-1">
                                                                                            <select
                                                                                                value={String(currentValue)}
                                                                                                onChange={(e) => {
                                                                                                    dynamicFieldItem.handleChange({
                                                                                                        ...dynamicFieldItem.state.value,
                                                                                                        value: e.target.value === 'true'
                                                                                                    });
                                                                                                }}
                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                                                            >
                                                                                                <option value="true">True</option>
                                                                                                <option value="false">False</option>
                                                                                            </select>
                                                                                        </div>
                                                                                    );
                                                                                }

                                                                                if (currentType === 'number') {
                                                                                    return (
                                                                                        <div className="flex-1">
                                                                                            <input
                                                                                                type="number"
                                                                                                value={currentValue as number}
                                                                                                onChange={(e) => {
                                                                                                    dynamicFieldItem.handleChange({
                                                                                                        ...dynamicFieldItem.state.value,
                                                                                                        value: Number(e.target.value)
                                                                                                    });
                                                                                                }}
                                                                                                placeholder="Value"
                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                                                            />
                                                                                        </div>
                                                                                    );
                                                                                }

                                                                                return (
                                                                                    <div className="flex-1">
                                                                                        <input
                                                                                            type="text"
                                                                                            value={currentValue as string}
                                                                                            onChange={(e) => {
                                                                                                dynamicFieldItem.handleChange({
                                                                                                    ...dynamicFieldItem.state.value,
                                                                                                    value: e.target.value
                                                                                                });
                                                                                            }}
                                                                                            placeholder="Value"
                                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                                                                                        />
                                                                                    </div>
                                                                                );
                                                                            }}
                                                                        </form.Field>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => dynamicFieldsArray.removeValue(dynamicIndex)}
                                                                            className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                ))}

                                                                {dynamicFieldsArray.state.value.length === 0 && (
                                                                    <p className="text-gray-500 text-sm text-center py-4">
                                                                        No dynamic fields added
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
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