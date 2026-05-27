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

const SCHOLARSHIP_PERCENTAGES = [
    "10%", "20%", "30%", "40%", "50%",
    "60%", "70%", "80%", "90%", "100%",
    "Not Applicable",
] as const;

const feeStructureSchema = z.object({
    level: z.enum(["undergraduate", "postgraduate"]),
    currency: z.string().min(1, "Currency is required"),
    tuitionFee: z.string().min(1, "Tuition fee is required"),
    applicationFee: z.string().optional(),
    duration: z.string().optional(),
    tuitionFeeType: z.enum([
        "Fully Tuition Fee Funded",
        "Scholarships",
        "Regular (Self-Funded Program)",
    ]).optional(),
    scholarshipPercentage: z.enum([
        "10%", "20%", "30%", "40%", "50%",
        "60%", "70%", "80%", "90%", "100%",
        "Not Applicable",
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
            level: "undergraduate",
            currency: "USD",
            tuitionFee: "",
            applicationFee: "",
            duration: "",
            tuitionFeeType: "Regular (Self-Funded Program)",
            scholarshipPercentage: "Not Applicable",
        });
    };

    const onSubmit = async (data: FeeFormData) => {
        try {
            setIsSubmitting(true);
            await universityService.updateFees(slug, data);
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
                        <div key={field.id} className="p-5 border rounded-xl space-y-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm text-gray-700">
                                    Fee Structure #{index + 1}
                                </h4>
                                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>

                            {/* Row 1: Level + Currency */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Level *</Label>
                                    <Select
                                        value={watch(`fees.${index}.level`)}
                                        onValueChange={(v) => setValue(`fees.${index}.level`, v as "undergraduate" | "postgraduate")}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="undergraduate">Undergraduate</SelectItem>
                                            <SelectItem value="postgraduate">Postgraduate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Currency *</Label>
                                    <Input {...register(`fees.${index}.currency`)} placeholder="USD" />
                                    {errors.fees?.[index]?.currency && (
                                        <p className="text-xs text-red-500">{errors.fees[index]?.currency?.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Tuition Fee + Application Fee */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tuition Fee *</Label>
                                    <Input {...register(`fees.${index}.tuitionFee`)} placeholder="15000 – 20000" />
                                    {errors.fees?.[index]?.tuitionFee && (
                                        <p className="text-xs text-red-500">{errors.fees[index]?.tuitionFee?.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Application Fee</Label>
                                    <Input {...register(`fees.${index}.applicationFee`)} placeholder="100" />
                                </div>
                            </div>

                            {/* Row 3: Duration */}
                            <div className="space-y-2">
                                <Label>Duration</Label>
                                <Input {...register(`fees.${index}.duration`)} placeholder="4 years" />
                            </div>

                            {/* Divider */}
                            <div className="border-t pt-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                    Funding &amp; Scholarship
                                </p>

                                {/* Row 4: Tuition Fee Type */}
                                <div className="space-y-2 mb-4">
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

                                {/* Row 5: Scholarship Percentage */}
                                <div className="space-y-2">
                                    <Label>Scholarship Percentage</Label>
                                    <Select
                                        value={watch(`fees.${index}.scholarshipPercentage`) || "Not Applicable"}
                                        onValueChange={(v) =>
                                            setValue(
                                                `fees.${index}.scholarshipPercentage`,
                                                v as typeof SCHOLARSHIP_PERCENTAGES[number]
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SCHOLARSHIP_PERCENTAGES.map((p) => (
                                                <SelectItem key={p} value={p}>{p}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    ))}

                    {fields.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-10">
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
