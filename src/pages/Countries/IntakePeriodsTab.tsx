// components/CountryForm/tabs/IntakePeriodsTab.tsx
import { Plus, Trash2 } from 'lucide-react';
import type { IIntakePeriod } from '@/types/country';

interface IntakePeriodsTabProps {
    form: any;
}

export function IntakePeriodsTab({ form }: IntakePeriodsTabProps) {
    return (
        <form.Field name="intakePeriods" mode="array">
            {(field: any) => (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Intake Periods</h3>
                        <button
                            type="button"
                            onClick={() => {
                                const newIntake: IIntakePeriod = {
                                    title: '',
                                    period: '',
                                    description: '',
                                    bestFor: '',
                                    // order: field.state.value.length + 1,
                                };
                                field.pushValue(newIntake);
                            }}
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Intake Period
                        </button>
                    </div>

                    {field.state.value.map((_: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900">Intake Period {index + 1}</h4>
                                <button
                                    type="button"
                                    onClick={() => field.removeValue(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <form.Field name={`intakePeriods[${index}].title`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Title <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="e.g., Fall Intake"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`intakePeriods[${index}].period`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Period <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="e.g., September - December"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`intakePeriods[${index}].description`}>
                                    {(fieldItem: any) => (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="Brief description"
                                                rows={2}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name={`intakePeriods[${index}].bestFor`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Best For
                                            </label>
                                            <input
                                                type="text"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(e.target.value)}
                                                placeholder="e.g., All programs"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                {/* <form.Field name={`intakePeriods[${index}].order`}>
                                    {(fieldItem: any) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Display Order
                                            </label>
                                            <input
                                                type="number"
                                                value={fieldItem.state.value}
                                                onChange={(e) => fieldItem.handleChange(Number(e.target.value))}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    )}
                                </form.Field> */}
                            </div>
                        </div>
                    ))}

                    {field.state.value.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p>No intake periods added yet</p>
                            <p className="text-sm mt-1">Click "Add Intake Period" to get started</p>
                        </div>
                    )}
                </div>
            )}
        </form.Field>
    );
}