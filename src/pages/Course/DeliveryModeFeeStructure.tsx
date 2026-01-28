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
import {
    Calculator,
    Plus,
    Trash2,
    Edit,
    X,
    Check,
    GraduationCap,
    Loader2
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type DeliveryMode = 'online' | 'offline' | 'hybrid' | 'fast-track';

export interface DynamicField {
    id: string;
    fieldName: string;
    fieldValue: string;
    fieldType: 'text' | 'number';
    order: number;
}

export interface FeeStructure {
    country: string;
    mode: DeliveryMode;
    programTuitionFee: number;
    studentVisaFee: number;
    accommodation: number;
    airportTransfer: number;
    vat: number;
    total: number;
    currency: string;
    dynamicFields?: DynamicField[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DELIVERY_MODES = [
    {
        value: 'online' as const,
        label: 'Online',
        icon: '💻',
        description: 'Fully remote learning',
        color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    {
        value: 'offline' as const,
        label: 'Offline',
        icon: '🏫',
        description: 'On-campus learning',
        color: 'bg-green-100 text-green-700 border-green-200'
    },
    {
        value: 'hybrid' as const,
        label: 'Hybrid',
        icon: '🔄',
        description: 'Mix of online and offline',
        color: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    {
        value: 'fast-track' as const,
        label: 'Fast Track',
        icon: '⚡',
        description: 'Accelerated program',
        color: 'bg-orange-100 text-orange-700 border-orange-200'
    },
];

export const COUNTRIES = [
    { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
    { code: 'UK', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
    { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'C$' },
    { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$' },
    { code: 'NZ', name: 'New Zealand', currency: 'NZD', symbol: 'NZ$' },
    { code: 'IE', name: 'Ireland', currency: 'EUR', symbol: '€' },
    { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€' },
    { code: 'FR', name: 'France', currency: 'EUR', symbol: '€' },
    { code: 'NL', name: 'Netherlands', currency: 'EUR', symbol: '€' },
    { code: 'IT', name: 'Italy', currency: 'EUR', symbol: '€' },
    { code: 'ES', name: 'Spain', currency: 'EUR', symbol: '€' },
    { code: 'SE', name: 'Sweden', currency: 'SEK', symbol: 'kr' },
    { code: 'NO', name: 'Norway', currency: 'NOK', symbol: 'kr' },
    { code: 'FI', name: 'Finland', currency: 'EUR', symbol: '€' },
    { code: 'PL', name: 'Poland', currency: 'PLN', symbol: 'zł' },
    { code: 'AT', name: 'Austria', currency: 'EUR', symbol: '€' },
    { code: 'CH', name: 'Switzerland', currency: 'CHF', symbol: 'CHF' },
    { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' },
    { code: 'PK', name: 'Pakistan', currency: 'PKR', symbol: '₨' },
    { code: 'BD', name: 'Bangladesh', currency: 'BDT', symbol: '৳' },
    { code: 'LK', name: 'Sri Lanka', currency: 'LKR', symbol: 'Rs' },
    { code: 'NP', name: 'Nepal', currency: 'NPR', symbol: 'Rs' },
    { code: 'CN', name: 'China', currency: 'CNY', symbol: '¥' },
    { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥' },
    { code: 'KR', name: 'South Korea', currency: 'KRW', symbol: '₩' },
    { code: 'SG', name: 'Singapore', currency: 'SGD', symbol: 'S$' },
    { code: 'MY', name: 'Malaysia', currency: 'MYR', symbol: 'RM' },
    { code: 'TH', name: 'Thailand', currency: 'THB', symbol: '฿' },
    { code: 'PH', name: 'Philippines', currency: 'PHP', symbol: '₱' },
    { code: 'VN', name: 'Vietnam', currency: 'VND', symbol: '₫' },
    { code: 'ID', name: 'Indonesia', currency: 'IDR', symbol: 'Rp' },
    { code: 'AE', name: 'United Arab Emirates', currency: 'AED', symbol: 'د.إ' },
    { code: 'QA', name: 'Qatar', currency: 'QAR', symbol: '﷼' },
    { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', symbol: '﷼' },
    { code: 'OM', name: 'Oman', currency: 'OMR', symbol: '﷼' },
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
    // State
    const [savedFees, setSavedFees] = useState<FeeStructure[]>(initialData);
    const [isAddingNew, setIsAddingNew] = useState(initialData.length === 0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state - FIXED: Now properly typed to allow zero values to be cleared
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedMode, setSelectedMode] = useState<DeliveryMode>('online');
    const [currency, setCurrency] = useState('');
    const [programTuitionFee, setProgramTuitionFee] = useState<number>(0);
    const [studentVisaFee, setStudentVisaFee] = useState<number>(0);
    const [accommodation, setAccommodation] = useState<number>(0);
    const [airportTransfer, setAirportTransfer] = useState<number>(0);
    const [vat, setVat] = useState<number>(0);
    const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
    const [newFieldName, setNewFieldName] = useState('');

    // Helper functions
    const getCountryInfo = (code: string) => COUNTRIES.find(c => c.code === code);
    const getModeInfo = (mode: DeliveryMode) => DELIVERY_MODES.find(m => m.value === mode);
    const isNumericField = (value: string) => !isNaN(parseFloat(value));

    // Helper to handle number input - FIXED: Properly handles empty string
    const handleNumberInput = (value: string): number => {
        if (value === '') return 0;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    };

    // Helper to display input value - FIXED: Shows empty string when value is 0
    const getInputValue = (value: number): string | number => {
        return value === 0 ? '' : value;
    };

    const calculateTotal = () => {
        const subtotal = programTuitionFee + studentVisaFee + accommodation + airportTransfer;
        const dynamicTotal = dynamicFields.reduce((sum, field) => {
            const numValue = parseFloat(field.fieldValue);
            return sum + (isNaN(numValue) ? 0 : numValue);
        }, 0);
        const totalBeforeVAT = subtotal + dynamicTotal;
        return totalBeforeVAT + (totalBeforeVAT * (vat / 100));
    };

    const resetForm = () => {
        setSelectedCountry('');
        setSelectedMode('online');
        setCurrency('');
        setProgramTuitionFee(0);
        setStudentVisaFee(0);
        setAccommodation(0);
        setAirportTransfer(0);
        setVat(0);
        setDynamicFields([]);
        setNewFieldName('');
        setEditingId(null);
    };

    const handleCountryChange = (countryCode: string) => {
        setSelectedCountry(countryCode);
        const country = getCountryInfo(countryCode);
        if (country) {
            setCurrency(country.currency);
        }
    };

    const handleModeSelect = (mode: DeliveryMode) => {
        setSelectedMode(mode);
    };

    const handleAddDynamicField = () => {
        if (!newFieldName.trim()) return;
        const newField: DynamicField = {
            id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            fieldName: newFieldName.trim(),
            fieldValue: '',
            fieldType: 'text',
            order: dynamicFields.length,
        };
        setDynamicFields([...dynamicFields, newField]);
        setNewFieldName('');
    };

    const handleUpdateDynamicField = (id: string, value: string) => {
        setDynamicFields(prev =>
            prev.map(field => field.id === id ? { ...field, fieldValue: value } : field)
        );
    };

    const handleRemoveDynamicField = (id: string) => {
        setDynamicFields(prev => prev.filter(field => field.id !== id));
    };

    const handleSaveFee = () => {
        if (!selectedCountry || !selectedMode) return;

        const newFee: FeeStructure = {
            country: selectedCountry,
            mode: selectedMode,
            programTuitionFee,
            studentVisaFee,
            accommodation,
            airportTransfer,
            vat,
            total: calculateTotal(),
            currency,
            dynamicFields,
        };

        if (editingId) {
            setSavedFees(prev =>
                prev.map(fee =>
                    fee.country === selectedCountry && fee.mode === selectedMode ? newFee : fee
                )
            );
        } else {
            setSavedFees(prev => [...prev, newFee]);
        }

        resetForm();
        setIsAddingNew(false);
    };

    const handleEditFee = (fee: FeeStructure) => {
        setSelectedCountry(fee.country);
        setSelectedMode(fee.mode);
        setCurrency(fee.currency);
        setProgramTuitionFee(fee.programTuitionFee);
        setStudentVisaFee(fee.studentVisaFee);
        setAccommodation(fee.accommodation);
        setAirportTransfer(fee.airportTransfer);
        setVat(fee.vat);
        setDynamicFields(fee.dynamicFields || []);
        setEditingId(`${fee.country}-${fee.mode}`);
        setIsAddingNew(true);
    };

    const handleRemoveFee = (country: string, mode: DeliveryMode) => {
        setSavedFees(prev => prev.filter(fee => !(fee.country === country && fee.mode === mode)));
    };

    const handleFinalSave = async () => {
        if (savedFees.length === 0) return;
        try {
            setIsSubmitting(true);
            if (onSave) {
                await onSave(savedFees);
            }
            if (onNext) {
                onNext();
            }
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Group fees by country
    const groupedFees = savedFees.reduce((acc, fee) => {
        if (!acc[fee.country]) acc[fee.country] = [];
        acc[fee.country].push(fee);
        return acc;
    }, {} as Record<string, FeeStructure[]>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Delivery Mode & Fee Structure
                </h2>
                <p className="text-sm text-gray-600">
                    Add fee structures for different countries and delivery modes
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

                    <div className="space-y-6">
                        {Object.entries(groupedFees).map(([countryCode, fees]) => {
                            const countryInfo = getCountryInfo(countryCode);
                            return (
                                <Card key={countryCode} className="p-5 bg-gray-50 border-gray-300">
                                    <div className="mb-4">
                                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5 text-purple-600" />
                                            {countryInfo?.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {fees.length} delivery {fees.length === 1 ? 'mode' : 'modes'}
                                        </p>
                                    </div>

                                    <div className="grid gap-3">
                                        {fees.map((fee) => {
                                            const modeInfo = getModeInfo(fee.mode);
                                            return (
                                                <Card key={`${fee.country}-${fee.mode}`} className="p-4 bg-white">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            {/* Mode Badge */}
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Badge className={`${modeInfo?.color} font-semibold`}>
                                                                    {modeInfo?.icon} {modeInfo?.label}
                                                                </Badge>
                                                                <span className="text-xs text-gray-500">
                                                                    {modeInfo?.description}
                                                                </span>
                                                            </div>

                                                            {/* Fee Details */}
                                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                                {fee.programTuitionFee > 0 && (
                                                                    <div>
                                                                        <span className="text-gray-600">Program Fee:</span>
                                                                        <span className="ml-2 font-medium">
                                                                            {countryInfo?.symbol}{fee.programTuitionFee.toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {fee.studentVisaFee > 0 && (
                                                                    <div>
                                                                        <span className="text-gray-600">Visa Fee:</span>
                                                                        <span className="ml-2 font-medium">
                                                                            {countryInfo?.symbol}{fee.studentVisaFee.toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {fee.accommodation > 0 && (
                                                                    <div>
                                                                        <span className="text-gray-600">Accommodation:</span>
                                                                        <span className="ml-2 font-medium">
                                                                            {countryInfo?.symbol}{fee.accommodation.toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {fee.airportTransfer > 0 && (
                                                                    <div>
                                                                        <span className="text-gray-600">Airport Transfer:</span>
                                                                        <span className="ml-2 font-medium">
                                                                            {countryInfo?.symbol}{fee.airportTransfer.toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {fee.vat > 0 && (
                                                                    <div>
                                                                        <span className="text-gray-600">VAT:</span>
                                                                        <span className="ml-2 font-medium">{fee.vat}%</span>
                                                                    </div>
                                                                )}
                                                                {fee.dynamicFields?.map((field) => (
                                                                    field.fieldValue && (
                                                                        <div key={field.id}>
                                                                            <span className="text-gray-600">{field.fieldName}:</span>
                                                                            <span className="ml-2 font-medium">
                                                                                {isNumericField(field.fieldValue)
                                                                                    ? `${countryInfo?.symbol}${parseFloat(field.fieldValue).toFixed(2)}`
                                                                                    : field.fieldValue}
                                                                            </span>
                                                                        </div>
                                                                    )
                                                                ))}
                                                            </div>

                                                            {/* Total */}
                                                            <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                                                <span className="text-gray-600 font-medium">Total:</span>
                                                                <span className="text-xl font-bold text-purple-600">
                                                                    {countryInfo?.symbol}{fee.total.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex gap-2 ml-4">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditFee(fee)}
                                                                disabled={isAddingNew}
                                                                className="text-blue-600 hover:bg-blue-50"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveFee(fee.country, fee.mode)}
                                                                disabled={isAddingNew}
                                                                className="text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </Card>
                            );
                        })}
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
                    Add New Fee Structure
                </Button>
            )}

            {/* Add/Edit Form */}
            {isAddingNew && (
                <Card className="p-6">
                    <h3 className="font-semibold text-lg mb-6">
                        {editingId ? 'Edit Fee Structure' : 'Add Fee Structure'}
                    </h3>

                    {/* Country & Mode Selection */}
                    <div className="space-y-6">
                        {/* Country Select */}
                        <div>
                            <Label>Country *</Label>
                            <Select
                                value={selectedCountry}
                                onValueChange={handleCountryChange}
                                disabled={!!editingId}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COUNTRIES.map((country) => (
                                        <SelectItem key={country.code} value={country.code}>
                                            {country.name} ({country.symbol})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Delivery Mode Selection */}
                        <div>
                            <Label className="mb-3 block">Delivery Mode *</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {DELIVERY_MODES.map((mode) => (
                                    <button
                                        key={mode.value}
                                        type="button"
                                        onClick={() => handleModeSelect(mode.value)}
                                        disabled={!!editingId}
                                        className={`
                      p-4 rounded-lg border-2 text-left transition-all
                      ${selectedMode === mode.value
                                                ? 'border-purple-600 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300'}
                      ${editingId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">{mode.icon}</span>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900">{mode.label}</div>
                                                <div className="text-xs text-gray-600">{mode.description}</div>
                                            </div>
                                            {selectedMode === mode.value && (
                                                <Check className="h-5 w-5 text-purple-600" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedCountry && (
                            <>
                                {/* Currency */}
                                <div>
                                    <Label>Currency</Label>
                                    <Input value={currency} readOnly className="bg-gray-100 mt-2" />
                                </div>

                                {/* Fee Fields - FIXED: Now properly handles zero values */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Program Tuition Fee *</Label>
                                        <div className="relative mt-2">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                {getCountryInfo(selectedCountry)?.symbol}
                                            </span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={getInputValue(programTuitionFee)}
                                                onChange={(e) => setProgramTuitionFee(handleNumberInput(e.target.value))}
                                                className="pl-8"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Student Visa Fee</Label>
                                        <div className="relative mt-2">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                {getCountryInfo(selectedCountry)?.symbol}
                                            </span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={getInputValue(studentVisaFee)}
                                                onChange={(e) => setStudentVisaFee(handleNumberInput(e.target.value))}
                                                className="pl-8"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Accommodation</Label>
                                        <div className="relative mt-2">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                {getCountryInfo(selectedCountry)?.symbol}
                                            </span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={getInputValue(accommodation)}
                                                onChange={(e) => setAccommodation(handleNumberInput(e.target.value))}
                                                className="pl-8"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Airport Transfer</Label>
                                        <div className="relative mt-2">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                {getCountryInfo(selectedCountry)?.symbol}
                                            </span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={getInputValue(airportTransfer)}
                                                onChange={(e) => setAirportTransfer(handleNumberInput(e.target.value))}
                                                className="pl-8"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* VAT */}
                                <div>
                                    <Label>VAT (%)</Label>
                                    <div className="relative mt-2">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={getInputValue(vat)}
                                            onChange={(e) => setVat(handleNumberInput(e.target.value))}
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            %
                                        </span>
                                    </div>
                                </div>

                                {/* Dynamic Fields */}
                                <div className="pt-4 border-t">
                                    <Label className="text-base font-semibold mb-3 block">
                                        Additional Fees (Optional)
                                    </Label>
                                    <div className="flex gap-2 mb-4">
                                        <Input
                                            placeholder="e.g., Application Fee"
                                            value={newFieldName}
                                            onChange={(e) => setNewFieldName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDynamicField())}
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleAddDynamicField}
                                            disabled={!newFieldName.trim()}
                                            variant="outline"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {dynamicFields.length > 0 && (
                                        <div className="space-y-3">
                                            {dynamicFields.map((field) => (
                                                <div key={field.id} className="flex gap-2">
                                                    <div className="flex-1">
                                                        <Label className="text-sm mb-1">{field.fieldName}</Label>
                                                        <Input
                                                            value={field.fieldValue}
                                                            onChange={(e) => handleUpdateDynamicField(field.id, e.target.value)}
                                                            placeholder="Enter value"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveDynamicField(field.id)}
                                                        className="text-red-600 mt-6"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Total Display */}
                                <div className="p-4 bg-gray-50 rounded-lg border">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calculator className="h-5 w-5 text-gray-600" />
                                            <Label className="text-lg font-semibold">Total Amount</Label>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {getCountryInfo(selectedCountry)?.symbol}
                                            {calculateTotal().toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Form Actions */}
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    resetForm();
                                    setIsAddingNew(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSaveFee}
                                disabled={!selectedCountry || !selectedMode}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {editingId ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Update
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Final Save Button */}
            <div className="flex justify-end pt-6 border-t">
                <Button
                    onClick={handleFinalSave}
                    disabled={savedFees.length === 0 || isSubmitting}
                    className="bg-gray-900 hover:bg-gray-800"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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