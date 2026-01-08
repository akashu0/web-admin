// components/CountryForm/tabs/BasicInfoTab.tsx
import { Image as ImageIcon, X } from 'lucide-react';
import type { RefObject } from 'react';

interface BasicInfoTabProps {
    form: any;
    logoPreview: string;
    bannerPreview: string;
    logoInputRef: RefObject<HTMLInputElement | null>;
    bannerInputRef: RefObject<HTMLInputElement | null>;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => void;
    onRemoveImage: (type: 'logo' | 'banner') => void;
}

const CONTINENTS = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

const generateSlug = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-')         // spaces → -
        .replace(/-+/g, '-');         // avoid multiple -


export function BasicInfoTab({
    form,
    logoPreview,
    bannerPreview,
    logoInputRef,
    bannerInputRef,
    onImageUpload,
    onRemoveImage,
}: BasicInfoTabProps) {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

            {/* Image Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Country Logo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-500 transition-colors">
                        {logoPreview ? (
                            <div className="relative">
                                <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="w-32 h-32 object-contain mx-auto rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => onRemoveImage('logo')}
                                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => logoInputRef.current?.click()}
                                className="cursor-pointer"
                            >
                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Click to upload logo</p>
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                            </div>
                        )}
                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => onImageUpload(e, 'logo')}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Banner Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Country Banner
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-500 transition-colors">
                        {bannerPreview ? (
                            <div className="relative">
                                <img
                                    src={bannerPreview}
                                    alt="Banner preview"
                                    className="w-full h-32 object-cover rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => onRemoveImage('banner')}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => bannerInputRef.current?.click()}
                                className="cursor-pointer"
                            >
                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Click to upload banner</p>
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                            </div>
                        )}
                        <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => onImageUpload(e, 'banner')}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field name="name">
                    {(field: any) => (
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Country Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={field.state.value}
                                onChange={(e) => {
                                    const nameValue = e.target.value;
                                    field.handleChange(nameValue);
                                    form.setFieldValue('slug', generateSlug(nameValue));
                                }}
                                placeholder="e.g., United States"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                    )}
                </form.Field>


                <form.Field name="slug">
                    {(field: any) => (
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Slug <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                placeholder="e.g., united-states"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                    )}
                </form.Field>

                <form.Field name="code">
                    {(field: any) => (
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Country Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                                placeholder="e.g., US"
                                maxLength={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                    )}
                </form.Field>

                <form.Field name="capital">
                    {(field: any) => (
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Capital <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="e.g., Washington, D.C."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                    )}
                </form.Field>

                <form.Field name="continent">
                    {(field: any) => (
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Continent <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Continent</option>
                                {CONTINENTS.map((continent) => (
                                    <option key={continent} value={continent}>
                                        {continent}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </form.Field>

                <form.Field name="currency">
                    {(field: any) => (
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Currency <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                                placeholder="e.g., USD"
                                maxLength={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                    )}
                </form.Field>

                <form.Field name="language">
                    {(field: any) => (
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Language <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="e.g., English"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                    )}
                </form.Field>

                <form.Field name="population">
                    {(field: any) => (
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Population
                            </label>
                            <input
                                type="text"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="e.g., 331 million"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    )}
                </form.Field>


            </div>

            <form.Field name="about">
                {(field: any) => (
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            About <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Brief description about the country..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                        />
                    </div>
                )}
            </form.Field>

            <form.Field name="status">
                {(field: any) => (
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value as 'published' | 'draft')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                )}
            </form.Field>
        </div>
    );
}