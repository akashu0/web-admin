import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload, X, Plus, Trash2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { universityService } from "@/services/universityService";

// Fee structure schema
const feeStructureSchema = z.object({
    level: z.enum(["undergraduate", "postgraduate"]),
    currency: z.string().min(1, "Currency is required"),
    tuitionFee: z.string().min(1, "Tuition fee is required"),
    applicationFee: z.string().optional(),
    duration: z.string().optional(),
});

// Admissions schemas
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

// Student Life schema
const studentLifeSchema = z.object({
    overview: z.string().optional(),
    stats: z.object({
        studentOrganizations: z.string().optional(),
        varsitySports: z.string().optional(),
        studentFacultyRatio: z.string().optional(),
    }).optional(),
    athletics: z.object({
        division: z.string().optional(),
    }).optional(),
});

// Main validation schema
const universitySchema = z.object({
    name: z.string().min(1, "University name is required"),
    fullName: z.string().min(1, "Full name is required"),
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    location: z.string().min(1, "Location is required"),
    founded: z.string().optional(),
    totalStudents: z.string().optional(),
    internationalStudents: z.string().optional(),
    rank: z.string().optional(),
    about: z.string().min(10, "About section must be at least 10 characters"),
    fees: z.array(feeStructureSchema).optional(),
    admissions: admissionsSchema.optional(),
    studentLife: studentLifeSchema.optional(),
    status: z.enum(["published", "draft"]),
});

type UniversityFormData = z.infer<typeof universitySchema>;

