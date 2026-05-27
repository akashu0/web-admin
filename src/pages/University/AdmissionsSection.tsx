import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { universityService } from "@/services/universityService";

// ── Zod schema ────────────────────────────────────────────────────────────────

const admissionEntrySchema = z.object({
    required: z.boolean().optional().default(false),
    details: z.string().optional().default(""),
});

const customRequirementSchema = z.object({
    name: z.string().min(1, "Name is required"),
    details: z.string().optional().default(""),
});

const admissionsSchema = z.object({
    sat:                           admissionEntrySchema.optional(),
    ielts:                         admissionEntrySchema.optional(),
    act:                           admissionEntrySchema.optional(),
    toefl:                         admissionEntrySchema.optional(),
    passportCopy:                  admissionEntrySchema.optional(),
    photograph:                    admissionEntrySchema.optional(),
    academicCertificates:          admissionEntrySchema.optional(),
    academicTranscripts:           admissionEntrySchema.optional(),
    sop:                           admissionEntrySchema.optional(),
    resume:                        admissionEntrySchema.optional(),
    officialCertifiedTranslations: admissionEntrySchema.optional(),
    lettersOfRecommendation:       admissionEntrySchema.optional(),
    researchProposal:              admissionEntrySchema.optional(),
    atasCertificate:               admissionEntrySchema.optional(),
    financialProof:                admissionEntrySchema.optional(),
    customRequirements:            z.array(customRequirementSchema).optional().default([]),
});

type AdmissionsFormData = z.infer<typeof admissionsSchema>;

// ── Fixed requirements list ───────────────────────────────────────────────────

const FIXED_REQUIREMENTS: { key: keyof Omit<AdmissionsFormData, "customRequirements">; label: string }[] = [
    { key: "sat",                           label: "SAT" },
    { key: "ielts",                         label: "IELTS" },
    { key: "act",                           label: "ACT" },
    { key: "toefl",                         label: "TOEFL" },
    { key: "passportCopy",                  label: "Passport Copy" },
    { key: "photograph",                    label: "Photograph" },
    { key: "academicCertificates",          label: "Academic Certificates" },
    { key: "academicTranscripts",           label: "Academic Transcripts" },
    { key: "sop",                           label: "SOP (Statement of Purpose)" },
    { key: "resume",                        label: "Resume / CV" },
    { key: "officialCertifiedTranslations", label: "Official Certified Translations" },
    { key: "lettersOfRecommendation",       label: "Letters of Recommendation / References" },
    { key: "researchProposal",              label: "Research Proposal" },
    { key: "atasCertificate",               label: "ATAS Certificate" },
    { key: "financialProof",                label: "Financial Proof" },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdmissionsSectionProps {
    slug: string;
    initialData: any;
    onSuccess: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdmissionsSection({ slug, initialData, onSuccess }: AdmissionsSectionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const buildDefaults = (): AdmissionsFormData => {
        const base: AdmissionsFormData = {
            customRequirements: initialData?.customRequirements || [],
        };
        FIXED_REQUIREMENTS.forEach(({ key }) => {
            (base as any)[key] = {
                required: initialData?.[key]?.required ?? false,
                details:  initialData?.[key]?.details  ?? "",
            };
        });
        return base;
    };

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        formState: { errors },
    } = useForm<AdmissionsFormData>({
        resolver: zodResolver(admissionsSchema),
        defaultValues: buildDefaults(),
    });

    const { fields: customFields, append: addCustom, remove: removeCustom } = useFieldArray({
        control,
        name: "customRequirements",
    });

    const onSubmit = async (data: AdmissionsFormData) => {
        try {
            setIsSubmitting(true);
            await universityService.updateAdmissions(slug, data);
            onSuccess();
            toast.success("Admissions requirements saved");
        } catch (error: any) {
            console.error("Error updating admissions:", error);
            toast.error(error.response?.data?.message || "Failed to update admissions");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* ── Fixed requirements ────────────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <CardTitle>Admission Requirements</CardTitle>
                    <CardDescription>
                        Toggle which documents are required and add details for each.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="divide-y divide-gray-100">
                        {FIXED_REQUIREMENTS.map(({ key, label }) => {
                            const isRequired = watch(`${key}.required` as any) ?? false;
                            return (
                                <div
                                    key={key}
                                    className="py-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start"
                                >
                                    {/* Left — label + details input */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-purple-500 shrink-0" />
                                            <span className="text-sm font-semibold text-gray-800">{label}</span>
                                            {isRequired && (
                                                <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                                    Required
                                                </span>
                                            )}
                                        </div>
                                        <Textarea
                                            {...register(`${key}.details` as any)}
                                            placeholder={`Details / score range / notes for ${label}…`}
                                            rows={2}
                                            className="resize-none text-sm"
                                        />
                                    </div>

                                    {/* Right — toggle */}
                                    <div className="flex flex-col items-center gap-1 pt-1 sm:pt-6 sm:pl-4">
                                        <Switch
                                            checked={!!isRequired}
                                            onCheckedChange={(checked) =>
                                                setValue(`${key}.required` as any, checked)
                                            }
                                        />
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {isRequired ? "On" : "Off"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* ── Custom requirements ───────────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Additional Requirements</CardTitle>
                            <CardDescription>Add any other custom admission documents.</CardDescription>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addCustom({ name: "", details: "" })}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {customFields.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-6">
                            No additional requirements. Click "Add Another" to add one.
                        </p>
                    )}

                    {customFields.map((field, idx) => (
                        <div
                            key={field.id}
                            className="p-4 border rounded-xl bg-gray-50 space-y-3"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 space-y-1">
                                    <Label className="text-xs text-gray-500">Requirement Name *</Label>
                                    <Input
                                        {...register(`customRequirements.${idx}.name`)}
                                        placeholder="e.g. Portfolio, Work Experience Letter…"
                                    />
                                    {errors.customRequirements?.[idx]?.name && (
                                        <p className="text-xs text-red-500">
                                            {errors.customRequirements[idx]?.name?.message}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="mt-5 shrink-0"
                                    onClick={() => removeCustom(idx)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">Details</Label>
                                <Textarea
                                    {...register(`customRequirements.${idx}.details`)}
                                    placeholder="Additional details or instructions…"
                                    rows={2}
                                    className="resize-none text-sm"
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Admissions
                </Button>
            </div>
        </form>
    );
}
