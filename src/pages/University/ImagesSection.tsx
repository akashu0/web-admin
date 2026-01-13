import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { universityService } from "@/services/universityService";

interface ImagesSectionProps {
    slug: string;
    initialData: {
        logoUrl?: string;
        bannerUrl?: string;
        galleryUrls?: string[];
    };
    onSuccess: () => void;
}

export function ImagesSection({ slug, initialData, onSuccess }: ImagesSectionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logoUrl || null);

    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(
        initialData.bannerUrl || null
    );

    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [existingGallery, setExistingGallery] = useState<string[]>(
        initialData.galleryUrls || []
    );

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

    const removeExistingGalleryImage = (index: number) => {
        setExistingGallery((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);

            const formData = new FormData();

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

            // Append existing gallery URLs
            if (existingGallery.length > 0) {
                formData.append("existingGallery", JSON.stringify(existingGallery));
            }

            await universityService.updateImages(slug, formData);
            onSuccess();

            // Reset new file states
            setLogoFile(null);
            setBannerFile(null);
            setGalleryFiles([]);
            setGalleryPreviews([]);
        } catch (error: any) {
            console.error("Error updating images:", error);
            toast.error(error.response?.data?.message || "Failed to update images");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Images</CardTitle>
                    <CardDescription>
                        Manage university logos, banners, and gallery images
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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

                    {/* Existing Gallery */}
                    {existingGallery.length > 0 && (
                        <div className="space-y-2">
                            <Label>Existing Gallery Images</Label>
                            <div className="grid grid-cols-4 gap-4">
                                {existingGallery.map((url, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={url}
                                            alt={`Gallery ${index + 1}`}
                                            className="w-full h-24 rounded-lg object-cover border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingGalleryImage(index)}
                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gallery Upload */}
                    <div className="space-y-2">
                        <Label>Add New Gallery Images (Multiple)</Label>
                        {galleryPreviews.length > 0 && (
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                {galleryPreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={preview}
                                            alt={`New gallery ${index + 1}`}
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

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Images
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}