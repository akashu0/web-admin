import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
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
import { universityService } from "@/services/universityService";

// Simplified validation schema - only basic info
const universitySchema = z.object({
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

type UniversityFormData = z.infer<typeof universitySchema>;

interface AddUniversityModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

// Helper function to generate slug from country name
const generateSlug = (name: string): string => {
    return `study-in-${name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-')}`; // Replace multiple hyphens with single hyphen
};

export function AddUniversityModal({
    open,
    onOpenChange,
    onSuccess,
}: AddUniversityModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<UniversityFormData>({
        resolver: zodResolver(universitySchema),
        defaultValues: {
            status: "draft",
            slug: "",
        },
    });

    const status = watch("status");
    const name = watch("name");

    // Auto-generate slug when country changes
    useEffect(() => {
        if (name) {
            const generatedSlug = generateSlug(name);
            setValue("slug", generatedSlug);
        }
    }, [name, setValue]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
    };

    const removeBanner = () => {
        setBannerFile(null);
        setBannerPreview(null);
    };

    const onSubmit = async (data: UniversityFormData) => {
        try {
            setIsSubmitting(true);

            const formData = new FormData();

            // Append basic text fields
            formData.append("name", data.name);
            formData.append("slug", data.slug);
            formData.append("fullName", data.fullName);
            formData.append("country", data.country);
            formData.append("city", data.city);
            formData.append("location", data.location);
            formData.append("about", data.about);
            formData.append("status", data.status);

            if (data.founded) formData.append("founded", data.founded);
            if (data.rank) formData.append("rank", data.rank);
            if (data.totalStudents) formData.append("totalStudents", data.totalStudents);
            if (data.internationalStudents)
                formData.append("internationalStudents", data.internationalStudents);

            // Append files
            if (logoFile) {
                formData.append("logo", logoFile);
            }
            if (bannerFile) {
                formData.append("banner", bannerFile);
            }

            await universityService.createUniversity(formData);

            toast.success("University created successfully! You can now add more details.");
            reset();
            setLogoFile(null);
            setLogoPreview(null);
            setBannerFile(null);
            setBannerPreview(null);
            onSuccess();
        } catch (error: any) {
            console.error("Error creating university:", error);
            toast.error(error.response?.data?.message || "Failed to create university");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] lg:max-w-[85vw] xl:max-w-[75vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New University</DialogTitle>
                    <DialogDescription>
                        Create a new university with basic information. You can add fees, admissions, and other details later by editing.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Basic Information</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">University Name *</Label>
                                <Input
                                    id="name"
                                    {...register("name")}
                                    placeholder="e.g., MIT"
                                />
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
                                    <p className="text-sm text-red-500">
                                        {errors.fullName.message}
                                    </p>
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
                                    <p className="text-sm text-red-500">
                                        {errors.country.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (Auto-generated) *</Label>
                                <Input
                                    id="slug"
                                    {...register("slug")}
                                    placeholder="study-in-country-name"
                                    className="bg-gray-50"
                                />
                                {errors.slug && (
                                    <p className="text-sm text-red-500">
                                        {errors.slug.message}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500">
                                    Auto-generated from country name
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
                                <Input
                                    id="founded"
                                    {...register("founded")}
                                    placeholder="1861"
                                />
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
                                <Label htmlFor="internationalStudents">
                                    International Students
                                </Label>
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
                    </div>

                    {/* Images */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Images</h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Logo Upload */}
                            <div className="space-y-2">
                                <Label>University Logo</Label>
                                {logoPreview ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="h-32 w-32 rounded-lg object-cover border"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeLogo}
                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                        <input
                                            type="file"
                                            id="logo"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="logo"
                                            className="flex flex-col items-center cursor-pointer"
                                        >
                                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-600">
                                                Click to upload logo
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Banner Upload */}
                            <div className="space-y-2">
                                <Label>Banner Image</Label>
                                {bannerPreview ? (
                                    <div className="relative inline-block w-full">
                                        <img
                                            src={bannerPreview}
                                            alt="Banner preview"
                                            className="w-full h-32 rounded-lg object-cover border"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeBanner}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                        <input
                                            type="file"
                                            id="banner"
                                            accept="image/*"
                                            onChange={handleBannerChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="banner"
                                            className="flex flex-col items-center cursor-pointer"
                                        >
                                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-600">
                                                Click to upload banner
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create University
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}