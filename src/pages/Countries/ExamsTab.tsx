// components/CountryForm/tabs/ExamsTab.tsx
import { Plus, Trash2 } from 'lucide-react';
import type { IExamEligibility } from '@/types/country';

interface ExamsTabProps {
    form: any;
}

export function ExamsTab({ form }: ExamsTabProps) {
    return (
        <form.Field name="examsEligibility" mode="array">
            {(field: any) => (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Exams Eligibility</h3>
                        <button
                            type="button"
                            onClick={() => {
                                const newExam: IExamEligibility = {
                                    examName: '',
                                    description: '',
                                    minimumScore: '',
                                    requiredFor: 'undergraduate',
                                    validityPeriod: '',
                                    bookingLink: '',
                                    preparationTips: '',
                                };
                                field.pushValue(newExam);
                            }}
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Exam
                        </button>
                    </div>

                    {field.state.value.map((_: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900">Exam {index + 1}</h4>
                                <button
                                    type="button"
                                    onClick={() => field.removeValue(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <form.Field name={`examsEligibility[${index}].examName`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Exam Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="e.g., IELTS"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`examsEligibility[${index}].minimumScore`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Minimum Score
                                            </label>
                                            <input
                                                type="text"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="e.g., 6.5"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`examsEligibility[${index}].requiredFor`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Required For <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="undergraduate">Undergraduate</option>
                                                <option value="postgraduate">Postgraduate</option>
                                                <option value="both">Both</option>
                                            </select>
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`examsEligibility[${index}].validityPeriod`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Validity Period
                                            </label>
                                            <input
                                                type="text"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="e.g., 2 years"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`examsEligibility[${index}].bookingLink`}>
                                    {(fieldItem: any) => (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Booking Link
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

                                <form.Field name={`examsEligibility[${index}].description`}>
                                    {(fieldItem: any) => (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Description <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="Brief description of the exam"
                                                rows={2}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`examsEligibility[${index}].preparationTips`}>
                                    {(fieldItem: any) => (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Preparation Tips
                                            </label>
                                            <textarea
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="Tips for exam preparation"
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
                            <p>No exams added yet</p>
                            <p className="text-sm mt-1">Click "Add Exam" to get started</p>
                        </div>
                    )}
                </div>
            )}
        </form.Field>
    );
}