import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { universityService } from "@/services/universityService";

const TUITION_FEE_TYPES = [
    "Fully Tuition Fee Funded",
    "Scholarships",
    "Regular (Self-Funded Program)",
] as const;

const LEVEL_OPTIONS = [
    "Certification",
    "Diploma",
    "Foundation Diploma (Level 3 Diploma)",
    "Level 4 Diploma",
    "Level 5 Diploma",
    "Higher National Diploma (Level 5 Extended Diploma)",
    "PG Diploma (Level 7 Diploma)",
    "Bachelors",
    "Masters",
    "Doctorate (PhD)",
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

const feeStructureSchema = z.object({
    // String (not enum) so existing records with legacy levels still load/submit.
    level: z.string().min(1, "Level is required"),
    currency: z.string().min(1, "Currency is required"),
    tuitionFee: z
        .string()
        .min(1, "Average tuition fee is required")
        // Accept a single number (15000 / 15000.5) or a range (1000-2000, 1000 - 2000)
        .regex(
            /^\d+(\.\d+)?(\s*-\s*\d+(\.\d+)?)?$/,
            "Enter a number or a range like 1000-2000"
        ),
    tuitionFeeType: z.enum([
        "Fully Tuition Fee Funded",
        "Scholarships",
        "Regular (Self-Funded Program)",
    ]).optional(),
});

const feeSchema = z.object({
    fees: z.array(feeStructureSchema),
});

type FeeFormData = z.infer<typeof feeSchema>;

interface FeeSectionProps {
    slug: string;
    initialData: any[];
    onSuccess: () => void;
}

export function FeeSection({ slug, initialData, onSuccess }: FeeSectionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        watch,
        setValue,
    } = useForm<FeeFormData>({
        resolver: zodResolver(feeSchema),
        defaultValues: {
            fees: initialData.length > 0 ? initialData : [],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "fees" });

    const addFeeStructure = () => {
        append({
            level: "",
            currency: "USD",
            tuitionFee: "",
            tuitionFeeType: "Regular (Self-Funded Program)",
        });
    };

    const onSubmit = async (data: FeeFormData) => {
        try {
            setIsSubmitting(true);
            // The body IS the section: this endpoint takes the fee LIST, not an
            // object wrapping it. Sending `data` posted {"fees":[...]}, which the
            // API stored verbatim — turning `fees` into a document and making
            // every later read of the university fail to decode.
            await universityService.updateFees(slug, data.fees);
            onSuccess();
            toast.success("Fee structure saved");
        } catch (error: any) {
            console.error("Error updating fees:", error);
            toast.error(error.response?.data?.message || "Failed to update fee structure");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Fee Structure</CardTitle>
                            <CardDescription>Manage tuition fees, scholarships and funding type</CardDescription>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addFeeStructure}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Fee
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-5 border rounded-xl space-y-4 bg-muted">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm text-foreground">
                                    Fee Structure #{index + 1}
                                </h4>
                                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>

                            {/* Row 1: Level + Currency */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Level *</Label>
                                    <Select
                                        value={watch(`fees.${index}.level`) || ""}
                                        onValueChange={(v) => setValue(`fees.${index}.level`, v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LEVEL_OPTIONS.map((lvl) => (
                                                <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.fees?.[index]?.level && (
                                        <p className="text-xs text-destructive">{errors.fees[index]?.level?.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Currency *</Label>
                                    <Select
                                        value={watch(`fees.${index}.currency`) || ""}
                                        onValueChange={(v) => setValue(`fees.${index}.currency`, v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CURRENCY_OPTIONS.map((c) => (
                                                <SelectItem key={c.code} value={c.code}>
                                                    {c.name} ({c.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.fees?.[index]?.currency && (
                                        <p className="text-xs text-destructive">{errors.fees[index]?.currency?.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Average Tuition Fee */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Average Tuition Fee *</Label>
                                    <Input
                                        type="text"
                                        inputMode="text"
                                        {...register(`fees.${index}.tuitionFee`)}
                                        placeholder="e.g. 15000 or 1000-2000"
                                    />
                                    {errors.fees?.[index]?.tuitionFee && (
                                        <p className="text-xs text-destructive">{errors.fees[index]?.tuitionFee?.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t pt-4">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                    Funding &amp; Scholarship
                                </p>

                                {/* Row 3: Tuition Fee Type */}
                                <div className="space-y-2">
                                    <Label>Tuition Fee Type</Label>
                                    <Select
                                        value={watch(`fees.${index}.tuitionFeeType`) || ""}
                                        onValueChange={(v) =>
                                            setValue(
                                                `fees.${index}.tuitionFeeType`,
                                                v as typeof TUITION_FEE_TYPES[number]
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select funding type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TUITION_FEE_TYPES.map((t) => (
                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    ))}

                    {fields.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-10">
                            No fee structures added yet. Click "Add Fee" to get started.
                        </p>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Fee Structure
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
