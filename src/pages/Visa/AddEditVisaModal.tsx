// app/features/visa/components/AddEditVisaModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { visaService } from "../../services/visaService";
import { toast } from "sonner";
import type { CreateVisaDto, Visa, VisaDocument, VisaRenewalDocument, VisaStep } from "../../types/visa";

interface AddEditVisaModalProps {
    isOpen: boolean;
    onClose: () => void;
    visa: Visa | null;
    onSuccess: () => void;
}

export function AddEditVisaModal({
    isOpen,
    onClose,
    visa,
    onSuccess,
}: AddEditVisaModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<CreateVisaDto>({
        country: "",
        visaDocuments: [],
        visaFee: "",
        currency: "USD",
        visaSteps: [],
        visaRenewalCost: "",
        renewalDocuments: [],
        visaSuccessRate: "",
        visaProcessingTime: "",
        visaProcessingTimeUnit: "days",
        status: "active",
    });

    useEffect(() => {
        if (visa) {
            setFormData({
                country: visa.country,
                visaDocuments: visa.visaDocuments.map(({ id, ...rest }) => rest),
                visaFee: visa.visaFee,
                currency: visa.currency,
                visaSteps: visa.visaSteps.map(({ id, ...rest }) => rest),
                visaRenewalCost: visa.visaRenewalCost,
                renewalDocuments: visa.renewalDocuments.map(({ id, ...rest }) => rest),
                visaSuccessRate: visa.visaSuccessRate,
                visaProcessingTime: visa.visaProcessingTime,
                visaProcessingTimeUnit: visa.visaProcessingTimeUnit,
                status: visa.status,
            });
        } else {
            setFormData({
                country: "",
                visaDocuments: [],
                visaFee: "",
                currency: "USD",
                visaSteps: [],
                visaRenewalCost: "",
                renewalDocuments: [],
                visaSuccessRate: "",
                visaProcessingTime: "",
                visaProcessingTimeUnit: "days",
                status: "active",
            });
        }
    }, [visa, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (visa) {
                await visaService.updateVisa(visa._id, formData);
                toast.success("Visa updated successfully");
            } else {
                await visaService.createVisa(formData);
                toast.success("Visa created successfully");

            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving visa:", error);

            // Extract error message from backend response
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                "Failed to save visa";

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Visa Documents handlers
    const addVisaDocument = () => {
        setFormData(prev => ({
            ...prev,
            visaDocuments: [
                ...prev.visaDocuments,
                {
                    _id: Date.now().toString(), // Add _id
                    name: "",
                    description: "",
                    isMandatory: false
                }
            ],
        }));
    };

    const updateVisaDocument = (index: number, field: keyof Omit<VisaDocument, 'id'>, value: any) => {
        setFormData(prev => ({
            ...prev,
            visaDocuments: prev.visaDocuments.map((doc, i) =>
                i === index ? { ...doc, [field]: value } : doc
            ),
        }));
    };

    const removeVisaDocument = (index: number) => {
        setFormData(prev => ({
            ...prev,
            visaDocuments: prev.visaDocuments.filter((_, i) => i !== index),
        }));
    };

    // Visa Steps handlers
    const addVisaStep = () => {
        setFormData(prev => ({
            ...prev,
            visaSteps: [
                ...prev.visaSteps,
                {
                    _id: Date.now().toString(), // Add _id
                    stepNumber: prev.visaSteps.length + 1,
                    title: "",
                    description: "",
                    estimatedDays: 0
                },
            ],
        }));
    };
    const updateVisaStep = (index: number, field: keyof Omit<VisaStep, 'id'>, value: any) => {
        // Validate description word count (max 5 words)
        if (field === 'description' && value) {
            const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
            if (wordCount > 5) {
                toast.error("Description should be maximum 5 words");
                return;
            }
        }

        setFormData(prev => ({
            ...prev,
            visaSteps: prev.visaSteps.map((step, i) =>
                i === index ? { ...step, [field]: value } : step
            ),
        }));
    };

    const removeVisaStep = (index: number) => {
        setFormData(prev => ({
            ...prev,
            visaSteps: prev.visaSteps
                .filter((_, i) => i !== index)
                .map((step, i) => ({ ...step, stepNumber: i + 1 })),
        }));
    };

    // Renewal Documents handlers
    const addRenewalDocument = () => {
        setFormData(prev => ({
            ...prev,
            renewalDocuments: [
                ...prev.renewalDocuments,
                {
                    _id: Date.now().toString(), // Add _id
                    name: "",
                    description: "",
                    isMandatory: false
                }
            ],
        }));
    };

    const updateRenewalDocument = (index: number, field: keyof Omit<VisaRenewalDocument, 'id'>, value: any) => {
        setFormData(prev => ({
            ...prev,
            renewalDocuments: prev.renewalDocuments.map((doc, i) =>
                i === index ? { ...doc, [field]: value } : doc
            ),
        }));
    };

    const removeRenewalDocument = (index: number) => {
        setFormData(prev => ({
            ...prev,
            renewalDocuments: prev.renewalDocuments.filter((_, i) => i !== index),
        }));
    };

    // Helper function to count words
    const getWordCount = (text: string) => {
        return text.trim().split(/\s+/).filter(Boolean).length;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] lg:max-w-[85vw] xl:max-w-[75vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{visa ? "Edit Visa" : "Add New Visa"}</DialogTitle>
                    <DialogDescription>
                        {visa ? "Update visa details below." : "Fill in the details to create a new visa."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Basic Information</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="country">
                                    Country <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: "active" | "inactive") =>
                                        setFormData(prev => ({ ...prev, status: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="visaFee">
                                    Visa Fee <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="visaFee"
                                    type="text"
                                    value={formData.visaFee}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            visaFee: value === "" ? "" : value
                                        }));
                                    }}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Input
                                    id="currency"
                                    value={formData.currency}
                                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="visaRenewalCost">
                                    Renewal Cost <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="visaRenewalCost"
                                    type="text"
                                    value={formData.visaRenewalCost}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            visaRenewalCost: value === "" ? "" : value
                                        }));
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="visaSuccessRate">
                                    Success Rate (%) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="visaSuccessRate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.visaSuccessRate}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            visaSuccessRate: value === "" ? "" : value
                                        }));
                                    }}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="visaProcessingTime">
                                    Processing Time <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="visaProcessingTime"
                                    type="text"
                                    value={formData.visaProcessingTime}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            visaProcessingTime: value === "" ? "" : value
                                        }));
                                    }}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="visaProcessingTimeUnit">Time Unit</Label>
                                <Select
                                    value={formData.visaProcessingTimeUnit}
                                    onValueChange={(value: "days" | "weeks" | "months") =>
                                        setFormData(prev => ({ ...prev, visaProcessingTimeUnit: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="days">Days</SelectItem>
                                        <SelectItem value="weeks">Weeks</SelectItem>
                                        <SelectItem value="months">Months</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Visa Documents */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Visa Documents</h3>
                            <Button type="button" onClick={addVisaDocument} variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Document
                            </Button>
                        </div>

                        {formData.visaDocuments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                No documents added. Click "Add Document" to create one.
                            </div>
                        ) : (
                            formData.visaDocuments.map((doc, index) => (
                                <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Document Name</Label>
                                                <Input
                                                    value={doc.name}
                                                    onChange={(e) => updateVisaDocument(index, 'name', e.target.value)}
                                                    placeholder="e.g., Passport"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Input
                                                    value={doc.description || ""}
                                                    onChange={(e) => updateVisaDocument(index, 'description', e.target.value)}
                                                    placeholder="Optional description"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeVisaDocument(index)}
                                            className="ml-2"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`visa-doc-mandatory-${index}`}
                                            checked={doc.isMandatory}
                                            onCheckedChange={(checked) => updateVisaDocument(index, 'isMandatory', checked === true)}
                                        />
                                        <Label htmlFor={`visa-doc-mandatory-${index}`} className="cursor-pointer">
                                            Mandatory
                                        </Label>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Visa Steps */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Visa Steps</h3>
                            <Button type="button" onClick={addVisaStep} variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Step
                            </Button>
                        </div>

                        {formData.visaSteps.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                No steps added. Click "Add Step" to create one.
                            </div>
                        ) : (
                            formData.visaSteps.map((step, index) => (
                                <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 space-y-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Step Title</Label>
                                                    <Input
                                                        value={step.title}
                                                        onChange={(e) => updateVisaStep(index, 'title', e.target.value)}
                                                        placeholder="e.g., Submit Application"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Estimated Days</Label>
                                                    <Input
                                                        type="number"
                                                        value={step.estimatedDays || ""}
                                                        onChange={(e) => updateVisaStep(index, 'estimatedDays', parseInt(e.target.value) || 0)}
                                                        placeholder="Optional"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>
                                                    Description (Optional - Max 5 words)
                                                    {step.description && (
                                                        <span className={`ml-2 text-xs ${getWordCount(step.description) > 5 ? 'text-red-600' : 'text-gray-500'}`}>
                                                            ({getWordCount(step.description)}/5 words)
                                                        </span>
                                                    )}
                                                </Label>
                                                <Input
                                                    value={step.description}
                                                    onChange={(e) => updateVisaStep(index, 'description', e.target.value)}
                                                    placeholder="Brief description (max 5 words)"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeVisaStep(index)}
                                            className="ml-2"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Renewal Documents */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Renewal Documents</h3>
                            <Button type="button" onClick={addRenewalDocument} variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Document
                            </Button>
                        </div>

                        {formData.renewalDocuments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                No renewal documents added. Click "Add Document" to create one.
                            </div>
                        ) : (
                            formData.renewalDocuments.map((doc, index) => (
                                <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Document Name</Label>
                                                <Input
                                                    value={doc.name}
                                                    onChange={(e) => updateRenewalDocument(index, 'name', e.target.value)}
                                                    placeholder="e.g., Current Visa Copy"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Input
                                                    value={doc.description || ""}
                                                    onChange={(e) => updateRenewalDocument(index, 'description', e.target.value)}
                                                    placeholder="Optional description"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeRenewalDocument(index)}
                                            className="ml-2"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`renewal-doc-mandatory-${index}`}
                                            checked={doc.isMandatory}
                                            onCheckedChange={(checked) => updateRenewalDocument(index, 'isMandatory', checked === true)}
                                        />
                                        <Label htmlFor={`renewal-doc-mandatory-${index}`} className="cursor-pointer">
                                            Mandatory
                                        </Label>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {visa ? "Update" : "Create"} Visa
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}