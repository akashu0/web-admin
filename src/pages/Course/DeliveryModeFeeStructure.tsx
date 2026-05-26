"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import type { FeeStructure } from '@/types/course';

// ============================================================================
// CONSTANTS
// ============================================================================

const TUITION_FEE_TYPES = [
    'Fully Tuition Fee Funded',
    'Scholarships',
    'Regular (Self-Funded Program)',
] as const;

const SCHOLARSHIP_PERCENTAGES = [
    '10%', '20%', '30%', '40%', '50%',
    '60%', '70%', '80%', '90%', '100%',
    'Not Applicable',
] as const;

const CURRENCY_OPTIONS = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'EUR', name: 'Euro' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'MYR', name: 'Malaysian Ringgit' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'PKR', name: 'Pakistani Rupee' },
    { code: 'BDT', name: 'Bangladeshi Taka' },
    { code: 'LKR', name: 'Sri Lankan Rupee' },
    { code: 'NPR', name: 'Nepalese Rupee' },
    { code: 'NZD', name: 'New Zealand Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'SAR', name: 'Saudi Riyal' },
    { code: 'QAR', name: 'Qatari Riyal' },
    { code: 'OMR', name: 'Omani Rial' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'KRW', name: 'South Korean Won' },
];

// ============================================================================
// TYPES (local extension for dynamic "Other Fees")
// ============================================================================

interface OtherFee {
    id: string;
    fieldName: string;
    fieldValue: string;
    fieldType: 'text' | 'number';
    order: number;
}

// ============================================================================
// HELPERS
// ============================================================================

const EMPTY_FEE: FeeStructure = {
    tuitionFeeType: undefined,
    scholarshipPercentage: 'Not Applicable',
    currency: '',
    tuitionFee: 0,
    applicationFee: 0,
    admissionFee: 0,
    visaFee: 0,
    administrationFee: 0,
    accommodationFee: 0,
    transportationFee: 0,
    assessmentFee: 0,
    examFee: 0,
    dynamicFields: [],
};