interface AddUniversityModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

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
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

    // For requirements arrays
    const [ugRequirement, setUgRequirement] = useState("");
    const [pgRequirement, setPgRequirement] = useState("");
    const [phdRequirement, setPhdRequirement] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
        control,
    } = useForm<UniversityFormData>({
        resolver: zodResolver(universitySchema),
        defaultValues: {
            status: "draft",
            fees: [],
            admissions: {
                undergraduate: { requirements: [] },
                postgraduate: { requirements: [] },
                phd: { requirements: [] },
            },
            studentLife: {
                stats: {},
                athletics: {},
            },
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "fees",
    });

    const status = watch("status");
    const ugRequirements = watch("admissions.undergraduate.requirements") || [];
    const pgRequirements = watch("admissions.postgraduate.requirements") || [];
    const phdRequirements = watch("admissions.phd.requirements") || [];

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

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setGalleryFiles((prev) => [...prev, ...files]);

            files.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setGalleryPreviews((prev) => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
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

    const removeGalleryImage = (index: number) => {
        setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
        setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const addFeeStructure = () => {
        append({
            level: "undergraduate",
            currency: "USD",
            tuitionFee: "",
            applicationFee: "",
            duration: "",
        });
    };

    const addUgRequirement = () => {
        if (ugRequirement.trim()) {
            setValue("admissions.undergraduate.requirements", [...ugRequirements, ugRequirement]);
            setUgRequirement("");
        }
    };

    const removeUgRequirement = (index: number) => {
        setValue(
            "admissions.undergraduate.requirements",
            ugRequirements.filter((_, i) => i !== index)
        );
    };

    const addPgRequirement = () => {
        if (pgRequirement.trim()) {
            setValue("admissions.postgraduate.requirements", [...pgRequirements, pgRequirement]);
            setPgRequirement("");
        }
    };

    const removePgRequirement = (index: number) => {
        setValue(
            "admissions.postgraduate.requirements",
            pgRequirements.filter((_, i) => i !== index)
        );
    };

    const addPhdRequirement = () => {
        if (phdRequirement.trim()) {
            setValue("admissions.phd.requirements", [...phdRequirements, phdRequirement]);
            setPhdRequirement("");
        }
    };

    const removePhdRequirement = (index: number) => {
        setValue(
            "admissions.phd.requirements",
            phdRequirements.filter((_, i) => i !== index)
        );
    };

    const onSubmit = async (data: UniversityFormData) => {
        try {
            setIsSubmitting(true);

            const formData = new FormData();

            // Append basic text fields
            formData.append("name", data.name);
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

            // Append complex objects as JSON
            if (data.fees && data.fees.length > 0) {
                formData.append("fees", JSON.stringify(data.fees));
            }

            if (data.admissions) {
                formData.append("admissions", JSON.stringify(data.admissions));
            }

            if (data.studentLife) {
                formData.append("studentLife", JSON.stringify(data.studentLife));
            }

            // Append files
            if (logoFile) {
                formData.append("logo", logoFile);
            }
            if (bannerFile) {
                formData.append("banner", bannerFile);
            }
            if (galleryFiles.length > 0) {
                galleryFiles.forEach((file) => {
                    formData.append("gallery", file);
                });
            }

            await universityService.createUniversity(formData);

            toast.success("University created successfully");
            reset();
            setLogoFile(null);
            setLogoPreview(null);
            setBannerFile(null);
            setBannerPreview(null);
            setGalleryFiles([]);
            setGalleryPreviews([]);
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
                        Fill in the university information below
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="fees">Fees</TabsTrigger>
                            <TabsTrigger value="admissions">Admissions</TabsTrigger>
                            <TabsTrigger value="studentLife">Student Life</TabsTrigger>
                            <TabsTrigger value="images">Images</TabsTrigger>
                        </TabsList>

                        {/* Basic Information Tab */}
                        <TabsContent value="basic" className="space-y-4 mt-4">
                            <div className="space-y-4">
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
                                        <Label htmlFor="city">City *</Label>
                                        <Input id="city" {...register("city")} placeholder="Cambridge" />
                                        {errors.city && (
                                            <p className="text-sm text-red-500">{errors.city.message}</p>
                                        )}
                                    </div>
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
                        </TabsContent>

                        {/* Fee Structure Tab */}
                        <TabsContent value="fees" className="space-y-4 mt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Fee Structure</h3>
                                <Button type="button" variant="outline" size="sm" onClick={addFeeStructure}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Fee
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="p-4 border rounded-lg space-y-4 bg-gray-50"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm">
                                            Fee Structure #{index + 1}
                                        </h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Level *</Label>
                                            <Select
                                                value={watch(`fees.${index}.level`)}
                                                onValueChange={(value) =>
                                                    setValue(
                                                        `fees.${index}.level`,
                                                        value as "undergraduate" | "postgraduate"
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="undergraduate">
                                                        Undergraduate
                                                    </SelectItem>
                                                    <SelectItem value="postgraduate">
                                                        Postgraduate
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Currency *</Label>
                                            <Input
                                                {...register(`fees.${index}.currency`)}
                                                placeholder="USD"
                                            />
                                            {errors.fees?.[index]?.currency && (
                                                <p className="text-sm text-red-500">
                                                    {errors.fees[index]?.currency?.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Tuition Fee *</Label>
                                            <Input
                                                {...register(`fees.${index}.tuitionFee`)}
                                                placeholder="15000 - 20000"
                                            />
                                            {errors.fees?.[index]?.tuitionFee && (
                                                <p className="text-sm text-red-500">
                                                    {errors.fees[index]?.tuitionFee?.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Application Fee</Label>
                                            <Input
                                                {...register(`fees.${index}.applicationFee`)}
                                                placeholder="100"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Duration</Label>
                                        <Input
                                            {...register(`fees.${index}.duration`)}
                                            placeholder="4 years"
                                        />
                                    </div>
                                </div>
                            ))}

                            {fields.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-8">
                                    No fee structures added yet. Click "Add Fee" to get started.
                                </p>
                            )}
                        </TabsContent>

                        {/* Admissions Tab */}
                        <TabsContent value="admissions" className="space-y-6 mt-4">
                            {/* Undergraduate */}
                            <div className="space-y-4 p-4 border rounded-lg">
                                <h3 className="text-lg font-semibold">Undergraduate Admissions</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Acceptance Rate</Label>
                                        <Input
                                            {...register("admissions.undergraduate.acceptanceRate")}
                                            placeholder="5%"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>SAT</Label>
                                        <Input
                                            {...register("admissions.undergraduate.sat")}
                                            placeholder="1400-1600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>ACT</Label>
                                        <Input
                                            {...register("admissions.undergraduate.act")}
                                            placeholder="32-36"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>TOEFL</Label>
                                        <Input
                                            {...register("admissions.undergraduate.toefl")}
                                            placeholder="100+"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>IELTS</Label>
                                    <Input
                                        {...register("admissions.undergraduate.ielts")}
                                        placeholder="7.0+"
                                    />
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
                                        <Button
                                            type="button"
                                            onClick={addUgRequirement}
                                            size="sm"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
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
                            </div>

                            {/* Postgraduate */}
                            <div className="space-y-4 p-4 border rounded-lg">
                                <h3 className="text-lg font-semibold">Postgraduate Admissions</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Acceptance Rate</Label>
                                        <Input
                                            {...register("admissions.postgraduate.acceptanceRate")}
                                            placeholder="10%"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>GRE</Label>
                                        <Input
                                            {...register("admissions.postgraduate.gre")}
                                            placeholder="320+"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>GPA</Label>
                                        <Input
                                            {...register("admissions.postgraduate.gpa")}
                                            placeholder="3.5+"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>TOEFL</Label>
                                        <Input
                                            {...register("admissions.postgraduate.toefl")}
                                            placeholder="100+"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>IELTS</Label>
                                    <Input
                                        {...register("admissions.postgraduate.ielts")}
                                        placeholder="7.0+"
                                    />
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
                                        <Button
                                            type="button"
                                            onClick={addPgRequirement}
                                            size="sm"
                                        >
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
                            </div>

                            {/* PhD */}
                            <div className="space-y-4 p-4 border rounded-lg">
                                <h3 className="text-lg font-semibold">PhD Admissions</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>GRE</Label>
                                        <Input
                                            {...register("admissions.phd.gre")}
                                            placeholder="325+"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>GPA</Label>
                                        <Input
                                            {...register("admissions.phd.gpa")}
                                            placeholder="3.7+"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="researchProposal"
                                        checked={watch("admissions.phd.researchProposalRequired")}
                                        onCheckedChange={(checked) =>
                                            setValue(
                                                "admissions.phd.researchProposalRequired",
                                                checked as boolean
                                            )
                                        }
                                    />
                                    <Label htmlFor="researchProposal">
                                        Research Proposal Required
                                    </Label>
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
                                        <Button
                                            type="button"
                                            onClick={addPhdRequirement}
                                            size="sm"
                                        >
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
                            </div>
                        </TabsContent>

                        {/* Student Life Tab */}
                        <TabsContent value="studentLife" className="space-y-4 mt-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Overview</Label>
                                    <Textarea
                                        {...register("studentLife.overview")}
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
                                                {...register("studentLife.stats.studentOrganizations")}
                                                placeholder="500+"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Varsity Sports</Label>
                                            <Input
                                                {...register("studentLife.stats.varsitySports")}
                                                placeholder="33"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Student-Faculty Ratio</Label>
                                        <Input
                                            {...register("studentLife.stats.studentFacultyRatio")}
                                            placeholder="12:1"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 p-4 border rounded-lg">
                                    <h3 className="text-lg font-semibold">Athletics</h3>

                                    <div className="space-y-2">
                                        <Label>Division</Label>
                                        <Input
                                            {...register("studentLife.athletics.division")}
                                            placeholder="Division III"
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Images Tab */}
                        <TabsContent value="images" className="space-y-4 mt-4">
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

                            {/* Gallery Upload */}
                            <div className="space-y-2">
                                <Label>Gallery Images (Multiple)</Label>
                                {galleryPreviews.length > 0 && (
                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                        {galleryPreviews.map((preview, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={preview}
                                                    alt={`Gallery ${index + 1}`}
                                                    className="w-full h-24 rounded-lg object-cover border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryImage(index)}
                                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    <input
                                        type="file"
                                        id="gallery"
                                        accept="image/*"
                                        multiple
                                        onChange={handleGalleryChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="gallery"
                                        className="flex flex-col items-center cursor-pointer"
                                    >
                                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">
                                            Click to upload gallery images
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">
                                            You can select multiple images
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
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