// components/CountryForm/tabs/ScholarshipsTab.tsx
import { Plus, Trash2 } from 'lucide-react';
import type { IScholarship } from '@/types/country';

interface ScholarshipsTabProps {
    form: any;
}

export function ScholarshipsTab({ form }: ScholarshipsTabProps) {
    return (
        <form.Field name="scholarships" mode="array">
            {(field: any) => (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Scholarships</h3>
                        <button
                            type="button"
                            onClick={() => {
                                const newScholarship: IScholarship = {
                                    name: '',
                                    description: '',
                                    eligibility: '',
                                    amount: '',
                                    coverage: '',
                                    applicationDeadline: '',
                                    externalLink: '',
                                    isGovernmentFunded: false,
                                };
                                field.pushValue(newScholarship);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Scholarship
                        </button>
                    </div>

                    {field.state.value.map((_: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900">Scholarship {index + 1}</h4>
                                <button
                                    type="button"
                                    onClick={() => field.removeValue(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <form.Field name={`scholarships[${index}].name`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Scholarship Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="e.g., Merit Scholarship"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`scholarships[${index}].amount`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Amount <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="e.g., $10,000"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`scholarships[${index}].description`}>
                                    {(fieldItem: any) => (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Description <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="Brief description"
                                                rows={2}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`scholarships[${index}].eligibility`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Eligibility <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="e.g., GPA 3.5+"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`scholarships[${index}].coverage`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Coverage <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="e.g., Full tuition"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`scholarships[${index}].applicationDeadline`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Application Deadline
                                            </label>
                                            <input
                                                type="text"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="e.g., December 31, 2024"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`scholarships[${index}].externalLink`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                External Link
                                            </label>
                                            <input
                                                type="url"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="https://..."
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`scholarships[${index}].isGovernmentFunded`}>
                                    {(fieldItem: any) => (
                                        <div className="flex items-center gap-2 md:col-span-2">
                                            <input
                                                type="checkbox"
                                                id={`gov-funded-${index}`}
                                                checked={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.checked)}
                                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                                            />
                                            <label htmlFor={`gov-funded-${index}`} className="text-sm text-gray-900">
                                                Government Funded
                                            </label>
                                        </div>
                                    )}
                                </form.Field>
                            </div>
                        </div>
                    ))}

                    {field.state.value.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p>No scholarships added yet</p>
                            <p className="text-sm mt-1">Click "Add Scholarship" to get started</p>
                        </div>
                    )}
                </div>
            )}
        </form.Field>
    );
}