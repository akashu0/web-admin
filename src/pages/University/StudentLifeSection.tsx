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

// The section save replaces the WHOLE studentLife subdocument, so anything the
// schema does not model is deleted from the record on save. stats/athletics were
// missing here and were being wiped every time this tab was saved.
const studentLifeSchema = z.object({
    overview: z.string().optional(),
    stats: z.object({
        studentOrganizations: z.string().optional(),
        varsitySports: z.string().optional(),
        studentFacultyRatio: z.string().optional(),
    }),
    athletics: z.object({
        division: z.string().optional(),
    }),
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
    } = useForm<StudentLifeFormData>({
        resolver: zodResolver(studentLifeSchema),
        defaultValues: {
            overview: initialData.overview || "",
            stats: {
                studentOrganizations: initialData.stats?.studentOrganizations || "",
                varsitySports: initialData.stats?.varsitySports || "",
                studentFacultyRatio: initialData.stats?.studentFacultyRatio || "",
            },
            athletics: {
                division: initialData.athletics?.division || "",
            },
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Student Organizations</Label>
                            <Input {...register("stats.studentOrganizations")} placeholder="e.g. 500+" />
                        </div>
                        <div className="space-y-2">
                            <Label>Varsity Sports</Label>
                            <Input {...register("stats.varsitySports")} placeholder="e.g. 33" />
                        </div>
                        <div className="space-y-2">
                            <Label>Student-Faculty Ratio</Label>
                            <Input {...register("stats.studentFacultyRatio")} placeholder="e.g. 12:1" />
                        </div>
                        <div className="space-y-2">
                            <Label>Athletics Division</Label>
                            <Input {...register("athletics.division")} placeholder="e.g. Division III" />
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