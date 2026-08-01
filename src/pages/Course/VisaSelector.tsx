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
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Loading visas...</span>
            </div>
        );
    }

    return (
        <>
            <div>
                <Label htmlFor="visa-select" className="text-base font-semibold mb-3 block">
                    {label} {required && <span className="text-destructive">*</span>}
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
                    <p className="text-sm text-muted-foreground mt-2">
                        Select a visa process that matches your course destination country
                    </p>
                )}
            </div>

            {/* Selected Visa Details Card */}
            {showDetails && selectedVisa && (
                <Card className="p-6 bg-card border-border hover:shadow-lg transition-all mt-4">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h4 className="text-xl font-bold text-foreground">
                                {selectedVisa.country} Visa Process
                            </h4>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${selectedVisa.status === 'active'
                                ? 'bg-accent text-primary'
                                : 'bg-muted text-foreground'
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
                            <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Visa Fee</p>
                                <p className="font-semibold text-foreground">
                                    {selectedVisa.currency} {selectedVisa.visaFee}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Clock className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Processing Time</p>
                                <p className="font-semibold text-foreground">
                                    {selectedVisa.visaProcessingTime} {selectedVisa.visaProcessingTimeUnit}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Success Rate</p>
                                <p className="font-semibold text-foreground">
                                    {selectedVisa.visaSuccessRate}%
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <FileText className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Documents</p>
                                <p className="font-semibold text-foreground">
                                    {selectedVisa.visaDocuments.length} Required
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Modal - Copy your existing modal code here */}
            {modalVisa && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-card rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-foreground">
                                        {modalVisa.country} Visa Process
                                    </h3>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${modalVisa.status === 'active'
                                        ? 'bg-accent text-primary'
                                        : 'bg-muted text-foreground'
                                        }`}>
                                        {modalVisa.status}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setModalVisa(null)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                {/* Key Metrics */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <Card className="p-4 bg-accent border-primary/30">
                                        <div className="flex items-start gap-3">
                                            <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Visa Fee</p>
                                                <p className="text-lg font-bold text-foreground">
                                                    {modalVisa.currency} {modalVisa.visaFee}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-4 bg-accent border-primary/30">
                                        <div className="flex items-start gap-3">
                                            <Clock className="h-5 w-5 text-primary mt-0.5" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Processing Time</p>
                                                <p className="text-lg font-bold text-foreground">
                                                    {modalVisa.visaProcessingTime} {modalVisa.visaProcessingTimeUnit}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-4 bg-accent border-primary/30">
                                        <div className="flex items-start gap-3">
                                            <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Success Rate</p>
                                                <p className="text-lg font-bold text-foreground">
                                                    {modalVisa.visaSuccessRate}%
                                                </p>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-4 bg-muted border-border">
                                        <div className="flex items-start gap-3">
                                            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Renewal Cost</p>
                                                <p className="text-lg font-bold text-foreground">
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
                                            <FileText className="h-5 w-5 text-foreground" />
                                            Visa Process Steps ({modalVisa.visaSteps.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {modalVisa.visaSteps.map((step) => (
                                                <Card key={step._id} className="p-4 bg-muted">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
                                                            {step.stepNumber}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <h5 className="font-semibold text-foreground">{step.title}</h5>
                                                                {step.estimatedDays && (
                                                                    <span className="text-xs bg-accent text-primary px-2 py-1 rounded-full">
                                                                        ~{step.estimatedDays} days
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
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
                                            <FileText className="h-5 w-5 text-foreground" />
                                            Required Documents ({modalVisa.visaDocuments.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {modalVisa.visaDocuments.map((doc) => (
                                                <Card key={doc._id} className="p-4 bg-muted">
                                                    <div className="flex items-start gap-3">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${doc.isMandatory
                                                            ? 'bg-destructive/10 text-destructive'
                                                            : 'bg-accent text-primary'
                                                            }`}>
                                                            {doc.isMandatory ? 'Required' : 'Optional'}
                                                        </span>
                                                        <div>
                                                            <p className="font-medium text-foreground">{doc.name}</p>
                                                            {doc.description && (
                                                                <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
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
                                            <FileText className="h-5 w-5 text-foreground" />
                                            Renewal Documents ({modalVisa.renewalDocuments.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {modalVisa.renewalDocuments.map((doc) => (
                                                <Card key={doc._id} className="p-4 bg-muted">
                                                    <div className="flex items-start gap-3">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${doc.isMandatory
                                                            ? 'bg-destructive/10 text-destructive'
                                                            : 'bg-accent text-primary'
                                                            }`}>
                                                            {doc.isMandatory ? 'Required' : 'Optional'}
                                                        </span>
                                                        <div>
                                                            <p className="font-medium text-foreground">{doc.name}</p>
                                                            {doc.description && (
                                                                <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
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