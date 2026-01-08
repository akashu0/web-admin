// components/CountryForm/tabs/WorkOpportunitiesTab.tsx
import { Plus, Trash2 } from 'lucide-react';
import type { IWorkOpportunity } from '@/types/country';

interface WorkOpportunitiesTabProps {
    form: any;
}

export function WorkOpportunitiesTab({ form }: WorkOpportunitiesTabProps) {
    return (
        <form.Field name="workOpportunities" mode="array">
            {(field: any) => (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Work Opportunities</h3>
                        <button
                            type="button"
                            onClick={() => {
                                const newWork: IWorkOpportunity = {
                                    title: '',
                                    description: '',
                                    type: 'part-time',
                                    allowedHoursPerWeek: '',
                                    eligibility: '',
                                    averageSalary: '',
                                    popularSectors: [],
                                    requirements: '',
                                };
                                field.pushValue(newWork);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Work Opportunity
                        </button>
                    </div>

                    {field.state.value.map((_: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900">Work Opportunity {index + 1}</h4>
                                <button
                                    type="button"
                                    onClick={() => field.removeValue(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <form.Field name={`workOpportunities[${index}].title`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Title <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="e.g., On-Campus Jobs"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`workOpportunities[${index}].type`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="part-time">Part-time</option>
                                                <option value="full-time">Full-time</option>
                                                <option value="internship">Internship</option>
                                            </select>
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`workOpportunities[${index}].allowedHoursPerWeek`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Allowed Hours/Week
                                            </label>
                                            <input
                                                type="text"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="e.g., 20 hours"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`workOpportunities[${index}].averageSalary`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Average Salary
                                            </label>
                                            <input
                                                type="text"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="e.g., $15/hour"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`workOpportunities[${index}].description`}>
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

                                <form.Field name={`workOpportunities[${index}].eligibility`}>
                                    {(fieldItem: any) => (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Eligibility <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="e.g., Full-time students with valid visa"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`workOpportunities[${index}].popularSectors`}>
                                    {(fieldItem: any) => (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Popular Sectors (comma-separated)
                                            </label>
                                            <input
                                                type="text"
                                                value={fieldItem.state.value.join(', ')}
                                                onChange={(e) => {
                                                    const sectors = e.target.value
                                                        .split(',')
                                                        .map((s) => s.trim())
                                                        .filter(Boolean);
                                                    fieldItem.handleChange(sectors);
                                                }}
                                                placeholder="e.g., Retail, Food Service, Administration"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`workOpportunities[${index}].requirements`}>
                                    {(fieldItem: any) => (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Requirements
                                            </label>
                                            <textarea
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="Additional requirements"
                                                rows={2}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    )}
                                </form.Field>
                            </div>
                        </div>
                    ))}

                    {field.state.value.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p>No work opportunities added yet</p>
                            <p className="text-sm mt-1">Click "Add Work Opportunity" to get started</p>
                        </div>
                    )}
                </div>
            )}
        </form.Field>
    );
}