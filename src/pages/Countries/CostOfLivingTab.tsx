// components/CountryForm/tabs/CostOfLivingTab.tsx
import { Plus, Trash2 } from 'lucide-react';
import type { Cost, CostItem } from '@/types/country';

interface CostOfLivingTabProps {
    form: any;
}

export function CostOfLivingTab({ form }: CostOfLivingTabProps) {
    return (
        <form.Field name="costOfLiving" mode="array">
            {(field: any) => (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Cost of Living</h3>
                        <button
                            type="button"
                            onClick={() => {
                                const newCost: Cost = {
                                    tuition: [],
                                    living: [],
                                    note: '',
                                };
                                field.pushValue(newCost);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Cost Section
                        </button>
                    </div>

                    {field.state.value.map((_: any, costIndex: number) => (
                        <div key={costIndex} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium text-gray-900">Cost Section {costIndex + 1}</h4>
                                <button
                                    type="button"
                                    onClick={() => field.removeValue(costIndex)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Tuition Costs */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-900">Tuition Costs</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const currentCost = form.getFieldValue(`costOfLiving[${costIndex}]`);
                                            const newTuition: CostItem = {
                                                label: '',
                                                min: 0,
                                                max: 0,
                                                currency: 'USD',
                                            };
                                            form.setFieldValue(`costOfLiving[${costIndex}].tuition`, [
                                                ...(currentCost.tuition || []),
                                                newTuition,
                                            ]);
                                        }}
                                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                        + Add Item
                                    </button>
                                </div>

                                <form.Field name={`costOfLiving[${costIndex}].tuition`} mode="array">
                                    {(tuitionField: any) => (
                                        <div className="space-y-2">
                                            {tuitionField.state.value?.map((_: any, tuitionIndex: number) => (
                                                <div key={tuitionIndex} className="grid grid-cols-12 gap-2 items-end bg-white p-2 rounded border">
                                                    <form.Field name={`costOfLiving[${costIndex}].tuition[${tuitionIndex}].label`}>
                                                        {(itemField: any) => (
                                                            <div className="col-span-4">
                                                                <input
                                                                    type="text"
                                                                    value={itemField.state.value}
                                                                    onChange={(e) => itemField.handleChange(e.target.value)}
                                                                    placeholder="Label (e.g., Undergraduate)"
                                                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                        )}
                                                    </form.Field>

                                                    <form.Field name={`costOfLiving[${costIndex}].tuition[${tuitionIndex}].min`}>
                                                        {(itemField: any) => (
                                                            <div className="col-span-3">
                                                                <input
                                                                    type="number"
                                                                    value={itemField.state.value}
                                                                    onChange={(e) => itemField.handleChange(Number(e.target.value))}
                                                                    placeholder="Min"
                                                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                        )}
                                                    </form.Field>

                                                    <form.Field name={`costOfLiving[${costIndex}].tuition[${tuitionIndex}].max`}>
                                                        {(itemField: any) => (
                                                            <div className="col-span-3">
                                                                <input
                                                                    type="number"
                                                                    value={itemField.state.value}
                                                                    onChange={(e) => itemField.handleChange(Number(e.target.value))}
                                                                    placeholder="Max"
                                                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                        )}
                                                    </form.Field>

                                                    <form.Field name={`costOfLiving[${costIndex}].tuition[${tuitionIndex}].currency`}>
                                                        {(itemField: any) => (
                                                            <div className="col-span-1">
                                                                <input
                                                                    type="text"
                                                                    value={itemField.state.value}
                                                                    onChange={(e) => itemField.handleChange(e.target.value.toUpperCase())}
                                                                    placeholder="USD"
                                                                    maxLength={3}
                                                                    className="w-full px-2 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                        )}
                                                    </form.Field>

                                                    <button
                                                        type="button"
                                                        onClick={() => tuitionField.removeValue(tuitionIndex)}
                                                        className="col-span-1 p-2 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </form.Field>
                            </div>

                            {/* Living Costs */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-900">Living Costs</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const currentCost = form.getFieldValue(`costOfLiving[${costIndex}]`);
                                            const newLiving: CostItem = {
                                                label: '',
                                                min: 0,
                                                max: 0,
                                                currency: 'USD',
                                            };
                                            form.setFieldValue(`costOfLiving[${costIndex}].living`, [
                                                ...(currentCost.living || []),
                                                newLiving,
                                            ]);
                                        }}
                                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                        + Add Item
                                    </button>
                                </div>

                                <form.Field name={`costOfLiving[${costIndex}].living`} mode="array">
                                    {(livingField: any) => (
                                        <div className="space-y-2">
                                            {livingField.state.value?.map((_: any, livingIndex: number) => (
                                                <div key={livingIndex} className="grid grid-cols-12 gap-2 items-end bg-white p-2 rounded border">
                                                    <form.Field name={`costOfLiving[${costIndex}].living[${livingIndex}].label`}>
                                                        {(itemField: any) => (
                                                            <div className="col-span-4">
                                                                <input
                                                                    type="text"
                                                                    value={itemField.state.value}
                                                                    onChange={(e) => itemField.handleChange(e.target.value)}
                                                                    placeholder="Label (e.g., Accommodation)"
                                                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                        )}
                                                    </form.Field>

                                                    <form.Field name={`costOfLiving[${costIndex}].living[${livingIndex}].min`}>
                                                        {(itemField: any) => (
                                                            <div className="col-span-3">
                                                                <input
                                                                    type="number"
                                                                    value={itemField.state.value}
                                                                    onChange={(e) => itemField.handleChange(Number(e.target.value))}
                                                                    placeholder="Min"
                                                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                        )}
                                                    </form.Field>

                                                    <form.Field name={`costOfLiving[${costIndex}].living[${livingIndex}].max`}>
                                                        {(itemField: any) => (
                                                            <div className="col-span-3">
                                                                <input
                                                                    type="number"
                                                                    value={itemField.state.value}
                                                                    onChange={(e) => itemField.handleChange(Number(e.target.value))}
                                                                    placeholder="Max"
                                                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                        )}
                                                    </form.Field>

                                                    <form.Field name={`costOfLiving[${costIndex}].living[${livingIndex}].currency`}>
                                                        {(itemField: any) => (
                                                            <div className="col-span-1">
                                                                <input
                                                                    type="text"
                                                                    value={itemField.state.value}
                                                                    onChange={(e) => itemField.handleChange(e.target.value.toUpperCase())}
                                                                    placeholder="USD"
                                                                    maxLength={3}
                                                                    className="w-full px-2 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                        )}
                                                    </form.Field>

                                                    <button
                                                        type="button"
                                                        onClick={() => livingField.removeValue(livingIndex)}
                                                        className="col-span-1 p-2 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </form.Field>
                            </div>

                            {/* Note */}
                            <form.Field name={`costOfLiving[${costIndex}].note`}>
                                {(noteField: any) => (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Note
                                        </label>
                                        <textarea
                                            value={noteField.state.value}
                                            onChange={(e) => noteField.handleChange(e.target.value)}
                                            placeholder="Additional notes about costs..."
                                            rows={2}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                )}
                            </form.Field>
                        </div>
                    ))}

                    {field.state.value.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p>No cost sections added yet</p>
                            <p className="text-sm mt-1">Click "Add Cost Section" to get started</p>
                        </div>
                    )}
                </div>
            )}
        </form.Field>
    );
}