import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plane, Loader2, FileText, DollarSign, Clock, TrendingUp, X, Eye } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Visa } from '@/types/visa';
import { visaService } from '@/services/visaService';
import { toast } from 'sonner';
import { useSectionGuard } from '@/hooks/use-unsaved-changes';

interface VisaProcessSectionProps {
    data: Array<{ visaId: any }> | any[] | null;
    onSave: (data: Array<{ visaId: string }>) => Promise<void> | void;
    onNext: () => void;
}

/** The stored value is a list whose one row holds the visa reference, and the
 *  reference is a hex string or a populated document depending on the read. */
function extractVisaId(data: VisaProcessSectionProps['data']): string {
    if (!data || !Array.isArray(data) || data.length === 0) return '';

    const firstVisa = data[0];
    if (firstVisa?.visaId) {
        if (typeof firstVisa.visaId === 'object' && firstVisa.visaId._id) {
            return firstVisa.visaId._id;
        }
        if (typeof firstVisa.visaId === 'string') {
            return firstVisa.visaId;
        }
    }
    return '';
}

export function VisaProcessSection({
    data,
    onSave,
    onNext,
}: VisaProcessSectionProps) {
    const [visas, setVisas] = useState<Visa[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVisa, setSelectedVisa] = useState<Visa | null>(null);
    const [visaId, setVisaId] = useState<string>(() => extractVisaId(data));
    const [modalVisa, setModalVisa] = useState<Visa | null>(null);

    useEffect(() => {
        fetchVisas();
    }, []);

    useEffect(() => {
        const initialVisaId = extractVisaId(data);
        if (initialVisaId) {
            setVisaId(initialVisaId);
        }
    }, [data]);

    useEffect(() => {

        if (visaId && visas.length > 0) {
            // Use _id for matching since API returns _id
            const visa = visas.find(v => v._id === visaId);
            setSelectedVisa(visa || null);
        } else {
            setSelectedVisa(null);
        }
    }, [visaId, visas]);

    const fetchVisas = async () => {
        try {
            setIsLoading(true);
            const response = await visaService.getAllVisas({ status: 'active', limit: 100 });
            const visaData = Array.isArray(response) ? response : (response as any)?.data || [];
            setVisas(visaData);
        } catch (error) {
            console.error('Error fetching visas:', error);
            setVisas([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVisaSelect = (selectedId: string) => {
        setVisaId(selectedId);
    };

    /** Throws when the section is not fit to save — see DocumentsRequiredSection. */
    const submit = async () => {
        if (!visaId) {
            throw new Error('Please select a visa process');
        }

        // The body IS the section, and `visaProcess` is a LIST. Sending the bare
        // object stored a document into []CourseVisaProcess, after which the
        // course could not be read, edited or deleted through the API at all.
        await onSave([{ visaId }]);
    };

    useSectionGuard({
        id: 'course.visa',
        label: 'Visa Process',
        value: visaId,
        onSave: submit,
        onRestore: setVisaId,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await submit();
            onNext();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not save this section');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Loading visa processes...</span>
            </div>
        );
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Plane className="h-8 w-8 text-foreground" />
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Visa Process</h2>
                            <p className="text-sm text-muted-foreground">Select the visa process for this course</p>
                        </div>
                    </div>

                    {/* Visa Selection Dropdown */}
                    <Card className="p-6 bg-card border-border mb-6">
                        <div>
                            <Label htmlFor="visaId" className="text-base font-semibold mb-3 block">
                                Select Visa Process <span className="text-destructive">*</span>
                            </Label>

                            <Select
                                value={visaId}
                                onValueChange={handleVisaSelect}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choose a country visa process" />
                                </SelectTrigger>
                                <SelectContent>
                                    {visas.length === 0 ? (
                                        <SelectItem value="no-visa" disabled>
                                            No visa processes available
                                        </SelectItem>
                                    ) : (
                                        visas.map((visa) => (
                                            <SelectItem
                                                key={visa._id}
                                                value={visa._id}
                                            >
                                                {visa.country} Visa
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>

                            {!visaId && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Select a visa process that matches your course destination country
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* Selected Visa Card */}
                    {selectedVisa && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Selected Visa Process</h3>
                            <Card className="p-6 bg-card border-border hover:shadow-lg transition-all">
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
                                                {selectedVisa.visaDocuments?.length ?? 0} Required
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t">
                    <Button type="submit" className="bg-primary hover:bg-primary/80">
                        Save & Continue
                    </Button>
                </div>
            </form>

            {/* Modal for Full Visa Details */}
            {modalVisa && (
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
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
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
                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium shrink-0 ${doc.isMandatory
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
                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium shrink-0 ${doc.isMandatory
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
            )}
        </>
    );
}