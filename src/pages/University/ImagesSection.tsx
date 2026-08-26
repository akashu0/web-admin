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
        // Clear it, or choosing the same file again fires no change event.
        e.target.value = "";
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
        e.target.value = "";
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

    // Clearing a preview used to be forgotten on save: the upload endpoint only
    // ever $sets an image it was given a file for, so "remove" looked like it
    // worked and the stored logo stayed. `logo`/`banner` ARE in the basic-info
    // allowlist, so an empty string there is the one write that clears them.
    const clearedImages = () => {
        const cleared: Record<string, string> = {};
        if (initialData.logoUrl && !logoPreview && !logoFile) cleared.logo = "";
        if (initialData.bannerUrl && !bannerPreview && !bannerFile) cleared.banner = "";
        return cleared;
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

        const hasFiles = Boolean(logoFile || bannerFile || galleryFiles.length);
        const removedGallery =
            existingGallery.length !== (initialData.galleryUrls || []).length;
        const cleared = clearedImages();

        if (!hasFiles && !removedGallery && Object.keys(cleared).length === 0) {
            toast.info("Nothing to save");
            return;
        }

        try {
            setIsSubmitting(true);

            // Removals first, then uploads. The images endpoint only $pushes —
            // it has no way to drop a URL, which is why deleting a photo used to
            // look like it worked and never persisted. The media section owns the
            // gallery LIST, so the surviving URLs go there. Doing it after the
            // upload would overwrite the freshly pushed ones.
            if (removedGallery) {
                await universityService.updateMedia(slug, { galleryUrls: existingGallery });
            }

            if (Object.keys(cleared).length > 0) {
                await universityService.updateBasicInfo(slug, cleared);
            }

            if (hasFiles) {
                const formData = new FormData();
                if (logoFile) formData.append("logo", logoFile);
                if (bannerFile) formData.append("banner", bannerFile);
                galleryFiles.forEach((file) => formData.append("gallery", file));
                await universityService.updateImages(slug, formData);
            }

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
                            {/* The input stays mounted whether or not there is a
                                preview. It used to live only in the empty branch,
                                so replacing an image meant removing it first —
                                and the removal did not persist, which is why a
                                replacement looked like it had not saved. */}
                            <input
                                type="file"
                                id="logo"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                            />
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
                                        className="absolute -top-2 -right-2 p-1 bg-destructive text-primary-foreground rounded-full hover:bg-destructive"
                                        title="Remove logo"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <label
                                        htmlFor="logo"
                                        className="mt-2 block cursor-pointer text-center text-xs font-medium text-primary hover:underline"
                                    >
                                        Change logo
                                    </label>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-input rounded-lg p-6">
                                    <label
                                        htmlFor="logo"
                                        className="flex flex-col items-center cursor-pointer"
                                    >
                                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground">
                                            Click to upload logo
                                        </span>
                                        <span className="text-xs text-muted-foreground font-medium mt-1">
                                            Required image ratio: 1:1 square (e.g., 400 x 400 px)
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Banner Upload */}
                        <div className="space-y-2">
                            <Label>Banner Image</Label>
                            <input
                                type="file"
                                id="banner"
                                accept="image/*"
                                onChange={handleBannerChange}
                                className="hidden"
                            />
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
                                        className="absolute top-2 right-2 p-1 bg-destructive text-primary-foreground rounded-full hover:bg-destructive"
                                        title="Remove banner"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <label
                                        htmlFor="banner"
                                        className="mt-2 block cursor-pointer text-center text-xs font-medium text-primary hover:underline"
                                    >
                                        Change banner
                                    </label>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-input rounded-lg p-6">
                                    <label
                                        htmlFor="banner"
                                        className="flex flex-col items-center cursor-pointer"
                                    >
                                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground">
                                            Click to upload banner
                                        </span>
                                        <span className="text-xs text-muted-foreground font-medium mt-1">
                                            Required image ratio: 16:9 (e.g., 1280 x 720 px)
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
                                            className="absolute -top-2 -right-2 p-1 bg-destructive text-primary-foreground rounded-full hover:bg-destructive"
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
                                            className="absolute -top-2 -right-2 p-1 bg-destructive text-primary-foreground rounded-full hover:bg-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="border-2 border-dashed border-input rounded-lg p-6">
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
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm text-muted-foreground">
                                    Click to upload gallery images
                                </span>
                                <span className="text-xs text-muted-foreground mt-1">
                                    You can select multiple images
                                </span>
                                <span className="text-xs text-muted-foreground font-medium mt-1">
                                    Required image ratio: 16:9 (e.g., 1280 x 720 px)
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