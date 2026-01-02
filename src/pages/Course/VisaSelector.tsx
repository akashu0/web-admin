// components/course/sections/VisaSelector.tsx
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, FileText, DollarSign, Clock, TrendingUp, Eye, X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Visa } from '@/types/visa';
import { visaService } from '@/services/visaService';

interface VisaSelectorProps {
    value: string; // visa ID
    onChange: (visaId: string) => void;
    label?: string;
    required?: boolean;
    placeholder?: string;
    showDetails?: boolean; // Whether to show selected visa details card
}

export function VisaSelector({
    value,
    onChange,
    label = "Select Visa Process",
    required = false,
    placeholder = "Choose a country visa process",
    showDetails = true
}: VisaSelectorProps) {
    const [visas, setVisas] = useState<Visa[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVisa, setSelectedVisa] = useState<Visa | null>(null);
    const [modalVisa, setModalVisa] = useState<Visa | null>(null);

    useEffect(() => {
        fetchVisas();
    }, []);

    useEffect(() => {
        if (value && visas.length > 0) {
            const visa = visas.find(v => v._id === value);
            setSelectedVisa(visa || null);
        } else {
            setSelectedVisa(null);
        }
    }, [value, visas]);

    const fetchVisas = async () => {
        try {
            setIsLoading(true);
            const response = await visaService.getAllVisas({ status: 'active' });
            const visaData = Array.isArray(response) ? response : (response as any)?.data || [];
            setVisas(visaData);
        } catch (error) {
            console.error('Error fetching visas:', error);
            setVisas([]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-600">Loading visas...</span>
            </div>
        );
    }

    return (
        <>
            <div>
                <Label htmlFor="visa-select" className="text-base font-semibold mb-3 block">
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>

                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {visas.length === 0 ? (
                            <SelectItem value="no-visa" disabled>
                                No visa processes available
                            </SelectItem>
                        ) : (
                            visas.map((visa) => (
                                <SelectItem key={visa._id} value={visa._id}>
                                    {visa.country} Visa
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>

                {!value && (
                    <p className="text-sm text-gray-500 mt-2">
                        Select a visa process that matches your course destination country
                    </p>
                )}
            </div>

            {/* Selected Visa Details Card */}
            {showDetails && selectedVisa && (
                <Card className="p-6 bg-white border-gray-200 hover:shadow-lg transition-all mt-4">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h4 className="text-xl font-bold text-gray-900">
                                {selectedVisa.country} Visa Process
                            </h4>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${selectedVisa.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {selectedVisa.status}
                            </span>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setModalVisa(selectedVisa)}
                            className="flex items-center gap-2"
                        >
                            <Eye className="h-4 w-4" />
                            View Details
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-start gap-2">
                            <DollarSign className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Visa Fee</p>
                                <p className="font-semibold text-gray-900">
                                    {selectedVisa.currency} {selectedVisa.visaFee}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Processing Time</p>
                                <p className="font-semibold text-gray-900">
                                    {selectedVisa.visaProcessingTime} {selectedVisa.visaProcessingTimeUnit}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Success Rate</p>
                                <p className="font-semibold text-gray-900">
                                    {selectedVisa.visaSuccessRate}%
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <FileText className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Documents</p>
                                <p className="font-semibold text-gray-900">
                                    {selectedVisa.visaDocuments.length} Required
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Modal - Copy your existing modal code here */}
            {modalVisa && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {modalVisa.country} Visa Process
                                    </h3>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${modalVisa.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {modalVisa.status}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setModalVisa(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                {/* Key Metrics */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <Card className="p-4 bg-purple-50 border-purple-200">
                                        <div className="flex items-start gap-3">
                                            <DollarSign className="h-5 w-5 text-purple-600 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-600">Visa Fee</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {modalVisa.currency} {modalVisa.visaFee}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-4 bg-blue-50 border-blue-200">
                                        <div className="flex items-start gap-3">
                                            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-600">Processing Time</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {modalVisa.visaProcessingTime} {modalVisa.visaProcessingTimeUnit}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-4 bg-green-50 border-green-200">
                                        <div className="flex items-start gap-3">
                                            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-600">Success Rate</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {modalVisa.visaSuccessRate}%
                                                </p>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-4 bg-orange-50 border-orange-200">
                                        <div className="flex items-start gap-3">
                                            <DollarSign className="h-5 w-5 text-orange-600 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-600">Renewal Cost</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {modalVisa.currency} {modalVisa.visaRenewalCost}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Visa Steps */}
                                {modalVisa.visaSteps && modalVisa.visaSteps.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-gray-700" />
                                            Visa Process Steps ({modalVisa.visaSteps.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {modalVisa.visaSteps.map((step) => (
                                                <Card key={step._id} className="p-4 bg-gray-50">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold flex-shrink-0">
                                                            {step.stepNumber}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <h5 className="font-semibold text-gray-900">{step.title}</h5>
                                                                {step.estimatedDays && (
                                                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                                                        ~{step.estimatedDays} days
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Required Documents */}
                                {modalVisa.visaDocuments && modalVisa.visaDocuments.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-gray-700" />
                                            Required Documents ({modalVisa.visaDocuments.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {modalVisa.visaDocuments.map((doc) => (
                                                <Card key={doc._id} className="p-4 bg-gray-50">
                                                    <div className="flex items-start gap-3">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${doc.isMandatory
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {doc.isMandatory ? 'Required' : 'Optional'}
                                                        </span>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{doc.name}</p>
                                                            {doc.description && (
                                                                <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Renewal Documents */}
                                {modalVisa.renewalDocuments && modalVisa.renewalDocuments.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-gray-700" />
                                            Renewal Documents ({modalVisa.renewalDocuments.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {modalVisa.renewalDocuments.map((doc) => (
                                                <Card key={doc._id} className="p-4 bg-gray-50">
                                                    <div className="flex items-start gap-3">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${doc.isMandatory
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {doc.isMandatory ? 'Required' : 'Optional'}
                                                        </span>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{doc.name}</p>
                                                            {doc.description && (
                                                                <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}