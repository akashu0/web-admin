import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { universityService } from "@/services/universityService";

const undergraduateAdmissionsSchema = z.object({
    acceptanceRate: z.string().optional(),
    sat: z.string().optional(),
    act: z.string().optional(),
    toefl: z.string().optional(),
    ielts: z.string().optional(),
    requirements: z.array(z.string()).optional(),
});

const postgraduateAdmissionsSchema = z.object({
    acceptanceRate: z.string().optional(),
    gre: z.string().optional(),
    gpa: z.string().optional(),
    toefl: z.string().optional(),
    ielts: z.string().optional(),
    requirements: z.array(z.string()).optional(),
});

const phdAdmissionsSchema = z.object({
    gre: z.string().optional(),
    gpa: z.string().optional(),
    researchProposalRequired: z.boolean().optional(),
    requirements: z.array(z.string()).optional(),
});

const admissionsSchema = z.object({
    undergraduate: undergraduateAdmissionsSchema.optional(),
    postgraduate: postgraduateAdmissionsSchema.optional(),
    phd: phdAdmissionsSchema.optional(),
});

type AdmissionsFormData = z.infer<typeof admissionsSchema>;

interface AdmissionsSectionProps {
    slug: string;
    initialData: any;
    onSuccess: () => void;
}

export function AdmissionsSection({ slug, initialData, onSuccess }: AdmissionsSectionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [ugRequirement, setUgRequirement] = useState("");
    const [pgRequirement, setPgRequirement] = useState("");
    const [phdRequirement, setPhdRequirement] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<AdmissionsFormData>({
        resolver: zodResolver(admissionsSchema),
        defaultValues: {
            undergraduate: initialData.undergraduate || { requirements: [] },
            postgraduate: initialData.postgraduate || { requirements: [] },
            phd: initialData.phd || { requirements: [] },
        },
    });

    const ugRequirements = watch("undergraduate.requirements") || [];
    const pgRequirements = watch("postgraduate.requirements") || [];
    const phdRequirements = watch("phd.requirements") || [];

    const addUgRequirement = () => {
        if (ugRequirement.trim()) {
            setValue("undergraduate.requirements", [...ugRequirements, ugRequirement]);
            setUgRequirement("");
        }
    };

    const removeUgRequirement = (index: number) => {
        setValue(
            "undergraduate.requirements",
            ugRequirements.filter((_, i) => i !== index)
        );
    };

    const addPgRequirement = () => {
        if (pgRequirement.trim()) {
            setValue("postgraduate.requirements", [...pgRequirements, pgRequirement]);
            setPgRequirement("");
        }
    };

    const removePgRequirement = (index: number) => {
        setValue(
            "postgraduate.requirements",
            pgRequirements.filter((_, i) => i !== index)
        );
    };

    const addPhdRequirement = () => {
        if (phdRequirement.trim()) {
            setValue("phd.requirements", [...phdRequirements, phdRequirement]);
            setPhdRequirement("");
        }
    };

    const removePhdRequirement = (index: number) => {
        setValue(
            "phd.requirements",
            phdRequirements.filter((_, i) => i !== index)
        );
    };

    const onSubmit = async (data: AdmissionsFormData) => {
        try {
            setIsSubmitting(true);
            await universityService.updateAdmissions(slug, data);
            onSuccess();
        } catch (error: any) {
            console.error("Error updating admissions:", error);
            toast.error(error.response?.data?.message || "Failed to update admissions");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Undergraduate */}
            <Card>
                <CardHeader>
                    <CardTitle>Undergraduate Admissions</CardTitle>
                    <CardDescription>Requirements for undergraduate programs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Acceptance Rate</Label>
                            <Input
                                {...register("undergraduate.acceptanceRate")}
                                placeholder="5%"
                            />
                            {errors.undergraduate?.acceptanceRate && (
                                <p className="text-sm text-red-500">{errors.undergraduate?.acceptanceRate.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>SAT</Label>
                            <Input
                                {...register("undergraduate.sat")}
                                placeholder="1400-1600"
                            />
                            {errors.undergraduate?.sat && (
                                <p className="text-sm text-red-500">{errors.undergraduate?.sat.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>ACT</Label>
                            <Input {...register("undergraduate.act")} placeholder="32-36" />
                            {errors.undergraduate?.act && (
                                <p className="text-sm text-red-500">{errors.undergraduate?.act.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>TOEFL</Label>
                            <Input {...register("undergraduate.toefl")} placeholder="100+" />
                            {errors.undergraduate?.toefl && (
                                <p className="text-sm text-red-500">{errors.undergraduate?.toefl.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>IELTS</Label>
                        <Input {...register("undergraduate.ielts")} placeholder="7.0+" />
                        {errors.undergraduate?.ielts && (
                            <p className="text-sm text-red-500">{errors.undergraduate?.ielts.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Requirements</Label>
                        <div className="flex gap-2">
                            <Input
                                value={ugRequirement}
                                onChange={(e) => setUgRequirement(e.target.value)}
                                placeholder="Enter requirement"
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addUgRequirement();
                                    }
                                }}
                            />
                            <Button type="button" onClick={addUgRequirement} size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {errors.undergraduate?.requirements && (
                            <p className="text-sm text-red-500">{errors.undergraduate?.requirements.message}</p>
                        )}
                        <div className="space-y-2 mt-2">
                            {ugRequirements.map((req, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                >
                                    <span className="text-sm">{req}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeUgRequirement(idx)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Postgraduate */}
            <Card>
                <CardHeader>
                    <CardTitle>Postgraduate Admissions</CardTitle>
                    <CardDescription>Requirements for master's programs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Acceptance Rate</Label>
                            <Input
                                {...register("postgraduate.acceptanceRate")}
                                placeholder="10%"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>GRE</Label>
                            <Input {...register("postgraduate.gre")} placeholder="320+" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>GPA</Label>
                            <Input {...register("postgraduate.gpa")} placeholder="3.5+" />
                        </div>
                        <div className="space-y-2">
                            <Label>TOEFL</Label>
                            <Input {...register("postgraduate.toefl")} placeholder="100+" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>IELTS</Label>
                        <Input {...register("postgraduate.ielts")} placeholder="7.0+" />
                    </div>

                    <div className="space-y-2">
                        <Label>Requirements</Label>
                        <div className="flex gap-2">
                            <Input
                                value={pgRequirement}
                                onChange={(e) => setPgRequirement(e.target.value)}
                                placeholder="Enter requirement"
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addPgRequirement();
                                    }
                                }}
                            />
                            <Button type="button" onClick={addPgRequirement} size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-2 mt-2">
                            {pgRequirements.map((req, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                >
                                    <span className="text-sm">{req}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removePgRequirement(idx)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* PhD */}
            <Card>
                <CardHeader>
                    <CardTitle>PhD Admissions</CardTitle>
                    <CardDescription>Requirements for doctoral programs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>GRE</Label>
                            <Input {...register("phd.gre")} placeholder="325+" />
                        </div>
                        <div className="space-y-2">
                            <Label>GPA</Label>
                            <Input {...register("phd.gpa")} placeholder="3.7+" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="researchProposal"
                            checked={watch("phd.researchProposalRequired")}
                            onCheckedChange={(checked) =>
                                setValue("phd.researchProposalRequired", checked as boolean)
                            }
                        />
                        <Label htmlFor="researchProposal">Research Proposal Required</Label>
                    </div>

                    <div className="space-y-2">
                        <Label>Requirements</Label>
                        <div className="flex gap-2">
                            <Input
                                value={phdRequirement}
                                onChange={(e) => setPhdRequirement(e.target.value)}
                                placeholder="Enter requirement"
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addPhdRequirement();
                                    }
                                }}
                            />
                            <Button type="button" onClick={addPhdRequirement} size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-2 mt-2">
                            {phdRequirements.map((req, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                >
                                    <span className="text-sm">{req}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removePhdRequirement(idx)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
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