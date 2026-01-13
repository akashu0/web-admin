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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { universityService } from "@/services/universityService";

const basicInfoSchema = z.object({
    name: z.string().min(1, "University name is required"),
    slug: z.string().min(1, "Slug is required"),
    fullName: z.string().min(1, "Full name is required"),
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    location: z.string().min(1, "Location is required"),
    founded: z.string().optional(),
    totalStudents: z.string().optional(),
    internationalStudents: z.string().optional(),
    rank: z.string().optional(),
    about: z.string().min(10, "About section must be at least 10 characters"),
    status: z.enum(["published", "draft"]),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface BasicInfoSectionProps {
    slug: string;
    initialData: any;
    onSuccess: () => void;
}

export function BasicInfoSection({ slug, initialData, onSuccess }: BasicInfoSectionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<BasicInfoFormData>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: {
            name: initialData.name,
            slug: initialData.slug,
            fullName: initialData.fullName,
            country: initialData.country,
            city: initialData.city,
            location: initialData.location,
            founded: initialData.founded || "",
            totalStudents: initialData.totalStudents || "",
            internationalStudents: initialData.internationalStudents || "",
            rank: initialData.rank || "",
            about: initialData.about,
            status: initialData.status,
        },
    });

    const status = watch("status");

    const onSubmit = async (data: BasicInfoFormData) => {
        try {
            setIsSubmitting(true);
            await universityService.updateBasicInfo(slug, data);
            onSuccess();
        } catch (error: any) {
            console.error("Error updating basic info:", error);
            toast.error(error.response?.data?.message || "Failed to update basic information");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Update the core details of the university</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">University Name *</Label>
                            <Input id="name" {...register("name")} placeholder="e.g., MIT" />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                                id="fullName"
                                {...register("fullName")}
                                placeholder="Massachusetts Institute of Technology"
                            />
                            {errors.fullName && (
                                <p className="text-sm text-red-500">{errors.fullName.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="country">Country *</Label>
                            <Input
                                id="country"
                                {...register("country")}
                                placeholder="United States"
                            />
                            {errors.country && (
                                <p className="text-sm text-red-500">{errors.country.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug *</Label>
                            <Input
                                id="slug"
                                {...register("slug")}
                                placeholder="massachusetts-institute-of-technology"
                                className="bg-gray-50"
                                disabled
                            />
                            <p className="text-xs text-gray-500">
                                Used in the URL (cannot be changed)
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input id="city" {...register("city")} placeholder="Cambridge" />
                            {errors.city && (
                                <p className="text-sm text-red-500">{errors.city.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                                id="location"
                                {...register("location")}
                                placeholder="77 Massachusetts Ave, Cambridge, MA 02139"
                            />
                            {errors.location && (
                                <p className="text-sm text-red-500">{errors.location.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="about">About *</Label>
                        <Textarea
                            id="about"
                            {...register("about")}
                            placeholder="Brief description of the university..."
                            rows={4}
                        />
                        {errors.about && (
                            <p className="text-sm text-red-500">{errors.about.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="founded">Founded</Label>
                            <Input id="founded" {...register("founded")} placeholder="1861" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rank">Ranking</Label>
                            <Input id="rank" {...register("rank")} placeholder="5" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="totalStudents">Total Students</Label>
                            <Input
                                id="totalStudents"
                                {...register("totalStudents")}
                                placeholder="11,000+"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="internationalStudents">International Students</Label>
                            <Input
                                id="internationalStudents"
                                {...register("internationalStudents")}
                                placeholder="3,800+"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={status}
                            onValueChange={(value) =>
                                setValue("status", value as "published" | "draft")
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Basic Info
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}