const FEE_FIELDS: { key: keyof FeeStructure; label: string }[] = [
    { key: 'tuitionFee', label: 'Tuition Fee' },
    { key: 'applicationFee', label: 'Application Fee' },
    { key: 'admissionFee', label: 'Admission Fee' },
    { key: 'visaFee', label: 'Visa Fee' },
    { key: 'administrationFee', label: 'Administration Fee' },
    { key: 'accommodationFee', label: 'Accommodation Fee' },
    { key: 'transportationFee', label: 'Transportation Fee' },
    { key: 'assessmentFee', label: 'Assessment Fee' },
    { key: 'examFee', label: 'Exam Fee' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface DeliveryModeFeeStructureProps {
    initialData?: FeeStructure[];
    onSave?: (data: FeeStructure[]) => Promise<void>;
    onNext?: () => void;
}

export const DeliveryModeFeeStructure: React.FC<DeliveryModeFeeStructureProps> = ({
    initialData = [],
    onSave,
    onNext,
}) => {
    const [savedFees, setSavedFees] = useState<FeeStructure[]>(initialData);
    const [isAddingNew, setIsAddingNew] = useState(initialData.length === 0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState<FeeStructure>({ ...EMPTY_FEE });
    const [otherFees, setOtherFees] = useState<OtherFee[]>([]);
    const [newFeeName, setNewFeeName] = useState('');

    const setField = <K extends keyof FeeStructure>(key: K, value: FeeStructure[K]) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleNumberInput = (value: string): number => {
        const n = parseFloat(value);
        return isNaN(n) || n < 0 ? 0 : n;
    };

    const addOtherFee = () => {
        if (!newFeeName.trim()) return;
        setOtherFees(prev => [
            ...prev,
            {
                id: `fee_${Date.now()}`,
                fieldName: newFeeName.trim(),
                fieldValue: '',
                fieldType: 'number',
                order: prev.length,
            },
        ]);
        setNewFeeName('');
    };

    const updateOtherFee = (id: string, value: string) => {
        setOtherFees(prev => prev.map(f => f.id === id ? { ...f, fieldValue: value } : f));
    };

    const removeOtherFee = (id: string) => {
        setOtherFees(prev => prev.filter(f => f.id !== id));
    };

    const resetForm = () => {
        setFormData({ ...EMPTY_FEE });
        setOtherFees([]);
        setNewFeeName('');
        setEditingIndex(null);
    };

    const handleSaveFee = () => {
        const entry: FeeStructure = {
            ...formData,
            dynamicFields: otherFees,
        };

        if (editingIndex !== null) {
            setSavedFees(prev => prev.map((f, i) => i === editingIndex ? entry : f));
        } else {
            setSavedFees(prev => [...prev, entry]);
        }

        resetForm();
        setIsAddingNew(false);
    };

    const handleEditFee = (fee: FeeStructure, index: number) => {
        setFormData({ ...fee, dynamicFields: [] });
        setOtherFees((fee.dynamicFields as OtherFee[]) ?? []);
        setEditingIndex(index);
        setIsAddingNew(true);
    };

    const handleRemoveFee = (index: number) => {
        setSavedFees(prev => prev.filter((_, i) => i !== index));
    };

    const handleFinalSave = async () => {
        try {
            setIsSubmitting(true);
            if (onSave) await onSave(savedFees);
            if (onNext) onNext();
        } catch (error) {
            console.error('Error saving fee structures:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateTotal = (fee: FeeStructure) => {
        const numericKeys: (keyof FeeStructure)[] = [
            'tuitionFee', 'applicationFee', 'admissionFee', 'visaFee',
            'administrationFee', 'accommodationFee', 'transportationFee',
            'assessmentFee', 'examFee',
        ];
        let total = numericKeys.reduce((sum, k) => sum + ((fee[k] as number) || 0), 0);
        (fee.dynamicFields as OtherFee[] | undefined)?.forEach(f => {
            const n = parseFloat(f.fieldValue);
            if (!isNaN(n)) total += n;
        });
        return total;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Fee Structure</h2>
                <p className="text-sm text-gray-600">
                    Add fee details for this course. Each fee structure entry shows all applicable fees.
                </p>
            </div>

            {/* Saved Fee Structures */}
            {savedFees.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Saved Fee Structures</h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {savedFees.length} {savedFees.length === 1 ? 'Entry' : 'Entries'}
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        {savedFees.map((fee, index) => (
                            <Card key={index} className="p-5 bg-gray-50 border-gray-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {fee.tuitionFeeType && (
                                                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                                    {fee.tuitionFeeType}
                                                </Badge>
                                            )}
                                            {fee.scholarshipPercentage && fee.scholarshipPercentage !== 'Not Applicable' && (
                                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                                    {fee.scholarshipPercentage} Scholarship
                                                </Badge>
                                            )}
                                            {fee.currency && (
                                                <Badge variant="outline">{fee.currency}</Badge>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                                            {FEE_FIELDS.map(({ key, label }) => {
                                                const val = fee[key] as number;
                                                return val > 0 ? (
                                                    <div key={key}>
                                                        <span className="text-gray-500">{label}:</span>
                                                        <span className="ml-1 font-medium text-gray-800">
                                                            {fee.currency} {val.toLocaleString()}
                                                        </span>
                                                    </div>
                                                ) : null;
                                            })}
                                            {(fee.dynamicFields as OtherFee[] | undefined)?.map(f => (
                                                f.fieldValue ? (
                                                    <div key={f.id}>
                                                        <span className="text-gray-500">{f.fieldName}:</span>
                                                        <span className="ml-1 font-medium text-gray-800">
                                                            {fee.currency} {f.fieldValue}
                                                        </span>
                                                    </div>
                                                ) : null
                                            ))}
                                        </div>

                                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                            <span className="text-sm text-gray-600 font-medium">Total:</span>
                                            <span className="text-lg font-bold text-purple-600">
                                                {fee.currency} {calculateTotal(fee).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditFee(fee, index)}
                                            disabled={isAddingNew}
                                            className="text-blue-600 hover:bg-blue-50"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveFee(index)}
                                            disabled={isAddingNew}
                                            className="text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Add New Button */}
            {!isAddingNew && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingNew(true)}
                    className="w-full border-dashed border-2"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Fee Structure
                </Button>
            )}

            {/* Add/Edit Form */}
            {isAddingNew && (
                <Card className="p-6 border-2 border-gray-200">
                    <h3 className="font-semibold text-lg mb-6">
                        {editingIndex !== null ? 'Edit Fee Structure' : 'New Fee Structure'}
                    </h3>

                    <div className="space-y-5">
                        {/* Tuition Fee Type + Scholarship */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Tuition Fee</Label>
                                <Select
                                    value={formData.tuitionFeeType ?? ''}
                                    onValueChange={(v) => setField('tuitionFeeType', v as FeeStructure['tuitionFeeType'])}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {TUITION_FEE_TYPES.map(t => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Scholarships</Label>
                                <Select
                                    value={formData.scholarshipPercentage ?? 'Not Applicable'}
                                    onValueChange={(v) => setField('scholarshipPercentage', v)}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {SCHOLARSHIP_PERCENTAGES.map(p => (
                                            <SelectItem key={p} value={p}>{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Currency */}
                        <div>
                            <Label>Currency</Label>
                            <Select
                                value={formData.currency ?? ''}
                                onValueChange={(v) => setField('currency', v)}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent className="bg-white max-h-60">
                                    {CURRENCY_OPTIONS.map(c => (
                                        <SelectItem key={c.code} value={c.code}>
                                            {c.code} — {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Standard Fee Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {FEE_FIELDS.map(({ key, label }) => (
                                <div key={key}>
                                    <Label>{label}</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        className="mt-2"
                                        placeholder="0"
                                        value={(formData[key] as number) === 0 ? '' : (formData[key] as number)}
                                        onChange={e => setField(key, handleNumberInput(e.target.value) as any)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Other Fees (dynamic) */}
                        <div>
                            <Label>Other Fees</Label>
                            <p className="text-xs text-gray-500 mt-0.5 mb-3">Add any additional fees below</p>

                            {otherFees.length > 0 && (
                                <div className="space-y-2 mb-3">
                                    {otherFees.map(fee => (
                                        <div key={fee.id} className="flex items-center gap-2">
                                            <span className="text-sm text-gray-700 w-40 shrink-0">{fee.fieldName}</span>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                className="flex-1"
                                                value={fee.fieldValue === '' ? '' : fee.fieldValue}
                                                onChange={e => updateOtherFee(fee.id, e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeOtherFee(fee.id)}
                                                className="text-red-500 hover:bg-red-50 shrink-0"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Fee name (e.g. Library Fee)"
                                    value={newFeeName}
                                    onChange={e => setNewFeeName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOtherFee())}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addOtherFee}
                                    disabled={!newFeeName.trim()}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                </Button>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { resetForm(); setIsAddingNew(false); }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="bg-gray-900 hover:bg-gray-800"
                                onClick={handleSaveFee}
                            >
                                {editingIndex !== null ? 'Update' : 'Add Fee Structure'}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Final Save */}
            <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                    type="button"
                    className="bg-gray-900 hover:bg-gray-800"
                    onClick={handleFinalSave}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save & Continue'
                    )}
                </Button>
            </div>
        </div>
    );
};

export default DeliveryModeFeeStructure;
