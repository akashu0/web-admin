import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { universityService } from "@/services/universityService";

const studentLifeSchema = z.object({
    overview: z.string().optional(),
    stats: z
        .object({
            // Validates that the string contains only digits
            studentOrganizations: z.string().regex(/^\d*$/, "Must be a number").optional(),
            varsitySports: z.string().regex(/^\d*$/, "Must be a number").optional(),
            // Student-Faculty ratio often contains a colon (e.g., 12:1), 
            // but per your request for "only number", I've set it to digit-only.
            studentFacultyRatio: z.string().regex(/^\d*$/, "Must be a number").optional(),
        })
        .optional(),
    athletics: z
        .object({
            // If division is usually a number (e.g., "1" instead of "Division I")
            division: z.string().regex(/^\d*$/, "Must be a number").optional(),
        })
        .optional(),
});

type StudentLifeFormData = z.infer<typeof studentLifeSchema>;

interface StudentLifeSectionProps {
    slug: string;
    initialData: any;
    onSuccess: () => void;
}

export function StudentLifeSection({
    slug,
    initialData,
    onSuccess,
}: StudentLifeSectionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<StudentLifeFormData>({
        resolver: zodResolver(studentLifeSchema),
        defaultValues: {
            overview: initialData.overview || "",
            stats: initialData.stats || {},
            athletics: initialData.athletics || {},
        },
    });

    const onSubmit = async (data: StudentLifeFormData) => {
        try {
            setIsSubmitting(true);
            await universityService.updateStudentLife(slug, data);
            onSuccess();
        } catch (error: any) {
            console.error("Error updating student life:", error);
            toast.error(error.response?.data?.message || "Failed to update student life");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Student Life</CardTitle>
                    <CardDescription>Campus life and student activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Overview</Label>
                        <Textarea
                            {...register("overview")}
                            placeholder="Overview of student life..."
                            rows={4}
                        />
                    </div>

                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold">Statistics</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Student Organizations</Label>
                                <Input
                                    type="number"
                                    {...register("stats.studentOrganizations")}
                                    placeholder="500+"
                                    onWheel={(e) => e.currentTarget.blur()}
                                />
                                {errors.stats?.studentOrganizations && (
                                    <p className="text-sm text-red-500">{errors.stats?.studentOrganizations.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Varsity Sports</Label>
                                <Input
                                    type="number"
                                    {...register("stats.varsitySports")}
                                    placeholder="33"
                                    onWheel={(e) => e.currentTarget.blur()}
                                />
                                {errors.stats?.varsitySports && (
                                    <p className="text-sm text-red-500">{errors.stats?.varsitySports.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Student-Faculty Ratio</Label>
                            <Input
                                type="number"
                                {...register("stats.studentFacultyRatio")}
                                placeholder="12:1"
                                onWheel={(e) => e.currentTarget.blur()}
                            />
                            {errors.stats?.studentFacultyRatio && (
                                <p className="text-sm text-red-500">{errors.stats?.studentFacultyRatio.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold">Athletics</h3>

                        <div className="space-y-2">
                            <Label>Division</Label>
                            <Input
                                type="number"
                                {...register("athletics.division")}
                                placeholder="Division III"
                                onWheel={(e) => e.currentTarget.blur()}
                            />
                            {errors.athletics?.division && (
                                <p className="text-sm text-red-500">{errors.athletics?.division.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Student Life
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}