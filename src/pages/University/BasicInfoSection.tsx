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
import { useCountryNames } from "@/hooks/useCountryNames";
import { useRhfSectionGuard } from "@/hooks/use-unsaved-changes";

const CONTINENT_OPTIONS = [
    "Africa",
    "Antarctica",
    "Asia",
    "Europe",
    "North America",
    "Oceania",
    "South America",
] as const;

const basicInfoSchema = z.object({
    name: z.string().min(1, "University name is required"),
    slug: z.string().min(1, "Slug is required"),
    fullName: z.string().min(1, "Display name is required"),
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    continent: z.string().optional(),
    universityType: z.enum(["Public", "Private"]).optional(),
    location: z.string().min(1, "Location is required"),
    founded: z.string().regex(/^\d*$/, "Only numbers are allowed").optional(),
    totalStudents: z.string().regex(/^\d*$/, "Only numbers are allowed").optional(),
    internationalStudents: z.string().regex(/^\d*$/, "Only numbers are allowed").optional(),
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

    const form = useForm<BasicInfoFormData>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: {
            name: initialData.name,
            slug: initialData.slug,
            fullName: initialData.fullName,
            country: initialData.country,
            city: initialData.city,
            continent: initialData.continent || "",
            universityType: initialData.universityType || undefined,
            location: initialData.location,
            founded: initialData.founded || "",
            totalStudents: initialData.totalStudents || "",
            internationalStudents: initialData.internationalStudents || "",
            about: initialData.about,
            status: initialData.status,
        },
    });
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = form;

    const status = watch("status");
    const country = watch("country");
    // initialData.country keeps a legacy spelling selectable until
    // `cmd/fixcountries` has run — otherwise saving this tab would blank it.
    const countries = useCountryNames(initialData.country);
    const continent = watch("continent");
    const universityType = watch("universityType");

    /** The save itself. Throws on failure, so the unsaved-changes guard
     *  can refuse to let a failed save through. */
    const submit = async (data: BasicInfoFormData) => {
        const { status, ...basicInfo } = data;
        await universityService.updateBasicInfo(slug, basicInfo);
        // `status` is NOT in the server's basic-info allowlist, so posting it
        // here was a silent no-op: the tab said saved and the record stayed a
        // draft. Publishing has its own endpoint, which skips the full-document
        // validation this section save runs.
        if (status !== initialData.status) {
            await universityService.bulkUpdateStatus([initialData._id], status);
        }
        onSuccess();
    };

    useRhfSectionGuard({ id: 'university.basicInfo', label: 'Basic Information', form, submit });

    const onSubmit = async (data: BasicInfoFormData) => {
        try {
            setIsSubmitting(true);
            await submit(data);
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
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Display Name *</Label>
                            <Input
                                id="fullName"
                                {...register("fullName")}
                                placeholder="Massachusetts Institute of Technology"
                            />
                            {errors.fullName && (
                                <p className="text-sm text-destructive">{errors.fullName.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="country">Country *</Label>
                            <Select
                                value={country ?? ""}
                                onValueChange={(v) => setValue("country", v, { shouldValidate: true })}
                            >
                                <SelectTrigger id="country">
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent className="bg-card">
                                    {countries.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.country && (
                                <p className="text-sm text-destructive">{errors.country.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input id="city" {...register("city")} placeholder="Cambridge" />
                            {errors.city && (
                                <p className="text-sm text-destructive">{errors.city.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="continent">Continent</Label>
                            <Select
                                value={continent ?? ""}
                                onValueChange={(v) => setValue("continent", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select continent" />
                                </SelectTrigger>
                                <SelectContent className="bg-card">
                                    {CONTINENT_OPTIONS.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="universityType">University Type</Label>
                            <Select
                                value={universityType ?? ""}
                                onValueChange={(v) => setValue("universityType", v as "Public" | "Private")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-card">
                                    <SelectItem value="Public">Public</SelectItem>
                                    <SelectItem value="Private">Private</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug *</Label>
                            <Input
                                id="slug"
                                {...register("slug")}
                                placeholder="massachusetts-institute-of-technology"
                                className="bg-muted"
                                disabled
                            />
                            <p className="text-xs text-muted-foreground">
                                Used in the URL (cannot be changed)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                                id="location"
                                {...register("location")}
                                placeholder="77 Massachusetts Ave, Cambridge, MA 02139"
                            />
                            {errors.location && (
                                <p className="text-sm text-destructive">{errors.location.message}</p>
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
                            <p className="text-sm text-destructive">{errors.about.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="founded">Founded</Label>
                            <Input
                                id="founded"
                                type="number"
                                min="0"
                                {...register("founded")}
                                placeholder="1861"
                                onWheel={(e) => e.currentTarget.blur()}
                            />
                            {errors.founded && (
                                <p className="text-sm text-destructive">{errors.founded.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="totalStudents">Total Students</Label>
                            <Input
                                id="totalStudents"
                                type="number"
                                min="0"
                                {...register("totalStudents")}
                                placeholder="11000"
                                onWheel={(e) => e.currentTarget.blur()}
                            />
                            {errors.totalStudents && (
                                <p className="text-sm text-destructive">{errors.totalStudents.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="internationalStudents">International Students</Label>
                            <Input
                                id="internationalStudents"
                                type="number"
                                min="0"
                                {...register("internationalStudents")}
                                placeholder="3800"
                                onWheel={(e) => e.currentTarget.blur()}
                            />
                            {errors.internationalStudents && (
                                <p className="text-sm text-destructive">{errors.internationalStudents.message}</p>
                            )}
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
